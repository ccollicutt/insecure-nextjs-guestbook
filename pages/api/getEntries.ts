import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const rows = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM entries', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching entries:', error);
      res.status(500).json({ error: 'Error fetching entries' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}