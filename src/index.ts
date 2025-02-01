import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import roomRoutes from '../server/routes/lobbyRoutes';

const app = express();
const port = process.env.PORT || 5173;

app.use(express.json());
app.use(cors());

app.use('/api/rooms', roomRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });