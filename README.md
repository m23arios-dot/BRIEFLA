# BRIEFLA – Smart Assistant PL / UA

Frontend BRIEFLA z przebudowanym generatorem spraw.

## Co poprawiono
- generator nie wkleja już surowego opisu PL/UA do niemieckiego pisma;
- dla rozpoznanych spraw zadaje konkretne pytania uzupełniające;
- poprawiono obsługę dosyłania dokumentów;
- dodano bezpieczny mechanizm przygotowania pod prawdziwy backend AI;
- zachowano istniejący wygląd, PL/UA, szablony i „Moje pisma”.

## Ważne
To nadal jest etap bezpiecznego generatora lokalnego. Prawdziwe AI wymaga osobnego backendu z kluczem API przechowywanym jako sekret środowiskowy. Klucza API nie należy umieszczać w `app.js` ani w GitHub Pages.


## Załączniki
W kroku opisu sprawy można dodać zdjęcie lub PDF. BRIEFLA może lokalnie odczytać tekst z załącznika (OCR) i wykorzystać go do rozpoznania, czego dotyczy sprawa. Załącznik nie jest wysyłany do zewnętrznego serwera przez ten mechanizm.


V14: mobile/PWA navigation consistency fix. Five bottom-nav items are forced into one row; mobile advisor shortcut and language selector use a stable shared top layout; CSS/JS cache-busting updated to v14.
