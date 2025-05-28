# Next.js + shadcn/ui + Tailwind CSS 4

A modern web application built with the latest technologies:

- **Next.js 15** - The React framework for production with App Router
- **React 19** - The latest version of React
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS 4** - The newest version of the utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible, and customizable UI components
- **Turbopack** - Next-generation bundler for fast development

## Features

- ⚡ Lightning-fast development with Turbopack
- 🎨 Modern, responsive design with Tailwind CSS 4
- 🧩 Pre-built components from shadcn/ui library
- 🌙 Dark mode support built-in
- 📱 Mobile-first responsive design
- 🔧 TypeScript for better developer experience
- 🎯 SEO-optimized with Next.js App Router

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
app/                    # App Router pages and layouts
├── globals.css        # Global styles and Tailwind CSS
├── layout.tsx         # Root layout component
└── page.tsx           # Home page
components/            # React components
└── ui/               # shadcn/ui components
lib/                  # Utility functions
public/               # Static assets
```

## Available Components

This project includes the following shadcn/ui components:

- `Button` - Interactive button component
- `Card` - Container component for content
- `Input` - Form input component
- `Label` - Form label component

To add more components, run:

```bash
npx shadcn@latest add [component-name]
```

## Technologies

This project is built with:

- [Next.js](https://nextjs.org) - React framework
- [React 19](https://react.dev) - UI library
- [TypeScript](https://typescriptlang.org) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Radix UI](https://radix-ui.com) - Headless UI primitives

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://typescriptlang.org/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
