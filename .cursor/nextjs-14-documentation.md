# Next.js 14 Documentation Guide

## Table of Contents
1. [Introduction to Next.js 14](#introduction)
2. [Getting Started](#getting-started)
3. [App Router vs Pages Router](#app-vs-pages-router)
4. [Routing System](#routing)
5. [Rendering Strategies](#rendering)
6. [Data Fetching](#data-fetching)
7. [Caching and Revalidation](#caching)
8. [Components and Layouts](#components)
9. [Styling Options](#styling)
10. [API Routes](#api-routes)
11. [Deployment](#deployment)
12. [Configuration](#configuration)
13. [Optimization](#optimization)
14. [Middleware](#middleware)
15. [Advanced Features](#advanced-features)

## Introduction to Next.js 14 <a name="introduction"></a>

Next.js is a React framework that enables functionality such as server-side rendering, static site generation, API routes, and more. Version 14 brings several improvements including:

- Improved Server Actions
- Enhanced Partial Prerendering
- Improved Turbopack in beta
- Server Component support improvements
- Smaller client-side JavaScript payload
- Enhanced developer experience

Next.js 14 continues to support both the newer App Router (`app/` directory) and the traditional Pages Router (`pages/` directory).

## Getting Started <a name="getting-started"></a>

### System Requirements

- Node.js 18.17 or later
- macOS, Windows, or Linux

### Installation

Create a new Next.js app:

```bash
npx create-next-app@latest my-app
```

During setup, you'll be prompted with configuration options:

```
Would you like to use TypeScript? Yes
Would you like to use ESLint? Yes
Would you like to use Tailwind CSS? Yes
Would you like to use the `src/` directory? No
Would you like to use App Router? Yes
Would you like to customize the default import alias? No
```

### Project Structure

A typical Next.js 14 project with App Router looks like:

```
my-app/
├── app/
│   ├── favicon.ico
│   ├── layout.js
│   └── page.js
├── public/
│   └── vercel.svg
├── next.config.js
├── package.json
├── .eslintrc.json
└── postcss.config.js
```

### Running the Development Server

```bash
npm run dev
```

This starts your app at `http://localhost:3000`.

## App Router vs Pages Router <a name="app-vs-pages-router"></a>

Next.js 14 supports two routing systems:

### App Router (`app/` directory)
- Newer routing system introduced in Next.js 13
- Based on React Server Components
- Supports layouts, nested routing, loading states
- Uses file-system based routing with special files
- Recommended for new projects

### Pages Router (`pages/` directory)
- Traditional Next.js routing system
- Client Components by default
- Simpler but less feature-rich
- Maintained for backward compatibility

The documentation mainly focuses on the App Router, as it's the recommended approach for new applications.

## Routing System <a name="routing"></a>

### App Router Conventions

The App Router uses a file-system based router where:
- Folders define routes (`app/dashboard/settings/` becomes `/dashboard/settings`)
- Files create UI for the route segments

#### Special Files:
- `page.js`: Creates a publicly accessible route
- `layout.js`: Shared UI for multiple pages
- `loading.js`: Loading UI
- `error.js`: Error UI
- `not-found.js`: Not found UI
- `route.js`: API endpoint

### Creating Routes

```jsx
// app/page.js - Renders at /
export default function Home() {
  return <h1>Hello, Home page!</h1>
}

// app/dashboard/page.js - Renders at /dashboard
export default function Dashboard() {
  return <h1>Dashboard</h1>
}
```

### Dynamic Routes

```jsx
// app/blog/[slug]/page.js - Renders at /blog/:slug
export default function BlogPost({ params }) {
  return <h1>Blog Post: {params.slug}</h1>
}
```

### Route Groups

Use parentheses to create logical groups without affecting the URL path:

```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.js  // /about
│   └── blog/
│       └── page.js  // /blog
└── (dashboard)/
    ├── settings/
    │   └── page.js  // /settings
    └── analytics/
        └── page.js  // /analytics
```

### Parallel Routes

Use named slots with the `@folder` convention for parallel routes:

```
app/
├── @dashboard/
│   └── page.js
├── @analytics/
│   └── page.js
└── layout.js  // Can render both sections simultaneously
```

In layout.js:
```jsx
export default function Layout({ dashboard, analytics }) {
  return (
    <div className="grid grid-cols-2">
      <div>{dashboard}</div>
      <div>{analytics}</div>
    </div>
  )
}
```

### Intercepting Routes

Use the `(..)` or `(...)` convention to intercept routes:

```
app/
├── feed/
│   └── page.js
└── photo/
    ├── [id]/
    │   └── page.js  // /photo/123
    └── (.)[id]/
        └── page.js  // Shows an intercepted view when navigating to /photo/123
```

## Rendering Strategies <a name="rendering"></a>

Next.js 14 offers multiple rendering options:

### Server Components (Default)

React Server Components render on the server and don't require client-side JavaScript:

```jsx
// app/page.js
export default function Page() {
  return <h1>This is a Server Component</h1>
}
```

Benefits:
- Smaller bundle size
- Better initial load performance
- SEO-friendly

### Client Components

Use the `"use client"` directive to create Client Components:

```jsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Static and Dynamic Rendering

Next.js automatically chooses between:

#### Static Rendering (Default)
- Routes are rendered at build time
- Results are cached and reused for each request
- Great for content that doesn't change frequently

#### Dynamic Rendering
- Routes are rendered for each user at request time
- Necessary for personalized content or when using cookies/headers

Force dynamic rendering:
```jsx
export const dynamic = 'force-dynamic'

export default function Page() {
  return <h1>This page is always dynamically rendered</h1>
}
```

### Partial Prerendering (New in Next.js 14)

Combines static and dynamic content in a single route:
- Static shell is served instantly
- Dynamic content is streamed in when ready

```jsx
export default function Page() {
  return (
    <div>
      <h1>Static header</h1>
      <Suspense fallback={<p>Loading dynamic content...</p>}>
        <DynamicContent />
      </Suspense>
    </div>
  )
}
```

## Data Fetching <a name="data-fetching"></a>

### Server Component Data Fetching

Next.js 14 recommends fetching data directly in Server Components:

```jsx
async function getData() {
  const res = await fetch('https://api.example.com/data')
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  
  return (
    <main>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </main>
  )
}
```

### Fetch API with Cache and Revalidation Options

```jsx
// Force-cached data (default)
fetch('https://api.example.com/data')

// Revalidate every 60 seconds
fetch('https://api.example.com/data', { next: { revalidate: 60 } })

// Dynamic data, no caching
fetch('https://api.example.com/data', { cache: 'no-store' })
```

### Using React's `use()` for Data Fetching

```jsx
import { use } from 'react'

async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default function Page() {
  const data = use(getData())
  
  return <div>{data.title}</div>
}
```

### SWR for Client-side Data Fetching

```jsx
'use client'

import useSWR from 'swr'

export default function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher)
  
  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  
  return <div>Hello {data.name}!</div>
}
```

## Caching and Revalidation <a name="caching"></a>

Next.js 14 implements a comprehensive caching system:

### Router Cache
- Stores the React Server Component Payload
- Persists across navigations
- Automatically revalidates when form actions are used

### Data Cache
- Stores the results of `fetch` requests
- Persistent between builds in production
- Configurable per-request

### Full Route Cache
- Renders and stores React component trees
- Generated during build time for static routes

### Revalidation Strategies

#### Time-based Revalidation

```jsx
// Revalidate every 60 seconds
export const revalidate = 60

// OR in fetch
fetch('https://api.example.com/data', { next: { revalidate: 60 } })
```

#### On-demand Revalidation

```js
// app/api/revalidate/route.js
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request) {
  const { path, tag, secret } = await request.json()
  
  // Verify secret token
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
  
  if (path) {
    revalidatePath(path)
    return Response.json({ revalidated: true, path })
  }
  
  if (tag) {
    revalidateTag(tag)
    return Response.json({ revalidated: true, tag })
  }
  
  return Response.json({ error: 'No path or tag provided' }, { status: 400 })
}
```

## Components and Layouts <a name="components"></a>

### Root Layout

Required for all Next.js applications using App Router:

```jsx
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Nested Layouts

```jsx
// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div>
      <nav>Dashboard Navigation</nav>
      <main>{children}</main>
    </div>
  )
}
```

### Templates

Similar to layouts but create a new instance on each navigation:

```jsx
// app/template.js
export default function Template({ children }) {
  return <div className="template">{children}</div>
}
```

### Loading UI

```jsx
// app/dashboard/loading.js
export default function Loading() {
  return <div className="spinner">Loading...</div>
}
```

### Error Handling

```jsx
'use client'

// app/dashboard/error.js
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Not Found Pages

```jsx
// app/not-found.js
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find the requested resource</p>
    </div>
  )
}
```

## Styling Options <a name="styling"></a>

### CSS Modules

```jsx
// app/dashboard/styles.module.css
.header {
  background: #333;
  color: white;
}

// app/dashboard/page.js
import styles from './styles.module.css'

export default function Page() {
  return <h1 className={styles.header}>Dashboard</h1>
}
```

### Global CSS

```jsx
// app/globals.css
body {
  margin: 0;
  font-family: sans-serif;
}

// app/layout.js
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### Tailwind CSS

```jsx
// app/page.js
export default function Page() {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg">
      Styled with Tailwind CSS
    </div>
  )
}
```

### CSS-in-JS

```jsx
'use client'

import { styled } from 'styled-components'

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
`

export default function Page() {
  return <Title>Styled with styled-components</Title>
}
```

## API Routes <a name="api-routes"></a>

### Route Handlers

```js
// app/api/hello/route.js
export async function GET() {
  return Response.json({ message: 'Hello World' })
}

export async function POST(request) {
  const data = await request.json()
  return Response.json({ received: data })
}
```

### Dynamic API Routes

```js
// app/api/users/[id]/route.js
export async function GET(request, { params }) {
  const { id } = params
  return Response.json({ id, name: `User ${id}` })
}
```

### Edge API Routes

```js
// app/api/edge/route.js
export const runtime = 'edge'

export async function GET() {
  return Response.json({ 
    name: 'Edge Function',
    location: 'Edge Network'
  })
}
```

## Deployment <a name="deployment"></a>

### Building for Production

```bash
npm run build
```

This generates a `.next` folder with the production build.

### Self-hosting

```bash
npm start
```

This starts the production server on `http://localhost:3000`.

### Environment Variables

Create `.env`, `.env.local`, `.env.production`, or `.env.development` files:

```
DATABASE_URL=postgres://...
API_KEY=your_api_key
```

Access environment variables:
```js
// Server Components and API Routes
console.log(process.env.DATABASE_URL)

// Must be prefixed with NEXT_PUBLIC_ for client components
console.log(process.env.NEXT_PUBLIC_API_URL)
```

## Configuration <a name="configuration"></a>

### next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure image domains
  images: {
    domains: ['example.com', 'cdn.example.com'],
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ]
  },
  
  // Rewrites
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/products/:id',
          destination: '/items/:id',
        },
      ],
    }
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
  
  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

## Optimization <a name="optimization"></a>

### Image Optimization

```jsx
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile"
      width={500}
      height={300}
      priority
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}
```

### Font Optimization

```jsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function Layout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### Script Optimization

```jsx
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://analytics.example.com/script.js"
          strategy="lazyOnload"
          onLoad={() => console.log('Script loaded')}
        />
      </body>
    </html>
  )
}
```

### Metadata API

```jsx
// app/layout.js
export const metadata = {
  title: {
    template: '%s | My Website',
    default: 'My Website',
  },
  description: 'Welcome to my website',
  keywords: ['Next.js', 'React', 'JavaScript'],
  openGraph: {
    title: 'My Website',
    description: 'Welcome to my website',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
      },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

## Middleware <a name="middleware"></a>

```js
// middleware.js (root directory)
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-middleware-request', 'true')

  // Example: redirect if not authenticated
  const authToken = request.cookies.get('authToken')?.value
  
  if (!authToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Example: rewrite the request
  if (request.nextUrl.pathname.startsWith('/team')) {
    return NextResponse.rewrite(new URL('/about/team', request.url))
  }
  
  // Continue with modified request headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Configure which paths middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/team/:path*',
    '/((?!api|_next/static|favicon.ico).*)',
  ],
}
```

## Advanced Features <a name="advanced-features"></a>

### Server Actions

New in Next.js 14, server actions let you run server-side code from your client components:

```jsx
// app/actions.js
'use server'

export async function createTodo(prevState, formData) {
  const title = formData.get('title')
  
  try {
    // Create new todo in the database
    await db.todo.create({ data: { title } })
    return { message: 'Success!' }
  } catch (error) {
    return { message: 'Failed to create todo' }
  }
}

// app/new-todo.js
'use client'

import { useFormState } from 'react-dom'
import { createTodo } from './actions'

export default function NewTodo() {
  const [state, formAction] = useFormState(createTodo, { message: '' })
  
  return (
    <form action={formAction}>
      <input type="text" name="title" />
      <button type="submit">Add Todo</button>
      <p>{state.message}</p>
    </form>
  )
}
```

### Internationalization (i18n)

```jsx
// middleware.js
import { NextResponse } from 'next/server'

const locales = ['en', 'fr', 'de']
const defaultLocale = 'en'

export function middleware(request) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) return
  
  // Redirect if no locale is found
  const locale = defaultLocale
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Authentication

Next.js 14 works well with various authentication providers like NextAuth.js:

```jsx
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    },
  },
})

export { handler as GET, handler as POST }
```

### Edge Runtime

```jsx
// app/edge/page.js
export const runtime = 'edge'

export default function Page() {
  return <h1>This page runs on the Edge</h1>
}
```

### React Server Components Patterns

#### Streaming with Suspense

```jsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading user info...</div>}>
        <UserInfo />
      </Suspense>
      <Suspense fallback={<div>Loading latest posts...</div>}>
        <LatestPosts />
      </Suspense>
    </div>
  )
}

async function UserInfo() {
  const user = await fetchUser()
  return <div>{user.name}</div>
}

async function LatestPosts() {
  const posts = await fetchPosts()
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

This comprehensive documentation covers the main features and capabilities of Next.js 14. For more specific questions or detailed examples, consider referring to the official Next.js documentation or asking follow-up questions about particular aspects you want to explore further.
