# Crescita Collective

Membership app UI — home, digital member card, programmes, and perks — built with React, Vite, and Tailwind CSS.

## Structure

```
src/
  App.jsx                 # App shell: tab state, toast, member number, scroll handling
  index.css                # Tailwind directives, fonts, keyframes
  data/
    programmes.js          # Past programme list
  components/
    Header.jsx              # Top bar: logo + member badge
    BottomNav.jsx            # Bottom tab bar
    Toast.jsx                # Transient toast notification
  views/
    HomeView.jsx             # Home tab: join CTA + growth call booking
    CardView.jsx              # Digital member card + share actions
    ProgrammesView.jsx         # Current + past programmes
    PerksView.jsx               # Discount code + notification toggle
```

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Notes

- Member number is read from `localStorage` (`collective_member_number`, falling back to
  `member_number`, then `859`). Wire this up to your auth/member data source as needed.
- The digital card's "QR" grid is a decorative, deterministic pattern derived from the member
  number — not a real scannable QR code. Swap in a QR library (e.g. `qrcode.react`) if you need
  one that actually resolves.
- "Copy code", "download", "book a call", etc. are stubbed with toast feedback — wire them to
  real endpoints (clipboard already works via the Clipboard API; the rest are placeholders).
- Icons via [lucide-react](https://lucide.dev/).
