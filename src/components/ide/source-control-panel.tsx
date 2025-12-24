"use client"

import { GitCommit, GitPullRequest, MoreHorizontal, RefreshCw, Check, FileDiff } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";

const stagedChanges = [
    { id: '1', file: 'src/components/ide-layout.tsx' },
    { id: '2', file: 'src/app/page.tsx' },
];

const changes = [
    { id: '3', file: 'tailwind.config.ts' },
]

export default function SourceControlPanel() {
    const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
    
    const handleSelectAll = (isChecked: boolean | 'indeterminate') => {
        if(isChecked === true) {
            setSelectedChanges([...stagedChanges.map(c => c.id), ...changes.map(c => c.id)])
        } else {
            setSelectedChanges([]);
        }
    }
    
    const allSelected = selectedChanges.length > 0 && selectedChanges.length === (stagedChanges.length + changes.length)
    const mixedSelected = selectedChanges.length > 0 && selectedChanges.length < (stagedChanges.length + changes.length)


  return (
    <div className="h-full flex flex-col bg-card">
        <CardHeader className="flex-shrink-0 border-b flex-row items-center justify-between p-2">
            <CardTitle className="text-sm font-medium px-2">Source Control</CardTitle>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Check className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <div className="p-2 flex-shrink-0 border-b">
            <Input placeholder="Commit message" />
            <div className="flex gap-2 mt-2">
                <Button className="w-full">
                    <GitCommit className="mr-2 h-4 w-4"/>
                    Commit
                </Button>
                 <Button variant="outline" className="w-full">
                    <GitPullRequest className="mr-2 h-4 w-4"/>
                    Pull Request
                </Button>
            </div>
        </div>
        <ScrollArea className="flex-grow">
            <div className="p-2 text-sm">
                <div className="flex items-center gap-2 mb-2 px-2">
                    <Checkbox id="select-all" 
                        checked={allSelected ? true : mixedSelected ? 'indeterminate' : false}
                        onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="font-medium">Changes</label>
                </div>

                {stagedChanges.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-xs text-muted-foreground px-2 mb-1">Staged Changes</h4>
                        {stagedChanges.map(change => (
                            <div key={change.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                <Checkbox 
                                    id={`change-${change.id}`}
                                    checked={selectedChanges.includes(change.id)}
                                    onCheckedChange={(checked) => {
                                        if(checked) {
                                            setSelectedChanges(prev => [...prev, change.id])
                                        } else {
                                            setSelectedChanges(prev => prev.filter(id => id !== change.id))
                                        }
                                    }}
                                />
                                <FileDiff className="h-4 w-4 text-yellow-500" />
                                <span className="truncate">{change.file}</span>
                            </div>
                        ))}
                    </div>
                )}
                 <div>
                    <h4 className="font-semibold text-xs text-muted-foreground px-2 mb-1">Changes</h4>
                    {changes.map(change => (
                         <div key={change.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                            <Checkbox 
                                id={`change-${change.id}`} 
                                checked={selectedChanges.includes(change.id)}
                                onCheckedChange={(checked) => {
                                    if(checked) {
                                        setSelectedChanges(prev => [...prev, change.id])
                                    } else {
                                        setSelectedChanges(prev => prev.filter(id => id !== change.id))
                                    }
                                }}
                            />
                            <FileDiff className="h-4 w-4 text-blue-500" />
                            <span className="truncate">{change.file}</span>
                        </div>
                    ))}
                </div>
            </div>
        </ScrollArea>
    </div>
  )
}
