/**
 * main.js
 * -----------------------------------------------------------------
 * Navigation, scroll interactions, reveals, counters, SVG charts,
 * FAQ accordion, WhatsApp/email links,
 * and section progress indicator.
 * -----------------------------------------------------------------
 */

(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    initNav();
    initScrollProgress();
    initReveals();
    initCounters();
    initHeroChart();
    initFAQ();
    initTestimonials();
    initConsultationTriggers();
    initWhatsapp();
    initBackToTop();
    initSectionIndicator();
    initCursorGlow();
    ConsultationForm.init();
  });

  // ---------------------------------------------------------------------
  function applyConfig() {
    document.documentElement.style.setProperty("--accent", CONFIG.accentColor);
    document.querySelectorAll("[data-config-name]").forEach((el) => (el.textContent = CONFIG.consultantName));
    document.querySelectorAll("[data-config-subtitle]").forEach((el) => (el.textContent = CONFIG.subtitle));
    document.querySelectorAll("[data-config-designation]").forEach((el) => (el.textContent = CONFIG.designation));
    document.querySelectorAll("[data-config-email]").forEach((el) => {
      el.textContent = CONFIG.email;
      if (el.tagName === "A") el.href = `mailto:${CONFIG.email}`;
    });
    document.querySelectorAll("[data-config-phone]").forEach((el) => {
      el.textContent = CONFIG.phone;
      if (el.tagName === "A") el.href = `tel:${CONFIG.phone.replace(/\s+/g, "")}`;
    });
    document.querySelectorAll("[data-config-location]").forEach((el) => (el.textContent = CONFIG.location));
    document.querySelectorAll("[data-config-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

    CONFIG.trustStats.forEach((stat, i) => {
      const el = document.querySelector(`[data-stat="${i}"]`);
      if (!el) return;
      if (stat.value === null) {
        el.closest(".trust-stat").querySelector(".trust-value").textContent = stat.placeholder;
        el.closest(".trust-stat").querySelector(".trust-value").removeAttribute("data-count-to");
      } else {
        el.closest(".trust-stat").querySelector(".trust-value").setAttribute("data-count-to", stat.value);
        el.closest(".trust-stat").querySelector(".trust-value").setAttribute("data-suffix", stat.suffix);
      }
    });
  }

  // ---------------------------------------------------------------------
  function initNav() {
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".nav-toggle");
    const mobileMenu = document.querySelector(".nav-mobile");
    const links = document.querySelectorAll("[data-scroll-to]");

    window.addEventListener("scroll", () => {
      nav.classList.toggle("nav--scrolled", window.scrollY > 24);
    }, { passive: true });

    toggle?.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("nav-mobile--open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetSel = link.getAttribute("data-scroll-to");
        const target = document.querySelector(targetSel);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
          mobileMenu?.classList.remove("nav-mobile--open");
          toggle?.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }
      });
    });
  }

  // ---------------------------------------------------------------------
  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress-bar");
    if (!bar) return;
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    }, { passive: true });
  }

  // ---------------------------------------------------------------------
  function initReveals() {
    const targets = document.querySelectorAll("[data-reveal]");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => io.observe(el));
  }

  // ---------------------------------------------------------------------
  function initCounters() {
    const counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    const animate = (el) => {
      const to = parseFloat(el.getAttribute("data-count-to"));
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      const format = (value) => Number.isInteger(to)
        ? Math.round(value).toLocaleString("en-IN")
        : value.toLocaleString("en-IN", { maximumFractionDigits: 1 });
      if (prefersReducedMotion) {
        el.textContent = prefix + format(to) + suffix;
        return;
      }
      const duration = 900;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(to * eased * 10) / 10;
        el.textContent = prefix + format(current) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => io.observe(el));
  }

  // ---------------------------------------------------------------------
  function buildSparkline(values, width, height, padding) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = (width - padding * 2) / (values.length - 1);
    return values.map((v, i) => {
      const x = padding + i * step;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return [x, y];
    });
  }

  function pointsToPath(points) {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(" ");
  }

  function initHeroChart() {
    const svg = document.querySelector("#hero-chart");
    if (!svg) return;
    const data = CONFIG.sampleDashboard.series.income;
    const width = 420, height = 220, padding = 24;
    const points = buildSparkline(data, width, height, padding);
    const path = svg.querySelector(".chart-line");
    const area = svg.querySelector(".chart-area");
    const dots = svg.querySelector(".chart-dots");

    const linePath = pointsToPath(points);
    const areaPath = `${linePath} L ${points[points.length - 1][0]} ${height - padding} L ${points[0][0]} ${height - padding} Z`;

    path.setAttribute("d", linePath);
    area.setAttribute("d", areaPath);

    const len = path.getTotalLength();
    if (!prefersReducedMotion) {
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)";
        path.style.strokeDashoffset = "0";
      });
      area.style.opacity = "0";
      area.style.transition = "opacity 1.2s ease 0.4s";
      requestAnimationFrame(() => setTimeout(() => (area.style.opacity = "1"), 50));
    }

    dots.innerHTML = "";
    points.forEach((p, i) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", p[0]);
      circle.setAttribute("cy", p[1]);
      circle.setAttribute("r", "3.5");
      circle.setAttribute("class", "chart-dot");
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "img");
      const year = CONFIG.sampleDashboard.years[i];
      const income = data[i];
      circle.setAttribute("aria-label", `${year}: income ${income} lakh`);
      dots.appendChild(circle);
    });

    const tooltip = document.querySelector("#hero-chart-tooltip");
    dots.querySelectorAll("circle").forEach((circle, i) => {
      const show = () => {
        const year = CONFIG.sampleDashboard.years[i];
        const income = CONFIG.sampleDashboard.series.income[i];
        const tax = CONFIG.sampleDashboard.series.tax[i];
        const rate = ((tax / income) * 100).toFixed(1);
        tooltip.innerHTML = `
          <strong>${year}</strong>
          <span>Income \u20B9${income}L \u00b7 Tax \u20B9${tax}L</span>
          <span>Effective rate ${rate}%</span>
        `;
        tooltip.style.left = circle.getAttribute("cx") + "px";
        tooltip.style.top = circle.getAttribute("cy") + "px";
        tooltip.classList.add("is-visible");
      };
      const hide = () => tooltip.classList.remove("is-visible");
      circle.addEventListener("mouseenter", show);
      circle.addEventListener("focus", show);
      circle.addEventListener("mouseleave", hide);
      circle.addEventListener("blur", hide);
    });
  }

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  function initFAQ() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach((item) => {
      const btn = item.querySelector(".faq-question");
      const panel = item.querySelector(".faq-answer");
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("faq-item--open");
        items.forEach((other) => {
          other.classList.remove("faq-item--open");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-answer").style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("faq-item--open");
          btn.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }

  // ---------------------------------------------------------------------
  function initTestimonials() {
    const track = document.querySelector(".testimonials-track");
    if (!track || prefersReducedMotion) return;

    const cards = track.querySelectorAll(".testimonial-card");
    if (cards.length < 2) return;

    const advance = () => {
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      track.scrollTo({
        left: atEnd ? 0 : track.scrollLeft + step,
        behavior: "smooth"
      });
    };

    window.setInterval(advance, 4000);
  }

  // ---------------------------------------------------------------------
  function initConsultationTriggers() {
    document.querySelectorAll("[data-open-consultation]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const need = btn.getAttribute("data-open-consultation") || null;
        ConsultationForm.openModal(need && need !== "true" ? { need } : null);
      });
    });
  }

  // ---------------------------------------------------------------------
  function initWhatsapp() {
    const btn = document.querySelector("#whatsapp-float");
    if (!btn) return;
    const text = encodeURIComponent(CONFIG.whatsappDefaultMessage);
    btn.href = `https://wa.me/${CONFIG.whatsapp}?text=${text}`;

    document.querySelectorAll("[data-whatsapp-link]").forEach((el) => {
      el.href = `https://wa.me/${CONFIG.whatsapp}?text=${text}`;
    });
  }

  // ---------------------------------------------------------------------
  function initBackToTop() {
    const btn = document.querySelector("#back-to-top");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("is-visible", window.scrollY > 800);
    }, { passive: true });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  // ---------------------------------------------------------------------
  function initSectionIndicator() {
    const indicator = document.querySelector(".section-indicator");
    if (!indicator) return;
    const items = indicator.querySelectorAll("li");
    const sections = Array.from(items).map((li) =>
      document.querySelector(li.getAttribute("data-target"))
    ).filter(Boolean);

    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target);
            items.forEach((li, i) => li.classList.toggle("is-active", i === idx));
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach((s) => io.observe(s));

    items.forEach((li) => {
      li.addEventListener("click", () => {
        document.querySelector(li.getAttribute("data-target"))?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });
      });
    });
  }

  // ---------------------------------------------------------------------
  function initCursorGlow() {
    if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const glow = document.querySelector(".cursor-glow");
    if (!glow) return;
    window.addEventListener("mousemove", (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  }
})();
