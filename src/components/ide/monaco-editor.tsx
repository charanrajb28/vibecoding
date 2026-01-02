
'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
}

export default function MonacoEditor({ code, onChange }: MonacoEditorProps) {

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      value={code} // Use value instead of defaultValue to make it a controlled component
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
