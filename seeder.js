const { MongoClient, ObjectID } = require('mongodb')
require('dotenv').config()

const url = process.env.MONGODB_URL
const dbClient = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true})

const seed = async () => {
  await dbClient.connect()

  const db = dbClient.db()

  const shop_values = db.collection('shop_values')

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
        
      }
    },
    {
      "tier": 2,
      "hp_cap": 25, //50->100
      "hp_up": 2,
      "atk_cap": 20, //30->50
      "atk_up": 1,
      "def_cap": 10, //20->30
      "def_up": 1,
    },
  ])
}

(async () => {
  await seed()
  console.log("db seeded")
  await dbClient.close()
})()