import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeshSchema, insertChatMessageSchema, insertMacroSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Mesh routes
  app.get("/api/meshes", async (req, res) => {
    try {
      const meshes = await storage.getMeshes();
      res.json(meshes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meshes" });
    }
  });

  app.post("/api/meshes", async (req, res) => {
    try {
      const { fileName, fileType, fileSize, data } = req.body;
      
      if (!fileName || !fileType || !data) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!['obj', 'stl', 'ply'].includes(fileType.toLowerCase())) {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      const meshData = {
        name: fileName,
        fileName: fileName,
        fileType: fileType.toLowerCase(),
        fileSize: fileSize || data.length,
        vertices: 0, // TODO: Parse actual vertex count
        faces: 0, // TODO: Parse actual face count
        data: data,
      };

      const validatedData = insertMeshSchema.parse(meshData);
      const mesh = await storage.createMesh(validatedData);
      
      res.json(mesh);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid mesh data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create mesh" });
    }
  });

  app.post("/api/meshes/create", async (req, res) => {
    try {
      const { type, name, parameters } = req.body;
      
      // Generate basic mesh data based on type
      let meshData = "";
      let vertices = 0;
      let faces = 0;
      
      switch (type) {
        case "cube":
          vertices = 8;
          faces = 12;
          meshData = generateCubeMesh(parameters);
          break;
        case "sphere":
          vertices = (parameters?.subdivisions || 3) * 8;
          faces = (parameters?.subdivisions || 3) * 16;
          meshData = generateSphereMesh(parameters);
          break;
        case "cylinder":
          vertices = (parameters?.segments || 8) * 2;
          faces = (parameters?.segments || 8) * 2;
          meshData = generateCylinderMesh(parameters);
          break;
        case "plane":
          vertices = 4;
          faces = 2;
          meshData = generatePlaneMesh(parameters);
          break;
        default:
          return res.status(400).json({ error: "Unknown mesh type" });
      }

      const mesh = await storage.createMesh({
        name: name || `${type}_${Date.now()}`,
        fileName: `${type}.obj`,
        fileType: "obj",
        fileSize: meshData.length,
        vertices,
        faces,
        data: Buffer.from(meshData).toString('base64'),
      });

      res.json(mesh);
    } catch (error) {
      res.status(500).json({ error: "Failed to create mesh" });
    }
  });

  app.post("/api/meshes/:id/operation", async (req, res) => {
    try {
      const { id } = req.params;
      const { operation, parameters } = req.body;
      
      const mesh = await storage.getMesh(parseInt(id));
      if (!mesh) {
        return res.status(404).json({ error: "Mesh not found" });
      }

      // TODO: Implement actual mesh operations
      let updatedMesh: any = mesh;
      
      switch (operation) {
        case "subdivision":
          const subdivisionResult = await storage.updateMesh(parseInt(id), {
            vertices: mesh.vertices * 2,
            faces: mesh.faces * 4,
          });
          if (subdivisionResult) {
            updatedMesh = subdivisionResult;
          }
          break;
        case "decimation":
          const decimationResult = await storage.updateMesh(parseInt(id), {
            vertices: Math.floor(mesh.vertices * 0.5),
            faces: Math.floor(mesh.faces * 0.5),
          });
          if (decimationResult) {
            updatedMesh = decimationResult;
          }
          break;
        case "smoothing":
          // No change in vertex/face count for smoothing
          updatedMesh = mesh;
          break;
        default:
          return res.status(400).json({ error: "Unknown operation" });
      }

      res.json(updatedMesh);
    } catch (error) {
      res.status(500).json({ error: "Failed to perform operation" });
    }
  });

  app.delete("/api/meshes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteMesh(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Mesh not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete mesh" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      
      // Auto-respond if it's a user message
      if (!validatedData.isBot) {
        setTimeout(async () => {
          await storage.createChatMessage({
            message: generateBotResponse(validatedData.message),
            isBot: true,
          });
        }, 1000);
      }
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Macro routes
  app.get("/api/macros", async (req, res) => {
    try {
      const macros = await storage.getMacros();
      res.json(macros);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch macros" });
    }
  });

  app.post("/api/macros", async (req, res) => {
    try {
      const validatedData = insertMacroSchema.parse(req.body);
      const macro = await storage.createMacro(validatedData);
      res.json(macro);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid macro data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create macro" });
    }
  });

  app.delete("/api/macros/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteMacro(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Macro not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete macro" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for mesh generation
function generateCubeMesh(parameters: any): string {
  const size = parameters?.size || 1;
  return `# Cube mesh
v -${size} -${size} -${size}
v ${size} -${size} -${size}
v ${size} ${size} -${size}
v -${size} ${size} -${size}
v -${size} -${size} ${size}
v ${size} -${size} ${size}
v ${size} ${size} ${size}
v -${size} ${size} ${size}
f 1 2 3 4
f 5 8 7 6
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 5 1 4 8`;
}

function generateSphereMesh(parameters: any): string {
  const radius = parameters?.radius || 1;
  const subdivisions = parameters?.subdivisions || 3;
  
  // Basic icosphere generation
  return `# Sphere mesh
v 0 0 ${radius}
v 0 0 -${radius}
v ${radius} 0 0
v -${radius} 0 0
v 0 ${radius} 0
v 0 -${radius} 0
f 1 3 5
f 1 5 4
f 1 4 6
f 1 6 3
f 2 5 3
f 2 4 5
f 2 6 4
f 2 3 6`;
}

function generateCylinderMesh(parameters: any): string {
  const radius = parameters?.radius || 1;
  const height = parameters?.height || 2;
  const segments = parameters?.segments || 8;
  
  return `# Cylinder mesh
v 0 0 ${height/2}
v 0 0 -${height/2}
v ${radius} 0 ${height/2}
v ${radius} 0 -${height/2}
f 1 3 4 2`;
}

function generatePlaneMesh(parameters: any): string {
  const size = parameters?.size || 1;
  return `# Plane mesh
v -${size} 0 -${size}
v ${size} 0 -${size}
v ${size} 0 ${size}
v -${size} 0 ${size}
f 1 2 3 4`;
}

function generateBotResponse(userMessage: string): string {
  const responses = [
    "I can help you with mesh operations. What would you like to do?",
    "Sure! I'll assist you with that mesh operation.",
    "Let me help you with your 3D mesh processing task.",
    "I understand. Let me guide you through the process.",
    "Great question! Here's how you can achieve that with your mesh.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
