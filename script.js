"use strict";

const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
const soundToggle = document.getElementById("soundToggle");
const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let audioContext = null;
let sfxEnabled = true;
let statsStarted = false;
let cartCount = 0;
let toastTimer = null;

function ensureAudioContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playSweep(startFreq, endFreq, duration, type, volume) {
  if (!sfxEnabled) return;

  const ctx = ensureAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), ctx.currentTime + duration);

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration + 0.01);
}

function playEffect(type) {
  if (!sfxEnabled) return;

  if (type === "tap") {
    playSweep(520, 420, 0.06, "triangle", 0.022);
    return;
  }

  if (type === "menu") {
    playSweep(320, 170, 0.08, "sawtooth", 0.018);
    return;
  }

  if (type === "filter") {
    playSweep(170, 820, 0.1, "triangle", 0.02);
    return;
  }

  if (type === "success") {
    playSweep(600, 760, 0.07, "sine", 0.024);
    setTimeout(() => playSweep(820, 980, 0.08, "sine", 0.022), 70);
    return;
  }

  if (type === "error") {
    playSweep(250, 130, 0.13, "square", 0.019);
  }
}

function updateSoundToggleUI() {
  if (!soundToggle) return;

  soundToggle.textContent = sfxEnabled ? "SFX ON" : "SFX OFF";
  soundToggle.classList.toggle("is-on", sfxEnabled);
  soundToggle.setAttribute("aria-pressed", sfxEnabled ? "true" : "false");
}

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    sfxEnabled = !sfxEnabled;
    updateSoundToggleUI();

    if (sfxEnabled) {
      playEffect("tap");
    }
  });
}

updateSoundToggleUI();

if (canUseCustomCursor && cursor && ring) {
  document.addEventListener("mousemove", (event) => {
    const x = event.clientX;
    const y = event.clientY;

    cursor.style.left = `${x - 4}px`;
    cursor.style.top = `${y - 4}px`;
    ring.style.left = `${x - 16}px`;
    ring.style.top = `${y - 16}px`;
  });

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest("a, button")) {
      ring.style.width = "44px";
      ring.style.height = "44px";
      ring.style.borderColor = "rgba(255, 141, 77, 0.8)";
    }
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest("a, button")) {
      ring.style.width = "32px";
      ring.style.height = "32px";
      ring.style.borderColor = "rgba(77, 228, 255, 0.7)";
    }
  });
}

const navList = document.getElementById("navList");
const menuToggle = document.getElementById("menuToggle");

if (menuToggle && navList) {
  menuToggle.addEventListener("click", () => {
    navList.classList.toggle("open");
    const expanded = navList.classList.contains("open");
    menuToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    playEffect("menu");
  });

  navList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      playEffect("tap");
    });
  });
}

function animateCount(id, target, suffix = "") {
  const el = document.getElementById(id);
  if (!el) return;

  const duration = 2200;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);
    el.textContent = `${value.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function startStats() {
  if (statsStarted) return;
  statsStarted = true;

  animateCount("c1", 1247);
  animateCount("c2", 2400000);
  animateCount("c3", 847);
}

const pizzas = [
  {
    name: "INFERNO X",
    emoji: "🔥",
    badge: "hot",
    badgeLabel: "INFERNO",
    desc: "Ghost pepper salsa, habanero-infused oil, triple jalapeno, smoked paprika, scorpion cheese blend.",
    tags: ["GHOST PEPPER", "HABANERO", "BEEF"],
    price: 349,
    cat: "hot"
  },
  {
    name: "TRUFFLE ELITE",
    emoji: "⚫",
    badge: "sig",
    badgeLabel: "SIGNATURE",
    desc: "Black truffle shavings, burrata, prosciutto di Parma, wild arugula, and aged Parmigiano.",
    tags: ["TRUFFLE", "BURRATA", "PROSCIUTTO"],
    price: 549,
    cat: "sig"
  },
  {
    name: "MARGHERITA OS",
    emoji: "🍕",
    badge: "veg",
    badgeLabel: "VEGGIE",
    desc: "San Marzano tomatoes, buffalo mozzarella, basil, and extra virgin olive oil.",
    tags: ["BASIL", "MOZZARELLA", "ORGANIC"],
    price: 249,
    cat: "veg"
  },
  {
    name: "QUANTUM QUATTRO",
    emoji: "🧀",
    badge: "new",
    badgeLabel: "NEW DROP",
    desc: "Gorgonzola, tallegio, smoked provolone, aged cheddar, and truffle honey drizzle.",
    tags: ["4 CHEESE", "TRUFFLE HONEY", "VEG"],
    price: 399,
    cat: "new"
  },
  {
    name: "CYBER CARNIVORE",
    emoji: "🥩",
    badge: "sig",
    badgeLabel: "SIGNATURE",
    desc: "Slow-braised brisket, pepperoni, bacon crumble, caramelized onion, and BBQ neural sauce.",
    tags: ["BRISKET", "PEPPERONI", "BBQ"],
    price: 449,
    cat: "sig"
  },
  {
    name: "VERDE PROTOCOL",
    emoji: "🌿",
    badge: "veg",
    badgeLabel: "VEGGIE",
    desc: "Pesto base, baby spinach, sun-dried tomatoes, pine nuts, cashew ricotta, and lemon zest.",
    tags: ["PESTO", "SPINACH", "CASHEW"],
    price: 299,
    cat: "veg"
  },
  {
    name: "NOVA ORIGINAL",
    emoji: "🌟",
    badge: "sig",
    badgeLabel: "SIGNATURE",
    desc: "Our flagship sourdough with rotating seasonal toppings and house-made tomato conserva.",
    tags: ["SOURDOUGH", "SEASONAL", "PREMIUM"],
    price: 379,
    cat: "sig"
  },
  {
    name: "VOID WALKER",
    emoji: "🖤",
    badge: "new",
    badgeLabel: "NEW DROP",
    desc: "Activated charcoal crust, squid ink tomato base, smoked salmon, capers, and creme fraiche.",
    tags: ["CHARCOAL", "SALMON", "CAPERS"],
    price: 499,
    cat: "new"
  },
  {
    name: "SOLAR FLARE",
    emoji: "☀️",
    badge: "hot",
    badgeLabel: "INFERNO",
    desc: "Yellow pepper mole, turmeric cheese, chili honey, and roasted corn.",
    tags: ["MOLE", "CHILI HONEY", "CORN"],
    price: 329,
    cat: "hot"
  }
];

function applyCardMotion() {
  const cards = document.querySelectorAll(".pizza-card");

  cards.forEach((card, index) => {
    card.classList.add("is-entering");
    card.style.animationDelay = `${index * 45}ms`;
    card.addEventListener(
      "animationend",
      () => {
        card.classList.remove("is-entering");
        card.style.animationDelay = "0ms";
      },
      { once: true }
    );

    if (canUseCustomCursor && !prefersReducedMotion) {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * 7;
        const rotateX = (0.5 - py) * 7;

        card.style.setProperty("--card-rot-x", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--card-rot-y", `${rotateY.toFixed(2)}deg`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--card-rot-x", "0deg");
        card.style.setProperty("--card-rot-y", "0deg");
      });
    }
  });
}

function renderMenu(filter = "all") {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  const filtered = filter === "all" ? pizzas : pizzas.filter((pizza) => pizza.cat === filter);

  grid.innerHTML = filtered
    .map(
      (pizza, index) => `
      <div class="pizza-card" data-cat="${pizza.cat}">
        <div class="card-corner"></div>
        <div class="card-corner-bl"></div>
        <div class="card-badge badge-${pizza.badge}">${pizza.badgeLabel}</div>
        <span class="card-emoji">${pizza.emoji}</span>
        <div class="card-name">${pizza.name}</div>
        <div class="card-desc">${pizza.desc}</div>
        <div class="card-tags">${pizza.tags.map((tag) => `<span class="card-tag">${tag}</span>`).join("")}</div>
        <div class="card-footer">
          <div class="card-price"><sup>₹</sup>${pizza.price}</div>
          <button class="card-add" id="add-${index}" onclick="addToCart('${pizza.name}', ${index})">+ ADD</button>
        </div>
      </div>
    `
    )
    .join("");

  applyCardMotion();
}

function filterMenu(category, button) {
  document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
  if (button) {
    button.classList.add("active");
  }

  renderMenu(category);
  playEffect("filter");
}

function addToCart(name, index) {
  cartCount += 1;

  const counter = document.getElementById("cartCount");
  if (counter) {
    counter.textContent = String(cartCount);
  }

  const button = document.getElementById(`add-${index}`);
  if (button) {
    button.classList.add("added");
    button.textContent = "ADDED";
  }

  showToast(`+ ${name} queued`);
  playEffect("success");
}

function addCustomToCart() {
  cartCount += 1;
  const counter = document.getElementById("cartCount");
  if (counter) {
    counter.textContent = String(cartCount);
  }

  showToast("Custom build queued");
  playEffect("success");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message.toUpperCase();
  toast.classList.add("show");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function showCart() {
  showToast(`Cart: ${cartCount} item(s) - checkout coming soon`);
  playEffect("tap");
}

const buildState = {
  crust: "NEAPOLITAN",
  size: "25cm",
  sauce: "SAN MARZANO",
  toppings: ["Mozzarella"],
  basePrice: 199
};

function selectChoice(type, value, button) {
  if (button && button.parentElement) {
    button.parentElement.querySelectorAll(".choice").forEach((choice) => choice.classList.remove("active"));
    button.classList.add("active");
  }

  if (type === "size") {
    const prices = {
      "25cm / ₹199": 199,
      "30cm / ₹299": 299,
      "35cm / ₹399": 399
    };

    buildState.basePrice = prices[value] || 199;
    buildState.size = value.split("/")[0].trim();
  } else {
    buildState[type] = value;
  }

  updatePreview();
  playEffect("tap");
}

function toggleTopping(name, button) {
  const toppingIndex = buildState.toppings.indexOf(name);

  if (toppingIndex > -1) {
    buildState.toppings.splice(toppingIndex, 1);
    if (button) button.classList.remove("active");
    playEffect("tap");
  } else if (buildState.toppings.length < 5) {
    buildState.toppings.push(name);
    if (button) button.classList.add("active");
    playEffect("tap");
  } else {
    showToast("Max 5 toppings selected");
    playEffect("error");
  }

  updatePreview();
}

function updatePreview() {
  const extras = buildState.toppings.length * 30;
  const total = buildState.basePrice + extras;

  const price = document.getElementById("priceNum");
  const specs = document.getElementById("previewSpecs");
  const heat = document.getElementById("heatIndex");
  const scoreEl = document.getElementById("flavorScore");

  if (price) {
    price.textContent = String(total);
  }

  if (specs) {
    specs.textContent =
      `${buildState.crust} · ${buildState.size.toUpperCase()} · ${buildState.sauce}` +
      (buildState.toppings.length ? ` · ${buildState.toppings.join(", ")}` : "");
  }

  const isHot = buildState.toppings.some((topping) => topping === "Jalapeños");
  if (heat) {
    heat.textContent = isHot ? "HIGH" : "LOW";
  }

  const score = Math.min(
    100,
    70 +
      buildState.toppings.length * 5 +
      (buildState.crust === "SOURDOUGH" ? 5 : 0) +
      (buildState.sauce === "TRUFFLE OIL" ? 8 : 0)
  );

  if (scoreEl) {
    scoreEl.textContent = String(score);
  }
}

function initRevealObserver() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!revealItems.length) return;

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    startStats();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          if (entry.target.classList.contains("stats-bar")) {
            startStats();
          }

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initActiveNav() {
  const sectionIds = ["menu", "tech", "build", "order"];
  const links = Array.from(document.querySelectorAll("nav ul a"));
  if (!links.length) return;

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = () => {
    const fromTop = window.scrollY + 140;

    let current = sectionIds[0];
    sections.forEach((section) => {
      if (section.offsetTop <= fromTop) {
        current = section.id;
      }
    });

    links.forEach((link) => {
      const target = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", target === current);
    });
  };

  setActive();
  window.addEventListener("scroll", setActive, { passive: true });
}

function initHeroMotion() {
  const heroVisual = document.querySelector(".hero-visual");
  const pizzaCore = document.querySelector(".pizza-core");

  if (!heroVisual || !pizzaCore || !canUseCustomCursor || prefersReducedMotion) return;

  heroVisual.addEventListener("mousemove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 10;
    const rotateX = (0.5 - py) * 10;

    pizzaCore.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  heroVisual.addEventListener("mouseleave", () => {
    pizzaCore.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}

function initAmbientParticles() {
  const container = document.getElementById("ambientParticles");
  if (!container || prefersReducedMotion) return;

  const particleCount = canUseCustomCursor ? 26 : 16;

  for (let i = 0; i < particleCount; i += 1) {
    const dot = document.createElement("span");
    dot.className = "particle";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.animationDuration = `${4 + Math.random() * 3.8}s`;
    dot.style.animationDelay = `${Math.random() * 4.2}s`;
    dot.style.opacity = `${0.45 + Math.random() * 0.4}`;
    container.appendChild(dot);
  }
}

function initFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

renderMenu();
updatePreview();
initRevealObserver();
initActiveNav();
initHeroMotion();
initAmbientParticles();
initFooterYear();

window.filterMenu = filterMenu;
window.addToCart = addToCart;
window.addCustomToCart = addCustomToCart;
window.showCart = showCart;
window.selectChoice = selectChoice;
window.toggleTopping = toggleTopping;
