/**
 * LexiContext AI Pro — Cambridge Dual-Audio (US / UK) & Smart Cache Engine (cache.js)
 * 1. Tự động nâng cấp mọi nút Loa thành 2 nút [🔊 US] (Anh-Mỹ) và [🔊 UK] (Anh-Anh) chuẩn Cambridge.
 * 2. Vẽ trực tiếp icon Loa bằng SVG nội tuyến (không bao giờ mất hình cái loa).
 * 3. Phát âm thanh đồng bộ (Synchronous Audio Play) tương thích 100% với iPad / iPhone Safari.
 * 4. Tự động lưu Smart Cache (IndexedDB + LocalStorage) tiết kiệm lượt gọi Gemini API.
 */
(function (global) {
  'use strict';

  const LS_CACHE_KEY = 'lexicontext_ai_cache_v1';
  const LS_MODELS_KEY = 'lexicontext_models_cache_v1';
  const LS_VAULT_KEY = 'lexicontext_master_db_unified';
  const IDB_NAME = 'lexicontext_smart_cache_db';
  const IDB_STORE = 'ai_cache_entries';
  const MAX_LS_ENTRIES = 350;

  const memCache = new Map();
  const inFlight = new Map();
  const cambridgeMp3Cache = new Map();
  let dbPromise = null;

  // Dùng 1 đối tượng Audio duy nhất để iPad/iPhone Safari cho phép phát ngay khi chạm
  const sharedAudio = typeof Audio !== 'undefined' ? new Audio() : null;
  if (sharedAudio) sharedAudio.preload = 'auto';

  const SPEAKER_SVG =
    '<svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:-2px;flex-shrink:0"><path d="M163.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l77.84,54.31A8,8,0,0,0,168,224V32A8,8,0,0,0,163.51,24.81ZM152,208.43,84.59,161.4A7.94,7.94,0,0,0,80,160H32V96H80a7.94,7.94,0,0,0,4.59-1.4L152,47.57Zm50.34-118.09a8,8,0,0,1,11.32,0,56,56,0,0,1,0,79.32,8,8,0,0,1-11.32-11.32,40,40,0,0,0,0-56.68A8,8,0,0,1,202.34,90.34Zm25.46-25.45a8,8,0,0,1,11.31,0,92,92,0,0,1,0,130.22,8,8,0,1,1-11.31-11.31,76,76,0,0,0,0-107.6A8,8,0,0,1,227.8,64.89Z"/></svg>';

  function normKey(str) {
    return String(str ?? '')
      .replace(/\*+/g, '')
      .replace(/^\s*(?:[-•·●▪◦>]+|\d+[.)])\s+/, '')
      .replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function hashText(str) {
    const s = normKey(str);
    if (s.length <= 120) return s;
    let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      const ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return s.slice(0, 60) + '#' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  function notify(msg) {
    try { if (typeof global.toast === 'function') global.toast(msg); } catch (e) {}
  }

  function prefetchDictionaryMp3(word) {
    const w = normKey(word);
    if (!w || w.includes(' ') || cambridgeMp3Cache.has(w)) return;
    cambridgeMp3Cache.set(w, null);
    fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data) || !data[0] || !Array.isArray(data[0].phonetics)) return;
        let uk = '', us = '';
        for (const p of data[0].phonetics) {
          const a = p && p.audio ? p.audio : '';
          if (!a) continue;
          if (/-(uk|gb)\.mp3$/i.test(a) && !uk) uk = a;
          else if (/-(us)\.mp3$/i.test(a) && !us) us = a;
          else if (!us) us = a;
        }
        if (uk || us) cambridgeMp3Cache.set(w, { uk, us });
      })
      .catch(() => {});
  }

  function speakWithSystemVoice(text, accent) {
    if (!('speechSynthesis' in global) || typeof SpeechSynthesisUtterance === 'undefined') return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const isUK = accent === 'uk';
      u.lang = isUK ? 'en-GB' : 'en-US';
      u.rate = 0.92;
      const voices = speechSynthesis.getVoices() || [];
      if (voices.length) {
        const langRx = isUK ? /^en[-_](GB|UK)/i : /^en[-_]US/i;
        const preferred =
          voices.find((v) => langRx.test(v.lang) && /Daniel|Arthur|Martha|Oliver|Samantha|Alex|Ava|Allison|Natural|Enhanced|Premium/i.test(v.name)) ||
          voices.find((v) => langRx.test(v.lang) && !/Google/i.test(v.name)) ||
          voices.find((v) => langRx.test(v.lang));
        if (preferred) u.voice = preferred;
      }
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function playCambridgeAudio(rawText, accent = 'us') {
    const text = String(rawText || '').trim();
    if (!text) return;
    const isUK = String(accent).toLowerCase() === 'uk';
    const cleanWord = normKey(text);

    try { if ('speechSynthesis' in global) speechSynthesis.cancel(); } catch (e) {}

    const cachedMp3 = cambridgeMp3Cache.get(cleanWord);
    const dictStreamUrl =
      'https://dict.youdao.com/dictvoice?audio=' +
      encodeURIComponent(text.slice(0, 180)) +
      '&type=' +
      (isUK ? '1' : '2');

    const primaryUrl =
      cachedMp3 && (isUK ? cachedMp3.uk : cachedMp3.us)
        ? (isUK ? cachedMp3.uk : cachedMp3.us)
        : dictStreamUrl;

    if (!cleanWord.includes(' ')) prefetchDictionaryMp3(cleanWord);

    if (!sharedAudio) {
      speakWithSystemVoice(text, isUK ? 'uk' : 'us');
      return;
    }

    try {
      sharedAudio.pause();
      sharedAudio.src = primaryUrl;
      sharedAudio.onerror = function () {
        if (sharedAudio.src !== dictStreamUrl) {
          sharedAudio.src = dictStreamUrl;
          sharedAudio.onerror = function () { speakWithSystemVoice(text, isUK ? 'uk' : 'us'); };
          sharedAudio.play().catch(() => speakWithSystemVoice(text, isUK ? 'uk' : 'us'));
        } else {
          speakWithSystemVoice(text, isUK ? 'uk' : 'us');
        }
      };
      const p = sharedAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => speakWithSystemVoice(text, isUK ? 'uk' : 'us'));
      }
    } catch (e) {
      speakWithSystemVoice(text, isUK ? 'uk' : 'us');
    }
  }

  function upgradeSpeakerButtons() {
    const btns = document.querySelectorAll(
      'button[data-a="speak"]:not([data-cambridge-upgraded]), button[data-a="speak-form"]:not([data-cambridge-upgraded]), button[data-a="sel-speak"]:not([data-cambridge-upgraded])'
    );
    btns.forEach((btn) => {
      const action = btn.dataset.a;
      const val = btn.dataset.v || '';

      btn.setAttribute('data-cambridge-upgraded', '1');
      btn.dataset.accent = 'us';
      btn.className =
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border border-sky/40 bg-sky/10 text-sky hover:brightness-110 cursor-pointer';
      btn.title = 'Nghe phát âm Anh - Mỹ (US)';
      btn.innerHTML = SPEAKER_SVG + '<span>US</span>';

      const ukBtn = document.createElement('button');
      ukBtn.type = 'button';
      ukBtn.dataset.a = action;
      if (val) ukBtn.dataset.v = val;
      ukBtn.dataset.accent = 'uk';
      ukBtn.setAttribute('data-cambridge-upgraded', '1');
      ukBtn.className =
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border border-bad/40 bg-bad/10 text-bad hover:brightness-110 cursor-pointer';
      ukBtn.title = 'Nghe phát âm Anh - Anh (UK)';
      ukBtn.innerHTML = SPEAKER_SVG + '<span>UK</span>';

      if (btn.parentNode) btn.parentNode.insertBefore(ukBtn, btn.nextSibling);
      if (val && !val.includes(' ')) prefetchDictionaryMp3(val);
    });
  }

  document.addEventListener(
    'click',
    function (e) {
      const btn = e.target.closest('[data-a="speak"], [data-a="speak-form"], [data-a="sel-speak"]');
      if (!btn) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const accent = btn.dataset.accent || 'us';
      let textToSpeak = '';
      if (btn.dataset.a === 'speak') textToSpeak = btn.dataset.v || '';
      else if (btn.dataset.a === 'speak-form') {
        const inp = document.getElementById('f-word');
        textToSpeak = inp ? inp.value : '';
      } else if (btn.dataset.a === 'sel-speak') {
        const selTxt = document.getElementById('selbar-txt');
        textToSpeak = selTxt ? selTxt.textContent : '';
      }

      if (textToSpeak) playCambridgeAudio(textToSpeak, accent);
      else notify('Hãy nhập từ vựng trước khi nghe.');
    },
    true
  );

  function initObserver() {
    upgradeSpeakerButtons();
    if (typeof MutationObserver !== 'undefined' && document.body) {
      const obs = new MutationObserver(upgradeSpeakerButtons);
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initObserver);
  else initObserver();

  global.speak = function (text, accent = 'us') { playCambridgeAudio(text, accent); };

  /* ===== SMART CACHE ===== */
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') return resolve(null);
      try {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE, { keyPath: 'key' });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
    return dbPromise;
  }

  function loadLS() {
    try {
      const raw = localStorage.getItem(LS_CACHE_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => { if (v && v.data !== undefined) memCache.set(k, v); });
      }
    } catch (e) {}
  }

  async function syncIDB() {
    const db = await openDB();
    if (!db) return;
    try {
      const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).getAll();
      req.onsuccess = () => {
        (req.result || []).forEach((row) => {
          if (row && row.key && row.data !== undefined) {
            const ex = memCache.get(row.key);
            if (!ex || (row.updatedAt || 0) > (ex.updatedAt || 0)) memCache.set(row.key, row);
          }
        });
      };
    } catch (e) {}
  }

  function saveLS() {
    try {
      const entries = Array.from(memCache.entries())
        .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
        .slice(0, MAX_LS_ENTRIES);
      const plain = {};
      entries.forEach(([k, v]) => { plain[k] = v; });
      localStorage.setItem(LS_CACHE_KEY, JSON.stringify(plain));
    } catch (e) {}
  }

  async function setEntry(key, data, type = 'general') {
    if (!key || data === undefined || data === null) return;
    const record = { key, type, data, updatedAt: Date.now() };
    memCache.set(key, record);
    saveLS();
    const db = await openDB();
    if (db) {
      try { db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).put(record); } catch (e) {}
    }
  }

  async function getEntry(key) {
    if (!key) return null;
    if (memCache.has(key)) {
      const hit = memCache.get(key);
      hit.updatedAt = Date.now();
      return hit.data;
    }
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
        req.onsuccess = () => {
          if (req.result && req.result.data !== undefined) {
            memCache.set(key, req.result);
            resolve(req.result.data);
          } else resolve(null);
        };
        req.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  }

  function findInVault(term) {
    try {
      const target = normKey(term);
      const raw = localStorage.getItem(LS_VAULT_KEY);
      if (!target || !raw) return null;
      const parsed = JSON.parse(raw);
      const words = Array.isArray(parsed?.words) ? parsed.words : [];
      const w = words.find((x) => normKey(x.word) === target);
      if (!w) return null;
      const m = w.medAnatomy || {};
      const q = (Array.isArray(w.quizPool) && w.quizPool[0]) || {};
      return {
        word: w.word, pos: w.pos || 'word', ipa: w.ipa || '', cefr: w.cefr || 'B2', topic: w.topic || '',
        medPrefix: m.prefix || '', medRoot: m.root || '', medCombining: m.combining || '', medSuffix: m.suffix || '',
        meaning: w.meaning || '', example: w.example || '', exampleTrans: w.exampleTrans || '',
        collocations: Array.isArray(w.collocations) ? w.collocations : [],
        explanation: w.explanation || '', personalNote: w.personalNote || '',
        quizSentence: q.sentence || '', quizTrans: q.trans || w.exampleTrans || ''
      };
    } catch (e) { return null; }
  }

  function withDedup(key, fn) {
    if (inFlight.has(key)) return inFlight.get(key);
    const p = Promise.resolve().then(fn).finally(() => inFlight.delete(key));
    inFlight.set(key, p);
    return p;
  }

  function extractKey(promptText) {
    const p = String(promptText || '').trim();
    if (!p || /Trả lời đúng 1 từ:\s*OK/i.test(p)) return null;
    const lookMatch = p.match(/^Tra từ\/cụm từ\s+"([^"]+)"/i);
    if (lookMatch) return { type: 'lookup', term: normKey(lookMatch[1]), key: 'lookup:' + normKey(lookMatch[1]) };
    const analyzeMatch = p.match(/Người dùng nhập:\s*"""([\s\S]*?)"""/i);
    if (analyzeMatch) {
      const rawIn = analyzeMatch[1].trim();
      const lvMatch = p.match(/Mức câu ví dụ:\s*([^\n.]+)/i);
      return { type: 'analyze', key: 'analyze:' + (lvMatch ? normKey(lvMatch[1]) : 'auto') + ':' + hashText(rawIn) };
    }
    return { type: 'raw', key: 'raw:' + hashText(p) };
  }

  function makeGeminiResponse(text) {
    return new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: typeof text === 'string' ? text : JSON.stringify(text) }] } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (typeof global.fetch === 'function') {
    const origFetch = global.fetch.bind(global);
    global.fetch = async function (input, init) {
      const url = typeof input === 'string' ? input : (input && input.url) || '';

      if (url.includes('generativelanguage.googleapis.com/v1beta/models') && !url.includes(':generateContent')) {
        try {
          const cached = JSON.parse(localStorage.getItem(LS_MODELS_KEY) || 'null');
          if (cached && Date.now() - (cached.ts || 0) < 86400000 && cached.data) {
            return new Response(JSON.stringify(cached.data), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        } catch (e) {}
        const resp = await origFetch(input, init);
        if (resp.ok && !url.includes('pageToken=')) {
          try {
            const data = await resp.clone().json();
            localStorage.setItem(LS_MODELS_KEY, JSON.stringify({ ts: Date.now(), data }));
          } catch (e) {}
        }
        return resp;
      }

      if (url.includes('generativelanguage.googleapis.com/v1beta/models/') && url.includes(':generateContent') && init && init.body) {
        try {
          const body = JSON.parse(init.body);
          const promptText = body?.contents?.[0]?.parts?.[0]?.text || '';
          const info = extractKey(promptText);

          if (info) {
            if (info.type === 'lookup' && info.term) {
              const vaultHit = findInVault(info.term);
              if (vaultHit) {
                notify('⚡ Đã có sẵn trong Kho từ (0 tốn lượt AI)');
                return makeGeminiResponse(JSON.stringify(vaultHit));
              }
            }

            const cachedData = await getEntry(info.key);
            if (cachedData !== null && cachedData !== undefined) {
              notify('⚡ Lấy từ bộ nhớ đệm (0 tốn lượt AI)');
              return makeGeminiResponse(cachedData);
            }

            const netText = await withDedup(info.key, async () => {
              const resp = await origFetch(input, init);
              if (!resp.ok) {
                const err = new Error('HTTP ' + resp.status);
                err.status = resp.status;
                err.body = await resp.text();
                throw err;
              }
              const json = await resp.json();
              const outText = (json?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
              if (outText) {
                const clean = outText.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '');
                await setEntry(info.key, clean, info.type);
                try {
                  const obj = JSON.parse(clean);
                  if (Array.isArray(obj)) {
                    for (const item of obj) {
                      if (item && item.word) await setEntry('lookup:' + normKey(item.word), JSON.stringify(item), 'lookup');
                    }
                  } else if (obj && obj.word) {
                    await setEntry('lookup:' + normKey(obj.word), JSON.stringify(obj), 'lookup');
                  }
                } catch (e) {}
              }
              return outText;
            });

            return makeGeminiResponse(netText);
          }
        } catch (err) {
          if (err && err.status) {
            return new Response(err.body || '{}', { status: err.status, headers: { 'Content-Type': 'application/json' } });
          }
        }
      }

      return origFetch(input, init);
    };
  }

  loadLS();
  syncIDB();
})(window);
