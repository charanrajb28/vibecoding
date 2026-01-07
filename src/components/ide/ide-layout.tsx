
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
import { type FileNode, type Project } from '@/lib/placeholder-data';
import { useToast } from "@/hooks/use-toast";
import AiToolsPanel from "./ai-tools-panel";
import SourceControlPanel from "./source-control-panel";
import WebView from "./webview-pane";
import { type User } from "firebase/auth";
import { useFileTreeRefresh, triggerFileTreeRefresh } from "@/lib/file-tree-refresh";

export type ActivePanel = 'Files' | 'Source Control' | 'AI Tools';
export type BottomPanel = 'terminal';

export default function IdeLayout({ project, user }: { project: Project, user: User | null }) {
  const { toast } = useToast();
  const [fileTree, setFileTree] = React.useState<FileNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = React.useState(true);
  
  const [openFiles, setOpenFiles] = React.useState<string[]>([]);
  const [activeFile, setActiveFile] = React.useState<string | null>(null);
  
  const [fileContent, setFileContent] = React.useState<string | null>(null);
  const [originalContent, setOriginalContent] = React.useState<string | null>(null);
  const isDirty = fileContent !== originalContent;

  const [activePanel, setActivePanel] = React.useState<ActivePanel>('Files');
  const [activeBottomPanel, setActiveBottomPanel] = React.useState<BottomPanel | null>('terminal');
  const [isWebViewOpen, setIsWebViewOpen] = React.useState(true);

  const fetchFileTree = React.useCallback(async () => {
    if (!user) return;
    setIsLoadingTree(true);
    try {
      const res = await fetch("/api/files/tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, projectId: project.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      const tree = await res.json();
      setFileTree(tree);
    } catch (error: any) {
      toast({ title: "Error fetching file tree", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingTree(false);
    }
  }, [user, project.id, toast]);

  // Subscribe to the global refresh signal
  useFileTreeRefresh(fetchFileTree);

  React.useEffect(() => {
    fetchFileTree();
  }, [fetchFileTree]);

  const handleFileRead = async (filePath: string) => {
    if (!user) return;
    setFileContent(null); // Show loading state
    try {
      const res = await fetch("/api/files/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, filePath }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to read file');
      }
      const { content } = await res.json();
      setFileContent(content);
      setOriginalContent(content);
    } catch (error: any) {
      toast({ title: "Error Reading File", description: error.message, variant: "destructive" });
      setFileContent(`// Error: Could not load file content.\n// ${error.message}`);
      setOriginalContent(null);
    }
  };

  const handleFileWrite = React.useCallback(async (filePath: string, content: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/files/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, filePath, content }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to write file');
      }
      setOriginalContent(content); // Update original content on successful save
      toast({
        title: "File Saved",
        description: `${filePath.split('/').pop()} has been saved.`,
      });
      triggerFileTreeRefresh(); // Trigger refresh on successful write
    } catch (error: any) {
      toast({ title: "Error Saving File", description: error.message, variant: "destructive" });
    }
  }, [user, toast]);

  const handleFileClick = (path: string) => {
    if (isDirty) {
        if (!confirm("You have unsaved changes. Are you sure you want to switch files?")) {
            return;
        }
    }

    if (!openFiles.includes(path)) {
      setOpenFiles(prev => [...prev, path]);
    }
    setActiveFile(path);
    handleFileRead(path);
  };

  const handleFileClose = (path: string) => {
    if (isDirty && activeFile === path) {
       if (!confirm("You have unsaved changes. Are you sure you want to close this file?")) {
            return;
        }
    }
    const newOpenFiles = openFiles.filter(p => p !== path);
    setOpenFiles(newOpenFiles);

    if (activeFile === path) {
      const newActiveFile = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
      setActiveFile(newActiveFile);
      if (newActiveFile) {
        handleFileRead(newActiveFile);
      } else {
        setFileContent(null);
        setOriginalContent(null);
      }
    }
  };
  
  const handleTabSelect = (path: string) => {
    if (isDirty && activeFile !== path) {
       if (!confirm("You have unsaved changes. Are you sure you want to switch files?")) {
            return;
        }
    }
    setActiveFile(path);
    handleFileRead(path);
  }

  const handleFileOperation = async (action: string, path: string, newPath?: string) => {
    if (!user) return;
    try {
        const res = await fetch('/api/files/file-ops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, projectId: project.id, action, path, newPath })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'API call failed');
        
        toast({ title: "Success", description: `Operation ${action} successful.` });
        triggerFileTreeRefresh(); // Refresh after any modification
    } catch (error: any) {
        toast({ title: `Error: ${action}`, description: error.message, variant: 'destructive' });
    }
  };

  const handleRename = (oldPath: string, newName: string) => {
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;
    handleFileOperation('rename', oldPath, newPath);
  };

  const handleDelete = (path: string) => {
    handleFileOperation('delete', path);
  };

  const handleNewFile = (parentPath: string, newName: string) => {
    const newPath = `${parentPath}/${newName}`;
    handleFileOperation('new-file', newPath);
  };

  const handleNewFolder = (parentPath: string, newName: string) => {
    const newPath = `${parentPath}/${newName}`;
    handleFileOperation('new-folder', newPath);
  };
  
  const handleSave = () => {
    if (activeFile && fileContent !== null) {
      handleFileWrite(activeFile, fileContent);
    }
  };

  const handleContentChange = (content: string) => {
    setFileContent(content);
  }

  const handleBottomPanelChange = (panel: BottomPanel) => {
    setActiveBottomPanel(prev => prev === panel ? null : panel);
  };
  
  const handleWebViewToggle = () => {
    setIsWebViewOpen(prev => !prev);
  }
  
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
            isLoading={isLoadingTree}
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

  return (
    <div className="flex h-screen w-screen bg-muted/40 text-foreground overflow-hidden">
      <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
      <ResizablePanelGroup direction="horizontal" className="flex flex-1" id="ide-main-group">
        <ResizablePanel defaultSize={20} minSize={15}>
           {renderActivePanel()}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80} minSize={30}>
          <ResizablePanelGroup direction="horizontal" id="editor-webview-group">
            <ResizablePanel defaultSize={isWebViewOpen ? 60 : 100} minSize={30}>
              <ResizablePanelGroup 
                direction="vertical" 
                id="editor-terminal-group"
              >
                <ResizablePanel defaultSize={activeBottomPanel ? 75: 100} minSize={25}>
                  <EditorPane
                    openFiles={openFiles}
                    activeFile={activeFile}
                    onClose={handleFileClose}
                    onSelect={handleTabSelect}
                    activeBottomPanel={activeBottomPanel}
                    onBottomPanelChange={handleBottomPanelChange}
                    isWebViewOpen={isWebViewOpen}
                    onWebViewToggle={handleWebViewToggle}
                    onSave={handleSave}
                    fileContent={fileContent}
                    onContentChange={handleContentChange}
                    isDirty={isDirty}
                  />
                </ResizablePanel>
                {activeBottomPanel && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={25} minSize={15}>
                      <TerminalPane user={user} project={project} />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
            {isWebViewOpen && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <WebView />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
