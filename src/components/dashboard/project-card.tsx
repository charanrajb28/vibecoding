'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, Edit, PlayCircle, Component, Server } from 'lucide-react';
import type { Project } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

type ProjectCardProps = {
  project: Project;
  iconName: string;
};

// A simple map for pod/workspace status, can be expanded later
const statusMap = {
  running: 'online',
  pending: 'offline',
  failed: 'error',
  unknown: 'offline'
} as const;
type Status = keyof typeof statusMap;

const statusClasses = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  error: 'bg-red-500',
};

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'nextjs-template': Component,
  'react-template': Component,
  'node-template': Server,
  'vite-template': Component,
  component: Component,
  server: Server,
};


export default function ProjectCard({ project, iconName }: ProjectCardProps) {
  const Icon = iconMap[project.template] || Component;
  
  // A real implementation would check the k8s pod status
  const currentStatus: Status = 'running'; 
  const displayStatus = statusMap[currentStatus];

  const lastUpdated = project.updatedAt?.toDate
    ? formatDistanceToNow(project.updatedAt.toDate(), { addSuffix: true })
    : 'a while ago';


  return (
    <Card 
        className={cn(
            "h-full flex flex-col transition-all duration-300 ease-in-out hover:scale-105",
            "bg-card text-card-foreground shadow-sm",
            "border hover:border-primary"
        )}
    >
        <CardHeader className="flex flex-row items-start justify-between z-10">
        <div>
            <CardTitle className="text-lg font-semibold">
            <Link href={`/project/${project.id}`} className="hover:underline">
                {project.name}
            </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span>{project.template}</span>
            </CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuItem>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500 focus:text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-grow z-10">
        <div className="flex items-center space-x-2">
            <span
            className={cn('h-2 w-2 rounded-full', statusClasses[displayStatus])}
            aria-label={`Status: ${displayStatus}`}
            />
            <Badge variant={displayStatus === 'error' ? 'destructive' : 'secondary'} className="capitalize">
            {displayStatus}
            </Badge>
        </div>
        </CardContent>
        <CardFooter className="z-10">
        <p className="text-sm text-muted-foreground">Last updated {lastUpdated}</p>
        </CardFooter>
    </Card>
  );
}
