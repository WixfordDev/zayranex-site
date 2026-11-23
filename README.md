# Zayranex — marketplace front-end (HTML + CSS + JS)

Static multi-page e-commerce site built from the Noon UX/UI teardown.
Open `index.html` via a local server: `python3 -m http.server 8080` → http://localhost:8080

## Files
- `index.html` home · `search.html` search/category (PLP) · `product.html?id=p1` product (PDP)
- `cart.html` · `checkout.html` · `order-success.html` · `account.html` (#orders #returns #wishlist #addresses #payments #credits #membership #profile)
- `login.html` · `404.html`
- `css/styles.css` all styles (tokens, components, pages, responsive, RTL)
- `js/data.js` demo catalogue (replace with your API) · `js/app.js` all behaviour
- `build-tools/` Python generator that writes the HTML from shared header/footer (`python3 build-tools/pages.py` from inside build-tools after setting OUT)

## v3: Alibaba-style theme (orange #ff6a00/#d64000, white header, pill buttons, warm gradient hero, buyer-benefits strip, dark footer) · generated SVG product images in img/products (tools: build-tools/genimg.py)
v2 additions: Yellow Week campaign strip w/ countdown · card Quick view drawer · Arabic UI strings on language toggle · +12 products (Kids, Stationery, Music & Media now populated)

## Teardown fixes applied
Sponsored items labelled and kept out of sorting (R1/R2) · honest no-results + "Showing results for" (R3/R4) ·
reviews default to this variant (R5) · one return-window value per item (R6) · applied-filter chips + Clear all (R7) ·
recent/trending on empty search, scoped suggestions (R8/R9) · sellers drawer sorted by price (R11) · All-categories button (R12) ·
max one signal line per card (R13) · collapsed "Ways to save" (R14) · size not pre-selected, ATC echoes size (R15) ·
header collapses on scroll (R16) · landmarks, skip link, H1 at top, AA contrast, SAR read aloud (R18–R22) · single token set (R23).

Brand name is a placeholder: change "Zayranex" in build-tools/layout.py and regenerate (or find/replace).
Cart/wishlist/orders use localStorage (with in-memory fallback) — demo only, no backend.
