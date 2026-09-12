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
document.querySelectorAll("[data-home]").forEach(b=>b.addEventListener("click",()=>{stack=[];show("home",false)}));
document.querySelectorAll("[data-advisor]").forEach(b=>b.addEventListener("click",()=>{stack=[];show("advisor",false);initAdvisorChat();}));
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
  prepareEditor(item.subject,item.body,item.senderName,item.recipient,item.recipientAddress,{street:item.street,city:item.city,recipientStreet:item.recipientStreet,recipientCity:item.recipientCity,date:item.date});
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
  const recipientStreet=$("editRecipientStreet")?.value.trim();
  const recipientCity=$("editRecipientCity")?.value.trim();
  const subject=$("editSubject")?.value.trim()||"Anfrage";
  const body=$("editBody")?.value||"";
  const date=$("editDate")?.value;
  const address=[street,city].filter(Boolean).join("\n");
  const recipientBlock=[recipient,recipientStreet,recipientCity].filter(Boolean).join("\n");
  const closing=`Mit freundlichen Grüßen\n\n${name}`;
  const full=[recipientBlock,address,body.trim(),closing].filter(Boolean).join("\n\n");
  if($("subject")) $("subject").textContent=subject;
  if($("letterText")) $("letterText").textContent=[body.trim(),closing].filter(Boolean).join("\n\n");
  if($("docSender")) $("docSender").textContent=[name,address].filter(Boolean).join("\n");
  if($("docRecipientBlock")) $("docRecipientBlock").textContent=recipientBlock||recipient;
  if($("docDate")) $("docDate").textContent=formatDateForLetter(date);
  if($("docRecipient")) $("docRecipient").textContent=recipient;
}

function prepareEditor(subject, body, sender="", recipient="", recipientAddress="", savedFields=null){
  if($("editSubject")) $("editSubject").value=subject||"Anfrage";
  if($("editBody")) $("editBody").value=body||"";
  if($("editSenderName")) $("editSenderName").value=sender||$("senderNameInput")?.value.trim()||"";
  if($("editRecipient")) $("editRecipient").value=recipient||$("recipientInput")?.value.trim()||"";
  if($("editRecipientStreet")) $("editRecipientStreet").value=savedFields?.recipientStreet||"";
  if($("editRecipientCity")) $("editRecipientCity").value=savedFields?.recipientCity||"";
  // Kompatybilność ze starszymi zapisanymi pismami: pojedynczy adres odbiorcy zostaje pokazany w polu ulicy/adresu.
  if($("editRecipientStreet") && !$("editRecipientStreet").value && recipientAddress){
    const parts=recipientAddress.split(/\s*,\s*/);
    $("editRecipientStreet").value=parts[0]||"";
    if($("editRecipientCity")) $("editRecipientCity").value=parts.slice(1).join(", ")||"";
  }
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

const BRIEFLA_AI_ENDPOINT = ""; // Docelowo: bezpieczny backend BRIEFLA. Nigdy nie wkładamy klucza API do przeglądarki.
let pendingAnalysis=null;
let currentAttachment=null;
let attachmentOcrText="";
let tesseractPromise=null;
let pdfjsPromise=null;

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
  const notice=$("smartNotice");
  if(notice){ notice.hidden=!analysis.notice; notice.textContent=analysis.notice?.[lang]||""; }

  const isTemplate=!!analysis.templateKey;
  const common=isTemplate ? [
    {id:"senderName",label:{pl:"Twoje dane — imię i nazwisko",uk:"Ваші дані — ім’я та прізвище"},placeholder:{pl:"np. Mariusz Machowski",uk:"напр. Маріуш Маховський"},required:true,type:"text"},
    {id:"senderStreet",label:{pl:"Twój adres — ulica i numer",uk:"Ваша адреса — вулиця та номер"},placeholder:{pl:"np. Musterstraße 12",uk:"напр. Musterstraße 12"},required:true,type:"text"},
    {id:"senderCity",label:{pl:"Twój adres — kod pocztowy i miejscowość",uk:"Ваша адреса — індекс і місто"},placeholder:{pl:"np. 38640 Goslar",uk:"напр. 38640 Goslar"},required:true,type:"text"},
    {id:"recipient",label:{pl:"Odbiorca — urząd / osoba",uk:"Одержувач — установа / особа"},placeholder:{pl:"np. Jobcenter Goslar",uk:"напр. Jobcenter Goslar"},prefill:analysis.recipient||"",required:true,type:"text"},
    {id:"recipientStreet",label:{pl:"Adres odbiorcy — ulica i numer",uk:"Адреса одержувача — вулиця та номер"},placeholder:{pl:"np. Musterstraße 1",uk:"напр. Musterstraße 1"},required:true,type:"text"},
    {id:"recipientCity",label:{pl:"Adres odbiorcy — kod pocztowy i miejscowość",uk:"Адреса одержувача — індекс і місто"},placeholder:{pl:"np. 38640 Goslar",uk:"напр. 38640 Goslar"},required:true,type:"text"},
    {id:"letterDate",label:{pl:"Data pisma",uk:"Дата листа"},required:true,type:"date",prefill:formatDateForInput()}
  ] : [];
  const qs=[...common,...(analysis.questions||[])];
  list.innerHTML=`<div class="template-form-intro"><b>${isTemplate?(lang==="uk"?"Uzupełnij tylko swoje dane":"Uzupełnij tylko swoje dane"):"Potrzebuję jeszcze kilku informacji"}</b><small>${isTemplate?(lang==="uk"?"Tekst pisma jest już gotowy. Wpisz dane w polach powyżej.":"Tekst pisma jest już gotowy. Wpisz dane w polach powyżej."):"Dzięki temu pismo będzie konkretne."}</small></div>` + qs.map(q=>{
    const label=`<span>${q.label[lang]}${q.required?' *':''}</span>`;
    if(q.type==="select"){
      const options=(q.options||[]).map(o=>`<option value="${escapeHtml(o.value)}">${escapeHtml(o[lang])}</option>`).join("");
      return `<label class="smart-question">${label}<select id="smart_${q.id}" ${q.required?'required':''}><option value="">${lang==="uk"?"Оберіть варіант…":"Wybierz opcję…"}</option>${options}</select></label>`;
    }
    if(q.type==="textarea") return `<label class="smart-question">${label}<textarea id="smart_${q.id}" placeholder="${escapeHtml(q.placeholder?.[lang]||'')}" ${q.required?'required':''}>${escapeHtml(q.prefill||'')}</textarea></label>`;
    return `<label class="smart-question">${label}<input id="smart_${q.id}" type="${q.type||'text'}" placeholder="${escapeHtml(q.placeholder?.[lang]||'')}" value="${escapeHtml(q.prefill||'')}" ${q.required?'required':''}></label>`;
  }).join("") + (isTemplate?`<div class="template-live-wrap"><div class="template-live-head"><b>${lang==="uk"?"Готовий текст листа":"Gotowy tekst pisma"}</b><small>${lang==="uk"?"Tekst aktualizuje się automatycznie":"Tekst aktualizuje się automatycznie"}</small></div><div class="template-live-paper" id="templateLivePaper"></div></div>`:"");

  const updateLive=()=>{
    if(!isTemplate)return;
    const answers={};
    for(const q of qs){ answers[q.id]=($("smart_"+q.id)?.value||"").trim(); }
    const draft=buildTemplateDraft(analysis.templateKey,answers);
    const sender=answers.senderName||"[Imię i nazwisko]";
    const street=answers.senderStreet||"[Ulica i numer]";
    const city=answers.senderCity||"[PLZ i miejscowość]";
    const rec=answers.recipient||analysis.recipient||"[Odbiorca]";
    const recStreet=answers.recipientStreet||"[Ulica i numer odbiorcy]";
    const recCity=answers.recipientCity||"[PLZ i miejscowość odbiorcy]";
    const date=answers.letterDate||formatDateForInput();
    const text=[`${sender}\n${street}\n${city}`,`${rec}\n${recStreet}\n${recCity}`,`Datum: ${formatDateForLetter(date)}`,`Betreff: ${draft.subject||analysis.subject||""}`,draft.body||"",`Mit freundlichen Grüßen\n\n${sender}`].join("\n\n");
    const paper=$("templateLivePaper"); if(paper) paper.textContent=text;
  };
  list.querySelectorAll("input,select,textarea").forEach(el=>el.addEventListener("input",updateLive));
  list.querySelectorAll("input,select,textarea").forEach(el=>el.addEventListener("change",updateLive));
  show("smartQuestions");
  updateLive();
}

function collectSmartAnswers(){
  const answers={};
  const commonIds=pendingAnalysis?.templateKey?["senderName","senderStreet","senderCity","recipient","recipientStreet","recipientCity","letterDate"]:[];
  for(const id of commonIds){
    const el=$("smart_"+id); answers[id]=(el?.value||"").trim();
    if(id!=="recipientAddress" && !answers[id]){el?.focus();return null;}
  }
  for(const q of (pendingAnalysis?.questions||[])){
    const el=$("smart_"+q.id); answers[q.id]=(el?.value||"").trim();
    if(q.required && !answers[q.id]){ el?.focus(); return null; }
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

async function loadScriptOnce(src, globalName){
  if(globalName && window[globalName]) return window[globalName];
  return new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(x=>x.src===src);
    if(existing){
      existing.addEventListener("load",()=>resolve(globalName?window[globalName]:true),{once:true});
      existing.addEventListener("error",reject,{once:true});
      return;
    }
    const script=document.createElement("script");
    script.src=src; script.async=true;
    script.onload=()=>resolve(globalName?window[globalName]:true);
    script.onerror=()=>reject(new Error("Nie udało się załadować modułu."));
    document.head.appendChild(script);
  });
}

async function getTesseract(){
  if(!tesseractPromise){
    tesseractPromise=loadScriptOnce("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js","Tesseract");
  }
  return tesseractPromise;
}

async function getPdfJs(){
  if(!pdfjsPromise){
    pdfjsPromise=loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js","pdfjsLib").then(lib=>{
      if(lib && lib.GlobalWorkerOptions) lib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      return lib;
    });
  }
  return pdfjsPromise;
}

function setAttachmentStatus(message,type=""){
  const el=$("attachmentStatus"); if(!el)return;
  el.hidden=false; el.className=`attachment-status ${type}`; el.textContent=message;
}

function renderAttachmentPreview(file){
  const box=$("attachmentPreview"); if(!box)return;
  box.hidden=false;
  if(file.type.startsWith("image/")){
    const url=URL.createObjectURL(file);
    box.innerHTML=`<img src="${url}" alt="Podgląd załącznika"><button type="button" class="attachment-remove" id="removeAttachment">Usuń plik</button>`;
    const img=box.querySelector("img"); img.addEventListener("load",()=>URL.revokeObjectURL(url),{once:true});
  }else{
    box.innerHTML=`<div class="attachment-file"><span>PDF</span><span>${escapeHtml(file.name)}</span><button type="button" class="attachment-remove" id="removeAttachment">Usuń plik</button></div>`;
  }
  $("removeAttachment")?.addEventListener("click",clearAttachment);
}

function clearAttachment(){
  currentAttachment=null; attachmentOcrText="";
  const input=$("attachmentInput"); if(input)input.value="";
  const box=$("attachmentPreview"); if(box){box.hidden=true;box.innerHTML="";}
  const status=$("attachmentStatus"); if(status){status.hidden=true;status.textContent="";}
}

async function ocrImage(file){
  const T=await getTesseract();
  if(!T || !T.recognize) throw new Error("Moduł rozpoznawania tekstu jest niedostępny.");
  const result=await T.recognize(file,"deu+pol+ukr",{logger:m=>{
    if(m.status==="recognizing text" && Number.isFinite(m.progress)){
      const pct=Math.round(m.progress*100);
      setAttachmentStatus(`Odczytuję tekst ze zdjęcia… ${pct}%`,"processing");
    }
  }});
  return (result?.data?.text||"").replace(/\s+/g," ").trim();
}

async function ocrPdf(file){
  const pdfjs=await getPdfJs();
  const buffer=await file.arrayBuffer();
  const pdf=await pdfjs.getDocument({data:buffer}).promise;
  const pages=Math.min(pdf.numPages,2);
  let combined="";
  for(let i=1;i<=pages;i++){
    setAttachmentStatus(`Odczytuję stronę ${i} z ${pages}…`,"processing");
    const page=await pdf.getPage(i);
    const viewport=page.getViewport({scale:1.6});
    const canvas=document.createElement("canvas");
    canvas.width=Math.ceil(viewport.width); canvas.height=Math.ceil(viewport.height);
    await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise;
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
    if(blob) combined += " " + await ocrImage(blob);
    if(i===1){
      const box=$("attachmentPreview");
      if(box){const url=URL.createObjectURL(blob);box.innerHTML=`<img src="${url}" alt="Podgląd pierwszej strony PDF"><button type="button" class="attachment-remove" id="removeAttachment">Usuń plik</button>`;const img=box.querySelector("img");img.addEventListener("load",()=>URL.revokeObjectURL(url),{once:true});$("removeAttachment")?.addEventListener("click",clearAttachment);}
    }
  }
  return combined.replace(/\s+/g," ").trim();
}

async function analyzeAttachment(file){
  if(!file)return "";
  const max=15*1024*1024;
  if(file.size>max) throw new Error("Plik jest za duży. Maksymalny rozmiar to 15 MB.");
  if(file.type.startsWith("image/")) return ocrImage(file);
  if(file.type==="application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return ocrPdf(file);
  throw new Error("Obsługiwane są zdjęcia oraz pliki PDF.");
}

async function generate(){
  let typed=(area?.value||"").trim();
  let combined=typed;
  if(currentAttachment){
    try{
      setAttachmentStatus("Analizuję załącznik…","processing");
      attachmentOcrText=await analyzeAttachment(currentAttachment);
      if(attachmentOcrText) combined=[typed,attachmentOcrText].filter(Boolean).join("\n\n");
      setAttachmentStatus(attachmentOcrText?"Załącznik odczytany. BRIEFLA wykorzysta jego treść do rozpoznania sprawy.":"Nie udało się odczytać tekstu z załącznika.",attachmentOcrText?"success":"error");
    }catch(err){
      setAttachmentStatus(err?.message||"Nie udało się przeanalizować załącznika.","error");
      return;
    }
  }
  if(!combined){
    area?.focus();
    return;
  }
  const analysis=analyzeCase(combined);
  analysis.attachmentText=attachmentOcrText;
  if(analysis.questions.length){ renderSmartQuestions(analysis); return; }
  const draft=buildSmartDraft(analysis,{});
  if(draft) fillResult(draft.subject,draft.body,draft.translation,draft.recipient);
}

const attachmentInput=$("attachmentInput");
const uploadButton=$("uploadButton");
uploadButton?.addEventListener("click",()=>attachmentInput?.click());
attachmentInput?.addEventListener("change",e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  currentAttachment=file; attachmentOcrText="";
  renderAttachmentPreview(file);
  setAttachmentStatus(`Wybrano: ${file.name}. Kliknij „Dalej”, aby BRIEFLA odczytała treść i pomogła rozpoznać sprawę.`);
});


/* BRIEFLA TEMPLATE LIBRARY V3 — each template is a dedicated, purpose-built letter flow. */
const tq=(id,pl,uk,type="text",required=true,extra={})=>({id,label:{pl,uk},type,required,...extra});
const opt=(value,pl,uk)=>({value,pl,uk});
const fd=(v)=>formatDateForLetter(v);
const nl=(s)=>s.trim();

const templateFlows={
  address:{recipient:"Bürgeramt / zuständige Behörde",subject:"Mitteilung über meine neue Anschrift",questions:[
    tq("oldAddress","Poprzedni adres","Попередня адреса"),tq("newAddress","Nowy adres","Нова адреса"),tq("effectiveDate","Data zmiany adresu","Дата зміни адреси","date"),tq("reference","Numer sprawy / Kundennummer (opcjonalnie)","Номер справи / Kundennummer (необов’язково)","text",false)
  ],build:a=>({subject:"Mitteilung über meine neue Anschrift",recipient:"Bürgeramt / zuständige Behörde",body:nl(`hiermit teile ich Ihnen meine neue Anschrift mit.\n\nBisherige Anschrift:\n${a.oldAddress}\n\nNeue Anschrift:\n${a.newAddress}\n\nDie Änderung gilt seit dem ${fd(a.effectiveDate)}.${a.reference?`\n\nAktenzeichen / Kundennummer: ${a.reference}`:""}\n\nIch bitte Sie, meine Anschrift in Ihren Unterlagen zu aktualisieren und mir die Änderung zu bestätigen.`),translation:`Informuję o zmianie adresu.\n\nDotychczasowy adres: ${a.oldAddress}\nNowy adres: ${a.newAddress}\nZmiana obowiązuje od ${fd(a.effectiveDate)}.${a.reference?` Numer sprawy / klienta: ${a.reference}.`:""} Proszę o aktualizację danych i potwierdzenie zmiany.`})},

  registration:{notice:{pl:"To jest pismo pomocnicze. Nie zastępuje oficjalnego formularza Anmeldung, jeśli urząd wymaga jego złożenia.",uk:"Це допоміжний лист. Він не замінює офіційну форму Anmeldung, якщо установа вимагає її подати."},recipient:"Bürgeramt / Meldebehörde",subject:"Anfrage zur Anmeldung meiner Wohnung",questions:[
    tq("newAddress","Adres nowego miejsca zamieszkania","Адреса нового місця проживання"),tq("moveDate","Data wprowadzenia się","Дата заселення","date"),tq("appointment","Czy potrzebujesz terminu?","Чи потрібен вам термін?","select",true,{options:[opt("yes","Tak","Так"),opt("no","Nie","Ні")]}),tq("details","Dodatkowe informacje (opcjonalnie)","Додаткова інформація (необов’язково)","textarea",false)
  ],build:a=>({subject:"Anfrage zur Anmeldung meiner Wohnung",recipient:"Bürgeramt / Meldebehörde",body:nl(`ich bin am ${fd(a.moveDate)} in die folgende Wohnung eingezogen:\n\n${a.newAddress}\n\nIch möchte meinen Wohnsitz ordnungsgemäß anmelden.${a.appointment==="yes"?" Bitte teilen Sie mir mit, wann ein Termin zur Anmeldung möglich ist.":""}${a.details?`\n\nWeitere Angaben:\n${a.details}`:""}\n\nBitte teilen Sie mir mit, welche Unterlagen ich für die Anmeldung vorlegen muss.`),translation:`Wprowadziłem/am się ${fd(a.moveDate)} pod adres: ${a.newAddress}. Chcę prawidłowo zameldować miejsce zamieszkania.${a.appointment==="yes"?" Proszę o informację o możliwym terminie.":""}${a.details?` Dodatkowe informacje: ${a.details}.`:""} Proszę o informację, jakie dokumenty są potrzebne.`})},

  deregistration:{recipient:"Bürgeramt / Meldebehörde",subject:"Abmeldung meines Wohnsitzes",questions:[
    tq("oldAddress","Adres, z którego się wymeldowujesz","Адреса, з якої ви знімаєтесь з реєстрації"),tq("moveDate","Data wyprowadzki","Дата виїзду","date"),tq("newCountry","Nowy kraj zamieszkania (opcjonalnie)","Нова країна проживання (необов’язково)","text",false)
  ],build:a=>({subject:"Abmeldung meines Wohnsitzes",recipient:"Bürgeramt / Meldebehörde",body:nl(`hiermit möchte ich mich von meiner bisherigen Wohnanschrift abmelden.\n\nBisherige Anschrift:\n${a.oldAddress}\n\nAuszugsdatum: ${fd(a.moveDate)}${a.newCountry?`\n\nNeuer Wohnsitz / neues Land: ${a.newCountry}`:""}\n\nBitte bestätigen Sie mir die Abmeldung schriftlich.`),translation:`Chcę się wymeldować z adresu ${a.oldAddress}. Data wyprowadzki: ${fd(a.moveDate)}.${a.newCountry?` Nowe miejsce zamieszkania/kraj: ${a.newCountry}.`:""} Proszę o pisemne potwierdzenie wymeldowania.`})},

  auslander:{recipient:"Ausländerbehörde",subject:"Anfrage zu meinem aufenthaltsrechtlichen Anliegen",questions:[
    tq("purpose","Rodzaj sprawy","Тип справи","select",true,{options:[opt("extension","Przedłużenie dokumentu pobytowego","Продовження документа на проживання"),opt("appointment","Termin","Термін"),opt("documents","Wymagane dokumenty","Необхідні документи"),opt("status","Status prowadzonej sprawy","Статус справи")]}),tq("documentType","Rodzaj dokumentu pobytowego (opcjonalnie)","Тип документа на проживання (необов’язково)","text",false),tq("expiry","Data ważności dokumentu (opcjonalnie)","Дата закінчення дії документа (необов’язково)","date",false),tq("reference","Aktenzeichen / numer sprawy (opcjonalnie)","Aktenzeichen / номер справи (необов’язково)","text",false)
  ],build:a=>({subject:"Anfrage zu meinem aufenthaltsrechtlichen Anliegen",recipient:"Ausländerbehörde",body:nl(`ich wende mich an Sie bezüglich meines aufenthaltsrechtlichen Anliegens.\n\nMein Anliegen betrifft: ${a.purpose}.${a.documentType?`\n\nDokument: ${a.documentType}`:""}${a.expiry?`\nGültig bis: ${fd(a.expiry)}`:""}${a.reference?`\n\nAktenzeichen / Vorgangsnummer: ${a.reference}`:""}\n\nBitte teilen Sie mir mit, welche Unterlagen bzw. welche weiteren Schritte in meinem Fall erforderlich sind.`),translation:`Zwracam się w sprawie dotyczącej pobytu. Sprawa: ${a.purpose}.${a.documentType?` Dokument: ${a.documentType}.`:""}${a.expiry?` Ważny do: ${fd(a.expiry)}.`:""}${a.reference?` Numer sprawy: ${a.reference}.`:""} Proszę o informację, jakie dokumenty lub dalsze kroki są potrzebne.`})},

  appointment:{recipient:"Zuständige Behörde / Stelle",subject:"Bitte um einen Termin",questions:[
    tq("purpose","Cel wizyty / czego dotyczy sprawa","Мета візиту / у чому справа"),tq("preferred","Preferowany termin (opcjonalnie)","Бажаний термін (необов’язково)","text",false),tq("reference","Aktenzeichen / numer sprawy (opcjonalnie)","Aktenzeichen / номер справи (необов’язково)","text",false)
  ],build:a=>({subject:"Bitte um einen Termin",recipient:"Zuständige Behörde / Stelle",body:nl(`ich möchte gerne einen Termin zu folgendem Anliegen vereinbaren:\n\n${a.purpose}${a.preferred?`\n\nMein bevorzugter Termin wäre: ${a.preferred}.`:""}${a.reference?`\n\nAktenzeichen / Vorgangsnummer: ${a.reference}`:""}\n\nBitte teilen Sie mir mit, wann ein Termin möglich ist.`),translation:`Proszę o wyznaczenie terminu w sprawie: ${a.purpose}.${a.preferred?` Preferowany termin: ${a.preferred}.`:""}${a.reference?` Numer sprawy: ${a.reference}.`:""} Proszę o informację, kiedy termin jest możliwy.`})},

  documents:{recipient:"Zuständige Behörde / Stelle",subject:"Nachreichung von Unterlagen",questions:[
    tq("documents","Dokładna lista dosyłanych dokumentów","Точний список документів, які надсилаєте","textarea"),tq("reference","Aktenzeichen / numer sprawy","Aktenzeichen / номер справи","text"),tq("deadline","Termin wskazany przez urząd (opcjonalnie)","Термін, зазначений установою (необов’язково)","date",false)
  ],build:a=>({subject:"Nachreichung von Unterlagen",recipient:"Zuständige Behörde / Stelle",body:nl(`hiermit reiche ich die zu meinem Vorgang angeforderten Unterlagen nach.\n\nAktenzeichen / Vorgangsnummer: ${a.reference}\n\nFolgende Unterlagen sind beigefügt:\n${a.documents}${a.deadline?`\n\nBezugnehmend auf die von Ihnen gesetzte Frist bis zum ${fd(a.deadline)}.`:""}\n\nBitte bestätigen Sie mir den Eingang der Unterlagen und teilen Sie mir mit, falls noch etwas fehlt.`),translation:`Dosyłam dokumenty do sprawy ${a.reference}. Załączniki: ${a.documents}.${a.deadline?` Termin wskazany przez urząd: ${fd(a.deadline)}.`:""} Proszę o potwierdzenie otrzymania i informację, jeśli czegoś jeszcze brakuje.`})},

  appeal:{notice:{pl:"BRIEFLA przygotowuje treść sprzeciwu na podstawie podanych danych. Termin i dopuszczalność sprzeciwu należy sprawdzić w otrzymanej decyzji.",uk:"BRIEFLA готує текст заперечення на основі наданих даних. Строк і допустимість заперечення слід перевірити у отриманому рішенні."},recipient:"Behörde, die den Bescheid erlassen hat",subject:"Widerspruch gegen den Bescheid vom …",questions:[
    tq("decisionDate","Data decyzji / Bescheid","Дата рішення / Bescheid","date"),tq("reference","Aktenzeichen / numer decyzji","Aktenzeichen / номер рішення"),tq("receivedDate","Data otrzymania decyzji (opcjonalnie)","Дата отримання рішення (необов’язково)","date",false),tq("reason","Uzasadnienie sprzeciwu (opcjonalnie)","Обґрунтування заперечення (необов’язково)","textarea",false)
  ],build:a=>({subject:`Widerspruch gegen den Bescheid vom ${fd(a.decisionDate)}`,recipient:"Behörde, die den Bescheid erlassen hat",body:nl(`hiermit lege ich gegen den Bescheid vom ${fd(a.decisionDate)} Widerspruch ein.\n\nAktenzeichen: ${a.reference}${a.receivedDate?`\n\nDer Bescheid ist mir am ${fd(a.receivedDate)} zugegangen.`:""}${a.reason?`\n\nBegründung:\n${a.reason}`:""}\n\nIch bitte um erneute Prüfung des Bescheids und um schriftliche Bestätigung des Eingangs meines Widerspruchs.`),translation:`Składam sprzeciw od decyzji z dnia ${fd(a.decisionDate)}. Numer sprawy: ${a.reference}.${a.receivedDate?` Otrzymałem/am decyzję ${fd(a.receivedDate)}.`:""}${a.reason?` Uzasadnienie: ${a.reason}`:""} Proszę o ponowne rozpatrzenie i potwierdzenie otrzymania sprzeciwu.`})},

  requestDecision:{recipient:"Zuständige Behörde / Stelle",subject:"Bitte um erneute Prüfung meines Vorgangs",questions:[
    tq("reference","Aktenzeichen / numer sprawy","Aktenzeichen / номер справи"),tq("decisionDate","Data decyzji (opcjonalnie)","Дата рішення (необов’язково)","date",false),tq("request","Czego konkretnie dotyczy prośba o ponowne rozpatrzenie?","Що саме ви просите повторно розглянути?","textarea")
  ],build:a=>({subject:"Bitte um erneute Prüfung meines Vorgangs",recipient:"Zuständige Behörde / Stelle",body:nl(`ich bitte Sie um eine erneute Prüfung meines Vorgangs.\n\nAktenzeichen / Vorgangsnummer: ${a.reference}${a.decisionDate?`\n\nBezug: Bescheid vom ${fd(a.decisionDate)}`:""}\n\nMein Anliegen:\n${a.request}\n\nBitte teilen Sie mir das Ergebnis der Prüfung schriftlich mit.`),translation:`Proszę o ponowne sprawdzenie sprawy. Numer sprawy: ${a.reference}.${a.decisionDate?` Decyzja z dnia ${fd(a.decisionDate)}.`:""} Proszę o rozpatrzenie: ${a.request} i pisemną informację o wyniku.`})},

  jobcenter:{recipient:"Jobcenter",subject:"Mitteilung zu meiner aktuellen Situation",questions:[
    tq("reference","BG-Nummer / Kundennummer","BG-Nummer / Kundennummer"),tq("change","Co chcesz zgłosić?","Що ви хочете повідомити?","select",true,{options:[opt("work","Rozpoczęcie / zakończenie pracy","Початок / завершення роботи"),opt("income","Zmianę dochodu","Зміну доходу"),opt("address","Zmianę adresu","Зміну адреси"),opt("bank","Zmianę konta bankowego","Зміну банківського рахунку")]}),tq("effectiveDate","Od kiedy obowiązuje zmiana?","З якої дати діє зміна?","date"),tq("details","Dodatkowe dane dotyczące zmiany","Додаткові дані щодо зміни","textarea")
  ],build:a=>({subject:"Mitteilung zu meiner aktuellen Situation",recipient:"Jobcenter",body:nl(`hiermit teile ich Ihnen eine Änderung meiner persönlichen bzw. finanziellen Verhältnisse mit.\n\nBG-Nummer / Kundennummer: ${a.reference}\n\nArt der Änderung: ${a.change}\n\nDie Änderung gilt seit dem ${fd(a.effectiveDate)}.\n\nWeitere Angaben:\n${a.details}\n\nBitte berücksichtigen Sie die Änderung bei der weiteren Bearbeitung meines Leistungsfalls und teilen Sie mir mit, falls weitere Nachweise benötigt werden.`),translation:`Informuję Jobcenter o zmianie mojej sytuacji. Numer BG/Kundennummer: ${a.reference}. Rodzaj zmiany: ${a.change}. Zmiana obowiązuje od ${fd(a.effectiveDate)}. Szczegóły: ${a.details}. Proszę o uwzględnienie zmiany i informację, jeśli potrzebne są dodatkowe dokumenty.`})},

  newJob:{recipient:"Jobcenter",subject:"Mitteilung über die Aufnahme einer Beschäftigung",questions:[
    tq("reference","BG-Nummer / Kundennummer","BG-Nummer / Kundennummer"),tq("employer","Nazwa pracodawcy","Назва роботодавця"),tq("employerAddress","Adres pracodawcy","Адреса роботодавця"),tq("startDate","Data rozpoczęcia pracy","Дата початку роботи","date"),tq("employmentType","Rodzaj zatrudnienia","Вид зайнятості","select",true,{options:[opt("Vollzeit","pełny etat","повна зайнятість"),opt("Teilzeit","część etatu","часткова зайнятість"),opt("Minijob","Minijob","Minijob"),opt("Selbstständig","samozatrudnienie","самозайнятість")]}),tq("gross","Wynagrodzenie brutto (opcjonalnie)","Заробіток брутто (необов’язково)","text",false),tq("firstPay","Data pierwszej wypłaty (opcjonalnie)","Дата першої виплати (необов’язково)","date",false)
  ],build:a=>({subject:"Mitteilung über die Aufnahme einer Beschäftigung",recipient:"Jobcenter",body:nl(`hiermit teile ich Ihnen mit, dass ich ab dem ${fd(a.startDate)} eine Beschäftigung bei ${a.employer} aufnehme.\n\nBG-Nummer / Kundennummer: ${a.reference}\n\nArbeitgeber:\n${a.employer}\n${a.employerAddress}\n\nBeschäftigungsart: ${a.employmentType}${a.gross?`\nVoraussichtliches Bruttoeinkommen: ${a.gross}`:""}${a.firstPay?`\nVoraussichtlicher erster Auszahlungstermin: ${fd(a.firstPay)}`:""}\n\nIch reiche die verfügbaren Nachweise ein. Bitte teilen Sie mir mit, falls weitere Unterlagen benötigt werden.`),translation:`Informuję Jobcenter, że od ${fd(a.startDate)} rozpoczynam pracę w ${a.employer}. Numer sprawy: ${a.reference}. Pracodawca: ${a.employer}, ${a.employerAddress}. Rodzaj zatrudnienia: ${a.employmentType}.${a.gross?` Brutto: ${a.gross}.`:""}${a.firstPay?` Pierwsza wypłata: ${fd(a.firstPay)}.`:""} Proszę o informację, jeśli potrzebne są dodatkowe dokumenty.`})},

  incomeChange:{recipient:"Jobcenter",subject:"Mitteilung über eine Änderung meines Einkommens",questions:[
    tq("reference","BG-Nummer / Kundennummer","BG-Nummer / Kundennummer"),tq("changeDate","Od kiedy zmienia się dochód?","З якої дати змінюється дохід?","date"),tq("gross","Nowy dochód brutto (jeśli znany)","Новий дохід брутто (якщо відомий)"),tq("net","Nowy dochód netto (jeśli znany)","Новий дохід нетто (якщо відомий)","text",false),tq("reason","Przyczyna zmiany","Причина зміни"),tq("proof","Jaki dokument potwierdza zmianę?","Який документ підтверджує зміну?")
  ],build:a=>({subject:"Mitteilung über eine Änderung meines Einkommens",recipient:"Jobcenter",body:nl(`hiermit teile ich Ihnen mit, dass sich mein Einkommen ab dem ${fd(a.changeDate)} ändert.\n\nBG-Nummer / Kundennummer: ${a.reference}\n\nGrund der Änderung: ${a.reason}\n\nNeues Bruttoeinkommen: ${a.gross}${a.net?`\nNeues Nettoeinkommen: ${a.net}`:""}\n\nNachweis: ${a.proof}\n\nBitte berücksichtigen Sie die Änderung bei der Berechnung meiner Leistungen und teilen Sie mir mit, falls weitere Nachweise erforderlich sind.`),translation:`Informuję o zmianie dochodu od ${fd(a.changeDate)}. Numer sprawy: ${a.reference}. Powód: ${a.reason}. Nowy dochód brutto: ${a.gross}.${a.net?` Netto: ${a.net}.`:""} Potwierdzenie: ${a.proof}. Proszę o uwzględnienie zmiany.`})},

  familykasse:{recipient:"Familienkasse",subject:"Anfrage zum Bearbeitungsstand meiner Kindergeldangelegenheit",questions:[
    tq("reference","Kindergeldnummer / Aktenzeichen (opcjonalnie)","Kindergeldnummer / Aktenzeichen (необов’язково)","text",false),tq("childName","Imię i nazwisko dziecka","Ім’я та прізвище дитини"),tq("request","Czego potrzebujesz od Familienkasse?","Що вам потрібно від Familienkasse?","select",true,{options:[opt("status","Informacji o statusie sprawy","Інформація про статус справи"),opt("missing","Informacji o brakujących dokumentach","Інформація про відсутні документи"),opt("payment","Wyjaśnienia dotyczącego płatności","Пояснення щодо виплати")]} )
  ],build:a=>({subject:"Anfrage zum Bearbeitungsstand meiner Kindergeldangelegenheit",recipient:"Familienkasse",body:nl(`ich wende mich an Sie bezüglich meiner Kindergeldangelegenheit.\n\nName des Kindes: ${a.childName}${a.reference?`\nKindergeldnummer / Aktenzeichen: ${a.reference}`:""}\n\nIch benötige folgende Information: ${a.request}.\n\nBitte teilen Sie mir den aktuellen Stand mit bzw. informieren Sie mich, welche Unterlagen noch benötigt werden.`),translation:`Zwracam się do Familienkasse w sprawie Kindergeld. Dziecko: ${a.childName}.${a.reference?` Numer Kindergeld/Aktenzeichen: ${a.reference}.`:""} Potrzebuję: ${a.request}. Proszę o informację o stanie sprawy lub brakujących dokumentach.`})},

  kindergeld:{notice:{pl:"To jest pismo pomocnicze do sprawy Kindergeld. Jeśli Familienkasse wymaga oficjalnego wniosku, należy złożyć również właściwy formularz/wniosek.",uk:"Це допоміжний лист щодо Kindergeld. Якщо Familienkasse вимагає офіційну заяву, потрібно також подати відповідну форму/заяву."},recipient:"Familienkasse",subject:"Antrag auf Kindergeld",questions:[
    tq("childName","Imię i nazwisko dziecka","Ім’я та прізвище дитини"),tq("birthDate","Data urodzenia dziecka","Дата народження дитини","date"),tq("childTaxId","Steuer-ID dziecka (jeśli posiadasz)","Steuer-ID дитини (якщо є)","text",false),tq("applicantTaxId","Twoja Steuer-ID (opcjonalnie)","Ваша Steuer-ID (необов’язково)","text",false),tq("additional","Dodatkowe informacje (opcjonalnie)","Додаткова інформація (необов’язково)","textarea",false)
  ],build:a=>({subject:"Antrag auf Kindergeld",recipient:"Familienkasse",body:nl(`hiermit beantrage ich Kindergeld für mein Kind.\n\nName des Kindes: ${a.childName}\nGeburtsdatum: ${fd(a.birthDate)}${a.childTaxId?`\nSteuer-ID des Kindes: ${a.childTaxId}`:""}${a.applicantTaxId?`\nMeine Steuer-ID: ${a.applicantTaxId}`:""}${a.additional?`\n\nWeitere Angaben:\n${a.additional}`:""}\n\nDie erforderlichen Nachweise füge ich bei. Bitte teilen Sie mir mit, falls weitere Unterlagen oder Angaben erforderlich sind.`),translation:`Składam wniosek o Kindergeld na dziecko ${a.childName}, urodzone ${fd(a.birthDate)}.${a.childTaxId?` Steuer-ID dziecka: ${a.childTaxId}.`:""}${a.applicantTaxId?` Moja Steuer-ID: ${a.applicantTaxId}.`:""}${a.additional?` Dodatkowe informacje: ${a.additional}.`:""} Dołączam wymagane dokumenty.`})},

  finanzamt:{recipient:"Finanzamt",subject:"Anfrage zu meiner steuerlichen Angelegenheit",questions:[
    tq("reference","Steuernummer / Aktenzeichen (opcjonalnie)","Steuernummer / Aktenzeichen (необов’язково)","text",false),tq("topic","Rodzaj sprawy podatkowej","Тип податкової справи","select",true,{options:[opt("bank","Zmiana danych bankowych","Зміна банківських даних"),opt("documents","Dokumenty / zaświadczenia","Документи / довідки"),opt("taxReturn","Zeznanie podatkowe","Податкова декларація"),opt("payment","Płatność / zwrot podatku","Платіж / повернення податку")]}),tq("details","Dane potrzebne do sprawy","Дані, необхідні для справи","textarea")
  ],build:a=>({subject:"Anfrage zu meiner steuerlichen Angelegenheit",recipient:"Finanzamt",body:nl(`ich wende mich an Sie bezüglich meiner steuerlichen Angelegenheit.\n\nThema: ${a.topic}${a.reference?`\nSteuernummer / Aktenzeichen: ${a.reference}`:""}\n\nAngaben zu meinem Anliegen:\n${a.details}\n\nBitte teilen Sie mir mit, ob weitere Angaben oder Unterlagen benötigt werden.`),translation:`Zwracam się do Finanzamt w sprawie podatkowej. Temat: ${a.topic}.${a.reference?` Steuernummer/Aktenzeichen: ${a.reference}.`:""} Szczegóły: ${a.details}. Proszę o informację, czy potrzebne są dodatkowe dane lub dokumenty.`})},

  taxDocuments:{recipient:"Finanzamt",subject:"Nachreichung von Unterlagen",questions:[
    tq("reference","Steuernummer / Aktenzeichen","Steuernummer / Aktenzeichen"),tq("documents","Lista dosyłanych dokumentów","Список документів, які надсилаєте","textarea"),tq("taxYear","Rok podatkowy (opcjonalnie)","Податковий рік (необов’язково)","text",false)
  ],build:a=>({subject:"Nachreichung von Unterlagen",recipient:"Finanzamt",body:nl(`hiermit reiche ich zu meinem steuerlichen Vorgang folgende Unterlagen nach:\n\nSteuernummer / Aktenzeichen: ${a.reference}${a.taxYear?`\nSteuerjahr: ${a.taxYear}`:""}\n\nUnterlagen:\n${a.documents}\n\nBitte bestätigen Sie mir den Eingang der Unterlagen und teilen Sie mir mit, falls weitere Nachweise benötigt werden.`),translation:`Dosyłam dokumenty do Finanzamt. Steuernummer/Aktenzeichen: ${a.reference}.${a.taxYear?` Rok podatkowy: ${a.taxYear}.`:""} Dokumenty: ${a.documents}. Proszę o potwierdzenie otrzymania.`})},

  healthInsurance:{recipient:"Krankenkasse",subject:"Anfrage zu meiner Krankenversicherung",questions:[
    tq("insuranceNumber","Versichertennummer","Versichertennummer"),tq("topic","Czego dotyczy sprawa?","Чого стосується справа?","select",true,{options:[opt("membership","Ubezpieczenie / członkostwo","Страхування / членство"),opt("documents","Dokument / zaświadczenie","Документ / довідка"),opt("contribution","Składki","Внески"),opt("change","Zmiana danych","Зміна даних")]}),tq("details","Szczegóły sprawy","Деталі справи","textarea")
  ],build:a=>({subject:"Anfrage zu meiner Krankenversicherung",recipient:"Krankenkasse",body:nl(`ich wende mich an Sie bezüglich meiner Krankenversicherung.\n\nVersichertennummer: ${a.insuranceNumber}\n\nThema: ${a.topic}\n\nMein Anliegen:\n${a.details}\n\nBitte teilen Sie mir mit, wie ich in dieser Angelegenheit weiter vorgehen soll und ob weitere Unterlagen erforderlich sind.`),translation:`Zwracam się do Krankenkasse w sprawie ubezpieczenia. Versichertennummer: ${a.insuranceNumber}. Temat: ${a.topic}. Szczegóły: ${a.details}. Proszę o informację, co powinienem/powinnam zrobić dalej.`})},

  sick:{recipient:"Arbeitgeber",subject:"Mitteilung über meine Arbeitsunfähigkeit",questions:[
    tq("firstDay","Pierwszy dzień niezdolności do pracy","Перший день непрацездатності","date"),tq("expectedEnd","Przewidywany koniec (opcjonalnie)","Очікуваний кінець (необов’язково)","date",false),tq("certificate","Czy posiadasz zaświadczenie / eAU?","Чи маєте довідку / eAU?","select",true,{options:[opt("yes","Tak","Так"),opt("no","Nie","Ні")]} )
  ],build:a=>({subject:"Mitteilung über meine Arbeitsunfähigkeit",recipient:"Arbeitgeber",body:nl(`hiermit teile ich Ihnen mit, dass ich seit dem ${fd(a.firstDay)} arbeitsunfähig bin.${a.expectedEnd?` Nach aktuellem Stand wird die Arbeitsunfähigkeit voraussichtlich bis zum ${fd(a.expectedEnd)} dauern.`:""}\n\nEine Arbeitsunfähigkeitsbescheinigung / eAU liegt vor: ${a.certificate==="yes"?"ja":"nein"}.\n\nBitte berücksichtigen Sie meine Arbeitsunfähigkeit entsprechend.`),translation:`Informuję pracodawcę, że od ${fd(a.firstDay)} jestem niezdolny/a do pracy.${a.expectedEnd?` Według obecnej wiedzy niezdolność potrwa do ${fd(a.expectedEnd)}.`:""} Zaświadczenie/eAU: ${a.certificate==="yes"?"tak":"nie"}.`})},

  employer:{recipient:"Arbeitgeber",subject:"Bitte um Ausstellung eines Dokuments / einer Bescheinigung",questions:[
    tq("request","Czego potrzebujesz od pracodawcy?","Що вам потрібно від роботодавця?","select",true,{options:[opt("employment","Zaświadczenie o zatrudnieniu","Довідка з місця роботи"),opt("salary","Dokument dotyczący wynagrodzenia","Документ про зарплату"),opt("workCertificate","Arbeitszeugnis","Arbeitszeugnis"),opt("other","Inny dokument","Інший документ")]}),tq("details","Jakie dokładnie informacje mają się znaleźć?","Яка саме інформація має бути зазначена?","textarea")
  ],build:a=>({subject:"Bitte um Ausstellung eines Dokuments / einer Bescheinigung",recipient:"Arbeitgeber",body:nl(`ich möchte Sie höflich um folgende Unterlage bitten: ${a.request}.\n\nGewünschte Angaben / Zweck:\n${a.details}\n\nBitte teilen Sie mir mit, wann ich das Dokument erhalten kann. Vielen Dank für Ihre Unterstützung.`),translation:`Proszę pracodawcę o: ${a.request}. Dokument powinien zawierać: ${a.details}. Proszę o informację, kiedy mogę go otrzymać.`})},

  absence:{recipient:"Arbeitgeber",subject:"Erklärung meiner Abwesenheit",questions:[
    tq("date","Data nieobecności","Дата відсутності","date"),tq("reason","Powód nieobecności","Причина відсутності"),tq("duration","Czy nieobecność trwała dłużej niż jeden dzień?","Чи тривала відсутність більше одного дня?","select",true,{options:[opt("no","Nie","Ні"),opt("yes","Tak","Так")]} )
  ],build:a=>({subject:"Erklärung meiner Abwesenheit",recipient:"Arbeitgeber",body:nl(`hiermit erkläre ich meine Abwesenheit am ${fd(a.date)}.\n\nGrund der Abwesenheit: ${a.reason}\n\nDie Abwesenheit dauerte ${a.duration==="yes"?"über einen Tag":"nur an diesem Tag"}.\n\nIch bitte um Berücksichtigung dieser Information und entschuldige mich für die entstandenen Unannehmlichkeiten.`),translation:`Wyjaśniam nieobecność w dniu ${fd(a.date)}. Powód: ${a.reason}. Nieobecność trwała ${a.duration==="yes"?"dłużej niż jeden dzień":"tylko tego dnia"}. Proszę o uwzględnienie tej informacji.`})},

  rentTermination:{recipient:"Vermieter / Hausverwaltung",subject:"Kündigung des Mietvertrags",questions:[
    tq("tenantAddress","Adres wynajmowanego mieszkania","Адреса орендованого житла"),tq("desiredEnd","Żądana data zakończenia umowy (opcjonalnie)","Бажана дата завершення договору (необов’язково)","date",false),tq("contractReference","Numer umowy (opcjonalnie)","Номер договору (необов’язково)","text",false)
  ],build:a=>({subject:"Kündigung des Mietvertrags",recipient:"Vermieter / Hausverwaltung",body:nl(`hiermit kündige ich den Mietvertrag für die Wohnung ${a.tenantAddress} fristgerecht zum nächstmöglichen Zeitpunkt.${a.desiredEnd?` Sofern vertraglich möglich, bitte ich um Beendigung des Mietverhältnisses zum ${fd(a.desiredEnd)}.`:""}${a.contractReference?`\n\nMietvertragsnummer: ${a.contractReference}`:""}\n\nBitte bestätigen Sie mir den Eingang dieser Kündigung und den Beendigungstermin schriftlich.`),translation:`Wypowiadam umowę najmu mieszkania przy ${a.tenantAddress} w najbliższym możliwym terminie.${a.desiredEnd?` Jeśli jest to zgodne z umową, proszę o zakończenie najmu ${fd(a.desiredEnd)}.`:""}${a.contractReference?` Numer umowy: ${a.contractReference}.`:""} Proszę o pisemne potwierdzenie otrzymania wypowiedzenia i daty zakończenia.`})},

  rentIssue:{recipient:"Vermieter / Hausverwaltung",subject:"Meldung eines Mangels in der Wohnung",questions:[
    tq("address","Adres mieszkania","Адреса житла"),tq("issue","Rodzaj problemu","Тип проблеми","select",true,{options:[opt("heating","Ogrzewanie","Опалення"),opt("water","Woda / przeciek","Вода / протікання"),opt("mold","Wilgoć / pleśń","Волога / пліснява"),opt("electric","Prąd / instalacja","Електрика / інсталяція"),opt("other","Inny problem","Інша проблема")]}),tq("since","Od kiedy występuje problem?","Відколи існує проблема?","date"),tq("description","Krótki opis problemu","Короткий опис проблеми","textarea")
  ],build:a=>({subject:"Meldung eines Mangels in der Wohnung",recipient:"Vermieter / Hausverwaltung",body:nl(`hiermit möchte ich einen Mangel in meiner Wohnung in ${a.address} melden.\n\nArt des Problems: ${a.issue}\n\nDer Mangel besteht seit dem ${fd(a.since)}.\n\nBeschreibung:\n${a.description}\n\nIch bitte Sie, den Mangel zu prüfen und mir mitzuteilen, wann die Behebung erfolgen kann.`),translation:`Zgłaszam problem w mieszkaniu przy ${a.address}. Rodzaj problemu: ${a.issue}. Problem występuje od ${fd(a.since)}. Opis: ${a.description}. Proszę o sprawdzenie i informację, kiedy problem może zostać usunięty.`})},

  carRegistration:{recipient:"Zulassungsstelle",subject:"Anfrage zur Fahrzeugzulassung",questions:[
    tq("matter","Rodzaj sprawy","Тип справи","select",true,{options:[opt("new","Pierwsza rejestracja / rejestracja pojazdu","Перша реєстрація / реєстрація"),opt("owner","Zmiana właściciela","Зміна власника"),opt("address","Zmiana adresu właściciela","Зміна адреси власника"),opt("documents","Dokumenty do rejestracji","Документи для реєстрації")]}),tq("makeModel","Marka i model","Марка і модель"),tq("plate","Numer rejestracyjny (jeśli jest)","Номер реєстрації (якщо є)","text",false),tq("vin","VIN (opcjonalnie)","VIN (необов’язково)","text",false)
  ],build:a=>({subject:"Anfrage zur Fahrzeugzulassung",recipient:"Zulassungsstelle",body:nl(`ich wende mich an Sie bezüglich der Fahrzeugzulassung.\n\nAnliegen: ${a.matter}\n\nFahrzeug: ${a.makeModel}${a.plate?`\nKennzeichen: ${a.plate}`:""}${a.vin?`\nFIN/VIN: ${a.vin}`:""}\n\nBitte teilen Sie mir mit, welche Unterlagen für meinen konkreten Vorgang benötigt werden und ob ein Termin erforderlich ist.`),translation:`Zwracam się do Zulassungsstelle w sprawie: ${a.matter}. Samochód: ${a.makeModel}.${a.plate?` Rejestracja: ${a.plate}.`:""}${a.vin?` VIN: ${a.vin}.`:""} Proszę o informację, jakie dokumenty są potrzebne i czy konieczny jest termin.`})},

  license:{recipient:"Führerscheinstelle",subject:"Anfrage zu meinem Führerschein",questions:[
    tq("matter","Rodzaj sprawy","Тип справи","select",true,{options:[opt("exchange","Wymiana prawa jazdy","Обмін посвідчення водія"),opt("recognition","Uznanie / kwestia zagranicznego prawa jazdy","Визнання / питання іноземного посвідчення"),opt("documents","Wymagane dokumenty","Необхідні документи"),opt("appointment","Termin","Термін")]}),tq("licenseCountry","Kraj wydania prawa jazdy (opcjonalnie)","Країна видачі посвідчення (необов’язково)","text",false),tq("details","Dane sprawy","Дані справи","textarea")
  ],build:a=>({subject:"Anfrage zu meinem Führerschein",recipient:"Führerscheinstelle",body:nl(`ich wende mich an Sie bezüglich meines Führerscheins.\n\nAnliegen: ${a.matter}${a.licenseCountry?`\nAusstellungsland: ${a.licenseCountry}`:""}\n\nWeitere Angaben:\n${a.details}\n\nBitte teilen Sie mir mit, welche Unterlagen erforderlich sind und wie ich weiter vorgehen soll.`),translation:`Zwracam się do Führerscheinstelle w sprawie: ${a.matter}.${a.licenseCountry?` Kraj wydania: ${a.licenseCountry}.`:""} Szczegóły: ${a.details}. Proszę o informację o wymaganych dokumentach i dalszych krokach.`})},

  pension:{recipient:"Deutsche Rentenversicherung",subject:"Anfrage zu meinem Versicherungskonto / Rentenangelegenheit",questions:[
    tq("insuranceNumber","Versicherungsnummer (opcjonalnie)","Versicherungsnummer (необов’язково)","text",false),tq("matter","Rodzaj sprawy","Тип справи","select",true,{options:[opt("account","Ubezpieczenie / przebieg konta","Страхування / страховий рахунок"),opt("documents","Dokumenty / zaświadczenie","Документи / довідка"),opt("pension","Emerytura / świadczenie","Пенсія / виплата"),opt("address","Zmiana adresu / danych","Зміна адреси / даних")]}),tq("details","Czego dokładnie potrzebujesz?","Що саме вам потрібно?","textarea")
  ],build:a=>({subject:"Anfrage zu meinem Versicherungskonto / Rentenangelegenheit",recipient:"Deutsche Rentenversicherung",body:nl(`ich wende mich an Sie bezüglich meiner Rentenversicherung.\n\nAnliegen: ${a.matter}${a.insuranceNumber?`\nVersicherungsnummer: ${a.insuranceNumber}`:""}\n\nMein Anliegen im Detail:\n${a.details}\n\nBitte teilen Sie mir mit, welche Unterlagen oder weiteren Schritte erforderlich sind.`),translation:`Zwracam się do Deutsche Rentenversicherung. Sprawa: ${a.matter}.${a.insuranceNumber?` Numer ubezpieczenia: ${a.insuranceNumber}.`:""} Potrzebuję: ${a.details}. Proszę o informację o wymaganych dokumentach lub dalszych krokach.`})},

  contribution:{recipient:"ARD ZDF Deutschlandradio Beitragsservice",subject:"Anfrage zu meinem Rundfunkbeitrag",questions:[
    tq("contributionNumber","Beitragsnummer (jeśli posiadasz)","Beitragsnummer (якщо є)","text",false),tq("matter","Rodzaj sprawy","Тип справи","select",true,{options:[opt("address","Zmiana adresu","Зміна адреси"),opt("payment","Płatność / zaległość","Платіж / заборгованість"),opt("exemption","Zwolnienie / Befreiung","Звільнення / Befreiung"),opt("household","Zmiana sytuacji mieszkaniowej","Зміна житлової ситуації")]}),tq("details","Dane sprawy","Дані справи","textarea")
  ],build:a=>({subject:"Anfrage zu meinem Rundfunkbeitrag",recipient:"ARD ZDF Deutschlandradio Beitragsservice",body:nl(`ich wende mich an Sie bezüglich meines Rundfunkbeitrags.\n\nAnliegen: ${a.matter}${a.contributionNumber?`\nBeitragsnummer: ${a.contributionNumber}`:""}\n\nAngaben:\n${a.details}\n\nBitte prüfen Sie meinen Vorgang und teilen Sie mir schriftlich mit, wie ich weiter vorgehen soll.`),translation:`Zwracam się do Beitragsservice w sprawie: ${a.matter}.${a.contributionNumber?` Beitragsnummer: ${a.contributionNumber}.`:""} Szczegóły: ${a.details}. Proszę o sprawdzenie sprawy i informację, co należy zrobić dalej.`})},

  other:{recipient:"",subject:"",questions:[
    tq("recipient","Adresat / urząd","Одержувач / установа"),tq("purpose","Cel pisma","Мета листа","textarea"),tq("action","Czego oczekujesz od odbiorcy?","Чого ви очікуєте від одержувача?","textarea")
  ],build:a=>({subject:"Anfrage",recipient:a.recipient,body:nl(`hiermit wende ich mich mit folgendem Anliegen an Sie:\n\n${a.purpose}\n\nIch bitte Sie um folgende Rückmeldung bzw. Handlung:\n${a.action}\n\nVielen Dank für Ihre Rückmeldung.`),translation:`Zwracam się w sprawie: ${a.purpose}. Oczekuję od odbiorcy: ${a.action}.`})}
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
document.querySelectorAll("[data-template]").forEach(btn=>btn.addEventListener("click",()=>{
  if(btn.dataset.template==="other"){
    show("describe");
    $("caseText")?.focus();
    return;
  }
  openTemplateFlow(btn.dataset.template);
}));

// The smart-question Continue button handles both free-form analysis and template forms.
const oldSmartContinue=$("smartContinue");
if(oldSmartContinue){
  oldSmartContinue.addEventListener("click",()=>{
    const answers=collectSmartAnswers();
    if(!answers)return;
    if(pendingAnalysis?.templateKey){
      const draft=buildTemplateDraft(pendingAnalysis.templateKey,answers);
      if(draft){
        fillResult(draft.subject,draft.body,draft.translation,answers.recipient||draft.recipient||pendingAnalysis.recipient);
        prepareEditor(draft.subject,draft.body,answers.senderName||"",answers.recipient||draft.recipient||pendingAnalysis.recipient,"",{street:answers.senderStreet||"",city:answers.senderCity||"",recipientStreet:answers.recipientStreet||"",recipientCity:answers.recipientCity||"",date:answers.letterDate||formatDateForInput()});
      }
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

$("printLetter")?.addEventListener("click",()=>window.print());

$("saveText")?.addEventListener("click",()=>{
  saveCurrentLetter();
  try{localStorage.setItem("brieﬂa:lastLetter",$("letterText").textContent)}catch(e){}
});

$("goTemplates")?.addEventListener("click",()=>show("templates"));

renderSavedLetters();


/* BRIEFLA Advisor — conversational assistant. Uses the secure Vercel backend when configured. */
let advisorHistory=[];
let advisorAttachment=null;
let advisorAttachmentOcr="";
let advisorOcrPromise=null;

function advisorEndpoint(){
  return window.BRIEFLA_API_URL || BRIEFLA_AI_ENDPOINT || "";
}
function advisorAddMessage(role,text){
  const box=$("advisorMessages"); if(!box)return;
  const row=document.createElement("div"); row.className=`advisor-msg ${role}`;
  const bubble=document.createElement("div"); bubble.className="advisor-bubble"; bubble.textContent=text;
  row.appendChild(bubble); box.appendChild(row); box.scrollTop=box.scrollHeight;
}
function initAdvisorChat(){
  const box=$("advisorMessages"); if(!box)return;
  if(!advisorHistory.length){
    const greeting=language==="uk"?"Привіт! Я консультант BRIEFLA. Опишіть свою справу українською або додайте фото чи PDF документа. Я допоможу зрозуміти, що потрібно зробити.":"Cześć! Jestem Doradcą BRIEFLA. Opisz swoją sprawę po polsku albo dodaj zdjęcie/PDF dokumentu. Pomogę Ci zrozumieć, czego dotyczy sprawa i co możesz zrobić dalej.";
    advisorHistory=[{role:"assistant",content:greeting}]; box.innerHTML=""; advisorAddMessage("assistant",greeting);
  }
}
function setAdvisorAttachment(file){
  advisorAttachment=file; const box=$("advisorAttachment"); if(!box)return;
  box.hidden=false; box.innerHTML=`<span>📎 ${escapeHtml(file.name)}</span><button type="button" id="advisorRemoveFile">Usuń</button>`;
  $("advisorRemoveFile")?.addEventListener("click",()=>{advisorAttachment=null;advisorAttachmentOcr="";box.hidden=true;box.innerHTML="";});
}
async function advisorPrepareAttachment(file){
  if(!file)return {dataUrl:null,ocrText:""};
  try{
    if(file.type.startsWith("image/")){
      const dataUrl=await fileToDataUrl(file);
      advisorAttachmentOcr=await analyzeAttachment(file);
      return {dataUrl,ocrText:advisorAttachmentOcr};
    }
    advisorAttachmentOcr=await analyzeAttachment(file);
    return {dataUrl:null,ocrText:advisorAttachmentOcr};
  }catch(e){ return {dataUrl:null,ocrText:""}; }
}
async function sendAdvisorMessage(){
  const input=$("advisorInput"); if(!input)return;
  const text=input.value.trim(); if(!text && !advisorAttachment)return;
  initAdvisorChat();
  const shown=text || (language==="uk"?"Додаю документ для аналізу.":"Dodaję dokument do analizy.");
  advisorAddMessage("user",shown); advisorHistory.push({role:"user",content:shown}); input.value="";
  const send=$("advisorSend"); if(send){send.disabled=true;send.textContent=language==="uk"?"Аналіз…":"Analizuję…";}
  try{
    let attachmentDataUrl=null,ocrText="";
    if(advisorAttachment){ const a=await advisorPrepareAttachment(advisorAttachment); attachmentDataUrl=a.dataUrl;ocrText=a.ocrText; }
    const transcript=advisorHistory.map(m=>`${m.role==="user"?"Użytkownik":"Doradca"}: ${m.content}`).join("\n\n");
    const endpoint=advisorEndpoint();
    if(!endpoint){
      const fallback=language==="uk"?"Я отримав ваше повідомлення. Щоб надати повний аналіз документа та підготувати відповідь, спочатку потрібно підключити безпечний сервер BRIEFLA AI.":"Otrzymałem Twoją wiadomość. Aby wykonać pełną analizę dokumentu i przygotować odpowiedź, trzeba najpierw podłączyć bezpieczny serwer BRIEFLA AI.";
      advisorAddMessage("assistant",fallback); advisorHistory.push({role:"assistant",content:fallback}); return;
    }
    const res=await fetch(endpoint.replace(/\/$/,"")+"/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"chat",typed:transcript,ocrText,attachmentDataUrl,language})});
    if(!res.ok)throw new Error("HTTP "+res.status);
    const data=await res.json();
    const reply=data.chatReply || data.summary || (data.draftGerman?`${data.draftGerman}\n\n${data.translation||""}`:"");
    if(reply){advisorAddMessage("assistant",reply);advisorHistory.push({role:"assistant",content:reply});}
    if(data.questions?.length){
      const q=data.questions.map((q,i)=>`${i+1}. ${language==="uk"?q.labelUk:q.labelPl}`).join("\n");
      advisorAddMessage("assistant",language==="uk"?`Мені ще потрібна така інформація:\n${q}`:`Potrzebuję jeszcze kilku informacji:\n${q}`);
    }
    if(data.draftGerman){
      const btn=document.createElement("button"); btn.className="advisor-result-btn"; btn.textContent=language==="uk"?"Otwórz gotowy лист":"Otwórz gotowe pismo";
      btn.addEventListener("click",()=>{fillResult(data.subject||"Anfrage",data.draftGerman,data.translation||"",data.recipient||"");});
      $("advisorMessages")?.appendChild(btn);
    }
  }catch(e){
    const err=language==="uk"?"Не вдалося зараз зв’язатися з консультантом. Перевірте підключення та спробуйте ще раз.":"Nie udało się teraz połączyć z Doradcą. Sprawdź połączenie i spróbuj ponownie.";
    advisorAddMessage("assistant",err); advisorHistory.push({role:"assistant",content:err});
  }finally{if(send){send.disabled=false;send.innerHTML=language==="uk"?"Надіслати <span>→</span>":"Wyślij <span>→</span>";}}
}
$("advisorAttach")?.addEventListener("click",()=>$("advisorFileInput")?.click());
$("advisorFileInput")?.addEventListener("change",e=>{const f=e.target.files?.[0];if(f)setAdvisorAttachment(f);});
$("advisorSend")?.addEventListener("click",sendAdvisorMessage);
$("advisorInput")?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAdvisorMessage();}});

/* BRIEFLA language layer: Polish / Ukrainian UI. German letter content stays German. */
const LANG_KEY="brieﬂa:language";
let language="pl";

const uiText={
  pl:{
    navStart:"Start",navCategories:"Kategorie",navAdvisor:"Zapytaj Doradcę",navLetters:"Moje pisma",navTemplates:"Szablony",navProfile:"Profil",backToMenu:"Menu główne",settings:"Ustawienia",help:"Pomoc / FAQ",
    heroTitle:"Twoje pisma po niemiecku.<br>Prosto. Szybko. Bez stresu.",benefit1:"E-maile i listy do urzędów",benefit2:"Gotowe szablony",benefit3:"Tłumaczenia i wyjaśnienia",benefit4:"Krok po kroku",startNow:"Zacznij teraz <span>→</span>",
    advisorTitle:"Zapytaj Doradcę",advisorText:"Nie wiesz, co oznacza pismo albo co masz zrobić? Dodaj zdjęcie, PDF lub opisz swoją sprawę.",feature1Title:"Wybierz kategorię",feature1Text:"Znajdź odpowiedni temat Twojej sprawy.",feature2Title:"Opisz swoją sprawę",feature2Text:"Napisz po polsku, co chcesz przekazać.",feature3Title:"Otrzymaj gotowe pismo",feature3Text:"Pobierz, skopiuj lub wyślij bezpośrednio.",
    smartStep:"KROK 2A",smartTitle:"Doprecyzuj swoją sprawę",smartIntroTitle:"Potrzebuję jeszcze kilku informacji",smartIntroText:"Dzięki temu pismo będzie konkretne i nie będziemy dopisywać informacji, których nie podałeś.",smartContinue:"Przygotuj pismo <span>→</span>",smartSecurity:"Wpisuj tylko dane potrzebne do tej sprawy. Przed wysłaniem zawsze możesz wszystko sprawdzić i poprawić.",step1:"KROK 1",chooseCategory:"Wybierz kategorię",step2:"KROK 2",describeCase:"Opisz swoją sprawę",step3:"KROK 3",letterReady:"Twoje pismo jest gotowe!",
    describeIntro:"Napisz po polsku, co chcesz przekazać.<br>Możesz wpisać to własnymi słowami.",addFile:"▧ &nbsp; Dodaj plik <small>(np. zdjęcie pisma)</small>",next:"Dalej <span>→</span>",
    editorTitle:"Dostosuj pismo do siebie",editorSub:"Uzupełnij dane i zmień treść przed wysłaniem.",editing:"EDYCJA",senderName:"Imię i nazwisko",recipient:"Odbiorca / urząd",street:"Ulica i numer",city:"PLZ i miejscowość",recipientAddress:"Adres odbiorcy",date:"Data",subjectLabel:"Temat",bodyLabel:"Treść pisma",editorHint:"Możesz zmienić każde pole. Podgląd poniżej aktualizuje się automatycznie.",emailTab:"E-mail",letterTab:"List (DIN 5008)",translationLabel:"🇵🇱 &nbsp; Tłumaczenie na polski",copy:"▣ &nbsp; Kopiuj",translationButton:"PL &nbsp; Tłumaczenie",saveLetter:"⇩ &nbsp; Zapisz pismo",aiNote:"BRIEFLA przygotowuje pismo na podstawie Twojego opisu. Wersja AI analizuje sens wypowiedzi, a nie tylko podmienia słowa.",
    savedLettersSub:"Twoje zapisane pisma",lettersIntro:"Tu znajdziesz pisma, które wcześniej przygotowałeś i zapisałeś.",createFromTemplate:"＋ &nbsp; Utwórz z szablonu",templatesSub:"Gotowe pisma do edycji",searchTemplate:"⌕  Szukaj szablonu...",sectionOffices:"Urzędy i sprawy urzędowe",sectionMoney:"Jobcenter i pieniądze",sectionWorkHealth:"Praca i zdrowie",sectionHomeCar:"Mieszkanie i samochód",sectionOther:"Pozostałe",
    cat_office:"Urząd / Amt",cat_work:"Praca / Arbeitgeber",cat_money:"Pieniądze",cat_housing:"Mieszkanie",cat_health:"Zdrowie",cat_car:"Samochód",cat_reply:"Odpowiedź na otrzymane pismo",cat_otherCase:"Zupełnie inna sprawa",
    catOfficeDesc:"np. Bürgeramt, Ausländerbehörde",catWorkDesc:"np. umowa, zaświadczenia",catMoneyDesc:"np. Finanzamt, Jobcenter, Kindergeld",catHousingDesc:"np. wynajem, wypowiedzenie",catHealthDesc:"np. Krankenkasse",catCarDesc:"np. Führerschein, Zulassung",catReplyDesc:"np. decyzja, wezwanie",catOtherDesc:"Opisz po prostu, o co chodzi",
    senderOptional:"Twoje imię i nazwisko (opcjonalnie)",recipientOptional:"Odbiorca / urząd (opcjonalnie)",casePlaceholder:"Np. Dostałem pismo z Jobcenter i nie wiem, czego ode mnie chcą. Mogę dodać zdjęcie pisma.",
    freePlan:"Plan: Darmowy",pro:"Pro",threeLetters:"✓ &nbsp; 3 pisma miesięcznie",basicTemplates:"✓ &nbsp; Podstawowe szablony",translationPolish:"✓ &nbsp; Tłumaczenie na polski",goPro:"♛ &nbsp; Przejdź na wersję Pro",savedTemplates:"♡ &nbsp; Zapisane szablony <i>›</i>",profileLetters:"▤ &nbsp; Moje pisma <i>›</i>",profileSettings:"⚙ &nbsp; Ustawienia <i>›</i>",profileHelp:"? &nbsp; Pomoc / FAQ <i>›</i>",contact:"✉ &nbsp; Kontakt <i>›</i>",about:"ⓘ &nbsp; O aplikacji",
    translationSummary:"🇵🇱 &nbsp; Tłumaczenie na polski",savedEmpty:"<b>Nie masz jeszcze zapisanych pism.</b><br>Przygotuj pismo, kliknij „Zapisz pismo” i znajdziesz je tutaj.",open:"Otwórz",remove:"Usuń",copied:"✓  Skopiowano",saved:"✓  Zapisano",copyError:"Nie udało się skopiować tekstu.",genericTranslation:"Przedstawiam swoje Anliegen po niemiecku w jasnej, formalnej formie. Treść została przygotowana na podstawie Twojego opisu."
  },
  uk:{
    navStart:"Головна",navCategories:"Категорії",navAdvisor:"Запитати консультанта",navLetters:"Мої листи",navTemplates:"Шаблони",navProfile:"Профіль",backToMenu:"Головне меню",settings:"Налаштування",help:"Допомога / FAQ",
    heroTitle:"Ваші листи німецькою.<br>Просто. Швидко. Без стресу.",benefit1:"Електронні листи та листи до установ",benefit2:"Готові шаблони",benefit3:"Переклади та пояснення",benefit4:"Крок за кроком",startNow:"Почати зараз <span>→</span>",
    advisorTitle:"Запитати консультанта",advisorText:"Не знаєте, що означає лист або що робити? Додайте фото, PDF чи опишіть свою справу.",feature1Title:"Оберіть категорію",feature1Text:"Знайдіть відповідну тему вашої справи.",feature2Title:"Опишіть свою справу",feature2Text:"Напишіть українською, що ви хочете повідомити.",feature3Title:"Отримайте готовий лист",feature3Text:"Завантажте, скопіюйте або надішліть його.",
    smartStep:"КРОК 2A",smartTitle:"Уточніть вашу справу",smartIntroTitle:"Потрібно ще кілька відомостей",smartIntroText:"Так лист буде конкретним, і ми не будемо додавати інформацію, якої ви не надавали.",smartContinue:"Підготувати лист <span>→</span>",smartSecurity:"Вводьте лише дані, потрібні для цієї справи. Перед надсиланням ви завжди можете все перевірити та виправити.",step1:"КРОК 1",chooseCategory:"Оберіть категорію",step2:"КРОК 2",describeCase:"Опишіть свою справу",step3:"КРОК 3",letterReady:"Ваш лист готовий!",
    describeIntro:"Напишіть українською, що ви хочете повідомити.<br>Можете описати все своїми словами.",addFile:"▧ &nbsp; Додати файл <small>(наприклад, фото листа)</small>",next:"Далі <span>→</span>",
    editorTitle:"Налаштуйте лист під себе",editorSub:"Заповніть дані та змініть текст перед надсиланням.",editing:"РЕДАГУВАННЯ",senderName:"Ім’я та прізвище",recipient:"Одержувач / установа",street:"Вулиця та номер",city:"Індекс і місто",recipientAddress:"Адреса одержувача",date:"Дата",subjectLabel:"Тема",bodyLabel:"Текст листа",editorHint:"Ви можете змінити будь-яке поле. Попередній перегляд оновлюється автоматично.",emailTab:"E-mail",letterTab:"Лист (DIN 5008)",translationLabel:"🇺🇦 &nbsp; Переклад українською",copy:"▣ &nbsp; Копіювати",translationButton:"UA &nbsp; Переклад",saveLetter:"⇩ &nbsp; Зберегти лист",aiNote:"BRIEFLA готує лист на основі вашого опису. Версія AI аналізує зміст, а не просто замінює слова.",
    savedLettersSub:"Ваші збережені листи",lettersIntro:"Тут ви знайдете листи, які раніше підготували та зберегли.",createFromTemplate:"＋ &nbsp; Створити з шаблону",templatesSub:"Готові листи для редагування",searchTemplate:"⌕  Пошук шаблону...",sectionOffices:"Установи та офіційні справи",sectionMoney:"Jobcenter і фінанси",sectionWorkHealth:"Робота та здоров’я",sectionHomeCar:"Житло та автомобіль",sectionOther:"Інше",
    cat_office:"Установа / Amt",cat_work:"Робота / Arbeitgeber",cat_money:"Гроші",cat_housing:"Житло",cat_health:"Здоров’я",cat_car:"Автомобіль",cat_reply:"Відповідь на отриманий лист",cat_otherCase:"Зовсім інша справа",
    catOfficeDesc:"наприклад Bürgeramt, Ausländerbehörde",catWorkDesc:"наприклад договір, довідки",catMoneyDesc:"наприклад Finanzamt, Jobcenter, Kindergeld",catHousingDesc:"наприклад оренда, розірвання договору",catHealthDesc:"наприклад Krankenkasse",catCarDesc:"наприклад Führerschein, Zulassung",catReplyDesc:"наприклад рішення, вимога",catOtherDesc:"Просто опишіть, у чому справа",
    senderOptional:"Ваше ім’я та прізвище (необов’язково)",recipientOptional:"Одержувач / установа (необов’язково)",casePlaceholder:"Напр. Я отримав листа з Jobcenter і не знаю, що від мене потрібно. Можу додати фото документа.",
    freePlan:"План: Безкоштовний",pro:"Pro",threeLetters:"✓ &nbsp; 3 листи на місяць",basicTemplates:"✓ &nbsp; Основні шаблони",translationPolish:"✓ &nbsp; Переклад українською",goPro:"♛ &nbsp; Перейти на версію Pro",savedTemplates:"♡ &nbsp; Збережені шаблони <i>›</i>",profileLetters:"▤ &nbsp; Мої листи <i>›</i>",profileSettings:"⚙ &nbsp; Налаштування <i>›</i>",profileHelp:"? &nbsp; Допомога / FAQ <i>›</i>",contact:"✉ &nbsp; Контакт <i>›</i>",about:"ⓘ &nbsp; Про застосунок",
    translationSummary:"🇺🇦 &nbsp; Переклад українською",savedEmpty:"<b>У вас ще немає збережених листів.</b><br>Підготуйте лист, натисніть «Зберегти лист» — і він з’явиться тут.",open:"Відкрити",remove:"Видалити",copied:"✓  Скопійовано",saved:"✓  Збережено",copyError:"Не вдалося скопіювати текст.",genericTranslation:"Нижче показано інформацію про підготовлений німецький лист. Повний переклад українською буде окремою функцією."
  }
};

const templateUi={
  pl:{
    address:["Zmiana adresu","Bürgeramt / urząd miasta"],registration:["Anmeldung / meldunek","Zameldowanie w Niemczech"],deregistration:["Abmeldung","Wymeldowanie"],auslander:["Ausländerbehörde","Termin, dokumenty, pobyt"],appointment:["Prośba o termin","Termin w urzędzie"],documents:["Brakujące dokumenty","Dosłanie załączników"],appeal:["Odwołanie od decyzji","Widerspruch"],requestDecision:["Prośba o ponowne rozpatrzenie","Sprawdzenie sprawy / decyzji"],jobcenter:["Jobcenter / Grundsicherung","Zgłoszenia i zmiany"],newJob:["Zgłoszenie nowej pracy","Nowe zatrudnienie"],incomeChange:["Zmiana dochodu","Jobcenter / urząd"],familykasse:["Familienkasse","Kindergeld i dokumenty"],kindergeld:["Wniosek o Kindergeld","Świadczenie na dziecko"],finanzamt:["Finanzamt","Podatki i zaświadczenia"],taxDocuments:["Dosłanie dokumentów podatkowych","Finanzamt"],healthInsurance:["Krankenkasse","Ubezpieczenie zdrowotne"],sick:["Zgłoszenie choroby","Krankmeldung"],employer:["Pracodawca / Arbeitgeber","Zaświadczenia i informacje"],absence:["Wyjaśnienie nieobecności","Praca / urząd"],rentTermination:["Wypowiedzenie umowy najmu","Mieszkanie"],rentIssue:["Problem z mieszkaniem","Vermieter / Hausverwaltung"],carRegistration:["Zulassungsstelle","Rejestracja samochodu"],license:["Führerscheinstelle","Prawo jazdy"],pension:["Deutsche Rentenversicherung","Emerytura i dokumenty"],contribution:["Beitragsservice","Rundfunkbeitrag"],other:["Nie wiem, jaki szablon wybrać","Dodaj opis lub zdjęcie pisma"]
  },
  uk:{
    address:["Зміна адреси","Bürgeramt / міська установа"],registration:["Anmeldung / реєстрація","Реєстрація місця проживання в Німеччині"],deregistration:["Abmeldung","Зняття з реєстрації"],auslander:["Ausländerbehörde","Документи, дозвіл на проживання, запис"],appointment:["Запит на термін","Термін у державній установі"],documents:["Відсутні документи","Надсилання додаткових документів"],appeal:["Оскарження рішення","Widerspruch"],requestDecision:["Запит на повторний розгляд","Повторна перевірка справи / рішення"],jobcenter:["Jobcenter / Grundsicherung","Повідомлення та зміни"],newJob:["Повідомлення про нову роботу","Нове працевлаштування"],incomeChange:["Зміна доходу","Jobcenter / установа"],familykasse:["Familienkasse","Kindergeld та документи"],kindergeld:["Заява на Kindergeld","Допомога на дитину"],finanzamt:["Finanzamt","Податки та довідки"],taxDocuments:["Надсилання податкових документів","Finanzamt"],healthInsurance:["Krankenkasse","Медичне страхування"],sick:["Повідомлення про хворобу","Krankmeldung"],employer:["Роботодавець / Arbeitgeber","Довідки та інформація"],absence:["Пояснення відсутності","Робота / установа"],rentTermination:["Розірвання договору оренди","Житло"],rentIssue:["Проблема з житлом","Vermieter / Hausverwaltung"],carRegistration:["Zulassungsstelle","Реєстрація автомобіля"],license:["Führerscheinstelle","Водійське посвідчення"],pension:["Deutsche Rentenversicherung","Пенсія та документи"],contribution:["Beitragsservice","Rundfunkbeitrag"],other:["Не знаю, який шаблон вибрати","Додайте опис або фото документа"]
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
    if(match && $("translation") && translationForKey.uk[match]) $("translation").textContent=translationForKey.uk[match];
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
  if(key){
    const translated=language==="uk"?translationForKey.uk[key]:translationForKey.pl[key];
    if(translated) box.textContent=translated;
  }
}
const previousApplyLanguage=applyLanguage;
applyLanguage=function(){previousApplyLanguage();updateCurrentTranslationLanguage();};

/* Re-apply the language after opening a saved letter. */
const previousOpenSavedLetter=openSavedLetter;
openSavedLetter=function(id){previousOpenSavedLetter(id);updateCurrentTranslationLanguage();};


/* Mobile bottom navigation uses four destinations; the advisor lives in the top bubble. */
function updateMobileNavLabels(){
  const labels=language==="uk"
    ? ["Головна","Категорії","Листи","Профіль"]
    : ["Start","Kategorie","Pisma","Profil"];
  document.querySelectorAll(".mobile-nav button").forEach((btn,i)=>{
    const label=btn.querySelector("span:last-child");
    if(label && labels[i]) label.textContent=labels[i];
  });
}
const applyLanguageWithMobileNav=applyLanguage;
applyLanguage=function(){
  applyLanguageWithMobileNav();
  updateMobileNavLabels();
};
updateMobileNavLabels();
