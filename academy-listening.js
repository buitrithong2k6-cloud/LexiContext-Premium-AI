/**
 * LexiContext Academy — Studio Luyện Nghe & Luyện Nói 3-Trong-1 (academy-listening.js)
 * Tích hợp:
 * - Khung DOM Bền Vững (#studio-persistent-shell): Giữ nguyên 100% <iframe> YouTube không bao giờ bị tải lại khi bấm đổi câu, bấm từ, bật/tắt IPA hoặc thu âm
 * - Đồng bộ Kép YouTube (Dual-Bridge postMessage + YT.Player API + Nội suy 50ms): Tự động chạy chữ Karaoke theo từng từ và tự nhảy câu phụ đề theo thời gian thực của Video
 * - Bấm vào Câu (#1..#N) hoặc Bấm vào Từ bất kỳ: Tua ngay Video YouTube / Audio ELLLO người thật đến đúng giây của câu hoặc từ đó
 * - 3 Chế độ liên thông: 🗣️ Shadowing (Luyện nói) · ⌨️ Dictation (Chép chính tả) · 🎧 Nghe hiểu VSTEP (Bộ câu hỏi Tiếng Anh chuẩn đề thi)
 * - Ghi âm giọng nói thật Đa Thiết Bị (iPad/iPhone Safari, Android, PC), chấm thẻ từ Xanh ✓ / Vàng ▲ / Đỏ ✗ và AI nhận xét phát âm 4 mục
 */
(function (global) {
  'use strict';

  // Gộp từ điển IPA từ file dữ liệu độc lập (/listening-lessons-data.js) và từ điển nội bộ
  const EXTRA_WORD_DICT = {
    easy: { ipa: 'ˈiː.zi', pos: 'adj', vi: 'dễ dàng, thoải mái', ex: 'The first part of the exam was easy.' },
    english: { ipa: 'ˈɪŋ.ɡlɪʃ', pos: 'noun', vi: 'tiếng Anh, người Anh', ex: 'She speaks fluent English.' },
    conversations: { ipa: 'ˌkɑːn.vɚˈseɪ.ʃənz', pos: 'noun', vi: 'các cuộc hội thoại, trò chuyện', ex: 'Easy English conversations help you practice daily.' },
    conversation: { ipa: 'ˌkɑːn.vɚˈseɪ.ʃən', pos: 'noun', vi: 'cuộc hội thoại', ex: 'We had a long conversation.' },
    often: { ipa: 'ˈɔː.fən', pos: 'adv', vi: 'thường xuyên', ex: 'How often do you go swimming?' },
    swimming: { ipa: 'ˈswɪm.ɪŋ', pos: 'noun', vi: 'bơi lội', ex: 'Swimming is great for cardiovascular health.' },
    buli: { ipa: 'ˈbuː.li', pos: 'noun', vi: 'Buli (tên riêng)', ex: 'Hello, Buli!' },
    sian: { ipa: 'ʃɑːn', pos: 'noun', vi: 'Sian (tên riêng, đọc là /ʃɑːn/)', ex: 'Hi Sian! What is your daily routine?' },
    georgie: { ipa: 'ˈdʒɔːr.dʒi', pos: 'noun', vi: 'Georgie (tên riêng)', ex: 'Georgie goes to the gym twice a week.' },
    yogurt: { ipa: 'ˈjoʊ.ɡɚt', pos: 'noun', vi: 'sữa chua', ex: 'Yogurt is good for digestion.' },
    emails: { ipa: 'ˈiː.meɪlz', pos: 'noun', vi: 'thư điện tử (email)', ex: 'I reply to urgent emails every morning.' },
    twice: { ipa: 'twaɪs', pos: 'adv', vi: 'hai lần', ex: 'Take one tablet twice a day.' },
    stay: { ipa: 'steɪ', pos: 'verb', vi: 'duy trì, giữ, ở lại', ex: 'How do you stay healthy?' },
    long: { ipa: 'lɔːŋ', pos: 'adj/adv', vi: 'dài, bao lâu (how long)', ex: 'How long have you had this fever?' },
    experiencing: { ipa: 'ɪkˈspɪr.i.ən.sɪŋ', pos: 'verb', vi: 'trải qua, gặp phải (triệu chứng)', ex: 'Are you experiencing any dizziness?' },
    sharp: { ipa: 'ʃɑːrp', pos: 'adj', vi: 'nhói, sắc, dữ dội (đau)', ex: 'He felt a sharp pain in his abdomen.' },
    moved: { ipa: 'muːvd', pos: 'verb', vi: 'di chuyển, lan xuống', ex: 'The pain moved to the lower right side.' },
    side: { ipa: 'saɪd', pos: 'noun', vi: 'bên, phía, vùng', ex: 'Does it hurt on the right side?' },
    understand: { ipa: 'ˌʌn.dɚˈstænd', pos: 'verb', vi: 'hiểu, thông cảm', ex: 'I understand you are in pain.' },
    need: { ipa: 'niːd', pos: 'verb', vi: 'cần phải', ex: 'We need to run a quick blood test.' },
    run: { ipa: 'rʌn', pos: 'verb', vi: 'tiến hành (xét nghiệm), chạy', ex: 'We will run a blood test immediately.' },
    blood: { ipa: 'blʌd', pos: 'noun', vi: 'máu, huyết', ex: 'White blood cell count was elevated.' },
    test: { ipa: 'test', pos: 'noun', vi: 'xét nghiệm, bài kiểm tra', ex: 'The blood test results are ready.' },
    tablet: { ipa: 'ˈtæb.lət', pos: 'noun', vi: 'viên thuốc nén', ex: 'Swallow the tablet with a glass of water.' },
    meals: { ipa: 'miːlz', pos: 'noun', vi: 'các bữa ăn', ex: 'Take the medication after meals.' },
    getting: { ipa: 'ˈɡet.ɪŋ', pos: 'verb', vi: 'việc có được, nhận được', ex: 'Getting enough sleep is vital.' },
    enough: { ipa: 'ɪˈnʌf', pos: 'det/adv', vi: 'đủ, đầy đủ', ex: 'Are you getting enough sleep?' },
    regular: { ipa: 'ˈreɡ.jə.lɚ', pos: 'adj', vi: 'đều đặn, thường xuyên', ex: 'Regular physical activity improves mood.' },
    significantly: { ipa: 'sɪɡˈnɪf.ɪ.kənt.li', pos: 'adv', vi: 'một cách đáng kể, rõ rệt', ex: 'His condition improved significantly.' },
    immune: { ipa: 'ɪˈmjuːn', pos: 'adj', vi: 'miễn dịch', ex: 'A strong immune system fights infections.' },
    system: { ipa: 'ˈsɪs.təm', pos: 'noun', vi: 'hệ thống, hệ cơ quan', ex: 'The immune system protects the body.' },
    delayed: { ipa: 'dɪˈleɪd', pos: 'adj/verb', vi: 'bị trì hoãn, chậm trễ', ex: 'Delayed diagnosis can cause complications.' },
    diagnosis: { ipa: 'ˌdaɪ.əɡˈnoʊ.sɪs', pos: 'noun', vi: 'sự chẩn đoán bệnh', ex: 'Early diagnosis is critical for recovery.' },
    acute: { ipa: 'əˈkjuːt', pos: 'adj', vi: 'cấp tính', ex: 'The patient has acute appendicitis.' },
    appendicitis: { ipa: 'əˌpen.dɪˈsaɪ.tɪs', pos: 'noun', vi: 'viêm ruột thừa', ex: 'Acute appendicitis requires prompt surgery.' },
    lead: { ipa: 'liːd', pos: 'verb', vi: 'dẫn đến (lead to)', ex: 'Untreated infection can lead to sepsis.' },
    generalized: { ipa: 'ˈdʒen.ər.ə.laɪzd', pos: 'adj', vi: 'toàn thể, lan tỏa khắp ổ bụng', ex: 'Generalized abdominal tenderness was noted.' },
    peritonitis: { ipa: 'ˌper.ɪ.təˈnaɪ.tɪs', pos: 'noun', vi: 'viêm phúc mạc', ex: 'Peritonitis requires urgent antibiotic therapy.' },
    examinations: { ipa: 'ɪɡˌzæm.ɪˈneɪ.ʃənz', pos: 'noun', vi: 'các cuộc thăm khám trực tiếp', ex: 'Telemedicine cannot replace physical examinations.' },
    revealed: { ipa: 'rɪˈviːld', pos: 'verb', vi: 'cho thấy, phát hiện ra', ex: 'The scan revealed localized inflammation.' },
    localized: { ipa: 'ˈloʊ.kə.laɪzd', pos: 'adj', vi: 'khu trú tại một vùng', ex: 'Localized pain in the right lower quadrant.' },
    positive: { ipa: 'ˈpɑː.zə.tɪv', pos: 'adj', vi: 'dương tính, tích cực', ex: 'The patient had positive rebound tenderness.' },
    requires: { ipa: 'rɪˈkwaɪɚz', pos: 'verb', vi: 'đòi hỏi, yêu cầu bắt buộc', ex: 'This condition requires immediate surgery.' },
    immediate: { ipa: 'ɪˈmiː.di.ət', pos: 'adj', vi: 'ngay lập tức, cấp cứu', ex: 'Immediate surgical consultation is needed.' },
    offers: { ipa: 'ˈɔː.fɚz', pos: 'verb', vi: 'mang lại, cung cấp', ex: 'Remote monitoring offers great flexibility.' },
    unprecedented: { ipa: 'ʌnˈpres.ɪ.den.tɪd', pos: 'adj', vi: 'chưa từng có tiền lệ', ex: 'Technology offers unprecedented convenience.' },
    convenience: { ipa: 'kənˈviː.ni.əns', pos: 'noun', vi: 'sự tiện lợi, thuận tiện', ex: 'Patients appreciate the convenience of online booking.' },
    entirely: { ipa: 'ɪnˈtaɪr.li', pos: 'adv', vi: 'hoàn toàn, tuyệt đối', ex: 'Symptoms have not entirely disappeared.' },
    replace: { ipa: 'rɪˈpleɪs', pos: 'verb', vi: 'thay thế', ex: 'AI tools assist doctors rather than replace them.' },
    overuse: { ipa: 'ˌoʊ.vɚˈjuːs', pos: 'noun', vi: 'sự lạm dụng, dùng quá mức', ex: 'The overuse of antibiotics is dangerous.' },
    'broad-spectrum': { ipa: 'ˌbrɔːdˈspek.trəm', pos: 'adj', vi: 'phổ rộng (kháng sinh)', ex: 'Broad-spectrum antibiotics target many bacteria.' },
    accelerated: { ipa: 'əkˈsel.ə.reɪ.tɪd', pos: 'verb', vi: 'đẩy nhanh, làm tăng tốc', ex: 'Misuse has accelerated drug resistance.' },
    emergence: { ipa: 'ɪˈmɜːr.dʒəns', pos: 'noun', vi: 'sự xuất hiện, sự nổi lên', ex: 'The emergence of new bacterial strains.' },
    'drug-resistant': { ipa: 'ˌdrʌɡ.rɪˈzɪs.tənt', pos: 'adj', vi: 'kháng thuốc', ex: 'Drug-resistant infections are harder to treat.' }
  };

  const liveIpaCache = {};
  const pendingIpaFetches = new Set();

  function getMergedWordDict() {
    const ext = (global.LEXI_LISTENING_DATA && global.LEXI_LISTENING_DATA.WORD_DICT) || {};
    return Object.assign({}, EXTRA_WORD_DICT, ext, liveIpaCache);
  }

  // Chuẩn hóa danh sách bài học từ /listening-lessons-data.js
  function getLessonsForLevel(lv) {
    const dataObj = global.LEXI_LISTENING_DATA || {};
    const rawList = dataObj[lv] || dataObj.B1 || [];
    return rawList.map((item) => {
      const rawSegs = item.segments || item.transcript || [];
      const segments = rawSegs.map((s) => ({
        text: String(s.text || s.en || '').trim(),
        vi: String(s.vi || '').trim(),
        start: Number(s.start) || 0,
        end: Number(s.end) || 6,
        speaker: s.speaker || '',
        ipaNote:
          s.ipaNote ||
          'Nghe kỹ giọng người thật trong Video/Audio hoặc bấm "🔊 Nghe US" / "Tách cụm" để luyện nhịp thở và nối âm tự nhiên.'
      }));
      const vstepQuestions = Array.isArray(item.vstepQuestions)
        ? item.vstepQuestions
        : item.mcq
        ? [item.mcq]
        : [];
      return {
        id: item.id,
        category: item.topic || item.category || `VSTEP ${lv}`,
        title: item.title,
        youtubeId: item.youtubeId || '',
        audioUrl: item.audioUrl || '',
        sourceLabel: item.source || item.sourceLabel || `VSTEP ${lv} Studio`,
        duration: item.duration || '',
        segments,
        vstepQuestions,
        speakingPrompt: item.speakingPrompt || {
          question: `VSTEP Speaking (${lv}): Summarize the main ideas of "${item.title}" and share your personal experience on this topic.`,
          hintVi:
            'Gợi ý: Tóm tắt 2-3 ý chính bạn vừa nghe được từ bài học, sau đó liên hệ với thói quen hoặc trải nghiệm thực tế của bản thân.'
        }
      };
    });
  }

  // Trạng thái nội bộ của Studio
  let curLessonIdx = 0;
  let curSegIdx = 0;
  let activeLevel = 'B1';
  let activeAppState = null;
  let studioMode = 'shadowing'; // 'shadowing' | 'dictation' | 'vstep'
  let mediaTab = 'video'; // 'video' | 'audio'
  let leftSubTab = 'subtitles'; // 'subtitles' | 'guide'
  let showIPA = true;
  let showTrans = true;
  let showLeftSubs = true;
  let loopSegment = false;
  let autoAdvanceSubtitles = false; // Mặc định: false = Tự dừng ở cuối mỗi câu để luyện nói ngay; true = Phát liên tục cả bài & tự nhảy phụ đề
  let mergeNext = false; // Ghép câu kế tiếp (1/2 -> 2/2)
  let playbackSpeed = 1.0;

  // Trạng thái từ đang mở Popover tra nghĩa
  let activePopoverWord = null;

  // Trạng thái Ghi âm giọng thật & Nhận diện giọng nói Đa Thiết Bị
  let isRecording = false;
  let isAudioOnlyRecording = false;
  let recordSeconds = 0;
  let recordTimerId = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let speechRec = null;
  let liveTranscript = '';

  try {
    localStorage.removeItem('lexicontext_studio_custom_lessons_v1');
  } catch (e) {}

  function isSingleChannelMicDevice() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isAppleTouch =
      /iPad|iPhone|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafariEngine = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
    return isAppleTouch || isSafariEngine;
  }

  const recordingStore = {};
  const vstepAnswersStore = {};

  // ============================================================================
  // BỘ ĐIỀU KHIỂN ĐỒNG BỘ KÉP YOUTUBE (postMessage Bridge + YT.Player + Nội suy 50ms)
  // & TRÌNH PHÁT AUDIO GIỌNG NGƯỜI THẬT (ELLLO MP3 LƯU SẴN TRONG DỰ ÁN)
  // ============================================================================
  let ytApiLoaded = false;
  let ytPlayer = null;
  let ytPlayerReady = false;
  let currentYtVideoId = '';
  let ytBridgeListeningBound = false;
  let ytHandshakeTimerId = null;
  let seekLockUntil = 0; // Khóa chống xung đột khi người dùng vừa bấm chọn câu/từ để tua Video/Audio
  let ytState = {
    currentTime: 0,
    lastSyncTs: 0,
    playerState: -1 // 1 = playing, 2 = paused, 0 = ended
  };

  // Trình phát Audio Giọng Người Thật bền vững (dành cho các bài ELLLO có audioUrl)
  let humanAudioEl = null;
  let currentHumanAudioSrc = '';

  // Quản lý đồng bộ Karaoke & theo dõi câu thoại tự động
  let karaokeTimerId = null;
  let activeHighlightedWordIdx = -1;
  let activeSegmentEndTarget = null;

  function setupYouTubePostMessageListener() {
    if (ytBridgeListeningBound) return;
    ytBridgeListeningBound = true;

    global.addEventListener('message', (event) => {
      if (!event.origin || !/youtube(-nocookie)?\.com/i.test(event.origin)) return;
      let data = null;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }
      if (!data || typeof data !== 'object') return;

      if (data.event === 'onReady' || data.event === 'initialDelivery' || data.event === 'infoDelivery') {
        ytPlayerReady = true;
        if (ytHandshakeTimerId) {
          clearInterval(ytHandshakeTimerId);
          ytHandshakeTimerId = null;
        }
      }

      if (data.info && typeof data.info === 'object') {
        if (typeof data.info.currentTime === 'number') {
          // Khi vừa ra lệnh tua (seekTo), bỏ qua gói tin currentTime cũ trong 900ms đầu nếu lệch xa mốc đích
          if (
            Date.now() >= seekLockUntil ||
            Math.abs(data.info.currentTime - ytState.currentTime) < 1.2
          ) {
            ytState.currentTime = data.info.currentTime;
            ytState.lastSyncTs = Date.now();
          }
        }
        if (typeof data.info.playerState === 'number') {
          const prevState = ytState.playerState;
          ytState.playerState = data.info.playerState;
          ytState.lastSyncTs = Date.now();
          // Khi người dùng bấm nút Play trực tiếp trên khung Video YouTube -> kích hoạt đồng bộ chữ chạy ngay lập tức
          if (ytState.playerState === 1 && prevState !== 1) {
            ensureContinuousVideoKaraokeLoop();
          }
        }
      }
    });
  }

  function sendYtCommand(funcName, args) {
    const cleanArgs = Array.isArray(args) ? args : [];
    if (ytPlayer && ytPlayerReady && typeof ytPlayer[funcName] === 'function') {
      try {
        ytPlayer[funcName].apply(ytPlayer, cleanArgs);
      } catch (e) {}
    }
    const iframe = document.getElementById('studio-yt-player-instance');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: funcName,
            args: cleanArgs
          }),
          '*'
        );
      } catch (e) {}
    }
  }

  function sendYtListeningHandshake() {
    const iframe = document.getElementById('studio-yt-player-instance');
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'listening',
          id: 1,
          channel: 'widget'
        }),
        '*'
      );
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'addEventListener',
          args: ['onStateChange']
        }),
        '*'
      );
    } catch (e) {}
  }

  function getYouTubeCurrentTime() {
    if (Date.now() < seekLockUntil) {
      const elapsedLock = Math.max(0, (Date.now() - ytState.lastSyncTs) / 1000) * (playbackSpeed || 1);
      return ytState.currentTime + Math.min(0.4, elapsedLock);
    }
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.getCurrentTime === 'function') {
      try {
        const apiT = Number(ytPlayer.getCurrentTime());
        if (!isNaN(apiT) && apiT > 0) {
          ytState.currentTime = apiT;
          ytState.lastSyncTs = Date.now();
          return apiT;
        }
      } catch (e) {}
    }
    if (ytState.playerState === 1 && ytState.lastSyncTs > 0) {
      const elapsedSec = ((Date.now() - ytState.lastSyncTs) / 1000) * (playbackSpeed || 1);
      return ytState.currentTime + Math.min(0.6, Math.max(0, elapsedSec));
    }
    return ytState.currentTime || 0;
  }

  function getYouTubePlayerState() {
    if (Date.now() < seekLockUntil) {
      return 1;
    }
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.getPlayerState === 'function') {
      try {
        const st = ytPlayer.getPlayerState();
        if (typeof st === 'number') {
          ytState.playerState = st;
          return st;
        }
      } catch (e) {}
    }
    return ytState.playerState;
  }

  function pauseAllRealMedia() {
    sendYtCommand('pauseVideo', []);
    ytState.playerState = 2;
    if (humanAudioEl && !humanAudioEl.paused) {
      try {
        humanAudioEl.pause();
      } catch (e) {}
    }
  }

  function cleanWordToken(w) {
    return String(w || '')
      .toLowerCase()
      .replace(/^[^a-z0-9'-]+|[^a-z0-9'-]+$/g, '');
  }

  function stripSlashes(ipaStr) {
    return String(ipaStr || '')
      .trim()
      .replace(/^\/+|\/+$/g, '');
  }

  function fetchLiveIpaIfNeeded(cleanWord) {
    if (!cleanWord || cleanWord.length < 2 || pendingIpaFetches.has(cleanWord)) return;
    pendingIpaFetches.add(cleanWord);
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data) || !data[0]) return;
        const entry = data[0];
        let foundIpa = entry.phonetic || '';
        if (!foundIpa && Array.isArray(entry.phonetics)) {
          const pObj = entry.phonetics.find((p) => p && p.text);
          if (pObj) foundIpa = pObj.text;
        }
        const cleanIpa = stripSlashes(foundIpa);
        if (cleanIpa) {
          const firstMeaning =
            entry.meanings &&
            entry.meanings[0] &&
            entry.meanings[0].definitions &&
            entry.meanings[0].definitions[0]
              ? entry.meanings[0].definitions[0].definition
              : '';
          const pos = (entry.meanings && entry.meanings[0] && entry.meanings[0].partOfSpeech) || 'word';
          liveIpaCache[cleanWord] = {
            ipa: cleanIpa,
            pos,
            vi: firstMeaning || 'Bấm "🔊 US" để nghe phát âm chuẩn',
            ex: ''
          };
          document.querySelectorAll(`[data-studio-ipa-word="${cleanWord}"]`).forEach((el) => {
            el.textContent = `/${cleanIpa}/`;
          });
        }
      })
      .catch(() => {});
  }

  function lookupWordInfo(rawWord) {
    const clean = cleanWordToken(rawWord);
    if (!clean) {
      return { word: rawWord, ipa: '', pos: 'word', vi: '', ex: '' };
    }

    try {
      const rawVault = localStorage.getItem('lexicontext_master_db_unified');
      if (rawVault) {
        const db = JSON.parse(rawVault);
        const found = (db.words || []).find((w) => cleanWordToken(w.word) === clean);
        if (found && found.ipa) {
          return {
            word: found.word,
            ipa: stripSlashes(found.ipa),
            pos: found.pos || 'word',
            vi: found.meaning || '',
            ex: found.example || '',
            inVault: true
          };
        }
      }
    } catch (e) {}

    const dict = getMergedWordDict();
    const baseCandidates = [
      clean,
      clean.replace(/'s$/g, ''),
      clean.replace(/s$/g, ''),
      clean.replace(/ed$/g, ''),
      clean.replace(/ing$/g, '')
    ];

    for (let i = 0; i < baseCandidates.length; i++) {
      const cand = baseCandidates[i];
      if (cand && dict[cand]) {
        const d = dict[cand];
        let finalIpa = stripSlashes(d.ipa);
        if (i === 1 && !finalIpa.endsWith('z') && !finalIpa.endsWith('s')) finalIpa += 'z';
        return {
          word: clean,
          ipa: finalIpa,
          pos: d.pos || 'word',
          vi: d.vi || '',
          ex: d.ex || '',
          inVault: false
        };
      }
    }

    fetchLiveIpaIfNeeded(clean);
    const autoIpa = approximateEnglishIPA(clean);
    return {
      word: clean,
      ipa: autoIpa,
      pos: 'word',
      vi: 'Bấm "🔊 US" để nghe phát âm hoặc lưu vào Kho từ vựng',
      ex: '',
      inVault: false
    };
  }

  function approximateEnglishIPA(word) {
    if (!word) return '';
    let s = word.toLowerCase();
    s = s
      .replace(/tion$/g, 'ʃən')
      .replace(/sion$/g, 'ʒən')
      .replace(/ous$/g, 'əs')
      .replace(/itis$/g, 'ˈaɪ.tɪs')
      .replace(/ology$/g, 'ˈɑː.lə.dʒi')
      .replace(/ture$/g, 'tʃɚ')
      .replace(/ing$/g, 'ɪŋ')
      .replace(/ed$/g, 'd')
      .replace(/ly$/g, 'li')
      .replace(/ment$/g, 'mənt')
      .replace(/ness$/g, 'nəs')
      .replace(/ph/g, 'f')
      .replace(/sh/g, 'ʃ')
      .replace(/ch/g, 'tʃ')
      .replace(/th/g, 'θ')
      .replace(/ee/g, 'iː')
      .replace(/ea/g, 'iː')
      .replace(/oo/g, 'uː')
      .replace(/ou/g, 'aʊ')
      .replace(/ow/g, 'aʊ')
      .replace(/ai/g, 'eɪ')
      .replace(/ay/g, 'eɪ')
      .replace(/oa/g, 'oʊ')
      .replace(/igh/g, 'aɪ')
      .replace(/qu/g, 'kw')
      .replace(/j/g, 'dʒ')
      .replace(/y$/g, 'i')
      .replace(/c(?=[eiy])/g, 's')
      .replace(/c/g, 'k');
    return s;
  }

  // ============================================================================
  // HIỆU ỨNG SÓNG KARAOKE THỜI GIAN THỰC (WAVE KARAOKE HIGHLIGHTER)
  // Làm sáng rõ từng từ trên cả Khung thực hành cột phải + Thanh tiến trình + Danh sách phụ đề cột trái
  // ============================================================================
  function clearKaraokeTimer() {
    if (karaokeTimerId) {
      clearInterval(karaokeTimerId);
      karaokeTimerId = null;
    }
    activeSegmentEndTarget = null;
    resetKaraokeVisuals();
  }

  function resetKaraokeVisuals() {
    activeHighlightedWordIdx = -1;
    document.querySelectorAll('[data-studio-word-idx]').forEach((btn) => {
      btn.classList.remove(
        'bg-emerald-400',
        'text-slate-950',
        'ring-2',
        'ring-emerald-200',
        '-translate-y-1',
        'scale-110',
        'shadow-lg',
        'bg-emerald-500/15',
        'ring-1',
        'ring-emerald-500/30'
      );
      const wordSpan = btn.querySelector('[data-studio-word-text]');
      if (wordSpan) wordSpan.classList.remove('!text-slate-950', '!text-emerald-400');
      const ipaSpan = btn.querySelector('[data-studio-ipa-word]');
      if (ipaSpan) ipaSpan.classList.remove('!text-slate-900', 'font-bold');
    });

    document.querySelectorAll('[data-left-sub-word-idx]').forEach((sp) => {
      sp.className = 'transition-colors duration-100 rounded px-0.5';
    });

    const progBar = document.getElementById('studio-karaoke-progress-fill');
    if (progBar) progBar.style.width = '0%';

    const statusEl = document.getElementById('studio-live-sync-badge');
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.classList.add('hidden');
    }
  }

  function highlightWordAtIndex(wIdx, progressPct, labelText) {
    const pct = Math.max(0, Math.min(100, Math.round((progressPct || 0) * 100)));
    const progBar = document.getElementById('studio-karaoke-progress-fill');
    if (progBar) progBar.style.width = `${pct}%`;

    const statusEl = document.getElementById('studio-live-sync-badge');
    if (statusEl && labelText) {
      statusEl.textContent = labelText;
      statusEl.classList.remove('hidden');
    }

    if (wIdx === activeHighlightedWordIdx) return;
    activeHighlightedWordIdx = wIdx;

    // 1. Làm sáng từng từ trong Khung Thực Hành Câu (Cột Phải)
    document.querySelectorAll('[data-studio-word-idx]').forEach((btn) => {
      const idx = Number(btn.getAttribute('data-studio-word-idx'));
      const wordSpan = btn.querySelector('[data-studio-word-text]');
      const ipaSpan = btn.querySelector('[data-studio-ipa-word]');

      btn.classList.remove(
        'bg-emerald-400',
        'text-slate-950',
        'ring-2',
        'ring-emerald-200',
        '-translate-y-1',
        'scale-110',
        'shadow-lg',
        'bg-emerald-500/15',
        'ring-1',
        'ring-emerald-500/30'
      );
      if (wordSpan) wordSpan.classList.remove('!text-slate-950', '!text-emerald-400');
      if (ipaSpan) ipaSpan.classList.remove('!text-slate-900', 'font-bold');

      if (idx === wIdx) {
        btn.classList.add(
          'bg-emerald-400',
          'text-slate-950',
          'ring-2',
          'ring-emerald-200',
          '-translate-y-1',
          'scale-110',
          'shadow-lg'
        );
        if (wordSpan) wordSpan.classList.add('!text-slate-950');
        if (ipaSpan) ipaSpan.classList.add('!text-slate-900', 'font-bold');
      } else if (idx < wIdx) {
        btn.classList.add('bg-emerald-500/15', 'ring-1', 'ring-emerald-500/30');
        if (wordSpan) wordSpan.classList.add('!text-emerald-400');
      }
    });

    // 2. Làm sáng từng từ trong Danh Sách Phụ Đề (Cột Trái)
    document.querySelectorAll('[data-left-sub-word-idx]').forEach((sp) => {
      const idx = Number(sp.getAttribute('data-left-sub-word-idx'));
      if (idx === wIdx) {
        sp.className =
          'bg-emerald-400 text-slate-950 font-extrabold rounded px-1 py-0.5 shadow-sm transition-all duration-100';
      } else if (idx < wIdx) {
        sp.className = 'text-emerald-400 font-semibold rounded px-0.5 transition-colors duration-100';
      } else {
        sp.className = 'transition-colors duration-100 rounded px-0.5';
      }
    });
  }

  // Nạp YouTube IFrame Player API
  function ensureYouTubeIframeAPI(onReadyCallback) {
    setupYouTubePostMessageListener();
    if (global.YT && global.YT.Player) {
      ytApiLoaded = true;
      if (typeof onReadyCallback === 'function') onReadyCallback();
      return;
    }
    const prevCb = global.onYouTubeIframeAPIReady;
    global.onYouTubeIframeAPIReady = function () {
      ytApiLoaded = true;
      if (typeof prevCb === 'function') prevCb();
      if (typeof onReadyCallback === 'function') onReadyCallback();
    };
    if (!document.getElementById('lexi-yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'lexi-yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }

  // Khởi tạo trình phát YouTube đúng 1 lần duy nhất cho mỗi videoId (KHÔNG BAO GIỜ tháo khỏi DOM khi chuyển câu/bấm từ)
  // Sử dụng tên miền chuẩn www.youtube.com/embed để trình duyệt gửi cookie YouTube Premium của người dùng và hạn chế quảng cáo
  function mountOrUpdateYouTubePlayer(videoId, startSec) {
    setupYouTubePostMessageListener();
    const stageEl = document.getElementById('studio-yt-stage');
    if (!stageEl || !videoId) return;

    if (typeof global.setYouTubeReferrerMode === 'function') {
      global.setYouTubeReferrerMode();
    }

    const existingIframe = document.getElementById('studio-yt-player-instance');
    if (existingIframe && currentYtVideoId === videoId && stageEl.contains(existingIframe)) {
      sendYtListeningHandshake();
      return;
    }

    if (ytHandshakeTimerId) {
      clearInterval(ytHandshakeTimerId);
      ytHandshakeTimerId = null;
    }
    if (ytPlayer && typeof ytPlayer.destroy === 'function') {
      try {
        ytPlayer.destroy();
      } catch (e) {}
    }
    ytPlayer = null;
    ytPlayerReady = false;
    currentYtVideoId = videoId;
    ytState = { currentTime: Number(startSec) || 0, lastSyncTs: 0, playerState: -1 };

    const wrap = document.createElement('div');
    wrap.id = 'studio-yt-player-wrap';
    wrap.className = 'w-full h-full';

    const iframe = document.createElement('iframe');
    iframe.id = 'studio-yt-player-instance';
    iframe.className = 'w-full h-full border-0';
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    try {
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    } catch (e) {}
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('playsinline', '1');
    iframe.setAttribute('webkit-playsinline', 'true');

    const hasValidHttpOrigin =
      global.location &&
      global.location.origin &&
      /^https?:\/\//i.test(global.location.origin);
    const originQuery = hasValidHttpOrigin
      ? `&origin=${encodeURIComponent(global.location.origin)}`
      : '';
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(
      videoId
    )}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&start=${Math.floor(
      startSec || 0
    )}${originQuery}`;

    iframe.onload = function () {
      sendYtListeningHandshake();
      if (ytHandshakeTimerId) clearInterval(ytHandshakeTimerId);
      let tries = 0;
      ytHandshakeTimerId = setInterval(() => {
        tries++;
        sendYtListeningHandshake();
        if (ytPlayerReady || tries > 20) {
          clearInterval(ytHandshakeTimerId);
          ytHandshakeTimerId = null;
        }
      }, 400);
    };

    wrap.appendChild(iframe);
    stageEl.innerHTML = '';
    stageEl.appendChild(wrap);

    ensureYouTubeIframeAPI(() => {
      if (!document.getElementById('studio-yt-player-instance')) return;
      try {
        ytPlayer = new global.YT.Player('studio-yt-player-instance', {
          host: 'https://www.youtube.com',
          events: {
            onReady: function () {
              ytPlayerReady = true;
              sendYtListeningHandshake();
              sendYtCommand('setPlaybackRate', [playbackSpeed]);
            },
            onStateChange: function (ev) {
              if (ev && typeof ev.data === 'number') {
                ytState.playerState = ev.data;
                ytState.lastSyncTs = Date.now();
                if (ev.data === 1) {
                  ensureContinuousVideoKaraokeLoop();
                }
              }
            }
          }
        });
      } catch (e) {}
    });
  }

  // Cuộn mượt câu đang phát vào giữa khung Phụ đề cột trái
  function scrollActiveSubtitleIntoView() {
    const subContainer = document.getElementById('studio-subtitles-scroll-box');
    const activeCard = subContainer
      ? subContainer.querySelector(`[data-studio-seg="${curSegIdx}"]`)
      : null;
    if (subContainer && activeCard) {
      const cTop = subContainer.scrollTop;
      const cHeight = subContainer.clientHeight;
      const elTop = activeCard.offsetTop - subContainer.offsetTop;
      const elHeight = activeCard.offsetHeight;
      if (elTop < cTop + 16 || elTop + elHeight > cTop + cHeight - 16) {
        subContainer.scrollTo({
          top: Math.max(0, elTop - cHeight / 2 + elHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }

  // Vòng lặp đồng bộ chữ chạy Karaoke 50ms theo thời gian thực của Video YouTube
  // Hỗ trợ 2 chế độ rõ ràng:
  // - Mặc định (!autoAdvanceSubtitles): Tự dừng ở cuối mỗi câu để học viên bấm thu âm & chấm điểm ngay
  // - Phát liên tục (autoAdvanceSubtitles): Tự động nhảy qua câu tiếp theo theo tiến trình Video
  function ensureContinuousVideoKaraokeLoop() {
    if (karaokeTimerId) clearInterval(karaokeTimerId);

    karaokeTimerId = setInterval(() => {
      const ctx = getActiveLessonAndSegment(activeLevel);
      const { lesson, segs, combinedText, startSec, endSec } = ctx;
      if (!lesson || !lesson.youtubeId || mediaTab !== 'video') {
        clearKaraokeTimer();
        return;
      }

      const curT = getYouTubeCurrentTime();
      const pState = getYouTubePlayerState();
      const wordsArr = combinedText.split(/\s+/).filter(Boolean);
      const totalWords = Math.max(1, wordsArr.length);
      const segDur = Math.max(0.8, endSec - startSec);
      const isSeekLocked = Date.now() < seekLockUntil;

      // 1. Khi chạm mốc kết thúc câu hiện tại (endSec) và đã qua thời gian khóa tua (seekLockUntil)
      if (!isSeekLocked && curT >= endSec - 0.04) {
        if (loopSegment) {
          seekLockUntil = Date.now() + 950;
          sendYtCommand('seekTo', [startSec, true]);
          sendYtCommand('playVideo', []);
          ytState.currentTime = startSec;
          ytState.lastSyncTs = Date.now();
          return;
        }
        if (!autoAdvanceSubtitles) {
          // Chế độ mặc định: Tự dừng ở cuối câu để học viên luyện nói / ghi âm ngay
          sendYtCommand('pauseVideo', []);
          ytState.playerState = 2;
          highlightWordAtIndex(
            totalWords - 1,
            1,
            `⏸ Đã dừng cuối câu #${curSegIdx + 1} (${endSec.toFixed(1)}s) — Hãy bấm 🎙️ để đọc & chấm điểm!`
          );
          clearInterval(karaokeTimerId);
          karaokeTimerId = null;
          return;
        }
      }

      // 2. Chế độ Phát liên tục cả bài (autoAdvanceSubtitles === true): Tự động nhảy sang câu phụ đề tiếp theo theo Video mà KHÔNG tải lại trình phát!
      if (!isSeekLocked && autoAdvanceSubtitles && pState === 1 && !loopSegment && curT > 0.2) {
        const matchedIdx = segs.findIndex((s, idx) => {
          const sStart = Number(s.start) || 0;
          const nextSegStart =
            idx + 1 < segs.length ? Number(segs[idx + 1].start) : (Number(s.end) || 0) + 1.5;
          const sEndWindow = Math.max(Number(s.end) || 0, nextSegStart - 0.05);
          return curT >= sStart - 0.12 && curT < sEndWindow;
        });
        if (
          matchedIdx !== -1 &&
          matchedIdx !== curSegIdx &&
          !(mergeNext && matchedIdx === curSegIdx + 1)
        ) {
          curSegIdx = matchedIdx;
          activePopoverWord = null;
          activeSegmentEndTarget = null;
          refreshStudioSlotsWithoutTouchingVideo();
          scrollActiveSubtitleIntoView();
          return;
        }
      }

      // 3. Tính toán vị trí từ đang đọc (Wave Karaoke Highlight)
      if (curT >= startSec - 0.25 && curT <= endSec + 0.35) {
        const progress = Math.max(0, Math.min(0.999, (curT - startSec) / segDur));
        const wIdx = Math.floor(progress * totalWords);
        highlightWordAtIndex(
          wIdx,
          progress,
          `🎬 Đang phát câu #${curSegIdx + 1}: ${curT.toFixed(1)}s / ${endSec.toFixed(1)}s`
        );
      } else if (pState === 1) {
        const statusEl = document.getElementById('studio-live-sync-badge');
        if (statusEl) {
          statusEl.textContent = `🎬 Video đang phát: ${curT.toFixed(1)}s`;
          statusEl.classList.remove('hidden');
        }
      }

      if (!isSeekLocked && (pState === 2 || pState === 0)) {
        clearInterval(karaokeTimerId);
        karaokeTimerId = null;
      }
    }, 50);
  }

  // Tua & phát Video YouTube ngay tại giây customStartSec (không tải lại iframe, khóa chống nhảy câu sai!)
  function seekAndPlayYouTubeAt(customStartSec, targetEndSec) {
    if (typeof global.stopAudioPlayback === 'function') {
      global.stopAudioPlayback();
    }
    if (humanAudioEl && !humanAudioEl.paused) {
      try {
        humanAudioEl.pause();
      } catch (e) {}
    }
    if (typeof global.setYouTubeReferrerMode === 'function') {
      global.setYouTubeReferrerMode();
    }

    const sSec = Math.max(0, Number(customStartSec) || 0);
    activeSegmentEndTarget = typeof targetEndSec === 'number' ? targetEndSec : null;
    seekLockUntil = Date.now() + 1200;

    ytState.currentTime = sSec;
    ytState.lastSyncTs = Date.now();
    ytState.playerState = 1;

    sendYtListeningHandshake();
    sendYtCommand('setPlaybackRate', [playbackSpeed]);
    sendYtCommand('seekTo', [sSec, true]);
    sendYtCommand('playVideo', []);

    // Gửi lặp lệnh seekTo sau 160ms để đảm bảo iPad Safari / YouTube IFrame nhận đúng giây kể cả khi vừa thoát trạng thái Pause
    setTimeout(() => {
      if (Math.abs(ytState.currentTime - sSec) < 1.5) {
        sendYtCommand('seekTo', [sSec, true]);
        sendYtCommand('playVideo', []);
      }
    }, 160);

    ensureContinuousVideoKaraokeLoop();
    return true;
  }

  // Khởi tạo và gắn thẻ <audio controls> bền vững cho bài nghe ELLLO (MP3 giọng người thật lưu sẵn trong dự án)
  function mountOrUpdateHumanAudioElement(audioUrl) {
    if (!audioUrl) return null;
    if (!humanAudioEl) {
      humanAudioEl = document.createElement('audio');
      humanAudioEl.id = 'studio-human-audio-player';
      humanAudioEl.controls = true;
      humanAudioEl.preload = 'auto';
      humanAudioEl.setAttribute('playsinline', 'true');
      humanAudioEl.setAttribute('webkit-playsinline', 'true');
      humanAudioEl.className = 'w-full h-10 rounded-xl';

      humanAudioEl.addEventListener('play', () => {
        sendYtCommand('pauseVideo', []);
        ensureContinuousHumanAudioKaraokeLoop();
      });
    }

    if (currentHumanAudioSrc !== audioUrl) {
      currentHumanAudioSrc = audioUrl;
      humanAudioEl.src = audioUrl;
      try {
        humanAudioEl.load();
      } catch (e) {}
    }
    humanAudioEl.playbackRate = playbackSpeed || 1.0;

    const mountBox = document.getElementById('studio-human-audio-mount');
    if (mountBox && !mountBox.contains(humanAudioEl)) {
      mountBox.innerHTML = '';
      mountBox.appendChild(humanAudioEl);
    }
    return humanAudioEl;
  }

  // Vòng lặp 50ms đồng bộ Karaoke & Phụ đề cho Trình phát Audio Giọng Người Thật (ELLLO MP3)
  function ensureContinuousHumanAudioKaraokeLoop() {
    if (karaokeTimerId) clearInterval(karaokeTimerId);

    karaokeTimerId = setInterval(() => {
      if (!humanAudioEl || humanAudioEl.paused) {
        clearInterval(karaokeTimerId);
        karaokeTimerId = null;
        return;
      }

      const curT = Number(humanAudioEl.currentTime) || 0;
      const ctx = getActiveLessonAndSegment(activeLevel);
      const { lesson, segs, combinedText, startSec, endSec } = ctx;
      if (!lesson || !lesson.audioUrl) {
        clearKaraokeTimer();
        return;
      }

      const wordsArr = combinedText.split(/\s+/).filter(Boolean);
      const totalWords = Math.max(1, wordsArr.length);
      const segDur = Math.max(0.8, endSec - startSec);
      const isSeekLocked = Date.now() < seekLockUntil;

      // 1. Khi chạm mốc kết thúc câu hiện tại (endSec)
      if (!isSeekLocked && curT >= endSec - 0.04) {
        if (loopSegment) {
          seekLockUntil = Date.now() + 600;
          try {
            humanAudioEl.currentTime = startSec;
          } catch (e) {}
          return;
        }
        if (!autoAdvanceSubtitles) {
          try {
            humanAudioEl.pause();
          } catch (e) {}
          highlightWordAtIndex(
            totalWords - 1,
            1,
            `⏸ Đã dừng cuối câu #${curSegIdx + 1} (${endSec.toFixed(1)}s) — Hãy bấm 🎙️ để đọc & chấm điểm!`
          );
          clearInterval(karaokeTimerId);
          karaokeTimerId = null;
          return;
        }
      }

      // 2. Chế độ Phát liên tục cả bài (autoAdvanceSubtitles === true): tự động nhảy sang câu tiếp theo
      if (!isSeekLocked && autoAdvanceSubtitles && !loopSegment) {
        const matchedIdx = segs.findIndex((s, idx) => {
          const sStart = Number(s.start) || 0;
          const nextSegStart =
            idx + 1 < segs.length ? Number(segs[idx + 1].start) : (Number(s.end) || 0) + 1.5;
          const sEndWindow = Math.max(Number(s.end) || 0, nextSegStart - 0.05);
          return curT >= sStart - 0.1 && curT < sEndWindow;
        });
        if (
          matchedIdx !== -1 &&
          matchedIdx !== curSegIdx &&
          !(mergeNext && matchedIdx === curSegIdx + 1)
        ) {
          curSegIdx = matchedIdx;
          activePopoverWord = null;
          refreshStudioSlotsWithoutTouchingVideo();
          scrollActiveSubtitleIntoView();
          return;
        }
      }

      // 3. Làm sáng từng từ (Wave Karaoke Highlight) theo thời gian thực của file MP3 người thật
      if (curT >= startSec - 0.2 && curT <= endSec + 0.25) {
        const progress = Math.max(0, Math.min(0.999, (curT - startSec) / segDur));
        const wIdx = Math.floor(progress * totalWords);
        highlightWordAtIndex(
          wIdx,
          progress,
          `🎧 Giọng người thật #${curSegIdx + 1}: ${curT.toFixed(1)}s / ${endSec.toFixed(1)}s`
        );
      }
    }, 50);
  }

  // Phát câu hoặc từ bằng File Audio Giọng Người Thật trực tiếp (ELLLO MP3 trong dự án) kèm chữ chạy Karaoke
  function seekAndPlayHumanAudioAt(audioUrl, customStartSec, startSec, endSec, totalWords) {
    clearKaraokeTimer();
    if (typeof global.stopAudioPlayback === 'function') {
      global.stopAudioPlayback();
    }
    sendYtCommand('pauseVideo', []);

    const audioEl = mountOrUpdateHumanAudioElement(audioUrl);
    if (!audioEl) {
      const ctx = getActiveLessonAndSegment(activeLevel);
      playSentenceUSWithKaraoke(ctx.combinedText, totalWords, 0);
      return;
    }

    const sSec = Math.max(0, Number(customStartSec) || 0);
    seekLockUntil = Date.now() + 650;

    const startPlayback = () => {
      try {
        audioEl.currentTime = sSec;
      } catch (e) {}
      audioEl.playbackRate = playbackSpeed || 1.0;
      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            ensureContinuousHumanAudioKaraokeLoop();
          })
          .catch(() => {
            const ctx = getActiveLessonAndSegment(activeLevel);
            playSentenceUSWithKaraoke(ctx.combinedText, totalWords, 0);
          });
      } else {
        ensureContinuousHumanAudioKaraokeLoop();
      }
    };

    if (audioEl.readyState >= 1) {
      startPlayback();
    } else {
      audioEl.onloadedmetadata = () => {
        audioEl.onloadedmetadata = null;
        startPlayback();
      };
      audioEl.onerror = () => {
        const ctx = getActiveLessonAndSegment(activeLevel);
        playSentenceUSWithKaraoke(ctx.combinedText, totalWords, 0);
      };
    }
  }

  // Phát câu hiện tại bằng Giọng Chuẩn Mỹ (🔊 Nghe US) kèm hiệu ứng Sóng Karaoke đồng bộ chính xác theo từng cụm thở (breath chunks)
  // Được dùng cho các câu dài không có trong Video YouTube / MP3 ELLLO hoặc khi người dùng bấm trực tiếp nút "🔊 Nghe US"
  function playSentenceUSWithKaraoke(text, wordsCount, startFromWordIdx) {
    clearKaraokeTimer();
    pauseAllRealMedia();

    if (typeof global.setAudioPlaybackRate === 'function') {
      global.setAudioPlaybackRate(playbackSpeed);
    }

    const wordsArr = String(text || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const totalWords = Math.max(1, Number(wordsCount) || wordsArr.length || 1);
    const offsetWordIdx = Math.max(0, Number(startFromWordIdx) || 0);
    const spokenSliceText =
      offsetWordIdx > 0 && offsetWordIdx < wordsArr.length
        ? wordsArr.slice(offsetWordIdx).join(' ')
        : text;
    const remainingWords = Math.max(1, totalWords - offsetWordIdx);

    // Tính phạm vi từ của từng cụm thở (breath chunk) để đồng bộ Karaoke chính xác 100% khi đọc câu dài nhiều cụm
    const chunks =
      typeof global.splitIntoBreathChunks === 'function'
        ? global.splitIntoBreathChunks(spokenSliceText)
        : [spokenSliceText];
    const chunkBounds = [];
    let runningWordOffset = offsetWordIdx;
    chunks.forEach((cTxt) => {
      const cWordsCount = Math.max(1, String(cTxt || '').trim().split(/\s+/).filter(Boolean).length);
      chunkBounds.push({
        startWord: runningWordOffset,
        wordCount: cWordsCount
      });
      runningWordOffset += cWordsCount;
    });

    let activeChunkIndex = 0;
    let chunkStartTs = Date.now();

    karaokeTimerId = setInterval(() => {
      const sharedAudio =
        typeof global.getSharedAudioElement === 'function' ? global.getSharedAudioElement() : null;
      const curBound = chunkBounds[activeChunkIndex] || {
        startWord: offsetWordIdx,
        wordCount: remainingWords
      };
      const estChunkMs = Math.max(700, (curBound.wordCount * 340) / (playbackSpeed || 1));

      let chunkProgress = 0;
      if (
        sharedAudio &&
        !sharedAudio.paused &&
        sharedAudio.duration &&
        isFinite(sharedAudio.duration) &&
        sharedAudio.duration > 0.2
      ) {
        chunkProgress = Math.max(
          0,
          Math.min(0.999, sharedAudio.currentTime / sharedAudio.duration)
        );
      } else {
        const elapsed = Date.now() - chunkStartTs;
        chunkProgress = Math.max(0, Math.min(0.999, elapsed / estChunkMs));
      }

      const wIdx = Math.min(
        totalWords - 1,
        curBound.startWord + Math.floor(chunkProgress * curBound.wordCount)
      );
      const overallProgress = (wIdx + chunkProgress) / totalWords;
      highlightWordAtIndex(
        wIdx,
        overallProgress,
        `🔊 Đang đọc chuẩn US (${playbackSpeed}x): từ ${wIdx + 1}/${totalWords}`
      );
    }, 50);

    if (typeof global.speakUS === 'function') {
      global.speakUS(spokenSliceText, {
        onChunkStart: (cIdx) => {
          activeChunkIndex = Number(cIdx) || 0;
          chunkStartTs = Date.now();
        },
        onComplete: () => {
          highlightWordAtIndex(totalWords - 1, 1, '✓ Đã đọc xong câu chuẩn US');
          setTimeout(() => {
            clearKaraokeTimer();
            if (loopSegment) {
              playSentenceUSWithKaraoke(text, totalWords, 0);
            }
          }, 350);
        }
      });
    }
  }

  // Phát câu hoặc từ theo nguồn ưu tiên tuyệt đối:
  // 1. Video YouTube gốc (nếu bài có youtubeId)
  // 2. File MP3 Giọng Người Thật ELLLO lưu sẵn trong dự án (nếu bài có audioUrl)
  // 3. Giọng Chuẩn Mỹ US Neural (cho các bài Y khoa / Học thuật không có video/mp3)
  function playSentenceOrWordAt(wordIdxOrNull) {
    const ctx = getActiveLessonAndSegment(activeLevel);
    const { lesson, combinedText, startSec, endSec } = ctx;
    const wordsArr = combinedText.split(/\s+/).filter(Boolean);
    const totalWords = Math.max(1, wordsArr.length);
    const segDur = Math.max(1.0, endSec - startSec);

    const isWordJump = typeof wordIdxOrNull === 'number' && wordIdxOrNull >= 0;
    const targetSec = isWordJump
      ? Math.max(startSec, startSec + (wordIdxOrNull / totalWords) * segDur - 0.12)
      : startSec;
    const initIdx = isWordJump ? wordIdxOrNull : 0;
    const initProg = initIdx / totalWords;

    if (mediaTab === 'video' && lesson.youtubeId) {
      seekAndPlayYouTubeAt(targetSec, endSec);
      highlightWordAtIndex(
        initIdx,
        initProg,
        `🎬 Đang phát câu #${curSegIdx + 1} tại ${targetSec.toFixed(1)}s...`
      );
      return;
    }

    if (lesson.audioUrl) {
      seekAndPlayHumanAudioAt(lesson.audioUrl, targetSec, startSec, endSec, totalWords);
      highlightWordAtIndex(
        initIdx,
        initProg,
        `🎧 Đang phát giọng người thật #${curSegIdx + 1} tại ${targetSec.toFixed(1)}s...`
      );
      return;
    }

    playSentenceUSWithKaraoke(combinedText, totalWords, isWordJump ? wordIdxOrNull : 0);
  }

  // Tính khoảng cách Levenshtein để chấm từ Gần đúng (Thẻ Vàng ▲) vs Đúng (Thẻ Xanh ✓) vs Sai (Thẻ Đỏ ✗)
  function wordSimilarity(a, b) {
    const s1 = cleanWordToken(a);
    const s2 = cleanWordToken(b);
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1;
    if (s1 + 's' === s2 || s2 + 's' === s1 || s1 + 'ed' === s2 || s2 + 'ed' === s1) {
      return 0.82;
    }
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    const maxLen = Math.max(m, n);
    return maxLen ? (maxLen - dp[m][n]) / maxLen : 0;
  }

  function evaluateSpokenWords(targetText, spokenText) {
    const targetTokens = String(targetText || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const spokenTokens = String(spokenText || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const usedSpoken = new Set();
    let scoreSum = 0;

    const wordResults = targetTokens.map((rawTarget, tIdx) => {
      const cleanT = cleanWordToken(rawTarget);
      if (!cleanT) {
        return { word: rawTarget, clean: '', status: 'correct', spokenWord: rawTarget };
      }

      let bestIdx = -1;
      let bestSim = 0;

      for (let sIdx = 0; sIdx < spokenTokens.length; sIdx++) {
        if (usedSpoken.has(sIdx)) continue;
        const sim = wordSimilarity(cleanT, spokenTokens[sIdx]);
        const distPenalty = Math.abs(sIdx - tIdx) > 5 ? 0.08 : 0;
        const adjSim = Math.max(0, sim - distPenalty);
        if (adjSim > bestSim) {
          bestSim = adjSim;
          bestIdx = sIdx;
        }
      }

      if (bestIdx !== -1 && bestSim >= 0.92) {
        usedSpoken.add(bestIdx);
        scoreSum += 1;
        return {
          word: rawTarget,
          clean: cleanT,
          status: 'correct',
          spokenWord: spokenTokens[bestIdx]
        };
      }

      if (bestIdx !== -1 && bestSim >= 0.62) {
        usedSpoken.add(bestIdx);
        scoreSum += 0.65;
        return {
          word: rawTarget,
          clean: cleanT,
          status: 'near',
          spokenWord: spokenTokens[bestIdx]
        };
      }

      const subCandidate =
        tIdx < spokenTokens.length && !usedSpoken.has(tIdx) ? spokenTokens[tIdx] : '';

      return {
        word: rawTarget,
        clean: cleanT,
        status: 'wrong',
        spokenWord: subCandidate
      };
    });

    const total = targetTokens.length || 1;
    const correctCount = wordResults.filter((w) => w.status === 'correct').length;
    const nearCount = wordResults.filter((w) => w.status === 'near').length;
    const pct = Math.round((scoreSum / total) * 1000) / 10;

    return {
      wordResults,
      correctCount,
      nearCount,
      total: targetTokens.length,
      pct
    };
  }

  function buildAICoachFeedbackHTML(targetText, spokenText, evalResult, esc) {
    const correctWords = evalResult.wordResults
      .filter((w) => w.status === 'correct')
      .map((w) => w.word);
    const nearWords = evalResult.wordResults.filter((w) => w.status === 'near');
    const wrongWords = evalResult.wordResults.filter((w) => w.status === 'wrong');

    const goodSummary =
      correctWords.length > 0
        ? `Bạn đã phát âm đúng và rõ ràng <b>${correctWords.length}/${evalResult.total} từ</b> (bao gồm: <i>"${esc(
            correctWords.slice(0, 8).join(' ')
          )}${correctWords.length > 8 ? '...' : ''}"</i>).`
        : 'Bạn đã bắt đầu làm quen với nhịp điệu của câu.';

    const improvements = [];
    wrongWords.forEach((w) => {
      const info = lookupWordInfo(w.clean);
      if (w.spokenWord && cleanWordToken(w.spokenWord) !== w.clean) {
        improvements.push(
          `<li><b>Thay thế từ:</b> Bạn đã nói <span class="text-rose-400 font-mono">"${esc(
            w.spokenWord
          )}"</span> thay vì <span class="text-emerald-400 font-mono">"${esc(
            w.word
          )}"</span> (/${esc(info.ipa)}/). Cần chú ý nghe kỹ và phát âm đúng từ trong câu mẫu.</li>`
        );
      } else {
        improvements.push(
          `<li><b>Từ bị bỏ sót / chưa rõ âm:</b> Từ <span class="text-rose-400 font-mono">"${esc(
            w.word
          )}"</span> (/${esc(
            info.ipa
          )}/) chưa được nhận diện rõ. Hãy bấm trực tiếp vào thẻ từ màu đỏ để nghe lại âm chuẩn Mỹ.</li>`
        );
      }
    });

    nearWords.forEach((w) => {
      const info = lookupWordInfo(w.clean);
      improvements.push(
        `<li><b>Lưu ý âm cuối / trọng âm:</b> Từ <span class="text-amber-300 font-mono">"${esc(
          w.word
        )}"</span> (/${esc(info.ipa)}/) bạn đọc là <i>"${esc(
          w.spokenWord
        )}"</i> — đã gần đúng nhưng cần bật rõ âm cuối hơn.</li>`
      );
    });

    if (improvements.length === 0) {
      improvements.push(
        '<li>Tuyệt vời! Bạn đã phát âm khớp toàn bộ các từ trong câu mẫu. Hãy thử tăng tốc độ lên <b>1.25x</b> để luyện phản xạ tự nhiên hơn.</li>'
      );
    }

    return `
      <div class="space-y-3 text-xs sm:text-sm leading-relaxed">
        <p class="text-mute">Chào bạn, tôi là huấn luyện viên phát âm của bạn. Dưới đây là đánh giá chi tiết cho phần thực hành vừa rồi:</p>
        <div>
          <b class="text-fg">1. Đánh giá chung:</b> Bạn đã có một phần luyện tập với độ chính xác <b class="${
            evalResult.pct >= 80
              ? 'text-emerald-400'
              : evalResult.pct >= 55
              ? 'text-amber-300'
              : 'text-rose-400'
          }">${evalResult.pct}%</b> (${evalResult.correctCount}/${evalResult.total} từ chuẩn). ${
      evalResult.pct >= 80
        ? 'Ngữ điệu câu của bạn rất tự nhiên và rõ chữ!'
        : 'Tuy nhiên, vẫn còn một số điểm nhỏ cần chú ý để câu nói của bạn tự nhiên và chính xác hơn.'
    }
        </div>
        <div>
          <b class="text-emerald-400">2. Điểm tốt:</b>
          <ul class="list-disc pl-5 mt-1 space-y-1">
            <li>${goodSummary}</li>
          </ul>
        </div>
        <div>
          <b class="text-amber-300">3. Các điểm cần cải thiện:</b>
          <ul class="list-disc pl-5 mt-1 space-y-1.5">
            ${improvements.slice(0, 5).join('')}
          </ul>
        </div>
        <div>
          <b class="text-sky-400">4. Mẹo luyện tập:</b>
          <ul class="list-disc pl-5 mt-1 space-y-1">
            <li><b>Nghe và lặp lại:</b> Bấm trực tiếp vào từng thẻ từ màu <b>Đỏ (✗)</b> hoặc <b>Vàng (▲)</b> bên dưới để nghe lại âm chuẩn US và nhại theo.</li>
            <li><b>Tách cụm:</b> Bấm nút <b>Tách cụm</b> ở góc trên câu để đọc theo từng nhịp thở 1.5s trước khi ghép cả câu.</li>
          </ul>
        </div>
        <div class="pt-2 border-t border-line/50 text-xs text-mute">
          <b>5. Thử lại lần nữa:</b> Hãy thử đọc lại câu: <i>"${esc(targetText)}"</i> một lần nữa nhé!
        </div>
        <div id="studio-ai-extra-slot" class="hidden pt-2 border-t border-line/50 text-xs"></div>
      </div>
    `;
  }

  function getActiveLessonAndSegment(lv) {
    const list = getLessonsForLevel(lv || activeLevel);
    if (curLessonIdx >= list.length) curLessonIdx = 0;
    const lesson = list[curLessonIdx] || list[0];
    const segs = lesson.segments || [];
    if (curSegIdx >= segs.length) curSegIdx = 0;

    const firstSeg = segs[curSegIdx] || { text: '', vi: '', start: 0, end: 5, ipaNote: '' };
    const secondSeg =
      mergeNext && curSegIdx + 1 < segs.length ? segs[curSegIdx + 1] : null;

    const combinedText = secondSeg
      ? `${firstSeg.text.trim()} ${secondSeg.text.trim()}`
      : firstSeg.text.trim();
    const combinedVi = secondSeg
      ? `${firstSeg.vi.trim()} ${secondSeg.vi.trim()}`
      : firstSeg.vi.trim();
    const startSec = Number(firstSeg.start) || 0;
    const endSec = secondSeg
      ? Number(secondSeg.end) || startSec + 10
      : Number(firstSeg.end) || startSec + 5;
    const ipaNote = secondSeg
      ? `${firstSeg.ipaNote || ''} · ${secondSeg.ipaNote || ''}`
      : firstSeg.ipaNote || '';

    const recKey = `${lesson.id}_${curSegIdx}_${mergeNext ? 2 : 1}`;
    const savedRec = recordingStore[recKey] || null;

    return {
      list,
      lesson,
      segs,
      firstSeg,
      secondSeg,
      combinedText,
      combinedVi,
      startSec,
      endSec,
      ipaNote,
      recKey,
      savedRec
    };
  }

  function calcLessonStats(lesson) {
    const segs = lesson.segments || [];
    if (!segs.length) return { doneCount: 0, avgPct: null };
    let doneCount = 0;
    let sumPct = 0;
    segs.forEach((_, idx) => {
      const r1 = recordingStore[`${lesson.id}_${idx}_1`];
      const r2 = recordingStore[`${lesson.id}_${idx}_2`];
      const r = r2 || r1;
      if (r && typeof r.pct === 'number') {
        doneCount++;
        sumPct += r.pct;
      }
    });
    return {
      doneCount,
      avgPct: doneCount > 0 ? Math.round((sumPct / doneCount) * 10) / 10 : null
    };
  }

  // ============================================================================
  // CÁC HÀM Dựng Giao Diện Từng Vùng (Slots) — Tuyệt đối không chạm vào #studio-yt-stage
  // ============================================================================
  function buildTopBarSlotHTML(lv, ctx) {
    const esc = global.LexiAcademy.esc;
    const { list, lesson } = ctx;
    const vstepQuestions = lesson.vstepQuestions || [];

    return `
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono font-bold text-pink-400">🎙️ Talk Studio (${lv})</span>
          <select id="studio-lesson-select" class="inp !w-auto !py-1.5 !px-3 !text-xs font-semibold max-w-[280px] sm:max-w-[430px]">
            ${list
              .map(
                (it, idx) =>
                  `<option value="${idx}" ${idx === curLessonIdx ? 'selected' : ''}>${
                    idx + 1
                  }. ${esc(it.title)} (${it.segments.length} câu${
                    it.youtubeId
                      ? ' · 🎬 Video thật'
                      : it.audioUrl
                      ? ' · 🎧 Giọng thật ELLLO'
                      : ''
                  })</option>`
              )
              .join('')}
          </select>
        </div>

        <div class="flex items-center gap-1 inset p-1 rounded-xl">
          <button
            type="button"
            data-studio-mode="shadowing"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              studioMode === 'shadowing'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : 'text-mute hover:text-fg'
            }"
          >
            🗣️ Shadowing
          </button>
          <button
            type="button"
            data-studio-mode="dictation"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              studioMode === 'dictation'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : 'text-mute hover:text-fg'
            }"
          >
            ⌨️ Dictation
          </button>
          <button
            type="button"
            data-studio-mode="vstep"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              studioMode === 'vstep'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : 'text-mute hover:text-fg'
            }"
          >
            🎧 Nghe VSTEP (${vstepQuestions.length})
          </button>
        </div>
      </div>
    `;
  }

  function buildMediaHeaderSlotHTML(ctx) {
    const esc = global.LexiAcademy.esc;
    const { lesson } = ctx;
    return `
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-mute truncate">${esc(
          lesson.sourceLabel || lesson.category
        )}</span>
        <div class="flex items-center gap-1 inset p-1 rounded-lg shrink-0">
          ${
            lesson.youtubeId
              ? `
            <button
              type="button"
              data-studio-media="video"
              class="px-2.5 py-1 rounded text-[11px] font-semibold transition whitespace-nowrap ${
                mediaTab === 'video'
                  ? 'bg-pri/20 text-pri border border-pri/40'
                  : 'text-mute hover:text-fg'
              }"
            >
              📺 Video thật
            </button>
          `
              : ''
          }
          <button
            type="button"
            data-studio-media="audio"
            class="px-2.5 py-1 rounded text-[11px] font-semibold transition whitespace-nowrap ${
              mediaTab === 'audio' || !lesson.youtubeId
                ? 'bg-pri/20 text-pri border border-pri/40'
                : 'text-mute hover:text-fg'
            }"
          >
            ${lesson.audioUrl ? '🎧 Audio người thật / US' : '🔊 Âm thanh US'}
          </button>
        </div>
      </div>
    `;
  }

  function buildYtControlsSlotHTML(ctx) {
    const { startSec, endSec } = ctx;
    return `
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="studio-jump-first-btn"
            class="px-2.5 py-1.5 rounded-lg border border-line bg-inset text-fg text-[11px] font-semibold hover:border-pri whitespace-nowrap cursor-pointer"
          >
            ⏮ Câu #1
          </button>
          <button
            type="button"
            data-studio-toggle-auto-advance="1"
            class="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
              autoAdvanceSubtitles
                ? 'border-amber-400/60 bg-amber-500/20 text-amber-300'
                : 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300'
            }"
            title="Chuyển đổi giữa Tự dừng ở cuối mỗi câu (để luyện nói ngay) và Phát liên tục cả bài (tự động nhảy câu phụ đề)"
          >
            ${
              autoAdvanceSubtitles
                ? '▶ Phát liên tục cả bài (Tự nhảy câu)'
                : '⏸ Tự dừng cuối câu (Luyện nói)'
            }
          </button>
        </div>
        <button
          type="button"
          id="studio-play-yt-seg-btn"
          class="px-3 py-1.5 rounded-lg bg-pink-600 text-white text-[11px] font-bold hover:bg-pink-500 whitespace-nowrap cursor-pointer shadow"
        >
          ▶ Phát giọng người thật #${curSegIdx + 1} (${startSec}s–${endSec}s)
        </button>
      </div>
    `;
  }

  function buildAudioStageSlotHTML(ctx) {
    const { lesson, startSec, endSec } = ctx;
    return `
      <div class="inset p-4 rounded-xl border border-line/70 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-[11px] font-mono text-pink-400 font-bold">
              CÂU #${curSegIdx + 1}${mergeNext ? ' + #' + (curSegIdx + 2) : ''} · ${
      lesson.audioUrl
        ? '🎧 GIỌNG NGƯỜI THẬT ELLLO (MP3 GỐC TRONG DỰ ÁN)'
        : '🔊 ÂM THANH CHUẨN MỸ (US NEURAL)'
    }
            </div>
            <div class="text-xs text-mute mt-0.5">
              Tốc độ: <b class="font-mono text-fg">${playbackSpeed}x</b> · Mốc câu: <span class="font-mono text-emerald-400 font-semibold">${startSec}s – ${endSec}s</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              id="studio-jump-first-btn"
              class="btn !py-1.5 !px-2.5 !text-xs whitespace-nowrap"
              title="Quay về câu #1"
            >
              ⏮ Câu #1
            </button>
            ${
              lesson.audioUrl
                ? `
              <button
                type="button"
                id="studio-left-play-human-audio"
                class="px-3 py-1.5 rounded-xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-500 whitespace-nowrap cursor-pointer shadow"
              >
                ▶ Phát giọng người thật #${curSegIdx + 1} (${startSec}s–${endSec}s)
              </button>
            `
                : ''
            }
            <button
              type="button"
              id="studio-left-play-us"
              class="btn btn-pri !py-1.5 !px-3 !text-xs font-bold whitespace-nowrap"
              title="Đọc câu này bằng giọng chuẩn Mỹ (US)"
            >
              🔊 Nghe US
            </button>
          </div>
        </div>

        ${
          lesson.audioUrl
            ? `
          <div class="space-y-2 pt-2 border-t border-line/50">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-[11px] text-emerald-400 font-semibold">
                🎵 Trình phát MP3 Giọng Người Thật (Bấm câu bất kỳ bên dưới để tua ngay đến câu đó):
              </span>
              <button
                type="button"
                data-studio-toggle-auto-advance="1"
                class="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  autoAdvanceSubtitles
                    ? 'border-amber-400/60 bg-amber-500/20 text-amber-300'
                    : 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300'
                }"
              >
                ${
                  autoAdvanceSubtitles
                    ? '▶ Phát liên tục cả bài (Tự nhảy câu)'
                    : '⏸ Tự dừng cuối câu (Luyện nói)'
                }
              </button>
            </div>
            <div id="studio-human-audio-mount" class="w-full"></div>
          </div>
        `
            : ''
        }

        ${
          lesson.youtubeId
            ? `<div class="text-[11px] text-mute flex items-center justify-between pt-1 border-t border-line/40">
                 <span>Bài này có sẵn Video người thật:</span>
                 <button type="button" data-studio-media="video" class="text-pink-400 font-semibold hover:underline">Mở Video YouTube gốc →</button>
               </div>`
            : ''
        }
      </div>
    `;
  }

  function buildLeftSubtitlesSlotHTML(ctx) {
    const esc = global.LexiAcademy.esc;
    const { lesson, segs, ipaNote } = ctx;
    const stats = calcLessonStats(lesson);
    const progressPct = segs.length ? Math.round((stats.doneCount / segs.length) * 100) : 0;

    return `
      <div class="space-y-2 pt-1">
        <div class="flex items-center justify-between border-b border-line/60 pb-2 text-xs">
          <div class="flex items-center gap-4">
            <button
              type="button"
              data-studio-left-tab="subtitles"
              class="pb-1 font-bold transition ${
                leftSubTab === 'subtitles'
                  ? 'text-pink-400 border-b-2 border-pink-400'
                  : 'text-mute hover:text-fg'
              }"
            >
              ☰ Phụ đề (${segs.length})
            </button>
            <button
              type="button"
              data-studio-left-tab="guide"
              class="pb-1 font-bold transition ${
                leftSubTab === 'guide'
                  ? 'text-pink-400 border-b-2 border-pink-400'
                  : 'text-mute hover:text-fg'
              }"
            >
              💡 Gợi ý bài học
            </button>
          </div>
          <label class="flex items-center gap-1.5 text-[11px] text-mute cursor-pointer select-none">
            <input type="checkbox" id="studio-loop-toggle" class="accent-pink-500" ${
              loopSegment ? 'checked' : ''
            }>
            <span>Lặp lại câu</span>
          </label>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-mono tabular-nums font-bold text-fg">${stats.doneCount}/${
      segs.length
    }</span>
            <div class="w-20 h-1.5 rounded-full bg-line overflow-hidden">
              <div class="h-full bg-pink-500 transition-all" style="width:${progressPct}%"></div>
            </div>
            <span class="text-[11px] text-mute">Tiến độ</span>
          </div>
          <div class="flex items-center gap-3 text-[11px] text-mute">
            <span>Độ chính xác: <b class="font-mono tabular-nums text-emerald-400">${
              stats.avgPct !== null ? stats.avgPct + '%' : '--%'
            }</b></span>
            <label class="flex items-center gap-1 cursor-pointer select-none">
              <input type="checkbox" id="studio-subs-toggle" class="accent-pink-500" ${
                showLeftSubs ? 'checked' : ''
              }>
              <span>Hiện chữ</span>
            </label>
          </div>
        </div>
      </div>

      ${
        leftSubTab === 'subtitles'
          ? `
        <div id="studio-subtitles-scroll-box" class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          ${segs
            .map((seg, idx) => {
              const isCurrent = idx === curSegIdx || (mergeNext && idx === curSegIdx + 1);
              const segRec =
                recordingStore[`${lesson.id}_${idx}_1`] ||
                recordingStore[`${lesson.id}_${idx}_2`];
              const segWords = String(seg.text || '')
                .trim()
                .split(/\s+/)
                .filter(Boolean);
              const firstSegWordOffset =
                mergeNext && idx === curSegIdx + 1
                  ? String(segs[curSegIdx].text || '')
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length
                  : 0;

              const renderedSegText = isCurrent
                ? segWords
                    .map(
                      (w, wLocalIdx) =>
                        `<span data-left-sub-word-idx="${
                          firstSegWordOffset + wLocalIdx
                        }" class="transition-colors duration-100 rounded px-0.5">${esc(w)}</span>`
                    )
                    .join(' ')
                : esc(seg.text);

              return `
                <div
                  data-studio-seg="${idx}"
                  class="p-3 rounded-xl border transition cursor-pointer ${
                    isCurrent
                      ? 'border-pink-500/80 bg-pink-500/10 ring-1 ring-pink-500/40'
                      : 'border-line/60 bg-inset/40 hover:bg-inset/80'
                  }"
                >
                  <div class="flex items-center justify-between gap-2 mb-1">
                    <div class="flex items-center gap-1.5">
                      <span class="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        isCurrent ? 'bg-pink-500 text-white' : 'bg-line/60 text-mute'
                      }">#${idx + 1}</span>
                      <span class="text-[10px] font-mono text-mute">${seg.start || 0}s–${
                seg.end || 6
              }s</span>
                      ${
                        seg.speaker
                          ? `<span class="text-[10px] font-semibold text-sky-400/90">· ${esc(
                              seg.speaker
                            )}</span>`
                          : ''
                      }
                    </div>
                    ${
                      segRec
                        ? `<span class="text-[11px] font-mono tabular-nums font-bold ${
                            segRec.pct >= 80
                              ? 'text-emerald-400'
                              : segRec.pct >= 55
                              ? 'text-amber-300'
                              : 'text-rose-400'
                          }">${segRec.pct}% ✓</span>`
                        : ''
                    }
                  </div>
                  <p class="text-xs sm:text-sm leading-relaxed ${
                    showLeftSubs ? 'text-fg font-medium' : 'blur-sm select-none text-mute'
                  }">
                    ${renderedSegText}
                  </p>
                  ${
                    showLeftSubs && showTrans && seg.vi
                      ? `<p class="text-[11px] text-emerald-400/80 mt-1">${esc(seg.vi)}</p>`
                      : ''
                  }
                </div>
              `;
            })
            .join('')}
        </div>
      `
          : `
        <div class="inset p-3.5 rounded-xl space-y-2.5 text-xs leading-relaxed">
          <div>
            <b class="text-pink-400">💡 Ghi chú phát âm & Nối âm câu #${curSegIdx + 1}:</b>
            <p class="text-fg mt-0.5">${esc(
              ipaNote || 'Nghe kỹ trọng âm từ và âm cuối của từng cụm.'
            )}</p>
          </div>
          <div class="pt-2 border-t border-line/50">
            <b class="text-pri">🎯 Mẹo sử dụng thông minh:</b>
            <p class="text-mute mt-0.5">
              • <b>Bấm vào bất kỳ câu nào</b> ở cột trái để tua ngay Video đến đúng câu đó mà không bị tải lại.<br>
              • <b>Bấm vào bất kỳ từ nào</b> ở cột phải để tua Video đến đúng vị trí từ đó và mở thẻ từ điển IPA.
            </p>
          </div>
        </div>
      `
      }
    `;
  }

  function buildRightPracticeSlotHTML(lv, state, ctx) {
    const esc = global.LexiAcademy.esc;
    const { lesson, segs, combinedText, combinedVi, startSec, endSec, savedRec } = ctx;
    const wordsArr = combinedText.split(/\s+/).filter(Boolean);
    const totalWords = Math.max(1, wordsArr.length);
    const segDur = Math.max(1.0, endSec - startSec);

    const draftKey = `lis_dict_${lesson.id}_${curSegIdx}`;
    const savedDictation =
      state && state.drafts && state.drafts[draftKey] ? state.drafts[draftKey] : '';
    const dictResult = savedDictation
      ? global.LexiAcademy.compareTokens(combinedText, savedDictation)
      : null;

    // Tạo giao diện từng từ kèm IPA chuẩn Oxford/Cambridge bên dưới + Tua Video đến đúng từ đó khi chạm
    const interactiveWordsHTML = wordsArr
      .map((rawW, wIdx) => {
        const cleanW = cleanWordToken(rawW);
        const info = lookupWordInfo(cleanW);
        const isPopOpen = activePopoverWord && activePopoverWord.idx === wIdx;
        const cleanIpaDisplay = stripSlashes(info.ipa || cleanW);
        const wordSec = (startSec + (wIdx / totalWords) * segDur).toFixed(1);
        return `
          <button
            type="button"
            data-studio-word="${esc(rawW)}"
            data-studio-word-idx="${wIdx}"
            class="group inline-flex flex-col items-center px-2 py-1 rounded-xl transition-all duration-150 cursor-pointer select-none ${
              isPopOpen
                ? 'bg-pink-500/20 ring-1 ring-pink-400/60'
                : 'hover:bg-line/30'
            }"
            title="Chạm để tua Video tới giây ${wordSec}s & tra nghĩa từ '${esc(cleanW)}'"
          >
            <span data-studio-word-text class="text-base sm:text-lg font-bold tracking-tight transition-colors ${
              isPopOpen ? 'text-pink-400' : 'text-fg group-hover:text-pri'
            }">${esc(rawW)}</span>
            ${
              showIPA
                ? `<span data-studio-ipa-word="${esc(
                    cleanW
                  )}" class="text-[11px] font-mono text-sky-300/85 leading-tight mt-0.5 transition-colors">/${esc(
                    cleanIpaDisplay
                  )}/</span>`
                : ''
            }
          </button>
        `;
      })
      .join('');

    let wordPopoverHTML = '';
    if (activePopoverWord) {
      const pInfo = lookupWordInfo(activePopoverWord.word);
      const wIdx = activePopoverWord.idx || 0;
      const wordSec = (startSec + (wIdx / totalWords) * segDur).toFixed(1);
      wordPopoverHTML = `
        <div id="studio-word-popover" class="inset p-3.5 rounded-xl border border-pink-500/40 bg-pink-500/5 space-y-2 text-xs shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2">
            <div class="flex flex-wrap items-center gap-2">
              <b class="text-base text-fg font-bold">${esc(pInfo.word)}</b>
              <span class="font-mono text-pink-400">/${esc(stripSlashes(pInfo.ipa))}/</span>
              <span class="text-mute italic">(${esc(pInfo.pos)})</span>
              <button type="button" data-pop-seek-word="${wIdx}" class="px-2 py-0.5 rounded-md border border-emerald-400/50 bg-emerald-500/15 text-emerald-300 font-mono font-bold hover:bg-emerald-500/25 cursor-pointer">
                🎬 Xem tại ${wordSec}s
              </button>
              <button type="button" data-pop-speak="${esc(
                pInfo.word
              )}" class="px-2 py-0.5 rounded-md border border-sky-400/40 bg-sky-500/10 text-sky-300 font-mono font-bold hover:bg-sky-500/20 cursor-pointer">
                🔊 Đọc rời (US)
              </button>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                id="studio-pop-save-word"
                data-word="${esc(pInfo.word)}"
                data-ipa="/${esc(stripSlashes(pInfo.ipa))}/"
                data-pos="${esc(pInfo.pos)}"
                data-meaning="${esc(pInfo.vi)}"
                data-ex="${esc(combinedText)}"
                data-extrans="${esc(combinedVi)}"
                class="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-bold hover:bg-pink-500/30 whitespace-nowrap cursor-pointer"
              >
                ${pInfo.inVault ? '✓ Đã có trong Kho từ' : '⭐ Lưu vào Kho từ vựng'}
              </button>
              <button type="button" id="studio-pop-close" class="px-2 py-1 rounded-lg border border-line text-mute hover:text-fg cursor-pointer">✕</button>
            </div>
          </div>
          <div class="space-y-1">
            <div><b class="text-emerald-400">Nghĩa:</b> <span class="text-fg font-medium">${esc(
              pInfo.vi
            )}</span></div>
            ${
              pInfo.ex
                ? `<div class="text-mute"><b>Ví dụ:</b> <i>"${esc(pInfo.ex)}"</i></div>`
                : ''
            }
          </div>
        </div>
      `;
    }

    const wordSlotsHTML = savedRec
      ? savedRec.wordResults
          .map((wr) => {
            const cls =
              wr.status === 'correct'
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                : wr.status === 'near'
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                : 'border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25';
            const sym = wr.status === 'correct' ? '✓' : wr.status === 'near' ? '▲' : '✗';
            return `
              <button
                type="button"
                data-chip-speak="${esc(wr.word)}"
                class="px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${cls}"
                title="Bấm để nghe lại phát âm chuẩn US của từ '${esc(wr.word)}'"
              >
                <span>${esc(wr.word.toLowerCase())}</span>
                <span>${sym}</span>
              </button>
            `;
          })
          .join('')
      : wordsArr
          .map((w) => {
            const dots = '•'.repeat(Math.max(3, Math.min(8, cleanWordToken(w).length)));
            return `
              <span class="px-3 py-1.5 rounded-lg border border-line/60 bg-inset/60 text-mute font-mono text-xs tracking-widest select-none">
                ${dots}
              </span>
            `;
          })
          .join('');

    const vstepQuestions = lesson.vstepQuestions || [];
    const vstepQuestionsHTML = vstepQuestions
      .map((q, qIdx) => {
        const ansKey = `${lesson.id}_${qIdx}`;
        const picked =
          typeof vstepAnswersStore[ansKey] === 'number' ? vstepAnswersStore[ansKey] : null;
        const isAnswered = picked !== null;
        const isCorrect = isAnswered && picked === q.answer;
        const evIdx = typeof q.evidenceIdx === 'number' ? q.evidenceIdx : 0;

        return `
          <div class="inset p-4 rounded-2xl border border-line/80 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                VSTEP Question ${qIdx + 1}/${vstepQuestions.length}
              </span>
              <button
                type="button"
                data-vstep-jump-seg="${evIdx}"
                class="text-[11px] font-mono text-sky-400 hover:underline cursor-pointer"
                title="Chuyển tới và nghe câu chứa bằng chứng trả lời"
              >
                🔊 Nghe câu bằng chứng (#${evIdx + 1})
              </button>
            </div>

            <p class="text-sm sm:text-base font-bold text-fg leading-snug">${esc(q.question)}</p>

            <div class="space-y-2">
              ${(q.options || [])
                .map((opt, oIdx) => {
                  let btnCls = 'border-line/70 hover:border-pri text-fg';
                  if (isAnswered) {
                    if (oIdx === q.answer) {
                      btnCls = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-semibold';
                    } else if (oIdx === picked && !isCorrect) {
                      btnCls = 'border-rose-500 bg-rose-500/15 text-rose-200';
                    } else {
                      btnCls = 'border-line/40 opacity-75';
                    }
                  }
                  return `
                    <button
                      type="button"
                      data-vstep-q="${qIdx}"
                      data-vstep-opt="${oIdx}"
                      class="w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-start gap-2 cursor-pointer ${btnCls}"
                    >
                      <span>${esc(opt)}</span>
                    </button>
                  `;
                })
                .join('')}
            </div>

            ${
              isAnswered
                ? `
              <div class="p-3.5 rounded-xl border ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : 'bg-amber-500/10 border-amber-500/40'
              } text-xs space-y-1.5 leading-relaxed">
                <div class="font-bold ${isCorrect ? 'text-emerald-400' : 'text-amber-300'}">
                  ${
                    isCorrect
                      ? '✓ Chính xác! Bạn đã nắm bắt đúng thông tin bài nghe.'
                      : '✗ Chưa chính xác — Hãy xem dịch nghĩa & phân tích đáp án chuẩn VSTEP:'
                  }
                </div>
                ${
                  q.questionVi
                    ? `<div class="text-fg"><b>🇻🇳 Dịch câu hỏi:</b> ${esc(q.questionVi)}</div>`
                    : ''
                }
                <div class="text-mute"><b>💡 Giải thích đáp án:</b> ${esc(q.explain || '')}</div>
              </div>
            `
                : ''
            }
          </div>
        `;
      })
      .join('');

    return `
      <div class="card p-4 sm:p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-mono text-xs font-bold">
              #${curSegIdx + 1}${mergeNext && curSegIdx + 1 < segs.length ? '+' + (curSegIdx + 2) : ''}
            </span>
            <span class="px-2 py-1 rounded-lg bg-inset text-mute font-mono text-xs tabular-nums">
              ${wordsArr.length} từ · ${startSec}s–${endSec}s
            </span>
            <span id="studio-live-sync-badge" class="hidden px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold"></span>
            ${
              curSegIdx < segs.length - 1
                ? `
              <button
                type="button"
                id="studio-merge-next-btn"
                class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  mergeNext
                    ? 'border-pink-500/50 bg-pink-500/15 text-pink-300'
                    : 'border-line text-mute hover:text-fg'
                }"
                title="Gộp với câu tiếp theo để đọc liền hơi tự nhiên hơn (tối đa 2 câu)"
              >
                🔗 Ghép câu kế tiếp (${mergeNext ? '2/2' : '1/2'})
              </button>
            `
                : ''
            }
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              id="studio-toggle-ipa"
              class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                showIPA
                  ? 'border-pri/50 bg-pri/15 text-pri'
                  : 'border-line text-mute hover:text-fg'
              }"
            >
              IPA
            </button>
            <button
              type="button"
              id="studio-toggle-trans"
              class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                showTrans
                  ? 'border-pri/50 bg-pri/15 text-pri'
                  : 'border-line text-mute hover:text-fg'
              }"
            >
              Dịch nghĩa
            </button>
            <button
              type="button"
              id="studio-speak-us-btn"
              class="px-3 py-1 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs font-bold hover:bg-sky-500/20 whitespace-nowrap cursor-pointer"
              title="Nghe câu chuẩn giọng Mỹ (US)"
            >
              🔊 Nghe US
            </button>
            <button
              type="button"
              id="studio-toggle-chunk-btn"
              class="px-3 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 whitespace-nowrap cursor-pointer"
              title="Ẩn/hiện khung Tách cụm (Đọc cả câu dừng 1.5s giữa các cụm hoặc chọn cụm để nghe)"
            >
              Tách cụm
            </button>
          </div>
        </div>

        <!-- VÙNG HIỂN THỊ CÂU MẪU + THANH SÓNG KARAOKE THỜI GIAN THỰC + IPA + BẢN DỊCH -->
        <div class="inset p-4 rounded-2xl border border-line/80 space-y-3">
          <div class="flex flex-wrap items-end gap-x-1.5 gap-y-2.5 leading-relaxed ${
            studioMode === 'dictation' && !showLeftSubs ? 'blur-md select-none' : ''
          }">
            ${interactiveWordsHTML}
          </div>

          <!-- Thanh Sóng Tiến Trình Karaoke Thời Gian Thực -->
          <div class="w-full h-1.5 rounded-full bg-line/50 overflow-hidden">
            <div id="studio-karaoke-progress-fill" class="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 transition-all duration-75" style="width:0%"></div>
          </div>

          ${
            showTrans && combinedVi
              ? `
            <div class="pt-2 border-t border-line/50 text-xs sm:text-sm text-emerald-400 font-medium leading-relaxed">
              🇻🇳 <b>Dịch câu:</b> ${esc(combinedVi)}
            </div>
          `
              : ''
          }

          <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-mute pt-0.5">
            <span>🎬 <b>Chạm vào từ bất kỳ</b> để tua Video đến đúng từ đó & tra từ điển IPA · Khi phát Video/Audio chữ sẽ sáng theo thời gian thực</span>
          </div>
        </div>

        ${wordPopoverHTML}

        <div id="studio-chunk-box" class="hidden inset p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2.5 text-xs">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2">
            <div class="flex items-center gap-2">
              <b class="text-amber-400">Tách cụm theo nhịp thở (Chuẩn US)</b>
              <span id="studio-chunk-status" class="font-mono text-[11px] text-mute"></span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                id="studio-chunk-play-all"
                class="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 whitespace-nowrap cursor-pointer"
              >
                ▶ Đọc cả câu (Dừng 1.5s giữa các cụm)
              </button>
              <button
                type="button"
                id="studio-chunk-stop"
                class="px-2 py-1 rounded-lg border border-line text-mute hover:text-fg whitespace-nowrap cursor-pointer"
              >
                ⏹ Dừng
              </button>
            </div>
          </div>
          <div class="text-[11px] text-mute">
            Chọn <b>▶ Đọc cả câu (Dừng 1.5s giữa các cụm)</b> hoặc bấm trực tiếp vào từng cụm bên dưới để nghe riêng cụm đó:
          </div>
          <div id="studio-chunk-list" class="flex flex-wrap items-center gap-2 pt-0.5"></div>
        </div>

        ${
          studioMode === 'shadowing'
            ? `
          <div class="space-y-3.5 pt-1">
            <div id="studio-rec-panel" class="inset p-4 sm:p-5 rounded-2xl border ${
              isRecording
                ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/40'
                : 'border-line/80'
            } flex flex-col items-center justify-center text-center space-y-3">
              <div class="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  id="studio-rec-toggle-btn"
                  class="px-5 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition shadow-lg cursor-pointer ${
                    isRecording && !isAudioOnlyRecording
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }"
                >
                  <span class="text-base">${isRecording && !isAudioOnlyRecording ? '⏹' : '🎙️'}</span>
                  <span>${
                    isRecording && !isAudioOnlyRecording
                      ? `Đang nghe & chấm điểm (${recordSeconds}s/30s) — Bấm để dừng`
                      : savedRec && savedRec.total > 0
                      ? 'Đọc lại để chấm điểm phát âm'
                      : 'Nhấn để bắt đầu đọc & chấm điểm'
                  }</span>
                </button>

                <button
                  type="button"
                  id="studio-rec-audio-only-btn"
                  class="px-3.5 py-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
                    isRecording && isAudioOnlyRecording
                      ? 'border-rose-500 bg-rose-500/20 text-rose-200 font-bold'
                      : 'border-line bg-card/80 text-mute hover:text-fg hover:border-pink-500/50'
                  }"
                  title="Thu băng giọng đọc để tự nghe lại trên iPad/iPhone/PC mà không ảnh hưởng kết quả chấm điểm từ"
                >
                  ${
                    isRecording && isAudioOnlyRecording
                      ? `⏹ Dừng thu băng (${recordSeconds}s)`
                      : '🎧 Thu băng nghe lại giọng mình'
                  }
                </button>
              </div>

              <div class="text-[11px] sm:text-xs text-mute">
                Hệ thống tự động tương thích với <b>Điện thoại, iPad & Máy tính</b>: chữ bạn đọc sẽ hiện trực tiếp bên dưới và chấm từng từ <b>Xanh ✓ / Vàng ▲ / Đỏ ✗</b>.
              </div>

              <div id="studio-live-transcript" class="text-xs sm:text-sm font-mono text-emerald-300 font-semibold min-h-[20px] px-2">
                ${isRecording && liveTranscript ? `"${esc(liveTranscript)}"` : ''}
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                id="studio-manual-speech-in"
                type="text"
                class="inp !py-2 !text-xs flex-1"
                placeholder="Hoặc chạm vào đây rồi bấm biểu tượng Mic 🎙️ trên bàn phím (iPad/iPhone/Android) để đọc..."
                value="${savedRec && savedRec.transcript ? esc(savedRec.transcript) : ''}"
              />
              <button
                type="button"
                id="studio-eval-manual-btn"
                class="btn !py-2 !px-3.5 !text-xs font-bold whitespace-nowrap justify-center"
              >
                ✓ Chấm câu vừa đọc
              </button>
            </div>

            <div class="inset p-4 rounded-2xl border border-line/70 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold text-mute">
                  ${
                    savedRec && savedRec.total > 0
                      ? `${savedRec.correctCount}/${savedRec.total} từ đúng (${savedRec.pct}%)`
                      : 'Nghe và lặp lại câu trên:'
                  }
                </span>
                ${
                  savedRec && savedRec.total > 0
                    ? `<span class="text-[11px] text-mute">Bấm vào từng thẻ từ bên dưới để nghe lại từ đó</span>`
                    : ''
                }
              </div>

              ${
                savedRec && (savedRec.transcript || savedRec.audioUrl)
                  ? `
                <div class="p-3 rounded-xl bg-card/70 border border-line/60 space-y-2">
                  ${
                    savedRec.transcript
                      ? `
                    <div class="text-xs">
                      <span class="text-mute">Bạn đã nói:</span>
                      <p class="font-medium text-fg mt-0.5">"${esc(savedRec.transcript)}"</p>
                    </div>
                  `
                      : ''
                  }
                  ${
                    savedRec.audioUrl
                      ? `
                    <div class="pt-1">
                      <div class="text-[11px] text-pink-400 font-semibold mb-1">🎧 Nghe lại giọng thu âm của bạn:</div>
                      <audio controls playsinline src="${esc(
                        savedRec.audioUrl
                      )}" class="w-full h-9 rounded-lg"></audio>
                    </div>
                  `
                      : ''
                  }
                </div>
              `
                  : ''
              }

              <div class="flex flex-wrap items-center gap-2 pt-1">
                ${wordSlotsHTML}
              </div>

              ${
                savedRec && savedRec.total > 0
                  ? `
                <div class="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    id="studio-open-ai-coach-btn"
                    class="px-4 py-2 rounded-xl bg-pink-500/20 border border-pink-500/50 text-pink-300 text-xs font-bold hover:bg-pink-500/30 transition cursor-pointer"
                  >
                    ✨ Nhờ AI nhận xét phát âm chi tiết
                  </button>
                </div>
              `
                  : ''
              }
            </div>

            <div
              id="studio-ai-coach-box"
              class="${
                savedRec && savedRec.showCoach ? '' : 'hidden'
              } inset p-4 rounded-2xl border border-pink-500/40 bg-pink-500/5 space-y-3"
            >
              <div class="flex items-center justify-between border-b border-line/60 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-base">🤖</span>
                  <b class="text-sm text-pink-300">AI Huấn luyện phát âm</b>
                </div>
                <button type="button" id="studio-close-ai-coach" class="text-xs text-mute hover:text-fg px-2 py-0.5 rounded border border-line cursor-pointer">Đóng</button>
              </div>
              <div id="studio-ai-coach-content">
                ${savedRec && savedRec.aiCoachHtml ? savedRec.aiCoachHtml : ''}
              </div>
            </div>
          </div>
        `
            : studioMode === 'dictation'
            ? `
          <div class="inset p-4 rounded-2xl border border-line/80 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <b class="text-xs text-pri uppercase">⌨️ Nghe Chép Chính Tả Câu #${
                curSegIdx + 1
              }</b>
              <div class="flex items-center gap-1.5">
                <button type="button" id="studio-dict-hint-btn" class="btn !py-1 !px-2.5 !text-xs">💡 Gợi ý từ tiếp theo</button>
                <button type="button" id="studio-dict-reveal-btn" class="btn !py-1 !px-2.5 !text-xs">👁️ Hiện/Ẩn câu mẫu</button>
              </div>
            </div>
            <textarea
              id="studio-dict-input"
              rows="2"
              class="inp text-sm font-mono"
              placeholder="Bấm nút ▶ (giọng người thật) hoặc '🔊 Nghe US' rồi gõ lại chính xác những gì bạn nghe được..."
            >${esc(savedDictation)}</textarea>
            <div id="studio-dict-feedback" class="text-xs leading-relaxed">
              ${
                dictResult
                  ? `
                <div class="space-y-1.5">
                  <div class="font-mono font-bold ${
                    dictResult.pct >= 85 ? 'text-emerald-400' : 'text-amber-300'
                  }">
                    Độ khớp chính tả: ${dictResult.correctCount}/${dictResult.total} từ (${
                      dictResult.pct
                    }%)
                  </div>
                  <div class="flex flex-wrap gap-1">${dictResult.html}</div>
                </div>
              `
                  : '<span class="text-mute">Gõ câu bạn nghe được vào ô trên để hệ thống kiểm tra từng từ thời gian thực.</span>'
              }
            </div>
          </div>
        `
            : `
          <div class="space-y-3.5">
            <div class="flex flex-wrap items-center justify-between gap-2 px-1">
              <b class="text-xs sm:text-sm text-amber-300 uppercase">🎧 VSTEP Listening Comprehension (${
                vstepQuestions.length
              } Questions in English)</b>
              <span class="text-[11px] text-mute">Chọn đáp án A/B/C/D để xem dịch câu hỏi & giải thích chi tiết</span>
            </div>

            ${vstepQuestionsHTML}

            ${
              lesson.speakingPrompt
                ? `
              <div class="inset p-4 rounded-2xl border border-pri/30 bg-pri/5 space-y-2 text-xs">
                <b class="text-pri uppercase">🗣️ Câu hỏi Mở rộng VSTEP Speaking cùng chủ đề:</b>
                <p class="text-sm font-bold text-fg">${esc(lesson.speakingPrompt.question)}</p>
                <p class="text-mute">${esc(lesson.speakingPrompt.hintVi)}</p>
              </div>
            `
                : ''
            }
          </div>
        `
        }

        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
          <div class="flex flex-wrap items-center gap-1">
            <button
              type="button"
              id="studio-bottom-play-btn"
              class="w-9 h-9 rounded-xl bg-pink-500 text-white font-bold flex items-center justify-center hover:bg-pink-600 transition cursor-pointer mr-1"
              title="Phát câu hiện tại kèm hiệu ứng chữ chạy sáng thời gian thực"
            >
              ▶
            </button>
            ${[0.5, 0.75, 1, 1.25, 1.5]
              .map(
                (spd) => `
              <button
                type="button"
                data-studio-speed="${spd}"
                class="px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-pink-500/25 border border-pink-500/50 text-pink-300'
                    : 'bg-inset text-mute hover:text-fg'
                }"
              >
                ${spd}x
              </button>
            `
              )
              .join('')}
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              id="studio-prev-seg-btn"
              class="btn !py-1.5 !px-3 !text-xs whitespace-nowrap"
              ${curSegIdx === 0 ? 'disabled' : ''}
            >
              ← Câu trước
            </button>
            <button
              type="button"
              id="studio-next-seg-btn"
              class="px-4 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 transition whitespace-nowrap cursor-pointer"
            >
              ${curSegIdx < segs.length - 1 ? 'Tiếp theo →' : 'Hoàn thành bài ✓'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Khung Shell Bền Vững: giữ #studio-yt-stage-box cố định 100% trong DOM
  function render(lv, state) {
    activeLevel = lv || activeLevel;
    activeAppState = state || activeAppState;
    const ctx = getActiveLessonAndSegment(activeLevel);
    const { lesson } = ctx;
    const isVideoVisible = mediaTab === 'video' && !!lesson.youtubeId;

    return `
      <div id="studio-persistent-shell" class="space-y-4">
        <div id="studio-top-bar-slot" class="card p-3.5 sm:p-4 space-y-3">
          ${buildTopBarSlotHTML(activeLevel, ctx)}
        </div>

        <div class="grid lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-5 card p-4 space-y-3.5">
            <div id="studio-media-header-slot">
              ${buildMediaHeaderSlotHTML(ctx)}
            </div>

            <!-- KHUNG VIDEO YOUTUBE CỐ ĐỊNH VĨNH VIỄN (KHÔNG BAO GIỜ BỊ GHI ĐÈ INNERHTML KHI ĐỔI CÂU / BẤM TỪ) -->
            <div id="studio-yt-stage-box" class="space-y-2 ${isVideoVisible ? '' : 'hidden'}">
              <div class="relative rounded-xl overflow-hidden border border-line bg-black aspect-video">
                <div id="studio-yt-stage" class="w-full h-full"></div>
              </div>
              <div id="studio-yt-controls-slot">
                ${buildYtControlsSlotHTML(ctx)}
              </div>
            </div>

            <div id="studio-audio-stage-slot" class="${isVideoVisible ? 'hidden' : ''}">
              ${buildAudioStageSlotHTML(ctx)}
            </div>

            <div id="studio-left-subtitles-slot" class="space-y-2">
              ${buildLeftSubtitlesSlotHTML(ctx)}
            </div>
          </div>

          <div id="studio-right-practice-slot" class="lg:col-span-7 space-y-4">
            ${buildRightPracticeSlotHTML(activeLevel, activeAppState, ctx)}
          </div>
        </div>
      </div>
    `;
  }

  // Cập nhật các vùng giao diện xung quanh mà TUYỆT ĐỐI KHÔNG chạm vào #studio-yt-stage
  function refreshStudioSlotsWithoutTouchingVideo() {
    const shell = document.getElementById('studio-persistent-shell');
    if (!shell) return;
    const ctx = getActiveLessonAndSegment(activeLevel);
    const { lesson, startSec } = ctx;
    const isVideoVisible = mediaTab === 'video' && !!lesson.youtubeId;

    const topSlot = document.getElementById('studio-top-bar-slot');
    if (topSlot) topSlot.innerHTML = buildTopBarSlotHTML(activeLevel, ctx);

    const mediaHeaderSlot = document.getElementById('studio-media-header-slot');
    if (mediaHeaderSlot) mediaHeaderSlot.innerHTML = buildMediaHeaderSlotHTML(ctx);

    const ytStageBox = document.getElementById('studio-yt-stage-box');
    if (ytStageBox) ytStageBox.classList.toggle('hidden', !isVideoVisible);

    const ytControlsSlot = document.getElementById('studio-yt-controls-slot');
    if (ytControlsSlot) ytControlsSlot.innerHTML = buildYtControlsSlotHTML(ctx);

    const audioStageSlot = document.getElementById('studio-audio-stage-slot');
    if (audioStageSlot) {
      audioStageSlot.classList.toggle('hidden', isVideoVisible);
      audioStageSlot.innerHTML = buildAudioStageSlotHTML(ctx);
    }

    const leftSubSlot = document.getElementById('studio-left-subtitles-slot');
    if (leftSubSlot) leftSubSlot.innerHTML = buildLeftSubtitlesSlotHTML(ctx);

    const rightSlot = document.getElementById('studio-right-practice-slot');
    if (rightSlot) rightSlot.innerHTML = buildRightPracticeSlotHTML(activeLevel, activeAppState, ctx);

    if (isVideoVisible) {
      mountOrUpdateYouTubePlayer(lesson.youtubeId, startSec);
    } else if (lesson.audioUrl) {
      mountOrUpdateHumanAudioElement(lesson.audioUrl);
    }

    bind(shell.parentElement || document.body, activeLevel, activeAppState);
  }

  // Được gọi bởi academy-core.js khi module đang hiển thị -> Tránh ghi đè #acad-module-body làm reload iframe
  function updateView(container, lv, state) {
    activeLevel = lv || activeLevel;
    activeAppState = state || activeAppState;
    if (!container.querySelector('#studio-persistent-shell')) {
      container.innerHTML = render(activeLevel, activeAppState);
      bind(container, activeLevel, activeAppState);
      return;
    }
    refreshStudioSlotsWithoutTouchingVideo();
  }

  function stopActiveRecording() {
    isRecording = false;
    isAudioOnlyRecording = false;
    if (recordTimerId) {
      clearInterval(recordTimerId);
      recordTimerId = null;
    }
    if (speechRec) {
      try {
        speechRec.onend = null;
        speechRec.stop();
      } catch (e) {}
      speechRec = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch (e) {}
    }
  }

  function bind(container, lv, state) {
    activeLevel = lv || activeLevel;
    activeAppState = state || activeAppState;
    const esc = global.LexiAcademy.esc;
    const ctx = getActiveLessonAndSegment(activeLevel);
    const { lesson, segs, combinedText, startSec, recKey } = ctx;
    const wordsCount = combinedText.split(/\s+/).filter(Boolean).length;

    if (mediaTab === 'video' && lesson.youtubeId) {
      mountOrUpdateYouTubePlayer(lesson.youtubeId, startSec);
    } else if (lesson.audioUrl) {
      mountOrUpdateHumanAudioElement(lesson.audioUrl);
    }

    // 1. Chọn bài học
    const lessonSelect = container.querySelector('#studio-lesson-select');
    if (lessonSelect) {
      lessonSelect.onchange = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        pauseAllRealMedia();
        curLessonIdx = Number(lessonSelect.value) || 0;
        curSegIdx = 0;
        mergeNext = false;
        activePopoverWord = null;
        const nextList = getLessonsForLevel(activeLevel);
        const nextLesson = nextList[curLessonIdx];
        mediaTab = nextLesson && nextLesson.youtubeId ? 'video' : 'audio';
        global.LexiAcademy.render();
      };
    }

    // 2. Chuyển đổi 3 chế độ (Shadowing | Dictation | Nghe VSTEP)
    container.querySelectorAll('[data-studio-mode]').forEach((btn) => {
      btn.onclick = () => {
        stopActiveRecording();
        studioMode = btn.getAttribute('data-studio-mode') || 'shadowing';
        refreshStudioSlotsWithoutTouchingVideo();
      };
    });

    // 3. Chuyển đổi Video thật / Âm thanh ở cột trái
    container.querySelectorAll('[data-studio-media]').forEach((btn) => {
      btn.onclick = () => {
        clearKaraokeTimer();
        mediaTab = btn.getAttribute('data-studio-media') || 'audio';
        if (mediaTab === 'audio') {
          sendYtCommand('pauseVideo', []);
        }
        refreshStudioSlotsWithoutTouchingVideo();
      };
    });

    // 4. Chuyển tab Phụ đề / Gợi ý bài học ở cột trái
    container.querySelectorAll('[data-studio-left-tab]').forEach((btn) => {
      btn.onclick = () => {
        leftSubTab = btn.getAttribute('data-studio-left-tab') || 'subtitles';
        refreshStudioSlotsWithoutTouchingVideo();
      };
    });

    // 5. Công tắc Lặp lại câu, Tự dừng cuối câu / Phát liên tục cả bài & Hiện chữ
    const loopToggle = container.querySelector('#studio-loop-toggle');
    if (loopToggle) {
      loopToggle.onchange = () => {
        loopSegment = !!loopToggle.checked;
      };
    }
    container.querySelectorAll('[data-studio-toggle-auto-advance]').forEach((btn) => {
      btn.onclick = () => {
        autoAdvanceSubtitles = !autoAdvanceSubtitles;
        global.LexiAcademy.notify(
          autoAdvanceSubtitles
            ? '▶ Đã bật: Phát liên tục cả bài & tự động nhảy câu phụ đề theo Video/Audio.'
            : '⏸ Đã bật: Tự dừng ở cuối mỗi câu để bạn thu âm & chấm điểm ngay.'
        );
        refreshStudioSlotsWithoutTouchingVideo();
      };
    });
    const subsToggle = container.querySelector('#studio-subs-toggle');
    if (subsToggle) {
      subsToggle.onchange = () => {
        showLeftSubs = !!subsToggle.checked;
        refreshStudioSlotsWithoutTouchingVideo();
      };
    }

    // 6. Bấm chọn câu #1, #2, #3... ở cột trái -> Tua ngay Video / Audio đến đúng câu đó và chạy chữ Karaoke (KHÔNG tải lại Video!)
    container.querySelectorAll('[data-studio-seg]').forEach((card) => {
      card.onclick = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        curSegIdx = Number(card.getAttribute('data-studio-seg')) || 0;
        activePopoverWord = null;
        refreshStudioSlotsWithoutTouchingVideo();
        scrollActiveSubtitleIntoView();
        playSentenceOrWordAt(null);
      };
    });

    // 7. Nút Đi đến câu đầu & Phát câu hiện tại
    container.querySelectorAll('#studio-jump-first-btn').forEach((jumpFirstBtn) => {
      jumpFirstBtn.onclick = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        curSegIdx = 0;
        activePopoverWord = null;
        refreshStudioSlotsWithoutTouchingVideo();
        scrollActiveSubtitleIntoView();
        playSentenceOrWordAt(null);
      };
    });

    const leftPlayHumanBtn = container.querySelector('#studio-left-play-human-audio');
    if (leftPlayHumanBtn && lesson.audioUrl) {
      leftPlayHumanBtn.onclick = () => {
        seekAndPlayHumanAudioAt(lesson.audioUrl, ctx.startSec, ctx.startSec, ctx.endSec, wordsCount);
      };
    }

    const leftPlayUsBtn = container.querySelector('#studio-left-play-us');
    if (leftPlayUsBtn) {
      leftPlayUsBtn.onclick = () => playSentenceUSWithKaraoke(combinedText, wordsCount, 0);
    }

    const speakUsBtn = container.querySelector('#studio-speak-us-btn');
    if (speakUsBtn) {
      speakUsBtn.onclick = () => playSentenceUSWithKaraoke(combinedText, wordsCount, 0);
    }

    const bottomPlayBtn = container.querySelector('#studio-bottom-play-btn');
    if (bottomPlayBtn) {
      bottomPlayBtn.onclick = () => playSentenceOrWordAt(null);
    }

    const playYtSegBtn = container.querySelector('#studio-play-yt-seg-btn');
    if (playYtSegBtn) {
      playYtSegBtn.onclick = () => playSentenceOrWordAt(null);
    }

    // 8. Nút Ghép câu kế tiếp (1/2 -> 2/2), IPA, Dịch nghĩa
    const mergeNextBtn = container.querySelector('#studio-merge-next-btn');
    if (mergeNextBtn) {
      mergeNextBtn.onclick = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        mergeNext = !mergeNext;
        activePopoverWord = null;
        refreshStudioSlotsWithoutTouchingVideo();
      };
    }

    const toggleIpaBtn = container.querySelector('#studio-toggle-ipa');
    if (toggleIpaBtn) {
      toggleIpaBtn.onclick = () => {
        showIPA = !showIPA;
        refreshStudioSlotsWithoutTouchingVideo();
      };
    }

    const toggleTransBtn = container.querySelector('#studio-toggle-trans');
    if (toggleTransBtn) {
      toggleTransBtn.onclick = () => {
        showTrans = !showTrans;
        refreshStudioSlotsWithoutTouchingVideo();
      };
    }

    // 9. Chạm vào từng từ trên câu -> Tua ngay Video/Audio đến đúng từ đó + Mở Thẻ Từ Điển Nổi (Popover)
    container.querySelectorAll('[data-studio-word]').forEach((wBtn) => {
      wBtn.onclick = () => {
        const rawW = wBtn.getAttribute('data-studio-word') || '';
        const wIdx = Number(wBtn.getAttribute('data-studio-word-idx')) || 0;
        const cleanW = cleanWordToken(rawW);

        activePopoverWord = { word: cleanW || rawW, idx: wIdx };
        refreshStudioSlotsWithoutTouchingVideo();

        // Tua ngay Video YouTube (hoặc Audio) tới đúng vị trí từ vừa bấm!
        playSentenceOrWordAt(wIdx);
      };
    });

    const popCloseBtn = container.querySelector('#studio-pop-close');
    if (popCloseBtn) {
      popCloseBtn.onclick = () => {
        activePopoverWord = null;
        refreshStudioSlotsWithoutTouchingVideo();
      };
    }

    container.querySelectorAll('[data-pop-seek-word]').forEach((b) => {
      b.onclick = () => {
        const wIdx = Number(b.getAttribute('data-pop-seek-word')) || 0;
        playSentenceOrWordAt(wIdx);
      };
    });

    container.querySelectorAll('[data-pop-speak]').forEach((b) => {
      b.onclick = () => {
        const w = b.getAttribute('data-pop-speak');
        if (w && typeof global.playSingleChunkUS === 'function') {
          pauseAllRealMedia();
          global.playSingleChunkUS(w);
        }
      };
    });

    const popSaveWordBtn = container.querySelector('#studio-pop-save-word');
    if (popSaveWordBtn) {
      popSaveWordBtn.onclick = () => {
        global.LexiAcademy.quickAddWord(
          {
            word: popSaveWordBtn.getAttribute('data-word'),
            ipa: popSaveWordBtn.getAttribute('data-ipa'),
            pos: popSaveWordBtn.getAttribute('data-pos'),
            meaning: popSaveWordBtn.getAttribute('data-meaning'),
            example: popSaveWordBtn.getAttribute('data-ex'),
            exampleTrans: popSaveWordBtn.getAttribute('data-extrans'),
            cefr: activeLevel,
            topic: lesson.category
          },
          popSaveWordBtn
        );
      };
    }

    // 10. Nút "Tách cụm"
    const toggleChunkBtn = container.querySelector('#studio-toggle-chunk-btn');
    const chunkBox = container.querySelector('#studio-chunk-box');
    const chunkListEl = container.querySelector('#studio-chunk-list');
    const chunkStatusEl = container.querySelector('#studio-chunk-status');
    const chunkPlayAllBtn = container.querySelector('#studio-chunk-play-all');
    const chunkStopBtn = container.querySelector('#studio-chunk-stop');

    const resetChunkHighlight = () => {
      if (!chunkListEl) return;
      chunkListEl.querySelectorAll('[data-studio-chunk-idx]').forEach((b) => {
        b.className =
          'px-2.5 py-1.5 rounded-lg border border-line bg-inset/80 text-fg hover:border-amber-400/60 transition font-mono text-xs text-left cursor-pointer';
      });
    };

    const renderChunks = () => {
      if (!chunkListEl) return [];
      const chunks =
        typeof global.splitIntoBreathChunks === 'function'
          ? global.splitIntoBreathChunks(combinedText)
          : [combinedText];
      chunkListEl.innerHTML = chunks
        .map(
          (c, i) => `
          <button type="button" data-studio-chunk-idx="${i}" class="px-2.5 py-1.5 rounded-lg border border-line bg-inset/80 text-fg hover:border-amber-400/60 transition font-mono text-xs text-left cursor-pointer">
            <span class="text-amber-400 font-bold mr-1">${i + 1}.</span>${esc(c)}
          </button>
          ${i < chunks.length - 1 ? '<span class="text-mute font-mono text-xs">➔</span>' : ''}
        `
        )
        .join('');

      chunkListEl.querySelectorAll('[data-studio-chunk-idx]').forEach((b) => {
        b.onclick = () => {
          const idx = Number(b.getAttribute('data-studio-chunk-idx'));
          const cTxt = chunks[idx];
          if (!cTxt) return;
          pauseAllRealMedia();
          resetChunkHighlight();
          b.className =
            'px-2.5 py-1.5 rounded-lg border border-sky-400 bg-sky-500/20 text-sky-200 ring-2 ring-sky-400/60 transition font-mono text-xs text-left font-bold cursor-pointer';
          if (chunkStatusEl) {
            chunkStatusEl.textContent = `🔊 Đang đọc cụm ${idx + 1}/${chunks.length} (US)...`;
          }
          if (typeof global.playSingleChunkUS === 'function') {
            global.playSingleChunkUS(cTxt, {
              onComplete: () => {
                resetChunkHighlight();
                if (chunkStatusEl) {
                  chunkStatusEl.textContent = `✓ Đã đọc cụm ${idx + 1}/${chunks.length}`;
                }
              }
            });
          }
        };
      });
      return chunks;
    };

    if (toggleChunkBtn && chunkBox) {
      toggleChunkBtn.onclick = () => {
        const isHidden = chunkBox.classList.contains('hidden');
        if (!isHidden) {
          chunkBox.classList.add('hidden');
          toggleChunkBtn.textContent = 'Tách cụm';
          if (typeof global.stopAudioPlayback === 'function') global.stopAudioPlayback();
          resetChunkHighlight();
          return;
        }
        chunkBox.classList.remove('hidden');
        toggleChunkBtn.textContent = 'Ẩn tách cụm';
        renderChunks();
      };
    }

    if (chunkPlayAllBtn) {
      chunkPlayAllBtn.onclick = () => {
        pauseAllRealMedia();
        renderChunks();
        if (typeof global.speakShadow === 'function') {
          global.speakShadow(combinedText, {
            onChunkStart: (idx, total) => {
              resetChunkHighlight();
              const activeB = chunkListEl?.querySelector(`[data-studio-chunk-idx="${idx}"]`);
              if (activeB) {
                activeB.className =
                  'px-2.5 py-1.5 rounded-lg border border-sky-400 bg-sky-500/25 text-sky-200 ring-2 ring-sky-400/70 transition font-mono text-xs text-left font-bold cursor-pointer';
              }
              if (chunkStatusEl) {
                chunkStatusEl.textContent = `🔊 Đang đọc cụm ${idx + 1}/${total} (US)...`;
              }
            },
            onPauseStart: (idx, total) => {
              resetChunkHighlight();
              const activeB = chunkListEl?.querySelector(`[data-studio-chunk-idx="${idx}"]`);
              if (activeB) {
                activeB.className =
                  'px-2.5 py-1.5 rounded-lg border border-emerald-400 bg-emerald-500/25 text-emerald-200 ring-2 ring-emerald-400/70 transition font-mono text-xs text-left font-bold cursor-pointer';
              }
              if (chunkStatusEl) {
                chunkStatusEl.textContent = `🎙️ Dừng 1.5s — Hãy nhại lại cụm ${idx + 1}/${total}...`;
              }
            },
            onComplete: () => {
              resetChunkHighlight();
              if (chunkStatusEl) {
                chunkStatusEl.textContent = '✓ Hoàn tất đọc cả câu (dừng 1.5s giữa các cụm)';
              }
            }
          });
        }
      };
    }

    if (chunkStopBtn) {
      chunkStopBtn.onclick = () => {
        if (typeof global.stopAudioPlayback === 'function') global.stopAudioPlayback();
        resetChunkHighlight();
        if (chunkStatusEl) chunkStatusEl.textContent = '⏹ Đã dừng.';
      };
    }

    // 11. Bộ Điều Phối Ghi Âm & Nhận Diện Giọng Nói Đa Thiết Bị
    const finalizeSpokenEvaluation = (spokenTranscript, audioBlobUrl, audioOnlyMode = false) => {
      const cleanSpoken = String(spokenTranscript || '').trim();
      const prevSaved = recordingStore[recKey] || null;

      if (!cleanSpoken && audioBlobUrl) {
        if (prevSaved && prevSaved.wordResults) {
          prevSaved.audioUrl = audioBlobUrl;
          recordingStore[recKey] = prevSaved;
        } else {
          const wordsArr = combinedText.split(/\s+/).filter(Boolean);
          recordingStore[recKey] = {
            transcript: '',
            audioUrl: audioBlobUrl,
            wordResults: wordsArr.map((w) => ({
              word: w,
              clean: cleanWordToken(w),
              status: 'near',
              spokenWord: ''
            })),
            correctCount: 0,
            nearCount: 0,
            total: 0,
            pct: 0,
            aiCoachHtml: '',
            showCoach: false
          };
        }
        if (audioOnlyMode) {
          global.LexiAcademy.notify('🎧 Đã lưu băng thu âm giọng đọc của bạn! Hãy bấm Play để nghe lại.');
        } else {
          global.LexiAcademy.notify(
            '🎧 Đã lưu băng ghi âm! Để chấm điểm từng từ trên thiết bị này, hãy bấm "🎙️ Nhấn để bắt đầu đọc & chấm điểm" hoặc dùng Mic bàn phím nhé.'
          );
        }
        refreshStudioSlotsWithoutTouchingVideo();
        return;
      }

      if (!cleanSpoken && !audioBlobUrl) {
        global.LexiAcademy.notify(
          'Chưa nhận diện được giọng nói. Hãy đọc to rõ hơn hoặc chạm vào ô bên dưới rồi dùng Mic 🎙️ trên bàn phím nhé!'
        );
        refreshStudioSlotsWithoutTouchingVideo();
        return;
      }

      const evalRes = evaluateSpokenWords(combinedText, cleanSpoken);
      const coachHtml = buildAICoachFeedbackHTML(combinedText, cleanSpoken, evalRes, esc);

      recordingStore[recKey] = {
        transcript: cleanSpoken,
        audioUrl: audioBlobUrl || (prevSaved && prevSaved.audioUrl) || '',
        wordResults: evalRes.wordResults,
        correctCount: evalRes.correctCount,
        nearCount: evalRes.nearCount,
        total: evalRes.total,
        pct: evalRes.pct,
        aiCoachHtml: coachHtml,
        showCoach: false
      };

      if (evalRes.pct >= 60) {
        const allDone = segs.every(
          (_, sIdx) =>
            recordingStore[`${lesson.id}_${sIdx}_1`] ||
            recordingStore[`${lesson.id}_${sIdx}_2`]
        );
        if (allDone) global.LexiAcademy.markDone(lesson.id);
      }

      refreshStudioSlotsWithoutTouchingVideo();
    };

    const recToggleBtn = container.querySelector('#studio-rec-toggle-btn');
    if (recToggleBtn) {
      recToggleBtn.onclick = async () => {
        if (isRecording) {
          const capturedText =
            liveTranscript ||
            (container.querySelector('#studio-manual-speech-in')
              ? container.querySelector('#studio-manual-speech-in').value.trim()
              : '');
          const wasSingleChannel = !mediaRecorder || mediaRecorder.state === 'inactive';
          stopActiveRecording();
          if (wasSingleChannel) {
            finalizeSpokenEvaluation(capturedText, '', false);
          }
          return;
        }

        clearKaraokeTimer();
        if (typeof global.stopAudioPlayback === 'function') {
          global.stopAudioPlayback();
        }
        pauseAllRealMedia();

        liveTranscript = '';
        recordSeconds = 0;
        recordedChunks = [];
        let createdAudioUrl = '';
        isAudioOnlyRecording = false;

        const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
        const singleChannelMic = isSingleChannelMicDevice();

        if (
          (!singleChannelMic || !SR) &&
          navigator.mediaDevices &&
          typeof navigator.mediaDevices.getUserMedia === 'function'
        ) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (typeof MediaRecorder !== 'undefined') {
              mediaRecorder = new MediaRecorder(stream);
              mediaRecorder.ondataavailable = (ev) => {
                if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data);
              };
              mediaRecorder.onstop = () => {
                if (recordedChunks.length > 0) {
                  const blob = new Blob(recordedChunks, {
                    type: mediaRecorder.mimeType || 'audio/mp4'
                  });
                  createdAudioUrl = URL.createObjectURL(blob);
                }
                if (stream) {
                  stream.getTracks().forEach((t) => t.stop());
                }
                const finalSpoken =
                  liveTranscript ||
                  (document.getElementById('studio-manual-speech-in')
                    ? document.getElementById('studio-manual-speech-in').value.trim()
                    : '');
                finalizeSpokenEvaluation(finalSpoken, createdAudioUrl, false);
              };
              mediaRecorder.start();
            }
          } catch (err) {}
        }

        if (SR) {
          try {
            speechRec = new SR();
            speechRec.lang = 'en-US';
            speechRec.continuous = true;
            speechRec.interimResults = true;
            speechRec.onresult = (event) => {
              let transcript = '';
              for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + ' ';
              }
              liveTranscript = transcript.trim();
              const liveEl = document.getElementById('studio-live-transcript');
              if (liveEl) liveEl.textContent = liveTranscript ? `"${liveTranscript}"` : '';
              const manualInp = document.getElementById('studio-manual-speech-in');
              if (manualInp && liveTranscript) manualInp.value = liveTranscript;
            };
            speechRec.onerror = () => {};
            speechRec.onend = () => {
              if (isRecording && (!mediaRecorder || mediaRecorder.state === 'inactive')) {
                const finalSpoken =
                  liveTranscript ||
                  (document.getElementById('studio-manual-speech-in')
                    ? document.getElementById('studio-manual-speech-in').value.trim()
                    : '');
                stopActiveRecording();
                finalizeSpokenEvaluation(finalSpoken, createdAudioUrl, false);
              }
            };
            speechRec.start();
          } catch (e) {}
        } else if (!mediaRecorder) {
          global.LexiAcademy.notify(
            'Trình duyệt hiện tại chưa bật Web Speech — Hãy chạm vào ô nhập bên dưới và bấm nút Mic 🎙️ trên bàn phím để đọc nhé!'
          );
          const manualInp = container.querySelector('#studio-manual-speech-in');
          if (manualInp) manualInp.focus();
          return;
        }

        isRecording = true;
        refreshStudioSlotsWithoutTouchingVideo();

        recordTimerId = setInterval(() => {
          recordSeconds++;
          if (recordSeconds >= 30) {
            const finalSpoken =
              liveTranscript ||
              (document.getElementById('studio-manual-speech-in')
                ? document.getElementById('studio-manual-speech-in').value.trim()
                : '');
            const wasSingleChannel = !mediaRecorder || mediaRecorder.state === 'inactive';
            stopActiveRecording();
            if (wasSingleChannel) {
              finalizeSpokenEvaluation(finalSpoken, createdAudioUrl, false);
            }
          } else {
            const labelSpan = document.querySelector('#studio-rec-toggle-btn span:last-child');
            if (labelSpan) {
              labelSpan.textContent = `Đang nghe & chấm điểm (${recordSeconds}s/30s) — Bấm để dừng`;
            }
          }
        }, 1000);
      };
    }

    const recAudioOnlyBtn = container.querySelector('#studio-rec-audio-only-btn');
    if (recAudioOnlyBtn) {
      recAudioOnlyBtn.onclick = async () => {
        if (isRecording) {
          stopActiveRecording();
          return;
        }
        clearKaraokeTimer();
        if (typeof global.stopAudioPlayback === 'function') {
          global.stopAudioPlayback();
        }
        pauseAllRealMedia();

        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
          global.LexiAcademy.notify('Trình duyệt hiện tại không hỗ trợ thu băng trực tiếp.');
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          recordedChunks = [];
          recordSeconds = 0;
          isAudioOnlyRecording = true;
          isRecording = true;

          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data);
          };
          mediaRecorder.onstop = () => {
            let audioUrl = '';
            if (recordedChunks.length > 0) {
              const blob = new Blob(recordedChunks, {
                type: mediaRecorder.mimeType || 'audio/mp4'
              });
              audioUrl = URL.createObjectURL(blob);
            }
            stream.getTracks().forEach((t) => t.stop());
            finalizeSpokenEvaluation('', audioUrl, true);
          };
          mediaRecorder.start();
          refreshStudioSlotsWithoutTouchingVideo();

          recordTimerId = setInterval(() => {
            recordSeconds++;
            if (recordSeconds >= 30) {
              stopActiveRecording();
            } else {
              const btnEl = document.getElementById('studio-rec-audio-only-btn');
              if (btnEl) {
                btnEl.textContent = `⏹ Dừng thu băng (${recordSeconds}s)`;
              }
            }
          }, 1000);
        } catch (e) {
          global.LexiAcademy.notify('Vui lòng cho phép quyền sử dụng Micro trên trình duyệt để thu băng.');
        }
      };
    }

    const manualSpeechIn = container.querySelector('#studio-manual-speech-in');
    const evalManualBtn = container.querySelector('#studio-eval-manual-btn');
    if (evalManualBtn && manualSpeechIn) {
      evalManualBtn.onclick = () => {
        const val = manualSpeechIn.value.trim();
        if (!val) {
          global.LexiAcademy.notify('Hãy đọc bằng Mic bàn phím hoặc nhập câu vào ô trước khi chấm.');
          manualSpeechIn.focus();
          return;
        }
        finalizeSpokenEvaluation(val, '');
      };
    }

    container.querySelectorAll('[data-chip-speak]').forEach((chip) => {
      chip.onclick = () => {
        const w = chip.getAttribute('data-chip-speak');
        if (w && typeof global.playSingleChunkUS === 'function') {
          pauseAllRealMedia();
          global.playSingleChunkUS(w);
        }
      };
    });

    const openAiCoachBtn = container.querySelector('#studio-open-ai-coach-btn');
    const closeAiCoachBtn = container.querySelector('#studio-close-ai-coach');
    const aiCoachBox = container.querySelector('#studio-ai-coach-box');

    if (openAiCoachBtn && aiCoachBox) {
      openAiCoachBtn.onclick = async () => {
        const curRec = recordingStore[recKey];
        if (!curRec) return;
        curRec.showCoach = true;
        aiCoachBox.classList.remove('hidden');

        const aiFn =
          typeof global.ai === 'function'
            ? global.ai
            : typeof global.rawAi === 'function'
            ? global.rawAi
            : null;
        const extraSlot = container.querySelector('#studio-ai-extra-slot');
        if (aiFn && extraSlot && !curRec.aiEnriched) {
          curRec.aiEnriched = true;
          try {
            const prompt = `Bạn là Huấn luyện viên phát âm tiếng Anh Mỹ (US Pronunciation Coach).
- Câu mẫu chuẩn: "${combinedText}"
- Học viên vừa đọc: "${curRec.transcript}" (Độ khớp: ${curRec.pct}%)
Hãy chỉ ra ngắn gọn trong 2-3 gạch đầu dòng:
1. Từ nào học viên đọc nhầm hoặc nuốt âm cuối và cách đặt khẩu hình miệng/lưỡi (IPA) để sửa.
2. Cách nối âm (linking sounds) tự nhiên nhất trong câu này.`;
            const res = await Promise.race([
              aiFn(prompt, undefined, true),
              new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
            ]);
            if (res && String(res).trim()) {
              extraSlot.classList.remove('hidden');
              extraSlot.innerHTML = `<b class="text-pink-400">💡 Phân tích khẩu hình & nối âm chuyên sâu từ AI:</b><div class="mt-1 leading-relaxed">${esc(
                String(res).trim()
              )
                .replace(/\*\*(.+?)\*\*/g, '<b class="text-fg">$1</b>')
                .replace(/\n/g, '<br>')}</div>`;
            }
          } catch (e) {}
        }
      };
    }

    if (closeAiCoachBtn && aiCoachBox) {
      closeAiCoachBtn.onclick = () => {
        const curRec = recordingStore[recKey];
        if (curRec) curRec.showCoach = false;
        aiCoachBox.classList.add('hidden');
      };
    }

    // 12. Chế độ Dictation
    const dictInput = container.querySelector('#studio-dict-input');
    const dictFeedback = container.querySelector('#studio-dict-feedback');
    const dictHintBtn = container.querySelector('#studio-dict-hint-btn');
    const dictRevealBtn = container.querySelector('#studio-dict-reveal-btn');

    if (dictInput && dictFeedback) {
      dictInput.oninput = () => {
        const val = dictInput.value;
        const draftKey = `lis_dict_${lesson.id}_${curSegIdx}`;
        if (activeAppState && activeAppState.drafts) {
          activeAppState.drafts[draftKey] = val;
          global.LexiAcademy.saveState();
        }
        const cmp = global.LexiAcademy.compareTokens(combinedText, val);
        dictFeedback.innerHTML = `
          <div class="space-y-1.5">
            <div class="font-mono font-bold ${
              cmp.pct >= 85 ? 'text-emerald-400' : 'text-amber-300'
            }">
              Độ khớp chính tả: ${cmp.correctCount}/${cmp.total} từ (${cmp.pct}%)
            </div>
            <div class="flex flex-wrap gap-1">${cmp.html}</div>
          </div>
        `;
      };
    }

    if (dictHintBtn && dictInput) {
      dictHintBtn.onclick = () => {
        const targetWords = combinedText.split(/\s+/).filter(Boolean);
        const typedWords = dictInput.value.trim().split(/\s+/).filter(Boolean);
        const nextWord = targetWords[Math.min(typedWords.length, targetWords.length - 1)];
        if (nextWord) {
          dictInput.value = (dictInput.value.trim() + ' ' + nextWord).trim() + ' ';
          dictInput.dispatchEvent(new Event('input'));
          dictInput.focus();
        }
      };
    }

    if (dictRevealBtn) {
      dictRevealBtn.onclick = () => {
        showLeftSubs = !showLeftSubs;
        refreshStudioSlotsWithoutTouchingVideo();
      };
    }

    // 13. Chế độ Nghe VSTEP
    container.querySelectorAll('[data-vstep-q]').forEach((btn) => {
      btn.onclick = () => {
        const qIdx = Number(btn.getAttribute('data-vstep-q'));
        const optIdx = Number(btn.getAttribute('data-vstep-opt'));
        const ansKey = `${lesson.id}_${qIdx}`;
        vstepAnswersStore[ansKey] = optIdx;

        const qList = lesson.vstepQuestions || [];
        const allCorrect =
          qList.length > 0 &&
          qList.every((q, idx) => vstepAnswersStore[`${lesson.id}_${idx}`] === q.answer);
        if (allCorrect) {
          global.LexiAcademy.markDone(lesson.id);
        }
        refreshStudioSlotsWithoutTouchingVideo();
      };
    });

    container.querySelectorAll('[data-vstep-jump-seg]').forEach((btn) => {
      btn.onclick = () => {
        const targetIdx = Number(btn.getAttribute('data-vstep-jump-seg')) || 0;
        stopActiveRecording();
        clearKaraokeTimer();
        curSegIdx = Math.max(0, Math.min(segs.length - 1, targetIdx));
        activePopoverWord = null;
        refreshStudioSlotsWithoutTouchingVideo();
        scrollActiveSubtitleIntoView();
        playSentenceOrWordAt(null);
      };
    });

    // 14. Chỉnh tốc độ 0.5x | 0.75x | 1x | 1.25x | 1.5x & Chuyển câu
    container.querySelectorAll('[data-studio-speed]').forEach((spdBtn) => {
      spdBtn.onclick = () => {
        playbackSpeed = Number(spdBtn.getAttribute('data-studio-speed')) || 1.0;
        if (typeof global.setAudioPlaybackRate === 'function') {
          global.setAudioPlaybackRate(playbackSpeed);
        }
        sendYtCommand('setPlaybackRate', [playbackSpeed]);
        if (humanAudioEl) {
          humanAudioEl.playbackRate = playbackSpeed;
        }
        global.LexiAcademy.notify(`Đã chỉnh tốc độ phát: ${playbackSpeed}x`);
        refreshStudioSlotsWithoutTouchingVideo();
      };
    });

    const prevSegBtn = container.querySelector('#studio-prev-seg-btn');
    const nextSegBtn = container.querySelector('#studio-next-seg-btn');
    if (prevSegBtn) {
      prevSegBtn.onclick = () => {
        if (curSegIdx > 0) {
          stopActiveRecording();
          clearKaraokeTimer();
          curSegIdx--;
          activePopoverWord = null;
          refreshStudioSlotsWithoutTouchingVideo();
          scrollActiveSubtitleIntoView();
          playSentenceOrWordAt(null);
        }
      };
    }
    if (nextSegBtn) {
      nextSegBtn.onclick = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        activePopoverWord = null;
        const step = mergeNext ? 2 : 1;
        if (curSegIdx + step < segs.length) {
          curSegIdx += step;
          refreshStudioSlotsWithoutTouchingVideo();
          scrollActiveSubtitleIntoView();
          playSentenceOrWordAt(null);
        } else {
          global.LexiAcademy.markDone(lesson.id);
          global.LexiAcademy.notify('🎉 Chúc mừng! Bạn đã hoàn thành toàn bộ các câu trong bài học này.');
          refreshStudioSlotsWithoutTouchingVideo();
        }
      };
    }
  }

  function getItems(lv) {
    return getLessonsForLevel(lv);
  }

  global.LexiStudioHelpers = {
    lookupWordInfo,
    cleanWordToken,
    evaluateSpokenWords,
    buildAICoachFeedbackHTML,
    isSingleChannelMicDevice
  };

  if (global.LexiAcademy) {
    global.LexiAcademy.registerModule('listening', { render, bind, updateView, getItems });
  }
})(window);
