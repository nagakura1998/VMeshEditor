import { Info, Layers, Grid3x3, Clock, Cpu } from "lucide-react";

interface StatusBarProps {
  meshStats: {
    vertices: number;
    faces: number;
  };
}

export default function StatusBar({ meshStats }: StatusBarProps) {
  return (
    <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-sm text-slate-600">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-primary" />
          <span>Ready</span>
        </div>
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4" />
          <span>Vertices: {meshStats.vertices}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Grid3x3 className="w-4 h-4" />
          <span>Faces: {meshStats.faces}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4" />
          <span>Memory: 45MB</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>0.16ms</span>
        </div>
      </div>
    </div>
  );
}
