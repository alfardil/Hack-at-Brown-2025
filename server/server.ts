import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './api';
import morgan from 'morgan';


const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

app.use('/api', apiRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

const server = app.listen(port);

try {
  const serverMetadata = server.address() as { address: string; port: number };
  console.log(
    `\n\nServer listening on http://${
      serverMetadata.address === "::" ? "127.0.0.1" : serverMetadata.address
    }:${serverMetadata.port}`
  );
} catch (e) {
  console.error(e);
}
