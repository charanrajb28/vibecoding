'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import ProjectCard from '@/components/dashboard/project-card';
import DeleteProjectDialog from '@/components/dashboard/delete-project-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import type { Project } from '@/lib/placeholder-data';
import { useToast } from '@/hooks/use-toast';

function ProjectSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function NoProjects() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border-2 border-dashed border-border">
            <h3 className="text-xl font-semibold">No Projects Yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                It looks like you haven't created any projects. Get started now!
            </p>
            <Link href="/new-project">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Project
                </Button>
            </Link>
        </div>
    )
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const projectsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'projects'), orderBy('createdAt', 'desc'));
  }, [firestore, user?.uid]);

  const { data: projects, isLoading: areProjectsLoading } = useCollection<Project>(projectsQuery);

  const isLoading = isUserLoading || areProjectsLoading;

  const handleOpenDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
  };

  const handleCloseDeleteDialog = () => {
    setProjectToDelete(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete || !user || !firestore) return;

    try {
      const projectRef = doc(firestore, 'users', user.uid, 'projects', projectToDelete.id);
      await deleteDoc(projectRef);
      toast({
        title: 'Project Deleted',
        description: `Your project "${projectToDelete.name}" has been successfully deleted.`,
      });
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return (
    <>
      <DashboardHeader />
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                iconName={project.icon || 'component'}
                onDelete={() => handleOpenDeleteDialog(project)}
              />
            ))}
          </div>
        ) : (
            <NoProjects />
        )}
      </div>
      {projectToDelete && (
        <DeleteProjectDialog
          isOpen={!!projectToDelete}
          onOpenChange={handleCloseDeleteDialog}
          onConfirm={handleDeleteProject}
          projectName={projectToDelete.name}
        />
      )}
    </>
  );
}
