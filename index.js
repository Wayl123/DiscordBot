const dotenv = require('dotenv')
dotenv.config()
const Discord = require('discord.js')
const client = new Discord.Client()

const prefix = process.env.DEFAULT_PREFIX

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return

	const args = message.content.slice(prefix.length).trim().split(' ')
	const command = args.shift().toLowerCase()

  if (command === 'ping') {
    message.channel.send('pong')
  }
})

client.login(process.env.TOKEN)