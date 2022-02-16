const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

PORT=8080;

app = express();
app.use(cookieParser());
app.use(session({secret: 'superSecret', resave: false, saveUninitialized: false}));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

app.get('/name', (req,res) => {
	res.render('nameForm');
});

app.post('/namePost', (req,res) => {
	res.cookie('nameCookie', req.body.myName);

	req.session.nameSession = req.body.myName;

	// get name from POST body (enabled by use of express.urlencoded middleware)
	res.render('nameConfirm', {
		nameFromBody: req.body.myName
	});
});

app.get('/nameContinue', (req,res) => {
	res.render('nameContinue', {
		nameFromBody: req.body.myName,
		nameFromCookie: req.cookies.nameCookie,
		nameFromSession: req.session.nameSession
	});
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
