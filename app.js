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
      } catch(error) {
        message.channel.send(`Error: ${error.message}`)
      }
      break
    case 'gameprofile':
    case 'gp':
      try {
        let gameProfile = await database.getGameProfile({userId: message.author.id})
        if (!gameProfile) {
          throw new Error('Game profile has not been created, create profile with createprofile command')
        }

        const user = await client.users.fetch(gameProfile.userId)
        const profileEmbed = new Discord.MessageEmbed()
          .setAuthor(user.username, user.avatarURL)
          .setTitle('Game Profile')
        if (gameProfile.selected) {
          profileEmbed.addFields(
            {name: 'Selected Ship:', value: gameProfile.selected.name},
            {name: 'Tier', value: gameProfile.selected.tier, inline: true},
            {name: 'Hp', value: gameProfile.selected.hp, inline: true},
            {name: 'Atk', value: gameProfile.selected.atk, inline: true},
            {name: 'Def', value: gameProfile.selected.def, inline: true},
            {name: 'Turret', value: gameProfile.selected.turret, inline: true}
          )
        }
        if (gameProfile.warships) {
          profileEmbed.addField('All warships', gameProfile.warships)
        }
        message.channel.send(profileEmbed)
      } catch(error) {
        message.channel.send(`Error: ${error.message}`)
      }
      break
    case 'buy':
      try {
        const buyId = args.shift()

        switch(buyId) {
          case 'ship':
            const name = args.shift()
            if(!name) {
              throw new Error('Missing ship name')
            }

            await database.addNewWarshipToGameProfile({userId: message.author.id, name})
            message.channel.send(`Ship ${name} bought`)
            break
          default: 
            message.channel.send('Invalid item to buy')
        }
      } catch(error) {
        message.channel.send(`Error: ${error.message}`)
      }
      break
    default:
      message.channel.send('Invalid command')
  }
})

client.login(process.env.TOKEN)