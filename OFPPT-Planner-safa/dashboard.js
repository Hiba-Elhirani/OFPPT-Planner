// Dashboard : affiche la filière, le groupe, l'année et le nombre de stagiaires.
const boutonDashboard = document.getElementById("boutonDashboard");
const sectionDashboard = document.getElementById("dashboard");

// Texte affiché dans une liste déroulante (ou "-" si rien n'est choisi)
function texteChoisi(select) {
    if (select.value === "") {
        return "-";
    }
    return select.options[select.selectedIndex].textContent;
}

function remplirDashboard() {
    document.getElementById("dashFiliere").textContent = texteChoisi(document.getElementById("filiere"));
    document.getElementById("dashGroupe").textContent = texteChoisi(document.getElementById("groupe"));
    document.getElementById("dashAnnee").textContent = document.getElementById("annee").value || "-";
    document.getElementById("dashNombre").textContent = compterClasse();
}

// Nombre total de stagiaires de la classe (filière + groupe choisis).
// On utilise la liste "stagiaires" de import.js, donc la recherche ne change pas ce nombre.
function compterClasse() {
    let filiere = document.getElementById("filiere").value;
    let groupe = document.getElementById("groupe").value;

    if (filiere === "" || groupe === "") {
        return "-";               // classe pas encore choisie
    }

    let total = 0;
    for (let stagiaire of stagiaires) {
        if (stagiaire.filiere === filiere && stagiaire.groupe === groupe) {
            total++;
        }
    }
    return total;
}

// Clic sur le bouton : afficher (ou cacher) le dashboard
boutonDashboard.addEventListener("click", function () {
    if (sectionDashboard.hidden) {
        sectionDashboard.hidden = false;
        remplirDashboard();
        sectionDashboard.scrollIntoView({ behavior: "smooth", block: "start" });
        boutonDashboard.textContent = "Cacher le dashboard";
    } else {
        sectionDashboard.hidden = true;
        boutonDashboard.textContent = "Dashboard";
    }
});

// Mise à jour automatique quand on change la filière, le groupe, l'année ou la liste
document.getElementById("filiere").addEventListener("change", remplirDashboard);
document.getElementById("groupe").addEventListener("change", remplirDashboard);
document.getElementById("annee").addEventListener("input", remplirDashboard);
new MutationObserver(remplirDashboard).observe(document.getElementById("nombre"), {
    childList: true,
    characterData: true,
    subtree: true
});