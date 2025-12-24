import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import ActivityBar from "./activity-bar"
import FileExplorer from "./file-explorer"
import EditorPane from "./editor-pane"
import TerminalPane from "./terminal-pane"
import AiToolsPanel from "./ai-tools-panel"

export default function IdeLayout() {
  return (
    <div className="flex h-screen w-screen bg-muted/40 text-foreground">
      <ActivityBar />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={15} minSize={10}>
          <FileExplorer />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={55} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={20}>
              <EditorPane />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={30} minSize={10}>
              <TerminalPane />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30} minSize={20}>
          <AiToolsPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
