# Bharat Land Helper 🇮🇳

> **A comprehensive land measurement conversion tool built for India**

A modern, responsive web application that simplifies land unit conversions across various Indian measurement systems. Built with cutting-edge web technologies for accuracy, speed, and ease of use.

---

## ✨ Features

### 🔄 **Land Conversion**
- Convert between multiple Indian land measurement units
- Support for **Bigha, Acre, Hectare, Square Feet, Square Yard, Guntha**, and more
- Real-time conversion with instant results
- High-precision calculations

### 📊 **Visual Comparison**
- Side-by-side area comparison
- Visual representation of land sizes
- Interactive charts and graphs

### 🧮 **Rate Calculator**
- Calculate land value based on area and rate per unit
- Support for multiple currency formats
- Instant total value computation

### 📱 **Responsive Design**
- Mobile-first approach
- Works seamlessly on phones, tablets, and desktops
- Touch-friendly interface

### 🔍 **Search & Filter**
- Quick unit search
- Filter by category (Area, Length, etc.)
- Favorites and recent conversions

### 📋 **Quick Reference**
- Pre-defined conversion tables
- Common land measurement references
- State-specific unit information

### 🔗 **Share Functionality**
- Share conversion results via link
- Copy results to clipboard
- Social media sharing

### 📄 **Additional Pages**
- About page with project information
- Privacy Policy
- Terms of Service
- FAQ section
- Contact form

---

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 18.3** - UI library with hooks and functional components
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool and dev server

### **UI & Styling**
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variant management

### **State Management & Data**
- **React Router 6.30** - Client-side routing
- **TanStack Query 5.83** - Server state management
- **React Hook Form 7.61** - Form handling
- **Zod 3.25** - Schema validation

### **Charts & Visualization**
- **Recharts 2.15** - Composable charting library

### **Development Tools**
- **ESLint 9.32** - Code linting
- **Vitest 3.2** - Unit testing framework
- **Testing Library** - React component testing

---

## 📦 Project Stats

| Metric | Value |
|--------|-------|
| **Components** | 13+ reusable components |
| **Pages** | 7 pages (About, Contact, FAQ, Privacy, Terms, etc.) |
| **Dependencies** | 40+ production dependencies |
| **Dev Dependencies** | 15+ development tools |
| **Type Safety** | 100% TypeScript |
| **Bundle Size** | Optimized with Vite |

---

## ⚙️ Configuration

### **Build Configuration**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### **Aliases**
- `@/` → `./src/`

### **Scripts**
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run test` | Run test suite |
| `npm run test:watch` | Watch mode for tests |

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js** 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **bun** package manager

### **Installation**

```sh
# Step 1: Clone the repository
git clone https://github.com/girishlade111/bharat-land-helper.git

# Step 2: Navigate to project directory
cd bharat-land-helper

# Step 3: Install dependencies
npm install

# Step 4: Start development server
npm run dev
```

The app will open at `http://localhost:8080`

### **Build for Production**

```sh
# Create optimized production build
npm run build

# Preview the production build
npm run preview
```

---

## 🌐 Deployment

### **Vercel (Recommended)**

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy with default settings

**Auto-detected settings:**
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### **Other Platforms**

The `dist` folder can be deployed to any static hosting:
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

---

## 📁 Project Structure

```
bharat-land-helper/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components
│   │   ├── AreaVisual.tsx
│   │   ├── ComparisonMode.tsx
│   │   ├── ConverterInput.tsx
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── FAQ.tsx
│   │   └── ...
│   ├── context/         # React context providers
│   ├── data/            # Static data and constants
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── test/            # Test files
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── vercel.json          # Vercel configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

---

## 🎨 Design System

### **Color Palette**
- Built with Tailwind CSS default palette
- Custom animations via `tailwindcss-animate`

### **Typography**
- System fonts for optimal performance
- Responsive text scaling

### **Components**
- Accessible (ARIA compliant)
- Keyboard navigable
- Dark mode ready (via `next-themes`)

---

## 🧪 Testing

```sh
# Run all tests
npm run test

# Watch mode for development
npm run test:watch
```

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

For questions, issues, or feature requests, please:
- Open an issue on GitHub
- Visit the FAQ page in the application
- Contact via the Contact page

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [Shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)

---

<div align="center">

**Made with ❤️ for India**

[Report Bug](https://github.com/girishlade111/bharat-land-helper/issues) · [Request Feature](https://github.com/girishlade111/bharat-land-helper/issues)

</div>
