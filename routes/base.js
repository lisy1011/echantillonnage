'use strict';

var express = require('express');
// Router de base pour l'application.
var routerBase = express.Router();

// Page d'accueil.
routerBase.get('/', function (req, res) {
    res.statusCode = 200;
    //res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    //res.end('L\'application Web fonctionne bien !');
    res.sendFile('index.html',{root: "public"});
});

module.exports = routerBase;