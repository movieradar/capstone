const express = require('express');
const app = express();

const bodyParser = require('body-parser');
//var jsonParser = bodyParser.json()
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var session = require('express-session');
//app.use(session({secret:'XASDASDA'}));
//app.use(express.urlencoded({ extended: false })); // https://stackoverflow.com/questions/47575177/express-req-body-is-empty-in-form-submission

var jsdom = require("jsdom");
var React = require('react');
var ReactDOM = require('react-dom');
//var Hello = require('./components/Hello');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);








app.use(session({ secret: 'keyboard kimie', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true}));
/* 另一个session的写法 https://github.com/expressjs/session/issues/56
app.use(session({
    secret: cookie_secret,
    name: cookie_name,
    store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
*/
app.set('view engine', 'ejs');

var passport = require('passport'),
	localStrategy = require('passport-local');

const db = require('./models/alldbfunctions');
app.use(passport.initialize());
app.use(passport.session());

/* 网上样板，放着参考
app.post('/api/login', passport.authenticate('local'), users.login);
*/

/* Please keep the following statement, this one is working sample.
app.post('/user', db.createUser);
*/

app.post('/user', db.createUser);
app.use(express.static(__dirname + "/public"));

// Above this line, are the setting syntax.
// Below this line, are the routes.

/* 网上样板，放着参考
app.get(‘/login’, function (req, res, next) {
 if (req.isAuthenticated()) {
 res.redirect(‘/account’);
 }
 else{
 res.render(‘login’, {title: “Log in”, userData: req.user, messages: {danger: req.flash(‘danger’), warning: req.flash(‘warning’), success: req.flash(‘success’)}});
 }
*/

app.get('/', (req, res) => {
	res.send("Our capstone -- try app listen on port ");
});

app.get('/homepage', db.realHomePage);

app.get('/regis', (req, res) => {
	
	res.render("register.ejs");
});

app.get('/signin', (req, res) => {
	
	res.render("signin.ejs");
});

app.get('/logout', db.logout);

app.get('/detail', (req, res) => {
	
	res.render("detail.ejs");
});



app.post('/searchresult', db.searchMovieByKey);

app.get('/tryratingdetail', (req, res) => {
	
	res.render("tryratingdetail.ejs", {db:db});
});

app.get('/trygettrailer',db.tryGetTrailer);


// 备用的detail route，迟早要换成这个
// app.get('/detail/:movieId', db.trydetail);

/* render movie detail page */
app.get('/realdetail/:movieId', db.trydetail);

app.post('/inputcomment/:movieId', db.inputcomment);

/* fake movie detail post page */
app.post('/kimietrydetail', (req, res)=>{
	var movieId = req.params.movieId;
	console.log("id is " + params);
	res.render("detail.ejs");
	//db.trydetail(id, req, res);
});


app.post('/signin', db.signin);
//app.post('/detail', db.getMovieDetail);

app.post('/inputrating', db.inputrating);

app.get('/forkimietrythings/:thing', (req, res) => {
	var thing = req.params.thing;
	
	res.render("kimietry.ejs", {thingVar: thing});
});

app.get('/posts', db.tryHomePage);

app.get('/secret', (req, res) => {
	res.render('secret.ejs', {db:db});
});


//app.get('/tryDouble', db.tryDoubleQuery);




app.listen(3000, () => {
	console.log('server is now listening to port 3000');
});




/*
app.listen(process.env.PORT, process.env.IP, (req, res) =>{
	console.log('server is now listening to port env.port');
});
*/
