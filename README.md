# Bookmark Manager

A powerful web application to merge, deduplicate, and export bookmarks from multiple browsers. Drop HTML or JSON exports from Chrome, Firefox, Safari, or Edge, and get a clean, organized bookmark library.

## Features

- **Multi-format Support**: Import bookmarks from Chrome JSON, Netscape HTML, and other browser formats
- **Smart Merging**: Automatically merge folders and organize bookmarks hierarchically
- **Duplicate Detection**: Identify and remove duplicate URLs across imports
- **Live Preview**: Edit bookmarks and folders before exporting
- **Multiple Export Formats**: Export as HTML, CSV, or plain URLs
- **Dark/Light Theme**: Toggle between themes with audio feedback
- **Session Persistence**: Your work is automatically saved to browser storage
- **Privacy First**: All processing happens in your browser—no uploads, no accounts

## Quick Start

```bash
npm install && npm run dev
```

Then open `http://localhost:5173` in your browser.

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/sumitagg24/bookmark-manager.git
cd bookmark-manager

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Upload Bookmarks**: Click the upload area and select bookmark export files (HTML or JSON)
2. **Review Merges**: See statistics and duplicate detection results
3. **Edit**: Modify bookmark titles, URLs, or folder structure as needed
4. **Export**: Download your cleaned bookmarks in HTML, CSV, or URL list format

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/        # React components
├── core/             # Business logic (merge, export, parse)
├── parsers/          # Bookmark format parsers
├── store/            # Zustand state management
├── types/            # TypeScript interfaces
└── assets/           # Images and icons
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

**Made with ❤️ for bookmark enthusiasts**
