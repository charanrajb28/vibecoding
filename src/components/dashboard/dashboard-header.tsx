import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-8" />
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
