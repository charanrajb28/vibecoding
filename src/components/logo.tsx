import { Sailboat } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-xl font-bold text-primary', className)}>
      <Sailboat className="h-6 w-6" />
      <h1 className="font-headline">CodeSail</h1>
    </div>
  );
}
