const Discord = require("discord.js");
const client = new Discord.Client();
const dotenv = require("dotenv").config();
const ytdl = require("ytdl-core");
const { YTSearcher } = require("ytsearcher");
const ytbsr = new YTSearcher(process.env.YTB_KEY);
const axios = require("axios");
const prefix = "yo";

client.on("ready", () => {
  console.log(`Logged as ${client.user.tag}`);
});

let dispatcher = null;
let audioQ = [];
let voice = null;
let isPlaying = false;
let stream;

client.on("message", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.trim().startsWith(prefix)) {
    const args = msg.content.trim().split(" ");
    if (!args[1]) {
      msg.reply("coje");
    }

    if (args[1] == "leave") {
      msg.member.voice.channel.leave();
      if (dispatcher !== null) {
        dispatcher.destroy();
        dispatcher == null;
        audioQ = [];
        isPlaying = false;
      }
      msg.channel.send("pici tak jo");
    }

    if (args[1] == "stop") {
      if (dispatcher !== null) {
        audioQ = [];
        dispatcher.destroy();
        dispatcher == null;
        isPlaying = false;
      }
    }

    if (args[1] == "joke") {
      msg.reply("Matyas Nyvlt");
    }

    if (args[1] == "pause") {
      if (dispatcher !== null) {
        dispatcher.pause();
      }
    }

    if (args[1] == "resume") {
      if (dispatcher !== null) {
        dispatcher.resume();
      }
    }

    if (args[1] == ("q" || "queue")) {
      if (audioQ.length > 0) {
        const fieldsToAdd = [];
        audioQ.forEach((el) => {
          fieldsToAdd.push({ name: el.name, value: el.url });
        });
        const embedObject = {
          color: 0x0099ff,
          title: "Song queue",
          fields: fieldsToAdd,
        };
        msg.channel.send({ embed: embedObject });
      } else {
        msg.channel.send(`Queue empty`);
      }
    }

    if (args[1] === "nasa") {
      axios
        .get(
          `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_TOKEN}`
        )
        .then((res) => {
          const data = res.data;

          const embed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(data.title)
            .setDescription(data.explanation)
            .setThumbnail(data.url)
            .setImage(data.hdurl)
            .setFooter(
              data.date,
              "https://cdn.iconscout.com/icon/free/png-256/nasa-5-569227.png"
            );
          msg.channel.send("NASA Astronomy Photo of The Day\n", embed);
        });
    }

    if (args[1] == "play" && args[2] && msg.member.voice.channel) {
      console.log("-------------");
      if (voice === null) {
        voice = await msg.member.voice.channel.join();
      }
      const search = await ytbsr.search(args[2]);
      if (isPlaying) {
        audioQ.push({ name: search.first.title, url: search.first.url });
        msg.channel.send(`Mas to v queue mrdko \n${search.first.url}`);
        console.log(`${search.first.url} added to queue`);
      } else {
        stream = ytdl(search.first.url, { filter: "audioonly" });
        dispatcher = voice.play(stream);
        isPlaying = true;
      }
      dispatcher.on("finish", async () => {
        console.log("Dispatcher finished \n");
        if (audioQ.length > 0) {
          console.log("before q:" + [...audioQ]);
          const { url } = audioQ.shift();
          console.log(`Playing from queue, current q: ${[...audioQ]}`);
          stream = ytdl(url, { filter: "audioonly" });
          await voice.play(stream);
        } else {
          isPlaying = false;
          dispatcher.destroy();
          audioQ = [];
          dispatcher = null;
        }
      });
      dispatcher.on("start", (start) => {
        console.log("Dispatcher started");
        msg.channel.send(`Playing dat shit boost it up yoooooooooooo \n`);
      });
    }
  }
});

client.login(process.env.BOT_TOKEN).catch((err) => console.log(err));
