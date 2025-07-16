import { useState } from "react";
import TopMenu from "@/components/top-menu";
import MeshTools from "@/components/mesh-tools";
import FileBrowser from "@/components/file-browser";
import MeshViewport from "@/components/mesh-viewport";
import ChatPanel from "@/components/chat-panel";
import StatusBar from "@/components/status-bar";

import { type Mesh } from "@shared/schema";

export default function MeshEditor() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentMesh, setCurrentMesh] = useState<Mesh | null>(null);
  const [meshStats, setMeshStats] = useState({ vertices: 0, faces: 0 });

  const handleMeshCreate = (mesh: Mesh) => {
    console.log('Setting current mesh:', mesh);
    setCurrentMesh(mesh);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <TopMenu 
        onToggleChat={() => setIsChatOpen(!isChatOpen)} 
        onMeshUpload={setCurrentMesh} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <MeshTools 
            onMeshCreate={handleMeshCreate}
            onMeshStatsChange={setMeshStats}
          />
          <FileBrowser onMeshSelect={setCurrentMesh} />
        </div>
        
        <div className="flex-1 flex flex-col">
          <MeshViewport 
            mesh={currentMesh}
            onMeshStatsChange={setMeshStats}
          />
          <StatusBar meshStats={meshStats} />
        </div>
      </div>
      
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
