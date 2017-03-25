const express = require('express');
const app = express();
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./server/user');
const Text = require('./server/text');
const facebookCredentials = require('./credentials/facebook');

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
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new FacebookStrategy(facebookCredentials, function(token, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function() {

        // find the user in the database based on their facebook id
        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err)
                return done(err);

            // if the user is found, then log them in
            if (user) {
                return done(null, user); // user found, return that user
            } else {
                // if there is no user found with that facebook id, create them
                var newUser            = new User();

                // set all of the facebook information in our user model
                newUser.facebook.id    = profile.id; // set the users facebook id                   
                newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                // save our user to the database
                newUser.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, newUser);
                });
            }

        });
    });
}));

const errorHandler = (err, req, res) => {
    res.status(500).send(err);
}

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // other wise, send object to change router to login. of no concern right now.
    res.redirect('/');
};

app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', 
    { successRedirect: '/profile', failureRedirect: '/login' })
);

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

app.post('/text/new', isLoggedIn, function(req, res){
    var text = req.body.text;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newText = {text: text, author: author };
    Text.create(newText, function(err, newlycreatedText){
        if(err){ console.log(err); }
        console.log('we made it');
        console.log(newlycreatedText);
        res.send('you prob stored the text');
    });
});

app.get('/text', isLoggedIn, function(req, res){
    Text.find({}, function(err, allText){
        if(err){ console.log(err); }
        res.send({ data: allText });
    });
});

app.use(errorHandler);

app.listen(4000);
