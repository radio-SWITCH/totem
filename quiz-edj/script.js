/* ==========================================================================
   script.js — Quiz „Jaki to język?” (Europejski Dzień Języków Obcych, ZSI Kielce)
   Logika quizu: rejestracja, rundy z fragmentami piosenek, tabela wyników, panel organizatora.
   Dane zapisują się tylko lokalnie (localStorage) na urządzeniu, na którym gra quiz.
   
   Konwencje (jak w całym repo — patrz README.md): nazwy po angielsku, komentarze po polsku,
   camelCase dla funkcji i zmiennych, UPPER_SNAKE_CASE dla stałych, ustawienia tylko w CONFIG.
   ========================================================================== */

/* ==========================================================================
   KONFIGURACJA — tu zmieniasz najważniejsze ustawienia quizu
   ========================================================================== */
const CONFIG = {
    totalRounds: 5,        // ile piosenek/pytań w jednym podejściu
    numOptions: 4,         // ile opcji językowych do wyboru w jednym pytaniu
    snippetSeconds: 12,     // maksymalna długość odtwarzanego fragmentu (s)
    autoReturnSeconds: 15,  // po ilu sekundach ekran wyniku wraca do startu
    adminPin: "4451",       // PIN do panelu organizatora — ZMIEŃ przed wydarzeniem!
    storageKey: "zsi_edj_quiz_v1",
};

/* Bank piosenek — DODAJ WŁASNE PRZED WYDARZENIEM!
   Każdy wpis to jeden fragment: { lang, file, start? }.
   - "lang"  — poprawny język (to on jest odpowiedzią)
   - "file"  — ścieżka do pliku audio w folderze audio/
   - "start" — (opcjonalnie) moment startu fragmentu w sekundach, jeśli chcesz
               ręcznie wskazać miejsce z wokalem. Bez tego pola quiz sam
               wylosuje bezpieczny fragment ze środka utworu.

   Ten sam "lang" może wystąpić w kilku wpisach — to jest właśnie
   zabezpieczenie przed nauczeniem się odpowiedzi na pamięć: im więcej
   różnych piosenek/języków w banku, tym mniej powtarzalny jest quiz,
   bo przy każdym podejściu losowanych jest tylko `totalRounds` z nich,
   w losowej kolejności, z losowymi opcjami do wyboru. Poniżej są pliki
   demonstracyjne (ten sam krótki dźwięk testowy) — zamień pole "file"
   każdego wpisu na swój plik, zachowując unikalne nazwy. */
const SONG_BANK = [
    { lang: "NIEMIECKI", file: "audio/de-1.mp3" },
    { lang: "FRANCUSKI", file: "audio/fr-2.mp3" },
    { lang: "HISZPAŃSKI", file: "audio/hs-3.mp3" },
    { lang: "PORTUGALSKI", file: "audio/pr-4.mp3" },
    { lang: "WŁOSKI", file: "audio/wl-5.mp3" },
    { lang: "LITEWSKI", file: "audio/lt-6.mp3" },
    { lang: "NORWESKI", file: "audio/nr-7.mp3" },
    { lang: "WĘGIERSKI", file: "audio/wg-8.mp3" },
];


/* ==========================================================================
   FUNKCJE POMOCNICZE
   ========================================================================== */
function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function formatTime(ms) {
    const totalSeconds = ms / 1000;
    if (totalSeconds < 60) {
        return totalSeconds.toFixed(1).replace('.', ',') + ' s';
    }
    const m = Math.floor(totalSeconds / 60);
    const s = (totalSeconds - m * 60).toFixed(1).replace('.', ',');
    return `${m} min ${s} s`;
}
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function normalizeKey(name, klass) {
    return (name.trim() + '__' + klass.trim()).toLowerCase();
}
function csvSafe(v) {
    const s = String(v);
    if (/[;"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
}

/* ==========================================================================
   PRZECHOWYWANIE WYNIKÓW (localStorage tej przeglądarki/urządzenia)
   ========================================================================== */
let storageOK = true;
try {
    localStorage.setItem('__zsi_test__', '1');
    localStorage.removeItem('__zsi_test__');
} catch (e) { storageOK = false; }

function loadAttempts() {
    if (!storageOK) return [];
    try {
        return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
    } catch (e) { return []; }
}
function saveAttempt(record) {
    if (!storageOK) return;
    const all = loadAttempts();
    all.push(record);
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(all)); } catch (e) { }
}
function getLeaderboard() {
    return loadAttempts()
        .filter(a => a.correct === a.total)
        .sort((a, b) => a.timeMs - b.timeMs)
        .slice(0, 5);
}

/* ==========================================================================
   ELEMENTY DOM
   ========================================================================== */
const player = document.getElementById('player');
const views = {
    start: document.getElementById('viewStart'),
    register: document.getElementById('viewRegister'),
    quiz: document.getElementById('viewQuiz'),
    result: document.getElementById('viewResult'),
};
const playButton = document.getElementById('playButton');
const storageWarning = document.getElementById('storageWarning');
const startLeaderboard = document.getElementById('startLeaderboard');
const resultLeaderboard = document.getElementById('resultLeaderboard');

const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('nameInput');
const classInput = document.getElementById('classInput');
const registerError = document.getElementById('registerError');
const backToStartButton = document.getElementById('backToStartButton');

const roundLabel = document.getElementById('roundLabel');
const timerDisplay = document.getElementById('timerDisplay');
const playSnippetButton = document.getElementById('playSnippetButton');
const playLabel = document.getElementById('playLabel');
const answerOptions = document.getElementById('answerOptions');

const resultScore = document.getElementById('resultScore');
const resultTime = document.getElementById('resultTime');
const resultMessage = document.getElementById('resultMessage');
const finishButton = document.getElementById('finishButton');
const autoReturnNote = document.getElementById('autoReturnNote');

const adminGear = document.getElementById('adminGear');
const pinModal = document.getElementById('pinModal');
const pinForm = document.getElementById('pinForm');
const pinInput = document.getElementById('pinInput');
const pinError = document.getElementById('pinError');
const cancelPinButton = document.getElementById('cancelPinButton');
const adminModal = document.getElementById('adminModal');
const adminSummary = document.getElementById('adminSummary');
const adminTableBody = document.getElementById('adminTableBody');
const exportCsvButton = document.getElementById('exportCsvButton');
const clearDataButton = document.getElementById('clearDataButton');
const closeAdminButton = document.getElementById('closeAdminButton');

const toast = document.getElementById('toast');

/* ==========================================================================
   NAWIGACJA WIDOKÓW
   ========================================================================== */
function showView(name) {
    Object.entries(views).forEach(([key, el]) => { el.hidden = key !== name; });
    window.scrollTo(0, 0);
}

/* ==========================================================================
   RANKING — render do dowolnego kontenera
   ========================================================================== */
function renderLeaderboardInto(container, highlightTimestamp) {
    const top = getLeaderboard();
    container.innerHTML = '';
    if (top.length === 0) {
        const p = document.createElement('p');
        p.className = 'leaderboard-empty';
        p.textContent = 'Nikt jeszcze nie zdobył kompletu punktów. Może to będziesz Ty?';
        container.appendChild(p);
        return;
    }
    top.forEach((rec, i) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row' + (rec.timestamp === highlightTimestamp ? ' is-you' : '');
        row.innerHTML =
            `<span class="leaderboard-rank">${i + 1}</span>` +
            `<span class="leaderboard-name">${escapeHtml(rec.name)}</span>` +
            `<span class="leaderboard-class">${escapeHtml(rec.klass)}</span>` +
            `<span class="leaderboard-time">${formatTime(rec.timeMs)}</span>`;
        container.appendChild(row);
    });
}

/* ==========================================================================
   REJESTRACJA
   ========================================================================== */
function showRegisterError(msg) {
    registerError.textContent = msg;
    registerError.hidden = false;
}
function clearRegisterError() {
    registerError.hidden = true;
    registerError.textContent = '';
}

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const klass = classInput.value.trim();
    if (!name || !klass) {
        showRegisterError('Podaj imię, nazwisko i klasę, żeby zagrać.');
        return;
    }
    const key = normalizeKey(name, klass);
    const prev = loadAttempts().find(a => a.key === key);
    if (prev) {
        showRegisterError(`Te dane już brały udział w quizie (wynik: ${prev.correct}/${prev.total}, czas: ${formatTime(prev.timeMs)}). Każda osoba gra tylko raz!`);
        return;
    }
    clearRegisterError();
    currentPlayer = { name, klass, key };
    startQuiz();
});

backToStartButton.addEventListener('click', () => {
    clearRegisterError();
    registerForm.reset();
    showView('start');
});

/* ==========================================================================
   LOGIKA QUIZU
   ========================================================================== */
let currentPlayer = null;
let quizRounds = [];
let roundIndex = 0;
let correctCount = 0;
let answerLog = [];
let locked = false;
let quizStartTime = 0;
let timerIntervalId = null;
let snippetTimeout = null;

function groupByLang() {
    const byLang = {};
    SONG_BANK.forEach(s => {
        byLang[s.lang] = byLang[s.lang] || [];
        byLang[s.lang].push(s);
    });
    return byLang;
}
function pickQuizSongs() {
    const byLang = groupByLang();
    const allLangs = Object.keys(byLang);
    const roundsCount = Math.min(CONFIG.totalRounds, allLangs.length);
    const languages = shuffle(allLangs).slice(0, roundsCount);
    return languages.map(lang => {
        const opts = byLang[lang];
        return opts[Math.floor(Math.random() * opts.length)];
    });
}
function generateOptions(correctLang) {
    const allLangs = [...new Set(SONG_BANK.map(s => s.lang))];
    const numOptions = Math.min(CONFIG.numOptions, allLangs.length);
    const distractors = shuffle(allLangs.filter(l => l !== correctLang)).slice(0, numOptions - 1);
    return shuffle([correctLang, ...distractors]);
}

function startQuiz() {
    quizRounds = pickQuizSongs().map(song => ({ song, options: generateOptions(song.lang) }));
    roundIndex = 0;
    correctCount = 0;
    answerLog = [];
    quizStartTime = performance.now();
    showView('quiz');
    startTimerLoop();
    renderRound();
}

function renderRound() {
    const total = quizRounds.length;
    roundLabel.textContent = `Pytanie ${roundIndex + 1} z ${total}`;
    playLabel.textContent = 'Odtwórz jeszcze raz';

    answerOptions.innerHTML = '';
    const round = quizRounds[roundIndex];
    round.options.forEach(lang => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-button';
        btn.textContent = lang;
        btn.addEventListener('click', () => selectAnswer(lang));
        answerOptions.appendChild(btn);
    });
    locked = false;
    playSnippet(round.song);
}

playSnippetButton.addEventListener('click', () => {
    playSnippet(quizRounds[roundIndex].song);
    playLabel.textContent = 'Odtwórz jeszcze raz';
});

function playSnippet(song) {
    clearTimeout(snippetTimeout);
    player.pause();
    player.src = song.file;
    player.onloadedmetadata = () => {
        let start = 0;
        const dur = player.duration;
        if (typeof song.start === 'number') {
            start = song.start;
        } else if (isFinite(dur) && dur > CONFIG.snippetSeconds + 6) {
            const safeMax = dur - CONFIG.snippetSeconds - 3;
            start = safeMax * (0.1 + Math.random() * 0.5);
        }
        try { player.currentTime = start; } catch (e) { }
        player.play().then(() => {
            snippetTimeout = setTimeout(() => player.pause(), CONFIG.snippetSeconds * 1000);
        }).catch(() => {
            showToast('Nie udało się odtworzyć fragmentu (' + song.file + ').');
        });
    };
    player.onerror = () => {
        showToast('Brak pliku audio: ' + song.file + '. Dodaj go do folderu audio/.');
    };
    player.load();
}

function selectAnswer(lang) {
    if (locked) return;
    locked = true;
    const round = quizRounds[roundIndex];
    const isCorrect = lang === round.song.lang;
    if (isCorrect) correctCount++;
    answerLog.push({ lang: round.song.lang, chosen: lang, correct: isCorrect });
    [...answerOptions.children].forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === round.song.lang) btn.classList.add('is-correct');
        else if (btn.textContent === lang && !isCorrect) btn.classList.add('is-wrong');
    });
    player.pause();
    setTimeout(() => {
        roundIndex++;
        if (roundIndex < quizRounds.length) {
            renderRound();
        } else {
            finishQuiz();
        }
    }, 1100);
}

function startTimerLoop() {
    clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
        timerDisplay.textContent = formatTime(performance.now() - quizStartTime);
    }, 100);
}
function stopTimerLoop() { clearInterval(timerIntervalId); }

/* ==========================================================================
   WYNIK
   ========================================================================== */
let autoReturnInterval = null;

function finishQuiz() {
    stopTimerLoop();
    const timeMs = performance.now() - quizStartTime;
    const record = {
        name: currentPlayer.name,
        klass: currentPlayer.klass,
        key: currentPlayer.key,
        correct: correctCount,
        total: quizRounds.length,
        timeMs,
        timestamp: Date.now(),
    };
    saveAttempt(record);
    renderResult(record);
    showView('result');
    scheduleAutoReturn();
}

function renderResult(record) {
    resultScore.textContent = `${record.correct} / ${record.total}`;
    resultTime.textContent = `Twój czas: ${formatTime(record.timeMs)}`;

    if (record.correct === record.total) {
        const board = getLeaderboard();
        const rank = board.findIndex(r => r.timestamp === record.timestamp);
        if (rank > -1) {
            resultMessage.textContent = `Brawo! Na razie jesteś na ${rank + 1}. miejscu w rankingu. Zwycięzców ogłosimy na koniec dnia.`;
        } else {
            resultMessage.textContent = 'Komplet punktów! Na razie 5 szybszych osób już Cię wyprzedziło — dziękujemy za grę.';
        }
        launchConfetti();
    } else {
        resultMessage.textContent = 'Dziękujemy za udział! Nie wszystkie odpowiedzi były poprawne — spróbuj przy następnej okazji.';
    }
    renderLeaderboardInto(resultLeaderboard, record.timestamp);
}

function scheduleAutoReturn() {
    let remaining = CONFIG.autoReturnSeconds;
    autoReturnNote.textContent = `Za ${remaining} s wracamy do ekranu startowego.`;
    clearInterval(autoReturnInterval);
    autoReturnInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(autoReturnInterval);
            resetToStart();
        } else {
            autoReturnNote.textContent = `Za ${remaining} s wracamy do ekranu startowego.`;
        }
    }, 1000);
}
function resetToStart() {
    clearInterval(autoReturnInterval);
    currentPlayer = null;
    registerForm.reset();
    clearRegisterError();
    renderLeaderboardInto(startLeaderboard);
    showView('start');
}
finishButton.addEventListener('click', resetToStart);

function launchConfetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#FFB627', '#2FB8AC', '#FF5D5D', '#F3EFE6'];
    for (let i = 0; i < 26; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = colors[i % colors.length];
        const duration = 2.4 + Math.random() * 1.6;
        el.style.animationDuration = duration + 's';
        el.style.animationDelay = (Math.random() * 0.4) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), (duration + 0.5) * 1000);
    }
}

/* ==========================================================================
   START — przycisk "Zagraj"
   ========================================================================== */
playButton.addEventListener('click', () => {
    nameInput.value = '';
    classInput.value = '';
    clearRegisterError();
    showView('register');
    setTimeout(() => nameInput.focus(), 50);
});

/* ==========================================================================
   TOAST
   ========================================================================== */
let toastTimer = null;
function showToast(msg, isError = true) {
    toast.textContent = msg;
    toast.classList.toggle('is-error', isError);
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}

/* ==========================================================================
   PANEL ORGANIZATORA
   ========================================================================== */
adminGear.addEventListener('click', () => {
    pinInput.value = '';
    pinError.hidden = true;
    pinModal.hidden = false;
    setTimeout(() => pinInput.focus(), 50);
});
cancelPinButton.addEventListener('click', () => { pinModal.hidden = true; });

pinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (pinInput.value === CONFIG.adminPin) {
        pinModal.hidden = true;
        openAdminPanel();
    } else {
        pinError.hidden = false;
    }
});

function openAdminPanel() {
    const all = loadAttempts().slice().sort((a, b) => a.timeMs - b.timeMs);
    const perfect = all.filter(a => a.correct === a.total).length;
    adminSummary.textContent = `Łącznie podejść: ${all.length}, komplet punktów: ${perfect}`;
    adminTableBody.innerHTML = '';
    all.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML =
            `<td>${escapeHtml(r.name)}</td>` +
            `<td>${escapeHtml(r.klass)}</td>` +
            `<td>${r.correct}/${r.total}</td>` +
            `<td>${formatTime(r.timeMs)}</td>` +
            `<td>${escapeHtml(new Date(r.timestamp).toLocaleString('pl-PL'))}</td>`;
        adminTableBody.appendChild(tr);
    });
    adminModal.hidden = false;
}
closeAdminButton.addEventListener('click', () => { adminModal.hidden = true; });

exportCsvButton.addEventListener('click', () => {
    const rows = loadAttempts().slice().sort((a, b) => a.timestamp - b.timestamp);
    const header = ['Imię i nazwisko', 'Klasa', 'Poprawne', 'Na ile pytań', 'Czas (s)', 'Data i godzina'].join(';');
    const lines = rows.map(r => {
        const czas = (r.timeMs / 1000).toFixed(2).replace('.', ',');
        const data = new Date(r.timestamp).toLocaleString('pl-PL');
        return [csvSafe(r.name), csvSafe(r.klass), r.correct, r.total, czas, csvSafe(data)].join(';');
    });
    const csvContent = '\uFEFF' + [header, ...lines].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wyniki_quizu_jezykowego.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});

clearDataButton.addEventListener('click', () => {
    if (confirm('Na pewno usunąć WSZYSTKIE zapisane wyniki? Tej operacji nie można odwrócić.')) {
        try { localStorage.removeItem(CONFIG.storageKey); } catch (e) { }
        openAdminPanel();
        renderLeaderboardInto(startLeaderboard);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        pinModal.hidden = true;
        adminModal.hidden = true;
    }
});

/* ==========================================================================
   INICJALIZACJA
   ========================================================================== */
if (!storageOK) storageWarning.hidden = false;
renderLeaderboardInto(startLeaderboard);
showView('start');
