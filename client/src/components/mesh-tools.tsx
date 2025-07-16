import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Box, 
  Circle, 
  Cylinder, 
  Square, 
  GitBranch, 
  Minimize2, 
  Waves, 
  Play, 
  RotateCw, 
  List 
} from "lucide-react";

interface MeshToolsProps {
  onMeshCreate: (mesh: any) => void;
  onMeshStatsChange: (stats: { vertices: number; faces: number }) => void;
}

export default function MeshTools({ onMeshCreate, onMeshStatsChange }: MeshToolsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMeshMutation = useMutation({
    mutationFn: async (data: { type: string; name: string; parameters?: any }) => {
      const response = await apiRequest('POST', '/api/meshes/create', data);
      return response.json();
    },
    onSuccess: (mesh) => {
      console.log('Mesh created successfully:', mesh);
      queryClient.invalidateQueries({ queryKey: ['/api/meshes'] });
      onMeshCreate(mesh);
      onMeshStatsChange({ vertices: mesh.vertices, faces: mesh.faces });
      toast({
        title: "Success",
        description: `Created ${mesh.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create mesh",
        variant: "destructive",
      });
    },
  });

  const handleCreateMesh = (type: string) => {
    const name = `${type}_${Date.now()}`;
    createMeshMutation.mutate({ type, name });
  };

  const meshOperations = [
    { id: 'subdivision', icon: GitBranch, label: 'Subdivision' },
    { id: 'decimation', icon: Minimize2, label: 'Decimation' },
    { id: 'smoothing', icon: Waves, label: 'Smoothing' },
  ];

  return (
    <div className="p-4 border-b border-slate-200">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Mesh Tools</h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-600 mb-3">Create Mesh</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleCreateMesh('cube')}
            disabled={createMeshMutation.isPending}
            className="p-3 h-auto flex flex-col items-center justify-center bg-slate-100 hover:bg-slate-200 transition-all duration-200"
          >
            <Box className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs font-medium">Box</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleCreateMesh('sphere')}
            disabled={createMeshMutation.isPending}
            className="p-3 h-auto flex flex-col items-center justify-center bg-slate-100 hover:bg-slate-200 transition-all duration-200"
          >
            <Circle className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs font-medium">Sphere</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleCreateMesh('cylinder')}
            disabled={createMeshMutation.isPending}
            className="p-3 h-auto flex flex-col items-center justify-center bg-slate-100 hover:bg-slate-200 transition-all duration-200"
          >
            <Cylinder className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs font-medium">Cylinder</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleCreateMesh('plane')}
            disabled={createMeshMutation.isPending}
            className="p-3 h-auto flex flex-col items-center justify-center bg-slate-100 hover:bg-slate-200 transition-all duration-200"
          >
            <Square className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs font-medium">Plane</span>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-600 mb-3">Operations</h3>
        <div className="space-y-2">
          {meshOperations.map((op) => (
            <Button
              key={op.id}
              variant="outline"
              className="w-full justify-start bg-slate-100 hover:bg-slate-200 transition-colors text-left text-sm"
            >
              <op.icon className="w-4 h-4 mr-2 text-primary" />
              {op.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-3">Macro System</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start bg-red-50 border-red-200 hover:bg-red-100 transition-colors text-left text-sm text-red-700"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Record Macro
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start bg-slate-100 hover:bg-slate-200 transition-colors text-left text-sm"
          >
            <Play className="w-4 h-4 mr-2 text-primary" />
            Play Macro
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start bg-slate-100 hover:bg-slate-200 transition-colors text-left text-sm"
          >
            <List className="w-4 h-4 mr-2 text-primary" />
            Macro Library
          </Button>
        </div>
      </div>
    </div>
  );
}
