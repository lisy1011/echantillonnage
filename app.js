'use strict';

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Router de base pour l'application.
var routerBase = require('./routes/base');

// Router pour l'API REST.
var routerApi = require('./routes/api');

// Ajout des routers à l'application.
//app.use('/', routerBase);
// L'API REST a comme route de base '/api'.
app.use('/', routerApi);

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Serveur Node.js à l\'écoute sur le port %s ', this.address().port);
});