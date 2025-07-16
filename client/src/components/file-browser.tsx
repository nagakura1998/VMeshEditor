import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Folder, FileCode } from "lucide-react";
import { type Mesh } from "@shared/schema";

interface FileBrowserProps {
  onMeshSelect: (mesh: Mesh) => void;
}

export default function FileBrowser({ onMeshSelect }: FileBrowserProps) {
  const { data: meshes = [], isLoading } = useQuery<Mesh[]>({
    queryKey: ['/api/meshes'],
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-slate-600 mb-3">File Browser</h3>
      
      <div className="space-y-1">
        <div className="flex items-center p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
          <Folder className="w-4 h-4 text-amber-500 mr-2" />
          <span className="text-sm">Projects</span>
        </div>
        
        <div className="flex items-center p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
          <Folder className="w-4 h-4 text-amber-500 mr-2" />
          <span className="text-sm">Recent Files</span>
        </div>
        
        {isLoading ? (
          <div className="text-sm text-slate-500 px-2 py-4">Loading files...</div>
        ) : meshes.length === 0 ? (
          <div className="text-sm text-slate-500 px-2 py-4">No mesh files found</div>
        ) : (
          meshes.map((mesh) => (
            <Button
              key={mesh.id}
              variant="ghost"
              onClick={() => onMeshSelect(mesh)}
              className="w-full justify-start p-2 h-auto ml-4"
            >
              <FileCode className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm flex-1 text-left">{mesh.fileName}</span>
              <span className="text-xs text-slate-500 ml-auto">
                {formatFileSize(mesh.fileSize)}
              </span>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
