const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5dbzkti.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const volunteers = client.db("volunteersDB").collection("volunteers");
    const users = client.db("volunteersDB").collection("users");

    app.get("/", (req, res) => {
      res.send("Server is running");
    });

    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const result = users.findOne({ email: email });
    });

    app.get("/volunteers", async (req, res) => {
      const result = await volunteers.find().toArray();
      res.send(result);
    });

    app.post("/volunteers/create", async (req, res) => {
      const volunteerPost = req.body;
      const result = await volunteers.insertOne(volunteerPost);
      res.send(result);
    });

    app.post("/users/create", async (req, res) => {
      const user = req.body;
      const result = await users.insertOne(user);
      res.send(result);
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
