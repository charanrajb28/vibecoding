import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
      <div className="flex w-full sm:w-auto items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-8 w-full" />
        </div>
        <Link href="/new-project">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>
    </div>
  );
}
