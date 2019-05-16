"use strict";
var donneesMembre = {
    "membre": null,
    "collections_crees": [],
    "lieux_non_classes": [],
    "collections_invitees": [],
    //"colInvitees": null,
    "clientHttp": null
};

function init() {
     initCarte();

    if (localStorage.getItem('token') !== null && localStorage.getItem('mem_id') !== null) {
        chargerDonneesMembre();
      /* afficherLieuxNonClasses();
       afficherCollectionsNonPartagees();
       afficherCollectionsPartagees();*/
       //creerMarqueursSurCarte();
      // actualiserCarte();
    } else {
        viderCarte();
        afficherFormConnexion();
    }
}

//******************************************************************** */
//* ================= Gestion des collections ======================= */
//******************************************************************** */

/**
 * 
 * @param {*} nomCollection 
 */
function ajouterCollectionBd(nomCollection) {
    if (donneesMembre.clientHttp) {
        // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
        donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    var parametresPOST = {
        'nom': nomCollection
    };
    envoyerRequeteAjax(
        donneesMembre.clientHttp,
        "api/membres/" + localStorage.getItem("mem_id") + "/collections",
        'POST',
        parametresPOST,
        gererReponseAjouterCollectionServer);
}

/**
 * 
 */
function gererReponseAjouterCollectionServer() {
    if (donneesMembre.clientHttp.readyState === 4) {
        if (donneesMembre.clientHttp.status !== 201) {
            window.console.log(
                'Erreur (code=' + donneesMembre.clientHttp.status +
                '): La requête HTTP n\'a pu être complétée.');
        } else {
            try {
                var reponse = JSON.parse(donneesMembre.clientHttp.responseText);
                donneesMembre.clientHttp = null;
                console.log(reponse.nom);

                donneesMembre.membre.collections_crees.push(reponse);
                
              // (document.getElementById('menuAjoutCollection')).remove(); 
                //afficherMenuPrincipal();
                //rappellerMenu();
               afficherMenuMesCollections();
            } catch (e) {
                window.console.log(
                    'ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
                window.console.error(e.message);
            }
        }
    }
}

/**
 * 
 * @param {*} idColl 
 */
function supprimerCollectionBd(idColl){
    if (donneesMembre.clientHttp) {
        // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
        donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    envoyerRequeteAjax(
        donneesMembre.clientHttp,
        "api/membres/" + localStorage.getItem("mem_id") + "/collections/" + idColl,
        'DELETE',
        new Array(0),
        retournerReponsesupprimerCollectionBd);
}
/**
 * 
 */
function retournerReponsesupprimerCollectionBd() {
    if (donneesMembre.clientHttp.readyState === 4) {
        if (donneesMembre.clientHttp.status !== 204) {
            window.console.log(
                'Erreur (code=' + donneesMembre.clientHttp.status +
                '): La requête HTTP n\'a pu être complétée.');
        } else {
            try {
                donneesMembre.clientHttp = null;
            } catch (e) {
                window.console.log(
                    'ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
                window.console.error(e.message);
            }
        }
    }
}



/**
 * 
 * @param {*} idColl 
 * @param {*} nom_utilPartage 
 */
function partagerCollectionBd(idColl, nom_utilPartage){
    console.log("nom_utilPartage : "+nom_utilPartage);
    if (donneesMembre.clientHttp) {
        // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
        donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    envoyerRequeteAjax(
        donneesMembre.clientHttp,
        "api/membres/" + localStorage.getItem("mem_id") + "/collections/" + idColl + "/partageAvec/" + nom_utilPartage,
        //'PUT',
        'POST',
        new Array(0),
        retournerReponsePartagerCollectionBd);
}

function retournerReponsePartagerCollectionBd() {
    if (donneesMembre.clientHttp.readyState === 4) {
        if (donneesMembre.clientHttp.status !== 200) {
            document.getElementById("pErreur").style.display = "block";
            window.console.log(
                'Erreur (code=' + donneesMembre.clientHttp.status +
                '): La requête HTTP n\'a pu être complétée.');
        } else {
            try {
                var reponse = JSON.parse(donneesMembre.clientHttp.responseText);
                donneesMembre.clientHttp = null;
                partagerColletionReponseOk(reponse);
            } catch (e) {
                window.console.log(
                    'ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
                window.console.error(e.message);
            }
        }
    }
}
function partagerCollectionClient(idColl, idMmemPart) {
    var i = 0;
    for (i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
        if (donneesMembre.membre.collections_crees[i]._id === idColl) {
            donneesMembre.membre.collections_crees[i].partagee_avec.push(idMmemPart);
            break;
        }
    }
}

//******************************************************************** */
//* ======================= Gestion des lieux ======================= */
//****************************************************************** */

function envoyerLieuCollection(lieuId, colId) {
    var lieu = null;
    var collection = null;

    var i = 0;
    var j = 0;
    var index = -1;

    for (i = 0; i < donneesMembre.membre.lieux_non_classes.length; i++) {
        if (donneesMembre.membre.lieux_non_classes[i]._id == lieuId) {
            lieu = donneesMembre.membre.lieux_non_classes[i];
            index = donneesMembre.membre.lieux_non_classes.indexOf(lieu);
            if (index > -1) {
                donneesMembre.membre.lieux_non_classes.splice(index, 1);
            }
            break;
        }
    }

    for (i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
        if(typeof(donneesMembre.membre.collections_crees[i].lieux) === 'undefined') {
            donneesMembre.membre.collections_crees[i].lieux = [];
        }
        for (j = 0; j < donneesMembre.membre.collections_crees[i].lieux.length; j++) {
            if (lieu === null && donneesMembre.membre.collections_crees[i].lieux[j]._id === lieuId) {
                lieu = donneesMembre.membre.collections_crees[i].lieux[j];
                index = donneesMembre.membre.collections_crees[i].lieux.indexOf(lieu);
                if (index > -1) {
                    donneesMembre.membre.collections_crees[i].lieux.splice(index, 1);
                }
            }
            if (lieu !== null && collection !== null) {
                break;
            }
        }
        if (collection === null && donneesMembre.membre.collections_crees[i]._id === colId) {
            collection = donneesMembre.membre.collections_crees[i];
        }
    }

    if (lieu !== null && collection !== null) {
        collection.lieux.push(lieu);
    }
}


//==============Pour ajouter un lieu non classé à une collection
/**
 * 
 * @param {*} lieuId 
 * @param {*} idColl 
 */
function envoyerLieuBd(lieuId, idColl) {
    if (donneesMembre.clientHttp) {
        // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
        donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    envoyerRequeteAjax(
        donneesMembre.clientHttp,
        "api/membres/" + localStorage.getItem("mem_id") + "/collections/" + idColl + "/lieux/" + lieuId,
        'PUT',
        new Array(0),
        retournerReponseEnvoyerLieuBd);
}

function retournerReponseEnvoyerLieuBd() {
    if (donneesMembre.clientHttp.readyState === 4) {
        if (donneesMembre.clientHttp.status !== 200) {
            window.console.log(
                'Erreur (code=' + donneesMembre.clientHttp.status +
                '): La requête HTTP n\'a pu être complétée.');
        } else {
            try {
                donneesMembre.clientHttp = null;
            } catch (e) {
                window.console.log(
                    'ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
                window.console.error(e.message);
            }
        }
    }
}

//=====================Pour supprimer un lieu==========================
function effacerLieu(lieuId) {
    var lieu = null;
    var i = 0;
    var j = 0;
    var index = -1;
    var lieuTrouve = false;
    for (i = 0; i < donneesMembre.membre.lieux_non_classes.length; i++) {
        if (donneesMembre.membre.lieux_non_classes[i]._id === lieuId) {
            lieu = donneesMembre.membre.lieux_non_classes[i];
            index = donneesMembre.membre.lieux_non_classes.indexOf(lieu);
            if (index > -1) {
                donneesMembre.membre.lieux_non_classes.splice(index, 1);
            }
            lieuTrouve = true;
            break;
        }
    }

    if (lieuTrouve === false) {
        for (i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
            for (j = 0; j < donneesMembre.membre.collections_crees[i].lieux.length; j++) {
                if (donneesMembre.membre.collections_crees[i].lieux[j]._id == lieuId) {
                    lieu = donneesMembre.membre.collections_crees[i].lieux[j];
                    index = donneesMembre.membre.collections_crees[i].lieux.indexOf(lieu);
                    if (index > -1) {
                        donneesMembre.membre.collections_crees[i].lieux.splice(index, 1);
                    }
                    break;
                }
            }
        }
    }

    supprimerLieuBd(lieuId);
    refreshMenuCourrant();
}

function supprimerLieuBd(lieuId) {
    if (donneesMembre.clientHttp) {
        // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
        donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    envoyerRequeteAjax(
        donneesMembre.clientHttp,
        "api/membres/" + localStorage.getItem("mem_id") + "/lieux_non_classes/" + lieuId,
        'DELETE',
        new Array(0),
        retournerReponseSupprimerLieuBd);
}

function retournerReponseSupprimerLieuBd() {
    if (donneesMembre.clientHttp.readyState === 4) {
        if (donneesMembre.clientHttp.status !== 204) {
            window.console.log(
                'Erreur (code=' + donneesMembre.clientHttp.status +
                '): La requête HTTP n\'a pu être complétée.');
        } else {
            try {
                donneesMembre.clientHttp = null;
            } catch (e) {
                window.console.log(
                    'ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
                window.console.error(e.message);
            }
        }
    }
}


//=====================Pour créer un lieu sans collection===============
function ajouterLieuServer(lieu) {
    console.log("lieu.nom: "+lieu.nom);
    if (donneesMembre.clientHttp) {
        // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
        donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    envoyerRequeteAjax(
        donneesMembre.clientHttp,
        "api/membres/" + localStorage.getItem("mem_id") + "/lieux_non_classes",
        'POST',
        lieu,
        retournerReponseAjouterLieuServer);
}

function retournerReponseAjouterLieuServer() {
    if (donneesMembre.clientHttp.readyState === 4) {
        if (donneesMembre.clientHttp.status === 403) {
            afficherFormConnexion();
        } else if (donneesMembre.clientHttp.status !== 201) {
            console.log(
                'Erreur (code=' + donneesMembre.clientHttp.status +
                '): La requête HTTP n\'a pu être complétée.');
        } else {
            try {
                var reponse = JSON.parse(donneesMembre.clientHttp.responseText);
                donneesMembre.clientHttp = null;
                donneesMembre.membre.lieux_non_classes.push(reponse);
                viderCarte();
                rappellerMenu();
            } catch (e) {
                console.error(
                    'La réponse AJAX n\'est pas une expression JSON valide.');
                console.error(e.message);
            }
        }
    }
}

//******************************************************************** */
//* ====================== Gestion des collections invitees=========== */
//****************************************************************** */


function envoyerRechercheColInvitees(){

    if (donneesMembre.clientHttp) {
        // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
        donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    envoyerRequeteAjax(
        donneesMembre.clientHttp,
        "api/membres/" + localStorage.getItem("mem_id") + "/collectionsInvitees",
        'GET',
        new Array(0),
        gererReponseGetCollectionsExternes);

}

function gererReponseGetCollectionsExternes() {
    if (donneesMembre.clientHttp.readyState === 4) {
        if (donneesMembre.clientHttp.status === 403) {
            afficherFormConnexion();
        } else if (donneesMembre.clientHttp.status !== 200) {
            console.log(
                'Erreur (code=' + donneesMembre.clientHttp.status +
                '): La requête HTTP n\'a pu être complétée.');
        } else {
            try {
                var reponse = JSON.parse(donneesMembre.clientHttp.responseText);
                donneesMembre.clientHttp = null;
                donneesMembre.collections_invitees = reponse;
                afficherCollectionsInvitees();
            } catch (e) {
                console.error(
                    'La réponse AJAX n\'est pas une expression JSON valide.');
                console.error(e.message);
            }
        }
    }
}
