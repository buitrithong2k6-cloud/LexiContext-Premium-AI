/**
 * LexiContext Academy Core (academy-core.js)
 * Bộ điều phối trung tâm:
 * - Quản lý Trình độ mục tiêu (B1 -> B2 -> Duy trì)
 * - Tích hợp thanh điều hướng & kết nối các file kỹ năng độc lập
 * - Đồng bộ tiến độ & Streak học tập
 */
(function (global) {
  'use strict';

  const LS_ACADEMY_KEY = 'lexicontext_academy_state_v5';

  function esc(s) {
    return String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }

  function normKey(str) {
    return String(str ?? '')
      .replace(/\*+/g, '')
      .replace(/^\s*(?:[-•·●▪◦>]+|\d+[.)])\s+/, '')
      .replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function notify(msg) {
    try {
      if (typeof global.toast === 'function') global.toast(msg);
      else if (typeof window.toast === 'function') window.toast(msg);
    } catch (e) {}
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_ACADEMY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        level: parsed.level === 'B2' ? 'B2' : 'B1',
        subTab: parsed.subTab || 'listening',
        doneIds: Array.isArray(parsed.doneIds) ? parsed.doneIds : [],
        drafts: parsed.drafts && typeof parsed.drafts === 'object' ? parsed.drafts : {},
        dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
        lastDailyDate: parsed.lastDailyDate || '',
        dailyStepDone: parsed.dailyStepDone && typeof parsed.dailyStepDone === 'object' ? parsed.dailyStepDone : {}
      };
    } catch (e) {
      return {
        level: 'B1',
        subTab: 'listening',
        doneIds: [],
        drafts: {},
        dailyStreak: 0,
        lastDailyDate: '',
        dailyStepDone: {}
      };
    }
  }

  const state = loadState();

  function saveState() {
    try {
      localStorage.setItem(LS_ACADEMY_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  const modules = {};

  const LexiAcademy = {
    esc,
    normKey,
    notify,
    state,
    saveState,
    modules,

    registerModule(key, mod) {
      modules[key] = mod;
      if (document.readyState !== 'loading') {
        this.render();
      }
    },

    markDone(itemId) {
      if (!itemId) return;
      if (!state.doneIds.includes(itemId)) {
        state.doneIds.push(itemId);
        saveState();
        this.updateHeaderProgress();
      }
    },

    isDone(itemId) {
      return state.doneIds.includes(itemId);
    },

    calcProgress(lv) {
      let total = 0;
      let done = 0;
      Object.values(modules).forEach((mod) => {
        if (typeof mod.getItems === 'function') {
          const items = mod.getItems(lv) || [];
          total += items.length;
          items.forEach((it) => {
            if (state.doneIds.includes(it.id)) done++;
          });
        }
      });
      return total ? Math.round((done / total) * 100) : 0;
    },

    quickAddWord(wordObj, btnEl) {
      try {
        const raw = localStorage.getItem('lexicontext_master_db_unified');
        const db = raw ? JSON.parse(raw) : { words: [] };
        const exists = (db.words || []).some((w) => normKey(w.word) === normKey(wordObj.word));
        if (exists) {
          notify(`"${wordObj.word}" đã có sẵn trong Kho từ của bạn!`);
          if (btnEl) {
            btnEl.textContent = '✓ Đã có trong Kho';
            btnEl.disabled = true;
          }
          return;
        }
        if (typeof global.addWord === 'function') {
          global.addWord({
            word: wordObj.word,
            pos: wordObj.pos || 'word',
            ipa: wordObj.ipa || `/${wordObj.word}/`,
            cefr: wordObj.cefr || state.level,
            topic: wordObj.topic || 'Học thuật & Công nghệ',
            meaning: wordObj.meaning,
            example: wordObj.example || '',
            exampleTrans: wordObj.exampleTrans || '',
            explanation: 'Từ vựng trọng tâm từ Lộ trình 4 Kỹ năng (' + (wordObj.cefr || state.level) + ').',
            collocations: []
          });
        }
        if (btnEl) {
          btnEl.textContent = '✓ Đã lưu vào Kho';
          btnEl.disabled = true;
        }
      } catch (e) {}
    },

    compareTokens(targetSentence, userTyped) {
      const clean = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9']/g, '');
      const targetWords = String(targetSentence || '').trim().split(/\s+/).filter(Boolean);
      const typedWords = String(userTyped || '').trim().split(/\s+/).filter(Boolean);

      const n = targetWords.length;
      const m = typedWords.length;
      if (!n) return { pct: 0, correctCount: 0, total: 0, html: '' };

      // Quy hoạch động LCS để căn chỉnh từ chính xác kể cả khi học viên viết thiếu/thừa từ ở giữa câu
      const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
      for (let i = 1; i <= n; i++) {
        const tNorm = clean(targetWords[i - 1]);
        for (let j = 1; j <= m; j++) {
          if (tNorm && tNorm === clean(typedWords[j - 1])) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }

      // Truy vết các vị trí từ khớp trong targetWords
      const matchedTargetIdx = new Set();
      let i = n;
      let j = m;
      while (i > 0 && j > 0) {
        if (clean(targetWords[i - 1]) && clean(targetWords[i - 1]) === clean(typedWords[j - 1])) {
          matchedTargetIdx.add(i - 1);
          i--;
          j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
          i--;
        } else {
          j--;
        }
      }

      const correctCount = matchedTargetIdx.size;
      const html = targetWords
        .map((tw, idx) => {
          if (matchedTargetIdx.has(idx)) {
            return `<span class="px-1.5 py-0.5 rounded bg-ok/15 text-ok font-semibold">${esc(tw)}</span>`;
          }
          const hintChar = esc(tw.slice(0, Math.min(2, tw.length)));
          return `<span class="px-1.5 py-0.5 rounded bg-warn/15 text-warn font-mono" title="Từ cần điền: ${esc(tw)}">${hintChar}___</span>`;
        })
        .join(' ');

      const pct = Math.round((correctCount / n) * 100);
      return { pct, correctCount, total: n, html };
    },

    openView(subTabKey) {
      if (subTabKey) {
        state.subTab = subTabKey;
        saveState();
      }

      ['vault', 'add', 'quiz', 'mistakes'].forEach((t) => {
        const s = document.getElementById('tab-' + t);
        const n = document.getElementById('nav-' + t);
        if (s) s.classList.add('hidden');
        if (n) n.classList.remove('on');
      });

      document.querySelectorAll('[id^="nav-acad"], #nav-academy').forEach((b) => b.classList.remove('on'));
      const mainAcadBtn = document.getElementById('nav-academy');
      const subBtn = document.getElementById('nav-acad-' + state.subTab);
      if (mainAcadBtn) mainAcadBtn.classList.add('on');
      if (subBtn) subBtn.classList.add('on');

      const acadSec = document.getElementById('tab-academy');
      if (acadSec) {
        acadSec.classList.remove('hidden');
        this.render();
      }
    },

    updateHeaderProgress() {
      const b1Span = document.getElementById('acad-b1-pct');
      const b2Span = document.getElementById('acad-b2-pct');
      if (b1Span) b1Span.textContent = `${this.calcProgress('B1')}%`;
      if (b2Span) b2Span.textContent = `${this.calcProgress('B2')}%`;
    },

    render() {
      const sec = document.getElementById('tab-academy');
      if (!sec) return;

      const lv = state.level;
      const b1Pct = this.calcProgress('B1');
      const b2Pct = this.calcProgress('B2');

      const headerHTML = `
        <div class="card p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-xs text-mute">
                <span>Ôn luyện VSTEP B1 – B2</span>
                <span aria-hidden="true">·</span>
                <span class="font-mono tabular-nums text-warn">Duy trì: ${state.dailyStreak} ngày</span>
              </div>
              <h2 class="text-base sm:text-lg font-bold mt-0.5">Hệ thống Luyện tập 4 Kỹ năng</h2>
            </div>

            <!-- BỘ CHỌN TRÌNH ĐỘ: B1 vs B2 -->
            <div class="flex flex-wrap items-center gap-1.5 inset p-1 rounded-xl">
              <button type="button" data-acad-lv="B1" class="btn ${lv === 'B1' && state.subTab !== 'daily' ? 'btn-ok font-bold' : ''} !py-1.5 !px-3 !text-xs whitespace-nowrap">
                <span>Trình độ B1</span>
                <span id="acad-b1-pct" class="font-mono tabular-nums opacity-80 ml-1">${b1Pct}%</span>
              </button>
              <button type="button" data-acad-lv="B2" class="btn ${lv === 'B2' && state.subTab !== 'daily' ? 'btn-pri font-bold' : ''} !py-1.5 !px-3 !text-xs whitespace-nowrap">
                <span>Trình độ B2</span>
                <span id="acad-b2-pct" class="font-mono tabular-nums opacity-80 ml-1">${b2Pct}%</span>
              </button>
            </div>
          </div>

          <!-- THANH CHUYỂN KỸ NĂNG -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2.5 border-t border-line/60">
            <button type="button" data-acad-sub="listening" class="btn justify-center !py-2 !text-xs whitespace-nowrap ${state.subTab === 'listening' ? 'btn-pri font-bold' : ''}">1. Luyện Nghe (${lv})</button>
            <button type="button" data-acad-sub="writing" class="btn justify-center !py-2 !text-xs whitespace-nowrap ${state.subTab === 'writing' ? 'btn-pri font-bold' : ''}">2. Luyện Viết (${lv})</button>
            <button type="button" data-acad-sub="speaking" class="btn justify-center !py-2 !text-xs whitespace-nowrap ${state.subTab === 'speaking' ? 'btn-pri font-bold' : ''}">3. Giao tiếp (${lv})</button>
            <button type="button" data-acad-sub="grammar" class="btn justify-center !py-2 !text-xs whitespace-nowrap ${state.subTab === 'grammar' ? 'btn-pri font-bold' : ''}">4. Ngữ pháp (${lv})</button>
            <button type="button" data-acad-sub="daily" class="btn justify-center !py-2 !text-xs whitespace-nowrap col-span-2 sm:col-span-1 ${state.subTab === 'daily' ? 'btn-warn font-bold' : ''}">5. Ôn tập 5 Phút</button>
          </div>
        </div>

        <div id="acad-module-body" class="space-y-4"></div>
      `;

      sec.innerHTML = headerHTML;

      // Render module tương ứng
      const bodyContainer = document.getElementById('acad-module-body');
      const curMod = modules[state.subTab];
      if (curMod && bodyContainer) {
        if (typeof curMod.render === 'function') {
          bodyContainer.innerHTML = curMod.render(state.level, state);
        }
        if (typeof curMod.bind === 'function') {
          curMod.bind(bodyContainer, state.level, state);
        }
      } else if (bodyContainer) {
        bodyContainer.innerHTML = `
          <div class="card p-10 text-center text-mute space-y-2">
            <p>Đang tải module <b>${esc(state.subTab)}</b>...</p>
            <p class="text-xs">Hãy đảm bảo file <code>academy-${esc(state.subTab)}.js</code> đã được nạp.</p>
          </div>
        `;
      }

      this.bindHeaderEvents();
    },

    bindHeaderEvents() {
      const sec = document.getElementById('tab-academy');
      if (!sec) return;

      sec.querySelectorAll('[data-acad-lv]').forEach((btn) => {
        btn.onclick = () => {
          state.level = btn.getAttribute('data-acad-lv');
          if (state.subTab === 'daily') state.subTab = 'listening';
          saveState();
          this.render();
        };
      });

      sec.querySelectorAll('[data-acad-sub]').forEach((btn) => {
        btn.onclick = () => {
          this.openView(btn.getAttribute('data-acad-sub'));
        };
      });
    },

    init() {
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
          this.openView(state.subTab || 'listening');
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
            this.openView(qt.key);
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
  };

  global.LexiAcademy = LexiAcademy;
  global.openAcademyView = (tabKey) => LexiAcademy.openView(tabKey);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LexiAcademy.init());
  } else {
    LexiAcademy.init();
  }
})(window);
