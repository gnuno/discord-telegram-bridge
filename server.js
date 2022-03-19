#!/usr/bin/env node
const fetch = require("node-fetch");
require('dotenv').config()

const wakeUpDyno = (url, interval = 25, callback) => {
  const milliseconds = interval * 60000;
  setTimeout(() => {

    try {
      console.log("setTimeout called.");
      // HTTP GET request to the dyno's url
      fetch(url).then(() => console.log(`Fetching ${url}.`));
    }
    catch (err) { // catch fetch errors
      console.log(`Error fetching ${url}: ${err.message} 
            Will try again in ${interval} minutes...`);
    }
    finally {

      try {
        callback(); // execute callback, if passed
      }
      catch (e) { // catch callback error
        callback ? console.log("Callback failed: ", e.message) : null;
      }
      finally {
        // do it all again
        return wakeUpDyno(url, interval, callback);
      }

    }

  }, milliseconds);
};

// heroku specific
const express = require("express");

const PORT = process.env.PORT;
const DYNO_URL = process.env.DYNO_URL || "https://google.com"; //dyno url

const app = express();
app.get("/", function (req, res) {
  res.send("Hello world! you have reached the secret inner workings of the FILC BOT");
});
app.listen(PORT, () => {
  wakeUpDyno(DYNO_URL); // will start once server starts
})

const Discord = require("discord.js");
const client = new Discord.Client();
var telegram = require("natsvora-telegram-bot-api");

// import env variables
var telegramToken = process.env.TELEGRAM_BOT_TOKEN
const DISCORD_TOKEN = process.env.DISCORD_TOKEN

let discord_webhooks = JSON.parse(process.env.DISCORD_WEBHOOKS)
let discord_ids = JSON.parse(process.env.DISCORD_ID)
let telegram_ids = JSON.parse(process.env.TELEGRAM_IDS)

console.log(discord_webhooks, discord_ids, telegram_ids);

let webhooks = discord_webhooks.map((webhook, index) => {
    let webhook_values = webhook.split("/")
    return new Discord.WebhookClient(webhook_values[0], webhook_values[1])
})

// initializes the telegram bot and starts listening for updates (new messages)
var api = new telegram({
  token: telegramToken,
  updates: {
    enabled: true
  }
});

client.once("ready", () => {
  console.log("Discord bot ready!");
});
// initializes discord bot

client.login(DISCORD_TOKEN);

// if the discord bot receives a message
client.on("message", message => {
  let index = discord_ids.indexOf(message.channel.id+""); 
  // the program currently check if the message's from a bot to check for duplicates. This isn't the best method but it's good enough. A webhook counts as a bot in the discord api, don't ask me why.
  if (index > -1 && message.author.bot === false) {
    let mentioned_usernames = []
    for (let mention of message.mentions.users) { mentioned_usernames.push("@" + mention[1].username) }
    var attachmentUrls = []
    for (let attachment of message.attachments) {
      attachmentUrls.push(attachment[1].url)
    }
    // attachmentUrls is empty when there are no attachments so we can be just lazy
    var finalMessageContent = message.content.replace(/<@.*>/gi, '')
    api.sendMessage({
      chat_id: telegram_ids[index],
      text: message.author.username + ": " + finalMessageContent + " " + attachmentUrls.join(' ') + mentioned_usernames.join(" ")
    });

  }
});

var photoUrl = "";
api.on("message", function (message) {
  console.log(message)
  var filePath = ""
  let index = telegram_ids.indexOf(message.chat.id+"")
  if (index > -1 && message.from.is_bot == false) {
    // this part gets the user profile photos as the variable names suggest
    let getProfilePic = new Promise(function (resolve, reject) {
      var profilePhotos = api.getUserProfilePhotos({ user_id: message.from.id });
      profilePhotos.then(function (data) {
        // if user has a profile photo
        if (data.total_count > 0) {
          var file = api.getFile({ file_id: data.photos[0][0].file_id });
          file.then(function (result) {
            var filePath = result.file_path;
            resolve("https://api.telegram.org/file/bot" + telegramToken + "/" + filePath);

          });
        } else {
          //console.log("telegram pfp")
          resolve("https://telegram.org/img/t_logo.png");
        }
      });
    });
    getProfilePic.then(function (profile_url) {
      // if the message contains media
      if (message.document || message.photo || message.sticker || message.voice) {
        if (message.document) {
          var document = api.getFile({ file_id: message.document.file_id });
          document.then(function (data) {
            var documentUrl =
              "https://api.telegram.org/file/bot" + telegramToken + "/" + data.filePath;
              webhooks[index].send(message.caption, {
              username: message.from.first_name,
              avatarURL: profile_url,
              files: [documentUrl]
            });
          });
        }
        if (message.sticker) {
          var sticker = api.getFile({ file_id: message.sticker.file_id })
          sticker.then(function (data) {
            var sticker_url =
              "https://api.telegram.org/file/bot" + telegramToken + "/" + data.file_path;
              webhooks[index].send(message.caption, {
              username: message.from.first_name,
              avatarURL: profile_url,
              files: [sticker_url]
            });
          });
        }
        if (message.photo) {
          var photo = api.getFile({ file_id: message.photo[0].file_id });
          photo.then(function (data) {
            var photoUrl =
              "https://api.telegram.org/file/bot" + telegramToken + "/" + data.file_path;
              webhooks[index].send(message.caption, {
              username: message.from.first_name,
              avatarURL: profile_url,
              files: [photoUrl]
            });
          });
        }
        if (message.voice) {
          var voice = api.getFile({ file_id: message.voice.file_id });
          voice.then(function (data) {
            var voiceUrl =
              "https://api.telegram.org/file/bot" + telegramToken + "/" + data.file_path;
              webhooks[index].send("Mensaje de voz de " + message.from.first_name, {
              username: message.from.first_name,
              avatarURL: profile_url,
              files: [voiceUrl]
            });
          });
        }
      } else {
        webhooks[index].send(message.text, {
          username: message.from.first_name,
          avatarURL: profile_url
        });
      }
    })

  }
});