import { Schema, model, Document } from 'mongoose';

export interface IDebateMessage {
  userId: string;        
  text: string;
  timestamp: Date;
}

export interface ILobby extends Document {
  code: string;           
  players: number;        
  prompt: string | null; 
  messages: IDebateMessage[];
  createdAt: Date;
}

const DebateMessageSchema = new Schema<IDebateMessage>({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const LobbySchema = new Schema<ILobby>({
  code: { type: String, required: true, unique: true },
  players: { type: Number, default: 1 },
  prompt: { type: String, default: null },
  messages: { type: [DebateMessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export default model<ILobby>('Lobby', LobbySchema);