import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const users = await new Promise((resolve, reject) => {
        db.all('SELECT id, username, admin FROM users', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', id, (err) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}