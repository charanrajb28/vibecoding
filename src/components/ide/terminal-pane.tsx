
"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type User } from "firebase/auth";
import { type Project } from "@/lib/placeholder-data";
import { Loader2 } from "lucide-react";
import { triggerFileTreeRefresh } from "@/lib/file-tree-refresh";

type Line = {
  id: number;
  type: 'command' | 'output';
  content: string;
  cwd?: string; // Store cwd for each command
};

type TerminalPaneProps = {
  user: User | null;
  project: Project;
};

const Prompt = ({ cwd, project }: { cwd: string | undefined, project: Project }) => (
  <>
    <span className="text-green-400">user@codesail:</span>
    <span className="text-blue-400">{cwd ? cwd.replace(`/workspace/${project.id}`, '~') : '~'}</span>
    <span>$&nbsp;</span>
  </>
);

export default function TerminalPane({ user, project }: TerminalPaneProps) {
  const [lines, setLines] = React.useState<Line[]>([
    { id: 1, type: 'output', content: 'Welcome to the CodeSail terminal!' },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const endOfTerminalRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  
  // This state will track the current working directory.
  const [cwd, setCwd] = React.useState(`/workspace/${project.id}`);

  React.useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, isLoading]);

  const handleCommand = async (command: string) => {
    if (!user) {
      setLines(l => [...l, { id: Date.now()+1, type: "output", content: "Error: User not authenticated." }]);
      return;
    };

    setLines(l => [...l, { id: Date.now(), type: 'command', content: command, cwd: cwd }]);
    setIsLoading(true);
    setHistory(h => [command, ...h]);
    setHistoryIndex(-1);

    try {
        // Special handling for 'cd' to update client-side state
        if (command.trim().startsWith('cd ')) {
            // We'll execute 'cd' and then 'pwd' to get the new directory
            const cdCommand = `${command} && pwd`;
            const res = await fetch("/api/terminal/exec", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.uid, command: cdCommand, cwd }),
            });
            const { output } = await res.json();
            const newCwd = output.split('\n').pop()?.trim();
            if (newCwd && newCwd.startsWith('/workspace')) {
                setCwd(newCwd);
            }
            setLines(l => [...l, { id: Date.now()+1, type: "output", content: output || "" }]);
        } else {
            const res = await fetch("/api/terminal/exec", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.uid, command, cwd }),
            });
            const { output } = await res.json();
            setLines(l => [...l, { id: Date.now()+1, type: "output", content: output || "" }]);
        }
    } catch (error: any) {
        setLines(l => [...l, { id: Date.now()+1, type: "output", content: error.message || "An unknown error occurred." }]);
    } finally {
        setIsLoading(false);
        // If the command could have modified files, trigger a refresh
        const isFsCommand = ['touch', 'mkdir', 'rm', 'mv', 'cp', 'git', 'npm', 'pnpm'].some(c => command.startsWith(c));
        if (isFsCommand) {
            triggerFileTreeRefresh();
        }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && !isLoading) {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0) {
            const newIndex = Math.min(historyIndex + 1, history.length - 1);
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            const newIndex = Math.max(historyIndex - 1, 0);
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
        } else {
             setHistoryIndex(-1);
             setInput("");
        }
    } else if (e.key === 'c' && e.ctrlKey) {
        // Basic Ctrl+C support
        setInput('');
        setLines(l => [...l, { id: Date.now(), type: 'command', content: input }, { id: Date.now() + 1, type: 'output', content: '^C' }]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card text-sm">
      <Tabs defaultValue="terminal" className="flex flex-col h-full">
        <TabsList className="flex-none justify-start rounded-none bg-transparent border-b p-0 m-0">
          <TabsTrigger value="terminal" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Terminal</TabsTrigger>
          <TabsTrigger value="console" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Console</TabsTrigger>
          <TabsTrigger value="problems" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Problems</TabsTrigger>
        </TabsList>
        <TabsContent value="terminal" className="flex-grow p-4 font-code overflow-auto mt-0" onClick={() => inputRef.current?.focus()}>
          <div className="h-full">
            {lines.map(line => (
              <div key={line.id}>
                {line.type === 'command' && (
                  <div className="flex">
                    <Prompt cwd={line.cwd} project={project} />
                    <span>{line.content}</span>
                  </div>
                )}
                {line.type === 'output' && <pre className="text-muted-foreground whitespace-pre-wrap">{line.content}</pre>}
              </div>
            ))}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin my-1" />}
             <div className="flex">
              {!isLoading && <Prompt cwd={cwd} project={project} />}
              <input
                ref={inputRef}
                id="terminal-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-foreground font-code flex-grow"
                autoFocus
                disabled={isLoading}
              />
            </div>
            <div ref={endOfTerminalRef} />
          </div>
        </TabsContent>
        <TabsContent value="console" className="flex-grow p-4 font-code overflow-auto mt-0">
          <p className="text-muted-foreground">[LOG] Component mounted.</p>
        </TabsContent>
        <TabsContent value="problems" className="flex-grow p-4 font-code overflow-auto mt-0">
          <p className="text-muted-foreground">No problems have been detected in the workspace.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
