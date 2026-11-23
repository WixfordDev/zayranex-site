"""Page bodies. Run: python3 pages.py  -> writes ../site/*.html"""
import os
from icons import icon
from layout import page, DEPARTMENTS, BRANDS

OUT = os.path.join(os.path.dirname(__file__), "..")


def rail(id_, title, sub="", extra=""):
    return f"""<section class="section container" aria-labelledby="{id_}-h">
  <div class="section-head"><div><h2 id="{id_}-h">{title}</h2>{f'<p>{sub}</p>' if sub else ''}</div>{extra}</div>
  <div class="rail-wrap">
    <button class="rail-btn prev" type="button" aria-label="Scroll {title} back" data-rail-prev="{id_}">{icon('chevron-left')}</button>
    <ul class="rail" id="{id_}" data-rail></ul>
    <button class="rail-btn next" type="button" aria-label="Scroll {title} forward" data-rail-next="{id_}">{icon('chevron-right')}</button>
  </div>
</section>"""


# ------------------------------------------------------------------ HOME
def home():
    slides = [
        ("slide-yellow", "Yellow Week · Live now", "Up to 70% off everything", "Thousands of deals across electronics, fashion and home. Ends Sunday.", "search.html?deal=1", "Shop deals"),
        ("slide-blue", "New arrival", "The new flagship phones are here", "Pre-order today, pay in 4 interest-free instalments.", "search.html?c=electronics&q=phone", "Explore phones"),
        ("slide-green", "Groceries in 60 minutes", "Fresh, fast, every day", "Fruits, dairy and pantry staples delivered in about an hour.", "search.html?c=grocery", "Order groceries"),
        ("slide-dark", "Zayranex+", "Free delivery, every order", "Join the membership for free next-day delivery and exclusive prices.", "account.html#membership", "Join now"),
    ]
    slides_html = "".join(
        f'<div class="hero-slide {c}" role="group" aria-roledescription="slide" aria-label="{i+1} of {len(slides)}">'
        f'<span class="eyebrow">{e}</span><h2>{h}</h2><p>{p}</p><a class="btn {"btn-primary" if c=="slide-yellow" else "btn-brand"}" href="{href}">{cta}</a></div>'
        for i, (c, e, h, p, href, cta) in enumerate(slides)
    )
    dots = "".join(f'<button class="hero-dot" type="button" aria-label="Go to slide {i+1}" data-slide="{i}"></button>' for i in range(len(slides)))
    tones = ["tone-1", "tone-2", "tone-3", "tone-4", "tone-5", "tone-6", "tone-7", "tone-8"]
    stickers = {0: "-60%", 3: "-30%", 6: "New"}
    cats = "".join(
        f'<li><a class="cat-tile" href="search.html?c={s}"><span class="cat-icon {tones[i % 8]}">{icon(g)}</span>{n}'
        + (f'<span class="cat-sticker">{stickers[i]}</span>' if i in stickers else "")
        + "</a></li>"
        for i, (s, n, g, _) in enumerate(DEPARTMENTS)
    )
    brands = "".join(
        f'<li><a href="search.html?brand={b}"><span class="brand-logo">{b}</span>'
        + ('<span class="badge badge-sponsored">Sponsored</span>' if i in (1, 4) else "")
        + "</a></li>"
        for i, b in enumerate(BRANDS)
    )
    popular = ["iphone", "air fryer", "perfume", "smartwatch", "sneakers", "headphones", "sunscreen", "laptop", "abaya", "coffee machine", "lego", "protein powder"]
    pop = "".join(f'<li><a class="chip" href="search.html?q={p}">{p}</a></li>' for p in popular)
    body = f"""
<div class="container home-intro">
  <h1>Online shopping in the UAE — electronics, fashion, home &amp; grocery</h1>
  <p>Millions of products, delivered as fast as today. Free returns on most items.</p>
</div>

<section class="container" aria-roledescription="carousel" aria-label="Featured promotions">
  <div class="hero" id="hero">
    <div class="hero-track" id="hero-track" aria-live="off">{slides_html}</div>
    <div class="hero-controls">
      {dots}
      <button class="icon-btn" type="button" id="hero-pause" aria-label="Pause slideshow">{icon('pause','icon-sm')}</button>
    </div>
  </div>
</section>

<section class="section container" aria-labelledby="cat-h">
  <h2 id="cat-h" class="sr-only">Shop by category</h2>
  <ul class="cat-strip">{cats}</ul>
</section>

<section class="section container" aria-label="Highlights">
  <div class="triad">
    <a class="triad-card tone-1" href="search.html?deal=1"><div><span class="badge badge-deal">Mega deals</span><h3 style="margin-top:8px">Today's top deals</h3></div>
      <span class="deal-timer">{icon('clock','icon-sm')} Ends in <span data-countdown="7200">02:00:00</span></span></a>
    <a class="triad-card tone-2" href="search.html?fast=1"><div><span class="badge badge-express">express</span><h3 style="margin-top:8px">Get it in 60 minutes</h3></div>
      <span>Groceries, chargers &amp; essentials →</span></a>
    <a class="triad-card tone-3" href="search.html?pricedrop=365"><div><span class="badge badge-success">Price drop</span><h3 style="margin-top:8px">Lowest price in a year</h3></div>
      <span>Verified by our price history →</span></a>
  </div>
</section>

{rail("rail-deals", "Deals of the day", "Prices drop every 24 hours", '<div class="tabs-inline" role="group" aria-label="Filter deals"><button class="chip is-active" data-deal-tab="all" aria-pressed="true">All</button><button class="chip" data-deal-tab="electronics" aria-pressed="false">Electronics</button><button class="chip" data-deal-tab="fashion" aria-pressed="false">Fashion</button><button class="chip" data-deal-tab="home" aria-pressed="false">Home</button></div>')}

<section class="section container" aria-label="Promotions">
  <div class="banner-row">
    <a class="banner tone-5" href="search.html?c=beauty"><span class="badge badge-sponsored">Sponsored</span><span class="eyebrow">Fragrance week</span><h3>Signature scents from AED 49</h3><span class="link-btn">Shop fragrance →</span></a>
    <a class="banner tone-7" href="search.html?c=home"><h3>Kitchen upgrade</h3><span>Air fryers from AED 129</span></a>
  </div>
</section>

{rail("rail-recent", "Recommended for you", "Based on what you viewed")}
{rail("rail-fast", "Delivered today", "Order within the cutoff to get it today")}

<section class="section container" aria-labelledby="brands-h">
  <div class="section-head"><h2 id="brands-h">Top brands</h2><a href="search.html">See all</a></div>
  <ul class="brand-row">{brands}</ul>
</section>

<section class="section container" aria-labelledby="pop-h">
  <div class="section-head"><h2 id="pop-h">Popular searches</h2></div>
  <ul class="popular">{pop}</ul>
</section>
"""
    return page("Online shopping for electronics, fashion & more", "Shop electronics, fashion, beauty, home and grocery with fast delivery across the UAE.", body, "home", "home")


# ------------------------------------------------------------------ SEARCH / PLP
def search():
    def checks(name, items):
        return "".join(
            f'<label class="check"><input type="checkbox" name="{name}" value="{v}"><span>{l}{f"<span class=hint>{h}</span>" if h else ""}</span><small data-count="{name}:{v}"></small></label>'
            for v, l, h in items
        )

    facets = [
        ("fulfil", "Fulfilled by", checks("fulfil", [("express", "express", "Fulfilled by Zayranex"), ("brand", "Direct from brand", "Sold by the brand's store"), ("global", "Global", "Sourced internationally")])),
        ("arrive", "Arrives by", checks("arrive", [("today", "Today", ""), ("tomorrow", "Tomorrow", ""), ("2days", "Within 2 days", "")])),
        ("brand", "Brand", '<input class="input" type="search" placeholder="Search brands" aria-label="Search brands" id="brand-search" style="min-height:36px"><div id="brand-list" style="display:grid;gap:8px"></div>'),
        ("price", "Price (AED)", '<div class="price-range"><div class="field"><label for="pmin">Min</label><input class="input" id="pmin" type="number" min="0" inputmode="numeric" placeholder="0"></div><div class="field"><label for="pmax">Max</label><input class="input" id="pmax" type="number" min="0" inputmode="numeric" placeholder="Any"></div><button class="btn btn-secondary btn-sm" type="button" id="price-go">Go</button></div>'),
        ("rating", "Customer rating", '<label for="rating" class="sr-only">Minimum rating</label><input class="range" id="rating" type="range" min="0" max="4.5" step="0.5" value="0"><span id="rating-label" class="muted">Any rating</span>'),
        ("drop", "Price drop", checks("drop", [("365", "Lowest price in a year", ""), ("30", "Lowest in 30 days", ""), ("7", "Lowest in 7 days", "")])),
        ("deal", "Deals", checks("deal", [("1", "On sale", ""), ("bundle", "Bundle offers", "")])),
    ]
    facet_html = "".join(
        f'<div class="facet"><button class="facet-toggle" type="button" aria-expanded="true" aria-controls="f-{k}">{t}{icon("chevron-down","icon-sm")}</button><div class="facet-body" id="f-{k}">{b}</div></div>'
        for k, t, b in facets
    )
    body = f"""
<div class="container">
  <nav aria-label="Breadcrumb"><ol class="breadcrumb" id="breadcrumb"><li><a href="index.html">Home</a></li><li aria-current="page">Search</li></ol></nav>
  <div class="plp">
    <aside class="facets" id="facets" aria-label="Filters">
      <div class="facets-head"><h2>Filters</h2>
        <button class="link-btn" type="button" data-clear-all>Clear all</button>
        <button class="icon-btn filter-close" type="button" id="filters-close" aria-label="Close filters">{icon('x')}</button>
      </div>
      {facet_html}
    </aside>
    <section aria-labelledby="results-h">
      <div class="results-head">
        <h1 id="results-h" aria-live="polite">Loading…</h1>
        <div class="sort">
          <button class="btn btn-secondary btn-sm filter-open-btn" type="button" id="filters-open">{icon('filter','icon-sm')} Filters</button>
          <label for="sort" class="muted">Sort by</label>
          <select class="select" id="sort">
            <option value="relevance">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top rated</option>
            <option value="new">New arrivals</option>
          </select>
        </div>
      </div>
      <div class="quick-filters" role="group" aria-label="Quick filters">
        <button class="chip" type="button" data-quick="fulfil:express" aria-pressed="false">{icon('bolt','icon-sm')} express</button>
        <button class="chip" type="button" data-quick="arrive:today" aria-pressed="false">Arrives today</button>
        <button class="chip" type="button" data-quick="deal:1" aria-pressed="false">On sale</button>
        <button class="chip" type="button" data-quick="rating:4" aria-pressed="false">4★ &amp; up</button>
        <button class="chip" type="button" data-quick="drop:365" aria-pressed="false">Lowest price in a year</button>
      </div>
      <div class="applied" id="applied" aria-label="Applied filters"></div>
      <div id="search-notice"></div>
      <div id="sponsored-slot"></div>
      <ul class="grid" id="results"></ul>
      <nav aria-label="Pagination"><div class="pagination" id="pagination"></div></nav>
    </section>
  </div>
</div>
"""
    return page("Search results", "Browse products with filters for delivery speed, brand, price, rating and deals.", body, "", "search")


# ------------------------------------------------------------------ PRODUCT
def product():
    body = f"""
<div class="container">
  <nav aria-label="Breadcrumb"><ol class="breadcrumb" id="breadcrumb"></ol></nav>
  <div class="pdp" id="pdp">
    <!-- gallery -->
    <section class="gallery" aria-label="Product images">
      <div class="thumbs" id="thumbs" role="group" aria-label="Choose image"></div>
      <div class="main-image" id="main-image" role="button" tabindex="0" aria-label="Zoom image">
        <button class="wish-btn" type="button" id="pdp-wish" aria-pressed="false" aria-label="Add to wishlist">{icon('heart','icon-sm')}</button>
      </div>
    </section>

    <!-- info + buy box -->
    <section class="pdp-info" aria-labelledby="pdp-title">
      <a class="pdp-brand" id="pdp-brand" href="#"></a>
      <h1 class="pdp-title" id="pdp-title"></h1>
      <div class="pdp-meta" id="pdp-meta"></div>
      <div class="pdp-price" id="pdp-price"></div>
      <div class="pill-row" id="pdp-pills"></div>
      <button class="info-line" type="button" data-drawer="bnpl">
        <span>{icon('card','icon-sm')} Pay in 4 interest-free payments of <strong id="bnpl-amount"></strong></span>{icon('chevron-right','icon-sm')}
      </button>
      <details class="ways-to-save" id="ways-to-save">
        <summary><span>{icon('tag','icon-sm')} Ways to save <span class="muted" id="wts-count"></span></span>{icon('chevron-down','icon-sm')}</summary>
        <div class="offer-list" id="offer-list"></div>
      </details>
      <div class="variant-group" id="variants"></div>
      <div class="buy-row" id="buy-row">
        <div class="qty" role="group" aria-label="Quantity">
          <button type="button" data-qty="-1" aria-label="Decrease quantity">{icon('minus','icon-sm')}</button>
          <output id="qty" aria-live="polite">1</output>
          <button type="button" data-qty="1" aria-label="Increase quantity">{icon('plus','icon-sm')}</button>
        </div>
        <button class="btn btn-primary" type="button" id="atc">Add to cart</button>
      </div>
      <p class="variant-error hidden" id="variant-error" role="alert"></p>
    </section>

    <!-- right rail -->
    <aside class="pdp-rail" aria-label="Delivery and seller">
      <div class="panel rail-card delivery-card">
        <div>{icon('truck')}</div>
        <div><span class="muted">Delivery to <strong id="pdp-city">Dubai</strong></span>
          <p class="eta" id="pdp-eta"></p>
          <p>Order within <span class="cutoff" id="cutoff"></span></p></div>
      </div>
      <div class="panel rail-card seller-card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center"><span>Sold by <a class="seller-name" href="#" id="seller-name"></a></span><span class="badge badge-success" id="seller-pos"></span></div>
        <div class="seller-stats">
          <div><strong id="seller-rating"></strong><span>Seller rating</span></div>
          <div><strong id="seller-asshown"></strong><span>Item as shown</span></div>
          <div><strong id="seller-since"></strong><span>Partner since</span></div>
        </div>
        <button class="btn btn-secondary btn-block" type="button" data-drawer="sellers" id="sellers-btn"></button>
      </div>
      <div class="panel promises" style="margin-top:16px">
        <button class="promise" type="button" data-drawer="returns" style="text-align:start">{icon('return')}<span><strong id="return-days"></strong><span class="muted">See return conditions ›</span></span></button>
        <div class="promise">{icon('shield')}<span><strong id="warranty"></strong><span class="muted">Manufacturer warranty</span></span></div>
        <div class="promise">{icon('lock')}<span><strong>Secure payments</strong><span class="muted">Encrypted checkout</span></span></div>
      </div>
    </aside>
  </div>

  <nav class="pdp-tabs" aria-label="Product sections"><ul class="container" style="padding:0">
    <li><a href="#overview" class="is-active">Overview</a></li>
    <li><a href="#specs">Specifications</a></li>
    <li><a href="#fbt">Bought together</a></li>
    <li><a href="#reviews">Ratings &amp; reviews</a></li>
  </ul></nav>

  <section id="overview" class="section panel" aria-labelledby="ov-h">
    <h2 id="ov-h">Product overview</h2>
    <div class="ai-summary" style="margin-top:16px"><h3>{icon('sparkle','icon-sm')} Summary from customer reviews</h3><p id="ai-summary"></p><p class="muted" style="font-size:12px;margin-top:6px">AI-generated from verified reviews. May contain errors.</p></div>
    <ul id="highlights" style="list-style:disc;padding-inline-start:20px;margin-top:16px;display:grid;gap:6px"></ul>
  </section>
  <section id="specs" class="section panel" aria-labelledby="sp-h"><h2 id="sp-h">Specifications</h2><table class="spec-table" style="margin-top:16px"><tbody id="spec-body"></tbody></table></section>
  <section id="fbt" class="section panel" aria-labelledby="fbt-h">
    <h2 id="fbt-h">Frequently bought together</h2>
    <div class="fbt" id="fbt-list" style="margin-top:16px"></div>
  </section>
  <section id="reviews" class="section panel" aria-labelledby="rv-h">
    <div class="section-head"><h2 id="rv-h">Ratings &amp; reviews</h2>
      <div class="segmented" role="group" aria-label="Review scope">
        <button type="button" aria-pressed="true" data-review-scope="variant">This variant</button>
        <button type="button" aria-pressed="false" data-review-scope="all">All variants</button>
      </div></div>
    <div class="reviews">
      <div class="review-summary" id="review-summary"></div>
      <div id="review-list"></div>
    </div>
  </section>
</div>
{rail("rail-similar", "Similar products")}

<div class="sticky-atc" id="sticky-atc" aria-hidden="true">
  <div class="container">
    <div class="mini" id="sticky-mini"></div>
    <span class="title" id="sticky-title"></span>
    <span class="price" id="sticky-price"></span>
    <button class="btn btn-primary" type="button" id="sticky-atc-btn" tabindex="-1">Add to cart</button>
  </div>
</div>
"""
    return page("Product details", "Product details, delivery date, seller information and reviews.", body, "", "product")


# ------------------------------------------------------------------ CART
def cart():
    body = f"""
<div class="container">
  <h1 style="margin-top:24px">Your cart <span class="muted" id="cart-heading-count" style="font-size:16px;font-weight:400"></span></h1>
  <div class="ship-banner" id="ship-banner"></div>
  <div id="cart-empty" class="empty-state hidden">
    {icon('cart')}
    <h2>Your cart is empty</h2>
    <p class="muted">Looks like you haven't added anything yet.</p>
    <p class="notice info" style="margin:0">{icon('tag','icon-sm')}<span>New here? Use code <strong>FIRST15</strong> for 15% off your first order.</span></p>
    <a class="btn btn-primary" href="index.html">Start shopping</a>
  </div>
  <div class="cart-layout" id="cart-full">
    <section aria-label="Cart items"><ul class="cart-items" id="cart-items"></ul></section>
    <aside class="panel summary" aria-labelledby="sum-h">
      <h2 id="sum-h" style="font-size:18px;margin-bottom:12px">Order summary</h2>
      <form class="coupon-form" id="coupon-form">
        <label for="coupon" class="sr-only">Coupon code</label>
        <input class="input" id="coupon" placeholder="Coupon code" autocomplete="off">
        <button class="btn btn-secondary" type="submit">Apply</button>
      </form>
      <p id="coupon-msg" role="status" style="font-size:12px;margin-top:6px"></p>
      <div style="margin-top:12px" id="summary-rows"></div>
      <a class="btn btn-primary btn-block" href="checkout.html" id="checkout-btn" style="margin-top:16px">Secure checkout</a>
      <div class="trust-row" style="margin-top:12px"><span>{icon('lock','icon-sm')} Secure payments</span><span>{icon('return','icon-sm')} Easy returns</span></div>
    </aside>
  </div>
</div>
{rail("rail-cart", "Bestsellers for you")}
"""
    return page("Cart", "Review your cart, apply a coupon and check out securely.", body, "cart", "cart")


# ------------------------------------------------------------------ CHECKOUT
def checkout():
    body = f"""
<div class="container" style="max-width:1100px">
  <ol class="stepper" aria-label="Checkout progress">
    <li class="is-done"><span>Cart</span></li>
    <li class="is-current" aria-current="step"><span>Address &amp; delivery</span></li>
    <li><span>Payment</span></li>
    <li><span>Confirmation</span></li>
  </ol>
  <div class="cart-layout">
    <form id="checkout-form" novalidate>
      <section class="panel co-section" aria-labelledby="addr-h">
        <h2 id="addr-h" style="font-size:18px">1. Delivery address</h2>
        <div class="form-grid">
          <div class="field"><label for="fname">Full name</label><input class="input" id="fname" name="name" autocomplete="name" required></div>
          <div class="field"><label for="phone">Mobile number</label><input class="input" id="phone" name="phone" type="tel" autocomplete="tel" placeholder="05X XXX XXXX" required></div>
          <div class="field full"><label for="addr">Building, street, area</label><input class="input" id="addr" name="address" autocomplete="street-address" required></div>
          <div class="field"><label for="co-city">City</label><select class="select input" id="co-city" name="city"><option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Ajman</option></select></div>
          <div class="field"><label for="apt">Apartment / villa no.</label><input class="input" id="apt" name="apt"></div>
          <label class="check full"><input type="checkbox" id="gift"> This is a gift (hides prices on the invoice)</label>
        </div>
      </section>
      <section class="panel co-section" aria-labelledby="del-h">
        <h2 id="del-h" style="font-size:18px">2. Delivery option</h2>
        <div class="choices">
          <label class="choice"><input type="radio" name="ship" value="standard" data-fee="0" checked><span><strong>Standard</strong><span class="muted" data-eta="2"></span></span><span class="aside">Free</span></label>
          <label class="choice"><input type="radio" name="ship" value="next" data-fee="9"><span><strong>Next day</strong><span class="muted" data-eta="1"></span></span><span class="aside">AED 9.00</span></label>
          <label class="choice"><input type="radio" name="ship" value="locker" data-fee="0"><span><strong>Locker / pickup point</strong><span class="muted">Free · pick up any time within 3 days</span></span><span class="aside">Free</span></label>
        </div>
      </section>
      <section class="panel co-section" aria-labelledby="pay-h">
        <h2 id="pay-h" style="font-size:18px">3. Payment</h2>
        <div class="choices">
          <label class="choice"><input type="radio" name="pay" value="card" checked><span>{icon('card','icon-sm')}<strong>Credit / debit card</strong><span class="muted">Visa, Mastercard, Amex</span></span></label>
          <div id="card-fields" class="form-grid" style="padding:4px 0 8px">
            <div class="field full"><label for="cc">Card number</label><input class="input" id="cc" inputmode="numeric" autocomplete="cc-number" placeholder="•••• •••• •••• ••••"></div>
            <div class="field"><label for="exp">Expiry (MM/YY)</label><input class="input" id="exp" autocomplete="cc-exp" placeholder="MM/YY"></div>
            <div class="field"><label for="cvv">CVV</label><input class="input" id="cvv" inputmode="numeric" autocomplete="cc-csc" placeholder="•••"></div>
          </div>
          <label class="choice"><input type="radio" name="pay" value="bnpl"><span><strong>Pay in 4 — interest-free</strong><span class="muted">Split into 4 monthly payments. Provider fees may apply.</span></span></label>
          <label class="choice"><input type="radio" name="pay" value="cod" data-fee="12"><span><strong>Cash on delivery</strong><span class="muted">AED 12 fee · not available for lockers or gift orders · max AED 6,500</span></span></label>
          <label class="choice"><input type="radio" name="pay" value="wallet"><span>{icon('wallet','icon-sm')}<strong>Wallet balance</strong><span class="muted">Available: AED 45.00 — remaining amount charged to card</span></span></label>
        </div>
        <p class="field-error hidden" id="pay-error" role="alert"></p>
      </section>
    </form>
    <aside class="panel summary" aria-labelledby="cos-h">
      <h2 id="cos-h" style="font-size:18px">Order summary</h2>
      <div id="co-items" style="margin-top:8px"></div>
      <div id="co-rows" style="margin-top:8px"></div>
      <button class="btn btn-primary btn-block" type="submit" form="checkout-form" style="margin-top:16px" id="place-order">Place order</button>
      <p class="muted" style="font-size:12px;margin-top:8px">By placing your order you agree to the Terms of Sale. Items are returnable within the window shown on each product page.</p>
    </aside>
  </div>
</div>
"""
    return page("Checkout", "Secure checkout.", body, "", "checkout", minimal=True)


def success():
    body = f"""
<div class="container" style="max-width:760px">
  <section class="panel success-hero" style="margin-top:32px">
    <span class="success-icon">{icon('check')}</span>
    <h1>Thank you, your order is placed!</h1>
    <p class="muted">Order <strong id="order-no"></strong> · confirmation sent to your email.</p>
    <p class="eta" id="order-eta" style="font-weight:700;color:var(--text-strong)"></p>
    <div class="pill-row" style="justify-content:center"><a class="btn btn-primary" href="account.html#orders">Track order</a><a class="btn btn-secondary" href="index.html">Continue shopping</a></div>
  </section>
  <section class="panel" style="margin-top:16px" aria-labelledby="next-h">
    <h2 id="next-h" style="font-size:16px">What happens next</h2>
    <ol class="track" style="margin-top:16px"><li class="is-done">Processing</li><li>Confirmed</li><li>Packed</li><li>Dispatched</li><li>Out for delivery</li></ol>
  </section>
</div>
"""
    return page("Order confirmed", "Your order has been placed.", body, "", "success", minimal=True)


# ------------------------------------------------------------------ ACCOUNT
def account():
    links = [("orders", "box", "Orders"), ("returns", "return", "Returns"), ("wishlist", "heart", "Wishlist"),
             ("addresses", "pin", "Addresses"), ("payments", "card", "Payments"), ("credits", "wallet", "Wallet & credits"),
             ("membership", "gift", "Zayranex+"), ("profile", "user", "Profile")]
    nav = "".join(f'<a href="#{k}" data-acc-tab="{k}">{icon(i,"icon-sm")} {l}</a>' for k, i, l in links)
    body = f"""
<div class="container">
  <div class="account-layout">
    <nav class="account-nav" aria-label="Account">
      <div class="account-user"><span class="avatar" id="acc-avatar">G</span><div><strong id="acc-name">Guest</strong><br><span class="muted" style="font-size:12px">Member since 2024</span></div></div>
      {nav}
      <a href="login.html" id="signout">{icon('logout','icon-sm')} Sign out</a>
    </nav>
    <div id="account-view" aria-live="polite"></div>
  </div>
</div>
"""
    return page("My account", "Orders, returns, addresses, payments and wallet.", body, "account", "account")


def login():
    body = f"""
<div class="auth-wrap">
  <div class="auth-card">
    <div class="tabs" role="tablist">
      <button role="tab" id="tab-signin" aria-selected="true" aria-controls="signin">Sign in</button>
      <button role="tab" id="tab-signup" aria-selected="false" aria-controls="signup" tabindex="-1">Create account</button>
    </div>
    <form class="modal-body" id="signin" role="tabpanel" aria-labelledby="tab-signin" novalidate>
      <h1 style="font-size:22px">Welcome back</h1>
      <div class="field"><label for="si-email">Email or mobile</label><input class="input" id="si-email" autocomplete="username" required></div>
      <div class="field"><label for="si-pass">Password</label><input class="input" id="si-pass" type="password" autocomplete="current-password" required></div>
      <p class="field-error hidden" id="si-error" role="alert"></p>
      <button class="btn btn-primary btn-block" type="submit">Sign in</button>
      <a href="#" style="justify-self:center">Forgot password?</a>
      <div class="divider">or</div>
      <button class="btn btn-secondary btn-block" type="button">Continue with Google</button>
      <button class="btn btn-secondary btn-block" type="button">Continue with Apple</button>
      <a class="btn btn-ghost btn-block" href="checkout.html">Continue as guest</a>
    </form>
    <form class="modal-body" id="signup" role="tabpanel" aria-labelledby="tab-signup" hidden novalidate>
      <h1 style="font-size:22px">Create your account</h1>
      <div class="field"><label for="su-name">Full name</label><input class="input" id="su-name" autocomplete="name" required></div>
      <div class="field"><label for="su-email">Email</label><input class="input" id="su-email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="su-pass">Password (min 8 characters)</label><input class="input" id="su-pass" type="password" minlength="8" autocomplete="new-password" required></div>
      <p class="field-error hidden" id="su-error" role="alert"></p>
      <button class="btn btn-primary btn-block" type="submit">Create account</button>
    </form>
  </div>
</div>
"""
    return page("Sign in", "Sign in or create an account.", body, "account", "login")


def not_found():
    body = f"""<div class="container"><div class="empty-state" style="margin-top:48px">{icon('search')}<h1>Page not found</h1><p class="muted">The page you're looking for doesn't exist or has moved.</p><a class="btn btn-primary" href="index.html">Go to homepage</a></div></div>"""
    return page("Page not found", "Page not found.", body, "", "404")


PAGES = {
    "index.html": home, "search.html": search, "product.html": product, "cart.html": cart,
    "checkout.html": checkout, "order-success.html": success, "account.html": account,
    "login.html": login, "404.html": not_found,
}

if __name__ == "__main__":
    for name, fn in PAGES.items():
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
            f.write(fn())
        print("wrote", name)
