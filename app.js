const Discord = require('discord.js')
const client = new Discord.Client()
require('dotenv').config()
const mongoDatabase = require('./mongoDatabase')

const prefix = process.env.DEFAULT_PREFIX
let database

client.once('ready', async () => {
  database = await mongoDatabase()
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return

	const args = message.content.slice(prefix.length).trim().split(' ')
	const command = args.shift().toLowerCase()

  switch(command) {
    case 'ping':
      message.channel.send('pong')
      break
    case 'gameprofile':
      try {
        let gameProfile = await database.getGameProfile({userId: message.author.id})
        if (!gameProfile) {
          await database.createGameProfile({userId: message.author.id})
          gameProfile = await database.getGameProfile({userId: message.author.id})
        }
        console.log(gameProfile)
      } catch (error) {
        console.error(error.message)
      }
      break
    default:
      message.channel.send('Invalid command')
  }
})

client.login(process.env.TOKEN)