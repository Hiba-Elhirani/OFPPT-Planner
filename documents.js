function securiser(texte) {
    return String(texte ?? "").replace(/&/g, "&amp;")
                              .replace(/</g, "&lt;")
                              .replace(/>/g, "&gt;")
                              .replace(/"/g, "&quot;")
                              .replace(/'/g, "&#39;");
}

function dateFr(date) {
    if (!date) return "";
    let parties = date.split("-");
    return parties[2] + "/" + parties[1] + "/" + parties[0];
}

function formaterHeure(heure) {
    return heure.replace(":", "H");
}

function infosExamen() {
    return {
        filiere: valeur("filiere"),
        groupe: valeur("groupe"),
        type: valeur("typeExamen"),
        annee: valeur("annee"),
        session: valeur("session"),
        niveau: valeur("niveau"),
        date: dateFr(valeur("dateExamen")),
        heure: formaterHeure(valeur("heure")),
        heureFin: formaterHeure(valeur("heureFin")),
        salle: valeur("salle"),
        epreuve: valeur("epreuve"),
        etablissement: valeur("etablissement")
    };
}

function enteteConvocation() {
    return `<div class="entete-document">
                <img class="logo" src="assets/logo-ofppt.png" alt="OFPPT">
                <img class="arabe" src="assets/titre-arabe.png" alt="OFPPT">
                <strong>Office de la Formation Professionnelle<br>et de la Promotion du Travail</strong>
            </div>`;
}

function creerConvocation(stagiaire, examen) {
    let niveau = examen.niveau || stagiaire.niveau;
    let titre = "استدعاء اجتياز امتحانات نهاية التكوين";
    if (examen.type !== "EFF") titre = "استدعاء لاجتياز الامتحان";

    return `<article class="feuille convocation">
        ${enteteConvocation()}
        <h2 dir="rtl">${titre}</h2>
        <table class="table-convocation">
            <tr><td>CEF : ${securiser(stagiaire.cef)}</td><td>FILIÈRE : ${securiser(examen.filiere)}</td></tr>
            <tr><td>NOM : ${securiser(stagiaire.nom)}</td><td>ANNÉE : ${securiser(examen.annee)}</td></tr>
            <tr><td>PRÉNOM : ${securiser(stagiaire.prenom)}</td><td>GROUPE : ${securiser(examen.groupe)}</td></tr>
            <tr><td>CNI : ${securiser(stagiaire.cni)}</td><td>NIVEAU : ${securiser(niveau)}</td></tr>
        </table>
        <p class="message-arabe" dir="rtl">أنتم مدعوون لاجتياز امتحانات نهاية السنة برسم دورة
            ${securiser(examen.session)} حسب البرنامج المحدد أسفله، لذا عليكم الحضور
            إلى مقر الامتحان <strong>30 دقيقة</strong> قبل بداية الاختبارات، مزودين بهذه الدعوة
            وبطاقة التعريف الوطنية.</p>
        <h3 dir="rtl">برنامج الامتحان</h3>
        <table>
            <tr><th>Date</th><th>Horaires</th><th>Salle / Atelier</th><th>Établissement</th><th>Épreuve</th></tr>
            <tr><td>${securiser(examen.date)}</td><td>${securiser(examen.heure)}</td>
                <td>${securiser(examen.salle)}</td><td>${securiser(examen.etablissement)}</td>
                <td>${securiser(examen.epreuve)}</td></tr>
        </table>
        <div class="reglement" dir="rtl">
            <strong>التدابير والإجراءات المتعلقة بالامتحانات</strong>
            <ul>
                <li>يمنع إحضار وسائل التواصل إلى فضاء الامتحان.</li>
                <li>إجبارية اللباس الموحد والبطاقة التعريفية والهندام اللائق.</li>
                <li>يجب إحضار جميع أدوات العمل ويمنع تبادلها أثناء الامتحان.</li>
                <li>كل محاولة للغش تعرض صاحبها للعقوبات المنصوص عليها في النظام الداخلي.</li>
            </ul>
            <strong>الإدارة</strong>
        </div>
    </article>`;
}

function creerPresenceFF(liste, examen) {
    let resultat = "";
    let niveau = examen.niveau || liste[0].niveau;

    for (let debut = 0; debut < liste.length; debut += 22) {
        let groupe = liste.slice(debut, debut + 22);
        let lignes = "";

        for (let stagiaire of groupe) {
            lignes += `<tr>
                <td>${securiser(stagiaire.cef)}</td>
                <td>${securiser(stagiaire.nom)}</td>
                <td>${securiser(stagiaire.prenom)}</td>
                <td></td><td></td><td></td>
            </tr>`;
        }

        resultat += `<article class="feuille pv-ff">
            <p class="petit-entete">OFPPT</p>
            <h2>Feuille de présence des stagiaires</h2>
            <p class="droite"><strong>Niveau de formation :</strong> ${securiser(niveau)}</p>
            <div class="ligne-session">
                <strong>Examens de Fin de Formation</strong>
                <strong>Session : ${securiser(examen.session)}</strong>
            </div>
            <table class="table-meta">
                <tr><th>EFP</th><th>Filière</th><th>Groupe</th><th>Épreuve</th><th>Date</th><th>Heure de démarrage</th></tr>
                <tr><td>${securiser(examen.etablissement)}</td><td>${securiser(examen.filiere)}</td>
                    <td>${securiser(examen.groupe)}</td><td>${securiser(examen.epreuve)}</td>
                    <td>${securiser(examen.date)}</td><td>${securiser(examen.heure)}</td></tr>
            </table>
            <h3>Liste des stagiaires présents</h3>
            <table class="table-presence-ff">
                <colgroup>
                    <col style="width:18%"><col style="width:18%"><col style="width:16%">
                    <col style="width:17%"><col style="width:17%"><col style="width:14%">
                </colgroup>
                <thead><tr>
                    <th>N° inscription</th><th colspan="2">Nom et Prénom</th>
                    <th>Emargement au démarrage de l'épreuve</th>
                    <th>Emargement à la fin de l'épreuve</th>
                    <th>Observations</th>
                </tr></thead>
                <tbody>${lignes}</tbody>
            </table>
        </article>`;
    }
    return resultat;
}

function creerAffichageFF(liste, examen) {
    let resultat = "";
    let niveau = examen.niveau || liste[0].niveau;

    for (let debut = 0; debut < liste.length; debut += 28) {
        let groupe = liste.slice(debut, debut + 28);
        let lignes = "";
        for (let i = 0; i < groupe.length; i++) {
            let stagiaire = groupe[i];
            lignes += `<tr><td>${debut + i + 1}</td><td>${securiser(stagiaire.cef)}</td>
                         <td>${securiser(stagiaire.nom)}</td><td>${securiser(stagiaire.prenom)}</td></tr>`;
        }
        resultat += `<article class="feuille pv-affichage">
            <h2>EXAMEN DE FIN DE FORMATION</h2>
            <p class="aff-annee">OFPPT &nbsp;&nbsp;&nbsp; RENTREE ${securiser(examen.annee)}</p>
            <p>DRSM<br>${securiser(examen.etablissement)}</p>
            <div class="aff-infos">
                <p><strong>Niveau :</strong> ${securiser(niveau)} <span><strong>Épreuve :</strong> ${securiser(examen.epreuve)}</span></p>
                <p><strong>Filière :</strong> ${securiser(examen.filiere)} <span><strong>Groupe :</strong> ${securiser(examen.groupe)}</span></p>
                <p><strong>DATE :</strong> ${securiser(examen.date)} <span><strong>HEURE :</strong> ${securiser(examen.heure)} &nbsp;&nbsp; <strong>SALLE :</strong> ${securiser(examen.salle)}</span></p>
            </div>
            <table class="table-affichage">
                <thead><tr><th>N° Ordre</th><th>CEF</th><th>Nom</th><th>Prénom</th></tr></thead>
                <tbody>${lignes}</tbody>
            </table>
        </article>`;
    }
    return resultat;
}

function creerPresenceModule(liste, examen, affichage) {
    let resultat = "";
    let titre = examen.type === "EFM" ? "EXAMEN DE FIN DE MODULE" : "CONTRÔLE CONTINU";
    let niveau = examen.niveau || liste[0].niveau;
    let heureComplete = examen.heure;
    if (examen.heureFin !== "") heureComplete += " à " + examen.heureFin;

    for (let debut = 0; debut < liste.length; debut += 22) {
        let groupe = liste.slice(debut, debut + 22);
        let lignes = "";
        for (let i = 0; i < groupe.length; i++) {
            let s = groupe[i];
            lignes += `<tr><td>${debut + i + 1}</td><td>${securiser(s.cef)}</td>
                <td>${securiser(s.nom)}</td><td>${securiser(s.prenom)}</td>`;
            if (!affichage) lignes += "<td></td><td></td><td></td>";
            lignes += "</tr>";
        }

        let colonnes = affichage ? "" :
            "<th>Signature avant examen</th><th>Signature après examen</th><th>Observations</th>";
        resultat += `<article class="feuille pv-module">
            <strong>${titre}</strong>
            <p>RENTREE ${securiser(examen.annee)}</p>
            <p>DRSM<br>${securiser(examen.etablissement)}</p>
            <h2>LISTE DE ${affichage ? "PARTICIPANTS" : "PRESENCE DES PARTICIPANTS"}</h2>
            <div class="module-infos">
                <p><strong>Niveau :</strong> ${securiser(niveau)} &nbsp;&nbsp;
                   <strong>Effectif stagiaires :</strong> ${liste.length}</p>
                <p><strong>Filière :</strong> ${securiser(examen.filiere)} &nbsp;&nbsp;
                   <strong>Effectif présents :</strong> ________</p>
                <p><strong>Groupe :</strong> ${securiser(examen.groupe)} &nbsp;&nbsp;
                   <strong>Date :</strong> ${securiser(examen.date)} &nbsp;&nbsp;
                   <strong>Horaire :</strong> ${securiser(heureComplete)}</p>
                <p><strong>Intitulé du module :</strong> ${securiser(examen.epreuve)}</p>
            </div>
            <table class="table-module"><tr><th>N° Ordre</th><th>CEF</th><th>Nom</th><th>Prénom</th>${colonnes}</tr>${lignes}</table>
        </article>`;
    }
    return resultat;
}

function ouvrirImpression(html) {
    element("zoneImpression").innerHTML = html;
    window.print();
}

function imprimer(type) {
    if (stagiaires.length === 0) {
        alert("Commencez par importer les stagiaires.");
        return;
    }
    if (!valeur("filiere") || !valeur("groupe")) {
        alert("Choisissez une filière et un groupe.");
        return;
    }
    if (!valeur("dateExamen") || !valeur("heure") || !valeur("salle") || !valeur("epreuve")) {
        alert("Remplissez la date, l'heure, la salle et l'épreuve.");
        return;
    }

    let liste = stagiairesSelectionnes();
    if (liste.length === 0) {
        alert("Aucun stagiaire dans le groupe sélectionné.");
        return;
    }

    let examen = infosExamen();
    let html = "";

    if (type === "convocations") {
        for (let stagiaire of liste) {
            html += creerConvocation(stagiaire, examen);
        }
    } else if (examen.type === "EFF") {
        if (type === "presences") html = creerPresenceFF(liste, examen);
        if (type === "affichage") html = creerAffichageFF(liste, examen);
    } else {
        html = creerPresenceModule(liste, examen, type === "affichage");
    }
    ouvrirImpression(html);
}

