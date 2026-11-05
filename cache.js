/**
 * LexiContext Academy Pro (cache.js v5)
 * 1. Giữ nguyên 100% tính năng gốc:
 *    - Giải phẫu Thành tố từ Y khoa & Học thuật (Prefix • Root • Combining • Suffix) song ngữ Anh - Việt, có nút Ẩn/Hiện trong cả Test & Kho từ.
 *    - Âm thanh chuẩn kép Cambridge (US / UK) + Nhịp đọc Shadowing phản hồi tức thì (<20ms).
 *    - Đồng bộ Đám mây 2 thiết bị (iPad / iPhone / PC) qua mã PIN 6 số trên GitHub Pages.
 *    - Smart Cache đa tầng tiết kiệm lượt gọi Gemini AI.
 * 2. Bổ sung Hệ thống Học viện 4 Kỹ năng (B1 -> B2 -> Duy trì 5 phút/ngày):
 *    - 🎧 Luyện Nghe (Dictation từng từ + Nghe chậm 0.8x + Trắc nghiệm bắt từ khóa)
 *    - ✍️ Luyện Viết (Khung sườn lắp ghép 1 chạm Email B1 / Essay PEEL B2 + AI Chấm sửa)
 *    - 🗣️ Giao tiếp & Phản xạ (Cụm từ cứu cánh chống ấp úng + Shadowing + Chấm điểm Micro)
 *    - 📐 Ngữ pháp Thực chiến (Học công thức 30s -> Áp dụng ngay vào Nói & Viết)
 *    - 🔥 Chế độ Duy trì 5 Phút/Ngày (Kết hợp 4 kỹ năng + Ôn từ vựng cá nhân)
 */
(function (global) {
  'use strict';

  const LS_CACHE_KEY = 'lexicontext_ai_cache_v1';
  const LS_MODELS_KEY = 'lexicontext_models_cache_v1';
  const LS_VAULT_KEY = 'lexicontext_master_db_unified';
  const LS_SYNC_PIN_KEY = 'lexicontext_saved_sync_pin';
  const LS_ACADEMY_KEY = 'lexicontext_academy_state_v5';
  const IDB_NAME = 'lexicontext_smart_cache_db';
  const IDB_STORE = 'ai_cache_entries';
  const MAX_LS_ENTRIES = 350;

  const memCache = new Map();
  const inFlight = new Map();
  const cambridgeMp3Cache = new Map();
  let dbPromise = null;

  const sharedAudio = typeof Audio !== 'undefined' ? new Audio() : null;
  if (sharedAudio) sharedAudio.preload = 'auto';

  const SPEAKER_SVG =
    '<svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:-2px;flex-shrink:0"><path d="M163.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l77.84,54.31A8,8,0,0,0,168,224V32A8,8,0,0,0,163.51,24.81ZM152,208.43,84.59,161.4A7.94,7.94,0,0,0,80,160H32V96H80a7.94,7.94,0,0,0,4.59-1.4L152,47.57Zm50.34-118.09a8,8,0,0,1,11.32,0,56,56,0,0,1,0,79.32,8,8,0,0,1-11.32-11.32,40,40,0,0,0,0-56.68A8,8,0,0,1,202.34,90.34Zm25.46-25.45a8,8,0,0,1,11.31,0,92,92,0,0,1,0,130.22,8,8,0,1,1-11.31-11.31,76,76,0,0,0,0-107.6A8,8,0,0,1,227.8,64.89Z"/></svg>';
  const SHADOW_SVG =
    '<svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:-2px;flex-shrink:0"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM168,128a8,8,0,0,1-8,8H136v24a8,8,0,0,1-16,0V136H96a8,8,0,0,1,0-16h24V96a8,8,0,0,1,16,0v24h24A8,8,0,0,1,168,128Z"/></svg>';

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
    let h1 = 0xdeadbeef ^ s.length,
      h2 = 0x41c6ce57 ^ s.length;
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
    try {
      if (typeof global.toast === 'function') global.toast(msg);
      else if (typeof window.toast === 'function') window.toast(msg);
    } catch (e) {}
  }

  function escHTML(s) {
    return String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }

  /* ==========================================================================
   * 1. HỆ THỐNG ÂM THANH CAMBRIDGE DUAL-AUDIO (US/UK) & SHADOWING CADENCE
   * ========================================================================== */
  function isSentenceText(text) {
    const str = String(text || '').trim();
    if (!str) return false;
    const words = str.split(/\s+/).filter(Boolean);
    return words.length >= 2 || /[.!?—;:"]/.test(str);
  }

  function prefetchDictionaryMp3(word) {
    const w = normKey(word);
    if (!w || w.includes(' ') || cambridgeMp3Cache.has(w)) return;
    cambridgeMp3Cache.set(w, null);
    fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data) || !data[0] || !Array.isArray(data[0].phonetics)) return;
        let uk = '',
          us = '';
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

  function speakExpressiveUtterance(text, options = {}) {
    if (!('speechSynthesis' in global) || typeof SpeechSynthesisUtterance === 'undefined') return;
    try {
      speechSynthesis.cancel();
      const isUK = options.accent === 'uk';
      const isShadowing = !!options.shadowing;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = isUK ? 'en-GB' : 'en-US';
      u.rate = options.rate || (isShadowing ? 0.85 : 0.94);
      u.pitch = isUK ? 1.04 : 1.0;

      const voices = speechSynthesis.getVoices() || [];
      if (voices.length) {
        const langRx = isUK ? /^en[-_](GB|UK)/i : /^en[-_]US/i;
        const preferred =
          voices.find(
            (v) =>
              langRx.test(v.lang) &&
              /Daniel|Arthur|Martha|Oliver|Samantha|Alex|Ava|Allison|Natural|Enhanced|Premium/i.test(v.name)
          ) ||
          voices.find((v) => langRx.test(v.lang) && !/Google/i.test(v.name)) ||
          voices.find((v) => langRx.test(v.lang));
        if (preferred) u.voice = preferred;
      }
      speechSynthesis.resume();
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function playCambridgeAudio(rawText, accent = 'us', isShadowing = false) {
    const text = String(rawText || '').trim();
    if (!text) return;
    const isUK = String(accent).toLowerCase() === 'uk';
    const isSentence = isSentenceText(text);

    try {
      if ('speechSynthesis' in global) speechSynthesis.cancel();
    } catch (e) {}

    if (isSentence || isShadowing) {
      speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us', shadowing: isShadowing });
      return;
    }

    const cleanWord = normKey(text);
    const cachedMp3 = cambridgeMp3Cache.get(cleanWord);
    const dictStreamUrl =
      'https://dict.youdao.com/dictvoice?audio=' +
      encodeURIComponent(text.slice(0, 80)) +
      '&type=' +
      (isUK ? '1' : '2');

    const primaryUrl =
      cachedMp3 && (isUK ? cachedMp3.uk : cachedMp3.us)
        ? isUK
          ? cachedMp3.uk
          : cachedMp3.us
        : dictStreamUrl;

    if (!cleanWord.includes(' ')) prefetchDictionaryMp3(cleanWord);

    if (!sharedAudio) {
      speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us' });
      return;
    }

    try {
      sharedAudio.pause();
      sharedAudio.src = primaryUrl;
      sharedAudio.onerror = function () {
        if (sharedAudio.src !== dictStreamUrl) {
          sharedAudio.src = dictStreamUrl;
          sharedAudio.onerror = function () {
            speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us' });
          };
          sharedAudio.play().catch(() => speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us' }));
        } else {
          speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us' });
        }
      };
      const playPromise = sharedAudio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us' }));
      }
    } catch (e) {
      speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us' });
    }
  }

  function upgradeSpeakerButtons() {
    const btns = document.querySelectorAll(
      'button[data-a="speak"]:not([data-cambridge-upgraded]), button[data-a="speak-form"]:not([data-cambridge-upgraded]), button[data-a="sel-speak"]:not([data-cambridge-upgraded])'
    );
    btns.forEach((btn) => {
      const action = btn.dataset.a;
      const val = btn.dataset.v || '';
      const isSentence = val.trim().split(/\s+/).length >= 3;

      btn.setAttribute('data-cambridge-upgraded', '1');
      btn.dataset.accent = 'us';
      btn.className =
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border border-sky/40 bg-sky/10 text-sky hover:brightness-110 cursor-pointer transition-colors';
      btn.title = isSentence ? 'Nghe cả câu giọng Mỹ (US)' : 'Nghe phát âm Anh - Mỹ (US)';
      btn.innerHTML = SPEAKER_SVG + '<span>US</span>';

      const ukBtn = document.createElement('button');
      ukBtn.type = 'button';
      ukBtn.dataset.a = action;
      if (val) ukBtn.dataset.v = val;
      ukBtn.dataset.accent = 'uk';
      ukBtn.setAttribute('data-cambridge-upgraded', '1');
      ukBtn.className =
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border border-bad/40 bg-bad/10 text-bad hover:brightness-110 cursor-pointer transition-colors';
      ukBtn.title = isSentence ? 'Nghe cả câu giọng Anh (UK)' : 'Nghe phát âm Anh - Anh (UK)';
      ukBtn.innerHTML = SPEAKER_SVG + '<span>UK</span>';

      if (btn.parentNode) {
        btn.parentNode.insertBefore(ukBtn, btn.nextSibling);
        if (isSentence && !btn.parentNode.querySelector('[data-shadowing-btn]')) {
          const shadowBtn = document.createElement('button');
          shadowBtn.type = 'button';
          shadowBtn.dataset.a = action;
          if (val) shadowBtn.dataset.v = val;
          shadowBtn.dataset.shadowingBtn = '1';
          shadowBtn.dataset.accent = 'shadow';
          shadowBtn.setAttribute('data-cambridge-upgraded', '1');
          shadowBtn.className =
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border border-warn/40 bg-warn/10 text-warn hover:brightness-110 cursor-pointer transition-colors';
          shadowBtn.title = 'Luyện Shadowing: Đọc chậm rõ trọng âm để nhại theo';
          shadowBtn.innerHTML = SHADOW_SVG + '<span>Shadow</span>';
          btn.parentNode.insertBefore(shadowBtn, ukBtn.nextSibling);
        }
      }
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
      const isShadow = accent === 'shadow' || btn.hasAttribute('data-shadowing-btn');
      let textToSpeak = '';
      if (btn.dataset.a === 'speak') textToSpeak = btn.dataset.v || '';
      else if (btn.dataset.a === 'speak-form') {
        const inp = document.getElementById('f-word');
        textToSpeak = inp ? inp.value : '';
      } else if (btn.dataset.a === 'sel-speak') {
        const selTxt = document.getElementById('selbar-txt');
        textToSpeak = selTxt ? selTxt.textContent : '';
      }
      if (textToSpeak) playCambridgeAudio(textToSpeak, isShadow ? 'us' : accent, isShadow);
      else notify('Hãy nhập từ vựng trước khi nghe.');
    },
    true
  );

  /* ==========================================================================
   * 2. TỪ ĐIỂN & BỘ PHÂN TÍCH THÀNH TỐ TỪ Y KHOA / HỌC THUẬT (ANH - VIỆT)
   * ========================================================================== */
  const MEDICAL_DICT = {
    prefix: {
      a: { en: 'without, absent, lack of', vn: 'không có, vắng mặt, mất, vô' },
      an: { en: 'without, lack of', vn: 'không có, thiếu, mất cảm giác' },
      ab: { en: 'away from, off', vn: 'rời xa, tách ra khỏi' },
      ad: { en: 'toward, near, to', vn: 'hướng về, gần bên' },
      anti: { en: 'against, opposing, counteracting', vn: 'chống lại, kháng, ngăn ngừa' },
      auto: { en: 'self, own', vn: 'tự thân, tự miễn' },
      bi: { en: 'two, double, both', vn: 'hai, đôi, lưỡng' },
      brady: { en: 'abnormally slow', vn: 'chậm bất thường (nhịp chậm)' },
      tachy: { en: 'abnormally rapid, fast', vn: 'nhanh bất thường (nhịp nhanh)' },
      co: { en: 'together, with', vn: 'cùng nhau, phối hợp' },
      con: { en: 'together, with', vn: 'cùng với, hội tụ' },
      contra: { en: 'against, opposite', vn: 'chống lại, ngược lại (chống chỉ định)' },
      de: { en: 'down, remove, reduce, reverse', vn: 'giảm bớt, loại bỏ, khử' },
      dia: { en: 'through, across, complete', vn: 'xuyên qua, hoàn toàn (chẩn đoán, lọc)' },
      dis: { en: 'apart, away, not, reverse', vn: 'tách rời, không, rối loạn' },
      dys: { en: 'difficult, painful, abnormal, disordered', vn: 'khó khăn, đau buốt, rối loạn, bất thường' },
      ec: { en: 'out, outside', vn: 'ra ngoài, lạc chỗ' },
      ecto: { en: 'outside, external', vn: 'bên ngoài, ngoại' },
      en: { en: 'in, inside, within', vn: 'bên trong, nội' },
      endo: { en: 'within, inner, inside', vn: 'bên trong, nội mạc, nội soi' },
      epi: { en: 'upon, over, above', vn: 'trên, bề mặt, thượng' },
      eu: { en: 'good, normal, well, easy', vn: 'tốt, bình thường, dễ dàng' },
      ex: { en: 'out of, away from', vn: 'ra ngoài, cắt bỏ' },
      exo: { en: 'outside, outward', vn: 'bên ngoài, ngoại tiết' },
      extra: { en: 'outside, beyond', vn: 'ngoài, vượt ngoài' },
      hemi: { en: 'half, one side', vn: 'một nửa, bán phần' },
      hyper: { en: 'excessive, above normal, high', vn: 'quá mức, tăng cao, ưu' },
      hypo: { en: 'deficient, below normal, under', vn: 'dưới mức, giảm, hạ, nhược' },
      in: { en: 'in, into, not', vn: 'bên trong / hoặc không' },
      im: { en: 'in, into, not', vn: 'vào trong / không' },
      infra: { en: 'below, beneath, inferior to', vn: 'phía dưới, hạ' },
      inter: { en: 'between, among', vn: 'ở giữa, liên, gian' },
      intra: { en: 'within, inside', vn: 'bên trong, nội' },
      macro: { en: 'large, big, long', vn: 'lớn, đại thể' },
      mal: { en: 'bad, poor, abnormal', vn: 'xấu, kém, suy, sai lệch' },
      mega: { en: 'large, enlarged', vn: 'to, phì đại' },
      meta: { en: 'beyond, change, after', vn: 'biến đổi, chuyển hóa, di căn' },
      micro: { en: 'small, microscopic', vn: 'nhỏ, vi thể, vi mô' },
      mono: { en: 'one, single', vn: 'một, đơn' },
      multi: { en: 'many, multiple', vn: 'nhiều, đa' },
      neo: { en: 'new, recent', vn: 'mới, tân sinh' },
      oligo: { en: 'few, scanty, little', vn: 'ít, thiểu (thiểu niệu)' },
      pan: { en: 'all, entire, whole', vn: 'toàn bộ, toàn thể' },
      para: { en: 'beside, near, abnormal', vn: 'cạnh, cận, phó, bất thường' },
      per: { en: 'through, completely, intensively', vn: 'xuyên qua, hoàn toàn' },
      peri: { en: 'around, surrounding, enclosing', vn: 'xung quanh, bao quanh, chu' },
      poly: { en: 'many, much, excessive', vn: 'nhiều, đa' },
      post: { en: 'after, behind', vn: 'sau, hậu (hậu phẫu)' },
      pre: { en: 'before, in front of', vn: 'trước, tiền (tiền phẫu)' },
      pro: { en: 'before, forward, favoring', vn: 'trước, tiến tới, tiền chất' },
      pseudo: { en: 'false, deceptive', vn: 'giả, ngụy' },
      re: { en: 'back, again, against', vn: 'lại, ngược lại, chống lại, tái' },
      retro: { en: 'behind, backward', vn: 'phía sau, ngược chiều (sau phúc mạc)' },
      semi: { en: 'half, partial', vn: 'nửa, bán phần' },
      sub: { en: 'under, below, beneath', vn: 'dưới, hạ, cận lâm sàng' },
      super: { en: 'above, excessive', vn: 'trên, siêu, vượt quá' },
      supra: { en: 'above, over', vn: 'phía trên, thượng' },
      syn: { en: 'together, joined, with', vn: 'cùng nhau, hợp lại, hội chứng' },
      sym: { en: 'together, with', vn: 'cùng nhau, đối xứng, triệu chứng' },
      trans: { en: 'across, through, beyond', vn: 'xuyên qua, chuyển qua' },
      tri: { en: 'three', vn: 'ba, tam' },
      ultra: { en: 'beyond, excess', vn: 'siêu, vượt ngưỡng (siêu âm)' },
      uni: { en: 'one, single', vn: 'một, đơn' }
    },
    root: {
      append: { en: 'appendix (vermiform appendix)', vn: 'ruột thừa' },
      appendic: { en: 'appendix (vermiform appendix)', vn: 'ruột thừa' },
      periton: { en: 'peritoneum (membrane lining the abdominal cavity)', vn: 'phúc mạc (màng bụng)' },
      peritone: { en: 'peritoneum (abdominal membrane)', vn: 'phúc mạc (màng bụng)' },
      ton: { en: 'stretching, tension, tone (peritoneum = stretched around)', vn: 'căng ra, trương lực (màng căng bao quanh bụng)' },
      fec: { en: 'feces, excrement, waste matter', vn: 'phân, chất thải đường tiêu hóa' },
      feca: { en: 'feces, waste matter', vn: 'phân, chất bã tiêu hóa' },
      fecal: { en: 'feces, fecal matter', vn: 'phân, thuộc về phân' },
      ur: { en: 'urine, urinary tract', vn: 'nước tiểu, hệ tiết niệu' },
      uri: { en: 'urine, uric', vn: 'nước tiểu' },
      urin: { en: 'urine, urination', vn: 'nước tiểu, sự tiểu tiện' },
      uro: { en: 'urine, urinary system', vn: 'tiết niệu, đường tiểu' },
      irrit: { en: 'to irritate, provoke, inflame, excite', vn: 'kích thích, làm rát ngứa, gây kích ứng' },
      irritat: { en: 'to irritate, inflame, provoke', vn: 'kích thích, làm rát ngứa, kích ứng' },
      resist: { en: 'to stand against, withstand, oppose', vn: 'đứng vững, chống lại, kháng cự' },
      sist: { en: 'to stand, take a stand, set', vn: 'đứng, giữ vững, trụ lại' },
      psoas: { en: 'psoas muscle (deep loin/iliopsoas muscle)', vn: 'cơ thắt lưng - chậu (cơ psoas)' },
      obturat: { en: 'obturator muscle/foramen (pelvic wall muscle)', vn: 'cơ bịt (vùng khung chậu)' },
      obturator: { en: 'obturator internus muscle', vn: 'cơ bịt trong (ở hố chậu)' },
      umbilic: { en: 'umbilicus, navel', vn: 'rốn, vùng rốn' },
      quadr: { en: 'four, quarter, fourth part', vn: 'bốn, một phần tư (góc tư bụng)' },
      physic: { en: 'nature, natural science, medicine', vn: 'y học, tự nhiên, cơ thể' },
      abdomin: { en: 'abdomen, belly', vn: 'bụng, ổ bụng' },
      lapar: { en: 'abdomen, abdominal wall, flank', vn: 'ổ bụng, thành bụng' },
      thorac: { en: 'chest, thorax', vn: 'lồng ngực, ngực' },
      card: { en: 'heart', vn: 'tim, tâm' },
      cardi: { en: 'heart, cardiac orifice', vn: 'tim, tâm vị' },
      vas: { en: 'vessel, duct', vn: 'mạch máu, ống dẫn' },
      vascul: { en: 'small blood vessel', vn: 'mạch máu' },
      angi: { en: 'blood vessel, lymph vessel', vn: 'mạch máu, mạch bạch huyết' },
      arteri: { en: 'artery', vn: 'động mạch' },
      ven: { en: 'vein', vn: 'tĩnh mạch' },
      phleb: { en: 'vein', vn: 'tĩnh mạch' },
      hem: { en: 'blood', vn: 'máu, huyết' },
      hemat: { en: 'blood', vn: 'máu, huyết học' },
      erythr: { en: 'red (red blood cell)', vn: 'màu đỏ, hồng cầu' },
      leuk: { en: 'white (white blood cell)', vn: 'màu trắng, bạch cầu' },
      thromb: { en: 'clot, lump, platelet', vn: 'cục máu đông, huyết khối, tiểu cầu' },
      embol: { en: 'plug, stopper, moving clot', vn: 'vật tắc mạch, thuyên tắc' },
      isch: { en: 'to hold back, suppress, restrict flow', vn: 'thiếu máu cục bộ, ứ trệ' },
      splen: { en: 'spleen', vn: 'lách, tỳ' },
      immun: { en: 'safe, protected, immune', vn: 'miễn dịch' },
      pulmon: { en: 'lung', vn: 'phổi' },
      pneum: { en: 'lung, air, breath', vn: 'phổi, khí, hơi thở' },
      pneumon: { en: 'lung', vn: 'phổi, phế' },
      bronch: { en: 'bronchus, airway tube', vn: 'phế quản' },
      trache: { en: 'trachea, windpipe', vn: 'khí quản' },
      laryng: { en: 'larynx, voice box', vn: 'thanh quản' },
      pharyng: { en: 'pharynx, throat', vn: 'hầu, họng' },
      rhin: { en: 'nose', vn: 'mũi, tỵ' },
      pleur: { en: 'pleura (membrane around lungs), rib', vn: 'màng phổi' },
      gastr: { en: 'stomach', vn: 'dạ dày, vị' },
      enter: { en: 'intestine (especially small intestine)', vn: 'ruột, ruột non' },
      duoden: { en: 'duodenum', vn: 'tá tràng' },
      col: { en: 'colon, large intestine', vn: 'đại tràng, kết tràng' },
      colon: { en: 'colon, large intestine', vn: 'đại tràng' },
      rect: { en: 'rectum, straight', vn: 'trực tràng' },
      hepat: { en: 'liver', vn: 'gan' },
      chol: { en: 'bile, gall', vn: 'mật' },
      cholecyst: { en: 'gallbladder', vn: 'túi mật' },
      pancreat: { en: 'pancreas', vn: 'tuyến tụy' },
      nephr: { en: 'kidney', vn: 'thận' },
      ren: { en: 'kidney', vn: 'thận' },
      cyst: { en: 'urinary bladder, sac of fluid', vn: 'bàng quang, túi dịch, nang' },
      neur: { en: 'nerve, nervous system', vn: 'dây thần kinh, hệ thần kinh' },
      encephal: { en: 'brain', vn: 'não bộ' },
      cerebr: { en: 'cerebrum, brain', vn: 'đại não, não' },
      mening: { en: 'meninges', vn: 'màng não - tủy' },
      myel: { en: 'spinal cord, bone marrow', vn: 'tủy sống, tủy xương' },
      psych: { en: 'mind, soul, mental process', vn: 'tâm thần, tâm lý, tinh thần' },
      derm: { en: 'skin', vn: 'da, bì' },
      dermat: { en: 'skin', vn: 'da, da liễu' },
      oste: { en: 'bone', vn: 'xương, cốt' },
      arthr: { en: 'joint', vn: 'khớp' },
      chondr: { en: 'cartilage', vn: 'sụn' },
      my: { en: 'muscle', vn: 'cơ, bắp thịt' },
      myo: { en: 'muscle', vn: 'cơ, cơ bắp' },
      aden: { en: 'gland', vn: 'tuyến (nội/ngoại tiết), hạch' },
      glyc: { en: 'sugar, glucose', vn: 'đường, glucose' },
      lip: { en: 'fat, lipid', vn: 'mỡ, chất béo, lipid' },
      cyt: { en: 'cell', vn: 'tế bào' },
      path: { en: 'disease, suffering, feeling', vn: 'bệnh lý, tổn thương' },
      onc: { en: 'tumor, mass, bulk', vn: 'khối u, ung bướu' },
      carcin: { en: 'cancer, malignant epithelial tumor', vn: 'ung thư biểu mô' },
      necr: { en: 'death, dead tissue', vn: 'hoại tử, tế bào chết' },
      pyr: { en: 'fever, fire, heat', vn: 'sốt, nhiệt' },
      sep: { en: 'putrefaction, infection', vn: 'nhiễm trùng, nhiễm khuẩn' },
      tox: { en: 'poison, toxin', vn: 'độc tố, nhiễm độc' },
      pharmac: { en: 'drug, medicine', vn: 'dược phẩm, thuốc' },
      therap: { en: 'treatment, medical care', vn: 'điều trị, trị liệu' },
      scop: { en: 'to examine, observe, view', vn: 'quan sát, soi khám' },
      meticul: { en: 'careful, scrupulous attention to detail', vn: 'cẩn trọng, tỉ mỉ từng chi tiết' },
      ubiquit: { en: 'everywhere (Latin ubique)', vn: 'ở khắp mọi nơi, phổ biến' }
    },
    suffix: {
      itis: { en: 'inflammation, inflammatory disease', vn: 'tình trạng viêm, sưng viêm' },
      ectomy: { en: 'surgical removal, excision, cutting out', vn: 'phẫu thuật cắt bỏ' },
      tomy: { en: 'surgical incision, cutting into', vn: 'phẫu thuật mở, rạch' },
      stomy: { en: 'surgical creation of an artificial opening', vn: 'phẫu thuật mở thông ra ngoài' },
      scopy: { en: 'visual examination using an endoscope/instrument', vn: 'thủ thuật nội soi quan sát' },
      scope: { en: 'instrument for viewing or examining', vn: 'dụng cụ soi / ống nghe' },
      graphy: { en: 'process of recording or diagnostic imaging', vn: 'kỹ thuật chụp / ghi hình chẩn đoán' },
      gram: { en: 'record, image, tracing', vn: 'bản ghi, phim chụp, biểu đồ' },
      pathy: { en: 'disease, pathological disorder', vn: 'bệnh lý, chứng bệnh' },
      megaly: { en: 'abnormal enlargement of an organ', vn: 'chứng phì đại, to bất thường' },
      algia: { en: 'pain, painful condition', vn: 'đau, chứng đau' },
      dynia: { en: 'pain, aching', vn: 'cơn đau, nhức' },
      emia: { en: 'blood condition, presence of substance in blood', vn: 'tình trạng trong máu, huyết' },
      uria: { en: 'urinary condition, substance in urine', vn: 'tình trạng nước tiểu / tiểu tiện' },
      ia: { en: 'pathological condition, state, disorder', vn: 'tình trạng bệnh lý, chứng bệnh' },
      iasis: { en: 'abnormal condition, presence of (stones/parasites)', vn: 'bệnh lý tạo thành, nhiễm (sỏi / ký sinh trùng)' },
      osis: { en: 'abnormal condition, increase, degenerative process', vn: 'tình trạng bệnh lý, thoái hóa, tăng' },
      oma: { en: 'tumor, neoplasm, mass, swelling', vn: 'khối u, bướu, khối sưng' },
      lysis: { en: 'breakdown, dissolution, destruction, loosening', vn: 'sự phân hủy, ly giải, tiêu giải' },
      plasty: { en: 'surgical repair, reconstruction, molding', vn: 'phẫu thuật tạo hình, tái tạo' },
      centesis: { en: 'surgical puncture to aspirate fluid', vn: 'thủ thuật chọc dò hút dịch' },
      stenosis: { en: 'abnormal narrowing or stricture of a duct/passage', vn: 'tình trạng hẹp, chít hẹp bất thường' },
      sclerosis: { en: 'abnormal hardening or thickening of tissue', vn: 'tình trạng xơ cứng, xơ hóa' },
      penia: { en: 'deficiency, abnormal decrease in cells/substance', vn: 'sự thiếu hụt, giảm số lượng' },
      rrhea: { en: 'flow, excessive discharge', vn: 'chảy dịch, tiết dịch, tiêu chảy' },
      rrhage: { en: 'excessive burst of blood flow, hemorrhage', vn: 'xuất huyết, chảy máu ồ ạt' },
      lith: { en: 'stone, calculus, calcification', vn: 'sỏi, khối vôi hóa (sỏi phân / sỏi mật / sỏi thận)' },
      cele: { en: 'hernia, protrusion, swelling, pouch', vn: 'thoát vị, túi phình, khối lồi' },
      edema: { en: 'swelling caused by fluid accumulation', vn: 'phù nề, ứ dịch' },
      emesis: { en: 'vomiting', vn: 'nôn, ói' },
      pnea: { en: 'breathing, respiration', vn: 'hơi thở, sự hô hấp' },
      plegia: { en: 'paralysis, stroke', vn: 'liệt hoàn toàn' },
      paresis: { en: 'weakness, partial paralysis', vn: 'yếu liệt, liệt nhẹ' },
      trophy: { en: 'nourishment, development, growth', vn: 'dinh dưỡng, sự phát triển cơ/mô' },
      plasia: { en: 'formation, development, cell growth', vn: 'sự hình thành, tăng sinh tế bào' },
      genesis: { en: 'origin, production, development', vn: 'sự sinh ra, nguồn gốc, cơ chế bệnh sinh' },
      cyte: { en: 'mature cell', vn: 'tế bào trưởng thành' },
      oid: { en: 'resembling, shaped like', vn: 'giống như, có dạng hình' },
      ion: { en: 'action, process, state, or condition', vn: 'quá trình, hành động, tình trạng (hậu tố tạo danh từ)' },
      ation: { en: 'action, process, or resulting state', vn: 'quá trình, sự việc, tình trạng (hậu tố danh từ)' },
      ition: { en: 'action or state', vn: 'quá trình, trạng thái' },
      ance: { en: 'state, quality, capacity, or degree', vn: 'trạng thái, tính chất, khả năng (hậu tố danh từ)' },
      ence: { en: 'state, action, or quality', vn: 'trạng thái, tính chất (hậu tố danh từ)' },
      ity: { en: 'quality, state, or degree', vn: 'tính chất, mức độ' },
      ism: { en: 'condition, syndrome, process, or doctrine', vn: 'hội chứng, tình trạng bệnh lý' },
      ic: { en: 'pertaining to, relating to', vn: 'thuộc về, liên quan đến (hậu tố tính từ)' },
      al: { en: 'pertaining to, relating to', vn: 'thuộc về (hậu tố tính từ)' },
      ar: { en: 'pertaining to', vn: 'thuộc về (hậu tố tính từ)' },
      ary: { en: 'pertaining to, connected with', vn: 'thuộc về, liên quan đến' },
      ous: { en: 'full of, characterized by, pertaining to', vn: 'có nhiều, mang tính chất (hậu tố tính từ)' },
      ive: { en: 'tending to, having the nature of', vn: 'có xu hướng, mang tính chất' }
    }
  };

  function cleanMorpheme(str) {
    return String(str || '').replace(/[()\-–—\/]/g, '').trim().toLowerCase();
  }

  function lookupDictFuzzy(type, code) {
    if (!code) return null;
    const c = cleanMorpheme(code);
    if (!c) return null;
    const dict = MEDICAL_DICT[type] || {};
    if (dict[c]) return dict[c];
    const noVowel = c.replace(/[oiae]$/, '');
    if (noVowel && dict[noVowel]) return dict[noVowel];
    if (c === 'ation' || c === 'ition' || c === 'tion') return dict.ation || dict.ion;
    if (c === 'irrit') return dict.irrit || dict.irritat;
    for (const [k, val] of Object.entries(dict)) {
      if (k.length >= 3 && c.length >= 3 && (k.startsWith(c) || c.startsWith(k))) return val;
    }
    return null;
  }

  function resolveMorphemeMeaning(type, rawStr) {
    if (!rawStr) return null;
    const str = String(rawStr).trim();
    if (!str || /^(không có|none|n\/a|—|-)$/i.test(str)) return null;
    const matchInline = str.match(/^([^\(]+?)(?:\(([^)]+)\))?$/);
    const rawElem = (matchInline ? matchInline[1] : str).trim();
    const userNote = matchInline && matchInline[2] ? matchInline[2].trim() : '';
    const cleanElem = cleanMorpheme(rawElem);
    const found = lookupDictFuzzy(type, cleanElem);
    let en = '', vn = '';
    if (found && userNote) {
      en = found.en;
      vn = userNote.length > found.vn.length ? userNote : found.vn;
    } else if (found) {
      en = found.en;
      vn = found.vn;
    } else if (userNote) {
      const splitNote = userNote.split(/\|/);
      if (splitNote.length >= 2) {
        en = splitNote[0].replace(/^EN:\s*/i, '').trim();
        vn = splitNote[1].replace(/^VN:\s*/i, '').trim();
      } else {
        vn = userNote;
        en = `Medical/lexical element "${rawElem}"`;
      }
    } else return null;

    const formattedElem =
      type === 'prefix' ? rawElem.replace(/-?$/, '-') : type === 'suffix' ? rawElem.replace(/^-?/, '-') : rawElem;
    return { element: formattedElem, en, vn };
  }

  function autoDecomposeWord(wordText) {
    const raw = String(wordText || '').trim();
    if (!raw) return null;
    if (/\s+/.test(raw)) {
      const parts = raw.toLowerCase().split(/\s+/);
      for (const p of parts) {
        const hit = lookupDictFuzzy('root', p);
        if (hit) {
          return {
            prefix: null,
            root: { element: p, en: hit.en, vn: hit.vn },
            combining: null,
            suffix: parts.includes('sign')
              ? { element: 'sign', en: 'clinical sign / physical examination finding', vn: 'dấu hiệu lâm sàng khi thăm khám' }
              : null
          };
        }
      }
      return null;
    }

    const w = raw.toLowerCase();
    if (w.length < 4) return null;
    if (w === 'peritonitis') {
      return {
        prefix: { element: 'peri-', ...MEDICAL_DICT.prefix.peri },
        root: { element: 'ton / peritone', ...MEDICAL_DICT.root.periton },
        combining: null,
        suffix: { element: '-itis', ...MEDICAL_DICT.suffix.itis }
      };
    }
    if (w === 'fecalith' || w === 'faecalith') {
      return {
        prefix: null,
        root: { element: 'fec / feca', ...MEDICAL_DICT.root.fec },
        combining: { element: '-a- / -o-', en: 'combining vowel', vn: 'nguyên âm nối' },
        suffix: { element: '-lith', ...MEDICAL_DICT.suffix.lith }
      };
    }
    if (w === 'dysuria') {
      return {
        prefix: { element: 'dys-', ...MEDICAL_DICT.prefix.dys },
        root: { element: 'ur-', ...MEDICAL_DICT.root.ur },
        combining: null,
        suffix: { element: '-ia', ...MEDICAL_DICT.suffix.ia }
      };
    }
    if (w === 'irritation') {
      return {
        prefix: null,
        root: { element: 'irritat-', ...MEDICAL_DICT.root.irritat },
        combining: null,
        suffix: { element: '-ion', ...MEDICAL_DICT.suffix.ion }
      };
    }
    if (w === 'resistance') {
      return {
        prefix: { element: 're-', ...MEDICAL_DICT.prefix.re },
        root: { element: 'sist', ...MEDICAL_DICT.root.sist },
        combining: null,
        suffix: { element: '-ance', ...MEDICAL_DICT.suffix.ance }
      };
    }

    let prefix = null, root = null, suffix = null, rem = w;
    const suffixes = Object.keys(MEDICAL_DICT.suffix).sort((a, b) => b.length - a.length);
    for (const s of suffixes) {
      if (rem.endsWith(s) && rem.length >= s.length + 3) {
        suffix = { element: '-' + s, ...MEDICAL_DICT.suffix[s] };
        rem = rem.slice(0, -s.length);
        break;
      }
    }
    const prefixes = Object.keys(MEDICAL_DICT.prefix).sort((a, b) => b.length - a.length);
    for (const p of prefixes) {
      if (rem.startsWith(p) && rem.length >= p.length + 2) {
        prefix = { element: p + '-', ...MEDICAL_DICT.prefix[p] };
        rem = rem.slice(p.length);
        break;
      }
    }
    const cleanRem = rem.replace(/[oi]$/, '') || rem;
    const roots = Object.keys(MEDICAL_DICT.root).sort((a, b) => b.length - a.length);
    for (const r of roots) {
      if (cleanRem === r || rem === r || (r.length >= 4 && (cleanRem.includes(r) || r.includes(cleanRem)))) {
        root = { element: r, ...MEDICAL_DICT.root[r] };
        break;
      }
    }
    if (root || (prefix && suffix)) {
      if (!root && cleanRem.length >= 2) {
        const fallbackHit = lookupDictFuzzy('root', cleanRem);
        root = {
          element: cleanRem,
          en: fallbackHit ? fallbackHit.en : `root stem "${cleanRem}"`,
          vn: fallbackHit ? fallbackHit.vn : `gốc từ "${cleanRem}"`
        };
      }
      if (prefix || root || suffix) return { prefix, root, combining: null, suffix };
    }
    return null;
  }

  function analyzeWordElements(wordObj) {
    if (!wordObj || !wordObj.word) return null;
    const m = wordObj.medAnatomy || {};
    let prefix = resolveMorphemeMeaning('prefix', m.prefix);
    let root = resolveMorphemeMeaning('root', m.root);
    let suffix = resolveMorphemeMeaning('suffix', m.suffix);
    let combining =
      m.combining && !/^(không có|none|n\/a|—|-)$/i.test(String(m.combining).trim())
        ? { element: String(m.combining).trim(), en: 'combining vowel linking root to suffix', vn: 'nguyên âm nối giữa gốc từ và hậu tố' }
        : null;

    const auto = autoDecomposeWord(wordObj.word);
    if (auto) {
      if (!prefix && auto.prefix) prefix = auto.prefix;
      if (!root && auto.root) root = auto.root;
      if (!suffix && auto.suffix) suffix = auto.suffix;
      if (!combining && auto.combining) combining = auto.combining;
    }
    if (!prefix && !root && !suffix) return null;
    return { prefix, root, combining, suffix };
  }

  function buildMedicalBreakdownHTML(wordObj, defaultOpen = true) {
    const parsed = analyzeWordElements(wordObj);
    if (!parsed) return '';
    const { prefix, root, combining, suffix } = parsed;
    const partsHTML = [];
    if (prefix) {
      partsHTML.push(`
        <div class="p-2.5 rounded-lg bg-sky/10 border border-sky/30 space-y-1">
          <div class="flex items-center justify-between text-[11px] font-mono">
            <span class="text-sky font-bold">Tiền tố (Prefix)</span>
            <span class="font-bold text-fg bg-line/40 px-2 py-0.5 rounded">${escHTML(prefix.element)}</span>
          </div>
          <p class="text-xs font-semibold text-fg">🇻🇳 ${escHTML(prefix.vn)}</p>
          <p class="text-[11px] text-mute italic">🇬🇧 ${escHTML(prefix.en)}</p>
        </div>`);
    }
    if (root) {
      partsHTML.push(`
        <div class="p-2.5 rounded-lg bg-bad/10 border border-bad/30 space-y-1">
          <div class="flex items-center justify-between text-[11px] font-mono">
            <span class="text-bad font-bold">Gốc từ (Root)</span>
            <span class="font-bold text-fg bg-line/40 px-2 py-0.5 rounded">${escHTML(root.element)}</span>
          </div>
          <p class="text-xs font-semibold text-fg">🇻🇳 ${escHTML(root.vn)}</p>
          <p class="text-[11px] text-mute italic">🇬🇧 ${escHTML(root.en)}</p>
        </div>`);
    }
    if (combining) {
      partsHTML.push(`
        <div class="p-2.5 rounded-lg bg-warn/10 border border-warn/30 space-y-1">
          <div class="flex items-center justify-between text-[11px] font-mono">
            <span class="text-warn font-bold">Yếu tố nối (Combining)</span>
            <span class="font-bold text-fg bg-line/40 px-2 py-0.5 rounded">${escHTML(combining.element)}</span>
          </div>
          <p class="text-xs font-semibold text-fg">🇻🇳 ${escHTML(combining.vn)}</p>
          <p class="text-[11px] text-mute italic">🇬🇧 ${escHTML(combining.en)}</p>
        </div>`);
    }
    if (suffix) {
      partsHTML.push(`
        <div class="p-2.5 rounded-lg bg-ok/10 border border-ok/30 space-y-1">
          <div class="flex items-center justify-between text-[11px] font-mono">
            <span class="text-ok font-bold">Hậu tố (Suffix)</span>
            <span class="font-bold text-fg bg-line/40 px-2 py-0.5 rounded">${escHTML(suffix.element)}</span>
          </div>
          <p class="text-xs font-semibold text-fg">🇻🇳 ${escHTML(suffix.vn)}</p>
          <p class="text-[11px] text-mute italic">🇬🇧 ${escHTML(suffix.en)}</p>
        </div>`);
    }

    const summaryTokens = [prefix?.element, root?.element, combining?.element, suffix?.element].filter(Boolean).join(' + ');
    const formulaVN = [prefix?.vn, root?.vn, suffix?.vn].filter(Boolean).join(' + ');
    const cols = partsHTML.length >= 3 ? 'sm:grid-cols-3' : partsHTML.length === 2 ? 'sm:grid-cols-2' : 'grid-cols-1';

    return `
      <details class="inset p-3 rounded-xl border border-bad/40 bg-bad/5 space-y-2.5 select-none" ${defaultOpen ? 'open' : ''} data-med-widget="1">
        <summary class="text-xs font-bold text-bad cursor-pointer flex flex-wrap items-center justify-between gap-2 list-none">
          <span class="flex items-center gap-1.5">
            <span>🧬</span>
            <span>Thành tố từ: <b class="font-mono text-fg">${escHTML(summaryTokens)}</b></span>
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded border border-bad/40 bg-bad/15 text-bad hover:brightness-110">
            Bấm để Ẩn / Hiện giải nghĩa ▾
          </span>
        </summary>
        <div class="grid grid-cols-1 ${cols} gap-2 pt-2 border-t border-line/50">
          ${partsHTML.join('')}
        </div>
        ${
          formulaVN
            ? `<div class="p-2 rounded-lg bg-app/90 text-[11px] border border-line/60 flex flex-wrap items-center gap-1">
                <span class="text-mute">💡 Ghép nghĩa:</span>
                <b class="text-fg">${escHTML(formulaVN)}</b>
                ${wordObj.meaning ? `<span class="text-mute">→</span> <b class="text-ok">${escHTML(wordObj.meaning)}</b>` : ''}
              </div>`
            : ''
        }
      </details>
    `;
  }

  function getStoredWordsList() {
    try {
      const raw = localStorage.getItem(LS_VAULT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.words) ? parsed.words : [];
    } catch (e) {
      return [];
    }
  }

  function findWordObjectByName(wordText) {
    const target = normKey(wordText);
    if (!target) return null;
    const list = getStoredWordsList();
    const found = list.find((w) => normKey(w.word) === target);
    if (found) return found;
    return { word: wordText, meaning: '', medAnatomy: {} };
  }

  function upgradeExistingStoredWords() {
    try {
      const raw = localStorage.getItem(LS_VAULT_KEY);
      if (!raw) return;
      const db = JSON.parse(raw);
      if (!db || !Array.isArray(db.words)) return;
      let changed = false;
      db.words.forEach((w) => {
        const parsed = analyzeWordElements(w);
        if (!parsed) return;
        if (!w.medAnatomy) w.medAnatomy = {};
        const fmt = (item) => (item ? `${item.element} (${item.vn} | ${item.en})` : '');
        const newP = fmt(parsed.prefix);
        const newR = fmt(parsed.root);
        const newS = fmt(parsed.suffix);
        if (newP && (!w.medAnatomy.prefix || !w.medAnatomy.prefix.includes('('))) {
          w.medAnatomy.prefix = newP;
          changed = true;
        }
        if (newR && (!w.medAnatomy.root || !w.medAnatomy.root.includes('('))) {
          w.medAnatomy.root = newR;
          changed = true;
        }
        if (newS && (!w.medAnatomy.suffix || !w.medAnatomy.suffix.includes('('))) {
          w.medAnatomy.suffix = newS;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(LS_VAULT_KEY, JSON.stringify(db));
        if (typeof global.load === 'function') global.load();
      }
    } catch (e) {}
  }

  function injectQuizMedicalBreakdown() {
    const quizCard = document.getElementById('quiz');
    if (!quizCard || quizCard.querySelector('[data-med-breakdown]')) return;
    const nextBtn = quizCard.querySelector('button[data-a="next"]');
    if (!nextBtn) return;
    const resultBox = nextBtn.closest('.inset');
    if (!resultBox) return;
    const speakBtn = resultBox.querySelector('button[data-a="speak"]');
    let wordText = speakBtn ? speakBtn.getAttribute('data-v') : '';
    if (!wordText) {
      const pTag = resultBox.querySelector('p');
      if (pTag) wordText = pTag.textContent.split('/')[0].trim();
    }
    if (!wordText) return;
    const wordObj = findWordObjectByName(wordText);
    const html = buildMedicalBreakdownHTML(wordObj, true);
    if (!html) return;
    const wrap = document.createElement('div');
    wrap.setAttribute('data-med-breakdown', '1');
    wrap.innerHTML = html;
    resultBox.parentNode.insertBefore(wrap, resultBox.nextSibling);
  }

  function upgradeVaultAndModalMedicalBoxes() {
    const articles = document.querySelectorAll('#grid article.card:not([data-med-card-upgraded])');
    articles.forEach((art) => {
      art.setAttribute('data-med-card-upgraded', '1');
      const speakBtn = art.querySelector('button[data-a="speak"]');
      const wordText = speakBtn ? speakBtn.getAttribute('data-v') : '';
      if (!wordText) return;
      const wordObj = findWordObjectByName(wordText);
      const html = buildMedicalBreakdownHTML(wordObj, false);
      if (!html) return;
      const oldRedBar = art.querySelector('.inset.text-bad');
      const temp = document.createElement('div');
      temp.innerHTML = html.trim();
      const newWidget = temp.firstElementChild;
      if (oldRedBar && newWidget) oldRedBar.replaceWith(newWidget);
      else if (newWidget) {
        const meaningP = art.querySelector('p.text-sm.font-semibold');
        if (meaningP && meaningP.parentNode) meaningP.parentNode.insertBefore(newWidget, meaningP.nextSibling);
      }
    });

    ['detail', 'look'].forEach((containerId) => {
      const box = document.getElementById(containerId);
      if (!box || box.querySelector('[data-med-widget]')) return;
      const oldBar = box.querySelector('.inset.text-bad');
      const hTag = box.querySelector('h2, h3');
      const wordText = hTag ? hTag.textContent.trim() : '';
      if (!wordText) return;
      const wordObj = findWordObjectByName(wordText);
      const html = buildMedicalBreakdownHTML(wordObj, true);
      if (!html) return;
      const temp = document.createElement('div');
      temp.innerHTML = html.trim();
      const newWidget = temp.firstElementChild;
      if (oldBar && newWidget) oldBar.replaceWith(newWidget);
    });
  }

  /* ==========================================================================
   * 3. ĐỒNG BỘ ĐÁM MÂY 2 THIẾT BỊ (HOẠT ĐỘNG 100% TRÊN GITHUB PAGES & MỌI MÁY)
   * ========================================================================== */
  function getMasterPayload() {
    try {
      const raw = localStorage.getItem(LS_VAULT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        try {
          const acad = localStorage.getItem(LS_ACADEMY_KEY);
          if (acad) parsed.academyState = JSON.parse(acad);
        } catch (e) {}
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  function applyMasterPayload(payload, mode = 'merge') {
    if (!payload || !Array.isArray(payload.words)) throw new Error('Dữ liệu đồng bộ không hợp lệ.');
    let current = getMasterPayload() || { words: [], mistakes: [], topics: [] };

    if (mode === 'replace') {
      current = payload;
    } else {
      const mapByWord = new Map();
      (current.words || []).forEach((w) => mapByWord.set(normKey(w.word), w));
      (payload.words || []).forEach((nw) => {
        const k = normKey(nw.word);
        if (!mapByWord.has(k)) {
          current.words.push(nw);
          mapByWord.set(k, nw);
        } else {
          const ex = mapByWord.get(k);
          if ((nw.mastery || 0) > (ex.mastery || 0)) ex.mastery = nw.mastery;
        }
      });

      const topicSet = new Set((current.topics || []).map((t) => normKey(t.name)));
      (payload.topics || []).forEach((nt) => {
        if (!topicSet.has(normKey(nt.name))) {
          current.topics.push(nt);
          topicSet.add(normKey(nt.name));
        }
      });

      const mistSet = new Set((current.mistakes || []).map((m) => m.sentence));
      (payload.mistakes || []).forEach((nm) => {
        if (!mistSet.has(nm.sentence)) {
          current.mistakes.push(nm);
          mistSet.add(nm.sentence);
        }
      });
    }

    if (payload.academyState) {
      try {
        const curAcad = JSON.parse(localStorage.getItem(LS_ACADEMY_KEY) || '{}');
        const mergedAcad = Object.assign({}, curAcad, payload.academyState, {
          doneIds: Array.from(new Set([...(curAcad.doneIds || []), ...(payload.academyState.doneIds || [])])),
          drafts: Object.assign({}, curAcad.drafts || {}, payload.academyState.drafts || {}),
          dailyStreak: Math.max(curAcad.dailyStreak || 0, payload.academyState.dailyStreak || 0)
        });
        localStorage.setItem(LS_ACADEMY_KEY, JSON.stringify(mergedAcad));
      } catch (e) {}
    }

    current.updatedAt = Date.now();
    localStorage.setItem(LS_VAULT_KEY, JSON.stringify(current));
    upgradeExistingStoredWords();

    if (typeof global.load === 'function') global.load();
    if (typeof global.renderVault === 'function') global.renderVault();
    if (typeof global.renderStats === 'function') global.renderStats();
    if (typeof global.renderTopics === 'function') global.renderTopics();
    return current;
  }

  async function pushToCloudSync(customPin = '') {
    const payload = getMasterPayload();
    if (!payload || !payload.words || !payload.words.length) {
      throw new Error('Kho từ vựng đang trống, chưa có dữ liệu để tải lên.');
    }
    let pin = String(customPin || localStorage.getItem(LS_SYNC_PIN_KEY) || '').trim().replace(/[^0-9A-Z]/gi, '');
    if (!pin || pin.length < 4) pin = String(Math.floor(100000 + Math.random() * 900000));

    const envelope = JSON.stringify({ v: 5, pin, updatedAt: Date.now(), payload });
    let uploaded = false;

    try {
      const topicUrl = 'https://ntfy.sh/lexicontext_sync_v4_' + encodeURIComponent(pin);
      const r = await fetch(topicUrl, { method: 'POST', body: envelope });
      if (r.ok) uploaded = true;
    } catch (e) {}

    try {
      const r2 = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pin, data: payload })
      });
      if (r2.ok) uploaded = true;
    } catch (e) {}

    if (!uploaded) throw new Error('Không thể kết nối máy chủ đám mây. Vui lòng kiểm tra kết nối Internet.');
    localStorage.setItem(LS_SYNC_PIN_KEY, pin);
    return { success: true, code: pin, totalWords: payload.words.length };
  }

  async function pullFromCloudSync(pinCode, mode = 'merge') {
    const code = String(pinCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) throw new Error('Vui lòng nhập mã PIN 6 số.');
    let fetchedPayload = null;

    try {
      const pollUrl = 'https://ntfy.sh/lexicontext_sync_v4_' + encodeURIComponent(code) + '/json?poll=1';
      const resp = await fetch(pollUrl);
      if (resp.ok) {
        const rawText = await resp.text();
        const lines = rawText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            try { return JSON.parse(l); } catch (e) { return null; }
          })
          .filter((x) => x && x.event === 'message');

        if (lines.length > 0) {
          const latest = lines[lines.length - 1];
          if (latest.attachment && latest.attachment.url) {
            const attResp = await fetch(latest.attachment.url);
            if (attResp.ok) {
              const attJson = await attResp.json();
              fetchedPayload = attJson.payload || attJson;
            }
          } else if (latest.message) {
            const msgJson = JSON.parse(latest.message);
            fetchedPayload = msgJson.payload || msgJson;
          }
        }
      }
    } catch (e) {}

    if (!fetchedPayload) {
      try {
        const resp2 = await fetch('/api/sync/pull/' + encodeURIComponent(code));
        if (resp2.ok) {
          const j = await resp2.json();
          if (j && j.data) fetchedPayload = j.data;
        }
      } catch (e) {}
    }

    if (!fetchedPayload || !Array.isArray(fetchedPayload.words)) {
      throw new Error(`Chưa tìm thấy dữ liệu cho mã "${code}". Hãy bấm nút "☁️ Tải lên & Nhận mã 6 số" ở Thiết bị 1 trước rồi thử lại!`);
    }

    const merged = applyMasterPayload(fetchedPayload, mode);
    localStorage.setItem(LS_SYNC_PIN_KEY, code);
    return { success: true, code, totalWords: merged.words.length };
  }

  function renderSyncModal() {
    let modal = document.getElementById('m-sync');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'm-sync';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    const savedPin = localStorage.getItem(LS_SYNC_PIN_KEY) || '';
    const payload = getMasterPayload();
    const wordCount = payload?.words?.length || 0;

    modal.innerHTML = `
      <div class="card sheet max-w-xl space-y-4">
        <div class="flex justify-between items-center border-b border-line/60 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔄</span>
            <div>
              <h3 class="font-bold text-lg">Đồng bộ đám mây 2 thiết bị</h3>
              <p class="text-xs text-mute">Chuyển nhanh kho từ vựng & tiến độ B1/B2 giữa iPad, iPhone, máy tính chỉ bằng mã 6 số.</p>
            </div>
          </div>
          <button class="btn" data-a="close" data-v="m-sync" aria-label="Đóng">✕</button>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div class="inset p-4 space-y-3 border-pri/40 bg-pri/5 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-pri uppercase">📤 Bước 1: Máy có dữ liệu</span>
              <span class="text-[11px] font-mono font-bold text-ok">${wordCount} từ</span>
            </div>
            <p class="text-xs text-mute">Bấm nút dưới đây trên máy đang có nhiều dữ liệu để đẩy lên đám mây:</p>
            <button id="sync-push-btn" class="btn btn-pri w-full justify-center text-xs py-2.5">
              ☁️ Tải lên & Nhận mã 6 số
            </button>
            <div id="sync-push-result" class="${savedPin ? '' : 'hidden'} inset p-2.5 text-center space-y-1">
              <div class="text-[11px] text-mute">Mã PIN đồng bộ của bạn:</div>
              <div id="sync-pin-display" class="text-2xl font-black font-mono tracking-widest text-warn select-all">${savedPin || '------'}</div>
              <div class="text-[10px] text-ok">👉 Nhập mã này sang Thiết bị 2 để nhận dữ liệu.</div>
            </div>
          </div>

          <div class="inset p-4 space-y-3 border-ok/40 bg-ok/5 rounded-xl">
            <span class="text-xs font-bold text-ok uppercase">📥 Bước 2: Máy nhận dữ liệu</span>
            <p class="text-xs text-mute">Sau khi đã bấm Tải lên ở Máy 1, hãy nhập mã 6 số vào đây:</p>
            <input id="sync-pull-code" class="inp font-mono text-center text-lg uppercase font-bold tracking-widest" placeholder="Nhập mã 6 số" value="${savedPin}">
            <button id="sync-pull-btn" class="btn btn-ok w-full justify-center text-xs py-2.5">
              📥 Đồng bộ ngay vào máy này
            </button>
            <label class="flex items-center gap-1.5 text-[11px] text-mute cursor-pointer">
              <input type="checkbox" id="sync-replace-check" class="rounded">
              <span>Ghi đè hoàn toàn (xóa từ cũ của máy này)</span>
            </label>
          </div>
        </div>

        <div id="sync-status-msg" class="text-xs font-medium text-center min-h-[1.25rem]"></div>
      </div>
    `;

    const closeBtn = modal.querySelector('[data-a="close"]');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('open');

    const pushBtn = modal.querySelector('#sync-push-btn');
    const pullBtn = modal.querySelector('#sync-pull-btn');
    const pushResult = modal.querySelector('#sync-push-result');
    const pinDisplay = modal.querySelector('#sync-pin-display');
    const codeInp = modal.querySelector('#sync-pull-code');
    const replaceCheck = modal.querySelector('#sync-replace-check');
    const statusMsg = modal.querySelector('#sync-status-msg');

    pushBtn.addEventListener('click', async () => {
      pushBtn.disabled = true;
      pushBtn.textContent = 'Đang tải lên đám mây...';
      statusMsg.innerHTML = '<span class="text-mute">Đang đồng bộ dữ liệu lên Cloud Relay...</span>';
      try {
        const res = await pushToCloudSync(codeInp.value.trim());
        pinDisplay.textContent = res.code;
        codeInp.value = res.code;
        pushResult.classList.remove('hidden');
        statusMsg.innerHTML = `<span class="text-ok">✅ Đã tải thành công <b>${res.totalWords} từ vựng & tiến độ B1/B2</b> lên đám mây! Hãy nhập mã <b>${res.code}</b> ở máy thứ 2.</span>`;
      } catch (err) {
        statusMsg.innerHTML = `<span class="text-bad">❌ ${escHTML(err.message)}</span>`;
      } finally {
        pushBtn.disabled = false;
        pushBtn.textContent = '☁️ Cập nhật lại lên Đám mây';
      }
    });

    pullBtn.addEventListener('click', async () => {
      const code = codeInp.value.trim();
      if (!code) {
        statusMsg.innerHTML = '<span class="text-bad">Vui lòng nhập mã đồng bộ 6 số.</span>';
        return;
      }
      pullBtn.disabled = true;
      pullBtn.textContent = 'Đang tải dữ liệu về...';
      statusMsg.innerHTML = '<span class="text-mute">Đang kết nối đám mây để lấy từ vựng...</span>';
      try {
        const mode = replaceCheck.checked ? 'replace' : 'merge';
        const res = await pullFromCloudSync(code, mode);
        statusMsg.innerHTML = `<span class="text-ok">🎉 Đồng bộ thành công <b>${res.totalWords} từ vựng</b>! Đang làm mới giao diện...</span>`;
        notify('🎉 Đã đồng bộ thành công ' + res.totalWords + ' từ vựng!');
        setTimeout(() => {
          modal.classList.remove('open');
          location.reload();
        }, 900);
      } catch (err) {
        statusMsg.innerHTML = `<span class="text-bad">❌ ${escHTML(err.message)}</span>`;
      } finally {
        pullBtn.disabled = false;
        pullBtn.textContent = '📥 Đồng bộ ngay vào máy này';
      }
    });

    modal.classList.add('open');
  }

  function injectSyncHeaderButton() {
    const headerBtns = document.querySelector('header .flex.items-center.gap-1\\.5');
    if (headerBtns && !document.getElementById('btn-sync-devices') && !headerBtns.querySelector('[data-a="sync"]')) {
      const b = document.createElement('button');
      b.id = 'btn-sync-devices';
      b.className = 'btn border-pri/40 bg-pri/10 text-pri font-bold hover:brightness-110';
      b.title = 'Đồng bộ dữ liệu giữa 2 thiết bị (iPad, iPhone, PC) bằng mã 6 số';
      b.innerHTML = '<span>🔄</span><span class="hidden sm:inline">Đồng bộ</span>';
      b.onclick = () => renderSyncModal();
      headerBtns.insertBefore(b, headerBtns.firstChild);
    }
  }

  /* ==========================================================================
   * 4. SMART CACHE TIẾT KIỆM QUOTA GEMINI API
   * ========================================================================== */
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
      } catch (e) {
        resolve(null);
      }
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
      entries.forEach(([k, v]) => (plain[k] = v));
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
      } catch (e) {
        resolve(null);
      }
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
        word: w.word,
        pos: w.pos || 'word',
        ipa: w.ipa || '',
        cefr: w.cefr || 'B2',
        topic: w.topic || '',
        medPrefix: m.prefix || '',
        medRoot: m.root || '',
        medCombining: m.combining || '',
        medSuffix: m.suffix || '',
        meaning: w.meaning || '',
        example: w.example || '',
        exampleTrans: w.exampleTrans || '',
        collocations: Array.isArray(w.collocations) ? w.collocations : [],
        explanation: w.explanation || '',
        personalNote: w.personalNote || '',
        quizSentence: q.sentence || '',
        quizTrans: q.trans || w.exampleTrans || ''
      };
    } catch (e) {
      return null;
    }
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
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: typeof text === 'string' ? text : JSON.stringify(text) }] } }]
      }),
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
          let promptText = body?.contents?.[0]?.parts?.[0]?.text || '';
          const info = extractKey(promptText);

          if (promptText && promptText.includes('medPrefix') && !promptText.includes('EN:')) {
            body.contents[0].parts[0].text =
              promptText +
              '\nLưu ý quan trọng về thành tố từ (medPrefix, medRoot, medCombining, medSuffix): nếu từ có tiền tố, gốc từ hoặc hậu tố (đặc biệt là thuật ngữ Y khoa hoặc từ học thuật có gốc Latin/Hy Lạp), hãy ghi rõ cả thành tố kèm nghĩa tiếng Việt và tiếng Anh trong ngoặc đơn, ví dụ: "peri- (xung quanh | around)", "ton/peritone (phúc mạc | peritoneum)", "-itis (viêm | inflammation)".';
            init = Object.assign({}, init, { body: JSON.stringify(body) });
          }

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

  /* ==========================================================================
   * 5. HỆ THỐNG HỌC VIỆN 4 KỸ NĂNG: B1 → B2 → DUY TRÌ (ACADEMY PRO v5)
   * ========================================================================== */
  const ACADEMY_DATA = {
    listening: {
      B1: [
        {
          id: 'lis_b1_1',
          category: 'Giao tiếp Y khoa & Đời sống',
          title: 'Hỏi triệu chứng tại phòng khám',
          sentence: 'How long have you been experiencing this sharp abdominal pain?',
          ipaNote: 'Nối âm & Nhấn âm: "have you been" đọc lướt nhẹ /həv jə bɪn/, nhấn mạnh vào "experiencing", "sharp", "abdominal pain".',
          trans: 'Bạn đã bị cơn đau bụng nhói này bao lâu rồi?',
          keyVocab: [
            { word: 'experience', meaning: 'trải qua, gặp phải (triệu chứng)', pos: 'verb', cefr: 'B1', topic: 'Y khoa - Lâm sàng' },
            { word: 'abdominal pain', meaning: 'đau bụng', pos: 'noun', cefr: 'B1', topic: 'Y khoa - Lâm sàng' }
          ],
          mcq: {
            question: 'Bác sĩ đang muốn khai thác thông tin gì từ bệnh nhân?',
            options: [
              'Thời gian khởi phát và kéo dài của cơn đau bụng',
              'Lịch sử dị ứng thuốc của gia đình bệnh nhân',
              'Chi phí phẫu thuật tại bệnh viện',
              'Địa chỉ nhà của bệnh nhân'
            ],
            answer: 0,
            explain: 'Cụm từ khóa "How long have you been experiencing..." hỏi về khoảng thời gian triệu chứng bắt đầu kéo dài đến hiện tại.'
          }
        },
        {
          id: 'lis_b1_2',
          category: 'Công việc & Học tập',
          title: 'Thông báo đổi lịch họp nhóm',
          sentence: 'We need to reschedule our weekly meeting to Thursday afternoon.',
          ipaNote: 'Bẫy âm đuôi: "need to" nối âm thành /niːd tə/, phân biệt "Tuesday" (Thứ Ba) và "Thursday" (Thứ Năm /ˈθɜːzdeɪ/).',
          trans: 'Chúng ta cần dời lịch buổi họp hàng tuần sang chiều thứ Năm.',
          keyVocab: [
            { word: 'reschedule', meaning: 'dời lịch, sắp xếp lại lịch trình', pos: 'verb', cefr: 'B1', topic: 'Cụm Động Từ & Giao Tiếp' }
          ],
          mcq: {
            question: 'Mục đích chính của thông báo này là gì?',
            options: [
              'Hủy bỏ hoàn toàn dự án',
              'Dời buổi họp sang chiều thứ Năm',
              'Tổ chức tiệc vào sáng thứ Ba',
              'Yêu cầu nộp báo cáo ngay lập tức'
            ],
            answer: 1,
            explain: 'Từ khóa tín hiệu là "reschedule ... to Thursday afternoon" (dời lịch sang chiều thứ Năm).'
          }
        },
        {
          id: 'lis_b1_3',
          category: 'Đời sống & Sức khỏe',
          title: 'Lời khuyên chế độ sinh hoạt',
          sentence: 'Getting enough sleep and regular exercise can significantly boost your immune system.',
          ipaNote: 'Trọng âm câu rơi vào: "enough sleep", "regular exercise", "significantly boost", "immune system".',
          trans: 'Ngủ đủ giấc và tập thể dục đều đặn có thể tăng cường đáng kể hệ miễn dịch của bạn.',
          keyVocab: [
            { word: 'immune system', meaning: 'hệ miễn dịch', pos: 'noun', cefr: 'B1', topic: 'Y khoa - Lâm sàng' },
            { word: 'significantly', meaning: 'một cách đáng kể', pos: 'adv', cefr: 'B1', topic: 'Học thuật & Công nghệ' }
          ],
          mcq: {
            question: 'Hai yếu tố nào giúp tăng cường hệ miễn dịch theo câu nghe?',
            options: [
              'Uống nhiều vitamin đắt tiền',
              'Ngủ đủ giấc và vận động thể dục đều đặn',
              'Làm việc thêm giờ vào ban đêm',
              'Kiêng hoàn toàn tinh bột'
            ],
            answer: 1,
            explain: 'Cụm chủ ngữ "Getting enough sleep and regular exercise" nêu trực tiếp 2 yếu tố cốt lõi.'
          }
        },
        {
          id: 'lis_b1_4',
          category: 'Lâm sàng & Hướng dẫn thuốc',
          title: 'Dặn dò bệnh nhân uống kháng sinh',
          sentence: 'Please take one tablet twice a day after meals for seven days.',
          ipaNote: 'Chú ý nối âm "twice a day" /twaɪs ə deɪ/ và âm cuối /-z/ trong "meals", "days".',
          trans: 'Vui lòng uống mỗi lần 1 viên, ngày 2 lần sau bữa ăn trong vòng 7 ngày.',
          keyVocab: [
            { word: 'twice a day', meaning: 'hai lần một ngày', pos: 'phrase', cefr: 'B1', topic: 'Y khoa - Lâm sàng' }
          ],
          mcq: {
            question: 'Bệnh nhân cần uống tổng cộng bao nhiêu viên thuốc mỗi ngày và vào lúc nào?',
            options: [
              '1 viên mỗi ngày trước khi ngủ',
              '2 viên mỗi ngày (mỗi lần 1 viên sau ăn)',
              '7 viên mỗi ngày trước bữa ăn',
              'Chỉ uống khi nào thấy đau'
            ],
            answer: 1,
            explain: '"one tablet twice a day after meals" = 1 viên x 2 lần/ngày sau bữa ăn.'
          }
        }
      ],
      B2: [
        {
          id: 'lis_b2_1',
          category: 'Y khoa - Lâm sàng (B2)',
          title: 'Biến chứng do trì hoãn điều trị',
          sentence: 'Delayed diagnosis of acute appendicitis can lead to perforation and generalized peritonitis.',
          ipaNote: 'Bẫy âm đuôi /-d/ trong "Delayed" và "generalized" dễ bị nuốt khi đọc nhanh. Chú ý trọng âm: "per-fo-RA-tion" và "pe-ri-to-NI-tis".',
          trans: 'Chẩn đoán muộn viêm ruột thừa cấp có thể dẫn đến thủng tạng và viêm phúc mạc toàn thể.',
          keyVocab: [
            { word: 'perforation', meaning: 'sự thủng (tạng rỗng)', pos: 'noun', cefr: 'B2', topic: 'Y khoa - Lâm sàng' },
            { word: 'peritonitis', meaning: 'viêm phúc mạc', pos: 'noun', cefr: 'B2', topic: 'Y khoa - Lâm sàng' }
          ],
          mcq: {
            question: 'Hậu quả nghiêm trọng nào xảy ra khi chẩn đoán viêm ruột thừa cấp bị chậm trễ?',
            options: [
              'Bệnh nhân tự khỏi mà không cần can thiệp',
              'Dẫn đến thủng ruột thừa và viêm phúc mạc toàn thể',
              'Chỉ gây sốt nhẹ thoáng qua',
              'Làm giảm huyết áp tạm thời'
            ],
            answer: 1,
            explain: 'Cấu trúc nhân quả B2 "lead to perforation and generalized peritonitis" chỉ rõ biến chứng.'
          }
        },
        {
          id: 'lis_b2_2',
          category: 'Học thuật VSTEP / IELTS (B2)',
          title: 'Tác động của công nghệ số đến y tế từ xa',
          sentence: 'Although telemedicine offers unprecedented convenience, it cannot entirely replace physical examinations.',
          ipaNote: 'Cấu trúc nhượng bộ "Although... , it cannot...". Chú ý từ "unprecedented" /ʌnˈpresɪdentɪd/ (chưa từng có tiền lệ).',
          trans: 'Mặc dù y tế từ xa mang lại sự tiện lợi chưa từng có, nó không thể thay thế hoàn toàn việc thăm khám trực tiếp.',
          keyVocab: [
            { word: 'unprecedented', meaning: 'chưa từng có tiền lệ', pos: 'adj', cefr: 'B2', topic: 'Học thuật & Công nghệ' },
            { word: 'telemedicine', meaning: 'y tế từ xa', pos: 'noun', cefr: 'B2', topic: 'Y khoa - Lâm sàng' }
          ],
          mcq: {
            question: 'Quan điểm của người nói về y tế từ xa (telemedicine) là gì?',
            options: [
              'Nó sẽ xóa sổ hoàn toàn các bệnh viện truyền thống',
              'Nó rất tiện lợi nhưng vẫn không thể thay thế hoàn toàn khám lâm sàng trực tiếp',
              'Nó hoàn toàn vô dụng và tốn kém',
              'Chỉ áp dụng được cho phẫu thuật cấp cứu'
            ],
            answer: 1,
            explain: 'Thông tin chính nằm ở mệnh đề sau "Although": "it cannot entirely replace physical examinations".'
          }
        },
        {
          id: 'lis_b2_3',
          category: 'Nghiên cứu & Môi trường (B2)',
          title: 'Kháng kháng sinh toàn cầu',
          sentence: 'The overuse of broad-spectrum antibiotics has accelerated the emergence of drug-resistant bacteria.',
          ipaNote: 'Nối âm: "has accelerated" /həz əkˈseləreɪtɪd/, "emergence of" /ɪˈmɜːdʒəns əv/.',
          trans: 'Việc lạm dụng kháng sinh phổ rộng đã đẩy nhanh sự xuất hiện của vi khuẩn kháng thuốc.',
          keyVocab: [
            { word: 'accelerate', meaning: 'thúc đẩy nhanh, gia tăng tốc độ', pos: 'verb', cefr: 'B2', topic: 'Học thuật & Công nghệ' },
            { word: 'emergence', meaning: 'sự xuất hiện, sự nổi lên', pos: 'noun', cefr: 'B2', topic: 'Học thuật & Công nghệ' }
          ],
          mcq: {
            question: 'Nguyên nhân chính làm tăng nhanh vi khuẩn kháng thuốc được đề cập là gì?',
            options: [
              'Thiếu nguồn nước sạch tại các đô thị',
              'Sự lạm dụng thuốc kháng sinh phổ rộng',
              'Do biến đổi khí hậu toàn cầu',
              'Do thiếu vắc-xin phòng ngừa'
            ],
            answer: 1,
            explain: 'Chủ ngữ "The overuse of broad-spectrum antibiotics" là nguyên nhân trực tiếp.'
          }
        },
        {
          id: 'lis_b2_4',
          category: 'Hội thảo & Giao tiếp Học thuật (B2)',
          title: 'Cân bằng giữa công việc và sức khỏe tâm thần',
          sentence: 'Prolonged occupational stress not only impairs productivity but also increases the risk of cardiovascular disease.',
          ipaNote: 'Cấu trúc song hành "not only ... but also ...". Chú ý âm cuối /-s/ trong "impairs", "increases".',
          trans: 'Căng thẳng nghề nghiệp kéo dài không chỉ làm suy giảm năng suất mà còn làm tăng nguy cơ mắc bệnh tim mạch.',
          keyVocab: [
            { word: 'prolonged', meaning: 'kéo dài, dai dẳng', pos: 'adj', cefr: 'B2', topic: 'Y khoa - Lâm sàng' },
            { word: 'impair', meaning: 'làm suy giảm, làm tổn hại', pos: 'verb', cefr: 'B2', topic: 'Học thuật & Công nghệ' }
          ],
          mcq: {
            question: 'Theo người nói, căng thẳng công việc kéo dài gây ra 2 tác hại nào?',
            options: [
              'Tăng cân và mất ngủ nhẹ',
              'Giảm năng suất làm việc và tăng nguy cơ bệnh tim mạch',
              'Làm giảm trí nhớ ngắn hạn và đau khớp',
              'Chỉ ảnh hưởng đến thu nhập cá nhân'
            ],
            answer: 1,
            explain: 'Cặp liên từ "not only impairs productivity" + "but also increases the risk of cardiovascular disease".'
          }
        }
      ]
    },

    writing: {
      B1: [
        {
          id: 'wrt_b1_1',
          type: 'Email thực tế (VSTEP B1 Task 1 - 120 từ)',
          title: 'Viết Email xin đổi ca trực / lịch học thực hành',
          prompt: 'Bạn có một lịch thi/việc gia đình đột xuất vào chiều thứ Sáu tuần này. Hãy viết một email (khoảng 100–120 từ) cho người quản lý / giảng viên (Dr. Smith) để: (1) Nêu rõ lý do bạn không thể tham gia buổi trực/thực hành, (2) Đề xuất phương án đổi lịch hoặc nhờ đồng nghiệp trực thay, và (3) Mong nhận được sự chấp thuận.',
          scaffolds: [
            { label: '+ Mở đầu thư', text: 'Dear Dr. Smith,\n\nI am writing this email to respectfully request a change to my clinical shift scheduled for this Friday afternoon.\n' },
            { label: '+ Nêu lý do', text: '\nUnfortunately, I have an unexpected family emergency that requires my immediate presence, so I will not be able to attend the session as planned.\n' },
            { label: '+ Đưa giải pháp', text: '\nTo ensure that our department’s workflow is not affected, I have already discussed this with my colleague, Minh, who has kindly agreed to cover my shift. In return, I will take over his shift on Sunday.\n' },
            { label: '+ Kết thư lịch sự', text: '\nI sincerely apologize for any inconvenience this may cause. I would be very grateful if you could approve this arrangement.\n\nBest regards,\n[Tên của bạn]' }
          ],
          boosters: [
            { a2: 'I want to change', b12: 'I am writing to respectfully request a change to...' },
            { a2: 'I am busy because', b12: 'Due to an unexpected personal commitment...' },
            { a2: 'Sorry for the trouble', b12: 'I sincerely apologize for any inconvenience this may cause.' }
          ],
          modelAnswer: 'Dear Dr. Smith,\n\nI am writing this email to respectfully request a change to my clinical shift scheduled for this Friday afternoon, November 8th.\n\nUnfortunately, I have an urgent family matter that requires me to travel home, so I will not be able to attend the hospital ward session as planned. To ensure that our team’s schedule is not disrupted, I have spoken with my classmate, Nam, and he has kindly agreed to cover my shift. In return, I will take over his duty this Sunday morning.\n\nI sincerely apologize for any inconvenience this short notice may cause. I would be very grateful if you could approve this arrangement.\n\nBest regards,\nThong'
        },
        {
          id: 'wrt_b1_2',
          type: 'Đoạn văn quan điểm (B1 Paragraph - 120 từ)',
          title: 'Lợi ích của việc tập thể dục và khám sức khỏe định kỳ',
          prompt: 'Viết một đoạn văn ngắn (100–130 từ) trình bày 2 lợi ích lớn nhất của việc duy trì vận động thể chất và kiểm tra sức khỏe định kỳ đối với sinh viên và người đi làm.',
          scaffolds: [
            { label: '+ Câu chủ đề (Topic Sentence)', text: 'Maintaining regular physical exercise and routine medical check-ups plays a vital role in a healthy lifestyle.\n' },
            { label: '+ Lợi ích 1 (Thể chất & Tinh thần)', text: '\nFirst of all, engaging in daily exercise helps reduce stress and strengthens our immune system. For example, just thirty minutes of jogging a day can improve sleep quality and boost energy levels at work.\n' },
            { label: '+ Lợi ích 2 (Phát hiện sớm bệnh)', text: '\nFurthermore, regular health check-ups allow doctors to detect potential illnesses at an early stage, which makes treatment much more effective and less costly.\n' },
            { label: '+ Câu kết (Conclusion)', text: '\nIn conclusion, combining active exercise with preventive check-ups is the best investment for our long-term well-being.' }
          ],
          boosters: [
            { a2: 'is very important', b12: 'plays a vital role in' },
            { a2: 'find diseases early', b12: 'detect potential illnesses at an early stage' },
            { a2: 'good for health', b12: 'beneficial for our long-term well-being' }
          ],
          modelAnswer: 'Maintaining regular physical exercise and routine medical check-ups plays a vital role in a healthy lifestyle. First of all, engaging in daily physical activities helps relieve mental stress and strengthens our cardiovascular and immune systems. For instance, spending thirty minutes jogging or swimming each day can significantly improve sleep quality and concentration. Furthermore, periodic health screenings allow physicians to detect silent conditions, such as hypertension or diabetes, at an early stage. Early diagnosis not only increases the success rate of treatment but also reduces financial burdens. In conclusion, combining an active lifestyle with preventive check-ups is the smartest investment for our future.'
        }
      ],
      B2: [
        {
          id: 'wrt_b2_1',
          type: 'Bài luận Học thuật (VSTEP B2 / IELTS Task 2 - 220+ từ)',
          title: 'Y tế dự phòng (Prevention) vs. Điều trị (Treatment)',
          prompt: 'Đề bài: "Some people argue that a larger proportion of the national healthcare budget should be allocated to health education and preventive measures rather than hospital treatment. To what extent do you agree or disagree?" (Hãy viết bài luận theo cấu trúc PEEL chuẩn B2).',
          scaffolds: [
            { label: '+ Mở bài (Paraphrase + Thesis)', text: 'In recent years, there has been an ongoing debate regarding whether governments should prioritize preventive healthcare over clinical treatment. Personally, I strongly agree that investing more resources in disease prevention brings sustainable benefits, although hospital care remains indispensable.\n' },
            { label: '+ Thân bài 1: Lợi ích Phòng bệnh (PEEL)', text: '\nOn the one hand, allocating funds to preventive measures and public health education is highly cost-effective. Many chronic illnesses, such as cardiovascular disease and type 2 diabetes, stem from unhealthy lifestyles. By launching vaccination campaigns and promoting balanced diets, authorities can significantly reduce hospitalization rates. Consequently, this alleviates the overwhelming burden on public hospitals.\n' },
            { label: '+ Thân bài 2: Vai trò Điều trị (Cân bằng)', text: '\nOn the other hand, maintaining well-equipped hospitals and advanced medical treatments is equally crucial. Acute conditions, such as appendicitis, trauma, or genetic disorders, cannot be prevented solely through lifestyle changes and require immediate surgical or pharmacological intervention.\n' },
            { label: '+ Kết bài (Tóm lược quan điểm)', text: '\nIn conclusion, while funding acute medical treatment is necessary to save lives in emergencies, shifting a greater share of the budget toward preventive healthcare is a wiser long-term strategy for a healthier society.' }
          ],
          boosters: [
            { a2: 'spend money on', b12: 'allocate resources / budget to' },
            { a2: 'come from bad habits', b12: 'stem from sedentary and unhealthy lifestyles' },
            { a2: 'make hospitals less crowded', b12: 'alleviate the overwhelming burden on healthcare facilities' },
            { a2: 'need quick surgery', b12: 'require immediate surgical intervention' }
          ],
          modelAnswer: 'In recent years, there has been an ongoing debate regarding whether governments should prioritize preventive healthcare over clinical treatment. Personally, I strongly agree that investing more resources in disease prevention brings sustainable benefits, although hospital care remains indispensable.\n\nOn the one hand, allocating funds to preventive measures and public health education is highly cost-effective. Many chronic illnesses, such as cardiovascular disease and type 2 diabetes, stem from unhealthy lifestyles. By launching nationwide vaccination programs and educating citizens about nutrition, authorities can significantly reduce morbidity rates. Consequently, this alleviates the overwhelming financial and staffing burden on public hospitals.\n\nOn the other hand, maintaining advanced clinical facilities is still vital. Acute emergencies, such as ruptured appendicitis, severe trauma, or congenital conditions, cannot be prevented solely through awareness campaigns and require immediate surgical intervention.\n\nIn conclusion, while hospital treatment is essential for acute care, directing a larger portion of the healthcare budget toward prevention is the most sustainable strategy for public health.'
        },
        {
          id: 'wrt_b2_2',
          type: 'Bài luận Học thuật (VSTEP B2 / IELTS Task 2)',
          title: 'Trí tuệ nhân tạo (AI) trong Giáo dục & Y học',
          prompt: 'Đề bài: "Artificial Intelligence (AI) is transforming both education and healthcare. Discuss the advantages and potential drawbacks of relying on AI in these fields."',
          scaffolds: [
            { label: '+ Mở bài (Giới thiệu 2 mặt)', text: 'The rapid advancement of Artificial Intelligence (AI) has revolutionized numerous sectors, particularly healthcare and education. While AI-driven tools offer remarkable efficiency, over-reliance on them also poses several ethical and practical challenges.\n' },
            { label: '+ Thân bài 1: Ưu điểm (Advantages)', text: '\nRegarding the benefits, AI significantly enhances accuracy and personalization. In medicine, machine learning algorithms can analyze diagnostic imaging to detect early signs of tumors faster than human eyes. Similarly, in education, adaptive platforms tailor learning pathways to each student’s proficiency level.\n' },
            { label: '+ Thân bài 2: Nhược điểm (Drawbacks)', text: '\nNevertheless, excessive dependence on AI carries notable risks. Firstly, automated systems lack human empathy, which is irreplaceable in doctor-patient communication. Secondly, overusing AI tools may erode students’ critical thinking and clinical reasoning skills.\n' },
            { label: '+ Kết bài (Chốt giải pháp)', text: '\nIn conclusion, AI should be utilized as a powerful supportive assistant rather than a complete replacement for human professionals.' }
          ],
          boosters: [
            { a2: 'change a lot', b12: 'revolutionize / transform significantly' },
            { a2: 'depend too much on', b12: 'excessive dependence / over-reliance on' },
            { a2: 'make thinking worse', b12: 'erode critical thinking and clinical reasoning skills' }
          ],
          modelAnswer: 'The rapid advancement of Artificial Intelligence (AI) has revolutionized numerous sectors, particularly healthcare and education. While AI-driven tools offer remarkable efficiency, over-reliance on them also poses several practical challenges.\n\nOn the positive side, AI significantly enhances diagnostic precision and personalized learning. In clinical practice, advanced algorithms can analyze radiological scans to detect subtle abnormalities at an early stage, thereby reducing human error. Likewise, intelligent tutoring systems help learners focus on their specific weaknesses.\n\nNevertheless, excessive dependence on technology carries notable drawbacks. Automated systems lack genuine empathy and ethical judgment, which are irreplaceable in patient care. Furthermore, if students rely entirely on AI to generate answers, their independent critical thinking and problem-solving abilities may gradually deteriorate.\n\nIn conclusion, while AI brings transformative benefits, it must serve as a supplementary tool alongside human expertise and compassion.'
        }
      ]
    },

    speaking: {
      fillers: [
        { en: 'Well, to be honest, I haven’t thought about this much, but...', vi: 'Thực lòng mà nói, tôi chưa nghĩ nhiều về điều này, nhưng... (Mua 3 giây suy nghĩ)' },
        { en: 'From a clinical / practical perspective, I believe that...', vi: 'Dưới góc độ lâm sàng / thực tế, tôi tin rằng...' },
        { en: 'That’s an interesting question. In my experience...', vi: 'Đó là một câu hỏi rất hay. Theo kinh nghiệm của tôi thì...' },
        { en: 'There are a couple of main reasons why...', vi: 'Có hai lý do chính giải thích tại sao...' }
      ],
      B1: [
        {
          id: 'spk_b1_1',
          topic: 'Giao tiếp Lâm sàng & Đời sống (B1)',
          question: 'Can you describe your daily routine as a student or healthcare worker, and how you deal with stress?',
          questionVi: 'Hãy mô tả lịch trình hàng ngày của bạn và cách bạn giải tỏa căng thẳng?',
          bullets: [
            '1. Lịch trình sáng/chiều: Đi học lý thuyết hoặc đi thực tập tại bệnh viện (attend lectures / clinical rotations).',
            '2. Nguồn gây áp lực: Khối lượng kiến thức lớn và lịch thi dày đặc (heavy workload).',
            '3. Cách giải tỏa: Nghe nhạc, chạy bộ 30 phút và ngủ đủ giấc.'
          ],
          modelScript: 'Well, to be honest, / my daily schedule is quite demanding. / During the week, / I usually spend my mornings attending clinical rotations at the hospital / and my afternoons studying medical terminology. / To cope with stress, / I try to go jogging for thirty minutes every evening / to clear my mind and recharge my energy.',
          cleanScript: 'Well, to be honest, my daily schedule is quite demanding. During the week, I usually spend my mornings attending clinical rotations at the hospital and my afternoons studying medical terminology. To cope with stress, I try to go jogging for thirty minutes every evening to clear my mind and recharge my energy.'
        },
        {
          id: 'spk_b1_2',
          topic: 'Hỏi bệnh & Tư vấn bệnh nhân (B1 Roleplay)',
          question: 'Roleplay: A patient comes in with acute right lower abdominal pain. Reassure the patient and explain the next steps.',
          questionVi: 'Đóng vai: Bệnh nhân vào viện vì đau vùng hố chậu phải. Hãy trấn an bệnh nhân và giải thích các bước kiểm tra tiếp theo.',
          bullets: [
            '1. Đồng cảm & trấn an: Tôi hiểu bạn đang rất đau, nhưng bạn đang ở nơi an toàn (in good hands).',
            '2. Giải thích bước khám: Cần xét nghiệm máu và siêu âm ổ bụng (blood test and abdominal ultrasound).',
            '3. Nêu mục đích: Để kiểm tra xem có phải viêm ruột thừa cấp hay không.'
          ],
          modelScript: 'I understand that you are in a lot of pain right now, / but please don’t worry, / you are in good hands. / Based on your symptoms in the right lower quadrant, / we need to run a quick blood test / and perform an abdominal ultrasound / to check for acute appendicitis.',
          cleanScript: 'I understand that you are in a lot of pain right now, but please don’t worry, you are in good hands. Based on your symptoms in the right lower quadrant, we need to run a quick blood test and perform an abdominal ultrasound to check for acute appendicitis.'
        }
      ],
      B2: [
        {
          id: 'spk_b2_1',
          topic: 'Thảo luận Học thuật VSTEP / IELTS Part 3 (B2)',
          question: 'Why do you think more young people today are suffering from lifestyle-related diseases compared to the past?',
          questionVi: 'Tại sao ngày càng nhiều người trẻ hiện nay mắc các bệnh liên quan đến lối sống so với trước đây?',
          bullets: [
            '1. Nguyên nhân 1 (Lối sống tĩnh tại): Ngồi máy tính/điện thoại quá nhiều (sedentary lifestyle).',
            '2. Nguyên nhân 2 (Chế độ ăn): Tiêu thụ thức ăn nhanh chứa nhiều đường và chất béo (processed food).',
            '3. Hệ quả & Giải pháp: Tăng nguy cơ béo phì, tim mạch -> Cần nâng cao nhận thức sớm.'
          ],
          modelScript: 'From my perspective, / this trend stems from two primary factors. / Firstly, modern technology has led to an increasingly sedentary lifestyle, / where young adults spend hours sitting in front of screens. / Secondly, the high consumption of processed fast food / coupled with chronic sleep deprivation / significantly increases the risk of metabolic disorders.',
          cleanScript: 'From my perspective, this trend stems from two primary factors. Firstly, modern technology has led to an increasingly sedentary lifestyle, where young adults spend hours sitting in front of screens. Secondly, the high consumption of processed fast food coupled with chronic sleep deprivation significantly increases the risk of metabolic disorders.'
        },
        {
          id: 'spk_b2_2',
          topic: 'Báo cáo Ca Lâm sàng Ngắn (B2 Clinical Presentation)',
          question: 'Present a brief clinical summary of a patient suspected of having acute appendicitis with signs of peritonitis.',
          questionVi: 'Trình bày tóm tắt ca lâm sàng một bệnh nhân nghi ngờ viêm ruột thừa cấp có dấu hiệu viêm phúc mạc.',
          bullets: [
            '1. Triệu chứng cơ năng: Đau quanh rốn lan xuống hố chậu phải kèm sốt và chán ăn.',
            '2. Triệu chứng thực thể: Đề kháng thành bụng và phản ứng dội dương tính (rebound tenderness).',
            '3. Hướng xử trí: Hội chẩn ngoại khoa cấp cứu (immediate surgical consultation).'
          ],
          modelScript: 'The patient presented to the emergency department / with severe pain migrating from the periumbilical region / to the right lower quadrant. / Physical examination revealed localized abdominal resistance / and positive rebound tenderness, / suggesting early peritonitis / that requires immediate surgical consultation.',
          cleanScript: 'The patient presented to the emergency department with severe pain migrating from the periumbilical region to the right lower quadrant. Physical examination revealed localized abdominal resistance and positive rebound tenderness, suggesting early peritonitis that requires immediate surgical consultation.'
        }
      ]
    },

    grammar: {
      B1: [
        {
          id: 'grm_b1_1',
          title: '1. Câu Bị Động Thực Chiến (Passive Voice in Reports & Medicine)',
          formula: 'S + be (is/are/was/were/has been) + V3/ed (+ by O)',
          why: 'Trong viết báo cáo, email công việc và mô tả y khoa, ta quan tâm ĐỐI TƯỢNG ĐƯỢC TÁC ĐỘNG (bệnh nhân, mẫu xét nghiệm, lịch họp) hơn là người thực hiện.',
          compareA2: 'Doctors admitted the patient to the emergency ward last night.',
          compareB12: 'The patient WAS ADMITTED to the emergency ward last night.',
          quizQ: 'Chọn câu chuyển sang Bị động chuẩn xác và tự nhiên nhất cho báo cáo: "The surgeon performed an emergency appendectomy."',
          opts: [
            'An emergency appendectomy was performed by the surgeon.',
            'An emergency appendectomy is perform by the surgeon.',
            'An emergency appendectomy were performed.',
            'The surgeon was performed an emergency appendectomy.'
          ],
          ans: 0,
          explain: 'Quá khứ đơn chủ động (performed) -> Bị động số ít: "was + V3/ed (was performed)".'
        },
        {
          id: 'grm_b1_2',
          title: '2. Hiện Tại Hoàn Thành vs. Quá Khứ Đơn (Khai thác bệnh sử & Kinh nghiệm)',
          formula: 'Have/Has + V3/ed (Kéo dài đến hiện tại)  ≠  V2/ed (Đã kết thúc ở mốc quá khứ rõ ràng)',
          why: 'Khi hỏi triệu chứng kéo dài bao lâu ("for 3 days", "since yesterday") -> Dùng Hiện tại hoàn thành. Khi có mốc quá khứ cố định ("last night", "2 days ago") -> Dùng Quá khứ đơn.',
          compareA2: 'I have this fever since two days ago. (SAI)',
          compareB12: 'I HAVE HAD this fever FOR two days / SINCE Tuesday. (ĐÚNG)',
          quizQ: 'Điền vào chỗ trống câu hỏi lâm sàng: "The patient ___ severe abdominal pain since yesterday morning."',
          opts: ['experienced', 'has experienced', 'is experiencing', 'experiences'],
          ans: 1,
          explain: 'Có mốc "since yesterday morning" (kéo dài đến hiện tại) -> Dùng Hiện tại hoàn thành: "has experienced".'
        },
        {
          id: 'grm_b1_3',
          title: '3. Câu Điều Kiện Loại 1 & Loại 2 (Đưa cảnh báo & Lời khuyên)',
          formula: 'Loại 1 (Có thật): If + S + V(hiện tại), S + will/can/should + V  |  Loại 2 (Giả định): If + S + V2/ed, S + would + V',
          why: 'Giúp bạn nối 2 câu đơn rời rạc thành 1 câu có nhân - quả chặt chẽ khi nói và viết.',
          compareA2: 'Delay treatment. It will cause peritonitis.',
          compareB12: 'IF treatment IS delayed, it WILL lead to generalized peritonitis.',
          quizQ: 'Chọn đáp án đúng: "If the patient ___ the medication regularly, his blood pressure will remain stable."',
          opts: ['will take', 'takes', 'took', 'taking'],
          ans: 1,
          explain: 'Mệnh đề If trong câu điều kiện loại 1 chia ở thì Hiện tại đơn (the patient -> takes).'
        }
      ],
      B2: [
        {
          id: 'grm_b2_1',
          title: '1. Cấu Trúc Nhượng Bộ Ăn Điểm B2 (Although / Despite / Whereas)',
          formula: 'Although + S + V, S + V   ===   Despite / In spite of + Danh từ / V-ing, S + V',
          why: 'Giám khảo VSTEP B2 và IELTS 6.0+ luôn tìm kiếm cấu trúc này ở câu mở đoạn để đánh giá tư duy phản biện đa chiều của bạn.',
          compareA2: 'Antibiotics are useful, but overusing them is dangerous.',
          compareB12: 'ALTHOUGH antibiotics are life-saving, excessive use leads to resistance. / DESPITE their effectiveness, overusing antibiotics is dangerous.',
          quizQ: 'Chọn câu viết chuẩn ngữ pháp B2 nhất:',
          opts: [
            'Although the severe pain, the patient refused surgery.',
            'Despite the pain was severe, the patient refused surgery.',
            'Despite experiencing severe pain, the patient initially hesitated to undergo surgery.',
            'Although experiencing severe pain, but the patient refused surgery.'
          ],
          ans: 2,
          explain: 'Sau Despite/In spite of cộng với V-ing hoặc Cụm danh từ ("Despite experiencing severe pain..."). Đã dùng Although thì không dùng "but".'
        },
        {
          id: 'grm_b2_2',
          title: '2. Rút Gọn Mệnh Đề Quan Hệ (V-ing / V3-ed Participle Clauses)',
          formula: 'Chủ động: who/which + V  →  V-ing   |   Bị động: who/which + be + V3/ed  →  V3/ed',
          why: 'Giúp câu văn học thuật ngắn gọn, súc tích và tăng điểm Grammatical Range lên bậc B2–C1 ngay lập tức.',
          compareA2: 'Patients who suffer from chronic dysuria should undergo a urine test.',
          compareB12: 'Patients SUFFERING from chronic dysuria should undergo a urine test.',
          quizQ: 'Rút gọn mệnh đề trong câu sau: "Medications that are prescribed by qualified physicians must be taken on time."',
          opts: [
            'Medications prescribing by qualified physicians must be taken on time.',
            'Medications prescribed by qualified physicians must be taken on time.',
            'Medications to prescribe by qualified physicians must be taken on time.',
            'Medications are prescribed by qualified physicians must be taken on time.'
          ],
          ans: 1,
          explain: '"that are prescribed" là mệnh đề quan hệ bị động -> Rút gọn giữ lại V3/ed ("prescribed").'
        },
        {
          id: 'grm_b2_3',
          title: '3. Cụm Động Từ Nhân – Quả Học Thuật (Academic Cause & Effect)',
          formula: '[Nguyên nhân] + lead to / result in / contribute to + [Cụm danh từ / V-ing]',
          why: 'Thay thế cho cấu trúc "because... so..." sơ cấp. Dùng cực kỳ hiệu quả trong cả Writing Task 2 và Speaking Part 3.',
          compareA2: 'Because a fecalith blocks the appendix, it becomes inflamed.',
          compareB12: 'Obstruction of the appendix by a fecalith LEADS TO acute inflammation.',
          quizQ: 'Chọn câu sử dụng cấu trúc nhân quả học thuật chính xác:',
          opts: [
            'Chronic stress can result in weaken the immune system.',
            'Chronic stress can lead to a weakened immune system.',
            'Chronic stress stems to a weakened immune system.',
            'Chronic stress contributes weaken the immune system.'
          ],
          ans: 1,
          explain: 'Sau "lead to / result in / contribute to" là một Cụm danh từ ("a weakened immune system") hoặc V-ing.'
        }
      ]
    }
  };

  function loadAcademyState() {
    try {
      const raw = localStorage.getItem(LS_ACADEMY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        level: parsed.level === 'B2' ? 'B2' : 'B1',
        subTab: parsed.subTab || 'listening',
        lisIdx: typeof parsed.lisIdx === 'number' ? parsed.lisIdx : 0,
        wrtIdx: typeof parsed.wrtIdx === 'number' ? parsed.wrtIdx : 0,
        spkIdx: typeof parsed.spkIdx === 'number' ? parsed.spkIdx : 0,
        doneIds: Array.isArray(parsed.doneIds) ? parsed.doneIds : [],
        drafts: parsed.drafts && typeof parsed.drafts === 'object' ? parsed.drafts : {},
        dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
        lastDailyDate: parsed.lastDailyDate || '',
        dailyStepDone: parsed.dailyStepDone && typeof parsed.dailyStepDone === 'object' ? parsed.dailyStepDone : {}
      };
    } catch (e) {
      return { level: 'B1', subTab: 'listening', lisIdx: 0, wrtIdx: 0, spkIdx: 0, doneIds: [], drafts: {}, dailyStreak: 0, lastDailyDate: '', dailyStepDone: {} };
    }
  }

  let acadState = loadAcademyState();
  function saveAcademyState() {
    try { localStorage.setItem(LS_ACADEMY_KEY, JSON.stringify(acadState)); } catch (e) {}
  }

  function markItemDone(itemId) {
    if (!itemId) return;
    if (!acadState.doneIds.includes(itemId)) {
      acadState.doneIds.push(itemId);
      saveAcademyState();
    }
  }

  function calcLevelProgress(lv) {
    const allIds = [
      ...(ACADEMY_DATA.listening[lv] || []).map((x) => x.id),
      ...(ACADEMY_DATA.writing[lv] || []).map((x) => x.id),
      ...(ACADEMY_DATA.speaking[lv] || []).map((x) => x.id),
      ...(ACADEMY_DATA.grammar[lv] || []).map((x) => x.id)
    ];
    if (!allIds.length) return 0;
    const done = allIds.filter((id) => acadState.doneIds.includes(id)).length;
    return Math.round((done / allIds.length) * 100);
  }

  function quickAddAcademyWord(wordObj, btnEl) {
    try {
      const payload = getMasterPayload() || { words: [], mistakes: [], topics: [] };
      const exists = (payload.words || []).some((w) => normKey(w.word) === normKey(wordObj.word));
      if (exists) {
        notify(`"${wordObj.word}" đã có sẵn trong Kho từ của bạn!`);
        if (btnEl) { btnEl.textContent = '✓ Đã có trong Kho'; btnEl.disabled = true; }
        return;
      }
      if (typeof global.addWord === 'function') {
        global.addWord({
          word: wordObj.word,
          pos: wordObj.pos || 'word',
          ipa: wordObj.ipa || `/${wordObj.word}/`,
          cefr: wordObj.cefr || acadState.level,
          topic: wordObj.topic || 'Học thuật & Công nghệ',
          meaning: wordObj.meaning,
          example: wordObj.example || '',
          exampleTrans: wordObj.exampleTrans || '',
          explanation: 'Từ vựng trọng tâm từ Lộ trình 4 Kỹ năng (' + (wordObj.cefr || acadState.level) + ').',
          collocations: []
        });
      }
      if (btnEl) { btnEl.textContent = '✓ Đã lưu vào Kho'; btnEl.disabled = true; }
    } catch (e) {}
  }

  function injectAcademyTabsAndSection() {
    const nav = document.querySelector('header nav');
    const main = document.querySelector('main');
    if (!nav || !main) return;

    if (!document.getElementById('nav-academy')) {
      const btn = document.createElement('button');
      btn.className = 'nav border border-pri/40 bg-pri/10 text-pri font-bold';
      btn.id = 'nav-academy';
      btn.innerHTML = '<span>🎯</span><span>Lộ trình 4 Kỹ năng (B1 → B2)</span>';
      btn.onclick = (e) => {
        e.preventDefault();
        openAcademyView(acadState.subTab || 'listening');
      };
      nav.insertBefore(btn, nav.firstChild);

      const quickTabs = [
        { key: 'listening', icon: '🎧', label: 'Luyện Nghe' },
        { key: 'writing', icon: '✍️', label: 'Luyện Viết' },
        { key: 'speaking', icon: '🗣️', label: 'Giao tiếp' },
        { key: 'grammar', icon: '📐', label: 'Ngữ pháp' },
        { key: 'daily', icon: '🔥', label: 'Duy trì 5p' }
      ];
      quickTabs.forEach((qt) => {
        const qb = document.createElement('button');
        qb.className = 'nav';
        qb.id = 'nav-acad-' + qt.key;
        qb.innerHTML = `<span>${qt.icon}</span><span>${qt.label}</span>`;
        qb.onclick = (e) => {
          e.preventDefault();
          openAcademyView(qt.key);
        };
        nav.appendChild(qb);
      });
    }

    if (!document.getElementById('tab-academy')) {
      const sec = document.createElement('section');
      sec.id = 'tab-academy';
      sec.className = 'hidden space-y-5';
      main.appendChild(sec);
    }

    if (typeof global.tab === 'function' && !global.tab.__acadWrapped) {
      const origTab = global.tab;
      const wrappedTab = function () {
        const acadSec = document.getElementById('tab-academy');
        if (acadSec) acadSec.classList.add('hidden');
        document.querySelectorAll('[id^="nav-acad"], #nav-academy').forEach((b) => b.classList.remove('on'));
        return origTab.apply(this, arguments);
      };
      wrappedTab.__acadWrapped = true;
      global.tab = wrappedTab;
    }

    ['vault', 'add', 'quiz', 'mistakes'].forEach((origId) => {
      const navBtn = document.getElementById('nav-' + origId);
      if (navBtn && !navBtn.hasAttribute('data-acad-bound')) {
        navBtn.setAttribute('data-acad-bound', '1');
        navBtn.addEventListener('click', () => {
          const acadSec = document.getElementById('tab-academy');
          if (acadSec) acadSec.classList.add('hidden');
          document.querySelectorAll('[id^="nav-acad"], #nav-academy').forEach((b) => b.classList.remove('on'));
        });
      }
    });
  }

  function openAcademyView(subTabKey) {
    if (subTabKey) {
      acadState.subTab = subTabKey;
      saveAcademyState();
    }
    ['vault', 'add', 'quiz', 'mistakes'].forEach((t) => {
      const s = document.getElementById('tab-' + t);
      const n = document.getElementById('nav-' + t);
      if (s) s.classList.add('hidden');
      if (n) n.classList.remove('on');
    });

    document.querySelectorAll('[id^="nav-acad"], #nav-academy').forEach((b) => b.classList.remove('on'));
    const mainAcadBtn = document.getElementById('nav-academy');
    const subBtn = document.getElementById('nav-acad-' + acadState.subTab);
    if (mainAcadBtn) mainAcadBtn.classList.add('on');
    if (subBtn) subBtn.classList.add('on');

    const acadSec = document.getElementById('tab-academy');
    if (acadSec) {
      acadSec.classList.remove('hidden');
      renderAcademySection();
    }
  }

  function compareWordsTokens(targetSentence, userTyped) {
    const cleanToken = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9']/g, '');
    const targetWords = String(targetSentence || '').trim().split(/\s+/).filter(Boolean);
    const typedWords = String(userTyped || '').trim().split(/\s+/).filter(Boolean);

    let correctCount = 0;
    const tokensHTML = targetWords.map((tw, idx) => {
      const tNorm = cleanToken(tw);
      const uNorm = cleanToken(typedWords[idx] || '');
      const uPrev = cleanToken(typedWords[idx - 1] || '');
      const uNext = cleanToken(typedWords[idx + 1] || '');
      const isMatch = tNorm && (uNorm === tNorm || uPrev === tNorm || uNext === tNorm);
      if (isMatch) {
        correctCount++;
        return `<span class="px-1.5 py-0.5 rounded bg-ok/20 text-ok font-bold">${escHTML(tw)}</span>`;
      }
      if (idx < typedWords.length) {
        return `<span class="px-1.5 py-0.5 rounded bg-bad/20 text-bad font-bold underline decoration-dotted">${escHTML(typedWords[idx])} → <b>${escHTML(tw)}</b></span>`;
      }
      return `<span class="px-1.5 py-0.5 rounded bg-line/40 text-mute font-mono">___ (${escHTML(tw[0] || '')}...)</span>`;
    });

    const pct = targetWords.length ? Math.round((correctCount / targetWords.length) * 100) : 0;
    return { pct, correctCount, total: targetWords.length, html: tokensHTML.join(' ') };
  }

  function renderAcademySection() {
    const sec = document.getElementById('tab-academy');
    if (!sec) return;

    const lv = acadState.level;
    const b1Pct = calcLevelProgress('B1');
    const b2Pct = calcLevelProgress('B2');
    const todayStr = new Date().toISOString().slice(0, 10);

    const topBarHTML = `
      <div class="card p-4 sm:p-5 space-y-4 border-pri/40">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pri/20 text-pri border border-pri/40">LỘ TRÌNH THỰC CHIẾN 4 KỸ NĂNG</span>
              <span class="text-xs font-mono text-warn font-bold">🔥 Duy trì: ${acadState.dailyStreak} ngày</span>
            </div>
            <h2 class="text-lg sm:text-xl font-bold mt-1">Chinh phục B1 → Nâng tầm B2 → Duy trì Phản xạ & Từ vựng</h2>
            <p class="text-xs text-mute">Tập trung gỡ mù hướng <b>Listening, Writing, Giao tiếp</b> và học <b>Ngữ pháp áp dụng ngay</b>.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2 inset p-1.5 rounded-xl">
            <button type="button" data-acad-lv="B1" class="btn ${lv === 'B1' && acadState.subTab !== 'daily' ? 'btn-ok font-bold ring-2 ring-ok/50' : ''} !py-2 !px-3">
              <div>
                <div class="text-xs font-bold">🎯 Cột mốc 1: B1 (Trung cấp)</div>
                <div class="text-[10px] opacity-80">VSTEP B1 / IELTS 4.5-5.0 • Đạt ${b1Pct}%</div>
              </div>
            </button>
            <button type="button" data-acad-lv="B2" class="btn ${lv === 'B2' && acadState.subTab !== 'daily' ? 'btn-pri font-bold ring-2 ring-pri/50' : ''} !py-2 !px-3">
              <div>
                <div class="text-xs font-bold">🚀 Cột mốc 2: B2 (Trung cao)</div>
                <div class="text-[10px] opacity-80">VSTEP B2 / IELTS 5.5-6.5 • Đạt ${b2Pct}%</div>
              </div>
            </button>
            <button type="button" data-acad-sub="daily" class="btn ${acadState.subTab === 'daily' ? 'btn-warn font-bold ring-2 ring-warn/50' : ''} !py-2 !px-3">
              <div>
                <div class="text-xs font-bold">🔥 Chế độ Duy trì (5 phút/ngày)</div>
                <div class="text-[10px] opacity-80">Giữ phản xạ giao tiếp & từ vựng</div>
              </div>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-line/60">
          <button type="button" data-acad-sub="listening" class="btn justify-center !py-2.5 ${acadState.subTab === 'listening' ? 'btn-pri font-bold' : ''}">🎧 1. Luyện Nghe (${lv})</button>
          <button type="button" data-acad-sub="writing" class="btn justify-center !py-2.5 ${acadState.subTab === 'writing' ? 'btn-pri font-bold' : ''}">✍️ 2. Luyện Viết (${lv})</button>
          <button type="button" data-acad-sub="speaking" class="btn justify-center !py-2.5 ${acadState.subTab === 'speaking' ? 'btn-pri font-bold' : ''}">🗣️ 3. Giao tiếp (${lv})</button>
          <button type="button" data-acad-sub="grammar" class="btn justify-center !py-2.5 ${acadState.subTab === 'grammar' ? 'btn-pri font-bold' : ''}">📐 4. Ngữ pháp (${lv})</button>
          <button type="button" data-acad-sub="daily" class="btn justify-center !py-2.5 col-span-2 sm:col-span-1 ${acadState.subTab === 'daily' ? 'btn-warn font-bold' : ''}">🔥 5. Duy trì 5 Phút</button>
        </div>
      </div>
    `;

    let bodyHTML = '';

    if (acadState.subTab === 'listening') {
      const list = ACADEMY_DATA.listening[lv] || ACADEMY_DATA.listening.B1;
      const idx = Math.min(acadState.lisIdx || 0, list.length - 1);
      const item = list[idx];
      const isDone = acadState.doneIds.includes(item.id);

      bodyHTML = `
        <div class="grid lg:grid-cols-12 gap-4">
          <div class="lg:col-span-4 card p-4 space-y-2.5 h-fit">
            <div class="flex items-center justify-between">
              <b class="text-sm">🎧 Bài nghe cấp độ ${lv}</b>
              <span class="text-xs text-ok font-mono">${list.filter((x) => acadState.doneIds.includes(x.id)).length}/${list.length} hoàn thành</span>
            </div>
            <div class="space-y-1.5 pt-1">
              ${list.map((it, i) => `
                <button type="button" data-lis-pick="${i}" class="w-full text-left p-2.5 rounded-xl border transition ${i === idx ? 'border-pri bg-pri/15 font-bold' : 'border-line/60 hover:bg-line/20'} flex items-center justify-between gap-2 text-xs">
                  <div>
                    <div class="text-[10px] text-mute">${escHTML(it.category)}</div>
                    <div class="mt-0.5">${i + 1}. ${escHTML(it.title)}</div>
                  </div>
                  <span class="font-mono text-xs ${acadState.doneIds.includes(it.id) ? 'text-ok' : 'text-mute'}">${acadState.doneIds.includes(it.id) ? '✓ Xong' : '○'}</span>
                </button>`).join('')}
            </div>
          </div>

          <div class="lg:col-span-8 space-y-4">
            <div class="card p-5 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
                <div>
                  <span class="text-xs font-mono text-pri uppercase">${escHTML(item.category)} • Trình độ ${lv}</span>
                  <h3 class="text-lg font-bold">${escHTML(item.title)}</h3>
                </div>
                ${isDone ? '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-ok/20 text-ok border border-ok/40">✓ Đã chinh phục</span>' : ''}
              </div>

              <div class="inset p-4 space-y-3">
                <b class="text-xs text-pri">Bước 1: Nghe câu (Thử nghe ở 1.0x trước, nếu bị lướt âm hãy bấm 0.8x Chậm rõ)</b>
                <div class="flex flex-wrap gap-2">
                  <button type="button" id="lis-play-us" class="btn btn-pri !py-2.5 !px-4 font-bold">🔊 Nghe Chuẩn US (1.0x)</button>
                  <button type="button" id="lis-play-uk" class="btn !py-2.5 !px-3.5 border-rose-500/40 text-rose-400">🔊 Nghe Chuẩn UK (1.0x)</button>
                  <button type="button" id="lis-play-slow" class="btn btn-warn !py-2.5 !px-3.5 font-bold">🐢 Nghe Chậm Rõ (0.8x - Tách âm)</button>
                </div>
              </div>

              <div class="space-y-2.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <label class="text-xs font-bold" for="lis-dict-in">Bước 2: Gõ lại những từ bạn nghe được (Nghe chép chính tả)</label>
                  <div class="flex gap-1.5">
                    <button type="button" id="lis-hint-btn" class="btn !text-xs">💡 Gợi ý từ tiếp theo</button>
                    <button type="button" id="lis-show-ans" class="btn !text-xs">👁️ Xem đáp án & Giải thích nối âm</button>
                  </div>
                </div>
                <textarea id="lis-dict-in" rows="2" class="inp font-medium text-base" placeholder="Bấm nút Nghe ở trên rồi gõ lại câu bạn nghe được vào đây..."></textarea>
                <div class="flex justify-end">
                  <button type="button" id="lis-check-dict" class="btn btn-ok font-bold">✓ Chấm điểm Chép chính tả</button>
                </div>
                <div id="lis-dict-feedback" class="hidden inset p-4 space-y-2.5 text-sm"></div>
              </div>

              <div class="pt-3 border-t border-line/60 space-y-3">
                <b class="text-xs text-pri uppercase">Bước 3: Kiểm tra Nghe hiểu & Bắt từ khóa (Listening Comprehension)</b>
                <p class="text-sm font-semibold">${escHTML(item.mcq.question)}</p>
                <div class="grid sm:grid-cols-2 gap-2" id="lis-mcq-opts">
                  ${item.mcq.options.map((opt, oi) => `
                    <button type="button" data-lis-mcq="${oi}" class="btn !p-3 !text-xs !justify-start text-left">
                      <b>${String.fromCharCode(65 + oi)}.</b> <span>${escHTML(opt)}</span>
                    </button>`).join('')}
                </div>
                <div id="lis-mcq-explain" class="hidden inset p-3 text-xs space-y-1"></div>
              </div>

              <div class="pt-3 border-t border-line/60 space-y-2">
                <b class="text-xs text-ok">📚 Từ vựng đắt giá trong câu nghe (Lưu 1 chạm vào Kho từ của bạn):</b>
                <div class="grid sm:grid-cols-2 gap-2">
                  ${(item.keyVocab || []).map((kv, ki) => `
                    <div class="inset p-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <b class="text-pri">${escHTML(kv.word)}</b> <span class="text-mute">(${escHTML(kv.pos)})</span>
                        <div class="text-mute">${escHTML(kv.meaning)}</div>
                      </div>
                      <button type="button" data-save-kv="${ki}" class="btn btn-ok !text-[11px] shrink-0">+ Lưu vào Kho</button>
                    </div>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (acadState.subTab === 'writing') {
      const list = ACADEMY_DATA.writing[lv] || ACADEMY_DATA.writing.B1;
      const idx = Math.min(acadState.wrtIdx || 0, list.length - 1);
      const item = list[idx];
      const savedDraft = acadState.drafts[item.id] || '';
      const wordCount = savedDraft.trim() ? savedDraft.trim().split(/\s+/).length : 0;

      bodyHTML = `
        <div class="grid lg:grid-cols-12 gap-4">
          <div class="lg:col-span-4 space-y-4">
            <div class="card p-4 space-y-2.5">
              <b class="text-sm">✍️ Chủ đề Luyện Viết (${lv})</b>
              <div class="space-y-1.5">
                ${list.map((it, i) => `
                  <button type="button" data-wrt-pick="${i}" class="w-full text-left p-2.5 rounded-xl border transition ${i === idx ? 'border-pri bg-pri/15 font-bold' : 'border-line/60 hover:bg-line/20'} text-xs">
                    <div class="text-[10px] text-pri">${escHTML(it.type)}</div>
                    <div class="mt-0.5">${i + 1}. ${escHTML(it.title)}</div>
                  </button>`).join('')}
              </div>
            </div>

            <div class="card p-4 space-y-2.5">
              <b class="text-xs text-warn uppercase">🚀 Bảng Nâng Cấp Từ Vựng (A2 → ${lv})</b>
              <div class="space-y-2">
                ${item.boosters.map((b) => `
                  <div class="inset p-2.5 text-xs space-y-1">
                    <div class="text-mute line-through">Thay vì: "${escHTML(b.a2)}"</div>
                    <div class="flex items-center justify-between gap-2">
                      <b class="text-ok">Dùng: "${escHTML(b.b12)}"</b>
                      <button type="button" data-wrt-insert="${escHTML(b.b12)}" class="btn !text-[10px] !py-1 !px-2">+ Chèn</button>
                    </div>
                  </div>`).join('')}
              </div>
            </div>
          </div>

          <div class="lg:col-span-8 space-y-4">
            <div class="card p-5 space-y-4">
              <div class="space-y-1.5 border-b border-line/60 pb-3">
                <span class="text-xs font-mono text-pri uppercase">${escHTML(item.type)}</span>
                <h3 class="text-lg font-bold">${escHTML(item.title)}</h3>
                <div class="inset p-3 text-xs leading-relaxed text-warn"><b>Đề bài:</b> ${escHTML(item.prompt)}</div>
              </div>

              <div class="space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <b class="text-xs text-ok">🧩 Bước 1: Bấm các nút Khung Sườn dưới đây để tạo bố cục bài viết chuẩn (Scaffolding)</b>
                  <button type="button" id="wrt-fill-all" class="btn !text-xs text-pri">⚡ Lắp toàn bộ khung sườn</button>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  ${item.scaffolds.map((sc, si) => `
                    <button type="button" data-wrt-scaf="${si}" class="btn !text-xs border-ok/40 bg-ok/10 text-ok">${escHTML(sc.label)}</button>`).join('')}
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <label class="font-bold" for="wrt-editor">Bước 2: Bài viết của bạn (Tự động lưu nháp)</label>
                  <span id="wrt-word-count" class="font-mono font-bold ${wordCount >= (lv === 'B2' ? 180 : 90) ? 'text-ok' : 'text-warn'}">
                    Số từ: ${wordCount} từ (Mục tiêu ${lv}: ${lv === 'B2' ? '180–250' : '100–130'} từ)
                  </span>
                </div>
                <textarea id="wrt-editor" rows="9" class="inp leading-relaxed text-sm" placeholder="Bấm các nút Khung sườn màu xanh ở trên để bắt đầu viết thật dễ dàng...">${escHTML(savedDraft)}</textarea>
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex flex-wrap gap-2">
                    <button type="button" id="wrt-grade-btn" class="btn btn-pri font-bold !py-2.5 !px-4">✨ Chấm điểm & Sửa lỗi chi tiết</button>
                    <button type="button" id="wrt-show-model" class="btn !py-2.5">📖 Xem Bài mẫu đạt điểm tối đa (${lv})</button>
                  </div>
                  <button type="button" id="wrt-clear-btn" class="btn !text-xs text-mute">Làm mới</button>
                </div>
              </div>

              <div id="wrt-feedback-box" class="hidden inset p-4 space-y-3 text-sm"></div>

              <div id="wrt-model-box" class="hidden inset p-4 space-y-2.5 border-ok/40">
                <div class="flex items-center justify-between">
                  <b class="text-xs text-ok uppercase">🌟 Bài viết mẫu chuẩn ${lv}</b>
                  <button type="button" class="btn !text-xs" data-a="speak" data-v="${escHTML(item.modelAnswer)}">🔊 Nghe bài mẫu</button>
                </div>
                <p class="text-sm leading-relaxed whitespace-pre-line">${escHTML(item.modelAnswer)}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (acadState.subTab === 'speaking') {
      const list = ACADEMY_DATA.speaking[lv] || ACADEMY_DATA.speaking.B1;
      const idx = Math.min(acadState.spkIdx || 0, list.length - 1);
      const item = list[idx];

      bodyHTML = `
        <div class="grid lg:grid-cols-12 gap-4">
          <div class="lg:col-span-4 space-y-4">
            <div class="card p-4 space-y-2.5">
              <b class="text-sm">🗣️ Tình huống Giao tiếp (${lv})</b>
              <div class="space-y-1.5">
                ${list.map((it, i) => `
                  <button type="button" data-spk-pick="${i}" class="w-full text-left p-2.5 rounded-xl border transition ${i === idx ? 'border-pri bg-pri/15 font-bold' : 'border-line/60 hover:bg-line/20'} text-xs">
                    <div class="text-[10px] text-pri">${escHTML(it.topic)}</div>
                    <div class="mt-0.5 line-clamp-2">${i + 1}. ${escHTML(it.question)}</div>
                  </button>`).join('')}
              </div>
            </div>

            <div class="card p-4 space-y-2.5">
              <b class="text-xs text-warn uppercase">💡 Cụm từ "Cứu cánh" chống ấp úng</b>
              <div class="space-y-2">
                ${ACADEMY_DATA.speaking.fillers.map((fl) => `
                  <div class="inset p-2.5 text-xs space-y-1">
                    <div class="flex items-center justify-between gap-2">
                      <b class="text-pri">"${escHTML(fl.en)}"</b>
                      <button type="button" class="btn !text-[10px] !py-1 !px-2" data-a="speak" data-v="${escHTML(fl.en)}">🔊</button>
                    </div>
                    <div class="text-[11px] text-mute">${escHTML(fl.vi)}</div>
                  </div>`).join('')}
              </div>
            </div>
          </div>

          <div class="lg:col-span-8 space-y-4">
            <div class="card p-5 space-y-4">
              <div class="border-b border-line/60 pb-3 space-y-1">
                <span class="text-xs font-mono text-pri uppercase">${escHTML(item.topic)}</span>
                <h3 class="text-lg font-bold">${escHTML(item.question)}</h3>
                <p class="text-xs text-ok italic">Dịch: ${escHTML(item.questionVi)}</p>
              </div>

              <div class="inset p-3.5 space-y-2">
                <b class="text-xs text-warn uppercase">Bước 1: Nắm Sơ đồ 3 Ý cốt lõi</b>
                <ul class="space-y-1 text-xs">${item.bullets.map((b) => `<li class="text-fg">• ${escHTML(b)}</li>`).join('')}</ul>
              </div>

              <div class="inset p-4 space-y-2.5 border-pri/40">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <b class="text-xs text-pri uppercase">Bước 2: Nghe mẫu & Nhại theo nhịp ngắt "/" (Shadowing)</b>
                  <button type="button" class="btn" data-a="speak" data-v="${escHTML(item.cleanScript)}">🔊 Nghe mẫu</button>
                </div>
                <p class="text-base leading-relaxed font-medium">${escHTML(item.modelScript).replace(/\//g, '<span class="text-warn font-bold px-1">/</span>')}</p>
              </div>

              <div class="inset p-4 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <b class="text-xs text-ok uppercase">Bước 3: Tự nói & Chấm độ khớp phát âm</b>
                  <button type="button" id="spk-mic-btn" class="btn btn-bad font-bold">🎙️ Bấm đọc bằng Micro</button>
                </div>
                <textarea id="spk-user-in" rows="3" class="inp text-sm" placeholder="Nói vào micro hoặc dùng mic bàn phím để đọc đoạn phản xạ trên..."></textarea>
                <div class="flex flex-wrap gap-2 justify-between">
                  <button type="button" id="spk-score-btn" class="btn btn-ok font-bold">✓ Chấm điểm Phát âm & Độ trôi chảy</button>
                  <button type="button" id="spk-ask-ai-btn" class="btn btn-pri">💬 Nhờ AI đóng vai Giám khảo hỏi thêm</button>
                </div>
                <div id="spk-score-out" class="hidden inset p-3 text-xs space-y-2"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (acadState.subTab === 'grammar') {
      const list = ACADEMY_DATA.grammar[lv] || ACADEMY_DATA.grammar.B1;
      bodyHTML = `
        <div class="space-y-4">
          <div class="card p-4">
            <h3 class="font-bold text-base">📐 Ngữ Pháp Thực Chiến Cấp Độ ${lv} (Học Lý thuyết 30 giây → Áp dụng vào Viết & Nói ngay)</h3>
            <p class="text-xs text-mute">Loại bỏ hoàn toàn lý thuyết rườm rà. Chỉ giữ lại công thức cốt lõi giúp nâng điểm Writing & Speaking ${lv}.</p>
          </div>
          <div class="grid gap-4">
            ${list.map((g, gi) => `
              <div class="card p-5 space-y-3.5">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2.5">
                  <h4 class="font-bold text-base text-pri">${escHTML(g.title)}</h4>
                  <span class="text-xs font-mono ${acadState.doneIds.includes(g.id) ? 'text-ok font-bold' : 'text-mute'}">${acadState.doneIds.includes(g.id) ? '✓ Đã nắm vững' : 'Chưa làm bài áp dụng'}</span>
                </div>
                <div class="inset p-3 font-mono text-xs sm:text-sm text-warn font-bold">📌 Công thức: ${escHTML(g.formula)}</div>
                <p class="text-xs leading-relaxed"><b>💡 Khi nào dùng?</b> ${escHTML(g.why)}</p>
                <div class="grid sm:grid-cols-2 gap-2.5 text-xs">
                  <div class="inset p-3 border-line/60"><div class="text-mute font-bold mb-1">❌ Cách diễn đạt sơ cấp (A2):</div><p>${escHTML(g.compareA2)}</p></div>
                  <div class="inset p-3 border-ok/40 bg-ok/5"><div class="text-ok font-bold mb-1">✅ Cách nâng cấp ăn điểm (${lv}):</div><p class="font-medium">${escHTML(g.compareB12)}</p></div>
                </div>
                <div class="pt-2 border-t border-line/60 space-y-2">
                  <b class="text-xs text-pri">⚡ Bài tập áp dụng ngay: ${escHTML(g.quizQ)}</b>
                  <div class="grid sm:grid-cols-2 gap-2">
                    ${g.opts.map((opt, oi) => `
                      <button type="button" data-grm-q="${gi}" data-grm-opt="${oi}" class="btn !p-3 !text-xs !justify-start text-left">
                        <b>${String.fromCharCode(65 + oi)}.</b> <span>${escHTML(opt)}</span>
                      </button>`).join('')}
                  </div>
                  <div id="grm-exp-${gi}" class="hidden inset p-3 text-xs"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      `;
    } else if (acadState.subTab === 'daily') {
      const payload = getMasterPayload() || { words: [] };
      const weakWords = (payload.words || []).slice().sort((a, b) => (a.mastery || 0) - (b.mastery || 0)).slice(0, 3);
      const stepDone = acadState.dailyStepDone[todayStr] || {};
      const doneCount = ['s1', 's2', 's3', 's4'].filter((k) => stepDone[k]).length;

      bodyHTML = `
        <div class="card p-5 space-y-5 border-warn/40">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3">
            <div>
              <span class="text-xs font-bold text-warn uppercase">🔥 TRẠM DUY TRÌ PHONG ĐỘ MỖI NGÀY (DAILY 5-MINUTE WORKOUT)</span>
              <h3 class="text-lg font-bold mt-0.5">Chỉ 5 phút/ngày để không bao giờ quên Từ vựng, Phản xạ Nghe - Nói & Viết</h3>
            </div>
            <div class="inset px-4 py-2.5 text-center">
              <div class="text-xs text-mute">Tiến độ hôm nay (${todayStr})</div>
              <div class="text-xl font-black font-mono text-ok">${doneCount} / 4 nhiệm vụ</div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="inset p-4 space-y-3 ${stepDone.s1 ? 'border-ok/50 bg-ok/5' : ''}">
              <div class="flex justify-between items-center">
                <b class="text-xs text-pri uppercase">🎧 Nhiệm vụ 1/4: Làm nóng tai nghe (1 phút)</b>
                <span class="text-xs font-mono ${stepDone.s1 ? 'text-ok font-bold' : 'text-mute'}">${stepDone.s1 ? '✓ Đã xong' : 'Chưa xong'}</span>
              </div>
              <div><button type="button" class="btn" data-a="speak" data-v="Early diagnosis of appendicitis prevents severe complications.">🔊 Nghe câu</button></div>
              <p class="text-sm font-medium">"Early ___ of appendicitis prevents severe complications."</p>
              <div class="flex gap-2">
                <input id="daily-s1-in" class="inp text-xs" placeholder="Gõ từ còn thiếu (gợi ý: d...)" value="${stepDone.s1 ? 'diagnosis' : ''}">
                <button type="button" id="daily-s1-btn" class="btn btn-ok !text-xs shrink-0">Kiểm tra</button>
              </div>
            </div>

            <div class="inset p-4 space-y-3 ${stepDone.s2 ? 'border-ok/50 bg-ok/5' : ''}">
              <div class="flex justify-between items-center">
                <b class="text-xs text-pri uppercase">🗣️ Nhiệm vụ 2/4: Kích hoạt cơ miệng & Giao tiếp (1 phút)</b>
                <span class="text-xs font-mono ${stepDone.s2 ? 'text-ok font-bold' : 'text-mute'}">${stepDone.s2 ? '✓ Đã xong' : 'Chưa xong'}</span>
              </div>
              <p class="text-sm font-medium">"From a practical perspective, / regular exercise / significantly boosts our immune system."</p>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn" data-a="speak" data-v="From a practical perspective, regular exercise significantly boosts our immune system.">🔊 Nghe mẫu</button>
                <button type="button" id="daily-s2-btn" class="btn btn-ok !text-xs">✓ Tôi đã đọc to 2 lần theo nhịp</button>
              </div>
            </div>

            <div class="inset p-4 space-y-3 ${stepDone.s3 ? 'border-ok/50 bg-ok/5' : ''}">
              <div class="flex justify-between items-center">
                <b class="text-xs text-pri uppercase">✍️ Nhiệm vụ 3/4: Tư duy Viết chuẩn B2 (1 phút)</b>
                <span class="text-xs font-mono ${stepDone.s3 ? 'text-ok font-bold' : 'text-mute'}">${stepDone.s3 ? '✓ Đã xong' : 'Chưa xong'}</span>
              </div>
              <p class="text-xs text-mute">Chọn cách nâng cấp câu <i>"Because people use too many antibiotics, bacteria become resistant"</i> lên chuẩn B2:</p>
              <div class="space-y-1.5">
                <button type="button" data-daily-s3="0" class="btn w-full !justify-start !text-xs text-left">A. Overuse of antibiotics leads to the emergence of drug-resistant bacteria.</button>
                <button type="button" data-daily-s3="1" class="btn w-full !justify-start !text-xs text-left">B. Despite overusing antibiotics, bacteria become resistant.</button>
              </div>
            </div>

            <div class="inset p-4 space-y-3 ${stepDone.s4 ? 'border-ok/50 bg-ok/5' : ''}">
              <div class="flex justify-between items-center">
                <b class="text-xs text-pri uppercase">🧠 Nhiệm vụ 4/4: Duy trì Kho từ vựng cá nhân (2 phút)</b>
                <span class="text-xs font-mono ${stepDone.s4 ? 'text-ok font-bold' : 'text-mute'}">${stepDone.s4 ? '✓ Đã xong' : 'Chưa xong'}</span>
              </div>
              <div class="space-y-1.5">
                ${weakWords.map((w) => `
                  <div class="p-2 rounded bg-line/20 flex items-center justify-between text-xs">
                    <div><b>${escHTML(w.word)}</b> <span class="text-mute">${escHTML(w.ipa || '')}</span> — <span class="text-ok">${escHTML(w.meaning)}</span></div>
                    <button type="button" class="btn !text-[10px] !py-1 !px-2" data-a="speak" data-v="${escHTML(w.word)}">🔊</button>
                  </div>`).join('')}
              </div>
              <button type="button" id="daily-s4-btn" class="btn btn-ok !text-xs w-full justify-center">✓ Đã ôn tập & phát âm xong 3 từ này</button>
            </div>
          </div>
        </div>
      `;
    }

    sec.innerHTML = topBarHTML + bodyHTML;
    bindAcademyEvents();
    upgradeSpeakerButtons();
  }

  function evaluateWritingSubmission(item, text) {
    const wordsArr = String(text || '').trim().split(/\s+/).filter(Boolean);
    const wc = wordsArr.length;
    const lv = acadState.level;
    const minW = lv === 'B2' ? 160 : 85;
    const connectors = [
      'however', 'furthermore', 'moreover', 'consequently', 'therefore',
      'although', 'despite', 'in conclusion', 'on the one hand', 'on the other hand',
      'first of all', 'for instance', 'for example', 'sincerely', 'regards'
    ];
    const usedConnectors = connectors.filter((c) => new RegExp('\\b' + c + '\\b', 'i').test(text));
    const usedBoosters = (item.boosters || []).filter((b) => text.toLowerCase().includes(b.b12.toLowerCase().slice(0, 12)));
    let estScore = lv === 'B2' ? 6.5 : 5.5;
    if (wc >= minW) estScore += 1.0;
    if (usedConnectors.length >= 3) estScore += 0.5;
    if (usedBoosters.length >= 1) estScore += 0.5;
    estScore = Math.min(9.0, estScore);
    return { wc, minW, estScore: estScore.toFixed(1), usedConnectors, usedBoosters };
  }

  function bindAcademyEvents() {
    const sec = document.getElementById('tab-academy');
    if (!sec) return;

    sec.querySelectorAll('[data-acad-lv]').forEach((btn) => {
      btn.onclick = () => {
        acadState.level = btn.getAttribute('data-acad-lv');
        if (acadState.subTab === 'daily') acadState.subTab = 'listening';
        acadState.lisIdx = 0; acadState.wrtIdx = 0; acadState.spkIdx = 0;
        saveAcademyState();
        renderAcademySection();
      };
    });

    sec.querySelectorAll('[data-acad-sub]').forEach((btn) => {
      btn.onclick = () => openAcademyView(btn.getAttribute('data-acad-sub'));
    });

    if (acadState.subTab === 'listening') {
      const list = ACADEMY_DATA.listening[acadState.level] || ACADEMY_DATA.listening.B1;
      const idx = Math.min(acadState.lisIdx || 0, list.length - 1);
      const item = list[idx];

      sec.querySelectorAll('[data-lis-pick]').forEach((b) => {
        b.onclick = () => {
          acadState.lisIdx = Number(b.getAttribute('data-lis-pick'));
          saveAcademyState();
          renderAcademySection();
        };
      });

      const playUS = sec.querySelector('#lis-play-us');
      const playUK = sec.querySelector('#lis-play-uk');
      const playSlow = sec.querySelector('#lis-play-slow');
      if (playUS) playUS.onclick = () => speakExpressiveUtterance(item.sentence, { accent: 'us', rate: 0.96 });
      if (playUK) playUK.onclick = () => speakExpressiveUtterance(item.sentence, { accent: 'uk', rate: 0.95 });
      if (playSlow) playSlow.onclick = () => speakExpressiveUtterance(item.sentence, { accent: 'us', rate: 0.76, shadowing: true });

      const dictIn = sec.querySelector('#lis-dict-in');
      const dictFb = sec.querySelector('#lis-dict-feedback');
      const checkBtn = sec.querySelector('#lis-check-dict');
      const hintBtn = sec.querySelector('#lis-hint-btn');
      const showAnsBtn = sec.querySelector('#lis-show-ans');

      if (hintBtn && dictIn) {
        hintBtn.onclick = () => {
          const targetWords = item.sentence.split(/\s+/);
          const curWords = dictIn.value.trim().split(/\s+/).filter(Boolean);
          const nextWord = targetWords[curWords.length] || targetWords[targetWords.length - 1];
          dictIn.value = (dictIn.value.trim() + ' ' + nextWord).trim() + ' ';
          dictIn.focus();
        };
      }

      if (checkBtn && dictIn && dictFb) {
        checkBtn.onclick = () => {
          const res = compareWordsTokens(item.sentence, dictIn.value);
          if (res.pct >= 80) markItemDone(item.id);
          dictFb.classList.remove('hidden');
          dictFb.innerHTML = `
            <div class="flex items-center justify-between">
              <b class="${res.pct >= 80 ? 'text-ok' : 'text-warn'}">Độ chính xác: ${res.pct}% (${res.correctCount}/${res.total} từ)</b>
              <button type="button" class="btn !text-xs" data-a="speak" data-v="${escHTML(item.sentence)}">🔊 Nghe lại</button>
            </div>
            <div class="leading-relaxed">${res.html}</div>
            <div class="text-xs text-ok italic">Dịch: ${escHTML(item.trans)}</div>
            <div class="text-xs text-warn">💡 <b>Phân tích nối âm & trọng âm:</b> ${escHTML(item.ipaNote)}</div>
          `;
          upgradeSpeakerButtons();
        };
      }

      if (showAnsBtn && dictFb) {
        showAnsBtn.onclick = () => {
          dictFb.classList.remove('hidden');
          dictFb.innerHTML = `
            <div class="space-y-1.5">
              <b class="text-ok">Đáp án chuẩn: "${escHTML(item.sentence)}"</b>
              <div class="text-xs text-ok italic">Dịch: ${escHTML(item.trans)}</div>
              <div class="text-xs text-warn">💡 <b>Lưu ý phát âm & nối âm:</b> ${escHTML(item.ipaNote)}</div>
            </div>
          `;
        };
      }

      sec.querySelectorAll('[data-lis-mcq]').forEach((optBtn) => {
        optBtn.onclick = () => {
          const picked = Number(optBtn.getAttribute('data-lis-mcq'));
          const ok = picked === item.mcq.answer;
          if (ok) markItemDone(item.id);
          const expBox = sec.querySelector('#lis-mcq-explain');
          sec.querySelectorAll('[data-lis-mcq]').forEach((b, bi) => {
            b.classList.remove('btn-ok', 'btn-bad');
            if (bi === item.mcq.answer) b.classList.add('btn-ok');
            else if (bi === picked) b.classList.add('btn-bad');
          });
          if (expBox) {
            expBox.classList.remove('hidden');
            expBox.innerHTML = `<b class="${ok ? 'text-ok' : 'text-bad'}">${ok ? '🎉 Chính xác!' : '❌ Chưa đúng.'}</b> ${escHTML(item.mcq.explain)}`;
          }
        };
      });

      sec.querySelectorAll('[data-save-kv]').forEach((svBtn) => {
        svBtn.onclick = () => {
          const ki = Number(svBtn.getAttribute('data-save-kv'));
          const kv = item.keyVocab[ki];
          if (kv) quickAddAcademyWord({ ...kv, example: item.sentence, exampleTrans: item.trans }, svBtn);
        };
      });
    } else if (acadState.subTab === 'writing') {
      const list = ACADEMY_DATA.writing[acadState.level] || ACADEMY_DATA.writing.B1;
      const idx = Math.min(acadState.wrtIdx || 0, list.length - 1);
      const item = list[idx];
      const editor = sec.querySelector('#wrt-editor');
      const wcSpan = sec.querySelector('#wrt-word-count');

      sec.querySelectorAll('[data-wrt-pick]').forEach((b) => {
        b.onclick = () => {
          acadState.wrtIdx = Number(b.getAttribute('data-wrt-pick'));
          saveAcademyState();
          renderAcademySection();
        };
      });

      const updateDraftAndCount = () => {
        if (!editor) return;
        acadState.drafts[item.id] = editor.value;
        saveAcademyState();
        const wc = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;
        if (wcSpan) wcSpan.textContent = `Số từ: ${wc} từ (Mục tiêu ${acadState.level}: ${acadState.level === 'B2' ? '180–250' : '100–130'} từ)`;
      };

      if (editor) editor.addEventListener('input', updateDraftAndCount);

      sec.querySelectorAll('[data-wrt-scaf]').forEach((scBtn) => {
        scBtn.onclick = () => {
          const si = Number(scBtn.getAttribute('data-wrt-scaf'));
          const sc = item.scaffolds[si];
          if (sc && editor) {
            editor.value = (editor.value ? editor.value.trimEnd() + '\n' : '') + sc.text;
            updateDraftAndCount();
            editor.focus();
          }
        };
      });

      const fillAllBtn = sec.querySelector('#wrt-fill-all');
      if (fillAllBtn && editor) {
        fillAllBtn.onclick = () => {
          editor.value = item.scaffolds.map((s) => s.text.trim()).join('\n\n');
          updateDraftAndCount();
          notify('🧩 Đã lắp toàn bộ Khung sườn! Bạn hãy chỉnh sửa thêm ý cá nhân nhé.');
        };
      }

      sec.querySelectorAll('[data-wrt-insert]').forEach((insBtn) => {
        insBtn.onclick = () => {
          const phrase = insBtn.getAttribute('data-wrt-insert');
          if (editor && phrase) {
            editor.value = (editor.value.trimEnd() + ' ' + phrase + ' ').trimStart();
            updateDraftAndCount();
            editor.focus();
          }
        };
      });

      const clearBtn = sec.querySelector('#wrt-clear-btn');
      if (clearBtn && editor) clearBtn.onclick = () => { editor.value = ''; updateDraftAndCount(); };

      const showModelBtn = sec.querySelector('#wrt-show-model');
      const modelBox = sec.querySelector('#wrt-model-box');
      if (showModelBtn && modelBox) {
        showModelBtn.onclick = () => {
          modelBox.classList.toggle('hidden');
          upgradeSpeakerButtons();
        };
      }

      const gradeBtn = sec.querySelector('#wrt-grade-btn');
      const fbBox = sec.querySelector('#wrt-feedback-box');
      if (gradeBtn && editor && fbBox) {
        gradeBtn.onclick = async () => {
          const txt = editor.value.trim();
          if (txt.length < 20) {
            notify('Hãy viết hoặc bấm lắp Khung sườn ít nhất 1 câu trước khi chấm điểm nhé!');
            return;
          }
          markItemDone(item.id);
          const localEval = evaluateWritingSubmission(item, txt);
          fbBox.classList.remove('hidden');
          fbBox.innerHTML = `
            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
                <b class="text-ok text-base">📊 Đánh giá Cấu trúc & Từ vựng (${acadState.level}): Ước lượng ~${localEval.estScore}/10 VSTEP</b>
                <span class="text-xs font-mono">Độ dài: ${localEval.wc} từ</span>
              </div>
              <p class="text-xs">• <b>Từ nối học thuật đã dùng (${localEval.usedConnectors.length}):</b> ${
            localEval.usedConnectors.length ? escHTML(localEval.usedConnectors.join(', ')) : 'Nên bổ sung thêm từ nối như Furthermore, Consequently, In conclusion.'
          }</p>
              <div id="wrt-ai-deep" class="text-xs text-mute pt-1">🤖 Đang nhờ Gia sư AI phân tích ngữ pháp chi tiết từng câu...</div>
            </div>
          `;
          if (typeof global.rawAi === 'function') {
            try {
              const aiRes = await global.rawAi(
                `Bạn là giám khảo chấm thi Writing VSTEP/IELTS thân thiện. Hãy chấm bài viết trình độ ${acadState.level} sau:\nĐề bài: ${item.prompt}\nBài làm của học viên:\n"""${txt}"""\nHãy trả lời ngắn gọn bằng tiếng Việt theo 3 mục:\n1. Điểm mạnh & Điểm ước lượng (VSTEP /10 và CEFR).\n2. Các lỗi ngữ pháp/từ vựng cần sửa (kèm câu sửa đúng).\n3. Gợi ý 2 câu nâng cấp đắt giá hơn.`
              );
              const deepEl = document.getElementById('wrt-ai-deep');
              if (deepEl && aiRes) {
                deepEl.className = 'text-xs leading-relaxed pt-2 border-t border-line/50 text-fg';
                deepEl.innerHTML = escHTML(aiRes).replace(/\*\*(.+?)\*\*/g, '<b class="text-pri">$1</b>').replace(/\n/g, '<br>');
              }
            } catch (e) {
              const deepEl = document.getElementById('wrt-ai-deep');
              if (deepEl) deepEl.innerHTML = `💡 <b>Gợi ý nâng cấp nhanh:</b> Hãy bấm nút <b>Xem Bài mẫu đạt điểm tối đa (${acadState.level})</b> ngay bên dưới để đối chiếu cách dùng từ nối và cụm danh từ học thuật.`;
            }
          }
        };
      }
    } else if (acadState.subTab === 'speaking') {
      const list = ACADEMY_DATA.speaking[acadState.level] || ACADEMY_DATA.speaking.B1;
      const idx = Math.min(acadState.spkIdx || 0, list.length - 1);
      const item = list[idx];

      sec.querySelectorAll('[data-spk-pick]').forEach((b) => {
        b.onclick = () => {
          acadState.spkIdx = Number(b.getAttribute('data-spk-pick'));
          saveAcademyState();
          renderAcademySection();
        };
      });

      const userIn = sec.querySelector('#spk-user-in');
      const scoreBtn = sec.querySelector('#spk-score-btn');
      const scoreOut = sec.querySelector('#spk-score-out');
      const micBtn = sec.querySelector('#spk-mic-btn');
      const askAiBtn = sec.querySelector('#spk-ask-ai-btn');

      if (scoreBtn && userIn && scoreOut) {
        scoreBtn.onclick = () => {
          if (!userIn.value.trim()) {
            notify('Hãy bấm Micro đọc hoặc dùng mic bàn phím đọc đoạn mẫu vào ô trước nhé!');
            return;
          }
          const res = compareWordsTokens(item.cleanScript, userIn.value);
          if (res.pct >= 60) markItemDone(item.id);
          scoreOut.classList.remove('hidden');
          scoreOut.innerHTML = `
            <div class="font-bold ${res.pct >= 75 ? 'text-ok' : 'text-warn'}">🎯 Độ khớp phát âm & phản xạ: ${res.pct}% (${res.correctCount}/${res.total} từ)</div>
            <div class="leading-relaxed">${res.html}</div>
          `;
        };
      }

      if (micBtn && userIn) {
        micBtn.onclick = () => {
          const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
          if (!SR) {
            notify('Hãy bấm vào ô văn bản rồi bật nút 🎙️ Micro trên bàn phím iPad/điện thoại để đọc nhé!');
            userIn.focus();
            return;
          }
          try {
            const r = new SR();
            r.lang = 'en-US';
            r.interimResults = true;
            micBtn.textContent = '🔴 Đang nghe bạn nói...';
            r.onresult = (ev) => {
              let t = '';
              for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript + ' ';
              userIn.value = t.trim();
            };
            r.onend = () => {
              micBtn.textContent = '🎙️ Bấm đọc bằng Micro';
              if (userIn.value.trim() && scoreBtn) scoreBtn.click();
            };
            r.start();
          } catch (e) {
            userIn.focus();
          }
        };
      }

      if (askAiBtn && typeof global.openAsk === 'function') {
        askAiBtn.onclick = () => global.openAsk(item.question, item.cleanScript);
      }
    } else if (acadState.subTab === 'grammar') {
      const list = ACADEMY_DATA.grammar[acadState.level] || ACADEMY_DATA.grammar.B1;
      sec.querySelectorAll('[data-grm-q]').forEach((btn) => {
        btn.onclick = () => {
          const gi = Number(btn.getAttribute('data-grm-q'));
          const oi = Number(btn.getAttribute('data-grm-opt'));
          const g = list[gi];
          if (!g) return;
          const ok = oi === g.ans;
          if (ok) markItemDone(g.id);
          sec.querySelectorAll(`[data-grm-q="${gi}"]`).forEach((b, bi) => {
            b.classList.remove('btn-ok', 'btn-bad');
            if (bi === g.ans) b.classList.add('btn-ok');
            else if (bi === oi) b.classList.add('btn-bad');
          });
          const exp = sec.querySelector('#grm-exp-' + gi);
          if (exp) {
            exp.classList.remove('hidden');
            exp.innerHTML = `<b class="${ok ? 'text-ok' : 'text-bad'}">${ok ? '✅ Chính xác!' : '❌ Chưa chính xác.'}</b> ${escHTML(g.explain)}`;
          }
        };
      });
    } else if (acadState.subTab === 'daily') {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (!acadState.dailyStepDone[todayStr]) acadState.dailyStepDone[todayStr] = {};
      const stepDone = acadState.dailyStepDone[todayStr];

      const checkAllDailyDone = () => {
        if (stepDone.s1 && stepDone.s2 && stepDone.s3 && stepDone.s4 && acadState.lastDailyDate !== todayStr) {
          acadState.lastDailyDate = todayStr;
          acadState.dailyStreak = (acadState.dailyStreak || 0) + 1;
          notify('🔥 Xuất sắc! Bạn đã hoàn thành 5 phút Duy trì hôm nay! Streak +1');
        }
        saveAcademyState();
        renderAcademySection();
      };

      const s1Btn = sec.querySelector('#daily-s1-btn');
      const s1In = sec.querySelector('#daily-s1-in');
      if (s1Btn && s1In) {
        s1Btn.onclick = () => {
          if (normKey(s1In.value) === 'diagnosis') {
            stepDone.s1 = true;
            notify('✅ Nhiệm vụ 1 (Nghe): Chính xác ("diagnosis")!');
            checkAllDailyDone();
          } else notify('Gợi ý: Từ có nghĩa là "chẩn đoán" — bắt đầu bằng "diag..." (diagnosis)');
        };
      }

      const s2Btn = sec.querySelector('#daily-s2-btn');
      if (s2Btn) {
        s2Btn.onclick = () => {
          stepDone.s2 = true;
          notify('✅ Nhiệm vụ 2 (Nói Shadowing): Đã hoàn thành!');
          checkAllDailyDone();
        };
      }

      sec.querySelectorAll('[data-daily-s3]').forEach((b) => {
        b.onclick = () => {
          if (b.getAttribute('data-daily-s3') === '0') {
            stepDone.s3 = true;
            notify('✅ Nhiệm vụ 3 (Viết B2): Chính xác!');
            checkAllDailyDone();
          } else notify('Chưa đúng: "Despite" mang nghĩa tương phản, còn ở đây là quan hệ Nhân - Quả ("leads to").');
        };
      });

      const s4Btn = sec.querySelector('#daily-s4-btn');
      if (s4Btn) {
        s4Btn.onclick = () => {
          stepDone.s4 = true;
          notify('✅ Nhiệm vụ 4 (Từ vựng): Đã hoàn thành!');
          checkAllDailyDone();
        };
      }
    }
  }

  function runAllUpgrades() {
    injectAcademyTabsAndSection();
    upgradeSpeakerButtons();
    injectQuizMedicalBreakdown();
    upgradeVaultAndModalMedicalBoxes();
    injectSyncHeaderButton();
  }

  function initObserver() {
    upgradeExistingStoredWords();
    runAllUpgrades();
    if (typeof MutationObserver !== 'undefined' && document.body) {
      const obs = new MutationObserver(() => runAllUpgrades());
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }

  global.speak = function (text, accent = 'us') { playCambridgeAudio(text, accent); };
  global.speakUS = function (text) { playCambridgeAudio(text, 'us'); };
  global.speakUK = function (text) { playCambridgeAudio(text, 'uk'); };
  global.speakShadow = function (text) { playCambridgeAudio(text, 'us', true); };
  global.openSyncModal = renderSyncModal;
  global.buildMedicalBreakdownHTML = buildMedicalBreakdownHTML;
  global.openAcademyView = openAcademyView;

  loadLS();
  syncIDB();
})(window);
