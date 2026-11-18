(function () {
    'use strict';

    const pages = {
        importer: 'Importer les stagiaires',
        examen: 'Informations de l’examen',
        stagiaires: 'Liste des stagiaires',
        documents: 'Générer les documents',
        discipline: 'Notes de discipline',
        absences: 'Absences',
        conseil: 'Conseil disciplinaire',
        dashboard: 'Tableau de bord des absences'
    };
    const standardView = document.getElementById('main-workspace');
    const dashboardView = document.getElementById('dashboard-screen');
    const sections = [...standardView.querySelectorAll('.workspace-section[data-section]')];
    const links = [...document.querySelectorAll('[data-nav]')];
    const dashboardLink = document.getElementById('boutonDashboard');
    const title = document.getElementById('pageTitre');

    function showPage() {
        const target = window.location.hash.substring(1);
        const active = Object.prototype.hasOwnProperty.call(pages, target) ? target : 'importer';
        const isDashboard = active === 'dashboard';

        // The two full-screen views are mutually exclusive.
        standardView.hidden = isDashboard;
        dashboardView.hidden = !isDashboard;
        standardView.setAttribute('aria-hidden', String(isDashboard));
        dashboardView.setAttribute('aria-hidden', String(!isDashboard));

        for (const section of sections) {
            const visible = !isDashboard && section.dataset.section === active;
            section.hidden = !visible;
            section.setAttribute('aria-hidden', String(!visible));
        }
        for (const link of links) {
            if (!isDashboard && link.dataset.nav === active) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        }
        if (dashboardLink) {
            if (isDashboard) dashboardLink.setAttribute('aria-current', 'page');
            else dashboardLink.removeAttribute('aria-current');
        }
        if (title && !isDashboard) title.textContent = pages[active];
        document.title = pages[active] + ' | OFPPT';
        window.scrollTo({top:0, left:0, behavior:'instant'});
    }

    window.addEventListener('hashchange', showPage);
    showPage();
})();
