/* /**
 * Created by nrichard on 2017-03-16.
 */

"use strict";

/**
 * Permet d'envoyer une requête AJAX en GET ou POST
 * @param {XMLHttpRequest} clientHttp Votre client HTTP
 * @param {string} url Cible de votre requête
 * @param {boolean} estReqGet Indique est la requête est en GET ou POST
 * @param {Object.<string, string>} parametres Tableau associatif des paramètres de votre requête
 * @param {function} fonctionRetour Fonction à appeler lors de la réception de la réponse
 */
/*function envoyerRequeteAjax(clientHttp, url, estReqGet, parametres, fonctionRetour) {
    clientHttp.addEventListener('readystatechange', fonctionRetour, false);

    var urlCible = url;
    var paramStr = "";
    var indice = 0;

    for (var param in parametres) {
        if (parametres.hasOwnProperty(param)) {
            if (indice > 0) {
                paramStr += "&";
            }
            paramStr += encodeURIComponent(param) + "=" + encodeURIComponent(parametres[param]);
            indice += 1;
        }
    }

    var body = "";
    if (estReqGet) {
        if (Object.keys(parametres).length > 0) {
            urlCible += "?" + paramStr;
        }
    } else {
        body = paramStr;
    }

    var typeReq = (estReqGet ? "GET" : "POST");
    clientHttp.open(typeReq, urlCible, true);
    clientHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    clientHttp.send(body);
} */

/**
 * Permet d'envoyer une requête AJAX en GET ou POST
 * @param {XMLHttpRequest} clientHttp Votre client HTTP
 * @param {string} url Cible de votre requête
 * @param {string} typeReq Indique le type de la requete (GET, POST, DELETE)
 * @param {Object.<string, string>} parametres Tableau associatif des paramètres de votre requête
 * @param {function} fonctionRetour Fonction à appeler lors de la réception de la réponse
 */
function envoyerRequeteAjax(clientHttp, url, typeReq, parametres, fonctionRetour) {
    clientHttp.addEventListener('readystatechange', fonctionRetour, false);

    var urlCible = url;
    var paramStr = "";
    var indice = 0;

    for (var param in parametres) {
        if (parametres.hasOwnProperty(param)) {
            if (indice > 0) {
                paramStr += "&";
            }
            paramStr += encodeURIComponent(param) + "=" + encodeURIComponent(parametres[param]);
            indice += 1;
        }
    }

    var body = "";
    var contentType = "";
    if (typeReq === 'GET') {
        contentType = 'application/x-www-form-urlencoded';
        if (Object.keys(parametres).length > 0) {
            urlCible += "?" + paramStr;
        }
    } else {
        contentType = "application/json";
        body = JSON.stringify(parametres);
    }

    //clientHttp.open(typeReq, urlCible, true);
    clientHttp.open(typeReq, urlCible, false);
    clientHttp.setRequestHeader('Content-type', contentType);
   // clientHttp.setRequestHeader('Authorization', localStorage.getItem('token'));
   clientHttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
    clientHttp.send(body);
}


