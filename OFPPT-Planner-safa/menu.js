
const liens = document.querySelectorAll(".menu a");

function marquerLienActif(id) {
    liens.forEach(function (lien) {
        lien.classList.toggle("actif", lien.getAttribute("href") === "#" + id);
    });
}

// Quand on clique sur un lien : on l'active tout de suite
liens.forEach(function (lien) {
    lien.addEventListener("click", function () {
        marquerLienActif(lien.getAttribute("href").slice(1));
    });
});

// Quand on fait défiler : on active le lien de la section en haut de l'écran
window.addEventListener("scroll", function () {
    let courante = "importer";
    document.querySelectorAll("main section").forEach(function (section) {
        if (section.hidden) {
            return;   // on ignore le dashboard tant qu'il est caché
        }
        if (section.getBoundingClientRect().top < window.innerHeight * 0.35) {
            courante = section.id;
        }
    });
    marquerLienActif(courante);
});