import DashboardHeader from '@/components/dashboard/dashboard-header';
import ProjectCard from '@/components/dashboard/project-card';
import { projects } from '@/lib/placeholder-data';

export default function DashboardPage() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}