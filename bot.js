const Discord = require("discord.js");
const client = new Discord.Client();
const dotenv = require('dotenv').config();
const ytdl = require("ytdl-core");
const {YTSearcher} = require("ytsearcher");
const ytbsr = new YTSearcher(process.env.YTB_KEY);
const fs = require("fs");
const axios = require("axios");

const prefix = "yo";

client.on('ready', () => {
	console.log(`Logged as ${client.user.tag}`);
})

let dispatcher = null;

client.on('message', async msg => {
	if (msg.author.bot) return;

	if (msg.content.trim().startsWith(prefix)) {
		const args = msg.content.trim().split(" ");
		if (!args[1]) {
			msg.reply("coje")
		}

		if (args[1] == "leave") {
			msg.member.voice.channel.leave()
			msg.channel.send("pici tak jo");
		}

		if (args[1] == "stop") {
			if (dispatcher !== null) {
				dispatcher.destroy();
			}
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

		if (args[1] === "nasa") {
			axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_TOKEN}`)
				.then(res => {
					const data = res.data;
					const embed = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle(data.title)
						.setDescription(data.explanation)
						.setThumbnail(data.url)
						.setImage(data.hdurl)
						.setFooter(data.date, 'https://cdn.iconscout.com/icon/free/png-256/nasa-5-569227.png');
					msg.channel.send(embed);
				});
		}

		if (args[1] == "play" && args[2] && msg.member.voice.channel) {
			const query = msg.content.split("yo play")[1];
			const streamOptions = {seek: 0, volume: 1};

			msg.member.voice.channel.join().then(connection => {
				ytbsr.search(args[2]).then(res => {
					console.log(`new search: ${res.first.url}\n`)
					const stream = ytdl(res.first.url, {filter: "audioonly"});
					if (dispatcher !== null)
						dispatcher.destroy()
					dispatcher = connection.play(stream, streamOptions)
					console.log(`new dispatcher request: ${connection} \n`);
					dispatcher.on("start", start => {
						msg.channel.send(`Playing dat shit boost it up yoooooooooooo \n${res.first.url}`);
					})


				});
			}).catch(err => console.error(err))
		}
	}



})

client.login(process.env.BOT_TOKEN)
	.catch(err => console.log(err));
