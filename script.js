// script.js — Totem ZSI Kielce, wersja 3.0

/* ======================= Pomocnicze ======================= */
        function escapeHtml(str) {
            const d = document.createElement('div');
            d.textContent = String(str);
            return d.innerHTML;
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

        const DNI_TYGODNIA = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
                    const miesiace = [
                "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
                "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
            ];

        /* ======================= Zegar + data ======================= */
        function updateClock() {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('heroClock').textContent = `${hh}:${mm}:${ss}`;
            document.getElementById('heroDate').textContent =
                `${DNI_TYGODNIA[now.getDay()]}, ${now.getDate()} ${miesiace[now.getMonth()]} ${now.getFullYear()}`;
            document.getElementById('topbarDate').innerHTML =
                `${DNI_TYGODNIA[now.getDay()].slice(0, 3)}. <strong>${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}</strong>`;
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
            const endDate = new Date("2027-06-25T00:00:00");
            const now = new Date();
            const diff = endDate - now;
            const el = document.getElementById('countdownValue');
            if (diff <= 0) {
                el.textContent = "Zakończony!";
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            el.textContent = days + " dni";
        }
        updateCountdown();
        setInterval(updateCountdown, 1000 * 60 * 60);

        /* ======================= Wydarzenia szkolne ======================= */
             const events = [
    { date: "01.09", title: "Rozpoczęcie roku szkolnego" },

    { date: "14.10", title: "Dzień Edukacji Narodowej" },
    { date: "15.10", title: "Dzień wolny od zajęć dydaktycznych" },

    { date: "01.11", title: "Wszystkich Świętych" },
    { date: "02.11", title: "Dzień wolny od zajęć dydaktycznych" },
    { date: "11.11", title: "Narodowe Święto Niepodległości" },

    { date: "23.12 – 06.01", title: "Zimowa przerwa świąteczna" },

    { date: "01.02 – 14.02", title: "Ferie zimowe" },

    { date: "25.03 – 30.03", title: "Wiosenna przerwa świąteczna" },

    { date: "01.05 – 10.05", title: "Majówka / dni wolne od zajęć dydaktycznych" },

    { date: "25.06", title: "Zakończenie roku szkolnego" }
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
            "W 2025 roku będzie ponad 75 miliardów urządzeń IoT na świecie.",
            "Pierwszy dysk twardy miał pojemność 5 MB i ważył ponad 100 kg.",
            "Tranzystor to najmniejszy element współczesnych procesorów.",
            "W 1983 roku powstał pierwszy telefon komórkowy (ważył 1 kg).",
            "Język Java początkowo miał nazywać się Oak.",
            "Pierwsza gra komputerowa to „Tennis for Two” z 1958 roku.",
            "Słowo 'bug' w programowaniu pochodzi od znalezionego owada w komputerze.",
            "W 1975 roku powstał pierwszy komputer domowy – Altair 8800.",
            "Kapitalizacja liter ma znaczenie w systemach Linux/Unix.",
            "Najdłuższe hasło świata miało ponad 200 znaków.",
            "Pamięć RAM traci dane po odłączeniu zasilania – jest ulotna.",
            "System plików NTFS wprowadzono w systemie Windows NT.",
            "Słowo 'robot' pochodzi z czeskiego 'robota' – oznacza 'praca'.",
            "Pierwszy wirus komputerowy nazywał się 'Creeper'.",
            "Facebook początkowo był tylko dla studentów Harvardu.",
            "ASCII to standard kodowania znaków z lat 60.",
            "Pierwsze laptopy kosztowały ponad 3000 dolarów.",
            "W Japonii istniały komputery sterowane ruchem oczu już w 2003 roku.",
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
            "Gdyby internet był krajem, byłby jednym z największych konsumentów energii.",
            "Kod QR powstał w Japonii w 1994 roku.",
            "Hakerzy White Hat pomagają chronić systemy – nie atakować je.",
            "Pierwszy komputer Apple został zbudowany w garażu.",
            "W 1 GB mieści się około 1 miliarda bajtów.",
            "DNS to „książka telefoniczna internetu”.",
            "IPv6 pozwala na więcej adresów niż atomów we wszechświecie.",
            "Google używa ponad 1 miliona serwerów na całym świecie.",
            "Klawiatura QWERTY została zaprojektowana tak, by spowolnić pisanie – serio!",
            "System operacyjny Windows 1.0 został wydany w 1985 roku.",
            "Na Marsie działały łaziki sterowane przez systemy Linux.",
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
            "W Japonii można płacić rachunki automatycznie... przez lodówkę.",
            "Smartwatche były pokazane w kreskówkach zanim istniały naprawdę.",
            "Twórca języka Java, James Gosling, pracował wcześniej przy systemach rakietowych.",
            "Niektóre bankomaty nadal działają na Windows XP.",
            "W Brazylii hakerzy zainfekowali setki bankomatów w 2013 roku.",
            "Raspberry Pi to komputer wielkości karty kredytowej.",
            "Python zyskuje popularność głównie przez łatwość nauki.",
            "Pierwsze przeglądarki internetowe nie obsługiwały obrazków.",
            "Google indeksuje ponad 100 miliardów stron internetowych.",
            "Pierwszy ekran dotykowy wynaleziono w latach 60.",
            "HTML5 wprowadził natywne odtwarzanie wideo bez Flash.",
            "Język Assembly to niemal bezpośredni zapis rozkazów procesora.",
            "Stack Overflow powstał w 2008 roku.",
            "Hakerzy potrafią wykraść dane z mikrofonu... nawet przez słuchawki.",
            "Robotyka łączy informatykę, elektronikę i mechanikę.",
            "DNS działa jak spis telefonów – tłumaczy nazwy na IP.",
            "Serwery Google są rozproszone po całym świecie.",
            "Przeglądarka Opera była kiedyś płatna.",
            "Pierwsze komputery miały pamięć mniejszą niż zegarek.",
            "Język Scratch pomaga dzieciom uczyć się programowania wizualnie.",
            "Na świecie co sekundę powstaje tysiące stron internetowych.",
            "Niektóre wirusy komputerowe potrafią 'przeskakiwać' przez sieć WiFi.",
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
            "Najdłuższy kod źródłowy w historii miał ponad 50 milionów linii.",
            "MacOS bazuje na systemie Unix.",
            "Najwięcej ataków DDoS pochodzi z sieci zainfekowanych kamer i routerów.",
            "Pierwszy antywirus to program Reaper – polował na wirusa Creeper.",
            "Programiści często używają tzw. kaczek do debugowania (Duck Debugging).",
            "Facebook może rozpoznać twarz na zdjęciu szybciej niż człowiek.",
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
            "Kod źródłowy Linuksa jest dostępny publicznie.",
            "Na świecie działa ponad 1 miliard kamer monitoringu z AI.",
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
            "Ciekawostka: programowanie rozwija logiczne myślenie bardziej niż matematyka.",
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
            "Niektóre ataki można wykonać bez dotykania klawiatury — tylko przez sieć."
        ];

        function showDailyFact() {
            const today = new Date();
            const yearStart = new Date(today.getFullYear(), 0, 0);
            const diff = today - yearStart;
            const oneDay = 1000 * 60 * 60 * 24;
            const yearDay = Math.floor(diff / oneDay);
            const factIndex = yearDay % factsDaily.length;
            document.getElementById("factBox").textContent = factsDaily[factIndex];
        }
        showDailyFact();
        setInterval(showDailyFact, 30 * 60 * 1000);

        /* ======================= Generator pytań ======================= */
                const examQuestions = [
            "Wymień typowe urządzenia wchodzące w skład sieci komputerowej.",
            "Jakie są różnice między siecią LAN a WAN?",
            "Opisz budowę i działanie protokołu TCP/IP.",
            "Co to jest adres MAC i do czego służy?",
            "Jak skonfigurować statyczny adres IP w systemie Windows?",
            "Co oznacza skrót DNS i jaka jest jego funkcja?",
            "Wymień warstwy modelu OSI.",
            "Do czego służy polecenie ping?",
            "Jak działa przełącznik sieciowy (switch)?",
            "Czym różni się router od modemu?",
            "Wymień i opisz najważniejsze systemy plików.",
            "Jakie są rodzaje nośników danych i ich zastosowania?",
            "Jak zainstalować system Windows 10 z pendrive’a?",
            "Co to jest partycja dysku twardego?",
            "Jakie są różnice między BIOS a UEFI?",
            "Jak utworzyć kopię zapasową danych użytkownika?",
            "Co oznacza skrót POST w kontekście uruchamiania komputera?",
            "Czym jest wirtualizacja i jakie są jej zalety?",
            "Jakie są metody zabezpieczania dostępu do komputera?",
            "Wymień narzędzia do diagnostyki sprzętu komputerowego.",
            "Co to jest defragmentacja dysku?",
            "Opisz przebieg procesu instalacji systemu Linux.",
            "Jakie są polecenia do zarządzania plikami w terminalu Linux?",
            "Jak utworzyć użytkownika w systemie Linux?",
            "Jak zresetować hasło administratora w Windows?",
            "Do czego służy menedżer zadań w Windows?",
            "Jak zdiagnozować problem z kartą sieciową?",
            "Co oznacza adres IP klasy C?",
            "Jakie urządzenia sieciowe działają w warstwie 2 modelu OSI?",
            "Jak działa DHCP?",
            "Jakie są rodzaje kabli sieciowych i ich zastosowania?",
            "Jakie są podstawowe zabezpieczenia sieci Wi-Fi?",
            "Co to jest firewall i jak działa?",
            "Jakie są objawy uszkodzonego RAM?",
            "Wymień etapy projektowania sieci lokalnej.",
            "Czym jest topologia gwiazdy?",
            "Jak działa NAT?",
            "Do czego służy traceroute?",
            "Jak sprawdzić ustawienia sieci w systemie Linux?",
            "Jakie są korzyści ze stosowania RAID?",
            "Jakie znasz typy RAID?",
            "Jak odczytać SMART dysku twardego?",
            "Czym różni się dysk SSD od HDD?",
            "W jaki sposób zabezpieczyć komputer przed złośliwym oprogramowaniem?",
            "Jakie są przyczyny wolnego działania komputera?",
            "Czym jest protokół HTTPS i czym różni się od HTTP?",
            "Do czego służy SSH?",
            "Co to jest port w kontekście sieci?",
            "Jakie są podstawowe polecenia PowerShell?",
            "Czym jest serwer plików?",
            "Jak skonfigurować współdzielenie folderu w Windows?",
            "Wymień etapy procesu tworzenia oprogramowania.",
            "Co to jest analiza wymagań i dlaczego jest ważna?",
            "Opisz różnice między modelem kaskadowym a iteracyjnym.",
            "Jakie są podstawowe zasady programowania obiektowego?",
            "Co to jest klasa i obiekt w programowaniu?",
            "Wyjaśnij pojęcie dziedziczenia w programowaniu obiektowym.",
            "Co to jest enkapsulacja i jakie ma zalety?",
            "Czym są metody i pola klasy?",
            "Opisz różnice między językami programowania wysokiego i niskiego poziomu.",
            "Jak działa kompilator i interpreter?",
            "Co to jest algorytm i jakie są jego cechy?",
            "Napisz prosty algorytm sortowania bąbelkowego.",
            "Opisz strukturę instrukcji warunkowej if-else.",
            "Co to jest pętla i jakie typy pętli znasz?",
            "Jak działa pętla for oraz while?",
            "Co to jest rekurencja?",
            "Jakie są zasady nazewnictwa zmiennych?",
            "Opisz typy danych podstawowych w języku programowania.",
            "Co to jest funkcja i jak się ją definiuje?",
            "Jak przekazywać argumenty do funkcji?",
            "Czym różni się zmienna lokalna od globalnej?",
            "Co to jest wskaźnik?",
            "Jak działa obsługa błędów (try-catch)?",
            "Co to są wyjątki i jak je obsługiwać?",
            "Opisz podstawowe typy struktur danych: tablice, listy, stosy, kolejki.",
            "Jak działa wyszukiwanie liniowe i binarne?",
            "Co to jest graf i jak się go reprezentuje w programowaniu?",
            "Opisz podstawowe algorytmy grafowe (DFS, BFS).",
            "Co to jest baza danych?",
            "Jakie są podstawowe operacje CRUD?",
            "Czym różni się baza relacyjna od nierelacyjnej?",
            "Co to jest SQL i do czego służy?",
            "Napisz przykładowe zapytanie SELECT z warunkiem WHERE.",
            "Jak działa normalizacja baz danych?",
            "Co to jest klucz podstawowy i obcy?",
            "Jak zabezpieczyć bazę danych przed nieautoryzowanym dostępem?",
            "Co to jest system kontroli wersji (np. Git)?",
            "Jakie są podstawowe komendy Git (commit, push, pull)?",
            "Co to jest dokumentacja techniczna?",
            "Jak pisać czytelny i zrozumiały kod?",
            "Co to jest testowanie oprogramowania?",
            "Jakie są typy testów: jednostkowe, integracyjne, systemowe?",
            "Co to jest debugowanie?",
            "Jakie narzędzia służą do debugowania programów?",
            "Co to jest IDE i jakie znasz przykłady?",
            "Jak działają frameworki programistyczne?",
            "Co to jest REST API?",
            "Jakie są metody HTTP i ich zastosowanie?",
            "Co to jest JSON i XML?",

        ];

        function drawQuestion() {
            const randomIndex = Math.floor(Math.random() * examQuestions.length);
            document.getElementById("randomQuestion").textContent = examQuestions[randomIndex];
        }
        document.getElementById('quizMeta').textContent = `Baza: ${examQuestions.length} pytań`;

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
            "09-24": ["Gertruda", "Klemens", "Andrzej"],
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
            "11-30": ["Andrzej", "Andrzej", "Andrzej"],
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
            const parts = [];
            const ls = document.getElementById('lessonStatus')?.textContent;
            const lt = document.getElementById('lessonTimer')?.textContent;
            if (ls) parts.push(`${ls} — pozostało ${lt}`);

            const temp = document.getElementById('weatherTemp')?.textContent;
            const desc = document.getElementById('weatherDesc')?.textContent;
            if (temp && temp !== '--') parts.push(`Kielce: ${temp}°C, ${desc}`);

            const days = document.getElementById('countdownValue')?.textContent;
            if (days && days !== '--') parts.push(`Do końca roku szkolnego: ${days}`);

            const imien = document.getElementById('imieninyValue')?.textContent;
            if (imien && !imien.includes('Ładuję')) parts.push(`Imieniny: ${imien}`);

            const nextEv = getNextEventLabel();
            if (nextEv) parts.push(`Najbliżej: ${nextEv}`);

            const track = document.getElementById('tickerTrack');
            if (!track || parts.length === 0) return;
            const html = parts.map(p => `<span class="item">${escapeHtml(p)}<span class="dot-sep">●</span></span>`).join('');
            track.innerHTML = `<span class="ticker-half">${html}</span><span class="ticker-half">${html}</span>`;
        }
        setTimeout(buildTicker, 1500);
        setInterval(buildTicker, 60 * 1000);
