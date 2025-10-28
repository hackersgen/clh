# Command Line Heroes

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
