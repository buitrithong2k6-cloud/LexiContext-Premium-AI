/**
 * LexiContext Academy — Studio Luyện Nghe & Luyện Nói 3-Trong-1 (academy-listening.js)
 * Tích hợp:
 * - Bố cục Studio 2 Cột hiện đại (Trình phát Video YouTube Giọng Người Thật / Audio US + Danh sách câu bên trái | Khung thực hành câu bên phải)
 * - 3 Chế độ liên thông: 🗣️ Shadowing (Luyện nói) · ⌨️ Dictation (Chép chính tả) · 🎧 Nghe hiểu VSTEP (3-4 câu hỏi Tiếng Anh chuẩn đề thi)
 * - Đồng bộ Karaoke Thời Gian Thực (Real-time Word Highlighting) theo tiến độ Video YouTube & Audio US
 * - Phiên âm IPA chuẩn Oxford/Cambridge 100% dưới từng từ + Chạm từ bất kỳ để tra nghĩa & lưu vào Kho từ vựng 1-chạm
 * - Ghi âm giọng nói thật (MediaRecorder + SpeechRecognition), nghe lại băng ghi âm của chính mình,
 *   chấm từng từ bằng Thẻ Màu (Xanh ✓ / Vàng ▲ / Đỏ ✗) và Huấn luyện viên AI nhận xét phát âm 4 mục chi tiết
 * - Điều chỉnh tốc độ phát (0.5x · 0.75x · 1.0x · 1.25x · 1.5x), Ghép câu kế tiếp (1/2) & Nút Tách cụm 2 chế độ
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
          'Nghe kỹ giọng người thật trong Video hoặc bấm "🔊 Nghe US" / "Tách cụm" để luyện nhịp thở và nối âm tự nhiên.'
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
  let studioMode = 'shadowing'; // 'shadowing' | 'dictation' | 'vstep'
  let mediaTab = 'video'; // Mặc định ưu tiên 'video' nếu bài học có youtubeId
  let leftSubTab = 'subtitles'; // 'subtitles' | 'guide'
  let showIPA = true;
  let showTrans = true;
  let showLeftSubs = true;
  let loopSegment = false;
  let mergeNext = false; // Ghép câu kế tiếp (1/2 -> 2/2)
  let playbackSpeed = 1.0;

  // Trạng thái từ đang mở Popover tra nghĩa
  let activePopoverWord = null;

  // Trạng thái Ghi âm giọng thật & Nhận diện giọng nói Đa Thiết Bị (iOS/iPadOS, Android, Windows/Mac)
  let isRecording = false;
  let isAudioOnlyRecording = false;
  let recordSeconds = 0;
  let recordTimerId = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let speechRec = null;
  let liveTranscript = '';

  // Tự động dọn dữ liệu bài tự nhập cũ bị lỗi Lỗi 153 / thiếu dịch câu trong localStorage (nếu có từ phiên bản cũ)
  try {
    localStorage.removeItem('lexicontext_studio_custom_lessons_v1');
  } catch (e) {}

  // Phát hiện thiết bị iOS / iPadOS / Safari (nơi getUserMedia khóa kênh Micro nếu bật cùng lúc với SpeechRecognition)
  function isSingleChannelMicDevice() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isAppleTouch =
      /iPad|iPhone|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafariEngine = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
    return isAppleTouch || isSafariEngine;
  }

  // Bộ nhớ kết quả thu âm theo từng câu: key = `${lesson.id}_${segIdx}_${mergeNext ? 2 : 1}`
  const recordingStore = {};

  // Bộ nhớ đáp án đã chọn cho bộ câu hỏi VSTEP: key = `${lesson.id}_${qIdx}`
  const vstepAnswersStore = {};

  // Quản lý Trình phát YouTube IFrame API (Giọng người thật + Karaoke chữ chạy thời gian thực)
  let ytApiLoaded = false;
  let ytPlayer = null;
  let ytPlayerReady = false;
  let currentYtVideoId = '';
  let preservedYtWrapEl = null;
  let karaokeTimerId = null;
  let activeHighlightedWordIdx = -1;

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

  // Tự động tra cứu phiên âm IPA chuẩn từ DictionaryAPI nếu gặp từ hiếm chưa có trong từ điển tĩnh
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
          // Cập nhật ngay trên giao diện mà không cần render lại toàn trang
          document.querySelectorAll(`[data-studio-ipa-word="${cleanWord}"]`).forEach((el) => {
            el.textContent = `/${cleanIpa}/`;
          });
        }
      })
      .catch(() => {});
  }

  // Tìm từ trong Kho từ vựng cá nhân hoặc Từ điển chuẩn Oxford/Cambridge
  function lookupWordInfo(rawWord) {
    const clean = cleanWordToken(rawWord);
    if (!clean) {
      return { word: rawWord, ipa: '', pos: 'word', vi: '', ex: '' };
    }

    // 1. Tìm trong Kho từ vựng cá nhân (LocalStorage)
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

    // 2. Tìm trong từ điển tổng hợp (bao gồm /listening-lessons-data.js)
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

    // 3. Kích hoạt tra cứu IPA chuẩn trực tuyến cho từ hiếm và dùng bộ quy tắc IPA dự phòng
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

  // Quản lý hiệu ứng tô sáng từng từ theo thời gian thực (Karaoke Sync)
  function clearKaraokeTimer() {
    if (karaokeTimerId) {
      clearInterval(karaokeTimerId);
      karaokeTimerId = null;
    }
    if (activeHighlightedWordIdx !== -1) {
      document.querySelectorAll('[data-studio-word-idx]').forEach((btn) => {
        btn.classList.remove(
          'bg-emerald-500/25',
          'ring-2',
          'ring-emerald-400',
          'scale-105',
          'shadow-md'
        );
      });
      activeHighlightedWordIdx = -1;
    }
    const statusEl = document.getElementById('studio-live-sync-badge');
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.classList.add('hidden');
    }
  }

  function highlightWordAtIndex(wIdx, labelText) {
    if (wIdx !== activeHighlightedWordIdx) {
      document.querySelectorAll('[data-studio-word-idx]').forEach((btn) => {
        const idx = Number(btn.getAttribute('data-studio-word-idx'));
        if (idx === wIdx) {
          btn.classList.add(
            'bg-emerald-500/25',
            'ring-2',
            'ring-emerald-400',
            'scale-105',
            'shadow-md'
          );
        } else {
          btn.classList.remove(
            'bg-emerald-500/25',
            'ring-2',
            'ring-emerald-400',
            'scale-105',
            'shadow-md'
          );
        }
      });
      activeHighlightedWordIdx = wIdx;
    }
    const statusEl = document.getElementById('studio-live-sync-badge');
    if (statusEl && labelText) {
      statusEl.textContent = labelText;
      statusEl.classList.remove('hidden');
    }
  }

  // Nạp YouTube IFrame Player API để điều khiển phát giọng người thật theo đúng mốc startSec -> endSec
  function ensureYouTubeIframeAPI(onReadyCallback) {
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

  function mountOrUpdateYouTubePlayer(videoId, startSec, endSec, fallbackText, wordsCount) {
    const stageEl = document.getElementById('studio-yt-stage');
    if (!stageEl || !videoId) return;

    // Nếu đã có trình phát YouTube của đúng videoId này, gắn lại vào stage để giữ nguyên trạng thái đã mở khóa âm thanh
    if (preservedYtWrapEl && currentYtVideoId === videoId && ytPlayer) {
      if (!stageEl.contains(preservedYtWrapEl)) {
        stageEl.innerHTML = '';
        stageEl.appendChild(preservedYtWrapEl);
      }
      return;
    }

    // Nếu đổi sang bài học có videoId khác, hủy player cũ và tạo mới
    if (ytPlayer && typeof ytPlayer.destroy === 'function') {
      try {
        ytPlayer.destroy();
      } catch (e) {}
    }
    ytPlayer = null;
    ytPlayerReady = false;
    currentYtVideoId = videoId;

    const wrap = document.createElement('div');
    wrap.id = 'studio-yt-player-wrap';
    wrap.className = 'w-full h-full';

    // Khởi tạo trực tiếp thẻ <iframe> với tên miền youtube-nocookie.com và thuộc tính referrerpolicy="strict-origin-when-cross-origin"
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
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
      videoId
    )}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&start=${Math.floor(
      startSec || 0
    )}${originQuery}`;

    wrap.appendChild(iframe);
    stageEl.innerHTML = '';
    stageEl.appendChild(wrap);
    preservedYtWrapEl = wrap;

    ensureYouTubeIframeAPI(() => {
      if (!document.getElementById('studio-yt-player-instance')) return;
      try {
        ytPlayer = new global.YT.Player('studio-yt-player-instance', {
          host: 'https://www.youtube-nocookie.com',
          events: {
            onReady: function () {
              ytPlayerReady = true;
              try {
                if (typeof ytPlayer.setPlaybackRate === 'function') {
                  ytPlayer.setPlaybackRate(playbackSpeed);
                }
              } catch (e) {}
            },
            onError: function () {
              // Tự động chuyển sang chế độ Âm thanh Chuẩn + Karaoke nếu mạng hoặc chủ kênh chặn nhúng trên thiết bị hiện tại
              ytPlayerReady = false;
              mediaTab = 'audio';
              if (global.LexiAcademy && typeof global.LexiAcademy.notify === 'function') {
                global.LexiAcademy.notify(
                  'Video này giới hạn nhúng trực tiếp trên trình duyệt hiện tại — Đã tự động chuyển sang Chế độ Phát Chuẩn kèm chữ chạy Karaoke!'
                );
              }
              if (global.LexiAcademy && typeof global.LexiAcademy.render === 'function') {
                global.LexiAcademy.render();
              }
              if (fallbackText) {
                playSentenceUSWithKaraoke(fallbackText, wordsCount || 8);
              }
            }
          }
        });
      } catch (e) {}
    });
  }

  // Phát câu hiện tại bằng Giọng Người Thật trong Video YouTube + chạy chữ Karaoke thời gian thực
  function playYouTubeSegmentHumanVoice(startSec, endSec, wordsCount, fallbackText) {
    clearKaraokeTimer();
    if (typeof global.stopAudioPlayback === 'function') {
      global.stopAudioPlayback();
    }

    const totalWords = Math.max(1, Number(wordsCount) || 1);
    const sSec = Math.max(0, Number(startSec) || 0);
    const eSec = Math.max(sSec + 1.5, Number(endSec) || sSec + 5);
    const segDuration = eSec - sSec;

    if (ytPlayer && ytPlayerReady && typeof ytPlayer.seekTo === 'function') {
      try {
        if (typeof ytPlayer.setPlaybackRate === 'function') {
          ytPlayer.setPlaybackRate(playbackSpeed);
        }
        ytPlayer.seekTo(sSec, true);
        ytPlayer.playVideo();

        karaokeTimerId = setInterval(() => {
          if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') {
            clearKaraokeTimer();
            return;
          }
          const curT = Number(ytPlayer.getCurrentTime()) || 0;
          const playerState =
            typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : 1;

          if (curT >= sSec - 0.25 && curT <= eSec + 0.15) {
            const progress = Math.max(0, Math.min(0.999, (curT - sSec) / segDuration));
            const wIdx = Math.floor(progress * totalWords);
            highlightWordAtIndex(
              wIdx,
              `🎬 Giọng người thật: ${curT.toFixed(1)}s / ${eSec.toFixed(1)}s`
            );
          }

          if (curT >= eSec) {
            if (loopSegment) {
              ytPlayer.seekTo(sSec, true);
              ytPlayer.playVideo();
            } else {
              try {
                ytPlayer.pauseVideo();
              } catch (e) {}
              clearKaraokeTimer();
            }
          } else if (playerState === 2 || playerState === 0) {
            // Đã tạm dừng hoặc kết thúc
            if (curT > sSec + 0.4) {
              clearKaraokeTimer();
            }
          }
        }, 60);
        return true;
      } catch (e) {}
    }

    // Nếu trình phát YouTube đang khởi tạo lần đầu, chờ sẵn sàng rồi phát ngay
    if (fallbackText) {
      ensureYouTubeIframeAPI(() => {
        setTimeout(() => {
          if (ytPlayer && ytPlayerReady) {
            playYouTubeSegmentHumanVoice(startSec, endSec, wordsCount, '');
          }
        }, 350);
      });
    }
    return false;
  }

  // Phát câu hiện tại bằng Giọng Chuẩn Mỹ (🔊 Nghe US) kèm hiệu ứng chữ chạy sáng thời gian thực
  function playSentenceUSWithKaraoke(text, wordsCount) {
    clearKaraokeTimer();
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
      try {
        ytPlayer.pauseVideo();
      } catch (e) {}
    }
    if (typeof global.setAudioPlaybackRate === 'function') {
      global.setAudioPlaybackRate(playbackSpeed);
    }

    const totalWords = Math.max(1, Number(wordsCount) || 1);
    const startTs = Date.now();
    const estimatedDurationMs = Math.max(1600, (totalWords * 370) / (playbackSpeed || 1));

    karaokeTimerId = setInterval(() => {
      const sharedAudio =
        typeof global.getSharedAudioElement === 'function' ? global.getSharedAudioElement() : null;
      let progress = 0;
      if (
        sharedAudio &&
        !sharedAudio.paused &&
        sharedAudio.duration &&
        isFinite(sharedAudio.duration) &&
        sharedAudio.duration > 0.3
      ) {
        progress = Math.max(0, Math.min(0.999, sharedAudio.currentTime / sharedAudio.duration));
      } else {
        const elapsed = Date.now() - startTs;
        progress = Math.max(0, Math.min(0.999, elapsed / estimatedDurationMs));
      }
      const wIdx = Math.floor(progress * totalWords);
      highlightWordAtIndex(wIdx, `🔊 Đang đọc chuẩn US (${playbackSpeed}x)...`);
    }, 60);

    if (typeof global.speakUS === 'function') {
      global.speakUS(text, {
        onComplete: () => {
          clearKaraokeTimer();
          if (loopSegment) {
            setTimeout(() => {
              if (loopSegment) playSentenceUSWithKaraoke(text, wordsCount);
            }, 650);
          }
        }
      });
    }
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

  // So khớp câu mục tiêu và câu người học đọc thành mảng Thẻ từ Xanh (correct) / Vàng (near) / Đỏ (wrong)
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

  // Tạo nội dung nhận xét phát âm 4 mục chi tiết
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
    const list = getLessonsForLevel(lv);
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

  function render(lv, state) {
    // Tạm tách khung YouTube Player trước khi cập nhật DOM để trình phát không bị tải lại
    if (preservedYtWrapEl && preservedYtWrapEl.parentNode) {
      preservedYtWrapEl.parentNode.removeChild(preservedYtWrapEl);
    }

    const esc = global.LexiAcademy.esc;
    const ctx = getActiveLessonAndSegment(lv);
    const {
      list,
      lesson,
      segs,
      combinedText,
      combinedVi,
      startSec,
      endSec,
      ipaNote,
      savedRec
    } = ctx;

    const wordsArr = combinedText.split(/\s+/).filter(Boolean);
    const stats = calcLessonStats(lesson);
    const progressPct = segs.length ? Math.round((stats.doneCount / segs.length) * 100) : 0;

    const draftKey = `lis_dict_${lesson.id}_${curSegIdx}`;
    const savedDictation =
      state && state.drafts && state.drafts[draftKey] ? state.drafts[draftKey] : '';
    const dictResult = savedDictation
      ? global.LexiAcademy.compareTokens(combinedText, savedDictation)
      : null;

    // Tạo giao diện từng từ kèm IPA chuẩn Oxford/Cambridge bên dưới (hỗ trợ Karaoke Highlight & chạm từ tra nghĩa)
    const interactiveWordsHTML = wordsArr
      .map((rawW, wIdx) => {
        const cleanW = cleanWordToken(rawW);
        const info = lookupWordInfo(cleanW);
        const isPopOpen = activePopoverWord && activePopoverWord.idx === wIdx;
        const cleanIpaDisplay = stripSlashes(info.ipa || cleanW);
        return `
          <button
            type="button"
            data-studio-word="${esc(rawW)}"
            data-studio-word-idx="${wIdx}"
            class="group inline-flex flex-col items-center px-1.5 py-1 rounded-lg transition-all duration-150 cursor-pointer select-none ${
              isPopOpen
                ? 'bg-pink-500/20 ring-1 ring-pink-400/60'
                : 'hover:bg-line/30'
            }"
            title="Chạm để nghe phát âm & tra nghĩa từ '${esc(cleanW)}'"
          >
            <span class="text-base sm:text-lg font-bold tracking-tight ${
              isPopOpen ? 'text-pink-400' : 'text-fg group-hover:text-pri'
            }">${esc(rawW)}</span>
            ${
              showIPA
                ? `<span data-studio-ipa-word="${esc(
                    cleanW
                  )}" class="text-[11px] font-mono text-sky-300/85 leading-tight mt-0.5">/${esc(
                    cleanIpaDisplay
                  )}/</span>`
                : ''
            }
          </button>
        `;
      })
      .join('');

    // Thẻ Từ Điển Nổi (Popover) khi người dùng bấm vào 1 từ bất kỳ trong câu
    let wordPopoverHTML = '';
    if (activePopoverWord) {
      const pInfo = lookupWordInfo(activePopoverWord.word);
      wordPopoverHTML = `
        <div id="studio-word-popover" class="inset p-3.5 rounded-xl border border-pink-500/40 bg-pink-500/5 space-y-2 text-xs shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2">
            <div class="flex items-center gap-2">
              <b class="text-base text-fg font-bold">${esc(pInfo.word)}</b>
              <span class="font-mono text-pink-400">/${esc(stripSlashes(pInfo.ipa))}/</span>
              <span class="text-mute italic">(${esc(pInfo.pos)})</span>
              <button type="button" data-pop-speak="${esc(
                pInfo.word
              )}" class="px-2 py-0.5 rounded-md border border-sky-400/40 bg-sky-500/10 text-sky-300 font-mono font-bold hover:bg-sky-500/20">
                🔊 US
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
                class="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-bold hover:bg-pink-500/30 whitespace-nowrap"
              >
                ${pInfo.inVault ? '✓ Đã có trong Kho từ' : '⭐ Lưu vào Kho từ vựng'}
              </button>
              <button type="button" id="studio-pop-close" class="px-2 py-1 rounded-lg border border-line text-mute hover:text-fg">✕</button>
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

    // Tạo các ô từ ẩn [ •••• ] hoặc Thẻ từ chấm điểm Xanh (✓) / Vàng (▲) / Đỏ (✗)
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

    // Tạo danh sách 3-4 câu hỏi Nghe hiểu VSTEP bằng Tiếng Anh (100% English Questions & Options)
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
      <div class="space-y-4">
        <!-- THANH CÔNG CỤ STUDIO TRÊN ĐỈNH: CHỌN BÀI HỌC + 3 CHẾ ĐỘ (SHADOWING | DICTATION | NGHE VSTEP) -->
        <div class="card p-3.5 sm:p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <!-- Bên trái: Chọn bài học từ Kho listening-lessons-data.js -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-bold text-pink-400">🎙️ Talk Studio (${lv})</span>
              <select id="studio-lesson-select" class="inp !w-auto !py-1.5 !px-3 !text-xs font-semibold max-w-[280px] sm:max-w-[420px]">
                ${list
                  .map(
                    (it, idx) =>
                      `<option value="${idx}" ${idx === curLessonIdx ? 'selected' : ''}>${
                        idx + 1
                      }. ${esc(it.title)} (${it.segments.length} câu${
                        it.youtubeId ? ' · 🎬 Video thật' : ''
                      })</option>`
                  )
                  .join('')}
              </select>
            </div>

            <!-- Bên phải: Bộ chuyển đổi 3 Chế độ -->
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
        </div>

        <!-- BỐ CỤC STUDIO 2 CỘT (TRÁI 5/12: MEDIA & DANH SÁCH CÂU #1..#N | PHẢI 7/12: KHÔNG GIAN TƯƠNG TÁC CÂU) -->
        <div class="grid lg:grid-cols-12 gap-4 items-start">
          
          <!-- ================= CỘT TRÁI (5/12): VIDEO / AUDIO PLAYER & DANH SÁCH CÂU ================= -->
          <div class="lg:col-span-5 card p-4 space-y-3.5">
            <!-- Thanh chuyển đổi Video / Âm thanh -->
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
                  🔊 Âm thanh US
                </button>
              </div>
            </div>

            <!-- Khung Media Stage (Trình phát YouTube IFrame API đồng bộ chữ chạy hoặc US Neural Audio Stage) -->
            ${
              mediaTab === 'video' && lesson.youtubeId
                ? `
              <div class="space-y-2">
                <div class="relative rounded-xl overflow-hidden border border-line bg-black aspect-video">
                  <div id="studio-yt-stage" class="w-full h-full"></div>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                  <button
                    type="button"
                    id="studio-jump-first-btn"
                    class="px-2.5 py-1.5 rounded-lg border border-line bg-inset text-fg text-[11px] font-semibold hover:border-pri whitespace-nowrap cursor-pointer"
                  >
                    ⏮ Đi đến câu #1
                  </button>
                  <button
                    type="button"
                    id="studio-play-yt-seg-btn"
                    class="px-3 py-1.5 rounded-lg bg-pink-600 text-white text-[11px] font-bold hover:bg-pink-500 whitespace-nowrap cursor-pointer shadow"
                  >
                    ▶ Phát giọng người thật #${curSegIdx + 1} (${startSec}s–${endSec}s)
                  </button>
                </div>
              </div>
            `
                : `
              <div class="inset p-4 rounded-xl border border-line/70 space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <div class="text-[11px] font-mono text-pink-400 font-bold">
                      CÂU #${curSegIdx + 1}${mergeNext ? ' + #' + (curSegIdx + 2) : ''} · CHUẨN MỸ (US NEURAL)
                    </div>
                    <div class="text-xs text-mute mt-0.5">
                      Tốc độ hiện tại: <b class="font-mono text-fg">${playbackSpeed}x</b> · Mốc: <span class="font-mono">${startSec}s – ${endSec}s</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      id="studio-jump-first-btn"
                      class="btn !py-1.5 !px-2.5 !text-xs whitespace-nowrap"
                      title="Quay về câu #1"
                    >
                      ⏮ Câu #1
                    </button>
                    <button
                      type="button"
                      id="studio-left-play-us"
                      class="btn btn-pri !py-1.5 !px-3 !text-xs font-bold whitespace-nowrap"
                    >
                      🔊 Nghe US
                    </button>
                  </div>
                </div>
                ${
                  lesson.youtubeId
                    ? `<div class="text-[11px] text-mute flex items-center justify-between pt-1 border-t border-line/40">
                         <span>Bài này có sẵn Video người thật:</span>
                         <button type="button" data-studio-media="video" class="text-pink-400 font-semibold hover:underline">Mở Video YouTube gốc →</button>
                       </div>`
                    : ''
                }
              </div>
            `
            }

            <!-- Thanh Phụ đề / Gợi ý bài học + Tiến độ & Độ chính xác -->
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

              <!-- Dòng Tiến độ & Độ chính xác -->
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

            <!-- Danh sách câu thoại #1, #2, #3... hoặc Gợi ý bài học -->
            ${
              leftSubTab === 'subtitles'
                ? `
              <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                ${segs
                  .map((seg, idx) => {
                    const isCurrent =
                      idx === curSegIdx || (mergeNext && idx === curSegIdx + 1);
                    const segRec =
                      recordingStore[`${lesson.id}_${idx}_1`] ||
                      recordingStore[`${lesson.id}_${idx}_2`];
                    return `
                      <div
                        data-studio-seg="${idx}"
                        class="p-3 rounded-xl border transition cursor-pointer ${
                          isCurrent
                            ? 'border-pink-500/70 bg-pink-500/10 ring-1 ring-pink-500/40'
                            : 'border-line/60 bg-inset/40 hover:bg-inset/80'
                        }"
                      >
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <div class="flex items-center gap-1.5">
                            <span class="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                              isCurrent
                                ? 'bg-pink-500 text-white'
                                : 'bg-line/60 text-mute'
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
                          ${esc(seg.text)}
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
                  <b class="text-pri">🎯 Mẹo thi VSTEP Listening & Speaking:</b>
                  <p class="text-mute mt-0.5">
                    Bấm vào từng câu bên trái hoặc nút <b>▶</b> để nghe giọng người thật trong Video kèm chữ chạy sáng theo thời gian thực, chạm vào từ bất kỳ để tra nghĩa, sau đó bấm <b>🎙️ Ghi âm</b> để chấm độ khớp từng từ.
                  </p>
                </div>
              </div>
            `
            }
          </div>

          <!-- ================= CỘT PHẢI (7/12): KHÔNG GIAN THỰC HÀNH CÂU & CHẤM ĐIỂM ================= -->
          <div class="lg:col-span-7 space-y-4">
            <div class="card p-4 sm:p-5 space-y-4">
              
              <!-- Thanh điều khiển trên cùng của Cột Phải: #1 | N từ | Ghép câu kế tiếp (1/2) | IPA | Dịch nghĩa | Nghe US | Tách cụm -->
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-mono text-xs font-bold">
                    #${curSegIdx + 1}${mergeNext && curSegIdx + 1 < segs.length ? '+' + (curSegIdx + 2) : ''}
                  </span>
                  <span class="px-2 py-1 rounded-lg bg-inset text-mute font-mono text-xs tabular-nums">
                    ${wordsArr.length} từ
                  </span>
                  <span id="studio-live-sync-badge" class="hidden px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold"></span>
                  ${
                    curSegIdx < segs.length - 1
                      ? `
                    <button
                      type="button"
                      id="studio-merge-next-btn"
                      class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
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
                    class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
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
                    class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
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
                    class="px-3 py-1 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs font-bold hover:bg-sky-500/20 whitespace-nowrap"
                    title="Nghe câu chuẩn giọng Mỹ (US)"
                  >
                    🔊 Nghe US
                  </button>
                  <button
                    type="button"
                    id="studio-toggle-chunk-btn"
                    class="px-3 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 whitespace-nowrap"
                    title="Ẩn/hiện khung Tách cụm (Đọc cả câu dừng 1.5s giữa các cụm hoặc chọn cụm để nghe)"
                  >
                    Tách cụm
                  </button>
                </div>
              </div>

              <!-- VÙNG HIỂN THỊ CÂU MẪU + PHIÊN ÂM IPA DƯỚI TỪNG TỪ + BẢN DỊCH TIẾNG VIỆT TRỌN CÂU -->
              <div class="inset p-4 rounded-2xl border border-line/80 space-y-3">
                <div class="flex flex-wrap items-end gap-x-1.5 gap-y-2 leading-relaxed ${
                  studioMode === 'dictation' && !showLeftSubs ? 'blur-md select-none' : ''
                }">
                  ${interactiveWordsHTML}
                </div>

                ${
                  showTrans && combinedVi
                    ? `
                  <div class="pt-2.5 border-t border-line/50 text-xs sm:text-sm text-emerald-400 font-medium leading-relaxed">
                    🇻🇳 <b>Dịch câu:</b> ${esc(combinedVi)}
                  </div>
                `
                    : ''
                }

                <div class="flex items-center justify-between text-[11px] text-mute pt-1">
                  <span>📖 Chạm vào từ bất kỳ để tra nghĩa & lưu Kho từ · Khi phát Video/Audio các từ sẽ tự sáng theo thời gian thực</span>
                </div>
              </div>

              <!-- THẺ TỪ ĐIỂN NỔI (POPOVER) KHI CHẠM VÀO TỪ -->
              ${wordPopoverHTML}

              <!-- KHUNG TÁCH CỤM (ẨN/HIỆN KHI BẤM NÚT "TÁCH CỤM" - GỒM 2 CHẾ ĐỘ) -->
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
                      class="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 whitespace-nowrap"
                    >
                      ▶ Đọc cả câu (Dừng 1.5s giữa các cụm)
                    </button>
                    <button
                      type="button"
                      id="studio-chunk-stop"
                      class="px-2 py-1 rounded-lg border border-line text-mute hover:text-fg whitespace-nowrap"
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

              <!-- ================= NỘI DUNG TƯƠNG TÁC THEO CHẾ ĐỘ (SHADOWING | DICTATION | NGHE VSTEP) ================= -->
              ${
                studioMode === 'shadowing'
                  ? `
                <!-- CHẾ ĐỘ 1: SHADOWING & GHI ÂM CHẤM THẺ TỪ XANH / VÀNG / ĐỎ ĐA THIẾT BỊ -->
                <div class="space-y-3.5 pt-1">
                  <!-- Khu vực Nút Bấm Đọc Chấm Điểm & Thu Băng Giọng Thật (Tối ưu cho cả Điện thoại, iPad và Laptop/PC) -->
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

                  <!-- Ô nhập nhanh bằng Mic bàn phím (Hoạt động trên 100% thiết bị) -->
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

                  <!-- Kết quả Ghi âm: Thanh nghe lại giọng của chính mình + Thẻ từ Xanh/Vàng/Đỏ + Nút AI Nhận xét -->
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

                    <!-- Danh sách ô [ •••• ] hoặc Thẻ từ Xanh ✓ / Vàng ▲ / Đỏ ✗ -->
                    <div class="flex flex-wrap items-center gap-2 pt-1">
                      ${wordSlotsHTML}
                    </div>

                    ${
                      savedRec
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

                  <!-- KHUNG AI HUẤN LUYỆN PHÁT ÂM (4 MỤC) -->
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
                      <button type="button" id="studio-close-ai-coach" class="text-xs text-mute hover:text-fg px-2 py-0.5 rounded border border-line">Đóng</button>
                    </div>
                    <div id="studio-ai-coach-content">
                      ${savedRec && savedRec.aiCoachHtml ? savedRec.aiCoachHtml : ''}
                    </div>
                  </div>
                </div>
              `
                  : studioMode === 'dictation'
                  ? `
                <!-- CHẾ ĐỘ 2: DICTATION (NGHE CHÉP CHÍNH TẢ TỪNG CÂU) -->
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
                <!-- CHẾ ĐỘ 3: BỘ 3-4 CÂU HỎI TRẮC NGHIỆM TIẾNG ANH CHUẨN VSTEP LISTENING + GIẢI THÍCH ĐÁP ÁN -->
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

              <!-- THANH ĐIỀU KHIỂN ĐÁY: PHÁT CÂU HIỆN TẠI + CHỈNH TỐC ĐỘ (0.5x - 1.5x) & CHUYỂN CÂU -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
                <div class="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    id="studio-bottom-play-btn"
                    class="w-9 h-9 rounded-xl bg-pink-500 text-white font-bold flex items-center justify-center hover:bg-pink-600 transition cursor-pointer mr-1"
                    title="Phát câu hiện tại (Ưu tiên giọng người thật từ Video YouTube kèm chữ chạy sáng thời gian thực)"
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
          </div>

        </div>
      </div>
    `;
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
    const esc = global.LexiAcademy.esc;
    const ctx = getActiveLessonAndSegment(lv);
    const { lesson, segs, combinedText, startSec, endSec, recKey } = ctx;
    const wordsCount = combinedText.split(/\s+/).filter(Boolean).length;

    // Gắn hoặc cập nhật trình phát YouTube IFrame API (youtube-nocookie.com + strict-origin-when-cross-origin)
    if (mediaTab === 'video' && lesson.youtubeId) {
      mountOrUpdateYouTubePlayer(lesson.youtubeId, startSec, endSec, combinedText, wordsCount);
    }

    // Hàm phát câu thông minh: Ưu tiên phát giọng người thật từ Video YouTube (nếu đang mở tab Video), ngược lại phát US Neural
    const playActiveSegmentPreferredVoice = () => {
      if (mediaTab === 'video' && lesson.youtubeId) {
        const ok = playYouTubeSegmentHumanVoice(startSec, endSec, wordsCount, combinedText);
        if (ok) return;
      }
      playSentenceUSWithKaraoke(combinedText, wordsCount);
    };

    // 1. Chọn bài học
    const lessonSelect = container.querySelector('#studio-lesson-select');
    if (lessonSelect) {
      lessonSelect.onchange = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        curLessonIdx = Number(lessonSelect.value) || 0;
        curSegIdx = 0;
        mergeNext = false;
        activePopoverWord = null;
        const nextList = getLessonsForLevel(lv);
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
        global.LexiAcademy.render();
      };
    });

    // 3. Chuyển đổi Video thật / Âm thanh US ở cột trái
    container.querySelectorAll('[data-studio-media]').forEach((btn) => {
      btn.onclick = () => {
        clearKaraokeTimer();
        mediaTab = btn.getAttribute('data-studio-media') || 'audio';
        if (mediaTab === 'audio' && ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
          try {
            ytPlayer.pauseVideo();
          } catch (e) {}
        }
        global.LexiAcademy.render();
      };
    });

    // 4. Chuyển tab Phụ đề / Gợi ý bài học ở cột trái
    container.querySelectorAll('[data-studio-left-tab]').forEach((btn) => {
      btn.onclick = () => {
        leftSubTab = btn.getAttribute('data-studio-left-tab') || 'subtitles';
        global.LexiAcademy.render();
      };
    });

    // 5. Công tắc Lặp lại câu & Hiện chữ
    const loopToggle = container.querySelector('#studio-loop-toggle');
    if (loopToggle) {
      loopToggle.onchange = () => {
        loopSegment = !!loopToggle.checked;
      };
    }
    const subsToggle = container.querySelector('#studio-subs-toggle');
    if (subsToggle) {
      subsToggle.onchange = () => {
        showLeftSubs = !!subsToggle.checked;
        global.LexiAcademy.render();
      };
    }

    // 6. Bấm chọn câu #1, #2, #3... ở cột trái -> Phát ngay giọng người thật trong Video (hoặc US Audio) + chạy chữ Karaoke
    container.querySelectorAll('[data-studio-seg]').forEach((card) => {
      card.onclick = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        curSegIdx = Number(card.getAttribute('data-studio-seg')) || 0;
        activePopoverWord = null;
        global.LexiAcademy.render();
        const nextCtx = getActiveLessonAndSegment(lv);
        const nextWordsCount = nextCtx.combinedText.split(/\s+/).filter(Boolean).length;
        if (mediaTab === 'video' && nextCtx.lesson.youtubeId) {
          playYouTubeSegmentHumanVoice(
            nextCtx.startSec,
            nextCtx.endSec,
            nextWordsCount,
            nextCtx.combinedText
          );
        } else {
          playSentenceUSWithKaraoke(nextCtx.combinedText, nextWordsCount);
        }
      };
    });

    // 7. Nút Đi đến câu đầu & Phát câu hiện tại
    const jumpFirstBtn = container.querySelector('#studio-jump-first-btn');
    if (jumpFirstBtn) {
      jumpFirstBtn.onclick = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        curSegIdx = 0;
        activePopoverWord = null;
        global.LexiAcademy.render();
        const firstCtx = getActiveLessonAndSegment(lv);
        const firstWordsCount = firstCtx.combinedText.split(/\s+/).filter(Boolean).length;
        if (mediaTab === 'video' && firstCtx.lesson.youtubeId) {
          playYouTubeSegmentHumanVoice(
            firstCtx.startSec,
            firstCtx.endSec,
            firstWordsCount,
            firstCtx.combinedText
          );
        } else {
          playSentenceUSWithKaraoke(firstCtx.combinedText, firstWordsCount);
        }
      };
    }

    const leftPlayUsBtn = container.querySelector('#studio-left-play-us');
    if (leftPlayUsBtn) {
      leftPlayUsBtn.onclick = () => playSentenceUSWithKaraoke(combinedText, wordsCount);
    }

    const speakUsBtn = container.querySelector('#studio-speak-us-btn');
    if (speakUsBtn) {
      speakUsBtn.onclick = () => playSentenceUSWithKaraoke(combinedText, wordsCount);
    }

    const bottomPlayBtn = container.querySelector('#studio-bottom-play-btn');
    if (bottomPlayBtn) {
      bottomPlayBtn.onclick = playActiveSegmentPreferredVoice;
    }

    const playYtSegBtn = container.querySelector('#studio-play-yt-seg-btn');
    if (playYtSegBtn) {
      playYtSegBtn.onclick = () => {
        playYouTubeSegmentHumanVoice(startSec, endSec, wordsCount, combinedText);
      };
    }

    // 8. Nút Ghép câu kế tiếp (1/2 -> 2/2), IPA, Dịch nghĩa
    const mergeNextBtn = container.querySelector('#studio-merge-next-btn');
    if (mergeNextBtn) {
      mergeNextBtn.onclick = () => {
        stopActiveRecording();
        clearKaraokeTimer();
        mergeNext = !mergeNext;
        activePopoverWord = null;
        global.LexiAcademy.render();
      };
    }

    const toggleIpaBtn = container.querySelector('#studio-toggle-ipa');
    if (toggleIpaBtn) {
      toggleIpaBtn.onclick = () => {
        showIPA = !showIPA;
        global.LexiAcademy.render();
      };
    }

    const toggleTransBtn = container.querySelector('#studio-toggle-trans');
    if (toggleTransBtn) {
      toggleTransBtn.onclick = () => {
        showTrans = !showTrans;
        global.LexiAcademy.render();
      };
    }

    // 9. Chạm vào từng từ trên câu để mở Thẻ Từ Điển Nổi (Popover) + Phát âm từ đó + Lưu Kho từ
    container.querySelectorAll('[data-studio-word]').forEach((wBtn) => {
      wBtn.onclick = () => {
        const rawW = wBtn.getAttribute('data-studio-word') || '';
        const wIdx = Number(wBtn.getAttribute('data-studio-word-idx'));
        const cleanW = cleanWordToken(rawW);
        if (cleanW && typeof global.playSingleChunkUS === 'function') {
          global.playSingleChunkUS(cleanW);
        }
        if (activePopoverWord && activePopoverWord.idx === wIdx) {
          activePopoverWord = null;
        } else {
          activePopoverWord = { word: cleanW || rawW, idx: wIdx };
        }
        global.LexiAcademy.render();
      };
    });

    const popCloseBtn = container.querySelector('#studio-pop-close');
    if (popCloseBtn) {
      popCloseBtn.onclick = () => {
        activePopoverWord = null;
        global.LexiAcademy.render();
      };
    }

    container.querySelectorAll('[data-pop-speak]').forEach((b) => {
      b.onclick = () => {
        const w = b.getAttribute('data-pop-speak');
        if (w && typeof global.playSingleChunkUS === 'function') {
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
            cefr: lv,
            topic: lesson.category
          },
          popSaveWordBtn
        );
      };
    }

    // 10. Nút "Tách cụm" (Ẩn/hiện khung 2 chế độ: Đọc cả câu dừng 1.5s giữa các cụm hoặc chọn cụm để nghe)
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
          'px-2.5 py-1.5 rounded-lg border border-line bg-inset/80 text-fg hover:border-amber-400/60 transition font-mono text-xs text-left';
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
          <button type="button" data-studio-chunk-idx="${i}" class="px-2.5 py-1.5 rounded-lg border border-line bg-inset/80 text-fg hover:border-amber-400/60 transition font-mono text-xs text-left">
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
          resetChunkHighlight();
          b.className =
            'px-2.5 py-1.5 rounded-lg border border-sky-400 bg-sky-500/20 text-sky-200 ring-2 ring-sky-400/60 transition font-mono text-xs text-left font-bold';
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
        renderChunks();
        if (typeof global.speakShadow === 'function') {
          global.speakShadow(combinedText, {
            onChunkStart: (idx, total) => {
              resetChunkHighlight();
              const activeB = chunkListEl?.querySelector(`[data-studio-chunk-idx="${idx}"]`);
              if (activeB) {
                activeB.className =
                  'px-2.5 py-1.5 rounded-lg border border-sky-400 bg-sky-500/25 text-sky-200 ring-2 ring-sky-400/70 transition font-mono text-xs text-left font-bold';
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
                  'px-2.5 py-1.5 rounded-lg border border-emerald-400 bg-emerald-500/25 text-emerald-200 ring-2 ring-emerald-400/70 transition font-mono text-xs text-left font-bold';
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

    // 11. Bộ Điều Phối Ghi Âm & Nhận Diện Giọng Nói Đa Thiết Bị (iPad/iPhone Safari, Android, Windows/Mac)
    const finalizeSpokenEvaluation = (spokenTranscript, audioBlobUrl, audioOnlyMode = false) => {
      const cleanSpoken = String(spokenTranscript || '').trim();
      const prevSaved = recordingStore[recKey] || null;

      // Nếu chỉ thu băng nghe lại (hoặc trình duyệt chỉ trả về file âm thanh mà chưa có chữ), tuyệt đối KHÔNG chấm 0% đè lên kết quả
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
        global.LexiAcademy.render();
        return;
      }

      if (!cleanSpoken && !audioBlobUrl) {
        global.LexiAcademy.notify(
          'Chưa nhận diện được giọng nói. Hãy đọc to rõ hơn hoặc chạm vào ô bên dưới rồi dùng Mic 🎙️ trên bàn phím nhé!'
        );
        global.LexiAcademy.render();
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

      global.LexiAcademy.render();
    };

    // Nút 1: Đọc & Chấm điểm phát âm từng từ (Tự động tránh xung đột Micro trên iPad/iPhone Safari, chạy song song trên PC/Android)
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
        if (ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
          try {
            ytPlayer.pauseVideo();
          } catch (e) {}
        }

        liveTranscript = '';
        recordSeconds = 0;
        recordedChunks = [];
        let createdAudioUrl = '';
        isAudioOnlyRecording = false;

        const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
        const singleChannelMic = isSingleChannelMicDevice();

        // Chỉ bật MediaRecorder song song khi thiết bị hỗ trợ đa kênh Micro (PC Chrome/Edge, Android) hoặc khi trình duyệt không có SR
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
                  (container.querySelector('#studio-manual-speech-in')
                    ? container.querySelector('#studio-manual-speech-in').value.trim()
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
        global.LexiAcademy.render();

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

    // Nút 2: Thu băng giọng đọc độc lập (Dành cho iPad/iPhone hoặc bất kỳ thiết bị nào muốn thu âm nghe lại mà không mất điểm chấm từ)
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
        if (ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
          try {
            ytPlayer.pauseVideo();
          } catch (e) {}
        }

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
          global.LexiAcademy.render();

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

    // Chấm câu từ ô nhập / Mic bàn phím iPad
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

    // Bấm vào từng thẻ từ Xanh ✓ / Vàng ▲ / Đỏ ✗ để nghe lại cách phát âm chuẩn của từ đó
    container.querySelectorAll('[data-chip-speak]').forEach((chip) => {
      chip.onclick = () => {
        const w = chip.getAttribute('data-chip-speak');
        if (w && typeof global.playSingleChunkUS === 'function') {
          global.playSingleChunkUS(w);
        }
      };
    });

    // Mở / Đóng khung AI Huấn luyện phát âm
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

    // 12. Chế độ Dictation (Chép chính tả)
    const dictInput = container.querySelector('#studio-dict-input');
    const dictFeedback = container.querySelector('#studio-dict-feedback');
    const dictHintBtn = container.querySelector('#studio-dict-hint-btn');
    const dictRevealBtn = container.querySelector('#studio-dict-reveal-btn');

    if (dictInput && dictFeedback) {
      dictInput.oninput = () => {
        const val = dictInput.value;
        const draftKey = `lis_dict_${lesson.id}_${curSegIdx}`;
        if (state && state.drafts) {
          state.drafts[draftKey] = val;
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
        global.LexiAcademy.render();
      };
    }

    // 13. Chế độ Nghe VSTEP (Bộ 3-4 câu hỏi Trắc nghiệm Tiếng Anh + Nghe câu bằng chứng)
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
        global.LexiAcademy.render();
      };
    });

    container.querySelectorAll('[data-vstep-jump-seg]').forEach((btn) => {
      btn.onclick = () => {
        const targetIdx = Number(btn.getAttribute('data-vstep-jump-seg')) || 0;
        stopActiveRecording();
        clearKaraokeTimer();
        curSegIdx = Math.max(0, Math.min(segs.length - 1, targetIdx));
        activePopoverWord = null;
        global.LexiAcademy.render();
        const evCtx = getActiveLessonAndSegment(lv);
        const evWordsCount = evCtx.combinedText.split(/\s+/).filter(Boolean).length;
        if (mediaTab === 'video' && evCtx.lesson.youtubeId) {
          playYouTubeSegmentHumanVoice(
            evCtx.startSec,
            evCtx.endSec,
            evWordsCount,
            evCtx.combinedText
          );
        } else {
          playSentenceUSWithKaraoke(evCtx.combinedText, evWordsCount);
        }
      };
    });

    // 14. Chỉnh tốc độ 0.5x | 0.75x | 1x | 1.25x | 1.5x & Chuyển câu
    container.querySelectorAll('[data-studio-speed]').forEach((spdBtn) => {
      spdBtn.onclick = () => {
        playbackSpeed = Number(spdBtn.getAttribute('data-studio-speed')) || 1.0;
        if (typeof global.setAudioPlaybackRate === 'function') {
          global.setAudioPlaybackRate(playbackSpeed);
        }
        if (ytPlayer && ytPlayerReady && typeof ytPlayer.setPlaybackRate === 'function') {
          try {
            ytPlayer.setPlaybackRate(playbackSpeed);
          } catch (e) {}
        }
        global.LexiAcademy.notify(`Đã chỉnh tốc độ phát: ${playbackSpeed}x`);
        global.LexiAcademy.render();
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
          global.LexiAcademy.render();
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
          global.LexiAcademy.render();
        } else {
          global.LexiAcademy.markDone(lesson.id);
          global.LexiAcademy.notify('🎉 Chúc mừng! Bạn đã hoàn thành toàn bộ các câu trong bài học này.');
          global.LexiAcademy.render();
        }
      };
    }
  }

  function getItems(lv) {
    return getLessonsForLevel(lv);
  }

  // Xuất hàm dùng chung để module Speaking cũng dùng được bộ chấm thẻ Xanh/Vàng/Đỏ, IPA & Bộ định tuyến Micro Đa Thiết Bị
  global.LexiStudioHelpers = {
    lookupWordInfo,
    cleanWordToken,
    evaluateSpokenWords,
    buildAICoachFeedbackHTML,
    isSingleChannelMicDevice
  };

  if (global.LexiAcademy) {
    global.LexiAcademy.registerModule('listening', { render, bind, getItems });
  }
})(window);
