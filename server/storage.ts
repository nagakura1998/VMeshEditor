import { meshes, chatMessages, macros, type Mesh, type InsertMesh, type ChatMessage, type InsertChatMessage, type Macro, type InsertMacro } from "@shared/schema";

export interface IStorage {
  // Mesh operations
  getMeshes(): Promise<Mesh[]>;
  getMesh(id: number): Promise<Mesh | undefined>;
  createMesh(mesh: InsertMesh): Promise<Mesh>;
  updateMesh(id: number, mesh: Partial<InsertMesh>): Promise<Mesh | undefined>;
  deleteMesh(id: number): Promise<boolean>;
  
  // Chat operations
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Macro operations
  getMacros(): Promise<Macro[]>;
  getMacro(id: number): Promise<Macro | undefined>;
  createMacro(macro: InsertMacro): Promise<Macro>;
  deleteMacro(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private meshes: Map<number, Mesh> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private macros: Map<number, Macro> = new Map();
  private currentMeshId = 1;
  private currentChatId = 1;
  private currentMacroId = 1;

  // Mesh operations
  async getMeshes(): Promise<Mesh[]> {
    return Array.from(this.meshes.values());
  }

  async getMesh(id: number): Promise<Mesh | undefined> {
    return this.meshes.get(id);
  }

  async createMesh(insertMesh: InsertMesh): Promise<Mesh> {
    const id = this.currentMeshId++;
    const mesh: Mesh = {
      ...insertMesh,
      id,
      vertices: insertMesh.vertices || 0,
      faces: insertMesh.faces || 0,
      createdAt: new Date(),
    };
    this.meshes.set(id, mesh);
    return mesh;
  }

  async updateMesh(id: number, updateData: Partial<InsertMesh>): Promise<Mesh | undefined> {
    const mesh = this.meshes.get(id);
    if (!mesh) return undefined;
    
    const updatedMesh = { ...mesh, ...updateData };
    this.meshes.set(id, updatedMesh);
    return updatedMesh;
  }

  async deleteMesh(id: number): Promise<boolean> {
    return this.meshes.delete(id);
  }

  // Chat operations
  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      isBot: insertMessage.isBot || false,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Macro operations
  async getMacros(): Promise<Macro[]> {
    return Array.from(this.macros.values());
  }

  async getMacro(id: number): Promise<Macro | undefined> {
    return this.macros.get(id);
  }

  async createMacro(insertMacro: InsertMacro): Promise<Macro> {
    const id = this.currentMacroId++;
    const macro: Macro = {
      ...insertMacro,
      id,
      description: insertMacro.description || null,
      createdAt: new Date(),
    };
    this.macros.set(id, macro);
    return macro;
  }

  async deleteMacro(id: number): Promise<boolean> {
    return this.macros.delete(id);
  }
}

export const storage = new MemStorage();
