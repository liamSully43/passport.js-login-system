// jshint: 6;

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocal = require("passport-local");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect(process.env.API_KEY, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("Trial-user", userSchema);

const app = express();
app.set("view engine", "html");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res) {
    res.render(`${__dirname}/index.ejs`);
});

app.get("/login", function(req, res) {
    res.render(`${__dirname}/login.ejs`);
});

app.get("/register", function(req, res) {
    res.render(`${__dirname}/register.ejs`);
});

app.post("/register", function(req, res) {
    User.register({username: req.body.username, name: req.body.name, password: req.body.password}, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/");
            });
        }
    });
});

app.listen(3000, function() {
    console.log("live on port 3000");
})