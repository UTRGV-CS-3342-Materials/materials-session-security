const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');

PORT=8080;

app = express();
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

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
