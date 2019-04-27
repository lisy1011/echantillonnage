'use strict';
var express = require('express');
var app = express();
// Router pour l'API REST.
var routerApi = express.Router();
var jwt = require('jsonwebtoken');
//Pour crypter le mot de passe
var bcrypt = require('bcrypt');
// ORM Mongoose.
var mongoose = require('mongoose');
var async = require('async');
// Connexion à MongoDB avec Mongoose.
mongoose.connect('mongodb://localhost:27017/jeu_de_donnees', {
    //useMongoClient: true,
    useNewUrlParser: true,
    poolSize: 10
});



// Ajout d'un middleware qui intercepte toutes les requêtes.
routerApi.use(function (req, res, next) {
    // Validation du token.
    var auth = req.headers.Authorization || req.headers.authorization;
   if(req.url!=='/membres'){
    if (!auth) {
        // Pas de token (donc, pas connecté).
        res.status(401).end();
    } else {
        // Structure de l'en-tête "Authorization" : "Bearer jwt"
        var authArray = auth.split(' ');
        if (authArray.length !== 2) {
            // Mauvaise structure pour l'en-tête "Authorization".
            res.status(401).end();
        } else {
            // Le token est après l'espace suivant "Bearer".
            var token = authArray[1];
            // Pour le déboggage.
            console.log('Token  = ' + token);

            // Vérification du token.
            jwt.verify(token, req.app.get('jwt-secret'), function (err, tokenDecoded) {
                if (err) {
                    // Token invalide.
                    return res.status(401).end();
                } else {
                    // Token valide.
                    // Sauvegarde du jeton décodé dans la requête pour usage ultérieur.
                    req.token = tokenDecoded;
                    // Poursuite du traitement de la requête.
                    next();
                }
            });
        }
    }
} else {
    next();
}//fin test
});


// Modèle Mongoose concernant les Coordonnées d'un.
var CoordonneeModel = require('../models/membreModel').CoordonneeModel;

// Modèle Mongoose concernant un Lieu.
var LieuModel = require('../models/membreModel').LieuModel;

// Modèle Mongoose pour une collection crée.
var CollectionCreeModel = require('../models/membreModel').CollectionCreeModel;

// Modèle Mongoose concernant une collection invité.
var CollectionInviteModel = require('../models/membreModel').CollectionInviteModel;

// Modèle Mongoose pour le Membre.
var MembreModel = require('../models/membreModel').MembreModel;

// Modèle Mongoose concernant un comteur.
var CompteurModel = require('../models/compteurModel').CompteurModel;

var MEMBRE_CPT_ID = 0;
var COLL_CPT_ID = 1;
var LIEU_CPT_ID = 2;




//Racine de l'API.
routerApi.get('/', function (req, res) {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('L\'API fonctionne bien !');
});




//*********************************************** */
//*******************Membres********************* */
//*********************************************** */
//---------------CRÉATION D'UN MEMBRE------------
// Route désignant une resource Membre 
// ==================================
routerApi.route('/membres')

    // Création d'un nouveau membre.
    .post(function (req, res) {
        console.log('Creation d\'un nouveau membre');

        if (req.body.nom_util === null || req.body.courriel === null || req.body.mot_passe === null) {
            console.log("Erreur, 'nom_utilisateur', 'courriel' et 'mot_passe' sont requis");
            res.status(400).end();
            return;
        }

        if (typeof (req.body.nom_util) === 'undefined' || typeof (req.body.courriel) === 'undefined' || typeof (req.body.mot_passe) === 'undefined') {
            console.log("Erreur, 'nom_utilisateur', 'courriel' et 'mot_passe' sont requis");
            res.status(400).end();
            return;
        }

        if (req.body.nom_util.trim().length === 0 || req.body.courriel.trim().length === 0 || req.body.mot_passe.trim().length === 0) {
            console.log("Erreur, 'nom_utilisateur', 'courriel' et 'mot_passe' sont requis");
            res.status(400).end();
            return;
        }

        // Vérification de l'existence du membre
        MembreModel.findOne({
            'nom_util': req.body.nom_util
        }, function (err, resultat) {
            // Erreur si le nom du membre existe deja dans la bd.
            if (resultat !== null) {
                console.log("Erreur, ce membre existe déjà !");
                res.status(400).end();
                return;
            }
            var membre = new MembreModel();
            // Par defaut id=0 
            membre._id = 0;
            CompteurModel.findByIdAndUpdate({
                _id: MEMBRE_CPT_ID
            }, {
                $inc: {
                    seq: 1
                }
            }, {
                "upsert": true,
                "new": true
            }, function (err, cpt) {
                if (err) {
                    console.log("Erreur de bd concernant les compteurs MEMBRE_CPT_ID: " + err);
                    res.status(400).end();
                    return;
                }
                // Initialisation du compteur s'il est null
              
                if (cpt === null) {
                    cpt = new CompteurModel();
                    cpt._id = MEMBRE_CPT_ID;
                    cpt.seq = 1;
                    cpt.save(function (err) {
                        if (err) {
                            console.log("Erreur de bd concernant les compteurs MEMBRE_CPT_ID: " + err);
                            res.status(400).end();
                            return;
                        }
                    });
                }
                // membre._id est la dernière sequence du compteur membres.
                membre._id = cpt.seq;
                membre.nom_util = req.body.nom_util;
                membre.courriel = req.body.courriel;
                membre.mot_passe = bcrypt.hashSync(req.body.mot_passe,10);
            // Enregistrement du nouveau membre
            membre.save(function (err) {
               // MembreModel.create(userData,function (err,membre) {
                if (err) {
                    console.log("Erreur pendant la création du membre: " + err);
                    res.status(400).end();
                    return;
                }
                //
             // On obtient le membre de la base des données avec seulement les champs nécessaires pour le retour JSON
             MembreModel.findById(membre._id).select('-collections_crees -collections_invitees -lieux_non_classes -__v -mot_passe').exec(function (err, resultat) {
                // res.location(req.protocol + '://' + req.get('host') + req.originalUrl + membre._id);
                 res.status(201).json(resultat);
                 return;
             });
               
            });
            
            });

        });
    })

    // Méthode HTTP non permise
    .all(function (req, res) {
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });

//------------Fin création membre----------------- 
//Route pour retourner ou enregistrer
//un certain membre
//============================
routerApi.route('/membres/:noMem')
    .get(function (req, res) {
        //Vérification des accès
        //if (req.params.noMem !== req.jeton.membre_id)
       //if (parseInt(req.params.noMem) !== req.token.membre_id)
       if (parseInt(req.params.noMem) !== req.token.membre_id)
        {
        console.log('Accès non autorisé');
        res.status(401).end();
        return;
        }
        //verification du membre
        // Récuperation du membre en question.            
        MembreModel.findById(req.params.noMem).select('-__v -mot_passe').exec(function (err, membre) {
            if (err) {
                console.log('Erreur, en consultant la base de données.');
                res.status(400).end();
                return;
            }

            if (membre === null) {
                console.log("Le membre no." + req.params.noMem + " n'existe pas dans la base de données.");
                res.status(404).json("Le membre no." + req.params.noMem + " n'existe pas dans la base de données.").end();
                return;
            } else {
                //Si le membre existe
                res.json(membre);
            }
        });
    })

    //Méthode HTTP non permise
    .all(function (req, res) {
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });


//**************************************************** */
//***********************Lieux************************ */
//**************************************************** */

//Permet à un membre ayant "<"mem_id" pour identifiant
// de créer la ressource "lieux_non_classes"
routerApi.route('/membres/:mem_id/lieux_non_classes')
    // Création d'un nouveau lieu.
    .post(function (req, res) {
   //Vérification des accès
   if (parseInt(req.params.mem_id) !== req.token.membre_id)
   {
   console.log('Accès non autorisé');
   res.status(401).end();
   return;
   }
    //Récupération du membre concerné:
    MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log("Erreur en consultant le membre " + req.params.mem_id + ": " + err);
                res.status(400).end();
                return;
            }
            //Si le membre est null
            if (membre === null) {
                console.log("Erreur lors de la creation du lieu, Membre " + req.params.mem_id + " inexistant: " + err);
                res.status(400).end();
                return;
            }
            //Si le membre existe, on crée le lieu:
            var lieu = new LieuModel();
            lieu._id = 0;
            CompteurModel.findByIdAndUpdate({ _id: LIEU_CPT_ID},
                {$inc: {seq: 1}}, {"upsert": true,"new": true}, function (err, cpt) {
                if (err) {
                    console.log("Erreur de gestion du compteur des id des lieux: " + err);
                    res.status(400).end();
                    return;
                }

                //Initialisation du compteur s'il est null    
                if (cpt === null) {
                    cpt = new CompteurModel();
                    cpt._id = LIEU_CPT_ID;
                    cpt.seq = 1;
                    cpt.save(function (err) {
                        if (err) {
                            console.log("Erreur de de création du compteur du id du lieu: " + err);
                            res.status(400).end();
                            return;
                        }
                    });
                }
                // Pas d'erreurs dans la création
                //Affectation des valeur aux attributs
                //des lieux
                lieu._id = cpt.seq;
                //Le nom du lieu est obligatoire:
                if (req.body.nom === null ) {
                    console.log("Erreur, le nom est obligatoire.");
                    res.status(400).end();
                    return;
                }
                lieu.nom = req.body.nom;
                lieu.date_creation = req.body.date_creation;
                lieu.type_lieu = req.body.type_lieu;
                lieu.infos = req.body.infos;
                //Parcours des coordonnées du body
                //et remplissage du tableau des coordonnées.
                for (var coord in req.body.coordonnees) {
                    var coordonnee = new CoordonneeModel();
                    coordonnee.latitude = req.body.coordonnees[coord].latitude;
                    coordonnee.longitude = req.body.coordonnees[coord].longitude;
                    lieu.coordonnees.push(coordonnee);
                }

               //Enregistrement du lieu:
                membre.lieux_non_classes.push(lieu);
                membre.save(function (err) {
                    if (err) {
                        console.log("Erreur de base des données lors de la creation du lieu: " + err);
                        res.status(400).end();
                        return;
                    }
        
                    res.status(201).json(lieu);
                });

            });
        });
       
    });

//Permet Permet à un membre ayant <mem_id> pour identifiant de détruire
// la ressource "lieux" ayant "lieu_id" comme identifiant
//qu'il soit un lieu classé ou non.
routerApi.route('/membres/:mem_id/lieux_non_classes/:lieu_id')
    .delete(function (req, res) {
      
        //Vérification des accès
        if (parseInt(req.params.mem_id) !== req.token.membre_id)
        {
        console.log('Accès non autorisé');
        res.status(401).end();
        return;
        }
        // Récuppération  du membre .
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log('Erreur, ce membre n\'existe pas');
                res.status(400).end();
            }
            //Si le membre existe
            if (membre !== null) {

                var lieuExiste = false;
                var mesLieux = membre.lieux_non_classes;
                for (var i = 0; i < mesLieux.length; i++) {
                    //Suppression du lieu s'il correspond à
                    //celui trouvé (avec le paramètre lieu_id)
                    if (mesLieux[i]._id === parseInt(req.params.lieu_id)) {
                        membre.lieux_non_classes.remove(mesLieux[i]);
                        lieuExiste = true;
                        break;
                    }
                }
                //Si le lieu n'existe pas dans la liste
                //des lieux non classés, on parcours les
                //lieux des collections.
                if (lieuExiste === false) {
                    var collections = membre.collections_crees;
                    for (var j = 0; j < collections.length; j++) {
                        var lieuDeColl = collections[j].lieux;
                        for (var k = 0; k < lieuDeColl.length; k++) {
                            //Le lieu est trouvé dans la collection, on
                            //le supprime
                            if (lieuDeColl[k]._id === parseInt(req.params.lieu_id)) {
                                membre.collections_crees[j].lieux.remove(lieuDeColl[k]);
                                lieuExiste = true;
                                break;
                            }
                        }
                    }
                }
                //Le lieu est trouvé , supprimé
                //on enregistre les modifications
                if (lieuExiste) {
                    MembreModel.findByIdAndUpdate(req.params.mem_id, membre, function (err) {
                        if (err) {
                            console.log('Erreur de modification des données du membre :' + err);
                            res.status(400).end();
                            return;
                        }
                        res.status(204).end();
                    });
                } else {
                    console.log('Erreur en tentant d\'effacer le lieu ' + req.params.lieu_id);
                    res.status(400).end();
                    return;
                }
            } else {
                console.log(req.params.mem_id +'est un numéro d\'un membre innexistant');
                res.status(400).end();
                return;
            }
        });
    })

//Route pour enlever un lieu d'une collection et le rendre
//non classé.
.put(function (req, res) {
        
 //Vérification des accès
 if (parseInt(req.params.mem_id) !== req.token.membre_id)
        {
        console.log('Accès non autorisé');
        res.status(401).end();
        return;
        }
 // Récupération du membre en question:
MembreModel.findById(req.params.mem_id, function (err, membre) {
    if (err) {
        console.log('Erreur, ce membre n\'existe pas');
        res.status(404).end();
             }
      //Si le membre existe
       if (membre !== null) {
      //Le lieu à mettre non classé
      var lieuSansCollection = null;
      //Parcourir les collections pour voir
      //si le lieu passé en paramètres
      //existe dans les collections
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

                if (lieuSansCollection === null) {
                    console.log("Le lieu n'\existe pas");
                    res.status(404).end();
                    return;
                }
                //Sauvegarde des modifications:
                membre.save(function (err) {
                    if (err) {
                        console.log("Erreur lors de la sauvegarde des modifications du lieu: " + err);
                        res.status(400).end();
                        return;
                    }
                    //   res.location(req.protocol + '://' + req.get('host') + req.originalUrl + "/" + lieu._id);
                    res.status(201).json(lieuSansCollection);
                });

            } else {
                console.log(req.params.mem_id +'est un numéro d\'un membre qui n\'existe pas');
                res.status(404).end();
            }

        });
    })

    // Méthode HTTP non permise
    .all(function (req, res) {
        'use strict';
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });


//Permet à un membre ayant <mem_id> pour identifiant d’ajouter
//la ressource « lieux » ayant « lieux_id » comme identifiant à
// la ressource « collection » ayant « collection_id » comme identifiant.
//==================================================
routerApi.route('/membres/:mem_id/collections/:col_id/lieux/:lieu_id')

    .put(function (req, res) {
       //Vérification des accès
       if (parseInt(req.params.mem_id) !== req.token.membre_id)
       {
       console.log('Accès non autorisé');
       res.status(401).end();
       return;
       }
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
                if (uneCollection === null) {
                    console.log("Erreur, la collection n'\existe pas !");
                    res.status(404).end();
                    return;
                }
                //La collection existe, on vérifie le lieu
                var lieuExiste = false;

                //Vérification d'abord si le lieu existe dans la collection:
                //Parcours des lieux de la collection:
                for (var k = 0; k < uneCollection.lieux.length; k++) {
                    if (uneCollection.lieux[k]._id === parseInt(req.params.lieu_id)) {
                        lieuExiste = true;
                        console.log("Ce lieu existe déjâ dans la collection !");
                        res.status(400).end();
                        return;
                    }
                }
                //Le lieu n'existe pas dans la collection,alors
                //On regarde dans la liste des lieux non classés
                var unLieu = null;
                for (var j = 0; j < membre.lieux_non_classes.length; j++) {
                    if (membre.lieux_non_classes[j]._id === parseInt(req.params.lieu_id)) {
                        unLieu = membre.lieux_non_classes[j];
                        uneCollection.lieux.push(unLieu);
                        membre.lieux_non_classes.remove(unLieu);
                        lieuExiste = true;

                        break;
                    }
                }
                //Si le lieu n'existe pas, on regarde dans le body:
                
                if (lieuExiste === false) {
                    unLieu = new LieuModel();
                    unLieu._id = req.params.lieu_id;
                     //le nom du lieu est obligatoire:
                if (uneCollection === null) {
                    console.log("Le nom est requis");
                    res.status(400).end();
                    return;
                }
                    unLieu.nom = req.body.nom;
                    unLieu.date_creation = req.body.date_creation;
                    unLieu.infos = req.body.infos;
                    unLieu.type_lieu = req.body.type_lieu;
                    unLieu.coordonnees = req.body.coordonnees;
                    uneCollection.lieux.push(unLieu);
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
                console.log(req.params.mem_id+'est un numéro d\'un membre qui n\'existe pas');
                res.status(404).end();
            }

        });
    
    })

    //-----------------------------------------------------
    //Retirer la ressource "lieu" ayant "lieux_id"
    // comme identifiant de la ressource "collection" ayant
    // "collection_id" comme identifiant.
    //-----------------------------------------------------
    .delete(function (req, res) {
         //Vérification des accès
         if (parseInt(req.params.mem_id) !== req.token.membre_id)
         {
         console.log('Accès non autorisé');
         res.status(401).end();
         return;
         }
        // Vérification si le membre existe.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log('Erreur, ce membre n\'existe pas');
                res.status(404).end();
            }
            //Si le membre existe
            if (membre !== null) {
                var uneCollection = null;
                var unLieu = null;
                var lieuExiste = false;

                //Parcours de la liste des collections du membre
                //pour vérifier si la collection existe:
                for (var i = 0; i < membre.collections_crees.length; i++) {
                    if (membre.collections_crees[i]._id === parseInt(req.params.col_id)) {
                        uneCollection = membre.collections_crees[i];
                        //La collection existe, on vérifie le lieu                
                        //Vérification d'abord si le lieu existe dans la collection:
                        //Parcours des lieux de la collection:
                        for (var k = 0; k < uneCollection.lieux.length; k++) {
                            if (uneCollection.lieux[k]._id === parseInt(req.params.lieu_id)) {
                                lieuExiste = true;

                                unLieu = uneCollection.lieux[k];
                                //Le lieu est trouvé, on le supprime
                                delete membre.collections_crees[i].lieux[k];
                                membre.collections_crees[i].lieux = membre.collections_crees[i].lieux.filter(function () {
                                    return true;
                                });
                                break;
                            }
                        }
                        //break;
                    }
                }
                //Si la collection n'existe pas:
                if (uneCollection === null) {
                    console.log("Erreur, vous n'avez pas cette!");
                    res.status(400).end();
                    return;
                }

                if (lieuExiste === false) {
                    console.log("Erreur, le lieu n'\existe pas !");
                    res.status(400).end();
                    return;
                }
                //On enregistre les modifications:
                MembreModel.findByIdAndUpdate(req.params.mem_id, membre, function (err) {
                    if (err) {
                        console.log('Erreur lors de l\'enregistrement des modifications :' + err);
                        res.status(400).end();
                        return;
                    }
                    res.status(200).end();
                });

            } else {
                console.log(req.params.mem_id+ 'est un numéro d\'un membre qui n\'existe pas');
                res.status(404).end();
            }

        });
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
    //Pour afficher toutes les collections
    //d'un membre identifié par son id.
    
    .get(function (req, res) {

         //Vérification des accès
         if (parseInt(req.params.mem_id) !== req.token.membre_id)
         {
         console.log('Accès non autorisé');
         res.status(401).end();
         return;
         }
        // Vérification si le membre existe.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log('Erreur, membre inexistant');
                res.status(400).end();
            }
            //Si le membre existe
            if (membre !== null) {
                var lstCollections = [];
                console.log('Récupération de toutes les collections crées par ce membre.');

                for (var i = 0; i < membre.collections_crees.length; i++) {
                    lstCollections.push(membre.collections_crees[i]);
                }
                res.json(lstCollections);

            } else {
                console.log(req.params.mem_id+'est un numéro d\'un membre qui n\'existe pas');
                res.status(404).end();
            }

        });
       
    })
    
    //Pour créer une collection
    //pour un membre identifié par son id.
    //-------------------------------------------
    .post(function (req, res) {
         //Vérification des accès
         if (parseInt(req.params.mem_id) !== req.token.membre_id)
         {
         console.log('Accès non autorisé');
         res.status(401).end();
         return;
         }
        // Récupération du membre en question (vérification).
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log("Erreur de bd en consultant le membre: " + err);
                res.status(400).end();
                return;
            }
              //Si le membre n'existe pas
            if (membre === null) {
                console.log("Erreur, membre inexistant");
                res.status(400).end();
                return;
            }
            // Si le membre existe
            //on crée la collection:
            else {
                var collection = new CollectionCreeModel();
                //Par defaut id est mis à zéro.
                collection._id = 0;
                CompteurModel.findByIdAndUpdate({_id: COLL_CPT_ID}, 
                                                {$inc:{seq: 1}},
                                                {"upsert": true,"new": true},
                                                 function (err, cpt) {
                    if (err) {
                        console.log("Erreur  du compteur des id des collections: " + err);
                        res.status(400).end();
                        return;
                    }
                    //Initialisation du compteur
                    //s'il est null
                    if (cpt === null) {
                        cpt = new CompteurModel();
                        cpt._id = COLL_CPT_ID;
                        cpt.seq = 1;
                        cpt.save(function (err) {
                            if (err) {
                                console.log("Erreur  du compteur des id collection: " + err);
                                res.status(400).end();
                                return;
                            }
                        });
                    }
                    // Attribution du id à la collection en respectant
                    //la dernière séquence du cpt id collection
                    collection._id = cpt.seq;
                    collection.nom = req.body.nom;
                    collection.lieux = [];
                    collection.partagee_avec = [];
                    membre.collections_crees.push(collection);
                    membre.save(function (err) {
                        if (err) {
                            console.log("Erreur lors d'enregistrement de la nouvelle collection: " + err);
                            res.status(400).end();
                            return;
                        }
                        //res.location(req.protocol + '://' + req.get('host') + req.originalUrl + "/" + collection._id);
                        res.status(201).json(collection);
                        return;
                    });
                });
            }
        });
      
    })
    // Méthode HTTP non permise
    .all(function (req, res) {
        'use strict';
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });


//--------------------------------------------
// Permet à un membre ayant mem_id comme identifiant de 
// détruire une collection ayant collection_id pour identifiant.
//--------------------------------------------
routerApi.route('/membres/:mem_id/collections/:collection_id')
    .delete(function (req, res) {
        //Vérification des accès
        if (parseInt(req.params.mem_id) !== req.token.membre_id)
        {
        console.log('Accès non autorisé');
        res.status(401).end();
        return;
        }
        // Récupération du membre en question.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log('Erreur, lors de consultation de la base de données.');
                res.status(400).end();
                return;
            }
            //Si le membre n'existe pas
            if (membre === null) {
                console.log("Erreur, membre inexistant");
                res.status(404).end();
            } else {

                var collections = membre.collections_crees;
                //Parcours des collections crées du membre
                for (var i = 0; i < collections.length; i++) {
                    if (collections[i]._id === parseInt(req.params.collection_id)) {
                        // Parcours du tableau partagee_avec et appel de 
                        //la fonction qui supprime le partage avec les
                        //autres membres.
                        for (var j = 0; j < collections[i].partagee_avec.length; j++) {
                            supprimerCollectionsInvitees(res, collections[i].partagee_avec[j], parseInt(req.params.collection_id));
                        }
                        membre.collections_crees.remove(collections[i]);
                        break;
                    }
                }
                //Enregistrement des modifications.
                MembreModel.findByIdAndUpdate(req.params.mem_id, membre, function (err) {
                    if (err) {
                        console.log('Erreur de modification du membre numéro: ' + req.params.mem_id);
                        res.status(400).end();
                    }
                    //Code 204, pas de contenu
                    res.status(204).end();
                });
            }
        });
       
    })

    // Méthode HTTP non permise
    .all(function (req, res) {
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });
//----------------------------------------------
//Route pour retourner les collections dont on a
//reçu le partage.
//----------------------------------------------
routerApi.route('/membres/:mem_id/collectionsInvitees')
    
    .get(function (req, res) {
         //Vérification des accès
         if (parseInt(req.params.mem_id) !== req.token.membre_id)
         {
         console.log('Accès non autorisé');
         res.status(401).end();
         return;
         }
        // Vérification si le membre existe.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log('Erreur, membre inexistant');
                res.status(404).send();
                return;
            }

            //Si le membre n'existe pas
            if (membre === null) {
               //console.log("Erreur, membre inexistant");
               console.log('Membre inexistant');
               res.status(404).send();
               return;
            }
            //Si le membre existe
            if (membre !== null) {

                console.log('Récupération des collections invitées du membre.');

                //Parcours du tableau des collections invitée
                //pour chercher les collection créées par les membres
                //dont le id est dans collections_invitees
                var maListe=[];
                for (var j = 0; j < membre.collections_invitees.length; j++) {
                    var idMem = membre.collections_invitees[j].id_createur;
                    var idColl = membre.collections_invitees[j].id_collection;
                  // recupererCollectionsCrees(res, idMem, idColl);
                 maListe.push([idMem,idColl]);
                }
                recupererCollectionsCrees(res,maListe);
            } else {
                console.log(req.params.mem_id+ 'est un numéro d\'un membre qui n\'existe pas');
                res.status(404).end();
            }

        });
       
    })


    // Méthode HTTP non permise
    .all(function (req, res) {
        //'use strict';
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });


//Permet de créer un partage de collection entre deux membres.
routerApi.route('/membres/:mem_id/collections/:col_id/partageAvec/:mem_invite_id')
    .post(function (req, res) {
        //Vérification des accès
        if (parseInt(req.params.mem_id) !== req.token.membre_id)
        {
        console.log('Accès non autorisé');
        res.status(401).end();
        return;
        }
        // Récupperation du membre en question.
        MembreModel.findById(req.params.mem_id, function (err, membre) {
            if (err) {
                console.log("Erreur en tentant de consulter le membre: " + err);
                res.status(400).end();
                return;
            }
            //Si le membre est null
            if (membre === null) {
                console.log("Erreur, membre inexistant");
                res.status(400).end();
                return;
            }
            // Si le membre existe
            else {
                //Vérification, en premier lieu, si l'id de l'invité
                //et celui du membre ne sont pas les mêmes
                //un partage avec lui même ne marche pas.
                if (parseInt(req.params.mem_id) === parseInt(req.params.mem_invite_id)) {
                    console.log("Erreur, vous ne pouvez pas partager la collection avec vous-même");
                    res.status(400).end();
                    return;
                }

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
                    res.status(404).end();
                    return;
                }
                //Vérification si le partage exsite déjà avec le
                //membre invité en question:
                var partageExiste = false;
                for (var k = 0; k < uneCollection.partagee_avec.length; k++) {
                    if (uneCollection.partagee_avec[k] === parseInt(req.params.col_id)) {
                        partageExiste = true;
                        break;
                    }
                }
                if (partageExiste === true) {
                    console.log("Erreur, la collection est déjà partagée avec ce membre");
                    res.status(400).end();
                    return;
                }
                if (partageExiste === false) {
                    //Vérification si le membre avec lequel le partage doit être fait
                    //(dont l'id est passé en paramètre) existe
                    MembreModel.findById(req.params.mem_invite_id, function (err, membreInvite) {
                        if (err) {
                            console.log("Erreur lors de la consultation du membre: " + err);
                            res.status(400).end();
                            return;
                        }

                        if (membreInvite === null) {
                            console.log("Erreur, le membre avec lequel vous voulez faire le partage n'existe pas.");
                            res.status(400).end();
                            return;
                        }
                        //Le membre invité existe,le partage n'existe pas
                        //donc on crée la relation de partage
                        var partage = new CollectionInviteModel();
                        partage.id_createur = membre._id;
                        partage.id_collection = uneCollection._id;
                        membreInvite.collections_invitees.push(partage);
                        //Enregistrement des modifications: 
                        membreInvite.save(function (err) {
                            if (err) {
                                console.log('Erreur lors de la mise a jour des données du membre no : ' + req.params.mem_invite_id);
                                res.status(400).end();
                                return;
                            }
                        });
                        //Enregistrement du id du membre invité
                        //dans la liste de partage du membre 
                        //créateur.
                        uneCollection.partagee_avec.push(membreInvite._id);
                        res.status(200).json({
                            '_id': uneCollection._id,
                            'nom': uneCollection.nom,
                            'partage_avec': req.params.mem_invite_id
                        });
                        //Enregistrement des modifications: 
                        membreInvite.save(function (err) {
                            if (err) {
                                console.log('Erreur lors de la mise a jour des données du membre no : ' + req.params.mem_invite_id);
                                res.status(400).end();
                                return;
                            }
                        });

                    });

                }
            }
        });
    })
    // Méthode HTTP non permise
    .all(function (req, res) {
        'use strict';
        console.log('Méthode HTTP non permise.');
        res.status(405).end();
    });


//******************************************************** */
//***********************Fonctions************************ */    
//******************************************************** */




//Fonction pour récuperer le membre créateur de la collection
//invité et afficher les collections concernées.
function recupererCollectionsCrees(res,lstMemColl) {
    var uneCollection = new CollectionCreeModel();
    var lstCollectionsInvitees=[];
    
     lstMemColl.foreach(function(item){

        MembreModel.findById(item[0], function (err, membreInv) {
            if (err) {
                console.log('Erreur de la BD lors de la consulation du membre: ' + err);
                res.status(400).end();
            }
             //Si le membre invitant existe
            if (membreInv !== null) {
                console.log('Le membre existe');
                 //On parcours ses collections créées
                 //Pour trouver celles qui nous sont partagées.
              
                 for (var i = 0; i < membreInv.collections_crees.length; i++) {
    
                    if (membreInv.collections_crees[i]._id === parseInt(item[1])) {
    
                        uneCollection = membreInv.collections_crees[i];
                        lstCollectionsInvitees.push(uneCollection);
                    }
                }
            
               
             
            } else {
                console.log('Erreur de la BD lors de la consulation du membre: ' + err);
                res.status(400).end();
            }
        });
     });
     res.json(lstCollectionsInvitees);
}
    




//Fonction pour trouver un membre et supprimer le partage
//de collection.Fonction appelée lors de la suppression
//d'une collection par son membre créateur.
function supprimerCollectionsInvitees(res, mem_id, col_id) {

    //Récupération du membre en question:
    MembreModel.findById(mem_id, function (err, mem) {
        if (err) {
            console.log('Erreur de consultation du membre: ' + err);
            res.status(400).end();
        }
        //Si le membre existe, on parcours sa liste
        //de collections_invitees et on supprime le lien
        //de partage.
        if (mem !== null) {
            for (var i = 0; i < mem.collections_invitees.length; i++) {
                if (mem.collections_invitees[i].id_collection === col_id) {
                    mem.collections_invitees.remove(mem.collections_invitees[i]);
                    break;
                }
            }
            //Enregistrement des modifications:
            mem.save(function (err) {
                if (err) {
                    console.log('Erreur en tentant de consulter le  membre: ' + err);
                    res.status(400).end();
                }
            });
        } else {
            console.log('Le membre n\'existe pas');
            res.status(400).end();
        }
    });
}






   
    
// Rendre l'objet router disponible de l'extérieur.
module.exports = routerApi;