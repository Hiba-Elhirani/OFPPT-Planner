function element(id) {
    return document.getElementById(id);
}

function valeur(id) {
    return element(id).value.trim();
}

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

function stagiairesSelectionnes() {
    let recherche = normaliser(valeur("recherche"));
    let resultat = [];

    for (let stagiaire of stagiaires) {
        if (valeur("filiere") !== "" && stagiaire.filiere !== valeur("filiere")) continue;
        if (valeur("groupe") !== "" && stagiaire.groupe !== valeur("groupe")) continue;

        let nom = normaliser(stagiaire.nom + " " + stagiaire.prenom + " " + stagiaire.cef);
        if (recherche !== "" && !nom.includes(recherche)) continue;
        resultat.push(stagiaire);
    }
    return resultat;
}

function afficherStagiaires() {
    let tableau = element("listeStagiaires");
    tableau.innerHTML = "";
    let liste = stagiairesSelectionnes();
    element("nombre").textContent = liste.length;

    for (let stagiaire of liste) {
        let ligne = tableau.insertRow();
        let infos = [stagiaire.cef, stagiaire.nom, stagiaire.prenom,
                     stagiaire.cni, stagiaire.filiere, stagiaire.groupe];
        for (let info of infos) {
            ligne.insertCell().textContent = info;
        }
    }
    remplirChoixConseil();
    remplirChoixDiscipline();
}

let choixConseil = [];
function remplirChoixConseil() {
    choixConseil = stagiairesSelectionnes();
    let choix = element("stagiaireConseil");
    choix.innerHTML = '<option value="">Choisir un stagiaire</option>';

    for (let i = 0; i < choixConseil.length; i++) {
        let stagiaire = choixConseil[i];
        let option = document.createElement("option");
        option.value = i;
        option.textContent = stagiaire.nom + " " + stagiaire.prenom +
                             " – " + stagiaire.cef + " (" + stagiaire.groupe + ")";
        choix.appendChild(option);
    }
}

element("fichierExcel").addEventListener("change", importerFichier);
element("filiere").addEventListener("change", remplirGroupes);
element("groupe").addEventListener("change", afficherStagiaires);
element("recherche").addEventListener("input", afficherStagiaires);

element("boutonConvocations").addEventListener("click", function () {
    imprimer("convocations");
});
element("boutonPresences").addEventListener("click", function () {
    imprimer("presences");
});
element("boutonAffichage").addEventListener("click", function () {
    imprimer("affichage");
});
element("boutonConseil").addEventListener("click", imprimerConseil);

initialiserDiscipline();
chargerDonneesLocales();


// Support files dropped on the Safa-style uploader as well as the file chooser.
(function activerGlisserDeposer() {
    const zone = document.querySelector('label.upload-box');
    const fichierInput = document.getElementById('fichierExcel');
    if (!zone || !fichierInput) return;

    for (const type of ['dragenter', 'dragover']) {
        zone.addEventListener(type, event => {
            event.preventDefault();
            event.stopPropagation();
            zone.classList.add('drag-over');
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        });
    }
    for (const type of ['dragleave', 'drop']) {
        zone.addEventListener(type, event => {
            event.preventDefault();
            event.stopPropagation();
            zone.classList.remove('drag-over');
        });
    }
    zone.addEventListener('drop', event => {
        const fichiers = event.dataTransfer && event.dataTransfer.files;
        if (!fichiers || !fichiers.length) return;
        if (!/\.(xlsx|xls|csv)$/i.test(fichiers[0].name)) {
            alert('Choisissez un fichier Excel ou CSV.');
            return;
        }
        fichierInput.files = fichiers;
        fichierInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
})();
