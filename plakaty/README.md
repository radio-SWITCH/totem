# Plakaty na totemie

Plakat pokazuje się na całym ekranie co jakiś czas (domyślnie 20 s plakatu, potem 40 s zwykłej strony).
Dotknięcie plakatu zamyka go do następnego cyklu. W nocy plakaty się nie pokazują.

## Jak dodać plakat

1. Wrzuć plik (JPG, PNG lub WebP) do tego folderu, np. `dzien-jezykow.jpg`.
   Najlepiej w pionie 9:16 (np. 1080×1920), wtedy wypełni cały ekran.
2. Dopisz wpis w `plakaty.json`:

```json
{
  "pokazuj_sekund": 20,
  "przerwa_sekund": 40,
  "plakaty": [
    { "plik": "dzien-jezykow.jpg", "od": "2026-09-26", "do": "2026-09-26", "opis": "Europejski Dzień Języków" }
  ]
}
```

3. `git add . && git commit -m "plakat" && git push` — totem sam pobierze zmianę w ciągu ok. 5 minut.

## Pola wpisu

- `plik` — nazwa pliku w tym folderze (wymagane)
- `od`, `do` — daty `RRRR-MM-DD`, `do` włącznie; bez nich plakat jest aktywny cały czas
- `sekund` — ile ten jeden plakat ma być na ekranie (zamiast `pokazuj_sekund`)
- `opis` — tekst alternatywny dla czytników ekranu

Kilka aktywnych plakatów pokazuje się po kolei, jeden na cykl.

## Zdejmowanie plakatu

Usuń wpis z `plakaty.json` albo ustaw `do` na wczorajszą datę. Plik graficzny możesz zostawić w repo.

## Podgląd przed commitem

Otwórz stronę z `?plakat=nazwa.jpg` (plik z tego folderu), np. `index.html?plakat=dzien-jezykow.jpg`.
Plakat pojawi się po sekundzie, bez względu na `plakaty.json` i daty.
