"use client"

import { File, Search, Bot, Settings, GitFork } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: File, label: 'Files' },
  { icon: GitFork, label: 'Source Control' },
  { icon: Bot, label: 'AI Tools' },
  { icon: Settings, label: 'Settings' },
];

export default function ActivityBar() {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-between p-2 bg-card border-r">
        <nav className="flex flex-col items-center gap-4">
          {navItems.map((item, index) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button variant={index === 0 ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10">
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </div>
    </TooltipProvider>
  );
}
