"use strict";

/*function LieuCarte(id, marquers, icon) {
    this.id = id;
    this.marquers = marquers;
    this.icon = icon;
}*/

var donneesCarte = {
    "carte": null,
    "carteEstCentree": false,
    "marqueurs": [],
    "marqueursRep":[],
    "marquerMaPosition": null,
    "infoWindow": null,
    "formes": [],
    "watchPosId": null,
};

function initCarte() {
    creerCarte();
    https://developer.mozilla.org/fr/docs/Web/API/Geolocation/watchPosition
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000
    };
    donneesCarte.watchPosId = navigator.geolocation.watchPosition(watchPosOk, watchPositionError, options);

    var optionsGetCurrent = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 1000
    };

    navigator.geolocation.getCurrentPosition(watchPosOk, getCurrentPositionError, optionsGetCurrent);
}

/**
 * Fonction pour effacer toutes les données
 * sur la carte (les formes et les marqueurs)
 */
function viderCarte()
{
   //Parcour de la liste des marqueurs
    for (var i = 0; i < donneesCarte.marqueurs.length; i++) {
        donneesCarte.marqueurs[i].setMap(null);
    }
   //Parcour de la liste des formes
    for (i = 0; i < donneesCarte.formes.length; i++) {
        donneesCarte.formes[i].setMap(null);
    }
}

function creerCarte() {
    // Position par défaut (cégep Garneau)
    var lat = 46.793580742;
    var long = -71.2628291536;

    // Création de l'objet "LatLng" correspondant à la position par défaut du centre de la carte. 
    var posDefaut = new google.maps.LatLng(lat, long);

    // Options de la carte (syntaxe JS Object Literal).
    var optionsCarte = {
        "center": posDefaut,
        "zoom": 15,
        "mapTypeId": google.maps.MapTypeId.ROADMAP,
        "disableDoubleClickZoom": true
    };

    // Création de la carte Google (avec les options)
    // tout en spécifiant dans quel élément HTML elle doit être affichée.
    var carte = new google.maps.Map(document.getElementById("carte-canvas"), optionsCarte);
    donneesCarte.carte = carte;

    mettreAJourMaPosSurCarte(lat, long);
}

function watchPosOk(pos) {
    var lat = pos.coords.latitude;
    var long = pos.coords.longitude;
    mettreAJourMaPosSurCarte(lat, long);
    if(donneesCarte.carteEstCentree === false) {
        donneesCarte.carteEstCentree = true;
        donneesCarte.carte.setCenter(new google.maps.LatLng(lat, long));
    }
}

function watchPositionError() {
 console.log("Erreur watch position.");
}

function mettreAJourMaPosSurCarte(lat, long) {
    if (donneesCarte.marquerMaPosition === null) {
        donneesCarte.marquerMaPosition = creerMarqueur("Ma Position", "", lat, long, "icon-position.png");
    }
    donneesCarte.marquerMaPosition.setPosition(new google.maps.LatLng(lat, long));
}
/**
 * Fonction pour l'ajout d'un gestionnaire d'événements lors du clique
 *  sur la carte (fonction anonyme).
 * @param {*} event 
 */
function ajouterGestEventClickCarte(event) {
    
    google.maps.event.addListener(donneesCarte.carte, "click", function (e) {
        event(e);
    });
}

/**
 * Fonction inverse de la précédente
 */
function supprimerGestEventClickCarte() {
    google.maps.event.clearListeners(donneesCarte.carte, "click");
}

/**
 * Fonction pour actualiser la carte
 * lors des modification de données.
 * On vide la carte et on crée les 
 * marqueurs de nouveau.
 */
function actualiserCarte() {
    viderCarte();
    creerMarqueursSurCarte();
}
/**
 * Fonction pour créer les marqueurs sur la carte
 * pour collections crées,collections invitées et
 * lieux sans collection
 */
function creerMarqueursSurCarte() {
    var i = 0;
    var j = 0;
    var k = 0;
    //------------------------------------------------------------------
    //-----------Parcours de la liste des lieux non classés-------------
    //------------------------------------------------------------------
    for (i = 0; i < donneesMembre.membre.lieux_non_classes.length; i++) {
        var lieuId = donneesMembre.membre.lieux_non_classes[i]._id;
        if (donneesMembre.lieux_non_classes.includes(lieuId)) {
            var coordonnees = [];
            for (j = 0; j < donneesMembre.membre.lieux_non_classes[i].coordonnees.length; j++) {
                var lieuNom = donneesMembre.membre.lieux_non_classes[i].nom;
                var lieuDescription = donneesMembre.membre.lieux_non_classes[i].infos;
                var lieuLat = donneesMembre.membre.lieux_non_classes[i].coordonnees[j].latitude;
                var lieuLong = donneesMembre.membre.lieux_non_classes[i].coordonnees[j].longitude;
                var icon = "icon-sans-collection.png";
                donneesCarte.marqueurs.push(creerMarqueur(lieuNom, lieuDescription, lieuLat, lieuLong, icon,lieuId));
                coordonnees.push({
                    "lat": lieuLat,
                    "lng": lieuLong
                });
                
            }
            if (donneesMembre.membre.lieux_non_classes[i].type_lieu === 'itineraire') {
                creerItineraire(coordonnees);
            } else if (donneesMembre.membre.lieux_non_classes[i].type_lieu === 'region_fermee') {
                creerRegionFermee(coordonnees);
            }
            else if (donneesMembre.membre.lieux_non_classes[i].type_lieu === 'ensemble_points') {
                creerEnsemblePoints(coordonnees);
            }

        }
    }
    //------------------------------------------------------------------
    //-----------Parcours de la liste des collections crées-------------
    //------------------------------------------------------------------
    for (i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
        for (j = 0; j < donneesMembre.membre.collections_crees[i].lieux.length; j++) {
            var lieuId = donneesMembre.membre.collections_crees[i].lieux[j]._id;
            if (donneesMembre.lieux_non_classes.includes(lieuId)) {
                var coordonnees = [];
                for (k = 0; k < donneesMembre.membre.collections_crees[i].lieux[j].coordonnees.length; k++) {
                    var lieuNom = donneesMembre.membre.collections_crees[i].lieux[j].nom;
                    var lieuDescription = donneesMembre.membre.collections_crees[i].lieux[j].infos;
                    var lieuLat = donneesMembre.membre.collections_crees[i].lieux[j].coordonnees[k].latitude;
                    var lieuLong = donneesMembre.membre.collections_crees[i].lieux[j].coordonnees[k].longitude;
                    donneesCarte.marqueurs.push(creerMarqueur(lieuNom, lieuDescription, lieuLat, lieuLong, "icon-princ.png",lieuId));
                    coordonnees.push({
                        "lat": lieuLat,
                        "lng": lieuLong
                    });
                }
                if (donneesMembre.membre.collections_crees[i].lieux[j].type_lieu === 'itineraire') {
                    creerItineraire(coordonnees);
                } else if (donneesMembre.membre.collections_crees[i].lieux[j].type_lieu === 'region_fermee') {
                    creerRegionFermee(coordonnees);
                }
            }
        }
    }

    var numIcon = 0;
    var lstCollections = [];//pour affichage
    lstCollections = donneesMembre.collections_crees.concat(donneesMembre.collections_invitees);
    for (i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
        var colId = donneesMembre.membre.collections_crees[i]._id;
        if (lstCollections.includes(colId)) {

            if (typeof (donneesMembre.membre.collections_crees[i].lieux) !== 'undefined') {
                for (j = 0; j < donneesMembre.membre.collections_crees[i].lieux.length; j++) {
                    var lieuId = donneesMembre.membre.collections_crees[i].lieux[j]._id;
                    var coordonnees = [];
                    for (k = 0; k < donneesMembre.membre.collections_crees[i].lieux[j].coordonnees.length; k++) {
                        var lieuNom = donneesMembre.membre.collections_crees[i].lieux[j].nom;
                        var lieuDescription = donneesMembre.membre.collections_crees[i].lieux[j].infos;
                        var lieuLat = donneesMembre.membre.collections_crees[i].lieux[j].coordonnees[k].latitude;
                        var lieuLong = donneesMembre.membre.collections_crees[i].lieux[j].coordonnees[k].longitude;
                        var icon = "icon-" + numIcon + ".png";
                        donneesCarte.marqueurs.push(creerMarqueur(lieuNom, lieuDescription, lieuLat, lieuLong, icon,lieuId));
                        coordonnees.push({
                            "lat": lieuLat,
                            "lng": lieuLong
                        });
                    }
                    if (donneesMembre.membre.collections_crees[i].lieux[j].type_lieu === 'itineraire') {
                        creerItineraire(coordonnees);
                    } else if (donneesMembre.membre.collections_crees[i].lieux[j].type_lieu === 'region_fermee') {
                        creerRegionFermee(coordonnees);
                    }
                }
                numIcon++;
                //Au nombre maximal d'images que l'on a
                if (numIcon >= 15) {
                    numIcon = 0;
                }
            }
        }
    }
    if (donneesMembre.collections_invitees !== null) {
        for (i = 0; i < donneesMembre.collections_invitees.length; i++) {
            var colId = donneesMembre.collections_invitees[i]._id;
            if (lstCollections.includes(colId)) {
                var coordonnees = [];
                for (j = 0; j < donneesMembre.collections_invitees[i].lieux.length; j++) {
                    var coordonnees = [];
                    var lieuId = donneesMembre.collections_invitees[i].lieux[j]._id;
                    for (k = 0; k < donneesMembre.collections_invitees[i].lieux[j].coordonnees.length; k++) {
                        var lieuNom = donneesMembre.collections_invitees[i].lieux[j].nom;
                        var lieuDescription = donneesMembre.collections_invitees[i].lieux[j].infos;
                        var lieuLat = donneesMembre.collections_invitees[i].lieux[j].coordonnees[k].latitude;
                        var lieuLong = donneesMembre.collections_invitees[i].lieux[j].coordonnees[k].longitude;
                        var icon = "icon-partage.png";
                        donneesCarte.marqueurs.push(creerMarqueur(lieuNom, lieuDescription, lieuLat, lieuLong, icon,lieuId));
                        coordonnees.push({
                            "lat": lieuLat,
                            "lng": lieuLong
                        });
                    }
                    if (donneesMembre.collections_invitees[i].lieux[j].type_lieu === 'itineraire') {
                        creerItineraire(coordonnees);
                    } else if (donneesMembre.collections_invitees[i].lieux[j].type_lieu === 'region_fermee') {
                        creerRegionFermee(coordonnees);
                    }
                }
            }
        }
    }
}

function carteAfficherMarquersCoordonnes(coordonnes) {
    viderCarte();
    for (var i = 0; i < coordonnes.length; i++) {
        var lieuNom = "";
        var lieuLat = coordonnes[i].latitude;
        var lieuLong = coordonnes[i].longitude;
        var icon = "icon-sans-collection.png";
        donneesCarte.marqueurs.push(creerMarqueur(lieuNom, "", lieuLat, lieuLong, icon));
    }
}

function creerMarqueur(nom, descr, lat, long, icon,id) {
    // Ajout  d'un repère à la position du lieu.
    var posRepere = new google.maps.LatLng(lat, long);
    // JS Object Literal pour les options du repère; 
    // les deux premières options sont obligatoires si on veut afficher le repère sur une carte.
    if (icon !== null) {
        var optionsRepere = {
            "position": posRepere,
            "map": donneesCarte.carte,
            "icon": "../images/" + icon,
            "clickable": true,
            "draggable": false,
            "id":id,
        };
    } else {
        var optionsRepere = {
            "position": posRepere,
            "map": donneesCarte.carte,
            "clickable": true,
            "draggable": false,
        };
    }

    // Création du repère.
    var repere = new google.maps.Marker(optionsRepere);
    repere.nom = nom;
    repere.description = descr;
    donneesCarte.marqueursRep.push(repere);////////////
    // Ajout d'un gestionnaire d'événement lors du clique sur le repére.
    google.maps.event.addListener(repere, "click", function () {
        gererClickRepere(repere);
    });

    return repere;
}
// Fonction appelée pour gérer le click sur un repère.
function gererClickRepere(repere) {
    if (donneesCarte.infoWindow) {
        donneesCarte.infoWindow.close();
    }
    donneesCarte.infoWindow = new google.maps.InfoWindow({
        content: repere.nom + "<br/>" + repere.description+
        "<br/>" + repere.getPosition() + "<br/>" +"N° lieu:"+ repere.id, maxWidth: 200
    });
    // Affichage de l'InfoWindow sur la carte.
    donneesCarte.infoWindow.open(donneesCarte.carte, repere);
    // Recentrage de la carte sur le nouveau repère (de manière fluide).
    donneesCarte.carte.panTo(repere.getPosition());
}


function geolocaliserPosition() {
    // Est-ce que le navigateur supporte la géolocalisation ?
    if (typeof navigator.geolocation !== "undefined") {
        console.log('Le navigateur supporte la géolocalisation.');
        var options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 1000
          };
        // Tentative de récupération de la position de l'utilisateur;
        // une autorisation de celui-ci est nécessaire.
        // Si l'utilisateur l'autorise, la fonction "getCurrentPositionSuccess" est appelée;
        // autrement, la fonction "getCurrentPositionError" est appelée (c'est un appel *asynchrone*).
        navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess, getCurrentPositionError, options);
    } else {
        // Pas de support de la géolocalisation.
        console.log('Le navigateur NE supporte PAS la géolocalisation.');
        // Utilisation de la position par défaut.
        console.log('Utilisation de la position par défaut.');
    }

}

// Fonction appelée lors refus de la récupération de la position de l'utilisateur.
function getCurrentPositionError(err) {
    // Utilisation de la position par défaut.
    console.log('Utilisation de la position par défaut.');
}

function creerItineraire(coordonnees) {
    var lineString = new google.maps.Polyline({
        path: coordonnees,
        geodesic: true,
        strokeColor: '#FA0517',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    lineString.setMap(donneesCarte.carte);
    donneesCarte.formes.push(lineString);
}

function creerRegionFermee(coordonnees) {
    coordonnees.push(coordonnees[0]);
    var polygon = new google.maps.Polygon({
        path: coordonnees,
        geodesic: true,
        strokeColor: '#000066',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    polygon.setMap(donneesCarte.carte);
    donneesCarte.formes.push(polygon);
}

function creerEnsemblePoints(coordonnees) {

    /*var lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 4
    };*/
    coordonnees.push(coordonnees[0]);
    var ensPoints = new google.maps.Polygon({
        path: coordonnees,
        geodesic: true,
        strokeColor: '#33ffec',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    ensPoints.setMap(donneesCarte.carte);
    donneesCarte.formes.push(ensPoints);
}

     function supprimerMarqueur(id){
   
        var marker = donneesCarte.marqueursRep[id];
        marker.setMap(null);
        
    }

