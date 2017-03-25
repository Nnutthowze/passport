const express = require('express');
const app = express();
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local');
const User = require('./server/user');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
mongoose.connect("mongodb://localhost:27017/vote");

app.use(require('express-session')({
    secret: "once i was a wooden boy",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // other wise, send object to change router to login. of no concern right now.
};

app.get('/text1', (req, res) => {
    res.send({ text: 'this is text from simple request text1'});
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const newUser = new User({ username });
    User.register(newUser, password, (err, user) => {
        if(err) throw err;
        passport.authenticate('local')(req, res, () => {
            res.send({text: 'you are now registered, not logged in'});
        });
    });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.send({ text: "no user!"}); }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return res.send({ text: "you are logged in"});
        });
    })(req, res, next);
});

app.post('/text/new', isLoggedIn, (req, res) => {
    const text = req.body.text;
});

app.listen(4000);
