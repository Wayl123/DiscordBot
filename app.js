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
    case 'createprofile':
    case 'cp':
      try {
        await database.createGameProfile({userId: message.author.id})
        message.channel.send('Profile created')
      } catch {
        console.error(error.message)
        message.channel.send(`Error: ${error.message}`)
      }
      break
    case 'gameprofile':
    case 'gp':
      try {
        let gameProfile = await database.getGameProfile({userId: message.author.id})
        if (!gameProfile) {
          throw new Error('Game profile has not been created, create profile with createprofile command.')
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