/**
 * LexiContext AI Pro — Cambridge Dual-Audio (US / UK), Shadowing Cadence,
 * Comprehensive Medical Etymology Explainer & Cross-Device Cloud Sync (cache.js v4)
 */
(function (global) {
  'use strict';

  const LS_CACHE_KEY = 'lexicontext_ai_cache_v1';
  const LS_MODELS_KEY = 'lexicontext_models_cache_v1';
  const LS_VAULT_KEY = 'lexicontext_master_db_unified';
  const LS_SYNC_PIN_KEY = 'lexicontext_saved_sync_pin';
  const IDB_NAME = 'lexicontext_smart_cache_db';
  const IDB_STORE = 'ai_cache_entries';
  const MAX_LS_ENTRIES = 350;

  const memCache = new Map();
  const inFlight = new Map();
  const cambridgeMp3Cache = new Map();
  let dbPromise = null;

  const sharedAudio = typeof Audio !== 'undefined' ? new Audio() : null;
  if (sharedAudio) {
    sharedAudio.preload = 'auto';
  }

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

  /* ===== 1. ÂM THANH CAMBRIDGE (US/UK) & SHADOWING CÂU DÀI ===== */
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
      u.rate = isShadowing ? 0.86 : options.rate || 0.94;
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
        playPromise.catch(() => {
          speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us' });
        });
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

      if (val && !val.includes(' ')) {
        prefetchDictionaryMp3(val);
      }
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
      if (btn.dataset.a === 'speak') {
        textToSpeak = btn.dataset.v || '';
      } else if (btn.dataset.a === 'speak-form') {
        const inp = document.getElementById('f-word');
        textToSpeak = inp ? inp.value : '';
      } else if (btn.dataset.a === 'sel-speak') {
        const selTxt = document.getElementById('selbar-txt');
        textToSpeak = selTxt ? selTxt.textContent : '';
      }

      if (textToSpeak) {
        playCambridgeAudio(textToSpeak, isShadow ? 'us' : accent, isShadow);
      } else {
        notify('Hãy nhập từ vựng trước khi nghe.');
      }
    },
    true
  );

  /* ===== 2. TỪ ĐIỂN & BỘ PHÂN TÍCH THÀNH TỐ TỪ Y KHOA / HỌC THUẬT (ANH - VIỆT) ===== */
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
      uni: { en: 'one, single', vn: 'một, đơn' },
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
      celi: { en: 'abdomen, belly', vn: 'ổ bụng' },
      thorac: { en: 'chest, thorax', vn: 'lồng ngực, ngực' },
      pector: { en: 'chest, breast', vn: 'ngực' },
      card: { en: 'heart', vn: 'tim, tâm' },
      cardi: { en: 'heart, cardiac orifice', vn: 'tim, tâm vị' },
      coron: { en: 'crown, heart vessels (coronary)', vn: 'mạch vành tim' },
      vas: { en: 'vessel, duct', vn: 'mạch máu, ống dẫn' },
      vascul: { en: 'small blood vessel', vn: 'mạch máu' },
      angi: { en: 'blood vessel, lymph vessel', vn: 'mạch máu, mạch bạch huyết' },
      arteri: { en: 'artery', vn: 'động mạch' },
      aort: { en: 'aorta (main artery)', vn: 'động mạch chủ' },
      ven: { en: 'vein', vn: 'tĩnh mạch' },
      phleb: { en: 'vein', vn: 'tĩnh mạch' },
      capill: { en: 'hair-like vessel (capillary)', vn: 'mao mạch' },
      hem: { en: 'blood', vn: 'máu, huyết' },
      haem: { en: 'blood', vn: 'máu, huyết' },
      hemat: { en: 'blood', vn: 'máu, huyết học' },
      haemat: { en: 'blood', vn: 'máu, huyết' },
      erythr: { en: 'red (red blood cell)', vn: 'màu đỏ, hồng cầu' },
      leuk: { en: 'white (white blood cell)', vn: 'màu trắng, bạch cầu' },
      leuc: { en: 'white', vn: 'màu trắng, bạch cầu' },
      thromb: { en: 'clot, lump, platelet', vn: 'cục máu đông, huyết khối, tiểu cầu' },
      embol: { en: 'plug, stopper, moving clot', vn: 'vật tắc mạch, thuyên tắc' },
      isch: { en: 'to hold back, suppress, restrict flow', vn: 'thiếu máu cục bộ, ứ trệ' },
      splen: { en: 'spleen', vn: 'lách, tỳ' },
      lymph: { en: 'lymph, clear fluid', vn: 'bạch huyết' },
      immun: { en: 'safe, protected, immune', vn: 'miễn dịch' },
      pulmon: { en: 'lung', vn: 'phổi' },
      pneum: { en: 'lung, air, breath', vn: 'phổi, khí, hơi thở' },
      pneumon: { en: 'lung', vn: 'phổi, phế' },
      bronch: { en: 'bronchus, airway tube', vn: 'phế quản' },
      bronchiol: { en: 'bronchiole (small airway)', vn: 'tiểu phế quản' },
      alveol: { en: 'alveolus (air sac)', vn: 'phế nang' },
      trache: { en: 'trachea, windpipe', vn: 'khí quản' },
      laryng: { en: 'larynx, voice box', vn: 'thanh quản' },
      pharyng: { en: 'pharynx, throat', vn: 'hầu, họng' },
      rhin: { en: 'nose', vn: 'mũi, tỵ' },
      nas: { en: 'nose', vn: 'mũi' },
      sinus: { en: 'sinus, cavity, hollow', vn: 'xoang' },
      pleur: { en: 'pleura (membrane around lungs), rib', vn: 'màng phổi' },
      phren: { en: 'diaphragm, mind', vn: 'cơ hoành / tâm trí' },
      ox: { en: 'oxygen, sharp', vn: 'oxy' },
      capn: { en: 'carbon dioxide', vn: 'khí CO2' },
      spir: { en: 'to breathe', vn: 'hô hấp, thở' },
      or: { en: 'mouth, oral', vn: 'miệng' },
      stomat: { en: 'mouth', vn: 'miệng, khoang miệng' },
      gloss: { en: 'tongue', vn: 'lưỡi' },
      lingu: { en: 'tongue', vn: 'lưỡi' },
      gingiv: { en: 'gums', vn: 'nướu, lợi' },
      odont: { en: 'tooth', vn: 'răng' },
      dent: { en: 'tooth', vn: 'răng' },
      esophag: { en: 'esophagus, gullet', vn: 'thực quản' },
      oesophag: { en: 'esophagus', vn: 'thực quản' },
      gastr: { en: 'stomach', vn: 'dạ dày, vị' },
      pylor: { en: 'pylorus (stomach gate)', vn: 'môn vị' },
      enter: { en: 'intestine (especially small intestine)', vn: 'ruột, ruột non' },
      duoden: { en: 'duodenum (first part of small intestine)', vn: 'tá tràng' },
      jejun: { en: 'jejunum (middle small intestine)', vn: 'hỗng tràng' },
      ile: { en: 'ileum (last part of small intestine)', vn: 'hồi tràng' },
      cec: { en: 'cecum (blind pouch of large intestine)', vn: 'manh tràng' },
      col: { en: 'colon, large intestine', vn: 'đại tràng, kết tràng' },
      colon: { en: 'colon, large intestine', vn: 'đại tràng' },
      sigmoid: { en: 'sigmoid colon (S-shaped)', vn: 'đại tràng sigma' },
      rect: { en: 'rectum, straight', vn: 'trực tràng' },
      proct: { en: 'anus and rectum', vn: 'hậu môn - trực tràng' },
      an: { en: 'anus', vn: 'hậu môn' },
      hepat: { en: 'liver', vn: 'gan' },
      chol: { en: 'bile, gall', vn: 'mật' },
      chole: { en: 'bile, gall', vn: 'mật' },
      cholecyst: { en: 'gallbladder', vn: 'túi mật' },
      choledoch: { en: 'common bile duct', vn: 'ống mật chủ' },
      pancreat: { en: 'pancreas', vn: 'tuyến tụy' },
      sial: { en: 'saliva, salivary gland', vn: 'nước bọt, tuyến nước bọt' },
      nephr: { en: 'kidney', vn: 'thận' },
      ren: { en: 'kidney', vn: 'thận' },
      glomerul: { en: 'glomerulus (kidney filter cluster)', vn: 'cầu thận' },
      pyel: { en: 'renal pelvis', vn: 'bể thận' },
      ureter: { en: 'ureter (tube from kidney to bladder)', vn: 'niệu quản' },
      cyst: { en: 'urinary bladder, sac of fluid', vn: 'bàng quang, túi dịch, nang' },
      vesic: { en: 'urinary bladder, blister', vn: 'bàng quang, bóng nước' },
      urethr: { en: 'urethra', vn: 'niệu đạo' },
      prostat: { en: 'prostate gland', vn: 'tuyến tiền liệt' },
      orch: { en: 'testis, testicle', vn: 'tinh hoàn' },
      orchi: { en: 'testis, testicle', vn: 'tinh hoàn' },
      test: { en: 'testis, witness', vn: 'tinh hoàn / kiểm tra' },
      oophor: { en: 'ovary', vn: 'buồng trứng' },
      ovari: { en: 'ovary', vn: 'buồng trứng' },
      salping: { en: 'fallopian tube (or eustachian tube)', vn: 'vòi tử cung (vòi trứng)' },
      hyster: { en: 'uterus, womb', vn: 'tử cung, dạ con' },
      metr: { en: 'uterus, womb, measure', vn: 'tử cung, cơ tử cung' },
      uter: { en: 'uterus', vn: 'tử cung' },
      cervic: { en: 'neck, cervix uteri', vn: 'cổ, cổ tử cung' },
      colp: { en: 'vagina', vn: 'âm đạo' },
      vagin: { en: 'vagina, sheath', vn: 'âm đạo' },
      mamm: { en: 'breast, mammary gland', vn: 'vú, tuyến vú' },
      mast: { en: 'breast', vn: 'vú, tuyến vú' },
      gravid: { en: 'pregnant', vn: 'mang thai, thai kỳ' },
      nat: { en: 'birth, born', vn: 'sinh đẻ, sơ sinh' },
      neur: { en: 'nerve, nervous system', vn: 'dây thần kinh, hệ thần kinh' },
      encephal: { en: 'brain', vn: 'não bộ' },
      cerebr: { en: 'cerebrum, brain', vn: 'đại não, não' },
      cerebell: { en: 'cerebellum', vn: 'tiểu não' },
      mening: { en: 'meninges (membranes covering brain & spinal cord)', vn: 'màng não - tủy' },
      myel: { en: 'spinal cord, bone marrow', vn: 'tủy sống, tủy xương' },
      radicul: { en: 'nerve root', vn: 'rễ thần kinh' },
      gangli: { en: 'ganglion (nerve cluster)', vn: 'hạch thần kinh' },
      psych: { en: 'mind, soul, mental process', vn: 'tâm thần, tâm lý, tinh thần' },
      ment: { en: 'mind, chin', vn: 'tâm trí, tinh thần' },
      somn: { en: 'sleep', vn: 'giấc ngủ' },
      hypn: { en: 'sleep', vn: 'giấc ngủ, thôi miên' },
      esth: { en: 'sensation, feeling, perception', vn: 'cảm giác (gây mê / tê)' },
      aesth: { en: 'sensation, feeling', vn: 'cảm giác' },
      alges: { en: 'sensitivity to pain', vn: 'cảm giác đau' },
      ophthalm: { en: 'eye', vn: 'mắt, nhãn khoa' },
      ocul: { en: 'eye', vn: 'mắt' },
      opt: { en: 'eye, vision, sight', vn: 'thị giác, mắt' },
      retin: { en: 'retina', vn: 'võng mạc' },
      kerat: { en: 'cornea, horny tissue', vn: 'giác mạc, lớp sừng' },
      blephar: { en: 'eyelid', vn: 'mí mắt' },
      irid: { en: 'iris', vn: 'mống mắt' },
      ot: { en: 'ear', vn: 'tai' },
      aur: { en: 'ear, hearing', vn: 'tai, thính giác' },
      audi: { en: 'hearing', vn: 'thính giác, nghe' },
      tympan: { en: 'eardrum, middle ear', vn: 'màng nhĩ, tai giữa' },
      myring: { en: 'eardrum', vn: 'màng nhĩ' },
      derm: { en: 'skin', vn: 'da, bì' },
      dermat: { en: 'skin', vn: 'da, da liễu' },
      cutane: { en: 'skin', vn: 'da' },
      hidr: { en: 'sweat', vn: 'mồ hôi' },
      seb: { en: 'sebum, oil', vn: 'bã nhờn' },
      trich: { en: 'hair', vn: 'tóc, lông' },
      onych: { en: 'nail (fingernail/toenail)', vn: 'móng tay, móng chân' },
      melan: { en: 'black, dark pigment', vn: 'sắc tố đen (melanin)' },
      oste: { en: 'bone', vn: 'xương, cốt' },
      osteo: { en: 'bone', vn: 'xương' },
      arthr: { en: 'joint', vn: 'khớp' },
      chondr: { en: 'cartilage', vn: 'sụn' },
      spondyl: { en: 'vertebra, spinal column', vn: 'đốt sống, cột sống' },
      vertebr: { en: 'vertebra, spine', vn: 'đốt sống' },
      crani: { en: 'skull, cranium', vn: 'hộp sọ' },
      cost: { en: 'rib', vn: 'xương sườn' },
      carp: { en: 'wrist bones', vn: 'xương cổ tay' },
      tars: { en: 'ankle bones', vn: 'xương cổ chân' },
      pelv: { en: 'pelvis, basin', vn: 'khung chậu, bể' },
      my: { en: 'muscle', vn: 'cơ, bắp thịt' },
      myo: { en: 'muscle', vn: 'cơ, cơ bắp' },
      muscul: { en: 'muscle', vn: 'cơ' },
      ten: { en: 'tendon, stretch', vn: 'gân' },
      tendin: { en: 'tendon', vn: 'gân' },
      burs: { en: 'bursa (fluid sac near joint)', vn: 'bao hoạt dịch khớp' },
      fasci: { en: 'fascia (connective tissue band)', vn: 'cân cơ, mạc' },
      aden: { en: 'gland', vn: 'tuyến (nội/ngoại tiết), hạch' },
      adren: { en: 'adrenal gland', vn: 'tuyến thượng thận' },
      thyr: { en: 'thyroid gland', vn: 'tuyến giáp' },
      crin: { en: 'to secrete', vn: 'bài tiết, tiết tố' },
      glyc: { en: 'sugar, glucose', vn: 'đường, glucose' },
      gluc: { en: 'sugar, glucose', vn: 'đường huyết' },
      lip: { en: 'fat, lipid', vn: 'mỡ, chất béo, lipid' },
      adip: { en: 'fat', vn: 'mô mỡ' },
      steat: { en: 'fat, sebum', vn: 'mỡ (gan nhiễm mỡ)' },
      calc: { en: 'calcium, stone, heel', vn: 'canxi, vôi hóa' },
      kal: { en: 'potassium', vn: 'kali (trong máu)' },
      natr: { en: 'sodium', vn: 'natri (trong máu)' },
      ferr: { en: 'iron', vn: 'sắt' },
      sider: { en: 'iron', vn: 'sắt' },
      hist: { en: 'tissue', vn: 'mô tế bào' },
      cyt: { en: 'cell', vn: 'tế bào' },
      kary: { en: 'nucleus', vn: 'nhân tế bào' },
      path: { en: 'disease, suffering, feeling', vn: 'bệnh lý, tổn thương' },
      nos: { en: 'disease', vn: 'bệnh tật' },
      eti: { en: 'cause, origin', vn: 'nguyên nhân, căn nguyên' },
      onc: { en: 'tumor, mass, bulk', vn: 'khối u, ung bướu' },
      carcin: { en: 'cancer, malignant epithelial tumor', vn: 'ung thư biểu mô' },
      sarc: { en: 'flesh, connective tissue (sarcoma)', vn: 'mô liên kết, thịt (ung thư mô liên kết)' },
      necr: { en: 'death, dead tissue', vn: 'hoại tử, tế bào chết' },
      mort: { en: 'death', vn: 'tử vong, cái chết' },
      morb: { en: 'disease, sickness', vn: 'bệnh tật, tỷ lệ mắc bệnh' },
      pyr: { en: 'fever, fire, heat', vn: 'sốt, nhiệt' },
      pyret: { en: 'fever', vn: 'sốt' },
      febr: { en: 'fever', vn: 'cơn sốt' },
      therm: { en: 'heat, temperature', vn: 'nhiệt độ, thân nhiệt' },
      cry: { en: 'cold', vn: 'lạnh, áp lạnh' },
      sep: { en: 'putrefaction, infection', vn: 'nhiễm trùng, nhiễm khuẩn' },
      sept: { en: 'infection, or wall/partition (septum)', vn: 'nhiễm khuẩn huyết / vách ngăn' },
      py: { en: 'pus', vn: 'mủ, tạo mủ' },
      tox: { en: 'poison, toxin', vn: 'độc tố, nhiễm độc' },
      toxic: { en: 'poison, toxic', vn: 'độc chất, ngộ độc' },
      pharmac: { en: 'drug, medicine', vn: 'dược phẩm, thuốc' },
      therap: { en: 'treatment, medical care', vn: 'điều trị, trị liệu' },
      chir: { en: 'hand (surgery)', vn: 'bàn tay, ngoại khoa' },
      radi: { en: 'radiation, X-ray, radius', vn: 'tia xạ, X-quang, xương quay' },
      son: { en: 'sound (ultrasound)', vn: 'âm thanh, siêu âm' },
      ech: { en: 'echo, reflected sound', vn: 'tiếng vang, siêu âm' },
      electr: { en: 'electricity', vn: 'điện (điện tâm đồ, điện não)' },
      scop: { en: 'to examine, observe, view', vn: 'quan sát, soi khám' },
      meticul: { en: 'fearful, careful, scrupulous attention to detail', vn: 'cẩn trọng, tỉ mỉ từng chi tiết' },
      ubiquit: { en: 'everywhere (Latin ubique)', vn: 'ở khắp mọi nơi, phổ biến' },
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
      graph: { en: 'instrument for recording', vn: 'máy ghi, thiết bị đo' },
      metry: { en: 'process of measuring', vn: 'phép đo lường' },
      meter: { en: 'instrument for measuring', vn: 'dụng cụ đo' },
      pathy: { en: 'disease, pathological disorder', vn: 'bệnh lý, chứng bệnh' },
      megaly: { en: 'abnormal enlargement of an organ', vn: 'chứng phì đại, to bất thường' },
      algia: { en: 'pain, painful condition', vn: 'đau, chứng đau' },
      dynia: { en: 'pain, aching', vn: 'cơn đau, nhức' },
      emia: { en: 'blood condition, presence of substance in blood', vn: 'tình trạng trong máu, huyết' },
      aemia: { en: 'blood condition', vn: 'tình trạng máu' },
      uria: { en: 'urinary condition, substance in urine', vn: 'tình trạng nước tiểu / tiểu tiện' },
      ia: { en: 'pathological condition, state, disorder', vn: 'tình trạng bệnh lý, chứng bệnh' },
      iasis: { en: 'abnormal condition, presence of (stones/parasites)', vn: 'bệnh lý tạo thành, nhiễm (sỏi / ký sinh trùng)' },
      osis: { en: 'abnormal condition, increase, degenerative process', vn: 'tình trạng bệnh lý, thoái hóa, tăng' },
      oma: { en: 'tumor, neoplasm, mass, swelling', vn: 'khối u, bướu, khối sưng' },
      lysis: { en: 'breakdown, dissolution, destruction, loosening', vn: 'sự phân hủy, ly giải, tiêu giải' },
      lytic: { en: 'destroying, dissolving, reducing', vn: 'làm tiêu hủy, phân giải' },
      plasty: { en: 'surgical repair, reconstruction, molding', vn: 'phẫu thuật tạo hình, tái tạo' },
      rrhaphy: { en: 'surgical suturing, sewing', vn: 'phẫu thuật khâu phục hồi' },
      pexy: { en: 'surgical fixation, anchoring in place', vn: 'phẫu thuật cố định cơ quan' },
      desis: { en: 'surgical fusion, binding together', vn: 'phẫu thuật làm dính / cố định khớp' },
      centesis: { en: 'surgical puncture to aspirate fluid', vn: 'thủ thuật chọc dò hút dịch' },
      tripsy: { en: 'surgical crushing, pulverizing', vn: 'thủ thuật tán, nghiền (tán sỏi)' },
      stenosis: { en: 'abnormal narrowing or stricture of a duct/passage', vn: 'tình trạng hẹp, chít hẹp bất thường' },
      sclerosis: { en: 'abnormal hardening or thickening of tissue', vn: 'tình trạng xơ cứng, xơ hóa' },
      malacia: { en: 'abnormal softening of tissue/bone', vn: 'chứng nhuyễn, mềm mô/xương' },
      penia: { en: 'deficiency, abnormal decrease in cells/substance', vn: 'sự thiếu hụt, giảm số lượng' },
      poiesis: { en: 'formation, production (especially blood cells)', vn: 'sự tạo thành, sinh sản tế bào' },
      rrhea: { en: 'flow, excessive discharge', vn: 'chảy dịch, tiết dịch, tiêu chảy' },
      rrhoea: { en: 'flow, discharge', vn: 'chảy dịch, xuất tiết' },
      rrhage: { en: 'excessive burst of blood flow, hemorrhage', vn: 'xuất huyết, chảy máu ồ ạt' },
      rrhagia: { en: 'excessive or abnormal bleeding', vn: 'chảy máu dữ dội, băng huyết' },
      lith: { en: 'stone, calculus, calcification', vn: 'sỏi, khối vôi hóa (sỏi phân / sỏi mật / sỏi thận)' },
      lithiasis: { en: 'condition of having stones/calculi', vn: 'bệnh sỏi' },
      cele: { en: 'hernia, protrusion, swelling, pouch', vn: 'thoát vị, túi phình, khối lồi' },
      ectasis: { en: 'dilation, expansion, stretching', vn: 'giãn, phình giãn' },
      ectasia: { en: 'dilation, expansion', vn: 'sự giãn rộng' },
      edema: { en: 'swelling caused by fluid accumulation', vn: 'phù nề, ứ dịch' },
      oedema: { en: 'swelling, fluid retention', vn: 'phù nề' },
      emesis: { en: 'vomiting', vn: 'nôn, ói' },
      pepsia: { en: 'digestion', vn: 'sự tiêu hóa' },
      phagia: { en: 'eating, swallowing', vn: 'ăn, nuốt' },
      phasia: { en: 'speech, ability to speak', vn: 'ngôn ngữ, lời nói' },
      pnea: { en: 'breathing, respiration', vn: 'hơi thở, sự hô hấp' },
      pnoea: { en: 'breathing', vn: 'hô hấp' },
      ptysis: { en: 'spitting, coughing up', vn: 'khạc, ho ra (ho ra máu)' },
      spasm: { en: 'sudden involuntary muscle contraction', vn: 'cơn co thắt cơ đột ngột' },
      plegia: { en: 'paralysis, stroke', vn: 'liệt hoàn toàn' },
      paresis: { en: 'weakness, partial paralysis', vn: 'yếu liệt, liệt nhẹ' },
      trophy: { en: 'nourishment, development, growth', vn: 'dinh dưỡng, sự phát triển cơ/mô' },
      plasia: { en: 'formation, development, cell growth', vn: 'sự hình thành, tăng sinh tế bào' },
      plasm: { en: 'formed material, cell substance', vn: 'chất nguyên sinh, mô tạo thành' },
      genesis: { en: 'origin, production, development', vn: 'sự sinh ra, nguồn gốc, cơ chế bệnh sinh' },
      genic: { en: 'producing, originating in, caused by', vn: 'gây ra bởi, có nguồn gốc từ' },
      cyte: { en: 'mature cell', vn: 'tế bào trưởng thành' },
      blast: { en: 'immature cell, embryonic precursor cell', vn: 'nguyên bào (tế bào non)' },
      clast: { en: 'cell that breaks down/resorbs matrix', vn: 'hủy bào (tế bào tiêu hủy)' },
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
      ive: { en: 'tending to, having the nature of', vn: 'có xu hướng, mang tính chất' },
    },
  };

  function cleanMorpheme(str) {
    return String(str || '')
      .replace(/[()\-–—\/]/g, '')
      .trim()
      .toLowerCase();
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
      if (k.length >= 3 && c.length >= 3 && (k.startsWith(c) || c.startsWith(k))) {
        return val;
      }
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

    let en = '';
    let vn = '';

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
    } else {
      return null;
    }

    const formattedElem =
      type === 'prefix'
        ? rawElem.replace(/-?$/, '-')
        : type === 'suffix'
          ? rawElem.replace(/^-?/, '-')
          : rawElem;

    return {
      element: formattedElem,
      en,
      vn,
    };
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
              ? {
                  element: 'sign',
                  en: 'clinical sign / physical examination finding',
                  vn: 'dấu hiệu lâm sàng khi thăm khám',
                }
              : null,
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
        suffix: { element: '-itis', ...MEDICAL_DICT.suffix.itis },
      };
    }
    if (w === 'fecalith' || w === 'faecalith') {
      return {
        prefix: null,
        root: { element: 'fec / feca', ...MEDICAL_DICT.root.fec },
        combining: { element: '-a- / -o-', en: 'combining vowel', vn: 'nguyên âm nối' },
        suffix: { element: '-lith', ...MEDICAL_DICT.suffix.lith },
      };
    }
    if (w === 'dysuria') {
      return {
        prefix: { element: 'dys-', ...MEDICAL_DICT.prefix.dys },
        root: { element: 'ur-', ...MEDICAL_DICT.root.ur },
        combining: null,
        suffix: { element: '-ia', ...MEDICAL_DICT.suffix.ia },
      };
    }
    if (w === 'irritation') {
      return {
        prefix: null,
        root: { element: 'irritat-', ...MEDICAL_DICT.root.irritat },
        combining: null,
        suffix: { element: '-ion', ...MEDICAL_DICT.suffix.ion },
      };
    }
    if (w === 'resistance') {
      return {
        prefix: { element: 're-', ...MEDICAL_DICT.prefix.re },
        root: { element: 'sist', ...MEDICAL_DICT.root.sist },
        combining: null,
        suffix: { element: '-ance', ...MEDICAL_DICT.suffix.ance },
      };
    }

    let prefix = null;
    let root = null;
    let suffix = null;
    let rem = w;

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
          vn: fallbackHit ? fallbackHit.vn : `gốc từ "${cleanRem}"`,
        };
      }
      if (prefix || root || suffix) {
        return { prefix, root, combining: null, suffix };
      }
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
        ? {
            element: String(m.combining).trim(),
            en: 'combining vowel linking root to suffix',
            vn: 'nguyên âm nối giữa gốc từ và hậu tố',
          }
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

    const summaryTokens = [
      prefix ? prefix.element : null,
      root ? root.element : null,
      combining ? combining.element : null,
      suffix ? suffix.element : null,
    ]
      .filter(Boolean)
      .join(' + ');

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
      if (pTag) {
        wordText = pTag.textContent.split('/')[0].trim();
      }
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

      if (oldRedBar && newWidget) {
        oldRedBar.replaceWith(newWidget);
      } else if (newWidget) {
        const meaningP = art.querySelector('p.text-sm.font-semibold');
        if (meaningP && meaningP.parentNode) {
          meaningP.parentNode.insertBefore(newWidget, meaningP.nextSibling);
        }
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
      if (oldBar && newWidget) {
        oldBar.replaceWith(newWidget);
      }
    });
  }

  /* ===== 3. ĐỒNG BỘ ĐÁM MÂY 2 THIẾT BỊ (HOẠT ĐỘNG 100% TRÊN GITHUB PAGES) ===== */
  function getMasterPayload() {
    try {
      const raw = localStorage.getItem(LS_VAULT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function applyMasterPayload(payload, mode = 'merge') {
    if (!payload || !Array.isArray(payload.words)) {
      throw new Error('Dữ liệu đồng bộ không hợp lệ.');
    }

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

    let pin = String(customPin || localStorage.getItem(LS_SYNC_PIN_KEY) || '')
      .trim()
      .replace(/[^0-9A-Z]/gi, '');
    if (!pin || pin.length < 4) {
      pin = String(Math.floor(100000 + Math.random() * 900000));
    }

    const envelope = JSON.stringify({
      v: 4,
      pin,
      updatedAt: Date.now(),
      payload,
    });

    let uploaded = false;

    try {
      const topicUrl = 'https://ntfy.sh/lexicontext_sync_v4_' + encodeURIComponent(pin);
      const r = await fetch(topicUrl, {
        method: 'POST',
        body: envelope,
      });
      if (r.ok) {
        uploaded = true;
      }
    } catch (e) {}

    try {
      const r2 = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pin, data: payload }),
      });
      if (r2.ok) uploaded = true;
    } catch (e) {}

    if (!uploaded) {
      throw new Error('Không thể kết nối máy chủ đám mây. Vui lòng kiểm tra kết nối Internet.');
    }

    localStorage.setItem(LS_SYNC_PIN_KEY, pin);
    return { success: true, code: pin, totalWords: payload.words.length };
  }

  async function pullFromCloudSync(pinCode, mode = 'merge') {
    const code = String(pinCode || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
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
            try {
              return JSON.parse(l);
            } catch (e) {
              return null;
            }
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
      throw new Error(
        `Chưa tìm thấy dữ liệu cho mã "${code}". Hãy bấm nút "☁️ Tải lên & Nhận mã 6 số" ở Thiết bị 1 trước rồi thử lại!`
      );
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
              <p class="text-xs text-mute">Chuyển nhanh kho từ vựng giữa iPad, iPhone, máy tính chỉ bằng mã 6 số.</p>
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
            <p class="text-xs text-mute">Bấm nút dưới đây trên máy đang có nhiều từ vựng để đẩy dữ liệu lên đám mây:</p>
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
        statusMsg.innerHTML = `<span class="text-ok">✅ Đã tải thành công <b>${res.totalWords} từ vựng</b> lên đám mây! Hãy nhập mã <b>${res.code}</b> ở máy thứ 2.</span>`;
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

  /* ===== 4. SMART CACHE TIẾT KIỆM QUOTA GEMINI API ===== */
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
      entries.forEach(([k, v]) => {
        plain[k] = v;
      });
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
      try {
        db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).put(record);
      } catch (e) {}
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
        quizTrans: q.trans || w.exampleTrans || '',
      };
    } catch (e) {
      return null;
    }
  }

  function withDedup(key, fn) {
    if (inFlight.has(key)) return inFlight.get(key);
    const p = Promise.resolve()
      .then(fn)
      .finally(() => inFlight.delete(key));
    inFlight.set(key, p);
    return p;
  }

  function extractKey(promptText) {
    const p = String(promptText || '').trim();
    if (!p || /Trả lời đúng 1 từ:\s*OK/i.test(p)) return null;
    const lookMatch = p.match(/^Tra từ\/cụm từ\s+"([^"]+)"/i);
    if (lookMatch)
      return {
        type: 'lookup',
        term: normKey(lookMatch[1]),
        key: 'lookup:' + normKey(lookMatch[1]),
      };
    const analyzeMatch = p.match(/Người dùng nhập:\s*"""([\s\S]*?)"""/i);
    if (analyzeMatch) {
      const rawIn = analyzeMatch[1].trim();
      const lvMatch = p.match(/Mức câu ví dụ:\s*([^\n.]+)/i);
      return {
        type: 'analyze',
        key: 'analyze:' + (lvMatch ? normKey(lvMatch[1]) : 'auto') + ':' + hashText(rawIn),
      };
    }
    return { type: 'raw', key: 'raw:' + hashText(p) };
  }

  function makeGeminiResponse(text) {
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: typeof text === 'string' ? text : JSON.stringify(text) }],
            },
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (typeof global.fetch === 'function') {
    const origFetch = global.fetch.bind(global);
    global.fetch = async function (input, init) {
      const url = typeof input === 'string' ? input : (input && input.url) || '';

      if (
        url.includes('generativelanguage.googleapis.com/v1beta/models') &&
        !url.includes(':generateContent')
      ) {
        try {
          const cached = JSON.parse(localStorage.getItem(LS_MODELS_KEY) || 'null');
          if (cached && Date.now() - (cached.ts || 0) < 86400000 && cached.data) {
            return new Response(JSON.stringify(cached.data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
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

      if (
        url.includes('generativelanguage.googleapis.com/v1beta/models/') &&
        url.includes(':generateContent') &&
        init &&
        init.body
      ) {
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
              const outText = (json?.candidates?.[0]?.content?.parts || [])
                .map((p) => p.text || '')
                .join('')
                .trim();
              if (outText) {
                const clean = outText.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '');
                await setEntry(info.key, clean, info.type);
                try {
                  const obj = JSON.parse(clean);
                  if (Array.isArray(obj)) {
                    for (const item of obj) {
                      if (item && item.word)
                        await setEntry('lookup:' + normKey(item.word), JSON.stringify(item), 'lookup');
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
            return new Response(err.body || '{}', {
              status: err.status,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }
      }

      return origFetch(input, init);
    };
  }

  function runAllUpgrades() {
    upgradeSpeakerButtons();
    injectQuizMedicalBreakdown();
    upgradeVaultAndModalMedicalBoxes();
    injectSyncHeaderButton();
  }

  function initObserver() {
    upgradeExistingStoredWords();
    runAllUpgrades();
    if (typeof MutationObserver !== 'undefined' && document.body) {
      const obs = new MutationObserver(() => {
        runAllUpgrades();
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }

  global.speak = function (text, accent = 'us') {
    playCambridgeAudio(text, accent);
  };
  global.speakUS = function (text) {
    playCambridgeAudio(text, 'us');
  };
  global.speakUK = function (text) {
    playCambridgeAudio(text, 'uk');
  };
  global.speakShadow = function (text) {
    playCambridgeAudio(text, 'us', true);
  };
  global.openSyncModal = renderSyncModal;
  global.buildMedicalBreakdownHTML = buildMedicalBreakdownHTML;

  loadLS();
  syncIDB();
})(window);
