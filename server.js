// jshint: 6;

require("dotenv").config(); // needs to be done asap in the script to prevent any errors with accessing .env
const express = require("express");
const bodyParser = require("body-parser"); // used for routing
const mongoose = require("mongoose"); // database
const session = require("express-session"); // setting up login sessions
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); // middleware for the database & passport login system

const app = express();

// =======================================================================================================================================================================================
// -- Configurations --

app.set("view engine", "html");
app.use(express.static(__dirname + '/public'));  // used for the routing
app.use(bodyParser.urlencoded({extended: true})); // used to link CSS to the EJS files

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize()); // used for logging in
app.use(passport.session()); // used to keep users logged in across tabs

// Establish the Database

mongoose.connect(process.env.API_KEY, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("Trial-user", userSchema);

passport.use(User.createStrategy()); // used for authentication
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================================================================================================================================================================================
// -- Web Routing --

app.get("/", function(req, res) {
    if(req.isAuthenticated()) {
        res.render(`${__dirname}/index.ejs`, { name: req.user.name, email: req.user.username });
    }
    else {
        res.redirect("/login");
    }
});

app.get("/login", function(req, res) {
    if(req.isAuthenticated()) {
        res.redirect("/");
    }
    else {
        res.render(`${__dirname}/login.ejs`);
    }
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    // logs the user in
    req.login(user, function(err) {
        if(err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/");
            })
        }
    })
});

app.get("/register", function(req, res) {
    if(req.isAuthenticated()) {
        res.redirect("/");
    }
    else {
        res.render(`${__dirname}/register.ejs`);
    }
});
// registers new users
app.post("/register", function(req, res) {
    User.register({name: req.body.name, username: req.body.username}, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/");
            })
        }
    });
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
})

app.listen(3000, function() {
    console.log("live on port 3000");
})