/**
 * Script pour tout ce qui concerne l'authentification d'un membre.
 */

'use strict';
var elemAnthentification = {
  "divConn": null,
  "nom_util": null,
  "mot_passe": null,
  "msgErrNom": null,
  "msgErrMdp": null,
  "msgErrCompte": null,
  "texte": "Créer un compte",
  "divInscription": null,
  "courriel": null,
  "formatCourriel": /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  "formatNomUtil": /.{5}/i,
  "mot_passeConf": null,
  "msgErrCourriel": null,
  "msgErrMdpConf": null,
  "msgErrInscription": null,
  "nbErreurs": 0,
  //---------------------
  "divMenuAccueil": null,
    "divLiens": null,
    "lien1":"Déconnexion",
    "lien2":"Collections",
    "lien3":"Lieux sans collection",
    "lien4":"Collections partagées",
    
  //----------------------
};

/***************************************************************************/
//================ Gestion de la connexion ================================/
/***************************************************************************/

/**
 * Permet d'afficher le formulaire de connexion.
 * @param {*} e 
 * @param {*} err 
 */
function afficherFormConnexion(e, err) {
  if (e !== null && typeof (e) !== 'undefined' && !e.preventDefault) e.preventDefault();
  if (err) {
    (document.getElementById("nom_utilLogin")).value = "";
    (document.getElementById("mot_passeLogin")).value = "";
    elemAnthentification.msgErrCompte.innerHTML = "Nom d'utilisateur et/ou mot de passe invalide.";
  } else {
    if (elemAnthentification.divInscription !== null && elemAnthentification.divInscription.parentNode === document.body) {
      document.body.removeChild(elemAnthentification.divInscription);
    }
    if (elemAnthentification.divConn === null) {
      var divConn = document.createElement("div");
      var divClassModal = document.createElement("div");
      divClassModal.className = "signin-form";
      var divSignin = document.createElement("div");
      divSignin.className = "login-form";
      var h3 = document.createElement("h3");
      h3.innerHTML = "Connexion";
      divSignin.appendChild(h3);
      //Division pour afficher le message d'erreurs
      //=======================
      var pErrCompte = document.createElement("p");
      pErrCompte.className = "erreur";
      elemAnthentification.msgErrCompte = pErrCompte;
      divSignin.appendChild(pErrCompte);

      var divLogin = document.createElement("div");
      var formLogin = document.createElement("form");
      formLogin.addEventListener("submit", authentifier);

      //Division pour le nom:
      //=======================
      var divGlobale = document.createElement("div");
      divGlobale.className = "globale";
      var divNom = document.createElement("div");
      var inputNom = document.createElement("input");
      inputNom.type = "text";
      inputNom.placeholder = "Nom d'utilisateur";
      inputNom.name = "nom_util";
      inputNom.setAttribute('id', 'nom_utilLogin');
      inputNom.required = true;
      elemAnthentification.nom_util = inputNom;
      divNom.appendChild(inputNom);
      var pErrNom = document.createElement("p");
      pErrNom.id = "msgErrNom";
      pErrNom.className = "erreur";
      elemAnthentification.msgErrNom=pErrNom;
      divNom.appendChild(pErrNom);
      divGlobale.appendChild(divNom);

      //Division pour le mot de passe:
      //=============================
      var divMdp = document.createElement("div");
      var inputMdp = document.createElement("input");
      inputMdp.type = "password";
      inputMdp.placeholder = "Mot de passe";
      inputMdp.name = "mot_passe";
      inputMdp.setAttribute('id', 'mot_passeLogin');
      inputMdp.required = true;
      elemAnthentification.mot_passe = inputMdp;
      divMdp.appendChild(inputMdp);
      var pErrMdp=document.createElement("p");
      pErrMdp.id = "msgErr";
      pErrMdp.className = "erreur";
      elemAnthentification.msgErrMdp=pErrMdp;
      divMdp.appendChild(pErrMdp);
      divGlobale.appendChild(divMdp);

      //Lien pour la création de compte:
      var pCreerCompte = document.createElement("p");
      pCreerCompte.id = "lien";
      var elemA = document.createElement("a");
      var linkText = document.createTextNode(elemAnthentification.texte);
      elemA.appendChild(linkText);
      elemA.title = elemAnthentification.texte;
      elemA.href = "";
      elemA.addEventListener("click", afficherFormInscription);
      pCreerCompte.appendChild(elemA);
      divGlobale.appendChild(pCreerCompte);

      //Bouton pour l'envoi:
      var divSubmit = document.createElement("div");
      divSubmit.className = "align1";
      var btnConnexion = document.createElement("button");
      btnConnexion.className = "align2";
      btnConnexion.type = "submit";
      btnConnexion.innerHTML = "Envoyer";
      divSubmit.appendChild(btnConnexion);
      divGlobale.appendChild(divSubmit);
      formLogin.appendChild(divGlobale);
      divLogin.appendChild(formLogin);
      divSignin.appendChild(divLogin);
      divClassModal.appendChild(divSignin);
      divConn.appendChild(divClassModal);
      elemAnthentification.divConn = divConn;
    }
    elemAnthentification.nom_util.value = "";
    elemAnthentification.mot_passe.value = "";
    document.body.appendChild(elemAnthentification.divConn);
  }
}

/**
 * Permet de se connecter.
 * @param {*} e 
 */
function authentifier(e) {
  if (e.preventDefault) e.preventDefault();
  var nom = (document.getElementById("nom_utilLogin")).value.trim();
  var passe = (document.getElementById("mot_passeLogin")).value.trim();
  console.log("nom: " + nom + " passe: " + passe);
  seConnecter(nom, passe);
}

/**
 * 
 * @param {*} nom 
 * @param {*} passe 
 */
function seConnecter(nom, passe) {

  if (nom.length > 0 && passe.length > 0) {

    var dataConnexion = {
      "nom_util": nom,
      "mot_passe": passe
    };

    if (donneesMembre.clientHttp) {
      // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
      // requête à chaque keyup et on ne veut pas les résultats du keyup précédent
      donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    envoyerRequeteAjax(
      donneesMembre.clientHttp,
      "/api/connexion",
      'POST',
      dataConnexion,
      retournerReponseConnexion);
  }
}

/**
 * 
 */
function retournerReponseConnexion() {
  if (donneesMembre.clientHttp.readyState === 4) {

    if (donneesMembre.clientHttp.status !== 200) {

      console.log("status:" + donneesMembre.clientHttp.status);
      console.log("donneesMembre.clientHttp.responseText: " + donneesMembre.clientHttp.responseText);
      console.log(
        'Erreur (code=' + donneesMembre.clientHttp.status +
        '): La requête HTTP n\'a pu être complétée.');

    } else {
      try {
        //donneesMembre.clientHttp = null;
        var reponse = JSON.parse(donneesMembre.clientHttp.response);
        if (reponse.success) {
          cacherFormsConnCreaCompte();
          console.log(reponse.token);
          localStorage.setItem("token", reponse.token);
          console.log("token: " + localStorage.getItem("token"));
          localStorage.setItem("mem_id", reponse.mem_id);
          localStorage.setItem("nom_util", reponse.nom_util);
          console.log(localStorage.getItem("nom_util"));
          chargerDonneesMembre();
        } else {
          afficherFormConnexion(null, true);
        }
      } catch (e) {
        console.error(
          'La réponse AJAX n\'est pas une expression JSON valide.');
        console.error(e.message);
      }
    }
  }
}

/**
 * Fonction pour déconnexion
 */
function seDeconnecter() {
  console.log("deconnexion");

  // window.location.href="index.html";
  localStorage.clear();
  //localStorage.setItem("token","undefined");
  window.history.go(0);
  afficherFormConnexion();

}

//**************************************************/
//==========Gestion de la création de compte====== /
//************************************************/

function afficherFormInscription(e) {
  if (e.preventDefault) e.preventDefault();

  if (elemAnthentification.divConn !== null && elemAnthentification.divConn.parentNode === document.body) {
    document.body.removeChild(elemAnthentification.divConn);
  }

  if (elemAnthentification.divInscription === null) {
    var divInscription = document.createElement("div");
    var divClassModal = document.createElement("div");
    divClassModal.className = "signin-form";
    var divRegister = document.createElement("div");
    divRegister.className = "login-form";
    var h3 = document.createElement("h3");
    h3.innerHTML = "Création de compte";
    divRegister.appendChild(h3);

    var divReg = document.createElement("div");
    var formInscription = document.createElement("form");
    formInscription.addEventListener("submit", validerFormulaireInsc);
    var divGlobale = document.createElement("div");
    divGlobale.className = "globale";

    //Division pour le nom:
    //=======================
    var divNom = document.createElement("div");
    var inputNom = document.createElement("input");
    inputNom.type = "text";
    inputNom.placeholder = "Nom d'utilisateur";
    inputNom.name = "nom_util";
    inputNom.id = "nom_util";
    elemAnthentification.nom_util = inputNom;
    divNom.appendChild(inputNom);
    var pErrNom = document.createElement("p");
    pErrNom.id = "msgErrNom";
    pErrNom.className = "erreur";
    elemAnthentification.msgErrNom = pErrNom;
    divNom.appendChild(pErrNom);
    divGlobale.appendChild(divNom);

    //Division pour le courriel
    //=========================
    var divCourriel = document.createElement("div");
    var inputCourriel = document.createElement("input");
    inputCourriel.type = "email";
    inputCourriel.placeholder = "Courriel";
    inputCourriel.name = "courriel";
    inputCourriel.id = "courriel";
    elemAnthentification.courriel = inputCourriel;
    divCourriel.appendChild(inputCourriel);
    var pErrCourriel = document.createElement("p");
    pErrCourriel.id = "msgErrCourriel";
    pErrCourriel.className = "erreur";
    elemAnthentification.msgErrCourriel = pErrCourriel;
    divCourriel.appendChild(pErrCourriel);
    divGlobale.appendChild(divCourriel);

    //Division pour le mot de passe:
    //=============================
    var divMdp = document.createElement("div");
    var inputMdp = document.createElement("input");
    inputMdp.type = "password";
    inputMdp.placeholder = "Mot de passe";
    inputMdp.name = "mot_passe";
    inputMdp.id = "mot_passe";
    elemAnthentification.mot_passe = inputMdp;
    divMdp.appendChild(inputMdp);
    var pErrMdp = document.createElement("p");
    pErrMdp.id = "msgErrMdp";
    pErrMdp.className = "erreur";
    elemAnthentification.msgErrMdp = pErrMdp;
    divMdp.appendChild(pErrMdp);
    divGlobale.appendChild(divMdp);

    //Division pour la confirmation du
    // mot de passe:
    //=============================
    var divConfMdp = document.createElement("div");
    var inputMdpConf = document.createElement("input");
    inputMdpConf.type = "password";
    inputMdpConf.placeholder = "Confirmer mot de passe";
    inputMdpConf.name = "mot_passeConf";
    inputMdpConf.id = "mot_passeConf";
    elemAnthentification.mot_passeConf = inputMdpConf;
    divConfMdp.appendChild(inputMdpConf);
    var pErrMdpConf = document.createElement("p");
    pErrMdpConf.id = "msgErrMdpConf";
    pErrMdpConf.className = "erreur";
    elemAnthentification.msgErrMdpConf = pErrMdpConf;
    divConfMdp.appendChild(pErrMdpConf);
    divGlobale.appendChild(divConfMdp);

    var divBtn = document.createElement("div");
    divBtn.id = "btn";
    //Bouton pour l'envoi:
    var divSubmit = document.createElement("div");
    var btnInscription = document.createElement("button");
    btnInscription.type = "submit";
    btnInscription.innerHTML = "Enregistrer";
    btnInscription.id = "btnInsc";
    btnInscription.className = "align2";
    divSubmit.appendChild(btnInscription);
    var pErrInscription = window.document.createElement("p");
    pErrInscription.id = "errInscription";
    elemAnthentification.msgErrInscription = pErrInscription;
    divSubmit.appendChild(pErrInscription);
    divBtn.appendChild(divSubmit);

    //Bouton pour l'annulation:
    var divAnnuler = document.createElement("div");
    var btnAnnuler = document.createElement("button");
    btnAnnuler.innerHTML = "Annuler";
    btnAnnuler.id = "btnAnn";
    btnAnnuler.className = "align2";
    btnAnnuler.addEventListener("click", afficherFormConnexion);
    divAnnuler.appendChild(btnAnnuler);
    divBtn.appendChild(divAnnuler);
    divGlobale.appendChild(divBtn);
    formInscription.appendChild(divGlobale);
    divReg.appendChild(formInscription);
    divRegister.appendChild(divReg);
    divClassModal.appendChild(divRegister);
    divInscription.appendChild(divClassModal);
    elemAnthentification.divInscription = divInscription;
  }
  elemAnthentification.courriel.value = "";
  elemAnthentification.nom_util.value = "";
  elemAnthentification.mot_passe.value = "";
  elemAnthentification.mot_passeConf.value = "";
  document.body.appendChild(elemAnthentification.divInscription);

}


//************************************************* */
//Fonction pour valider le formulaire d'inscription
//Suivi d'un appel à la fonction de création de 
//compte si tous les champs sont valides.
//************************************************** */
function validerFormulaireInsc(e) {
  e.preventDefault();

  //Validation du nom:
  if (elemAnthentification.nom_util.value.trim() === "") {
    elemAnthentification.msgErrNom.innerHTML = "Le nom est requis!";
    elemAnthentification.nbErreurs += 1;
  } else if (!elemAnthentification.formatNomUtil.test(elemAnthentification.nom_util.value)) {
    elemAnthentification.msgErrNom.innerHTML = "Le nom doit avoir 5 au minimun caractères.";
    elemAnthentification.nbErreurs += 1;
  } else {
    elemAnthentification.msgErrNom.innerHTML = '';
  }
  
  //Validation du courriel:
  if (elemAnthentification.courriel.value.trim() === "") {
    elemAnthentification.msgErrCourriel.innerHTML = "Le courriel est requis!";
    elemAnthentification.nbErreurs += 1;

  } else if (!elemAnthentification.formatCourriel.test(elemAnthentification.courriel.value)) {
    elemAnthentification.msgErrCourriel.innerHTML = "Format de courriel non valide";
    elemAnthentification.nbErreurs += 1;
  } else {
    elemAnthentification.msgErrCourriel.innerHTML = '';
  }

  //Validation des mots de passe:
  if (elemAnthentification.mot_passe.value.trim() !== elemAnthentification.mot_passeConf.value.trim()) {
    elemAnthentification.msgErrMdpConf.innerHTML = "Les mots de passe ne sont pas identiques.\nVeuillez réessayer!"
    elemAnthentification.nbErreurs += 1;

  }
  if (elemAnthentification.mot_passe.value.trim() === "") {
    elemAnthentification.msgErrMdp.innerHTML = "Le mot de passe est requis!";
    elemAnthentification.nbErreurs += 1;

  } else if (elemAnthentification.mot_passe.value.length < 5) {
    elemAnthentification.msgErrMdp.innerHTML = "Le mot de passe doit avoir au minimum 5 caractères.";
    elemAnthentification.nbErreurs += 1;

  } else {
    elemAnthentification.msgErrMdpConf.innerHTML = '';
  }
  console.log(elemAnthentification.estValid);
  if (elemAnthentification.nbErreurs === 0) {
    creerCompte(elemAnthentification.courriel.value, elemAnthentification.nom_util.value, elemAnthentification.mot_passe.value);
  }

}

/**Fonction pour la création d'un nouveau compte
 * 
 * @param  courriel //Le courriel du nouvel utilisateur
 * @param  nom      //Le nom du nouvel utilisateur
 * @param  passe   //Le mot de passe du nouvel utilisateur
 */
function creerCompte(courriel, nom, passe) {
  if (nom.length > 0 && passe.length > 0) {

    var dataCreation = {
      "nom_util": nom,
      "courriel": courriel,
      "mot_passe": passe
    };

    if (donneesMembre.clientHttp) {

      donneesMembre.clientHttp.abort();
    }
    donneesMembre.clientHttp = new XMLHttpRequest();
    envoyerRequeteAjax(
      donneesMembre.clientHttp,
      "/api/membres",
      "POST",
      dataCreation,
      retournerReponseCreation);
  }
}


/**
 * 
 */
function retournerReponseCreation() {
  if (donneesMembre.clientHttp.readyState === 4) {
    console.log("donneesMembre.clientHttp.status: " + donneesMembre.clientHttp.status);
    if (donneesMembre.clientHttp.status !== 201) {
      console.log(
        'Erreur (code=' + donneesMembre.clientHttp.status +
        '): La requête HTTP n\'a pu être complétée.');

    } else {
      try {

        donneesMembre.clientHttp = null;
        var nom = elemAnthentification.nom_util.value.trim();
        var motPasse = elemAnthentification.mot_passe.value.trim();
        seConnecter(nom, motPasse);
      } catch (e) {
        console.error(
          'La réponse AJAX n\'est pas une expression JSON valide.');
        console.error(e.message);
      }
    }
  }
}


/**
 * 
 */
function chargerDonneesMembre() {

  if (donneesMembre.clientHttp) {
    // Annuler la requête en cours s'il y a lieu car on lancera une nouvelle
    donneesMembre.clientHttp.abort();
  }
  donneesMembre.clientHttp = new XMLHttpRequest();
  envoyerRequeteAjax(

    donneesMembre.clientHttp,
    "api/membres/" + localStorage.getItem("mem_id"),
    'GET',
    new Array(0),
    gererReponseGetMembre);
}

/**
 * 
 */
function gererReponseGetMembre() {
  if (donneesMembre.clientHttp.readyState === 4) {
    console.log("donneesMembre.clientHttp 4: " + donneesMembre.clientHttp.status);
    if (donneesMembre.clientHttp.status === 403 || donneesMembre.clientHttp.status === 404) {
      afficherFormConnexion();
    } else if (donneesMembre.clientHttp.status !== 200) {

      console.log(
        'Erreur (code=' + donneesMembre.clientHttp.status +
        '): La requête HTTP n\'a pu être complétée.');
    } else {
      try {
        var reponse = JSON.parse(donneesMembre.clientHttp.responseText);
        donneesMembre.clientHttp = null;
        donneesMembre.membre = reponse;
        //cacherMenuPrincipal();
       // cacherMenuMesCollections();//lien2 du menu
        reinitialiserCarte();
        //afficherMenuPrincipal();
        afficherMenuAccueil();
      } catch (e) {
        console.error(
          'La réponse AJAX n\'est pas une expression JSON valide.');
        console.error(e.message);
      }
    }
  }
}

/**
 * Permet de cacher le formulaire de connexion
 * ou de création de compte.
 */
function cacherFormsConnCreaCompte() {
  if (elemAnthentification.divConn !== null && elemAnthentification.divConn.parentNode === document.body) {
    document.body.removeChild(elemAnthentification.divConn);
  }
  if (elemAnthentification.divInscription !== null && elemAnthentification.divInscription.parentNode === document.body) {
    document.body.removeChild(elemAnthentification.divInscription);
  }
}