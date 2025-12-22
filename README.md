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

## 📦 Deployment on Netlify

This project can be deployed to Netlify as a modern Single Page Application (SPA). 

### 1. Build Settings
If you are using the Vite build system provided in `package.json`:
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

If you are serving the files directly using the runtime Babel setup:
- **Build Command:** *Leave empty*
- **Publish Directory:** `.`

### 2. Required Configuration (netlify.toml)
Create a `netlify.toml` file in the project root to handle SPA routing and ensure `.tsx` files are served correctly if not building:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*.tsx"
  [headers.values]
    Content-Type = "application/javascript"

[[headers]]
  for = "/*.ts"
  [headers.values]
    Content-Type = "application/javascript"
```

### 3. Environment Variables
Ensure the following environment variables are set in the Netlify UI under **Site settings > Environment variables**:
- `API_KEY`: Your Google Gemini API Key (required for AI features).

---
© 2025 Motion Max Day Services. Built for clinical excellence.