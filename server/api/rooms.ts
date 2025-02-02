import { Router, Request, Response, NextFunction } from 'express';
import { type DebateMessage, type Lobby} from '../models/Lobby';
// import OpenAI from 'openai';
import { db } from '../lib/db';

const lobbyRouter = Router();

// const openai = new OpenAI({
//   apiKey: process.env.AZURE_OPENAI_API_KEY, 
//   baseURL: process.env.AZURE_OPENAI_ENDPOINT, 
//   defaultQuery: { "api-version": "2024-08-01-preview" }, 
// });

/**
 * POST /api/lobby/create
 * Creates a new lobby with a 5-digit code. Players = 1.
 */
lobbyRouter.post(
  '/create',
  async (req, res, next) => {
    try {
      const code = Math.floor(10000 + Math.random() * 90000).toString();

        const newLobby: Lobby = {
            code,
            players: 1,
            messages: [],
            createdAt: new Date(),
            prompt: null,
        };

        await db.collection('Rooms').insertOne(newLobby);

      res.status(201).json({ code });
      console.log('Created lobby:', code);
    } catch (error) {
      console.error('Error creating lobby:', error);
      next(error);
    }
  }
);

/**
 * GET /api/lobby/test
 * Test endpoint.
 */
lobbyRouter.get(
  "/test",
  async (req, res, next) => {
    try {
      res.status(200).json({ message: "Hello World!" });
    } catch (error) {
      console.error("Error creating lobby:", error);
      next(error);
    }
  }
);

/**
 * POST /api/lobby/join
 * Body: { code }
 * Joins an existing lobby if players < 2.
 */
lobbyRouter.post(
  '/join',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code } = req.body;
    try {
      const lobby = await db.collection("Rooms").findOne<Lobby>({ code });
      if (!lobby) {
        res.status(404).json({ error: 'Lobby not found.' });
        return;
      }
      if (lobby.players >= 2) {
        res.status(400).json({ error: 'Lobby is full.' });
        return;
      }

      await db.collection("Rooms").updateOne(
        {code},
        { $inc: { players: 1 } }
      );

      res.status(200).json({ code: lobby.code });
    } catch (error) {
      console.error('Error joining lobby:', error);
      next(error);
    }
  }
);

/**
 * POST /api/lobby/startDebate
 * Body: { code }
 * Calls Azure OpenAI to get a kid-friendly debate prompt, saves it in the lobby.
 */
lobbyRouter.post(
  '/startDebate',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code } = req.body;
    try {
      const lobby = await db.collection("Rooms").findOne<Lobby>({ code });
      if (!lobby) {
        res.status(404).json({ error: 'Lobby not found.' });
        return;
      }

      // Only start if we have exactly 2 players
      if (lobby.players < 2) {
        res.status(400).json({ error: 'Not enough players to start debate.' });
        return;
      }

      if (lobby.prompt) {
        res.status(200).json({ prompt: lobby.prompt });
        return;
      }

    //   const openaiRes = await openai.chat.completions.create({
    //     model: "gpt-35-turbo",
    //     messages: [
    //       {
    //         role: 'system',
    //         content: 'You are a helpful assistant that generates short, kid-friendly debate topics.'
    //       },
    //       {
    //         role: 'user',
    //         content: 'Give me a short one-sentence debate topic suitable for children to discuss.'
    //       }
    //     ],
    //     max_tokens: 60,
    //     temperature: 0.7
    //   });

    //   const promptText = openaiRes.choices[0]?.message?.content?.trim() || 'N/A';
        const promptText = "Should schools have uniforms?";
      await db.collection("Rooms").updateOne(
        {code},
        { $set: { prompt: promptText } }
      );

      res.status(200).json({ prompt: promptText });
    } catch (error) {
      console.error('Error starting debate:', error);
      next(error);
    }
  }
);

/**
 * POST /api/lobby/addMessage
 * Body: { code, userId, text }
 * Adds a new debate message to the lobby.
 */
lobbyRouter.post(
  '/addMessage',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code, userId, text } = req.body;
    try {
        const lobby = await db.collection("Rooms").findOne<Lobby>({ code });
        const Rooms = db.collection<Lobby>("Rooms");
      if (!lobby) {
        res.status(404).json({ error: 'Lobby not found.' });
        return;
      }

      const newMsg: DebateMessage = {
        userId,
        text,
        timestamp: new Date()
      };
      
      await Rooms.updateOne(
        {code},
        { $push: { messages: newMsg } }
      )

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error adding message:', error);
      next(error);
    }
  }
);

/**
 * GET /api/lobby/:code
 * Returns the state of the lobby (players, prompt, messages).
 */

lobbyRouter.get(
  '/:code',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code } = req.params;
    try {
      const lobby = await db.collection("Rooms").findOne<Lobby>({ code });
      if (!lobby) {
        res.status(404).json({ error: 'Lobby not found.' });
        return;
      }

      res.status(200).json({
        code: lobby.code,
        players: lobby.players,
        prompt: lobby.prompt,
        messages: lobby.messages,
        createdAt: lobby.createdAt
      });
    } catch (error) {
      console.error('Error fetching lobby:', error);
      next(error);
    }
  }
);

export default lobbyRouter;