// script.js — Totem ZSI Kielce, wersja 5.0

/* ======================= Pomocnicze ======================= */
        function escapeHtml(str) {
            const d = document.createElement('div');
            d.textContent = String(str);
            return d.innerHTML;
        }
        function decodeEntities(html) {
            const d = document.createElement('div');
            d.innerHTML = String(html);
            return d.textContent;
        }
        function handleLogoError() {
            const img = document.getElementById('schoolLogo');
            if (img && img.parentElement) {
                img.parentElement.innerHTML = '<span class="logo-fallback">ZSI</span>';
            }
        }
        function formatTime(seconds) {
            const m = Math.floor(seconds / 60).toString().padStart(2, "0");
            const s = Math.floor(seconds % 60).toString().padStart(2, "0");
            return `${m}:${s}`;
        }
        function parseTimeToDate(timeStr) {
            const [hour, minute] = timeStr.split(":").map(Number);
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
        }

        // Dane do dolnego paska (ticker) — uzupełniane przez poszczególne loadery
        const tickerData = { wx: '', forecast: '', air: '', fx: '', births: '', deaths: '' };

        const DNI_TYGODNIA = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
                    const miesiace = [
                "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
                "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
            ];

        /* ======================= Zegar + data ======================= */
        function isoWeek(d) {
            const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
            return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7);
        }
        function updateClock() {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('heroClock').textContent = `${hh}:${mm}:${ss}`;
            document.getElementById('heroDate').textContent =
                `${DNI_TYGODNIA[now.getDay()]}, ${now.getDate()} ${miesiace[now.getMonth()]} ${now.getFullYear()}`;
        }
        updateClock();
        setInterval(updateClock, 1000);

        /* ======================= Plan dnia + pierścień ======================= */
                const schedule = [
            { type: "lekcja", start: "08:00", end: "08:45" },
            { type: "przerwa", start: "08:45", end: "08:50" },
            { type: "lekcja", start: "08:50", end: "09:35" },
            { type: "przerwa", start: "09:35", end: "09:40" },
            { type: "lekcja", start: "09:40", end: "10:25" },
            { type: "przerwa", start: "10:25", end: "10:30" },
            { type: "lekcja", start: "10:30", end: "11:15" },
            { type: "przerwa", start: "11:15", end: "11:30" },
            { type: "lekcja", start: "11:30", end: "12:15" },
            { type: "przerwa", start: "12:15", end: "12:20" },
            { type: "lekcja", start: "12:20", end: "13:05" },
            { type: "przerwa", start: "13:05", end: "13:10" },
            { type: "lekcja", start: "13:10", end: "13:55" },
            { type: "przerwa", start: "13:55", end: "14:00" },
            { type: "lekcja", start: "14:00", end: "14:45" },
            { type: "przerwa", start: "14:45", end: "14:55" },
            { type: "lekcja", start: "14:55", end: "15:40" },
            { type: "przerwa", start: "15:40", end: "15:45" },
            { type: "lekcja", start: "15:45", end: "16:30" },
            { type: "przerwa", start: "16:30", end: "16:35" },
            { type: "lekcja", start: "16:35", end: "17:20" },
            { type: "przerwa", start: "17:20", end: "17:25" },
            { type: "lekcja", start: "17:25", end: "18:10" },
        ];

        let RING_C = 0;
        function initRing() {
            const ring = document.getElementById('ringProgress');
            const r = Number(ring.getAttribute('r'));
            RING_C = 2 * Math.PI * r;
            ring.style.strokeDasharray = String(RING_C);
            ring.style.strokeDashoffset = String(RING_C);
        }
        function setRing(fraction) {
            const ring = document.getElementById('ringProgress');
            const clamped = Math.max(0, Math.min(1, fraction));
            ring.style.strokeDashoffset = String(RING_C * (1 - clamped));
        }

        function updateLessonTimer() {
            const now = new Date();
            let current = null;
            for (const period of schedule) {
                const start = parseTimeToDate(period.start);
                const end = parseTimeToDate(period.end);
                if (now >= start && now < end) {
                    current = { type: period.type, start, end };
                    break;
                }
            }

            const statusEl = document.getElementById("lessonStatus");
            const timerEl = document.getElementById("lessonTimer");
            const emojiEl = document.getElementById("ringEmoji");

            if (!current) {
                const firstStart = parseTimeToDate(schedule[0].start);
                const lastEnd = parseTimeToDate(schedule[schedule.length - 1].end);

                if (now < firstStart) {
                    statusEl.textContent = "Jeszcze przed lekcjami";
                    timerEl.textContent = formatTime((firstStart - now) / 1000);
                    emojiEl.textContent = "⏳";
                    setRing(0);
                } else if (now >= lastEnd) {
                    statusEl.textContent = "Koniec zajęć na dziś!";
                    timerEl.textContent = "—";
                    emojiEl.textContent = "🤩";
                    setRing(1);
                } else {
                    statusEl.textContent = "Między zajęciami";
                    timerEl.textContent = "--:--";
                    emojiEl.textContent = "💤";
                    setRing(0);
                }
                return;
            }

            statusEl.textContent = current.type === "lekcja" ? "Trwa lekcja" : "Trwa przerwa";
            emojiEl.textContent = current.type === "lekcja" ? "📚" : "☕";
            const total = (current.end - current.start) / 1000;
            const secondsLeft = (current.end - now) / 1000;
            timerEl.textContent = formatTime(secondsLeft);
            setRing(1 - (secondsLeft / total));
        }
        initRing();
        updateLessonTimer();
        setInterval(updateLessonTimer, 1000);

        /* ======================= Odliczanie do końca roku ======================= */
        function updateCountdown() {
            const now = new Date();
            const schoolYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
            const endDate = new Date(schoolYear + 1, 5, 25);   // zakończenie roku szkolnego: 25 czerwca
            const diff = endDate - now;
            const el = document.getElementById('countdownValue');
            if (diff <= 0) {
                el.textContent = "Zakończony!";
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            el.textContent = plDni(days);
        }
        function plDni(n) { return n === 1 ? "1 dzień" : n + " dni"; }
        updateCountdown();
        setInterval(updateCountdown, 1000 * 60 * 60);

        /* ======================= Wydarzenia szkolne ======================= */
             const events = [
    { date: "01.09", title: "Rozpoczęcie roku szkolnego", off: false },

    { date: "14.10", title: "Dzień Edukacji Narodowej" },
    { date: "15.10", title: "Dzień wolny od zajęć dydaktycznych" },

    { date: "01.11", title: "Wszystkich Świętych" },
    { date: "02.11", title: "Dzień wolny od zajęć dydaktycznych" },
    { date: "11.11", title: "Narodowe Święto Niepodległości" },

    { date: "23.12 – 06.01", title: "Zimowa przerwa świąteczna" },

    { date: "01.02 – 14.02", title: "Ferie zimowe" },

    { date: "25.03 – 30.03", title: "Wiosenna przerwa świąteczna" },

    { date: "01.05 – 10.05", title: "Majówka / dni wolne od zajęć dydaktycznych" },

    { date: "25.06", title: "Zakończenie roku szkolnego", off: false }
];

        function displayEvents() {
            const ul = document.getElementById('eventsList');
            ul.innerHTML = "";
            events.forEach(ev => {
                const li = document.createElement('li');
                const tag = document.createElement('span');
                tag.className = 'ev-date';
                tag.textContent = ev.date;
                li.appendChild(tag);
                li.appendChild(document.createTextNode(ev.title));
                ul.appendChild(li);
            });
        }
        displayEvents();

        /* ======================= Odliczanie do najbliższego dnia wolnego ======================= */
        // Bierzemy wydarzenia z listy powyżej (poza rozpoczęciem i zakończeniem roku — mają off:false).
        // Weekendy nie są liczone: chodzi o dni wolne szkoły.
        function parseEventRange(ev, schoolYear) {
            const m = ev.date.match(/(\d{1,2})\.(\d{1,2})(?:\s*[–-]\s*(\d{1,2})\.(\d{1,2}))?/);
            if (!m) return null;
            const yearOf = mo => (mo >= 8 ? schoolYear : schoolYear + 1); // wrz–gru: rok startu, sty–lip: kolejny
            const sd = +m[1], sm = +m[2];
            const start = new Date(yearOf(sm), sm - 1, sd);
            let end = start;
            if (m[3]) {
                const ed = +m[3], em = +m[4];
                end = new Date(yearOf(em), em - 1, ed);
            }
            return { ev, start, end };
        }
        function nextDayOff(now) {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const schoolYear = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
            const list = events
                .filter(e => e.off !== false)
                .map(e => parseEventRange(e, schoolYear))
                .filter(Boolean)
                .filter(r => r.end >= today)
                .sort((a, b) => a.start - b.start);
            return list.length ? { ...list[0], today } : null;
        }
        function updateDayOff() {
            const val = document.getElementById('dayOffValue');
            const name = document.getElementById('dayOffName');
            if (!val) return;
            const r = nextDayOff(new Date());
            if (!r) { val.textContent = 'Wakacje! 🌴'; name.textContent = ''; return; }
            if (r.start <= r.today) {
                val.textContent = 'Dziś wolne! 🎉';
                name.textContent = r.ev.title;
                return;
            }
            const days = Math.round((r.start - r.today) / 864e5);
            val.textContent = days === 1 ? 'Jutro!' : plDni(days);
            name.textContent = `${r.ev.title} (${r.ev.date.split(/[–-]/)[0].trim()})`;
        }
        updateDayOff();
        setInterval(updateDayOff, 1000 * 60 * 30);

        function getNextEventLabel() {
            const now = new Date();
            const parsed = events.map(ev => {
                const firstPart = ev.date.split(/–|-/)[0].trim();
                const bits = firstPart.split('.').map(Number);
                const d = bits[0], m = bits[1];
                if (!d || !m) return null;
                let dt = new Date(now.getFullYear(), m - 1, d);
                if (dt < now) dt = new Date(now.getFullYear() + 1, m - 1, d);
                return { ev, dt };
            }).filter(Boolean).sort((a, b) => a.dt - b.dt);
            if (!parsed.length) return '';
            return `${parsed[0].ev.title} (${parsed[0].ev.date})`;
        }

        /* ======================= Pogoda ======================= */
        const weatherApiKey = "4d6b61b528c9490f87610039252407";
        const weatherCity = "Kielce";

        async function fetchWeather() {
            try {
                const resp = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${weatherCity}&lang=pl`);
                const data = await resp.json();
                document.getElementById('weatherTemp').textContent = data.current.temp_c.toFixed(1);
                document.getElementById('weatherDesc').textContent = data.current.condition.text;
                document.getElementById('weatherIcon').src = "https:" + data.current.condition.icon;
                document.getElementById('weatherIcon').alt = data.current.condition.text;
                const w = data.current, f = n => String(Math.round(n * 10) / 10).replace('.', ',');
                tickerData.wx = `Kielce teraz: ${f(w.temp_c)}°C, ${w.condition.text.toLowerCase()}, wiatr ${Math.round(w.wind_kph)} km/h`;
                if (typeof buildTicker === 'function') buildTicker();
            } catch (e) {
                console.error("Błąd pogody:", e);
                document.getElementById('weatherDesc').textContent = "brak danych";
            }
        }
        fetchWeather();
        setInterval(fetchWeather, 10 * 60 * 1000);

        /* ======================= Ciekawostka dnia ======================= */
                const factsDaily = [
            "Pierwszy komputer (ENIAC) ważył ponad 27 ton.",
            "Kod binarny składa się tylko z dwóch cyfr: 0 i 1.",
            "Linux został stworzony przez Linusa Torvaldsa jako projekt hobbystyczny.",
            "Pierwsza strona WWW powstała w 1991 roku.",
            "Nazwa języka Python pochodzi od grupy komediowej Monty Python.",
            "Bill Gates napisał swój pierwszy program w wieku 13 lat.",
            "HTML nie jest językiem programowania – to język znaczników.",
            "Google pierwotnie nazywało się BackRub.",
            "Pierwszy e-mail został wysłany w 1971 roku.",
            "Na świecie istnieje więcej adresów IP niż ludzi.",
            "W 2000 roku błąd Y2K był przedmiotem masowych obaw (niesłusznie).",
            "Algorytm pochodzi od nazwiska perskiego matematyka Al-Chwarizmi.",
            "Pierwszy dysk twardy (IBM, 1956) miał 5 MB pojemności i ważył około tony.",
            "Tranzystor to najmniejszy element współczesnych procesorów.",
            "W 1983 roku powstał pierwszy telefon komórkowy (ważył 1 kg).",
            "Język Java początkowo miał nazywać się Oak.",
            "Pierwsza gra komputerowa to „Tennis for Two” z 1958 roku.",
            "W 1947 roku zespół Grace Hopper znalazł ćmę w przekaźniku komputera Harvard Mark II i opisał to jako „bug”.",
            "W 1975 roku powstał pierwszy komputer domowy – Altair 8800.",
            "Kapitalizacja liter ma znaczenie w systemach Linux/Unix.",
            "Pamięć RAM traci dane po odłączeniu zasilania – jest ulotna.",
            "System plików NTFS wprowadzono w systemie Windows NT.",
            "Słowo 'robot' pochodzi z czeskiego 'robota' – oznacza 'praca'.",
            "Pierwszy wirus, Creeper (początek lat 70.), przemieszczał się po ARPANET-cie — a program Reaper go usuwał.",
            "Facebook początkowo był tylko dla studentów Harvardu.",
            "ASCII to standard kodowania znaków z lat 60.",
            "Pierwsze laptopy kosztowały ponad 3000 dolarów.",
            "Pierwszy iPhone pojawił się w 2007 roku.",
            "Bluetooth zawdzięcza nazwę wikińskiemu królowi Haraldowi Bluetooth.",
            "Pojedynczy bit to najmniejsza jednostka informacji.",
            "System Linux można uruchomić na... tosterze (dosłownie!).",
            "Na początku istnienia internetu tylko 4 komputery były połączone.",
            "Firefox nie ma nic wspólnego z lisem – logo przedstawia pandę czerwoną.",
            "W języku C++ ++ oznacza zwiększenie zmiennej o 1.",
            "SSD są szybsze, ale droższe od tradycyjnych dysków HDD.",
            "Google Chrome dominuje w rynku przeglądarek od 2012 roku.",
            "Pojedynczy e-mail emituje około 4 g CO₂.",
            "Język JavaScript został stworzony w 10 dni.",
            "Kod QR powstał w Japonii w 1994 roku.",
            "Hakerzy White Hat pomagają chronić systemy – nie atakować je.",
            "Pierwszy komputer Apple został zbudowany w garażu.",
            "W 1 GB mieści się około 1 miliarda bajtów.",
            "DNS to „książka telefoniczna internetu”.",
            "IPv6 ma 2¹²⁸ adresów — to około 340 sekstylionów, więc wystarczy dla każdego urządzenia.",
            "System operacyjny Windows 1.0 został wydany w 1985 roku.",
            "Marsjański helikopter Ingenuity działał pod kontrolą Linuksa.",
            "Emoji to tak naprawdę znaki Unicode.",
            "Na początku Google przechowywało dane w obudowach z klocków LEGO.",
            "Pierwszy programista w historii to kobieta – Ada Lovelace.",
            "Nazwa CAPTCHA oznacza 'Completely Automated Public Turing test to tell Computers and Humans Apart'.",
            "Gry komputerowe są starsze niż internet.",
            "Komputery kwantowe wykorzystują zjawisko superpozycji.",
            "Pierwszy smartfon powstał w 1992 roku i nazywał się IBM Simon.",
            "Deep Blue – komputer szachowy IBM – pokonał mistrza świata Garry’ego Kasparowa w 1997 roku.",
            "Najpopularniejszy system operacyjny na świecie to Android.",
            "Język PHP pierwotnie oznaczał 'Personal Home Page'.",
            "Git został stworzony przez Linusa Torvaldsa (twórcę Linuxa).",
            "Pierwszy dysk SSD powstał w latach 70.",
            "Złośliwe oprogramowanie może się ukrywać nawet w dokumentach PDF.",
            "Pierwsza gra 3D to prawdopodobnie '3D Monster Maze' z 1981 roku.",
            "Pierwsza domena internetowa to symbolics.com.",
            "Domena .tv należy do wyspiarskiego kraju Tuvalu.",
            "Smartwatche były pokazane w kreskówkach zanim istniały naprawdę.",
            "Twórca języka Java, James Gosling, pracował wcześniej przy systemach rakietowych.",
            "Niektóre bankomaty nadal działają na Windows XP.",
            "W Brazylii hakerzy zainfekowali setki bankomatów w 2013 roku.",
            "Raspberry Pi to komputer wielkości karty kredytowej.",
            "Python zyskuje popularność głównie przez łatwość nauki.",
            "Pierwsze przeglądarki internetowe nie obsługiwały obrazków.",
            "Pierwszy ekran dotykowy wynaleziono w latach 60.",
            "HTML5 wprowadził natywne odtwarzanie wideo bez Flash.",
            "Język Assembly to niemal bezpośredni zapis rozkazów procesora.",
            "Stack Overflow powstał w 2008 roku.",
            "Robotyka łączy informatykę, elektronikę i mechanikę.",
            "Przeglądarka Opera była kiedyś płatna.",
            "Język Scratch pomaga dzieciom uczyć się programowania wizualnie.",
            "Na świecie co sekundę powstaje tysiące stron internetowych.",
            "Netflix używa własnej infrastruktury o nazwie Open Connect.",
            "Drony to także komputery — tylko z napędem i czujnikami.",
            "Aplikacje mobilne są pisane głównie w Kotlinie i Swift.",
            "Szyfrowanie end-to-end oznacza, że nawet serwer nie zna treści wiadomości.",
            "Sztuczna inteligencja może już pisać własny kod.",
            "Blockchain to nie tylko kryptowaluty – ma zastosowanie w logistyce i medycynie.",
            "Słowo 'haker' początkowo oznaczało osobę rozwiązującą problemy techniczne.",
            "YouTube początkowo miał być... serwisem randkowym z wideo.",
            "Skróty klawiszowe znacznie przyspieszają pracę z komputerem.",
            "W informatyce obowiązuje zasada KISS: Keep It Simple, Stupid.",
            "Linux ma setki różnych dystrybucji, jak Ubuntu czy Fedora.",
            "Dark Web to część internetu niewidoczna dla standardowych wyszukiwarek.",
            "Komputery mogą pracować w temperaturach od -40 do +85°C (klasa przemysłowa).",
            "MacOS bazuje na systemie Unix.",
            "Najwięcej ataków DDoS pochodzi z sieci zainfekowanych kamer i routerów.",
            "Programiści często używają tzw. kaczek do debugowania (Duck Debugging).",
            "Algorytm Google PageRank opiera się na teorii grafów.",
            "Klawisz F5 w przeglądarce służy do odświeżania strony.",
            "C++ to rozszerzenie języka C o programowanie obiektowe.",
            "Konsola (terminal) pozwala zarządzać systemem bez myszy.",
            "Wiele stron wykorzystuje pliki cookies do śledzenia użytkowników.",
            "Tor to przeglądarka umożliwiająca anonimowe surfowanie.",
            "SSH to bezpieczny sposób łączenia się z serwerem przez terminal.",
            "Na GitHubie znajdują się miliony projektów open source.",
            "Programiści często pracują z systemami kontroli wersji – jak Git.",
            "W sieciach komputerowych istnieją różne protokoły warstwowe (np. TCP/IP).",
            "Chmura (cloud) to po prostu cudzy komputer w Internecie.",
            "Hiperłącza umożliwiają przechodzenie między stronami internetowymi.",
            "Język Go został stworzony przez Google jako szybka alternatywa dla C++.",
            "Licencje open source pozwalają dowolnie modyfikować kod.",
            "Każde kliknięcie w Internecie może być rejestrowane przez serwery.",
            "Dane mogą być przechowywane w DNA (tak – w biologicznym kodzie).",
            "Hakerzy wykorzystują często tzw. socjotechnikę – manipulację ludźmi.",
            "Pojęcie 'Big Data' oznacza przetwarzanie ogromnych zbiorów danych.",
            "Adres IP może być dynamiczny (zmienny) lub statyczny (stały).",
            "Kiedyś gry komputerowe mieściły się na jednej dyskietce.",
            "System plików FAT32 ma ograniczenie pliku do 4 GB.",
            "Programiści mogą pracować zdalnie z dowolnego miejsca na świecie.",
            "Każdy plik ma swój unikalny hash (np. SHA-256).",
            "Backup danych powinien być wykonywany regularnie.",
            "Niektóre kraje mają państwowe firewalle (np. Chiny).",
            "Testy jednostkowe sprawdzają poprawność małych fragmentów kodu.",
            "Gry MMO obsługują jednocześnie miliony graczy.",
            "Komputery nie rozumieją obrazów — przetwarzają je jako piksele i liczby.",
            "Bluetooth zużywa mniej energii niż Wi-Fi.",
            "System BIOS inicjalizuje sprzęt przed uruchomieniem systemu operacyjnego.",
            "CLI (Command Line Interface) to interfejs tekstowy.",
            "Zaszyfrowany plik nie może być odczytany bez klucza.",
            "Rozdzielczość ekranu określa liczbę pikseli wyświetlanych na ekranie.",
            "GitHub Copilot to AI, która pomaga pisać kod.",
            "W niektórych krajach AI już pisze teksty do gazet.",
            "Algorytmy sortowania to podstawa w informatyce (np. quicksort, mergesort).",
            "Nawet przeglądarka internetowa to zaawansowany program napisany w C++ i JS.",
            "Istnieją komputery stworzone tylko do kopania kryptowalut (ASIC).",
            "Niektóre boty potrafią grać lepiej w gry niż ludzie.",
            "Arduino to platforma do tworzenia prostych urządzeń elektronicznych z kodem.",
            "Niektóre ataki można wykonać bez dotykania klawiatury — tylko przez sieć.",
            "Marian Rejewski i jego współpracownicy złamali szyfr Enigmy w latach 30. XX wieku.",
            "Pierwsze połączenie Polski z Internetem powstało w 1991 roku (Warszawa–Kopenhaga).",
            "Domena .pl istnieje od 1990 roku.",
            "Ada Lovelace opisała algorytm dla maszyny analitycznej już w 1843 roku.",
            "W 1950 roku Alan Turing zaproponował test, czy maszyna potrafi myśleć.",
            "Niemal cały międzykontynentalny ruch internetowy płynie kablami podmorskimi, nie przez satelity.",
            "Ethernet wymyślono w 1973 roku w laboratorium Xerox PARC.",
            "Protokół TCP/IP wdrożono w sieci ARPANET 1 stycznia 1983 roku.",
            "Pierwszy spam e-mailowy wysłano w 1978 roku.",
            "„Wi-Fi” nie jest skrótem od „Wireless Fidelity” — to nazwa marketingowa.",
            "Pierwsza mysz komputerowa (Douglas Engelbart, 1964) miała drewnianą obudowę.",
            "Standard Unicode zawiera ponad 150 tysięcy znaków — od polskich ogonków po emoji.",
            "Pierwsza wiadomość w ARPANET (1969) miała brzmieć „LOGIN”, ale system padł po literach „LO”.",
            "Komputer pokładowy Apollo 11 miał około 4 KB pamięci RAM.",
            "Prawo Moore’a: liczba tranzystorów w układzie podwaja się mniej więcej co 2 lata.",
            "HTTP/3 działa na protokole QUIC, czyli na UDP zamiast TCP.",
            "Obraz 4K to ponad 8 milionów pikseli.",
            "„password” i „123456” od lat są w czołówce najczęściej używanych haseł.",
            "Uwierzytelnianie dwuskładnikowe (2FA) blokuje większość zautomatyzowanych ataków na konta.",
            "Sieć Tor wyrosła z badań laboratorium Marynarki Wojennej USA nad routingiem cebulowym.",
            "Pierwszy serwer WWW działał na komputerze NeXT Tima Bernersa-Lee w CERN.",
            "„Wiki” w nazwie Wikipedia pochodzi od hawajskiego słowa oznaczającego „szybko”.",
            "Program „Hello, World!” spopularyzowała książka Kernighana i Ritchiego o języku C (1978).",
            "1 KiB to 1024 bajty, a 1 kB w układzie SI to 1000 bajtów — stąd „brakujące” miejsce na dysku.",
            "Każdy piksel w RGB to trzy wartości 0–255, czyli ok. 16,7 mln możliwych kolorów.",
            "Pierwsza kamera internetowa monitorowała ekspres do kawy na Uniwersytecie w Cambridge (1991).",
            "Kolory w kodzie CSS zapisujemy szesnastkowo, np. #4C82FF to niebieski użyty w tej stronie.",
            "Kryptografia klucza publicznego pozwala bezpiecznie rozmawiać z kimś, z kim nigdy wcześniej nie wymieniliśmy sekretu."
        ];

        function showDailyFact() {
            const today = new Date();
            const yearStart = new Date(today.getFullYear(), 0, 0);
            const diff = today - yearStart;
            const oneDay = 1000 * 60 * 60 * 24;
            const yearDay = Math.floor(diff / oneDay);
            const factIndex = yearDay % factsDaily.length;
            window.todayFactIndex = factIndex;
            document.getElementById("factBox").textContent = factsDaily[factIndex];
        }
        showDailyFact();
        setInterval(showDailyFact, 30 * 60 * 1000);

        /* ======================= Generator pytań ======================= */
                // [pytanie, POPRAWNA, zła, zła, zła, wyjaśnienie] — kolejność odpowiedzi jest losowana
        const quizBank = [
            ["Który port jest domyślnie używany przez protokół HTTPS?", "443", "80", "21", "8080", "HTTPS działa na porcie 443, a HTTP na 80."],
            ["W której warstwie modelu OSI pracuje przełącznik (switch) L2?", "Łącza danych", "Fizycznej", "Sieciowej", "Transportowej", "Switch przełącza ramki na podstawie adresów MAC – to warstwa 2."],
            ["Jaka jest maska podsieci dla prefiksu /24?", "255.255.255.0", "255.255.0.0", "255.255.255.128", "255.0.0.0", "/24 to 24 jedynki: trzy pełne oktety."],
            ["Który protokół automatycznie przydziela hostom adresy IP?", "DHCP", "DNS", "ARP", "SNMP", "DHCP przydziela adres, maskę, bramę i DNS."],
            ["Które polecenie w Windows wyświetla pełną konfigurację IP?", "ipconfig /all", "ifconfig -a", "netstat -r", "tracert", "ipconfig /all pokazuje też adres MAC i serwery DNS."],
            ["Co oznacza uprawnienie chmod 754?", "rwxr-xr--", "rwxrwxr--", "rwxr-xr-x", "rw-r-xr--", "7 = rwx (właściciel), 5 = r-x (grupa), 4 = r-- (inni)."],
            ["Który poziom RAID zapewnia lustrzane odbicie dysków (mirroring)?", "RAID 1", "RAID 0", "RAID 5", "JBOD", "RAID 1 zapisuje te same dane na dwóch dyskach."],
            ["Jaka jest maksymalna długość segmentu skrętki w Ethernet (np. 1000BASE-T)?", "100 m", "50 m", "185 m", "500 m", "Limit to 100 m (90 m okablowania stałego + kable krosowe)."],
            ["Który protokół służy do bezpiecznego zdalnego dostępu do terminala?", "SSH", "Telnet", "FTP", "TFTP", "SSH szyfruje połączenie, Telnet przesyła dane jawnym tekstem."],
            ["Do czego służy polecenie sfc /scannow w Windows?", "Sprawdza i naprawia pliki systemowe", "Skanuje sieć w poszukiwaniu hostów", "Defragmentuje dysk", "Tworzy kopię zapasową systemu", "System File Checker weryfikuje integralność chronionych plików systemu."],
            ["Które polecenie w Linuksie wyświetla zawartość katalogu?", "ls", "cd", "pwd", "mkdir", "ls (list) wypisuje pliki i katalogi."],
            ["Jaki rekord DNS wskazuje adres IPv4 dla nazwy domenowej?", "A", "MX", "CNAME", "PTR", "Rekord A – adres IPv4, AAAA – IPv6, MX – poczta."],
            ["Do czego służy technologia PoE?", "Do zasilania urządzeń przez kabel Ethernet", "Do szyfrowania ruchu w sieci", "Do podziału sieci na VLAN-y", "Do zwiększenia zasięgu Wi-Fi", "Power over Ethernet zasila np. kamery IP i access pointy po skrętce."],
            ["Do czego służy VLAN?", "Do logicznego podziału sieci na segmenty", "Do zwiększenia prędkości łącza", "Do tłumaczenia adresów (NAT)", "Do automatycznego przydziału IP", "VLAN rozdziela domeny rozgłoszeniowe na jednym przełączniku."],
            ["Jaki znacznik HTML tworzy akapit?", "<p>", "<a>", "<div>", "<span>", "<p> to znacznik akapitu tekstu."],
            ["Która właściwość CSS zmienia kolor tekstu?", "color", "background-color", "font-style", "text-decoration", "background-color zmienia tło, color – tekst."],
            ["Która klauzula SQL filtruje wyniki PO grupowaniu (GROUP BY)?", "HAVING", "WHERE", "ORDER BY", "LIMIT", "WHERE działa przed grupowaniem, HAVING po nim."],
            ["Czym jest klucz obcy (FOREIGN KEY)?", "Kolumną odwołującą się do klucza głównego innej tabeli", "Kolumną z unikalnym identyfikatorem rekordu", "Indeksem przyspieszającym wyszukiwanie", "Hasłem do bazy danych", "Klucz obcy tworzy relację między tabelami."],
            ["Której metody HTTP używa się do pobrania zasobu bez jego modyfikacji?", "GET", "POST", "PUT", "DELETE", "GET jest bezpieczną metodą odczytu."],
            ["Co oznacza deklaracja const w JavaScript?", "Zmiennej nie można ponownie przypisać", "Zmienna jest globalna", "Zmienna może mieć tylko liczbę", "Zmienna istnieje tylko w funkcji", "const blokuje ponowne przypisanie (zawartość obiektu można nadal zmieniać)."],
            ["Jak najskuteczniej chronić aplikację przed SQL Injection?", "Zapytania parametryzowane (prepared statements)", "Ukrycie formularza w CSS", "Zmiana metody z GET na POST", "Ograniczenie długości pola tekstowego", "Parametry są przekazywane oddzielnie od kodu SQL."],
            ["Które polecenie SQL usuwa wybrane rekordy z tabeli?", "DELETE FROM tabela WHERE ...", "DROP TABLE tabela", "REMOVE ROW ...", "TRUNCATE COLUMN ...", "DELETE usuwa rekordy, DROP usuwa całą tabelę."],
            ["Co oznacza kod odpowiedzi HTTP 404?", "Nie znaleziono zasobu", "Żądanie zakończone sukcesem", "Błąd serwera", "Brak uprawnień", "404 Not Found. Sukces to 200, błąd serwera 500."],
            ["Do czego służą media queries w CSS?", "Do dopasowania wyglądu do rozmiaru i orientacji ekranu", "Do odtwarzania plików wideo", "Do pobierania danych z serwera", "Do animowania elementów", "Dzięki nim strona jest responsywna (RWD)."],
            ["Co jest celem normalizacji bazy danych?", "Ograniczenie redundancji i anomalii danych", "Szyfrowanie danych", "Zwiększenie rozmiaru bazy", "Utworzenie kopii zapasowej", "Normalizacja (1NF, 2NF, 3NF) porządkuje strukturę tabel."],

            // ---- INF.02: sieci, sprzęt, systemy ----
            ["Który adres IP należy do zakresu prywatnego (RFC 1918)?", "192.168.10.5", "172.32.0.1", "11.0.0.1", "169.254.1.1", "Zakresy prywatne: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Adresy 169.254.x.x to APIPA."],
            ["Ile bitów ma adres IPv6?", "128", "32", "64", "256", "IPv6 ma 128 bitów, a IPv4 – 32 bity."],
            ["Który protokół zamienia adres IP na adres MAC w sieci lokalnej?", "ARP", "DNS", "DHCP", "ICMP", "ARP (Address Resolution Protocol) mapuje adresy IP na MAC."],
            ["Które urządzenie łączy różne sieci IP i wybiera trasę pakietów?", "Router", "Przełącznik L2", "Koncentrator (hub)", "Wzmacniak (repeater)", "Router pracuje w warstwie 3 modelu OSI."],
            ["Jaki kolor ma pin 1 w standardzie okablowania T568B?", "Biało-pomarańczowy", "Biało-zielony", "Niebieski", "Brązowy", "W T568B pin 1 to biało-pomarańczowy, w T568A – biało-zielony."],
            ["Do czego służy polecenie ping?", "Sprawdza łączność z hostem (ICMP echo)", "Wyświetla tablicę routingu", "Skanuje otwarte porty", "Zmienia adres IP karty sieciowej", "Ping wysyła pakiety ICMP echo request i mierzy czas odpowiedzi."],
            ["Które polecenie w Windows pokazuje trasę pakietów do celu?", "tracert", "nslookup", "netstat", "arp -a", "tracert wypisuje kolejne routery na drodze. W Linuksie: traceroute."],
            ["Który system plików Windows obsługuje uprawnienia i szyfrowanie EFS?", "NTFS", "FAT32", "exFAT", "ext4", "NTFS obsługuje ACL, szyfrowanie EFS, kompresję i księgowanie."],
            ["Która macierz RAID daje striping bez żadnej redundancji?", "RAID 0", "RAID 1", "RAID 5", "RAID 6", "RAID 0 przyspiesza dostęp, ale awaria jednego dysku niszczy całą macierz."],
            ["Jaka jest minimalna liczba dysków w macierzy RAID 5?", "3", "2", "4", "5", "RAID 5 potrzebuje trzech dysków: dane i rozproszona parzystość."],
            ["Do czego służy Secure Boot w UEFI?", "Do uruchamiania tylko zaufanego, podpisanego oprogramowania rozruchowego", "Do szyfrowania całego dysku", "Do przyspieszania startu systemu", "Do tworzenia kopii zapasowej BIOS-u", "Secure Boot chroni przed bootkitami i niepodpisanymi bootloaderami."],
            ["Który moduł pamięci RAM jest typowy dla laptopów?", "SO-DIMM", "DIMM", "PCIe x1", "SATA", "SO-DIMM to krótsze moduły stosowane w laptopach i mini PC."],
            ["Przez jaką magistralę pracują dyski SSD NVMe?", "PCI Express", "SATA II", "IDE (PATA)", "VGA", "NVMe działa przez PCIe (najczęściej złącze M.2), dlatego jest szybszy od SATA."],
            ["Na którym porcie domyślnie działa SSH?", "22", "23", "25", "3389", "SSH – 22, Telnet – 23, SMTP – 25, RDP – 3389."],
            ["Który port jest domyślnie używany przez Pulpit zdalny (RDP)?", "3389", "22", "445", "5900", "RDP działa na porcie 3389 (TCP)."],
            ["Który port jest domyślny dla usługi DNS?", "53", "67", "110", "143", "DNS – 53, DHCP – 67/68, POP3 – 110, IMAP – 143."],
            ["Które polecenie w Linuksie zmienia właściciela pliku?", "chown", "chmod", "passwd", "usermod", "chown zmienia właściciela, a chmod – uprawnienia."],
            ["W jakim pliku Linux przechowuje hashe haseł użytkowników?", "/etc/shadow", "/etc/passwd", "/etc/group", "/etc/hosts", "/etc/shadow jest dostępny tylko dla roota, /etc/passwd – dla wszystkich."],
            ["Do czego służy Active Directory?", "Do centralnego zarządzania użytkownikami, komputerami i zasadami w domenie", "Do tworzenia kopii zapasowych", "Do przydzielania adresów IP", "Do filtrowania ruchu w sieci", "AD DS przechowuje konta, grupy i obiekty domeny Windows."],
            ["Czym są zasady grupy (GPO) w domenie Windows?", "Ustawieniami konfiguracji stosowanymi centralnie do komputerów i użytkowników", "Grupą użytkowników o tych samych uprawnieniach", "Harmonogramem kopii zapasowych", "Listą zablokowanych stron internetowych", "GPO pozwala np. wymusić tapetę, zablokować USB czy ustawić politykę haseł."],
            ["Która kopia zapasowa zapisuje tylko zmiany od ostatniej kopii (dowolnego typu)?", "Przyrostowa", "Różnicowa", "Pełna", "Lustrzana", "Przyrostowa – od ostatniej kopii, różnicowa – od ostatniej pełnej."],
            ["Który standard Wi-Fi jest oznaczany jako Wi-Fi 5?", "802.11ac", "802.11n", "802.11g", "802.11b", "Wi-Fi 5 to 802.11ac, Wi-Fi 6 to 802.11ax."],
            ["Jaki światłowód nadaje się do połączeń na duże odległości (kilometry)?", "Jednomodowy", "Wielomodowy", "Skrętka UTP", "Kabel koncentryczny", "Włókno jednomodowe ma cienki rdzeń i małe tłumienie."],
            ["Do czego służy NAT na routerze brzegowym?", "Do translacji adresów prywatnych na publiczne", "Do szyfrowania tunelu VPN", "Do przydzielania adresów DHCP", "Do blokowania reklam", "NAT pozwala wielu hostom z sieci prywatnej korzystać z jednego adresu publicznego."],
            ["Ile użytecznych adresów hostów ma sieć /30?", "2", "4", "6", "30", "/30 to 4 adresy, minus adres sieci i rozgłoszeniowy = 2 hosty."],
            ["Ile użytecznych adresów hostów ma sieć /24?", "254", "256", "255", "253", "256 adresów minus adres sieci i broadcast = 254."],

            // ---- INF.03: strony, aplikacje, bazy danych ----
            ["Który znacznik HTML5 oznacza blok nawigacji?", "<nav>", "<aside>", "<footer>", "<article>", "<nav> to semantyczny znacznik dla głównych odnośników nawigacyjnych."],
            ["Który atrybut dodaje tekst alternatywny do obrazka?", "alt", "title", "src", "href", "Atrybut alt pomaga czytnikom ekranu i wyświetla się, gdy obrazek się nie wczyta."],
            ["Co robi deklaracja display: flex w CSS?", "Włącza układ elastyczny (flexbox) dla elementów potomnych", "Ukrywa element", "Ustawia element na stałej pozycji", "Zmienia kolor tła", "Flexbox ułatwia rozmieszczanie elementów w wierszu lub kolumnie."],
            ["Który selektor CSS wybiera elementy z klasą „menu”?", ".menu", "#menu", "menu", "*menu", "Kropka oznacza klasę, hasz – identyfikator (id)."],
            ["Który operator w JavaScript porównuje wartość ORAZ typ?", "===", "==", "=", "!=", "=== to porównanie ścisłe: 5 === \"5\" daje false."],
            ["Jak wypisać komunikat w konsoli przeglądarki w JavaScript?", "console.log()", "System.out.println()", "printf()", "echo", "console.log() wypisuje dane w konsoli deweloperskiej."],
            ["Jak dodać element na koniec tablicy w JavaScript?", "push()", "pop()", "shift()", "unshift()", "push dodaje na koniec, unshift – na początek, pop usuwa ostatni."],
            ["Która jednostka CSS jest względna do rozmiaru czcionki?", "em", "px", "cm", "pt", "1em to rozmiar czcionki elementu; px, cm i pt są jednostkami bezwzględnymi."],
            ["Który język działa po stronie serwera?", "PHP", "CSS", "HTML", "SVG", "PHP jest wykonywany na serwerze, a przeglądarka dostaje gotowy HTML."],
            ["Które polecenie SQL dodaje nowy rekord do tabeli?", "INSERT INTO", "UPDATE", "SELECT", "ALTER TABLE", "INSERT INTO tabela (...) VALUES (...) dodaje wiersz."],
            ["Co robi JOIN w zapytaniu SQL?", "Łączy wiersze z dwóch tabel na podstawie powiązanych kolumn", "Usuwa duplikaty z wyników", "Sortuje wyniki zapytania", "Tworzy kopię tabeli", "JOIN pozwala pobierać dane z kilku powiązanych tabel naraz."],
            ["Które złączenie zwraca wszystkie wiersze z lewej tabeli, także bez dopasowania?", "LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "CROSS JOIN", "Dla braku dopasowania kolumny z prawej tabeli mają wartość NULL."],
            ["Która funkcja agregująca SQL zwraca liczbę wierszy?", "COUNT()", "SUM()", "AVG()", "MAX()", "COUNT(*) zlicza wiersze, SUM sumuje, AVG liczy średnią."],
            ["Która postać normalna wymaga, by wartości w kolumnach były atomowe?", "1NF", "2NF", "3NF", "BCNF", "Pierwsza postać normalna: brak list i powtarzających się grup w komórkach."],
            ["Która metoda HTTP zwykle tworzy nowy zasób na serwerze?", "POST", "GET", "HEAD", "OPTIONS", "POST wysyła dane do utworzenia zasobu, GET tylko je pobiera."],
            ["Co oznacza kod odpowiedzi HTTP 301?", "Stałe przekierowanie", "Zasób został utworzony", "Brak zawartości", "Zakaz dostępu", "301 Moved Permanently; 201 to Created, 204 – No Content, 403 – Forbidden."],
            ["Czym jest atak XSS?", "Wstrzyknięciem złośliwego skryptu do strony wyświetlanej innym użytkownikom", "Atakiem na bazę danych przez zapytania SQL", "Przepełnieniem bufora w pamięci", "Podsłuchem sieci Wi-Fi", "Obrona: escapowanie danych wyjściowych, np. htmlspecialchars() w PHP."],
            ["Do czego służy funkcja password_hash() w PHP?", "Do bezpiecznego haszowania haseł", "Do szyfrowania połączenia HTTPS", "Do generowania losowych liczb", "Do sprawdzania długości hasła", "Hasło przechowujemy jako hash, a sprawdzamy je przez password_verify()."],
            ["Co robi polecenie git commit?", "Zapisuje zmiany w lokalnym repozytorium", "Wysyła zmiany na serwer zdalny", "Pobiera zmiany ze zdalnego repozytorium", "Tworzy nową gałąź", "Na serwer wysyła dopiero git push."],
            ["Który format danych jest najczęściej używany w API REST?", "JSON", "MP3", "TTF", "ISO", "JSON jest lekki i czytelny, a obsługuje go każdy język."],
        ];
        // Runda quizu: QUIZ_LEN pytań, potem podsumowanie i automatyczny reset (totem działa bez dotyku).
        const QUIZ_LEN = 5;
        const QUIZ_REVEAL_MS = 25 * 1000;   // po tylu sekundach bez odpowiedzi pokazujemy poprawną
        const QUIZ_NEXT_MS = 40 * 1000;     // po tylu sekundach przechodzimy dalej
        const QUIZ_AFTER_ANSWER_MS = 20 * 1000;
        const QUIZ_RESULT_MS = 15 * 1000;   // tyle widać wynik rundy, potem nowa runda
        let quiz = { order: [], pos: 0, ok: 0, answered: 0, finished: false, cur: null, tReveal: null, tNext: null };

        function quizClearTimers() { clearTimeout(quiz.tReveal); clearTimeout(quiz.tNext); }
        function quizMeta(extra) {
            const el = document.getElementById('quizMeta');
            if (el) el.textContent = extra;
        }
        function startQuizRound() {
            const idx = quizBank.map((_, i) => i);
            for (let i = idx.length - 1; i > 0; i--) {          // tasowanie Fisher–Yates
                const j = Math.floor(Math.random() * (i + 1));
                [idx[i], idx[j]] = [idx[j], idx[i]];
            }
            quiz.order = idx.slice(0, QUIZ_LEN);
            quiz.pos = 0; quiz.ok = 0; quiz.answered = 0; quiz.finished = false;
            showQuestion();
        }
        function quizScoreLine() {
            return `Pytanie ${quiz.pos + 1}/${QUIZ_LEN} · wynik ${quiz.ok}/${quiz.answered} · baza: ${quizBank.length} pytań`;
        }
        function showQuestion() {
            quizClearTimers();
            const [q, good, ...rest] = quizBank[quiz.order[quiz.pos]];
            const expl = rest.pop();
            const opts = [good, ...rest].map(t => ({ t, ok: t === good })).sort(() => Math.random() - 0.5);
            quiz.cur = { opts, expl, done: false };
            document.getElementById('randomQuestion').textContent = q;
            const box = document.getElementById('quizOpts');
            const ex = document.getElementById('quizExpl');
            box.innerHTML = ''; ex.textContent = ''; ex.className = 'quiz-expl';
            opts.forEach((o, n) => {
                const b = document.createElement('button');
                b.className = 'quiz-opt';
                b.textContent = 'ABCD'[n] + '.  ' + o.t;
                b.onclick = () => {
                    if (quiz.cur.done) return;
                    quiz.cur.done = true;
                    clearTimeout(quiz.tReveal); clearTimeout(quiz.tNext);
                    box.querySelectorAll('button').forEach((x, k) => {
                        x.disabled = true;
                        if (opts[k].ok) x.classList.add('is-good');
                    });
                    quiz.answered++;
                    if (o.ok) { quiz.ok++; b.classList.add('is-good'); ex.className = 'quiz-expl is-good'; ex.textContent = '✅ Dobrze! ' + expl; }
                    else { b.classList.add('is-bad'); ex.className = 'quiz-expl is-bad'; ex.textContent = '❌ Poprawna odpowiedź jest zaznaczona na zielono. ' + expl; }
                    quizMeta(quizScoreLine());
                    quiz.tNext = setTimeout(quizAdvance, QUIZ_AFTER_ANSWER_MS);
                };
                box.appendChild(b);
            });
            document.getElementById('quizNext').textContent = quiz.pos === QUIZ_LEN - 1 ? '🏁 Zobacz wynik' : '➡️ Następne pytanie';
            quizMeta(quizScoreLine());
            // bez dotyku: po chwili ujawniamy poprawną odpowiedź, potem idziemy dalej
            quiz.tReveal = setTimeout(quizReveal, QUIZ_REVEAL_MS);
            quiz.tNext = setTimeout(quizAdvance, QUIZ_NEXT_MS);
        }
        function quizReveal() {
            if (!quiz.cur || quiz.cur.done) return;
            quiz.cur.done = true;
            document.querySelectorAll('#quizOpts button').forEach((x, k) => {
                x.disabled = true;
                if (quiz.cur.opts[k].ok) x.classList.add('is-good');
            });
            const ex = document.getElementById('quizExpl');
            ex.className = 'quiz-expl';
            ex.textContent = '💡 ' + quiz.cur.expl;
        }
        function showQuizResult() {
            quizClearTimers();
            quiz.finished = true; quiz.cur = null;
            const q = document.getElementById('randomQuestion');
            const ex = document.getElementById('quizExpl');
            document.getElementById('quizOpts').innerHTML = '';
            ex.className = 'quiz-expl';
            if (quiz.answered === 0) {
                q.textContent = `🏁 To już wszystkie ${QUIZ_LEN} pytań tej rundy.`;
            } else {
                const verdict = quiz.ok >= 4 ? '🎉 Świetnie!' : quiz.ok >= 2 ? '👍 Nieźle!' : '📚 Następnym razem pójdzie lepiej!';
                q.textContent = `🏁 Koniec rundy — wynik: ${quiz.ok}/${QUIZ_LEN}. ${verdict}`;
            }
            ex.textContent = 'Za chwilę nowa runda…';
            document.getElementById('quizNext').textContent = '🔁 Nowa runda';
            quizMeta(`Runda: ${QUIZ_LEN} pytań · baza: ${quizBank.length} pytań`);
            quiz.tNext = setTimeout(startQuizRound, QUIZ_RESULT_MS);
        }
        function quizAdvance() {
            quizClearTimers();
            if (quiz.finished) return startQuizRound();
            if (quiz.pos + 1 < QUIZ_LEN) { quiz.pos++; showQuestion(); }
            else showQuizResult();
        }
        startQuizRound();

        /* ======================= Imieniny ======================= */
                const imieninyData = {

            "01-01": ["Mieczysław", "Mieszko"],
            "01-02": ["Abel", "Achacy", "Aspazja", "Grzegorz", "Makary"],
            "01-03": ["Danuta", "Genowefa", "Piotr"],
            "01-04": ["Aniela", "Dobromir", "Tytus"],
            "01-05": ["Edward", "Emilian", "Szymon"],
            "01-06": ["Andrzej", "Baltazar", "Kacper", "Melchior"],
            "01-07": ["Julian", "Lucjan", "Walenty"],
            "01-08": ["Artur", "Mścisław", "Seweryn"],
            "01-09": ["Alicja", "Feliks", "Julian"],
            "01-10": ["Dobrosław", "Jan", "Paweł"],
            "01-11": ["Feliks", "Honorata", "Matylda"],
            "01-12": ["Antoni", "Arkadiusz", "Benedykt"],
            "01-13": ["Bogumił", "Weronika"],
            "01-14": ["Feliks", "Marta", "Nina"],
            "01-15": ["Arnold", "Dąbrówka", "Paweł"],
            "01-16": ["Marceli", "Waleria"],
            "01-17": ["Antoni", "Jan", "Rościsław"],
            "01-18": ["Bogumiła", "Małgorzata", "Piotr"],
            "01-19": ["Henryk", "Mariusz", "Marta"],
            "01-20": ["Fabian", "Sebastian"],
            "01-21": ["Agnieszka", "Jarosław"],
            "01-22": ["Anastazy", "Wincenty"],
            "01-23": ["Ildefons", "Rajmund"],
            "01-24": ["Felicja", "Franciszek", "Rafał"],
            "01-25": ["Miłosz", "Paweł", "Tatiana"],
            "01-26": ["Lutosław", "Paulina", "Tymoteusz"],
            "01-27": ["Aniela", "Julian", "Przybysław"],
            "01-28": ["Agnieszka", "Karol", "Walerian"],
            "01-29": ["Franciszek", "Konstancja", "Zdzisław"],
            "01-30": ["Feliks", "Maciej", "Martyna"],
            "01-31": ["Jan", "Ksawery", "Marcelina"],
            "02-01": ["Brygida", "Seweryn", "Ignacy"],
            "02-02": ["Joanna", "Korneliusz", "Miłosława", "Maria"],
            "02-03": ["Błażej", "Oskar", "Telimena", "Stefan"],
            "02-04": ["Andrzej", "Gilbert", "Weronika"],
            "02-05": ["Agata", "Adelajda", "Jakub"],
            "02-06": ["Dorota", "Bogdan", "Paweł"],
            "02-07": ["Ryszard", "Teodor", "Partenia"],
            "02-08": ["Hieronim", "Piotr", "Sebastian"],
            "02-09": ["Eryka", "Apolonia", "Cyryl"],
            "02-10": ["Elwira", "Scholastyka", "Wilhelm"],
            "02-11": ["Olgierd", "Dezyderia", "Lucjan"],
            "02-12": ["Eulalia", "Modest", "Damian"],
            "02-13": ["Grzegorz", "Katarzyna", "Gilbert"],
            "02-14": ["Walenty", "Cyryl", "Metody"],
            "02-15": ["Jowita", "Faustyn", "Georgia"],
            "02-16": ["Danuta", "Julianna", "Daniel"],
            "02-17": ["Donat", "Zbigniew", "Łukasz"],
            "02-18": ["Szymon", "Konstancja", "Flawian"],
            "02-19": ["Arnold", "Konrad", "Marceli"],
            "02-20": ["Leon", "Ludmiła", "Eustachy"],
            "02-21": ["Eleonora", "Feliks", "Teodor"],
            "02-22": ["Marta", "Małgorzata", "Piotr"],
            "02-23": ["Romana", "Damian", "Izabela"],
            "02-24": ["Maciej", "Bogusz", "Sergiusz"],
            "02-25": ["Wiktor", "Cezary", "Zygfryd"],
            "02-26": ["Aleksander", "Mirosław", "Dionizy"],
            "02-27": ["Gabriel", "Anastazja", "Roman"],
            "02-28": ["Makary", "Roman", "Ludomir"],
            "02-29": ["Antonia", "August", "Dobrosiodł", "Oswald", "Roman"],
            "03-01": ["Antoni", "Dawid", "Edward"],
            "03-02": ["Alina", "Euzebiusz", "Joanna"],
            "03-03": ["Klemens", "Mirosław", "Radosław"],
            "03-04": ["Kazimierz", "Lucja", "Wincenty"],
            "03-05": ["Adrianna", "Florian", "Grzegorz"],
            "03-06": ["Paulina", "Wiktor", "Ryszard"],
            "03-07": ["Feliks", "Mieczysław", "Tomasz"],
            "03-08": ["Beata", "Jan", "Sławomir"],
            "03-09": ["Bogdan", "Cyprian", "Lidia"],
            "03-10": ["Aleksandra", "Franciszek", "Ludwika"],
            "03-11": ["Konstanty", "Zbigniew", "Mieczysława"],
            "03-12": ["Gabrysia", "Gwidon", "Łucja"],
            "03-13": ["Ewa", "Mikołaj", "Symeon"],
            "03-14": ["Matylda", "Stela", "Serafin"],
            "03-15": ["Krzysztof", "Klaudia", "Łukasz"],
            "03-16": ["Albert", "Julia", "Stefan"],
            "03-17": ["Patryk", "Marzena", "Zofia"],
            "03-18": ["Edward", "Kacper", "Agnieszka"],
            "03-19": ["Józef", "Marta", "Wacław"],
            "03-20": ["Andrzej", "Leon", "Róża"],
            "03-21": ["Benedykta", "Liborius", "Katarzyna"],
            "03-22": ["Łukasz", "Szymon", "Tekla"],
            "03-23": ["Emilia", "Gabriel", "Olga"],
            "03-24": ["Marek", "Roma", "Zbigniew"],
            "03-25": ["Cezary", "Maria", "Melania"],
            "03-26": ["Alina", "Mariusz", "Zdzisław"],
            "03-27": ["Eustachy", "Zenon", "Andrzej"],
            "03-28": ["Daria", "Karol", "Wiktoria"],
            "03-29": ["Hania", "Rufin", "Władysław"],
            "03-30": ["Joanna", "Ludwik", "Zofia"],
            "03-31": ["Balbina", "Mieczysław", "Wiktor"],
            "04-01": ["Irena", "Witold", "Teresa"],
            "04-02": ["Franciszek", "Marian", "Paweł"],
            "04-03": ["Richard", "Wincenty", "Julia"],
            "04-04": ["Aleksandra", "Gabriel", "Izabela"],
            "04-05": ["Adolf", "Emanuel", "Krystyna"],
            "04-06": ["Grzegorz", "Janina", "Wiktor"],
            "04-07": ["Herman", "Rufin", "Józefa"],
            "04-08": ["Julianna", "Józef", "Zygmunt"],
            "04-09": ["Mirosław", "Władysław", "Maria"],
            "04-10": ["Andrzej", "Marek", "Małgorzata"],
            "04-11": ["Feliks", "Leokadia", "Stanisław"],
            "04-12": ["Emma", "Julia", "Przemysław"],
            "04-13": ["Kasper", "Maria", "Ryszard"],
            "04-14": ["Helena", "Wojciech", "Justyna"],
            "04-15": ["Anita", "Marceli", "Wacław"],
            "04-16": ["Cecylia", "Jacek", "Szymon"],
            "04-17": ["Anna", "Marian", "Rudolf"],
            "04-18": ["Bogumił", "Czesław", "Ludwika"],
            "04-19": ["Emma", "Leon", "Zofia"],
            "04-20": ["Agnieszka", "Piotr", "Teodor"],
            "04-21": ["Feliks", "Konstancja", "Wiktor"],
            "04-22": ["Aleksander", "Natalia", "Sławomir"],
            "04-23": ["Jerzy", "Wojciech", "Zuzanna"],
            "04-24": ["Bolesław", "Ewa", "Norbert"],
            "04-25": ["Marek", "Maria", "Paweł"],
            "04-26": ["Alina", "Florian", "Władysław"],
            "04-27": ["Aleksandra", "Irena", "Kazimierz"],
            "04-28": ["Bogusław", "Maria", "Radosław"],
            "04-29": ["Katarzyna", "Piotr", "Robert"],
            "04-30": ["Joanna", "Ludwik", "Piotr"],
            "05-01": ["Józef", "Filip", "Walenty"],
            "05-02": ["Antonina", "Jan", "Michał"],
            "05-03": ["Jakub", "Krzysztof", "Sandra"],
            "05-04": ["Irena", "Monika", "Florian"],
            "05-05": ["Andrzej", "Marian", "Joanna"],
            "05-06": ["Eugenia", "Natasza", "Władysław"],
            "05-07": ["Ewa", "Michał", "Sławomir"],
            "05-08": ["Barbara", "Stanisław", "Maria"],
            "05-09": ["Dominik", "Mirosław", "Zuzanna"],
            "05-10": ["Aleksandra", "Cezary", "Teresa"],
            "05-11": ["Barbara", "Marian", "Mirosław"],
            "05-12": ["Ewa", "Leszek", "Stanisława"],
            "05-13": ["Andrzej", "Krystyna", "Radosław"],
            "05-14": ["Bonifacy", "Maciej", "Mieczysława"],
            "05-15": ["Irena", "Zbigniew", "Marek"],
            "05-16": ["Julian", "Stefan", "Tadeusz"],
            "05-17": ["Monika", "Paschalis", "Wacław"],
            "05-18": ["Anita", "Jan", "Julian"],
            "05-19": ["Celestyn", "Wiktoria", "Zenon"],
            "05-20": ["Bernard", "Maria", "Zofia"],
            "05-21": ["Ewa", "Helena", "Roman"],
            "05-22": ["Emil", "Jadwiga", "Zygmunt"],
            "05-23": ["Andrzej", "Irena", "Mieczysław"],
            "05-24": ["Donata", "Julia", "Wojciech"],
            "05-25": ["Magdalena", "Mirosław", "Sławomir"],
            "05-26": ["Elżbieta", "Kasper", "Maciej"],
            "05-27": ["Ewa", "Grzegorz", "Stefan"],
            "05-28": ["Augustyn", "Klemens", "Krystyna"],
            "05-29": ["Paulina", "Piotr", "Teodor"],
            "05-30": ["Ferdinand", "Katarzyna", "Wojciech"],
            "05-31": ["Klemens", "Marta", "Mikołaj"],
            "06-01": ["Jakub", "Barnaba", "Emilia"],
            "06-02": ["Marceli", "Tadeusz", "Marta"],
            "06-03": ["Aleksander", "Karolina", "Klemens"],
            "06-04": ["Franciszek", "Elżbieta", "Wiktor"],
            "06-05": ["Bogusław", "Anastazja", "Ewa"],
            "06-06": ["Norbert", "Czesław", "Marianna"],
            "06-07": ["Robert", "Jan", "Izabela"],
            "06-08": ["Jarosław", "Medard", "Ewa"],
            "06-09": ["Feliks", "Irena", "Ludwik"],
            "06-10": ["Andrzej", "Małgorzata", "Michał"],
            "06-11": ["Barnaba", "Leon", "Róża"],
            "06-12": ["Onufry", "Leon", "Franciszka"],
            "06-13": ["Antoni", "Grzegorz", "Patrycja"],
            "06-14": ["Elżbieta", "Justyn", "Tomasz"],
            "06-15": ["Witold", "Zofia", "Władysław"],
            "06-16": ["Stefan", "Angelika", "Bogdan"],
            "06-17": ["Lidia", "Leszek", "Maria"],
            "06-18": ["Julia", "Mieczysław", "Marcin"],
            "06-19": ["Gertruda", "Juliusz", "Paula"],
            "06-20": ["Barbara", "Raoul", "Sławomir"],
            "06-21": ["Alicja", "Ignacy", "Roman"],
            "06-22": ["Paulina", "Jan", "Wiktoria"],
            "06-23": ["Jacek", "Emil", "Danuta"],
            "06-24": ["Jan", "Łucja", "Święto Jana"],
            "06-25": ["Władysław", "Amelia", "Mieczysława"],
            "06-26": ["Paulina", "Tadeusz", "Wojciech"],
            "06-27": ["Cyryl", "Joanna", "Stefan"],
            "06-28": ["Ireneusz", "Krystyna", "Zbigniew"],
            "06-29": ["Piotr", "Paweł", "Maria"],
            "06-30": ["Marian", "Teodor", "Danuta"],
            "07-01": ["Mariana", "Jan", "Bartłomiej"],
            "07-02": ["Mikołaj", "Jagoda", "Oskar"],
            "07-03": ["Antoni", "Elżbieta", "Stefan"],
            "07-04": ["Malwina", "Marek", "Andrzej"],
            "07-05": ["Ksenia", "Michał", "Tadeusz"],
            "07-06": ["Ewa", "Tomasz", "Maria"],
            "07-07": ["Ryszard", "Wojciech", "Agnieszka"],
            "07-08": ["Olga", "Paweł", "Izabela"],
            "07-09": ["Ludwika", "Roman", "Radosław"],
            "07-10": ["Aleksandra", "Andrzej", "Walenty"],
            "07-11": ["Olga", "Paweł", "Juliusz"],
            "07-12": ["Maria", "Bernard", "Justyna"],
            "07-13": ["Stefan", "Teresa", "Eryk"],
            "07-14": ["Amelia", "Jacek", "Władysław"],
            "07-15": ["Bonifacy", "Marta", "Andrzej"],
            "07-16": ["Karolina", "Maksymilian", "Zofia"],
            "07-17": ["Bolesław", "Kamil", "Marta"],
            "07-18": ["Emil", "Maria", "Andrzej"],
            "07-19": ["Franciszek", "Łucja", "Stanisław"],
            "07-20": ["Aleksander", "Jan", "Anna"],
            "07-21": ["Daniel", "Wanda", "Mieczysław"],
            "07-22": ["Magdalena", "Julia", "Marek"],
            "07-23": ["Sławomir", "Anna", "Zbigniew"],
            "07-24": ["Krzysztof", "Kinga", "Adam"],
            "07-25": ["Anna", "Ewa", "Paweł"],
            "07-26": ["Anna", "Ignacy", "Grzegorz"],
            "07-27": ["Marta", "Wiktor", "Julia"],
            "07-28": ["Sławomir", "Mieczysław", "Alina"],
            "07-29": ["Krystyna", "Piotr", "Stefan"],
            "07-30": ["Jan", "Paweł", "Bogumił"],
            "07-31": ["Ignacy", "Ludwika", "Hieronim"],
            "08-01": ["Ferdynand", "Ignacy", "Piotr"],
            "08-02": ["Stefan", "Ewa", "Franciszek"],
            "08-03": ["Lidia", "Jakub", "Małgorzata"],
            "08-04": ["Jan", "Dominik", "Bogumił"],
            "08-05": ["Krzysztof", "Maria", "Dawid"],
            "08-06": ["Mikołaj", "Melania", "Wiktor"],
            "08-07": ["Justyna", "Oskar", "Sara"],
            "08-08": ["Cyryl", "Katarzyna", "Romuald"],
            "08-09": ["Roman", "Irena", "Marceli"],
            "08-10": ["Władysław", "Ewa", "Klemens"],
            "08-11": ["Zofia", "Wiktor", "Julia"],
            "08-12": ["Klara", "Andrzej", "Bogusław"],
            "08-13": ["Hipolit", "Anna", "Emil"],
            "08-14": ["Maksymilian", "Maria", "Stefan"],
            "08-15": ["Maria", "Józef", "Napoleon"],
            "08-16": ["Roch", "Tadeusz", "Elżbieta"],
            "08-17": ["Mieczysław", "Anita", "Andrzej"],
            "08-18": ["Helena", "Marian", "Grzegorz"],
            "08-19": ["Julia", "Bartłomiej", "Lucyna"],
            "08-20": ["Bernard", "Aneta", "Stefan"],
            "08-21": ["Jacek", "Róża", "Krystyna"],
            "08-22": ["Daria", "Józef", "Wanda"],
            "08-23": ["Andrzej", "Irena", "Ignacy"],
            "08-24": ["Bartłomiej", "Maria", "Zenon"],
            "08-25": ["Łucja", "Jacek", "Stanisław"],
            "08-26": ["Kazimierz", "Wanda", "Bolesław"],
            "08-27": ["Monika", "Augustyn", "Paweł"],
            "08-28": ["Stanisław", "Beata", "Grzegorz"],
            "08-29": ["Ryszard", "Sandra", "Justyna"],
            "08-30": ["Michał", "Krystyna", "Ludwik"],
            "08-31": ["Alojzy", "Sławomir", "Tadeusz"],
            "09-01": ["Bronisław", "Gaja", "Ryszard"],
            "09-02": ["Justyna", "Stefan", "Ziemowit"],
            "09-03": ["Józef", "Lidia", "Grzegorz"],
            "09-04": ["Rozalia", "Jan", "Maria"],
            "09-05": ["Henryk", "Teresa", "Adam"],
            "09-06": ["Michał", "Lidia", "Seweryn"],
            "09-07": ["Regina", "Ludwik", "Jacek"],
            "09-08": ["Maria", "Adrianna", "Mieczysław"],
            "09-09": ["Anna", "Antoni", "Stanisław"],
            "09-10": ["Aleksandra", "Tomasz", "Igor"],
            "09-11": ["Daniel", "Sylwia", "Bartłomiej"],
            "09-12": ["Mikołaj", "Emilia", "Julia"],
            "09-13": ["Krystyna", "Andrzej", "Lidia"],
            "09-14": ["Pius", "Maria", "Piotr"],
            "09-15": ["Mieczysław", "Aleksandra", "Ignacy"],
            "09-16": ["Kornelia", "Jerzy", "Henryk"],
            "09-17": ["Stefan", "Franciszek", "Zofia"],
            "09-18": ["Irena", "Marek", "Ludwika"],
            "09-19": ["Józef", "Zuzanna", "Maksymilian"],
            "09-20": ["Katarzyna", "Czesław", "Bernard"],
            "09-21": ["Mateusz", "Teresa", "Michał"],
            "09-22": ["Filip", "Ewa", "Józef"],
            "09-23": ["Otylia", "Krzysztof", "Maria"],
            "09-24": ["Gerard", "Maria", "Teodor", "Tomir", "Uniegost"],
            "09-25": ["Łucja", "Florian", "Paweł"],
            "09-26": ["Kosma", "Elżbieta", "Sylwester"],
            "09-27": ["Wincenty", "Ksenia", "Tomasz"],
            "09-28": ["Wacław", "Hania", "Łukasz"],
            "09-29": ["Michał", "Jacek", "Daniel"],
            "09-30": ["Hieronim", "Zofia", "Paweł"],
            "10-01": ["Heloiza", "Remigiusz", "Świętosawa"],
            "10-02": ["Teodor", "Aniela", "Julian"],
            "10-03": ["Franciszek", "Zofia", "Wincenty"],
            "10-04": ["Franciszka", "Jacek", "Justyna"],
            "10-05": ["Waleria", "Eryk", "Igor"],
            "10-06": ["Bruno", "Teresa", "Michał"],
            "10-07": ["Maria", "Ryszard", "Olga"],
            "10-08": ["Szymon", "Jadwiga", "Irena"],
            "10-09": ["Denis", "Wiktoria", "Anna"],
            "10-10": ["Franciszek", "Eugeniusz", "Maria"],
            "10-11": ["Brygida", "Wilhelm", "Seweryn"],
            "10-12": ["Wilhelmina", "Jan", "Ludwik"],
            "10-13": ["Edward", "Celina", "Krystyna"],
            "10-14": ["Karolina", "Andrzej", "Honorata"],
            "10-15": ["Teresa", "Michał", "Krzysztof"],
            "10-16": ["Jadwiga", "Florian", "Michał"],
            "10-17": ["Małgorzata", "Antoni", "Marcin"],
            "10-18": ["Łukasz", "Janina", "Tomasz"],
            "10-19": ["Wiktor", "Zofia", "Paweł"],
            "10-20": ["Jacek", "Ksenia", "Mieczysław"],
            "10-21": ["Urszula", "Kamil", "Jakub"],
            "10-22": ["Marek", "Hania", "Julian"],
            "10-23": ["Emil", "Irena", "Aleksandra"],
            "10-24": ["Antoni", "Rafał", "Małgorzata"],
            "10-25": ["Beata", "Łucja", "Bogdan"],
            "10-26": ["Daria", "Konrad", "Alojzy"],
            "10-27": ["Izydor", "Olga", "Sławomir"],
            "10-28": ["Judyta", "Sebastian", "Władysław"],
            "10-29": ["Michał", "Zenon", "Bożena"],
            "10-30": ["Łukasz", "Leon", "Julia"],
            "10-31": ["Oktawia", "Wiktor", "Marian"],
            "11-01": ["Anna", "Augustyn", "Bożena", "Elżbieta", "Franciszek", "Grzegorz", "Henryk", "Hubert", "Jakub", "Jan", "Jerzy", "Józef", "Kazimierz", "Krystyna", "Maria", "Mieczysław", "Paulina", "Rafał", "Ryszard", "Teresa", "Tomasz", "Wacław", "Wiktoria"],
            "11-02": ["Adolf", "Alina", "Bronisław", "Dionizy", "Dominik", "Ewa", "Ludwik", "Maria", "Mateusz", "Michał", "Mieczysław", "Olga", "Patrycja", "Piotr", "Romuald", "Stefan", "Sylwia", "Władysław"],
            "11-03": ["Hubert", "Kornelia", "Zenon"],
            "11-04": ["Karol", "Filip", "Maria"],
            "11-05": ["Wincenty", "Sylvia", "Daria"],
            "11-06": ["Leon", "Elżbieta", "Melania"],
            "11-07": ["Hubert", "Klemens", "Edward"],
            "11-08": ["Bernard", "Dymitr", "Teodor"],
            "11-09": ["Teodor", "Leonard", "Beata"],
            "11-10": ["Andrzej", "Eugeniusz", "Maurycy"],
            "11-11": ["Maria", "Mikołaj", "Karolina"],
            "11-12": ["Renata", "Wacław", "Grzegorz"],
            "11-13": ["Stanisław", "Kasia", "Jan"],
            "11-14": ["Jacek", "Filip", "Mieczysław"],
            "11-15": ["Albert", "Amelia"],
            "11-16": ["Marcjan", "Gertruda", "Błażej"],
            "11-17": ["Grzegorz", "Salomea", "Filip"],
            "11-18": ["Klaudia", "Romuald", "Zygmunt"],
            "11-19": ["Elżbieta", "Patryk", "Rafał"],
            "11-20": ["Andrzej", "Edyta", "Sylwia"],
            "11-21": ["Marian", "Cecylia", "Jan"],
            "11-22": ["Artur", "Kazimiera", "Aleksander"],
            "11-23": ["Klemens", "Aleksander", "Renata"],
            "11-24": ["Rafał", "Marta", "Kornelia"],
            "11-25": ["Katarzyna", "Andrzej", "Marian"],
            "11-26": ["Jan", "Zenon", "Cecylia"],
            "11-27": ["Elżbieta", "Władysław", "Janina"],
            "11-28": ["Jakub", "Stefania", "Antoni"],
            "11-29": ["Błażej", "Zofia", "Barbara"],
            "11-30": ["Andrzej", "Maura", "Justyna"],
            "12-01": ["Eligiusz", "Natalia", "Edmund"],
            "12-02": ["Barbara", "Balbina", "Franciszek"],
            "12-03": ["Aleksander", "Franciszek", "Justyna"],
            "12-04": ["Anna", "Barbara", "Grzegorz"],
            "12-05": ["Krzysztof", "Maria", "Sabina"],
            "12-06": ["Mikołaj", "Nikola", "Zofia"],
            "12-07": ["Ambroży", "Kornelia", "Stanisław"],
            "12-08": ["Maria", "Mieczysław", "Stefania"],
            "12-09": ["Anna", "Lech", "Wanda"],
            "12-10": ["Jolanta", "Roman", "Zygmunt"],
            "12-11": ["Daniel", "Wacław", "Anna"],
            "12-12": ["Aleksander", "Dariusz", "Ryszard"],
            "12-13": ["Łukasz", "Lucyna", "Eugeniusz"],
            "12-14": ["Barbara", "Albert", "Emil"],
            "12-15": ["Natasza", "Maria", "Tomasz"],
            "12-16": ["Adelaide", "Maria", "Zygmunt"],
            "12-17": ["Olimpia", "Maria", "Nataniel"],
            "12-18": ["Grzegorz", "Lucyna", "Jagoda"],
            "12-19": ["Faustyna", "Gabriela", "Jan"],
            "12-20": ["Dominik", "Rafał", "Magdalena"],
            "12-21": ["Piotr", "Tomasz", "Andrzej"],
            "12-22": ["Żaneta", "Julian", "Urszula"],
            "12-23": ["Ignacy", "Maria", "Olga"],
            "12-24": ["Adam", "Ewa", "Józef"],
            "12-25": ["Jezus"],
            "12-26": ["Szczepan", "Maria", "Stefan"],
            "12-27": ["Jan", "Tomasz", "Marian"],
            "12-28": ["Sylwester", "Jacek", "Edward"],
            "12-29": ["Tomasz", "Maria", "Sabina"],
            "12-30": ["Mieczysław", "Żaneta", "Andrzej"],
            "12-31": ["Sylwester", "Daniel", "Wiktoria"]

        };

        function wyswietlImieniny() {
            const dzis = new Date();
            const miesiac = String(dzis.getMonth() + 1).padStart(2, '0');
            const dzien = String(dzis.getDate()).padStart(2, '0');
            const klucz = `${miesiac}-${dzien}`;
            const imieniny = imieninyData[klucz];
            const el = document.getElementById('imieninyValue');
            el.textContent = imieniny ? imieniny.join(', ') : 'Brak danych na dziś.';
            // Wersja "na żywo" (kalendarz PL) nadpisuje tabelę lokalną, jeśli API odpowie
            fetch('https://api.abalin.net/today?country=pl&timezone=Europe/Warsaw').then(r => r.json()).then(d => {
                const n = d && d.data && d.data.namedays && d.data.namedays.pl;
                if (n && typeof n === 'string') el.textContent = n;
            }).catch(() => {});
        }
        wyswietlImieniny();
        setInterval(wyswietlImieniny, 30 * 60 * 1000);

        /* ======================= Nietypowe święta ======================= */
        async function ladujSwieta() {
            const today = new Date();
            const dzien = today.getDate();
            const miesiac = today.getMonth() + 1;
            const miesiacSlownie = miesiace[miesiac - 1];
            const url = `https://pniedzwiedzinski.github.io/kalendarz-swiat-nietypowych/${miesiac}/${dzien}.json`;
            const kontener = document.getElementById('holidayText');
            try {
                const res = await fetch(url);
                const lista = await res.json();
                if (lista.length === 0) {
                    kontener.innerHTML = `Dziś, ${dzien} ${miesiacSlownie}, nie obchodzimy żadnych nietypowych świąt. 😴`;
                } else {
                    let tekst = `Dziś (${dzien} ${miesiacSlownie}) obchodzimy:<ul>`;
                    tekst += lista.map(s => `<li>${escapeHtml(s.name)}</li>`).join('');
                    tekst += '</ul>';
                    kontener.innerHTML = tekst;
                }
            } catch (e) {
                console.error('Błąd:', e);
                kontener.innerHTML = 'Nie udało się wczytać świąt 😕';
            }
        }
        ladujSwieta();
        setInterval(ladujSwieta, 30 * 60 * 1000);

        /* ======================= Aktualności ze strony szkoły ======================= */
        const newsFallback = [
            { title: "14 września – Dzień Programisty", date: "17 września 2026", link: "https://www.zsi.kielce.pl/blog/2026/09/17/14-wrzesnia-dzien-programisty/" },
            { title: "Projekt „Dziś uczeń – jutro student” – nabór na rok szkolny 2026/2027", date: "11 września 2026", link: "https://www.zsi.kielce.pl/blog/2026/09/11/projekt-dzis-uczen-jutro-student-nabor-na-rok-szkolny-2026-2027/" },
            { title: "Spotkania z rodzicami", date: "7 września 2026", link: "https://www.zsi.kielce.pl/blog/2026/09/07/spotkania-z-rodzicami-3/" },
            { title: "Spotkanie z rodzicami uczniów klas pierwszych", date: "31 sierpnia 2026", link: "https://www.zsi.kielce.pl/blog/2026/08/31/spotkanie-z-rodzicami-uczniow-klas-pierwszych-2/" }
        ];

        // Karty z aktualnościami — sam tekst (tytuł + data), bez zdjęć. Dane te same → nie przerysowujemy listy.
        function renderNews(items, id = 'newsList') {
            const ul = document.getElementById(id);
            if (!ul) return;
            const list = items.slice(0, 4);
            const sig = JSON.stringify(list.map(i => [i.link, i.title, i.date]));
            if (ul.dataset.sig === sig) return;
            ul.dataset.sig = sig;
            ul.innerHTML = "";
            list.forEach(it => {
                const li = document.createElement('li');
                const d = document.createElement('span');
                d.className = 'news-date';
                d.textContent = it.date;
                const a = document.createElement('a');
                a.href = it.link; a.target = "_blank"; a.rel = "noopener noreferrer";
                a.textContent = it.title;
                li.append(d, a);
                ul.appendChild(li);
            });
        }

        const fmtDatePl = d => new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

        // Pobiera 4 ostatnie wpisy ze strony na WordPressie: najpierw REST API, w razie błędu (np. CORS) kanał RSS przez rss2json.
        async function fetchWpPosts(site) {
            try {
                const r = await fetch(`${site}/wp-json/wp/v2/posts?per_page=4&_fields=title,link,date`);
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const data = await r.json();
                if (!Array.isArray(data) || !data.length) throw new Error('Brak danych');
                return data.map(p => ({
                    title: decodeEntities(p.title && p.title.rendered ? p.title.rendered : 'Aktualność'),
                    date: fmtDatePl(p.date),
                    link: p.link
                }));
            } catch (e) {
                console.warn('REST niedostępny, próbuję RSS:', site, e);
                const j = await fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(site + '/feed/')).then(r => r.json());
                if (j.status !== 'ok' || !j.items || !j.items.length) throw new Error('RSS');
                return j.items.slice(0, 4).map(i => ({
                    title: decodeEntities(i.title),
                    date: fmtDatePl(String(i.pubDate).replace(' ', 'T')),
                    link: i.link
                }));
            }
        }
        async function loadNews() {
            try {
                renderNews(await fetchWpPosts('https://www.zsi.kielce.pl'));
            } catch (e) {
                console.error("Błąd aktualności:", e);
                renderNews(newsFallback);
            }
        }
        loadNews();
        setInterval(loadNews, 30 * 60 * 1000);

        /* ======================= Radiowęzeł: equalizer ======================= */
        const dzwonekAudio = document.getElementById('dzwonekAudio');
        const eqBars = document.getElementById('eqBars');
        if (dzwonekAudio) {
            dzwonekAudio.addEventListener('play', () => eqBars.classList.add('is-playing'));
            dzwonekAudio.addEventListener('pause', () => eqBars.classList.remove('is-playing'));
            dzwonekAudio.addEventListener('ended', () => eqBars.classList.remove('is-playing'));
        }

        /* ======================= Galeria: lightbox ======================= */
        function openLightbox(src, alt) {
            document.getElementById('lightboxImg').src = src;
            document.getElementById('lightboxImg').alt = alt || '';
            document.getElementById('lightbox').classList.add('is-open');
        }
        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('is-open');
            document.getElementById('lightboxImg').src = '';
        }
        document.querySelectorAll('#erasmusGallery img').forEach(img => {
            img.style.cursor = 'zoom-in';
            img.tabIndex = 0;
            img.addEventListener('click', () => openLightbox(img.src, img.alt));
            img.addEventListener('keydown', e => { if (e.key === 'Enter') openLightbox(img.src, img.alt); });
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

        /* ======================= Pasek przewijany (ticker) ======================= */
        function buildTicker() {
            // Pasek: pogoda + prognoza (jeden wpis), powietrze, urodzeni, zmarli i kursy.
            // Tych informacji nie ma w kafelkach, więc nic się nie dubluje.
            const track = document.getElementById('tickerTrack');
            if (!track) return;
            const weather = tickerData.wx
                ? `🌡️ ${tickerData.wx}${tickerData.forecast ? ' · dalej: ' + tickerData.forecast : ''}`
                : (tickerData.forecast ? `🌡️ Kielce, prognoza: ${tickerData.forecast}` : '');
            const parts = [weather, tickerData.air, tickerData.births, tickerData.deaths, tickerData.fx].filter(Boolean);
            if (!parts.length) return;
            const html = parts.map(p => `<span class="item">${escapeHtml(p)}<span class="dot-sep">●</span></span>`).join('');
            track.innerHTML = `<span class="ticker-half">${html}</span><span class="ticker-half">${html}</span>`;
            const chars = parts.reduce((s, p) => s + p.length, 0);
            track.style.animationDuration = Math.max(40, Math.round(chars * 0.2)) + 's';
        }
        setTimeout(buildTicker, 1500);
        setInterval(buildTicker, 5 * 60 * 1000);


/* ======================= Nowe API: powietrze + słońce (Open-Meteo, bez klucza) ======================= */
const KIELCE = { lat: 50.87, lon: 20.63 };
function aqiLabel(v) {
    if (v == null) return '—';
    if (v <= 20) return 'bardzo dobra';
    if (v <= 40) return 'dobra';
    if (v <= 60) return 'umiarkowana';
    if (v <= 80) return 'dostateczna';
    if (v <= 100) return 'zła';
    return 'bardzo zła';
}
function kvRow(label, value) {
    const li = document.createElement('li');
    const a = document.createElement('span'); a.textContent = label;
    const b = document.createElement('strong'); b.textContent = value;
    li.append(a, b);
    return li;
}
async function loadAir() {
    const ul = document.getElementById('airList');
    try {
        const q = `latitude=${KIELCE.lat}&longitude=${KIELCE.lon}&timezone=Europe%2FWarsaw`;
        const [air, sun] = await Promise.all([
            fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}&current=european_aqi,pm2_5,pm10`).then(r => r.json()),
            fetch(`https://api.open-meteo.com/v1/forecast?${q}&daily=sunrise,sunset,uv_index_max&forecast_days=1`).then(r => r.json())
        ]);
        tickerData.air = `🌫️ Powietrze w Kielcach: ${aqiLabel(air.current.european_aqi)} (AQI ${Math.round(air.current.european_aqi)}) · PM2.5: ${Math.round(air.current.pm2_5)} · PM10: ${Math.round(air.current.pm10)} µg/m³`;
        const rise = sun.daily.sunrise[0], set = sun.daily.sunset[0];
        const mins = Math.round((new Date(set) - new Date(rise)) / 60000);
        ul.innerHTML = '';
        ul.append(
            kvRow('Wschód słońca', rise.slice(11, 16)),
            kvRow('Zachód słońca', set.slice(11, 16)),
            kvRow('Długość dnia', `${Math.floor(mins / 60)} h ${mins % 60} min`),
            kvRow('Maks. indeks UV', String(Math.round(sun.daily.uv_index_max[0])))
        );
        buildTicker();
    } catch (e) {
        console.error('Błąd Open-Meteo:', e);
        ul.innerHTML = '<li>Brak danych 😕</li>';
    }
}
loadAir();
setInterval(loadAir, 30 * 60 * 1000);

/* ======================= Nowe API: kursy walut (NBP, tabela A) ======================= */
async function loadFx() {
    try {
        const data = await fetch('https://api.nbp.pl/api/exchangerates/tables/A/last/2/?format=json').then(r => r.json());
        const [prev, cur] = data;
        const parts = ['EUR', 'USD', 'GBP', 'CHF', 'CZK', 'NOK', 'SEK', 'UAH'].map(code => {
            const r = cur.rates.find(x => x.code === code), p = prev.rates.find(x => x.code === code);
            if (!r) return null;
            const arrow = p ? (r.mid > p.mid ? ' ▲' : r.mid < p.mid ? ' ▼' : ' ▬') : '';
            return `${code} ${r.mid.toFixed(code === 'CZK' || code === 'UAH' || code === 'NOK' || code === 'SEK' ? 4 : 4).replace('.', ',')} zł${arrow}`;
        }).filter(Boolean);
        tickerData.fx = `💶 Kursy NBP z ${cur.effectiveDate}: ${parts.join(' · ')}`;
        buildTicker();
    } catch (e) { console.error('Błąd NBP:', e); }
}
loadFx();
setInterval(loadFx, 60 * 60 * 1000);

/* ======================= Nowe API: „Tego dnia w historii” (Wikipedia PL) ======================= */
async function historyPl(now) {
    const title = encodeURIComponent(`${now.getDate()}_${miesiace[now.getMonth()]}`);
    const html = await fetch(`https://pl.wikipedia.org/api/rest_v1/page/html/${title}`).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); });
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const out = { events: [], births: [], deaths: [] };
    let kind = '';
    doc.querySelectorAll('h2, h3, li').forEach(el => {
        if (/^H[23]$/.test(el.tagName)) {
            const t = el.textContent;
            kind = /urodzi/i.test(t) ? 'births' : /zmarl/i.test(t) ? 'deaths' : /wydarzenia/i.test(t) ? 'events' : (el.tagName === 'H2' ? '' : kind);
            return;
        }
        if (!kind) return;
        const m = el.textContent.trim().match(/^(\d{3,4})\s*[–—-]\s*(.+)$/s);
        if (m) out[kind].push({ year: +m[1], text: m[2].replace(/\s+/g, ' ').replace(/\[\d+\]/g, '') });
    });
    return out;
}
async function historyEn(now) {
    const get = t => fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/${t}/${now.getMonth() + 1}/${now.getDate()}`).then(r => r.json()).then(d => (d[t] || []).filter(e => e.text && e.year).map(e => ({ year: e.year, text: e.text })));
    const [events, births, deaths] = await Promise.all([get('events'), get('births'), get('deaths')]);
    return { events, births, deaths };
}
function fillHistory(id, ev, n) {
    const ul = document.getElementById(id);
    if (!ev || !ev.length) { ul.innerHTML = '<li>Brak danych 😕</li>'; return; }
    ev.sort((x, y) => x.year - y.year);
    // rozsądny rozrzut lat: od starszych po najnowsze
    const step = n > 1 ? (ev.length - 1) / (n - 1) : 0;
    const pick = [...new Set(Array.from({ length: n }, (_, k) => ev[Math.round(k * step * 0.97)]))];
    ul.innerHTML = '';
    pick.forEach(e => {
        const li = document.createElement('li');
        const y = document.createElement('span'); y.className = 'ev-date'; y.textContent = e.year;
        li.append(y, document.createTextNode(e.text.length > 150 ? e.text.slice(0, 147) + '…' : e.text));
        ul.append(li);
    });
}
// Urodzeni i zmarli trafiają na dolny pasek: po TICKER_HISTORY_N wpisów każdego rodzaju (razem 4), skrócone.
const TICKER_HISTORY_N = 2;
function shortenForTicker(t, max = 56) {
    t = String(t).replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();   // bez nawiasów, np. „(zm. 1955)”
    if (t.length <= max) return t;
    const cut = t.slice(0, max), sp = cut.lastIndexOf(' ');
    return cut.slice(0, sp > 28 ? sp : max).replace(/[\s,;:–-]+$/, '') + '…';
}
function historyTickerLine(list, label, n) {
    if (!list || !list.length) return '';
    const sorted = [...list].sort((x, y) => x.year - y.year);
    const modern = sorted.filter(e => e.year >= 1700);            // starożytność rzadko coś mówi uczniom
    const pool = modern.length >= n ? modern : sorted;
    const picks = Array.from({ length: Math.min(n, pool.length) }, (_, k) => pool[Math.floor((k + 0.5) * pool.length / Math.min(n, pool.length))]);
    return `${label}: ` + picks.map(e => `${e.year} ${shortenForTicker(e.text)}`).join(' · ');
}
async function loadHistory() {
    const now = new Date();
    let h = null;
    for (const src of [historyPl, historyEn]) {
        try { const r = await src(now); if (r.events.length || r.births.length || r.deaths.length) { h = r; break; } } catch (e) { console.error('Historia:', e); }
    }
    if (!h) h = { events: [], births: [], deaths: [] };
    if (!h.births.length || !h.deaths.length) { try { const en = await historyEn(now); h.births = h.births.length ? h.births : en.births; h.deaths = h.deaths.length ? h.deaths : en.deaths; } catch (e) {} }
    fillHistory('historyList', h.events, 4);
    tickerData.births = historyTickerLine(h.births, '🎂 Tego dnia urodzili się', TICKER_HISTORY_N);
    tickerData.deaths = historyTickerLine(h.deaths, '🕯️ Tego dnia zmarli', TICKER_HISTORY_N);
    buildTicker();
}
loadHistory();
setInterval(loadHistory, 6 * 60 * 60 * 1000);


/* ======================= Nowe API: prognoza na 3 kolejne dni (Open-Meteo) — trafia na pasek razem z pogodą ======================= */
async function loadForecast() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${KIELCE.lat}&longitude=${KIELCE.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FWarsaw&forecast_days=4`;
        const d = (await fetch(url).then(r => r.json())).daily;
        const parts = [];
        const SKROT = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
        for (let i = 1; i < 4; i++) {
            const dow = i === 1 ? 'jutro' : SKROT[new Date(d.time[i] + 'T12:00:00').getDay()];
            parts.push(`${dow} ${Math.round(d.temperature_2m_min[i])}…${Math.round(d.temperature_2m_max[i])}° 💧${d.precipitation_probability_max[i] ?? 0}%`);
        }
        tickerData.forecast = parts.join(', ');
        buildTicker();
    } catch (e) { console.error('Prognoza:', e); }
}
loadForecast();
setInterval(loadForecast, 60 * 60 * 1000);

/* ======================= Nowe API: Międzynarodowa Stacja Kosmiczna (wheretheiss.at) ======================= */
function distKm(lat1, lon1, lat2, lon2) {
    const R = 6371, rad = x => x * Math.PI / 180;
    const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}
async function loadIss() {
    const ul = document.getElementById('issList');
    try {
        const s = await fetch('https://api.wheretheiss.at/v1/satellites/25544').then(r => r.json());
        ul.innerHTML = '';
        ul.append(
            kvRow('Pozycja', `${Math.abs(s.latitude).toFixed(1)}°${s.latitude >= 0 ? 'N' : 'S'} ${Math.abs(s.longitude).toFixed(1)}°${s.longitude >= 0 ? 'E' : 'W'}`),
            kvRow('Wysokość', `${Math.round(s.altitude)} km`),
            kvRow('Prędkość', `${Math.round(s.velocity).toLocaleString('pl-PL')} km/h`),
            kvRow('Od Kielc', `${Math.round(distKm(KIELCE.lat, KIELCE.lon, s.latitude, s.longitude)).toLocaleString('pl-PL')} km`)
        );
    } catch (e) { console.error('ISS:', e); ul.innerHTML = '<li>Brak danych 😕</li>'; }
}
loadIss();
setInterval(loadIss, 20 * 1000);

/* ======================= Nowe API: najpopularniejsze nowe repozytoria tygodnia (GitHub) ======================= */
async function loadGithub() {
    const ul = document.getElementById('ghList');
    try {
        const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
        const data = await fetch(`https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=5`).then(r => r.json());
        if (!Array.isArray(data.items)) throw new Error('Brak danych');
        ul.innerHTML = '';
        data.items.forEach(r => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = r.html_url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = r.full_name;
            const st = document.createElement('strong'); st.textContent = '★ ' + r.stargazers_count.toLocaleString('pl-PL');
            li.append(a, st);
            ul.append(li);
        });
    } catch (e) { console.error('GitHub:', e); ul.innerHTML = '<li>Brak danych 😕</li>'; }
}
loadGithub();
setInterval(loadGithub, 2 * 60 * 60 * 1000);


/* ======================= Dobre wiadomości (dobrewiadomosci.net.pl) ======================= */
async function loadGood() {
    const ul = document.getElementById('goodList');
    try {
        renderNews(await fetchWpPosts('https://dobrewiadomosci.net.pl'), 'goodList');
    } catch (e) { console.error('Dobre wiadomości:', e); ul.innerHTML = '<li>Brak danych 😕</li>'; }
}
loadGood();
setInterval(loadGood, 15 * 60 * 1000);

/* ======================= Tryb totemu 9:16 (pion, bez dotyku) ======================= */
const TOTEM_W = 720; // szerokość projektowa; na ekranie 1080 px całość jest powiększona 1,5×
function applyTotem() {
    const on = /[?&]totem/.test(location.search) || (innerHeight / innerWidth > 1.5 && innerWidth >= 700);
    document.documentElement.classList.toggle('totem', on);
    document.body.style.zoom = on ? String(innerWidth / TOTEM_W) : '';
    return on;
}
applyTotem();
addEventListener('resize', applyTotem);
(function autoScroll() {
    // Automatyczne przewijanie w trybie totemu. Dotknięcie/kliknięcie zatrzymuje je (można wtedy spokojnie czytać
    // i przewijać ręcznie); po RESUME_MS bez dotyku totem sam wraca do przewijania.
    const RESUME_MS = 30 * 1000;
    const root = document.documentElement;
    let pos = 0, dir = 1, wait = 0, paused = false, idle = null;

    const pill = document.createElement('button');
    pill.className = 'scroll-pause';
    pill.hidden = true;
    pill.textContent = '⏸ Przewijanie zatrzymane — dotknij, aby wznowić';
    document.body.appendChild(pill);

    function pause() {
        paused = true;
        pill.hidden = false;
        clearTimeout(idle);
        idle = setTimeout(resume, RESUME_MS);
    }
    function resume() {
        paused = false;
        pill.hidden = true;
        clearTimeout(idle);
        pos = window.scrollY;      // kontynuujemy od miejsca, w którym ktoś zostawił stronę
        wait = 0;
    }
    ['pointerdown', 'wheel', 'keydown'].forEach(ev => addEventListener(ev, e => {
        if (!root.classList.contains('totem') || root.classList.contains('night-on')) return;
        if (e.target === pill) return;
        pause();
    }, { passive: true }));
    pill.addEventListener('click', resume);

    setInterval(() => {
        if (root.classList.contains('night-on')) { pos = 0; dir = 1; wait = 0; paused = false; pill.hidden = true; return; } // noc: strona ukryta, zaczynamy od góry
        if (!root.classList.contains('totem')) return;
        if (paused) return;
        if (wait > 0) { wait--; return; }
        const max = root.scrollHeight - innerHeight;
        if (max <= 0) return;
        pos = Math.max(0, Math.min(max, pos + dir * 1.2));
        scrollTo(0, pos);
        if (pos >= max || pos <= 0) { dir = -dir; wait = 200; } // ~6 s postoju na końcach
    }, 30);
})();
// Odświeżanie co noc (ok. 3:00), żeby totem nie „zawisł” na starych danych
(function nightlyReload() {
    const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate() + (n.getHours() >= 3 ? 1 : 0), 3, 0, 5);
    setTimeout(() => location.reload(), t - n);
})();


/* ======================= Tryb nocny: po lekcjach czarny ekran z analogowym zegarem ======================= */
// Ekran gaśnie o NIGHT_FROM (10 min po ostatniej lekcji, która kończy się o 18:10) i wraca o NIGHT_TO.
// Podgląd bez czekania do wieczora: dopisz ?night do adresu strony. ?day wyłącza tryb nocny.
const NIGHT_FROM = '18:20';
const NIGHT_TO = '07:00';
(function nightMode() {
    const root = document.documentElement;
    const overlay = document.getElementById('night');
    const face = document.getElementById('nightFace');
    const hHand = document.getElementById('nightHour');
    const mHand = document.getElementById('nightMin');
    if (!overlay || !face) return;

    // tarcza: 60 kresek (co 5. grubsza) + cyfry 1–12
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
    for (let i = 0; i < 60; i++) {
        const big = i % 5 === 0, a = i * 6 * Math.PI / 180;
        const r1 = 96, r2 = big ? 88 : 92.5;
        face.appendChild(mk('line', {
            x1: 100 + r1 * Math.sin(a), y1: 100 - r1 * Math.cos(a),
            x2: 100 + r2 * Math.sin(a), y2: 100 - r2 * Math.cos(a),
            class: big ? 'tick tick--big' : 'tick'
        }));
    }
    for (let n = 1; n <= 12; n++) {
        const a = n * 30 * Math.PI / 180, t = mk('text', {
            x: 100 + 74 * Math.sin(a), y: 100 - 74 * Math.cos(a), class: 'num',
            'text-anchor': 'middle', 'dominant-baseline': 'central'
        });
        t.textContent = n;
        face.appendChild(t);
    }

    const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
    const FROM = toMin(NIGHT_FROM), TO = toMin(NIGHT_TO);
    const forced = /[?&]night/.test(location.search);
    const noNight = /[?&]day/.test(location.search);   // ?day — wyłącza tryb nocny (do testów i serwisu)
    const isNight = d => {
        if (noNight) return false;
        if (forced) return true;
        const m = d.getHours() * 60 + d.getMinutes();
        return FROM > TO ? (m >= FROM || m < TO) : (m >= FROM && m < TO);
    };
    const rot = (el, deg) => el.setAttribute('transform', `rotate(${deg} 100 100)`);

    let last = null;
    function tick() {
        const now = new Date(), night = isNight(now);
        if (night !== last) {
            last = night;
            root.classList.toggle('night-on', night);
            overlay.classList.toggle('is-on', night);
            overlay.setAttribute('aria-hidden', String(!night));
            if (night) {
                if (typeof closeLightbox === 'function') closeLightbox();
                const au = document.getElementById('dzwonekAudio'); if (au && !au.paused) au.pause();
            } else {
                scrollTo(0, 0);
            }
        }
        if (!night) return;
        const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
        rot(mHand, m * 6 + s * 0.1);
        rot(hHand, h * 30 + m * 0.5);
    }
    tick();
    setInterval(tick, 1000);
})();
