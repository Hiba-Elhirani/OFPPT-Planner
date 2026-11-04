// IMPORTATION EXCEL : groupe JavaScript

// Cette liste sera remplie après l'importation Excel.
let stagiaires = [];

// Simplifier les titres des colonnes : "Prénom" devient "prenom".
function normaliser(texte) {
    return String(texte).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Lire une colonne Excel, même si son nom a une autre écriture.
function colonne(ligne, nomsPossibles) {
    for (let nom of nomsPossibles) {
        for (let cle of Object.keys(ligne)) {
            if (normaliser(cle) === normaliser(nom)) {
                return String(ligne[cle] || "").trim();
            }
        }
    }
    return "";
}

// Retrouver la filière avec le champ LibelleLong de base données.xlsx.
function trouverFiliere(ligne) {
    let filiere = colonne(ligne, ["Filiere", "Filière", "Nom Filière"]);
    if (filiere !== "") {
        return filiere;
    }

    let libelle = colonne(ligne, ["LibelleLong"]);
    let debut = libelle.indexOf("-");
    let fin = libelle.lastIndexOf("-");
    if (debut !== -1 && fin > debut) {
        return libelle.substring(debut + 1, fin).replace(/\(.*?\)/g, "").trim();
    }
    return libelle;
}

// Déterminer le niveau grâce au code de formation (si disponible).
function trouverNiveau(ligne) {
    let niveau = colonne(ligne, ["Niveau"]);
    if (niveau !== "") return niveau;

    let code = colonne(ligne, ["LibelleLong"]);
    if (code.includes("_TS_")) return "TECHNICIEN SPÉCIALISÉ";
    if (code.includes("_FQ_")) return "FORMATION QUALIFIANTE";
    if (code.includes("_T_")) return "TECHNICIEN";
    if (code.includes("_S_")) return "SPÉCIALISATION";
    if (code.includes("_Q_")) return "QUALIFICATION";
    return "";
}

// Convertir une ligne Excel en un objet stagiaire simple.
function creerStagiaire(ligne) {
    return {
        cef: colonne(ligne, ["MatriculeEtudiant", "CEF", "Matricule"]),
        nom: colonne(ligne, ["Nom"]),
        prenom: colonne(ligne, ["Prenom", "Prénom"]),
        cni: colonne(ligne, ["CIN", "CNI"]),
        filiere: trouverFiliere(ligne),
        groupe: colonne(ligne, ["CodeDiplome", "Groupe"]),
        niveau: trouverNiveau(ligne)
    };
}

// Trouver la ligne contenant les titres : Nom, Prénom, etc.
function chercherEntete(lignes) {
    for (let i = 0; i < Math.min(20, lignes.length); i++) {
        let colonnes = lignes[i].map(normaliser);
        if (colonnes.includes("nom") && colonnes.includes("prenom")) {
            return i;
        }
    }
    return -1;
}

// Transformer un tableau de cellules Excel en liste de stagiaires.
function convertirLignes(lignes) {
    let position = chercherEntete(lignes);
    if (position === -1) return [];

    let titres = lignes[position];
    let resultat = [];

    for (let i = position + 1; i < lignes.length; i++) {
        let ligne = {};
        for (let j = 0; j < titres.length; j++) {
            ligne[titres[j]] = lignes[i][j];
        }

        let stagiaire = creerStagiaire(ligne);
        if (stagiaire.nom !== "" && stagiaire.prenom !== "" && stagiaire.groupe !== "") {
            // Un stagiaire peut appartenir à plusieurs groupes.
            // On supprime uniquement les doublons du MÊME groupe.
            let existe = false;
            for (let autre of resultat) {
                if (stagiaire.cef !== "" && autre.cef === stagiaire.cef && autre.groupe === stagiaire.groupe) {
                    existe = true;
                }
            }
            if (!existe) resultat.push(stagiaire);
        }
    }
    return resultat;
}

// Import Excel : le fichier "base données.xlsx" utilise la feuille Export.
async function importerFichier() {
    let fichier = element("fichierExcel").files[0];
    if (!fichier) return;

    try {
        let lignes = [];

        if (fichier.name.toLowerCase().endsWith(".csv")) {
            // Lecture simple du modèle CSV fourni dans le ZIP.
            let texte = await fichier.text();
            let lignesCSV = texte.trim().split(/\r?\n/);
            for (let ligne of lignesCSV) {
                lignes.push(ligne.split(";"));
            }
            stagiaires = convertirLignes(lignes);
        } else {
            if (typeof XLSX === "undefined") {
                alert("Pour importer Excel, connectez-vous à Internet et rechargez la page.");
                return;
            }

            let contenu = await fichier.arrayBuffer();
            let classeur = XLSX.read(contenu, { type: "array" });
            let feuilles = classeur.SheetNames;

            // Nous utilisons Export si cette feuille existe.
            if (feuilles.includes("Export")) {
                feuilles = ["Export"];
            }

            let meilleureListe = [];
            for (let nomFeuille of feuilles) {
                let feuille = classeur.Sheets[nomFeuille];
                lignes = XLSX.utils.sheet_to_json(feuille, { header: 1, defval: "", raw: false });
                let liste = convertirLignes(lignes);
                if (liste.length > meilleureListe.length) {
                    meilleureListe = liste;
                }
            }
            stagiaires = meilleureListe;
        }

        if (stagiaires.length === 0) {
            alert("Aucun stagiaire trouvé. Vérifiez les colonnes Nom, Prenom et Groupe/CodeDiplome.");
            return;
        }

        element("message").textContent = stagiaires.length + " inscriptions importées. Vérifiez les informations avant l'impression.";
        remplirFilieres();
    } catch (erreur) {
        alert("Impossible d'ouvrir ce fichier : " + erreur.message);
    }
}

