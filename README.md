# Totem informacyjny ZSI Kielce

Strona wyświetlana na totemie w Zespole Szkół Informatycznych w Kielcach: zegar i plan dnia, pogoda,
aktualności, kolejka utworów radiowęzła, quizy, ciekawostki z nauki i kosmosu, plakaty. Obok totemu
w repo jest quiz językowy na Europejski Dzień Języków (`quiz-edj/`). Całość to zwykłe pliki statyczne
(bez budowania), publikowane przez GitHub Pages.

## Struktura repo

```
totem/
├── index.html         układ strony totemu
├── style.css          style (zmienne --color-*, sekcje z banerami)
├── script.js          logika (blok CONFIG na górze, sekcje z banerami)
├── posters/           plakaty pokazywane na całym ekranie (posters.json + obrazy, patrz posters/README.md)
├── quiz-edj/          quiz „Jaki to język?” (index.html, style.css, script.js, audio/*.mp3)
├── .github/workflows/queue.yml   pobieranie kolejki radiowęzła (workflow „Update radio queue”)
└── README.md
```

## Uruchomienie lokalnie

Wystarczy dowolny serwer statyczny (otwarcie pliku z dysku nie zadziała, bo strona pobiera dane):

```
python3 -m http.server 8000
```

Totem: `http://localhost:8000/`, quiz: `http://localhost:8000/quiz-edj/`.

## Parametry adresu (podgląd i testy)

| Parametr | Efekt |
|---|---|
| `?totem` | układ pionowy 9:16 (1080×1920), jak na ekranie totemu |
| `?night` / `?day` | wymusza tryb nocny / dzienny, bez czekania na godziny |
| `?poster=nazwa.jpg` | pokazuje plakat z folderu `posters/` po sekundzie, bez względu na daty |

## Konfiguracja

Wszystko, co się zmienia (klucze API, adresy serwisów WordPress, lokalizacja, godziny trybu nocnego,
częstotliwość odświeżania każdego kafelka), jest w jednym miejscu: obiekt `CONFIG` na początku
`script.js`. Ustawienia quizu są w `CONFIG` na początku `quiz-edj/script.js`.

Uwaga o kluczach: repo jest publiczne, a klucz w kodzie front-endu widzi każdy. Trzymamy tam wyłącznie
klucze darmowe, a najlepiej takie, które da się ograniczyć do domeny. Jeśli któryś klucz był kiedyś
nadużyty, wygeneruj nowy u dostawcy i wpisz go w `CONFIG`. To samo dotyczy PIN-u organizatora quizu
(`adminPin`): jest widoczny w kodzie, więc chroni tylko przed przypadkowym wejściem.

## Konwencje (obowiązują w całym repo)

**Język.** Nazwy techniczne (pliki, foldery, funkcje, zmienne, klasy, id, klucze JSON) po angielsku.
Komentarze i teksty widoczne dla użytkownika po polsku.

| Co | Zasada | Przykłady |
|---|---|---|
| Pliki i foldery | małe litery, kebab-case, bez spacji | `quiz-edj/`, `posters.json` |
| Funkcje i zmienne JS | camelCase, funkcja = czasownik + rzecz | `loadNews`, `updateClock`, `showQuizQuestion` |
| Stałe JS | UPPER_SNAKE_CASE | `QUIZ_LENGTH`, `LESSON_SCHEDULE`, `NAMEDAYS` |
| Ustawienia | tylko w obiekcie `CONFIG` | `CONFIG.refreshMs.weather` |
| Klucze JSON | camelCase | `showSeconds`, `estimatedPlayAt` |
| `id` w HTML | camelCase, przedrostek = nazwa panelu | `spaceImage`, `quizOptions`, `playButton` |
| Klasy CSS | kebab-case; modyfikator przez `--`; stan przez `is-*` | `panel--news`, `btn--primary`, `is-open` |
| Zmienne CSS | `--color-*`, `--radius-*`, `--font-*`, `--shadow-*` | `--color-accent`, `--radius-lg` |

**Komentarze.** Każdy plik zaczyna się nagłówkiem z opisem i konwencjami. Każda sekcja ma baner
w jednym formacie (taki sam w HTML, CSS i JS), w którym podajemy też źródło danych:

```
/* ==========================================================================
   POGODA
   Źródło: WeatherAPI.com (klucz w CONFIG).
   ========================================================================== */
```

W HTML: `<!-- ========== NAZWA ========== -->`. Wcięcia: 4 spacje.

**Commity.** Komunikaty po angielsku, w trybie rozkazującym: `Add Code Week poster`, `Fix queue refresh`.

**Uwaga o CSS.** `style.css` powstał z kolejnych łatek, więc późniejsze sekcje (np. „WYGLĄD: SZKŁO…”)
nadpisują wcześniejsze. Kolejność reguł ma znaczenie, nie przestawiaj sekcji bez sprawdzenia wyglądu.

## Dodawanie plakatu

Patrz [`posters/README.md`](posters/README.md).

## Kolejka radiowęzła

Serwer radia nie wysyła nagłówków CORS, więc totem nie może pytać go bezpośrednio. Robi to za niego workflow
GitHub Actions `.github/workflows/queue.yml` (nazwa w Actions: **Update radio queue**): w dni robocze,
w godzinach pracy totemu, co ok. 5 minut pobiera kolejkę i zapisuje ją jako `queue.json` na osobnej gałęzi
`queue-data` (jeden commit, za każdym razem nadpisywany). Totem czyta ten plik z `raw.githubusercontent.com`
(adres w `CONFIG.queueUrl`) co 30 s.

Dlaczego osobna gałąź: wdrożenie GitHub Pages z gałęzi `main` ma miękki limit 10 buildów na godzinę
(średnio jeden na 6 minut), a każdy commit na `main` uruchamia build. Commity na `queue-data` budowania nie
uruchamiają, więc kolejka może się zmieniać tak często, jak trzeba, bez wpływu na limit.

Uwaga: harmonogram GitHub Actions działa „na tyle, na ile się da”. Przebiegi bywają opóźnione nawet o kilka
godzin (widać to w zakładce Actions) i nie da się tego obejść bez własnego serwera. Przebieg zawsze można
wymusić ręcznie: Actions → Update radio queue → Run workflow.

## Publikacja

Strona jest publikowana przez GitHub Pages z gałęzi `main` (Settings → Pages → Deploy from a branch: `main`,
folder `/ (root)`). Po `git push` zmiany pojawiają się zwykle w ciągu kilku minut (wbudowany workflow
`pages-build-deployment`; jego nazwy nie da się zmienić). Budowanie uruchamia się tylko przy pushu na `main`.
