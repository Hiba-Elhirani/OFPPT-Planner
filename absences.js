(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const dashboard = $('absences');
    if (!dashboard) return;

    const names = {
        seance: "Absence d'une séance (2,5 h)",
        journee: "Absence d'une journée (5 h)",
        retard: 'Retard'
    };
    let rows = [];
    let currentDetailKey = null;

    function normal(text) {
        return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    function eventsFor(student) {
        const key = cleStagiaire(student);
        const record = dossiersDiscipline[key];
        return record && Array.isArray(record.evenements) ? record.evenements : [];
    }

    function dateInRange(value) {
        const start = $('absenceDateDebut').value;
        const end = $('absenceDateFin').value;
        return (!start || (value && value >= start)) && (!end || (value && value <= end));
    }

    function getStats(student) {
        const all = eventsFor(student)
            .filter(event => event && names[event.type] && dateInRange(event.date));
        const sessions = all.reduce((n, event) => n + (event.type === 'journee' ? 2 : event.type === 'seance' ? 1 : 0), 0);
        const delays = all.filter(event => event.type === 'retard').length;
        const absenceEvents = all.filter(event => event.type === 'seance' || event.type === 'journee');
        const lastDate = absenceEvents.map(event => event.date).filter(Boolean).sort().pop() || '—';
        return {student, sessions, delays, hours: sessions * 2.5, lastDate, events: all};
    }

    function refreshSelect(id, values, emptyLabel) {
        const node = $(id);
        const previous = node.value;
        node.replaceChildren();
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = emptyLabel;
        node.appendChild(empty);
        for (const value of values) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            node.appendChild(option);
        }
        node.value = values.includes(previous) ? previous : '';
    }

    function refreshFilters() {
        const tracks = Array.isArray(stagiaires) ? stagiaires : [];
        const subjects = [...new Set(tracks.map(s => s.filiere).filter(Boolean))].sort((a,b) => a.localeCompare(b,'fr'));
        refreshSelect('absenceFiliere', subjects, 'Toutes les filières');
        const selectedSubject = $('absenceFiliere').value;
        const groups = [...new Set(tracks.filter(s => !selectedSubject || s.filiere === selectedSubject).map(s => s.groupe).filter(Boolean))].sort((a,b) => a.localeCompare(b,'fr'));
        refreshSelect('absenceGroupe', groups, 'Tous les groupes');
    }

    function selectedRows() {
        const subject = $('absenceFiliere').value;
        const group = $('absenceGroupe').value;
        const query = normal($('absenceRecherche').value.trim());
        const situation = $('absenceSituation').value;
        return (Array.isArray(stagiaires) ? stagiaires : [])
            .filter(student => (!subject || student.filiere === subject) &&
                (!group || student.groupe === group) &&
                (!query || normal([student.nom,student.prenom,student.cef].join(' ')).includes(query)))
            .map(getStats)
            .filter(row => situation === 'tous' || (situation === 'absents' ? row.sessions > 0 : row.sessions === 0))
            .sort((a,b) => b.sessions - a.sessions || b.delays - a.delays ||
                (a.student.nom || '').localeCompare(b.student.nom || '', 'fr'));
    }

    function displayNumber(value) {
        return Number(value).toLocaleString('fr-FR', {maximumFractionDigits:1});
    }

    function paintMetrics(list) {
        const totalSessions = list.reduce((acc, row) => acc + row.sessions, 0);
        const totalDelays = list.reduce((acc, row) => acc + row.delays, 0);
        $('absenceKpiStagiaires').textContent = displayNumber(list.length);
        $('absenceKpiConcernes').textContent = displayNumber(list.filter(row => row.sessions > 0).length);
        $('absenceKpiSeances').textContent = displayNumber(totalSessions);
        $('absenceKpiHeures').textContent = displayNumber(totalSessions * 2.5) + ' h';
        $('absenceKpiRetards').textContent = displayNumber(totalDelays);
        const start = $('absenceDateDebut').value;
        const end = $('absenceDateFin').value;
        $('absencePeriode').textContent = 'Année scolaire : ' + ($('annee').value.trim() || 'non précisée') +
            (start || end ? '  ·  Période : ' + (start || 'début') + ' — ' + (end || 'fin') : '  ·  Toutes les dates');
    }

    function paintGraph(list) {
        const node = $('absenceGraphique');
        node.replaceChildren();
        const grouped = new Map();
        for (const row of list) {
            const key = row.student.groupe || 'Sans groupe';
            grouped.set(key, (grouped.get(key) || 0) + row.sessions);
        }
        const ranked = [...grouped].filter(entry => entry[1] > 0).sort((a,b) => b[1] - a[1]);
        if (!ranked.length) {
            const note = document.createElement('p');
            note.className = 'absence-vide';
            note.textContent = 'Aucune absence enregistrée pour cette sélection.';
            node.appendChild(note);
            return;
        }
        const max = ranked[0][1];
        for (const [group, count] of ranked.slice(0, 8)) {
            const bar = document.createElement('div');
            bar.className = 'absence-bar-row';
            bar.setAttribute('role', 'listitem');
            bar.setAttribute('aria-label', group + ' : ' + count + ' séance(s)');
            const label = document.createElement('span');
            label.className = 'absence-bar-label';
            label.title = group;
            label.textContent = group;
            const track = document.createElement('div');
            track.className = 'absence-bar-track';
            const fill = document.createElement('div');
            fill.className = 'absence-bar-fill';
            fill.style.width = ((count / max) * 100).toFixed(1) + '%';
            track.appendChild(fill);
            const number = document.createElement('span');
            number.className = 'absence-bar-number';
            number.textContent = displayNumber(count);
            bar.append(label, track, number);
            node.appendChild(bar);
        }
    }

    function openDetail(studentKey) {
        const row = rows.find(item => cleStagiaire(item.student) === studentKey);
        if (!row) {
            closeDetail();
            return;
        }
        currentDetailKey = studentKey;
        const {student, events} = row;
        $('absenceDetailsTitre').textContent = 'Historique : ' + [student.nom, student.prenom].filter(Boolean).join(' ') + ' — ' + (student.cef || 'sans CEF');
        const content = $('absenceDetailsContenu');
        content.replaceChildren();
        if (!events.length) {
            const empty = document.createElement('p');
            empty.className = 'absence-vide';
            empty.textContent = 'Aucune absence ni retard sur cette période.';
            content.appendChild(empty);
        } else {
            const list = document.createElement('ul');
            list.className = 'absence-event-list';
            for (const event of [...events].sort((a,b) => (b.date || '').localeCompare(a.date || ''))) {
                const item = document.createElement('li');
                item.textContent = (event.date || 'Date inconnue') + ' — ' + names[event.type];
                list.appendChild(item);
            }
            content.appendChild(list);
        }
        $('absenceDetails').hidden = false;
    }

    function closeDetail() {
        currentDetailKey = null;
        $('absenceDetails').hidden = true;
    }

    function paintTable(list) {
        const body = $('absenceTableCorps');
        body.replaceChildren();
        if (!list.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 9;
            td.textContent = (Array.isArray(stagiaires) && stagiaires.length ? 'Aucun stagiaire ne correspond aux filtres.' : 'Importez une liste de stagiaires pour afficher le tableau.');
            tr.appendChild(td);
            body.appendChild(tr);
            closeDetail();
            return;
        }
        for (const row of list) {
            const tr = document.createElement('tr');
            const s = row.student;
            for (const value of [s.cef, [s.nom,s.prenom].filter(Boolean).join(' '),s.filiere,s.groupe,
                row.sessions,displayNumber(row.hours) + ' h',row.delays,row.lastDate]) {
                const td = document.createElement('td');
                td.textContent = value == null ? '' : String(value);
                tr.appendChild(td);
            }
            const td = document.createElement('td');
            const button = document.createElement('button');
            button.className = 'absence-detail-button';
            button.type = 'button';
            button.textContent = 'Voir';
            button.setAttribute('aria-label', 'Voir les événements de ' + [s.nom,s.prenom].filter(Boolean).join(' '));
            button.addEventListener('click', () => openDetail(cleStagiaire(s)));
            td.appendChild(button);
            tr.appendChild(td);
            body.appendChild(tr);
        }
        if (currentDetailKey) openDetail(currentDetailKey);
    }

    function render() {
        refreshFilters();
        rows = selectedRows();
        paintMetrics(rows);
        paintGraph(rows);
        paintTable(rows);
    }

    function csvSafe(input) {
        let s = String(input == null ? '' : input);
        if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
        return '"' + s.replace(/"/g,'""') + '"';
    }

    function exportCsv() {
        const columns = ['CEF','Nom','Prénom','Filière','Groupe','Absences_séances','Heures_absence','Retards','Dernière_absence'];
        const cells = rows.map(r => [r.student.cef,r.student.nom,r.student.prenom,r.student.filiere,r.student.groupe,r.sessions,
            displayNumber(r.hours),r.delays,r.lastDate]);
        const csv = '\uFEFF' + [columns, ...cells].map(line => line.map(csvSafe).join(';')).join('\r\n');
        telechargerFichier(csv, 'tableau-absences.csv', 'text/csv;charset=utf-8');
    }

    for (const id of ['absenceFiliere','absenceGroupe','absenceRecherche','absenceSituation','absenceDateDebut','absenceDateFin']) {
        $(id).addEventListener(id === 'absenceRecherche' ? 'input' : 'change', render);
    }
    $('absenceFermerDetails').addEventListener('click', closeDetail);
    $('absenceExportCsv').addEventListener('click', exportCsv);
    $('annee').addEventListener('input', render);
    window.addEventListener('hashchange', () => {
        if (location.hash === '#absences') render();
    });
    document.addEventListener('click', event => {
        if (event.target.closest('[data-evenement], #historiqueDiscipline .supprimer')) render();
    });
    const studentsTable = $('listeStagiaires');
    new MutationObserver(render).observe(studentsTable, {childList:true});
    render();
})();
