var env = require('node-env-file');

try {
  env(__dirname + '/.env');
} catch (e) { }

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var validateURI = require('./URI');
var db = null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* refer to https://github.com/linuxenko/mongo-rest */
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,HEAD,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-HTTP-Method-Override');
	next();
});


/*
    @method : POST
    @param : url
*/
app.post('/', function(req,res) {
    var url = decodeURIComponent(req.body.url);

    if (!validateURI(url)) {
      return res.status(403).send('Invalid URI').end();
    }

    db.insertURI(url, function(err, id) {
      if (err) {
        return res.status(500).end();
      }
      return res.send(JSON.stringify({url : req.protocol + '://' + req.get('host') + '/' + id })).end();
    });
});

app.get(/^\/(\d+)$/, function(req, res) {
  var url = req.params[0];

  if (url === null) {
    return res.status(403).send('Wrong request').end();
  }

  db.findURI(url, function(err, URI) {
    if (err) return res.status(404).end();

    res.redirect(URI);
  });
});


app.get('/latest', function(req, res) {
  db.latestURI(function(err, data) {
    if (err) return res.status(500).end();
    res.send(JSON.stringify(data)).end();
  });
});

db = new require('./database')(function() {
  app.listen(process.env.PORT, function() {
    console.log('Application started on :' + process.env.PORT);
  });
});
