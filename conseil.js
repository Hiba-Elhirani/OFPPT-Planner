function texteLignes(texte) {
    return securiser(texte).replace(/\n/g, "<br>");
}

function creerConseilDisciplinaire(stagiaire) {
    let date = dateFr(valeur("dateConseil"));
    let faits = "";
    if (valeur("heuresAbsence") !== "") {
        faits += "<p>• الغياب غير المبرر (" + securiser(valeur("heuresAbsence")) + " ساعة غياب).</p>";
    }
    if (valeur("faitsConseil") !== "") {
        faits += "<p>• " + texteLignes(valeur("faitsConseil")) + "</p>";
    }
    if (faits === "") faits = "<p>............................................................................</p>";

    let decision = texteLignes(valeur("decisionConseil")) || "............................................................................";
    let observations = texteLignes(valeur("observationsConseil")) || "............................................................................";
    let membres = valeur("membresConseil").split("\n");
    let nomsMembres = "";

    for (let i = 0; i < 5; i++) {
        let nom = membres[i] ? membres[i].trim() : "";
        nomsMembres += "<p>◄ " + (securiser(nom) || ".........................................................") + "</p>";
    }

    return `<article class="feuille pv-conseil" dir="rtl" lang="ar">
        <div class="conseil-haut">
            <div>المملكة المغربية<br>مكتب التكوين المهني وإنعاش الشغل<br>
                المديرية الجهوية سوس ماسة<br>المركب الاجتماعي للتكوين المهني أكادير<br>
                المركز المختلط أكادير</div>
            <div>أكادير في : ${securiser(date)}<br>المرجع : ${securiser(valeur("referenceConseil")) || "................"}</div>
        </div>
        <h2>محضر اجتماع المجلس التأديبي</h2>
        <p class="conseil-paragraphe">انعقد يوم ${securiser(date)} مجلس تأديبي للنظر في السلوك المتعلق بالمتدرب(ة)
            <strong>${securiser(stagiaire.nom)} ${securiser(stagiaire.prenom)}</strong>
            شعبة <strong>${securiser(stagiaire.groupe)}</strong> السنة التكوينية
            <strong>${securiser(valeur("annee"))}</strong>، على إثر التصرفات التالية:</p>
        ${valeur("presenceConseil") ? '<p>حضور المتدرب(ة) إلى المجلس : ' + securiser(valeur("presenceConseil")) + '</p>' : ''}
        <div class="conseil-faits">${faits}</div>
        <p class="conseil-paragraphe">هذا، وبعد الاستماع إلى المعني بالأمر قرر أعضاء المجلس التأديبي ما يلي:</p>
        <p class="conseil-decision">• ${decision}</p>
        <p><strong>ملحوظة :</strong> ${observations}</p>
        <div class="conseil-membres">
            <strong>أعضاء المجلس التأديبي هم السادة :</strong>
            ${nomsMembres}
        </div>
        <p class="conseil-bas">ترسل نسخة قصد الاطلاع إلى ولي المتدرب(ة)<br>
            تودع نسخة في ملف المتدرب(ة)</p>
    </article>`;
}


function imprimerConseil() {
    if (valeur("stagiaireConseil") === "") {
        alert("Choisissez un stagiaire pour le conseil disciplinaire.");
        return;
    }
    if (valeur("dateConseil") === "") {
        alert("Choisissez la date du conseil disciplinaire.");
        return;
    }
    let stagiaire = choixConseil[Number(valeur("stagiaireConseil"))];
    if (!stagiaire) return;
    ouvrirImpression(creerConseilDisciplinaire(stagiaire));
}
