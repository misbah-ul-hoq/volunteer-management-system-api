const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://volunteers-management-system.firebaseapp.com",
      "https://volunteers-management-system.web.app	",
      "https://volunteer-management-system-three.vercel.app",
    ],
    // credentials: true,
  })
);

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
    const requestedVolunteers = client
      .db("volunteersDB")
      .collection("requestedVolunteers");

    app.get("/", (req, res) => {
      res.send("Server is running");
    });

    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const result = await users.findOne({ email: email });
      res.send(result);
    });

    app.get("/requests/:email", async (req, res) => {
      const email = req.params.email;
      const result = await requestedVolunteers
        .find({ organizerEmail: email })
        .toArray();
      res.send(result);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.TOKEN, { expiresIn: "2h" });

      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .send({ success: true });
    });

    app.post("/requests/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestedVolunteers.deleteOne(query);
      res.send(result);
    });

    app.get("/volunteers/user/:email", async (req, res) => {
      const query = { organizerEmail: req.params.email };
      const result = await volunteers.find(query).toArray();
      res.send(result);
    });

    app.get("/volunteers", async (req, res) => {
      const result = await volunteers.find().toArray();
      res.send(result);
    });

    app.get("/volunteers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteers.findOne(query);
      res.send(result);
    });

    app.post("/volunteers/request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const requested = req.body;
      const result = await requestedVolunteers.insertOne(requested);
      const decrease = await volunteers.updateOne(query, {
        $inc: { numberOfVolunteers: -1 },
      });
      res.send(result);
    });

    app.post("/volunteers/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedVolunteer = { $set: req.body };
      const result = await volunteers.updateOne(filter, updatedVolunteer);
      res.send(result);
    });

    app.post("/volunteers/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteers.deleteOne(query);
      res.send(result);
    });

    app.get("/volunteers/search/:title", async (req, res) => {
      const title = req.params.title;
      const query = { postTitle: title };
      const result = await volunteers.find(query).toArray();
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
