import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json({limit:"1mb"}));

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
const model = process.env.OPENAI_MODEL || "gpt-5.6-sol";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    recipient: {type:"string"},
    recipient_address: {type:"string"},
    subject: {type:"string"},
    body: {type:"string"},
    polish_translation: {type:"string"},
    sender_name: {type:"string"},
    date: {type:"string"},
    notes: {type:"string"}
  },
  required:["recipient","recipient_address","subject","body","polish_translation","sender_name","date","notes"]
};

const instructions = `
Jesteś BRIEFLA AI — asystentem dla Polaków mieszkających w Niemczech.
Twoim zadaniem jest zamienić opis użytkownika napisany po polsku na poprawne, naturalne i profesjonalne pismo po niemiecku.

NAJWAŻNIEJSZE:
1. Najpierw zrozum sens, cel, osoby, daty, kwoty i fakty. Nie tłumacz mechanicznie słowo w słowo.
2. Nie dopisuj faktów, których użytkownik nie podał.
3. Nie zmieniaj dat, kwot, nazw własnych ani numerów.
4. Jeśli czegoś brakuje do bezpiecznego przygotowania pisma, nie wymyślaj tego. Użyj neutralnej formy.
5. Niemiecki ma być naturalny dla Niemiec, bez polskich kalk językowych.
6. Pismo ma być rzeczowe, uprzejme i konkretne.
7. Dla urzędów stosuj formalny język, ale bez przesadnie prawniczego stylu.
8. Dla pracodawcy, wynajmującego lub firmy dobierz naturalny poziom formalności.
9. Zachowaj wszystkie istotne informacje z opisu.
10. W polskim tłumaczeniu wyjaśnij dokładnie, co pismo mówi po niemiecku.
11. Nie dodawaj podpisu, którego użytkownik nie podał. Jeśli brak nazwiska, użyj "Vorname Nachname".
12. Data ma być w formacie DD.MM.RRRR.
13. Body ma zawierać wyłącznie treść pisma, bez "Sehr geehrte Damen und Herren" i bez podpisu, bo interfejs dodaje te elementy osobno.
14. Jeżeli odbiorca jest znany (np. Jobcenter, Finanzamt, Krankenkasse), wpisz jego nazwę. Nie wymyślaj adresu.

Zwróć wyłącznie dane zgodne ze schematem JSON.
`;

app.get("/api/health", (_req,res)=>res.json({ok:true, model}));

app.post("/api/generate-letter", async (req,res)=>{
  try{
    const {category="", user_text="", sender_name="", recipient=""} = req.body || {};
    if(!String(user_text).trim()){
      return res.status(400).json({error:"Brak opisu sprawy."});
    }

    const input = `
Kategoria: ${category}
Odbiorca podany przez użytkownika: ${recipient}
Nadawca: ${sender_name}
Opis sprawy po polsku:
${user_text}
`;

    const response = await client.responses.create({
      model,
      store:false,
      instructions,
      input,
      text:{
        format:{
          type:"json_schema",
          name:"briefla_letter",
          strict:true,
          schema
        }
      }
    });

    const raw = response.output_text;
    const data = JSON.parse(raw);

    data.sender_name = sender_name || data.sender_name || "Vorname Nachname";
    data.date = new Intl.DateTimeFormat("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date());

    res.json(data);
  }catch(error){
    console.error(error);
    res.status(500).json({
      error:"Nie udało się przygotować pisma.",
      detail: process.env.NODE_ENV === "development" ? String(error?.message || error) : undefined
    });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port,()=>console.log(`BRIEFLA AI listening on http://localhost:${port}`));
