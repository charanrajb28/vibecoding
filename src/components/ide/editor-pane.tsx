import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { sampleCode } from '@/lib/placeholder-data';

export default function EditorPane() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-none border-b">
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-4 py-2 border-r bg-muted text-sm">
            <span>page.tsx</span>
            <X className="h-3 w-3 cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="flex-grow relative">
        <Textarea
          defaultValue={sampleCode}
          className="absolute inset-0 w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-code bg-transparent"
        />
      </div>
    </div>
  );
}
