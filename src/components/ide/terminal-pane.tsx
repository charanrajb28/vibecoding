import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TerminalPane() {
  return (
    <div className="h-full flex flex-col bg-card text-sm">
      <Tabs defaultValue="terminal" className="flex flex-col h-full">
        <TabsList className="flex-none justify-start rounded-none bg-transparent border-b p-0 m-0">
          <TabsTrigger value="terminal" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Terminal</TabsTrigger>
          <TabsTrigger value="console" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Console</TabsTrigger>
          <TabsTrigger value="problems" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Problems</TabsTrigger>
        </TabsList>
        <TabsContent value="terminal" className="flex-grow p-4 font-code overflow-auto mt-0">
          <div>
            <span className="text-green-400">user@codesail:</span>
            <span className="text-blue-400">~/my-project</span>
            <span>$ npm install</span>
          </div>
          <div className="text-muted-foreground">
            <p>up to date, audited 8 packages in 592ms</p>
            <p>2 packages are looking for funding</p>
            <p>  run `npm fund` for details</p>
            <p>found 0 vulnerabilities</p>
          </div>
          <div className="flex">
            <span className="text-green-400">user@codesail:</span>
            <span className="text-blue-400">~/my-project</span>
            <span>$ </span>
            <span className="bg-primary-foreground w-2 h-4 animate-pulse ml-1"></span>
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
