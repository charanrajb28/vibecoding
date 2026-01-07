
"use client"

import { File, GitFork, Bot, Settings, LayoutDashboard } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { type ActivePanel } from './ide-layout';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const panelItems: { icon: React.ElementType; label: ActivePanel }[] = [
  { icon: File, label: 'Files' },
  { icon: GitFork, label: 'Source Control' },
  { icon: Bot, label: 'AI Tools' },
];

export default function ActivityBar({ activePanel, setActivePanel }: { activePanel: ActivePanel, setActivePanel: (panel: ActivePanel) => void }) {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-between p-2 bg-card border-r">
        <nav className="flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <LayoutDashboard className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>
            
            <Separator className="my-2" />

          {panelItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button 
                  variant={activePanel === item.label ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => setActivePanel(item.label)}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="flex flex-col items-center gap-4">
           <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
        </nav>
      </div>
    </TooltipProvider>
  );
}
