const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

User = require('./models/user');

PORT=8081;

// connect to db
let db;
(async () => {
	db = await open({
		filename: 'awesome.sqlite',
		driver: sqlite3.Database
	});
})();

app = express();

app.get('/', async (req,res) => {
	// set content-type header to let the browser know that HTML is coming
	// (res.send does this automatically)
	res.setHeader('Content-Type', 'text/html');

	// res.write can be called repeatedly to keep sending more data to the client
	//  until you call res.end to close the stream
	res.write('<h2>Testing User Login</h2>');

	// TEST ------------------------------------------------------

	res.write('<h4>Test: user object creation (maria)</h4>');

	// create a (local) user object
	// just like creating an object in any c-style language
	// except that we like to pass in an associative array of named
	//  parameters instead of having parameters based on position
	let user = new User({
		id: 15,
		username: 'maria',
		admin: 0
	});

	// dump to stream as JSON
	res.write(`<pre>${JSON.stringify(user)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: user retreive from database (testguy)</h4>');

	// success
	user = await User.findByUsername('testguy', db);
	// dump to stream as JSON
	res.write(`<pre>${JSON.stringify(user)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: user retreive from database (notarealusername)</h4>');

	// failure
	user = await User.findByUsername('notarealusername', db);
	// dump to stream as JSON
	res.write(`<pre>${JSON.stringify(user)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: signup new user (username: "", password: "a")</h4>');

	let [success, newuser, errors] = await User.signup('', 'a', db);

	// dump to stream as JSON
	res.write(`<pre>success: ${JSON.stringify(success)}</pre>`);
	res.write(`<pre>newuser: ${JSON.stringify(newuser)}</pre>`);
	res.write(`<pre>errors: ${JSON.stringify(errors)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: signup new user (username: "newgirl", password: "lousypassword")</h4>');

	[success, newuser, errors] = await User.signup('newgirl', 'lousypassword', db);

	// dump to stream as JSON
	res.write(`<pre>success: ${JSON.stringify(success)}</pre>`);
	res.write(`<pre>newuser: ${JSON.stringify(newuser)}</pre>`);
	res.write(`<pre>errors: ${JSON.stringify(errors)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: signup new user (duplicate of "newgirl")</h4>');

	[success, newuser, errors] = await User.signup('newgirl', 'lousypassword', db);

	// dump to stream as JSON
	res.write(`<pre>success: ${JSON.stringify(success)}</pre>`);
	res.write(`<pre>newuser: ${JSON.stringify(newuser)}</pre>`);
	res.write(`<pre>errors: ${JSON.stringify(errors)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: bad login (username: "", password: "")</h4>');

	user = await User.login('', '', db);

	// dump to stream as JSON
	res.write(`<pre>user: ${JSON.stringify(user)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: bad login (username: notarealusername, password: "aaaaaa")</h4>');

	user = await User.login('notarealusername', 'aaaaaa', db);

	// dump to stream as JSON
	res.write(`<pre>user: ${JSON.stringify(user)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: bad login (username: "newgirl", password: "notthepassword")</h4>');

	user = await User.login('newgirl', 'notthepassword', db);

	// dump to stream as JSON
	res.write(`<pre>user: ${JSON.stringify(user)}</pre>`);

	// TEST ------------------------------------------------------

	res.write('<h4>Test: good login (newgirl)</h4>');

	user = await User.login('newgirl', 'lousypassword', db);

	// dump to stream as JSON
	res.write(`<pre>user: ${JSON.stringify(user)}</pre>`);

	// close the stream
	res.end('<h2>Complete</h2>');
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
