let stagiaires = [];

const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const filiereSelect = document.getElementById("filiereSelect");
const groupeSelect = document.getElementById("groupeSelect");
const printBtn = document.getElementById("printBtn");
const message = document.getElementById("message");
const sheet = document.getElementById("sheet");
const tbody = document.getElementById("tbody");

fileInput.addEventListener("change", function () {
    let file = fileInput.files[0];

    if (file) {
        let reader = new FileReader();

        reader.onload = function (event) {
            let data = new Uint8Array(event.target.result);
            let workbook = XLSX.read(data, { type: "array" });

            lireClasseur(workbook);
            fileName.textContent = file.name;
        };

        reader.readAsArrayBuffer(file);
    }
});


fetch("base_donnees.xlsx")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Fichier introuvable");
        }
        return response.arrayBuffer();
    })
    .then(function (data) {
        let workbook = XLSX.read(new Uint8Array(data), { type: "array" });
        lireClasseur(workbook);
        fileName.textContent = "base_donnees.xlsx (chargé automatiquement)";
    })
    .catch(function () {

    });


    function lireClasseur(workbook) {
    let nomFeuille = "Export";

    if (!workbook.Sheets[nomFeuille]) {
        nomFeuille = workbook.SheetNames[0];
    }

    let feuille = workbook.Sheets[nomFeuille];
    let lignes = XLSX.utils.sheet_to_json(feuille, { defval: "" });

    stagiaires = [];

    for (let i = 0; i < lignes.length; i++) {
        let ligne = lignes[i];

        if (ligne.MatriculeEtudiant && ligne.EtudiantActif === "Oui") {
            let stagiaire = {
                cef: String(ligne.MatriculeEtudiant).trim(),
                nom: String(ligne.Nom).trim(),
                prenom: String(ligne.Prenom).trim(),
                groupe: String(ligne.CodeDiplome).trim(),
                filiere: nomFiliere(ligne.LibelleLong),
                niveau: niveauFormation(ligne.LibelleLong)
            };

            stagiaires.push(stagiaire);
        }
    }

    remplirFilieres();
}


function nomFiliere(libelle) {
    let nom = String(libelle);
    let position = nom.indexOf("-");

    if (position !== -1) {
        nom = nom.substring(position + 1);
    }

    nom = nom.replace(/\(\dA\)-\d{4}$/, "");
    nom = nom.replace("(CDS)", "");

    return nom.trim();
}


function niveauFormation(libelle) {
    let code = String(libelle).split("-")[0];

    if (code.includes("_TS_")) {
        return "TECHNICIEN SPECIALISE";
    } else if (code.includes("_T_")) {
        return "TECHNICIEN";
    } else if (code.includes("_FQ_")) {
        return "QUALIFICATION";
    } else if (code.includes("_S_")) {
        return "SPECIALISATION";
    }

    return "";
}


function remplirFilieres() {
    filiereSelect.innerHTML = '<option value="">-- Choisir une filière --</option>';

    let filieres = [];

    for (let i = 0; i < stagiaires.length; i++) {
        let filiere = stagiaires[i].filiere;

        if (!filieres.includes(filiere)) {
            filieres.push(filiere);
        }
    }

    filieres.sort();

    for (let i = 0; i < filieres.length; i++) {
        let option = document.createElement("option");
        option.value = filieres[i];
        option.textContent = filieres[i];
        filiereSelect.appendChild(option);
    }

    filiereSelect.disabled = false;

    groupeSelect.innerHTML = '<option value="">-- Choisir un groupe --</option>';
    groupeSelect.disabled = true;

    sheet.classList.add("hidden");
    printBtn.disabled = true;

    message.textContent = stagiaires.length + " inscriptions chargées. Choisissez une filière.";
    message.classList.remove("hidden");
}


filiereSelect.addEventListener("change", function () {
    let filiereChoisie = filiereSelect.value;
    let groupes = [];

    for (let i = 0; i < stagiaires.length; i++) {
        if (stagiaires[i].filiere === filiereChoisie) {
            let groupe = stagiaires[i].groupe;

            if (!groupes.includes(groupe)) {
                groupes.push(groupe);
            }
        }
    }

    groupes.sort();

    groupeSelect.innerHTML = '<option value="">-- Choisir un groupe --</option>';

    for (let i = 0; i < groupes.length; i++) {
        let option = document.createElement("option");
        option.value = groupes[i];
        option.textContent = groupes[i];
        groupeSelect.appendChild(option);
    }

    groupeSelect.disabled = false;

    if (filiereChoisie === "") {
        groupeSelect.disabled = true;
    }

    if (groupes.length === 1) {
        groupeSelect.value = groupes[0];
        afficherListe();
    } else {
        sheet.classList.add("hidden");
        printBtn.disabled = true;

        if (filiereChoisie !== "") {
            message.textContent = "Choisissez maintenant un groupe.";
        } else {
            message.textContent = "Choisissez une filière.";
        }

        message.classList.remove("hidden");
    }
});


groupeSelect.addEventListener("change", function () {
    afficherListe();
});


function afficherListe() {
    let filiereChoisie = filiereSelect.value;
    let groupeChoisi = groupeSelect.value;

    if (filiereChoisie === "" || groupeChoisi === "") {
        return;
    }

    let liste = [];

    for (let i = 0; i < stagiaires.length; i++) {
        let stagiaire = stagiaires[i];

        if (stagiaire.filiere === filiereChoisie && stagiaire.groupe === groupeChoisi) {
            // Vérifier si le CEF existe déjà dans la liste
            let existe = false;

            for (let j = 0; j < liste.length; j++) {
                if (liste[j].cef === stagiaire.cef) {
                    existe = true;
                    break;
                }
            }

            if (existe === false) {
                liste.push(stagiaire);
            }
        }
    }


    liste.sort(function (a, b) {
        if (a.nom > b.nom) {
            return 1;
        }

        if (a.nom < b.nom) {
            return -1;
        }

        if (a.prenom > b.prenom) {
            return 1;
        }

        if (a.prenom < b.prenom) {
            return -1;
        }

        return 0;
    });

    if (liste.length > 0) {
        document.getElementById("niveau").textContent = liste[0].niveau;
    } else {
        document.getElementById("niveau").textContent = "";
    }

    if (groupeChoisi === "Groupe libre") {
        document.getElementById("filiereLabel").textContent = filiereChoisie + " (Groupe libre)";
    } else {
        document.getElementById("filiereLabel").textContent = filiereChoisie + " " + groupeChoisi.replace(/\D/g, "");
    }
    document.getElementById("effectif").textContent = liste.length;

    tbody.innerHTML = "";

    for (let i = 0; i < liste.length; i++) {
        let stagiaire = liste[i];
        let ligne = document.createElement("tr");

        let numero = document.createElement("td");
        numero.textContent = i + 1;
        ligne.appendChild(numero);

        let cef = document.createElement("td");
        cef.textContent = stagiaire.cef;
        ligne.appendChild(cef);

        let nom = document.createElement("td");
        nom.textContent = stagiaire.nom;
        ligne.appendChild(nom);

        let prenom = document.createElement("td");
        prenom.textContent = stagiaire.prenom;
        ligne.appendChild(prenom);

        let signatureAvant = document.createElement("td");
        ligne.appendChild(signatureAvant);

        let signatureApres = document.createElement("td");
        ligne.appendChild(signatureApres);

        let observations = document.createElement("td");
        observations.contentEditable = true;
        ligne.appendChild(observations);

        tbody.appendChild(ligne);
    }

    message.classList.add("hidden");
    sheet.classList.remove("hidden");
    printBtn.disabled = false;
}


printBtn.addEventListener("click", function () {
    window.print();
});


document.getElementById("dateInput").valueAsDate = new Date();
