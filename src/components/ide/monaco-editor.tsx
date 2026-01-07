
'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  filePath?: string;
}

function getLanguageFromPath(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'json':
            return 'json';
        case 'css':
            return 'css';
        case 'html':
            return 'html';
        case 'md':
            return 'markdown';
        case 'yaml':
        case 'yml':
            return 'yaml';
        default:
            return 'plaintext';
    }
}

export default function MonacoEditor({ code, onChange, filePath }: MonacoEditorProps) {
  const language = filePath ? getLanguageFromPath(filePath) : 'typescript';

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={onChange}
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
