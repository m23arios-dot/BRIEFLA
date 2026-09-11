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
  if(dateText){
    const d=new Date(dateText+(/^\d{4}-\d{2}-\d{2}$/.test(dateText)?"T00:00:00":""));
    if(!Number.isNaN(d.getTime())) return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }
  const d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
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

const BRIEFLA_AI_ENDPOINT = ""; // W przyszłości: bezpieczny backend BRIEFLA, nigdy klucz API w przeglądarce.
let pendingAnalysis=null;

function normalizeCaseText(text){
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function detectDate(text){
  const m=text.match(/(?:od|seit|ab)\s+(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}|\d{1,2}\s+(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|wrzesnia|pazdziernika|listopada|grudnia))/i);
  return m?m[1]:"";
}

function analyzeCase(raw){
  const l=normalizeCaseText(raw);
  let intent="other", recipient="", subject="", questions=[];
  if((l.includes("finanzamt")||l.includes("finans")||l.includes("podatk")) && (l.includes("konto")||l.includes("iban")||l.includes("bank"))){
    intent="bankChange"; recipient="Finanzamt"; subject="Mitteilung über die Änderung meiner Bankverbindung";
    questions=[
      {id:"newIban",label:{pl:"Nowy IBAN",uk:"Новий IBAN"},placeholder:{pl:"DE…",uk:"DE…"},required:true,type:"text"},
      {id:"effectiveDate",label:{pl:"Od kiedy obowiązuje zmiana?",uk:"З якої дати діє зміна?"},placeholder:{pl:"np. 01.10.2026",uk:"напр. 01.10.2026"},required:false,type:"text",prefill:detectDate(raw)},
      {id:"taxId",label:{pl:"Steuer-ID (opcjonalnie)",uk:"Steuer-ID (необов’язково)"},placeholder:{pl:"Numer Steuer-ID",uk:"Номер Steuer-ID"},required:false,type:"text"}
    ];
  } else if(l.includes("jobcenter") || l.includes("burgergeld")){
    recipient="Jobcenter";
    if(l.includes("nowa praca")||l.includes("nowa prace")||l.includes("zaczynam prace")||l.includes("rozpoczynam prace")||l.includes("neue arbeit")||l.includes("neue beschaftigung")){
      intent="newJobJobcenter"; subject="Mitteilung über die Aufnahme einer Beschäftigung";
      questions=[
        {id:"startDate",label:{pl:"Od kiedy zaczynasz pracę?",uk:"З якої дати ви починаєте працювати?"},placeholder:{pl:"np. 01.10.2026",uk:"напр. 01.10.2026"},required:true,type:"text",prefill:detectDate(raw)},
        {id:"employer",label:{pl:"Nazwa pracodawcy (opcjonalnie)",uk:"Назва роботодавця (необов’язково)"},placeholder:{pl:"Nazwa firmy",uk:"Назва компанії"},required:false,type:"text"},
        {id:"salary",label:{pl:"Wynagrodzenie brutto (opcjonalnie)",uk:"Зарплата брутто (необов’язково)"},placeholder:{pl:"np. 2.500 €",uk:"напр. 2 500 €"},required:false,type:"text"}
      ];
    } else if(l.includes("dochod")||l.includes("zarob")||l.includes("wynagrod")||l.includes("einkommen")){
      intent="incomeChange"; subject="Mitteilung über eine Einkommensänderung";
      questions=[
        {id:"changeDate",label:{pl:"Od kiedy zmienił się dochód?",uk:"З якої дати змінився дохід?"},placeholder:{pl:"np. 01.10.2026",uk:"напр. 01.10.2026"},required:true,type:"text",prefill:detectDate(raw)},
        {id:"newIncome",label:{pl:"Nowy dochód brutto (opcjonalnie)",uk:"Новий дохід брутто (необов’язково)"},placeholder:{pl:"Kwota",uk:"Сума"},required:false,type:"text"}
      ];
    } else {
      intent="jobcenterGeneral"; subject="Mitteilung an das Jobcenter";
      questions=[{id:"purpose",label:{pl:"Czego dotyczy sprawa?",uk:"Чого стосується справа?"},required:true,type:"select",options:[{value:"address",pl:"Zmiana adresu",uk:"Зміна адреси"},{value:"income",pl:"Zmiana dochodu",uk:"Зміна доходу"},{value:"work",pl:"Nowa praca / zmiana pracy",uk:"Нова робота / зміна роботи"},{value:"documents",pl:"Dosłanie dokumentów",uk:"Надсилання документів"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]}];
    }
  } else if(l.includes("adres")||l.includes("anschrift")){
    intent="addressChange"; recipient="Bürgeramt"; subject="Mitteilung über meine neue Anschrift";
    questions=[{id:"newAddress",label:{pl:"Nowy adres",uk:"Нова адреса"},placeholder:{pl:"Ulica, numer, PLZ, miejscowość",uk:"Вулиця, номер, індекс, місто"},required:true,type:"text"}];
  } else if(l.includes("termin")||l.includes("spotkan")||l.includes("umowic")||l.includes("umówić")){
    intent="appointment"; recipient="Zuständige Stelle"; subject="Bitte um einen Termin";
    questions=[{id:"preferredDate",label:{pl:"Preferowany termin (opcjonalnie)",uk:"Бажана дата/час (необов’язково)"},placeholder:{pl:"np. 15.10.2026 po 14:00",uk:"напр. 15.10.2026 після 14:00"},required:false,type:"text"}];
  } else if(l.includes("brakuj")||l.includes("doslac")||l.includes("dosłać")||l.includes("unterlagen")||l.includes("dokument")){
    intent="documents"; recipient="Zuständige Stelle"; subject="Nachreichung von Unterlagen";
    questions=[{id:"documents",label:{pl:"Jakie dokumenty dosyłasz?",uk:"Які документи ви надсилаєте?"},required:true,type:"select",options:[{value:"income",pl:"Dochód / wynagrodzenie",uk:"Дохід / заробітна плата"},{value:"identity",pl:"Dokument tożsamości",uk:"Документ, що посвідчує особу"},{value:"residence",pl:"Pobyt / dokument pobytowy",uk:"Проживання / документ на проживання"},{value:"tax",pl:"Podatki",uk:"Податки"},{value:"other",pl:"Inne dokumenty",uk:"Інші документи"}]}];
  } else if(l.includes("wypowied") && (l.includes("mieszkan")||l.includes("umow")||l.includes("najem")||l.includes("miet"))){
    intent="rentTermination"; recipient="Vermieter / Hausverwaltung"; subject="Kündigung des Mietvertrags";
    questions=[{id:"address",label:{pl:"Adres mieszkania",uk:"Адреса житла"},placeholder:{pl:"Ulica, numer, PLZ, miejscowość",uk:"Вулиця, номер, індекс, місто"},required:true,type:"text"},{id:"terminationDate",label:{pl:"Data zakończenia umowy (jeśli znasz)",uk:"Дата завершення договору (якщо відома)"},placeholder:{pl:"np. 31.12.2026",uk:"напр. 31.12.2026"},required:false,type:"text"}];
  } else if(l.includes("chor")||l.includes("krank")||l.includes("krankmeldung")){
    intent="sick"; recipient="Arbeitgeber"; subject="Krankmeldung";
    questions=[{id:"sickFrom",label:{pl:"Od kiedy jesteś niezdolny do pracy?",uk:"З якої дати ви непрацездатні?"},placeholder:{pl:"np. 11.09.2026",uk:"напр. 11.09.2026"},required:true,type:"text",prefill:detectDate(raw)}];
  } else if(l.includes("auslanderbehorde")||l.includes("pobyt")||l.includes("aufenthalt")){
    intent="residence"; recipient="Ausländerbehörde"; subject="Anfrage zu meinem Aufenthaltsstatus";
    questions=[{id:"purpose",label:{pl:"Czego dotyczy sprawa?",uk:"Чого стосується справа?"},required:true,type:"select",options:[{value:"appointment",pl:"Termin",uk:"Термін"},{value:"extension",pl:"Przedłużenie dokumentu pobytowego",uk:"Продовження документа на проживання"},{value:"documents",pl:"Wymagane dokumenty",uk:"Необхідні документи"},{value:"status",pl:"Informacja o statusie pobytu",uk:"Інформація про статус перебування"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]}];
  }
  if(intent==="other"){
    recipient=""; subject="Anfrage";
    questions=[
      {id:"recipient",label:{pl:"Do jakiego urzędu / osoby kierujesz pismo?",uk:"До якої установи / особи ви звертаєтесь?"},placeholder:{pl:"np. Finanzamt Goslar",uk:"напр. Finanzamt Goslar"},required:true,type:"text"},
      {id:"purpose",label:{pl:"Jaki jest główny cel pisma?",uk:"Яка головна мета листа?"},placeholder:{pl:"np. chcę poinformować o zmianie danych",uk:"напр. хочу повідомити про зміну даних"},required:true,type:"text"},
      {id:"action",label:{pl:"Czego oczekujesz od odbiorcy?",uk:"Чого ви очікуєте від одержувача?"},placeholder:{pl:"np. proszę o aktualizację danych i potwierdzenie",uk:"напр. прошу оновити дані та підтвердити"},required:true,type:"text"}
    ];
  }
  return {intent,recipient,subject,questions,raw};
}

function renderSmartQuestions(analysis){
  pendingAnalysis=analysis;
  const list=$("smartQuestionList"); if(!list)return;
  const lang=language||"pl";
  list.innerHTML=analysis.questions.map(q=>{
    const label=`<span>${q.label[lang]}${q.required?' *':''}</span>`;
    if(q.type==="select"){
      const options=(q.options||[]).map(o=>`<option value="${escapeHtml(o.value)}">${escapeHtml(o[lang])}</option>`).join("");
      return `<label class="smart-question">${label}<select id="smart_${q.id}" ${q.required?'required':''}><option value="">${lang==="uk"?"Оберіть варіант…":"Wybierz opcję…"}</option>${options}</select></label>`;
    }
    return `<label class="smart-question">${label}<input id="smart_${q.id}" type="${q.type||'text'}" placeholder="${escapeHtml(q.placeholder?.[lang]||'')}" value="${escapeHtml(q.prefill||'')}" ${q.required?'required':''}></label>`;
  }).join("");
  show("smartQuestions");
}

function collectSmartAnswers(){
  const answers={};
  for(const q of (pendingAnalysis?.questions||[])){
    const el=$("smart_"+q.id); answers[q.id]=(el?.value||"").trim();
    if(q.required && !answers[q.id]){
      el?.focus();
      return null;
    }
  }
  return answers;
}

function buildSmartDraft(analysis, answers){
  const a=answers, intent=analysis.intent;
  let body="", translation="";
  if(intent==="bankChange"){
    body=`hiermit möchte ich Sie darüber informieren, dass sich meine Bankverbindung geändert hat.\n\nMeine neue IBAN lautet: ${a.newIban}.${a.effectiveDate?`\nDie Änderung gilt ab dem ${a.effectiveDate}.`:''}${a.taxId?`\nMeine Steuer-ID lautet: ${a.taxId}.`:''}\n\nIch bitte Sie, meine neue Bankverbindung für zukünftige Zahlungen bzw. Steuererstattungen zu berücksichtigen. Bitte bestätigen Sie mir kurz die Änderung.\n\nVielen Dank für Ihre Rückmeldung.`;
    translation=`Informuję Finanzamt o zmianie rachunku bankowego. Nowy IBAN: ${a.newIban}.${a.effectiveDate?` Zmiana obowiązuje od ${a.effectiveDate}.`:''}${a.taxId?` Steuer-ID: ${a.taxId}.`:''} Proszę o uwzględnienie nowego rachunku przy przyszłych płatnościach lub zwrotach podatku oraz o krótkie potwierdzenie.`;
  } else if(intent==="newJobJobcenter"){
    body=`hiermit informiere ich Sie darüber, dass ich ab dem ${a.startDate} eine neue Beschäftigung aufnehme.${a.employer?`\n\nArbeitgeber: ${a.employer}.`:''}${a.salary?`\nDas voraussichtliche Bruttoeinkommen beträgt ${a.salary}.`:''}\n\nIch bitte Sie, diese Änderung bei der Berechnung meiner Leistungen zu berücksichtigen. Falls Sie weitere Unterlagen oder Nachweise benötigen, teilen Sie mir bitte mit, welche Dokumente ich einreichen soll.\n\nVielen Dank für Ihre Rückmeldung.`;
    translation=`Informuję Jobcenter, że od ${a.startDate} rozpoczynam nową pracę.${a.employer?` Pracodawca: ${a.employer}.`:''}${a.salary?` Przewidywane wynagrodzenie brutto: ${a.salary}.`:''} Proszę uwzględnić tę zmianę przy ustalaniu świadczeń i poinformować mnie, jeśli potrzebne są dodatkowe dokumenty.`;
  } else if(intent==="incomeChange"){
    body=`hiermit informiere ich Sie darüber, dass sich mein Einkommen ab dem ${a.changeDate} geändert hat.${a.newIncome?`\n\nMein neues Bruttoeinkommen beträgt ${a.newIncome}.`:''}\n\nBitte berücksichtigen Sie diese Änderung bei meinem Vorgang und teilen Sie mir mit, welche Nachweise Sie noch benötigen.\n\nVielen Dank für Ihre Rückmeldung.`;
    translation=`Informuję Jobcenter o zmianie dochodu od ${a.changeDate}.${a.newIncome?` Nowy dochód brutto wynosi ${a.newIncome}.`:''} Proszę uwzględnić zmianę w mojej sprawie i poinformować mnie, jakie dokumenty są jeszcze potrzebne.`;
  } else if(intent==="addressChange"){
    body=`hiermit möchte ich Sie über meine neue Anschrift informieren.\n\nMeine neue Adresse lautet:\n${a.newAddress}\n\nIch bitte Sie, meine Daten entsprechend zu aktualisieren und mir die Änderung kurz zu bestätigen.\n\nVielen Dank für Ihre Rückmeldung.`;
    translation=`Informuję o zmianie adresu. Mój nowy adres to: ${a.newAddress}. Proszę o aktualizację danych i krótkie potwierdzenie zmiany.`;
  } else if(intent==="appointment"){
    body=`ich möchte gerne einen Termin bei Ihnen vereinbaren.${a.preferredDate?`\n\nMein bevorzugter Termin bzw. Zeitraum ist: ${a.preferredDate}.`:''}\n\nBitte teilen Sie mir mit, wann ein Termin möglich ist.\n\nVielen Dank für Ihre Rückmeldung.`;
    translation=`Proszę o umówienie terminu.${a.preferredDate?` Preferowany termin lub przedział czasu: ${a.preferredDate}.`:''} Proszę o informację, kiedy spotkanie będzie możliwe.`;
  } else if(intent==="documents"){
    body=`hiermit reiche ich folgende noch fehlende Unterlagen nach:\n${a.documents}\n\nBitte bestätigen Sie mir kurz den Eingang der Unterlagen. Falls noch weitere Dokumente benötigt werden, teilen Sie mir dies bitte mit.\n\nVielen Dank.`;
    translation=`Dosyłam następujące brakujące dokumenty: ${a.documents}. Proszę o krótkie potwierdzenie ich otrzymania oraz informację, jeśli potrzebne są jeszcze inne dokumenty.`;
  } else if(intent==="rentTermination"){
    body=`hiermit kündige ich den Mietvertrag für die Wohnung ${a.address} fristgerecht zum nächstmöglichen Zeitpunkt.${a.terminationDate?`\n\nAls gewünschtes Beendigungsdatum nenne ich den ${a.terminationDate}.`:''}\n\nBitte bestätigen Sie mir den Eingang dieser Kündigung sowie den Beendigungstermin schriftlich.\n\nVielen Dank.`;
    translation=`Wypowiadam umowę najmu mieszkania przy adresie ${a.address}.${a.terminationDate?` Jako datę zakończenia wskazuję ${a.terminationDate}.`:''} Proszę o pisemne potwierdzenie otrzymania wypowiedzenia i daty zakończenia umowy.`;
  } else if(intent==="sick"){
    body=`hiermit möchte ich Sie darüber informieren, dass ich seit dem ${a.sickFrom} krankheitsbedingt arbeitsunfähig bin.\n\nEine Arbeitsunfähigkeitsbescheinigung liegt vor bzw. wird entsprechend übermittelt.\n\nVielen Dank für Ihr Verständnis.`;
    translation=`Informuję o niezdolności do pracy z powodu choroby od ${a.sickFrom}. Zaświadczenie o niezdolności do pracy jest dostępne lub zostanie przekazane zgodnie z wymaganiami.`;
  } else if(intent==="residence"){
    body=`ich wende mich an Sie bezüglich meines Aufenthaltsstatus.\n\nMein Anliegen: ${a.purpose}\n\nBitte teilen Sie mir mit, welche Unterlagen erforderlich sind und wie ich weiter vorgehen soll.\n\nVielen Dank für Ihre Rückmeldung.`;
    translation=`Zwracam się do Ausländerbehörde w sprawie mojego pobytu. Potrzebuję: ${a.purpose}. Proszę o informację, jakie dokumenty są wymagane i co powinienem zrobić dalej.`;
  } else if(intent==="jobcenterGeneral"){
    body=`hiermit möchte ich Sie über folgende Angelegenheit informieren.\n\nIch bitte Sie um eine Prüfung meines Anliegens und um Mitteilung, welche weiteren Angaben oder Unterlagen Sie von mir benötigen.\n\nVielen Dank für Ihre Rückmeldung.`;
    translation=`Informuję Jobcenter o mojej sprawie. Proszę o jej sprawdzenie i informację, jakie dodatkowe dane lub dokumenty są potrzebne.`;
  } else if(intent==="other"){
    body=`hiermit wende ich mich mit einem Anliegen an Sie.\n\nIch bitte Sie, mein Anliegen zu prüfen und die erforderlichen Schritte zu veranlassen.\n\nFalls Sie weitere Informationen oder Unterlagen benötigen, teilen Sie mir bitte mit, welche Angaben ich nachreichen soll.\n\nVielen Dank für Ihre Rückmeldung.`;
    translation=`Zwracam się do Państwa w konkretnej sprawie. Proszę o jej rozpatrzenie i podjęcie niezbędnych działań. Jeśli potrzebne są dodatkowe informacje lub dokumenty, proszę o wskazanie, jakie dane mam dostarczyć.`;
  } else {
    return null;
  }
  return {subject:analysis.subject,body,translation,recipient:a.recipient||analysis.recipient};
}

function generate(){
  const raw=(area?.value||"").trim();
  if(!raw){
    area?.focus();
    return;
  }
  const analysis=analyzeCase(raw);
  if(analysis.questions.length){ renderSmartQuestions(analysis); return; }
  const draft=buildSmartDraft(analysis,{});
  if(draft) fillResult(draft.subject,draft.body,draft.translation,draft.recipient);
}


/* BRIEFLA TEMPLATE FORMS 2.0 — every template asks for real data before drafting. */
const templateFlows={
  address:{recipient:"Bürgeramt",subject:"Mitteilung über meine neue Anschrift",questions:[
    {id:"newAddress",label:{pl:"Nowy adres",uk:"Нова адреса"},placeholder:{pl:"Ulica, numer, PLZ, miejscowość",uk:"Вулиця, номер, індекс, місто"},required:true,type:"text"},
    {id:"effectiveDate",label:{pl:"Od kiedy mieszkasz pod nowym adresem?",uk:"З якої дати ви проживаєте за новою адресою?"},placeholder:{pl:"np. 01.10.2026",uk:"напр. 01.10.2026"},required:true,type:"date"}],
    build:a=>({subject:"Mitteilung über meine neue Anschrift",recipient:"Bürgeramt",body:`hiermit möchte ich Sie darüber informieren, dass sich meine Anschrift geändert hat.\n\nMeine neue Adresse lautet:\n${a.newAddress}\n\nIch wohne dort seit dem ${formatDateForLetter(a.effectiveDate)}.\n\nIch bitte Sie, meine Daten entsprechend zu aktualisieren und mir die Änderung kurz zu bestätigen.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Informuję o zmianie adresu. Mój nowy adres to: ${a.newAddress}. Pod tym adresem mieszkam od ${formatDateForLetter(a.effectiveDate)}. Proszę o aktualizację moich danych i krótkie potwierdzenie zmiany.`})},
  registration:{recipient:"Bürgeramt",subject:"Anmeldung",questions:[
    {id:"address",label:{pl:"Adres nowego miejsca zamieszkania",uk:"Адреса нового місця проживання"},placeholder:{pl:"Ulica, numer, PLZ, miejscowość",uk:"Вулиця, номер, індекс, місто"},required:true,type:"text"},
    {id:"moveDate",label:{pl:"Data wprowadzenia się",uk:"Дата переїзду"},placeholder:{pl:"",uk:""},required:true,type:"date"}],
    build:a=>({subject:"Anmeldung",recipient:"Bürgeramt",body:`hiermit möchte ich mich an meiner neuen Wohnadresse anmelden.\n\nMeine neue Anschrift lautet:\n${a.address}\n\nIch bin am ${formatDateForLetter(a.moveDate)} eingezogen.\n\nBitte teilen Sie mir mit, ob für die Anmeldung noch weitere Unterlagen oder ein Termin erforderlich sind.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Chcę zameldować się pod nowym adresem: ${a.address}. Wprowadziłem/am się ${formatDateForLetter(a.moveDate)}. Proszę o informację, czy potrzebne są dodatkowe dokumenty lub termin.`})},
  deregistration:{recipient:"Bürgeramt",subject:"Abmeldung",questions:[
    {id:"oldAddress",label:{pl:"Adres, z którego się wymeldowujesz",uk:"Адреса, з якої ви знімаєтесь з реєстрації"},placeholder:{pl:"Ulica, numer, PLZ, miejscowość",uk:"Вулиця, номер, індекс, місто"},required:true,type:"text"},
    {id:"moveDate",label:{pl:"Data wyprowadzki",uk:"Дата виїзду"},required:true,type:"date"},
    {id:"newCountry",label:{pl:"Nowy kraj zamieszkania (opcjonalnie)",uk:"Нова країна проживання (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Abmeldung",recipient:"Bürgeramt",body:`hiermit möchte ich mich von meiner bisherigen Wohnadresse abmelden.\n\nBisherige Anschrift:\n${a.oldAddress}\n\nMein Auszugsdatum ist der ${formatDateForLetter(a.moveDate)}.${a.newCountry?`\n\nMein neuer Wohnsitz befindet sich in ${a.newCountry}.`:''}\n\nBitte bestätigen Sie mir die Abmeldung schriftlich und teilen Sie mir mit, ob weitere Unterlagen erforderlich sind.\n\nVielen Dank.`,translation:`Chcę się wymeldować z adresu ${a.oldAddress}. Data wyprowadzki: ${formatDateForLetter(a.moveDate)}.${a.newCountry?` Nowe miejsce zamieszkania: ${a.newCountry}.`:''} Proszę o pisemne potwierdzenie wymeldowania.`})},
  auslander:{recipient:"Ausländerbehörde",subject:"Anfrage zu meinem Aufenthaltsstatus",questions:[
    {id:"purpose",label:{pl:"Czego dotyczy Twoja sprawa?",uk:"Чого стосується ваша справа?"},required:true,type:"select",options:[{value:"appointment",pl:"Potrzebuję terminu",uk:"Мені потрібен термін"},{value:"extension",pl:"Przedłużenie dokumentu pobytowego",uk:"Продовження документа на проживання"},{value:"documents",pl:"Chcę wiedzieć, jakie dokumenty są potrzebne",uk:"Хочу дізнатися, які документи потрібні"},{value:"status",pl:"Pytanie o status sprawy",uk:"Питання про статус справи"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"documentExpiry",label:{pl:"Data ważności dokumentu pobytowego (opcjonalnie)",uk:"Дата закінчення дії документа на проживання (необов’язково)"},required:false,type:"date"},
    {id:"details",label:{pl:"Dodatkowe informacje (opcjonalnie)",uk:"Додаткова інформація (необов’язково)"},required:false,type:"textarea"}],
    build:a=>({subject:"Anfrage zu meinem Aufenthaltsstatus",recipient:"Ausländerbehörde",body:`ich wende mich an Sie bezüglich meines Aufenthaltsstatus.\n\nMein Anliegen betrifft: ${a.purpose}.${a.documentExpiry?`\n\nMein aktuelles Aufenthaltsdokument ist gültig bis zum ${formatDateForLetter(a.documentExpiry)}.`:''}${a.details?`\n\nWeitere Informationen:\n${a.details}`:''}\n\nBitte teilen Sie mir mit, wie ich in dieser Angelegenheit weiter vorgehen soll und welche Unterlagen gegebenenfalls erforderlich sind.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do Ausländerbehörde w sprawie pobytu. Sprawa dotyczy: ${a.purpose}.${a.documentExpiry?` Dokument pobytowy jest ważny do ${formatDateForLetter(a.documentExpiry)}.`:''}${a.details?` Dodatkowe informacje: ${a.details}`:''} Proszę o informację, jak powinienem/powinnam dalej postępować i jakie dokumenty są potrzebne.`})},
  appointment:{recipient:"Zuständige Stelle",subject:"Bitte um einen Termin",questions:[
    {id:"purpose",label:{pl:"W jakiej sprawie potrzebujesz terminu?",uk:"У якій справі вам потрібен термін?"},placeholder:{pl:"np. przedłużenie dokumentu",uk:"напр. продовження документа"},required:true,type:"text"},
    {id:"preferredDate",label:{pl:"Preferowany termin (opcjonalnie)",uk:"Бажаний термін (необов’язково)"},placeholder:{pl:"np. 15.10.2026 po 14:00",uk:"напр. 15.10.2026 після 14:00"},required:false,type:"text"},
    {id:"reference",label:{pl:"Numer sprawy (opcjonalnie)",uk:"Номер справи (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Bitte um einen Termin",recipient:"Zuständige Stelle",body:`ich möchte gerne einen Termin bei Ihnen vereinbaren.\n\nMein Anliegen betrifft: ${a.purpose}.${a.preferredDate?`\n\nWenn möglich, würde ich gerne einen Termin ${a.preferredDate} erhalten.`:''}${a.reference?`\n\nAktenzeichen / Vorgangsnummer: ${a.reference}`:''}\n\nBitte teilen Sie mir mit, wann ein Termin möglich ist.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Proszę o umówienie terminu w sprawie: ${a.purpose}.${a.preferredDate?` Jeśli to możliwe, preferuję termin ${a.preferredDate}.`:''}${a.reference?` Numer sprawy: ${a.reference}.`:''} Proszę o informację, kiedy termin będzie możliwy.`})},
  documents:{recipient:"Zuständige Stelle",subject:"Nachreichung von Unterlagen",questions:[
    {id:"documents",label:{pl:"Jakie dokumenty dosyłasz?",uk:"Які документи ви надсилаєте?"},placeholder:{pl:"np. umowa o pracę, Lohnabrechnung",uk:"напр. трудовий договір, розрахунковий лист"},required:true,type:"textarea"},
    {id:"reference",label:{pl:"Numer sprawy / Aktenzeichen (opcjonalnie)",uk:"Номер справи / Aktenzeichen (необов’язково)"},required:false,type:"text"},
    {id:"purpose",label:{pl:"Czego dotyczą dokumenty? (opcjonalnie)",uk:"Чого стосуються документи? (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Nachreichung von Unterlagen",recipient:"Zuständige Stelle",body:`hiermit reiche ich die folgenden Unterlagen zu meinem Vorgang nach:\n\n${a.documents}${a.reference?`\n\nAktenzeichen / Vorgangsnummer: ${a.reference}`:''}${a.purpose?`\n\nDie Unterlagen betreffen: ${a.purpose}.`:''}\n\nBitte bestätigen Sie mir kurz den Eingang der Unterlagen. Falls noch weitere Dokumente benötigt werden, teilen Sie mir dies bitte mit.\n\nVielen Dank.`,translation:`Dosyłam następujące dokumenty: ${a.documents}.${a.reference?` Numer sprawy: ${a.reference}.`:''}${a.purpose?` Dokumenty dotyczą: ${a.purpose}.`:''} Proszę o potwierdzenie ich otrzymania i informację, jeśli potrzebne są kolejne dokumenty.`})},
  appeal:{recipient:"Zuständige Stelle",subject:"Widerspruch gegen einen Bescheid",questions:[
    {id:"decisionDate",label:{pl:"Data decyzji / Bescheid",uk:"Дата рішення / Bescheid"},required:true,type:"date"},
    {id:"reference",label:{pl:"Numer decyzji / Aktenzeichen (opcjonalnie)",uk:"Номер рішення / Aktenzeichen (необов’язково)"},required:false,type:"text"},
    {id:"reason",label:{pl:"Dlaczego się odwołujesz? (opcjonalnie)",uk:"Чому ви подаєте заперечення? (необов’язково)"},required:false,type:"textarea"}],
    build:a=>({subject:"Widerspruch gegen einen Bescheid",recipient:"Zuständige Stelle",body:`hiermit lege ich gegen den Bescheid vom ${formatDateForLetter(a.decisionDate)} Widerspruch ein.${a.reference?`\n\nAktenzeichen: ${a.reference}`:''}${a.reason?`\n\nMeine Begründung:\n${a.reason}`:''}\n\nIch bitte Sie, den Bescheid erneut zu prüfen und meinen Widerspruch zu berücksichtigen. Bitte bestätigen Sie mir den Eingang meines Widerspruchs schriftlich.\n\nVielen Dank.`,translation:`Składam sprzeciw od decyzji z dnia ${formatDateForLetter(a.decisionDate)}.${a.reference?` Numer sprawy: ${a.reference}.`:''}${a.reason?` Uzasadnienie: ${a.reason}`:''} Proszę o ponowne rozpatrzenie decyzji i pisemne potwierdzenie otrzymania sprzeciwu.`})},
  requestDecision:{recipient:"Zuständige Stelle",subject:"Bitte um erneute Prüfung",questions:[
    {id:"matter",label:{pl:"Czego dotyczy sprawa lub decyzja?",uk:"Чого стосується справа або рішення?"},required:true,type:"textarea"},
    {id:"decisionDate",label:{pl:"Data decyzji (opcjonalnie)",uk:"Дата рішення (необов’язково)"},required:false,type:"date"},
    {id:"reason",label:{pl:"Dlaczego prosisz o ponowne rozpatrzenie?",uk:"Чому ви просите повторно розглянути справу?"},required:true,type:"textarea"}],
    build:a=>({subject:"Bitte um erneute Prüfung",recipient:"Zuständige Stelle",body:`ich bitte Sie, meinen Vorgang bzw. die getroffene Entscheidung erneut zu prüfen.\n\nSachverhalt:\n${a.matter}${a.decisionDate?`\n\nDatum der Entscheidung: ${formatDateForLetter(a.decisionDate)}`:''}\n\nGrund für meine Bitte um erneute Prüfung:\n${a.reason}\n\nBitte teilen Sie mir das Ergebnis der Prüfung schriftlich mit.\n\nVielen Dank.`,translation:`Proszę o ponowne rozpatrzenie mojej sprawy/decyzji. Sprawa dotyczy: ${a.matter}.${a.decisionDate?` Data decyzji: ${formatDateForLetter(a.decisionDate)}.`:''} Powód prośby: ${a.reason}. Proszę o pisemną informację o wyniku.`})},
  jobcenter:{recipient:"Jobcenter",subject:"Mitteilung an das Jobcenter",questions:[
    {id:"matter",label:{pl:"Co chcesz zgłosić Jobcenter?",uk:"Що ви хочете повідомити Jobcenter?"},required:true,type:"select",options:[{value:"work",pl:"Nowa praca / zmiana pracy",uk:"Нова робота / зміна роботи"},{value:"income",pl:"Zmiana dochodu",uk:"Зміна доходу"},{value:"address",pl:"Zmiana adresu",uk:"Зміна адреси"},{value:"documents",pl:"Dosłanie dokumentów",uk:"Надсилання документів"},{value:"other",pl:"Inna zmiana",uk:"Інша зміна"}]},
    {id:"effectiveDate",label:{pl:"Od kiedy obowiązuje zmiana? (opcjonalnie)",uk:"З якої дати діє зміна? (необов’язково)"},required:false,type:"date"},
    {id:"details",label:{pl:"Opisz zmianę",uk:"Опишіть зміну"},required:true,type:"textarea"}],
    build:a=>({subject:"Mitteilung an das Jobcenter",recipient:"Jobcenter",body:`hiermit möchte ich Sie über eine Änderung meiner persönlichen bzw. beruflichen Situation informieren.\n\nDie Änderung betrifft: ${a.matter}.${a.effectiveDate?`\nSie gilt ab dem ${formatDateForLetter(a.effectiveDate)}.`:''}\n\nDetails:\n${a.details}\n\nBitte berücksichtigen Sie diese Information in meinem Vorgang und teilen Sie mir mit, ob weitere Unterlagen benötigt werden.\n\nVielen Dank.`,translation:`Informuję Jobcenter o zmianie mojej sytuacji. Zmiana dotyczy: ${a.matter}.${a.effectiveDate?` Obowiązuje od ${formatDateForLetter(a.effectiveDate)}.`:''} Szczegóły: ${a.details}. Proszę uwzględnić tę informację w mojej sprawie i poinformować mnie, czy potrzebne są dodatkowe dokumenty.`})},
  newJob:{recipient:"Jobcenter",subject:"Mitteilung über die Aufnahme einer Beschäftigung",questions:[
    {id:"startDate",label:{pl:"Od kiedy zaczynasz pracę?",uk:"З якої дати ви починаєте працювати?"},required:true,type:"date"},
    {id:"employer",label:{pl:"Nazwa pracodawcy",uk:"Назва роботодавця"},required:true,type:"text"},
    {id:"salary",label:{pl:"Wynagrodzenie brutto (opcjonalnie)",uk:"Зарплата брутто (необов’язково)"},placeholder:{pl:"np. 2.500 €",uk:"напр. 2 500 €"},required:false,type:"text"}],
    build:a=>({subject:"Mitteilung über die Aufnahme einer Beschäftigung",recipient:"Jobcenter",body:`hiermit informiere ich Sie darüber, dass ich ab dem ${formatDateForLetter(a.startDate)} eine Beschäftigung bei ${a.employer} aufnehme.${a.salary?`\n\nDas voraussichtliche Bruttoeinkommen beträgt ${a.salary}.`:''}\n\nIch bitte Sie, diese Änderung bei der Berechnung meiner Leistungen zu berücksichtigen. Falls Sie weitere Unterlagen oder Nachweise benötigen, teilen Sie mir bitte mit, welche Dokumente ich einreichen soll.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Informuję Jobcenter, że od ${formatDateForLetter(a.startDate)} rozpoczynam pracę u ${a.employer}.${a.salary?` Przewidywane wynagrodzenie brutto: ${a.salary}.`:''} Proszę uwzględnić tę zmianę przy ustalaniu świadczeń i poinformować mnie, jeśli potrzebne są dodatkowe dokumenty.`})},
  incomeChange:{recipient:"Jobcenter",subject:"Mitteilung über eine Einkommensänderung",questions:[
    {id:"changeDate",label:{pl:"Od kiedy zmienił się dochód?",uk:"З якої дати змінився дохід?"},required:true,type:"date"},
    {id:"newIncome",label:{pl:"Nowy dochód brutto",uk:"Новий дохід брутто"},required:true,type:"text"},
    {id:"proof",label:{pl:"Jaki dokument potwierdza zmianę? (opcjonalnie)",uk:"Який документ підтверджує зміну? (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Mitteilung über eine Einkommensänderung",recipient:"Jobcenter",body:`hiermit informiere ich Sie darüber, dass sich mein Einkommen ab dem ${formatDateForLetter(a.changeDate)} geändert hat.\n\nMein neues Bruttoeinkommen beträgt ${a.newIncome}.${a.proof?`\n\nAls Nachweis füge ich ${a.proof} bei.`:''}\n\nBitte berücksichtigen Sie diese Änderung bei meinem Vorgang und teilen Sie mir mit, welche weiteren Nachweise Sie gegebenenfalls benötigen.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Informuję Jobcenter o zmianie dochodu od ${formatDateForLetter(a.changeDate)}. Nowy dochód brutto wynosi ${a.newIncome}.${a.proof?` Jako potwierdzenie dołączam ${a.proof}.`:''} Proszę uwzględnić zmianę w mojej sprawie i poinformować mnie, jeśli potrzebne są dodatkowe dokumenty.`})},
  familykasse:{recipient:"Familienkasse",subject:"Anfrage an die Familienkasse",questions:[
    {id:"matter",label:{pl:"Czego dotyczy sprawa?",uk:"Чого стосується справа?"},required:true,type:"select",options:[{value:"status",pl:"Pytanie o status Kindergeld",uk:"Питання про статус Kindergeld"},{value:"documents",pl:"Brakujące dokumenty",uk:"Відсутні документи"},{value:"change",pl:"Zmiana danych",uk:"Зміна даних"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"childName",label:{pl:"Imię i nazwisko dziecka (opcjonalnie)",uk:"Ім’я та прізвище дитини (необов’язково)"},required:false,type:"text"},
    {id:"reference",label:{pl:"Numer Kindergeld / Aktenzeichen (opcjonalnie)",uk:"Номер Kindergeld / Aktenzeichen (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Anfrage an die Familienkasse",recipient:"Familienkasse",body:`ich wende mich an Sie bezüglich meiner Kindergeldangelegenheit.\n\nMein Anliegen betrifft: ${a.matter}.${a.childName?`\n\nName des Kindes: ${a.childName}`:''}${a.reference?`\nAktenzeichen / Kindergeldnummer: ${a.reference}`:''}\n\nBitte informieren Sie mich über den aktuellen Stand bzw. teilen Sie mir mit, welche Unterlagen oder Angaben noch benötigt werden.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do Familienkasse w sprawie Kindergeld. Sprawa dotyczy: ${a.matter}.${a.childName?` Dziecko: ${a.childName}.`:''}${a.reference?` Numer sprawy: ${a.reference}.`:''} Proszę o informację o stanie sprawy lub o brakujących dokumentach.`})},
  kindergeld:{recipient:"Familienkasse",subject:"Antrag auf Kindergeld",questions:[
    {id:"childName",label:{pl:"Imię i nazwisko dziecka",uk:"Ім’я та прізвище дитини"},required:true,type:"text"},
    {id:"birthDate",label:{pl:"Data urodzenia dziecka",uk:"Дата народження дитини"},required:true,type:"date"},
    {id:"additional",label:{pl:"Dodatkowe informacje (opcjonalnie)",uk:"Додаткова інформація (необов’язково)"},required:false,type:"textarea"}],
    build:a=>({subject:"Antrag auf Kindergeld",recipient:"Familienkasse",body:`hiermit möchte ich Kindergeld für mein Kind beantragen.\n\nName des Kindes: ${a.childName}\nGeburtsdatum: ${formatDateForLetter(a.birthDate)}${a.additional?`\n\nWeitere Informationen:\n${a.additional}`:''}\n\nDie erforderlichen Unterlagen füge ich diesem Schreiben bei. Sollten noch Unterlagen oder Nachweise fehlen, teilen Sie mir bitte mit, welche Dokumente noch benötigt werden.\n\nVielen Dank für die Bearbeitung meines Antrags.`,translation:`Składam wniosek o Kindergeld na dziecko ${a.childName}, urodzone ${formatDateForLetter(a.birthDate)}.${a.additional?` Dodatkowe informacje: ${a.additional}`:''} Wymagane dokumenty dołączam. Proszę o informację, jeśli czegoś jeszcze brakuje.`})},
  finanzamt:{recipient:"Finanzamt",subject:"Anfrage an das Finanzamt",questions:[
    {id:"matter",label:{pl:"Czego dotyczy sprawa w Finanzamt?",uk:"Чого стосується справа у Finanzamt?"},required:true,type:"select",options:[{value:"bank",pl:"Zmiana konta bankowego",uk:"Зміна банківського рахунку"},{value:"certificate",pl:"Zaświadczenie / informacja",uk:"Довідка / інформація"},{value:"taxReturn",pl:"Deklaracja podatkowa",uk:"Податкова декларація"},{value:"payment",pl:"Płatność / zwrot podatku",uk:"Платіж / повернення податку"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"details",label:{pl:"Opisz sprawę",uk:"Опишіть справу"},required:true,type:"textarea"},
    {id:"reference",label:{pl:"Steuernummer / Aktenzeichen (opcjonalnie)",uk:"Steuernummer / Aktenzeichen (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Anfrage an das Finanzamt",recipient:"Finanzamt",body:`ich wende mich an Sie bezüglich meiner steuerlichen Angelegenheit.\n\nMein Anliegen betrifft: ${a.matter}.\n\n${a.details}${a.reference?`\n\nSteuernummer / Aktenzeichen: ${a.reference}`:''}\n\nBitte teilen Sie mir mit, wie ich in dieser Angelegenheit weiter vorgehen soll und ob Sie weitere Unterlagen oder Informationen benötigen.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do Finanzamt w sprawie: ${a.matter}. Szczegóły: ${a.details}.${a.reference?` Numer sprawy / Steuernummer: ${a.reference}.`:''} Proszę o informację, jak powinienem/powinnam dalej postępować i czy potrzebne są dodatkowe dokumenty.`})},
  taxDocuments:{recipient:"Finanzamt",subject:"Nachreichung von Unterlagen an das Finanzamt",questions:[
    {id:"documents",label:{pl:"Jakie dokumenty dosyłasz?",uk:"Які документи ви надсилаєте?"},required:true,type:"textarea"},
    {id:"reference",label:{pl:"Steuernummer / Aktenzeichen (opcjonalnie)",uk:"Steuernummer / Aktenzeichen (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Nachreichung von Unterlagen an das Finanzamt",recipient:"Finanzamt",body:`hiermit reiche ich die folgenden Unterlagen zu meinem steuerlichen Vorgang nach:\n\n${a.documents}${a.reference?`\n\nSteuernummer / Aktenzeichen: ${a.reference}`:''}\n\nBitte bestätigen Sie mir kurz den Eingang der Unterlagen. Falls noch weitere Dokumente benötigt werden, teilen Sie mir dies bitte mit.\n\nVielen Dank.`,translation:`Dosyłam do Finanzamt następujące dokumenty: ${a.documents}.${a.reference?` Steuernummer / numer sprawy: ${a.reference}.`:''} Proszę o potwierdzenie otrzymania dokumentów i informację, jeśli potrzebne są kolejne.`})},
  healthInsurance:{recipient:"Krankenkasse",subject:"Anfrage an die Krankenkasse",questions:[
    {id:"matter",label:{pl:"Czego dotyczy sprawa?",uk:"Чого стосується справа?"},required:true,type:"select",options:[{value:"insurance",pl:"Ubezpieczenie / członkostwo",uk:"Страхування / членство"},{value:"certificate",pl:"Zaświadczenie",uk:"Довідка"},{value:"family",pl:"Ubezpieczenie rodziny",uk:"Страхування сім’ї"},{value:"payment",pl:"Składki / płatność",uk:"Внески / платіж"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"details",label:{pl:"Opisz, czego potrzebujesz",uk:"Опишіть, що вам потрібно"},required:true,type:"textarea"},
    {id:"memberNumber",label:{pl:"Numer ubezpieczenia (opcjonalnie)",uk:"Номер страхування (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Anfrage an die Krankenkasse",recipient:"Krankenkasse",body:`ich wende mich an Sie bezüglich meiner Krankenversicherung.\n\nMein Anliegen betrifft: ${a.matter}.\n\n${a.details}${a.memberNumber?`\n\nVersicherungsnummer: ${a.memberNumber}`:''}\n\nBitte teilen Sie mir mit, wie ich weiter vorgehen soll und ob weitere Unterlagen benötigt werden.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do kasy chorych w sprawie: ${a.matter}. Potrzebuję: ${a.details}.${a.memberNumber?` Numer ubezpieczenia: ${a.memberNumber}.`:''} Proszę o informację, co powinienem/powinnam zrobić dalej i czy potrzebne są dodatkowe dokumenty.`})},
  sick:{recipient:"Arbeitgeber",subject:"Krankmeldung",questions:[
    {id:"sickFrom",label:{pl:"Od kiedy jesteś niezdolny/a do pracy?",uk:"З якої дати ви непрацездатні?"},required:true,type:"date"},
    {id:"expectedEnd",label:{pl:"Przewidywany koniec niezdolności (opcjonalnie)",uk:"Орієнтовна дата закінчення непрацездатності (необов’язково)"},required:false,type:"date"},
    {id:"certificate",label:{pl:"Czy zaświadczenie jest dostępne?",uk:"Чи є довідка?"},required:false,type:"select",options:[{value:"available",pl:"Tak, jest dostępne",uk:"Так, є"},{value:"sent",pl:"Zostało przekazane",uk:"Вже передана"},{value:"unknown",pl:"Nie wiem / nie dotyczy",uk:"Не знаю / не стосується"}]}],
    build:a=>({subject:"Krankmeldung",recipient:"Arbeitgeber",body:`hiermit möchte ich Sie darüber informieren, dass ich seit dem ${formatDateForLetter(a.sickFrom)} krankheitsbedingt arbeitsunfähig bin.${a.expectedEnd?`\n\nVoraussichtlich bin ich bis zum ${formatDateForLetter(a.expectedEnd)} arbeitsunfähig.`:''}${a.certificate&&a.certificate!=="unknown"?`\n\nDie Arbeitsunfähigkeitsbescheinigung ${a.certificate==="available"?"liegt vor":"wurde bereits übermittelt"}.`:''}\n\nVielen Dank für Ihr Verständnis.`,translation:`Informuję, że od ${formatDateForLetter(a.sickFrom)} jestem niezdolny/a do pracy z powodu choroby.${a.expectedEnd?` Przewidywany koniec niezdolności: ${formatDateForLetter(a.expectedEnd)}.`:''}${a.certificate&&a.certificate!=="unknown"?` Zaświadczenie ${a.certificate==="available"?"jest dostępne":"zostało już przekazane"}.`:''}`})},
  employer:{recipient:"Arbeitgeber",subject:"Anfrage an den Arbeitgeber",questions:[
    {id:"matter",label:{pl:"Czego potrzebujesz od pracodawcy?",uk:"Що вам потрібно від роботодавця?"},required:true,type:"select",options:[{value:"certificate",pl:"Zaświadczenie",uk:"Довідка"},{value:"document",pl:"Dokument / kopia",uk:"Документ / копія"},{value:"information",pl:"Informacja",uk:"Інформація"},{value:"appointment",pl:"Rozmowa / termin",uk:"Розмова / зустріч"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"details",label:{pl:"Co dokładnie ma otrzymać / zrobić pracodawca?",uk:"Що саме має надати / зробити роботодавець?"},required:true,type:"textarea"}],
    build:a=>({subject:"Anfrage an den Arbeitgeber",recipient:"Arbeitgeber",body:`ich wende mich an Sie bezüglich meines Arbeitsverhältnisses.\n\nMein Anliegen betrifft: ${a.matter}.\n\n${a.details}\n\nBitte teilen Sie mir mit, wann ich die benötigte Information bzw. Bescheinigung erhalten kann.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do pracodawcy w sprawie: ${a.matter}. Potrzebuję, aby pracodawca: ${a.details}. Proszę o informację, kiedy mogę otrzymać potrzebną informację lub zaświadczenie.`})},
  absence:{recipient:"Arbeitgeber",subject:"Erklärung meiner Abwesenheit",questions:[
    {id:"date",label:{pl:"Data nieobecności",uk:"Дата відсутності"},required:true,type:"date"},
    {id:"reason",label:{pl:"Powód nieobecności",uk:"Причина відсутності"},required:true,type:"textarea"}],
    build:a=>({subject:"Erklärung meiner Abwesenheit",recipient:"Arbeitgeber",body:`hiermit möchte ich meine Abwesenheit am ${formatDateForLetter(a.date)} kurz erklären.\n\nDer Grund für meine Abwesenheit war:\n${a.reason}\n\nIch bitte um Verständnis und entschuldige mich für die entstandenen Unannehmlichkeiten.\n\nFür Rückfragen stehe ich gerne zur Verfügung.`,translation:`Wyjaśniam moją nieobecność w dniu ${formatDateForLetter(a.date)}. Powód: ${a.reason}. Proszę o wyrozumiałość i przepraszam za powstałe niedogodności.`})},
  rentTermination:{recipient:"Vermieter / Hausverwaltung",subject:"Kündigung des Mietvertrags",questions:[
    {id:"address",label:{pl:"Adres wynajmowanego mieszkania",uk:"Адреса орендованого житла"},required:true,type:"text"},
    {id:"terminationDate",label:{pl:"Data zakończenia umowy (opcjonalnie)",uk:"Дата завершення договору (необов’язково)"},required:false,type:"date"},
    {id:"reason",label:{pl:"Powód wypowiedzenia (opcjonalnie)",uk:"Причина розірвання (необов’язково)"},required:false,type:"textarea"}],
    build:a=>({subject:"Kündigung des Mietvertrags",recipient:"Vermieter / Hausverwaltung",body:`hiermit kündige ich den Mietvertrag für die Wohnung ${a.address} fristgerecht zum nächstmöglichen Zeitpunkt.${a.terminationDate?`\n\nSofern möglich, bitte ich um Beendigung des Mietverhältnisses zum ${formatDateForLetter(a.terminationDate)}.`:''}${a.reason?`\n\nGrund der Kündigung: ${a.reason}`:''}\n\nBitte bestätigen Sie mir den Eingang dieser Kündigung sowie den Beendigungstermin schriftlich.\n\nVielen Dank.`,translation:`Wypowiadam umowę najmu mieszkania przy adresie ${a.address} w najbliższym możliwym terminie.${a.terminationDate?` Jeśli to możliwe, proszę o zakończenie umowy ${formatDateForLetter(a.terminationDate)}.`:''}${a.reason?` Powód: ${a.reason}.`:''} Proszę o pisemne potwierdzenie otrzymania wypowiedzenia i daty zakończenia umowy.`})},
  rentIssue:{recipient:"Vermieter / Hausverwaltung",subject:"Anfrage wegen eines Problems in der Wohnung",questions:[
    {id:"address",label:{pl:"Adres mieszkania",uk:"Адреса житла"},required:true,type:"text"},
    {id:"problem",label:{pl:"Co jest problemem?",uk:"У чому проблема?"},required:true,type:"textarea"},
    {id:"since",label:{pl:"Od kiedy występuje problem? (opcjonalnie)",uk:"Відколи існує проблема? (необов’язково)"},required:false,type:"date"}],
    build:a=>({subject:"Anfrage wegen eines Problems in der Wohnung",recipient:"Vermieter / Hausverwaltung",body:`ich wende mich an Sie bezüglich eines Problems in meiner Wohnung in ${a.address}.\n\nDas Problem besteht darin:\n${a.problem}${a.since?`\n\nDas Problem besteht seit dem ${formatDateForLetter(a.since)}.`:''}\n\nBitte teilen Sie mir mit, wie wir das Problem lösen können und wann eine Rückmeldung bzw. ein Termin möglich ist.\n\nVielen Dank.`,translation:`Zwracam się w sprawie problemu w mieszkaniu przy ${a.address}. Problem polega na: ${a.problem}.${a.since?` Występuje od ${formatDateForLetter(a.since)}.`:''} Proszę o informację, jak można go rozwiązać i kiedy możliwa jest odpowiedź lub termin.`})},
  carRegistration:{recipient:"Zulassungsstelle",subject:"Anfrage zur Fahrzeugzulassung",questions:[
    {id:"matter",label:{pl:"Czego potrzebujesz?",uk:"Що вам потрібно?"},required:true,type:"select",options:[{value:"registration",pl:"Rejestracja samochodu",uk:"Реєстрація автомобіля"},{value:"change",pl:"Zmiana danych pojazdu / właściciela",uk:"Зміна даних автомобіля / власника"},{value:"documents",pl:"Informacja o dokumentach",uk:"Інформація про документи"},{value:"appointment",pl:"Termin",uk:"Термін"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"vehicle",label:{pl:"Dane samochodu (np. marka, model, rejestracja/VIN)",uk:"Дані автомобіля (марка, модель, номер/VIN)"},required:true,type:"text"},
    {id:"details",label:{pl:"Dodatkowe informacje (opcjonalnie)",uk:"Додаткова інформація (необов’язково)"},required:false,type:"textarea"}],
    build:a=>({subject:"Anfrage zur Fahrzeugzulassung",recipient:"Zulassungsstelle",body:`ich wende mich an Sie bezüglich der Fahrzeugzulassung.\n\nMein Anliegen betrifft: ${a.matter}.\n\nFahrzeugdaten: ${a.vehicle}${a.details?`\n\nWeitere Informationen:\n${a.details}`:''}\n\nBitte teilen Sie mir mit, welche Unterlagen erforderlich sind und ob ich einen Termin benötige.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do Zulassungsstelle w sprawie: ${a.matter}. Dane samochodu: ${a.vehicle}.${a.details?` Dodatkowe informacje: ${a.details}`:''} Proszę o informację, jakie dokumenty są potrzebne i czy muszę umówić termin.`})},
  license:{recipient:"Führerscheinstelle",subject:"Anfrage bezüglich meines Führerscheins",questions:[
    {id:"matter",label:{pl:"Czego dotyczy sprawa prawa jazdy?",uk:"Чого стосується справа щодо водійського посвідчення?"},required:true,type:"select",options:[{value:"exchange",pl:"Wymiana prawa jazdy",uk:"Обмін посвідчення водія"},{value:"extension",pl:"Przedłużenie / odnowienie",uk:"Продовження / поновлення"},{value:"documents",pl:"Wymagane dokumenty",uk:"Необхідні документи"},{value:"appointment",pl:"Termin",uk:"Термін"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"details",label:{pl:"Dodatkowe informacje",uk:"Додаткова інформація"},required:true,type:"textarea"}],
    build:a=>({subject:"Anfrage bezüglich meines Führerscheins",recipient:"Führerscheinstelle",body:`ich wende mich an Sie bezüglich meines Führerscheins.\n\nMein Anliegen betrifft: ${a.matter}.\n\n${a.details}\n\nBitte teilen Sie mir mit, welche Unterlagen erforderlich sind und wie ich weiter vorgehen soll.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do Führerscheinstelle w sprawie: ${a.matter}. Dodatkowe informacje: ${a.details}. Proszę o informację, jakie dokumenty są potrzebne i co powinienem/powinnam zrobić dalej.`})},
  pension:{recipient:"Deutsche Rentenversicherung",subject:"Anfrage an die Deutsche Rentenversicherung",questions:[
    {id:"matter",label:{pl:"Czego dotyczy sprawa?",uk:"Чого стосується справа?"},required:true,type:"select",options:[{value:"insurance",pl:"Przebieg ubezpieczenia",uk:"Страховий стаж"},{value:"pension",pl:"Emerytura / świadczenie",uk:"Пенсія / виплата"},{value:"documents",pl:"Dokumenty / zaświadczenie",uk:"Документи / довідка"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"details",label:{pl:"Opisz, czego potrzebujesz",uk:"Опишіть, що вам потрібно"},required:true,type:"textarea"},
    {id:"insuranceNumber",label:{pl:"Numer ubezpieczenia (opcjonalnie)",uk:"Страховий номер (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Anfrage an die Deutsche Rentenversicherung",recipient:"Deutsche Rentenversicherung",body:`ich wende mich an Sie bezüglich meiner Rentenversicherung bzw. meines Versicherungsverlaufs.\n\nMein Anliegen betrifft: ${a.matter}.\n\n${a.details}${a.insuranceNumber?`\n\nVersicherungsnummer: ${a.insuranceNumber}`:''}\n\nBitte teilen Sie mir mit, ob weitere Unterlagen oder Angaben benötigt werden.\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do Deutsche Rentenversicherung w sprawie: ${a.matter}. Potrzebuję: ${a.details}.${a.insuranceNumber?` Numer ubezpieczenia: ${a.insuranceNumber}.`:''} Proszę o informację, czy potrzebne są dodatkowe dokumenty lub dane.`})},
  contribution:{recipient:"Beitragsservice",subject:"Anfrage zum Rundfunkbeitrag",questions:[
    {id:"matter",label:{pl:"Czego dotyczy sprawa?",uk:"Чого стосується справа?"},required:true,type:"select",options:[{value:"move",pl:"Przeprowadzka / zmiana adresu",uk:"Переїзд / зміна адреси"},{value:"payment",pl:"Płatność / zaległość",uk:"Платіж / заборгованість"},{value:"exemption",pl:"Zwolnienie z opłaty",uk:"Звільнення від сплати"},{value:"account",pl:"Dane / konto Beitragsservice",uk:"Дані / рахунок Beitragsservice"},{value:"other",pl:"Inna sprawa",uk:"Інша справа"}]},
    {id:"details",label:{pl:"Opisz sprawę",uk:"Опишіть справу"},required:true,type:"textarea"},
    {id:"contributionNumber",label:{pl:"Beitragsnummer (opcjonalnie)",uk:"Beitragsnummer (необов’язково)"},required:false,type:"text"}],
    build:a=>({subject:"Anfrage zum Rundfunkbeitrag",recipient:"Beitragsservice",body:`ich wende mich an Sie bezüglich meines Rundfunkbeitrags.\n\nMein Anliegen betrifft: ${a.matter}.\n\n${a.details}${a.contributionNumber?`\n\nBeitragsnummer: ${a.contributionNumber}`:''}\n\nBitte prüfen Sie meinen Vorgang und teilen Sie mir mit, wie ich weiter vorgehen soll bzw. ob weitere Unterlagen benötigt werden.\n\nVielen Dank.`,translation:`Zwracam się do Beitragsservice w sprawie: ${a.matter}. Szczegóły: ${a.details}.${a.contributionNumber?` Beitragsnummer: ${a.contributionNumber}.`:''} Proszę o sprawdzenie sprawy i informację, co powinienem/powinnam zrobić dalej.`})},
  other:{recipient:"",subject:"Anfrage",questions:[
    {id:"recipient",label:{pl:"Do jakiego urzędu / osoby kierujesz pismo?",uk:"До якої установи / особи ви звертаєтесь?"},required:true,type:"text"},
    {id:"purpose",label:{pl:"Jaki jest cel pisma?",uk:"Яка мета листа?"},required:true,type:"textarea"},
    {id:"action",label:{pl:"Czego oczekujesz od odbiorcy?",uk:"Чого ви очікуєте від одержувача?"},required:true,type:"textarea"}],
    build:a=>({subject:"Anfrage",recipient:a.recipient,body:`hiermit wende ich mich mit folgendem Anliegen an Sie.\n\n${a.purpose}\n\nIch bitte Sie, mein Anliegen zu prüfen und die erforderlichen Schritte zu veranlassen.\n\nIch bitte um folgende Rückmeldung bzw. Handlung:\n${a.action}\n\nVielen Dank für Ihre Rückmeldung.`,translation:`Zwracam się do Państwa w sprawie: ${a.purpose}. Proszę o następujące działanie lub odpowiedź: ${a.action}.`})}
};

function openTemplateFlow(key){
  const flow=templateFlows[key]||templateFlows.other;
  pendingAnalysis={templateKey:key,recipient:flow.recipient,subject:flow.subject,questions:flow.questions||[]};
  renderSmartQuestions(pendingAnalysis);
}

function buildTemplateDraft(key,answers){
  const flow=templateFlows[key]||templateFlows.other;
  return flow.build(answers);
}

// Replace template buttons with real, template-specific forms — never expose [Datum] placeholders.
document.querySelectorAll("[data-template]").forEach(btn=>btn.addEventListener("click",()=>openTemplateFlow(btn.dataset.template)));

// The smart-question Continue button handles both free-form analysis and template forms.
const oldSmartContinue=$("smartContinue");
if(oldSmartContinue){
  oldSmartContinue.addEventListener("click",()=>{
    const answers=collectSmartAnswers();
    if(!answers)return;
    if(pendingAnalysis?.templateKey){
      const draft=buildTemplateDraft(pendingAnalysis.templateKey,answers);
      if(draft) fillResult(draft.subject,draft.body,draft.translation,draft.recipient);
      return;
    }
    const draft=buildSmartDraft(pendingAnalysis,answers);
    if(draft) fillResult(draft.subject,draft.body,draft.translation,draft.recipient);
  });
}

$("generate")?.addEventListener("click",generate);


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

document.querySelectorAll("#templateEditor input, #templateEditor textarea").forEach(el=>{el.addEventListener("input",updateTemplatePreview);el.addEventListener("change",updateTemplatePreview);});
$("editDate")?.addEventListener("change",updateTemplatePreview);
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
    smartStep:"KROK 2A",smartTitle:"Doprecyzuj swoją sprawę",smartIntroTitle:"Potrzebuję jeszcze kilku informacji",smartIntroText:"Dzięki temu pismo będzie konkretne i nie będziemy dopisywać informacji, których nie podałeś.",smartContinue:"Przygotuj pismo <span>→</span>",smartSecurity:"Wpisuj tylko dane potrzebne do tej sprawy. Przed wysłaniem zawsze możesz wszystko sprawdzić i poprawić.",step1:"KROK 1",chooseCategory:"Wybierz kategorię",step2:"KROK 2",describeCase:"Opisz swoją sprawę",step3:"KROK 3",letterReady:"Twoje pismo jest gotowe!",
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
    smartStep:"КРОК 2A",smartTitle:"Уточніть вашу справу",smartIntroTitle:"Потрібно ще кілька відомостей",smartIntroText:"Так лист буде конкретним, і ми не будемо додавати інформацію, якої ви не надавали.",smartContinue:"Підготувати лист <span>→</span>",smartSecurity:"Вводьте лише дані, потрібні для цієї справи. Перед надсиланням ви завжди можете все перевірити та виправити.",step1:"КРОК 1",chooseCategory:"Оберіть категорію",step2:"КРОК 2",describeCase:"Опишіть свою справу",step3:"КРОК 3",letterReady:"Ваш лист готовий!",
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
