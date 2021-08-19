const { MongoClient, ObjectID } = require('mongodb')
require('dotenv').config()

const url = process.env.MONGODB_URL
const dbClient = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true})

const seed = async () => {
  await dbClient.connect()

  const db = dbClient.db()

  const shop_values = db.collection('shop_values')
  const enemy_values = db.collection('enemy_values')

  shop_values.drop((err, ok) => {})

  await shop_values.insertMany([
    {
      "tier": 1,
      "hp_cap": 20, //10->50
      "hp_up": 2,
      "atk_cap": 20, //10->30
      "atk_up": 1,
      "def_cap": 15, //5->20
      "def_up": 1,
      "bonus": {
        "ap": 10,
      },
      "cost": {
        "hp_base": [10, 1, 0, 0],
        "hp_scaling": [1.1, 1.05, 0, 0],
        "atk_base": [10, 0, 1, 0],
        "atk_scaling": [1.1, 0, 1.05, 0],
        "def_base": [10, 0, 0, 1],
        "def_scaling": [1.15, 0, 0, 1.1],
      }, 
    },
    {
      "tier": 2,
      "hp_cap": 25, //50->100
      "hp_up": 2,
      "atk_cap": 20, //30->50
      "atk_up": 1,
      "def_cap": 10, //20->30
      "def_up": 1,
      "bonus": {
        "hp": 10,
        "dp": 10,
      },
    },
  ])

  enemy_values.drop((err, ok) => {})

  await enemy_values.insertMany([
    {
      "num": 1,
      "hp": 10,
      "atk": 10,
      "reward": [10, 1, 1, 1],
    },
    {
      "num": 2,
      "hp": 15,
      "atk": 15,
      "reward": [20, 1, 1, 1],
    },
    {
      "num": 3,
      "hp": 25,
      "atk": 25,
      "reward": [25, 2, 2, 2],
    },
    {
      "num": 4,
      "hp": 25,
      "atk": 25,
      "def": 5,
      "reward": [40, 3, 3, 3],
    },
    {
      "num": 5,
      "hp": 40,
      "atk": 30,
      "def": 5,
      "reward": [60, 4, 4, 4],
    },
    {
      "num": 5,
      "hp": 50,
      "atk": 30,
      "def": 10,
      "reward": [100, 5, 5, 5],
    },
  ])
}

(async () => {
  await seed()
  console.log("db seeded")
  await dbClient.close()
})()