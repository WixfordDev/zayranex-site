/* Zayranex — front-end behaviour (vanilla JS, no build step) */
(function () {
  "use strict";

  const { products, categoryNames, coupons, trending } = window.CATALOG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  let page = document.body.dataset.page;
  const byId = (id) => products.find((p) => p.id === id);
  let ROUTE = new URL(location.href);
  let params = new URLSearchParams(location.search);
  // per-route lifecycle: listeners + timers from a page are dropped when we navigate
  let AC = new AbortController();
  const onDoc = (type, fn, opts = {}) => document.addEventListener(type, fn, { ...opts, signal: AC.signal });
  const timers = [];
  const setInterval = (fn, ms) => { const id = window.setInterval(fn, ms); timers.push(id); return id; };
  const safeHistory = (method, url) => { try { history[method](null, "", url); return true; } catch { return false; } };

  /* ------------------------------------------------------------ utilities */
  const money = (n) => Number(n).toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const priceHTML = (n) => `<span class="price-now"><span class="cur" aria-hidden="true">SAR</span><span class="sr-only">SAR </span>${money(n)}</span>`;
  const off = (p) => (p.was > p.price ? Math.round((1 - p.price / p.was) * 100) : 0);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const psrc = (p, i = 0) => (p.photos && p.photos[i]) || `img/products/${p.id}.svg`;
  const pimg = (p, cls = "pimg", i = 0) => `<img class="${cls}${p.photos && p.photos[i] ? " is-photo" : ""}" src="${psrc(p, i)}" alt="" loading="lazy" decoding="async" width="500" height="500" data-fallback="img/products/${p.id}.svg">`;
  // broken photo -> generated image (no inline handlers, CSP-safe)
  document.addEventListener("error", (e) => { const im = e.target; if (im.tagName === "IMG" && im.dataset.fallback && im.src.indexOf(im.dataset.fallback) < 0) { im.src = im.dataset.fallback; im.classList.remove("is-photo"); } }, true);
  const icon = (n, cls = "icon") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const addDays = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x; };
  const fmtDate = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const etaFor = (p) => (p.arrive === "today" ? "Today" : p.arrive === "tomorrow" ? "Tomorrow, " + fmtDate(addDays(1)) : fmtDate(addDays(2)));

  // storage wrapper — falls back to memory when storage is blocked
  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem("bc_" + k); return v ? JSON.parse(v) : d; } catch { return k in mem ? mem[k] : d; } },
    set(k, v) { try { localStorage.setItem("bc_" + k, JSON.stringify(v)); } catch { mem[k] = v; } },
  };

  function toast(msg, action) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span>${msg}</span>`;
    if (action) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = action.label;
      b.onclick = () => { action.run(); el.remove(); };
      el.appendChild(b);
    }
    $("#toasts").appendChild(el);
    setTimeout(() => el.remove(), action ? 6000 : 3500);
  }

  /* ------------------------------------------------------------ cart + wishlist state */
  const Cart = {
    items() { return store.get("cart", []); },
    save(items) { store.set("cart", items); Cart.badge(); },
    count() { return Cart.items().reduce((s, i) => s + i.qty, 0); },
    add(id, qty = 1, variant = {}) {
      const items = Cart.items();
      const key = id + JSON.stringify(variant);
      const found = items.find((i) => i.key === key);
      const p = byId(id);
      if (found) found.qty = Math.min(found.qty + qty, p.stock, 10);
      else items.push({ key, id, qty: Math.min(qty, p.stock, 10), variant });
      Cart.save(items);
    },
    badge() {
      const n = Cart.count();
      $$("[data-cart-count]").forEach((b) => { b.textContent = n > 99 ? "99+" : n; b.hidden = n === 0; });
    },
  };
  const Wish = {
    list() { return store.get("wish", []); },
    has(id) { return Wish.list().includes(id); },
    toggle(id) {
      const l = Wish.list(); const i = l.indexOf(id);
      i > -1 ? l.splice(i, 1) : l.push(id);
      store.set("wish", l);
      return i === -1;
    },
  };

  /* ------------------------------------------------------------ product card */
  function card(p, opts = {}) {
    const pct = off(p);
    const badge = p.sponsored ? '<span class="badge badge-sponsored">Sponsored</span>'
      : p.badge === "bestseller" ? '<span class="badge badge-bestseller">Best seller</span>'
      : p.badge === "pick" ? '<span class="badge badge-pick">Our pick</span>' : "";
    // one signal line only (teardown R13: cap the persuasion cues)
    const signal = p.stock <= 5 ? `<p class="signal is-urgent">Only ${p.stock} left in stock</p>`
      : p.drop === 365 ? '<p class="signal">Lowest price in a year</p>'
      : p.unit ? `<p class="signal">${p.unit}</p>` : p.rank ? `<p class="signal">${p.rank}</p>` : "";
    const fast = p.arrive === "today";
    return `<li class="card${opts.slot ? " is-sponsored-slot" : ""}">
      <div class="card-media ${p.tone}${p.photos && p.photos[1] ? " has-alt" : ""}">
        ${pimg(p)}${p.photos && p.photos[1] ? pimg(p, "pimg pimg-alt", 1) : ""}
        <div class="card-top">${badge}</div>
        <button class="quick-view" type="button" data-quick-view="${p.id}" aria-label="Quick view ${esc(p.title)}">${icon("search", "icon-sm")}<span>Quick view</span></button>
      </div>
      <button class="wish-btn" type="button" data-wish="${p.id}" aria-pressed="${Wish.has(p.id)}" aria-label="Save ${esc(p.title)} to wishlist">${icon("heart", "icon-sm")}</button>
      <button class="quick-add" type="button" data-quick-add="${p.id}" aria-label="Add ${esc(p.title)} to cart">${icon("plus", "icon-sm")}</button>
      <a class="card-link" href="product.html?id=${p.id}">
        <h3 class="card-title">${esc(p.title)}</h3>
        <span class="rating">${icon("star", "star")}${p.rating}<span class="count">(${p.reviews >= 1000 ? (p.reviews / 1000).toFixed(1) + "K" : p.reviews})</span><span class="sr-only"> ratings</span></span>
        <div class="price">${priceHTML(p.price)}${pct ? `<span class="price-was"><span class="sr-only">Was </span>${money(p.was)}</span><span class="price-off">${pct}% off</span>` : ""}</div>
        ${signal}
        <p class="delivery-line">${p.fulfil === "express" ? '<span class="badge badge-express">express</span>' : ""}${fast ? `<span class="fast">${icon("bolt", "icon-sm")} Get it today</span>` : `<span>Get it ${etaFor(p)}</span>`}</p>
      </a>
    </li>`;
  }

  // delegated card actions
  document.addEventListener("click", (e) => {
    const w = e.target.closest("[data-wish]");
    if (w) {
      e.preventDefault();
      const added = Wish.toggle(w.dataset.wish);
      w.setAttribute("aria-pressed", added);
      toast(added ? "Saved to wishlist" : "Removed from wishlist");
      return;
    }
    const qv = e.target.closest("[data-quick-view]");
    if (qv) { e.preventDefault(); openQuickView(byId(qv.dataset.quickView)); return; }
    const q = e.target.closest("[data-quick-add]");
    if (q) {
      e.preventDefault();
      const p = byId(q.dataset.quickAdd);
      if (p.sizes || p.colors) { go("product.html?id=" + p.id); return; } // needs a variant choice
      Cart.add(p.id, 1);
      toast(`Added to cart`, { label: "View cart", run: () => go("cart.html") });
    }
  });

  // range sliders: paint filled track
  const paintRange = (r) => r.style.setProperty("--fill", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
  document.addEventListener("input", (e) => e.target.matches(".range") && paintRange(e.target));
  addEventListener("DOMContentLoaded", () => $$(".range").forEach(paintRange));
  setTimeout(() => $$(".range").forEach(paintRange), 0);


  /* ------------------------------------------------------------ quick view */
  function openQuickView(p) {
    const pct = off(p);
    const sel = { color: p.colors ? Math.max(0, p.colors.findIndex((c) => c[2])) : null, size: null, storage: p.storage ? 0 : null };
    const priceOf = () => (p.colors && p.colors[sel.color][2]) || p.price;
    const rc = p.reviews >= 1000 ? (p.reviews / 1000).toFixed(1) + "K" : p.reviews;
    const body = `<div class="qv">
      <div class="qv-hero ${p.tone}">${pimg(p)}${pct ? `<span class="qv-off">-${pct}%</span>` : ""}
        <button class="wish-btn qv-wish" type="button" data-wish="${p.id}" aria-pressed="${Wish.has(p.id)}" aria-label="Save to wishlist">${icon("heart", "icon-sm")}</button></div>
      <div class="qv-info">
        <a class="qv-brand" href="search.html?brand=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a>
        <h3 class="qv-title">${esc(p.title)}</h3>
        <a class="qv-rating" href="product.html?id=${p.id}#reviews">${icon("star", "star")}<strong>${p.rating}</strong><span>${rc} ratings</span></a>
        <div class="qv-price"><span class="qv-now" id="qv-now">${priceHTML(priceOf())}</span>${pct ? `<span class="price-was"><span class="sr-only">Was </span>SAR ${money(p.was)}</span><span class="qv-save">Save SAR ${money(p.was - p.price)}</span>` : ""}</div>
        <p class="qv-vat">Inclusive of VAT · or 4 × SAR <span id="qv-inst">${money(priceOf() / 4)}</span> with Tabby</p>
        ${p.colors ? `<div class="qv-opt"><p class="qv-label">Colour: <strong id="qv-cname">${esc(p.colors[sel.color][0])}</strong></p><div class="qv-swatches" role="radiogroup" aria-label="Colour">${p.colors.map((c, i) => `<button type="button" role="radio" class="qv-sw" data-qv-color="${i}" aria-checked="${i === sel.color}" aria-label="${esc(c[0])}${c[2] ? "" : " – out of stock"}" ${c[2] ? "" : "disabled"} style="--sw:${c[1]}"></button>`).join("")}</div></div>` : ""}
        ${p.storage ? `<div class="qv-opt"><p class="qv-label">Storage</p><div class="qv-chips" role="radiogroup" aria-label="Storage">${p.storage.map((x, i) => `<button type="button" role="radio" class="qv-chip" data-qv-storage="${i}" aria-checked="${i === 0}">${x}</button>`).join("")}</div></div>` : ""}
        ${p.sizes ? `<div class="qv-opt"><p class="qv-label">Size <span class="qv-req" id="qv-size-req">Select a size</span></p><div class="qv-chips" role="radiogroup" aria-label="Size">${p.sizes.map((x, i) => `<button type="button" role="radio" class="qv-chip" data-qv-size="${i}" aria-checked="false">${x}</button>`).join("")}</div></div>` : ""}
        <ul class="qv-facts">
          <li>${icon("truck", "icon-sm")}<span>Get it <strong>${etaFor(p)}</strong>${p.fulfil === "express" ? ' <span class="badge badge-express">express</span>' : ""}</span></li>
          <li>${icon("store", "icon-sm")}<span>Sold by <strong>${esc(p.seller)}</strong></span></li>
          <li>${icon("return", "icon-sm")}<span>Free returns within 15 days</span></li>
          ${p.stock <= 5 ? `<li class="is-urgent">${icon("clock", "icon-sm")}<span>Only ${p.stock} left in stock</span></li>` : ""}
        </ul>
        <a class="qv-more" href="product.html?id=${p.id}">View full details ${icon("chevron-right", "icon-sm")}</a>
      </div></div>`;
    const foot = `<div class="qv-foot"><div class="qty qv-qty" role="group" aria-label="Quantity"><button type="button" data-qv-q="-1" aria-label="Decrease quantity">${icon("minus", "icon-sm")}</button><output id="qv-q">1</output><button type="button" data-qv-q="1" aria-label="Increase quantity">${icon("plus", "icon-sm")}</button></div><button class="btn btn-primary" type="button" id="qv-add">Add to cart</button></div>`;
    openDrawer("Quick view", body, foot);
    const dr = $("#drawer"); dr.classList.add("is-qv");
    let qty = 1;
    const refresh = () => {
      $("#qv-now").innerHTML = priceHTML(priceOf()); $("#qv-inst").textContent = money(priceOf() / 4);
      $("#qv-add").textContent = `Add to cart · SAR ${money(priceOf() * qty)}`;
    };
    refresh();
    dr.onclick = (e) => {
      const c = e.target.closest("[data-qv-color]"), z = e.target.closest("[data-qv-size]"), st = e.target.closest("[data-qv-storage]"), q = e.target.closest("[data-qv-q]");
      if (c) { sel.color = +c.dataset.qvColor; $$("[data-qv-color]", dr).forEach((b) => b.setAttribute("aria-checked", b === c)); $("#qv-cname").textContent = p.colors[sel.color][0]; refresh(); }
      if (z) { sel.size = +z.dataset.qvSize; $$("[data-qv-size]", dr).forEach((b) => b.setAttribute("aria-checked", b === z)); $("#qv-size-req").classList.add("is-ok"); $("#qv-size-req").textContent = "✓"; }
      if (st) { sel.storage = +st.dataset.qvStorage; $$("[data-qv-storage]", dr).forEach((b) => b.setAttribute("aria-checked", b === st)); }
      if (q) { qty = Math.max(1, Math.min(10, p.stock, qty + +q.dataset.qvQ)); $("#qv-q").textContent = qty; refresh(); }
      if (e.target.closest("#qv-add")) {
        if (p.sizes && sel.size == null) { const r = $("#qv-size-req"); r.classList.remove("shake"); void r.offsetWidth; r.classList.add("shake"); $("[data-qv-size]", dr).focus(); return; }
        const variant = {};
        if (p.colors) variant.Colour = p.colors[sel.color][0];
        if (p.sizes) variant.Size = p.sizes[sel.size];
        if (p.storage) variant.Storage = p.storage[sel.storage];
        Cart.add(p.id, qty, variant);
        const btn = $("#qv-add"); btn.classList.add("is-added"); btn.innerHTML = `${icon("check", "icon-sm")} Added`;
        setTimeout(() => { closeDrawers(); toast("Added to cart", { label: "View cart", run: () => go("cart.html") }); }, 700);
      }
    };
  }

  /* ------------------------------------------------------------ rails */
  function fillRail(id, list) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = list.map((p) => card(p)).join("");
    updateRailButtons(id);
    railProgress(el);
  }
  // custom slide bar under each rail (replaces native scrollbar)
  function railProgress(el) {
    let bar = el.parentElement.querySelector(".rail-progress");
    if (!bar) {
      bar = document.createElement("div"); bar.className = "rail-progress"; bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = "<span></span>"; el.parentElement.appendChild(bar);
      const upd = () => {
        const max = el.scrollWidth - el.clientWidth, w = Math.max(12, (el.clientWidth / el.scrollWidth) * 100);
        const pos = max > 0 ? Math.abs(el.scrollLeft) / max : 0;
        bar.hidden = max <= 2;
        const t = bar.firstChild; t.style.width = w + "%";
        t.style.insetInlineStart = (pos * (100 - w)) + "%";
      };
      el.addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
      addEventListener("resize", upd, { signal: AC.signal });
      // drag / click the bar to scroll
      bar.addEventListener("pointerdown", (e) => {
        const r = bar.getBoundingClientRect(), rtl = document.documentElement.dir === "rtl";
        const go = (x) => { let f = (x - r.left) / r.width; if (rtl) f = 1 - f; el.scrollTo({ left: (rtl ? -1 : 1) * f * (el.scrollWidth - el.clientWidth), behavior: "auto" }); };
        go(e.clientX); bar.setPointerCapture(e.pointerId); bar.classList.add("is-drag");
        const mv = (ev) => go(ev.clientX), up = () => { bar.classList.remove("is-drag"); bar.removeEventListener("pointermove", mv); bar.removeEventListener("pointerup", up); };
        bar.addEventListener("pointermove", mv); bar.addEventListener("pointerup", up);
      });
      el._rp = upd;
    }
    requestAnimationFrame(el._rp);
  }
  function updateRailButtons(id) {
    const el = document.getElementById(id);
    const prev = $(`[data-rail-prev="${id}"]`), next = $(`[data-rail-next="${id}"]`);
    if (!el || !prev) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    const pos = Math.abs(el.scrollLeft);
    prev.disabled = pos <= 2;
    next.disabled = pos >= max;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rail-prev],[data-rail-next]");
    if (!b) return;
    const id = b.dataset.railPrev || b.dataset.railNext;
    const el = document.getElementById(id);
    const dir = b.dataset.railNext ? 1 : -1;
    const rtl = document.documentElement.dir === "rtl" ? -1 : 1;
    el.scrollBy({ left: dir * rtl * el.clientWidth * 0.9, behavior: "smooth" });
  });
  function initRailScroll() { $$("[data-rail]").forEach((el) => el.addEventListener("scroll", () => updateRailButtons(el.id), { passive: true })); }

  /* ------------------------------------------------------------ header */
  /* ------------------------------------------------------------ i18n (Arabic UI strings) */
  const AR = {
    "Deliver to": "التوصيل إلى", "Sign in": "تسجيل الدخول", "Wishlist": "المفضلة", "Cart": "السلة", "All categories": "كل الفئات",
    "Electronics": "الإلكترونيات", "Beauty & Fragrance": "الجمال والعطور", "Home & Kitchen": "المنزل والمطبخ", "Grocery": "البقالة",
    "Men's Fashion": "أزياء رجالية", "Women's Fashion": "أزياء نسائية", "Mom & Baby": "الأم والطفل", "Toys": "الألعاب",
    "Kids' Fashion": "أزياء الأطفال", "Sports & Outdoors": "الرياضة والهواء الطلق", "Health & Nutrition": "الصحة والتغذية",
    "Stationery": "القرطاسية", "Books": "الكتب", "Automotive": "السيارات", "Music & Media": "الموسيقى والوسائط",
    "Deals of the day": "عروض اليوم", "Recommended for you": "مقترحات لك", "Delivered today": "التوصيل اليوم", "Top brands": "أفضل العلامات",
    "Popular searches": "عمليات البحث الشائعة", "See all": "عرض الكل", "All": "الكل", "Fashion": "الأزياء", "Home": "الرئيسية",
    "Categories": "الفئات", "Deals": "العروض", "Account": "الحساب", "Orders": "الطلبات", "Returns": "المرتجعات", "Addresses": "العناوين",
    "Payments": "المدفوعات", "Your cart": "سلة التسوق", "Order summary": "ملخص الطلب", "Apply": "تطبيق", "Secure checkout": "دفع آمن",
    "Add to cart": "أضف إلى السلة", "Quick view": "عرض سريع", "Shop deals": "تسوق العروض", "Get it today": "احصل عليه اليوم",
    "Best seller": "الأكثر مبيعاً", "Sponsored": "إعلان", "Our pick": "اختيارنا", "Continue shopping": "متابعة التسوق",
    "We're always here to help": "نحن هنا دائماً للمساعدة", "Help": "المساعدة", "Company": "الشركة", "Beauty": "الجمال",
    "Sort by": "ترتيب حسب", "Filters": "الفلاتر", "Clear all": "مسح الكل", "Welcome back": "مرحباً بعودتك", "Create account": "إنشاء حساب",
  };
  const origText = new WeakMap();
  function translate(l, root = document.body) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (n.parentElement.closest("script,style,svg")) continue;
      if (!origText.has(n)) origText.set(n, n.nodeValue);
      const o = origText.get(n), key = o.trim();
      n.nodeValue = l === "ar" && AR[key] ? o.replace(key, AR[key]) : o;
    }
    const s = $("#q"); if (s) s.placeholder = l === "ar" ? "عما تبحث؟" : "What are you looking for?";
  }
  // re-translate content rendered later (rails, results)
  new MutationObserver((ms) => { if (store.get("lang", "en") !== "ar") return; ms.forEach((m) => m.addedNodes.forEach((el) => el.nodeType === 1 && translate("ar", el))); })
    .observe(document.body, { childList: true, subtree: true });

  /* ------------------------------------------------------------ campaign strip (noon "Yellow Friday" style) */
  function initCampaign() {
    if (["checkout", "success"].includes(page) || store.get("campaignClosed", "") === new Date().toDateString()) return;
    const end = new Date(); end.setHours(23, 59, 59, 0);
    const bar = document.createElement("div");
    bar.className = "campaign-bar"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Campaign");
    bar.innerHTML = `<div class="container"><a href="search.html?deal=1"><strong>Yellow Week</strong> · up to 70% off · ends in <span class="cb-time" aria-live="off"></span></a><button class="icon-btn" type="button" aria-label="Dismiss">${icon("x", "icon-sm")}</button></div>`;
    document.body.insertBefore(bar, document.body.firstChild.nextSibling);
    const t = $(".cb-time", bar);
    const tick = () => { const ms = Math.max(0, end - new Date()); t.textContent = [36e5, 6e4, 1e3].map((u, i) => String(Math.floor(ms / u) % (i ? 60 : 24)).padStart(2, "0")).join(":"); };
    tick(); setInterval(tick, 1000);
    $("button", bar).addEventListener("click", () => { bar.remove(); store.set("campaignClosed", new Date().toDateString()); });
  }

  function initHeader() {
    const hdr = $("#site-header");
    const btt = $("#back-to-top");
    if (hdr) {
      const onScroll = () => {
        const y = scrollY;
        hdr.classList.toggle("is-scrolled", y > 4);
        // R16: collapse to the search row on scroll (all pages)
        hdr.classList.toggle("is-compact", y > 160);
        btt && btt.classList.toggle("is-visible", y > 800);
      };
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    btt && btt.addEventListener("click", () => { scrollTo({ top: 0 }); $("#main").focus({ preventScroll: true }); });

    // account dropdown
    const accBtn = $("#account-btn"), dd = $("#account-dropdown");
    const user = store.get("user", null);
    if (user && $("#account-label")) {
      $("#account-label").textContent = "Hi, " + user.name.split(" ")[0];
      $("#auth-link").textContent = "Sign out";
      $("#auth-link").addEventListener("click", (e) => { e.preventDefault(); store.set("user", null); go(ROUTE.href, true); });
    }
    if (accBtn) {
      accBtn.addEventListener("click", () => {
        const open = dd.classList.toggle("hidden") === false;
        accBtn.setAttribute("aria-expanded", open);
        if (open) dd.querySelector("a").focus();
      });
      onDoc("click", (e) => {
        if (!e.target.closest(".account-menu")) { dd.classList.add("hidden"); accBtn.setAttribute("aria-expanded", "false"); }
      });
      dd.addEventListener("keydown", (e) => {
        const items = $$("a,button", dd); const i = items.indexOf(document.activeElement);
        if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        if (e.key === "Escape") { dd.classList.add("hidden"); accBtn.focus(); }
      });
    }

    // language: URL-free demo toggle (RTL mirroring)
    const lang = store.get("lang", "en");
    const applyLang = (l) => {
      document.documentElement.lang = l === "ar" ? "ar-SA" : "en-SA";
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
      const t = $("#lang-toggle");
      translate(l);
      if (t) { t.querySelector(".label").textContent = l === "ar" ? "English" : "العربية"; t.setAttribute("aria-label", l === "ar" ? "Switch to English" : "Switch to Arabic"); }
    };
    applyLang(lang);
    $("#lang-toggle") && $("#lang-toggle").addEventListener("click", () => {
      const next = store.get("lang", "en") === "ar" ? "en" : "ar";
      store.set("lang", next); applyLang(next);
    });

    // delivery location
    const city = store.get("city", "Riyadh");
    $("#deliver-label") && ($("#deliver-label").textContent = city);
    $("#city") && ($("#city").value = city);
    $("#save-location") && $("#save-location").addEventListener("click", () => {
      const c = $("#city").value;
      store.set("city", c);
      $("#deliver-label").textContent = c;
      $$("#pdp-city").forEach((x) => (x.textContent = c));
      closeModal();
      toast("Delivering to " + c);
    });

    initMegaMenu();
    initSearchBox();
    Cart.badge();
  }

  /* ------------------------------------------------------------ mega menu (hover-intent + keyboard) */
  function initMegaMenu() {
    let openTimer, closeTimer, current;
    const open = (li) => {
      if (current === li) return;
      close();
      const m = $("#mega-" + li.dataset.mega);
      if (!m) return;
      m.hidden = false; li.classList.add("is-open");
      li.querySelector("a").setAttribute("aria-expanded", "true");
      current = li;
    };
    const close = () => {
      if (!current) return;
      $("#mega-" + current.dataset.mega).hidden = true;
      current.classList.remove("is-open");
      current.querySelector("a").setAttribute("aria-expanded", "false");
      current = null;
    };
    $$(".dept-item").forEach((li) => {
      li.addEventListener("mouseenter", () => { clearTimeout(closeTimer); openTimer = setTimeout(() => open(li), 120); });
      li.addEventListener("mouseleave", () => { clearTimeout(openTimer); closeTimer = setTimeout(close, 200); });
      li.querySelector("a").addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); open(li); $("#mega-" + li.dataset.mega + " a").focus(); }
        if (e.key === "Escape") close();
      });
    });
    $$(".mega").forEach((m) => {
      m.addEventListener("mouseenter", () => clearTimeout(closeTimer));
      m.addEventListener("mouseleave", () => { closeTimer = setTimeout(close, 200); });
      m.addEventListener("keydown", (e) => { if (e.key === "Escape") { const li = current; close(); li && li.querySelector("a").focus(); } });
      m.addEventListener("focusout", (e) => { if (!m.contains(e.relatedTarget) && !(e.relatedTarget || {}).closest?.(".dept-item")) close(); });
    });
    // "All categories" (R12) + mobile categories tab
    $("#all-cats-btn") && $("#all-cats-btn").addEventListener("click", () => openDrawerEl($("#cat-drawer")));
    $$("[data-open-cats]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); openDrawerEl($("#cat-drawer")); }));
  }

  /* ------------------------------------------------------------ search combobox */
  function initSearchBox() {
    const input = $("#q"), panel = $("#search-panel"), list = $("#search-listbox"), clear = $("#search-clear");
    if (!input) return;
    let active = -1, options = [], reqId = 0;
    const recent = () => store.get("recent", []);
    if (params.get("q")) input.value = params.get("q");
    clear.classList.toggle("hidden", !input.value);

    // rotating placeholder, paused while focused
    const ideas = ["Search for “air fryer”", "Search for “sunscreen”", "Search for “iPhone 17”", "Search for “running shoes”"];
    let pi = 0;
    setInterval(() => { if (document.activeElement !== input && !input.value) input.placeholder = ideas[pi++ % ideas.length]; }, 3000);

    const show = (html) => { list.innerHTML = html; panel.classList.toggle("hidden", !html); input.setAttribute("aria-expanded", !!html); options = $$("[role=option]", list); active = -1; input.removeAttribute("aria-activedescendant"); };
    const hl = (text, q) => { const i = text.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? esc(text) : esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length)); };

    function render() {
      const q = input.value.trim();
      const my = ++reqId; // discard out-of-order results (R10)
      if (!q) {
        // R8: show recent + trending on empty focus
        const r = recent();
        let html = "";
        if (r.length) html += `<li role="presentation"><h2>Recent searches</h2></li>` + r.map((t, i) => `<li role="option" id="opt-r${i}" data-value="${esc(t)}" class="search-option">${icon("clock", "icon-sm")}${esc(t)}</li>`).join("");
        html += `<li role="presentation"><h2>Trending</h2></li>` + trending.map((t, i) => `<li role="option" id="opt-t${i}" data-value="${esc(t)}" class="search-option">${icon("search", "icon-sm")}${esc(t)}</li>`).join("");
        show(html);
        return;
      }
      const ql = q.toLowerCase();
      const hits = products.filter((p) => (p.title + " " + p.brand + " " + categoryNames[p.cat]).toLowerCase().includes(ql));
      if (my !== reqId) return;
      if (!hits.length) { show(`<li role="presentation" class="search-option muted">No suggestions for “${esc(q)}”. Press Enter to search anyway.</li>`); return; }
      // R9: scoped suggestion + product rows
      const cat = hits[0].cat;
      let html = `<li role="option" id="opt-s0" data-value="${esc(q)}" data-cat="${cat}" class="search-option">${icon("search", "icon-sm")}<span>${hl(q, q)} <span class="scope">in ${categoryNames[cat]}</span></span></li>`;
      const terms = [...new Set(hits.map((p) => p.title.split(",")[0].toLowerCase()))].slice(0, 5);
      html += terms.map((t, i) => `<li role="option" id="opt-k${i}" data-value="${esc(t)}" class="search-option">${icon("search", "icon-sm")}<span>${hl(t, q)}</span></li>`).join("");
      html += `<li role="presentation"><h2>Products</h2></li>` + hits.slice(0, 3).map((p, i) => `<li role="option" id="opt-p${i}" data-href="product.html?id=${p.id}" class="search-option"><span class="search-thumb ${p.tone}"></span><span style="flex:1;min-width:0">${hl(p.title, q)}<br><strong>SAR ${money(p.price)}</strong></span></li>`).join("");
      show(html);
    }

    function choose(opt) {
      if (opt.dataset.href) { go(opt.dataset.href); return; }
      const v = opt.dataset.value;
      saveRecent(v);
      go("search.html?q=" + encodeURIComponent(v) + (opt.dataset.cat ? "&c=" + opt.dataset.cat : ""));
    }
    function saveRecent(v) { const r = recent().filter((x) => x !== v); r.unshift(v); store.set("recent", r.slice(0, 5)); }

    let deb;
    input.addEventListener("focus", render);
    input.addEventListener("input", () => { clear.classList.toggle("hidden", !input.value); list.innerHTML = ""; clearTimeout(deb); deb = setTimeout(render, 120); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!options.length) return;
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        options.forEach((o, i) => o.setAttribute("aria-selected", i === active));
        input.setAttribute("aria-activedescendant", options[active].id);
        options[active].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && active > -1) { e.preventDefault(); choose(options[active]); }
      else if (e.key === "Escape") { show(""); }
    });
    list.addEventListener("mousedown", (e) => { const o = e.target.closest("[role=option]"); if (o) { e.preventDefault(); choose(o); } });
    onDoc("click", (e) => { if (!e.target.closest(".search")) show(""); });
    clear.addEventListener("click", () => { input.value = ""; clear.classList.add("hidden"); input.focus(); render(); });
    $("#search-form").addEventListener("submit", (e) => {
      const v = input.value.trim();
      if (!v) { e.preventDefault(); input.focus(); return; }
      saveRecent(v);
    });
  }

  /* ------------------------------------------------------------ modal + drawer */
  let lastFocus;
  const focusables = (el) => $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', el).filter((x) => x.offsetParent !== null);
  function trap(el, e) {
    if (e.key !== "Tab") return;
    const f = focusables(el); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openModal(id) {
    const m = document.getElementById(id); lastFocus = document.activeElement;
    m.hidden = false; document.body.style.overflow = "hidden";
    setTimeout(() => (focusables(m)[0] || m).focus(), 20);
    m.onkeydown = (e) => { if (e.key === "Escape") closeModal(); trap(m, e); };
  }
  function closeModal() {
    $$(".modal").forEach((m) => (m.hidden = true));
    document.body.style.overflow = "";
    lastFocus && lastFocus.focus();
  }
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open-modal]"); if (o) openModal(o.dataset.openModal);
    if (e.target.closest("[data-close-modal]")) closeModal();
    if (e.target.closest("[data-close-drawer]") || e.target.id === "overlay") closeDrawers();
  });
  // tabs (deliver modal + login)
  function initTabs() { $$('[role="tablist"]').forEach((tl) => {
    const tabs = $$('[role="tab"]', tl);
    const select = (t) => {
      tabs.forEach((x) => { const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
      t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") select(tabs[(i + 1) % tabs.length]);
        if (e.key === "ArrowLeft") select(tabs[(i - 1 + tabs.length) % tabs.length]);
      });
    });
  }); }

  function openDrawerEl(el) {
    lastFocus = document.activeElement;
    const ov = $("#overlay"); ov.classList.remove("hidden"); requestAnimationFrame(() => ov.classList.add("is-open"));
    el.removeAttribute("inert"); el.setAttribute("aria-hidden", "false"); el.classList.add("is-open");
    document.body.style.overflow = "hidden";
    setTimeout(() => (focusables(el)[0] || el).focus(), 50);
    el.onkeydown = (e) => { if (e.key === "Escape") closeDrawers(); trap(el, e); };
  }
  function openDrawer(title, bodyHTML, footHTML) {
    $("#drawer-title").textContent = title;
    $("#drawer-body").innerHTML = bodyHTML;
    const f = $("#drawer-foot"); f.innerHTML = footHTML || ""; f.classList.toggle("hidden", !footHTML);
    openDrawerEl($("#drawer"));
  }
  function closeDrawers() {
    const dq = $("#drawer"); if (dq) { dq.onclick = null; setTimeout(() => dq.classList.remove("is-qv"), 450); }
    $$(".drawer.is-open").forEach((d) => { d.classList.remove("is-open"); d.setAttribute("aria-hidden", "true"); d.setAttribute("inert", ""); });
    const ff = $("#facets"); ff && ff.classList.remove("is-open");
    const ov = $("#overlay"); ov.classList.remove("is-open"); setTimeout(() => ov.classList.add("hidden"), 200);
    document.body.style.overflow = "";
    lastFocus && lastFocus.focus();
  }

  /* ------------------------------------------------------------ countdowns */
  function initCountdowns() {
    $$("[data-countdown]").forEach((el) => {
      let s = +el.dataset.countdown;
      const tick = () => {
        const h = String(Math.floor(s / 3600)).padStart(2, "0"), m = String(Math.floor((s % 3600) / 60)).padStart(2, "0"), x = String(s % 60).padStart(2, "0");
        el.textContent = `${h}:${m}:${x}`; if (s > 0) s--;
      };
      tick(); setInterval(tick, 1000);
    });
  }

  /* ============================================================ PAGES */

  /* ---------- HOME ---------- */
  function initHome() {
    // hero carousel with pause (WCAG 2.2.2) — respects reduced motion
    const track = $("#hero-track"), dots = $$(".hero-dot"), pause = $("#hero-pause");
    let i = 0, playing = !matchMedia("(prefers-reduced-motion: reduce)").matches, timer;
    const go = (n) => {
      i = (n + dots.length) % dots.length;
      const rtl = document.documentElement.dir === "rtl" ? 1 : -1;
      track.style.transform = `translateX(${rtl * i * 100}%)`;
      dots.forEach((d, k) => { d.setAttribute("aria-current", k === i); d.classList.toggle("is-playing", k === i && playing); });
      dots.forEach((d) => { d.style.animation = "none"; void d.offsetWidth; d.style.animation = ""; });
      $$(".hero-slide", track).forEach((s, k) => { s.setAttribute("aria-hidden", k !== i); $$("a", s).forEach((a) => (a.tabIndex = k === i ? 0 : -1)); });
    };
    const play = () => { clearInterval(timer); if (playing) timer = setInterval(() => go(i + 1), 5000); };
    const setPause = () => { $("#hero").classList.toggle("is-paused", !playing); pause.innerHTML = icon(playing ? "pause" : "play", "icon-sm"); pause.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow"); };
    dots.forEach((d) => d.addEventListener("click", () => { go(+d.dataset.slide); play(); }));
    pause.addEventListener("click", () => { playing = !playing; setPause(); play(); });
    $("#hero").addEventListener("focusin", () => clearInterval(timer));
    $("#hero").addEventListener("focusout", play);
    go(0); setPause(); play();

    const deals = products.filter((p) => off(p) >= 30);
    fillRail("rail-deals", deals);
    $$("[data-deal-tab]").forEach((b) => b.addEventListener("click", () => {
      $$("[data-deal-tab]").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", x === b); });
      const g = b.dataset.dealTab;
      fillRail("rail-deals", g === "all" ? deals : deals.filter((p) => p.group === g));
    }));
    const viewed = store.get("viewed", []).map(byId).filter(Boolean);
    fillRail("rail-recent", viewed.length >= 4 ? viewed : products.filter((p) => p.rating >= 4.6).slice(0, 12));
    fillRail("rail-fast", products.filter((p) => p.arrive === "today"));
    const byRating = (a, b) => b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews);
    const has = (id) => document.getElementById(id);
    has("rail-elec") && fillRail("rail-elec", products.filter((p) => p.group === "electronics").sort(byRating));
    has("rail-fashion") && fillRail("rail-fashion", products.filter((p) => p.group === "fashion").sort(byRating));
    has("rail-home") && fillRail("rail-home", products.filter((p) => ["home", "baby", "toys", "stationery"].includes(p.cat)).sort(byRating));
    has("rail-beauty") && fillRail("rail-beauty", products.filter((p) => ["beauty", "health", "grocery"].includes(p.cat)).sort(byRating));
    has("rail-99") && fillRail("rail-99", products.filter((p) => p.price < 100).sort((a, b) => a.price - b.price));
    has("rail-new") && fillRail("rail-new", products.filter((p) => p.isNew).concat(products.slice(-6)).filter((p, i, a) => a.indexOf(p) === i));
    const bg = has("brand-grid");
    if (bg) {
      const brands = [["Apple", "#111111", "#4a4a4a"], ["Samsung", "#1428a0", "#3d5afe"], ["Sony", "#000000", "#333333"], ["Nike", "#ff6a00", "#d64000"], ["Adidas", "#222222", "#555555"], ["Philips", "#0b5ed7", "#3a8bff"], ["Xiaomi", "#ff6900", "#ff8a3d"], ["L'Oréal", "#8a6d3b", "#c9a55c"], ["Lenovo", "#e2231a", "#ff5a4f"], ["Puma", "#1f1f1f", "#4b4b4b"]];
      const sponsored = ["Samsung", "Adidas"];
      bg.innerHTML = brands.map(([b, c1, c2], k) => {
        const items = products.filter((x) => x.brand === b);
        const top = Math.max(0, ...items.map(off));
        const pics = items.slice(0, 3).map((x) => pimg(x, "pimg bt-img")).join("");
        return `<li style="--d:${k * 40}ms"><a class="brand-tile" href="search.html?brand=${encodeURIComponent(b)}">
          ${sponsored.includes(b) ? '<span class="badge badge-sponsored bt-ad">Ad</span>' : ""}
          <span class="bt-mark" style="--c1:${c1};--c2:${c2}">${esc(b[0])}</span>
          <span class="bt-name">${esc(b)}</span>
          <span class="bt-meta">${items.length} product${items.length === 1 ? "" : "s"}${top ? ` · <b>Up to ${top}% off</b>` : ""}</span>
          <span class="bt-pics">${pics}</span>
          <span class="bt-go">Shop ${icon("chevron-right", "icon-sm")}</span></a></li>`;
      }).join("");
    }
    const pg = has("pop-grid");
    if (pg) {
      const terms = [["iPhone", "p-phone", "+38%"], ["Air fryer", "p-pan", "+21%"], ["Perfume", "p-perfume", "+17%"], ["Smartwatch", "p-watch", "+12%"], ["Sneakers", "p-shoe"], ["Headphones", "p-headphones"], ["Sunscreen", "p-bottle"], ["Laptop", "p-laptop"], ["Abaya", "p-shirt"], ["Coffee machine", "p-pan"], ["LEGO", "p-toy"], ["Protein powder", "p-bottle"]];
      pg.innerHTML = terms.map(([t, g, up], i) => `<li style="--d:${i * 30}ms"><a class="pop-item${i < 3 ? " is-hot" : ""}" href="search.html?q=${encodeURIComponent(t.toLowerCase())}">
        <span class="pop-rank">${i + 1}</span><span class="pop-ic">${icon(g, "icon-sm")}</span><span class="pop-t">${esc(t)}</span>${up ? `<span class="pop-up">${icon("arrow-up", "icon-sm")}${up}</span>` : ""}${icon("search", "icon-sm pop-s")}</a></li>`).join("");
    }
    const mg = has("mega-grid");
    if (mg) {
      const tiles = [["electronics", "Phones & audio", "Up to 45% off", ["p1", "p3", "p38"]], ["fashion", "Fashion steals", "From SAR 69", ["p12", "p11", "p34"]], ["home", "Home upgrade", "Up to 55% off", ["p18", "p21", "p19"]], ["beauty", "Beauty edit", "From SAR 49", ["p16", "p40", "p17"]]];
      mg.innerHTML = tiles.map(([g, t, s, ids], k) => `<a class="mega-tile mt-${k}" href="search.html?${g === "fashion" ? "c=men" : "c=" + g}&amp;deal=1"><div class="mt-copy"><h3>${t}</h3><p>${s}</p><span class="mt-cta">Shop now ${icon("chevron-right", "icon-sm")}</span></div><div class="mt-imgs">${ids.map(byId).filter(Boolean).map((p) => pimg(p)).join("")}</div></a>`).join("");
    }
  }

  /* ---------- SEARCH / PLP ---------- */
  function initSearch() {
    const PER_PAGE = 20;
    const S = {
      q: params.get("q") || "", c: params.get("c") || "", sort: params.get("sort") || "relevance",
      fulfil: params.getAll("fulfil"), arrive: params.getAll("arrive"), brand: params.getAll("brand"),
      drop: params.getAll("drop"), deal: params.getAll("deal"),
      pmin: params.get("pmin") || "", pmax: params.get("pmax") || "", rating: +params.get("rating") || 0,
      page: +params.get("page") || 1,
    };
    if (params.get("fast")) S.arrive = ["today"];
    if (params.get("pricedrop")) S.drop = [params.get("pricedrop")];
    const multi = ["fulfil", "arrive", "brand", "drop", "deal"];
    const labels = { fulfil: { express: "express", brand: "Direct from brand", global: "Global" }, arrive: { today: "Arrives today", tomorrow: "Arrives tomorrow", "2days": "Within 2 days" }, drop: { 365: "Lowest in a year", 30: "Lowest in 30 days", 7: "Lowest in 7 days" }, deal: { 1: "On sale", bundle: "Bundles" } };

    // simple typo correction for honest "Showing results for" (R4)
    const vocab = [...new Set(products.flatMap((p) => (p.title + " " + p.brand).toLowerCase().split(/[^a-z0-9]+/)).filter((w) => w.length > 3))];
    const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
    const correct = (q) => q.toLowerCase().split(/\s+/).map((w) => { if (vocab.includes(w) || w.length < 4) return w; let best = w, bd = 3; vocab.forEach((v) => { const d = lev(w, v); if (d < bd) { bd = d; best = v; } }); return best; }).join(" ");
    const SYN = { "p-phone": "phone mobile smartphone cell", "p-headphones": "headphone earphone earbud audio", "p-laptop": "laptop computer notebook", "p-watch": "watch smartwatch wearable", "p-tv": "tv television screen", "p-camera": "camera", "p-shirt": "shirt tshirt polo clothing dress", "p-shoe": "shoe sneaker trainer footwear", "p-bottle": "skincare serum bottle", "p-perfume": "perfume fragrance scent", "p-pan": "kitchen cookware pan appliance", "p-sofa": "sofa furniture couch", "p-milk": "grocery food", "p-toy": "toy kid", "p-baby": "baby", "p-book": "book stationery", "p-ball": "sport ball", "p-car": "car automotive" };
    const STOP = new Set(["and", "for", "the", "with", "of", "aed", "sar", "under"]);
    const stem = (w) => w.replace(/(ies)$/, "y").replace(/(es|s)$/, "");
    const matches = (p, q) => {
      const words = (p.title + " " + p.brand + " " + categoryNames[p.cat] + " " + (SYN[p.glyph] || "")).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(stem);
      const qs = q.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);
      return !qs.length || qs.every((w) => words.some((x) => x.startsWith(w) || w.startsWith(x) && x.length > 3));
    };

    // brand facet
    const brandsAll = [...new Set(products.map((p) => p.brand))].sort();
    const renderBrands = (f = "") => {
      $("#brand-list").innerHTML = brandsAll.filter((b) => b.toLowerCase().includes(f.toLowerCase())).map((b) => `<label class="check"><input type="checkbox" name="brand" value="${esc(b)}" ${S.brand.includes(b) ? "checked" : ""}><span>${esc(b)}</span><small data-count="brand:${esc(b)}"></small></label>`).join("") || '<p class="muted">No brands found</p>';
    };
    renderBrands();
    $("#brand-search").addEventListener("input", (e) => renderBrands(e.target.value));

    // reflect state into controls
    const syncControls = () => {
      $$(".facets input[type=checkbox]").forEach((cb) => (cb.checked = (S[cb.name] || []).includes(cb.value)));
      $("#pmin").value = S.pmin; $("#pmax").value = S.pmax;
      $("#rating").value = S.rating; $("#rating-label").textContent = S.rating ? `${S.rating}★ or more` : "Any rating";
      $("#sort").value = S.sort;
      $$("[data-quick]").forEach((b) => {
        const [k, v] = b.dataset.quick.split(":");
        const on = k === "rating" ? S.rating >= +v : (S[k] || []).includes(v);
        b.setAttribute("aria-pressed", on); b.classList.toggle("is-active", on);
      });
    };

    function writeURL() {
      const u = new URLSearchParams();
      if (S.q) u.set("q", S.q); if (S.c) u.set("c", S.c);
      multi.forEach((k) => S[k].forEach((v) => u.append(k, v)));
      if (S.pmin) u.set("pmin", S.pmin); if (S.pmax) u.set("pmax", S.pmax);
      if (S.rating) u.set("rating", S.rating); if (S.sort !== "relevance") u.set("sort", S.sort);
      if (S.page > 1) u.set("page", S.page);
      const nu = "search.html" + (u.toString() ? "?" + u : ""); ROUTE = new URL(nu, ROUTE); safeHistory("replaceState", nu);
    }

    function apply() {
      let base = products.slice();
      let notice = "";
      if (S.c) base = base.filter((p) => p.cat === S.c || p.group === S.c);
      let q = S.q.trim().toLowerCase();
      if (q) {
        let hits = base.filter((p) => matches(p, q));
        if (!hits.length) {
          const fixed = correct(q);
          if (fixed !== q && base.some((p) => matches(p, fixed))) {
            hits = base.filter((p) => matches(p, fixed));
            notice = `<div class="notice info">${icon("info")}<span>Showing results for <strong>${esc(fixed)}</strong>. <a href="#" data-exact>Search instead for “${esc(S.q)}”</a></span></div>`;
          }
        }
        base = hits;
      }
      // filters
      let list = base.filter((p) =>
        (!S.fulfil.length || S.fulfil.includes(p.fulfil)) &&
        (!S.arrive.length || S.arrive.includes(p.arrive) || (S.arrive.includes("2days") && p.arrive !== "2days" ? true : false)) &&
        (!S.brand.length || S.brand.includes(p.brand)) &&
        (!S.drop.length || S.drop.some((d) => p.drop && p.drop >= +d)) &&
        (!S.deal.length || (S.deal.includes("1") && off(p) > 0) || (S.deal.includes("bundle") && p.group === "home")) &&
        (!S.pmin || p.price >= +S.pmin) && (!S.pmax || p.price <= +S.pmax) &&
        (!S.rating || p.rating >= S.rating)
      );
      if (params.get("deal") && !S.deal.length && !q) list = list.filter((p) => off(p) >= 30);

      // facet counts against the base set
      $$("[data-count]").forEach((el) => {
        const [k, v] = el.dataset.count.split(":");
        const n = base.filter((p) => (k === "drop" ? p.drop && p.drop >= +v : k === "deal" ? (v === "1" ? off(p) > 0 : p.group === "home") : String(p[k]) === v)).length;
        el.textContent = n;
      });

      // R1: sponsored items never override an explicit sort → shown in a labelled slot
      const sorters = {
        "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price,
        rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, new: (a, b) => b.isNew - a.isNew,
        relevance: (a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.reviews - a.reviews,
      };
      const organic = list.filter((p) => !p.sponsored).sort(sorters[S.sort]);
      const promoted = list.filter((p) => p.sponsored).slice(0, 2);

      // header + notices
      const scope = S.c ? categoryNames[S.c] || S.c : "";
      const total = organic.length + promoted.length;
      $("#results-h").innerHTML = S.q ? `${total} results for “${esc(S.q)}”${scope ? ` <span>in ${esc(scope)}</span>` : ""}` : `${esc(scope || (params.get("deal") ? "Today's deals" : "All products"))} <span>(${total} items)</span>`;
      document.title = (S.q ? `${S.q} — search` : scope || "All products") + " | Zayranex";
      $("#breadcrumb").innerHTML = `<li><a href="index.html">Home</a></li>${scope ? `<li><a href="search.html?c=${S.c}">${esc(scope)}</a></li>` : ""}${S.q ? `<li aria-current="page">“${esc(S.q)}”</li>` : ""}`;
      $("#search-notice").innerHTML = notice;

      $("#sponsored-slot").innerHTML = promoted.length && organic.length
        ? `<section class="sponsored-slot" aria-label="Sponsored products"><div class="sponsored-slot-head"><span class="badge badge-sponsored">Sponsored</span><span>Paid placement — not affected by sort</span></div><ul class="grid">${promoted.map((p) => card(p, { slot: true })).join("")}</ul></section>`
        : "";

      // R3: honest empty state
      if (!organic.length && !promoted.length) {
        $("#results").innerHTML = `<li style="grid-column:1/-1"><div class="empty-state">${icon("search")}<h2>No matches${S.q ? ` for “${esc(S.q)}”` : ""}</h2><p class="muted">Check the spelling, use fewer words, or remove some filters.</p><div class="pill-row" style="justify-content:center">${hasFilters() ? '<button class="btn btn-primary" type="button" data-clear-all>Clear all filters</button>' : ""}${trending.slice(0, 4).map((t) => `<a class="chip" href="search.html?q=${encodeURIComponent(t)}">${t}</a>`).join("")}</div></div></li>`;
        $("#pagination").innerHTML = "";
      } else {
        const pages = Math.max(1, Math.ceil(organic.length / PER_PAGE));
        S.page = Math.min(S.page, pages);
        $("#results").innerHTML = organic.slice((S.page - 1) * PER_PAGE, S.page * PER_PAGE).map((p) => card(p)).join("") || (promoted.length ? '<li class="muted" style="grid-column:1/-1">Only sponsored items match these filters.</li>' : "");
        if (!organic.length && promoted.length) $("#sponsored-slot").innerHTML = `<section class="sponsored-slot" aria-label="Sponsored products"><div class="sponsored-slot-head"><span class="badge badge-sponsored">Sponsored</span></div><ul class="grid">${promoted.map((p) => card(p, { slot: true })).join("")}</ul></section>`;
        $("#pagination").innerHTML = pages > 1 ? Array.from({ length: pages }, (_, k) => k + 1).map((n) => n === S.page ? `<span aria-current="page">${n}</span>` : `<a href="#" data-page="${n}">${n}</a>`).join("") : "";
      }
      renderApplied();
      syncControls();
      writeURL();
    }

    function hasFilters() { return multi.some((k) => S[k].length) || S.pmin || S.pmax || S.rating; }

    // R7: every applied filter as a chip + Clear all
    function renderApplied() {
      const chips = [];
      multi.forEach((k) => S[k].forEach((v) => chips.push([k, v, (labels[k] && labels[k][v]) || v])));
      if (S.pmin || S.pmax) chips.push(["price", "", `SAR ${S.pmin || 0} – ${S.pmax || "any"}`]);
      if (S.rating) chips.push(["rating", "", `${S.rating}★ & up`]);
      $("#applied").innerHTML = chips.length
        ? chips.map(([k, v, l]) => `<button class="chip chip-remove" type="button" data-remove="${k}:${esc(v)}" aria-label="Remove filter ${esc(l)}">${esc(l)} ${icon("x")}</button>`).join("") + '<button class="link-btn" type="button" data-clear-all>Clear all</button>'
        : "";
    }

    // events
    $("#facets").addEventListener("change", (e) => {
      const cb = e.target.closest("input[type=checkbox]"); if (!cb) return;
      const arr = S[cb.name]; const i = arr.indexOf(cb.value);
      cb.checked ? i < 0 && arr.push(cb.value) : i > -1 && arr.splice(i, 1);
      S.page = 1; apply();
    });
    $("#price-go").addEventListener("click", () => {
      let a = $("#pmin").value, b = $("#pmax").value;
      if (a && b && +a > +b) [a, b] = [b, a];
      S.pmin = a; S.pmax = b; S.page = 1; apply();
    });
    $("#rating").addEventListener("input", (e) => ($("#rating-label").textContent = +e.target.value ? `${e.target.value}★ or more` : "Any rating"));
    $("#rating").addEventListener("change", (e) => { S.rating = +e.target.value; S.page = 1; apply(); });
    $("#sort").addEventListener("change", (e) => { S.sort = e.target.value; S.page = 1; apply(); });
    $$("[data-quick]").forEach((b) => b.addEventListener("click", () => {
      const [k, v] = b.dataset.quick.split(":");
      if (k === "rating") S.rating = S.rating >= +v ? 0 : +v;
      else { const i = S[k].indexOf(v); i > -1 ? S[k].splice(i, 1) : S[k].push(v); }
      S.page = 1; apply();
    }));
    onDoc("click", (e) => {
      const r = e.target.closest("[data-remove]");
      if (r) {
        const [k, ...rest] = r.dataset.remove.split(":"); const v = rest.join(":");
        if (k === "price") { S.pmin = ""; S.pmax = ""; } else if (k === "rating") S.rating = 0; else S[k] = S[k].filter((x) => x !== v);
        apply(); $("#results-h").focus?.();
      }
      if (e.target.closest("[data-clear-all]")) { multi.forEach((k) => (S[k] = [])); S.pmin = S.pmax = ""; S.rating = 0; S.page = 1; apply(); }
      const pg = e.target.closest("#pagination [data-page]");
      if (pg) { e.preventDefault(); S.page = +pg.dataset.page; apply(); scrollTo({ top: 0 }); }
      if (e.target.closest("[data-exact]")) { e.preventDefault(); $("#search-notice").innerHTML = ""; $("#results").innerHTML = `<li style="grid-column:1/-1"><div class="empty-state">${icon("search")}<h2>No exact matches for “${esc(S.q)}”</h2><p class="muted">Try a different spelling or browse categories.</p></div></li>`; $("#sponsored-slot").innerHTML = ""; $("#pagination").innerHTML = ""; }
    });
    $$(".facet-toggle").forEach((t) => t.addEventListener("click", () => {
      const open = t.getAttribute("aria-expanded") === "true";
      t.setAttribute("aria-expanded", !open); document.getElementById(t.getAttribute("aria-controls")).hidden = open;
    }));
    // mobile filter sheet
    $("#filters-open").addEventListener("click", () => {
      lastFocus = document.activeElement;
      const ov = $("#overlay"); ov.classList.remove("hidden"); requestAnimationFrame(() => ov.classList.add("is-open"));
      $("#facets").classList.add("is-open"); $("#facets").focus?.();
    });
    $("#filters-close").addEventListener("click", closeDrawers);
    if (matchMedia("(min-width:1024px)").matches) $("#filters-close").classList.add("hidden");

    apply();
  }

  /* ---------- PRODUCT ---------- */
  function initProduct() {
    const p = byId(params.get("id")) || products[0];
    const v = store.get("viewed", []).filter((x) => x !== p.id); v.unshift(p.id); store.set("viewed", v.slice(0, 12));
    let qty = 1;
    const sel = { color: p.colors ? p.colors.findIndex((c) => c[2] > 0) : null, size: null, storage: p.storage ? 0 : null };
    const pct = off(p);
    document.title = p.title + " | Zayranex";

    $("#breadcrumb").innerHTML = `<li><a href="index.html">Home</a></li><li><a href="search.html?c=${p.cat}">${categoryNames[p.cat]}</a></li><li><a href="search.html?brand=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a></li><li aria-current="page">${esc(p.title.split(",")[0])}</li>`;
    $("#pdp-brand").textContent = p.brand; $("#pdp-brand").href = "search.html?brand=" + encodeURIComponent(p.brand);
    $("#pdp-title").textContent = p.title;
    $("#pdp-meta").innerHTML = `<a href="#reviews" class="rating">${icon("star", "star")} ${p.rating} <span class="count">(${p.reviews.toLocaleString()} ratings)</span></a><span>SKU: ${p.id.toUpperCase()}BC</span>${p.rank ? `<span class="badge badge-success">${p.rank}</span>` : ""}`;

    const renderPrice = () => {
      const unit = sel.color != null && p.colors ? p.colors[sel.color][2] : p.price;
      $("#pdp-price").innerHTML = `<div class="price">${priceHTML(unit)}${pct ? `<span class="price-was"><span class="sr-only">Was </span>SAR ${money(p.was)}</span><span class="price-off">${pct}% off</span>` : ""}</div><span class="vat">Inclusive of VAT</span>`;
      $("#bnpl-amount").textContent = "SAR " + money(unit / 4);
      $("#sticky-price").innerHTML = priceHTML(unit);
      return unit;
    };
    renderPrice();
    $("#pdp-pills").innerHTML = [p.fulfil === "express" ? '<span class="badge badge-express">express</span>' : "", p.badge === "bestseller" ? '<span class="badge badge-bestseller">Best seller</span>' : "", p.drop ? `<span class="badge badge-success">Lowest price in ${p.drop === 365 ? "a year" : p.drop + " days"}</span>` : "", p.stock <= 5 ? `<span class="badge badge-deal">Only ${p.stock} left</span>` : ""].join("");

    // R14: one collapsed "Ways to save"
    const offers = [["FIRST15", "15% off your first order (max SAR 75)"], ["SAVE10", "SAR 10 off orders over SAR 100"]];
    if (p.price >= 200) offers.push(["YELLOW20", "20% off orders over SAR 200 (max SAR 150)"]);
    if (p.price >= 500) offers.push(["", "5% cashback with partner bank credit cards — applied at payment"]);
    $("#wts-count").textContent = `(${offers.length})`;
    $("#offer-list").innerHTML = offers.map(([c, t]) => `<div class="offer"><span>${t}</span>${c ? `<button type="button" class="link-btn" data-copy="${c}" aria-label="Copy code ${c}"><code>${c}</code></button>` : ""}</div>`).join("");
    $("#offer-list").addEventListener("click", (e) => { const b = e.target.closest("[data-copy]"); if (!b) return; navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy).catch(() => {}); toast(`Code ${b.dataset.copy} copied — apply it in your cart`); });

    // variants (R15: size is NOT pre-selected; ATC echoes the choice)
    function renderVariants() {
      let html = "";
      if (p.colors) html += `<fieldset><legend>Colour: <span class="muted">${p.colors[sel.color][0]}</span></legend><div class="swatches" role="radiogroup" aria-label="Colour">${p.colors.map((c, i) => `<button type="button" class="swatch" role="radio" aria-checked="${i === sel.color}" ${c[2] ? "" : 'aria-disabled="true"'} data-color="${i}"><span class="dot" style="background:${c[1]}"></span>${esc(c[0])}<strong>${c[2] ? "SAR " + money(c[2]) : "Out of stock"}</strong></button>`).join("")}</div></fieldset>`;
      if (p.storage) html += `<fieldset><legend>Storage</legend><div class="sizes" role="radiogroup" aria-label="Storage">${p.storage.map((s, i) => `<button type="button" class="size" role="radio" aria-checked="${i === sel.storage}" data-storage="${i}">${s}</button>`).join("")}</div></fieldset>`;
      if (p.sizes) html += `<fieldset><legend>Size${sel.size == null ? ' <span class="muted">— please select</span>' : `: <span class="muted">${p.sizes[sel.size]}</span>`}</legend><div class="sizes" role="radiogroup" aria-label="Size">${p.sizes.map((s, i) => `<button type="button" class="size" role="radio" aria-checked="${i === sel.size}" ${i === 2 && p.stock < 3 ? 'aria-disabled="true" title="Out of stock"' : ""} data-size="${i}">${s}</button>`).join("")}</div><a href="#" class="link-btn" style="font-size:12px;margin-top:8px;display:inline-block">Size guide</a></fieldset>`;
      $("#variants").innerHTML = html;
      const label = p.sizes ? (sel.size == null ? "Select a size" : `Add size ${p.sizes[sel.size]} to cart`) : "Add to cart";
      $("#atc").textContent = label; $("#sticky-atc-btn").textContent = label;
      renderPrice();
    }
    $("#variants").addEventListener("click", (e) => {
      const b = e.target.closest("[data-color],[data-size],[data-storage]");
      if (!b || b.getAttribute("aria-disabled") === "true") return;
      if (b.dataset.color) sel.color = +b.dataset.color;
      if (b.dataset.size) { sel.size = +b.dataset.size; $("#variant-error").classList.add("hidden"); }
      if (b.dataset.storage) sel.storage = +b.dataset.storage;
      renderVariants();
      const again = $(`[data-${b.dataset.color ? "color" : b.dataset.size ? "size" : "storage"}="${b.dataset.color || b.dataset.size || b.dataset.storage}"]`);
      again && again.focus();
    });
    $("#variants").addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
      const group = e.target.closest("[role=radiogroup]"); if (!group) return;
      const opts = $$("[role=radio]:not([aria-disabled=true])", group); const i = opts.indexOf(e.target);
      const n = opts[(i + (e.key === "ArrowRight" ? 1 : -1) + opts.length) % opts.length]; n && n.click();
    });
    renderVariants();

    // qty
    const setQty = (n) => {
      qty = Math.max(1, Math.min(n, p.stock, 10)); $("#qty").textContent = qty;
      $('[data-qty="-1"]').disabled = qty <= 1; $('[data-qty="1"]').disabled = qty >= Math.min(p.stock, 10);
    };
    $$("[data-qty]").forEach((b) => b.addEventListener("click", () => setQty(qty + +b.dataset.qty)));
    setQty(1);

    function addToCart() {
      if (p.sizes && sel.size == null) {
        const err = $("#variant-error"); err.textContent = "Please select a size before adding to cart."; err.classList.remove("hidden");
        $("#variants").scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => $("[data-size]") && $("[data-size]").focus(), 300);
        return;
      }
      const variant = {};
      if (p.colors) variant.Colour = p.colors[sel.color][0];
      if (p.sizes) variant.Size = p.sizes[sel.size];
      if (p.storage) variant.Storage = p.storage[sel.storage];
      Cart.add(p.id, qty, variant);
      const vtxt = Object.entries(variant).map(([k, x]) => `${k}: ${x}`).join(" · ");
      openDrawer("Added to cart", `<div class="mini-line"><span class="mini ${p.tone}">${pimg(p)}</span><span class="t"><strong>${esc(p.title)}</strong><br>${vtxt ? `<span class="muted">${esc(vtxt)}</span><br>` : ""}Qty ${qty} · SAR ${money(renderPrice() * qty)}</span>${icon("check")}</div><p class="notice info" style="margin:0">${icon("truck")}<span>Get it <strong>${etaFor(p)}</strong></span></p><h3>Frequently bought together</h3><ul class="grid" style="grid-template-columns:repeat(2,1fr)">${products.filter((x) => x.group === p.group && x.id !== p.id).slice(0, 2).map((x) => card(x)).join("")}</ul>`,
        `<a class="btn btn-primary btn-block" href="cart.html">View cart (${Cart.count()})</a><button class="btn btn-secondary btn-block" type="button" data-close-drawer>Continue shopping</button>`);
    }
    $("#atc").addEventListener("click", addToCart);
    $("#sticky-atc-btn").addEventListener("click", addToCart);

    // gallery
    const real = p.photos && p.photos.length > 1;
    const imgs = real ? p.photos.map(() => p.tone) : [p.tone, "tone-8", "tone-2", "tone-6"];
    const main = $("#main-image");
    main.insertAdjacentHTML("afterbegin", pimg(p, "pimg", 0));
    const mainImg = $(".pimg", main);
    const showImg = (i) => {
      main.className = "main-image " + imgs[i]; main.classList.toggle("has-photo", !!(p.photos && p.photos[0]));
      if (real) { main.dataset.view = 0; mainImg.classList.remove("fade-in"); void mainImg.offsetWidth; mainImg.src = p.photos[i]; mainImg.classList.add("fade-in"); } else main.dataset.view = i;
      $$(".thumb").forEach((t, k) => t.setAttribute("aria-current", k === i));
    };
    $("#thumbs").innerHTML = imgs.map((t, i) => `<button type="button" class="thumb ${t}" data-view="${real ? 0 : i}" aria-label="View image ${i + 1} of ${imgs.length}" data-img="${i}">${real ? pimg(p, "pimg", i) : pimg(p)}</button>`).join("");
    $("#thumbs").addEventListener("click", (e) => { const t = e.target.closest("[data-img]"); t && showImg(+t.dataset.img); });
    showImg(0);
    const zoom = () => main.classList.toggle("is-zoomed");
    main.addEventListener("click", (e) => { if (!e.target.closest(".wish-btn")) zoom(); });
    main.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zoom(); } });
    const wb = $("#pdp-wish"); wb.dataset.wish = p.id; wb.setAttribute("aria-pressed", Wish.has(p.id));

    // rail: delivery + seller
    const city = store.get("city", "Riyadh"); $("#pdp-city").textContent = city;
    $("#pdp-eta").textContent = "Get it " + etaFor(p);
    const cutoff = new Date(); cutoff.setHours(p.arrive === "today" ? 14 : 23, 59, 0, 0); if (cutoff < new Date()) cutoff.setDate(cutoff.getDate() + 1);
    const tickCut = () => { const ms = cutoff - new Date(); const h = Math.floor(ms / 36e5), m = Math.floor((ms % 36e5) / 6e4); $("#cutoff").textContent = `${h}h ${String(m).padStart(2, "0")}m`; };
    tickCut(); setInterval(tickCut, 30000);
    $("#seller-name").textContent = p.seller;
    $("#seller-pos").textContent = "94% positive";
    $("#seller-rating").textContent = "4.6"; $("#seller-asshown").textContent = "92%"; $("#seller-since").textContent = "3+ yrs";
    const sellerOffers = [[p.seller, p.price, p.arrive, true], ["TechHub KSA", +(p.price * 1.03).toFixed(2), "2days"], ["Gadget Corner", +(p.price * 0.99).toFixed(2), "2days"], ["Zayranex", +(p.price * 1.05).toFixed(2), "today"]];
    $("#sellers-btn").textContent = `${sellerOffers.length} offers from SAR ${money(Math.min(...sellerOffers.map((o) => o[1])))}`;
    const retDays = p.cat === "grocery" ? 0 : ["home", "toys"].includes(p.cat) ? 7 : 15;   // R6: one source of truth per item
    $("#return-days").textContent = retDays ? `Free returns within ${retDays} days` : "Non-returnable (perishable)";
    $("#warranty").textContent = p.group === "electronics" ? "1-year warranty" : "Quality guaranteed";

    // drawers
    onDoc("click", (e) => {
      const d = e.target.closest("[data-drawer]"); if (!d) return;
      const unit = renderPrice();
      if (d.dataset.drawer === "bnpl") {
        openDrawer("Pay in instalments", `<p>Split your purchase of <strong>SAR ${money(unit)}</strong> into interest-free payments.</p><table class="compare-table"><thead><tr><th scope="col"></th><th scope="col">Provider A</th><th scope="col">Provider B</th></tr></thead><tbody><tr><th scope="row">Instalments</th><td>4 × SAR ${money(unit / 4)}</td><td>4 × SAR ${money(unit / 4)}</td></tr><tr><th scope="row">Interest</th><td>0%</td><td>0%</td></tr><tr><th scope="row">Fees</th><td>No fees</td><td>Late fees may apply</td></tr><tr><th scope="row">First payment</th><td>At checkout</td><td>At checkout</td></tr></tbody></table><p class="muted" style="font-size:12px">Shipping and taxes not included. Final amount shown at checkout. Subject to provider approval.</p>`);
      } else if (d.dataset.drawer === "returns") {
        openDrawer("Returns policy", retDays ? `<p><strong>Return within ${retDays} days of delivery</strong> for a full refund to your original payment method.</p><h3>Eligible</h3><ul style="list-style:disc;padding-inline-start:20px"><li>Unused, in original packaging with tags</li><li>Damaged or defective on arrival</li><li>Wrong item delivered</li></ul><h3>Not eligible</h3><ul style="list-style:disc;padding-inline-start:20px"><li>Personal care items once opened</li><li>Items with missing accessories</li></ul><h3>How it works</h3><ol style="list-style:decimal;padding-inline-start:20px"><li>Go to Account → Returns → Create a return</li><li>Choose pickup or drop-off</li><li>Refund issued after quality check (3–5 days)</li></ol>` : `<p>This item is perishable and can't be returned. If it arrives damaged, contact us within 24 hours for a refund.</p>`);
      } else if (d.dataset.drawer === "sellers") {
        openDrawer("Other sellers", Array(3).fill('<div class="skeleton" style="height:84px"></div>').join(""));
        setTimeout(() => {
          // R11: sorted by total price incl. delivery
          const rows = sellerOffers.map((o) => ({ s: o[0], price: o[1], arrive: o[2], sel: o[3], fee: o[2] === "today" ? 0 : 0 })).sort((a, b) => a.price + a.fee - (b.price + b.fee));
          $("#drawer-body").innerHTML = `<p class="muted">${rows.length} offers · sorted by lowest total price</p>` + rows.map((r) => `<div class="seller-offer${r.sel ? " is-selected" : ""}"><div><div class="price">${priceHTML(r.price)}</div><span>Sold by <strong>${esc(r.s)}</strong>${r.sel ? ' <span class="badge badge-success">Selected</span>' : ""}</span><br><span class="muted">Free delivery · ${r.arrive === "today" ? "Today" : fmtDate(addDays(r.arrive === "tomorrow" ? 1 : 2))}</span></div><button class="btn btn-secondary btn-sm" type="button" data-seller-add>Add to cart</button></div>`).join("");
          $$("[data-seller-add]").forEach((b) => b.addEventListener("click", () => { closeDrawers(); addToCart(); }));
        }, 600);
      }
    });

    // overview, specs, fbt, reviews
    $("#ai-summary").textContent = `Customers praise the ${p.group === "electronics" ? "performance, build quality and battery life" : p.group === "fashion" ? "fit, fabric quality and comfort" : "value for money and everyday reliability"}. Some mention ${p.group === "fashion" ? "sizing runs slightly small" : "packaging could be better"}.`;
    $("#highlights").innerHTML = ["Genuine product with official warranty", `Brand: ${p.brand}`, `Ships from ${p.fulfil === "global" ? "international warehouse" : "Riyadh warehouse"}`, "Secure, tamper-proof packaging"].map((x) => `<li>${esc(x)}</li>`).join("");
    const specs = { Brand: p.brand, Model: p.title.split(",")[0], Category: categoryNames[p.cat], Colour: p.colors ? p.colors.map((c) => c[0]).join(", ") : "As shown", "In the box": "Main unit, documentation", Warranty: p.group === "electronics" ? "1 year" : "N/A", SKU: p.id.toUpperCase() + "BC" };
    $("#spec-body").innerHTML = Object.entries(specs).map(([k, x]) => `<tr><th scope="row">${k}</th><td>${esc(x)}</td></tr>`).join("");
    const fbt = products.filter((x) => x.group === p.group && x.id !== p.id && !x.sizes && !x.colors).slice(0, 2);
    const fbtTotal = [p, ...fbt].reduce((s, x) => s + x.price, 0);
    $("#fbt-list").innerHTML = [p, ...fbt].map((x, i) => `${i ? '<span class="fbt-plus" aria-hidden="true">+</span>' : ""}<div class="fbt-item"><span class="mini ${x.tone}">${pimg(x)}</span><span style="max-width:180px;font-size:12px">${esc(x.title)}<br><strong>SAR ${money(x.price)}</strong></span></div>`).join("") + `<div style="margin-inline-start:auto"><p>Total: <strong>SAR ${money(fbtTotal)}</strong></p><button class="btn btn-primary" type="button" id="fbt-add" style="margin-top:8px">Add ${fbt.length + 1} items</button></div>`;
    $("#fbt-add").addEventListener("click", () => { if (p.sizes && sel.size == null) return addToCart(); fbt.forEach((x) => Cart.add(x.id)); addToCart(); });

    // R5: reviews scoped to this variant by default
    const reviews = [
      ["Ahmed K.", 5, "Exactly as described", "Arrived a day early, sealed box, works perfectly.", 0, 214],
      ["Sara M.", 4, "Great value", "Very happy overall. Packaging could be better but product is excellent.", 1, 96],
      ["Rahul P.", 5, "Highly recommend", "Second time buying this. Consistent quality.", 0, 61],
      ["Fatima A.", 2, "Not the version I expected", "Received the international version instead of the regional one.", 2, 33],
      ["John D.", 4, "Solid", "Does the job. Delivery was quick.", 0, 12],
    ];
    const vname = p.colors ? p.colors[sel.color][0] : "Standard";
    const renderReviews = (scope) => {
      const list = scope === "variant" ? reviews.filter((r) => r[4] === 0) : reviews;
      const n = scope === "variant" ? Math.round(p.reviews * 0.6) : p.reviews;
      const dist = [70, 15, 6, 3, 6];
      $("#review-summary").innerHTML = `<p class="big">${p.rating}</p><span class="rating">${"★".repeat(Math.round(p.rating))}</span><p class="muted">Based on ${n.toLocaleString()} ratings${scope === "all" ? " across all variants" : ` for ${esc(vname)}`}</p><div class="histo">${dist.map((d, i) => `<div class="histo-row"><span>${5 - i} ★</span><span class="histo-bar"><span style="width:${d}%"></span></span><span>${d}%</span></div>`).join("")}</div>`;
      $("#review-list").innerHTML = list.map((r) => `<article class="review"><div class="review-head"><span class="avatar">${r[0][0]}</span><div><strong>${r[0]}</strong><br><span class="verified">${icon("check", "icon-sm")} Verified purchase</span></div><span class="rating" style="margin-inline-start:auto">${icon("star", "star")} ${r[1]}</span></div><h3>${r[2]}</h3><p>${r[3]}</p><p class="muted" style="font-size:12px">Variant: ${r[4] === 0 ? esc(vname) : "Other variant"} · Helpful (${r[5]})</p></article>`).join("");
    };
    $$("[data-review-scope]").forEach((b) => b.addEventListener("click", () => { $$("[data-review-scope]").forEach((x) => x.setAttribute("aria-pressed", x === b)); renderReviews(b.dataset.reviewScope); }));
    renderReviews("variant");

    // sticky ATC + tab highlighting
    $("#sticky-mini").className = "mini " + p.tone; $("#sticky-mini").innerHTML = pimg(p);
    $("#sticky-title").textContent = p.title;
    const bar = $("#sticky-atc");
    new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      bar.classList.toggle("is-visible", show); bar.setAttribute("aria-hidden", !show); const sb = $("#sticky-atc-btn"); if (sb) sb.tabIndex = show ? 0 : -1;
    }).observe($("#buy-row"));
    const tabLinks = $$(".pdp-tabs a");
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) tabLinks.forEach((a) => a.classList.toggle("is-active", a.hash === "#" + en.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
    ["overview", "specs", "fbt", "reviews"].forEach((id) => io.observe(document.getElementById(id)));

    fillRail("rail-similar", products.filter((x) => x.group === p.group && x.id !== p.id));
  }

  /* ---------- CART ---------- */
  const FREE_SHIP = 100, SHIP_FEE = 10;
  function totals(items, code) {
    const sub = items.reduce((s, i) => s + unitPrice(i) * i.qty, 0);
    const was = items.reduce((s, i) => s + Math.max(byId(i.id).was, unitPrice(i)) * i.qty, 0);
    let disc = 0, msg = "";
    const c = code && coupons[code];
    if (c) {
      if (c.min && sub < c.min) msg = `Add SAR ${money(c.min - sub)} more to use ${code}`;
      else disc = c.type === "pct" ? Math.min(sub * c.value / 100, c.cap || Infinity) : c.value;
    }
    const ship = sub === 0 || sub >= FREE_SHIP ? 0 : SHIP_FEE;
    return { sub, save: was - sub, disc, ship, total: Math.max(0, sub - disc + ship), msg };
  }
  const VAT = 0.15; const vatOf = (gross) => gross - gross / (1 + VAT);
  function unitPrice(i) {
    const p = byId(i.id);
    if (p.colors && i.variant && i.variant.Colour) { const c = p.colors.find((x) => x[0] === i.variant.Colour); if (c && c[2]) return c[2]; }
    return p.price;
  }
  function summaryRows(t, code) {
    return `<div class="summary-row"><span>Subtotal (${Cart.count()} item${Cart.count() === 1 ? "" : "s"})</span><span>SAR ${money(t.sub)}</span></div>
      ${t.save > 0 ? `<div class="summary-row"><span>You save</span><span class="save">− SAR ${money(t.save)}</span></div>` : ""}
      ${t.disc ? `<div class="summary-row"><span>Coupon ${esc(code)}</span><span class="save">− SAR ${money(t.disc)}</span></div>` : ""}
      <div class="summary-row"><span>Shipping</span><span>${t.ship ? "SAR " + money(t.ship) : '<span class="save">Free</span>'}</span></div>
      <div class="summary-row total"><span>Total <small class="muted" style="font-weight:400;font-size:12px">incl. VAT</small></span><span>SAR ${money(t.total)}</span></div>
      <div class="summary-row vat-row"><span>Includes VAT (15%)</span><span>SAR ${money(vatOf(t.total))}</span></div>`;
  }
  function initCart() {
    const render = () => {
      const items = Cart.items();
      const empty = !items.length;
      $("#cart-empty").classList.toggle("hidden", !empty);
      $("#cart-full").classList.toggle("hidden", empty);
      $("#cart-heading-count").textContent = empty ? "" : `(${Cart.count()} item${Cart.count() === 1 ? "" : "s"})`;
      const code = store.get("coupon", "");
      const t = totals(items, code);
      $("#ship-banner").innerHTML = t.sub >= FREE_SHIP ? `${icon("truck")}<span>You've unlocked free shipping!</span>` : `${icon("truck")}<span style="flex:1">Add <strong>SAR ${money(FREE_SHIP - t.sub)}</strong> more for free shipping<div class="progress"><span style="width:${Math.min(100, (t.sub / FREE_SHIP) * 100)}%"></span></div></span>`;
      if (empty) return;
      $("#cart-items").innerHTML = items.map((i) => {
        const p = byId(i.id); const vt = Object.entries(i.variant || {}).map(([k, x]) => `${k}: ${x}`).join(" · ");
        const max = Math.min(p.stock, 10);
        return `<li class="line-item"><a class="line-media ${p.tone}" href="product.html?id=${p.id}" aria-hidden="true" tabindex="-1">${pimg(p)}</a>
          <div class="line-info"><span class="muted" style="font-size:12px">${esc(p.brand)}</span><h3><a href="product.html?id=${p.id}" style="color:inherit">${esc(p.title)}</a></h3>${vt ? `<span class="muted" style="font-size:12px">${esc(vt)}</span>` : ""}
            <span style="font-size:12px">Get it <strong>${etaFor(p)}</strong> · Sold by ${esc(p.seller)}</span>${p.stock <= 5 ? `<span class="signal is-urgent">Only ${p.stock} left</span>` : ""}
            <div class="line-actions"><button class="link-btn" type="button" data-remove-line="${esc(i.key)}">${icon("trash", "icon-sm")} Remove</button><button class="link-btn" type="button" data-save-later="${esc(i.key)}">${icon("heart", "icon-sm")} Move to wishlist</button></div></div>
          <div class="line-side"><div class="price" style="justify-content:flex-end">${priceHTML(unitPrice(i) * i.qty)}</div>
            <div class="qty" role="group" aria-label="Quantity for ${esc(p.title)}"><button type="button" data-line-qty="-1" data-key="${esc(i.key)}" aria-label="Decrease" ${i.qty <= 1 ? "disabled" : ""}>${icon("minus", "icon-sm")}</button><output aria-live="polite">${i.qty}</output><button type="button" data-line-qty="1" data-key="${esc(i.key)}" aria-label="Increase" ${i.qty >= max ? "disabled" : ""}>${icon("plus", "icon-sm")}</button></div></div></li>`;
      }).join("");
      $("#summary-rows").innerHTML = summaryRows(t, code);
      $("#coupon").value = code;
      const cm = $("#coupon-msg");
      if (code) { cm.textContent = t.msg || `✓ ${coupons[code].label}`; cm.style.color = t.msg ? "var(--danger)" : "var(--success)"; }
    };
    $("#cart-items").addEventListener("click", (e) => {
      const items = Cart.items();
      const q = e.target.closest("[data-line-qty]");
      if (q) { const it = items.find((x) => x.key === q.dataset.key); const max = Math.min(byId(it.id).stock, 10); it.qty = Math.max(1, Math.min(max, it.qty + +q.dataset.lineQty)); Cart.save(items); render(); return; }
      const r = e.target.closest("[data-remove-line],[data-save-later]");
      if (r) {
        const key = r.dataset.removeLine || r.dataset.saveLater; const idx = items.findIndex((x) => x.key === key); const [gone] = items.splice(idx, 1);
        Cart.save(items);
        if (r.dataset.saveLater && !Wish.has(gone.id)) Wish.toggle(gone.id);
        render();
        toast(r.dataset.saveLater ? "Moved to wishlist" : "Item removed", { label: "Undo", run: () => { const l = Cart.items(); l.splice(idx, 0, gone); Cart.save(l); render(); } });
      }
    });
    $("#coupon-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const c = $("#coupon").value.trim().toUpperCase(); const cm = $("#coupon-msg");
      if (!c) { store.set("coupon", ""); cm.textContent = ""; render(); return; }
      if (!coupons[c]) { cm.textContent = `“${c}” isn't a valid code. Check the spelling and try again.`; cm.style.color = "var(--danger)"; $("#coupon").setAttribute("aria-invalid", "true"); return; }
      $("#coupon").removeAttribute("aria-invalid"); store.set("coupon", c); render();
    });
    render();
    fillRail("rail-cart", products.filter((p) => p.badge === "bestseller"));
  }

  /* ---------- CHECKOUT ---------- */
  function initCheckout() {
    const items = Cart.items();
    if (!items.length) { go("cart.html", true); return; }
    const user = store.get("user", null);
    if (user) $("#fname").value = user.name;
    $("#co-city").value = store.get("city", "Riyadh");
    $$("[data-eta]").forEach((el) => (el.textContent = "Arrives " + fmtDate(addDays(+el.dataset.eta))));
    const code = store.get("coupon", "");
    $("#co-items").innerHTML = items.map((i) => { const p = byId(i.id); return `<div class="mini-line"><span class="mini ${p.tone}">${pimg(p)}</span><span class="t">${esc(p.title)}<br><span class="muted">Qty ${i.qty}</span></span><strong style="font-size:12px">SAR ${money(unitPrice(i) * i.qty)}</strong></div>`; }).join("");

    const digits = (v) => v.replace(/\D/g, "");
    const MADA = ["440647","440795","446404","457865","968208","588845","588846","588847","588848","588849","588850","604906","636120","968201","968202","968203","968204","968205","968206","968207","968209","968210","968211","410685","417633","446393","457997","474491","483010","483011","483012","489317","489318","489319","504300","508160","513213","515079","516138","520058","521076","524130","524514","524940","529415","529741","530060","531196","535825","535989","536023","537767","543085","543357","549760","554180","555610","558563","585265","588850","589005","589206","604906","605141","636120","968201"];
    const cardBrand = (n) => MADA.includes(n.slice(0, 6)) ? "mada" : /^4/.test(n) ? "VISA" : /^(5[1-5]|2[2-7])/.test(n) ? "Mastercard" : /^3[47]/.test(n) ? "Amex" : "";
    const luhn = (n) => { let s = 0; for (let i = 0; i < n.length; i++) { let d = +n[n.length - 1 - i]; if (i % 2) { d *= 2; if (d > 9) d -= 9; } s += d; } return s % 10 === 0; };
    // live formatting
    $("#cc").addEventListener("input", (e) => { const n = digits(e.target.value).slice(0, 19); e.target.value = n.replace(/(.{4})/g, "$1 ").trim(); const b = cardBrand(n); $("#cc-brand").innerHTML = b ? `<span class="pl pl-${b === "mada" ? "mada" : b === "VISA" ? "visa" : "mc"}">${b}</span>` : ""; });
    $("#exp").addEventListener("input", (e) => { const n = digits(e.target.value).slice(0, 4); e.target.value = n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n; });
    ["phone", "stcno"].forEach((id) => $("#" + id).addEventListener("input", (e) => { let n = digits(e.target.value); if (n.startsWith("966")) n = n.slice(3); if (n.startsWith("0")) n = n.slice(1); n = n.slice(0, 9); e.target.value = n.replace(/^(\d{2})(\d{0,3})(\d{0,4}).*/, (m, a, b, c) => [a, b, c].filter(Boolean).join(" ")); }));
    $("#shortcode").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8); });
    ["bno", "postal", "addno", "vatno", "cvv"].forEach((id) => $("#" + id).addEventListener("input", (e) => { e.target.value = digits(e.target.value); }));
    // clear a field's error as soon as the user edits it
    $("#checkout-form").addEventListener("input", (e) => { const f = e.target.closest(".field"); if (f && e.target.getAttribute("aria-invalid") === "true") { e.target.setAttribute("aria-invalid", "false"); const er = f.querySelector(".field-error"); er && er.remove(); } if (e.target.closest("#card-fields, #stc-fields")) $("#pay-error").classList.add("hidden"); });
    $("#biz").addEventListener("change", (e) => $("#biz-fields").classList.toggle("hidden", !e.target.checked));

    const render = () => {
      const t = totals(items, code);
      const shipEl = $("input[name=ship]:checked"); const payEl = $("input[name=pay]:checked");
      const shipFee = +shipEl.dataset.fee || 0; const codFee = payEl.value === "cod" ? 12 : 0;
      t.ship = Math.max(t.ship, shipFee); t.total = Math.max(0, t.sub - t.disc + t.ship + codFee);
      $("#co-rows").innerHTML = summaryRows(t, code).replace('<div class="summary-row total">', codFee ? `<div class="summary-row"><span>Cash on delivery fee</span><span>SAR 12.00</span></div><div class="summary-row total">` : '<div class="summary-row total">');
      $("#card-fields").classList.toggle("hidden", payEl.value !== "card");
      $("#stc-fields").classList.toggle("hidden", payEl.value !== "stcpay");
      $("#tabby-line").textContent = `4 interest-free payments of SAR ${money(t.total / 4)} · no fees when paid on time`;
      $("#tamara-line").textContent = `3 interest-free payments of SAR ${money(t.total / 3)} · Sharia-compliant`;
      const cod = $("input[value=cod]");
      const codBlocked = shipEl.value === "locker" || $("#gift").checked || t.total > 6500;
      cod.disabled = codBlocked;
      cod.closest(".choice").style.opacity = codBlocked ? .5 : 1;
      if (codBlocked && cod.checked) { $("input[value=card]").checked = true; return render(); }
      const pay = payEl.value;
      const btn = $("#place-order");
      btn.classList.toggle("btn-applepay", pay === "applepay");
      btn.textContent = pay === "applepay" ? `Pay with Apple Pay · SAR ${money(t.total)}` : pay === "tabby" || pay === "tamara" ? `Continue to ${pay[0].toUpperCase() + pay.slice(1)} · SAR ${money(t.total)}` : pay === "stcpay" ? `Pay with STC Pay · SAR ${money(t.total)}` : `Place order · SAR ${money(t.total)}`;
      return t;
    };
    $("#checkout-form").addEventListener("change", render);
    render();

    const setErr = (el, msg) => {
      el.setAttribute("aria-invalid", !!msg);
      const box = el.closest(".field"); let err = box.querySelector(".field-error");
      if (msg) { if (!err) { err = document.createElement("p"); err.className = "field-error"; err.id = el.id + "-err"; box.appendChild(err); el.setAttribute("aria-describedby", err.id); } err.textContent = msg; }
      else if (err) err.remove();
      return !msg;
    };
    $("#checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (id) => $("#" + id).value.trim();
      const checks = [
        ["fname", v("fname").length > 1 ? "" : "Enter your full name"],
        ["phone", /^5\d{8}$/.test(digits(v("phone"))) ? "" : "Enter a Saudi mobile number: 9 digits starting with 5"],
        ["shortcode", !v("shortcode") || /^[A-Z]{4}\d{4}$/.test(v("shortcode")) ? "" : "Short code is 4 letters + 4 numbers, e.g. RRRD2929"],
        ["bno", /^\d{4}$/.test(v("bno")) ? "" : "Building number is 4 digits"],
        ["street", v("street") ? "" : "Enter the street name"],
        ["district", v("district") ? "" : "Enter your district"],
        ["postal", /^\d{5}$/.test(v("postal")) ? "" : "Postal code is 5 digits"],
        ["addno", !v("addno") || /^\d{4}$/.test(v("addno")) ? "" : "Additional number is 4 digits"],
      ];
      if ($("#biz").checked) checks.push(["company", v("company") ? "" : "Enter the company name"], ["vatno", /^3\d{13}3$/.test(v("vatno")) ? "" : "VAT number: 15 digits, starts and ends with 3"]);
      let first = null;
      checks.forEach(([id, msg]) => { if (!setErr($("#" + id), msg) && !first) first = $("#" + id); });
      const pay = $("input[name=pay]:checked").value;
      let payErr = "";
      if (pay === "card") {
        const n = digits(v("cc")), [mm, yy] = v("exp").split("/").map(Number), now = new Date(), expOk = mm >= 1 && mm <= 12 && new Date(2000 + yy, mm) > now;
        if (!(n.length >= 12 && luhn(n))) payErr = "Check your card number."; else if (!expOk) payErr = "Card expiry is invalid or in the past."; else if (!/^\d{3,4}$/.test(v("cvv"))) payErr = "Enter the 3–4 digit CVV.";
        if (payErr && !first) first = $("#cc");
      }
      if (pay === "stcpay" && !/^5\d{8}$/.test(digits(v("stcno")))) { payErr = "Enter your STC Pay mobile number."; first = first || $("#stcno"); }
      $("#pay-error").textContent = payErr; $("#pay-error").classList.toggle("hidden", !payErr);
      if (first) { first.focus(); first.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
      const t = render();
      const address = { name: v("fname"), phone: "+966" + digits(v("phone")), shortcode: v("shortcode"), building: v("bno"), street: v("street"), district: v("district"), city: v("co-city"), postal: v("postal"), additional: v("addno") };
      const order = { no: "ZX" + Date.now().toString().slice(-9), date: new Date().toISOString(), items, total: t.total, vat: vatOf(t.total), status: 0, ship: $("input[name=ship]:checked").value, pay, address, vatNo: $("#biz").checked ? v("vatno") : "", company: $("#biz").checked ? v("company") : "" };
      const orders = store.get("orders", []); orders.unshift(order); store.set("orders", orders);
      store.set("lastOrder", order); store.set("coupon", ""); Cart.save([]);
      const btn = $("#place-order"); btn.disabled = true; btn.classList.add("is-loading"); btn.textContent = "Processing payment…";
      setTimeout(() => go("order-success.html"), 900);
    });
  }

  function initSuccess() {
    const o = store.get("lastOrder", null);
    $("#order-no").textContent = o ? o.no : "—";
    $("#order-eta").textContent = o ? "Estimated delivery: " + fmtDate(addDays(o.ship === "next" ? 1 : 2)) : "";
    const inv = $("#invoice-box");
    if (o && inv) {
      const a = o.address || {}, payName = { card: "mada / card", applepay: "Apple Pay", stcpay: "STC Pay", tabby: "Tabby (4 payments)", tamara: "Tamara (3 payments)", cod: "Cash on delivery" }[o.pay] || o.pay;
      inv.innerHTML = `<div class="inv-grid"><div><h3>Deliver to</h3><p>${esc(a.name || "")}<br>${esc(a.building || "")} ${esc(a.street || "")}, ${esc(a.district || "")}<br>${esc(a.city || "")} ${esc(a.postal || "")}${a.additional ? " · " + esc(a.additional) : ""}${a.shortcode ? `<br>National Address: <strong class="mono">${esc(a.shortcode)}</strong>` : ""}<br>${esc(a.phone || "")}</p></div>
        <div><h3>Payment</h3><p>${esc(payName)}</p><h3 style="margin-top:12px">Tax invoice</h3><p>Total incl. VAT: <strong>SAR ${money(o.total)}</strong><br>VAT 15%: SAR ${money(o.vat || o.total * 0.15 / 1.15)}${o.vatNo ? `<br>${esc(o.company)} · VAT ${esc(o.vatNo)}` : ""}</p><p class="muted" style="font-size:12px">${o.vatNo ? "Standard" : "Simplified"} tax invoice with ZATCA QR code sent to your email.</p></div></div>`;
    }
  }

  /* ---------- ACCOUNT ---------- */
  function initAccount() {
    const user = store.get("user", null);
    if (user) { $("#acc-name").textContent = user.name; $("#acc-avatar").textContent = user.name[0].toUpperCase(); }
    $("#signout").addEventListener("click", () => store.set("user", null));
    const demo = [{ no: "BC104882231", date: addDays(-6).toISOString(), items: [{ id: "p18", qty: 1, variant: {} }], total: 299, status: 4 }, { no: "BC104771090", date: addDays(-20).toISOString(), items: [{ id: "p11", qty: 2, variant: { Size: "M" } }], total: 238, status: -1 }];
    const steps = ["Processing", "Confirmed", "Packed", "Dispatched", "Out for delivery"];

    const views = {
      orders() {
        const orders = [...store.get("orders", []), ...demo];
        return `<h1>Orders</h1><div class="stat-cards" style="margin:16px 0"><div class="stat-card"><span class="muted">Orders</span><strong>${orders.length}</strong></div><div class="stat-card"><span class="muted">Wallet</span><strong>SAR 45.00</strong></div><div class="stat-card"><span class="muted">Wishlist</span><strong>${Wish.list().length}</strong></div></div>` + orders.map((o) => {
          const st = o.status === -1 ? '<span class="status status-cancelled">Cancelled</span>' : o.status >= 4 ? '<span class="status status-delivered">Delivered</span>' : '<span class="status status-transit">In progress</span>';
          return `<article class="order-card"><div class="order-head"><div><span class="muted">Order</span><strong>${o.no}</strong></div><div><span class="muted">Placed</span><strong>${fmtDate(new Date(o.date))}</strong></div><div><span class="muted">Total</span><strong>SAR ${money(o.total)}</strong></div><div>${st}</div></div>
          <div class="order-body">${o.status >= 0 ? `<ol class="track" aria-label="Order progress">${steps.map((s, i) => `<li class="${i <= o.status ? "is-done" : ""}"${i === o.status ? ' aria-current="step"' : ""}>${s}</li>`).join("")}</ol>` : ""}
            ${o.items.map((i) => { const p = byId(i.id); return `<div class="mini-line"><span class="mini ${p.tone}">${pimg(p)}</span><span class="t"><strong>${esc(p.title)}</strong><br><span class="muted">Qty ${i.qty}${Object.values(i.variant || {}).length ? " · " + Object.values(i.variant).join(" · ") : ""}</span></span>${o.status >= 0 && o.status < 2 ? `<button class="btn btn-secondary btn-sm" type="button" data-cancel="${o.no}">Cancel item</button>` : o.status >= 4 ? `<a class="btn btn-secondary btn-sm" href="#returns">Return</a>` : ""}</div>`; }).join("")}
          </div></article>`;
        }).join("");
      },
      returns() {
        return `<h1>Returns</h1><div class="panel" style="margin-top:16px"><h2 style="font-size:16px">Create a return</h2><form id="return-form" class="co-section" style="margin-top:12px" novalidate>
          <div class="field"><label for="r-item">Item</label><select class="select input" id="r-item"><option>Essential air fryer XL 6.2L (BC104882231)</option></select></div>
          <div class="field"><label for="r-reason">Reason</label><select class="select input" id="r-reason"><option>Damaged or defective</option><option>Wrong item delivered</option><option>No longer needed</option><option>Size or fit issue</option></select></div>
          <div class="field"><label for="r-desc">Describe the issue</label><textarea class="input" id="r-desc" required></textarea></div>
          <div class="field"><label for="r-photo">Photos (optional)</label><input class="input" id="r-photo" type="file" accept="image/*" multiple style="padding-top:10px"></div>
          <div class="choices"><label class="choice"><input type="radio" name="rm" checked><span><strong>Free pickup</strong><span class="muted">From your default address</span></span></label><label class="choice"><input type="radio" name="rm"><span><strong>Drop off at a locker</strong><span class="muted">Nearest: Riyadh Riyadh Park Mall</span></span></label></div>
          <div class="choices"><label class="choice"><input type="radio" name="rr" checked><span><strong>Refund to original payment method</strong><span class="muted">5–7 business days after quality check</span></span></label><label class="choice"><input type="radio" name="rr"><span><strong>Refund to wallet</strong><span class="muted">Instant after quality check</span></span></label></div>
          <button class="btn btn-primary" type="submit">Submit return</button></form></div>`;
      },
      wishlist() {
        const l = Wish.list().map(byId).filter(Boolean);
        return `<h1>Wishlist</h1>` + (l.length ? `<ul class="grid" style="margin-top:16px">${l.map((p) => card(p)).join("")}</ul>` : `<div class="empty-state" style="margin-top:16px">${icon("heart")}<h2>Your wishlist is empty</h2><a class="btn btn-primary" href="index.html">Discover products</a></div>`);
      },
      addresses() {
        return `<h1>Addresses</h1><div class="panel" style="margin-top:16px;display:grid;gap:12px"><div class="choice"><span>${icon("pin")}</span><span><strong>Home · Default</strong><span class="muted">King Fahd Rd, Apt 1204, Al Olaya, ${esc(store.get("city", "Riyadh"))}</span></span><button class="link-btn" type="button" style="margin-inline-start:auto">Edit</button></div><button class="btn btn-secondary" type="button" data-open-modal="deliver-modal">${icon("plus", "icon-sm")} Add new address</button></div>`;
      },
      payments() {
        return `<h1>Payments</h1><div class="panel" style="margin-top:16px;display:grid;gap:12px"><div class="choice"><span>${icon("card")}</span><span><strong>Visa ending 4242</strong><span class="muted">Expires 08/28</span></span><button class="link-btn" type="button" style="margin-inline-start:auto">Remove</button></div><p class="muted">Cards are saved securely by our payment provider. We never store your full card number.</p></div>`;
      },
      credits() {
        return `<h1>Wallet &amp; credits</h1><div class="stat-cards" style="margin-top:16px"><div class="stat-card"><span class="muted">Withdrawable</span><strong>SAR 30.00</strong><span class="muted" style="font-size:12px">From refunds</span></div><div class="stat-card"><span class="muted">Cashback</span><strong>SAR 15.00</strong><span class="muted" style="font-size:12px">Use on orders · expires in 60 days</span></div><div class="stat-card"><span class="muted">Total</span><strong>SAR 45.00</strong></div></div><div class="panel" style="margin-top:16px"><h2 style="font-size:16px">Withdraw to bank</h2><p class="muted">Min SAR 50 · Max SAR 3,000 · once every 15 days · up to 5 business days.</p><button class="btn btn-secondary" type="button" disabled style="margin-top:12px">Withdraw (balance below minimum)</button></div>`;
      },
      membership() {
        return `<h1>Zayranex+</h1><div class="panel" style="margin-top:16px;display:grid;gap:12px"><p class="eta" style="font-size:22px;font-weight:800;color:var(--text-strong)">SAR 25 / month <span class="muted" style="font-size:14px;font-weight:400">· cancel anytime</span></p><ul style="list-style:disc;padding-inline-start:20px;display:grid;gap:6px"><li>Free next-day delivery on orders over SAR 50</li><li>Free same-day delivery on orders over SAR 100</li><li>Member-only prices and early sale access</li></ul><button class="btn btn-primary" type="button" style="justify-self:start">Start 30-day free trial</button><p class="muted" style="font-size:12px">You'll be charged SAR 25 after the trial unless you cancel. Price shown includes VAT.</p></div>`;
      },
      profile() {
        return `<h1>Profile</h1><form class="panel form-grid" style="margin-top:16px" id="profile-form"><div class="field"><label for="pf-name">Full name</label><input class="input" id="pf-name" value="${esc(user ? user.name : "")}"></div><div class="field"><label for="pf-email">Email</label><input class="input" id="pf-email" type="email" value="${esc(user ? user.email || "" : "")}"></div><div class="field"><label for="pf-lang">Language</label><select class="select input" id="pf-lang"><option value="en">English</option><option value="ar">العربية</option></select></div><div class="field full"><button class="btn btn-primary" type="submit">Save changes</button></div></form>`;
      },
    };
    const show = () => {
      const k = (location.hash || "#orders").slice(1); const view = views[k] ? k : "orders";
      $("#account-view").innerHTML = views[view]();
      $$("[data-acc-tab]").forEach((a) => (a.getAttribute("href") === "#" + view ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
      const rf = $("#return-form");
      rf && rf.addEventListener("submit", (e) => { e.preventDefault(); if (!$("#r-desc").value.trim()) { $("#r-desc").setAttribute("aria-invalid", "true"); $("#r-desc").focus(); return; } toast("Return request submitted. We'll email pickup details."); rf.reset(); });
      const pf = $("#profile-form");
      pf && pf.addEventListener("submit", (e) => { e.preventDefault(); store.set("user", { name: $("#pf-name").value || "Guest", email: $("#pf-email").value }); toast("Profile saved"); });
    };
    $("#account-view").addEventListener("click", (e) => {
      const c = e.target.closest("[data-cancel]"); if (!c) return;
      if (!confirm("Cancel this item? This can't be undone.")) return;
      const orders = store.get("orders", []); const o = orders.find((x) => x.no === c.dataset.cancel);
      if (o) { o.status = -1; store.set("orders", orders); show(); toast("Item cancelled. Refund in 5–7 business days."); }
    });
    addEventListener("hashchange", show, { signal: AC.signal });
    show();
  }

  /* ---------- LOGIN ---------- */
  function initLogin() {
    const valid = (el, ok, errEl, msg) => { el.setAttribute("aria-invalid", !ok); if (!ok) { errEl.textContent = msg; errEl.classList.remove("hidden"); el.focus(); } return ok; };
    $("#signin").addEventListener("submit", (e) => {
      e.preventDefault(); const err = $("#si-error"); err.classList.add("hidden");
      if (!valid($("#si-email"), $("#si-email").value.trim().length > 3, err, "Enter your email or mobile number.")) return;
      if (!valid($("#si-pass"), $("#si-pass").value.length >= 6, err, "Enter your password (at least 6 characters).")) return;
      const id = $("#si-email").value.trim();
      store.set("user", { name: id.split("@")[0], email: id });
      go("account.html");
    });
    $("#signup").addEventListener("submit", (e) => {
      e.preventDefault(); const err = $("#su-error"); err.classList.add("hidden");
      if (!valid($("#su-name"), $("#su-name").value.trim().length > 1, err, "Enter your full name.")) return;
      if (!valid($("#su-email"), /^\S+@\S+\.\S+$/.test($("#su-email").value), err, "Enter a valid email address.")) return;
      if (!valid($("#su-pass"), $("#su-pass").value.length >= 8, err, "Password must be at least 8 characters.")) return;
      store.set("user", { name: $("#su-name").value.trim(), email: $("#su-email").value.trim() });
      go("account.html");
    });
  }

  /* ------------------------------------------------------------ router
     Every internal link/form is loaded in place (fetch + swap body), so the site
     works inside preview frames where real page navigation or query strings are
     blocked, and pages switch without a full reload. */
  const isInternal = (u) => u.origin === location.origin && /(\.html$|\/$)/.test(u.pathname);
  let navSeq = 0, ignorePop = 0, lastLoc = location.pathname + location.search;
  const setHash = (h) => { ignorePop = Date.now(); try { location.hash = h; } catch {} };
  async function go(href, replace = false, fromPop = false) {
    const u = new URL(href, ROUTE);
    if (!isInternal(u)) { location.href = u.href; return; }
    const seq = ++navSeq;
    let html = null;
    try { const r = await fetch(u.pathname, { cache: "no-cache" }); if (r.ok) html = await r.text(); } catch {}
    if (html == null) { try { const r = await fetch(new URL("404.html", u)); html = await r.text(); } catch { location.href = u.href; return; } }
    if (seq !== navSeq) return;
    const doc = new DOMParser().parseFromString(html, "text/html");
    // tear down the old page
    AC.abort(); AC = new AbortController();
    timers.splice(0).forEach((id) => clearInterval(id));
    document.body.style.overflow = "";
    document.title = doc.title;
    [...document.body.attributes].forEach((a) => document.body.removeAttribute(a.name));
    [...doc.body.attributes].forEach((a) => document.body.setAttribute(a.name, a.value));
    doc.body.querySelectorAll("script").forEach((sc) => sc.remove());
    document.body.innerHTML = doc.body.innerHTML;
    ROUTE = u; page = document.body.dataset.page; params = new URLSearchParams(u.search);
    if (!fromPop) { if (!safeHistory(replace ? "replaceState" : "pushState", u.href) && u.hash) setHash(u.hash); }
    lastLoc = location.pathname + location.search;
    if (u.hash && $(u.hash)) $(u.hash).scrollIntoView(); else window.scrollTo(0, 0);
    boot();
    $("#main") && $("#main").focus({ preventScroll: true });
  }
  window.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const raw = a.getAttribute("href");
    if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return;
    const u = new URL(raw, ROUTE);
    if (!isInternal(u)) return;
    e.preventDefault();
    if (u.pathname === ROUTE.pathname && u.search === ROUTE.search && u.hash) { setHash(u.hash); return; }
    go(u.href);
  });
  window.addEventListener("submit", (e) => {
    const f = e.target;
    if (e.defaultPrevented || !f.getAttribute("action")) return;
    const u = new URL(f.getAttribute("action"), ROUTE);
    if (!isInternal(u)) return;
    e.preventDefault();
    u.search = new URLSearchParams(new FormData(f)).toString();
    go(u.href);
  });
  window.addEventListener("popstate", () => {
    if (Date.now() - ignorePop < 500) return;
    const u = new URL(location.href);
    if (u.pathname + u.search === lastLoc) return; // in-page hash change only
    lastLoc = u.pathname + u.search;
    go(u.href, true, true);
  });

  /* ------------------------------------------------------------ boot */
  function boot() {
    initTabs();
    initRailScroll();
    initCampaign();
    initHeader();
    initCountdowns();
    ({ home: initHome, search: initSearch, product: initProduct, cart: initCart, checkout: initCheckout, success: initSuccess, account: initAccount, login: initLogin }[page] || (() => {}))();
  }
  boot();
})();
