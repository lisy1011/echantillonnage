var express = require('express');
// Router pour l'API REST.
var routerApi = express.Router();
// ORM Mongoose.
var mongoose = require('mongoose');
// Connexion à MongoDB avec Mongoose.
mongoose.connect('mongodb://localhost:27017/data-collections', {
    //useMongoClient: true,
    useNewUrlParser: true,
    poolSize: 10
});

// Modèle Mongoose pour les Coordonnées du lieu choisi.
var CoordonneeModel = require('../models/membreModel').CoordonneeModel;

// Modèle Mongoose pour le Lieu (y compris lieu sans collection).
var LieuModel = require('../models/membreModel').LieuModel;

// Modèle Mongoose pour les collections crées.
var CollectionCreeModel = require('../models/membreModel').CollectionCreeModel;

// Modèle Mongoose pour les Collections dont on a reçu le partage.
var CollectionInviteModel = require('../models/membreModel').CollectionInviteModel;

// Modèle Mongoose pour le Membre.
var MembreModel = require('../models/membreModel').MembreModel;

// Modèle Mongoose pour le compteur.
var CompteurModel = require('../models/compteurModel').CompteurModel;

const COMPTEUR_ID_MEMBRE = 0;
const COMPTEUR_ID_COLLECTION = 1;
const COMPTEUR_ID_LIEU = 2;


// Ajout d'un middleware qui intercepte toutes les requêtes;
// exécuté lors de chaque requête faite à l'API.
routerApi.use(function (req, res, next) {
    'use strict';
    // Log de chaque requête faite à l'API.
    console.log(req.method, req.url);
    // On pourrait valider le jeton d'accès ici !

    // Permet de poursuivre le traitement de la requête.
    next();
});




// Racine de l'API.
routerApi.get('/', function (req, res) {
    'use strict';
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('L\'API fonctionne bien !');
});

// Route désignant un certain Membre 
// ==================================

    // Creation d'un certain lieu.
    routerApi.route('/membres')

    // Récupération de tous les pokémons.
    .get(function (req, res) {
        'use strict';
        console.log('Récupération de tous les membres.');

        MembreModel.find({}, function (err, membres) {
            if (err) throw err;
            res.json(membres);
        
        });
    });

    routerApi.route('/membres/:noMem')
    .get(function (req, res) {
        'use strict';
        //verification du membre
       // if (req.params.noMem === req.decoded._id) {
            // Tentative de récupération du membre concerné.            
            MembreModel.findById(req.params.noMem).select('-__v -mot_passe').exec(function (err, membre) {
                if (err) {
                    console.log('Erreur, lors de consultation de la base de données.');
                    res.status(400).end();
                    return;
                }

                if (membre === null) {
                    console.log("Le membre no." + req.params.noMem + " n'existe pas dans la base de données.");
                    res.status(404).json("Le membre no." + req.params.noMem + " n'existe pas dans la base de données.").end();
                    return;
                } else {
                    //Si le membre existe
                    res.location(req.protocol + '://' + req.get('host') + req.originalUrl);
                    res.json(membre);
                }
            });
       /*   } else {
            res.status(405).json("Erreur, Vous n'avez pas acces.").end();
            return;
        }  */
    })
// Création d'un nouveau membre.
.post(function (req, res) {
    'use strict';
    console.log('Creation d\'un nouveau membre');

    if (req.body.nom_util === null || req.body.courriel === null || req.body.mot_passe === null) {
        console.log("Erreur, données manquantes. 'nom_utilisateur', 'courriel' et 'mot_passe' sont obligatoires");
        res.status(400).end();
        return;
    }

    if (typeof (req.body.nom_utilisateur) === 'undefined' || typeof (req.body.courriel) === 'undefined' || typeof (req.body.mot_passe) === 'undefined') {
        console.log("Erreur, données manquantes. 'nom_utilisateur', 'courriel' et 'mot_passe' sont obligatoires");
        res.status(400).end();
        return;
    }

    if (req.body.nom_utilisateur.trim().length === 0 || req.body.courriel.trim().length === 0 || req.body.mot_passe.trim().length === 0) {
        console.log("Erreur, données manquantes. 'nom_utilisateur', 'courriel' et 'mot_passe' ne peuvent pas etre vides");
        res.status(400).end();
        return;
    }

    // On verifie si le membre existe deja
    MembreModel.findOne({
        'nom_util': req.body.nom_utilisateur
    }, function (err, memReponse) {
        // Si le nom dèutilisateur existe deja dans la base des donnees, on retourne un erreur.
        if (memReponse !== null) {
            console.log("Erreur, membre existant");
            res.status(400).end();
            return;
        }
        var membre = new MembreModel();
        // On met l'ID du membre à zéro par default
        membre._id = 0;
        CompteurModel.findByIdAndUpdate({
            _id: COMPTEUR_ID_MEMBRE
        }, {
            $inc: {
                seq: 1
            }
        }, {
            "upsert": true,
            "new": true
        }, function (err, counter) {
            if (err) {
                console.log("Erreur de base des données pour la gestion du compteurs COMPTEUR_ID_MEMBRE: " + err);
                res.status(400).end();
                return;
            }
            // Si le compteur est nul ça veut dire que c'est la première fois
            // qu'on l'utilise, donc on doit l'initialiser.    
            if (counter === null) {
                counter = new CompteurModel();
                counter._id = COMPTEUR_ID_MEMBRE;
                counter.seq = 1;
                counter.save(function (err) {
                    if (err) {
                        console.log("Erreur de base des donnees pour la creation du compteur COMPTEUR_ID_MEMBRE: " + err);
                        res.status(400).end();
                        return;
                    }
                });
            }
            // On assigne l'ID du membre selon la dernière séquence du compteur MEMBRE
            membre._id = counter.seq;
        });
        membre.nom_utilisateur = req.body.nom_utilisateur;
        membre.courriel = req.body.courriel;
        membre.mot_passe = req.body.mot_passe;
        // On enregistre le nouveau membre dans la base des données
        membre.save(function (err) {
            if (err) {
                console.log("Erreur lors de la création du membre: " + err);
                res.status(400).end();
                return;
            }
            // On obtient le membre de la base des données avec seulement les champs nécessaires pour le retour JSON
            MembreModel.findById(membre._id).select('-collections -col_ext_accessibles -lieux_non_classes -__v -mot_passe').exec(function (err, memReponse) {
                res.location(req.protocol + '://' + req.get('host') + req.originalUrl + membre._id);
                res.status(201).json(memReponse);
                return;
            });
        });
    });
})

    //Méthode HTTP non permise
    .all(function (req, res) {
        'use strict';
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });

 

// Route pour créer ou consulter les lieux 
// ==================================
// Route pour créer ou consulter les lieux 
// ==================================
routerApi.route('/membres/:mem_id/lieux_non_classes')

    // Création d'un nouveau lieu.
    .post(function (req, res) {
        'use strict';
      //  if (req.params.mem_id ===req.decoded._id) {
            console.log('Création d\'un nouveau lieu');

            MembreModel.findById(req.params.mem_id, function (err, membre) {
                if (err) {
                    console.log("Erreur lors de la consultation du Membre " + req.params.mem_id + ": " + err);
                    res.status(400).end();
                    return;
                }
                if (membre === null) {
                    console.log("Erreur lors de la creation du lieu, Membre " + req.params.mem_id + " inexistant: " + err);
                    res.status(400).end();
                    return;
                }

                var lieu = new LieuModel();
                lieu._id = 0;
                CompteurModel.findByIdAndUpdate({
                    _id: COMPTEUR_ID_LIEU
                }, {
                    $inc: {
                        seq: 1
                    }
                }, {
                    "upsert": true,
                    "new": true
                }, function (err, counter) {
                    if (err) {
                        console.log("Erreur de base des données pour la gestion du compteur COMPTEUR_ID_LIEU: " + err);
                        res.status(400).end();
                        return;
                    }

                    // Si le compteur est nul ça veut dire que c'est la première fois qu'on l'utilise,
                    // donc on doit l'initialiser    
                    if (counter === null) {
                        counter = new CompteurModel();
                        counter._id = COMPTEUR_ID_LIEU;
                        counter.seq = 1;
                        counter.save(function (err) {
                            if (err) {
                                console.log("Erreur de base des données pour la création du compteur COMPTEUR_ID_LIEU: " + err);
                                res.status(400).end();
                                return;
                            }
                        });
                    }

                    // On assigne l'ID du membre selon la dernière séquance du compteur LIEU
                    lieu._id = counter.seq;
                    lieu.nom = req.body.nom;
                    lieu.date_creation = req.body.date_creation;
                    lieu.type_lieu = req.body.type_lieu;

                    for (var coord in req.body.coordonnees) {
                        var coordonnee = new CoordonneeModel();
                        coordonnee.latitude = req.body.coordonnees[coord].latitude;
                        coordonnee.longitude = req.body.coordonnees[coord].longitude;
                        lieu.coordonnees.push(coordonnee);
                    }

                    if (req.body.infos !== null) {
                        lieu.infos = req.body.infos;
                    }

                    membre.lieux_non_classes.push(lieu);
                    membre.save(function (err) {
                        if (err) {
                            console.log("Erreur de base des données lors de la creation du lieu: " + err);
                            res.status(400).end();
                            return;
                        }
                     //   res.location(req.protocol + '://' + req.get('host') + req.originalUrl + "/" + lieu._id);
                        res.status(201).json(lieu);
                    });

                });
            });
       /*  } else {
            res.status(405).json("Erreur, Vous n'avez pas acces.").end();
            return;
        } */
    });


//================================================
// Route pour consulter un lieu particulier 
// ==================================
routerApi.route('/membres/:mem_id/lieux_non_classes/:lieu_id')
    .delete(function (req, res) {
        'use strict';
      //  if (req.params.mem_id === req.decoded._id) {
            // Tentative de récupération du membre concerné.
            MembreModel.findById(req.params.mem_id, function (err, membre) {
                if (err) {
                    console.log('Erreur, ce membre n\'existe pas');
                    res.status(400).end();
                }
                //Si le membre existe
                if (membre !== null) {
                    var lieuTrouve = false;
                    var mesLieux = membre.lieux_non_classes;
                    for (var i = 0; i < mesLieux.length; i++) {
                        if (mesLieux[i]._id === parseInt(req.params.lieu_id)) {
                            membre.lieux_non_classes.remove(mesLieux[i]);
                            lieuTrouve = true;
                            break;
                        }
                    }

                    if (lieuTrouve === false) {
                        var mesCollections = membre.collections;
                        for (var j = 0; j < mesCollections.length; j++) {
                            var mesLieuxCol = mesCollections[j].lieux;
                            for (var k = 0; k < mesLieuxCol.length; k++) {
                                if (mesLieuxCol[k]._id === parseInt(req.params.lieu_id)) {
                                    membre.collections[j].lieux.remove(mesLieuxCol[k]);
                                    lieuTrouve = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (lieuTrouve) {
                        MembreModel.findByIdAndUpdate(req.params.mem_id, membre, function (err) {
                            if (err) {
                                console.log('Erreur lors de l\'enregistrement du membre :' + err);
                                res.status(400).end();
                                return;
                            }
                            res.status(204).end();
                        });
                    } else {
                        console.log('Erreur lors de l\'effacement du lieu. Lieu ' + req.params.lieu_id + ' non trouvé dans le membre ' + req.params.mem_id);
                        res.status(400).end();
                        return;
                    }
                } else {
                    console.log('Le membre no. ' + req.params.mem_id + "  n'existe pas");
                    res.status(400).end();
                    return;
                }
            });
       /*  } else {
            res.status(405).json("Erreur, Vous n'avez pas acces.").end();
            return;
        } */
    })

    // Méthode HTTP non permise
    .all(function (req, res) {
        'use strict';
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });

//Route pour enlever un lieu d'une collection et le rendre
//non classé.
routerApi.route('/membres/:mem_id/lieux_non_classes/:lieu_id')
.put(function (req, res) {
    'use strict';
    //Vérification si le membre a les accès:
    //if (req.params.mem_id === req.decoded._id) {
        // Tentative de récupération du membre concerné.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log('Erreur, ce membre n\'existe pas');
                res.status(400).end();
            }
            //Si le membre existe
            if (membre !== null) {
                //Le lieu à mettre non classé
                var lieuSansCollection = null;
                //Parcourir les collections:
                for (var i = 0; i < membre.collections_crees.length; i++) {
                //Parcourir les lieux de la collection
                for (var j = 0; j < membre.collections_crees[i].lieux.length; j++) {
                    if (membre.collections_crees[i].lieux[j]._id === parseInt(req.params.lieu_id)) {
                        lieuSansCollection = membre.collections_crees[i].lieux[j];
                       //Enregistrement du lieu dans la liste des non classés:
                        //membre.lieux_non_classes.push(lieuSansCollection);
                        //Suppression du lieu de la collection initiale:
                        membre.collections_crees[i].remove(lieuSansCollection);
                        break;
                    }
                }
            }

                if (lieuSansCollection === null || typeof (lieuSansCollection) === 'undefined') {
                    console.log("Erreur, ce lieu n'\existe pas");
                    res.status(400).end();
                    return;
                }

               membre.lieux_non_classes.push(lieuSansCollection);
                //membre.collections_crees.remove(lieuSansCollection);
                membre.save(function (err) {
                    if (err) {
                        console.log("Erreur de base des données lors de la modification du lieu: " + err);
                        res.status(400).end();
                        return;
                    }
                 //   res.location(req.protocol + '://' + req.get('host') + req.originalUrl + "/" + lieu._id);
                    res.status(201).json(lieuSansCollection);
                });
               
            } else {
                console.log('Le membre no. ' + req.params.mem_id + "  n'existe pas");
                res.status(404).end();
            }

        });
   /*  } else {
        res.status(405).json("Erreur, Vous n'avez pas acces.").end();
        return;
    } */
})

// Méthode HTTP non permise
.all(function (req, res) {
    'use strict';
    console.log('Méthode HTTP non permise.');
    res.status(405).end();
});







// Rendre l'objet router disponible de l'extérieur.
module.exports = routerApi;