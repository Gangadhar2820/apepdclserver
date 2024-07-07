require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const PORT = process.env.PORT || 4000;
const URL =
  "mongodb+srv://gangadhar2820:Ganga2820@apepdcl.zxhcewu.mongodb.net/?retryWrites=true&w=majority&appName=apepdcl";

let client;
let db;

// Connect to MongoDB once and reuse the connection
const connectToMongoDB = async () => {
  try {
    client = new MongoClient(URL, { maxPoolSize: 10 });
    await client.connect();
    db = client.db("apepdclConsumers");
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit if we cannot connect to the database
  }
};

connectToMongoDB();

// Define your routes
app.get("/searchserviceno/:areacode/:serviceno", async (req, res) => {
  try {
    const collectionName =
      `${req.params.areacode.toString()}_CONSUMERS`.toUpperCase();
    const serviceno = req.params.serviceno.toString();
    const collection = db.collection(collectionName);
    const result = await collection.findOne({ SERVICE_NO: serviceno });

    if (!result) {
      return res.status(404).json({ error: "Service number not found" });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in /searchserviceno/:areacode/:serviceno:", err);
    res.status(500).send("Server Error");
  }
});

app.get("/searchareacode/:areacode", async (req, res) => {
  try {
    const collectionName =
      `${req.params.areacode.toString()}_CONSUMERS`.toUpperCase();
    const collection = db.collection(collectionName);
    const result = await collection.find({}).toArray();
    res.send(result);
  } catch (err) {
    console.error("Error in /searchareacode/:areacode:", err);
    res.status(500).send("Server Error");
  }
});

app.post("/updateconsumer/:areacode/:serviceno", async (req, res) => {
  try {
    const receivedData = req.body;
    const areacode = req.params.areacode.toString();
    const collectionName = `${areacode}_CONSUMERS`.toUpperCase();
    const serviceno = req.params.serviceno.toString().toUpperCase();
    const collection = db.collection(collectionName);
    const result = await collection.updateOne(
      { SERVICE_NO: serviceno },
      { $set: receivedData }
    );

    res.send({ AREA_CODE: areacode, SERVICE_NO: serviceno, result: result });
  } catch (err) {
    console.error("Error in /updateconsumer/:areacode/:serviceno:", err);
    res.status(500).send("Server Error");
  }
});

app.post("/addconsumer/:areacode", async (req, res) => {
  try {
    const receivedData = req.body;
    const areacode = req.params.areacode.toString();
    const collectionName = `${areacode}_CONSUMERS`.toUpperCase();
    const collection = db.collection(collectionName);
    const result = await collection.findOne({SERVICE_NO:receivedData.SERVICE_NO});
    if(result){
      res.send({addStatus:false,areacode:areacode,serviceno:receivedData.SERVICE_NO,message:"consumer already exists"});
      
    }else{
      const addResult = await collection.insertOne(receivedData);
      res.send({addStatus:true,areacode:areacode,serviceno:receivedData.SERVICE_NO,message:"added successfully"});

    }
  } catch (err) {
    console.error("Error in /addconsumer/:areacode", err);
    res.status(500).send("Server Error");
  }
});

app.post("/addlogdata", async (req, res) => {
  try {
    const receivedData = req.body;
    const collection = db.collection("logbook");
    const result = await collection.insertOne(receivedData);
    if(result){
      res.send({uploaded:true})
    }else{
      res.send({uploaded:false})
    }
  } catch (err) {
    console.error("Error in /addconsumer/:areacode", err);
    res.status(500).send("Server Error");
  }
});


app.get("/getlogdata",async (req,res)=>{
  try {
    const collection = db.collection("logbook");
    const result = await collection.find({}).toArray();
    res.send(result);
  } catch (err) {
    console.error("Error in /searchareacode/:areacode:", err);
    res.status(500).send("Server Error");
  }
})

app.delete("/deletelogdata",async (req,res)=>{
  try{
    const id = req.query.id;
    const collection = db.collection("logbook");
    const result = await collection.deleteOne({_id:new ObjectId(id)})
    res.send(result);
  }catch(err){
    console.error("Error in /searchareacode/:areacode:", err);
    res.status(500).send("Server Error");
  }
})

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Closing MongoDB connection...`);
  await client.close();
  console.log("MongoDB connection closed. Exiting process...");
  process.exit(0);
};

// Handle termination signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
