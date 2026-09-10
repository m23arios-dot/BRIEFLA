# BRIEFLA AI – następny etap

Obecny frontend nie udaje już tłumacza prostymi regułami. Po uruchomieniu backendu korzysta z `/api/generate-letter`.

## Uruchomienie backendu

1. Wejdź do folderu `server`.
2. Zainstaluj Node.js.
3. Uruchom:
   `npm install`
4. Skopiuj `.env.example` jako `.env`.
5. W `.env` wpisz `OPENAI_API_KEY=...`.
6. Uruchom:
   `npm start`

Frontend musi być uruchomiony przez serwer HTTP, a nie przez samo `file://`, żeby mógł połączyć się z API.

## Ważne

Klucz API znajduje się wyłącznie po stronie serwera. Nie wpisuj go do `app.js` ani do HTML.

BRIEFLA zwraca ustrukturyzowane dane: odbiorcę, temat, treść po niemiecku, tłumaczenie na polski i informacje pomocnicze. Dzięki temu dokument może być renderowany jako prawdziwe pismo, a nie jako zwykły blok tekstu.
