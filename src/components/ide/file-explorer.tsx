"use client";

import React, { useState, useRef, useEffect } from 'react';
import { File, Folder, ChevronRight, ChevronDown, FilePlus, FolderPlus, Edit, Trash2 } from 'lucide-react';
import { type FileNode } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const getFileIcon = (fileName: string) => {
  // Add more file type checks here if needed
  return <File className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />;
};

const EditableNode = ({
  initialName,
  onSave,
  onCancel,
  isFolder,
}: {
  initialName: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
  isFolder?: boolean;
}) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(name);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onCancel();
  };

  return (
    <div className="flex items-center py-1.5 pr-1">
        {isFolder ? <Folder className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" /> : getFileIcon(name)}
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-6 px-1 py-0 text-sm"
      />
    </div>
  );
};


const FileTree = ({ 
  node, 
  level, 
  activeFile, 
  onFileClick,
  onRename,
  onDelete,
  onNewFile,
  onNewFolder,
}: { 
  node: FileNode; 
  level: number;
  activeFile: string | null;
  onFileClick: (path: string) => void;
  onRename: (path: string, newName: string) => void;
  onDelete: (path: string) => void;
  onNewFile: (parentPath: string, name: string) => void;
  onNewFolder: (parentPath: string, name: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);

  const { toast } = useToast();

  const handleRename = () => {
    setIsEditing(true);
  };
  
  const handleSaveRename = (newName: string) => {
    if(newName && newName !== node.name) {
      onRename(node.path!, newName);
    }
    setIsEditing(false);
  }

  const handleCreate = (type: 'file' | 'folder') => {
    setIsExpanded(true);
    setIsCreating(type);
  };

  const handleSaveCreate = (newName: string) => {
    if (newName) {
      if (isCreating === 'file') {
        onNewFile(node.path!, newName);
      } else if (isCreating === 'folder') {
        onNewFolder(node.path!, newName);
      }
    }
    setIsCreating(null);
  };


  const paddingLeft = `${level * 16 + 8}px`;

  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(node.path!);
    }
  };
  
  const isActive = activeFile === node.path;

  if (isEditing) {
    return (
        <div style={{ paddingLeft }}>
            <EditableNode
                initialName={node.name}
                onSave={handleSaveRename}
                onCancel={() => setIsEditing(false)}
                isFolder={node.type === 'folder'}
            />
        </div>
    );
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "flex items-center py-1.5 rounded-sm hover:bg-muted cursor-pointer text-sm select-none",
              isActive && "bg-accent",
            )}
            style={{ paddingLeft }}
            onClick={handleToggle}
          >
            {node.type === 'folder' ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
              )
            ) : null}
            {node.type === 'folder' 
              ? <Folder className={cn("h-4 w-4 mr-2 flex-shrink-0", isExpanded ? "text-primary" : "text-muted-foreground")} /> 
              : getFileIcon(node.name)}
            <span>{node.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48" onMouseUp={(e) => e.stopPropagation()}>
          {node.type === 'folder' && (
            <>
              <ContextMenuItem onClick={() => handleCreate('file')}>
                <FilePlus className="mr-2 h-4 w-4" />
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCreate('folder')}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onClick={handleRename}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem className="text-red-500 focus:text-red-500" onClick={() => onDelete(node.path!)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isExpanded && node.children && (
        <div>
          {node.children
            .sort((a,b) => {
              if (a.type === 'folder' && b.type === 'file') return -1;
              if (a.type === 'file' && b.type === 'folder') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
            <FileTree 
              key={child.path} 
              node={child} 
              level={level + 1} 
              activeFile={activeFile}
              onFileClick={onFileClick}
              onRename={onRename}
              onDelete={onDelete}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
            />
          ))}
          {isCreating && (
              <div style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}>
                  <EditableNode 
                      initialName=""
                      onSave={handleSaveCreate}
                      onCancel={() => setIsCreating(null)}
                      isFolder={isCreating === 'folder'}
                  />
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function FileExplorer({ fileTree, activeFile, onFileClick, onRename, onDelete, onNewFile, onNewFolder }: {
    fileTree: FileNode[];
    activeFile: string | null;
    onFileClick: (path: string) => void;
    onRename: (path: string, newName: string) => void;
    onDelete: (path: string) => void;
    onNewFile: (parentPath: string, name: string) => void;
    onNewFolder: (parentPath: string, name: string) => void;
}) {

  return (
    <div className="h-full bg-card p-2 overflow-y-auto">
      <h3 className="text-xs font-bold uppercase text-muted-foreground px-2 pt-1 pb-2 tracking-wider">
        Explorer
      </h3>
      <div className="mt-1 space-y-0.5">
        {fileTree
            .sort((a,b) => {
              if (a.type === 'folder' && b.type === 'file') return -1;
              if (a.type === 'file' && b.type === 'folder') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((node) => (
          <FileTree 
            key={node.path} 
            node={node} 
            level={0}
            activeFile={activeFile}
            onFileClick={onFileClick}
            onRename={onRename}
            onDelete={onDelete}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
          />
        ))}
      </div>
    </div>
  );
}
