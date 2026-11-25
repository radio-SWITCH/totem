# Plakaty na totemie

Plakat pokazuje się na całym ekranie co jakiś czas (domyślnie 20 s plakatu, potem 40 s zwykłej strony).
Dotknięcie plakatu zamyka go do następnego cyklu. W nocy plakaty się nie pokazują.

## Jak dodać plakat

1. Wrzuć plik (JPG, PNG lub WebP) do tego folderu, np. `languages-day.jpg`.
   Najlepiej w pionie 9:16 (np. 1080×1920), wtedy wypełni cały ekran.
2. Dopisz wpis w `posters.json`:

```json
{
    "showSeconds": 20,
    "breakSeconds": 40,
    "posters": [
        { "file": "languages-day.jpg", "from": "2026-09-26", "to": "2026-09-26", "description": "Europejski Dzień Języków" }
    ]
}
```

3. `git add . && git commit -m "Add poster" && git push` — totem sam pobierze zmianę w ciągu ok. 5 minut.

## Pola wpisu

- `file` — nazwa pliku w tym folderze (wymagane)
- `from`, `to` — daty `RRRR-MM-DD`, `to` włącznie; bez nich plakat jest aktywny cały czas
- `seconds` — ile ten jeden plakat ma być na ekranie (zamiast `showSeconds`)
- `description` — tekst alternatywny dla czytników ekranu

Kilka aktywnych plakatów pokazuje się po kolei, jeden na cykl.

## Zdejmowanie plakatu

Usuń wpis z `posters.json` albo ustaw `to` na wczorajszą datę. Plik graficzny możesz zostawić w folderze.

## Podgląd przed commitem

Otwórz stronę z `?poster=nazwa.jpg` (plik z tego folderu), np. `index.html?poster=languages-day.jpg`.
Plakat pojawi się po sekundzie, bez względu na `posters.json` i daty.
