
# Imagenie - AI Image Generation & Content Creation

Imagenie is a cutting-edge web application that leverages the power of Google's Gemini and Imagen APIs to provide users with an intuitive platform for AI-driven image generation and sophisticated content creation.

## ✨ Features

### 🖼️ AI Image Generation
- **Text-to-Image:** Generate unique images from descriptive text prompts.
- **Prompt Optimization:** Optionally enhance your prompts using AI for more detailed and creative results.
- **Artistic Styles:** Choose from a diverse range of predefined artistic styles (e.g., Photorealistic, Pixel Art, Ghibli Studio, Watercolor) to guide the image generation process.
- **Multiple Variations:** Generates four image options per prompt.
- **Download:** Easily download your generated masterpieces in JPEG format.

### ✍️ AI Content Creator Assistant
- **Versatile Content Types:** Generate structured content tailored for:
    - LinkedIn Posts / Carousels
    - LinkedIn Articles
    - Instagram Carousel Posts
- **Flexible Input:** Provide base content, a topic, or text from a URL (users should paste the text content from URLs).
- **Google Search Grounding:** The AI utilizes Google Search to fetch relevant and up-to-date information for content generation, ensuring timeliness and accuracy.
- **Platform-Optimized Output:** Delivers content ready for publishing, including:
    - Catchy headlines and descriptions.
    - Structured slide content for carousels.
    - Relevant viral hashtags.
    - Image prompt descriptions (for accompanying visuals).
    - Music suggestions (for Instagram).
- **Markdown Display:** Generated content is rendered using Markdown for easy readability and formatting.
- **Regenerate:** Option to regenerate content using the same initial input and content type.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **AI Models & API:**
    - Google Gemini API (`@google/genai`)
    - Image Generation Model: `imagen-3.0-generate-002`
    - Text Generation & Prompt Optimization Model: `gemini-2.5-flash-preview-04-17` (with Google Search grounding for content creation)
- **Styling:** Tailwind CSS (configured directly in `index.html`)
- **Modules:** ES Modules loaded via import maps (using esm.sh CDN)
- **Offline Capability:** Basic offline support via a Service Worker (`sw.js`) for app shell caching.
- **Accessibility:** ARIA attributes and semantic HTML are used to enhance accessibility.
- **Responsiveness:** Designed to work across various screen sizes.

## 🚀 Getting Started

### Prerequisites
- A modern web browser with JavaScript enabled (e.g., Chrome, Firefox, Edge, Safari).
- An active Google Gemini API key.

### API Key Configuration (Crucial!)

This application **requires** a Google Gemini API key to function. The API key **must** be available as an environment variable named `API_KEY` in the execution context where the application's JavaScript (specifically `services/geminiService.ts`) is processed.

```javascript
// In services/geminiService.ts
const API_KEY = process.env.API_KEY;
// ...
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}
```

The application **does not** provide a user interface for entering the API key. It assumes `process.env.API_KEY` is pre-configured and accessible.

**For Local Development/Serving:**
If you are serving the files locally (e.g., using `npx serve`, VS Code Live Server, or a simple Python HTTP server), `process.env.API_KEY` might not be directly available in the browser's context as it would be in a Node.js environment or with certain build tools.
- The application includes a check in `App.tsx` for `(window as any).API_KEY` as a fallback primarily for displaying a warning banner if the key isn't detected.
- To make the Gemini API calls work during local development without a build step that injects `process.env.API_KEY`, you would need to ensure this variable is somehow defined in the scope where `geminiService.ts` runs. Some development servers or tools might offer ways to inject environment variables.
- **Important:** The `ApiKeyStatusBanner` will appear if `process.env.API_KEY` (or its fallback `window.API_KEY`) is not detected by `App.tsx`, and API-dependent features will be disabled.

### Running the Application
1.  **Clone the repository (if applicable) or ensure all project files are in a single directory.**
    ```bash
    # Example if you had it in a git repo:
    # git clone <repository-url>
    # cd imagenie-project
    ```
2.  **Serve the `index.html` file using a local web server.**
    - Using `npx serve` (Node.js required):
      ```bash
      npx serve .
      ```
    - Using Python 3:
      ```bash
      python -m http.server
      ```
    - Or use the "Live Server" extension in VS Code.
3.  **Open the application in your web browser** (usually `http://localhost:3000`, `http://localhost:8000`, or as indicated by your server).

## 📁 Project Structure

```
.
├── components/                 # React UI components
│   ├── ApiKeyStatusBanner.tsx  # Banner for API key status
│   ├── ContentCreatorAssistant.tsx # UI for content generation feature
│   ├── FeatureToggleBar.tsx    # Navigation bar for switching features
│   ├── ImageCard.tsx           # Displays generated images with download
│   ├── LoadingSpinner.tsx      # Reusable loading indicator
│   └── VideoCard.tsx           # (Component for video display, if needed)
├── services/                   # Business logic and API interactions
│   └── geminiService.ts        # Handles all Google Gemini API calls
├── App.tsx                     # Main application component, routes features
├── index.html                  # Main HTML entry point, includes Tailwind config & import maps
├── index.tsx                   # React root rendering
├── metadata.json               # Application metadata (name, description)
├── sw.js                       # Service Worker for offline caching
└── README.md                   # This file
```

## ⚙️ Core Services

### `services/geminiService.ts`
This file is central to the application's functionality, managing all interactions with the Google Gemini API.
- **`generateImageFromPrompt(prompt, optimize, style)`:**
    - Takes a user prompt, an optimization flag, and an image style.
    - If `optimize` is true, it first calls the Gemini text model (`gemini-2.5-flash-preview-04-17`) to refine the user's prompt.
    - Then, it calls the Imagen model (`imagen-3.0-generate-002`) to generate four images based on the final prompt.
    - Returns an array of image data (Base64 encoded URL and MIME type).
- **`generateStructuredContent(userInput, contentType)`:**
    - Takes user input (text, topic) and the desired content type (e.g., 'linkedinPost', 'instagramCarousel').
    - Constructs a detailed prompt for the Gemini text model (`gemini-2.5-flash-preview-04-17`).
    - Enables `googleSearch` tool for grounding, allowing the model to fetch current information.
    - Returns the generated content as a Markdown string.

##🎨 Styling

- **Tailwind CSS:** Utilized for rapid UI development. The configuration is embedded directly within a `<script>` tag in `index.html`.
- **Custom Theme:** Includes an extended color palette (amber) and custom animations (`gradient-pan`, `subtle-pulse`, `fadeInUp`, `fadeInDown`, `pulse-slowly`).
- **Typography:** Custom typography settings are defined within the Tailwind config for consistent text styling (headings, paragraphs, links, etc.).

## 🌐 Offline Functionality

A basic Service Worker (`sw.js`) is implemented to cache the application shell (`index.html` and potentially other static assets). This allows the app to load more quickly on subsequent visits and provides a degree of offline access to the main interface. Network-dependent features (image/content generation) will still require an internet connection and a valid API key.

##🤝 Contributing

While this project is currently set up as a direct file-based application, contributions are welcome. If you plan to contribute, please consider the following:
- Adhere to the existing code style and structure.
- Ensure any new features or changes are well-documented.
- Test your changes thoroughly.
- For significant changes, please open an issue first to discuss the proposed modifications.

##📜 License

This project is currently not under a specific license. All rights reserved by UB Intelligence.

---

Powered by Google Gemini & Imagen 3
&copy; 2025 Imagenie by UB Intelligence
