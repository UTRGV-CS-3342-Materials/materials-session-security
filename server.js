const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// load the express-handlebars middleware
const hbs = require('express-handlebars');

PORT=8080;

app = express();
app.use(cookieParser());
app.use(session({secret: 'superSecret', resave: false, saveUninitialized: false}));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({extended: false}));

// set the middleware to process handlebars files
// you can pass arguments into the hbs() factory to alter default settings
// see docs here: https://www.npmjs.com/package/express-handlebars
app.set('view engine', 'handlebars');
app.engine('handlebars', hbs());

app.get('/name', (req,res) => {
	res.render('nameForm');
});

app.post('/namePost', (req,res) => {
	res.cookie('nameCookie', req.body.myName);

	req.session.nameSession = req.body.myName;

	// get name from POST body (enabled by use of express.urlencoded middleware)
	res.render('nameConfirm', {nameFromBody: req.body.myName});
});

app.get('/nameContinue', (req,res) => {
	res.render('nameContinue',
		{
			nameFromBody: req.body.myName,
			nameFromCookie: req.cookies.nameCookie,
			nameFromSession: req.session.nameSession
		});
});

app.get('/hashword', (req,res) => {
	res.render('passwordForm');
});

app.post('/hashword', async (req,res) => {
	let hash = await bcrypt.hash(req.body.password, 10);

	let compare = await bcrypt.compare(req.body.password, hash);

	res.render('passwordResult',
	{
		password: req.body.password,
		hash: hash,
		compare: compare
	})
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
