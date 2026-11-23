/* Demo catalogue. Replace with your API (e.g. GET /api/products). */
(function () {
  // [id, title, brand, cat, group, glyph, price, was, rating, reviews, badge, sponsored, fulfil, arrive, drop, stock, extra]
  const rows = [
    ["p1", "Galaxy S25 Ultra 5G, 12GB RAM, 256GB, Titanium Silverblue", "Samsung", "electronics", "electronics", "p-phone", 2799, 4899, 4.7, 53602, "bestseller", false, "express", "tomorrow", 365, 14, { rank: "#3 in Mobile Phones", colors: [["Titanium Silverblue", "#9fb3c8", 2799], ["Titanium Black", "#2b2d33", 2849], ["Titanium Gray", "#8d8f94", 0]], storage: ["256GB", "512GB", "1TB"] }],
    ["p2", "iPhone 17 Pro 256GB, Cosmic Orange, eSIM", "Apple", "electronics", "electronics", "p-phone", 4599, 4999, 4.8, 8211, "pick", false, "express", "today", null, 6, { colors: [["Cosmic Orange", "#ff7a2f", 4599], ["Deep Blue", "#1d3a6b", 4599], ["Silver", "#d9d9de", 4649]], storage: ["256GB", "512GB"] }],
    ["p3", "AirPods Pro (2nd generation) with MagSafe USB-C case", "Apple", "electronics", "electronics", "p-headphones", 799, 1049, 4.8, 30214, "bestseller", false, "express", "today", 30, 40, {}],
    ["p4", "WH-1000XM5 Wireless Noise Cancelling Headphones", "Sony", "electronics", "electronics", "p-headphones", 1149, 1699, 4.6, 6120, null, true, "brand", "tomorrow", 365, 22, { colors: [["Black", "#1f1f22", 1149], ["Silver", "#d7d4cf", 1149], ["Midnight Blue", "#24324d", 1199]] }],
    ["p5", "IdeaPad Slim 5, 14\" OLED, Ryzen 7, 16GB, 1TB SSD", "Lenovo", "electronics", "electronics", "p-laptop", 2999, 3699, 4.5, 902, null, false, "express", "2days", 7, 9, {}],
    ["p6", "Watch Series 11 GPS 45mm Aluminium, Sport Band", "Apple", "electronics", "electronics", "p-watch", 1599, 1799, 4.7, 4410, "pick", false, "express", "tomorrow", null, 18, {}],
    ["p7", "Redmi Note 15 Pro 5G, 8GB RAM, 256GB", "Xiaomi", "electronics", "electronics", "p-phone", 999, 1399, 4.4, 2550, null, false, "global", "2days", 30, 31, {}],
    ["p8", "55\" 4K UHD Smart Google TV with Dolby Vision", "Sony", "electronics", "electronics", "p-tv", 2199, 3299, 4.5, 710, null, false, "brand", "2days", 365, 5, {}],
    ["p9", "Instant mirrorless camera kit with 18-55mm lens", "Sony", "electronics", "electronics", "p-camera", 2749, 3199, 4.6, 380, null, false, "express", "tomorrow", null, 3, {}],
    ["p10", "20,000mAh 65W fast-charging power bank", "Xiaomi", "electronics", "electronics", "p-phone", 89, 149, 4.3, 12880, "bestseller", false, "express", "today", 7, 120, {}],
    ["p11", "Men's embroidered logo regular-fit polo T-shirt", "Puma", "men", "fashion", "p-shirt", 119, 329, 4.3, 512, null, false, "express", "tomorrow", null, 2, { rank: "#14 in Men's Polos", colors: [["Coral Pink", "#f28b82", 119], ["Navy", "#1f2a44", 129], ["Black", "#111111", 0], ["White", "#f5f5f5", 119]], sizes: ["XS", "S", "M", "L", "XL", "XXL"] }],
    ["p12", "Air Zoom Pegasus 41 road running shoes", "Nike", "men", "fashion", "p-shoe", 389, 549, 4.6, 2033, "bestseller", false, "brand", "tomorrow", 30, 12, { sizes: ["40", "41", "42", "43", "44", "45"], colors: [["Black/White", "#222", 389], ["Volt", "#d7f04a", 399]] }],
    ["p13", "Ultraboost Light running shoes", "Adidas", "women", "fashion", "p-shoe", 449, 749, 4.5, 1210, null, true, "brand", "2days", 365, 8, { sizes: ["36", "37", "38", "39", "40", "41"] }],
    ["p14", "Women's linen-blend midi wrap dress", "Puma", "women", "fashion", "p-shirt", 159, 299, 4.2, 340, null, false, "express", "tomorrow", null, 16, { sizes: ["XS", "S", "M", "L", "XL"], colors: [["Sage", "#9db49a", 159], ["Sand", "#d8c3a5", 159]] }],
    ["p15", "Classic leather analog watch, 42mm", "Puma", "men", "fashion", "p-watch", 249, 499, 4.1, 188, null, false, "global", "2days", 7, 25, {}],
    ["p16", "Eau de Parfum 100ml — amber & oud", "L'Oréal", "beauty", "beauty", "p-perfume", 189, 395, 4.6, 4021, "bestseller", false, "express", "today", 30, 50, {}],
    ["p17", "Revitalift 1.5% hyaluronic acid serum 30ml", "L'Oréal", "beauty", "beauty", "p-bottle", 59, 99, 4.5, 9876, null, false, "express", "today", null, 80, {}],
    ["p18", "Essential air fryer XL 6.2L, 2000W", "Philips", "home", "home", "p-pan", 299, 549, 4.7, 15230, "bestseller", false, "express", "today", 365, 34, {}],
    ["p19", "3-seater fabric sofa, mid-century style", "Zayranex Home", "home", "home", "p-sofa", 1299, 2199, 4.3, 211, null, false, "express", "2days", null, 4, { colors: [["Grey", "#9aa0a6", 1299], ["Emerald", "#1f6f5c", 1349], ["Mustard", "#d4a017", 1299]] }],
    ["p20", "Non-stick cookware set, 10 pieces, induction-ready", "Philips", "home", "home", "p-pan", 349, 699, 4.4, 1430, null, true, "brand", "tomorrow", 30, 15, {}],
    ["p21", "Espresso coffee machine with milk frother", "Philips", "home", "home", "p-pan", 899, 1299, 4.5, 870, "pick", false, "express", "tomorrow", null, 7, {}],
    ["p22", "Long-life full-fat milk 1L, pack of 4", "Almarai", "grocery", "grocery", "p-milk", 17.95, 19.5, 4.8, 3120, null, false, "express", "today", null, 200, { unit: "0.45/100ml", rank: "#1 in Milk & Cream" }],
    ["p23", "Basmati rice extra long grain 5kg", "Tilda", "grocery", "grocery", "p-milk", 64.5, 79, 4.7, 2210, "bestseller", false, "express", "today", 30, 90, { unit: "1.29/100g" }],
    ["p24", "Building blocks city fire station set, 540 pieces", "LEGO", "toys", "home", "p-toy", 279, 399, 4.9, 640, null, false, "express", "tomorrow", 365, 11, {}],
    ["p25", "Baby stroller lightweight foldable, 0–36 months", "Joie", "baby", "home", "p-baby", 549, 899, 4.6, 420, null, false, "express", "2days", null, 6, {}],
    ["p26", "Whey protein isolate 2kg, chocolate", "Optimum", "health", "home", "p-bottle", 239, 329, 4.6, 5620, null, false, "global", "2days", 7, 45, {}],
    ["p27", "Football size 5, match quality", "Adidas", "sports", "fashion", "p-ball", 79, 129, 4.5, 980, null, false, "express", "tomorrow", null, 60, {}],
    ["p28", "Car phone holder magnetic dashboard mount", "Xiaomi", "automotive", "electronics", "p-car", 39, 89, 4.2, 4320, null, false, "express", "today", 30, 150, {}],
    ["p29", "Atomic Habits — paperback", "Penguin", "books", "home", "p-book", 42, 65, 4.8, 18100, "bestseller", false, "express", "tomorrow", null, 70, {}],
    ["p30", "Galaxy Buds3 Pro true wireless earbuds", "Samsung", "electronics", "electronics", "p-headphones", 549, 899, 4.4, 2980, null, false, "express", "tomorrow", 365, 26, {}],
    ["p31", "Galaxy Watch8 Classic 46mm LTE", "Samsung", "electronics", "electronics", "p-watch", 1299, 1799, 4.5, 1100, null, true, "brand", "2days", null, 10, {}],
    ["p32", "MacBook Air 13\" M4, 16GB, 512GB", "Apple", "electronics", "electronics", "p-laptop", 4999, 5499, 4.8, 2050, null, false, "express", "tomorrow", 30, 8, {}],
    ["p33", "Kids' cotton printed T-shirt, pack of 3", "Puma", "kids", "fashion", "p-shirt", 69, 119, 4.5, 860, null, false, "express", "tomorrow", 30, 40, { sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"] }],
    ["p34", "Kids' light-up sneakers, velcro strap", "Adidas", "kids", "fashion", "p-shoe", 129, 199, 4.4, 512, null, false, "brand", "2days", null, 18, { sizes: ["28", "29", "30", "31", "32"] }],
    ["p35", "Gel pens assorted colours, pack of 24", "Pilot", "stationery", "home", "p-book", 29, 45, 4.7, 2240, "bestseller", false, "express", "today", 30, 140, {}],
    ["p36", "A5 hardcover dotted notebook, 192 pages", "Moleskine", "stationery", "home", "p-book", 59, 89, 4.8, 1310, null, false, "express", "tomorrow", null, 75, { colors: [["Black", "#111111", 59], ["Sage", "#9db49a", 59]] }],
    ["p37", "School backpack ergonomic 20L", "Puma", "stationery", "fashion", "p-shirt", 149, 239, 4.5, 690, null, true, "brand", "2days", 7, 22, {}],
    ["p38", "Portable Bluetooth speaker, waterproof IP67", "Sony", "media", "electronics", "p-headphones", 299, 449, 4.6, 3400, "pick", false, "express", "today", 365, 30, {}],
    ["p39", "Turntable belt-drive with built-in preamp", "Sony", "media", "electronics", "p-tv", 799, 1099, 4.4, 210, null, false, "global", "2days", null, 5, {}],
    ["p40", "Sunscreen SPF 50+ invisible fluid 50ml", "L'Oréal", "beauty", "beauty", "p-bottle", 49, 79, 4.6, 7400, "bestseller", false, "express", "today", 30, 110, {}],
    ["p41", "Arabic coffee premium cardamom 500g", "Almarai", "grocery", "grocery", "p-milk", 38, 45, 4.7, 1650, null, false, "express", "today", null, 85, { unit: "7.60/100g" }],
    ["p42", "Ergonomic mesh office chair, adjustable lumbar", "Zayranex Home", "home", "home", "p-sofa", 549, 999, 4.3, 1180, null, false, "express", "2days", 365, 12, {}],
    ["p43", "Yoga mat non-slip 6mm with strap", "Adidas", "sports", "fashion", "p-ball", 89, 149, 4.5, 2100, null, false, "express", "tomorrow", 30, 65, {}],
    ["p44", "Baby wipes sensitive, 12 x 64", "Joie", "baby", "home", "p-baby", 79, 109, 4.8, 9800, "bestseller", false, "express", "today", null, 200, { unit: "0.10/wipe" }],
  ];

  // real product photos (img/photos). First = main image; others = gallery. Missing → generated SVG.
  const photos = {"p2": ["img/photos/p2-1.jpg", "img/photos/p2-2.jpg", "img/photos/p2-3.jpg", "img/photos/p2-4.jpg", "img/photos/p2-5.jpg"], "p17": ["img/photos/p17-1.jpg", "img/photos/p17-2.jpg", "img/photos/p17-3.jpg"], "p40": ["img/photos/p40-1.jpg", "img/photos/p40-2.jpg", "img/photos/p40-3.jpg"], "p10": ["img/photos/p10-1.jpg"], "p6": ["img/photos/p6-1.jpg"], "p3": ["img/photos/p3-1.jpg"], "p38": ["img/photos/p38-1.jpg"], "p20": ["img/photos/p20-1.jpg", "img/photos/p20-2.jpg"], "p18": ["img/photos/p18-1.jpg"], "p4": ["img/photos/p4-1.jpg", "img/photos/p4-2.jpg", "img/photos/p4-3.jpg"], "p1": ["img/photos/p1-1.jpg", "img/photos/p1-2.jpg", "img/photos/p1-3.jpg"], "p8": ["img/photos/p8-1.jpg", "img/photos/p8-2.jpg", "img/photos/p8-3.jpg"]};

  const products = rows.map((r, i) => ({
    id: r[0], title: r[1], brand: r[2], cat: r[3], group: r[4], glyph: r[5],
    price: r[6], was: r[7], rating: r[8], reviews: r[9], badge: r[10], sponsored: r[11],
    fulfil: r[12], arrive: r[13], drop: r[14], stock: r[15],
    tone: "tone-" + ((i % 8) + 1),
    photos: photos[r[0]] || [],
    rank: r[16].rank || null, unit: r[16].unit || null,
    colors: r[16].colors || null, sizes: r[16].sizes || null, storage: r[16].storage || null,
    isNew: i % 5 === 1,
    seller: ["Zayranex", "ElectroZone", "TechHub KSA", "StyleCorner", "HomeMart"][i % 5],
  }));

  const categoryNames = {
    electronics: "Electronics", beauty: "Beauty & Fragrance", home: "Home & Kitchen", grocery: "Grocery",
    men: "Men's Fashion", women: "Women's Fashion", baby: "Mom & Baby", toys: "Toys", kids: "Kids' Fashion",
    sports: "Sports & Outdoors", health: "Health & Nutrition", stationery: "Stationery", books: "Books",
    automotive: "Automotive", media: "Music & Media",
  };

  const coupons = {
    FIRST15: { type: "pct", value: 15, cap: 75, label: "15% off your first order (max SAR 75)" },
    SAVE10: { type: "flat", value: 10, min: 100, label: "SAR 10 off orders over SAR 100" },
    YELLOW20: { type: "pct", value: 20, cap: 150, min: 200, label: "20% off orders over SAR 200 (max SAR 150)" },
  };

  const trending = ["iphone 17", "air fryer", "perfume", "running shoes", "power bank", "lego"];

  window.CATALOG = { products, categoryNames, coupons, trending };
})();
