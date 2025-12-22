# 🧩 Motion Max Management System

> A high-performance, clinical management platform for special needs schools. Designed with the precision of GitHub and the accessibility of Google.

## 🚀 Vision
Motion Max bridges the gap between clinical excellence and administrative efficiency. Our system provides real-time ABA therapy tracking, developmental milestones, and automated financial oversight in a clean, unified interface.

## 🎨 Design Philosophy
- **Google Accessibility**: Clean white surfaces, intuitive navigation, and high-quality typography (Inter).
- **GitHub Precision**: Data-first density, monospace identifiers (JetBrains Mono), and robust version-controlled logging.
- **Light-First**: Optimized for bright, professional environments.

## 🛠 Project Structure
- `index.tsx`: System bootstrap and React mounting.
- `App.tsx`: Intelligent routing and role-based access control.
- `store/useStore.ts`: Real-time state synchronization with Firebase Firestore.
- `components/`: Modular UI units (Layout, Dashboard, ABA Clinical, Uniform Shop).

---

## 📦 Deployment on Netlify

This project is built using Vite and React 19, making it highly compatible with Netlify's modern edge platform.

### 1. Site Configuration
When connecting your repository to Netlify, use the following settings:

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node.js Version:** 20.x or higher (recommended)

### 2. Environment Variables
The application requires specific API keys to function. Add these in **Site settings > Environment variables**:

| Variable | Description |
| :--- | :--- |
| `API_KEY` | Your Google Gemini API Key (Required for AI features) |

### 3. Handling Client-Side Routing
Since this is a Single Page Application (SPA), you must ensure that all navigation requests are redirected to `index.html`. Create a `public/_redirects` file (or `netlify.toml`) with the following content:

```text
/*  /index.html  200
```

Or in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. 🛠 Troubleshooting: EINTEGRITY Error
If your build fails with an `EINTEGRITY` error (checksum mismatch), it is likely due to a corrupted or stale `package-lock.json`. 

**Fix:**
1. Delete your local `package-lock.json` and `node_modules`.
2. Run `npm install` again to generate a fresh lockfile.
3. Commit and push the new `package-lock.json`.
4. If the error persists on Netlify, go to the **Deploys** tab and select **"Clear cache and deploy site"**.

---
© 2025 Motion Max Day Services. Built for clinical excellence in Harare.