'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set('jwt-secret', 'config');
var jwt = require('jsonwebtoken');
var ObjectID = require('mongodb').ObjectID;
var MembreModel = require('./models/membreModel').MembreModel;


// Router de base pour l'application.
var routerBase = require('./routes/base');
// Router pour l'API REST.
var routerApi = require('./routes/api');

// Ajout des routers à l'application.
app.use('/', routerBase);
// L'API REST a comme route de base '/api'.
app.use('/api', routerApi);

routerBase.route('/connexion')
    .post(function (req, res) {
        // Faire une requête et avant la connexion à la base de données pour obtenir les infos du membre.
        var mdp = req.body.mot_de_passe;
        MembreModel.find({
            nom_util: req.body.nom_util,
            mot_passe: mdp
        }, function (err, membre) {
            if (err) throw err;
            if (membre) {
                var payload = {
                    membre_id: membre[0].id,
                    membre_nom: membre[0].nom_util,
                    membre_courriel: membre[0].courriel
                };
                var jwtToken = jwt.sign(payload, app.get('jwt-secret'), {
                    expiresIn: 86400 // Expiration en secondes (24 heures).
                    //expiresIn: 10 // Permet de vérifier que le jeton expire très rapidement.
                });
                res.json({
                    "token": jwtToken
                });
            } else
                res.status(400).end();
        });
    })
    //Méthode HTTP non permise
    .all(function (req, res) {

        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });

var port = process.env.PORT || 8090;  
app.listen(port, function () {
    console.log('Serveur Node.js à l\'écoute sur le port %s ', this.address().port);
});
