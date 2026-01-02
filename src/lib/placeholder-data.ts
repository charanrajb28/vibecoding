
import { Timestamp } from "firebase/firestore";

export type Project = {
  id: string;
  name: string;
  description?: string;
  template: string;
  gitRepoUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  // This is a client-side addition for UI purposes and not in the DB schema
  icon?: string; 
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
