const { MongoClient, ObjectID } = require('mongodb')
require('dotenv').config()

const url = process.env.MONGODB_URL
const dbClient = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true})

module.exports = async () => {
  await dbClient.connect()

  const db = dbClient.db()

  const game_profiles = db.collection('game_profile')
  const warships = db.collection('warship')

  //Game Profile
  //Create
  const createGameProfile = async ({userId}) => {
    const gameProfile = await game_profiles.findOne({userId: userId})
    if (gameProfile) {
      throw new Error('Game profile already created')
    }
    
    return await game_profiles.insertOne({
      userId
    })
  }

  //Get one
  const getGameProfile = async ({userId}) => {
    return await game_profiles.findOne(
      {userId: userId}, 
      {projection: {_id: 0}}
    )
  }

  //Update
  const addNewWarshipToGameProfile = async ({userId, name}) => {
    const newWarship = await createWarship({userId, name})

    return await game_profiles.findOneAndUpdate(
      {userId: userId},
      {
        $push: {warship: newWarship.insertedId}, 
        $set: {selected: newWarship.insertedId}
      }
    )
  }

  //Warship
  //Create
  const createWarship = async ({userId, name}) => {
    const warship = await warships.findOne({
      $and: [{userId: userId}, {name: name}]
    })
    if (warship) {
      throw new Error('You already have a ship with that name')
    }

    return await warships.insertOne({
      userId,
      name,
      tier: 1,
      hp: 10,
      atk: 10,
      def: 5,
      turret: 1
    })
  }

  return {
    createGameProfile,
    getGameProfile,
    addNewWarshipToGameProfile
  }
}