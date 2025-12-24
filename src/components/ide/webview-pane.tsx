"use client";

import { Globe, RefreshCw, ArrowLeft, ArrowRight, Home, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';

export default function WebView() {
  const [url, setUrl] = React.useState('http://localhost:9002');
  const [iframeSrc, setIframeSrc] = React.useState(url);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIframeSrc(url);
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };
  
  const goBack = () => iframeRef.current?.contentWindow?.history.back();
  const goForward = () => iframeRef.current?.contentWindow?.history.forward();
  const goHome = () => setIframeSrc('http://localhost:9002');
  
  const openInNewTab = () => {
    window.open(iframeSrc, '_blank');
  };


  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex-none border-b p-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}><ArrowLeft className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goForward}><ArrowRight className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goHome}><Home className="h-4 w-4" /></Button>
        <div className="relative flex-grow">
          <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-8 h-9" 
            value={url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-grow bg-white">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full border-0"
          title="WebView"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
