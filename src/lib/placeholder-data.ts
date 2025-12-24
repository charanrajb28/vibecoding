export type Project = {
  id: string;
  name: string;
  framework: string;
  lastUpdated: string;
  status: 'online' | 'offline' | 'error';
  icon: React.ComponentType<{ className?: string }>;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  imageId: string;
};

export type FileNode = {
  name: string;
  type: 'file' | 'folder';
  path?: string; // Add path property
  children?: FileNode[];
  content?: string;
};

import { Code, Component, FileText, Folder, Image as ImageIcon, Settings, Server } from 'lucide-react';
import React from 'react';

export const projects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Frontend',
    framework: 'Next.js',
    lastUpdated: '2 hours ago',
    status: 'online',
    icon: Component
  },
  {
    id: '2',
    name: 'API Gateway',
    framework: 'Node.js',
    lastUpdated: '5 hours ago',
    status: 'online',
    icon: Server
  },
  {
    id: '3',
    name: 'Portfolio Website',
    framework: 'React',
    lastUpdated: '1 day ago',
    status: 'offline',
    icon: Component
  },
  {
    id: '4',
    name: 'Blog Backend',
    framework: 'Node.js',
    lastUpdated: '3 days ago',
    status: 'error',
    icon: Server
  },
  {
    id: '5',
    name: 'SaaS Dashboard',
    framework: 'Next.js',
    lastUpdated: '1 week ago',
    status: 'online',
    icon: Component
  },
];

export const templates: Template[] = [
  {
    id: 'nextjs-template',
    name: 'Next.js',
    description: 'A React framework for production.',
    imageId: 'nextjs_template_logo',
  },
  {
    id: 'react-template',
    name: 'React',
    description: 'A JavaScript library for building user interfaces.',
    imageId: 'react_template_logo',
  },
  {
    id: 'node-template',
    name: 'Node.js',
    description: 'A JavaScript runtime built on Chrome\'s V8 engine.',
    imageId: 'node_template_logo',
  },
  {
    id: 'vite-template',
    name: 'Vite + React',
    description: 'Next-generation frontend tooling. It\'s fast!',
    imageId: 'vite_template_logo',
  },
];

export const fileTree: FileNode[] = [
  {
    name: 'app',
    type: 'folder',
    children: [
      { name: 'page.tsx', type: 'file', content: 'export default function Home() { return <h1>Hello World</h1> }' },
      { name: 'layout.tsx', type: 'file', content: 'export default function RootLayout({ children }) { return <html><body>{children}</body></html> }' },
    ],
  },
  {
    name: 'components',
    type: 'folder',
    children: [
      { name: 'button.tsx', type: 'file', content: 'export function Button() { return <button>Click me</button> }' },
    ]
  },
  {
    name: 'public',
    type: 'folder',
    children: [
      { name: 'favicon.ico', type: 'file' },
    ]
  },
  { name: 'package.json', type: 'file', content: '{ "name": "my-app", "version": "0.1.0" }' },
  { name: 'tailwind.config.ts', type: 'file', content: '/** @type {import(\'tailwindcss\').Config} */\nmodule.exports = { content: [], theme: { extend: {} }, plugins: [] }' },
];

export const sampleCode = `import React from 'react';
import { Button } from '@/components/ui/button';

function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
      <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Build & Deploy Faster Than Ever
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
        CodeSail is an integrated development environment that brings your ideas to life with the power of AI.
      </p>
      <div className="flex gap-4">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">
          View Projects
        </Button>
      </div>
    </div>
  );
}

export default HeroSection;
`;
