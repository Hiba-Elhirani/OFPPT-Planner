let stagiaires = [];

function normaliser(texte) {
    return String(texte).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

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

function trouverNiveau(ligne) {
    let niveau = colonne(ligne, ["Niveau"]);
    if (niveau !== "") return niveau;

    let code = colonne(ligne, ["LibelleLong", "Code Filière"]);
    if (code.endsWith("_TS")) return "TECHNICIEN SPÉCIALISÉ";
    if (code.endsWith("_T")) return "TECHNICIEN";
    if (code.endsWith("_Q")) return "QUALIFICATION";
    if (code.endsWith("_S")) return "SPÉCIALISATION";
    if (code.includes("_TS_")) return "TECHNICIEN SPÉCIALISÉ";
    if (code.includes("_FQ_")) return "FORMATION QUALIFIANTE";
    if (code.includes("_T_")) return "TECHNICIEN";
    if (code.includes("_S_")) return "SPÉCIALISATION";
    if (code.includes("_Q_")) return "QUALIFICATION";
    return "";
}

function creerStagiaire(ligne) {
    const candidatureLibre = colonne(ligne, ["ID Candidature"]) !== "" || colonne(ligne, ["Statut Candidature"]) !== "";
    return {
        cef: colonne(ligne, ["MatriculeEtudiant", "CEF", "Matricule"]),
        nom: colonne(ligne, ["Nom"]),
        prenom: colonne(ligne, ["Prenom", "Prénom"]),
        cni: colonne(ligne, ["CIN", "CNI"]),
        filiere: trouverFiliere(ligne),
        groupe: colonne(ligne, ["CodeDiplome", "Groupe"]) || (candidatureLibre ? "CL" : ""),
        niveau: trouverNiveau(ligne),
        candidatLibre: candidatureLibre,
        codeFiliere: colonne(ligne, ["Code Filière"]),
        centreExamen: colonne(ligne, ["CENTRE D'EXAMEN"]),
        origine: colonne(ligne, ["EFP D'ORIGINE"])
    };
}

function chercherEntete(lignes) {
    for (let i = 0; i < Math.min(20, lignes.length); i++) {
        let colonnes = lignes[i].map(normaliser);
        if (colonnes.includes("nom") && colonnes.includes("prenom")) {
            return i;
        }
    }
    return -1;
}

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

async function importerFichier() {
    let fichier = element("fichierExcel").files[0];
    if (!fichier) return;

    try {
        let lignes = [];

        if (fichier.name.toLowerCase().endsWith(".csv")) {
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

        element("message").textContent = stagiaires.length + " inscriptions retrouvées dans ce navigateur.";
        remplirFilieres();
        sauvegarderLocalement();
    } catch (erreur) {
        alert("Impossible d'ouvrir ce fichier : " + erreur.message);
    }
}

