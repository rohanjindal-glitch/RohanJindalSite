(function () {
  const S = window.SITE, POSTS = window.POSTS, PHOTOS = window.PHOTOS, BOOK = window.BOOK;
  const view = document.getElementById("view");
  const wipe = document.getElementById("wipe");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const inline = s => esc(s).replace(/\*(.+?)\*/g, "<em>$1</em>");
  const readMins = t => Math.max(1, Math.round(t.split(/\s+/).length / 200));

  function renderBody(text) {
    return text.split(/\n\s*\n/).map(p => {
      p = p.trim();
      if (p.startsWith("## ")) return `<h2>${inline(p.slice(3))}</h2>`;
      return `<p>${inline(p)}</p>`;
    }).join("");
  }

  const img = (src, alt = "") => `<img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async">`;

  /* ---------- pages ---------- */
  const pages = {
    home() {
      const latest = POSTS.slice(0, 3);
      const strip = PHOTOS.slice(0, 6);
      return `
      <section class="hero">
        <div class="hero-img" style="background-image:url('${S.hero}')"></div>
        <div class="hero-shade"></div>
        <div class="hero-text">
          <p class="eyebrow rv">${esc(S.tagline)}</p>
          <h1 class="rv" style="--d:.1s">${esc(S.name)}</h1>
          <p class="lede rv" style="--d:.2s">${esc(S.intro)}</p>
          <a class="btn rv" style="--d:.3s" href="#/photography">View photography <span>&rarr;</span></a>
        </div>
        <div class="scroll-cue">Scroll</div>
      </section>

      <section class="wrap">
        <div class="sec-head rv"><h2>Recent writing</h2><a href="#/blog" class="more">All posts <span>&rarr;</span></a></div>
        <div class="post-list">${latest.map(postRow).join("")}</div>
      </section>

      <section class="wrap">
        <div class="sec-head rv"><h2>Frames</h2><a href="#/photography" class="more">Gallery <span>&rarr;</span></a></div>
        <div class="strip">${strip.map((p, i) => `<a href="#/photography" class="strip-item rv" style="--d:${i * .06}s">${img(p.src, p.title)}</a>`).join("")}</div>
      </section>

      <section class="wrap about">
        <div class="rv"><p class="eyebrow">About</p></div>
        <div class="rv" style="--d:.1s">${S.about.map(a => `<p>${esc(a)}</p>`).join("")}
          <a class="more" href="#/elsewhere">Find me elsewhere <span>&rarr;</span></a></div>
      </section>`;
    },

    blog() {
      return `
      <section class="wrap page-head">
        <p class="eyebrow rv">Writing</p>
        <h1 class="rv" style="--d:.08s">Straight up from my diary</h1>
        <p class="lede rv" style="--d:.16s">Travel, life lessons, and the small moments that stay.</p>
      </section>
      <section class="wrap"><div class="post-list">${POSTS.map(postRow).join("")}</div></section>`;
    },

    post(slug) {
      const i = POSTS.findIndex(p => p.slug === slug);
      if (i < 0) return pages.notfound();
      const p = POSTS[i], next = POSTS[i + 1] || POSTS[0];
      return `
      <article class="post">
        <header class="wrap-narrow post-head">
          <a href="#/blog" class="back rv">&larr; All writing</a>
          <p class="eyebrow rv">${esc(p.series)} &middot; ${fmtDate(p.date)} &middot; ${readMins(p.body)} min read</p>
          <h1 class="rv" style="--d:.08s">${esc(p.title)}</h1>
        </header>
        ${p.cover ? `<figure class="post-cover rv" style="--d:.16s">${img(p.cover, p.title)}</figure>` : ""}
        <div class="wrap-narrow prose">${renderBody(p.body)}</div>
        <footer class="wrap-narrow post-foot">
          <p class="eyebrow">Next</p>
          <a class="next-link" href="#/blog/${next.slug}">${esc(next.title)} <span>&rarr;</span></a>
        </footer>
      </article>`;
    },

    photography() {
      return `
      <section class="wrap page-head">
        <p class="eyebrow rv">Photography</p>
        <h1 class="rv" style="--d:.08s">Until color</h1>
        <p class="lede rv" style="--d:.16s">Street frames, light, and strangers passing through it.</p>
      </section>
      <section class="wrap-wide"><div class="masonry">
        ${PHOTOS.map((p, i) => `<figure class="m-item rv" data-i="${i}">${img(p.src, p.title || "Photograph " + (i + 1))}${p.title ? `<figcaption>${esc(p.title)}</figcaption>` : ""}</figure>`).join("")}
      </div></section>
      <section class="wrap cta rv"><p>More on Instagram</p><a class="btn" href="${S.links[0].url}" target="_blank" rel="noopener">${esc(S.links[0].handle)} <span>&rarr;</span></a></section>`;
    },

    book() {
      const ch = BOOK.chapters || [];
      return `
      <section class="wrap book-hero">
        <div class="book-cover rv"><div class="cover-art"><span>${esc(BOOK.title)}</span><i>Rohan Jindal</i></div></div>
        <div>
          <p class="eyebrow rv">The book</p>
          <h1 class="rv" style="--d:.08s">${esc(BOOK.title)}</h1>
          <p class="sub rv" style="--d:.12s">${esc(BOOK.subtitle)}</p>
          <div class="rv" style="--d:.18s">${BOOK.blurb.map(b => `<p>${esc(b)}</p>`).join("")}</div>
          <ul class="tags rv" style="--d:.24s">${BOOK.themes.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
          ${BOOK.buyUrl ? `<a class="btn rv" style="--d:.3s" href="${BOOK.buyUrl}" target="_blank" rel="noopener">Get the book <span>&rarr;</span></a>` : ""}
        </div>
      </section>
      <section class="wrap-narrow">
        <div class="sec-head rv"><h2>Read</h2></div>
        ${ch.length ? ch.map((c, i) => `<a class="chapter rv" href="#/book/${i}"><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="ct">${esc(c.title)}</span><span class="arr">&rarr;</span></a>`).join("")
          : `<p class="muted rv">Excerpts and chapters are on their way.</p>`}
      </section>`;
    },

    chapter(i) {
      const c = (BOOK.chapters || [])[i];
      if (!c) return pages.notfound();
      const prev = BOOK.chapters[i - 1], next = BOOK.chapters[+i + 1];
      return `
      <article class="post">
        <header class="wrap-narrow post-head">
          <a href="#/book" class="back rv">&larr; ${esc(BOOK.title)}</a>
          <p class="eyebrow rv">Chapter ${+i + 1}</p>
          <h1 class="rv" style="--d:.08s">${esc(c.title)}</h1>
        </header>
        <div class="wrap-narrow prose">${renderBody(c.body)}</div>
        <footer class="wrap-narrow post-foot pager">
          ${prev ? `<a href="#/book/${i - 1}">&larr; ${esc(prev.title)}</a>` : "<span></span>"}
          ${next ? `<a href="#/book/${+i + 1}">${esc(next.title)} &rarr;</a>` : ""}
        </footer>
      </article>`;
    },

    elsewhere() {
      return `
      <section class="wrap page-head">
        <p class="eyebrow rv">Elsewhere</p>
        <h1 class="rv" style="--d:.08s">Find me out there</h1>
        <p class="lede rv" style="--d:.16s">The side of things that lives outside this page.</p>
      </section>
      <section class="wrap"><div class="link-grid">
        ${S.links.map((l, i) => {
          const url = l.url || S.links.find(x => /linktr/.test(x.url)).url;
          return `<a class="link-card rv" style="--d:${i * .08}s" href="${url}" target="_blank" rel="noopener">
            <span class="eyebrow">${esc(l.label)}</span><strong>${esc(l.handle)}</strong><p>${esc(l.note)}</p><span class="go">Visit &nearr;</span></a>`;
        }).join("")}
      </div></section>
      <section class="wrap-wide">
        <div class="sec-head wrap rv"><h2>From the feed</h2><a class="more" href="${S.links[0].url}" target="_blank" rel="noopener">@rohn.photo <span>&rarr;</span></a></div>
        <div class="feed">${PHOTOS.slice(0, 8).map((p, i) => `<a class="feed-item rv" style="--d:${i * .05}s" href="${S.links[0].url}" target="_blank" rel="noopener">${img(p.src, p.title)}</a>`).join("")}</div>
      </section>`;
    },

    notfound() {
      return `<section class="wrap page-head"><p class="eyebrow">404</p><h1>Nothing here.</h1><a class="btn" href="#/">Back home <span>&rarr;</span></a></section>`;
    }
  };

  function postRow(p, i) {
    return `<a class="post-row rv" style="--d:${i * .06}s" href="#/blog/${p.slug}">
      <span class="pr-date">${fmtDate(p.date)}</span>
      <span class="pr-main"><strong>${esc(p.title)}</strong><em>${esc(p.excerpt)}</em></span>
      <span class="pr-arrow">&rarr;</span>
      ${p.cover ? `<span class="pr-thumb">${img(p.cover, "")}</span>` : ""}
    </a>`;
  }

  /* ---------- router ---------- */
  function route() {
    const h = (location.hash || "#/").replace(/^#\/?/, "").split("/");
    const [a, b] = h;
    let html, key = a || "home";
    if (!a) html = pages.home();
    else if (a === "blog" && b) { html = pages.post(b); key = "blog"; }
    else if (a === "blog") html = pages.blog();
    else if (a === "book" && b !== undefined) { html = pages.chapter(b); key = "book"; }
    else if (pages[a]) html = pages[a]();
    else html = pages.notfound();
    return { html, key };
  }

  let first = true;
  function go() {
    const { html, key } = route();
    const swap = () => {
      view.innerHTML = html;
      window.scrollTo({ top: 0, behavior: "instant" });
      document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === key));
      document.body.dataset.page = key;
      document.title = (key === "home" ? "" : key[0].toUpperCase() + key.slice(1) + " · ") + "Rohan Jindal";
      bind();
    };
    if (first || reduce) { first = false; swap(); return; }
    wipe.classList.add("in");
    setTimeout(() => { swap(); requestAnimationFrame(() => wipe.classList.remove("in")); }, 380);
  }

  /* ---------- reveal, parallax, lightbox ---------- */
  let io;
  function bind() {
    if (io) io.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    view.querySelectorAll(".rv").forEach(el => io.observe(el));
    view.querySelectorAll(".m-item").forEach(el => el.addEventListener("click", () => openLB(+el.dataset.i)));
  }

  const heroScroll = () => {
    const h = document.querySelector(".hero-img");
    if (h && !reduce) h.style.transform = `translate3d(0,${Math.min(scrollY, 900) * .25}px,0) scale(1.08)`;
    document.getElementById("nav").classList.toggle("solid", scrollY > 40);
  };
  addEventListener("scroll", heroScroll, { passive: true });

  const lb = document.getElementById("lightbox"), lbImg = lb.querySelector("img"), lbCount = lb.querySelector(".lb-count");
  let cur = 0;
  function showLB(i) {
    cur = (i + PHOTOS.length) % PHOTOS.length;
    lbImg.classList.remove("ready");
    lbImg.onload = () => lbImg.classList.add("ready");
    lbImg.src = PHOTOS[cur].src;
    lbImg.alt = PHOTOS[cur].title || "";
    lbCount.textContent = `${cur + 1} / ${PHOTOS.length}${PHOTOS[cur].title ? " — " + PHOTOS[cur].title : ""}`;
  }
  function openLB(i) { showLB(i); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.classList.add("lock"); }
  function closeLB() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.classList.remove("lock"); }
  lb.querySelector(".lb-close").onclick = closeLB;
  lb.querySelector(".lb-prev").onclick = () => showLB(cur - 1);
  lb.querySelector(".lb-next").onclick = () => showLB(cur + 1);
  lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
  addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") showLB(cur - 1);
    if (e.key === "ArrowRight") showLB(cur + 1);
  });

  /* ---------- boot ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("footLinks").innerHTML = S.links.filter(l => l.url).map(l => `<a href="${l.url}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("");
  addEventListener("hashchange", go);
  go();
  heroScroll();
  setTimeout(() => document.getElementById("curtain").classList.add("done"), reduce ? 0 : 1100);
})();
