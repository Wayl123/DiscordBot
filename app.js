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

  try {
    switch (command) {
      case 'ping':
        message.channel.send('pong')
        break
      case 'createprofile':
      case 'cp':
        await database.createGameProfile({userId: message.author.id})
        message.channel.send('Profile created')
        break
      case 'gameprofile':
      case 'gp':
        const gameProfile = await database.getGameProfile({userId: message.author.id})
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
        break
      case 'shop':
        const shop = await database.getShop({userId: message.author.id})

        const shopEmbed = new Discord.MessageEmbed()
          .setTitle('Shop')
          .addField('Selected Ship', shop.warship.name)
          .setFooter('Use \'buy [ID]\' to purchase the upgrade')
        if (shop.shop.hp_cap) {
          shopEmbed.addField(
            `Hp \`${shop.hp}/${shop.shop.hp_cap}\``, 
            //Cost is only displayed when purchased amount hasn't reach cap yet
            //Resource only shows up in cost if it is needed
            `${shop.hp !== shop.shop.hp_cap ? 'Cost: ' +
              `\$${Math.round(shop.shop.cost.hp_base[0]*(shop.shop.cost.hp_scaling[0]**shop.hp))}` +
              `${shop.shop.cost.hp_base[1] > 0 ? ` Stone ${Math.round(shop.shop.cost.hp_base[1]*(shop.shop.cost.hp_scaling[1]**shop.hp))}` : ''}` +
              `${shop.shop.cost.hp_base[2] > 0 ? ` Wood ${Math.round(shop.shop.cost.hp_base[2]*(shop.shop.cost.hp_scaling[2]**shop.hp))}` : ''}` +
              `${shop.shop.cost.hp_base[3] > 0 ? ` Metal ${Math.round(shop.shop.cost.hp_base[3]*(shop.shop.cost.hp_scaling[3]**shop.hp))}` : ''}`
              : ''}
              Effect: +${shop.shop.hp_up}
              ID: \`hp\`
            `
          )
        }
        if (shop.shop.atk_cap) {
          shopEmbed.addField(
            `Atk \`${shop.atk}/${shop.shop.atk_cap}\``, 
            //Cost is only displayed when purchased amount hasn't reach cap yet
            //Resource only shows up in cost if it is needed
            `${shop.atk !== shop.shop.atk_cap ? 'Cost: ' +
              `\$${Math.round(shop.shop.cost.atk_base[0]*(shop.shop.cost.atk_scaling[0]**shop.atk))}` +
              `${shop.shop.cost.atk_base[1] > 0 ? ` Stone ${Math.round(shop.shop.cost.atk_base[1]*(shop.shop.cost.atk_scaling[1]**shop.atk))}` : ''}` +
              `${shop.shop.cost.atk_base[2] > 0 ? ` Wood ${Math.round(shop.shop.cost.atk_base[2]*(shop.shop.cost.atk_scaling[2]**shop.atk))}` : ''}` +
              `${shop.shop.cost.atk_base[3] > 0 ? ` Metal ${Math.round(shop.shop.cost.atk_base[3]*(shop.shop.cost.atk_scaling[3]**shop.atk))}` : ''}`
              : ''}
              Effect: +${shop.shop.atk_up}
              ID: \`atk\`
            `
          )
        }
        if (shop.shop.def_cap) {
          shopEmbed.addField(
            `Def \`${shop.def}/${shop.shop.def_cap}\``, 
            //Cost is only displayed when purchased amount hasn't reach cap yet
            //Resource only shows up in cost if it is needed
            `${shop.def !== shop.shop.def_cap ? 'Cost: ' +
              `\$${Math.round(shop.shop.cost.def_base[0]*(shop.shop.cost.def_scaling[0]**shop.def))}` +
              `${shop.shop.cost.def_base[1] > 0 ? ` Stone ${Math.round(shop.shop.cost.def_base[1]*(shop.shop.cost.def_scaling[1]**shop.def))}` : ''}` +
              `${shop.shop.cost.def_base[2] > 0 ? ` Wood ${Math.round(shop.shop.cost.def_base[2]*(shop.shop.cost.def_scaling[2]**shop.def))}` : ''}` +
              `${shop.shop.cost.def_base[3] > 0 ? ` Metal ${Math.round(shop.shop.cost.def_base[3]*(shop.shop.cost.def_scaling[3]**shop.def))}` : ''}`
              : ''}
              Effect: +${shop.shop.def_up}
              ID: \`def\`
            `
          )
        }
        message.channel.send(shopEmbed)
        break
      case 'buy':
        const buyId = args.shift()

        switch (buyId) {
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
        break
      default:
        message.channel.send('Invalid command')
    }
  } catch (error) {
    message.channel.send(`Error: ${error.message}`)
  }
})

client.login(process.env.TOKEN)