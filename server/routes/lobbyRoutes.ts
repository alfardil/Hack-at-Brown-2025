import { Router, Request, Response, NextFunction } from 'express';
import Lobby, { ILobby, IDebateMessage } from '../models/Lobby';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY, 
  baseURL: process.env.AZURE_OPENAI_ENDPOINT, 
  defaultQuery: { "api-version": "2024-08-01-preview" }, 
});

/**
 * POST /api/lobby/create
 * Creates a new lobby with a 5-digit code. Players = 1.
 */
router.post(
  '/create',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      const newLobby: ILobby = new Lobby({ code });
      await newLobby.save();
      res.status(201).json({ code });
    } catch (error) {
      console.error('Error creating lobby:', error);
      next(error);
    }
  }
);

/**
 * POST /api/lobby/join
 * Body: { code }
 * Joins an existing lobby if players < 2.
 */
router.post(
  '/join',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code } = req.body;
    try {
      const lobby = await Lobby.findOne({ code });
      if (!lobby) {
        res.status(404).json({ error: 'Lobby not found.' });
        return;
      }
      if (lobby.players >= 2) {
        res.status(400).json({ error: 'Lobby is full.' });
        return;
      }

      lobby.players++;
      await lobby.save();

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
router.post(
  '/startDebate',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code } = req.body;
    try {
      const lobby = await Lobby.findOne({ code });
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

      const openaiRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates short, kid-friendly debate topics.'
          },
          {
            role: 'user',
            content: 'Give me a short one-sentence debate topic suitable for children to discuss.'
          }
        ],
        max_tokens: 60,
        temperature: 0.7
      });

      const promptText = openaiRes.choices[0]?.message?.content?.trim() || 'N/A';
      lobby.prompt = promptText;
      await lobby.save();

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
router.post(
  '/addMessage',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code, userId, text } = req.body;
    try {
      const lobby = await Lobby.findOne({ code });
      if (!lobby) {
        res.status(404).json({ error: 'Lobby not found.' });
        return;
      }

      const newMsg: IDebateMessage = {
        userId,
        text,
        timestamp: new Date()
      };
      lobby.messages.push(newMsg);
      await lobby.save();

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
router.get(
  '/:code',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code } = req.params;
    try {
      const lobby = await Lobby.findOne({ code });
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

export default router;