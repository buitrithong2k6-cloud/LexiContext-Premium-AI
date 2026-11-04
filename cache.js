/**
 * LexiContext AI Pro — File hỗ trợ Smart Cache (cache.js)
 * Đặt cùng cấp với index.html, manifest.json, sw.js trên GitHub.
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
  let dbPromise = null;

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

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') return resolve(null);
      try {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE, { keyPath: 'key' });
          }
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
        Object.entries(obj).forEach(([k, v]) => {
          if (v && v.data !== undefined) memCache.set(k, v);
        });
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

  // Tự động đánh chặn các lệnh fetch tới Google Gemini API
  const origFetch = global.fetch.bind(global);
  global.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';

    // 1. Cache danh sách Models 24h (tiết kiệm 6 lượt gọi mỗi lần tải lại trang)
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

    // 2. Cache mọi kết quả generateContent
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

  loadLS();
  syncIDB();
})(window);
