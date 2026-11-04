// FILTRES ET CONNEXIONS : membre integration

// Petit raccourci pour trouver un élément HTML avec son id.
function element(id) {
    return document.getElementById(id);
}

// Récupérer le texte saisi dans un champ.
function valeur(id) {
    return element(id).value.trim();
}

// Mettre les filières dans la liste déroulante.
function remplirFilieres() {
    let choix = element("filiere");
    choix.innerHTML = '<option value="">Choisir une filière</option>';

    let filieres = [];
    for (let stagiaire of stagiaires) {
        if (!filieres.includes(stagiaire.filiere)) {
            filieres.push(stagiaire.filiere);
        }
    }

    filieres.sort();
    for (let filiere of filieres) {
        let option = document.createElement("option");
        option.value = filiere;
        option.textContent = filiere;
        choix.appendChild(option);
    }
    remplirGroupes();
}

// Afficher les groupes de la filière sélectionnée.
function remplirGroupes() {
    let choix = element("groupe");
    choix.innerHTML = '<option value="">Choisir un groupe</option>';

    let groupes = [];
    for (let stagiaire of stagiaires) {
        if (stagiaire.filiere === valeur("filiere")) {
            if (!groupes.includes(stagiaire.groupe)) {
                groupes.push(stagiaire.groupe);
            }
        }
    }

    groupes.sort();
    for (let groupe of groupes) {
        let option = document.createElement("option");
        option.value = groupe;
        option.textContent = groupe;
        choix.appendChild(option);
    }
    afficherStagiaires();
}

// Récupérer uniquement les stagiaires choisis par l'utilisateur.
function stagiairesSelectionnes() {
    let recherche = normaliser(valeur("recherche"));
    let resultat = [];

    for (let stagiaire of stagiaires) {
        if (valeur("filiere") !== "" && stagiaire.filiere !== valeur("filiere")) continue;
        if (valeur("groupe") !== "" && stagiaire.groupe !== valeur("groupe")) continue;

        let identite = normaliser(stagiaire.nom + " " + stagiaire.prenom + " " + stagiaire.cef);
        if (recherche !== "" && !identite.includes(recherche)) continue;
        resultat.push(stagiaire);
    }
    return resultat;
}

// Remplir le tableau HTML avec des cellules normales (textContent).
function afficherStagiaires() {
    let tableau = element("listeStagiaires");
    tableau.innerHTML = "";

    let liste = stagiairesSelectionnes();
    element("nombre").textContent = liste.length;

    for (let stagiaire of liste) {
        let ligne = tableau.insertRow();
        let informations = [stagiaire.cef, stagiaire.nom, stagiaire.prenom,
                            stagiaire.cni, stagiaire.filiere, stagiaire.groupe];

        for (let information of informations) {
            let cellule = ligne.insertCell();
            cellule.textContent = information;
        }
    }
}

// Relier les boutons et les champs HTML au JavaScript.
element("fichierExcel").addEventListener("change", importerFichier);
element("filiere").addEventListener("change", remplirGroupes);
element("groupe").addEventListener("change", afficherStagiaires);
element("recherche").addEventListener("input", afficherStagiaires);
element("boutonConvocations").addEventListener("click", function() {
    imprimer("convocations");
});
element("boutonPresences").addEventListener("click", function() {
    imprimer("presences");
});
element("boutonAffichage").addEventListener("click", function() {
    imprimer("affichage");
});
