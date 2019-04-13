'use strict';

// ORM Mongoose.
var mongoose = require('mongoose');

// Classe pour les schéma Mongoose.
var Schema = mongoose.Schema;

var CoordonneeSchema = new Schema({
    latitude: { 
        type: Number,
        required: true
    },
    longitude: { 
        type: Number,
        required: true
    },
},  {
    _id: false
});

var LieuSchema = new Schema({
    _id: { 
        type: Number,
        required: true
    },
    nom: { 
        type: String,
        trim: true,
        required: true
    },
    infos: { 
        type: String,
        trim: true,
    },
    coordonnees: { 
        type: [CoordonneeSchema],
        required: true
    },
    date_creation: { 
        type: Date,
        required: true,
        default: Date.now
    },
    type_lieu: {
        type: String,
        enum: ['point_precis', 'ensemble_points', 'itineraire', 'region_fermee'],
        default: 'Point',
        trim: true,
        required: true
    }
    
});

var CollectionCreeSchema = new Schema({
    _id: { 
        type: Number,
        required: true
    },
    nom: { 
        type: String,
        trim: true,
        required: true
    },
    partage_avec: [Number],
    lieux: [LieuSchema]
    
});

var CollectionInviteSchema = new Schema({
    id_createur: { 
        type: Number,
        required: true
    },
    id_collection: { 
        type: Number,
        required: true
    }
},  {
    _id: false
});

var MembreSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    nom_util: {
        type: String,
        trim: true,
        required: true,
        index: { unique: true }
    },
    courriel: {
        type: String,
        trim: true,
        required: true
    },
    collections_crees: [CollectionCreeSchema],
    lieux_non_classes : [LieuSchema],
    collections_invite : [CollectionInviteSchema],
    mot_passe: {
        type: String,
        trim: true,
        required: true
    },
    
    
});

// Rendre le modèle Coordonnee disponible de l'extérieur.
module.exports.CoordonneeModel = mongoose.model('Coordonnee', CoordonneeSchema);

// Rendre le modèle Lieu disponible de l'extérieur.
module.exports.LieuModel = mongoose.model('Lieu', LieuSchema);

// Rendre le modèle CollectionCree disponible de l'extérieur.
module.exports.CollectionCreeModel = mongoose.model('CollectionCree', CollectionCreeSchema);

// Rendre le modèle CollectionInvite disponible de l'extérieur.
module.exports.CollectionInviteModel = mongoose.model('CollectionInvite', CollectionInviteSchema);

// Rendre le modèle Membre disponible de l'extérieur.
module.exports.MembreModel = mongoose.model('Membre', MembreSchema);




