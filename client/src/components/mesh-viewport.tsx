import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  RotateCw, 
  Move, 
  ZoomIn, 
  Grip, 
  Box, 
  Palette, 
  Home, 
  Maximize 
} from "lucide-react";
import * as THREE from "three";

interface MeshViewportProps {
  mesh: any;
  onMeshStatsChange: (stats: { vertices: number; faces: number }) => void;
}

function ThreeScene({ meshData }: { meshData: any }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current || !meshData) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clear container and add renderer
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create geometry based on mesh type
    let geometry: THREE.BufferGeometry;
    const meshType = meshData.fileName.split('.')[0];
    
    switch (meshType) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(2, 2);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    // Material
    const material = new THREE.MeshPhongMaterial({
      color: 0x4f46e5,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    // Animation loop
    let autoRotate = true;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (autoRotate) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Mouse controls
    let mouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
      mouseDown = true;
      autoRotate = false;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      mouseDown = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseDown) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      mesh.rotation.y += deltaMove.x * 0.01;
      mesh.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * 0.01;
      camera.position.multiplyScalar(1 + delta * 0.1);
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('wheel', handleWheel);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('wheel', handleWheel);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [meshData]);

  return <div ref={mountRef} className="w-full h-full rounded-lg overflow-hidden" />;
}

function MeshPreview({ meshData }: { meshData: any }) {
  if (!meshData) {
    return (
      <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Box className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-sm text-slate-600">No mesh loaded</p>
          <p className="text-xs text-slate-400 mt-2">Create a mesh or upload a file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ThreeScene meshData={meshData} />
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">{meshData.name}</h3>
        <div className="text-xs text-slate-600 space-y-1">
          <p>Vertices: {meshData.vertices}</p>
          <p>Faces: {meshData.faces}</p>
        </div>
      </div>
    </div>
  );
}

export default function MeshViewport({ mesh, onMeshStatsChange }: MeshViewportProps) {
  const [renderMode, setRenderMode] = useState("Solid");
  const [fps, setFps] = useState(60);

  useEffect(() => {
    console.log('MeshViewport received mesh:', mesh);
    if (mesh) {
      onMeshStatsChange({ vertices: mesh.vertices, faces: mesh.faces });
    }
  }, [mesh, onMeshStatsChange]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" title="Rotate">
              <RotateCw className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="sm" title="Pan">
              <Move className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="sm" title="Zoom">
              <ZoomIn className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
          
          <div className="h-4 w-px bg-slate-300" />
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" title="Wireframe">
              <Grip className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="sm" title="Solid">
              <Box className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="sm" title="Shaded">
              <Palette className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-slate-500">
          <span>{renderMode}</span> | <span>{fps} FPS</span>
        </div>
      </div>

      <div className="flex-1 mesh-viewport relative overflow-hidden p-8">
        <MeshPreview meshData={mesh} />

        <div className="absolute top-4 left-4 w-16 h-16 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
          <div className="relative">
            <div className="absolute w-6 h-0.5 bg-red-500 origin-left" />
            <div className="absolute w-0.5 h-6 bg-green-500 origin-top" />
            <div className="absolute w-4 h-0.5 bg-blue-500 origin-left transform rotate-45" />
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 bg-black bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30"
          >
            <Home className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 bg-black bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>


      </div>
    </div>
  );
}
