'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  code: string;
}

export default function MonacoEditor({ code }: MonacoEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    // In a real app, you would handle code changes here
    // e.g., setState, save to file, etc.
    console.log('Editor content:', value);
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      defaultValue={code}
      theme="vs-dark"
      onChange={handleEditorChange}
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
