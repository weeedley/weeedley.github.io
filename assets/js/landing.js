(function () {
  const TITLES = [
    "Cope. Report. Repeat.",
    "Skill issue? Probably.",
    "Your lobby. Your playground.",
    "Hackusations incoming.",
    "Nothing suspicious here.",
    "Pure skill. Obviously.",
    "It’s not a cheat. It’s a feature.",
    "We only sell confidence.",
    "Trust me bro.",
    "Skill-based matchmaking? Sure.",
    "Lag. Obviously.",
    "Unlucky timing.",
    "Must be desync.",
    "No footsteps, I swear!",
    "Working as intended."
  ];

  const titleEl = document.getElementById("landingTitle");
  if (titleEl) {
    titleEl.textContent = TITLES[(Math.random() * TITLES.length) | 0];
  }


  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w = window.innerWidth;
  let h = window.innerHeight;

  canvas.width = w;
  canvas.height = h;


  const fontSize = 20;

  const trailFade = 0.08;
  const trailAlpha = 0.1;
  const headAlpha = 1;

  const trailColor = "#0a512eff";
  const headColor = "#6efdbfff";

  const CHARSET =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノ" +
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let columns = Math.floor(w / fontSize);
  const rainDrops = [];
  const lastChars = [];

  for (let i = 0; i < columns; i++) {
    rainDrops[i] = Math.floor(Math.random() * h / fontSize);
    lastChars[i] = null;
  }

  function randChar() {
    return CHARSET[(Math.random() * CHARSET.length) | 0];
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16)
    ];
  }

  const trailRGB = hexToRgb(trailColor);
  const headRGB = hexToRgb(headColor);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    columns = Math.floor(w / fontSize);
  }

  window.addEventListener("resize", resize, { passive: true });


  function draw() {
    ctx.fillStyle = `rgba(0, 0, 0, ${trailFade})`;
    ctx.fillRect(0, 0, w, h);

    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    for (let i = 0; i < rainDrops.length; i++) {
      const x = i * fontSize;
      const y = rainDrops[i] * fontSize;

      if (lastChars[i]) {
        ctx.fillStyle = `rgba(${trailRGB[0]},${trailRGB[1]},${trailRGB[2]},${trailAlpha})`;
        ctx.fillText(lastChars[i], x, y - fontSize);
      }

      const char = randChar();
      ctx.fillStyle = `rgba(${headRGB[0]},${headRGB[1]},${headRGB[2]},${headAlpha})`;
      ctx.fillText(char, x, y);

      lastChars[i] = char;

      rainDrops[i]++;

      if (y > h && Math.random() > 0.975) {
        rainDrops[i] = 0;
        lastChars[i] = null;
      }
    }
  }

  setInterval(draw, 50);
})();
