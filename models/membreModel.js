'use strict';

// ORM Mongoose.
var mongoose = require('mongoose');
//Pour crypter le mot de passe
var bcrypt = require('bcrypt');
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
    partagee_avec: [Number],
    lieux: [LieuSchema]
    
});

var CollectionInviteeSchema = new Schema({
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
    collections_invitees : [CollectionInviteeSchema],
    mot_passe: {
        type: String,
        trim: true,
        required: true
    },
    
    
});

//authenticate input against database
var Membre = mongoose.model('Membre', MembreSchema);

MembreSchema.statics.authenticate = function (courriel, pass, callback) {
    Membre.findOne({ courriel: courriel })
      .exec(function (err, membre) {
        if (err) {
          return callback(err);
        } else if (!membre) {
          err = new Error('Utilisateur non enregistré.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(pass, membre.mot_passe, function (err, result) {
          if (result === true) {
            return callback(null, membre);
          } else {
            return callback();
          }
        });
      });
  };
  
  //hashing a password before saving it to the database
  /*MembreSchema.pre('save', function (next) {
    var membre = this;
    bcrypt.hash(membre.mot_passe, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      membre.mot_passe = hash;
      next();
    });
  });*/



 MembreSchema.pre('save',true, function(next) {
    var membre = this;

    // only hash the password if it has been modified (or is new)
    if (!membre.isModified('mot_passe')) return next();

    // generate a salt
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(membre.mot_passe, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            membre.mot_passe = hash;
            next();
        });
    });
});

  
  /*MembreSchema.pre('save', function (next) {
    
    bcrypt.hash(this.mot_passe, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      this.mot_passe = hash;
      next();
    });
  });*/

  /**
* This is the middleware, It will be called before saving any record
*/
/*MembreSchema.pre('save', function(next) {
  // check if password is present and is modified.
  if ( this.mot_passe && this.isModified('mot_passe') ) {
  // call your hashPassword method here which will return the hashed password.
  this.mot_passe = bcrypt.hash(this.mot_passe);
  }
  // everything is done, so let's call the next callback.
  next();
  });*/




// Rendre le modèle Coordonnee disponible de l'extérieur.
module.exports.CoordonneeModel = mongoose.model('Coordonnee', CoordonneeSchema);

// Rendre le modèle Lieu disponible de l'extérieur.
module.exports.LieuModel = mongoose.model('Lieu', LieuSchema);

// Rendre le modèle CollectionCree disponible de l'extérieur.
module.exports.CollectionCreeModel = mongoose.model('CollectionCree', CollectionCreeSchema);

// Rendre le modèle CollectionInvite disponible de l'extérieur.
module.exports.CollectionInviteModel = mongoose.model('CollectionInvite', CollectionInviteeSchema);

// Rendre le modèle Membre disponible de l'extérieur.
module.exports.MembreModel = mongoose.model('Membre', MembreSchema);





