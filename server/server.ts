import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import lobbyRoutes from './routes/lobbyRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5173;

app.use(express.json());
app.use(cors());

app.use('/api/rooms', lobbyRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

const mongoURI = process.env.MONGO_URI!;
