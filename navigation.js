(function () {
    'use strict';

    const pages = {
        importer: {
            titre: 'Importer les stagiaires',
            description: 'Chargez un fichier Excel ou CSV pour retrouver les stagiaires et préparer vos examens.'
        },
        examen: {
            titre: 'Informations de l’examen',
            description: 'Choisissez la filière, le groupe, l’épreuve et les informations de la session.'
        },
        stagiaires: {
            titre: 'Liste des stagiaires',
            description: 'Consultez la liste filtrée par filière et groupe, ou recherchez un stagiaire.'
        },
        documents: {
            titre: 'Générer les documents',
            description: 'Préparez les convocations, feuilles de présence et listes d’affichage.'
        },
        discipline: {
            titre: 'Notes de discipline',
            description: 'Suivez les événements d’un stagiaire, consultez les notes ou sauvegardez vos données.'
        },
        absences: {
            titre: 'Tableau de bord des absences',
            description: 'Retrouvez les absences par groupe, les heures perdues et le suivi de chaque stagiaire.'
        },
        conseil: {
            titre: 'Conseil disciplinaire',
            description: 'Renseignez le procès-verbal du conseil puis imprimez-le ou enregistrez-le en PDF.'
        }
    };

    const sections = [...document.querySelectorAll('.workspace-section[data-section]')];
    const liens = [...document.querySelectorAll('[data-nav]')];
    const titre = document.getElementById('pageTitre');
    const description = document.getElementById('pageDescription');
    const compteur = document.getElementById('pageCompteur');

    function afficherSection() {
        const cible = window.location.hash.slice(1);
        const sectionActive = Object.hasOwn(pages, cible) ? cible : 'importer';
        const index = Object.keys(pages).indexOf(sectionActive) + 1;

        for (const section of sections) {
            const active = section.dataset.section === sectionActive;
            section.hidden = !active;
            section.setAttribute('aria-hidden', String(!active));
        }
        for (const lien of liens) {
            if (lien.dataset.nav === sectionActive) {
                lien.setAttribute('aria-current', 'page');
            } else {
                lien.removeAttribute('aria-current');
            }
        }

        titre.textContent = pages[sectionActive].titre;
        description.textContent = pages[sectionActive].description;
        compteur.innerHTML = String(index).padStart(2, '0') + ' <span class="progress-divider">/ 07</span>';
        document.title = pages[sectionActive].titre + ' | OFPPT';
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    window.addEventListener('hashchange', afficherSection);
    afficherSection();
})();
