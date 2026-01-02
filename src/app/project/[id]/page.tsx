
'use client';

import IdeLayout from "@/components/ide/ide-layout";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/lib/placeholder-data";

function ProjectPageSkeleton() {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
}

export default function ProjectPage() {
    const { id: projectId } = useParams();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const projectDocRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid || !projectId) return null;
        return doc(firestore, 'users', user.uid, 'projects', projectId as string);
    }, [firestore, user?.uid, projectId]);

    const { data: project, isLoading: isProjectLoading } = useDoc<Project>(projectDocRef);

    const isLoading = isUserLoading || isProjectLoading;

    if (isLoading) {
        return <ProjectPageSkeleton />;
    }

    if (!project) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-destructive">
                Project not found or you do not have permission to access it.
            </div>
        );
    }

    return (
        <IdeLayout project={project} user={user} />
    );
}
