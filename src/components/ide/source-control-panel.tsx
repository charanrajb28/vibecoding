"use client"

import { GitCommit, GitPullRequest, MoreHorizontal, RefreshCw, Check, FileDiff, GitBranch, History } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "../ui/badge";

const changes = [
    { id: '1', file: 'src/app/page.tsx', status: 'M' },
    { id: '2', file: 'src/components/ui/button.tsx', status: 'M' },
    { id: '3', file: 'tailwind.config.ts', status: 'A' },
];

const commits = [
    { id: '1', message: 'feat: Implement dark mode toggle', author: 'User', time: '3 hours ago' },
    { id: '2', message: 'fix: Resolve layout issue on mobile', author: 'User', time: '1 day ago' },
    { id: '3', message: 'refactor: Simplify component logic', author: 'User', time: '2 days ago' },
    { id: '4', message: 'Initial commit', author: 'User', time: '3 days ago' },
];

export default function SourceControlPanel() {
    return (
        <div className="h-full flex flex-col bg-card text-foreground">
            <CardHeader className="flex-shrink-0 border-b p-3">
                <CardTitle className="text-sm font-semibold tracking-wider">SOURCE CONTROL</CardTitle>
            </CardHeader>

            <div className="p-3 flex-shrink-0 border-b">
                <div className="relative">
                    <Textarea
                        placeholder="Message (Ctrl+Enter to commit on 'main')"
                        className="pr-10 resize-none"
                        rows={3}
                    />
                </div>
                <Button className="w-full mt-2">
                    <GitCommit className="mr-2 h-4 w-4" />
                    Commit to main
                </Button>
                 <div className="text-xs text-center mt-2 text-muted-foreground">
                    No staged changes.
                </div>
            </div>

            <ScrollArea className="flex-grow">
                <Accordion type="multiple" defaultValue={['changes', 'commits']} className="w-full">
                    <AccordionItem value="changes">
                        <AccordionTrigger className="text-xs font-bold uppercase text-muted-foreground px-3 py-2 tracking-wider">
                            <div className="flex items-center">
                                <span>Changes</span>
                                <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center">{changes.length}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0">
                            <div className="text-sm">
                                {changes.map(change => (
                                    <div key={change.id} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted group">
                                        <FileDiff className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                        <span className="truncate flex-grow">{change.file}</span>
                                        <Badge variant="outline" className="text-xs">{change.status}</Badge>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <Button variant="ghost" size="icon" className="h-6 w-6"><RefreshCw className="h-3 w-3"/></Button>
                                             <Button variant="ghost" size="icon" className="h-6 w-6"><Check className="h-3 w-3"/></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="commits">
                        <AccordionTrigger className="text-xs font-bold uppercase text-muted-foreground px-3 py-2 tracking-wider">Commits</AccordionTrigger>
                        <AccordionContent>
                             <div className="text-sm space-y-2">
                                {commits.map(commit => (
                                    <div key={commit.id} className="flex items-start gap-2 px-3 py-1.5 rounded-md hover:bg-muted">
                                        <History className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"/>
                                        <div className="flex-grow">
                                            <p className="truncate">{commit.message}</p>
                                            <p className="text-xs text-muted-foreground">{commit.author} committed {commit.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </ScrollArea>
        </div>
    )
}
