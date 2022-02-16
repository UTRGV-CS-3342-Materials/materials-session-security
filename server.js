const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const session = require('express-session');

User = require('./models/user');

PORT=8080;

// connect to db
let db;
(async () => {
	db = await open({
		filename: 'awesome.sqlite',
		driver: sqlite3.Database
	});
})();

app = express();

// use urlencoding for form POSTs
app.use(express.urlencoded({extended: false}));

// use server-side in-memory session
app.use(session({secret: 'superSecret', resave: false, saveUninitialized: false}));

// serve static files
app.use(express.static(path.join(__dirname, 'static')));

app.set('view engine', 'ejs');


//////////////////////////////////////////////////////////////////
// home page (/)
//
// case 1: the user has logged in already
//  - they have an active session with a User object in it
// outcome: render the home view and pass the User object in
//
// case 2: the user hasn't logged in
//   - they don't have an active session, or there is no User object in it
// outcome: render the home view *without* any User object

app.get('/', (req,res) => {
	if (req.session.user) {
		// case 1
		res.render('home', {user: req.session.user});
	} else {
		// case 2
		res.render('home');
	}
});

//////////////////////////////////////////////////////////////////
// login
//
// case 1: the user is logged in already
//  - they have an active session with a User object in it
//  - can't login without logging out first
// outcome: redirect them back to the home view
//
// case 2: the user hasn't logged in
//   - they don't have an active session, or there is no User object in it
// outcome: render the login form

app.get('/login', (req,res) => {
	if (req.session.user) {
		// case 1
		res.redirect('/');
	} else {
		// case 2
		res.render('login');
	}
});

////////////////
// login POST
//
// case 1: successful login
//  - the username/password match what's in the db
// outcome: store the user in session and redirect to the home view
//
// case 2: unsuccessful login
//  - the username/password don't match what's in the db
// outcome: re-render the login form
//  - include error messages
//  - don't make them retype the username

app.post('/login', async (req,res) => {
	// get username and password from the POST body
	const username = req.body.username.trim();
	const pw = req.body.password.trim();

	// call User.login to attempt to login
	const user = await User.login(username, pw, db);

	if (user) {
		// success! store the user object in session and redirect to home page
		req.session.user = user;
		res.redirect('/');
	} else {
		// failure, re-render the login form w/ errors and username
		res.render('login', {username: username, failed: true});
	}
});

//////////////////////////////////////////////////////////////////
// register
//
// case 1: the user is logged in already
//  - they have an active session with a User object in it
//  - can't register without logging out first
// outcome: redirect them back to the home view
//
// case 2: the user hasn't logged in
//   - they don't have an active session, or there is no User object in it
// outcome: render the register form

app.get('/register', (req,res) => {
	if (req.session.user) {
		// case 1
		res.redirect('/');
	} else {
		// case 2
		res.render('register');
	}
});

////////////////
// register POST
//
// case 1: successful registration
//  - valid username (not blank, not duplicate)
//  - valid password (> 4 characters)
// outcome: save the user to the db, store in session, and redirect to the home view
//
// case 2: unsuccessful registration
//  - invalid username or password
// outcome: re-render the registration form
//  - include error messages
//  - don't make them retype the username

app.post('/register', async (req,res) => {
	// get username and password from the POST body
	const username = req.body.username.trim();
	const pw = req.body.password.trim();

	// call User.signup to attempt to register
	const [success, user, errors] = await User.signup(username, pw, db);

	if (success) {
		// success! store the user object in session and redirect to home page
		req.session.user = user;
		res.redirect('/');
	} else {
		// failure, re-render the registration form w/ errors and username
		res.render('register', {username: username, errors: errors});
	}
});

//////////////////////////////////////////////////////////////////
// a sample content page
//
// case 1: the user is logged in
//  - they have an active session with a User object in it
// outcome: render the content view with that User object
//
// case 2: the user isn't logged in
//   - they don't have an active session, or there is no User object in it
// outcome: render the noaccess view

app.get('/content', (req,res) => {
	if (req.session.user) {
		res.render('content', {user: req.session.user});
	} else {
		res.render('noaccess');
	}
});

//////////////////////////////////////////////////////////////////
// logout
//
// remove the user from session and redirect to the home view
//

app.get('/logout', (req,res) => {
	delete req.session.user;
	res.redirect('/');
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));