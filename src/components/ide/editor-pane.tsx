import { X } from 'lucide-react';
import { sampleCode } from '@/lib/placeholder-data';
import MonacoEditor from './monaco-editor';

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
        <MonacoEditor code={sampleCode} />
      </div>
    </div>
  );
}
