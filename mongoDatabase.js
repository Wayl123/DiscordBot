const { MongoClient, ObjectID } = require('mongodb')
require('dotenv').config()

const url = process.env.MONGODB_URL
const dbClient = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true})

module.exports = async () => {
  await dbClient.connect()

  const db = dbClient.db()

  const game_profiles = db.collection('game_profiles')
  const warships = db.collection('warships')
  const shop_values = db.collection('shop_values')
  const shop_status = db.collection('shop_status')

  //Game Profile
  //Create
  const createGameProfile = async ({userId}) => {
    const gameProfile = await game_profiles.findOne({userId: userId})
    if (gameProfile) {
      throw new Error('Game profile already created')
    }
    
    return await game_profiles.insertOne({
      userId,
    })
  }

  //Get one
  const getGameProfile = async ({userId}) => {
    const aggregateOptions = [
      {
        $match: {
          userId: userId,
        }
      },
      {
        $lookup: {
          from: 'warships',
          localField: 'selected',
          foreignField: '_id',
          as: 'selected'
        }
      },
      {
        $unwind: {
          path: '$selected',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          'selected._id': 0,
          'selected.userId': 0,
        }
      },
    ]

    return await game_profiles.aggregate(aggregateOptions).next()
  }

  const getSelectedShip = async ({userId}) => {
    const game_profile = await game_profiles.findOne({userId: userId})

    if (!game_profile.selected) {
      throw new Error('No ship selected')
    }

    return game_profile.selected
  }

  //Update
  const addNewWarshipToGameProfile = async ({userId, name}) => {
    const gameProfile = await game_profiles.findOne({userId: userId})
    if (!gameProfile) {
      throw new Error('Game profile has not been created, create profile with createprofile command')
    }
    
    const newWarship = await createWarship({userId, name})
    await createShopStatus({warshipId: newWarship.insertedId})

    return await game_profiles.findOneAndUpdate(
      {userId: userId},
      {
        $push: {warships: name}, 
        $set: {selected: newWarship.insertedId},
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
      turret: 1,
    })
  }

  //Shop
  //Create
  const createShopStatus = async ({warshipId}) => {
    const status = await shop_status.findOne({warshipId: warshipId})
    if (status) {
      throw new Error('Shop status for this ship already exist')
    }

    return await shop_status.insertOne({
      warshipId,
      shopTier: 1,
      hp: 0,
      atk: 0,
      def: 0,
    })
  }

  //Get one
  const getShop = async ({userId}) => {
    const warshipId = await getSelectedShip({userId})

    const aggregateOptions = [
      {
        $match: {
          warshipId: warshipId,
        }
      },
      {
        $lookup: {
          from: 'warships',
          localField: 'warshipId',
          foreignField: '_id',
          as: 'warship'
        }
      },
      {
        $unwind: {
          path: '$warship',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'shop_values',
          localField: 'shopTier',
          foreignField: 'tier',
          as: 'shop'
        }
      },
      {
        $unwind: {
          path: '$shop',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          'warship._id': 0,
          'warship.userId': 0,
          'shop._id': 0,
        }
      },
    ]

    return await shop_status.aggregate(aggregateOptions).next()
  }

  return {
    createGameProfile,
    getGameProfile,
    addNewWarshipToGameProfile,
    getShop,
  }
}