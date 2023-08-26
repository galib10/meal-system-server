const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjuepub.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// varify JWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const mealDataCollection = client
      .db("meal-system")
      .collection("day-wise-data");
    const usersCollection = client.db("Car-sell-point").collection("users");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "20h",
      });
      res.send({ token });
    });

    app.get("/mealsData", async (req, res) => {
      const query = {};
      const result = await mealDataCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/mealsData", async (req, res) => {
      const mealData = req.body;
      const result = await mealDataCollection.insertOne(mealData);
      res.send(result);
    });

    // app.get("/mealsDatas", async (req, res) => {
    //   //   const mealData = req.body;
    //   const result = await mealDataCollection.deleteMany({});
    //   res.send(result);
    // });

    // app.get("/category/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { categoryId: id };
    //   const result = await productsCollection.find(query).toArray();
    //   res.send(result);
    // });

    // app.delete("/buyer/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: ObjectId(id) };
    //   const result = await usersCollection.deleteOne(filter);
    //   res.send(result);
    // });

    // app.post("/bookings", async (req, res) => {
    //   const user = req.body;
    //   // console.log(user);
    //   const result = await bookingsCollection.insertOne(user);
    //   res.send(result);
    // });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send(`
    <div style="text-align: center; font-family: arial; padding: 0 30px">
    <img src="https://i.ibb.co/9sD5w3t/favicon.png" alt="Server logo" style="width: 200px; margin: 20px 0;">
    <h1 style="font-size: 3em; margin: 10px 0;">Welcome to meal server!</h1>
  </div>
    `);
});

app.listen(port, () => console.log("sell point running............."));
