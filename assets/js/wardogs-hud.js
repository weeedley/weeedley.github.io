(function () {
  'use strict';

  if (!document.body.classList.contains('game-wardogs')) return;

  const TEAM_ORDER = ['blue', 'red', 'green'];
  const TEAM_META = {
    blue:  { label: 'UNSERIOUS', css: '#4aa8dc' },
    red:   { label: 'SWEATS',    css: '#cf4b48' },
    green: { label: 'COINFLIP',  css: '#36c978' }
  };
  const CYCLE_MS = 10000;

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const formatScore = (value) => value < 1000 ? String(value).padStart(3, '0') : String(value);

  const scores = {
    blue: randInt(0, 20),
    red: randInt(60, 80),
    green: randInt(40, 60)
  };

  const POP_MIN = 20;
  const POP_MAX = 35;

  const population = {
    blue: randInt(22, 33),
    red: randInt(22, 33),
    green: randInt(22, 33)
  };

  const hud = document.createElement('div');
  hud.className = 'wardogs-control-hud';
  hud.id = 'wardogsControlHud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = `
    <div class="wardogs-hud-teams">
      ${TEAM_ORDER.map(team => `
        <div class="wardogs-hud-team" data-team="${team}">
          <div class="wardogs-hud-score" data-score="${team}">000</div>
          <div class="wardogs-hud-pop">
            <span class="wardogs-hud-person"></span>
            <span data-pop="${team}">00</span>
          </div>
          <div class="wardogs-hud-label">${TEAM_META[team].label}</div>
        </div>
      `).join('')}
    </div>
    <div class="wardogs-hud-control">
      <div class="wardogs-hud-progress"></div>
      <div class="wardogs-hud-control-text">CONTROL: always you thanks to weeedleyhacks.com</div>
    </div>
  `;

  document.body.appendChild(hud);

  const progress = hud.querySelector('.wardogs-hud-progress');
  const teams = Array.from(hud.querySelectorAll('.wardogs-hud-team'));
  const footer = document.querySelector('.footer');

  function updateHudClearance() {
    const height = Math.ceil(hud.getBoundingClientRect().height);
    const gap = window.matchMedia('(max-width: 600px)').matches ? 10 : 14;
    document.body.style.setProperty('--wardogs-hud-clearance', `${height + gap}px`);
  }

  function renderScores() {
    TEAM_ORDER.forEach(team => {
      const scoreEl = hud.querySelector(`[data-score="${team}"]`);
      const popEl = hud.querySelector(`[data-pop="${team}"]`);
      if (scoreEl) scoreEl.textContent = formatScore(scores[team]);
      if (popEl) popEl.textContent = String(population[team]).padStart(2, '0');
    });
  }

  let activeTeam = null;
  let cycleStart = performance.now();
  let rafId = 0;
  const populationTimers = new Map();

  function selectTeam(team) {
    activeTeam = team;
    hud.style.setProperty('--wardogs-active', TEAM_META[team].css);
    teams.forEach(el => el.classList.toggle('is-active', el.dataset.team === team));
  }

  function updateControlFromPopulation() {
    const maxPopulation = Math.max(...TEAM_ORDER.map(team => population[team]));
    const leaders = TEAM_ORDER.filter(team => population[team] === maxPopulation);


    if (activeTeam && leaders.includes(activeTeam)) return;

    selectTeam(leaders[randInt(0, leaders.length - 1)]);
  }

  function changePopulation(team) {
    const magnitude = randInt(3, 5);

    const values = TEAM_ORDER.map(t => population[t]);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const spread = highest - lowest;

    let upChance = 0.5;


    if (spread >= 9) {
      if (population[team] === highest) upChance = 0.20;
      else if (population[team] === lowest) upChance = 0.80;
    } else if (spread >= 6) {
      if (population[team] === highest) upChance = 0.30;
      else if (population[team] === lowest) upChance = 0.70;
    }


    if (population[team] <= POP_MIN + 2) upChance = Math.max(upChance, 0.78);
    if (population[team] >= POP_MAX - 2) upChance = Math.min(upChance, 0.22);

    const direction = Math.random() < upChance ? 1 : -1;

    population[team] = Math.max(
      POP_MIN,
      Math.min(POP_MAX, population[team] + direction * magnitude)
    );

    renderScores();
    updateControlFromPopulation();
  }

  function schedulePopulationChange(team, initialDelay = null) {
    const delay = initialDelay ?? randInt(950, 2400);

    const timer = window.setTimeout(() => {
      changePopulation(team);


      schedulePopulationChange(team, randInt(1050, 2900));
    }, delay);

    populationTimers.set(team, timer);
  }

  function animate(now) {
    const elapsed = now - cycleStart;
    const ratio = Math.min(elapsed / CYCLE_MS, 1);
    progress.style.width = `${ratio * 100}%`;

    if (ratio >= 1) {
      updateControlFromPopulation();

      if (activeTeam) {
        scores[activeTeam] += 1;
      }

      renderScores();
      cycleStart = now;
      progress.style.width = '0%';
    }

    rafId = requestAnimationFrame(animate);
  }

  function updateFooterLift() {
    if (!footer) {
      hud.style.setProperty('--wardogs-footer-lift', '0px');
      return;
    }

    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const footerTop = footer.getBoundingClientRect().top;
    const overlap = Math.max(0, viewportHeight - footerTop);
    hud.style.setProperty('--wardogs-footer-lift', `${Math.ceil(overlap)}px`);
  }

  let positionQueued = false;
  function queueFooterLift() {
    if (positionQueued) return;
    positionQueued = true;
    requestAnimationFrame(() => {
      updateHudClearance();
      updateFooterLift();
      positionQueued = false;
    });
  }

  renderScores();
  updateControlFromPopulation();

  
  schedulePopulationChange('blue', randInt(500, 1200));
  schedulePopulationChange('red', randInt(1300, 2100));
  schedulePopulationChange('green', randInt(2200, 3000));

  updateHudClearance();
  updateFooterLift();
  rafId = requestAnimationFrame(animate);

  window.addEventListener('scroll', queueFooterLift, { passive: true });
  window.addEventListener('resize', queueFooterLift, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', queueFooterLift, { passive: true });
    window.visualViewport.addEventListener('scroll', queueFooterLift, { passive: true });
  }

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(rafId);
    populationTimers.forEach(timer => clearTimeout(timer));
    populationTimers.clear();
  }, { once: true });
})();
