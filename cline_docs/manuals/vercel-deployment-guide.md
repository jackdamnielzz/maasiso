# Vercel Deployment Guide - MaasISO

Dit document beschrijft het volledige proces voor het deployen van de MaasISO frontend naar Vercel.

## Inhoudsopgave
1. [Vereisten](#vereisten)
2. [Project Configuratie](#project-configuratie)
3. [Deployment Proces](#deployment-proces)
4. [Troubleshooting](#troubleshooting)
5. [Belangrijke Bestanden](#belangrijke-bestanden)

---

## Vereisten

### Node.js Versie
- **Minimaal**: Node.js 20.0.0 of hoger
- Geconfigureerd in `.nvmrc` en `package.json` engines field

### Vercel Account
- Vercel account gekoppeld aan GitHub repository
- Environment variables geconfigureerd in Vercel dashboard

### Environment Variables (Vercel Dashboard)
Zorg dat deze variabelen zijn ingesteld in Vercel Project Settings > Environment Variables:

```
NEXT_PUBLIC_API_URL=https://peaceful-insight-production.up.railway.app
NEXT_PUBLIC_STRAPI_TOKEN=<your-strapi-token>
NEXT_PUBLIC_SITE_URL=https://maasiso.nl
```

---

## Project Configuratie

### Belangrijke Configuratiebestanden

#### 1. `.nvmrc`
Specificeert de Node.js versie voor Vercel:
```
20
```

#### 2. `.npmrc`
Lost peer dependency conflicten op:
```
legacy-peer-deps=true
```

#### 3. `vercel.json`
Vercel build configuratie:
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs"
}
```

#### 4. `package.json` engines
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

#### 5. `next.config.js` turbopack
Next.js 16+ vereist turbopack configuratie:
```javascript
const nextConfig = {
  // ... andere config
  turbopack: {},
  // ...
};
```

---

## Deployment Proces

### Automatische Deployment (Aanbevolen)

1. **Maak wijzigingen lokaal**
   ```bash
   # Maak je wijzigingen in de code
   ```

2. **Test de build lokaal**
   ```bash
   npm run build
   ```
   
   ✅ Zorg dat de build succesvol is voordat je pusht!

3. **Commit en push naar GitHub**
   ```bash
   git add -A
   git commit -m "beschrijving van wijzigingen"
   git push origin main
   ```

4. **Vercel detecteert automatisch de push**
   - Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
   - Bekijk de deployment status
   - Wacht tot de build compleet is

### Handmatige Deployment (Via Vercel CLI)

1. **Installeer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login bij Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

---

## Troubleshooting

### Probleem: "peer eslint@>=9.0.0" dependency conflict

**Oorzaak**: `eslint-config-next@16.x` vereist ESLint 9, maar project gebruikt ESLint 8.

**Oplossing**: Zorg dat `.npmrc` bestaat met:
```
legacy-peer-deps=true
```

---

### Probleem: "unknown option '--no-lint'" error

**Oorzaak**: Vercel gebruikt een custom build command (`build:prod`) die niet compatibel is.

**Oplossing**: Maak `vercel.json` aan met:
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs"
}
```

---

### Probleem: "This build is using Turbopack, with a webpack config"

**Oorzaak**: Next.js 16 gebruikt Turbopack standaard, maar er is geen turbopack config.

**Oplossing**: Voeg toe aan `next.config.js`:
```javascript
turbopack: {},
```

---

### Probleem: Middleware Edge Runtime errors

**Oorzaak**: Middleware gebruikt functies die niet beschikbaar zijn in Edge Runtime (bijv. `setInterval`).

**Oplossing**: 
- Verwijder `setInterval`, `setTimeout` met callbacks uit middleware
- Gebruik alleen Edge-compatible APIs
- Middleware moet in `src/middleware.ts` staan (niet in root)

---

### Probleem: TypeScript layout type errors

**Oorzaak**: Next.js 16 heeft striktere types voor layout componenten.

**Oplossing**: Gebruik de standaard Next.js layout signature:
```typescript
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

---

### Probleem: Node.js versie te oud

**Oorzaak**: Vercel gebruikt een oudere Node.js versie.

**Oplossing**: 
1. Maak `.nvmrc` aan met `20`
2. Voeg toe aan `package.json`:
   ```json
   "engines": {
     "node": ">=20.0.0"
   }
   ```

---

## Belangrijke Bestanden

| Bestand | Doel |
|---------|------|
| `.nvmrc` | Node.js versie voor Vercel |
| `.npmrc` | npm configuratie (legacy-peer-deps) |
| `vercel.json` | Vercel build configuratie |
| `next.config.js` | Next.js configuratie met turbopack |
| `src/middleware.ts` | Edge middleware (moet Edge-compatible zijn) |
| `package.json` | Dependencies en engines |

---

## Checklist voor Deployment

Voordat je deployt, controleer:

- [ ] `npm run build` werkt lokaal zonder errors
- [ ] `.nvmrc` bevat `20`
- [ ] `.npmrc` bevat `legacy-peer-deps=true`
- [ ] `vercel.json` bestaat met correcte buildCommand
- [ ] `next.config.js` heeft `turbopack: {}`
- [ ] Geen `setInterval`/`setTimeout` in middleware
- [ ] Environment variables zijn ingesteld in Vercel dashboard
- [ ] Alle TypeScript errors zijn opgelost

---

## Deployment History

| Datum | Commit | Status | Opmerkingen |
|-------|--------|--------|-------------|
| 2026-01-23 | `698e08d` | ✅ Success | Next.js 16.1.4 upgrade, Vercel config fixes |

---

## Contact

Bij problemen met deployment:
1. Check de Vercel build logs
2. Vergelijk met deze handleiding
3. Controleer de troubleshooting sectie

---

*Laatst bijgewerkt: 2026-01-23*
