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

//router to sent a request to a user

app.post("/request-friendship", async (req, res) => {
  const { sender_userId, recipient_userId } = req.body;
  try {
    //update the recipient's friend-request-array
    await User.findByIdAndUpdate(recipient_userId, {
      $push: { receivedFriendRequests: sender_userId },
    });

    //update the sender's friend-request-array
    await User.findByIdAndUpdate(sender_userId, {
      $push: { sentFriendRequests: recipient_userId },
    });

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500).json({
      message: "an error occurred while trying to process the friend request:",
      error: err,
    });
  }
});

// route to show all the friend requests the user received

app.get("/friend-requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user document based on the userId
    const user = await User.findById(userId)
      .populate("receivedFriendRequests", "name email image")
      .lean();
    const friendRequests = JSON.parse(
      JSON.stringify(user.receivedFriendRequests)
    );
    console.log("friendRequests", friendRequests);

    //without the JSON parse+stringify:
    // just pay attention that this is not deep copy and so,
    //if you change "user", you might change "friendRequests" as well.
    res.status(200).json(friendRequests);
  } catch (error) {
    res.status(500).json({
      msg: "there was an error trying to retrieve the received friend requests",
      error: error,
    });
  }
});

//route to accept a friend request

app.post("/friend-requests/accept", async (req, res) => {
  try {
    const { sender_userId, recipient_userId } = req.body;

    console.log(
      "sender_userId: (the one who sent the friend request and now should be friends:",
      sender_userId
    );

    //retrieve the documents of sender and recipient

    const sender = await User.findById(sender_userId);
    const recipient = await User.findById(recipient_userId);

    //adding a record of friendship to both users
    sender.friends.push(recipient_userId);
    recipient.friends.push(sender_userId);

    //removing the friend requests from both users
    recipient.receivedFriendRequests = recipient.receivedFriendRequests.filter(
      (friendRequest) => friendRequest.toString() !== sender_userId.toString()
    );
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (friendRequest) =>
        friendRequest.toString() !== recipient_userId.toString()
    );

    //this erasure is done just in case while user1 sent a friend request to user2,
    //user2 sent a friend request to user1
    //if we would not do this, a trace would stay.
    recipient.sentFriendRequests = recipient.sentFriendRequests.filter(
      (friendRequest) => friendRequest.toString() !== sender_userId.toString()
    );
    sender.receivedFriendRequests = sender.receivedFriendRequests.filter(
      (friendRequest) =>
        friendRequest.toString() !== recipient_userId.toString()
    );

    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "friend request accepted" });
  } catch (error) {
    console.log("the server could not accept the friend request");
    res
      .status(500)
      .json({ message: "the server could not accept the friend request" });
  }
});

app.delete("/resetValues", async (req, res) => {
  try {
    //get all users
    const allUsers = await User.find({});
    //reset user records
    for (let someUser of allUsers) {
      someUser.receivedFriendRequests = [];
      someUser.sentFriendRequests = [];
      someUser.friends = [];
      someUser.__v = 0;
    }
    //save all users
    await User.bulkSave(allUsers);

    res.status(200).json({ message: "all values were reset" });
  } catch (error) {
    res.status(500).json({
      message:
        "something went wrong on the server-database side while trying to reset all values",
      error: error,
    });
  }
});
