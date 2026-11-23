"""Shared layout pieces: <head>, header + mega menu, footer, mobile tab bar, modals, drawers."""
from icons import sprite, icon

BRAND = "Zayranex"

DEPARTMENTS = [
    ("electronics", "Electronics", "p-phone", [
        ("Mobiles & Accessories", ["Mobile phones", "Cases & covers", "Chargers & cables", "Power banks", "Screen protectors"]),
        ("Laptops & Computers", ["Laptops", "Monitors", "Keyboards & mice", "Storage", "Printers"]),
        ("Audio & Wearables", ["Headphones", "Earbuds", "Smartwatches", "Speakers", "Fitness trackers"]),
        ("TV & Gaming", ["Televisions", "Consoles", "Video games", "Streaming devices", "Projectors"]),
    ]),
    ("beauty", "Beauty & Fragrance", "p-perfume", [
        ("Fragrance", ["Women's perfume", "Men's perfume", "Gift sets", "Body mists"]),
        ("Makeup", ["Face", "Eyes", "Lips", "Nails", "Brushes"]),
        ("Skincare", ["Cleansers", "Moisturisers", "Serums", "Sunscreen"]),
        ("Hair care", ["Shampoo", "Styling tools", "Hair oils", "Dryers"]),
    ]),
    ("home", "Home & Kitchen", "p-sofa", [
        ("Kitchen", ["Cookware", "Small appliances", "Air fryers", "Coffee machines", "Storage"]),
        ("Furniture", ["Living room", "Bedroom", "Office chairs", "Outdoor"]),
        ("Home décor", ["Lighting", "Rugs", "Wall art", "Curtains"]),
        ("Bath & bedding", ["Bed sheets", "Pillows", "Towels", "Mattresses"]),
    ]),
    ("grocery", "Grocery", "p-milk", [
        ("Fresh", ["Fruits", "Vegetables", "Dairy & eggs", "Bakery"]),
        ("Pantry", ["Rice & grains", "Oils", "Spices", "Breakfast"]),
        ("Beverages", ["Water", "Juices", "Coffee", "Tea"]),
        ("Household", ["Cleaning", "Laundry", "Paper goods", "Pet food"]),
    ]),
    ("men", "Men's Fashion", "p-shirt", [
        ("Clothing", ["T-shirts & polos", "Shirts", "Jeans", "Activewear", "Sleepwear"]),
        ("Footwear", ["Sneakers", "Formal shoes", "Sandals", "Sports shoes"]),
        ("Accessories", ["Watches", "Wallets", "Belts", "Sunglasses"]),
        ("Bags", ["Backpacks", "Laptop bags", "Travel"]),
    ]),
    ("women", "Women's Fashion", "p-shoe", [
        ("Clothing", ["Dresses", "Tops", "Abayas", "Activewear", "Lingerie"]),
        ("Footwear", ["Heels", "Flats", "Sneakers", "Sandals"]),
        ("Accessories", ["Handbags", "Jewellery", "Watches", "Scarves"]),
        ("Beauty picks", ["Bestsellers", "New arrivals"]),
    ]),
    ("baby", "Mom & Baby", "p-baby", []),
    ("toys", "Toys", "p-toy", []),
    ("kids", "Kids' Fashion", "p-shirt", []),
    ("sports", "Sports & Outdoors", "p-ball", []),
    ("health", "Health & Nutrition", "p-bottle", []),
    ("stationery", "Stationery", "p-book", []),
    ("books", "Books", "p-book", []),
    ("automotive", "Automotive", "p-car", []),
    ("media", "Music & Media", "p-headphones", []),
]

BRANDS = ["Apple", "Samsung", "Sony", "Nike", "Adidas", "Philips", "Xiaomi", "L'Oréal", "Lenovo", "Puma"]


def head(title, description):
    return f"""<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#feee00">
<title>{title} | {BRAND}</title>
<meta name="description" content="{description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
</head>"""


def _mega(slug, name, glyph, groups):
    if not groups:
        groups = [
            ("Shop by category", ["New arrivals", "Bestsellers", "Top rated", "Under AED 99"]),
            ("Popular", ["Gift ideas", "Premium picks", "Everyday essentials"]),
            ("Deals", ["Today's deals", "Clearance", "Bundles"]),
            ("Services", ["Express delivery", "Easy returns"]),
        ]
    cols = "".join(
        f'<div class="mega-group"><h3>{g}</h3><ul>'
        + "".join(f'<li><a href="search.html?c={slug}&amp;q={l.lower()}">{l}</a></li>' for l in links)
        + "</ul></div>"
        for g, links in groups
    )
    brands = "".join(f'<li><a class="brand-logo" href="search.html?brand={b}">{b}</a></li>' for b in BRANDS[:6])
    return f"""<div class="mega" id="mega-{slug}" hidden>
  <div class="container mega-inner">
    {cols}
    <a class="mega-promo slide-blue" href="search.html?c={slug}&amp;deal=1">
      <span class="badge badge-deal">Up to 60% off</span>
      <strong style="font-size:22px;margin-top:8px">{name} deals</strong>
      <span>Shop the edit {icon('chevron-right','icon-sm')}</span>
    </a>
    <div class="mega-brands"><h3>Top brands</h3><ul class="pill-row">{brands}</ul></div>
  </div>
</div>"""


def header(active=""):
    depts = "".join(
        f'<li class="dept-item" data-mega="{s}"><a href="search.html?c={s}" aria-haspopup="true" aria-expanded="false" aria-controls="mega-{s}">{n}</a></li>'
        for s, n, _, _ in DEPARTMENTS
    )
    megas = "".join(_mega(*d) for d in DEPARTMENTS)
    return f"""<a class="skip-link" href="#main">Skip to content</a>
{sprite()}
<header class="site-header" id="site-header">
  <div class="container header-main">
    <a class="logo" href="index.html" aria-label="{BRAND} home">{BRAND}<span class="logo-dot" aria-hidden="true"></span></a>
    <button class="deliver-to" type="button" data-open-modal="deliver-modal" aria-haspopup="dialog">
      {icon('pin')}
      <span><small>Deliver to</small><strong id="deliver-label">Dubai</strong></span>
      {icon('chevron-down','icon-sm')}
    </button>
    <div class="search" role="search">
      <form class="search-form" action="search.html" method="get" id="search-form">
        <label for="q" class="sr-only">Search products, brands and categories</label>
        {icon('search')}
        <input class="search-input" id="q" name="q" type="search" autocomplete="off"
               placeholder="What are you looking for?" role="combobox" aria-expanded="false"
               aria-controls="search-listbox" aria-autocomplete="list">
        <button class="search-clear hidden" type="button" id="search-clear" aria-label="Clear search">{icon('x','icon-sm')}</button>
      </form>
      <div class="search-panel hidden" id="search-panel">
        <ul id="search-listbox" role="listbox" aria-label="Search suggestions"></ul>
      </div>
    </div>
    <nav class="header-actions" aria-label="Account and cart">
      <button class="header-action hide-sm" type="button" id="lang-toggle" aria-label="Switch to Arabic">
        {icon('globe')}<span class="label">العربية</span>
      </button>
      <div class="account-menu">
        <button class="header-action" type="button" id="account-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="account-dropdown">
          {icon('user')}<span class="label" id="account-label">Sign in</span>
        </button>
        <div class="dropdown hidden" id="account-dropdown" role="menu">
          <a role="menuitem" href="account.html#orders">Orders</a>
          <a role="menuitem" href="account.html#returns">Returns</a>
          <a role="menuitem" href="account.html#addresses">Addresses</a>
          <a role="menuitem" href="account.html#payments">Payments</a>
          <a role="menuitem" href="account.html#credits">Wallet &amp; credits</a>
          <hr>
          <a role="menuitem" href="login.html" id="auth-link">Sign in / Sign up</a>
        </div>
      </div>
      <a class="header-action hide-sm" href="account.html#wishlist">{icon('heart')}<span class="label">Wishlist</span></a>
      <a class="header-action" href="cart.html" aria-label="Cart">
        {icon('cart')}<span class="cart-count" data-cart-count hidden>0</span><span class="label">Cart</span>
      </a>
    </nav>
  </div>
  <nav class="dept-nav" aria-label="Departments">
    <div class="container dept-row">
      <button class="all-cats" type="button" id="all-cats-btn" aria-controls="cat-drawer">{icon('menu')} All categories</button>
      <ul class="dept-list" id="dept-list">{depts}</ul>
      <a class="promo-pill" href="account.html#membership">Free delivery with Zayranex+ ›</a>
    </div>
    {megas}
  </nav>
</header>"""


def footer():
    cols = {
        "Electronics": ["Mobiles", "Laptops", "Headphones", "Smartwatches", "Gaming"],
        "Fashion": ["Men's fashion", "Women's fashion", "Kids' fashion", "Sneakers", "Watches"],
        "Home & Kitchen": ["Kitchen appliances", "Furniture", "Bedding", "Décor", "Storage"],
        "Beauty": ["Fragrance", "Makeup", "Skincare", "Hair care", "Personal care"],
        "Help": ["Help centre", "Track order", "Returns & refunds", "Payment options", "Contact us"],
        "Company": ["About us", "Careers", "Sell with us", "Affiliate program", "Press"],
    }
    html_cols = "".join(
        f'<div><h2>{h}</h2><ul>' + "".join(f'<li><a href="search.html?q={l.lower()}">{l}</a></li>' for l in ls) + "</ul></div>"
        for h, ls in cols.items()
    )
    return f"""<section class="pre-footer" aria-label="Customer support">
  <div class="container help-strip">
    <div><h2 style="font-size:18px">We're always here to help</h2><p class="muted">Reach out through any of these channels</p></div>
    <a class="help" href="#">{icon('chat')}<span><small class="muted">Help centre</small><br><strong>help.zayranex.example</strong></span></a>
    <a class="help" href="#">{icon('mail')}<span><small class="muted">Email support</small><br><strong>care@zayranex.example</strong></span></a>
    <div class="store-badges"><a class="store-badge" href="#">App Store</a><a class="store-badge" href="#">Google Play</a></div>
  </div>
</section>
<footer class="site-footer">
  <div class="container">
    <div class="footer-cols">{html_cols}</div>
    <div class="footer-bottom">
      <span>© 2026 {BRAND}. All rights reserved.</span>
      <div class="pay-icons" aria-label="Accepted payments"><span>VISA</span><span>MASTERCARD</span><span>AMEX</span><span>COD</span><span>TABBY</span><span>TAMARA</span></div>
      <nav aria-label="Legal"><a href="#">Warranty policy</a><a href="#">Terms of use</a><a href="#">Terms of sale</a><a href="#">Privacy policy</a><a href="#">Consumer rights</a></nav>
    </div>
  </div>
</footer>"""


def tabbar(active):
    items = [("home", "index.html", "home", "Home"), ("categories", "#", "grid", "Categories"),
             ("deals", "search.html?deal=1", "tag", "Deals"), ("account", "account.html", "user", "Account"),
             ("cart", "cart.html", "cart", "Cart")]
    out = []
    for key, href, ic, label in items:
        cur = ' aria-current="page"' if key == active else ""
        extra = ' data-open-cats' if key == "categories" else ""
        badge = '<span class="cart-count" data-cart-count hidden>0</span>' if key == "cart" else ""
        out.append(f'<a href="{href}"{cur}{extra}>{icon(ic)}{badge}{label}</a>')
    return f'<nav class="tabbar" aria-label="Primary">{"".join(out)}</nav>'


def overlays():
    cat_links = "".join(
        f'<li><a class="info-line" href="search.html?c={s}"><span style="display:flex;gap:12px;align-items:center">{icon(g)} {n}</span>{icon("chevron-right","icon-sm")}</a></li>'
        for s, n, g, _ in DEPARTMENTS
    )
    return f"""<div class="modal" id="deliver-modal" hidden role="dialog" aria-modal="true" aria-labelledby="deliver-title">
  <div class="modal-backdrop" data-close-modal></div>
  <div class="modal-card">
    <div class="modal-head"><h2 id="deliver-title" style="font-size:18px">Deliver to</h2>
      <button class="icon-btn" type="button" data-close-modal aria-label="Close">{icon('x')}</button></div>
    <div class="tabs" role="tablist">
      <button role="tab" id="tab-address" aria-selected="true" aria-controls="panel-address">Address</button>
      <button role="tab" id="tab-locker" aria-selected="false" aria-controls="panel-locker" tabindex="-1">Locker / Pickup point</button>
    </div>
    <div class="modal-body" role="tabpanel" id="panel-address" aria-labelledby="tab-address">
      <div class="field"><label for="country">Country</label>
        <select class="select input" id="country"><option>United Arab Emirates</option><option>Saudi Arabia</option><option>Egypt</option><option>Kuwait</option><option>Bahrain</option><option>Qatar</option><option>Oman</option></select></div>
      <div class="field"><label for="city">City</label>
        <select class="select input" id="city"><option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Ajman</option><option>Al Ain</option><option>Ras Al Khaimah</option></select></div>
      <div class="field"><label for="building">Building, street or area</label>
        <input class="input" id="building" placeholder="e.g. Marina Heights, Dubai Marina"></div>
      <button class="btn btn-primary btn-block" type="button" id="save-location">Deliver here</button>
    </div>
    <div class="modal-body" role="tabpanel" id="panel-locker" aria-labelledby="tab-locker" hidden>
      <p class="notice info">{icon('info')}<span>Get it delivered <strong>free</strong> to a locker or pickup point at your preferred time.</span></p>
      <div class="choices">
        <label class="choice"><input type="radio" name="locker" checked><span><strong>Dubai Marina Mall — Locker 12</strong><span class="muted">Open 24/7 · 1.2 km</span></span></label>
        <label class="choice"><input type="radio" name="locker"><span><strong>JLT Cluster D — Pickup point</strong><span class="muted">9am–10pm · 2.8 km</span></span></label>
      </div>
      <button class="btn btn-primary btn-block" type="button" data-close-modal>Use this locker</button>
    </div>
  </div>
</div>

<div class="overlay hidden" id="overlay"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true" inert>
  <div class="drawer-head"><h2 id="drawer-title">Details</h2>
    <button class="icon-btn" type="button" data-close-drawer aria-label="Close">{icon('x')}</button></div>
  <div class="drawer-body" id="drawer-body"></div>
  <div class="drawer-foot hidden" id="drawer-foot"></div>
</aside>
<aside class="drawer drawer-left" id="cat-drawer" role="dialog" aria-modal="true" aria-labelledby="cat-title" aria-hidden="true" inert>
  <div class="drawer-head"><h2 id="cat-title">All categories</h2>
    <button class="icon-btn" type="button" data-close-drawer aria-label="Close">{icon('x')}</button></div>
  <div class="drawer-body"><ul style="display:grid;gap:8px">{cat_links}</ul></div>
</aside>
<div class="toast-region" id="toasts" role="status" aria-live="polite"></div>
<button class="back-to-top" type="button" id="back-to-top" aria-label="Back to top">{icon('arrow-up')}</button>"""


def page(title, description, body, active="", page_id="", minimal=False):
    hdr = header(active)
    ftr = footer()
    if minimal:  # checkout: no distractions
        hdr = f"""<a class="skip-link" href="#main">Skip to content</a>
{sprite()}
<header class="checkout-header"><div class="container">
  <a class="logo" href="index.html" aria-label="{BRAND} home">{BRAND}<span class="logo-dot" aria-hidden="true"></span></a>
  <span class="secure">{icon('lock','icon-sm')} Secure checkout</span>
</div></header>"""
        ftr = ""
    return f"""{head(title, description)}
<body data-page="{page_id}">
{hdr}
<main id="main" tabindex="-1">
{body}
</main>
{ftr}
{'' if minimal else tabbar(active)}
{overlays()}
<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>
"""
