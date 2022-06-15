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

const splitMessage = (message) => {
    const listOfFragmentsOfMessage = message.split("\n");
    let auxiliarMessages = [];
    let finalMessages = [];

    console.log(listOfFragmentsOfMessage)

    listOfFragmentsOfMessage.forEach((internalMessage, index) => {
        console.log(auxiliarMessages);
        if((auxiliarMessages.join("\n").length + internalMessage.length + 3) < 2000){
          auxiliarMessages.push(internalMessage);
        }else if(internalMessage.length > 2000) {
          let littleMessage = internalMessage.split(" ");
          for(let i=0; i < littleMessage.length; i += 1997){
            let subString = internalMessage.substring(i, i+1997);
            if((auxiliarMessages.join("\n").length + subString.length + 3) < 2000){
              auxiliarMessages.push(subString);
            }else{
              finalMessages.push(auxiliarMessages.join("\n"));
              auxiliarMessages = [subString];              
            }
          }
        }
        else{
          finalMessages.push(auxiliarMessages.join("\n"));
          auxiliarMessages = [internalMessage];
        }
    })
    finalMessages.push(auxiliarMessages.join("\n"));

    return finalMessages;
}

const listOfCommands = ["/help", "/ayuda", "/siu", "/campus", "/links", "/comunidades", "/comunidades_it", "/calendar", "/calendario", "/calendar feriados", "/mails"];

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
const telegram = require("natsvora-telegram-bot-api");

// import env variables
const telegramToken = process.env.TELEGRAM_BOT_TOKEN
const DISCORD_TOKEN = process.env.DISCORD_TOKEN

let discord_webhooks = JSON.parse(process.env.DISCORD_WEBHOOKS)
let discord_ids = JSON.parse(process.env.DISCORD_ID)
let telegram_ids = JSON.parse(process.env.TELEGRAM_IDS)

let webhooks = discord_webhooks.map((webhook, index) => {
  let webhook_values = webhook.split("/")
  return new Discord.WebhookClient(webhook_values[0], webhook_values[1])
})

// initializes the telegram bot and starts listening for updates (new messages)
const api = new telegram({
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
try {
  // if the discord bot receives a message
  client.on("message", message => {
    let index = discord_ids.indexOf(message.channel.id + "");
    if (index == -1) return;

    // the program currently check if the message's from a bot to check for duplicates. This isn't the best method but it's good enough. A webhook counts as a bot in the discord api, don't ask me why.
    if (index > -1 && message.author.bot === false) {
      let mentioned_usernames = []
      for (let mention of message.mentions.users) { mentioned_usernames.push("@" + mention[1].username) }
      let attachmentUrls = []
      for (let attachment of message.attachments) {
        attachmentUrls.push(attachment[1].url)
      }
      // attachmentUrls is empty when there are no attachments so we can be just lazy
      const finalMessageContent = message.content.replace(/<@.*>/gi, '')
      if(listOfCommands.includes(finalMessageContent)){
        api.sendMessage({
          chat_id: telegram_ids[index],
          text: message.author.username + " desde Discord ha invocado el comando " + finalMessageContent
        });
        api.sendMessage({
          chat_id: telegram_ids[index],
          text: finalMessageContent
        });
        return;        
      }
      api.sendMessage({
        chat_id: telegram_ids[index],
        text: message.author.username + ": " + finalMessageContent + " " + attachmentUrls.join(' ') + mentioned_usernames.join(" ")
      });

    }

  });

  const getProfilePic = async (user_ids) => {
    let profile_pics = []
    for (let i = 0; i < user_ids.length; i++) {
      let user_id = user_ids[i]
      const profilePhotos = await api.getUserProfilePhotos({ user_id: user_id.id });
      if (profilePhotos.total_count > 0) {
        const file = await api.getFile({ file_id: profilePhotos.photos[0][0].file_id });
        const filePath = file.file_path;
        profile_pics.push("https://api.telegram.org/file/bot" + telegramToken + "/" + filePath)
      } else {
        profile_pics.push("https://telegram.org/img/t_logo.png")
      }
    }
    return profile_pics;
  }


  api.on("message", async function (message) {
    let index = telegram_ids.indexOf(message.chat.id + "")
    if (index == -1) return;

    let users = message.left_chat_member ? [message.left_chat_member] : 
                (message.new_chat_members ? message.new_chat_members : [message.from]);
    const profilePics = await getProfilePic(users);

    users.forEach(async (user, indexOfUser) => {
      // this part gets the user profile photos as the variable names suggest

      let profile_picture = profilePics[indexOfUser];

      // if the message contains media
      if (message.document) {
        const document = await api.getFile({ file_id: message.document.file_id });
        const documentUrl = "https://api.telegram.org/file/bot" + telegramToken + "/" + document.file_path;
        
        const listOfMessages = message.caption ? splitMessage(message.caption) : [];
        listOfMessages.forEach(fragmentOfMessage => {
          webhooks[index].send(fragmentOfMessage, {
            username: user.first_name,
            avatarURL: profile_picture,
          });
        })
        webhooks[index].send("", {
          username: user.first_name,
          avatarURL: profile_picture,
          files: [documentUrl]
        });

        return;
      }
      if (message.sticker) {
        const sticker = await api.getFile({ file_id: message.sticker.file_id })
        const sticker_url = "https://api.telegram.org/file/bot" + telegramToken + "/" + sticker.file_path;
        const listOfMessages = message.caption ? splitMessage(message.caption) : [];
        listOfMessages.forEach(fragmentOfMessage => {
          webhooks[index].send(fragmentOfMessage, {
            username: user.first_name,
            avatarURL: profile_picture,
          });
        })
        webhooks[index].send("", {
          username: user.first_name,
          avatarURL: profile_picture,
          files: [sticker_url]
        });
        return;
      }
      if (message.photo) {
        const photo = await api.getFile({ file_id: message.photo[message.photo.length - 1].file_id });
        const photoUrl = "https://api.telegram.org/file/bot" + telegramToken + "/" + photo.file_path;
        const listOfMessages = message.caption ? splitMessage(message.caption) : [];
        listOfMessages.forEach(fragmentOfMessage => {
          webhooks[index].send(fragmentOfMessage, {
            username: user.first_name,
            avatarURL: profile_picture,
          });
        })
        webhooks[index].send("", {
          username: user.first_name,
          avatarURL: profile_picture,
          files: [photoUrl]
        });
        return;
      }
      if (message.voice) {
        const voice = await api.getFile({ file_id: message.voice.file_id });
        const voiceUrl = "https://api.telegram.org/file/bot" + telegramToken + "/" + voice.file_path;
        webhooks[index].send("Mensaje de voz de " + user.first_name, {
          username: user.first_name,
          avatarURL: profile_picture,
          files: [voiceUrl]
        });
        return;
      }
      if (message.new_chat_members) {
        webhooks[index].send("*Se ha unido " + user.first_name + "*", {
          username: user.first_name,
          avatarURL: profile_picture
        });
        return;
      }
      if (message.left_chat_member){
        webhooks[index].send("*"+message.left_chat_member.first_name +" ha dejado el grupo*", {
          username: message.left_chat_member.first_name,
          avatarURL: profile_picture
        });
        return;
      }
      const listOfMessages = splitMessage(message.text);
      listOfMessages.forEach(fragmentOfMessage => {
        webhooks[index].send(fragmentOfMessage, {
          username: user.first_name,
          avatarURL: profile_picture,
        });
      })

    })

  });


} catch (e) {
  console.log("E")
}