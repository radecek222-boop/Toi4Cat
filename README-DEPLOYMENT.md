# FIXO Deployment Guide

## GitHub Pages 🚀

**Status:** ACTIVE
**URL:** https://radecek222-boop.github.io/FIXO/

### Automatic Deployment ✅

Každý push na `main` branch automaticky spustí deployment pomocí GitHub Actions:

```yaml
# .github/workflows/deploy.yml
- Push to main → Automatic deployment
- Deployment time: ~30 seconds
- Live in: 1-2 minutes
```

### Manual Deployment

```bash
git push origin main
```

Po ~2 minutách je aplikace live na: https://radecek222-boop.github.io/FIXO/

---

## Technické detaily

### Co je deployováno:

- `index.html` - Hlavní HTML
- `src/app.js` - React aplikace
- `styles/` - CSS moduly
- `data/` - JSON databáze
- `assets/` - PWA ikony
- `manifest.json` - PWA manifest
- `service-worker.js` - Offline podpora

### Requirements:

- ✅ Static file hosting
- ✅ HTTPS (automaticky)
- ✅ Service Worker support
- ❌ **NENÍ** potřeba Node.js runtime
- ❌ **NENÍ** potřeba npm build
- ❌ **NENÍ** potřeba server

### Browser Requirements:

- Modern browser s ES6+ podporou
- JavaScript enabled
- Service Worker API (pro PWA)

---

## GitHub Pages výhody

- ✅ **Zdarma** - Unlimited bandwidth
- ✅ **Automatický** - Push = Deploy
- ✅ **Rychlý** - CDN distribuce
- ✅ **Bezpečný** - Auto HTTPS
- ✅ **Jednoduchý** - Zero config

---

## Troubleshooting

### GitHub Pages nefunguje?

1. Zkontroluj **Settings > Pages > Source** = GitHub Actions
2. Zkontroluj `.github/workflows/deploy.yml`
3. Zkontroluj **Actions** tab pro error logy

### Service Worker nefunguje?

1. Musí běžet na HTTPS (GitHub Pages má auto)
2. Zkontroluj **DevTools > Application > Service Workers**

### CSS/JS se nenačítá?

1. Zkontroluj cesty v `index.html`
2. GitHub Pages používá `/FIXO/` jako base path
3. Service worker má správné cesty s `/FIXO/` prefixem

---

## CI/CD Pipeline

### Validace (každý push)

```bash
✓ File structure check
✓ JSON syntax validation
✓ HTML/JS syntax check
✓ Security scan
✓ PWA icons verification
```

### Deployment (main branch)

```bash
✓ Checkout code
✓ Setup GitHub Pages
✓ Upload artifact
✓ Deploy
✓ Live in ~2 minutes
```

---

**Poslední update:** 2025-11-26
**Deployment:** GitHub Pages (jediný)
**Build time:** ~30 seconds
**Propagation:** ~1-2 minutes
