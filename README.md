# ELEVATE — Tax & Financial Advisory Website

A static, dependency-free personal tax consultancy website: ultra-minimal
private-banking aesthetic, a four-step consultation flow, and a set of small
SVG financial
visualizations. Built with plain HTML, CSS, and JavaScript — no build step,
no framework, deployable anywhere that serves static files.

## Quick start

Open `index.html` directly in a browser, or serve the folder locally:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## 1. Set your details — `js/config.js`

Everything you'd want to change without touching markup lives in one object:

```js
const CONFIG = {
  consultantName: "ELEVATE",
  designation: "Tax Consultant",
  email: "hello@example.com",
  phone: "+91 00000 00000",
  whatsapp: "910000000000",   // digits only, country code first
  formEndpoint: "",           // see section 3
  accentColor: "#00bf63",
  trustStats: [ ... ]
};
```

Update `consultantName`, `email`, `phone`, `whatsapp`, and `location` first —
these populate the nav, hero, about section, footer, and every WhatsApp/email
link on the page automatically.

**Do not invent numbers.** `trustStats`, years of experience, client counts,
and satisfaction rates are left as `null`/placeholder text on purpose per the
"no fabricated credentials" rule this project was built under. Replace a
`value: null` entry with a real number only once you have one — the counter
will then animate on scroll automatically.

## 2. Connect a form backend (optional) — `js/config.js` → `formEndpoint`

Leave `formEndpoint` blank and the consultation form gracefully falls back to
"Continue on WhatsApp" / "Continue by Email" buttons prefilled with the
visitor's answers.

To wire up a real backend, set `formEndpoint` to any URL that accepts a
`POST` request with a JSON body (works out of the box with Formspree,
a Supabase Edge Function, a Firebase Cloud Function, or your own API):

```js
formEndpoint: "https://formspree.io/f/your-form-id"
```

The submitted payload shape:

```json
{
  "need": "income-tax",
  "profile": "salaried",
  "name": "…",
  "email": "…",
  "phone": "…",
  "preferredMethod": "call",
  "message": "…"
}
```

## Project structure

```
/
├── index.html
├── about.html
├── style.css
├── config.js            # editable content and theme
├── form.js              # multi-step consultation flow + validation
├── main.js              # nav, reveals, charts, FAQ, WhatsApp, etc.
└── README.md
```

## Notes

- No qualifications, certifications, awards, government registrations, or
  testimonials are included — none were provided, and none should be
  invented. Replace the bracketed placeholders in the About section once you
  have real content.
- Respects `prefers-reduced-motion`; all interactive elements are keyboard
  operable with visible focus states.
- No external JS dependencies. Fonts are loaded from Google Fonts
  (Instrument Serif, Inter, IBM Plex Mono) via a `<link>` tag in
  `index.html` — swap or self-host if you need to avoid the external
  request.
