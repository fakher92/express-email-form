require('dotenv').config();
const express = require('express');
var fs = require('fs');
const uuidv1 = require('uuid/v1');



// Init App
const app = express();

app.set('view engine', 'pug');


// Confirmed Users Route
app.get('/', (req, res) => {
	res.render('home', { title: 'Home', message: 'Hello there!' })
  })

// Register Users Route
app.get('/register', (req, res) => {
	res.render('register', { title: 'Register', message: 'Hello there!' })
  })

// Admin Route
app.get('/admin', (req, res) => {
	res.render('admin', { title: 'Admin', message: 'Hello there!' })
  })

//==============
app.get('/users/create', (req, res) => {
	console.log('/users/create');
	email = req.query.email;
	pw = req.query.pw;
	uuid = uuidv1();
	userInfo = {
		"uuid": uuid,
		"email": email,
		"pw": pw,
		"status": "unconfirmed",
		"session": true
	}
	fs.writeFile(`./files/${uuid}.json`, JSON.stringify(userInfo), (err) => {
		if (err) {
			return console.log(err);
		}

		console.log("The file was saved!");
		res.redirect("/");
	});
});


//http://localhost:3000/users/verify/19712790-5f3d-11e8-b678-dfcc6890467f
app.get('/users/verify/:token', (req, res) => {
	console.log(req.params.token)
	//open your files folder fs.readDir
	fs.readFile(`./files/${req.params.token}.json`, (err, file) => {
		if (err) console.log('Error', err);
		else {
			var file = JSON.parse(file)
			//set that document status to confirmed
			if (file.uuid === req.params.token) {
				console.log("current file uuid:", file.uuid)
				file.status = "confirmed";
				//write file back
				fs.writeFile(`./files/${req.params.token}.json`, JSON.stringify(file), (err) => {
					if (err) {
						return console.log(err);
					}
					console.log("The email was confirmed!");
					//redirect to /
					res.redirect("/");
				});
			}
		};
	});
})

// Start Server
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Example app listening on port 3000!'))