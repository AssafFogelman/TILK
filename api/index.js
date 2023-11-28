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

//create a token
const createToken = (userId) => {
  // set the token payload
  const payload = {
    userId: userId,
  };

  //generate the token with a secret key and an expiration time
  const token = jwt.sign(payload, "secretKey", { expiresIn: "1d" });

  return token;
};

//endpoint for logging in  the user:
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("email:", email, "password:", password);
  //check if there is a user and password
  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "email and password are required", email, password });
  }

  //look up for the user in the database
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        //user not found
        return res.status(404).json({ message: "User not found" });
      }

      if (user.password !== password) {
        //user was found but the password does not match
        return res.status(404).json({ message: "Invalid password!" });
      }

      //login is successful
      const token = createToken(user._id); //createToken returns a token object.
      res.status(200).json({ token });
    })
    .catch((error) => {
      console.log("error in searching the user in the database", error);
      res
        .status(500)
        .json({ message: "error in searching the user in the database" });
    });
});

//endpoint to access all the users except the user who is currently logged in

const getAllUsers = (loggedInUserId) => {
  return User.find({ _id: { $ne: loggedInUserId } });
  //$ne - not equal
};

app.get("/users/:userId", async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;
    const allUsersExceptYou = await getAllUsers(loggedInUserId);
    res.status(200).json(allUsersExceptYou);
  } catch (error) {
    console.log("an error trying to retrieve all users", error);
    res
      .status(500)
      .json({ message: "an error trying to retrieve all users", error: error });
  }
});
