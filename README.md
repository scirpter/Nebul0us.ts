# Setup

##### Install requirements

```
npm i
```

##### Run (development build)

```
npm run dev
```

##### Run (production build)

```
npm run prod
```

##### Obfuscate (for production, results in code performance loss)

```
npm run p4
```

<br />
<br />

# My motivation

<ul>
    <li>
        <p>"Nyaa can't even code" ~ Victor</p>
    </li>
    <li>
        To avenge my first ever account that that was banned for no reason. (12409385)
        I spent many years on it.
        U know, this all wouldn't be happening if this ban hadn't happened !!
    </li>
</ul>

# Commands (<> = required, [] = optional, | = OR)

###### connect

```
Connect the bots to the server.
```

###### join <lobby name | player ID>

```
Join a lobby or a player.
```

###### enter

```
Lets the bots play when a lobby was joined.
```

###### clear

```
Clears the console.
```

###### rejoin

```
Rejoin a lobby or a player.
Only works if the connection session is still the same
and the "join" command was used.
```

###### desync

```
Disconnect the bot from the server
and stop sending packets to the server.
Requires you to reconnect again.
```

###### feed <player name | player ID>

```
Start emotionally supporting a user by giving them some mass.
```

###### plasmafor <player name | player ID>

```
Start farming plasma (preferably in plasma hunt)
and have the bots go into you once the lobby timer reaches 30 seconds.
```

###### plasmafor <player name | player ID>

```
Start farming plasma (preferably in plasma hunt)
and have the bots go into you once the lobby timer reaches 30 seconds.
```

###### setplasmafarm <y/N: enabled/Disabled>

```
Enable/disable the plasma farmer.
```

###### exit

```
Exit the script.
```

###### chat <message>

```
Send a chat message.
```

###### emote <emote index: number 1-(89?)>

```
Let the bot do an emote.
```

###### net

```
Developer network information.
```

###### rename <name>

```
Rename the bots. Maximum 15 characters.
```

###### test

```
Developer test command.
```

###### split

```
Bot will split blobs.
```

###### setemloop <y/N: enabled/Disabled> <emote index: number 1-(89?)>

```
Have the bot permanently do emotes,
until you disable this.
```

###### setmassthreshold <threshold: number, default = 250>

```
Set the mass threshold the bot should have
before executing tasks like feeding a player.
```

###### setmassad <y/N: enabled/Disabled> <message>

```
Enable/disable mass advertising.
This will halt every other running task.
The bot will hop through every lobby and send your message.
```

###### setautorespawn <y/N: enabled/Disabled>

```
Enable/disable auto-respawning.
```

###### setlvlmeta <y/N: enabled/Disabled>

```
Enable/disable solo XP farming meta.
Bot will farm EVERY hole that gives XP, until you disable this.
```

###### setplasmameta <y/N: enabled/Disabled>

```
Enable/disable plasma farming meta.
Farm up to 600k plasma per hour.
Developers only.
```

###### setexecbreak <y/N: enabled/Disabled>

```
Enable/disable sending "unnecessary" packets.
Halts every running task not in importance like player movement requests.
```

###### hexsearch <hexadecimal: Not-indexed hex>

```
This will search for all packets that have been received in the script's lifetime including this pattern and print them out.
Only kind of useful if you really know what you're doing.
```

### Execute commands with specific bot

```
<bot name> >> <command>
```

<br />
<br />

# Relevant information

You can only have 7 clients connected to a specific server concurrently.
This limit is not set by us, but by Nebulous.
Bypass this limit by using a VPN and multiple devices.

###### Example

✔️ You play + 6 bots on the same server (no VPN) <br />
✔️ You don't play + 7 bots on the same server (no VPN) <br />
⛔ You play + 7 bots -- 1 client will disconnect, over 7 clients on the same server (no VPN) <br />
⛔ You have 2 devices, you don't play and run 14 bots on the same server (no VPN) <br />
✔️ You have 2 devices, you don't play and run 14 bots on the same server (with VPN) <br />
✔️ You have 2 devices, you play and run 13 bots and only 6 bots on the device u play with on the same server (with VPN) <br />
✔️ You don't play and you run 14 bots, half of them on another server (no VPN) <br />

<br />
<br />

# User Data Collection

To protect against any issues or fraud that may occur, we are logging:

-   IP address
-   User agent
-   System name
-   Hostname
-   Platform (Windows, ...)

If you do not wish to have your data collected,
please delete the script from your computer (if you have it) permanently and do not use it anymore.
