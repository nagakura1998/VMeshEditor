import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Box, 
  FolderOpen, 
  Save, 
  MessageCircle, 
  File, 
  Edit, 
  Eye, 
  Settings 
} from "lucide-react";

interface TopMenuProps {
  onToggleChat: () => void;
}

export default function TopMenu({ onToggleChat }: TopMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMeshMutation = useMutation({
    mutationFn: async (file: File) => {
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64Data = btoa(e.target?.result as string);
            const fileType = file.name.split('.').pop()?.toLowerCase();
            
            const response = await apiRequest('POST', '/api/meshes', {
              fileName: file.name,
              fileType: fileType,
              fileSize: file.size,
              data: base64Data,
            });
            
            const result = await response.json();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meshes'] });
      toast({
        title: "Success",
        description: "Mesh uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload mesh file",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMeshMutation.mutate(file);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <Box className="text-2xl text-primary" />
          <h1 className="text-xl font-bold text-slate-800">MeshLab Pro</h1>
        </div>
        
        <nav className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-600 hover:text-primary"
          >
            <File className="w-4 h-4 mr-1" />
            File
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-600 hover:text-primary"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-600 hover:text-primary"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-600 hover:text-primary"
          >
            <Settings className="w-4 h-4 mr-1" />
            Tools
          </Button>
        </nav>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary hover:bg-blue-700"
          disabled={uploadMeshMutation.isPending}
        >
          <FolderOpen className="w-4 h-4 mr-1" />
          Open Mesh
        </Button>
        
        <Button variant="outline" className="bg-accent hover:bg-emerald-600 text-white">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onToggleChat}
          className="bg-slate-200 text-slate-700 hover:bg-slate-300"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Chat
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept=".obj,.stl,.ply"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </header>
  );
}
