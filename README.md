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
To ensure the "build-less" architecture works in production, the `netlify.toml` file in the root directory must include the following:

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

---
© 2025 Motion Max Day Services. Built for clinical excellence.