# 🏰 English Explorer Kids

A magical, AI-powered web application designed to help children explore the wonders of the English language.

![Status](https://img.shields.io/badge/Status-Active-success)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Gemini%20AI-blue)

## ✨ Features

- **🪄 Magic Analysis**: Instantly analyzes English sentences.
- **🇨🇳 Translation**: Provides natural, child-friendly Chinese translations.
- **⭐ Cool Phrases**: Identifies idioms, collocations, and phrases.
- **📖 Grammar Check**: Explains grammar rules in simple terms.
- **🖨️ PDF Export**: Saves the analysis as a beautiful PDF for printing or studying later.
- **☁️ Dreamy UI**: A colorful, engaging interface designed for kids.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (`gemini-3-flash-preview`)
- **PDF Generation**: `html2pdf.js`
- **Build Tool**: Vite

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API Key (Get it [here](https://aistudio.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/english-explorer-kids.git
   cd english-explorer-kids
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Create a `.env` file in the root directory.
   - Add your API key:
     ```env
     API_KEY=your_actual_api_key_here
     ```

4. **Run the App**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`.

## 📦 Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist` folder. You can deploy this folder to any static hosting service.

## ☁️ Deployment

### Vercel / Netlify

1. Push your code to GitHub.
2. Import the project into Vercel or Netlify.
3. **Important**: Add your `API_KEY` in the project's Environment Variables settings in the Vercel/Netlify dashboard.
4. The build command is `npm run build` and the output directory is `dist`.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
