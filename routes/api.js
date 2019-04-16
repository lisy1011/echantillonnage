'use strict';
var express = require('express');
// Router pour l'API REST.
var routerApi = express.Router();
// ORM Mongoose.
var mongoose = require('mongoose');
// Connexion à MongoDB avec Mongoose.
mongoose.connect('mongodb://localhost:27017/jeu_de_donnees', {
    //useMongoClient: true,
    useNewUrlParser: true,
    poolSize: 10
});
//==============================
function recupererCollectionsCrees(res, mem_id, col_id) {
    var uneCollection=new CollectionCreeModel();
    // On obtient la collection du membre de la base des données avec seulement les champs nécessaires pour le retour JSON
    MembreModel.findById(mem_id, function (err, membreInv) {
        if (err) {
            console.log('Erreur de la BD lors de la consulation du membre: ' + err);
            res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
        }
       
        if (membreInv !== null ) {
            for (var i = 0; i < membreInv.collections_crees.length; i++) {
               
                if (membreInv.collections_crees[i]._id === parseInt(col_id)) {
                    var unId=membreInv.collections_crees[i]._id;
                    uneCollection= membreInv.collections_crees.findById(unId,membreInv.collections_crees[i]);
                    break;
                }
            }
            membreInv.save(function (err) {
                if (err) {
                    console.log('Erreur de la BD lors de la consulation du membre: ' + err);
                    res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
                }
            });
        } else {
            console.log('Erreur de la BD lors de la consulation du membre: ' + err);
            res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
        }
    });
    return uneCollection;
}



//============================
// Modèle Mongoose pour les Coordonnées du lieu choisi.
var CoordonneeModel = require('../models/membreModel').CoordonneeModel;

// Modèle Mongoose pour le Lieu (y compris lieu sans collection).
var LieuModel = require('../models/membreModel').LieuModel;

// Modèle Mongoose pour les collections crées.
var CollectionCreeModel = require('../models/membreModel').CollectionCreeModel;

// Modèle Mongoose pour les Collections dont on a reçu le partage.
var CollectionInviteeModel = require('../models/membreModel').CollectionInviteeSchema;

// Modèle Mongoose pour le Membre.
var MembreModel = require('../models/membreModel').MembreModel;

// Modèle Mongoose pour le compteur.
var CompteurModel = require('../models/compteurModel').CompteurModel;

const COMPTEUR_ID_MEMBRE = 0;
//const COMPTEUR_ID_COLLECTION = 1;
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
        console.log('Récupération de tous les membres.');

        MembreModel.find({}, function (err, membres) {
            if (err) throw err;
            res.json(membres);
        
        });
    });

    routerApi.route('/membres/:noMem')
    .get(function (req, res) {
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
// Route pour supprimer un lieu particulier 
// ===============================================
routerApi.route('/membres/:mem_id/lieux_non_classes/:lieu_id')
    .delete(function (req, res) {
        
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
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });

//Route pour enlever un lieu d'une collection et le rendre
//non classé.
routerApi.route('/membres/:mem_id/lieux_non_classes/:lieu_id')
.put(function (req, res) {
    //'use strict';
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
                        membre.lieux_non_classes.push(lieuSansCollection);
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

               //membre.lieux_non_classes.push(lieuSansCollection);
                //membre.collections_crees.remove(lieuSansCollection);
               membre.save(function (err) {
               // MembreModel.findByIdAndUpdate(req.params.mem_id, membre, function (err) {
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
    console.log('Méthode HTTP non permise.');
    res.status(405).end();
});



//Route pour ajouter un lieu à une collection
/* routerApi.route('/membres/mem_id/collections/:collection_id/lieux/lieu_id')
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
                //Vérification si la collection existe:
                var uneCollection = null;
               
                //Parcourir les collections:
                for (var i = 0; i < membre.collections_crees.length; i++) {
                //Parcourir les collections du membres
                if(membre.collections_crees[i]._id===parseInt(req.params.collection_id)){
                 uneCollection=membre.collections_crees[i];
                 break;
                }
                
            }

                if (uneCollection === null || typeof (uneCollection) === 'undefined') {
                    console.log("Erreur, cette collection n'\existe pas");
                    res.status(400).end();
                    return;
                }

               //Vérification si le lieu existe:
               //Parcourir les lieux non classés:
               var unLieu=null;
               for (var j = 0; j < membre.lieux_non_classes.length; j++) {
                //Parcourir les collections du membres
                if(membre.lieux_non_classes[j]._id===parseInt(req.params.lieu_id)){
                 unLieu=membre.lieux_non_classes[j];
                 uneCollection.push(unLieu);
                 membre.lieux_non_classes[j].remove(unLieu);
                 break;
                }
                
            }

            if (unLieu === null || typeof (unLieu) === 'undefined') {
                console.log("Erreur, ce lieu n'\existe pas");
                res.status(400).end();
                return;
            }
               membre.save(function (err) {
               // MembreModel.findByIdAndUpdate(req.params.mem_id, membre, function (err) {
                    if (err) {
                        console.log("Erreur de base des données lors de la modification du lieu: " + err);
                        res.status(400).end();
                        return;
                    }
                 //   res.location(req.protocol + '://' + req.get('host') + req.originalUrl + "/" + lieu._id);
                    res.status(201).json(unLieu);
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
//})
// Méthode HTTP non permise
/*.all(function (req, res) {
    'use strict';
    console.log('Méthode HTTP non permise.');
    res.status(405).end();
});
 */

 // Route pour ajouter un lieu à une collection.
//==================================================
routerApi.route('/membres/:mem_id/collections/:col_id/lieux/:lieu_id')

.put(function (req, res) {
    
  //  if (req.params.mem_id == req.decoded._id) {
        // Vérification si le membre existe.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log('Erreur, ce membre n\'existe pas');
                res.status(400).end();
            }
            //Si le membre existe
            if (membre !== null) {
                var uneCollection = null;
                //Parcours de la liste des collections du membre
                //pour vérifier si la collection existe:
                for (var i = 0; i < membre.collections_crees.length; i++) {
                    if (membre.collections_crees[i]._id === parseInt(req.params.col_id)) {
                        uneCollection = membre.collections_crees[i];
                        break;
                    }
                }
                 //Si la collection n'existe pas:
                if (uneCollection === null || typeof (uneCollection) === 'undefined') {
                    console.log("Erreur, cette collection n'\existe pas !");
                    res.status(400).end();
                    return;
                }
                //La collection existe, on vérifie le lieu
               // var lieuTrouve = false;
                var unLieu=null;
                for (var j = 0; j < membre.lieux_non_classes.length; j++) {
                    if (membre.lieux_non_classes[j]._id === parseInt(req.params.lieu_id)) {
                        unLieu=membre.lieux_non_classes[j];
                        uneCollection.lieux.push(unLieu);
                        membre.lieux_non_classes.remove(unLieu);
                       // lieuTrouve = true;

                        break;
                    }
                }
                 
                //Si le lieu n'existe pas:
                 if (unLieu === null || typeof (unLieu) === 'undefined') {
                    console.log('Erreur, lieu ' + req.params.lieu_id + ' inexistant');
                    res.status(400).json('Erreur, lieu ' + req.params.lieu_id + ' inexistant').end();
                    return;
                }
   
               //Le lieu est trouvé, on enregistre:
                    membre.save(function (erreur) {
                        if (erreur) {
                            console.log('Erreur lors de l\'enregistrement du membre');
                            res.status(400).end();
                            return;
                        }
                        res.status(200).end();
                        return;
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
    console.log('Méthode HTTP non permise.');
    res.status(405).end();
});

//*************************************** */
//=========Routes pour les collections====//
//*************************************** */


routerApi.route('/membres/:mem_id/collections')
//-----------------------------------
// Retourner toutes les collections
//-----------------------------------
.get(function (req, res) {
    //  if (req.params.mem_id == req.decoded._id) {
          // Vérification si le membre existe.
          MembreModel.findById(req.params.mem_id, function (err, membre) {
              if (err) {
                  console.log('Erreur, ce membre n\'existe pas');
                  res.status(400).end();
              }
              //Si le membre existe
              if (membre !== null) {
                  var lstCollections=[];
                console.log('Récupération de toutes les collections crées du membre.');

                    for (var i = 0; i < membre.collections_crees.length; i++) {
                      lstCollections.push(membre.collections_crees[i]);
                    }
                    //***************************************** */
                    //Il manque les collections invité
                    // C'est une autre route.
                    //****************************************** */
                    res.json(lstCollections);
                   
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

//------------------------------------
// Permet à un membre ayant mem_id 
// de créer une collection.
//------------------------------------
.post(function (req, res) {

  //  if (req.params.mem_id == req.decoded._id) {
        // Tentative de récupération du membre concerné.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log("Erreur lors de la consultation du membre: " + err);
                res.status(404).send("Bad request");
                return;
            }

            if (membre === null) {
                console.log('Le membre no. ' + req.params.mem_id + "  n'existe pas");
                res.status(404).send("Bad request");
                return;
            }
            var collection = new CollectionCreeModel(req.body);
            console.log(collection.validateSync()===null,req.body);

            if(collection.validateSync() !== undefined){
                console.log("Erreur, membre inexistant", collection.validateSync());
                res.status(400).send("Membre invalide");
                return;
            }

            collection.nom = req.body.nom;
            collection.lieux = []; //|| req.body.lieux;
            collection.partagee_avec = []; // || req.body.partagee_avec;
            membre.collections_crees.push(collection);
            membre.update(collection);
            membre.save(function (err) {
                if (err) {
                            console.log("Erreur lors de l'enregistrement du Membre avec la nouvelle collection: " + err);
                            res.status(500).send("Erreur serveur");  
                        }
                        //res.location(req.protocol + '://' + req.get('host') + req.originalUrl + "/" + collection._id);
                        res.status(201).json(collection);
                    });
            
            // Si le membre existe
            
                //var collection = new CollectionCreeModel();
                
                // On assigne _id à zéro par default
                /*collection._id = 0;
                CompteurModel.findByIdAndUpdate({
                    _id: COMPTEUR_ID_COLLECTION
                }, {
                    $inc: {
                        seq: 1
                    }
                }, {
                    "upsert": true,
                    "new": true
                }, function (err, counter) {
                    if (err) {
                        console.log("Erreur de base des données pour la gestion du compteur COMPTEUR_ID_COLLECTION: " + err);
                        res.status(400).end();
                        return;
                    } */
                    // Si le compteur est nul ça veut dire que c'est la première fois qu'on l'utilise,
                    // donc on doit l'initialiser    
                    /* if (counter === null) {
                        counter = new CompteurModel();
                        counter._id = COMPTEUR_ID_COLLECTION;
                        counter.seq = 1;
                        counter.save(function (err) {
                            if (err) {
                                console.log("Erreur de base des données pour la création du compteur COMPTEUR_ID_COLLECTION: " + err);
                                res.status(400).end();
                                return;
                            }
                        });
                    } 
                    // On assigne l'ID du membre selon la dernière séquence du compteur MEMBRE
                    collection._id = counter.seq;

                    collection.nom = req.body.nom;
                    collection.lieux = [];
                    collection.partagee_avec = [];
                    membre.collections_crees.push(collection);
                    membre.save(function (err) {
                        if (err) {
                            console.log("Erreur lors de l'enregistrement du Membre avec la nouvelle collection: " + err);
                            res.status(400).end();
                            return;
                        }
                        //res.location(req.protocol + '://' + req.get('host') + req.originalUrl + "/" + collection._id);
                        res.status(201).json(collection);
                        return;
                    });
                });*/
            
        });
    /* } else {
        res.status(405).json("Erreur, Vous n'avez pas acces.").end();
        return;
    } */
})
// Méthode HTTP non permise
.all(function (req, res) {
    
    console.log('Méthode HTTP non permise.');
    res.status(405).end();
});

routerApi.route('/membres/:mem_id/collectionsInvitees')
//------------------------------------------
// Retourner toutes les collections invitées
//------------------------------------------
.get(function (req, res) {
    //  if (req.params.mem_id == req.decoded._id) {
          // Vérification si le membre existe.
          MembreModel.findById(req.params.mem_id, function (err, membre) {
              if (err) {
                  console.log('Erreur, ce membre n\'existe pas');
                  //res.status(400).end();
                  res.status(404).send("membre inexistant");
                  return;
              }

              //Si le membre n'existe pas
             /* if (membre === null) {
                //console.log("Erreur, membre inexistant");
                console.log('Le membre no. ' + req.params.mem_id + "  n'existe pas");
                res.status(404).send("Bad request");
                return;
             }*/
              //Si le membre existe
              if (membre !== null) {
                var lstCollectionsInvitees=[];
                console.log('Récupération de toutes les collections invitées du membre.');

               /*  for (var i = 0; i < membre.collections_invitees.length; i++) {
                    lstCollectionsInvitees.push(membre.collections_invitees[i]);
                    
                } */

                //Parcours du tableau des collections invitée
                //pour chercher les collection créées par les membres
                //dont le id est dans collections_invitees
                for (var j = 0; j < membre.collections_invitees.length; j++) {
                    var idMem=membre.collections_invitees[j].id_createur;
                    var idColl=membre.collections_invitees[j].id_collection;
                     var uneCollection=recupererCollectionsCrees(res, idMem, idColl);
                    lstCollectionsInvitees.push(uneCollection);
                  }

                
                res.json(lstCollectionsInvitees);
                   
              } else {
                  console.log('Le membre no. ' + req.params.mem_id + "  n'existe pas");
                  res.status(404).end();
              }
  
          });
     /*  } else {
          res.status(405).json("Erreur, Vous n'avez pas acces.").end();
          return;
      } */
});

routerApi.route('/membres/:mem_id/collections/:collection_id')
//--------------------------------------------
// Permet à un membre ayant mem_id comme identifiant de 
// détruire une collection ayant collection_id pour identifiant.
//--------------------------------------------
.delete(function (req, res) {
    //if (req.params.mem_id == req.decoded._id) {
        // Tentative de récupération du membre concerné.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log('Erreur, lors de consultation de la base de données.');
                res.status(400).end();
                return;
            }

            if (membre === null) {
                console.log("Erreur, le membre no." + req.params.mem_id + " n'existe pas.");
                res.status(404).end();
            } else {

                var mesCollections = membre.collections_crees;

                for (var i = 0; i < mesCollections.length; i++) {
                    if (mesCollections[i]._id === parseInt(req.params.collection_id)) {
                        // On efface les liens de la collection si elle est partagée avec d'autres membres
                        for (var j = 0; j < mesCollections[i].partagee_avec.length; j++) {
                            supprimerCollectionsInvitees(res, mesCollections[i].partagee_avec[j], parseInt(req.params.collection_id));
                        }
                        membre.collections_crees.remove(mesCollections[i]);
                        break;  
                    }
                }
                MembreModel.findByIdAndUpdate(req.params.mem_id, membre, function (err) {
                    if (err) {
                        console.log('Consultation du membre no : ' + req.params.mem_id + " error");
                        res.status(400).end();
                    }
                    // Si suppression réussie.
                    res.status(204).end();
                });
            }
        });
    /* } else {
        res.status(405).json("Erreur, Vous n'avez pas acces.").end();
        return;
    } */
})

// Méthode HTTP non permise
.all(function (req, res) {
    //'use strict';
    console.log('Méthode HTTP non permise.');
    res.status(405).end();
});

/*function recupererCollectionsCrees(res, mem_id, col_id) {
    var uneCollection= new CollectionCreeModel();
    // On obtient la collection du membre de la base des données avec seulement les champs nécessaires pour le retour JSON
    MembreModel.findById(mem_id, function (err, membreInv) {
        if (err) {
            console.log('Erreur de la BD lors de la consulation du membre: ' + err);
            res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
        }
       
        if (membreInv !== null ) {
            for (var i = 0; i < membreInv.collections_crees.length; i++) {
                if (membreInv.collections_crees[i].id_collection === col_id) {
                    uneCollection= membreInv.collections_crees.find(membreInv.collections_crees[i]);
                    break;
                }
            }
            membreInv.save(function (err) {
                if (err) {
                    console.log('Erreur de la BD lors de la consulation du membre: ' + err);
                    res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
                }
            });
        } else {
            console.log('Erreur de la BD lors de la consulation du membre: ' + err);
            res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
        }
    });
    return uneCollection;
}*/

function supprimerCollectionsInvitees(res, mem_id, col_id) {

    // On obtient la collection du membre de la base des données avec seulement les champs nécessaires pour le retour JSON
    MembreModel.findById(mem_id, function (err, mem) {
        if (err) {
            console.log('Erreur de la BD lors de la consulation du membre: ' + err);
            res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
        }
        if (mem !== null && typeof (mem) !== 'undefined') {
            for (var i = 0; i < mem.collections_invitees.length; i++) {
                if (mem.collections_invitees[i].id_collection === col_id) {
                    mem.collections_invitees.remove(mem.collections_invitees[i]);
                    break;
                }
            }
            mem.save(function (err) {
                if (err) {
                    console.log('Erreur de la BD lors de la consulation du membre: ' + err);
                    res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
                }
            });
        } else {
            console.log('Erreur de la BD lors de la consulation du membre: ' + err);
            res.status(400).json('Erreur de la BD lors de la consulation du membre: ' + err).end();
        }
    });
}



// Rendre l'objet router disponible de l'extérieur.
module.exports = routerApi;