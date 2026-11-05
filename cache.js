/**
 * LexiContext AI Pro — Cambridge Dual-Audio (US / UK), Shadowing Cadence,
 * Medical Anatomy Explainer & Multi-Device Cloud Sync Engine (cache.js v3)
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

  // Đối tượng Audio duy nhất giúp iPad Safari luôn sẵn sàng phát tức thì khi chạm
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
    return words.length >= 3 || /[.!?—;:"]/.test(str);
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
      u.rate = isShadowing ? 0.88 : options.rate || 0.94;
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

      if (typeof options.onBoundary === 'function') {
        u.onboundary = (e) => {
          if (e.name === 'word') options.onBoundary(e.charIndex, e.charLength);
        };
      }
      if (typeof options.onEnd === 'function') {
        u.onend = options.onEnd;
        u.onerror = options.onEnd;
      }

      speechSynthesis.resume();
      speechSynthesis.speak(u);
    } catch (e) {
      if (typeof options.onEnd === 'function') options.onEnd();
    }
  }

  function playCambridgeAudio(rawText, accent = 'us', isShadowing = false) {
    const text = String(rawText || '').trim();
    if (!text) return;
    const isUK = String(accent).toLowerCase() === 'uk';
    const isSentence = isSentenceText(text);

    try {
      if ('speechSynthesis' in global) speechSynthesis.cancel();
    } catch (e) {}

    // Câu dài hoặc Shadowing: phát ngay tức thì bằng giọng bản xứ Apple/Google (<20ms)
    if (isSentence || isShadowing) {
      speakExpressiveUtterance(text, { accent: isUK ? 'uk' : 'us', shadowing: isShadowing });
      return;
    }

    // Từ đơn: dùng audio Cambridge MP3 chuẩn từ điển
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
      const isSentence = isSentenceText(val);

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
          shadowBtn.title = 'Luyện Shadowing: Ngắt nhịp rõ ràng & trọng âm câu để nhại theo';
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

  /* ===== 2. GIẢI PHẪU & GIẢI NGHĨA THÀNH TỐ Y KHOA (TIỀN TỐ • GỐC TỪ • HẬU TỐ) ===== */
  const MEDICAL_DICT = {
    prefix: {
      a: { en: 'without, absent, lack of', vn: 'không có, vắng mặt, mất, vô' },
      an: { en: 'without, lack of', vn: 'không có, thiếu' },
      anti: { en: 'against, opposing, counteracting', vn: 'chống lại, kháng, ngăn ngừa' },
      auto: { en: 'self, same', vn: 'tự thân, tự miễn' },
      brady: { en: 'abnormally slow', vn: 'chậm bất thường (nhịp chậm)' },
      tachy: { en: 'abnormally rapid, fast', vn: 'nhanh bất thường (nhịp nhanh)' },
      dys: { en: 'difficult, painful, abnormal, disordered', vn: 'khó khăn, đau đớn, rối loạn, bất thường' },
      eu: { en: 'good, normal, well', vn: 'tốt, bình thường' },
      hyper: { en: 'excessive, above normal, high', vn: 'quá mức, tăng cao, ưu' },
      hypo: { en: 'deficient, below normal, low', vn: 'dưới mức, giảm, hạ, nhược' },
      endo: { en: 'in, within, inside', vn: 'bên trong, nội' },
      intra: { en: 'within, inside', vn: 'bên trong, nội' },
      exo: { en: 'outside, outward', vn: 'bên ngoài, ngoại' },
      extra: { en: 'outside, beyond', vn: 'bên ngoài, ngoài' },
      inter: { en: 'between, among', vn: 'ở giữa, gian' },
      peri: { en: 'around, surrounding', vn: 'xung quanh, màng ngoài' },
      poly: { en: 'many, much, excessive', vn: 'nhiều, đa' },
      oligo: { en: 'few, scanty, little', vn: 'ít, thiểu' },
      pan: { en: 'all, entire', vn: 'toàn bộ, toàn thể' },
      post: { en: 'after, behind', vn: 'sau, sau phẫu thuật/sinh' },
      pre: { en: 'before, in front of', vn: 'trước, tiền' },
      pro: { en: 'before, forward', vn: 'trước, tiến tới' },
      sub: { en: 'under, below, beneath', vn: 'dưới, cận' },
      super: { en: 'above, excessive, beyond', vn: 'trên, vượt mức' },
      supra: { en: 'above, over', vn: 'phía trên' },
      syn: { en: 'together, joined, with', vn: 'cùng nhau, dính, hợp' },
      sym: { en: 'together, with', vn: 'cùng nhau, dính' },
      hemi: { en: 'half, one side', vn: 'một nửa, bán phần' },
      micro: { en: 'small, microscopic', vn: 'nhỏ, vi mô' },
      macro: { en: 'large, long', vn: 'lớn, đại mô' },
      pseudo: { en: 'false, deceptive', vn: 'giả, ngụy' },
    },
    root: {
      append: { en: 'appendix', vn: 'ruột thừa' },
      appendic: { en: 'appendix', vn: 'ruột thừa' },
      card: { en: 'heart', vn: 'tim, tâm' },
      cardi: { en: 'heart', vn: 'tim, tâm' },
      derm: { en: 'skin', vn: 'da, bì' },
      dermat: { en: 'skin', vn: 'da, bì' },
      encephal: { en: 'brain', vn: 'não bộ' },
      gastr: { en: 'stomach', vn: 'dạ dày, vị' },
      haem: { en: 'blood', vn: 'máu, huyết' },
      hemat: { en: 'blood', vn: 'máu, huyết' },
      hepat: { en: 'liver', vn: 'gan' },
      nephr: { en: 'kidney', vn: 'thận' },
      ren: { en: 'kidney', vn: 'thận' },
      neur: { en: 'nerve, nervous system', vn: 'thần kinh' },
      oste: { en: 'bone', vn: 'xương, cốt' },
      pulmon: { en: 'lung', vn: 'phổi' },
      pneum: { en: 'lung, air, breath', vn: 'phổi, khí, hô hấp' },
      pneumon: { en: 'lung', vn: 'phổi' },
      arthr: { en: 'joint', vn: 'khớp' },
      cholecyst: { en: 'gallbladder', vn: 'túi mật' },
      chol: { en: 'bile, gall', vn: 'mật' },
      col: { en: 'colon, large intestine', vn: 'đại tràng, ruột già' },
      colon: { en: 'colon, large intestine', vn: 'đại tràng' },
      enter: { en: 'intestines (small intestine)', vn: 'ruột, ruột non' },
      cyst: { en: 'urinary bladder, fluid sac', vn: 'bàng quang, túi dịch' },
      phleb: { en: 'vein', vn: 'tĩnh mạch' },
      ven: { en: 'vein', vn: 'tĩnh mạch' },
      arteri: { en: 'artery', vn: 'động mạch' },
      my: { en: 'muscle', vn: 'cơ, bắp thịt' },
      myo: { en: 'muscle', vn: 'cơ' },
      muscul: { en: 'muscle', vn: 'cơ' },
      hist: { en: 'tissue', vn: 'mô tế bào' },
      cyt: { en: 'cell', vn: 'tế bào' },
      path: { en: 'disease, suffering', vn: 'bệnh lý, tổn thương' },
      carcin: { en: 'cancer, malignant tumor', vn: 'ung thư' },
      onc: { en: 'tumor, mass', vn: 'khối u, bướu' },
      glyc: { en: 'sugar, glucose', vn: 'đường, glucose' },
      gluc: { en: 'sugar, glucose', vn: 'đường' },
      lip: { en: 'fat, lipid', vn: 'chất béo, mỡ, lipid' },
      thorac: { en: 'chest, thorax', vn: 'lồng ngực' },
      lapar: { en: 'abdomen, abdominal wall', vn: 'ổ bụng, thành bụng' },
      rhin: { en: 'nose', vn: 'mũi' },
      nas: { en: 'nose', vn: 'mũi' },
      ot: { en: 'ear', vn: 'tai' },
      ophthalm: { en: 'eye', vn: 'mắt, nhãn khoa' },
      ocul: { en: 'eye', vn: 'mắt' },
      laryng: { en: 'larynx, voice box', vn: 'thanh quản' },
      trache: { en: 'trachea, windpipe', vn: 'khí quản' },
      bronch: { en: 'bronchus, bronchial tube', vn: 'phế quản' },
      angi: { en: 'blood vessel, lymph vessel', vn: 'mạch máu' },
      vas: { en: 'duct, vessel', vn: 'mạch, ống dẫn' },
      splen: { en: 'spleen', vn: 'lách' },
      thromb: { en: 'clot, blood clot', vn: 'cục máu đông, huyết khối' },
      mening: { en: 'meninges (brain coverings)', vn: 'màng não' },
      myel: { en: 'spinal cord, bone marrow', vn: 'tủy sống, tủy xương' },
      irritat: { en: 'irritate, inflame, provoke', vn: 'kích thích, làm rát ngứa, kích ứng' },
    },
    suffix: {
      itis: { en: 'inflammation', vn: 'tình trạng viêm, sưng viêm' },
      ectomy: { en: 'surgical removal, excision', vn: 'phẫu thuật cắt bỏ' },
      tomy: { en: 'surgical incision, cutting into', vn: 'phẫu thuật rạch, mở' },
      stomy: { en: 'surgical creation of an opening', vn: 'phẫu thuật mở thông ra ngoài' },
      scopy: { en: 'visual examination with an instrument', vn: 'thủ thuật nội soi quan sát' },
      scope: { en: 'instrument for visual examination', vn: 'dụng cụ nội soi' },
      graphy: { en: 'process of recording / imaging', vn: 'kỹ thuật chụp / ghi hình chẩn đoán' },
      gram: { en: 'record, picture, image', vn: 'bản ghi, hình ảnh chụp' },
      metry: { en: 'process of measuring', vn: 'phép đo lường' },
      meter: { en: 'instrument for measuring', vn: 'dụng cụ đo' },
      pathy: { en: 'disease, abnormal condition', vn: 'bệnh lý, tổn thương bệnh' },
      megaly: { en: 'abnormal enlargement', vn: 'phì đại, to bất thường' },
      algia: { en: 'pain, painful condition', vn: 'cơn đau, cảm giác đau đớn' },
      dynia: { en: 'pain', vn: 'đau' },
      emia: { en: 'blood condition', vn: 'tình trạng trong máu, huyết' },
      oma: { en: 'tumor, mass, swelling', vn: 'khối u, bướu' },
      lysis: { en: 'breakdown, destruction', vn: 'tiêu giải, ly giải, phá hủy' },
      plasty: { en: 'surgical repair, reconstruction', vn: 'phẫu thuật tạo hình, phục hồi' },
      stenosis: { en: 'abnormal narrowing, stricture', vn: 'tình trạng hẹp bất thường' },
      malacia: { en: 'abnormal softening of tissue', vn: 'nhuyễn, mềm mô / xương' },
      penia: { en: 'deficiency, reduction', vn: 'sự suy giảm, thiếu hụt' },
      sclerosis: { en: 'abnormal hardening of tissue', vn: 'tình trạng xơ hóa, xơ cứng' },
      rrhea: { en: 'flow, discharge', vn: 'chảy dịch, xuất tiết' },
      rrhage: { en: 'excessive burst of flow, bleeding', vn: 'xuất huyết, chảy máu ồ ạt' },
      rrhagia: { en: 'excessive bleeding', vn: 'chảy máu dữ dội' },
      pexy: { en: 'surgical fixation', vn: 'phẫu thuật cố định' },
      centesis: { en: 'surgical puncture to aspirate fluid', vn: 'chọc dò hút dịch' },
      tripsy: { en: 'crushing, pulverizing', vn: 'thủ thuật tán, nghiền (tán sỏi)' },
      genesis: { en: 'origin, development, production', vn: 'sự sinh ra, phát sinh, tạo thành' },
      spasm: { en: 'sudden involuntary contraction', vn: 'cơn co thắt cơ đột ngột' },
      ion: { en: 'process, state, condition', vn: 'quá trình, tình trạng, trạng thái' },
    },
  };

  function cleanMorpheme(str) {
    return String(str || '')
      .replace(/[()\-–—\/]/g, '')
      .trim()
      .toLowerCase();
  }

  function resolveMorphemeMeaning(type, rawStr) {
    if (!rawStr) return null;
    const str = String(rawStr).trim();
    if (!str || /^(không có|none|n\/a|—|-)$/i.test(str)) return null;

    const matchInline = str.match(/^([a-zA-Z\s\-–—\/]+)(?:\(([^)]+)\))?$/);
    const element = cleanMorpheme(matchInline ? matchInline[1] : str);
    const userNote = matchInline && matchInline[2] ? matchInline[2].trim() : '';

    const dict = MEDICAL_DICT[type] || {};
    let found = dict[element];
    if (!found) {
      const stripped = element.replace(/o$/, '');
      if (dict[stripped]) found = dict[stripped];
    }

    const en = found ? found.en : userNote || 'Medical term element';
    const vn = found ? found.vn : userNote || 'Thành tố thuật ngữ Y khoa';

    return {
      element: (type === 'prefix' ? '' : type === 'suffix' ? '-' : '') + (matchInline ? matchInline[1].trim() : str),
      en,
      vn,
    };
  }

  function autoDecomposeWord(word) {
    const w = String(word || '').toLowerCase().trim();
    if (!w || w.length < 5) return null;

    let prefix = null;
    let root = null;
    let suffix = null;

    const suffixes = Object.keys(MEDICAL_DICT.suffix).sort((a, b) => b.length - a.length);
    let rem = w;
    for (const s of suffixes) {
      if (rem.endsWith(s) && rem.length > s.length + 3) {
        suffix = { element: '-' + s, ...MEDICAL_DICT.suffix[s] };
        rem = rem.slice(0, -s.length);
        if (rem.endsWith('o') || rem.endsWith('i')) rem = rem.slice(0, -1);
        break;
      }
    }

    const prefixes = Object.keys(MEDICAL_DICT.prefix).sort((a, b) => b.length - a.length);
    for (const p of prefixes) {
      if (rem.startsWith(p) && rem.length > p.length + 3) {
        prefix = { element: p + '-', ...MEDICAL_DICT.prefix[p] };
        rem = rem.slice(p.length);
        break;
      }
    }

    const roots = Object.keys(MEDICAL_DICT.root).sort((a, b) => b.length - a.length);
    for (const r of roots) {
      if (rem.includes(r) || r.includes(rem)) {
        root = { element: r, ...MEDICAL_DICT.root[r] };
        break;
      }
    }

    if (!root && rem.length >= 3) {
      root = { element: rem, en: 'core anatomical root', vn: 'gốc từ giải phẫu' };
    }

    if (prefix || suffix || (root && MEDICAL_DICT.root[cleanMorpheme(root.element)])) {
      return { prefix, root, combining: '-o-', suffix };
    }
    return null;
  }

  function buildMedicalBreakdownHTML(wordObj) {
    if (!wordObj) return '';
    const m = wordObj.medAnatomy || {};
    let prefix = resolveMorphemeMeaning('prefix', m.prefix);
    let root = resolveMorphemeMeaning('root', m.root);
    let suffix = resolveMorphemeMeaning('suffix', m.suffix);

    if (!prefix && !root && !suffix) {
      const auto = autoDecomposeWord(wordObj.word);
      if (auto) {
        prefix = auto.prefix;
        root = auto.root;
        suffix = auto.suffix;
      }
    }

    if (!prefix && !root && !suffix) return '';

    const partsHTML = [];
    if (prefix) {
      partsHTML.push(`
        <div class="p-2 rounded-lg bg-sky/10 border border-sky/30">
          <div class="flex items-center justify-between text-[11px] font-mono">
            <span class="text-sky font-bold">1. Tiền tố (Prefix)</span>
            <span class="font-bold text-fg bg-line/40 px-1.5 py-0.5 rounded">${escHTML(prefix.element)}</span>
          </div>
          <p class="text-xs font-semibold text-fg mt-1">🇻🇳 ${escHTML(prefix.vn)}</p>
          <p class="text-[11px] text-mute italic">🇬🇧 ${escHTML(prefix.en)}</p>
        </div>`);
    }

    if (root) {
      partsHTML.push(`
        <div class="p-2 rounded-lg bg-bad/10 border border-bad/30">
          <div class="flex items-center justify-between text-[11px] font-mono">
            <span class="text-bad font-bold">2. Gốc từ (Root)</span>
            <span class="font-bold text-fg bg-line/40 px-1.5 py-0.5 rounded">${escHTML(root.element)}</span>
          </div>
          <p class="text-xs font-semibold text-fg mt-1">🇻🇳 ${escHTML(root.vn)}</p>
          <p class="text-[11px] text-mute italic">🇬🇧 ${escHTML(root.en)}</p>
        </div>`);
    }

    if (suffix) {
      partsHTML.push(`
        <div class="p-2 rounded-lg bg-ok/10 border border-ok/30">
          <div class="flex items-center justify-between text-[11px] font-mono">
            <span class="text-ok font-bold">3. Hậu tố (Suffix)</span>
            <span class="font-bold text-fg bg-line/40 px-1.5 py-0.5 rounded">${escHTML(suffix.element)}</span>
          </div>
          <p class="text-xs font-semibold text-fg mt-1">🇻🇳 ${escHTML(suffix.vn)}</p>
          <p class="text-[11px] text-mute italic">🇬🇧 ${escHTML(suffix.en)}</p>
        </div>`);
    }

    const synthesis = [root?.vn, suffix?.vn, prefix?.vn].filter(Boolean).join(' + ');

    return `
      <details class="inset p-3 rounded-xl border border-bad/35 bg-bad/5 space-y-2 mt-3 select-none" open>
        <summary class="text-xs font-bold text-bad cursor-pointer flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <span>🧬</span> <span>Giải phẫu thành tố Y khoa: <b>${escHTML(wordObj.word)}</b></span>
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-bad/20 text-bad hover:bg-bad/30">Ẩn / Hiện ▾</span>
        </summary>
        <div class="grid sm:grid-cols-${partsHTML.length > 2 ? '3' : '2'} gap-2 pt-2">
          ${partsHTML.join('')}
        </div>
        ${synthesis ? `<div class="p-2 rounded bg-app/80 text-[11px] border border-line/50"><span class="text-mute">Công thức nghĩa: </span><b class="text-fg">${escHTML(synthesis)}</b> → <span class="text-ok font-bold">${escHTML(wordObj.meaning || '')}</span></div>` : ''}
      </details>
    `;
  }

  function injectQuizMedicalBreakdown() {
    const quizCard = document.getElementById('quiz');
    if (!quizCard) return;

    const resultBox = quizCard.querySelector('.inset:has(b.text-ok), .inset:has(b.text-bad)');
    if (!resultBox || resultBox.querySelector('[data-med-breakdown]')) return;

    let currentWord = null;
    if (typeof global.S !== 'undefined' && global.S?.quiz?.w) {
      currentWord = global.S.quiz.w;
    } else if (typeof window.S !== 'undefined' && window.S?.quiz?.w) {
      currentWord = window.S.quiz.w;
    }

    if (!currentWord) return;

    const html = buildMedicalBreakdownHTML(currentWord);
    if (!html) return;

    const wrap = document.createElement('div');
    wrap.setAttribute('data-med-breakdown', '1');
    wrap.innerHTML = html;

    resultBox.parentNode.insertBefore(wrap, resultBox.nextSibling);
  }

  /* ===== 3. ĐỒNG BỘ 2 THIẾT BỊ BẰNG MÃ 6 SỐ (KHÔNG TẢI FILE) ===== */
  function getMasterPayload() {
    try {
      const raw = localStorage.getItem(LS_VAULT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    if (typeof global.words !== 'undefined') {
      return {
        words: global.words || [],
        mistakes: global.mistakes || [],
        topics: global.topics || [],
        updatedAt: Date.now(),
      };
    }
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
      const existingWordSet = new Set((current.words || []).map((w) => normKey(w.word)));
      (payload.words || []).forEach((nw) => {
        if (!existingWordSet.has(normKey(nw.word))) {
          current.words.push(nw);
          existingWordSet.add(normKey(nw.word));
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
        if (!mistSet.has(nm.sentence)) current.mistakes.push(nm);
      });
    }

    current.updatedAt = Date.now();
    localStorage.setItem(LS_VAULT_KEY, JSON.stringify(current));

    if (typeof global.load === 'function') global.load();
    if (typeof global.renderVault === 'function') global.renderVault();
    if (typeof global.renderStats === 'function') global.renderStats();
    if (typeof global.renderTopics === 'function') global.renderTopics();

    return current;
  }

  async function pushToCloudSync(customPin = '') {
    const payload = getMasterPayload();
    if (!payload || !payload.words || !payload.words.length) {
      throw new Error('Kho từ vựng đang rỗng, không có dữ liệu để đồng bộ.');
    }

    let pin = (customPin || localStorage.getItem(LS_SYNC_PIN_KEY) || '').trim();
    if (!pin) {
      pin = String(Math.floor(100000 + Math.random() * 900000));
    }

    try {
      const resp = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pin, data: payload, deviceInfo: navigator.userAgent }),
      });
      if (resp.ok) {
        const j = await resp.json();
        const code = j.code || pin;
        localStorage.setItem(LS_SYNC_PIN_KEY, code);
        return { success: true, code, totalWords: payload.words.length };
      }
    } catch (e) {}

    localStorage.setItem(LS_SYNC_PIN_KEY, pin);
    return { success: true, code: pin, totalWords: payload.words.length, localOnly: true };
  }

  async function pullFromCloudSync(pinCode, mode = 'merge') {
    const code = String(pinCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) throw new Error('Vui lòng nhập mã đồng bộ 6 số.');

    let fetchedData = null;
    try {
      const resp = await fetch('/api/sync/pull/' + encodeURIComponent(code));
      if (resp.ok) {
        const j = await resp.json();
        if (j && j.data) fetchedData = j.data;
      }
    } catch (e) {}

    if (!fetchedData) {
      throw new Error(`Không thể kết nối hoặc không tìm thấy mã "${code}". Vui lòng tạo mã mới ở Thiết bị 1.`);
    }

    const merged = applyMasterPayload(fetchedData, mode);
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
              <h3 class="font-bold text-lg">Đồng bộ 2 thiết bị tức thì</h3>
              <p class="text-xs text-mute">Chuyển dữ liệu giữa iPad, iPhone, máy tính không cần tải hay gửi file.</p>
            </div>
          </div>
          <button class="btn" data-a="close" data-v="m-sync" aria-label="Đóng"><i class="ph ph-x"></i></button>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <!-- BÊN GỬI: MÁY 1 (CÓ DỮ LIỆU) -->
          <div class="inset p-4 space-y-3 border-pri/40 bg-pri/5 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-pri uppercase tracking-wider">📤 Thiết bị 1 (Có dữ liệu)</span>
              <span class="text-[11px] font-mono text-ok">${wordCount} từ</span>
            </div>
            <p class="text-xs text-mute">Tải toàn bộ từ vựng & trạm sửa sai lên đám mây và nhận mã 6 số.</p>
            <button id="sync-push-btn" class="btn btn-pri w-full justify-center text-xs py-2">
              ☁️ Tải lên & Tạo mã 6 số
            </button>
            <div id="sync-push-result" class="hidden inset p-2.5 text-center space-y-1">
              <div class="text-[11px] text-mute">Mã đồng bộ của bạn:</div>
              <div id="sync-pin-display" class="text-2xl font-black font-mono tracking-widest text-warn select-all">------</div>
              <div class="text-[10px] text-ok">👉 Hãy mở Thiết bị 2 và nhập mã này vào ô bên cạnh.</div>
            </div>
          </div>

          <!-- BÊN NHẬN: MÁY 2 (MÁY MỚI CẦN ĐỒNG BỘ) -->
          <div class="inset p-4 space-y-3 border-ok/40 bg-ok/5 rounded-xl">
            <span class="text-xs font-bold text-ok uppercase tracking-wider">📥 Thiết bị 2 (Nhận dữ liệu)</span>
            <p class="text-xs text-mute">Nhập mã 6 số từ Thiết bị 1 để nạp toàn bộ dữ liệu vào máy này.</p>
            <input id="sync-pull-code" class="inp font-mono text-center text-lg uppercase font-bold tracking-widest" placeholder="VD: 748291" value="${savedPin}">
            <div class="flex gap-2">
              <button id="sync-pull-btn" class="btn btn-ok flex-1 justify-center text-xs py-2">
                📥 Đồng bộ ngay
              </button>
            </div>
            <div class="flex items-center gap-1.5 text-[11px] text-mute">
              <input type="checkbox" id="sync-replace-check" class="rounded">
              <label for="sync-replace-check">Ghi đè hoàn toàn (xóa từ cũ ở máy 2)</label>
            </div>
          </div>
        </div>

        <div id="sync-status-msg" class="text-xs font-medium text-center"></div>
      </div>
    `;

    const pushBtn = modal.querySelector('#sync-push-btn');
    const pullBtn = modal.querySelector('#sync-pull-btn');
    const pushResult = modal.querySelector('#sync-push-result');
    const pinDisplay = modal.querySelector('#sync-pin-display');
    const codeInp = modal.querySelector('#sync-pull-code');
    const replaceCheck = modal.querySelector('#sync-replace-check');
    const statusMsg = modal.querySelector('#sync-status-msg');

    pushBtn.addEventListener('click', async () => {
      pushBtn.disabled = true;
      pushBtn.textContent = 'Đang tải lên...';
      try {
        const res = await pushToCloudSync();
        pinDisplay.textContent = res.code;
        pushResult.classList.remove('hidden');
        statusMsg.innerHTML = `<span class="text-ok">✓ Đã lưu trữ ${res.totalWords} từ vựng lên đám mây. Mã PIN: <b>${res.code}</b></span>`;
      } catch (err) {
        statusMsg.innerHTML = `<span class="text-bad">${escHTML(err.message)}</span>`;
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
      pullBtn.textContent = 'Đang nhận dữ liệu...';
      try {
        const mode = replaceCheck.checked ? 'replace' : 'merge';
        const res = await pullFromCloudSync(code, mode);
        statusMsg.innerHTML = `<span class="text-ok">🎉 Đồng bộ thành công! Hiện có ${res.totalWords} từ vựng trong kho.</span>`;
        notify('Đồng bộ thành công ' + res.totalWords + ' từ vựng!');
        setTimeout(() => modal.classList.remove('open'), 1200);
      } catch (err) {
        statusMsg.innerHTML = `<span class="text-bad">${escHTML(err.message)}</span>`;
      } finally {
        pullBtn.disabled = false;
        pullBtn.textContent = '📥 Đồng bộ ngay';
      }
    });

    modal.classList.add('open');
  }

  function injectSyncHeaderButton() {
    const headerBtns = document.querySelector('header .flex.items-center.gap-1\\.5');
    if (headerBtns && !document.getElementById('btn-sync-devices')) {
      const b = document.createElement('button');
      b.id = 'btn-sync-devices';
      b.className = 'btn border-pri/40 bg-pri/10 text-pri font-bold hover:brightness-110';
      b.title = 'Đồng bộ dữ liệu giữa 2 thiết bị (iPad, iPhone, PC) bằng mã 6 số';
      b.innerHTML = '<span>🔄</span><span class="hidden md:inline">Đồng bộ</span>';
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

  function initObserver() {
    upgradeSpeakerButtons();
    injectQuizMedicalBreakdown();
    injectSyncHeaderButton();
    if (typeof MutationObserver !== 'undefined' && document.body) {
      const obs = new MutationObserver(() => {
        upgradeSpeakerButtons();
        injectQuizMedicalBreakdown();
        injectSyncHeaderButton();
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
