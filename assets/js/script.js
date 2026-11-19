const GAME_KEY = window.WEEEDLEY_GAME || "hunt";
const GAME = (typeof GAMES !== "undefined" && GAMES[GAME_KEY]) ? GAMES[GAME_KEY] : null;
const products = GAME ? GAME.products : [];

if (GAME && GAME.theme) {
  const r = document.documentElement;
  r.style.setProperty("--game-primary", GAME.theme.primary);
  r.style.setProperty("--game-accent", GAME.theme.accent);
  r.style.setProperty("--game-text", GAME.theme.text);
}

let SALE_PRESETS = {
  off:{ enabled:false, saleName:'', discountPercent:0 }
};
let SALE_CALENDAR = [];
let RANDOM_SALES = [];
let RANDOM_SALE_SETTINGS = {
  salesPerYearMin:0,
  salesPerYearMax:0,
  durationDaysMin:2,
  durationDaysMax:4,
  distanceFromSeasonalDays:7,
  distanceBetweenRandomSalesDays:21,
  firstPossibleDate:'08.01',
  lastPossibleDate:'15.12'
};
let SALE_MODE = 'off';
let MANUAL_SALE = 'off';
let ACTIVE_SALE = SALE_PRESETS.off;
let TESTIMONIAL_CONFIG = {
  displayMs:10000,
  transitionMs:100,
  items:[]
};
let SITE_CONFIG = {
  copyright:'2050',
  status:'ONLINE',
  version:'2.0.2',
  impressumUrl:''
};

function loadDataFile(src, ready){
  if (ready()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find(script => {
      const value = script.getAttribute('src') || '';
      return value === src || value.endsWith('/' + src);
    });

    if (existing) {
      existing.addEventListener('load', resolve, { once:true });
      existing.addEventListener('error', reject, { once:true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.addEventListener('load', resolve, { once:true });
    script.addEventListener('error', reject, { once:true });
    document.head.appendChild(script);
  });
}

function applySaleConfig(){
  const config = window.WEEEDLEY_SALES || {};

  SALE_PRESETS = config.presets || SALE_PRESETS;
  SALE_CALENDAR = Array.isArray(config.calendar) ? config.calendar : [];
  RANDOM_SALES = Array.isArray(config.randomSales) ? config.randomSales : [];
  RANDOM_SALE_SETTINGS = {
    ...RANDOM_SALE_SETTINGS,
    ...(config.randomSettings || {})
  };
  SALE_MODE = String(config.mode || 'off');
  MANUAL_SALE = String(config.manualSale || 'off');
  ACTIVE_SALE = getActiveSale();
}

function applyTestimonialConfig(){
  const config = window.WEEEDLEY_TESTIMONIALS || {};

  TESTIMONIAL_CONFIG = {
    displayMs:Math.max(500, Number(config.displayMs) || 10000),
    transitionMs:Math.max(50, Number(config.transitionMs) || 100),
    items:Array.isArray(config.items) ? config.items : []
  };
}

function applySiteConfig(){
  const config = window.WEEEDLEY_SITE || {};

  SITE_CONFIG = {
    copyright:String(config.copyright || SITE_CONFIG.copyright),
    status:String(config.status || SITE_CONFIG.status),
    version:String(config.version || SITE_CONFIG.version),
    impressumUrl:String(config.impressumUrl || '')
  };
}

async function loadSiteData(){
  const jobs = [
    loadDataFile('assets/js/site.js', () => Boolean(window.WEEEDLEY_SITE)),
    loadDataFile('assets/js/sales.js', () => Boolean(window.WEEEDLEY_SALES))
  ];

  if (document.body.classList.contains('landing')) {
    jobs.push(
      loadDataFile('assets/js/testimonials.js', () => Boolean(window.WEEEDLEY_TESTIMONIALS))
    );
  }

  await Promise.allSettled(jobs);
  applySiteConfig();
  applySaleConfig();
  applyTestimonialConfig();
}

const SALE_DAY_MS = 86400000;

function saleDayNumber(year, month, day){
  return Math.floor(Date.UTC(year, month - 1, day) / SALE_DAY_MS);
}

function currentSaleDayNumber(date = new Date()){
  return saleDayNumber(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function nthWeekdayOfMonth(year, month, weekday, nth){
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return 1 + ((7 + weekday - firstWeekday) % 7) + ((nth - 1) * 7);
}

function blackFridayDayNumber(year){
  const thanksgivingDay = nthWeekdayOfMonth(year, 11, 4, 4);
  return saleDayNumber(year, 11, thanksgivingDay + 1);
}

function fixedDateDayNumber(value, year){
  const match = String(value).trim().match(/^(\d{1,2})\.(\d{1,2})$/);
  if (!match) return null;
  return saleDayNumber(year, Number(match[2]), Number(match[1]));
}

function calendarDateDayNumber(value, year){
  const fixed = fixedDateDayNumber(value, year);
  if (fixed !== null) return fixed;

  const name = String(value).trim().toUpperCase();
  const blackFriday = blackFridayDayNumber(year);

  if (name === 'BLACK FRIDAY') return blackFriday;
  if (name === 'MONDAY BEFORE BLACK FRIDAY') return blackFriday - 4;
  if (name === 'SUNDAY AFTER BLACK FRIDAY') return blackFriday + 2;
  if (name === 'CYBER MONDAY') return blackFriday + 3;
  if (name === 'TUESDAY AFTER CYBER MONDAY') return blackFriday + 4;

  return null;
}

function getSeasonalSaleWindows(year){
  return SALE_CALENDAR.map(entry => {
    const start = calendarDateDayNumber(entry.from, year);
    let end = calendarDateDayNumber(entry.to, year);

    if (start === null || end === null || !SALE_PRESETS[entry.sale]) return null;

    if (end < start) {
      end = calendarDateDayNumber(entry.to, year + 1);
    }

    return {
      start,
      end,
      sale:SALE_PRESETS[entry.sale]
    };
  }).filter(Boolean);
}

function seededSaleRandom(seed){
  let t = seed >>> 0;

  return function(){
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function getRandomSaleWindows(year, seasonalWindows){
  if (!RANDOM_SALES.length) return [];

  const rng = seededSaleRandom((year * 2654435761) ^ 0x57454544);
  const countRange = RANDOM_SALE_SETTINGS.salesPerYearMax - RANDOM_SALE_SETTINGS.salesPerYearMin + 1;
  const durationRange = RANDOM_SALE_SETTINGS.durationDaysMax - RANDOM_SALE_SETTINGS.durationDaysMin + 1;
  const wanted = RANDOM_SALE_SETTINGS.salesPerYearMin + Math.floor(rng() * Math.max(1, countRange));
  const yearStart = fixedDateDayNumber(RANDOM_SALE_SETTINGS.firstPossibleDate, year);
  const yearEnd = fixedDateDayNumber(RANDOM_SALE_SETTINGS.lastPossibleDate, year);
  const selected = [];

  if (yearStart === null || yearEnd === null) return selected;

  let attempts = 0;

  while (selected.length < wanted && attempts < 1200) {
    attempts++;

    const duration = RANDOM_SALE_SETTINGS.durationDaysMin + Math.floor(rng() * Math.max(1, durationRange));
    const start = yearStart + Math.floor(rng() * Math.max(1, yearEnd - yearStart - duration));
    const end = start + duration - 1;

    const tooCloseToSeasonal = seasonalWindows.some(w =>
      end >= w.start - RANDOM_SALE_SETTINGS.distanceFromSeasonalDays &&
      start <= w.end + RANDOM_SALE_SETTINGS.distanceFromSeasonalDays
    );

    if (tooCloseToSeasonal) continue;

    const tooCloseToRandom = selected.some(w =>
      end >= w.start - RANDOM_SALE_SETTINGS.distanceBetweenRandomSalesDays &&
      start <= w.end + RANDOM_SALE_SETTINGS.distanceBetweenRandomSalesDays
    );

    if (tooCloseToRandom) continue;

    const saleTemplate = RANDOM_SALES[Math.floor(rng() * RANDOM_SALES.length)];

    selected.push({
      start,
      end,
      sale:{ ...saleTemplate }
    });
  }

  return selected.sort((a, b) => a.start - b.start);
}

function getAutomaticSale(date = new Date()){
  const year = date.getFullYear();
  const today = currentSaleDayNumber(date);
  const seasonal = [
    ...getSeasonalSaleWindows(year - 1),
    ...getSeasonalSaleWindows(year),
    ...getSeasonalSaleWindows(year + 1)
  ];

  const seasonalMatch = seasonal.find(w => today >= w.start && today <= w.end);

  if (seasonalMatch) {
    return { ...seasonalMatch.sale, source:'seasonal' };
  }

  const randomSales = getRandomSaleWindows(year, seasonal);
  const randomMatch = randomSales.find(w => today >= w.start && today <= w.end);

  if (randomMatch) {
    return { ...randomMatch.sale, source:'random' };
  }

  return { ...(SALE_PRESETS.off || { enabled:false, saleName:'', discountPercent:0 }), source:'off' };
}

function getActiveSale(){
  const off = SALE_PRESETS.off || { enabled:false, saleName:'', discountPercent:0 };

  if (SALE_MODE === 'off') return { ...off, source:'manual-off' };

  if (SALE_MODE === 'manual') {
    return { ...(SALE_PRESETS[MANUAL_SALE] || off), source:'manual' };
  }

  return getAutomaticSale();
}

function getSaleDiscount(){
  if (!ACTIVE_SALE.enabled) return 0;
  return Math.max(0, Math.min(99, Number(ACTIVE_SALE.discountPercent) || 0));
}

function getSaleColor(){
  if (GAME && GAME.theme && GAME.theme.accent) return GAME.theme.accent;
  return '#6efdbf';
}

function getSalePriceData(price){
  const discount = getSaleDiscount();
  const text = String(price ?? '').trim();
  const match = text.match(/^\$(\d+(?:\.\d{1,2})?)$/);

  if (!discount || !match) {
    return {
      eligible: false,
      priceMarkup: text,
      badgeMarkup: ''
    };
  }

  const original = Number(match[1]);
  const discounted = original * (1 - discount / 100);

  return {
    eligible: true,
    priceMarkup: `
      <span class="sale-price-old">${text}</span>
      <span class="sale-price-new">$${discounted.toFixed(2)}</span>
    `,
    badgeMarkup: `
      <span class="sale-discount-badge">
        <span class="sale-discount-label">${String(ACTIVE_SALE.saleName || 'SALE').trim()}</span>
        <span class="sale-discount-value">-${discount}%</span>
      </span>
    `
  };
}

function initSalePromo(){
  const discount = getSaleDiscount();
  const saleName = String(ACTIVE_SALE.saleName || '').trim();

  if (!discount || !saleName || document.body.classList.contains('contact-page')) return;

  const color = getSaleColor();
  document.body.classList.add('sale-promo-active');

  const style = document.createElement('style');
  style.id = 'sale-promo-styles';
  style.textContent = `
    :root{ --sale-promo-height:46px; }

    .sale-promo-banner{
      --sale-color:${color};
      position:fixed;
      inset:0 0 auto 0;
      height:var(--sale-promo-height);
      z-index:1200;
      overflow:hidden;
      color:#fff;
      background:
        linear-gradient(90deg,
          color-mix(in srgb,var(--sale-color) 17%,#050505),
          #030303 22%,
          #030303 78%,
          color-mix(in srgb,var(--sale-color) 17%,#050505)
        );
      border-top:1px solid color-mix(in srgb,var(--sale-color) 75%,transparent);
      border-bottom:1px solid color-mix(in srgb,var(--sale-color) 90%,transparent);
      box-shadow:
        0 0 26px color-mix(in srgb,var(--sale-color) 24%,transparent),
        0 8px 24px rgba(0,0,0,.58);
      font-family:'IBM Plex Sans',ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      text-transform:uppercase;
    }

    .sale-promo-banner::before{
      content:"";
      position:absolute;
      inset:0;
      pointer-events:none;
      background:repeating-linear-gradient(
        180deg,
        rgba(255,255,255,.035) 0,
        rgba(255,255,255,.035) 1px,
        transparent 1px,
        transparent 4px
      );
      opacity:.8;
    }

    .sale-promo-banner::after{
      content:"";
      position:absolute;
      top:0;
      left:-24%;
      width:18%;
      height:100%;
      pointer-events:none;
      transform:skewX(-18deg);
      background:linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb,var(--sale-color) 28%,transparent),
        rgba(255,255,255,.18),
        transparent
      );
      animation:salePromoSweep 4.6s ease-in-out infinite;
    }

    .sale-promo-viewport{
      position:relative;
      z-index:2;
      width:100%;
      height:100%;
      display:flex;
      align-items:center;
      overflow:hidden;
    }

    .sale-promo-track{
      display:flex;
      width:max-content;
      align-items:center;
      white-space:nowrap;
      will-change:transform;
      transform:translate3d(0,0,0);
      animation:salePromoMarquee var(--sale-marquee-duration,28s) linear infinite;
    }

    .sale-promo-group{
      display:flex;
      flex:0 0 auto;
      align-items:center;
      gap:clamp(4.5rem,7vw,9rem);
      padding-right:clamp(4.5rem,7vw,9rem);
    }

    .sale-promo-item{
      flex:0 0 auto;
      display:inline-flex;
      align-items:center;
      gap:.72rem;
      padding:0 2rem;
      font-size:.78rem;
      font-weight:650;
      letter-spacing:.12em;
      line-height:1;
    }

    .sale-promo-name{
      color:var(--sale-color);
      font-size:1.1em;
      font-weight:850;
      letter-spacing:.16em;
      text-shadow:0 0 15px color-mix(in srgb,var(--sale-color) 55%,transparent);
    }

    .sale-promo-off{
      display:inline-flex;
      min-height:25px;
      align-items:center;
      padding:0 .66rem;
      color:#020202;
      background:var(--sale-color);
      border:1px solid rgba(255,255,255,.78);
      font-weight:900;
      letter-spacing:.08em;
      box-shadow:0 0 18px color-mix(in srgb,var(--sale-color) 45%,transparent);
    }

    .sale-promo-sep{
      color:color-mix(in srgb,var(--sale-color) 74%,white);
    }

    body.sale-promo-active .nav{
      top:var(--sale-promo-height);
    }

    body.landing.sale-promo-active .landing-main{
      padding-top:calc(96px + var(--sale-promo-height));
    }

    .product-image{
      position:relative;
    }

    .sale-discount-badge{
      --sale-color:${color};
      position:absolute;
      top:12px;
      left:12px;
      z-index:7;
      display:flex;
      flex-direction:column;
      align-items:stretch;
      min-width:104px;
      overflow:hidden;
      color:#fff;
      background:#050505;
      border:2px solid var(--sale-color);
      box-shadow:
        0 0 0 1px rgba(255,255,255,.16),
        0 0 22px color-mix(in srgb,var(--sale-color) 44%,transparent),
        0 14px 30px rgba(0,0,0,.62);
      font-family:'IBM Plex Sans',ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      line-height:1;
      transform:rotate(-1.5deg);
      transform-origin:center;
      clip-path:polygon(0 0,100% 0,100% 82%,92% 100%,0 100%);
      text-shadow:none;
    }

    .sale-discount-badge::after{
      content:"";
      position:absolute;
      inset:0;
      pointer-events:none;
      background:repeating-linear-gradient(
        180deg,
        rgba(255,255,255,.035) 0,
        rgba(255,255,255,.035) 1px,
        transparent 1px,
        transparent 4px
      );
      mix-blend-mode:screen;
    }

    .sale-discount-label{
      position:relative;
      z-index:1;
      display:block;
      padding:.35rem .58rem .32rem;
      color:#050505;
      background:var(--sale-color);
      font-size:.58rem;
      font-weight:900;
      letter-spacing:.12em;
      text-align:center;
      white-space:nowrap;
      text-overflow:ellipsis;
      overflow:hidden;
    }

    .sale-discount-value{
      position:relative;
      z-index:1;
      display:block;
      padding:.5rem .7rem .58rem;
      color:#fff;
      font-size:1.48rem;
      font-weight:950;
      letter-spacing:-.035em;
      text-align:center;
      text-shadow:
        0 0 10px rgba(255,255,255,.16),
        2px 2px 0 color-mix(in srgb,var(--sale-color) 58%,transparent);
    }

    .product-price:has(.sale-price-new){
      --sale-color:${color};
      display:flex;
      flex-direction:column;
      align-items:flex-end;
      justify-content:center;
      gap:.06rem;
      min-width:96px;
      padding:.38rem .62rem .44rem;
    }

    .sale-price-old{
      opacity:.7;
      font-size:.68em;
      font-weight:650;
      line-height:1;
      text-decoration:line-through;
      text-decoration-thickness:1.5px;
    }

    .sale-price-new{
      font-size:1.08em;
      font-weight:900;
      line-height:1.05;
      letter-spacing:.01em;
    }

    @keyframes salePromoMarquee{
      from{ transform:translate3d(0,0,0); }
      to{ transform:translate3d(var(--sale-marquee-distance,-50%),0,0); }
    }

    @keyframes salePromoSweep{
      0%,56%{ left:-24%; opacity:0; }
      65%{ opacity:1; }
      84%{ left:112%; opacity:.75; }
      100%{ left:112%; opacity:0; }
    }

    @media(max-width:900px){
      :root{ --sale-promo-height:39px; }

      .sale-promo-item{
        gap:.54rem;
        padding:0 1.35rem;
        font-size:.64rem;
        letter-spacing:.09em;
      }

      .sale-promo-off{
        min-height:21px;
        padding:0 .5rem;
      }

      .sale-discount-badge{
        top:9px;
        left:9px;
        min-width:91px;
        border-width:2px;
      }

      .sale-discount-label{
        padding:.3rem .46rem .28rem;
        font-size:.5rem;
        letter-spacing:.09em;
      }

      .sale-discount-value{
        padding:.42rem .58rem .48rem;
        font-size:1.24rem;
      }

      body.landing.sale-promo-active .landing-main{
        padding-top:calc(138px + var(--sale-promo-height));
      }
    }

    @media(max-width:480px){
      :root{ --sale-promo-height:36px; }

      .sale-promo-group{
        gap:2.6rem;
        padding-right:2.6rem;
      }

      .sale-promo-item{
        gap:.46rem;
        padding:0 1rem;
        font-size:.59rem;
        letter-spacing:.07em;
      }

      .sale-promo-off{
        min-height:19px;
        padding:0 .42rem;
      }

      body.landing.sale-promo-active .landing-main{
        padding-top:calc(136px + var(--sale-promo-height));
      }
    }

    @media(prefers-reduced-motion:reduce){
      .sale-promo-track,
      .sale-promo-banner::after{ animation:none; }
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.className = 'sale-promo-banner';
  banner.setAttribute('role', 'status');

  const item = `
    <span class="sale-promo-item">
      <strong class="sale-promo-name">${saleName}</strong>
      <span class="sale-promo-sep">//</span>
      <span class="sale-promo-off">${discount}% OFF</span>
      <span class="sale-promo-sep">//</span>
      <span>COMMON SENSE SOLD SEPARATELY</span>
    </span>
  `;

  banner.innerHTML = `
    <div class="sale-promo-viewport" aria-label="${saleName} ${discount}% off">
      <div class="sale-promo-track">
        <div class="sale-promo-group"></div>
        <div class="sale-promo-group" aria-hidden="true"></div>
      </div>
    </div>
  `;

  const nav = document.querySelector('.nav');
  if (nav) document.body.insertBefore(banner, nav);
  else document.body.prepend(banner);

  const viewport = banner.querySelector('.sale-promo-viewport');
  const track = banner.querySelector('.sale-promo-track');
  const groups = banner.querySelectorAll('.sale-promo-group');

  if (viewport && track && groups.length === 2) {
    let resizeFrame = 0;

    const buildMarquee = () => {
      track.style.animation = 'none';
      track.style.transform = 'translate3d(0,0,0)';

      groups[0].innerHTML = '';
      groups[1].innerHTML = '';

      const targetWidth = Math.max(viewport.clientWidth * 1.5, 1600);
      let count = 0;

      while (groups[0].scrollWidth < targetWidth && count < 40) {
        groups[0].insertAdjacentHTML('beforeend', item);
        count++;
      }

      groups[1].innerHTML = groups[0].innerHTML;

      requestAnimationFrame(() => {
        const groupWidth = groups[0].getBoundingClientRect().width;
        const pixelsPerSecond = window.innerWidth <= 900 ? 78 : 92;
        const duration = Math.max(18, groupWidth / pixelsPerSecond);

        track.style.setProperty('--sale-marquee-distance', `${-groupWidth}px`);
        track.style.setProperty('--sale-marquee-duration', `${duration}s`);

        requestAnimationFrame(() => {
          track.style.transform = '';
          track.style.animation = '';
        });
      });
    };

    buildMarquee();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(buildMarquee);
    }, { passive:true });
  }
}

function generateProductCard(product){
  const linkAttr = product.link ? `data-link="${product.link}"` : "";
  const sale = getSalePriceData(product.price);

  return `
    <div class="product-card animate-on-scroll" ${linkAttr}>
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${sale.badgeMarkup}
        <div class="product-price">${sale.priceMarkup}</div>
      </div>
      <div class="product-content">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <ul class="product-features">
          ${product.features.map(f=>`<li>${f}</li>`).join('')}
        </ul>
        <div class="product-buttons">
          <a href="#" class="product-btn product-btn-primary">Get trial or buy</a>
          <a href="#" class="product-btn product-btn-secondary">Watch demo</a>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(){
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = products.map(generateProductCard).join('');
}

function initNavbarScrollEffect(){
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.style.background =
      window.scrollY > 30
        ? 'rgba(10,10,10,0.92)'
        : 'rgba(10,10,10,0.8)';
  };

  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

function applyParallaxOffset(){
  const isMobile = window.matchMedia('(max-width:768px)').matches;
  const factor = isMobile ? 0.14 : 0.22;
  document.documentElement.style.setProperty(
    '--bg-offset-y',
    Math.round(window.scrollY * factor) + 'px'
  );
}

function initParallax(){
  applyParallaxOffset();
  window.addEventListener('scroll', applyParallaxOffset, { passive:true });
  window.addEventListener('resize', applyParallaxOffset, { passive:true });
}

let win11CanClose = false;
let win11Timer = null;

function getExeName(){
  return {
    hunt: 'hunt.exe',
    arc: 'PioneerGame.exe',
    pubg: 'TslGame.exe',
    bf6: 'bf6.exe',
    wardogs: 'wardogs.exe',
    hunger: 'hunger.exe'
  }[GAME_KEY] || 'game.exe';
}

function ensureWin11Crash(){
  let el = document.getElementById('win11-crash');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'win11-crash';
  el.className = 'win11-crash';
  document.body.appendChild(el);
  return el;
}

function renderWin11Crash(el){
  el.innerHTML = `
    <div class="win11-dialog">
      <div class="win11-titlebar">
        <span>Microsoft® Windows® Operating System</span>
      </div>
      <div class="win11-body">
        <div class="win11-heading">${getExeName()} is not responding</div>
        <div class="win11-sub">If you close the program, you might lose information.</div>
        <div class="win11-actions">
          <div>→ Close the program</div>
          <div>→ Wait for the program to respond</div>
        </div>
      </div>
    </div>
  `;
}

function runWin11CrashOverlay(){
  const el = ensureWin11Crash();
  renderWin11Crash(el);

  if (el.classList.contains('active')) return;

  requestAnimationFrame(() => el.classList.add('active'));

  win11CanClose = false;
  window.addEventListener('keydown', dismissWin11, true);
  window.addEventListener('pointerdown', dismissWin11, true);

  win11Timer = setTimeout(() => {
    win11CanClose = true;
  }, 2000);
}

function dismissWin11(){
  if (!win11CanClose) return;
  const el = document.getElementById('win11-crash');
  if (!el) return;

  el.classList.remove('active');
  window.removeEventListener('keydown', dismissWin11, true);
  window.removeEventListener('pointerdown', dismissWin11, true);
  clearTimeout(win11Timer);
}

let mobileCanClose = false;

function ensureMobilePermission(){
  let el = document.getElementById('mobile-permission');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'mobile-permission';
  el.className = 'mobile-permission';

  el.innerHTML = `
    <div class="permission-card">
      <div class="permission-app">weeedleyhacks.com</div>
      <div class="permission-title">Allow access to your device?</div>
      <div class="permission-text">This app requires additional permissions.</div>
      <ul class="permission-list">
        <li><span class="permission-dot"></span> Screen recording</li>
        <li><span class="permission-dot"></span> Audio playback</li>
        <li><span class="permission-dot"></span> Input monitoring</li>
      </ul>
      <div class="permission-actions">
        <button class="permission-btn">Deny</button>
        <button class="permission-btn">Allow</button>
      </div>
    </div>
  `;

  document.body.appendChild(el);
  return el;
}

function runMobilePermissionOverlay(){
  const el = ensureMobilePermission();
  if (el.classList.contains('active')) return;

  el.classList.add('active');
  mobileCanClose = false;

  setTimeout(() => mobileCanClose = true, 3000);

  const close = () => {
    if (!mobileCanClose) return;
    el.classList.remove('active');
    window.removeEventListener('pointerdown', close, true);
    window.removeEventListener('keydown', close, true);
  };

  window.addEventListener('pointerdown', close, true);
  window.addEventListener('keydown', close, true);
}

function initVideoModal(){
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('modal-video');
  if (!modal || !video) return;

  video.controls = false;
  video.disablePictureInPicture = true;
  video.setAttribute('controlslist', 'nodownload nofullscreen noplaybackrate noremoteplayback');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  if ('remote' in video) {
    try { video.remote.disable(); } catch (e) {}
  }

  const SRC_DOWNLOAD = 'assets/videos/stopit.mp4';
  const SRC_DEMO = 'assets/videos/rick.mp4';

  function openWith(src){
    modal.classList.add('active');
    video.pause();
    video.currentTime = 0;
    video.src = src;
    video.play().catch(()=>{});
  }

  function close(){
    modal.classList.remove('active');
    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  document.addEventListener('click', (e)=>{
    const card = e.target.closest('.product-card[data-link]');
    if (card && !e.target.closest('.product-btn')) {
      const url = card.getAttribute('data-link');
      if (url) {
        e.preventDefault();
        window.open(url, '_blank', 'noopener');
        return;
      }
    }

    const btn = e.target.closest('.product-btn');
    if (!btn) return;

    e.preventDefault();

    if (btn.classList.contains('product-btn-primary')) {
      openWith(SRC_DOWNLOAD);
    } else {
      if (window.matchMedia('(max-width:900px)').matches) {
        runMobilePermissionOverlay();
      } else {
        runWin11CrashOverlay();
      }
    }
  });

  document.addEventListener('keydown', e=>{
    if (e.key === 'Escape' && modal.classList.contains('active')) close();
  });

  modal.addEventListener('click', e=>{
    if (e.target === modal) close();
  });

  video.onended = close;

  const compat = document.getElementById('compatibilityCheck');
  if (compat) {
    compat.addEventListener('click', e=>{
      e.preventDefault();
      openWith(SRC_DEMO);
    });
  }
}

function initSharedFooter(){
  const footer = document.querySelector('.footer');
  if (!footer) return;

  footer.className = 'footer';
  footer.innerHTML = '';

  const meta = document.createElement('div');
  meta.className = 'footer-meta';

  const copyright = document.createElement('span');
  copyright.textContent = `© ${SITE_CONFIG.copyright}`;

  const status = document.createElement('span');
  status.append('STATUS: ');

  const statusValue = document.createElement('span');
  statusValue.className = 'status-online';
  statusValue.textContent = SITE_CONFIG.status;
  status.append(statusValue);

  const version = document.createElement('span');
  version.textContent = `VERSION: ${SITE_CONFIG.version}`;

  const note = document.createElement('span');
  note.id = 'footer-note';
  note.textContent = 'Made for trolling sweatlords hackusating.';

  const legal = document.createElement('span');
  legal.className = 'footer-legal';
  const addLegalLink = (label, href, external) => {
    const sep = document.createElement('span');
    sep.textContent = ' · ';
    const link = document.createElement('a');
    link.textContent = label;
    link.href = href;
    link.rel = 'nofollow';
    if (external) {
      link.target = '_blank';
      link.rel = 'nofollow noopener noreferrer';
    }
    legal.append(sep, link);
  };
  if (SITE_CONFIG.impressumUrl) addLegalLink('Legal Notice', SITE_CONFIG.impressumUrl, /^https:\/\//.test(SITE_CONFIG.impressumUrl));
  addLegalLink('Privacy', 'privacy.html', false);
  note.append(legal);

  meta.append(copyright, status, version, note);
  footer.append(meta);
}

function createTestimonialPanel(){
  const panel = document.createElement('article');
  panel.className = 'landing-testimonial-panel';

  const meta = document.createElement('div');
  meta.className = 'landing-testimonial-meta';

  const stars = document.createElement('span');
  stars.className = 'landing-testimonial-stars';

  const name = document.createElement('span');
  name.className = 'landing-testimonial-name';

  const quote = document.createElement('div');
  quote.className = 'landing-testimonial-quote';

  meta.append(stars, name);
  panel.append(meta, quote);

  return panel;
}

function renderTestimonialPanel(panel, item){
  const stars = Math.max(1, Math.min(5, Number(item.stars) || 5));
  panel.querySelector('.landing-testimonial-stars').textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  panel.querySelector('.landing-testimonial-name').textContent = String(item.name || 'Verified Buyer');
  panel.querySelector('.landing-testimonial-quote').textContent = `“${String(item.text || '')}”`;
}

function initTestimonials(){
  if (!document.body.classList.contains('landing')) return;

  const items = TESTIMONIAL_CONFIG.items
    .filter(item => item && item.text)
    .map(item => ({ ...item }));

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  const footer = document.querySelector('.footer');

  if (!footer || !items.length) return;

  let meta = footer.querySelector(':scope > .footer-meta');

  if (!meta && footer.classList.contains('footer-meta')) {
    meta = document.createElement('div');
    meta.className = 'footer-meta';

    while (footer.firstChild) {
      meta.appendChild(footer.firstChild);
    }

    footer.classList.remove('footer-meta');
    footer.appendChild(meta);
  }

  const root = document.createElement('section');
  root.className = 'landing-testimonials';
  root.setAttribute('aria-label', 'Customer testimonials');

  const stage = document.createElement('div');
  stage.className = 'landing-testimonial-stage';
  stage.setAttribute('aria-live', 'polite');

  let current = createTestimonialPanel();
  let next = createTestimonialPanel();
  let index = 0;

  renderTestimonialPanel(current, items[index]);

  current.style.transform = 'translateY(0)';
  current.style.opacity = '1';
  next.style.transform = 'translateY(115%)';
  next.style.opacity = '0';

  stage.append(current, next);
  root.append(stage);
  footer.prepend(root);

  if (items.length < 2) return;

  const duration = TESTIMONIAL_CONFIG.transitionMs;
  const easing = 'cubic-bezier(.16,1,.3,1)';

  function schedule(){
    window.setTimeout(roll, TESTIMONIAL_CONFIG.displayMs);
  }

  function roll(){
    const nextIndex = (index + 1) % items.length;

    renderTestimonialPanel(next, items[nextIndex]);

    next.style.transition = 'none';
    next.style.transform = 'translateY(115%)';
    next.style.opacity = '0';
    next.style.filter = 'blur(2px)';

    void next.offsetHeight;

    current.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`;
    next.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`;

    current.style.transform = 'translateY(-115%)';
    current.style.opacity = '0';
    current.style.filter = 'blur(2px)';

    next.style.transform = 'translateY(0)';
    next.style.opacity = '1';
    next.style.filter = 'blur(0)';

    window.setTimeout(() => {
      current.style.transition = 'none';
      current.style.transform = 'translateY(115%)';
      current.style.opacity = '0';
      current.style.filter = 'blur(2px)';

      index = nextIndex;

      const previous = current;
      current = next;
      next = previous;

      schedule();
    }, duration);
  }

  schedule();
}

function init(){
  initSalePromo();
  renderProducts();
  initNavbarScrollEffect();
  initParallax();
  initVideoModal();
  initTestimonials();
}

async function boot(){
  await loadSiteData();
  initSharedFooter();
  init();
}

document.addEventListener('DOMContentLoaded', () => {
  boot();
});
