import app from "./app.js";
import config from "./config.js";

const STORAGE_TYPES = {
    local: 0,
    parse: 1,
    server: 2
};

const state = {
    storage: STORAGE_TYPES.server,
    name: config.LEADERBOARD_NAMESPACE_DEFAULT
};

function init() {
    const urlParams = new URLSearchParams(window.location.search);

    // handle the leaderboard namespace param
    if (urlParams.has("name")) {
        const qsName = urlParams.get("name");
        console.assert(
            qsName.trim().length,
            "invalid ?name value: must not be empty"
        );
        state.name = qsName;
    }

    // handle the leaderboard storage param
    if (urlParams.has("storage")) {
        const qsStorage = urlParams.get("storage");
        console.assert(
            STORAGE_TYPES.hasOwnProperty(qsStorage),
            `invalid ?storage value provided, must be one of: ${Object.keys(
                STORAGE_TYPES
            )}`
        );
        state.storage = STORAGE_TYPES[qsStorage];
    }
}

async function record({ name, score, tribe }) {
    switch (state.storage) {
        case STORAGE_TYPES.local:
            await recordLocal({ name, score, tribe });
            break;
        case STORAGE_TYPES.parse:
            await recordParse({ name, score, tribe });
            break;
        case STORAGE_TYPES.server:
            await recordServer({ name, score, tribe });
            break;
        default:
            console.error("Unknown storage type:", state.storage);
    }
}

async function recordServer({ name, score, tribe }) {
    console.log(`recording leaderboard entry on server`, { name, score, tribe });

    try {
        const response = await fetch(`${config.BACKEND_URL}/leaderboard/entry`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leader: { name, score, tribe } })
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log("Leaderboard entry recorded successfully:", result);
    } catch (error) {
        console.error("Error recording leaderboard entry on server:", error);
    }
}

async function recordLocal({ name, score, tribe }) {
    console.log(`recording leaderboard entry in localstorage`, {
        name,
        score,
        tribe
    });

    const leaders = JSON.parse(localStorage.getItem(state.name)) || [];
    leaders.push({
        name: name,
        score: app.score,
        tribe: tribe
    });
    localStorage.setItem(state.name, JSON.stringify(leaders));
}

async function recordParse({ name, score, tribe }) {
    console.log(`recording leaderboard entry in parse`, { name, score, tribe });

    const response = await fetch(`${config.PARSE_URL}/classes/${state.name}`, {
        method: "POST",
        headers: {
            "X-Parse-Application-Id": config.PARSE_APPID,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, score, tribe })
    });

    const responseJson = await response.json();
}

async function get() {
    switch (state.storage) {
        case STORAGE_TYPES.local:
            return await getLocal();
        case STORAGE_TYPES.parse:
            return await getParse();
        case STORAGE_TYPES.server:
            return await getFromServer();
        default:
            console.error("Unknown storage type:", state.storage);
            return { leaders: [] };
    }
}

async function getLocal() {
    // First get the current scores from localStorage
    let leaders = JSON.parse(localStorage.getItem(state.name));
    return formatLeaders(leaders);
}

async function getFromServer() {
    try {
        const response = await fetch(`${config.BACKEND_URL}/leaderboard`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        return formatLeaders(data.leaders || []);
    } catch (error) {
        console.error("Error fetching leaderboard from server:", error);
        return formatLeaders([]);
    }
}

async function getParse() {
    const response = await fetch(
        `${config.PARSE_URL}/classes/${state.name}?limit=10000`,
        {
            method: "GET",
            headers: {
                "X-Parse-Application-Id": config.PARSE_APPID
            }
        }
    );

    const scores = await response.json();

    return formatLeaders(scores.results);
}

async function saveLeaderboard() {
    const leaderboardData = await get();
    const leaders = leaderboardData.leaders || [];

    // Create JSON data from leaders
    const jsonData = {
        leaders: leaders,
        timestamp: new Date().toISOString()
    };

    try {
        // Send data via POST request
        const response = await fetch(`${config.BACKEND_URL}/leaderboard/export`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonData)
        });

        if (!response.ok && response.status === 429) {
            console.warn("Rate limit exceeded for saving leaderboard");
            return;
        }

        const result = await response.json();
        console.log("Leaderboard data exported successfully:", result);
    } catch (error) {
        console.error("Error exporting leaderboard data:", error);
    }
}

function formatLeaders(leaders) {
    leaders = _.reverse(_.sortBy(leaders, "score"));
    const hiScores = _(leaders)
        .sortBy("score")
        .reverse()
        .uniqBy("name")
        .take(10)
        .map("score")
        .value();
    const lowestHiScore = _.min(hiScores);
    const topHiScore = _.max(hiScores);
    const isEmpty = leaders.length === 0;
    return {
        leaders,
        hiScores,
        topHiScore,
        lowestHiScore,
        isEmpty
    };
}

async function validateNickname(name) {
    name = name.trim();
    const { isProfanity, error } = await checkNicknameProfanity(name);
    if (error) {
        console.error("Error during profanity check:", error);
        app.cmd += `\nError checking name:\n${error}\n`;
        return false;
    }

    if (name && name !== ">" && !isProfanity) {
        app.playerName = name.substring(0, config.MAX_LEADER_NAME_LENGTH);
        app.allowTyping = false;
        app.cmd = "";
        
        return true;
    }
    app.cmd += "\nPlease enter a valid name:\n";
    return false;
}

async function checkNicknameProfanity(name) {
    try {
        const response = await fetch(`${config.BACKEND_URL}/leaderboard/check-nickname-profanity`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        const responseData = await response.json();

        if (response.status === 429) {
            console.warn("Rate limit exceeded for profanity check");
            return { isProfanity: true, error: responseData.message || "Rate limit exceeded" };
        }

        return { isProfanity: !!responseData.isProfanity, error: null };
    } catch (error) {
        console.error("Error checking nickname profanity:", error);
        return { isProfanity: true, error: error.message };
    }
}

export default {
    init,
    record,
    get,
    saveLeaderboard,
    validateNickname
};
