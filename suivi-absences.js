(function () {
    'use strict';
    const node = id => document.getElementById('suiviAbsence' + id);
    const root = document.getElementById('absences');
    if (!root) return;

    let rows = [];
    let detailKey = null;
    const eventNames = {
        seance: "Absence d'une séance (2,5 h)",
        journee: "Absence d'une journée (5 h)",
        retard: 'Retard'
    };
    const normal = str => String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const formatted = num => Number(num).toLocaleString('fr-FR', {maximumFractionDigits: 1});

    function refreshSelect(id, values, placeholder) {
        const select = node(id);
        const oldValue = select.value;
        select.replaceChildren();
        const first = document.createElement('option');
        first.value = '';
        first.textContent = placeholder;
        select.appendChild(first);
        values.forEach(value => {
            const item = document.createElement('option');
            item.value = value;
            item.textContent = value;
            select.appendChild(item);
        });
        if (values.includes(oldValue)) select.value = oldValue;
    }

    function refreshFilters() {
        const list = Array.isArray(stagiaires) ? stagiaires : [];
        const filieres = [...new Set(list.map(s => s.filiere).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'fr'));
        refreshSelect('Filiere', filieres, 'Toutes les filières');
        const filiere = node('Filiere').value;
        const groupes = [...new Set(list.filter(s => !filiere || s.filiere === filiere).map(s => s.groupe).filter(Boolean))].sort((a,b) => a.localeCompare(b,'fr'));
        refreshSelect('Groupe', groupes, 'Tous les groupes');
    }

    function getStudentRows() {
        const filiere = node('Filiere').value;
        const groupe = node('Groupe').value;
        const recherche = normal(node('Recherche').value.trim());
        const situation = node('Situation').value;
        const du = node('DateDebut').value;
        const au = node('DateFin').value;
        return (Array.isArray(stagiaires) ? stagiaires : [])
            .filter(s => (!filiere || s.filiere === filiere) &&
                (!groupe || s.groupe === groupe) &&
                (!recherche || normal([s.nom, s.prenom, s.cef].join(' ')).includes(recherche)))
            .map(s => {
                const key = cleStagiaire(s);
                const record = dossiersDiscipline[key];
                const events = (record && Array.isArray(record.evenements) ? record.evenements : [])
                    .filter(e => e && eventNames[e.type] && (!du || (e.date && e.date >= du)) && (!au || (e.date && e.date <= au)));
                const sessions = events.reduce((total, e) => total + (e.type === 'journee' ? 2 : e.type === 'seance' ? 1 : 0), 0);
                const delays = events.filter(e => e.type === 'retard').length;
                const last = events.filter(e => e.type === 'seance' || e.type === 'journee')
                    .map(e => e.date).filter(Boolean).sort().pop() || '—';
                return {student: s, key, sessions, delays, last, events};
            })
            .filter(r => situation === 'tous' || (situation === 'absents' ? r.sessions > 0 : r.sessions === 0))
            .sort((a,b) => b.sessions - a.sessions || b.delays - a.delays || (a.student.nom || '').localeCompare(b.student.nom || '', 'fr'));
    }

    function closeDetail() {
        detailKey = null;
        node('Details').hidden = true;
    }

    function openDetail(key) {
        const row = rows.find(r => r.key === key);
        if (!row) { closeDetail(); return; }
        detailKey = key;
        const s = row.student;
        node('DetailsTitre').textContent = 'Historique : ' + [s.nom, s.prenom].filter(Boolean).join(' ') + ' — ' + (s.cef || 'sans CEF');
        const content = node('DetailsContenu');
        content.replaceChildren();
        if (!row.events.length) {
            const p = document.createElement('p');
            p.className = 'absence-vide';
            p.textContent = 'Aucune absence ni retard sur cette période.';
            content.appendChild(p);
        } else {
            const list = document.createElement('ul');
            list.className = 'absence-event-list';
            [...row.events].sort((a,b) => (b.date || '').localeCompare(a.date || ''))
                .forEach(e => {
                    const item = document.createElement('li');
                    item.textContent = (e.date || 'Date inconnue') + ' — ' + eventNames[e.type];
                    list.appendChild(item);
                });
            content.appendChild(list);
        }
        node('Details').hidden = false;
    }

    function render() {
        refreshFilters();
        rows = getStudentRows();
        const du = node('DateDebut').value;
        const au = node('DateFin').value;
        node('Periode').textContent = 'Année scolaire : ' + (document.getElementById('annee').value.trim() || 'non précisée') +
            (du || au ? '  ·  Période : ' + (du || 'début') + ' — ' + (au || 'fin') : '  ·  Toutes les dates');
        const tbody = node('TableCorps');
        tbody.replaceChildren();
        if (!rows.length) {
            const tr = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 9;
            cell.textContent = (Array.isArray(stagiaires) && stagiaires.length) ?
                'Aucun stagiaire ne correspond aux filtres.' : 'Importez une liste de stagiaires pour afficher le tableau.';
            tr.appendChild(cell);
            tbody.appendChild(tr);
            closeDetail();
            return;
        }
        rows.forEach(row => {
            const s = row.student;
            const tr = document.createElement('tr');
            [s.cef, [s.nom,s.prenom].filter(Boolean).join(' '), s.filiere, s.groupe,
                row.sessions, formatted(row.sessions * 2.5) + ' h', row.delays, row.last].forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value == null ? '' : String(value);
                tr.appendChild(cell);
            });
            const lastCell = document.createElement('td');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'absence-detail-button';
            button.textContent = 'Voir';
            button.addEventListener('click', () => openDetail(row.key));
            lastCell.appendChild(button);
            tr.appendChild(lastCell);
            tbody.appendChild(tr);
        });
        if (detailKey) openDetail(detailKey);
    }

    function csvValue(value) {
        let s = String(value == null ? '' : value);
        if (/^\s*[=+@-]/.test(s)) s = "'" + s;
        return '"' + s.replace(/"/g, '""') + '"';
    }
    function exportCsv() {
        const headers = ['CEF','Nom','Prénom','Filière','Groupe','Absences_séances','Heures_absence','Retards','Dernière_absence'];
        const records = rows.map(r => [r.student.cef,r.student.nom,r.student.prenom,r.student.filiere,r.student.groupe,
            r.sessions,formatted(r.sessions * 2.5),r.delays,r.last]);
        const csv = '\uFEFF' + [headers, ...records].map(line => line.map(csvValue).join(';')).join('\r\n');
        telechargerFichier(csv, 'suivi-absences.csv', 'text/csv;charset=utf-8');
    }

    ['Filiere','Groupe','Recherche','Situation','DateDebut','DateFin'].forEach(id => {
        node(id).addEventListener(id === 'Recherche' ? 'input' : 'change', render);
    });
    node('FermerDetails').addEventListener('click', closeDetail);
    node('ExportCsv').addEventListener('click', exportCsv);
    document.getElementById('annee').addEventListener('input', render);
    window.addEventListener('hashchange', () => { if (location.hash === '#absences') render(); });
    document.addEventListener('click', event => {
        if (event.target.closest('[data-evenement], #historiqueDiscipline .supprimer')) render();
    });
    const table = document.getElementById('listeStagiaires');
    if (table) new MutationObserver(render).observe(table, {childList: true});
    render();
})();
