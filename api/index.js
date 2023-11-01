const express = require("express");
// const router = express.Router();
const cors = require("cors");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
const PORT = 8000;

// middleware for adding CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

mongoose
  .connect(
    "mongodb+srv://assaffogelman:CneKcqg63RzFsphS@cluster0.mbtalng.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("connected to mongoDb");
  })
  .catch((err) => {
    console.log("error connecting to mongoDb:", err);
  });

app.listen(PORT, () => {
  console.log("server running on port", PORT);
});

const User = require("./models/user");
const Message = require("./models/message");

//endpoint for registration of the user:

app.post("/register", async (req, res) => {
  const { name, email, password, image } = req.body;
  console.log("req", req.body);
  //create a new User object
  const newUser = new User({ name, email, password, image });

  //save the user to the DB:
  newUser
    .save()
    .then(() => {
      res.status(201).json({ message: "User registered successfully!" });
    })
    .catch((err) => {
      console.log("Error registering the user");
      res.status(500).json({
        message: "Error registering the user",
        userDetails: newUser,
      });
    });
});
