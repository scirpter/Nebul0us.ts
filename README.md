# LOVELETTER.io (0.3.1)
Continuation of the **Nebul0us** hack: Official Nebulous.io Bots made by **Nyaanity** &amp; **Klaro**.


## How to use these bots? Where is the code?
	> This is a private project and is not avaibale to the public.
	Don't try to google the bots or search for a tutorial on how to this,
	because you won't find anything.
	DM Nyaanity#0001 on Discord to purchase the full source code and get access to our group,
	where we release newest updates for this hack.


### Features
	* Most efficient solo XP farming
	* Automation:
		* Plasma Farmer -> Send a signed-in bot into a lobby to have them farm plasma for you while you're AFK.
		Plasma is automatically detected on the whole map.
		* XP Farmer -> Send a signed-in bot into a lobby to have them farm XP for you while you're AFK.
		Holes are automatically detected on the whole map.
	* Emotional Support:
		* Player Feeder -> Have bots feed a specific player and take over lobbies with no effort.
	* Anti-Moderator:
		* Joins -> Detect joins by moderators and disconnect INSTANTLY.
		* Unwanted Spectates -> Detect spectates that most likely come from a moderator and disconnect INSTANTLY.
		* Moderator Name Flag -> Detects moderator names like Gaydric or Frog.


### Commands


###### co
	Connect the bots to the server.


###### jo <lobby name | player id>
	Join a lobby.
	This does not require friendship with the target player ID,
	but requires them to set their visibility to Online.


###### en
	Enters or re-enters the game.


###### rj
	Rejoin the current lobby.
	Also useful if the bots were kicked from the lobby.


###### de
	Desync the bots.
	Force disconnection from the server and stop sending/receiving network packets.


###### es <player name | player id>
	Give some emotional support to the player and feed them.
	Most fun in FFAU.


###### tf
	Toggle farming plasma.


###### qu
	Softly exit the script.


###### ch <message>
	Send an in-game chat request.


###### em <index: 0-89>
	Send an emote request.


###### nom <max spectators> <max players> <enabled: y/N>
	Moderator prevention.
	Detects e.g. unwanted spectates and instantly disconnects.
	Mods can force spectates ("force internal spectate"),
	even when inside a hidden lobby.


###### nomt <timeout>
	Temporarily suspend moderator prevention if you're trying to join the lobby.


###### ijb <token>
	**DEV ONLY**


###### test
	**DEV ONLY**


## Execute commands with specific bot
	<bot name | internal bot ID (0/1/2/...)> >> <command>


## Current users with access
	Nyaanity (Nyaa, Developer): 381843366683344897
	Klaro (Developer): 424657032252096525
	Offi (Simp, Certified Idiot): 924784693994479657


# Changelog
	[23th April, 2022] + Release (0.1.0)
	[23th April, 2022] + Added Join Hidden Lobby
	[23th April, 2022] + Added Autorejoin
	[23th April, 2022] + Fixed VPN & mobile compatibility
	[23th April, 2022] + Fixed bot pos desync
	[23th April, 2022] + Added Item Targetting (plasma, ...)
	[23th April, 2022] + Added Hole Targetting
	[23th April, 2022] + Added Forced ID Join
	[24th April, 2022] + Hotfix: Connection Limit
	[27th April, 2022] + Added Server Crash Exploit
	[27th April, 2022] + Added Public Lobby Hopper (alias mass advertiser)
	[27th April, 2022] - Removed Server Crash Exploit (patched XD)
	[3th May, 2022] - Removed Public Lobby Hopper (boring)
	[3th May, 2022] + Fixed: Control Packet
	[3th May, 2022] + Added Prettier Console Printing
	[8th May, 2022] + Added Auto Mass Collection
	[8th May, 2022] + Added Player Emotional Support
	[9th May, 2022] + Fixed Enter Looping
	[9th May, 2022] + Added Bot Rejoin Lobby command
	[9th May, 2022] + Added 1-Bot-Only Command Execution
	[10th May, 2022] + Added __A-B-TKN-I **DEV ONLY**
	[10th May, 2022] + Added NetFam: Packet Sharing
