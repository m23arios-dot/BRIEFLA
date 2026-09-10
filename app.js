const $ = id => document.getElementById(id);

const recipientMap = {
  "urząd": "zuständige Behörde / Institution",
  "ubezpieczyciel": "Versicherung",
  "pracodawca": "Arbeitgeber",
  "wynajmujący": "Vermieter",
  "firma": "Unternehmen / Dienstleister",
  "inna": "zuständige Stelle"
};

function todayDE(){
  return new Intl.DateTimeFormat("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date());
}

function buildLetter(){
  const recipient = $("recipient").value;
  const subject = $("subject").value.trim();
  const details = $("details").value.trim();
  const tone = $("tone").value;

  if(!subject || !details){
    alert("Uzupełnij cel pisma i opis sytuacji.");
    return;
  }

  const greeting = tone === "formal" ? "Sehr geehrte Damen und Herren," : "Guten Tag,";
  const closing = tone === "firm"
    ? "Ich bitte um eine zeitnahe Klärung und eine schriftliche Rückmeldung."
    : "Ich bitte um eine Rückmeldung und danke Ihnen im Voraus.";

  const body =
`${greeting}

Betreff: ${subject}

ich wende mich an Sie bezüglich des oben genannten Anliegens.

${details}

Ich möchte die Angelegenheit gerne klären und bitte Sie daher um eine entsprechende Prüfung.

${closing}

Mit freundlichen Grüßen

[Vorname Nachname]`;

  $("letterRecipient").textContent = recipientMap[recipient];
  $("letterDate").textContent = todayDE();
  $("letterBody").textContent = body;
  $("emptyState").hidden = true;
  $("result").hidden = false;
  $("copyBtn").disabled = false;
}

$("generateBtn").addEventListener("click", buildLetter);

$("copyBtn").addEventListener("click", async ()=>{
  const text = $("letterBody").textContent;
  try{
    await navigator.clipboard.writeText(text);
    $("copyBtn").textContent = "Skopiowano ✓";
    setTimeout(()=>$("copyBtn").textContent="Kopiuj",1500);
  }catch{
    alert("Nie udało się skopiować tekstu.");
  }
});

$("resetBtn").addEventListener("click", ()=>{
  $("subject").value="";
  $("details").value="";
  $("result").hidden=true;
  $("emptyState").hidden=false;
  $("copyBtn").disabled=true;
  window.scrollTo({top:0,behavior:"smooth"});
});
