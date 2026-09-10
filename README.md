# BRIEFLA

Pierwsza wersja MVP aplikacji BRIEFLA.

## Co działa

- responsywny interfejs desktop/mobile
- formularz po polsku
- wybór odbiorcy pisma
- określenie celu
- opis sprawy własnymi słowami
- wybór tonu
- generowanie demonstracyjnego pisma po niemiecku
- kopiowanie gotowego tekstu
- PWA manifest

## Uruchomienie

To jest wersja bez backendu, więc można ją uruchomić na zwykłym serwerze WWW.

Wystarczy wgrać:
- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`

do katalogu publicznego serwera.

## Następny etap

Podłączymy prawdziwy backend AI. Formularz będzie wysyłał opis sprawy do bezpiecznego endpointu serwera, a serwer będzie zwracał gotowe pismo. Klucz API nie powinien być umieszczany w kodzie przeglądarki.

Potem dołożymy:
1. konto użytkownika
2. historię pism
3. zapis danych nadawcy
4. gotowe typy spraw dla niemieckich urzędów i instytucji
5. generowanie wersji bardziej formalnej / stanowczej
6. eksport PDF
7. wysyłanie e-maila
