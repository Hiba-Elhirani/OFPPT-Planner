// CONVOCATIONS ET FEUILLES DE PRESENCE : groupe JavaScript

// Protéger les textes qui vont être placés dans les documents HTML.
function securiser(texte) {
    return String(texte || "").replace(/&/g, "&amp;")
                              .replace(/</g, "&lt;")
                              .replace(/>/g, "&gt;")
                              .replace(/"/g, "&quot;")
                              .replace(/'/g, "&#39;");
}

// Les informations saisies dans le formulaire.
function infosExamen() {
    let date = valeur("dateExamen").split("-");
    return {
        filiere: valeur("filiere"),
        groupe: valeur("groupe"),
        type: element("typeExamen").selectedOptions[0].textContent,
        codeType: valeur("typeExamen"),
        annee: valeur("annee"),
        session: valeur("session"),
        niveau: valeur("niveau"),
        date: date[2] + "/" + date[1] + "/" + date[0],
        heure: valeur("heure"),
        salle: valeur("salle"),
        epreuve: valeur("epreuve"),
        etablissement: valeur("etablissement")
    };
}

// En-tête utilisé dans les documents.
function enteteDocument() {
    return `<div class="entete-document">
                <img class="logo" src="assets/logo-ofppt.png" alt="OFPPT">
                <img class="arabe" src="assets/titre-arabe.png" alt="مكتب التكوين المهني وإنعاش الشغل">
                <strong>Office de la Formation Professionnelle<br>et de la Promotion du Travail</strong>
            </div>`;
}

// Générer UNE convocation pour UN stagiaire.
function creerConvocation(stagiaire, examen) {
    let niveau = stagiaire.niveau;
    if (examen.niveau !== "") niveau = examen.niveau;

    let titre = "استدعاء اجتياز امتحانات نهاية التكوين";
    if (examen.codeType !== "EFF") titre = "استدعاء لاجتياز الامتحان";

    return `<article class="feuille">
        ${enteteDocument()}
        <h2 dir="rtl">${titre}</h2>
        <table>
            <tr><td>CEF : ${securiser(stagiaire.cef)}</td><td>FILIÈRE : ${securiser(examen.filiere)}</td></tr>
            <tr><td>NOM : ${securiser(stagiaire.nom)}</td><td>ANNÉE : ${securiser(examen.annee)}</td></tr>
            <tr><td>PRÉNOM : ${securiser(stagiaire.prenom)}</td><td>GROUPE : ${securiser(examen.groupe)}</td></tr>
            <tr><td>CNI : ${securiser(stagiaire.cni)}</td><td>NIVEAU : ${securiser(niveau)}</td></tr>
        </table>
        <p class="message-arabe">أنتم مدعوون لاجتياز امتحانات نهاية السنة برسم دورة
        ${securiser(examen.session)} حسب البرنامج المحدد أسفله، لذا عليكم الحضور
        إلى مقر الامتحان <b>30 دقيقة</b> قبل بداية الاختبارات، مزودين بهذه الدعوة
        وبطاقة التعريف الوطنية.</p>
        <h3 dir="rtl">برنامج الامتحان</h3>
        <table>
            <tr><th>Date</th><th>Horaires</th><th>Salle / Atelier</th><th>Établissement</th><th>Épreuve</th></tr>
            <tr><td>${securiser(examen.date)}</td><td>${securiser(examen.heure)}</td>
                <td>${securiser(examen.salle)}</td><td>${securiser(examen.etablissement)}</td>
                <td>${securiser(examen.epreuve)}</td></tr>
        </table>
        <div class="reglement">
            <strong>التدابير والإجراءات المتعلقة بالامتحانات</strong>
            <ul>
                <li>يمنع إحضار الهاتف أو أي وسيلة تواصل إلى فضاء الامتحان.</li>
                <li>إجبارية اللباس الموحد والبطاقة التعريفية والهندام اللائق.</li>
                <li>يجب إحضار جميع أدوات العمل ويمنع تبادلها أثناء الامتحان.</li>
                <li>كل محاولة للغش تعرض صاحبها للعقوبات المنصوص عليها في النظام الداخلي.</li>
            </ul>
            <strong>الإدارة</strong>
        </div>
    </article>`;
}

// Générer une feuille de présence ou une liste d'affichage.
function creerListe(liste, examen, affichage) {
    let documentHTML = "";
    let titre = "LISTE DE PRÉSENCE DES PARTICIPANTS";
    if (affichage) titre = "LISTE D'AFFICHAGE";
    let niveau = examen.niveau;
    if (niveau === "" && liste.length > 0) niveau = liste[0].niveau;

    // On met 18 stagiaires par page pour laisser de la place aux signatures.
    for (let debut = 0; debut < liste.length; debut += 18) {
        let groupe = liste.slice(debut, debut + 18);
        let lignes = "";

        for (let i = 0; i < groupe.length; i++) {
            let stagiaire = groupe[i];
            lignes += `<tr>
                <td>${debut + i + 1}</td>
                <td>${securiser(stagiaire.cef)}</td>
                <td>${securiser(stagiaire.nom)}</td>
                <td>${securiser(stagiaire.prenom)}</td>`;

            if (!affichage) {
                lignes += '<td class="signature"></td><td class="signature"></td><td></td>';
            }
            lignes += '</tr>';
        }

        let colonnes = "";
        if (!affichage) {
            colonnes = "<th>Signature avant</th><th>Signature après</th><th>Observations</th>";
        }

        documentHTML += `<article class="feuille">
            <p><strong>OFPPT - DRSM - ${securiser(examen.etablissement)}</strong></p>
            <h2>${securiser(examen.type)}</h2>
            <h3>${titre}</h3>
            <p class="infos-examen">
                <strong>Année :</strong> ${securiser(examen.annee)} &nbsp;&nbsp;
                <strong>Session :</strong> ${securiser(examen.session)} &nbsp;&nbsp;
                <strong>Niveau :</strong> ${securiser(niveau)}<br>
                <strong>Filière :</strong> ${securiser(examen.filiere)} &nbsp;&nbsp;
                <strong>Groupe :</strong> ${securiser(examen.groupe)}<br>
                <strong>Épreuve :</strong> ${securiser(examen.epreuve)} &nbsp;&nbsp;
                <strong>Date :</strong> ${securiser(examen.date)}<br>
                <strong>Heure :</strong> ${securiser(examen.heure)} &nbsp;&nbsp;
                <strong>Salle :</strong> ${securiser(examen.salle)}<br>
                <strong>Effectif des stagiaires :</strong> ${liste.length} &nbsp;&nbsp;
                <strong>Effectif présents :</strong> __________
            </p>
            <table>
                <tr><th>N°</th><th>CEF</th><th>Nom</th><th>Prénom</th>${colonnes}</tr>
                ${lignes}
            </table>
            <p>Surveillant 1 : ____________________ &nbsp; Surveillant 2 : ____________________</p>
        </article>`;
    }
    return documentHTML;
}

// Vérifier puis imprimer les documents demandés.
function imprimer(type) {
    if (stagiaires.length === 0) {
        alert("Commencez par importer les stagiaires.");
        return;
    }

    if (valeur("filiere") === "" || valeur("groupe") === "") {
        alert("Choisissez une filière et un groupe.");
        return;
    }

    if (valeur("dateExamen") === "" || valeur("heure") === "" ||
        valeur("salle") === "" || valeur("epreuve") === "") {
        alert("Remplissez la date, l'heure, la salle et l'épreuve.");
        return;
    }

    let liste = stagiairesSelectionnes();
    if (liste.length === 0) {
        alert("Aucun stagiaire trouvé avec cette sélection.");
        return;
    }

    let examen = infosExamen();
    let resultat = "";

    if (type === "convocations") {
        for (let stagiaire of liste) {
            resultat += creerConvocation(stagiaire, examen);
        }
    }
    if (type === "presences") resultat = creerListe(liste, examen, false);
    if (type === "affichage") resultat = creerListe(liste, examen, true);

    element("zoneImpression").innerHTML = resultat;
    window.print();
}

