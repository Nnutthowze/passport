var express = require('express');
var app = express();
var passport = require('passport');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local');
var User = require('./server/user');
var Text = require('./server/text');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
mongoose.connect("mongodb://localhost/vote");

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

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

var isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    // other wise, send object to change router to login. of no concern right now.
};

app.get('/text1', function(req, res){
    res.send({ text: 'this is text from simple request text1'});
});

app.post('/register', function(req, res){
    console.log('/register is hit');
    console.log(req.body);
    const { username, password } = req.body;
    var newUser = new User({ username });
    User.register(newUser, password, function(err, user){
        if(err){console.log(err)}
        passport.authenticate('local')(req, res, function(){
            res.send({text: 'you are now registered, not logged in'});
        });
    });
});

app.post("/login", function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.send({ text: "no user!"}); }
        req.logIn(user, function(err) {
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

app.listen(4000);














