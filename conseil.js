function texteLignes(texte) {return securiser(texte).replace(/\n/g,'<br>');}
function creerConseilDisciplinaire(stagiaire) {
    const date = dateFr(valeur('dateConseil'));
    const faits = [];
    if (valeur('heuresAbsence') !== '') faits.push(`الغياب غير المبرر (${securiser(valeur('heuresAbsence'))} ساعة غياب).`);
    if (valeur('faitsConseil') !== '') faits.push(texteLignes(valeur('faitsConseil')));
    const faitsHTML = faits.length ? faits.map(texte=>`<p>❖ ${texte}</p>`).join('') : '<p>❖ ................................................................................</p>';
    const decision = valeur('decisionConseil') ? texteLignes(valeur('decisionConseil')) : '................................................................................';
    const observations = valeur('observationsConseil') ? texteLignes(valeur('observationsConseil')) : '................................................................................';
    const membres = valeur('membresConseil').split('\n');
    const nomsMembres = Array.from({length:5},(_,i)=>{
        const nom=(membres[i]||'').trim();
        return `<p>◄ ${securiser(nom) || '...................................................................................................'}</p>`;
    }).join('');
    const ref=securiser(valeur('referenceConseil')) || '................';
    const presence = valeur('presenceConseil') ? `<p class="conseil-paragraphe">حضور المتدرب(ة) إلى المجلس: ${securiser(valeur('presenceConseil'))}</p>` : '';
    return `<article class="feuille pv-conseil modele-conseil" dir="rtl" lang="ar">
      <div class="conseil-haut">
        <div class="conseil-adresse">المملكة المغربية<br>مكتب التكوين المهني وإنعاش الشغل<br>المديرية الجهوية سوس ماسة درعة<br>المركب الاجتماعي للتكوين المهني أكادير<br>المركز المختلط أكادير
            <div class="conseil-reference">المرجع : م ت م / م ج س م د / م م ت م / ت م / رقم ${ref} / ${securiser(valeur('annee').split('-')[1]||'')}</div>
        </div>
        <div class="conseil-date">أكادير في : ${securiser(date)}</div>
      </div>
      <h2>محضر اجتماع المجلس التأديبي</h2>
      <p class="conseil-paragraphe">انعقد يوم <strong>${securiser(date)}</strong> مجلس تأديبي للنظر في السلوك المتعلق بالمتدرب <strong>${securiser(stagiaire.nom)} ${securiser(stagiaire.prenom)}</strong> شعبة <strong>${securiser(stagiaire.groupe)}</strong> السنة التكوينية <strong>${securiser(valeur('annee'))}</strong> على إثر التصرفات غير اللائقة الصادرة عن المعني بالأمر والمتمثلة في القيام بالأفعال التالية:</p>
      ${presence}
      <div class="conseil-faits">${faitsHTML}</div>
      <p class="conseil-paragraphe">هذا، وبعد الاستماع إلى المعني بالأمر قرر أعضاء المجلس التأديبي ما يلي:</p>
      <div class="conseil-decision">❖ ${decision}</div>
      <p class="conseil-observations">❖ <strong>ملحوظة :</strong> ${observations}</p>
      <div class="conseil-membres"><strong>أعضاء المجلس التأديبي هم السادة :</strong>${nomsMembres}</div>
      <p class="conseil-bas">ترسل نسخة قصد الاطلاع إلى ولي المتدرب (ة)<br>تودع نسخة في ملف المتدرب (ة)</p>
    </article>`;
}
function imprimerConseil() {
    if (!valeur('stagiaireConseil')) { alert('Choisissez un stagiaire pour le conseil disciplinaire.');return;}
    if (!valeur('dateConseil')) { alert('Choisissez la date du conseil disciplinaire.');return;}
    const stagiaire=choixConseil[Number(valeur('stagiaireConseil'))];
    if (!stagiaire) return;
    ouvrirImpression(creerConseilDisciplinaire(stagiaire));
}
