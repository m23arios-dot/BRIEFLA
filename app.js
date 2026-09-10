let current="home", stack=[], category="";
const views=[...document.querySelectorAll(".view")];
function show(id,push=true){if(!document.getElementById(id))return;if(push&&current!==id)stack.push(current);current=id;views.forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===id));}
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
document.querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>show(stack.pop()||"home",false));
document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>{stack=[];show(b.dataset.nav,false)});
document.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{category=b.dataset.category;show("describe")});
const area=document.getElementById("caseText"),counter=document.getElementById("counter");
area?.addEventListener("input",()=>counter.textContent=`${area.value.length}/10000`);

const API_BASE_URL = window.BRIEFLA_API_URL || "";
const senderInput = document.getElementById("senderNameInput");
const recipientInput = document.getElementById("recipientInput");

function todayDE(){
  return new Intl.DateTimeFormat("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date());
}

function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function renderLetter(data){
  const sender = data.sender_name || senderInput?.value?.trim() || "Vorname Nachname";
  document.getElementById("subject").textContent = data.subject || "Anfrage";
  document.getElementById("docRecipient").textContent = data.recipient || recipientInput?.value?.trim() || "An die zuständige Stelle";
  document.getElementById("docDate").textContent = data.date || todayDE();
  document.getElementById("docAddress").textContent = data.recipient_address || "";
  document.getElementById("senderName").textContent = sender;

  const body = String(data.body || "").trim();
  document.getElementById("letterText").innerHTML = body
    .split(/\n\s*\n/)
    .map(p => `<p>${escapeHtml(p).replace(/\n/g,"<br>")}</p>`)
    .join("");

  document.getElementById("translation").textContent =
    data.polish_translation || "Brak tłumaczenia.";
  document.getElementById("aiNote").textContent =
    data.notes || "BRIEFLA przygotowała pismo na podstawie sensu Twojego opisu.";

  show("result");
}

async function generate(){
  const raw=(area.value||"").trim();
  if(!raw){
    area.focus();
    return;
  }

  const button = document.getElementById("generate");
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "BRIEFLA przygotowuje pismo…";

  const payload = {
    category,
    user_text: raw,
    sender_name: senderInput?.value?.trim() || "",
    recipient: recipientInput?.value?.trim() || "",
    language: "de",
    style: "natural, professional, clear",
    format: "official German letter / email"
  };

  try{
    const response = await fetch(`${API_BASE_URL}/api/generate-letter`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    if(!response.ok) throw new Error("API_ERROR");
    const data = await response.json();
    renderLetter(data);
  }catch(error){
    // Clear explanation instead of silently producing a bad fake translation.
    document.getElementById("subject").textContent = "AI nie jest jeszcze podłączone";
    document.getElementById("docRecipient").textContent = "BRIEFLA AI";
    document.getElementById("docDate").textContent = todayDE();
    document.getElementById("docAddress").textContent = "";
    document.getElementById("letterText").innerHTML =
      "<p>Ta wersja strony nie ma jeszcze połączenia z serwerem AI.</p><p>Po podłączeniu backendu BRIEFLA będzie analizować sens Twojej wiadomości po polsku i przygotowywać poprawne pismo po niemiecku.</p>";
    document.getElementById("translation").textContent = raw;
    document.getElementById("senderName").textContent = senderInput?.value?.trim() || "Vorname Nachname";
    document.getElementById("aiNote").textContent =
      "Brak połączenia z BRIEFLA AI. Nie używamy już udawanego tłumacza opartego na prostych regułach.";
    show("result");
  }finally{
    button.disabled = false;
    button.textContent = original;
  }
}

document.getElementById("generate")?.addEventListener("click",generate);

document.getElementById("copy")?.addEventListener("click",async()=>{
  const paper=document.getElementById("letterPaper");
  try{
    await navigator.clipboard.writeText(paper.innerText.trim());
    document.getElementById("copy").textContent="✓ Skopiowano";
  }catch(e){}
});

document.getElementById("copyPolish")?.addEventListener("click",async()=>{
  try{
    await navigator.clipboard.writeText(document.getElementById("translation").textContent);
    document.getElementById("copyPolish").textContent="✓ Skopiowano";
  }catch(e){}
});

document.getElementById("saveText")?.addEventListener("click",()=>{
  const text=document.getElementById("letterPaper").innerText.trim();
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="BRIEFLA-pismo.txt";
  a.click();
  URL.revokeObjectURL(url);
});

document.querySelectorAll(".tabs button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("letterPaper")?.classList.toggle("din",btn.dataset.format==="letter");
  });
});
