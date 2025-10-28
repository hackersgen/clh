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
