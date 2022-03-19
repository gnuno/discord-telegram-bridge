<h1 align="center"> 
Discord-Telegram-bridge
</h1>
<p align="center">
<img alt="GitHub top language" src="https://img.shields.io/github/languages/top/aboutDavid/discord-telegram-bridge?style=for-the-badge"> <img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2020?style=for-the-badge"> <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/aboutDavid/discord-telegram-bridge?style=for-the-badge"> <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/aboutDavid/discord-telegram-bridge?style=for-the-badge"> <img alt="badge count" src="https://img.shields.io/badge/badges-5-success?style=for-the-badge">
 </p>
A small and fast telegram to discord chat bridge, written in node 

#### Setup:
> If you want to run it on heroku, you can just click the button below. 

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/gnuno/discord-telegram-bridge)

* Clone the github repo
* Execute <kbd>npm install</kbd>
* Create a Discord webhook. You can do this by going to Server settings -> Webhooks. Copy the URL, you'll need it later.
* Set env variables: <br> <br>
<kbd>TELEGRAM_BOT_TOKEN</kbd> - you can get this by speaking with @BotFather on telegram and creating a new bot. <br> <br>
<kbd>DISCORD_TOKEN</kbd> - the bot token for your Discord application. Create a new app at the [Discord Developer Portal](https://discord.com/developers/applications), go to the bot section, click on Create a bot and copy the bot token it gives to you. <br> <br>
<kbd>TELEGRAM_CHAT_ID</kbd> - The ChatId of the telegram group you want to bridge <br> <br>
<kbd>DISCORD_CHANNEL_ID</kbd> - The Discord ChannelId of the channel you want to bridge <br> <br>
<kbd>webhook_id</kbd> and <kbd>webhook_token</kbd>. Those are part of the webhook URL you copied. <kbd>webhook_id</kbd> is a 18 characters long int, <kbd>webhook_token</kbd> is a ~70 chars long randomly generated string. Those are seperated by slashes in the url. <br> <br>

* Run <kbd>npm start</kbd> or <kbd>node server.js</kbd> and you're set!


## Explicación en cristiano

El env tiene que tener varios campos:

```
DISCORD_TOKEN= 
TELEGRAM_BOT_TOKEN=
TELEGRAM_IDS=["TELEGRAM_ID_CHANNEL"]
DISCORD_ID=["DISCORD_ID_CHANNEL"]
DISCORD_WEBHOOKS=["WEBHOOK_ID/WEBHOOK_TOKEN"]
```
El DISCORD_TOKEN es el token de tu app de discord, es decir el bot.
El TELEGRAM_BOT_TOKEN es el token del bot de telegram, para crear un bot de telegram @BotFather.
El TELEGRAM_IDS es un array de strings con los ids de los canales de telegram que quieres que sean convertidos a canales de discord.
Para saber un ID de un canal primero ejecuten el bot, y luego agreguen al bot al chat, y luego copie el ID del chat.
Esto aparecera en la consola.

![](https://i.imgur.com/ZZ7ZbSx.png)

Lo copian y lo pegan en el arreglo de IDs pero encomillados.

El DISCORD_ID es un arreglo con los ID de los canales de discord que quieras mapear.

Se puede conseguir con click contrario en cualquier canal

![](https://i.imgur.com/LDhQa1R.png)

En el arreglo de DISCORD_WEBHOOKS almacenas los webhooks con el formato: ID/TOKEN

Estos se pueden crear de la siguiente manera:

Entrando en la configuración de cualquier canal:

![](https://i.imgur.com/MXhzhbV.png)

Y Copias la URL del webhook:

![](https://i.imgur.com/YSw6Mhu.png)

Te dara una URL como esta:

`https://discord.com/api/webhooks/id/token`

La recortas y te quedas con:
`id/token`

Esto lo pegas en el env de manera encomillada.