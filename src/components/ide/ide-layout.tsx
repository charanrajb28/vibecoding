import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import ActivityBar from './activity-bar';
import FileExplorer from './file-explorer';
import EditorPane from './editor-pane';
import TerminalPane from './terminal-pane';
import AiToolsPanel from './ai-tools-panel';

export default function IdeLayout() {
  return (
    <div className="flex h-screen w-screen bg-muted/40 text-foreground overflow-hidden">
      <ActivityBar />
      <ResizablePanelGroup direction="horizontal" className="flex flex-1">
        <ResizablePanel defaultSize={25} minSize={15}>
          <FileExplorer />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75} minSize={25}>
              <EditorPane />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25} minSize={15}>
              <TerminalPane />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
