"use client";

import { useState } from 'react';
import { File, Folder, ChevronRight, ChevronDown, FilePlus, FolderPlus, Edit, Trash2 } from 'lucide-react';
import { fileTree, type FileNode } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

const FileIcon = ({ node, isExpanded }: { node: FileNode; isExpanded?: boolean }) => {
  if (node.type === 'folder') {
    return isExpanded ? (
      <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
    ) : (
      <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
    );
  }
  return <File className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />;
};

const FileTree = ({ 
  node, 
  level, 
  activeFile, 
  onFileClick 
}: { 
  node: FileNode; 
  level: number;
  activeFile: string | null;
  onFileClick: (name: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const paddingLeft = `${level * 16 + 8}px`;

  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(node.name);
    }
  };
  
  const isActive = activeFile === node.name;

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "flex items-center py-1.5 rounded-sm hover:bg-muted cursor-pointer text-sm select-none",
              isActive && "bg-muted",
            )}
            style={{ paddingLeft }}
            onClick={handleToggle}
          >
            <FileIcon node={node} isExpanded={isExpanded} />
            <span>{node.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem>
            <FilePlus className="mr-2 h-4 w-4" />
            New File
          </ContextMenuItem>
          <ContextMenuItem>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem className="text-red-500 focus:text-red-500">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTree 
              key={child.name} 
              node={child} 
              level={level + 1} 
              activeFile={activeFile}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileExplorer() {
  const [activeFile, setActiveFile] = useState<string | null>('page.tsx');

  return (
    <div className="h-full bg-card p-2 overflow-y-auto">
      <h3 className="text-xs font-bold uppercase text-muted-foreground px-2 pt-1 pb-2 tracking-wider">
        Explorer
      </h3>
      <div className="mt-1 space-y-0.5">
        {fileTree.map((node) => (
          <FileTree 
            key={node.name} 
            node={node} 
            level={0}
            activeFile={activeFile}
            onFileClick={setActiveFile}
          />
        ))}
      </div>
    </div>
  );
}
