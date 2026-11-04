/**
 * LexiContext AI Pro — Cambridge Audio & Smart Cache Engine (cache.js)
 * Tự động sửa lỗi mất icon loa + Nâng cấp phát âm giọng người thật bản xứ Cambridge (US/UK)
 */
(function (global) {
  'use strict';

  const LS_CACHE_KEY = 'lexicontext_ai_cache_v1';
  const LS_MODELS_KEY = 'lexicontext_models_cache_v1';
  const LS_VAULT_KEY = 'lexicontext_master_db_unified';
  const IDB_NAME = 'lexicontext_smart_cache_db';
  const IDB_STORE = 'ai_cache_entries';

  const memCache = new Map();
  const audioCache = new Map();
  let dbPromise = null;
  let activeAudio = null;

  function normKey(str) {
    return String(str ?? '')
      .replace(/\*+/g, '')
      .replace(/^\s*(?:[-•·●▪◦>]+|\d+[.)])\s+/, '')
      .replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '')
      .trim()
      .toLowerCase();
  }

  // 1. Sửa lỗi mất icon loa: Tự động vẽ lại icon loa SVG nếu thư viện mạng bị lỗi
  function ensureSpeakerIcons() {
    const speakerButtons = document.querySelectorAll('[data-a="speak"], [data-a="speak-form"], [data-a="sel-speak"]');
    speakerButtons.forEach((btn) => {
      const icon = btn.querySelector('i');
      if (icon && (!icon.offsetWidth || icon.offsetHeight === 0 || !icon.innerHTML)) {
        icon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle"><path d="M14 3.23v17.54c0 .73-.83 1.14-1.4.68L7.3 17H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h3.3l5.3-4.45c.57-.46 1.4-.05 1.4.68zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 3.12-1.8 5.81-4.5 7.08V17c1.78-.97 3-2.84 3-5s-1.22-4.03-3-5V4.92C17.2 6.19 19 8.88 19 12z"/></svg>`;
      }
    });
  }

  // 2. Lấy âm thanh người bản xứ thật từ kho từ điển Cambridge / Oxford
  async function getCambridgeAudio(word) {
    const w = normKey(word);
    if (!w || w.includes(' ')) return null;
    if (audioCache.has(w)) return audioCache.get(w);

    try {
      const res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w));
      if (!res.ok) return null;
      const data = await res.json();
      const phonetics = (data && data[0] && data[0].phonetics) || [];
      let uk = '', us = '';
      for (const p of phonetics) {
        if (!p.audio) continue;
        if (/-(uk|gb)\.mp3$/i.test(p.audio) && !uk) uk = p.audio;
        else if (/-(us)\.mp3$/i.test(p.audio) && !us) us = p.audio;
        else if (!us) us = p.audio;
      }
      const result = { us: us || uk, uk: uk || us };
      audioCache.set(w, result);
      return result;
    } catch (e) {
      return null;
    }
  }

  // 3. Phát âm thanh: Giọng người thật Cambridge hoặc Web Speech giọng bản xứ chất lượng cao
  async function playCambridge(text, accent = 'us') {
    text = String(text || '').trim();
    if (!text) return;

    if (activeAudio) {
      try { activeAudio.pause(); } catch (e) {}
      activeAudio = null;
    }

    // Nếu là từ đơn: Dùng âm thanh người thật
    if (!text.includes(' ') && text.length <= 30) {
      const audios = await getCambridgeAudio(text);
      const url = audios ? (accent === 'uk' ? audios.uk : audios.us) : null;
      if (url) {
        try {
          activeAudio = new Audio(url);
          await activeAudio.play();
          return;
        } catch (e) {}
      }
    }

    // Dự phòng giọng đọc bản xứ cao cấp (không dùng giọng Google Dịch)
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = accent === 'uk' ? 'en-GB' : 'en-US';
        u.rate = 0.92;
        const voices = speechSynthesis.getVoices();
        const target = accent === 'uk' ? /^en[-_](GB|UK)/i : /^en[-_]US/i;
        const v = voices.find(x => target.test(x.lang) && !/google/i.test(x.name)) || voices.find(x => target.test(x.lang));
        if (v) u.voice = v;
        setTimeout(() => speechSynthesis.speak(u), 50);
      } catch (e) {}
    }
  }

  // Bắt sự kiện bấm vào nút Loa phát âm trực tiếp từ tầng cao nhất
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-a="speak"], [data-a="speak-form"], [data-a="sel-speak"]');
    if (!btn) return;

    e.stopImmediatePropagation(); // Chặn hàm speak cũ của index.html
    let wordToSpeak = '';
    if (btn.dataset.a === 'speak') wordToSpeak = btn.dataset.v || '';
    else if (btn.dataset.a === 'speak-form') {
      const inp = document.getElementById('f-word');
      wordToSpeak = inp ? inp.value : '';
    } else if (btn.dataset.a === 'sel-speak') {
      const barTxt = document.getElementById('selbar-txt');
      wordToSpeak = barTxt ? barTxt.textContent : '';
    }

    if (wordToSpeak) {
      playCambridge(wordToSpeak, 'us');
    }
  }, true); // Dùng capture phase để can thiệp trước

  // Chạy kiểm tra icon loa sau khi trang vẽ xong
  window.addEventListener('DOMContentLoaded', ensureSpeakerIcons);
  setInterval(ensureSpeakerIcons, 1500);

  // Đè lại hàm speak toàn cục
  global.speak = function (text, accent = 'us') {
    playCambridge(text, accent);
  };

  /* ===== SMART CACHE TOÀN CỤC ===== */
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

  async function getCache(k) {
    if (memCache.has(k)) return memCache.get(k);
    const db = await openDB();
    if (!db) return null;
    return new Promise((res) => {
      try {
        const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(k);
        req.onsuccess = () => res(req.result ? req.result.data : null);
        req.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }

  async function setCache(k, data) {
    memCache.set(k, data);
    const db = await openDB();
    if (db) {
      try { db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).put({ key: k, data, ts: Date.now() }); } catch (e) {}
    }
  }

  // Đánh chặn fetch Google Gemini để lưu cache
  if (typeof global.fetch === 'function') {
    const origFetch = global.fetch.bind(global);
    global.fetch = async function (url, opts) {
      const u = typeof url === 'string' ? url : (url && url.url) || '';

      if (u.includes(':generateContent') && opts && opts.body) {
        try {
          const b = JSON.parse(opts.body);
          const p = b?.contents?.[0]?.parts?.[0]?.text || '';
          if (p && !/Trả lời đúng 1 từ/i.test(p)) {
            const ck = 'ai:' + normKey(p);
            const cached = await getCache(ck);
            if (cached) {
              if (typeof global.toast === 'function') global.toast('⚡ Lấy từ bộ nhớ đệm (0 tốn lượt AI)');
              return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: cached }] } }] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            const r = await origFetch(url, opts);
            if (r.ok) {
              const j = await r.clone().json();
              const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (txt) await setCache(ck, txt);
            }
            return r;
          }
        } catch (e) {}
      }
      return origFetch(url, opts);
    };
  }
})(window);
