let dossiersDiscipline = {};
let choixDiscipline = [];

function cleStagiaire(stagiaire) {
    let identite = stagiaire.cef || stagiaire.cni || stagiaire.nom + " " + stagiaire.prenom;
    return identite + " | " + stagiaire.groupe + " | " + valeur("annee");
}

function dossierStagiaire(stagiaire) {
    let cle = cleStagiaire(stagiaire);
    if (!dossiersDiscipline[cle]) {
        dossiersDiscipline[cle] = { duree: "2", annee: "", evenements: [] };
    }
    return dossiersDiscipline[cle];
}

function remplirChoixDiscipline() {
    let choix = element("stagiaireDiscipline");
    let ancien = choix.value;
    let ancienStagiaire = choixDiscipline[Number(ancien)];
    let ancienneCle = ancien !== "" && ancienStagiaire ? cleStagiaire(ancienStagiaire) : "";

    choixDiscipline = stagiairesSelectionnes();
    choix.innerHTML = '<option value="">Choisir un stagiaire</option>';

    for (let i = 0; i < choixDiscipline.length; i++) {
        let stagiaire = choixDiscipline[i];
        let option = document.createElement("option");
        option.value = i;
        option.textContent = stagiaire.nom + " " + stagiaire.prenom +
                             " - " + stagiaire.cef + " (" + stagiaire.groupe + ")";
        choix.appendChild(option);

        if (cleStagiaire(stagiaire) === ancienneCle) {
            choix.value = i;
        }
    }
    afficherDossierDiscipline();
    afficherNotesDiscipline();
}

function stagiaireDiscipline() {
    let numero = valeur("stagiaireDiscipline");
    if (numero === "") return null;
    return choixDiscipline[Number(numero)];
}

function remplirAnneesDiscipline(duree, anneeChoisie) {
    let choix = element("anneeDiscipline");
    let nombreAnnees = Number(duree);

    choix.innerHTML = "<option value=\"\">Choisir l'année</option>";

    for (let annee = 1; annee <= nombreAnnees; annee++) {
        let option = document.createElement("option");
        option.value = String(annee);

        let nom = annee === 1 ? "1ère année" : annee + "ème année";
        let noteMax = annee === nombreAnnees ? 15 : 20;
        option.textContent = nom + " (note /" + noteMax + ")";
        choix.appendChild(option);
    }

    if (anneeChoisie && Number(anneeChoisie) <= nombreAnnees) {
        choix.value = String(anneeChoisie);
    } else {
        choix.value = "";
    }
}

function baremeDiscipline(dossier) {
    let duree = Number(dossier.duree || 2);
    let annee = Number(dossier.annee);
    if (!annee || annee > duree) return 0;
    return annee === duree ? 15 : 20;
}

function calculerNote(dossier) {
    let retards = 0;
    let seances = 0;
    let indisciplines = 0;

    for (let evenement of dossier.evenements) {
        if (evenement.type === "retard") retards++;
        if (evenement.type === "seance") seances++;
        if (evenement.type === "journee") seances += 2;
        if (evenement.type === "comportement") indisciplines++;
    }

    let pointsAssiduite = Math.max(0, 10 - retards * 0.25 - seances * 0.5);
    let pointsComportement = Math.max(0, 5 - indisciplines);
    let noteSur15 = pointsAssiduite + pointsComportement;
    let noteFinale = null;

    let bareme = baremeDiscipline(dossier);
    if (bareme === 20) noteFinale = noteSur15 * 20 / 15;
    if (bareme === 15) noteFinale = noteSur15;

    return { retards, seances, indisciplines, pointsAssiduite,
             pointsComportement, noteSur15, noteFinale };
}

function formatNote(nombre) {
    return nombre.toFixed(2).replace(".", ",");
}

function afficherDossierDiscipline() {
    let stagiaire = stagiaireDiscipline();
    let note = element("noteDiscipline");
    let detail = element("detailDiscipline");
    let historique = element("historiqueDiscipline");
    historique.innerHTML = "";

    if (!stagiaire) {
        note.textContent = "—";
        detail.textContent = "Choisissez un stagiaire pour voir sa note.";
        remplirAnneesDiscipline(valeur("dureeDiscipline"), "");
        historique.textContent = "Aucun stagiaire sélectionné.";
        return;
    }

    let dossier = dossierStagiaire(stagiaire);
    element("dureeDiscipline").value = dossier.duree || "2";
    remplirAnneesDiscipline(dossier.duree || "2", dossier.annee);
    let resultat = calculerNote(dossier);

    if (resultat.noteFinale === null) {
        note.textContent = "Année à choisir";
    } else {
        note.textContent = formatNote(resultat.noteFinale) + " / " + baremeDiscipline(dossier);
    }

    detail.textContent = "Assiduité : " + formatNote(resultat.pointsAssiduite) +
        "/10 | Comportement : " + formatNote(resultat.pointsComportement) +
        "/5 | Total brut : " + formatNote(resultat.noteSur15) + "/15" +
        " | Retards : " + resultat.retards +
        " | Absences : " + resultat.seances + " séance(s)" +
        " | Indisciplines : " + resultat.indisciplines;

    if (dossier.evenements.length === 0) {
        historique.textContent = "Aucun retard ni absence enregistré pour ce stagiaire.";
        return;
    }

    let noms = {
        retard: "Retard (−0,25)",
        seance: "Absence d'une séance (−0,5)",
        journee: "Absence d'une journée (−1)",
        comportement: "Indiscipline (voir total comportement)"
    };

    for (let i = dossier.evenements.length - 1; i >= 0; i--) {
        let evenement = dossier.evenements[i];
        let ligne = document.createElement("div");
        ligne.className = "evenement";
        let info = document.createElement("span");
        info.textContent = evenement.date + " - " + noms[evenement.type];
        let supprimer = document.createElement("button");
        supprimer.type = "button";
        supprimer.className = "supprimer";
        supprimer.textContent = "Annuler";
        supprimer.addEventListener("click", function () {
            if (confirm("Supprimer cet événement du dossier ?")) {
                dossier.evenements.splice(i, 1);
                sauvegarderLocalement();
                afficherDossierDiscipline();
                afficherNotesDiscipline();
            }
        });
        ligne.appendChild(info);
        ligne.appendChild(supprimer);
        historique.appendChild(ligne);
    }
}

function ajouterEvenement(type) {
    let stagiaire = stagiaireDiscipline();
    if (!stagiaire) {
        alert("Choisissez un stagiaire.");
        return;
    }
    if (valeur("anneeDiscipline") === "") {
        alert("Choisissez l'année du stagiaire.");
        return;
    }
    if (valeur("dateDiscipline") === "") {
        alert("Choisissez la date du retard ou de l'absence.");
        return;
    }

    let dossier = dossierStagiaire(stagiaire);
    dossier.evenements.push({ type: type, date: valeur("dateDiscipline") });
    sauvegarderLocalement();
    afficherDossierDiscipline();
    afficherNotesDiscipline();
}

function changerDureeDiscipline() {
    let duree = valeur("dureeDiscipline");
    let stagiaire = stagiaireDiscipline();

    if (!stagiaire) {
        remplirAnneesDiscipline(duree, "");
        return;
    }

    let dossier = dossierStagiaire(stagiaire);
    dossier.duree = duree;

    if (Number(dossier.annee) > Number(duree)) {
        dossier.annee = "";
    }

    sauvegarderLocalement();
    afficherDossierDiscipline();
    afficherNotesDiscipline();
}

function changerAnneeDiscipline() {
    let stagiaire = stagiaireDiscipline();
    if (!stagiaire) return;
    dossierStagiaire(stagiaire).annee = valeur("anneeDiscipline");
    sauvegarderLocalement();
    afficherDossierDiscipline();
    afficherNotesDiscipline();
}

function afficherNotesDiscipline() {
    let tableau = element("tableNotesDiscipline");
    tableau.innerHTML = "";

    for (let stagiaire of stagiairesSelectionnes()) {
        let dossier = dossierStagiaire(stagiaire);
        let resultat = calculerNote(dossier);
        let note = resultat.noteFinale === null ? "À préciser" :
            formatNote(resultat.noteFinale) + " / " + baremeDiscipline(dossier);
        let ligne = tableau.insertRow();
        let valeurs = [stagiaire.cef, stagiaire.nom + " " + stagiaire.prenom,
            stagiaire.groupe, dossier.annee ? dossier.annee + " / " + (dossier.duree || "2") : "—",
            resultat.retards, resultat.seances, resultat.indisciplines, note];
        for (let info of valeurs) {
            ligne.insertCell().textContent = info;
        }
    }
}

function sauvegarderLocalement() {
    try {
        localStorage.setItem("ofppt_stagiaires", JSON.stringify(stagiaires));
        localStorage.setItem("ofppt_discipline", JSON.stringify(dossiersDiscipline));
        element("messageSauvegarde").textContent =
            "Sauvegardé dans ce navigateur. Pensez aussi à télécharger une sauvegarde JSON.";
    } catch (erreur) {
        element("messageSauvegarde").textContent =
            "Sauvegarde locale impossible. Téléchargez impérativement une sauvegarde JSON.";
    }
}

function estStagiaireExemple(stagiaire) {
    let exemples = [
        ["2000000000001", "ALAMI", "SALMA"],
        ["2000000000002", "BENALI", "YASSINE"],
        ["2000000000003", "SAIDI", "NOUR"]
    ];

    for (let exemple of exemples) {
        if (stagiaire.cef === exemple[0] &&
            stagiaire.nom === exemple[1] &&
            stagiaire.prenom === exemple[2]) {
            return true;
        }
    }
    return false;
}

function retirerAnciensExemples() {
    let listePropre = [];
    let supprimes = 0;

    for (let stagiaire of stagiaires) {
        if (estStagiaireExemple(stagiaire)) {
            supprimes++;
            let debutCle = stagiaire.cef + " | " + stagiaire.groupe + " | ";
            for (let cle of Object.keys(dossiersDiscipline)) {
                if (cle.startsWith(debutCle)) {
                    delete dossiersDiscipline[cle];
                }
            }
        } else {
            listePropre.push(stagiaire);
        }
    }

    stagiaires = listePropre;
    return supprimes;
}

function chargerDonneesLocales() {
    try {
        let liste = localStorage.getItem("ofppt_stagiaires");
        let dossiers = localStorage.getItem("ofppt_discipline");
        if (liste) {
            let resultat = JSON.parse(liste);
            if (Array.isArray(resultat)) stagiaires = resultat;
        }
        if (dossiers) {
            let resultat = JSON.parse(dossiers);
            if (resultat && typeof resultat === "object" && !Array.isArray(resultat)) {
                dossiersDiscipline = resultat;
            }
        }
        let supprimes = retirerAnciensExemples();
        if (supprimes > 0) {
            localStorage.setItem("ofppt_stagiaires", JSON.stringify(stagiaires));
            localStorage.setItem("ofppt_discipline", JSON.stringify(dossiersDiscipline));
        }
        if (stagiaires.length > 0) {
            element("message").textContent = stagiaires.length +
                " inscriptions retrouvées dans ce navigateur.";
        } else {
            element("message").textContent = "Aucun stagiaire. Importez votre fichier Excel.";
        }
        remplirFilieres();
    } catch (erreur) {
        element("messageSauvegarde").textContent = "Sauvegarde locale illisible : réimportez votre fichier.";
    }
}

function telechargerFichier(contenu, nom, type) {
    let fichier = new Blob([contenu], { type: type });
    let adresse = URL.createObjectURL(fichier);
    let lien = document.createElement("a");
    lien.href = adresse;
    lien.download = nom;
    lien.click();
    setTimeout(function () { URL.revokeObjectURL(adresse); }, 1000);
}

function sauvegarderJSON() {
    if (stagiaires.length === 0) {
        alert("Importez les stagiaires avant la sauvegarde.");
        return;
    }
    let donnees = { stagiaires: stagiaires, discipline: dossiersDiscipline };
    telechargerFichier(JSON.stringify(donnees, null, 2),
        "sauvegarde-ofppt.json", "application/json;charset=utf-8");
}

async function restaurerJSON() {
    let fichier = element("restaurerDonnees").files[0];
    if (!fichier) return;
    try {
        let donnees = JSON.parse(await fichier.text());
        if (!Array.isArray(donnees.stagiaires) || !donnees.discipline ||
            typeof donnees.discipline !== "object" || Array.isArray(donnees.discipline)) {
            alert("Ce fichier n'est pas une sauvegarde OFPPT valide.");
            return;
        }
        if (!confirm("Remplacer les données présentes par celles de la sauvegarde ?")) return;
        stagiaires = donnees.stagiaires;
        dossiersDiscipline = donnees.discipline;
        retirerAnciensExemples();
        remplirFilieres();
        sauvegarderLocalement();
        element("message").textContent = stagiaires.length + " inscriptions restaurées.";
    } catch (erreur) {
        alert("Impossible de lire la sauvegarde JSON.");
    }
    element("restaurerDonnees").value = "";
}

function exporterNotesCSV() {
    let liste = stagiairesSelectionnes();
    if (liste.length === 0) {
        alert("Importez des stagiaires avant l'export.");
        return;
    }
    let lignes = [["CEF", "Nom", "Prenom", "Groupe", "Duree_cursus", "Annee", "Retards",
                   "Absences_seances", "Indisciplines", "Note", "Bareme"]];
    for (let stagiaire of liste) {
        let dossier = dossierStagiaire(stagiaire);
        let resultat = calculerNote(dossier);
        let note = resultat.noteFinale === null ? "" : formatNote(resultat.noteFinale);
        lignes.push([stagiaire.cef, stagiaire.nom, stagiaire.prenom, stagiaire.groupe,
            dossier.duree || "2", dossier.annee, resultat.retards, resultat.seances,
            resultat.indisciplines, note, baremeDiscipline(dossier) || ""]);
    }
    let csv = "\uFEFF" + lignes.map(function (ligne) {
        return ligne.map(function (valeur) {
            return '"' + String(valeur).replace(/"/g, '""') + '"';
        }).join(";");
    }).join("\r\n");
    telechargerFichier(csv, "notes-discipline.csv", "text/csv;charset=utf-8");
}

function initialiserDiscipline() {
    remplirAnneesDiscipline(valeur("dureeDiscipline"), "");
    element("stagiaireDiscipline").addEventListener("change", afficherDossierDiscipline);
    element("dureeDiscipline").addEventListener("change", changerDureeDiscipline);
    element("anneeDiscipline").addEventListener("change", changerAnneeDiscipline);
    element("dateDiscipline").value = new Date().toISOString().slice(0, 10);

    for (let bouton of document.querySelectorAll("[data-evenement]")) {
        bouton.addEventListener("click", function () {
            ajouterEvenement(bouton.dataset.evenement);
        });
    }

    element("exporterNotes").addEventListener("click", exporterNotesCSV);
    element("sauvegarderDonnees").addEventListener("click", sauvegarderJSON);
    element("restaurerDonnees").addEventListener("change", restaurerJSON);
}
