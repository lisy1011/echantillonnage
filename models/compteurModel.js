'use strict';

// ORM Mongoose.
var mongoose = require('mongoose');

// Classe pour les schéma Mongoose.
var CompteurSchema = mongoose.Schema ({
    _id: {type: Number, required: true},
    seq: {type: Number, default: 0}
 });

// Rendre le modèle Compteur disponible à l'extérieur.
module.exports.CompteurModel = mongoose.model('Compteur', CompteurSchema);