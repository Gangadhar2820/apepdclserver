const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const cors = require("cors");
app.use(cors());

const PORT = process.env.PORT || 4000;
const URL =
  "mongodb+srv://gangadhar2820:Ganga2820@apepdcl.zxhcewu.mongodb.net/?" +
  "retryWrites=true&w=majority&appName=apepdcl";


const { MongoClient } = require("mongodb");


app.get("/searchserviceno/:areacode/:serviceno", async (req, res) => {
  try {
    const client = new MongoClient(URL);
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    const dbName = "apepdclConsumers";
    const db = client.db(dbName);
    const collectionName = ( req.params.areacode.toString() + "_CONSUMERS").toUpperCase();
    const serviceno = req.params.serviceno.toString();
    let collection = db.collection(collectionName);
    let result = await collection.findOne({ SERVICE_NO: serviceno });
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

app.get("/searchareacode/:areacode",async (req,res)=>{
  try {
    const client = new MongoClient(URL);
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    const dbName = "apepdclConsumers";
    const db = client.db(dbName);
    const collectionName = ( req.params.areacode.toString() + "_CONSUMERS").toUpperCase();
    let collection = db.collection(collectionName);
    let result = await collection.find({}).toArray();
    res.send(result);
  } catch (err) {
    console.log(err);
  }
})

app.listen(PORT, (_) => console.log(`Server running on port ${PORT}`));
