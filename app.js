const express = require('express');
var path = require('path');
var fs = require('fs');
const https = require('https');
const uuidv1 = require('uuid/v1');

// import environmental variables
require('dotenv').config({ path: 'variables.env' });

// Init App
const app = express();

app.set('view engine', 'pug');

// Confirmed Users Route
app.get('/', (req, res) => {
  console.log('rout /');
  var arrayOfFiles = fs.readdirSync('./files/');
  console.log(arrayOfFiles);
  var confirmedUsers = [];
  arrayOfFiles.forEach(file => {
    var readFile = fs.readFileSync(`./files/${file}`);
    let user = JSON.parse(readFile);
    if (user.status == 'confirmed') {
      confirmedUsers.push(user);
    }
  });
  res.render('home', { confirmedUsers: confirmedUsers });
});

// Register Users Route
app.get('/register', (req, res) => {
  res.render('register', { title: 'Register', message: 'Hello there!' });
});

// Admin Route
app.get('/admin', (req, res) => {
  //console.log('rout /');
  var arrayOfFiles = fs.readdirSync('./files/');
  //console.log(arrayOfFiles);
  var confirmedUsers = [];
  var unconfirmedUsers = [];
  arrayOfFiles.forEach(file => {
    var readFile = fs.readFileSync(`./files/${file}`);
    let user = JSON.parse(readFile);
    //console.log(user.uuid);
    if (user.status == 'confirmed') {
      confirmedUsers.push(user);
    } else {
      unconfirmedUsers.push(user);
    }
  });
  res.render('admin', {
    confirmedUsers: confirmedUsers,
    unconfirmedUsers: unconfirmedUsers
  });
});

//==============
app.get('/users/create', (req, res) => {
  console.log('/users/create');
  email = req.query.email;
  pw = req.query.pw;
  uuid = uuidv1();
  userInfo = {
    uuid: uuid,
    email: email,
    pw: pw,
    status: 'unconfirmed',
    session: true
  };
  fs.writeFile(`./files/${uuid}.json`, JSON.stringify(userInfo), err => {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
    res.redirect('/admin');
  });
});

//http://localhost:3000/users/verify/19712790-5f3d-11e8-b678-dfcc6890467f
app.get('/users/verify/:token', (req, res) => {
  console.log(req.params.token);
  //open your files folder fs.readDir
  fs.readFile(`./files/${req.params.token}.json`, (err, file) => {
    if (err) console.log('Error', err);
    else {
      var file = JSON.parse(file);
      //set that document status to confirmed
      if (file.uuid === req.params.token) {
        console.log('current file uuid:', file.uuid);
        file.status = 'confirmed';
        //write file back
        fs.writeFile(
          `./files/${req.params.token}.json`,
          JSON.stringify(file),
          err => {
            if (err) {
              return console.log(err);
            }
            console.log('The email was confirmed!');
          }
        );
      }
    }
  });
  //redirect to /admin
  res.redirect('/admin');
});

// Start Server
// var port = process.env.PORT || 3000;
// app.listen(port, () => console.log('Example app listening on port 3000!'))

//======================================//

// define SSL/TLS options
let tlsEnabled = false;
let tlsOptions = {};

if (
  process.env.SSL === 'on' &&
  process.env.SSL_CERT != undefined &&
  process.env.SSL_KEY != undefined &&
  process.env.SSL_CERT != '' &&
  process.env.SSL_KEY != ''
) {
  tlsEnabled = true;

  try {
    tlsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERT)
    };

    if (process.env.SSL_CHAIN != undefined && process.env.SSL_CHAIN != '') {
      tlsOptions.ca = fs.readFileSync(process.env.SSL_CHAIN);
    }

    if (process.env.SSL_DHPARAM != undefined && process.env.SSL_DHPARAM != '') {
      tlsOptions.dhparam = fs.readFileSync(process.env.SSL_DHPARAM);
    }
  } catch (e) {
    console.error(`\n!!! ${e.message}\n`);
    console.error('=> SSL could not be enabled. Using fallback.\n');
    tlsEnabled = false;
  }
}

// start the app
app.set('port', process.env.PORT || 7777);

if (tlsEnabled === true) {
  const server = https
    .createServer(tlsOptions, app)
    .listen(app.get('port'), () => {
      console.log(`Express running with TLS → PORT ${server.address().port}`);
    });
} else {
  const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });
}

//============================================//
