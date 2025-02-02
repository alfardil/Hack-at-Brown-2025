export type DebateMessage = {
  userId: string;        
  text: string;
  timestamp: Date;
}

export type Lobby = {
  code: string;           
  players: number;        
  prompt?: string | null; 
  messages: DebateMessage[];
  createdAt: Date;
}

// const DebateMessageSchema = new Schema<IDebateMessage>({
//   userId: { type: String, required: true },
//   text: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now }
// });

// const LobbySchema = new Schema<ILobby>({
//   code: { type: String, required: true, unique: true },
//   players: { type: Number, default: 1 },
//   prompt: { type: String, default: null },
//   messages: { type: [DebateMessageSchema], default: [] },
//   createdAt: { type: Date, default: Date.now }
// });

// export default model<ILobby>('Lobby', LobbySchema);