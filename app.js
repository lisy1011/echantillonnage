'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Router de base pour l'application.
var routerBase = require('./routes/base');
// Router pour l'API REST.
var routerApi = require('./routes/api');

// Ajout des routers à l'application.
app.use('/', routerBase);
// L'API REST a comme route de base '/api'.
app.use('/api', routerApi);

var port = process.env.PORT || 8090;  
app.listen(port, function () {
    console.log('Serveur Node.js à l\'écoute sur le port %s ', this.address().port);
});
