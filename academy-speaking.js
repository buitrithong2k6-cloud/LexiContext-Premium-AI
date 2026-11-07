/**
 * LexiContext Academy — Module Luyện Nói & Phản Xạ VSTEP / Lâm Sàng (academy-speaking.js)
 * Đồng bộ trải nghiệm Studio hiện đại:
 * - Bố cục 2 cột: Cột trái (Tình huống VSTEP Part 1-2-3 + Cụm từ cứu cánh) | Cột phải (Sơ đồ 3 ý + Câu mẫu kèm IPA dưới từng từ + Tách cụm + Ghi âm giọng thật chấm thẻ Xanh/Vàng/Đỏ + AI Coach)
 */
(function (global) {
  'use strict';

  const SPEAKING_DATA = {
    fillers: [
      {
        en: 'Well, to be honest, I haven’t thought about this much, but...',
        vi: 'Thực lòng mà nói, tôi chưa nghĩ nhiều về điều này, nhưng... (Mua 3 giây suy nghĩ)'
      },
      {
        en: 'From a clinical and practical perspective, I believe that...',
        vi: 'Dưới góc độ lâm sàng và thực tế, tôi tin rằng...'
      },
      {
        en: 'That’s an interesting question. In my experience...',
        vi: 'Đó là một câu hỏi rất hay. Theo kinh nghiệm của tôi thì...'
      },
      {
        en: 'There are a couple of main reasons why...',
        vi: 'Có hai lý do chính giải thích tại sao...'
      }
    ],
    B1: [
      {
        id: 'spk_b1_1',
        topic: 'Giao tiếp Lâm sàng & Đời sống (B1 Part 1)',
        question: 'Can you describe your daily routine as a student or healthcare worker, and how you deal with stress?',
        questionVi: 'Hãy mô tả lịch trình hàng ngày của bạn và cách bạn giải tỏa căng thẳng?',
        bullets: [
          '1. Lịch trình sáng/chiều: Đi học lý thuyết hoặc đi thực tập tại bệnh viện (attend lectures / clinical rotations).',
          '2. Nguồn gây áp lực: Khối lượng kiến thức lớn và lịch thi dày đặc (demanding schedule).',
          '3. Cách giải tỏa: Đi bơi hoặc chạy bộ 30 phút và ngủ đủ giấc.'
        ],
        cleanScript:
          'Well, to be honest, my daily schedule is quite demanding. During the week, I usually spend my mornings attending clinical rotations at the hospital and my afternoons studying medical terminology. To cope with stress, I try to go swimming or jogging for thirty minutes to clear my mind and stay healthy.'
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
        cleanScript:
          'I understand that you are in a lot of pain right now, but please do not worry, you are in good hands. Based on your sharp abdominal pain in the lower right side, we need to run a quick blood test and perform an abdominal ultrasound immediately to check for acute appendicitis.'
      }
    ],
    B2: [
      {
        id: 'spk_b2_1',
        topic: 'Thảo luận Học thuật VSTEP Part 3 (B2)',
        question: 'Why do you think more young people today are suffering from lifestyle-related diseases compared to the past?',
        questionVi: 'Tại sao ngày càng nhiều người trẻ hiện nay mắc các bệnh liên quan đến lối sống so với trước đây?',
        bullets: [
          '1. Nguyên nhân 1 (Lối sống tĩnh tại): Ngồi máy tính/điện thoại quá nhiều (sedentary lifestyle).',
          '2. Nguyên nhân 2 (Chế độ ăn & giấc ngủ): Tiêu thụ thức ăn nhanh và thiếu ngủ mạn tính.',
          '3. Giải pháp: Tập thể dục đều đặn để tăng cường hệ miễn dịch (boost the immune system).'
        ],
        cleanScript:
          'From my perspective, this trend stems from two primary factors. Firstly, modern technology has led to a sedentary lifestyle where young adults spend hours sitting in front of screens. Secondly, high consumption of fast food coupled with lack of sleep weakens the immune system and increases metabolic disorders.'
      },
      {
        id: 'spk_b2_2',
        topic: 'Báo cáo Ca Lâm sàng Ngắn (B2 Clinical Presentation)',
        question: 'Present a brief clinical summary of a patient suspected of having acute appendicitis with signs of peritonitis.',
        questionVi: 'Trình bày tóm tắt ca lâm sàng một bệnh nhân nghi ngờ viêm ruột thừa cấp có dấu hiệu viêm phúc mạc.',
        bullets: [
          '1. Triệu chứng cơ năng: Đau quanh rốn lan xuống vùng bụng dưới bên phải.',
          '2. Triệu chứng thực thể: Đề kháng thành bụng khu trú và phản ứng dội dương tính (rebound tenderness).',
          '3. Hướng xử trí: Hội chẩn ngoại khoa cấp cứu (immediate surgical consultation).'
        ],
        cleanScript:
          'The patient presented to the emergency department with sharp abdominal pain moving to the lower right side. Physical examination revealed localized abdominal resistance and positive rebound tenderness, suggesting early peritonitis that requires immediate surgical consultation.'
      }
    ]
  };

  let curIdx = 0;
  let showIPA = true;
  let activePopWord = null;
  let isRecording = false;
  let recSec = 0;
  let recTimer = null;
  let mediaRec = null;
  let recChunks = [];
  let speechRec = null;
  let liveText = '';
  const spkResults = {};

  function render(lv) {
    const list = SPEAKING_DATA[lv] || SPEAKING_DATA.B1;
    curIdx = Math.min(curIdx, list.length - 1);
    const item = list[curIdx];
    const esc = global.LexiAcademy.esc;
    const helpers = global.LexiStudioHelpers || {};
    const lookupWordInfo =
      helpers.lookupWordInfo ||
      ((w) => ({ word: w, ipa: w, pos: 'word', vi: '', ex: '', inVault: false }));
    const cleanWordToken =
      helpers.cleanWordToken || ((w) => String(w || '').toLowerCase().replace(/[^a-z0-9']/g, ''));

    const wordsArr = item.cleanScript.split(/\s+/).filter(Boolean);
    const saved = spkResults[item.id] || null;

    const wordsWithIpaHTML = wordsArr
      .map((rawW, idx) => {
        const cleanW = cleanWordToken(rawW);
        const info = lookupWordInfo(cleanW);
        const isPop = activePopWord && activePopWord.idx === idx;
        return `
          <button
            type="button"
            data-spk-word="${esc(rawW)}"
            data-spk-word-idx="${idx}"
            class="group inline-flex flex-col items-center px-1.5 py-1 rounded-lg transition cursor-pointer select-none ${
              isPop ? 'bg-pink-500/20 ring-1 ring-pink-400/60' : 'hover:bg-line/30'
            }"
          >
            <span class="text-base sm:text-lg font-bold ${
              isPop ? 'text-pink-400' : 'text-fg group-hover:text-pri'
            }">${esc(rawW)}</span>
            ${
              showIPA
                ? `<span class="text-[11px] font-mono text-mute leading-tight mt-0.5">${esc(
                    info.ipa || cleanW
                  )}</span>`
                : ''
            }
          </button>
        `;
      })
      .join('');

    let popHTML = '';
    if (activePopWord) {
      const pInfo = lookupWordInfo(activePopWord.word);
      popHTML = `
        <div class="inset p-3.5 rounded-xl border border-pink-500/40 bg-pink-500/5 space-y-2 text-xs">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2">
            <div class="flex items-center gap-2">
              <b class="text-base text-fg">${esc(pInfo.word)}</b>
              <span class="font-mono text-pink-400">/${esc(pInfo.ipa)}/</span>
              <button type="button" data-spk-pop-speak="${esc(
                pInfo.word
              )}" class="px-2 py-0.5 rounded border border-sky-400/40 bg-sky-500/10 text-sky-300 font-mono font-bold">🔊 US</button>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                id="spk-pop-save"
                data-word="${esc(pInfo.word)}"
                data-ipa="/${esc(pInfo.ipa)}/"
                data-pos="${esc(pInfo.pos)}"
                data-meaning="${esc(pInfo.vi)}"
                data-ex="${esc(item.cleanScript)}"
                class="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-bold"
              >
                ${pInfo.inVault ? '✓ Đã có trong Kho từ' : '⭐ Lưu vào Kho từ vựng'}
              </button>
              <button type="button" id="spk-pop-close" class="px-2 py-1 rounded border border-line text-mute">✕</button>
            </div>
          </div>
          <div><b class="text-emerald-400">Nghĩa:</b> ${esc(pInfo.vi)}</div>
        </div>
      `;
    }

    const chipsHTML = saved
      ? saved.wordResults
          .map((wr) => {
            const cls =
              wr.status === 'correct'
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : wr.status === 'near'
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-rose-500/50 bg-rose-500/15 text-rose-300';
            const sym = wr.status === 'correct' ? '✓' : wr.status === 'near' ? '▲' : '✗';
            return `
              <button type="button" data-spk-chip="${esc(
                wr.word
              )}" class="px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 ${cls}" title="Bấm để nghe phát âm chuẩn US của từ '${esc(
              wr.word
            )}'">
                <span>${esc(wr.word.toLowerCase())}</span>
                <span>${sym}</span>
              </button>
            `;
          })
          .join('')
      : wordsArr
          .map((w) => {
            const dots = '•'.repeat(Math.max(3, Math.min(8, cleanWordToken(w).length)));
            return `<span class="px-2.5 py-1 rounded-lg border border-line/60 bg-inset/60 text-mute font-mono text-xs">${dots}</span>`;
          })
          .join('');

    return `
      <div class="grid lg:grid-cols-12 gap-4 items-start">
        <!-- Cột trái: Tình huống & Cụm từ cứu cánh -->
        <div class="lg:col-span-4 space-y-4">
          <div class="card p-4 space-y-2.5">
            <b class="text-sm">🗣️ Tình huống VSTEP & Lâm sàng (${lv})</b>
            <div class="space-y-1.5">
              ${list
                .map(
                  (it, i) => `
                <button type="button" data-spk-pick="${i}" class="w-full text-left p-2.5 rounded-xl border transition ${
                    i === curIdx
                      ? 'border-pink-500/70 bg-pink-500/15 font-bold'
                      : 'border-line/60 hover:bg-line/20'
                  } text-xs">
                  <div class="text-[10px] text-pink-400 font-mono">${esc(it.topic)}</div>
                  <div class="mt-0.5 line-clamp-2">${i + 1}. ${esc(it.question)}</div>
                </button>`
                )
                .join('')}
            </div>
          </div>

          <div class="card p-4 space-y-2.5">
            <b class="text-xs text-warn uppercase">💡 Cụm từ "Cứu cánh" chống ấp úng</b>
            <p class="text-[11px] text-mute">Bật ngay 1 trong 4 câu này để có 3 giây suy nghĩ tự nhiên khi thi VSTEP:</p>
            <div class="space-y-2">
              ${SPEAKING_DATA.fillers
                .map(
                  (fl) => `
                <div class="inset p-2.5 text-xs space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    <b class="text-pri">"${esc(fl.en)}"</b>
                    <button type="button" class="btn !text-[10px] !py-1 !px-2" data-a="speak" data-v="${esc(
                      fl.en
                    )}">🔊</button>
                  </div>
                  <div class="text-[11px] text-mute">${esc(fl.vi)}</div>
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Cột phải: Thực hành Phản xạ + IPA + Tách cụm + Ghi âm chấm thẻ từ -->
        <div class="lg:col-span-8 space-y-4">
          <div class="card p-5 space-y-4">
            <div class="border-b border-line/60 pb-3 space-y-1">
              <span class="text-xs font-mono text-pink-400">${esc(item.topic)}</span>
              <h3 class="text-base sm:text-lg font-bold">${esc(item.question)}</h3>
              <p class="text-xs text-emerald-400 italic">🇻🇳 ${esc(item.questionVi)}</p>
            </div>

            <div class="inset p-3.5 space-y-2">
              <b class="text-xs text-warn uppercase">Bước 1: Nắm Sơ đồ 3 Ý cốt lõi</b>
              <ul class="space-y-1 text-xs">${item.bullets
                .map((b) => `<li class="text-fg">• ${esc(b)}</li>`)
                .join('')}</ul>
            </div>

            <!-- Bước 2: Đoạn mẫu kèm IPA dưới từng từ + Nghe US + Tách cụm -->
            <div class="inset p-4 space-y-3 border border-pri/30 rounded-2xl">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2.5">
                <b class="text-xs text-pri uppercase">Bước 2: Nghe mẫu chuẩn US & Tra từ trực tiếp</b>
                <div class="flex flex-wrap items-center gap-1.5">
                  <button type="button" id="spk-toggle-ipa" class="px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                    showIPA ? 'border-pri bg-pri/15 text-pri' : 'border-line text-mute'
                  }">IPA</button>
                  <button type="button" id="spk-speak-us-btn" class="px-3 py-1 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs font-bold hover:bg-sky-500/20">
                    🔊 Nghe US
                  </button>
                  <button type="button" id="spk-toggle-chunk-btn" class="px-3 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20">
                    Tách cụm
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap items-end gap-x-1.5 gap-y-2 leading-relaxed">
                ${wordsWithIpaHTML}
              </div>

              ${popHTML}

              <!-- Khung Tách cụm 2 chế độ (Mặc định ẩn) -->
              <div id="spk-chunk-box" class="hidden inset p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-1.5">
                  <b class="text-amber-400">Tách cụm theo nhịp thở (Chuẩn US)</b>
                  <div class="flex items-center gap-1.5">
                    <button type="button" id="spk-chunk-play-all" class="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                      ▶ Đọc cả câu (Dừng 1.5s giữa các cụm)
                    </button>
                    <button type="button" id="spk-chunk-stop" class="px-2 py-1 rounded-lg border border-line text-mute">⏹ Dừng</button>
                  </div>
                </div>
                <div id="spk-chunk-list" class="flex flex-wrap items-center gap-1.5 pt-1"></div>
              </div>
            </div>

            <!-- Bước 3: Ghi âm giọng thật & Chấm thẻ từ Xanh / Vàng / Đỏ -->
            <div class="inset p-4 space-y-3 rounded-2xl">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <b class="text-xs text-emerald-400 uppercase">Bước 3: Ghi âm giọng nói & Chấm từng từ (Xanh / Vàng / Đỏ)</b>
                <button
                  type="button"
                  id="spk-rec-btn"
                  class="px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition ${
                    isRecording
                      ? 'bg-rose-500 text-white'
                      : 'bg-pink-500/20 border border-pink-500/50 text-pink-300 hover:bg-pink-500/30'
                  }"
                >
                  ${
                    isRecording
                      ? `⏹ Đang ghi âm (${recSec}s/30s) — Bấm để dừng`
                      : '🎙️ Nhấn để bắt đầu ghi âm'
                  }
                </button>
              </div>

              <textarea
                id="spk-user-in"
                rows="2"
                class="inp text-xs sm:text-sm"
                placeholder="Khi bạn nói vào Micro (hoặc dùng Mic bàn phím iPad), văn bản sẽ hiện tại đây..."
              >${saved ? esc(saved.transcript) : esc(liveText)}</textarea>

              <div class="flex flex-wrap gap-2 justify-between">
                <button type="button" id="spk-score-btn" class="btn btn-ok !text-xs font-bold">
                  ✓ Chấm điểm các từ vừa đọc
                </button>
                ${
                  saved
                    ? `<span class="font-mono text-xs font-bold ${
                        saved.pct >= 80 ? 'text-emerald-400' : 'text-amber-300'
                      }">Độ chính xác: ${saved.pct}% (${saved.correctCount}/${saved.total} từ)</span>`
                    : ''
                }
              </div>

              ${
                saved && saved.audioUrl
                  ? `
                <div class="p-3 rounded-xl bg-card/70 border border-line/60 space-y-1">
                  <div class="text-[11px] text-pink-400 font-semibold">🎧 Nghe lại giọng thu âm của bạn:</div>
                  <audio controls src="${esc(saved.audioUrl)}" class="w-full h-9"></audio>
                </div>
              `
                  : ''
              }

              <div class="flex flex-wrap items-center gap-1.5 pt-1">
                ${chipsHTML}
              </div>

              ${
                saved && saved.aiCoachHtml
                  ? `
                <div class="p-3.5 rounded-xl border border-pink-500/40 bg-pink-500/5">
                  ${saved.aiCoachHtml}
                </div>
              `
                  : ''
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function stopSpkRec() {
    isRecording = false;
    if (recTimer) {
      clearInterval(recTimer);
      recTimer = null;
    }
    if (speechRec) {
      try {
        speechRec.onend = null;
        speechRec.stop();
      } catch (e) {}
      speechRec = null;
    }
    if (mediaRec && mediaRec.state !== 'inactive') {
      try {
        mediaRec.stop();
      } catch (e) {}
    }
  }

  function bind(container, lv) {
    const list = SPEAKING_DATA[lv] || SPEAKING_DATA.B1;
    const item = list[curIdx];
    const esc = global.LexiAcademy.esc;
    const helpers = global.LexiStudioHelpers || {};

    container.querySelectorAll('[data-spk-pick]').forEach((btn) => {
      btn.onclick = () => {
        stopSpkRec();
        curIdx = Number(btn.getAttribute('data-spk-pick')) || 0;
        activePopWord = null;
        global.LexiAcademy.render();
      };
    });

    const toggleIpaBtn = container.querySelector('#spk-toggle-ipa');
    if (toggleIpaBtn) {
      toggleIpaBtn.onclick = () => {
        showIPA = !showIPA;
        global.LexiAcademy.render();
      };
    }

    const speakUsBtn = container.querySelector('#spk-speak-us-btn');
    if (speakUsBtn) {
      speakUsBtn.onclick = () => {
        if (typeof global.speakUS === 'function') global.speakUS(item.cleanScript);
      };
    }

    // Chạm từ mở Popover
    container.querySelectorAll('[data-spk-word]').forEach((b) => {
      b.onclick = () => {
        const rawW = b.getAttribute('data-spk-word') || '';
        const idx = Number(b.getAttribute('data-spk-word-idx'));
        const cleanW = helpers.cleanWordToken ? helpers.cleanWordToken(rawW) : rawW;
        if (cleanW && typeof global.playSingleChunkUS === 'function') {
          global.playSingleChunkUS(cleanW);
        }
        if (activePopWord && activePopWord.idx === idx) activePopWord = null;
        else activePopWord = { word: cleanW || rawW, idx };
        global.LexiAcademy.render();
      };
    });

    const popClose = container.querySelector('#spk-pop-close');
    if (popClose) {
      popClose.onclick = () => {
        activePopWord = null;
        global.LexiAcademy.render();
      };
    }

    container.querySelectorAll('[data-spk-pop-speak]').forEach((b) => {
      b.onclick = () => {
        const w = b.getAttribute('data-spk-pop-speak');
        if (w && typeof global.playSingleChunkUS === 'function') global.playSingleChunkUS(w);
      };
    });

    const popSave = container.querySelector('#spk-pop-save');
    if (popSave) {
      popSave.onclick = () => {
        global.LexiAcademy.quickAddWord(
          {
            word: popSave.getAttribute('data-word'),
            ipa: popSave.getAttribute('data-ipa'),
            pos: popSave.getAttribute('data-pos'),
            meaning: popSave.getAttribute('data-meaning'),
            example: popSave.getAttribute('data-ex'),
            cefr: lv,
            topic: item.topic
          },
          popSave
        );
      };
    }

    // Tách cụm 2 chế độ
    const toggleChunkBtn = container.querySelector('#spk-toggle-chunk-btn');
    const chunkBox = container.querySelector('#spk-chunk-box');
    const chunkList = container.querySelector('#spk-chunk-list');
    const chunkPlayAll = container.querySelector('#spk-chunk-play-all');
    const chunkStop = container.querySelector('#spk-chunk-stop');

    const renderSpkChunks = () => {
      if (!chunkList) return [];
      const chunks =
        typeof global.splitIntoBreathChunks === 'function'
          ? global.splitIntoBreathChunks(item.cleanScript)
          : [item.cleanScript];
      chunkList.innerHTML = chunks
        .map(
          (c, i) => `
          <button type="button" data-spk-chunk="${i}" class="px-2.5 py-1.5 rounded-lg border border-line bg-inset/80 text-fg hover:border-amber-400/60 font-mono text-xs text-left">
            <b class="text-amber-400 mr-1">${i + 1}.</b>${esc(c)}
          </button>
        `
        )
        .join('');
      chunkList.querySelectorAll('[data-spk-chunk]').forEach((b) => {
        b.onclick = () => {
          const cTxt = chunks[Number(b.getAttribute('data-spk-chunk'))];
          if (cTxt && typeof global.playSingleChunkUS === 'function') {
            global.playSingleChunkUS(cTxt);
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
          return;
        }
        chunkBox.classList.remove('hidden');
        toggleChunkBtn.textContent = 'Ẩn tách cụm';
        renderSpkChunks();
      };
    }

    if (chunkPlayAll) {
      chunkPlayAll.onclick = () => {
        renderSpkChunks();
        if (typeof global.speakShadow === 'function') {
          global.speakShadow(item.cleanScript);
        }
      };
    }

    if (chunkStop) {
      chunkStop.onclick = () => {
        if (typeof global.stopAudioPlayback === 'function') global.stopAudioPlayback();
      };
    }

    // Ghi âm & Chấm điểm từ Xanh/Vàng/Đỏ
    const userIn = container.querySelector('#spk-user-in');
    const scoreBtn = container.querySelector('#spk-score-btn');
    const recBtn = container.querySelector('#spk-rec-btn');

    const evaluateSpk = (spokenText, audioUrl) => {
      const cleanTxt = String(spokenText || '').trim();
      if (!cleanTxt && !audioUrl) {
        global.LexiAcademy.notify('Hãy ghi âm hoặc đọc câu trả lời vào ô trước khi chấm.');
        return;
      }
      if (helpers.evaluateSpokenWords && helpers.buildAICoachFeedbackHTML) {
        const evalRes = helpers.evaluateSpokenWords(item.cleanScript, cleanTxt);
        const aiCoachHtml = helpers.buildAICoachFeedbackHTML(
          item.cleanScript,
          cleanTxt,
          evalRes,
          esc
        );
        spkResults[item.id] = {
          transcript: cleanTxt,
          audioUrl: audioUrl || (spkResults[item.id] && spkResults[item.id].audioUrl) || '',
          wordResults: evalRes.wordResults,
          correctCount: evalRes.correctCount,
          total: evalRes.total,
          pct: evalRes.pct,
          aiCoachHtml
        };
        if (evalRes.pct >= 65) global.LexiAcademy.markDone(item.id);
        global.LexiAcademy.render();
      }
    };

    if (scoreBtn && userIn) {
      scoreBtn.onclick = () => evaluateSpk(userIn.value, '');
    }

    if (recBtn) {
      recBtn.onclick = async () => {
        if (isRecording) {
          stopSpkRec();
          return;
        }
        liveText = '';
        recSec = 0;
        recChunks = [];
        let blobUrl = '';

        let stream = null;
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (typeof MediaRecorder !== 'undefined') {
              mediaRec = new MediaRecorder(stream);
              mediaRec.ondataavailable = (ev) => {
                if (ev.data && ev.data.size > 0) recChunks.push(ev.data);
              };
              mediaRec.onstop = () => {
                if (recChunks.length > 0) {
                  blobUrl = URL.createObjectURL(
                    new Blob(recChunks, { type: mediaRec.mimeType || 'audio/mp4' })
                  );
                }
                if (stream) stream.getTracks().forEach((t) => t.stop());
                evaluateSpk(liveText || (userIn ? userIn.value : ''), blobUrl);
              };
              mediaRec.start();
            }
          } catch (e) {}
        }

        const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
        if (SR) {
          try {
            speechRec = new SR();
            speechRec.lang = 'en-US';
            speechRec.continuous = true;
            speechRec.interimResults = true;
            speechRec.onresult = (ev) => {
              let t = '';
              for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript + ' ';
              liveText = t.trim();
              if (userIn) userIn.value = liveText;
            };
            speechRec.start();
          } catch (e) {}
        }

        isRecording = true;
        global.LexiAcademy.render();

        recTimer = setInterval(() => {
          recSec++;
          if (recSec >= 30) {
            stopSpkRec();
          }
        }, 1000);
      };
    }

    container.querySelectorAll('[data-spk-chip]').forEach((c) => {
      c.onclick = () => {
        const w = c.getAttribute('data-spk-chip');
        if (w && typeof global.playSingleChunkUS === 'function') global.playSingleChunkUS(w);
      };
    });
  }

  function getItems(lv) {
    return SPEAKING_DATA[lv] || [];
  }

  if (global.LexiAcademy) {
    global.LexiAcademy.registerModule('speaking', { render, bind, getItems });
  }
})(window);
