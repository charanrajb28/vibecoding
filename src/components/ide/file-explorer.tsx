import { File, Folder } from 'lucide-react';
import { fileTree, type FileNode } from '@/lib/placeholder-data';

const FileIcon = ({ node }: { node: FileNode }) => {
  if (node.type === 'folder') {
    return <Folder className="h-4 w-4 mr-2 text-blue-500" />;
  }
  return <File className="h-4 w-4 mr-2 text-gray-500" />;
};

const FileTree = ({ node, level }: { node: FileNode; level: number }) => {
  const paddingLeft = `${level * 16}px`;

  return (
    <div>
      <div
        className="flex items-center p-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
        style={{ paddingLeft }}
      >
        <FileIcon node={node} />
        <span>{node.name}</span>
      </div>
      {node.type === 'folder' && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTree key={child.name} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileExplorer() {
  return (
    <div className="h-full bg-card p-2">
      <h3 className="text-xs font-bold uppercase text-muted-foreground p-2 tracking-wider">Explorer</h3>
      <div className="mt-2">
        {fileTree.map((node) => (
          <FileTree key={node.name} node={node} level={0} />
        ))}
      </div>
    </div>
  );
}
