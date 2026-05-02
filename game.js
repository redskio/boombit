// ═══════════════════════════════════════════════════════════
//  BOOMBIT — Mixed Reality Confusion
//  Game Engine v0.1
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── STATE ───
  let gameData = null;
  let state = {
    traits: { rational: 0, empathic: 0, chaotic: 0, pragmatic: 0 },
    history: [],
    currentNode: null,
    totalSteps: 0,
    stepsDone: 0,
  };

  // ─── DOM REFS ───
  const $ = id => document.getElementById(id);
  const screens = {
    intro: $('intro-screen'),
    narration: $('narration-screen'),
    choice: $('choice-screen'),
    response: $('response-screen'),
    quiz: $('quiz-screen'),
    result: $('result-screen'),
  };

  // ─── SCREEN MANAGEMENT ───
  function showScreen(name) {
    Object.values(screens).forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    const target = screens[name];
    // Small delay for transition
    requestAnimationFrame(() => {
      target.style.display = 'flex';
      requestAnimationFrame(() => target.classList.add('active'));
    });
  }

  function updateProgress() {
    const pct = state.totalSteps > 0 ? (state.stepsDone / state.totalSteps) * 100 : 0;
    $('progress-bar').style.width = pct + '%';
  }

  // ─── INLINE FALLBACK DATA (used when fetch fails on file:// protocol) ───
  const FALLBACK_DATA = {"meta":{"version":"0.1.0","title":"Boombit: Mixed Reality Confusion"},"traits":{"rational":{"name":"이성적 분석가","icon":"🧠","desc":"논리와 증거를 기반으로 판단하는 성향."},"empathic":{"name":"감성적 공감자","icon":"💗","desc":"타인의 감정과 맥락을 깊이 이해하는 성향."},"chaotic":{"name":"혼돈의 탐험가","icon":"🌀","desc":"규칙을 의심하고 기존 틀을 깨는 성향."},"pragmatic":{"name":"현실적 해결사","icon":"⚙️","desc":"효율과 결과를 중시하는 성향."}},"scenarios":[{"id":"s001","chapter":1,"title":"깨어남","setting":"reality_glitch","narration":["눈을 떴다. 익숙한 방인 것 같지만, 벽에 걸린 시계가 거꾸로 돌아가고 있다.","창밖으로 보이는 하늘은 보라색이다. 이것이 현실인가?","책상 위에 메모가 놓여 있다: '이것을 읽고 있다면, 이미 선택은 시작됐다.'"],"question":"메모를 읽은 당신의 첫 반응은?","choices":[{"text":"메모의 필체와 종이 재질을 분석한다","traits":{"rational":3,"pragmatic":1},"response":"섬유 패턴이 이상하다. 이 종이는... 존재하지 않는 소재로 만들어졌다.","next":"s002"},{"text":"메모를 쓴 사람의 감정 상태를 추측해본다","traits":{"empathic":3,"rational":1},"response":"떨리는 글씨. 이 사람은 두려워하면서도 희망을 놓지 않았다.","next":"s002"},{"text":"메모를 찢고 창문을 연다","traits":{"chaotic":3,"empathic":1},"response":"바람이 불어온다 — 따뜻하고 차갑다. 동시에. 이 세계는 모순 그 자체다.","next":"s002"},{"text":"메모를 주머니에 넣고 출구를 찾는다","traits":{"pragmatic":3,"chaotic":1},"response":"일단 여기서 나가야 한다. 메모는 나중에 분석하면 된다.","next":"s002"}]},{"id":"s002","chapter":1,"title":"복도의 분기점","setting":"corridor_shift","narration":["방을 나서자 끝이 보이지 않는 복도가 펼쳐진다.","왼쪽 벽은 거울처럼 반사되고, 오른쪽 벽에는 끊임없이 숫자가 흘러내린다.","멀리서 누군가의 웃음소리가 들린다. 아니, 울음소리인가?"],"question":"복도 한가운데에서 소리가 멈추고 두 개의 문이 나타난다. 왼쪽 문에는 '진실', 오른쪽 문에는 '거짓'이라 쓰여있다.","choices":[{"text":"'진실'이라 적힌 문을 연다 — 이름이 진실이면 진짜일 가능성이 높다","traits":{"rational":2,"pragmatic":2},"response":"문 뒤에는 또 다른 방이 있다. 벽에 'QUIZ_001'이라는 글자가 빛난다.","next":"q001"},{"text":"'거짓'이라 적힌 문을 연다 — 이 세계에서 진실은 반전되어 있을 것이다","traits":{"chaotic":2,"rational":2},"response":"문을 열자 똑같은 방이 나타났지만, 모든 것이 좌우반전이다. 'QUIZ_001' 글자가 거울상으로 빛난다.","next":"q001"},{"text":"두 문 사이 벽을 만져본다 — 제3의 선택지가 있을 수 있다","traits":{"chaotic":3,"empathic":1},"response":"벽이 물결치더니 통로가 열린다. 숨겨진 길. 하지만 결국 같은 곳으로 이어진다.","next":"q001"},{"text":"뒤를 돌아본다 — 온 길을 되짚어야 한다","traits":{"empathic":2,"pragmatic":2},"response":"뒤돌아보니 복도가 사라졌다. 앞으로 가는 수밖에 없다. 두 문이 하나로 합쳐진다.","next":"q001"}]}],"quizzes":[{"id":"q001","title":"패턴의 균열","type":"pattern","narration":"벽에 나타난 숫자 배열. 이 세계의 논리를 이해해야 다음으로 갈 수 있다.","question":"다음 수열의 빈칸을 채우시오: 1, 1, 2, 3, 5, 8, ?, 21","hint":"자연은 이 패턴을 사랑한다. 나선, 꽃잎, 소라껍질...","answer":"13","accept":["13","십삼","열셋"],"success":{"text":"정답. 숫자들이 빛나며 벽이 열린다. 피보나치 — 이 세계도 수학의 법칙을 따르는군.","traits":{"rational":2},"next":null},"failure":{"text":"벽이 붉게 빛난다. 하지만 사라지지 않는다. 이 세계는 실패에도 관대한 듯하다.","traits":{"chaotic":1},"next":null}}],"results":[{"primary":"rational","title":"디코더 — 현실 해독자","icon":"🔬","description":"당신은 혼돈 속에서도 패턴을 찾아내는 분석가입니다. 감정에 흔들리지 않고, 데이터와 논리로 세계의 본질을 파헤칩니다.","strength":"논리적 추론, 패턴 인식, 냉철한 판단","weakness":"감정적 교류의 어려움, 직관의 과소평가","quote":"\"모든 혼돈에는 숨겨진 질서가 있다.\""},{"primary":"empathic","title":"미러 — 감정 거울","icon":"🪞","description":"당신은 타인의 마음을 비추는 거울입니다. 혼동현실 속에서 당신이 의지하는 것은 논리가 아닌 '느낌'입니다.","strength":"공감 능력, 직관적 판단, 감정적 소통","weakness":"객관적 분석의 부족, 감정적 소진 위험","quote":"\"진실은 머리가 아닌 가슴으로 느끼는 것.\""},{"primary":"chaotic","title":"글리치 — 시스템 이탈자","icon":"⚡","description":"당신은 규칙 밖의 존재입니다. 정해진 길을 거부하고, 시스템의 허점을 찾아 돌파합니다.","strength":"창의적 문제해결, 틀 파괴, 예측 불가능성","weakness":"일관성 부족, 계획 없는 행동의 리스크","quote":"\"규칙은 깨지라고 있는 거야.\""},{"primary":"pragmatic","title":"오퍼레이터 — 현실 조율자","icon":"🎯","description":"당신은 효율의 화신입니다. 쓸데없는 고민은 덜어내고, 최적의 경로를 찾습니다.","strength":"효율적 의사결정, 자원 관리, 실행력","weakness":"과정의 가치 간과, 감정적 깊이 부족","quote":"\"결과가 같다면 빠른 길을 택한다.\""}]};

  // ─── DATA LOADING ───
  async function loadData() {
    try {
      const res = await fetch('data/scenarios.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      gameData = await res.json();
    } catch (e) {
      console.warn('fetch failed (likely file:// protocol), using inline data:', e.message);
      gameData = FALLBACK_DATA;
    }
    state.totalSteps = gameData.scenarios.length + gameData.quizzes.length;
  }

  // ─── FIND NODE ───
  function findScenario(id) {
    return gameData.scenarios.find(s => s.id === id);
  }
  function findQuiz(id) {
    return gameData.quizzes.find(q => q.id === id);
  }

  // ─── START GAME ───
  function startGame() {
    if (!gameData || !gameData.scenarios || gameData.scenarios.length === 0) {
      console.error('Game data not loaded');
      return;
    }
    state.traits = { rational: 0, empathic: 0, chaotic: 0, pragmatic: 0 };
    state.history = [];
    state.stepsDone = 0;
    navigateTo(gameData.scenarios[0].id);
  }

  // ─── NAVIGATE ───
  function navigateTo(nodeId) {
    if (!nodeId) {
      showResult();
      return;
    }

    state.currentNode = nodeId;

    // Is it a scenario?
    const scenario = findScenario(nodeId);
    if (scenario) {
      showNarration(scenario);
      return;
    }

    // Is it a quiz?
    const quiz = findQuiz(nodeId);
    if (quiz) {
      showQuiz(quiz);
      return;
    }

    // If node not found, show result
    showResult();
  }

  // ─── NARRATION ───
  function showNarration(scenario) {
    $('chapter-badge').textContent = `Chapter ${scenario.chapter}`;
    $('scene-title').textContent = scenario.title;

    const box = $('narration-box');
    box.innerHTML = '';
    scenario.narration.forEach((line, i) => {
      const p = document.createElement('p');
      p.className = 'narration-line';
      p.textContent = line;
      p.style.animationDelay = (i * 0.8) + 's';
      box.appendChild(p);
    });

    showScreen('narration');

    // Tap to continue → show choices
    const handler = () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchend', handler);
      showChoices(scenario);
    };
    // Delay to prevent accidental skip
    setTimeout(() => {
      document.addEventListener('click', handler, { once: true });
      document.addEventListener('touchend', handler, { once: true });
    }, 1000);
  }

  // ─── CHOICES ───
  function showChoices(scenario) {
    $('question-text').textContent = scenario.question;
    const container = $('choices-container');
    container.innerHTML = '';

    const markers = ['A', 'B', 'C', 'D'];
    scenario.choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-marker">${markers[i]}</span><span>${choice.text}</span>`;
      btn.addEventListener('click', () => onChoiceSelected(scenario, choice));
      container.appendChild(btn);
    });

    showScreen('choice');
  }

  // ─── CHOICE SELECTED ───
  function onChoiceSelected(scenario, choice) {
    // Apply traits
    if (choice.traits) {
      for (const [trait, value] of Object.entries(choice.traits)) {
        state.traits[trait] = (state.traits[trait] || 0) + value;
      }
    }

    // Record history
    state.history.push({
      scenarioId: scenario.id,
      choiceText: choice.text,
      traits: { ...choice.traits },
    });

    state.stepsDone++;
    updateProgress();

    // Show response
    showResponse(choice.response, choice.next);
  }

  // ─── RESPONSE ───
  function showResponse(text, nextId) {
    $('response-text').textContent = text;
    // Reset animation
    const rt = $('response-text');
    rt.style.animation = 'none';
    requestAnimationFrame(() => {
      rt.style.animation = '';
    });

    showScreen('response');

    const continueBtn = $('btn-continue');
    const handler = () => {
      continueBtn.removeEventListener('click', handler);
      navigateTo(nextId);
    };
    continueBtn.addEventListener('click', handler);
  }

  // ─── QUIZ ───
  function showQuiz(quiz) {
    $('quiz-title').textContent = `PUZZLE: ${quiz.title}`;
    $('quiz-question').textContent = quiz.question;
    $('quiz-hint').textContent = `💡 ${quiz.hint}`;
    $('quiz-input').value = '';
    $('quiz-feedback').textContent = '';
    $('quiz-feedback').className = 'quiz-feedback';

    showScreen('quiz');

    // Focus input on desktop
    setTimeout(() => $('quiz-input').focus(), 500);

    const submitHandler = () => {
      const answer = $('quiz-input').value.trim();
      if (!answer) return;

      const isCorrect = quiz.accept.some(a =>
        a.toLowerCase() === answer.toLowerCase()
      );

      const feedback = $('quiz-feedback');
      if (isCorrect) {
        feedback.textContent = '✅ ' + quiz.success.text;
        feedback.className = 'quiz-feedback success';
        // Apply success traits
        if (quiz.success.traits) {
          for (const [t, v] of Object.entries(quiz.success.traits)) {
            state.traits[t] = (state.traits[t] || 0) + v;
          }
        }
      } else {
        feedback.textContent = '❌ ' + quiz.failure.text;
        feedback.className = 'quiz-feedback failure';
        if (quiz.failure.traits) {
          for (const [t, v] of Object.entries(quiz.failure.traits)) {
            state.traits[t] = (state.traits[t] || 0) + v;
          }
        }
      }

      state.stepsDone++;
      updateProgress();

      // Remove submit handler
      $('btn-quiz-submit').removeEventListener('click', submitHandler);
      $('quiz-input').removeEventListener('keydown', keyHandler);

      // Auto-continue after delay
      const nextId = isCorrect ? quiz.success.next : quiz.failure.next;
      setTimeout(() => navigateTo(nextId), 2500);
    };

    const keyHandler = (e) => {
      if (e.key === 'Enter') submitHandler();
    };

    $('btn-quiz-submit').addEventListener('click', submitHandler);
    $('quiz-input').addEventListener('keydown', keyHandler);
  }

  // ─── RESULT ───
  function showResult() {
    state.stepsDone = state.totalSteps;
    updateProgress();

    // Find dominant trait
    const sorted = Object.entries(state.traits).sort((a, b) => b[1] - a[1]);
    const primaryTrait = sorted[0][0];
    const maxScore = sorted[0][1];

    // Find result data
    const resultData = gameData.results.find(r => r.primary === primaryTrait)
      || gameData.results[0];
    const traitMeta = gameData.traits[primaryTrait];

    $('result-icon').textContent = resultData.icon;
    $('result-title').textContent = resultData.title;
    $('result-primary-trait').textContent = `${traitMeta.icon} ${traitMeta.name}`;
    $('result-desc').textContent = resultData.description;
    $('result-strength').textContent = resultData.strength;
    $('result-weakness').textContent = resultData.weakness;
    $('result-quote').textContent = resultData.quote;

    // Trait bars
    const barsContainer = $('trait-bars');
    barsContainer.innerHTML = '';
    const totalTraits = sorted.reduce((s, [, v]) => s + v, 0) || 1;
    const traitColors = {
      rational: '#3498db',
      empathic: '#e74c3c',
      chaotic: '#9b59b6',
      pragmatic: '#f39c12',
    };

    for (const [trait, value] of sorted) {
      const meta = gameData.traits[trait];
      const pct = Math.round((value / totalTraits) * 100);
      const row = document.createElement('div');
      row.className = 'trait-bar-row';
      row.innerHTML = `
        <span class="trait-bar-label">${meta.icon} ${meta.name}</span>
        <div class="trait-bar-track">
          <div class="trait-bar-fill" style="width:0%;background:${traitColors[trait]}"></div>
        </div>
        <span class="trait-bar-value">${pct}%</span>
      `;
      barsContainer.appendChild(row);
    }

    showScreen('result');

    // Animate bars
    setTimeout(() => {
      barsContainer.querySelectorAll('.trait-bar-fill').forEach((bar, i) => {
        const pct = Math.round((sorted[i][1] / totalTraits) * 100);
        bar.style.width = pct + '%';
      });
    }, 300);
  }

  // ─── BACKGROUND EFFECT ───
  function initBackground() {
    const canvas = $('bg-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Floating particles + grid
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    let glitchTimer = 0;
    let glitchActive = false;

    function drawBg(timestamp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle grid
      ctx.strokeStyle = 'rgba(108, 92, 231, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#a29bfe';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Random glitch stripe
      glitchTimer += 16;
      if (glitchTimer > 5000 && Math.random() < 0.01) {
        glitchActive = true;
        glitchTimer = 0;
      }
      if (glitchActive) {
        const stripeY = Math.random() * canvas.height;
        const stripeH = Math.random() * 8 + 2;
        ctx.fillStyle = `rgba(255, 51, 102, ${Math.random() * 0.08})`;
        ctx.fillRect(0, stripeY, canvas.width, stripeH);
        if (Math.random() < 0.3) glitchActive = false;
      }

      requestAnimationFrame(drawBg);
    }

    requestAnimationFrame(drawBg);
  }

  // ─── INIT ───
  async function init() {
    initBackground();
    await loadData();

    // Start button
    $('btn-start').addEventListener('click', () => {
      startGame();
    });

    // Restart button
    $('btn-restart').addEventListener('click', () => {
      showScreen('intro');
    });

    // Enter key on quiz input
    // (handled in showQuiz)
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
