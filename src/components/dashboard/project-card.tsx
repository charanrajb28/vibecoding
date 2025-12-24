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
import { MoreVertical, Trash2, Edit, PlayCircle } from 'lucide-react';
import type { Project } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';

type ProjectCardProps = {
  project: Project;
};

const statusClasses = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  error: 'bg-red-500',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const Icon = project.icon;

  return (
    <Card className="transition-all duration-300 ease-in hover:shadow-xl hover:-translate-y-1 h-full flex flex-col border border-transparent hover:border-primary">
        <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle className="text-lg font-semibold">
            <Link href={`/project/${project.id}`} className="hover:underline">
                {project.name}
            </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span>{project.framework}</span>
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
        <CardContent className="flex-grow">
        <div className="flex items-center space-x-2">
            <span
            className={cn('h-2 w-2 rounded-full', statusClasses[project.status])}
            aria-label={`Status: ${project.status}`}
            />
            <Badge variant={project.status === 'error' ? 'destructive' : 'secondary'} className="capitalize">
            {project.status}
            </Badge>
        </div>
        </CardContent>
        <CardFooter>
        <p className="text-sm text-muted-foreground">Last updated {project.lastUpdated}</p>
        </CardFooter>
    </Card>
  );
}