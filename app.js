'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
//Pour crypter le mot de passe
var bcrypt = require('bcrypt');
// Module pour JWT.
var jwt = require('jsonwebtoken');

// Router de base pour l'application.
var routerBase = require('./routes/base');
// Router pour l'API REST.
var routerApi = require('./routes/api');

// Paramètres de configuration généraux.
var config = require('./config');
// Modèle Mongoose pour le Membre.
var MembreModel = require('./models/membreModel').MembreModel;

// Ajout des routers à l'application.
app.use('/', routerBase);
// L'API REST a comme route de base '/api'.
app.use('/api', routerApi);

// Ajout d'une variable globale à l'application.
app.set('jwt-secret', config.secret);

app.post('/connexion', function (req, res) {
    // trouver le membre
    MembreModel.findOne({
        nom_util: req.body.nom_util
    }, function (err, membre) {

        if (!membre) {
            res.json({
                success: false,
                message: 'Authentication Échouée. Membre non trouvé.'
            });
        } else if (membre) {
            //compare les passwords 
            bcrypt.compare(req.body.mot_passe, membre.mot_passe, function (err, comparaison) {
                if (comparaison) {
                    // Passwords match
                    var payload = {
                        membre_id: membre._id,
                        membre_nom: membre.nom_util,
                        membre_courriel: membre.courriel
                    };
                    var jwtToken = jwt.sign(payload, app.get('jwt-secret'), {
                        expiresIn: 86400 // Expiration en secondes (24 heures).
                        //expiresIn: 10 // Permet de vérifier que le jeton expire très rapidement.
                    });

                    // réponse
                    res.json({
                        success: true,
                        mem_id: membre._id,
                        message: 'Enjoy your token!!!!',
                        token: jwtToken
                    });
                } else {
                    // Passwords match pas
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                    res.status(400).end();
                }
            });

        }

    });
});


var port = process.env.PORT || 8090;
app.listen(port, function () {
    console.log('Serveur Node.js à l\'écoute sur le port %s ', this.address().port);
});