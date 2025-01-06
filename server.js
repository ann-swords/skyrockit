require("dotenv").config();
require("./config/database");
const express = require("express");

const app = express();

//-------------------------------------MiddelWare-----------------------
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
// require our new middleware!
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

// CONTROLLERS
const authCtrl = require("./controllers/auth");
const applicationsController = require("./controllers/applications.js");

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan("dev"));
//setting us the session:
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passUserToView);

// PUBLIC ROUTES
app.get("/", (req, res) => {
  // Check if the user is signed in
  if (req.session.user) {
    // Redirect signed-in users to their applications index
    res.redirect(`/users/${req.session.user._id}/applications`);
  } else {
    // Show the homepage for users who are not signed in
    res.render("index.ejs");
  }
});

app.use("/auth", authCtrl);

//Protected ROUTES
app.use(isSignedIn); //Middleware
app.use("/users/:userId/applications", applicationsController);

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
