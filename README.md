# MyRecipes - ספר המתכונים שלי

Hebrew-language recipe management application that syncs recipes from WhatsApp and creates a searchable library.

## Features

- 🔄 Automatic sync from WhatsApp group
- 🔍 Full-text Hebrew search
- 📱 Responsive design with RTL support
- 🌐 Support for text recipes, website links, and Instagram stories
- 🔗 Original link preservation

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn

### Installation

```bash
yarn install
```

### Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
yarn build
yarn start
```

## Project Structure

```
myrecipes/
├── app/                 # Next.js App Router
│   ├── components/     # React components
│   ├── lib/            # Utility functions
│   ├── types/          # TypeScript types
│   └── page.tsx        # Home page
├── lib/                # Shared libraries
│   └── db/             # Database utilities
├── plan/               # Project planning documents
└── public/             # Static assets
```

## Hebrew Language Support

The application is fully localized in Hebrew with:
- RTL (Right-to-Left) layout
- Hebrew fonts (Assistant, Heebo, Alef)
- Hebrew search functionality

## License

Private project
