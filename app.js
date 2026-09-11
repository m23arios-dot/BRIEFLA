let current="home", stack=[], category="", currentLetterId=null;
const SAVED_LETTERS_KEY="brieﬂa:savedLetters";
const views=[...document.querySelectorAll(".view")];
const $=id=>document.getElementById(id);

function show(id,push=true){
  if(!$(id)) return;
  if(push && current!==id) stack.push(current);
  current=id;
  views.forEach(v=>v.classList.toggle("active",v.id===id));
  document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===id));
  if(id==="letters") renderSavedLetters();
}

document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.go)));
document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>show(stack.pop()||"home",false)));
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>{stack=[];show(b.dataset.nav,false)}));
document.querySelectorAll(".cat").forEach(b=>b.addEventListener("click",()=>{category=b.dataset.category; show("describe")}));

const area=$("caseText"), counter=$("counter");
area?.addEventListener("input",()=>counter.textContent=`${area.value.length}/10000`);

const templates={
  address:{title:"Zgłoszenie zmiany adresu",body:"hiermit möchte ich Sie über meine neue Anschrift informieren.\n\nMeine neue Adresse lautet:\n[Neue Anschrift]\n\nIch bitte Sie, meine Daten entsprechend zu aktualisieren und mir die Änderung kurz zu bestätigen.\n\nVielen Dank für Ihre Unterstützung."},
  newJob:{title:"Mitteilung über eine neue Beschäftigung",body:"hiermit informiere ich Sie darüber, dass ich ab dem [Datum] eine neue Beschäftigung aufnehmen werde.\n\nIch bitte Sie, diese Änderung in meinen Unterlagen zu berücksichtigen. Falls Sie weitere Unterlagen oder Nachweise benötigen, lasse ich Ihnen diese gerne zukommen.\n\nVielen Dank für Ihre Rückmeldung."},
  kindergeld:{title:"Antrag auf Kindergeld",body:"hiermit möchte ich Kindergeld für mein Kind beantragen.\n\nDie erforderlichen Angaben und Unterlagen habe ich diesem Schreiben beigefügt. Sollten noch Unterlagen oder Nachweise fehlen, teilen Sie mir bitte mit, welche Dokumente noch benötigt werden.\n\nVielen Dank für die Bearbeitung meines Antrags."},
  appeal:{title:"Widerspruch gegen einen Bescheid",body:"hiermit lege ich gegen den Bescheid vom [Datum] Widerspruch ein.\n\nIch bitte Sie, den Bescheid erneut zu prüfen und meine Einwände bei der Entscheidung zu berücksichtigen. Eine ausführliche Begründung bzw. weitere Unterlagen reiche ich bei Bedarf gerne nach.\n\nBitte bestätigen Sie mir den Eingang meines Widerspruchs schriftlich."},
  appointment:{title:"Bitte um einen Termin",body:"ich möchte gerne einen Termin bei Ihnen vereinbaren.\n\nBitte teilen Sie mir mit, wann ein Termin möglich ist. Falls möglich, bevorzuge ich einen Termin am [Wunschtermin] bzw. innerhalb des Zeitraums [Zeitraum].\n\nVielen Dank für Ihre Rückmeldung."},
  documents:{title:"Nachreichung fehlender Unterlagen",body:"hiermit reiche ich die noch fehlenden Unterlagen zu meinem Vorgang nach.\n\nDie entsprechenden Dokumente finden Sie im Anhang. Falls weitere Unterlagen oder Nachweise benötigt werden, teilen Sie mir dies bitte mit.\n\nVielen Dank für die Bearbeitung."},
  rentTermination:{title:"Kündigung des Mietvertrags",body:"hiermit kündige ich den Mietvertrag für die Wohnung [Adresse] fristgerecht zum nächstmöglichen Zeitpunkt.\n\nBitte bestätigen Sie mir den Eingang dieser Kündigung sowie den Beendigungstermin schriftlich.\n\nVielen Dank."},
  sick:{title:"Krankmeldung",body:"hiermit möchte ich Sie darüber informieren, dass ich seit dem [Datum] krankheitsbedingt nicht arbeiten kann.\n\nEine Arbeitsunfähigkeitsbescheinigung liegt vor bzw. wird entsprechend übermittelt. Sobald ich wieder arbeitsfähig bin, informiere ich Sie.\n\nVielen Dank für Ihr Verständnis."},
  absence:{title:"Erklärung meiner Abwesenheit",body:"hiermit möchte ich meine Abwesenheit am [Datum] kurz erklären.\n\nDer Grund für meine Abwesenheit war [Grund]. Ich bitte um Verständnis und entschuldige mich für die entstandenen Unannehmlichkeiten.\n\nFür Rückfragen stehe ich gerne zur Verfügung."},
  other:{title:"Allgemeines Anliegen",body:"ich wende mich an Sie bezüglich meines Anliegens.\n\n[Hier kurz beschreiben, worum es geht.]\n\nBitte teilen Sie mir mit, ob Sie weitere Informationen oder Unterlagen benötigen. Ich danke Ihnen im Voraus für Ihre Rückmeldung."},
  registration:{title:"Anmeldung",recipient:"Bürgeramt",body:"hiermit möchte ich mich an meinem neuen Wohnort anmelden.\n\nMeine neue Anschrift lautet:\n[Neue Anschrift]\n\nBitte teilen Sie mir mit, ob für die Anmeldung noch weitere Unterlagen benötigt werden.\n\nVielen Dank für Ihre Rückmeldung."},
  deregistration:{title:"Abmeldung",recipient:"Bürgeramt",body:"hiermit möchte ich mich zum [Datum] von meiner bisherigen Anschrift abmelden.\n\nBitte bestätigen Sie mir die Abmeldung schriftlich und teilen Sie mir mit, ob weitere Unterlagen erforderlich sind.\n\nVielen Dank."},
  auslander:{title:"Anfrage an die Ausländerbehörde",recipient:"Ausländerbehörde",body:"ich wende mich an Sie bezüglich meines Aufenthaltsstatus.\n\nIch benötige Informationen zu meinem Anliegen und möchte gerne einen Termin bzw. eine Rückmeldung erhalten.\n\nBitte teilen Sie mir mit, welche Unterlagen ich einreichen soll.\n\nVielen Dank für Ihre Unterstützung."},
  requestDecision:{title:"Bitte um erneute Prüfung",body:"ich bitte Sie, meinen Vorgang bzw. die getroffene Entscheidung erneut zu prüfen.\n\nSollten weitere Informationen oder Unterlagen benötigt werden, reiche ich diese gerne nach.\n\nBitte teilen Sie mir das Ergebnis der Prüfung schriftlich mit."},
  jobcenter:{title:"Mitteilung an das Jobcenter",recipient:"Jobcenter",body:"hiermit möchte ich Sie über eine Änderung meiner persönlichen bzw. beruflichen Situation informieren.\n\n[Hier die Änderung beschreiben.]\n\nBitte berücksichtigen Sie diese Information in meinem Vorgang und teilen Sie mir mit, ob weitere Unterlagen benötigt werden.\n\nVielen Dank."},
  incomeChange:{title:"Mitteilung über eine Einkommensänderung",recipient:"Jobcenter",body:"hiermit informiere ich Sie darüber, dass sich mein Einkommen ab dem [Datum] geändert hat.\n\nDie entsprechenden Nachweise füge ich diesem Schreiben bei. Falls weitere Unterlagen benötigt werden, teilen Sie mir dies bitte mit.\n\nVielen Dank."},
  familykasse:{title:"Anfrage an die Familienkasse",recipient:"Familienkasse",body:"ich wende mich an Sie bezüglich meines Kindergeldantrags bzw. meiner Kindergeldangelegenheit.\n\nBitte informieren Sie mich über den aktuellen Bearbeitungsstand und teilen Sie mir mit, ob noch Unterlagen fehlen.\n\nVielen Dank für Ihre Rückmeldung."},
  finanzamt:{title:"Anfrage an das Finanzamt",recipient:"Finanzamt",body:"ich wende mich an Sie bezüglich meiner steuerlichen Angelegenheit.\n\n[Hier kurz beschreiben, worum es geht.]\n\nBitte teilen Sie mir mit, welche Unterlagen oder Informationen Sie noch benötigen.\n\nVielen Dank."},
  taxDocuments:{title:"Nachreichung von Unterlagen an das Finanzamt",recipient:"Finanzamt",body:"hiermit reiche ich die noch fehlenden Unterlagen zu meinem steuerlichen Vorgang nach.\n\nDie Dokumente finden Sie im Anhang. Bitte bestätigen Sie mir kurz den Eingang.\n\nVielen Dank."},
  healthInsurance:{title:"Anfrage an die Krankenkasse",recipient:"Krankenkasse",body:"ich wende mich an Sie bezüglich meiner Krankenversicherung.\n\n[Hier kurz beschreiben, worum es geht.]\n\nBitte teilen Sie mir mit, ob weitere Unterlagen oder Angaben benötigt werden.\n\nVielen Dank für Ihre Rückmeldung."},
  employer:{title:"Anfrage an den Arbeitgeber",recipient:"Arbeitgeber",body:"ich wende mich an Sie bezüglich meines Arbeitsverhältnisses.\n\n[Hier kurz beschreiben, worum es geht.]\n\nBitte teilen Sie mir mit, wann ich die benötigte Information bzw. Bescheinigung erhalten kann.\n\nVielen Dank."},
  rentIssue:{title:"Anfrage an Vermieter / Hausverwaltung",recipient:"Vermieter / Hausverwaltung",body:"ich wende mich an Sie bezüglich meiner Wohnung in [Adresse].\n\n[Hier das Problem bzw. Anliegen beschreiben.]\n\nBitte teilen Sie mir mit, wie wir das Problem lösen können und wann eine Rückmeldung bzw. ein Termin möglich ist.\n\nVielen Dank."},
  carRegistration:{title:"Anfrage an die Zulassungsstelle",recipient:"Zulassungsstelle",body:"ich wende mich an Sie bezüglich der Zulassung meines Fahrzeugs.\n\n[Hier kurz beschreiben, was benötigt wird.]\n\nBitte teilen Sie mir mit, welche Unterlagen erforderlich sind und ob ich einen Termin benötige.\n\nVielen Dank."},
  license:{title:"Anfrage an die Führerscheinstelle",recipient:"Führerscheinstelle",body:"ich wende mich an Sie bezüglich meines Führerscheins.\n\n[Hier kurz beschreiben, worum es geht.]\n\nBitte teilen Sie mir mit, welche Unterlagen erforderlich sind und wie ich weiter vorgehen soll.\n\nVielen Dank."},
  pension:{title:"Anfrage an die Deutsche Rentenversicherung",recipient:"Deutsche Rentenversicherung",body:"ich wende mich an Sie bezüglich meiner Rentenversicherung bzw. meines Versicherungsverlaufs.\n\n[Hier kurz beschreiben, worum es geht.]\n\nBitte teilen Sie mir mit, ob weitere Unterlagen oder Angaben benötigt werden.\n\nVielen Dank."},
  contribution:{title:"Anfrage zum Rundfunkbeitrag",recipient:"Beitragsservice",body:"ich wende mich an Sie bezüglich meines Rundfunkbeitrags.\n\n[Hier kurz beschreiben, worum es geht.]\n\nBitte prüfen Sie meinen Vorgang und teilen Sie mir mit, ob weitere Informationen oder Unterlagen benötigt werden.\n\nVielen Dank."}
};

function polishFor(key){
  const map={
    address:"Informuję o zmianie adresu i proszę o aktualizację danych.",
    newJob:"Informuję, że od wskazanej daty rozpoczynam nową pracę i proszę o uwzględnienie tej zmiany.",
    kindergeld:"Chcę złożyć wniosek o Kindergeld. Dokumenty zostały dołączone, a w razie braków proszę o informację.",
    appeal:"Składam odwołanie od wskazanej decyzji i proszę o ponowne sprawdzenie sprawy.",
    appointment:"Proszę o wyznaczenie terminu spotkania w podanym terminie lub możliwie najbliższym czasie.",
    documents:"Przesyłam brakujące dokumenty i proszę o informację, jeśli potrzebne są jeszcze inne załączniki.",
    rentTermination:"Wypowiadam umowę najmu z zachowaniem obowiązującego terminu wypowiedzenia.",
    sick:"Informuję o niezdolności do pracy z powodu choroby.",
    absence:"Wyjaśniam przyczynę mojej nieobecności i proszę o uwzględnienie wyjaśnienia.",
    other:"Przedstawiam swoje pytanie lub prośbę i proszę o odpowiedź.",
    registration:"Chcę dokonać meldunku pod nowym adresem i proszę o informację, jakie dokumenty są potrzebne.",
    deregistration:"Chcę się wymeldować z dotychczasowego adresu i proszę o potwierdzenie.",
    auslander:"Proszę o informację w sprawie pobytu, terminu lub wymaganych dokumentów w Ausländerbehörde.",
    requestDecision:"Proszę o ponowne sprawdzenie mojego wniosku lub decyzji.",
    jobcenter:"Informuję Jobcenter o mojej sytuacji i proszę o uwzględnienie zmiany w sprawie.",
    incomeChange:"Informuję o zmianie dochodu i przekazuję potrzebne informacje lub dokumenty.",
    familykasse:"Proszę Familienkasse o informację dotyczącą Kindergeld i brakujących dokumentów.",
    finanzamt:"Przedstawiam sprawę podatkową i proszę Finanzamt o informację lub odpowiedź.",
    taxDocuments:"Dosyłam brakujące dokumenty do Finanzamt i proszę o potwierdzenie odbioru.",
    healthInsurance:"Przedstawiam sprawę dotyczącą ubezpieczenia zdrowotnego i proszę Krankenkasse o odpowiedź.",
    employer:"Proszę pracodawcę o informację, dokument lub zaświadczenie związane z pracą.",
    rentIssue:"Zgłaszam problem dotyczący mieszkania i proszę wynajmującego o rozwiązanie sprawy.",
    carRegistration:"Proszę Zulassungsstelle o informacje dotyczące rejestracji samochodu.",
    license:"Proszę Führerscheinstelle o informacje dotyczące prawa jazdy.",
    pension:"Proszę Deutsche Rentenversicherung o informacje dotyczące mojego ubezpieczenia lub stażu.",
    contribution:"Przedstawiam sprawę dotyczącą Rundfunkbeitrag i proszę o jej sprawdzenie."
  }; return map[key]||map.other;
}

function getSavedLetters(){
  try{return JSON.parse(localStorage.getItem(SAVED_LETTERS_KEY)||"[]")}catch(e){return []}
}

function setSavedLetters(items){
  try{localStorage.setItem(SAVED_LETTERS_KEY,JSON.stringify(items))}catch(e){}
}

function saveCurrentLetter(){
  const item={
    id:currentLetterId||String(Date.now()),
    title:$("editSubject")?.value.trim()||"Moje pismo",
    subject:$("editSubject")?.value.trim()||"Anfrage",
    senderName:$("editSenderName")?.value.trim()||"",
    recipient:$("editRecipient")?.value.trim()||"",
    street:$("editStreet")?.value.trim()||"",
    city:$("editCity")?.value.trim()||"",
    recipientAddress:$("editRecipientAddress")?.value.trim()||"",
    date:$("editDate")?.value||"",
    body:$("editBody")?.value||"",
    translation:$("translation")?.textContent||"",
    updatedAt:new Date().toISOString()
  };
  const items=getSavedLetters();
  const index=items.findIndex(x=>x.id===item.id);
  if(index>=0) items[index]=item; else items.unshift(item);
  currentLetterId=item.id;
  setSavedLetters(items);
  renderSavedLetters();
  const btn=$("saveText");
  if(btn){btn.textContent="✓  Zapisano";setTimeout(()=>{btn.textContent="⇩  Zapisz pismo"},1600)}
  return item;
}

function downloadCurrentLetter(){
  const text=$("letterText")?.textContent||"";
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="BRIEFLA-pismo.txt";a.click();URL.revokeObjectURL(a.href);
}

function openSavedLetter(id){
  const item=getSavedLetters().find(x=>x.id===id);
  if(!item)return;
  currentLetterId=item.id;
  prepareEditor(item.subject,item.body,item.senderName,item.recipient,item.recipientAddress,{street:item.street,city:item.city,date:item.date});
  if($("translation")) $("translation").textContent=item.translation||"";
  show("result");
}

function deleteSavedLetter(id){
  const items=getSavedLetters().filter(x=>x.id!==id);
  setSavedLetters(items);
  if(currentLetterId===id) currentLetterId=null;
  renderSavedLetters();
}

function renderSavedLetters(){
  const box=$("savedLetters");
  if(!box)return;
  const items=getSavedLetters();
  if(!items.length){
    box.innerHTML='<div class="saved-empty"><b>Nie masz jeszcze zapisanych pism.</b><br>Przygotuj pismo, kliknij „Zapisz pismo” i znajdziesz je tutaj.</div>';
    return;
  }
  box.innerHTML=items.map(item=>{
    const date=item.updatedAt?new Intl.DateTimeFormat("pl-PL",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(item.updatedAt)):"";
    return `<div class="saved-letter"><div class="saved-letter-main" data-open-letter="${item.id}"><b>${escapeHtml(item.title||"Moje pismo")}</b><small>${escapeHtml(item.recipient||"Bez odbiorcy")} · ${date}</small></div><div class="saved-letter-actions"><button data-open-letter="${item.id}">Otwórz</button><button class="delete-letter" data-delete-letter="${item.id}">Usuń</button></div></div>`;
  }).join("");
  box.querySelectorAll("[data-open-letter]").forEach(el=>el.addEventListener("click",()=>openSavedLetter(el.dataset.openLetter)));
  box.querySelectorAll("[data-delete-letter]").forEach(el=>el.addEventListener("click",()=>deleteSavedLetter(el.dataset.deleteLetter)));
}

function escapeHtml(value){
  return String(value).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
}

function formatDateForInput(dateText){
  const d=dateText ? new Date(dateText) : new Date();
  if(Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0,10);
}

function formatDateForLetter(value){
  if(!value) return new Intl.DateTimeFormat("de-DE").format(new Date());
  const d=new Date(value+"T00:00:00");
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("de-DE").format(d);
}

function updateTemplatePreview(){
  const name=$("editSenderName")?.value.trim()||"Vorname Nachname";
  const recipient=$("editRecipient")?.value.trim()||"An die zuständige Stelle";
  const street=$("editStreet")?.value.trim();
  const city=$("editCity")?.value.trim();
  const recipientAddress=$("editRecipientAddress")?.value.trim();
  const subject=$("editSubject")?.value.trim()||"Anfrage";
  const body=$("editBody")?.value||"";
  const date=$("editDate")?.value;
  const address=[street,city].filter(Boolean).join("\n");
  const recipientBlock=[recipient,recipientAddress].filter(Boolean).join("\n");
  const header=[recipientBlock,address].filter(Boolean).join("\n\n");
  const closing=`Mit freundlichen Grüßen\n\n${name}`;
  const full=[header,body.trim(),closing].filter(Boolean).join("\n\n");
  if($("subject")) $("subject").textContent=subject;
  if($("letterText")) $("letterText").textContent=full;
  if($("docRecipient")) $("docRecipient").textContent=recipient;
  if($("docDate")) $("docDate").textContent=formatDateForLetter(date);
}

function prepareEditor(subject, body, sender="", recipient="", recipientAddress="", savedFields=null){
  if($("editSubject")) $("editSubject").value=subject||"Anfrage";
  if($("editBody")) $("editBody").value=body||"";
  if($("editSenderName")) $("editSenderName").value=sender||$("senderNameInput")?.value.trim()||"";
  if($("editRecipient")) $("editRecipient").value=recipient||$("recipientInput")?.value.trim()||"";
  if($("editRecipientAddress")) $("editRecipientAddress").value=recipientAddress||"";
  if($("editStreet")) $("editStreet").value=savedFields?.street||"";
  if($("editCity")) $("editCity").value=savedFields?.city||"";
  if($("editDate")) $("editDate").value=savedFields?.date||formatDateForInput();
  updateTemplatePreview();
}

function fillResult(subject, body, translation, recipient=""){
  currentLetterId=null;
  prepareEditor(subject, body, "", recipient);
  if($("translation")) $("translation").textContent=translation||"Tłumaczenie zostanie przygotowane na podstawie wybranego pisma.";
  const copy=$("copy"); if(copy) copy.textContent="▣  Kopiuj";
  show("result");
}

function generate(){
  const raw=(area?.value||"").trim()||"Chcę poinformować Państwa o mojej sytuacji i proszę o kontakt w tej sprawie.";
  const l=raw.toLowerCase();
  let subject="Anfrage", body=`ich wende mich an Sie bezüglich meines Anliegens.\n\n${raw}\n\nBitte teilen Sie mir mit, ob Sie weitere Informationen oder Unterlagen benötigen.`;
  if(l.includes("wypowied")||l.includes("mieszkan")){subject="Kündigung des Mietvertrags";body=`hiermit möchte ich meinen Mietvertrag kündigen.\n\n${raw}\n\nBitte bestätigen Sie mir den Eingang dieser Kündigung und teilen Sie mir den Beendigungstermin mit.`}
  else if(l.includes("jobcenter")||l.includes("bürgergeld")){subject="Mitteilung über meine Beschäftigung";body=`hiermit informiere ich Sie darüber, dass sich meine berufliche Situation geändert hat.\n\n${raw}\n\nBitte prüfen Sie die Angaben und teilen Sie mir mit, ob weitere Unterlagen benötigt werden.`}
  else if(l.includes("praca")||l.includes("prac")){subject="Mitteilung über meine neue Beschäftigung";body=`hiermit möchte ich Sie darüber informieren, dass ich eine neue Beschäftigung aufgenommen habe bzw. aufnehmen werde.\n\n${raw}\n\nBitte berücksichtigen Sie diese Änderung und teilen Sie mir mit, ob Sie weitere Unterlagen benötigen.`}
  fillResult(subject,body,"Przedstawiam swoje Anliegen po niemiecku w jasnej, formalnej formie. Treść została przygotowana na podstawie Twojego opisu.");
}
$("generate")?.addEventListener("click",generate);

document.querySelectorAll("[data-template]").forEach(btn=>btn.addEventListener("click",()=>{
  const key=btn.dataset.template, t=templates[key]||templates.other;
  fillResult(t.title,t.body,polishFor(key),t.recipient||"");
}));

$("templateSearch")?.addEventListener("input",e=>{
  const q=e.target.value.trim().toLowerCase();
  document.querySelectorAll("#templateList [data-template]").forEach(btn=>{
    btn.hidden=!btn.textContent.toLowerCase().includes(q);
  });
});

$("copy")?.addEventListener("click",async()=>{
  try{
    await navigator.clipboard.writeText($("letterText").textContent);
    $("copy").textContent="✓  Skopiowano";
    setTimeout(()=>{$("copy").textContent="▣  Kopiuj"},1600);
  }catch(e){ alert("Nie udało się skopiować tekstu."); }
});

$("copyPolish")?.addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText($("translation").textContent);$("copyPolish").textContent="✓  Skopiowano";setTimeout(()=>$("copyPolish").textContent="PL  Tłumaczenie",1600)}catch(e){}}
);

document.querySelectorAll("#templateEditor input, #templateEditor textarea").forEach(el=>el.addEventListener("input",updateTemplatePreview));
$("focusEditor")?.addEventListener("click",()=>$("editSubject")?.focus());

$("saveText")?.addEventListener("click",()=>{
  saveCurrentLetter();
  try{localStorage.setItem("brieﬂa:lastLetter",$("letterText").textContent)}catch(e){}
});

$("goTemplates")?.addEventListener("click",()=>show("templates"));

renderSavedLetters();

/* BRIEFLA language layer: Polish / Ukrainian UI. German letter content stays German. */
const LANG_KEY="brieﬂa:language";
let language="pl";

const uiText={
  pl:{
    navStart:"Start",navCategories:"Kategorie",navLetters:"Moje pisma",navTemplates:"Szablony",navProfile:"Profil",settings:"Ustawienia",help:"Pomoc / FAQ",
    heroTitle:"Twoje pisma po niemiecku.<br>Prosto. Szybko. Bez stresu.",benefit1:"E-maile i listy do urzędów",benefit2:"Gotowe szablony",benefit3:"Tłumaczenia i wyjaśnienia",benefit4:"Krok po kroku",startNow:"Zacznij teraz <span>→</span>",
    feature1Title:"Wybierz kategorię",feature1Text:"Znajdź odpowiedni temat Twojej sprawy.",feature2Title:"Opisz swoją sprawę",feature2Text:"Napisz po polsku, co chcesz przekazać.",feature3Title:"Otrzymaj gotowe pismo",feature3Text:"Pobierz, skopiuj lub wyślij bezpośrednio.",
    step1:"KROK 1",chooseCategory:"Wybierz kategorię",step2:"KROK 2",describeCase:"Opisz swoją sprawę",step3:"KROK 3",letterReady:"Twoje pismo jest gotowe!",
    describeIntro:"Napisz po polsku, co chcesz przekazać.<br>Możesz wpisać to własnymi słowami.",addFile:"▧ &nbsp; Dodaj plik <small>(np. zdjęcie pisma)</small>",next:"Dalej <span>→</span>",
    editorTitle:"Dostosuj pismo do siebie",editorSub:"Uzupełnij dane i zmień treść przed wysłaniem.",editing:"EDYCJA",senderName:"Imię i nazwisko",recipient:"Odbiorca / urząd",street:"Ulica i numer",city:"PLZ i miejscowość",recipientAddress:"Adres odbiorcy",date:"Data",subjectLabel:"Temat",bodyLabel:"Treść pisma",editorHint:"Możesz zmienić każde pole. Podgląd poniżej aktualizuje się automatycznie.",emailTab:"E-mail",letterTab:"List (DIN 5008)",translationLabel:"🇵🇱 &nbsp; Tłumaczenie na polski",copy:"▣ &nbsp; Kopiuj",translationButton:"PL &nbsp; Tłumaczenie",saveLetter:"⇩ &nbsp; Zapisz pismo",aiNote:"BRIEFLA przygotowuje pismo na podstawie Twojego opisu. Wersja AI analizuje sens wypowiedzi, a nie tylko podmienia słowa.",
    savedLettersSub:"Twoje zapisane pisma",lettersIntro:"Tu znajdziesz pisma, które wcześniej przygotowałeś i zapisałeś.",createFromTemplate:"＋ &nbsp; Utwórz z szablonu",templatesSub:"Gotowe pisma do edycji",searchTemplate:"⌕  Szukaj szablonu...",sectionOffices:"Urzędy i sprawy urzędowe",sectionMoney:"Jobcenter i pieniądze",sectionWorkHealth:"Praca i zdrowie",sectionHomeCar:"Mieszkanie i samochód",sectionOther:"Pozostałe",
    cat_office:"Urząd / Amt",cat_work:"Praca / Arbeitgeber",cat_money:"Pieniądze",cat_housing:"Mieszkanie",cat_health:"Zdrowie",cat_car:"Samochód",cat_reply:"Odpowiedź na otrzymane pismo",cat_otherCase:"Zupełnie inna sprawa",
    catOfficeDesc:"np. Bürgeramt, Ausländerbehörde",catWorkDesc:"np. umowa, zaświadczenia",catMoneyDesc:"np. Finanzamt, Jobcenter, Kindergeld",catHousingDesc:"np. wynajem, wypowiedzenie",catHealthDesc:"np. Krankenkasse",catCarDesc:"np. Führerschein, Zulassung",catReplyDesc:"np. decyzja, wezwanie",catOtherDesc:"Opisz po prostu, o co chodzi",
    senderOptional:"Twoje imię i nazwisko (opcjonalnie)",recipientOptional:"Odbiorca / urząd (opcjonalnie)",casePlaceholder:"Np. Chcę napisać do Jobcenter, że od 1 października zaczynam nową pracę i proszę o wstrzymanie wypłaty Bürgergeld.",
    freePlan:"Plan: Darmowy",pro:"Pro",threeLetters:"✓ &nbsp; 3 pisma miesięcznie",basicTemplates:"✓ &nbsp; Podstawowe szablony",translationPolish:"✓ &nbsp; Tłumaczenie na polski",goPro:"♛ &nbsp; Przejdź na wersję Pro",savedTemplates:"♡ &nbsp; Zapisane szablony <i>›</i>",profileLetters:"▤ &nbsp; Moje pisma <i>›</i>",profileSettings:"⚙ &nbsp; Ustawienia <i>›</i>",profileHelp:"? &nbsp; Pomoc / FAQ <i>›</i>",contact:"✉ &nbsp; Kontakt <i>›</i>",about:"ⓘ &nbsp; O aplikacji",
    translationSummary:"🇵🇱 &nbsp; Tłumaczenie na polski",savedEmpty:"<b>Nie masz jeszcze zapisanych pism.</b><br>Przygotuj pismo, kliknij „Zapisz pismo” i znajdziesz je tutaj.",open:"Otwórz",remove:"Usuń",copied:"✓  Skopiowano",saved:"✓  Zapisano",copyError:"Nie udało się skopiować tekstu.",genericTranslation:"Przedstawiam swoje Anliegen po niemiecku w jasnej, formalnej formie. Treść została przygotowana na podstawie Twojego opisu."
  },
  uk:{
    navStart:"Головна",navCategories:"Категорії",navLetters:"Мої листи",navTemplates:"Шаблони",navProfile:"Профіль",settings:"Налаштування",help:"Допомога / FAQ",
    heroTitle:"Ваші листи німецькою.<br>Просто. Швидко. Без стресу.",benefit1:"Електронні листи та листи до установ",benefit2:"Готові шаблони",benefit3:"Переклади та пояснення",benefit4:"Крок за кроком",startNow:"Почати зараз <span>→</span>",
    feature1Title:"Оберіть категорію",feature1Text:"Знайдіть відповідну тему вашої справи.",feature2Title:"Опишіть свою справу",feature2Text:"Напишіть українською, що ви хочете повідомити.",feature3Title:"Отримайте готовий лист",feature3Text:"Завантажте, скопіюйте або надішліть його.",
    step1:"КРОК 1",chooseCategory:"Оберіть категорію",step2:"КРОК 2",describeCase:"Опишіть свою справу",step3:"КРОК 3",letterReady:"Ваш лист готовий!",
    describeIntro:"Напишіть українською, що ви хочете повідомити.<br>Можете описати все своїми словами.",addFile:"▧ &nbsp; Додати файл <small>(наприклад, фото листа)</small>",next:"Далі <span>→</span>",
    editorTitle:"Налаштуйте лист під себе",editorSub:"Заповніть дані та змініть текст перед надсиланням.",editing:"РЕДАГУВАННЯ",senderName:"Ім’я та прізвище",recipient:"Одержувач / установа",street:"Вулиця та номер",city:"Індекс і місто",recipientAddress:"Адреса одержувача",date:"Дата",subjectLabel:"Тема",bodyLabel:"Текст листа",editorHint:"Ви можете змінити будь-яке поле. Попередній перегляд оновлюється автоматично.",emailTab:"E-mail",letterTab:"Лист (DIN 5008)",translationLabel:"🇺🇦 &nbsp; Переклад українською",copy:"▣ &nbsp; Копіювати",translationButton:"UA &nbsp; Переклад",saveLetter:"⇩ &nbsp; Зберегти лист",aiNote:"BRIEFLA готує лист на основі вашого опису. Версія AI аналізує зміст, а не просто замінює слова.",
    savedLettersSub:"Ваші збережені листи",lettersIntro:"Тут ви знайдете листи, які раніше підготували та зберегли.",createFromTemplate:"＋ &nbsp; Створити з шаблону",templatesSub:"Готові листи для редагування",searchTemplate:"⌕  Пошук шаблону...",sectionOffices:"Установи та офіційні справи",sectionMoney:"Jobcenter і фінанси",sectionWorkHealth:"Робота та здоров’я",sectionHomeCar:"Житло та автомобіль",sectionOther:"Інше",
    cat_office:"Установа / Amt",cat_work:"Робота / Arbeitgeber",cat_money:"Гроші",cat_housing:"Житло",cat_health:"Здоров’я",cat_car:"Автомобіль",cat_reply:"Відповідь на отриманий лист",cat_otherCase:"Зовсім інша справа",
    catOfficeDesc:"наприклад Bürgeramt, Ausländerbehörde",catWorkDesc:"наприклад договір, довідки",catMoneyDesc:"наприклад Finanzamt, Jobcenter, Kindergeld",catHousingDesc:"наприклад оренда, розірвання договору",catHealthDesc:"наприклад Krankenkasse",catCarDesc:"наприклад Führerschein, Zulassung",catReplyDesc:"наприклад рішення, вимога",catOtherDesc:"Просто опишіть, у чому справа",
    senderOptional:"Ваше ім’я та прізвище (необов’язково)",recipientOptional:"Одержувач / установа (необов’язково)",casePlaceholder:"Напр. Я хочу повідомити Jobcenter, що з 1 жовтня починаю нову роботу і прошу припинити виплату Bürgergeld.",
    freePlan:"План: Безкоштовний",pro:"Pro",threeLetters:"✓ &nbsp; 3 листи на місяць",basicTemplates:"✓ &nbsp; Основні шаблони",translationPolish:"✓ &nbsp; Переклад українською",goPro:"♛ &nbsp; Перейти на версію Pro",savedTemplates:"♡ &nbsp; Збережені шаблони <i>›</i>",profileLetters:"▤ &nbsp; Мої листи <i>›</i>",profileSettings:"⚙ &nbsp; Налаштування <i>›</i>",profileHelp:"? &nbsp; Допомога / FAQ <i>›</i>",contact:"✉ &nbsp; Контакт <i>›</i>",about:"ⓘ &nbsp; Про застосунок",
    translationSummary:"🇺🇦 &nbsp; Переклад українською",savedEmpty:"<b>У вас ще немає збережених листів.</b><br>Підготуйте лист, натисніть «Зберегти лист» — і він з’явиться тут.",open:"Відкрити",remove:"Видалити",copied:"✓  Скопійовано",saved:"✓  Збережено",copyError:"Не вдалося скопіювати текст.",genericTranslation:"Нижче показано інформацію про підготовлений німецький лист. Повний переклад українською буде окремою функцією."
  }
};

const templateUi={
  pl:{
    address:["Zmiana adresu","Bürgeramt / urząd miasta"],registration:["Anmeldung / meldunek","Zameldowanie w Niemczech"],deregistration:["Abmeldung","Wymeldowanie"],auslander:["Ausländerbehörde","Termin, dokumenty, pobyt"],appointment:["Prośba o termin","Termin w urzędzie"],documents:["Brakujące dokumenty","Dosłanie załączników"],appeal:["Odwołanie od decyzji","Widerspruch"],requestDecision:["Prośba o ponowne rozpatrzenie","Sprawdzenie sprawy / decyzji"],jobcenter:["Jobcenter / Bürgergeld","Informacja o sytuacji"],newJob:["Zgłoszenie nowej pracy","Nowe zatrudnienie"],incomeChange:["Zmiana dochodu","Jobcenter / urząd"],familykasse:["Familienkasse","Kindergeld i dokumenty"],kindergeld:["Wniosek o Kindergeld","Świadczenie na dziecko"],finanzamt:["Finanzamt","Podatki i zaświadczenia"],taxDocuments:["Dosłanie dokumentów podatkowych","Finanzamt"],healthInsurance:["Krankenkasse","Ubezpieczenie zdrowotne"],sick:["Zgłoszenie choroby","Krankmeldung"],employer:["Pracodawca / Arbeitgeber","Zaświadczenia i informacje"],absence:["Wyjaśnienie nieobecności","Praca / urząd"],rentTermination:["Wypowiedzenie umowy najmu","Mieszkanie"],rentIssue:["Problem z mieszkaniem","Vermieter / Hausverwaltung"],carRegistration:["Zulassungsstelle","Rejestracja samochodu"],license:["Führerscheinstelle","Prawo jazdy"],pension:["Deutsche Rentenversicherung","Emerytura i dokumenty"],contribution:["Beitragsservice","Rundfunkbeitrag"],other:["Inne szablony","Opisz własną sprawę"]
  },
  uk:{
    address:["Зміна адреси","Bürgeramt / міська установа"],registration:["Anmeldung / реєстрація","Реєстрація місця проживання в Німеччині"],deregistration:["Abmeldung","Зняття з реєстрації"],auslander:["Ausländerbehörde","Документи, дозвіл на проживання, запис"],appointment:["Запит на термін","Термін у державній установі"],documents:["Відсутні документи","Надсилання додаткових документів"],appeal:["Оскарження рішення","Widerspruch"],requestDecision:["Запит на повторний розгляд","Повторна перевірка справи / рішення"],jobcenter:["Jobcenter / Bürgergeld","Повідомлення про ситуацію"],newJob:["Повідомлення про нову роботу","Нове працевлаштування"],incomeChange:["Зміна доходу","Jobcenter / установа"],familykasse:["Familienkasse","Kindergeld та документи"],kindergeld:["Заява на Kindergeld","Допомога на дитину"],finanzamt:["Finanzamt","Податки та довідки"],taxDocuments:["Надсилання податкових документів","Finanzamt"],healthInsurance:["Krankenkasse","Медичне страхування"],sick:["Повідомлення про хворобу","Krankmeldung"],employer:["Роботодавець / Arbeitgeber","Довідки та інформація"],absence:["Пояснення відсутності","Робота / установа"],rentTermination:["Розірвання договору оренди","Житло"],rentIssue:["Проблема з житлом","Vermieter / Hausverwaltung"],carRegistration:["Zulassungsstelle","Реєстрація автомобіля"],license:["Führerscheinstelle","Водійське посвідчення"],pension:["Deutsche Rentenversicherung","Пенсія та документи"],contribution:["Beitragsservice","Rundfunkbeitrag"],other:["Інші шаблони","Опишіть власну справу"]
  }
};

const translationForKey={
  pl:{address:"Informuję o zmianie adresu i proszę o aktualizację danych.",newJob:"Informuję, że od wskazanej daty rozpoczynam nową pracę i proszę o uwzględnienie tej zmiany.",kindergeld:"Chcę złożyć wniosek o Kindergeld. Dokumenty zostały dołączone, a w razie braków proszę o informację.",appeal:"Składam odwołanie od wskazanej decyzji i proszę o ponowne sprawdzenie sprawy.",appointment:"Proszę o wyznaczenie terminu spotkania w podanym terminie lub w możliwie najbliższym czasie.",documents:"Dosyłam brakujące dokumenty i proszę o potwierdzenie ich otrzymania.",rentTermination:"Wypowiadam umowę najmu i proszę o potwierdzenie terminu zakończenia umowy.",sick:"Informuję o chorobie i niezdolności do pracy od wskazanej daty.",absence:"Wyjaśniam swoją nieobecność i proszę o jej uwzględnienie.",other:"Przedstawiam swoją sprawę i proszę o informację, jakie są kolejne kroki.",registration:"Chcę zameldować się pod nowym adresem i proszę o informację dotyczącą wymaganych dokumentów.",deregistration:"Chcę się wymeldować i proszę o pisemne potwierdzenie.",auslander:"Proszę Ausländerbehörde o informacje dotyczące mojego pobytu, terminu lub dokumentów.",requestDecision:"Proszę o ponowne sprawdzenie mojego postępowania lub decyzji.",jobcenter:"Informuję Jobcenter o zmianie mojej sytuacji i proszę o informację, czy potrzebne są dodatkowe dokumenty.",incomeChange:"Informuję o zmianie dochodu i przekazuję potrzebne informacje lub dokumenty.",familykasse:"Proszę Familienkasse o informację dotyczącą Kindergeld i brakujących dokumentów.",finanzamt:"Przedstawiam sprawę podatkową i proszę Finanzamt o informację lub odpowiedź.",taxDocuments:"Dosyłam brakujące dokumenty do Finanzamt i proszę o potwierdzenie odbioru.",healthInsurance:"Przedstawiam sprawę dotyczącą ubezpieczenia zdrowotnego i proszę Krankenkasse o odpowiedź.",employer:"Proszę pracodawcę o informację, dokument lub zaświadczenie związane z pracą.",rentIssue:"Zgłaszam problem dotyczący mieszkania i proszę wynajmującego o rozwiązanie sprawy.",carRegistration:"Proszę Zulassungsstelle o informacje dotyczące rejestracji samochodu.",license:"Proszę Führerscheinstelle o informacje dotyczące prawa jazdy.",pension:"Proszę Deutsche Rentenversicherung o informacje dotyczące mojego ubezpieczenia lub stażu.",contribution:"Przedstawiam sprawę dotyczącą Rundfunkbeitrag i proszę o jej sprawdzenie."},
  uk:{address:"Повідомляю про зміну адреси та прошу оновити мої дані.",newJob:"Повідомляю, що з вказаної дати починаю нову роботу та прошу врахувати цю зміну.",kindergeld:"Хочу подати заяву на Kindergeld. Документи додаю, а в разі відсутності якихось документів прошу повідомити мене.",appeal:"Оскаржую зазначене рішення та прошу повторно перевірити мою справу.",appointment:"Прошу призначити термін зустрічі у вказаний час або найближчим можливим часом.",documents:"Надсилаю відсутні документи та прошу підтвердити їх отримання.",rentTermination:"Розриваю договір оренди та прошу письмово підтвердити дату його завершення.",sick:"Повідомляю про хворобу та непрацездатність із зазначеної дати.",absence:"Пояснюю свою відсутність та прошу врахувати це пояснення.",other:"Описую свою справу та прошу повідомити, які подальші кроки потрібні.",registration:"Хочу зареєструватися за новою адресою та прошу повідомити, які документи потрібні.",deregistration:"Хочу знятися з реєстрації та прошу надати письмове підтвердження.",auslander:"Прошу Ausländerbehörde надати інформацію щодо мого перебування, терміну або документів.",requestDecision:"Прошу повторно перевірити мою справу або прийняте рішення.",jobcenter:"Повідомляю Jobcenter про зміну моєї ситуації та прошу повідомити, чи потрібні додаткові документи.",incomeChange:"Повідомляю про зміну доходу та надаю необхідну інформацію або документи.",familykasse:"Прошу Familienkasse надати інформацію щодо Kindergeld та відсутніх документів.",finanzamt:"Описую податкову справу та прошу Finanzamt надати інформацію або відповідь.",taxDocuments:"Надсилаю відсутні документи до Finanzamt та прошу підтвердити їх отримання.",healthInsurance:"Описую питання щодо медичного страхування та прошу Krankenkasse надати відповідь.",employer:"Прошу роботодавця надати інформацію, документ або довідку, пов’язану з роботою.",rentIssue:"Повідомляю про проблему з житлом та прошу орендодавця вирішити питання.",carRegistration:"Прошу Zulassungsstelle надати інформацію щодо реєстрації автомобіля.",license:"Прошу Führerscheinstelle надати інформацію щодо водійського посвідчення.",pension:"Прошу Deutsche Rentenversicherung надати інформацію щодо страхування або страхового стажу.",contribution:"Описую питання щодо Rundfunkbeitrag та прошу перевірити мою справу."}
};

function setSavedLanguage(){
  try{const saved=localStorage.getItem(LANG_KEY); if(saved==="uk"||saved==="pl") language=saved;}catch(e){}
}
function applyLanguage(){
  const t=uiText[language];
  document.documentElement.lang=language==="uk"?"uk":"pl";
  document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(t[key]!=null) el.innerHTML=t[key];});
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const key=el.dataset.i18nPlaceholder;if(t[key]!=null) el.placeholder=t[key];});
  document.querySelectorAll("[data-template]").forEach(btn=>{const key=btn.dataset.template, pair=templateUi[language][key];if(pair){const b=btn.querySelector("b"),small=btn.querySelector("small");if(b)b.textContent=pair[0];if(small)small.textContent=pair[1];}});
  if($("translationSummary")) $("translationSummary").innerHTML=t.translationSummary;
  const toggle=$("languageToggle"); if(toggle) toggle.innerHTML=language==="uk"?"🇺🇦 &nbsp; UA &nbsp;⌄":"🇵🇱 &nbsp; PL &nbsp;⌄";
  if($("templateSearch")) $("templateSearch").setAttribute("aria-label",t.searchTemplate.replace("⌕  ",""));
  renderSavedLetters();
  document.title=language==="uk"?"BRIEFLA — Ваші справи в Німеччині. Простіше.":"BRIEFLA — Twoje sprawy w Niemczech. Prościej.";
}
function setLanguage(next){
  if(next!=="pl"&&next!=="uk")return;
  language=next;
  try{localStorage.setItem(LANG_KEY,language)}catch(e){}
  applyLanguage();
  const menu=$("languageMenu"),toggle=$("languageToggle");
  if(menu)menu.hidden=true;if(toggle)toggle.setAttribute("aria-expanded","false");
}

$("languageToggle")?.addEventListener("click",e=>{e.stopPropagation();const menu=$("languageMenu");if(!menu)return;menu.hidden=!menu.hidden;$("languageToggle").setAttribute("aria-expanded",String(!menu.hidden));});
document.querySelectorAll("[data-lang]").forEach(btn=>btn.addEventListener("click",()=>setLanguage(btn.dataset.lang)));
document.addEventListener("click",e=>{if(!e.target.closest(".top-controls")){const menu=$("languageMenu");if(menu)menu.hidden=true;const toggle=$("languageToggle");if(toggle)toggle.setAttribute("aria-expanded","false");}});

/* Replace the saved-letter renderer so its UI follows the selected language. */
renderSavedLetters=function(){
  const box=$("savedLetters"); if(!box)return;
  const items=getSavedLetters(), t=uiText[language];
  if(!items.length){box.innerHTML=`<div class="saved-empty">${t.savedEmpty}</div>`;return;}
  box.innerHTML=items.map(item=>{
    const date=item.updatedAt?new Intl.DateTimeFormat(language==="uk"?"uk-UA":"pl-PL",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(item.updatedAt)):"";
    return `<div class="saved-letter"><div class="saved-letter-main" data-open-letter="${item.id}"><b>${escapeHtml(item.title|| (language==="uk"?"Мій лист":"Moje pismo"))}</b><small>${escapeHtml(item.recipient||(language==="uk"?"Без одержувача":"Bez odbiorcy"))} · ${date}</small></div><div class="saved-letter-actions"><button data-open-letter="${item.id}">${t.open}</button><button class="delete-letter" data-delete-letter="${item.id}">${t.remove}</button></div></div>`;
  }).join("");
  box.querySelectorAll("[data-open-letter]").forEach(el=>el.addEventListener("click",()=>openSavedLetter(el.dataset.openLetter)));
  box.querySelectorAll("[data-delete-letter]").forEach(el=>el.addEventListener("click",()=>deleteSavedLetter(el.dataset.deleteLetter)));
};

/* Make template translations follow the current UI language. */
const originalFillResult=fillResult;
fillResult=function(subject,body,translation,recipient=""){
  originalFillResult(subject,body,translation,recipient);
  if(language==="uk" && translation && translationForKey.uk){
    const match=Object.keys(templates).find(k=>templates[k].title===subject);
    if(match && $("translation")) $("translation").textContent=translationForKey.uk[match]||uiText.uk.genericTranslation;
  }
};

/* The original generate handler calls fillResult by name, so this wrapper updates its explanatory text in UA. */
const originalGenerate=generate;
generate=function(){
  originalGenerate();
  if(language==="uk" && $("translation")) $("translation").textContent=uiText.uk.genericTranslation;
};
if($("generate")){const oldGenerateHandler=undefined;}

setSavedLanguage();
applyLanguage();

function updateCurrentTranslationLanguage(){
  const box=$("translation"); if(!box)return;
  const subject=$("editSubject")?.value.trim()||"";
  const key=Object.keys(templates).find(k=>templates[k].title===subject);
  if(language==="uk") box.textContent=(key&&translationForKey.uk[key])||uiText.uk.genericTranslation;
  else box.textContent=(key&&translationForKey.pl[key])||uiText.pl.genericTranslation;
}
const previousApplyLanguage=applyLanguage;
applyLanguage=function(){previousApplyLanguage();updateCurrentTranslationLanguage();};

/* Re-apply the language after opening a saved letter. */
const previousOpenSavedLetter=openSavedLetter;
openSavedLetter=function(id){previousOpenSavedLetter(id);updateCurrentTranslationLanguage();};
