import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sessionId } = req.body;

    // In a real app, we would verify the sessionId and check if the user is an admin
    // For this insecure app, we'll just proceed with the reset

    try {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM entries', (err) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
      res.status(200).json({ message: 'All messages reset successfully' });
    } catch (error) {
      console.error('Error resetting messages:', error);
      res.status(500).json({ error: 'Error resetting messages' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}