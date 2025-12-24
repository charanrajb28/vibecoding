"use client";

import * as React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import ActivityBar from './activity-bar';
import FileExplorer from './file-explorer';
import EditorPane from './editor-pane';
import TerminalPane from './terminal-pane';
import { fileTree as initialFileTree, type FileNode } from '@/lib/placeholder-data';
import { useToast } from "@/hooks/use-toast";
import AiToolsPanel from "./ai-tools-panel";
import SourceControlPanel from "./source-control-panel";
import WebView from "./webview-pane";

// Helper to find a node in the tree
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

// Helper to recursively get all child file paths
const getAllChildFilePaths = (node: FileNode): string[] => {
    if (node.type === 'file') {
        return [node.path!];
    }
    if (node.children) {
        return node.children.flatMap(getAllChildFilePaths);
    }
    return [];
}


const addPathsToTree = (nodes: FileNode[], parentPath = ''): FileNode[] => {
  return nodes.map(node => {
    // For root level, path should not start with /
    const path = parentPath ? `${parentPath}/${node.name}` : `${node.name}`;
    const newNode = { ...node, path };
    if (newNode.children) {
      newNode.children = addPathsToTree(newNode.children, path);
    }
    return newNode;
  });
};

// Helper to delete a node from the tree
const deleteNode = (nodes: FileNode[], path: string): FileNode[] => {
    return nodes.filter(node => node.path !== path).map(node => {
        if (node.children) {
            return { ...node, children: deleteNode(node.children, path) };
        }
        return node;
    });
};


// Helper to add a node to the tree
const addNode = (nodes: FileNode[], parentPath: string, newNode: FileNode): FileNode[] => {
    return nodes.map(node => {
        if (node.path === parentPath) {
            // Check if children array exists, if not create it
            const children = node.children ? [...node.children, newNode] : [newNode];
            return { ...node, children: children };
        }
        if (node.children) {
            return { ...node, children: addNode(node.children, parentPath, newNode) };
        }
        return node;
    });
};

export type ActivePanel = 'Files' | 'Source Control' | 'AI Tools';
export type BottomPanel = 'terminal' | 'webview';


export default function IdeLayout() {
  const { toast } = useToast();
  const [fileTree, setFileTree] = React.useState<FileNode[]>(() => addPathsToTree(initialFileTree));
  const [openFiles, setOpenFiles] = React.useState<string[]>(['app/page.tsx']);
  const [activeFile, setActiveFile] = React.useState<string | null>('app/page.tsx');
  const [activePanel, setActivePanel] = React.useState<ActivePanel>('Files');
  const [activeBottomPanel, setActiveBottomPanel] = React.useState<BottomPanel | null>('terminal');
  const [bottomPanelSizes, setBottomPanelSizes] = React.useState([75, 25]);

  const handleBottomPanelChange = (panel: BottomPanel) => {
    if (activeBottomPanel === panel) {
      setActiveBottomPanel(null);
    } else {
      setActiveBottomPanel(panel);
    }
  };

  const handleFileClick = (path: string) => {
    const node = findNode(fileTree, path);
    if (node && node.type === 'file') {
      if (!openFiles.includes(path)) {
        setOpenFiles(prev => [...prev, path]);
      }
      setActiveFile(path);
    }
  };

  const handleFileClose = (path: string) => {
    setOpenFiles(prev => prev.filter(p => p !== path));
    if (activeFile === path) {
      const remainingFiles = openFiles.filter(p => p !== path);
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
    }
  };
  
  const handleTabSelect = (path: string) => {
    setActiveFile(path);
  }

  const handleRename = (oldPath: string, newName: string) => {
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;

    if (findNode(fileTree, newPath)) {
        toast({ title: "Error", description: "A file or folder with that name already exists.", variant: "destructive" });
        return;
    }
    
    setFileTree(prevTree => {
        const nodeToRename = findNode(prevTree, oldPath);
        if (!nodeToRename) return prevTree;

        // Recursively update paths for children
        const updateChildrenPaths = (nodes: FileNode[], oldParentPath: string, newParentPath: string): FileNode[] => {
            return nodes.map(node => {
                const updatedPath = node.path!.replace(oldParentPath, newParentPath);
                const updatedNode = { ...node, path: updatedPath };
                if (updatedNode.children) {
                    updatedNode.children = updateChildrenPaths(updatedNode.children, oldParentPath, newParentPath);
                }
                return updatedNode;
            });
        };

        const tempTree = deleteNode(prevTree, oldPath);
        
        const renamedNode: FileNode = { ...nodeToRename, name: newName, path: newPath };
        if (renamedNode.children) {
            renamedNode.children = updateChildrenPaths(renamedNode.children, oldPath, newPath);
        }
        
        if (!parentPath) {
          return [...tempTree, renamedNode];
        }

        const finalTree = addNode(tempTree, parentPath, renamedNode);
        return finalTree;
    });

    // Update open files and active file
    setOpenFiles(prev => prev.map(p => p.startsWith(oldPath) ? p.replace(oldPath, newPath) : p));
    if (activeFile?.startsWith(oldPath)) {
        setActiveFile(prev => prev!.replace(oldPath, newPath));
    }

    toast({ title: "Renamed", description: `Renamed to ${newName}` });
  };

  const handleDelete = (path: string) => {
    const nodeToDelete = findNode(fileTree, path);
    if (!nodeToDelete) return;

    let pathsToDelete: string[] = [path];
    if (nodeToDelete.type === 'folder') {
        pathsToDelete = [path, ...getAllChildFilePaths(nodeToDelete)];
    }
    
    // Close tabs for deleted files
    const remainingOpenFiles = openFiles.filter(p => !pathsToDelete.includes(p));
    setOpenFiles(remainingOpenFiles);

    // Update active file if it was deleted
    if (activeFile && pathsToDelete.includes(activeFile)) {
        setActiveFile(remainingOpenFiles.length > 0 ? remainingOpenFiles[remainingOpenFiles.length - 1] : null);
    }

    setFileTree(prevTree => deleteNode(prevTree, path));
    toast({ title: "Deleted", description: `Deleted ${nodeToDelete.name}` });
  };

  const handleNewFile = (parentPath: string, newName: string) => {
    const newPath = parentPath ? `${parentPath}/${newName}`: newName;
    if (findNode(fileTree, newPath)) {
      toast({ title: "Error", description: "A file with that name already exists.", variant: "destructive" });
      return;
    }
    const newNode: FileNode = { name: newName, type: 'file', path: newPath, content: '' };
    
    if (!parentPath) {
      setFileTree(prevTree => [...prevTree, newNode]);
    } else {
      setFileTree(prevTree => addNode(prevTree, parentPath, newNode));
    }
    handleFileClick(newPath); // Open the new file
    toast({ title: "Created", description: `Created file ${newName}` });
  };

  const handleNewFolder = (parentPath: string, newName:string) => {
    const newPath = parentPath ? `${parentPath}/${newName}`: newName;
    if (findNode(fileTree, newPath)) {
        toast({ title: "Error", description: "A folder with that name already exists.", variant: "destructive" });
        return;
    }
    const newNode: FileNode = { name: newName, type: 'folder', path: newPath, children: [] };
    
    if(!parentPath) {
       setFileTree(prevTree => [...prevTree, newNode]);
    } else {
       setFileTree(prevTree => addNode(prevTree, parentPath, newNode));
    }
    
    toast({ title: "Created", description: `Created folder ${newName}` });
  };
  
  const renderActivePanel = () => {
    switch (activePanel) {
      case 'Files':
        return (
          <FileExplorer
            fileTree={fileTree}
            activeFile={activeFile}
            onFileClick={handleFileClick}
            onRename={handleRename}
            onDelete={handleDelete}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
          />
        );
      case 'Source Control':
        return <SourceControlPanel />;
      case 'AI Tools':
        return <AiToolsPanel />;
      default:
        return null;
    }
  };

  const renderBottomPanel = () => {
    if (!activeBottomPanel) return null;
    switch (activeBottomPanel) {
      case 'terminal':
        return <TerminalPane />;
      case 'webview':
        return <WebView />;
      default:
        return null;
    }
  }


  return (
    <div className="flex h-screen w-screen bg-muted/40 text-foreground overflow-hidden">
      <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
      <ResizablePanelGroup direction="horizontal" className="flex flex-1" storageId="ide-main-layout">
        <ResizablePanel defaultSize={20} minSize={15}>
           {renderActivePanel()}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80} minSize={30}>
          <ResizablePanelGroup 
            direction="vertical" 
            storageId="ide-editor-terminal-layout"
            onLayout={setBottomPanelSizes}
          >
            <ResizablePanel defaultSize={bottomPanelSizes[0]} minSize={25}>
              <EditorPane
                openFiles={openFiles}
                activeFile={activeFile}
                fileTree={fileTree}
                onClose={handleFileClose}
                onSelect={handleTabSelect}
                activeBottomPanel={activeBottomPanel}
                onBottomPanelChange={handleBottomPanelChange}
              />
            </ResizablePanel>
            {activeBottomPanel && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={bottomPanelSizes[1]} minSize={15}>
                  {renderBottomPanel()}
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
