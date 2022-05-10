# dgram_reverse_partial
Official Nebulous.io Bots made by Nyaa &amp; Klaro.


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


###### es
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


###### nom <max spectators | max players | enabled: y/N>
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
	Nyaanity (Nyaa): 381843366683344897
	Klaro: 424657032252096525
	Offi: 924784693994479657


# Changelog
[23th April, 2022] + Release (0.1.0)
[23th April, 2022] + Added Join Hidden Lobby
[23th April, 2022] + Added Autorejoin
[23th April, 2022] + Fixed VPN & mobile compatibility
[23th April, 2022] + Fixed bot being stuck at position
[23th April, 2022] + Added Item Targetting (alias plasma farm)
[23th April, 2022] + Added Hole Targetting (alias XP/mass farm)
[23th April, 2022] + Added Forced ID Join, no friendship required
[24th April, 2022] + Fixed Bot Detection, maxed out Max Connection Limit to 7/IP
[27th April, 2022] + Added Server Crash Exploit (0d)
[27th April, 2022] + Added Public Lobby Hopper (alias mass advertiser)
[27th April, 2022] - Removed Server Crash Exploit (patched XD)
[3th May, 2022] - Removed Public Lobby Hopper (risky)
[3th May, 2022] + Completely fixed Control Packet bug & Bot Movement Stuttering
[3th May, 2022] + Added Prettier Console Printing
[8th May, 2022] + Added Auto Mass Collection if no tasks like farm are running
[8th May, 2022] + Added Player Emotional Support
[9th May, 2022] + Fixed Rejoin Looping on forced enter command
[9th May, 2022] + Added Bot Rejoin command
[9th May, 2022] + Added 1-Bot-Only Command Execution
[10th May, 2022] + Added Ad-Boost Token Injection
[10th May, 2022] + Added Packet Sharing to prevent player position desync

