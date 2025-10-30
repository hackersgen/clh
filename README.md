# Command Line Heroes

[![Release](https://github.com/hackersgen/clh/actions/workflows/main.yml/badge.svg)](https://github.com/hackersgen/clh/actions/workflows/main.yml)

Command Line Heroes for HackersGen website.

Unofficial fork of the [Command Line Heroes](https://github.com/CommandLineHeroes/clh-bash) game repository.

It's a speed game where you make point every time you type a commands or keywords of the following accepted language:

- bash / shell
- python
- javascript
- html
- SQL
- ansible module
- microsoft / powershell
- cisco

## Installing

1. Install docker and docker compose on the desktop / laptop you want to play

2. Pull this repository to /root directory

```bash
cd /root/
git clone https://github.com/mossicrue/clh-sorint.git
```

3. Create the /root/leaderboard directory

```bash
mkdir /root/leaderboard
```

4. Go to the repository directory

```bash
cd /root/clh-sorint
```

5. Start the game

```
docker compose up -d
```

## Deployment to Docker Hub

It requires a Docker Hub Personal Access Token with write permissions. You can create one here:

[https://app.docker.com/accounts/hackersgen/settings/personal-access-tokens](https://app.docker.com/accounts/hackersgen/settings/personal-access-tokens)

Then, set it as a GitHub secret named `DOCKERHUB_TOKEN` in your repository settings.

Every time you push to the `master` branch, GitHub Actions will build and push the Docker image to Docker Hub automatically.

## Available Languages

Original languages already present in the original RedHat game

- Bash
- HTML
- JavaScript
- Python

Custom languages added in this fork:

- SQL
- CSS
- Go

### Original Languages

The original languages are left intact as in the original repository.

### SQL

The sources for SQL commands and keywords used are:

- w3 and w3school pages like [this](https://www.w3schools.com/sql/sql_ref_keywords.asp)
- PostgreSQL documentation [appendix](https://www.postgresql.org/docs/current/sql-keywords-appendix.html) by looking for standard keyworkd.

See files `from-sql-base.txt` and `from-postgres-doc.txt` for all the available command.

## How to add a new language

Note: all commands to be run from this directory, `assets/cmds/`.

1. Create the <language>.js file that will contains the new languages command and keyword.

2. Copy this javascript snippet and paste in the file previously created.

```js
export default {
  name: "NEW_LANGUAGE",
  commonCmds: ["command2", "command4"],
  cmds: ["command1", "command2", "command3", "command4"],
};
```

3. Replace the value of `name:` key with the new language name

4. Replace the sample strings with all the commands, keywords etc... as an the `cmds:` dictionary

5. Replace the sample strings with all the common commands, keywords etc... as an the `commonCmds:` dictionary

6. Adapt the code in the right section, to do so find the "Add other languages section" comments in the following files:

- src/cmnds.js
- src/app.js
- src/main.js
