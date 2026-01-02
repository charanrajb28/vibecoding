
"use client";

import React, { useCallback } from 'react';
import { X, Terminal, Globe, Save } from 'lucide-react';
import MonacoEditor from './monaco-editor';
import { FileNode } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function EditorPane({ 
  openFiles, 
  activeFile, 
  onClose, 
  onSelect, 
  activeBottomPanel, 
  onBottomPanelChange, 
  isWebViewOpen, 
  onWebViewToggle,
  onSave,
  fileContent,
  onContentChange,
  isDirty,
}: {
  openFiles: string[];
  activeFile: string | null;
  onClose: (path: string) => void;
  onSelect: (path: string) => void;
  activeBottomPanel: 'terminal' | null;
  onBottomPanelChange: (panel: 'terminal') => void;
  isWebViewOpen: boolean;
  onWebViewToggle: () => void;
  onSave: () => void;
  fileContent: string | null;
  onContentChange: (content: string) => void;
  isDirty: boolean;
}) {
  const getFileName = (path: string) => path.split('/').pop() || '';
  const { toast } = useToast();

  const handleSave = () => {
    onSave();
    toast({
      title: "File Saved",
      description: `${getFileName(activeFile!)} has been saved.`,
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-none border-b flex justify-between items-center pr-2">
        <div className="flex items-center overflow-x-auto">
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
              {isDirty && activeFile === path && <div className="h-2 w-2 rounded-full bg-primary" />}
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
        <div className="flex items-center gap-2">
           <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={!activeFile || !isDirty}
              className="h-8 px-2"
           >
             <Save className="h-4 w-4" />
             <span className="ml-2 hidden sm:inline">Save</span>
           </Button>
           <Button 
            variant={activeBottomPanel === 'terminal' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => onBottomPanelChange('terminal')}
            className="h-8 px-2"
          >
              <Terminal className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Terminal</span>
           </Button>
           <Button 
            variant={isWebViewOpen ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={onWebViewToggle}
            className="h-8 px-2"
          >
              <Globe className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">WebView</span>
           </Button>
        </div>
      </div>
      <div className="flex-grow relative">
        {activeFile ? (
            fileContent !== null ? (
                <MonacoEditor 
                    key={activeFile} 
                    code={fileContent}
                    onChange={onContentChange}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Loading file...
                </div>
            )
        ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a file to open
            </div>
        )}
      </div>
    </div>
  );
}
