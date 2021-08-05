const { MongoClient, ObjectID } = require('mongodb')
require('dotenv').config()

const url = process.env.MONGODB_URL
const dbClient = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true})

module.exports = async () => {
  await dbClient.connect()

  const db = dbClient.db()

  const game_profile = db.collection('game_profile')

  //Create
  const createGameProfile = async ({userId}) => {
    const gameProfile = await game_profile.findOne({userId: userId})
    if (gameProfile) {
      throw Error ('Game profile already created.')
    }
    
    return await game_profile.insertOne({
      userId
    })
  }

  //Get one
  const getGameProfile = async ({userId}) => {
    return await game_profile.findOne({userId: userId})
  }

  //Update
  const updateGameProfile = async ({userId}) => {
    return await game_profile.findOneAndUpdate(
      {userId: userId},
      {}
    )
  }

  return {
    createGameProfile,
    getGameProfile,
    updateGameProfile
  }
}