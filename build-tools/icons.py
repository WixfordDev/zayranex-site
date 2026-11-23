"""Inline SVG sprite. Every icon is a 24x24 stroke icon referenced via <use href="#i-name">."""

ICONS = {
    "search": '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    "x": '<path d="M18 6 6 18M6 6l12 12"/>',
    "cart": '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 7H6"/>',
    "heart": '<path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    "box": '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    "pin": '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-right": '<path d="m9 6 6 6-6 6"/>',
    "chevron-left": '<path d="m15 6-6 6 6 6"/>',
    "star": '<path fill="currentColor" stroke="none" d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "minus": '<path d="M5 12h14"/>',
    "truck": '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    "shield": '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    "return": '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    "lock": '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    "check": '<path d="m5 12 5 5L20 7"/>',
    "filter": '<path d="M3 5h18M6 12h12M10 19h4"/>',
    "home": '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    "grid": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    "pause": '<path d="M9 5v14M15 5v14"/>',
    "play": '<path fill="currentColor" d="M7 4v16l13-8z"/>',
    "phone": '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    "chat": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    "bolt": '<path fill="currentColor" stroke="none" d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    "tag": '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    "trash": '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    "sparkle": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    "arrow-up": '<path d="M12 19V5M5 12l7-7 7 7"/>',
    "store": '<path d="M4 9h16l-1-5H5zM5 9v11h14V9"/><path d="M10 20v-6h4v6"/>',
    "card": '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    "wallet": '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7V6a2 2 0 0 1 2-2h11v3"/><circle cx="16.5" cy="13.5" r="1.5"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "menu": '<path d="M4 6h16M4 12h16M4 18h16"/>',
    "logout": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    "gift": '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13M12 8c-2-4-6-4-6-1.5S10 8 12 8c2 0 6 1 6-1.5S14 4 12 8"/>',
    # product glyphs
    "p-phone": '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    "p-laptop": '<rect x="4" y="5" width="16" height="11" rx="1"/><path d="M2 19h20"/>',
    "p-headphones": '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1"/><rect x="17" y="14" width="4" height="7" rx="1"/>',
    "p-watch": '<rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6V2h6v4M9 18v4h6v-4M12 9v3l2 1"/>',
    "p-shirt": '<path d="M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
    "p-shoe": '<path d="M2 17v-6l5-1 3 3 6 1 6 2v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM2 13h4"/>',
    "p-bottle": '<path d="M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z"/><path d="M8 13h8"/>',
    "p-sofa": '<path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v6H2zM5 18v2M19 18v2"/>',
    "p-toy": '<circle cx="12" cy="8" r="4"/><circle cx="7" cy="5" r="2"/><circle cx="17" cy="5" r="2"/><path d="M6 21c0-4 2.7-7 6-7s6 3 6 7z"/>',
    "p-book": '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
    "p-ball": '<circle cx="12" cy="12" r="9"/><path d="M3.5 9c5 1 12 1 17 0M3.5 15c5-1 12-1 17 0M12 3c-3 5-3 13 0 18M12 3c3 5 3 13 0 18"/>',
    "p-car": '<path d="M3 16v-4l2-5h14l2 5v4z"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path d="M3 12h18"/>',
    "p-baby": '<circle cx="12" cy="10" r="6"/><path d="M9.5 9.5h.01M14.5 9.5h.01M10 12.5a3 3 0 0 0 4 0M8 20h8M12 16v4"/>',
    "p-pan": '<circle cx="9" cy="13" r="6"/><path d="m14 10 8-5"/>',
    "p-tv": '<rect x="2" y="5" width="20" height="13" rx="1"/><path d="M8 22h8M12 18v4"/>',
    "p-camera": '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/>',
    "p-milk": '<path d="M8 2h8v3l2 3v14H6V8l2-3z"/><path d="M6 12h12"/>',
    "p-perfume": '<rect x="6" y="9" width="12" height="13" rx="2"/><path d="M10 9V6h4v3M12 3v3"/>',
}


def sprite():
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">']
    for name, body in ICONS.items():
        parts.append(
            f'<symbol id="i-{name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{body}</symbol>'
        )
    parts.append("</svg>")
    return "\n".join(parts)


def icon(name, cls="icon", label=None):
    a11y = f'role="img" aria-label="{label}"' if label else 'aria-hidden="true"'
    return f'<svg class="{cls}" {a11y}><use href="#i-{name}"/></svg>'
