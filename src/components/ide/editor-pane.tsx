"use client";

import React from 'react';
import { X } from 'lucide-react';
import MonacoEditor from './monaco-editor';
import { FileNode } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';


const findNode = (nodes: FileNode[], path: string): FileNode | null => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNode(node.children, path);
      if (found) return found;
    }
  }
  return null;
};


export default function EditorPane({ openFiles, activeFile, fileTree, onClose, onSelect }: {
  openFiles: string[];
  activeFile: string | null;
  fileTree: FileNode[];
  onClose: (path: string) => void;
  onSelect: (path: string) => void;
}) {
  const activeNode = activeFile ? findNode(fileTree, activeFile) : null;
  const editorCode = activeNode?.content || `// File not found or has no content: ${activeFile}`;

  const getFileName = (path: string) => path.split('/').pop() || '';

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-none border-b overflow-x-auto">
        <div className="flex items-center">
          {openFiles.map(path => (
            <div
              key={path}
              onClick={() => onSelect(path)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-r text-sm cursor-pointer whitespace-nowrap",
                activeFile === path ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              <span>{getFileName(path)}</span>
              <X
                className="h-4 w-4 p-0.5 rounded-sm hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(path);
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-grow relative">
        {activeFile ? (
            <MonacoEditor key={activeFile} code={editorCode} />
        ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a file to open
            </div>
        )}
      </div>
    </div>
  );
}
