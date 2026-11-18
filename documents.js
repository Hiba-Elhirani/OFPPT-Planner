// Impression sur modèles OFPPT : convocations (DOCX), PV FF / affichage (Excel), EFM et CC (Excel).
function securiser(texte) {
    return String(texte ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function dateFr(date) {
    if (!date) return "";
    const p = String(date).split("-");
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : String(date);
}
function formaterHeure(h) { return String(h || "").replace(":", "H"); }
function infosExamen() {
    return {
        filiere: valeur("filiere"), groupe: valeur("groupe"), type: valeur("typeExamen"),
        annee: valeur("annee"), session: valeur("session"), niveau: valeur("niveau"),
        date: dateFr(valeur("dateExamen")), dateISO: valeur("dateExamen"),
        heure: formaterHeure(valeur("heure")), heureFin: formaterHeure(valeur("heureFin")),
        salle: valeur("salle"), epreuve: valeur("epreuve"), etablissement: valeur("etablissement")
    };
}
const MODELES = {
    ofppt: 'assets/logo-ofppt-formulaires.png',
    arabe: 'assets/titre-arabe.png',
    fondation: 'assets/logo-fondation-mohammed-v.jpg'
};
const MAX_LIGNES_PAR_FEUILLE = 40;
function lignesParFeuille(liste) {
    // Les noms particulièrement longs exigent davantage de hauteur: éviter de couper les lignes à l'impression.
    const longs = liste.filter(s => String(s.nom || '').length > 23 || String(s.prenom || '').length > 23).length;
    return longs >= 6 ? 30 : longs >= 3 ? 35 : MAX_LIGNES_PAR_FEUILLE;
}
const classeVolume = n => n >= 34 ? ' nombreuses' : n >= 27 ? ' moyennes' : '';
function niveauLisible(examen, stagiaire) {
    const valeur = String(examen.niveau || stagiaire?.niveau || '').trim();
    return valeur.replace(/\s*\(TS\)\s*/gi,'').toUpperCase();
}
function niveauCourt(niveau) {
    const v = String(niveau||'').toUpperCase();
    return (v.includes('TECHNICIEN') && (v.includes('SPÉCIALIS') || v.includes('SPECIALIS'))) ? 'TS' :
        v.includes('FORMATION QUALIFIANTE') ? 'FQ' : v.includes('TECHNICIEN') ? 'T' :
        v.includes('QUALIFICATION') ? 'Q' : v.includes('SPÉCIALISATION') ? 'S' : niveau;
}
function formatHeurePlage(examen) {
    return examen.heureFin ? `${examen.heure} à ${examen.heureFin}` : examen.heure;
}
function dateLongueFr(examen) {
    const iso = examen.dateISO;
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return examen.date;
    const [y, m, d] = iso.split('-').map(Number);
    const names = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    const jours = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
    const jour = new Date(Date.UTC(y,m-1,d)).getUTCDay();
    return `${jours[jour]} ${d} ${names[m-1]} ${y}`;
}
function enTeteTableauExamen(examen, code) {
    const titre = code === 'EFF' ? 'EXAMEN DE FIN DE FORMATION' :
        code === 'EFM' ? 'EXAMEN DE FIN DE MODULE' : 'Contrôle continu';
    const annee = securiser(examen.annee);
    return `<header class="modele-en-tete">
        <div class="modele-logo-gauche"><img src="${MODELES.ofppt}" alt="Logo OFPPT"></div>
        <div class="modele-titres"><strong>${titre}</strong><span>RENTREE ${annee}</span></div>
        <img class="modele-fondation" src="${MODELES.fondation}" alt="Fondation Mohammed V pour la Solidarité">
    </header>`;
}
function enteteConvocation() {
    return `<div class="convocation-entete">
        <img class="logo" src="${MODELES.ofppt}" alt="OFPPT">
        <div class="convocation-office"><img class="arabe" src="${MODELES.arabe}" alt="مكتب التكوين المهني وإنعاش الشغل">
        <strong>Office de la Formation Professionnelle<br>et de la Promotion du Travail</strong></div>
    </div>`;
}
function sessionArabe(texte) {
    const s = String(texte || '');
    const mois=[['janvier','يناير'],['février','فبراير'],['mars','مارس'],['avril','أبريل'],['mai','ماي'],['juin','يونيو'],['juillet','يوليو'],['août','غشت'],['septembre','شتنبر'],['octobre','أكتوبر'],['novembre','نونبر'],['décembre','دجنبر']];
    let result = s;
    for (const [fr,ar] of mois) result = result.replace(new RegExp(fr,'gi'),ar);
    return result;
}
function creerConvocation(stagiaire, examen) {
    // Même structure de convocation que les deux modèles DOCX fournis.
    const niveau = niveauLisible(examen, stagiaire);
    const session = sessionArabe(examen.session);
    const titre = 'استدعاء اجتياز امتحانات نهاية التكوين';
    return `<article class="feuille convocation modele-ofppt" lang="ar">
        ${enteteConvocation()}
        <div class="convocation-fiche">
            <div class="convocation-titre" dir="rtl">${titre}</div>
            <table class="convocation-identite">
                <colgroup><col style="width:30%"><col style="width:28%"><col style="width:20%"><col style="width:22%"></colgroup>
                <tbody>
                    <tr><td colspan="2"><span>CEF :</span> <strong>${securiser(stagiaire.cef)}</strong></td><td colspan="2"><span>FILIERE :</span> <strong>${securiser(examen.filiere)}</strong></td></tr>
                    <tr><td><span>NOM</span></td><td><b>: ${securiser(stagiaire.nom)}</b></td><td><span>ANNEE</span></td><td><b>: ${securiser(examen.annee)}</b></td></tr>
                    <tr><td><span>PRENOM</span></td><td><b>: ${securiser(stagiaire.prenom)}</b></td><td><span>GROUPE</span></td><td><b>: ${securiser(examen.groupe)}</b></td></tr>
                    <tr><td><span>CNI</span></td><td><b>: ${securiser(stagiaire.cni)}</b></td><td><span>NIVEAU</span></td><td><b>: ${securiser(niveau)}</b></td></tr>
                </tbody>
            </table>
        </div>
        <div class="convocation-invitation" dir="rtl">أنتم مدعوون لاجتياز امتحانات نهاية السنة برسم دورة <strong><u>${securiser(session)}</u></strong> حسب <strong>البرنامج</strong> المحدد أسفله، لذا عليكم الحضور إلى مقر الامتحان قبل بداية الاختبارات <strong class="convocation-delai">30 دقيقة</strong>، <strong>مزودين بهذه الدعوة و بطاقة التعريف الوطنية.</strong></div>
        <table class="convocation-programme">
            <thead><tr><th colspan="5" class="programme-titre" dir="rtl">برنامج الامتحان</th></tr>
            <tr><th>Date</th><th>Horaires</th><th>Salle / Atelier</th><th>Etablissement</th><th>Épreuve</th></tr></thead>
            <tbody><tr><td>${securiser(dateLongueFr(examen))}</td><td>${securiser(examen.heure)}</td>
            <td>${securiser(examen.salle)}</td><td>${securiser(examen.etablissement)}</td><td>${securiser(examen.epreuve)}</td></tr></tbody>
        </table>
        <div class="convocation-reglement" dir="rtl">
            <strong class="reglement-titre"><u>التدابير والإجراءات المتعلقة بالامتحانات منصوص عليها في القانون الداخلي وخاصة الفصل السادس (F) منه:</u></strong>
            <ul>
                <li>يمنع منعا كليا إحضار إلى فضاء إجراء الامتحانات أي وسيلة للتواصل (هاتف أو أية واسطة إلكترونية أو غيرها...).</li>
                <li>إجبارية اللباس الموحد / البطاقة التعريفية للمتدرب / الهندام اللائق.</li>
                <li>وجوب إحضار جميع أدوات العمل حيث يمنع تبادلها أثناء الامتحان.</li>
                <li>كل محاولة للغش تعرض صاحبها للإقصاء والحرمان من الامتحان لمدة ثلاث سنوات.</li>
            </ul>
            <strong class="convocation-administration">الإدارة</strong>
        </div>
    </article>`;
}
function creerPresenceFF(liste, examen) {
    const niveau = niveauCourt(niveauLisible(examen,liste[0]));
    let resultat='';
    const capacite=lignesParFeuille(liste);
    for(let debut=0;debut<liste.length;debut+=capacite){
        const groupe=liste.slice(debut,debut+capacite);
        const lignes=groupe.map(stagiaire => `<tr><td>${securiser(stagiaire.cef)}</td><td>${securiser(stagiaire.nom)}</td><td>${securiser(stagiaire.prenom)}</td><td></td><td></td><td></td></tr>`).join('');
        resultat+=`<article class="feuille pv-ff modele-ofppt${classeVolume(groupe.length)}">
            <div class="ff-logos"><img src="${MODELES.ofppt}" alt="OFPPT"><img src="${MODELES.fondation}" alt="Fondation Mohammed V"></div>
            <h2>Feuille de présence des stagiaires</h2>
            <div class="ff-niveau"><b>Niveau de formation:</b> ${securiser(niveau)}</div>
            <div class="ff-session"><b>Examens de Fin de Formation</b><span>Session: ${securiser(examen.session)}</span></div>
            <table class="ff-meta"><thead><tr><th>EFP</th><th>Filière</th><th>Groupe</th><th>Epreuve</th><th>Date</th><th>Heure de démarrage</th></tr></thead>
            <tbody><tr><td>${securiser(examen.etablissement)}</td><td>${securiser(examen.filiere)}</td><td>${securiser(examen.groupe)}</td><td>${securiser(examen.epreuve)}</td><td>${securiser(examen.date)}</td><td>${securiser(examen.heure)}</td></tr></tbody></table>
            <table class="ff-presence"><colgroup><col style="width:18%"><col style="width:18%"><col style="width:17%"><col style="width:17%"><col style="width:16%"><col style="width:14%"></colgroup>
                <thead><tr><th class="ff-liste-titre" colspan="6">Liste des stagiaires présents</th></tr>
                <tr><th>N° inscription</th><th colspan="2" class="ff-nom-col">Nom et Prénom</th><th>Emargement au démarrage de l'épreuve</th><th>Emargement à la fin de l'épreuve</th><th>Observations</th></tr></thead>
                <tbody>${lignes}</tbody>
            </table>
            <div class="ff-evaluateur"><table><thead><tr><th>Matricule</th><th>Nom et Prénom</th><th>Emargement</th></tr></thead>
            <tbody><tr><td>……………………</td><td>……………………………………………………</td><td>………………………………</td></tr><tr><td>……………………</td><td>……………………………………………………</td><td>………………………………</td></tr></tbody></table></div>
        </article>`;
    }
    return resultat;
}
function creerAffichageFF(liste, examen) {
    let resultat='';
    const niveau = niveauLisible(examen,liste[0]);
    const capacite=lignesParFeuille(liste);
    for(let debut=0;debut<liste.length;debut+=capacite){
        const groupe=liste.slice(debut,debut+capacite);
        const lignes=groupe.map((stagiaire,i)=>`<tr><td>${debut+i+1}</td><td>${securiser(stagiaire.cef)}</td><td>${securiser(stagiaire.nom)}</td><td>${securiser(stagiaire.prenom)}</td><td></td></tr>`).join('');
        resultat+=`<article class="feuille pv-affichage modele-ofppt${classeVolume(groupe.length)}">
            ${enTeteTableauExamen(examen,'EFF')}
            <div class="aff-details">
                <div><span><b>Niveau:</b> ${securiser(niveau)}</span><span><b>Epreuve:</b> ${securiser(examen.epreuve)}</span></div>
                <div><span><b>Filière:</b> ${securiser(examen.filiere)}</span><span><b>Groupe:</b> ${securiser(examen.groupe)}</span></div>
                <div><span><b>DATE :</b> ${securiser(examen.date)}</span><span><b>HEURE:</b> ${securiser(examen.heure)}</span><span><b>SALLE :</b> ${securiser(examen.salle)}</span></div>
            </div>
            <table class="aff-liste"><colgroup><col style="width:8%"><col style="width:19%"><col style="width:25%"><col style="width:23%"><col style="width:25%"></colgroup>
                <thead><tr><th>N°<br>Ordre</th><th>CEF</th><th>Nom</th><th>Prénom</th><th></th></tr></thead>
                <tbody>${lignes}</tbody>
            </table>
        </article>`;
    }
    return resultat;
}
function creerPresenceModule(liste,examen,affichage){
    let resultat='';
    const niveau=niveauLisible(examen,liste[0]);
    const capacite=lignesParFeuille(liste);
    for(let debut=0;debut<liste.length;debut+=capacite){
        const groupe=liste.slice(debut,debut+capacite);
        let lignes=groupe.map((s,i)=>`<tr><td>${debut+i+1}</td><td>${securiser(s.cef)}</td><td>${securiser(s.nom)}</td><td>${securiser(s.prenom)}</td><td></td><td></td><td></td></tr>`).join('');
        // Les modèles EFM/CC d'origine comportent 25 lignes numérotées, même si le groupe est plus petit.
        if (liste.length <= MAX_LIGNES_PAR_FEUILLE) {
            for(let i=groupe.length;i<Math.min(25,MAX_LIGNES_PAR_FEUILLE);i++)
                lignes+=`<tr><td>${i+1}</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
        }
        resultat+=`<article class="feuille pv-module modele-ofppt${classeVolume(groupe.length)}">
            ${enTeteTableauExamen(examen,examen.type)}
            <h2>LISTE DE ${affichage?'':'PRESENCE DES '}PARTICIPANTS</h2>
            <div class="module-metadata"><div class="module-gauche">
                <div><b>Niveau:</b> ${securiser(niveau)}</div>
                <div><b>Filière:</b> ${securiser(examen.filiere)}</div>
                <div><b>Groupe:</b> ${securiser(examen.groupe)}</div>
                <div><b>Date:</b> ${securiser(examen.date)}</div>
                <div><b>Intitulé du module:</b> ${securiser(examen.epreuve)}</div>
            </div><div class="module-droite">
                <div><b>Effectif stagiaires :</b> ${securiser(liste.length)}</div>
                <div><b>Effectif présents :</b> ……………</div>
                <div><b>Horaire de</b> ${securiser(examen.heure)} <b>à</b> ${securiser(examen.heureFin || '…………')}</div>
                <div><b>Salle:</b> ${securiser(examen.salle)}</div>
            </div></div>
            <table class="module-presence"><colgroup><col style="width:8%"><col style="width:18%"><col style="width:17%"><col style="width:17%"><col style="width:14%"><col style="width:13%"><col style="width:13%"></colgroup>
                <thead><tr><th>N°Ordre</th><th>CEF</th><th>Nom</th><th>Prénom</th><th>Signature avant examen</th><th>Signature après examen</th><th>Observations</th></tr></thead>
                <tbody>${lignes}</tbody>
            </table>
            <div class="module-evaluateur"><strong>Formateur évaluateur</strong><table><thead><tr><th>Prénom et nom</th><th>Emargement</th></tr></thead>
                <tbody><tr><td>…………………………………………</td><td>……………………………</td></tr></tbody></table></div>
        </article>`;
    }
    return resultat;
}

// Liste d'affichage EFM / CC : volontairement distincte de la feuille de présence.
// Aucune colonne de signature ni bloc "formateur évaluateur" ne figure sur cette liste.
function creerAffichageModule(liste, examen) {
    let resultat = '';
    const niveau = niveauLisible(examen, liste[0]);
    const capacite = lignesParFeuille(liste);
    for (let debut = 0; debut < liste.length; debut += capacite) {
        const groupe = liste.slice(debut, debut + capacite);
        const lignes = groupe.map((stagiaire, i) => `<tr>
            <td>${debut + i + 1}</td>
            <td>${securiser(stagiaire.cef)}</td>
            <td>${securiser(stagiaire.nom)}</td>
            <td>${securiser(stagiaire.prenom)}</td>
        </tr>`).join('');
        resultat += `<article class="feuille pv-affichage module-affichage modele-ofppt${classeVolume(groupe.length)}">
            ${enTeteTableauExamen(examen, examen.type)}
            <h2 class="module-affichage-titre">LISTE D'AFFICHAGE DES PARTICIPANTS</h2>
            <div class="aff-details">
                <div><span><b>Niveau :</b> ${securiser(niveau)}</span><span><b>Épreuve :</b> ${securiser(examen.epreuve)}</span></div>
                <div><span><b>Filière :</b> ${securiser(examen.filiere)}</span><span><b>Groupe :</b> ${securiser(examen.groupe)}</span></div>
                <div><span><b>DATE :</b> ${securiser(examen.date)}</span><span><b>HEURE :</b> ${securiser(formatHeurePlage(examen))}</span><span><b>SALLE :</b> ${securiser(examen.salle)}</span></div>
            </div>
            <table class="aff-liste module-affichage-liste">
                <colgroup><col style="width:12%"><col style="width:28%"><col style="width:30%"><col style="width:30%"></colgroup>
                <thead><tr><th>N° Ordre</th><th>CEF</th><th>Nom</th><th>Prénom</th></tr></thead>
                <tbody>${lignes}</tbody>
            </table>
        </article>`;
    }
    return resultat;
}

function ouvrirImpression(html){
    element('zoneImpression').innerHTML=html;
    // Let layout/images settle before opening Chrome's print preview.
    const imgs=Array.from(element('zoneImpression').querySelectorAll('img'));
    const ready=imgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});}));
    Promise.all(ready).then(()=>window.print());
}
function imprimer(type){
    if (!stagiaires.length) {alert('Commencez par importer les stagiaires.');return;}
    if (!valeur('filiere') || !valeur('groupe')) {alert('Choisissez une filière et un groupe.');return;}
    if (!valeur('dateExamen') || !valeur('heure') || !valeur('salle') || !valeur('epreuve')) {
        alert("Remplissez la date, l'heure, la salle et l'épreuve.");return;
    }
    const liste=stagiairesSelectionnes();
    if (!liste.length) { alert('Aucun stagiaire dans le groupe sélectionné.');return; }
    const examen=infosExamen();
    let html='';
    // Each print button has its own document generator, for every exam type.
    if (type === 'convocations') {
        html = liste.map(s => creerConvocation(s, examen)).join('');
    } else if (type === 'presences') {
        html = examen.type === 'EFF'
            ? creerPresenceFF(liste, examen)   // Keep the established PV FF layout unchanged.
            : creerPresenceModule(liste, examen, false);
    } else if (type === 'affichage') {
        html = examen.type === 'EFF'
            ? creerAffichageFF(liste, examen)
            : creerAffichageModule(liste, examen);
    } else {
        console.error('Type de document inconnu :', type);
        return;
    }
    ouvrirImpression(html);
}
