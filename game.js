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

  // ─── DATA LOADING ───
  async function loadData() {
    try {
      const res = await fetch('data/scenarios.json');
      gameData = await res.json();
      state.totalSteps = gameData.scenarios.length + gameData.quizzes.length;
    } catch (e) {
      console.error('Failed to load game data:', e);
    }
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
    state.traits = { rational: 0, empathic: 0, chaotic: 0, pragmatic: 0 };
    state.history = [];
    state.stepsDone = 0;
    const firstScenario = gameData.scenarios[0];
    if (firstScenario) {
      navigateTo(firstScenario.id);
    }
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
