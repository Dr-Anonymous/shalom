/**
 * bible-data.js
 * High-performance Bible data service for Shalom Worship Centre
 * Loads static JSON books from /assets/bibles/{ver}/{book}.json
 * Provides in-memory caching and IndexedDB offline support
 */

const BIBLE_VERSIONS = [
    { id: "te", name: "తెలుగు (BSI)", short: "తె", lang: "te-IN" },
    { id: "kjv", name: "American King James Version (1999)", short: "KJV", lang: "en-US" },
    { id: "amp", name: "Amplified Bible (1965)", short: "AMP", lang: "en-US" },
    { id: "erv", name: "Easy to Read Revised Version (2005)", short: "ERV", lang: "en-US" },
    { id: "esv", name: "English Standard Version (2001)", short: "ESV", lang: "en-US" },
    { id: "net", name: "New English Translation (2005)", short: "NET", lang: "en-US" },
    { id: "niv", name: "New International Version (UK)", short: "NIV", lang: "en-US" },
    { id: "nlt", name: "New Living Translation (1996)", short: "NLT", lang: "en-US" },
    { id: "msg", name: "The Message Bible (2002)", short: "MSG", lang: "en-US" }
];


const ALL_BOOKS = [
    [0, 0, 0, 0],
    [1, "ఆదికాండము", 50, "Genesis"],
    [2, "నిర్గమకాండము", 40, "Exodus"],
    [3, "లేవీయకాండము", 27, "Leviticus"],
    [4, "సంఖ్యాకాండము", 36, "Numbers"],
    [5, "ద్వితీయోపదేశకాండము", 34, "Deuteronomy"],
    [6, "యెహోషువ", 24, "Joshua"],
    [7, "న్యాయాధిపతులు", 21, "Judges"],
    [8, "రూతు", 4, "Ruth"],
    [9, "1 సమూయేలు", 31, "1 Samuel"],
    [10, "2 సమూయేలు", 24, "2 Samuel"],
    [11, "1 రాజులు", 22, "1 Kings"],
    [12, "2 రాజులు", 25, "2 Kings"],
    [13, "1 దినవృత్తాంతములు", 29, "1 Chronicles"],
    [14, "2 దినవృత్తాంతములు", 36, "2 Chronicles"],
    [15, "ఎజ్రా", 10, "Ezra"],
    [16, "నెహెమ్యా", 13, "Nehemiah"],
    [17, "ఎస్తేరు", 10, "Esther"],
    [18, "యోబు", 42, "Job"],
    [19, "కీర్తనలు", 150, "Psalm"],
    [20, "సామెతలు", 31, "Proverbs"],
    [21, "ప్రసంగి", 12, "Ecclesiastes"],
    [22, "పరమగీతము", 8, "Song of Solomon"],
    [23, "యెషయా", 66, "Isaiah"],
    [24, "యిర్మీయా", 52, "Jeremiah"],
    [25, "విలాపవాక్యములు", 5, "Lamentations"],
    [26, "యెహెజ్కేలు", 48, "Ezekiel"],
    [27, "దానియేలు", 12, "Daniel"],
    [28, "హోషేయ", 14, "Hosea"],
    [29, "యోవేలు", 3, "Joel"],
    [30, "ఆమోసు", 9, "Amos"],
    [31, "ఓబద్యా", 1, "Obadiah"],
    [32, "యోనా", 4, "Jonah"],
    [33, "మీకా", 7, "Micah"],
    [34, "నహూము", 3, "Nahum"],
    [35, "హబక్కూకు", 3, "Habakkuk"],
    [36, "జెఫన్యా", 3, "Zephaniah"],
    [37, "హగ్గయి", 2, "Haggai"],
    [38, "జెకర్యా", 14, "Zechariah"],
    [39, "మలాకీ", 4, "Malachi"],
    [40, "మత్తయి", 28, "Matthew"],
    [41, "మార్కు", 16, "Mark"],
    [42, "లూకా", 24, "Luke"],
    [43, "యోహాను", 21, "John"],
    [44, "అపొస్తలుల కార్యములు", 28, "Acts"],
    [45, "రోమా", 16, "Romans"],
    [46, "1 కొరింథీయులకు", 16, "1 Corinthians"],
    [47, "2 కొరింథీయులకు", 13, "2 Corinthians"],
    [48, "గలతీయులకు", 6, "Galatians"],
    [49, "ఎఫెసీయులకు", 6, "Ephesians"],
    [50, "ఫిలిప్పీయులకు", 4, "Philippians"],
    [51, "కొలొస్సయులకు", 4, "Colossians"],
    [52, "1 థెస్సలొనీకయులకు", 5, "1 Thessalonians"],
    [53, "2 థెస్సలొనీకయులకు", 3, "2 Thessalonians"],
    [54, "1 తిమోతికి", 6, "1 Timothy"],
    [55, "2 తిమోతికి", 4, "2 Timothy"],
    [56, "తీతుకు", 3, "Titus"],
    [57, "ఫిలేమోనుకు", 1, "Philemon"],
    [58, "హెబ్రీయులకు", 13, "Hebrews"],
    [59, "యాకోబు", 5, "James"],
    [60, "1 పేతురు", 5, "1 Peter"],
    [61, "2 పేతురు", 3, "2 Peter"],
    [62, "1 యోహాను", 5, "1 John"],
    [63, "2 యోహాను", 1, "2 John"],
    [64, "3 యోహాను", 1, "3 John"],
    [65, "యూదా", 1, "Jude"],
    [66, "ప్రకటన", 22, "Revelation"]
];

// In-memory cache for ultra-fast chapter switches (0ms)
const bibleMemoryCache = {};

function normalizeVersion(v) {
    return v || "te";
}

function getVersionInfo(v) {
    const norm = normalizeVersion(v);
    return BIBLE_VERSIONS.find(ver => ver.id === norm) || BIBLE_VERSIONS[0];
}

// Open or get IndexedDB database for offline storage
function openOfflineDB(version) {
    const norm = normalizeVersion(version);
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            return reject(new Error('IndexedDB not supported'));
        }
        const request = window.indexedDB.open('bible_' + norm, 1);
        request.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'book' });
            }
        };
        request.onsuccess = function(e) {
            resolve(e.target.result);
        };
        request.onerror = function(e) {
            reject(e.target.error);
        };
    });
}

// Check if a version is fully cached in IndexedDB
async function isVersionOffline(version) {
    try {
        const db = await openOfflineDB(version);
        return new Promise((resolve) => {
            const tx = db.transaction('books', 'readonly');
            const store = tx.objectStore('books');
            const countReq = store.count();
            countReq.onsuccess = () => {
                resolve(countReq.result >= 66);
            };
            countReq.onerror = () => resolve(false);
        });
    } catch (e) {
        return false;
    }
}

// Read a single book from IndexedDB
async function getBookFromIndexedDB(version, bookId) {
    try {
        const db = await openOfflineDB(version);
        return new Promise((resolve) => {
            const tx = db.transaction('books', 'readonly');
            const store = tx.objectStore('books');
            const req = store.get(parseInt(bookId));
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    } catch (e) {
        return null;
    }
}

// Fetch a book with in-memory caching and offline fallback
async function getBibleBook(version, bookId) {
    const norm = normalizeVersion(version);
    const bId = parseInt(bookId);
    const cacheKey = `${norm}_${bId}`;

    if (bibleMemoryCache[cacheKey]) {
        return bibleMemoryCache[cacheKey];
    }

    // Check IndexedDB
    const offlineBook = await getBookFromIndexedDB(norm, bId);
    if (offlineBook && offlineBook.chapters) {
        bibleMemoryCache[cacheKey] = offlineBook;
        return offlineBook;
    }

    // Fetch from static JSON on CDN / GitHub Pages
    const url = `/assets/bibles/${norm}/${bId}.json`;
    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error(`Failed to load ${norm} book ${bId} (${resp.status})`);
    }
    const bookData = await resp.json();
    bibleMemoryCache[cacheKey] = bookData;
    return bookData;
}

// Download an entire version offline into IndexedDB with real progress callback
async function downloadVersionOffline(version, onProgress) {
    const norm = normalizeVersion(version);
    const db = await openOfflineDB(norm);

    let completed = 0;
    const total = 66;

    // Fetch in concurrency batches of 6
    const batchSize = 6;
    for (let i = 1; i <= total; i += batchSize) {
        const batchIds = [];
        for (let j = i; j < i + batchSize && j <= total; j++) {
            batchIds.push(j);
        }

        await Promise.all(batchIds.map(async (bId) => {
            const resp = await fetch(`/assets/bibles/${norm}/${bId}.json`);
            if (!resp.ok) throw new Error(`Failed to fetch book ${bId}`);
            const bookData = await resp.json();

            // Save to memory cache
            bibleMemoryCache[`${norm}_${bId}`] = bookData;

            // Save to IndexedDB
            await new Promise((res, rej) => {
                const tx = db.transaction('books', 'readwrite');
                const store = tx.objectStore('books');
                const req = store.put(bookData);
                req.onsuccess = () => res();
                req.onerror = (err) => rej(err);
            });

            completed++;
            if (typeof onProgress === 'function') {
                onProgress(completed, total, Math.round((completed / total) * 100));
            }
        }));
    }

    return true;
}
