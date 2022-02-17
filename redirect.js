const express = require('express');
const path = require('path');

PORT=8080;

app = express();
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

// non-persistent data storage
const history = [];

app.get('/convo', (req,res) => {
	res.render('redirectForm', {
		history: history
	});
});

app.post('/talk', (req,res) => {

    // if they say something bad, send back an error...
    if (isBad(req.body.comment)) {
        res.render('redirectForm', {
            history: history,
            error_msg: "Wash your mouth out."
        });
        return;
    }

    // not bad, update db and redirect
    history.push(req.body.comment);
    res.redirect('/convo');

});

const isBad = str => str === "arugula";

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
