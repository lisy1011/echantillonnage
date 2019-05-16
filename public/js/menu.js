"use strict";

var menu = {
    "divMenu": null,
    "menuReduit": false,
    "menuReponse": [],
    "typeAction": null,
    "estAdresseValide": false,
    "validerIdLieu": null,
    "partagerIdCollection": null,
    "idCollectionCree": null,
    "point_precis": "point_precis",
    "ensemble_points": "ensemble_points",
    "itineraire": "itineraire",
    "region_fermee": "region_fermee"
};

/*var TypeLieu = {
    "point_precis": "point_precis",
    "ensemble_points": "ensemble_points",
    "itineraire": "itineraire",
    "region_fermee": "region_fermee",
};*/

var typeAction = {
    "creerPoint": "creerPoint",
    "enregistrerLieu": "enregistrerLieu"
};

//******************************************************************** */
//* ================= Gestion du menu principal ======================= */
//******************************************************************** */

/**
 * 
 * @param {*} ajouterRetourCallback 
 */
/*function afficherMenuPrincipal(ajouterRetourCallback = true) {
    var div= document.createElement("div");
    div.id = "menu";
    //div.appendChild(creerMenu());
    //div.appendChild(document.createElement("hr"));
    div.appendChild(creerMenuCollectionsCrees());
    div.appendChild(document.createElement("hr"));
    div.appendChild(creerMenuLieuxNonClasses());
    div.appendChild(document.createElement("hr"));
    div.appendChild(creerMenuPartageCollection());
    menu.divMenu = div;
    document.body.appendChild(div);
    if (ajouterRetourCallback) {
        menu.menuReponse.push(afficherMenuPrincipal);
    }
}*/

function refreshMenuCourrant() {
    reinitialiserCarte();
    var showMenuCourrant = menu.menuReponse.pop();
    showMenuCourrant();
}

/*function creerMenu() {
    var div = document.createElement("div");
    div.id = "menuPrinc";
    var btnDeconnexin = document.createElement("button");
    btnDeconnexin.id = "btnDecon";
    btnDeconnexin.className = "btnDeconn";
    //var i = document.createElement("i");
    //i.className = "fa fa-sign-out";
    //btnDeconnexin.appendChild(i);
    //btnDeconnexin.addEventListener("click", seDeconnecter);
    //div.appendChild(btnDeconnexin);
    var btn = document.createElement("button");
    btn.id = "btncache";
    btn.className = "btnDeconn";
    var i2 = document.createElement("i");
    i2.className = "fa fa-window-minimize";
    btn.appendChild(i2);
    btn.addEventListener("click", reduireMenu);
    div.appendChild(btn);
    var h3 = document.createElement("h3");
    h3.id = "menuPrinc";
    h3.innerHTML = "Echantillonnage";
    div.appendChild(h3);
    return div;
}*/

function ajouterBtnDerourerMenu(event, type = "plus") {
    var btn = document.createElement("button");
    btn.id = "btnPlus";
    btn.className = "btnPlus";
    var i = document.createElement("i");
    if (type === "plus") {
        i.className = "fa fa-plus";
    } else {
       // i.className = "fa fa-check";
       i.className="btn btn-default";
       i.innerHTML="Ajouter autre position";
       i.style.height="2px";
       i.style.padding="0px";
       i.style.fontStyle="normal";
      
    }
    btn.appendChild(i);
    if (event !== null) {
        btn.addEventListener("click", event, false);
    }
    return btn;
}

function ajouterBtnRetourMenu() {
    /*var btn = document.createElement("button");
    btn.id = "btnRetour";
    btn.className = "btnRetour";
    var i = document.createElement("i");
    i.className = "fa fa-arrow-left";
    btn.appendChild(i);
    btn.addEventListener("click", rappellerMenu, false);
    return btn;*/
    var btnAnnuler = document.createElement("button");
    btnAnnuler.id = "btnRetour";
    btnAnnuler.innerHTML="Annuler";
    btnAnnuler.className = "align2";
    btnAnnuler.addEventListener("click", rappellerMenu, false);
    return btnAnnuler;
}

function rappellerMenu() {
    supprimerGestEventClickCarte();
    reinitialiserCarte();
    if (menu.menuReponse.length > 1) {
        menu.menuReponse.pop();
        var menuPrec = menu.menuReponse.pop();
        menu.menuReponse.push(menuPrec);
        menuPrec(false);
    }
  
}

function reinitialiserCarte() {
    donneesMembre.collections_crees = [];
    donneesMembre.collections_invitees = [];
    donneesMembre.lieux_non_classes = [];
    viderCarte();
}

function checkboxChangement(cb) {
    var id = parseInt(cb.id.slice(3), 10);
	// variable permettant de vérifier si la carte a été modifiée.
    var estmodifie = true;
    if (cb.name === 'collection') {
        if (cb.checked) {
           
            donneesMembre.collections_crees.push(id);
        } else {
            var index = donneesMembre.collections_crees.indexOf(id);
            if (index > -1) {
                donneesMembre.collections_crees.splice(index, 1);
            }
        }
    } else if (cb.name === 'collectionsInv') {
        if (cb.checked) {
            donneesMembre.collections_invitees.push(id);
        } else {
            var index = donneesMembre.collections_invitees.indexOf(id);
            if (index > -1) {
                donneesMembre.collections_invitees.splice(index, 1);
            }
        }
    } else if (cb.name === 'lieu') {
        if (cb.checked) {
            donneesMembre.lieux_non_classes.push(id);
        } else {
            var index = donneesMembre.lieux_non_classes.indexOf(id);
            if (index > -1) {
                donneesMembre.lieux_non_classes.splice(index, 1);
            }
        }
    } else if (cb.name === 'partage') {
        actualisercolInvitees(cb.checked);
        if (cb.checked === true) {
            estmodifie = false;
        }
    }
    if (estmodifie) {
        actualiserCarte();
    }

}

function ajouterElementMenu(parent, typeElement, idElement, nomElement, partage = false, effacer = false, send = false, click = false) {
    
    var htmlCode = '<label class="switch">' +
        '<input type="checkbox" onclick="checkboxChangement(this)" id=id_' + idElement + ' name=' + typeElement + '>' +
        '<i class="slider round"></i></label> ';
    if (click) 
	{
        htmlCode += '<a id=maCol_' + idElement + ' onclick="consulterCollectionCree(this)">' + nomElement + '</a>';
    } 
	else 
	{
        htmlCode += nomElement;
    }
    
    var div = document.createElement("div");

    if (effacer) {
        htmlCode += '<button class="btn" id=id_' + idElement + ' name=' + typeElement + ' onclick="supprimerElement(this)"><i class="fa fa-remove"></i></button>';
    }
    if (partage) {
        htmlCode += '<button class="btn" id=id_' + idElement + ' name=' + typeElement + ' onclick="partagerCollectionBtnClick(this)"><i class="fa fa-share-alt"></i></button>';
    }
    if (send) {
        htmlCode += '<button class="btn" id=id_' + idElement + ' name=' + typeElement + ' onclick="enregistrerLieuBtn(this)"><i class="fa fa-paper-plane"></i></button>';
    }

    div.innerHTML = htmlCode;
    parent.appendChild(div);
}

function consulterCollectionCree(e) {
    menu.idCollectionCree = parseInt(e.id.slice(6), 10);
    afficherMenuCollectionCree();
}

function supprimerElement(btn) {
    var id = parseInt(btn.id.slice(3), 10);
    if (btn.name === 'lieu') {
        effacerLieu(id);
    } else if (btn.name === 'collection') {
        supprimerCollection(id);
    }
}

function partagerCollectionBtnClick(btn) {
    menu.partagerIdCollection = parseInt(btn.id.slice(3), 10);
    showPartagerCollectionMenu();
}

function enregistrerLieuBtn(btn) {
    menu.validerIdLieu = parseInt(btn.id.slice(3), 10);
    ajouterLieuAuMenu();
}

/*function reduireMenu() {
    var children = menu.divMenu.children;
    var displayStyle = "none";
    if (menu.menuReduit) {
        displayStyle = "block";
        menu.menuReduit = false;
    } else {
        menu.menuReduit = true;
    }
    for (var i = 0; i < children.length; i++) {
        if (children[i].id !== "menuPrinc") {
            children[i].style.display = displayStyle;
        }
    }
}*/

//***********Gestion des lieux non classés *********************/

function afficherMenuAjoutLieu(ajouterRetourCallback = true) {
    cacherMenuPrincipal();
    reinitialiserCarte();
    var div1 = document.createElement("div");
    div1.id = "menu";
    //div1.appendChild(creerMenu());
   // div1.appendChild(document.createElement("hr"));

    var h4 = document.createElement("h4");
    h4.innerHTML = "Création d'un nouveau lieu";
    div1.appendChild(h4);

    div1.appendChild(creerMenuAjoutLieu());
    div1.appendChild(ajouterBtnRetourMenu());
    menu.divMenu = div1;
    document.body.appendChild(div1);
     if (ajouterRetourCallback) {
        menu.menuReponse.push(afficherMenuAjoutLieu);
    } 
}


function ajouterLieuAuMenu(ajouterRetourCallback = true) {
    cacherMenuPrincipal();
    reinitialiserCarte();
    var div2 = document.createElement("div");
    div2.id = "menu";
    //div2.appendChild(creerMenu());
    //div2.appendChild(document.createElement("hr"));
    div2.appendChild(creerMenuAjoutLieuACollection());
    div2.appendChild(ajouterBtnRetourMenu());
    menu.divMenu = div2;
    document.body.appendChild(div2);
    if (ajouterRetourCallback) {
        menu.menuReponse.push(ajouterLieuAuMenu);
    }
}

function creerMenuAjoutLieu() {
    var div3 = document.createElement("div");

    var p = document.createElement("p");
    p.appendChild(document.createTextNode("Vous devez inscrire le nom du lieu"));
    p.className = "erreur";
    p.id = "pErreur";
    //pErreur.style.display = "none";
    p.style.display = "none";
    div3.appendChild(p);

    var nom = document.createElement("input");
    nom.type = "text";
    nom.id = "nomLieu";
    nom.placeholder = "Nom du lieu";
    div3.appendChild(nom);

    var description = document.createElement("textarea");
    description.id = "description";
    description.placeholder = "Informations diverses sur le lieu";
    div3.appendChild(description);

    var selectTypeLieu = document.createElement("select");
    selectTypeLieu.id = "typeLieuChoisi";
    var option0 = document.createElement("option");
    option0.innerText = "Veuillez choisir le type de lieu";
    option0.selected = true;
    option0.disabled = true;
    var option1 = document.createElement("option");
    option1.innerText = "Un point précis";
    option1.value = menu.point_precis;
    var option2 = document.createElement("option");
    option2.innerText = "Un ensemble de points";
    option2.value = menu.ensemble_points;
    var option3 = document.createElement("option");
    option3.innerText = "Un itinéraire";
    option3.value = menu.itineraire;
    var option4 = document.createElement("option");
    option4.innerText = "Une région fermée";
    option4.value = menu.region_fermee;
    selectTypeLieu.appendChild(option0);
    selectTypeLieu.appendChild(option1);
    selectTypeLieu.appendChild(option2);
    selectTypeLieu.appendChild(option3);
    selectTypeLieu.appendChild(option4);
    selectTypeLieu.addEventListener("change", validerTypeLieuChoisi, false);
    div3.appendChild(selectTypeLieu);
    var divPlus=document.createElement("div");
    divPlus.id="divPlus";

    var btnPlus = ajouterBtnDerourerMenu(ajouterElemCreerPointAuMenu, "check");
   
    //div3.appendChild(document.createElement("hr"));
    btnPlus.style.display = "none";
    divPlus.appendChild(btnPlus);
    var btn = document.createElement("button");
    btn.id = "utiliserMaPositionButton";
    btn.style.display = "none";
    btn.className = "btnUtiliserMaPosition";
    btn.appendChild(document.createTextNode("Utiliser ma position"));
    btn.addEventListener("click", validerPosition);
    divPlus.appendChild(btn);
    div3.appendChild(divPlus);
   

    var p2 = document.createElement("p");
    p2.appendChild(document.createTextNode(" "));
    p2.className = "erreur";
    p2.id = "pErrAjoutPoints";
    //pErreur.style.display = "none";
    p2.style.display = "none";
    div3.appendChild(p2);

    var h = document.createElement("h4");
    h.id = "textAjouterPoint";
    var t = document.createTextNode("");
    h.appendChild(t);

    div3.appendChild(h);

    var divPoints = document.createElement("div");


    divPoints.id = "points";
    divPoints.style.display = "none";
    div3.appendChild(divPoints);

    var pErreurCoord = document.createElement("p");
    pErreurCoord.appendChild(document.createTextNode("Adresse invalide"));
    pErreurCoord.className = "erreur";
    pErreurCoord.id = "pErreurCoord";
    pErreurCoord.style.display = "none";
    div3.appendChild(pErreurCoord);

    

    /*var btn = document.createElement("button");
    btn.style.display = "none";
    btn.id = "btnEnregistrer";
    btn.className = "btnEnregistrer";
    btn.type = "submit";
    var i1 = document.createElement("i");
    i1.className = "fa fa-save";
    i1.style = "font-size:25px";
    btn.appendChild(i1);
    btn.addEventListener("click", validerEnvoieLieu);
    div3.appendChild(btn);*/
    var btn = document.createElement("button");
    btn.type = "submit";
    btn.style.display = "none";
    btn.innerHTML="Enregistrer";
    btn.id = "btnEnregistrer";
    btn.className = "align2";
    btn.addEventListener("click", validerEnvoieLieu);   
    div3.appendChild(btn);
    return div3;
}

function creerMenuAjoutLieuACollection() {
    var div4 = document.createElement("div");

    var champErr = document.createElement("p");
    champErr.appendChild(document.createTextNode("Vous devez choisir une collection"));
    champErr.className = "erreur";
    champErr.id = "pErreur";
    champErr.style.display = "none";
    div4.appendChild(champErr);

    var h4 = document.createElement("h4");
    h4.innerHTML = "Envoyer le lieu dans ";
    div4.appendChild(h4);
	
	//** collection où on veut envoyer le lieu*/
    var colCible = document.createElement("select");
    colCible.addEventListener("change", envoyerCollectionSelectChange, false);
    colCible.id = "colCible";
    var optionDefault = document.createElement("option");
    optionDefault.innerText = "Selectionner la collection";
    optionDefault.selected = true;
    optionDefault.disabled = true;
    colCible.appendChild(optionDefault);

    for (var i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
        var option = document.createElement("option");
        option.innerText = donneesMembre.membre.collections_crees[i].nom;
        option.value = donneesMembre.membre.collections_crees[i]._id;
        colCible.appendChild(option);
    }

    div4.appendChild(colCible);

   /*var btn = document.createElement("button");
    btn.style.display = "none";
    btn.id = "btnEnregistrer";
    btn.className = "btnEnregistrer";
    btn.type = "submit";
    var i = document.createElement("i");
    i.className = "fa fa-save";
    i.style = "font-size:25px";
    btn.appendChild(i);
    btn.addEventListener("click", validerLieuTransmis);
    div4.appendChild(btn);*/
   var btn = document.createElement("button");
    btn.type = "submit";
    //btn.style.display = "none";
    btn.innerHTML="Enregistrer";
    btn.id = "btnEnregistrer";
    btn.className = "align2";
    btn.addEventListener("click", validerLieuTransmis);   
    div4.appendChild(btn);
    return div4;
}

function envoyerCollectionSelectChange() {
    document.getElementById("btnEnregistrer").style.display = "block";
}

function validerLieuTransmis() {
    var idColCible = document.getElementById("colCible");
    var idCol = idColCible.value;
    var idLieu = menu.validerIdLieu;
    envoyerLieuCollection(idLieu, idCol);
    envoyerLieuBd(idLieu, idCol);
    rappellerMenu();
}

function validerEnvoieLieu() {
    if (estTypeLieuValide()) {
        menu.typeAction = typeAction.enregistrerLieu;
        validerAdresse();
    }
}

function estTypeLieuValide() {
    var estQteValide = true;
    /** On valide le nombre de points en fonction du type de lieu qu'on veut.*/
    var typeLieu = document.getElementById("typeLieuChoisi").value;
    var donneesLieu = obtenirDonnesCreationLieu();
    var qtePoints = donneesLieu.coordonnees.length;
    switch (typeLieu) {
        case menu.point_precis:
            if (qtePoints !== 1) {
                estQteValide = false;
               document.getElementById("pErrAjoutPoints").innerText="Choisir au moins 1 point";
               document.getElementById("pErrAjoutPoints").style.display = "block";
            }
            break;
		case menu.itineraire:
            if (qtePoints < 2) {
                estQteValide = false;
                document.getElementById("pErrAjoutPoints").innerText="Choisir au moins 2 points";
               document.getElementById("pErrAjoutPoints").style.display = "block";
            }
            break;
        case menu.region_fermee:
            if (qtePoints < 3) {
                estQteValide = false;
                document.getElementById("pErrAjoutPoints").innerText="Choisir au moins 3 points";
               document.getElementById("pErrAjoutPoints").style.display = "block";            }
            break;
        case menu.ensemble_points:
            if (qtePoints < 2) {
                estQteValide = false;
                document.getElementById("pErrAjoutPoints").innerText="Choisir au moins 2 points";
                document.getElementById("pErrAjoutPoints").style.display = "block";
            }
            break;
        default:
            break;
    }
    return estQteValide;
}

function enregistrerLieu(lieu) {
    if (document.getElementById("nomLieu").value.length === 0) {
        document.getElementById("pErreur").style.display = "block";
    } else {
        //************ */
        lieu.nom=document.getElementById("nomLieu").value;
        ajouterLieuServer(lieu);
        refreshMenuCourrant();
    }
}

function validerPosition() {
    geolocaliserPosition();
}

function ajouterElemCreerPointAuMenu() {
    validerAdresse();
    var activeInput = obtenirAddrInputActive();
    var selectTypeLieu = document.getElementById("typeLieuChoisi");
    if (document.getElementById("points").children.length === 0 ||
        (activeInput.inputAdresseActive === null &&
            activeInput.labelCoordActive === null) && selectTypeLieu.value !== menu.point_precis) {
        var inpAdrCoord = document.createElement("input");
        inpAdrCoord.id = "pointInput";
        inpAdrCoord.type = "text";
        inpAdrCoord.placeholder = "Écrivez une adresse ou cliquez sur la carte";
        var coordLabel = document.createElement("label");
        coordLabel.id = "coordLabel";
        coordLabel.style.display = "none";
        document.getElementById("points").appendChild(inpAdrCoord);
        document.getElementById("points").appendChild(coordLabel);
    } else {
        menu.typeAction = typeAction.creerPoint;
    }
}

function validerTypeLieuChoisi() {
    var selectTypeLieu = document.getElementById("typeLieuChoisi");
    document.getElementById("textAjouterPoint").innerText = "Ajoutez les points";
    //document.getElementById("btnPlusMinus").style.display = "block";
    document.getElementById("btnPlus").style.display = "block";
    selectTypeLieu.disabled = true;
    document.getElementById("points").style.display = "block";
    document.getElementById("btnEnregistrer").style.display = "block";
    document.getElementById("utiliserMaPositionButton").style.display = "block";
    ajouterGestEventClickCarte(eventAjoutPointSurCarte);
    ajouterElemCreerPointAuMenu();
}

function eventAjoutPointSurCarte(e) {
    var inputCorrecte = obtenirAddrInputActive();
    inputCorrecte.inputAdresseActive.value = e.latLng.toUrlValue(10);
    inputCorrecte.labelCoordActive.innerText = e.latLng.toUrlValue(10);
    ajouterElemCreerPointAuMenu();
}

function getCurrentPositionSuccess(position) {
    var inputCorrecte = obtenirAddrInputActive();
    inputCorrecte.inputAdresseActive.value = position.coords.latitude.toFixed(10) + "," + position.coords.longitude.toFixed(10);
    inputCorrecte.labelCoordActive.innerText = position.coords.latitude.toFixed(10) + "," + position.coords.longitude.toFixed(10);
}

function creerMenuLieuxNonClasses() {
    var divMesLieux = document.createElement("div");
    divMesLieux.appendChild(ajouterBtnDerourerMenu(afficherMenuAjoutLieu));
    var h4 = document.createElement("h4");
    h4.innerHTML = "Les lieux non classés";
    divMesLieux.appendChild(h4);
    var divLieux = document.createElement("div");
    divLieux.id = "lieux";
    for (var i = 0; i < donneesMembre.membre.lieux_non_classes.length; i++) {
        var lieuNom = donneesMembre.membre.lieux_non_classes[i].nom;
        var idLieu = donneesMembre.membre.lieux_non_classes[i]._id;
        ajouterElementMenu(divLieux, "lieu", idLieu, lieuNom, false, true, true);
    }
    divMesLieux.appendChild(divLieux);
    return divMesLieux;
}


//************ Gestion des collections créées *******************/

function creerMenuCollectionsCrees() {
    var divMesCollections = document.createElement("div");
    divMesCollections.appendChild(ajouterBtnDerourerMenu(showAjouterCollectionMenu));
    var h4Col = document.createElement("h4");
    h4Col.innerHTML = "Mes collections";
    divMesCollections.appendChild(h4Col);
    var divCollections = document.createElement("div");
    divCollections.id = "collections";
    for (var i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
        var colNom = donneesMembre.membre.collections_crees[i].nom;
        var colId = donneesMembre.membre.collections_crees[i]._id;
        ajouterElementMenu(divCollections, "collection", colId, colNom, true, true, false, true);
    }
    divMesCollections.appendChild(divCollections);
    return divMesCollections;
}

function showAjouterCollectionMenu(ajouterRetourCallback = true) {
    //cacherMenuPrincipal();
    cacherMenuMesCollections();
    reinitialiserCarte();
    createMenuAjouterCollection();
}


function afficherMenuCollectionCree(ajouterRetourCallback = true) {
    //cacherMenuPrincipal();
    cacherMenuMesCollections();
    reinitialiserCarte();
    var divMenu = document.createElement("div");
    divMenu.id = "menu";
   // divMenu.appendChild(creerMenu());
    //divMenu.appendChild(document.createElement("hr"));
    divMenu.appendChild(createMenuLieuxDeMaCollection());
    //divMenu.appendChild(document.createElement("hr"));
    divMenu.appendChild(ajouterBtnRetourMenu());
    menu.divMenu = divMenu;
    document.body.appendChild(divMenu);
    if (ajouterRetourCallback) {
        menu.menuReponse.push(afficherMenuCollectionCree);
    }
}


function createMenuAjouterCollection() {
    var divAjouterCollection = document.createElement("div");
    divAjouterCollection.id = "menuAjoutCollection";

    var h4Collection = document.createElement("h4");
    h4Collection.innerHTML = "Créer une nouvelle collection";
    divAjouterCollection.appendChild(h4Collection);

    var pErreur = document.createElement("p");
    pErreur.appendChild(document.createTextNode("Veuillez inscrire le nom de la collection."));
    pErreur.className = "erreur";
    pErreur.id = "pErreur";
    pErreur.style.display = "none";
    divAjouterCollection.appendChild(pErreur);

    var nom = document.createElement("input");
    nom.type = "text";
    nom.id = "nomInput";
    nom.placeholder = "Nom de la collection";
    divAjouterCollection.appendChild(nom);

    //divAjouterCollection.appendChild(document.createElement("hr"));

    /*var btn = document.createElement("button");
    btn.id = "btnEnregistrer";
    btn.className = "btnEnregistrer";
    btn.type = "submit";
    var btnI = document.createElement("i");
    btnI.className = "fa fa-save";
    btnI.style = "font-size:25px";
    btn.appendChild(btnI);*/
    var btnEnregistrer=document.createElement("button");
    btnEnregistrer.type = "submit";
    btnEnregistrer.innerHTML = "Enregistrer";
    btnEnregistrer.id = "btnEnregistrer";
    btnEnregistrer.className = "align2";
    btnEnregistrer.addEventListener("click", validerEnregistrerCollection);
    divAjouterCollection.appendChild(btnEnregistrer);
    divAjouterCollection.appendChild(ajouterBtnRetourMenu());
    document.body.appendChild(divAjouterCollection);
   //return divAjouterCollection;
}

function validerEnregistrerCollection() {
    var nomCollection = document.getElementById("nomInput").value;
    if (nomCollection.length > 0) {
         ajouterCollectionBd(nomCollection);
    } else {
        document.getElementById("pErreur").style.display = "block";
    }
}

function createMenuLieuxDeMaCollection() {
    var divLieuxDeLaCollection = document.createElement("div");
    var h4Lieux = document.createElement("h4");
    h4Lieux.innerHTML = "Gérer ma collection";
    divLieuxDeLaCollection.appendChild(h4Lieux);
    var divLieux = document.createElement("div");
    divLieux.id = "lieux";
    for (var i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
        if (donneesMembre.membre.collections_crees[i]._id === menu.idCollectionCree) {
            for (var j = 0; j < donneesMembre.membre.collections_crees[i].lieux.length; j++) {
                var lieuNom = donneesMembre.membre.collections_crees[i].lieux[j].nom;
                var lieuId = donneesMembre.membre.collections_crees[i].lieux[j]._id;
                ajouterElementMenu(divLieux, "lieu", lieuId, lieuNom, false, true, true);
            }
        }
    }
    divLieuxDeLaCollection.appendChild(divLieux);
    return divLieuxDeLaCollection;
}

function supprimerCollection(idColl){
    var collection = null;
    var i = 0;
    var index = -1;
    for (i = 0; i < donneesMembre.membre.collections_crees.length; i++) {
        if (donneesMembre.membre.collections_crees[i]._id === idColl) {
            collection = donneesMembre.membre.collections_crees[i];
            index = donneesMembre.membre.collections_crees.indexOf(collection);
            if (index > -1) {
                donneesMembre.membre.collections_crees.splice(index, 1);
            }
            supprimerCollectionBd(idColl);
            refreshMenuCourrant();
            break;
        }
    }
}


//************Gestion du partage de collections ***************/

function showPartagerCollectionMenu(ajouterRetourCallback = true) {
    //cacherMenuPrincipal();
    cacherMenuMesCollections();
    reinitialiserCarte();
    var divMenu = document.createElement("div");
    divMenu.id = "menu";
    //divMenu.appendChild(creerMenu());
    //divMenu.appendChild(document.createElement("hr"));
    divMenu.appendChild(createMenuPartagerCollection());
    divMenu.appendChild(ajouterBtnRetourMenu());
    menu.divMenu = divMenu;
    document.body.appendChild(divMenu);
    if (ajouterRetourCallback) {
        menu.menuReponse.push(showPartagerCollectionMenu);
    }
}

function createMenuPartagerCollection() {
    var divPartagerCollection = document.createElement("div");

    var pErreur = document.createElement("p");
    pErreur.appendChild(document.createTextNode("Vous devez inscrire un nom d'utilisateur valide"));
    pErreur.className = "erreur";
    pErreur.id = "pErreur";
    pErreur.style.display = "none";
    divPartagerCollection.appendChild(pErreur);

    var nom = document.createElement("input");
    nom.type = "text";
    nom.id = "nomInput";
    nom.placeholder = "Nom de l'utilisateur";
    divPartagerCollection.appendChild(nom);

    var btn = document.createElement("button");
    /*btn.id = "btnEnregistrer";
    btn.className = "btnEnregistrer";
    btn.type = "submit";
    var btnI = document.createElement("i");
    btnI.className = "fa fa-share-alt";
    btnI.style = "font-size:25px";
    btn.appendChild(btnI);*/
    btn.type = "submit";
    //btn.style.display = "none";
    btn.innerHTML="Enregistrer";
    btn.id = "btnEnregistrer";
    btn.className = "align2";
    btn.addEventListener("click", partagerCollection);
    divPartagerCollection.appendChild(btn);

   return divPartagerCollection;
}

function partagerCollection() {
   
    document.getElementById("pErreur").style.display = "none";
    var colId = menu.partagerIdCollection;
    var nomUtilPartage = document.getElementById("nomInput").value;
    partagerCollectionBd(colId, nomUtilPartage);
}

function partagerColletionReponseOk(collection) {
    partagerCollectionClient(menu.partagerIdCollection, parseInt(collection.partagee_avec));
  rappellerMenu();
   //refreshMenuCourrant();
   //afficherMenuMesCollections();
   //cacherMenuPartagerCollections();
}

function creerMenuPartageCollection() {
    var divCollectionsPartages = document.createElement("div");
    var h4Partage = document.createElement("h4");
    h4Partage.innerHTML = "Collections Partagées";
    divCollectionsPartages.appendChild(h4Partage);
    var divPartage = document.createElement("div");
    divPartage.id = "partage";
    ajouterElementMenu(divPartage, "partage", 0, "Voir collections partages");
    divCollectionsPartages.appendChild(divPartage);
    return divCollectionsPartages;
}


//***********Gestion des collections invitees *******************/

function afficherCollectionsInvitees() {
    var div = document.createElement("div");
    div.id = "colInvitees";
   /* for (var i = 0; i < donneesMembre.colInvitees.length; i++) {
        var nomCollection = donneesMembre.colInvitees[i].nom;
        var idCollection = donneesMembre.colInvitees[i]._id;
        ajouterElementMenu(div, "collectionsInv", idCollection, nomCollection);
    }*/
    for (var i = 0; i < donneesMembre.collections_invitees.length; i++) {
        var nomCollection = donneesMembre.collections_invitees[i].nom;
        var idCollection = donneesMembre.collections_invitees[i]._id;
        ajouterElementMenu(div, "collectionsInv", idCollection, nomCollection);
    }
    menu.divMenu.appendChild(div);
}

function actualisercolInvitees(visible) {
   // if (donneesMembre.colInvitees === null) {
    //if (donneesMembre.collections_invitees === null) {
        if (donneesMembre.collections_invitees.length === 0) {
        envoyerRechercheColInvitees();
    } else {
        if (visible) {
            console.log("donneesMembre.collections_invitees.length : "+donneesMembre.collections_invitees.length);
            afficherCollectionsInvitees();
        } else {
            cacherCollectionsInvitees();
            donneesMembre.collections_invitees = [];
        }
    }
}

function cacherCollectionsInvitees() {
    var divColInv = document.getElementById("colInvitees");
    menu.divMenu.removeChild(divColInv);
}

//******* Gestion de l'ajout d'un lieu sur la carte ****************/

function validerAdresse() {
    document.getElementById("pErreurCoord").style.display = "none";
    if (menu.estAdresseValide === false) {
        menu.estAdresseValide = true;
        var inputCorrecte = obtenirAddrInputActive();
        if (inputCorrecte.inputAdresseActive !== null && inputCorrecte.labelCoordActive !== null &&
            inputCorrecte.inputAdresseActive.value.length > 0) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                address: inputCorrecte.inputAdresseActive.value
            }, function (results, status) {
                var latLng = "";
                if (validerInputCoordonnees(inputCorrecte.inputAdresseActive.value) === true) {
                    latLng = inputCorrecte.inputAdresseActive.value;
                } else if (status == google.maps.GeocoderStatus.OK && validateCoordonates(results[0].geometry.location.lat(), results[0].geometry.location.lng())) {
                    latLng = results[0].geometry.location.lat().toFixed(10) +
                        "," + results[0].geometry.location.lng().toFixed(10);
                } else {
                    document.getElementById("pErreurCoord").style.display = "block";
                    menu.estAdresseValide = false;
                    return;
                }
                inputCorrecte.inputAdresseActive.disabled = true;
                inputCorrecte.labelCoordActive.disabled = true;
                inputCorrecte.labelCoordActive.innerText = latLng;
                menu.estAdresseValide = false;
                continuerValidationAdresse();

            });
        } else {
            menu.estAdresseValide = false;
            continuerValidationAdresse();
        }
    }

}

function validerInputCoordonnees(input) {
    var coordonneesValides = true;
    var inputSplit = input.split(',');
    if (input.includes(',') === false) {
        coordonneesValides = false;
    } else if (inputSplit.length !== 2) {
        coordonneesValides = false;
    } else if (validateCoordonates(parseFloat(inputSplit[0]), parseFloat(inputSplit[1])) === false) {
        coordonneesValides = false;
    }
    return coordonneesValides;
}

function validateCoordonates(lat, long) {
    var coordValides = true;
    if (lat < 20 || lat > 80 || long < -160 || long > -50) {
        coordValides = false;
    }
    return coordValides;
}

function continuerValidationAdresse() {
    var action = menu.typeAction;
    menu.typeAction = null;
    var lieu = obtenirDonnesCreationLieu();
    carteAfficherMarquersCoordonnes(lieu.coordonnees);
    if (action === typeAction.creerPoint) {
        ajouterElemCreerPointAuMenu();
    } else if (action === typeAction.enregistrerLieu) {
        enregistrerLieu(lieu);
    }
}

function obtenirAddrInputActive() {
    var inputAdresseActive = null;
    var labelCoordActive = null;

    var divPoints = document.getElementById("points");
    if (divPoints !== null) {
        var enfants = divPoints.children;
        for (var i = 0; i < enfants.length; i++) {
            if (enfants[i].id ==="pointInput" && enfants[i].disabled !== true) {
                inputAdresseActive = enfants[i];
            }
            if (enfants[i].id === "coordLabel" && enfants[i].disabled !== true) {
                labelCoordActive = enfants[i];
            }
            if (inputAdresseActive !== null && labelCoordActive !== null) {
                break;
            }
        }
    }

    return {
        inputAdresseActive: inputAdresseActive,
        labelCoordActive: labelCoordActive
    };
}

function obtenirDonnesCreationLieu() {
    var lieu = {
        nom: null,
        commentaire: null,
        date_creation: null,
        type_lieu: null,
        coordonnees: []
    };

    var elements = document.getElementsByTagName("*");
    if (elements !== null) {
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].id == "coordLabel" && elements[i].innerText.length > 0) {
                var coord = elements[i].innerText.split(",");
                lieu.coordonnees.push({
                    "latitude": coord[0],
                    "longitude": coord[1]
                });
            }
            if (elements[i].id == "nomInput") {
                lieu.nom = elements[i].value;
            }
            if (elements[i].id === "description") {
                lieu.commentaire = elements[i].value;
            }
            if (elements[i].id === "typeLieuChoisi") {
                lieu.type_lieu = elements[i].value;
            }
        }
        lieu.date_creation = obtenirDateAujourdhui();
    }
    return lieu;
}

function obtenirDateAujourdhui() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + '/' + mm + '/' + dd;
    return today;
}

function cacherMenuPrincipal() {

    if(menu.divMenu !== null && menu.divMenu.parentNode === document.body) {
        document.body.removeChild(menu.divMenu);
        menu.divMenu = null;
    }
}


//************************************************* */
//Fonction pour afficher le menu d'accueil
//************************************************** */
function afficherMenuAccueil(){
    if(elemAnthentification.divMenuAccueil === null) {
        var divMenuAccueil = document.createElement("div");
        divMenuAccueil.id="cssmenu";
        var ulMenu=document.createElement("ul");
        var li1=document.createElement("li");
        li1.className="active";
        var elemA = document.createElement("a");
        elemA.href="";
        elemA.addEventListener("click", seDeconnecter);
        var elemSpan = document.createElement("span");
        var linkText = document.createTextNode(elemAnthentification.lien1);
        elemSpan.appendChild(linkText);
        elemA.appendChild(elemSpan);
        li1.appendChild(elemA);
        ulMenu.appendChild(li1);
        
  
        var li2=document.createElement("li");
        elemA = document.createElement("a");
        elemA.href="";
      //elemA.addEventListener("click", afficherMenuLien2);////////////////////////**** */
      elemA.addEventListener("click", switcherAffichageMenuMesCollections);
        elemSpan = document.createElement("span");
        linkText = document.createTextNode(elemAnthentification.lien2);
        elemSpan.appendChild(linkText);
        elemA.appendChild(elemSpan);
        li2.appendChild(elemA);
        //*************** */
        //li2.addEventListener('click',test(li2));
        //li2.appendChild(afficherCollectionsCrees());
        //=====================
        ulMenu.appendChild(li2);
        
        var li3=document.createElement("li");
        elemA = document.createElement("a");
        elemA.href="";
       elemA.addEventListener("click", switcherAffichageLieuxNc);
        elemSpan = document.createElement("span");
        linkText = document.createTextNode(elemAnthentification.lien3);
        elemSpan.appendChild(linkText);
        elemA.appendChild(elemSpan);
        li3.appendChild(elemA);
        ulMenu.appendChild(li3);
  
        var li4=document.createElement("li");
        elemA = document.createElement("a");///
        elemA.href="";
       elemA.addEventListener("click", switcherAffichageCollPartagees);
        elemSpan = document.createElement("span");
        linkText = document.createTextNode(elemAnthentification.lien4);
        elemSpan.appendChild(linkText);
        elemA.appendChild(elemSpan);
        li4.appendChild(elemA);
        ulMenu.appendChild(li4);
        
  
  
        //divDeconn.appendChild(pMenu);
        divMenuAccueil.appendChild(ulMenu);
        //divMenuAccueil.appendChild(afficherCollectionsCrees());
        elemAnthentification.divMenuAccueil=divMenuAccueil;
    }
   
    document.body.appendChild(elemAnthentification.divMenuAccueil);
   // document.body.appendChild(divMenuAccueil)
   
  }
  



//**************************************** */
//============Menu accueil=============
//****************************************** */
//-------Lien mes collections-----------------

/**
 * 
 * @param {*} ajouterRetourCallback 
 */
function afficherMenuMesCollections(ajouterRetourCallback = true) {
    elemAnthentification.menuLien2Affiche=true;
     var div= document.createElement("div");
     div.id = "menuLien2";
     //div.appendChild(creerMenu());
     //div.appendChild(document.createElement("hr"));
     div.appendChild(creerMenuCollectionsCrees());
    // div.appendChild(document.createElement("hr"));
     menu.divMenu = div;
     document.body.appendChild(div);
     if (ajouterRetourCallback) {
         menu.menuReponse.push(afficherMenuMesCollections);
     }
     
 }
 
 function cacherMenuMesCollections(){

    if (document.getElementById("menuLien2") !== null) {
     var div=document.getElementById("menuLien2");
    document.body.removeChild(div);}
 }

 function cacherMenuPartagerCollections(){

    if (document.getElementById("menu") !== null) {
     var div=document.getElementById("menu");
    document.body.removeChild(div);}
 }
 
 function switcherAffichageMenuMesCollections(e){
     e.preventDefault();
     
   if (document.getElementById("menuLien2") === null) {
    afficherMenuMesCollections();
   } else {
    cacherMenuMesCollections();
   }
 }

 //-------Lien lieux non classés-----------------

/**
 * 
 * @param {*} ajouterRetourCallback 
 */
function afficherMenuLieuxNc(ajouterRetourCallback = true) {
    
     var div= document.createElement("div");
     div.id = "menuLien3";
    // div.appendChild(creerMenu());
     //div.appendChild(document.createElement("hr"));
     div.appendChild(creerMenuLieuxNonClasses());
    // div.appendChild(document.createElement("hr"));
     menu.divMenu = div;
     document.body.appendChild(div);
     if (ajouterRetourCallback) {
         menu.menuReponse.push(afficherMenuLieuxNc);
     }
     
 }
 
 function cacherMenuLieuxNc(){

    if (document.getElementById("menuLien3") !== null) {
     var div=document.getElementById("menuLien3");
     document.body.removeChild(div);
    }
 }
 
 function switcherAffichageLieuxNc(e){
     e.preventDefault();
     
   if (document.getElementById("menuLien3") === null) {
    afficherMenuLieuxNc();
   } else {
    cacherMenuLieuxNc();
   }
 }

 //-------Lien collections non partagées--------------

/**
 * 
 * @param {*} ajouterRetourCallback 
 */
function afficherMenuCollPartagees(ajouterRetourCallback = true) {
    
     var div= document.createElement("div");
     div.id = "menuLien4";
    // div.appendChild(creerMenu());
     //div.appendChild(document.createElement("hr"));
     div.appendChild(creerMenuPartageCollection());
    // div.appendChild(document.createElement("hr"));
     menu.divMenu = div;
     document.body.appendChild(div);
     if (ajouterRetourCallback) {
         menu.menuReponse.push(afficherMenuCollPartagees);
     }
     
 }
 
 function cacherMenuCollPartagees(){

    if (document.getElementById("menuLien4") !== null) {
     var div=document.getElementById("menuLien4");
     document.body.removeChild(div);
    }
 }
 
 function switcherAffichageCollPartagees(e){
     e.preventDefault();
     
   if (document.getElementById("menuLien4") === null) {
    afficherMenuCollPartagees();
   } else {
    cacherMenuCollPartagees();
   }
 }