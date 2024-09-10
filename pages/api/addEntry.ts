import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message, sessionId, username } = req.body;
    
    // Use the provided username, or 'Anonymous' if not available
    const name = username || 'Anonymous';

    // Vulnerable to SQL Injection
    const query = `INSERT INTO entries (name, message) VALUES ('${name}', '${message}')`;
    
    console.log('Executing SQL:', query); // Log the SQL query

    try {
      // Execute the SQL query without parameter binding and return the result
      const result = await new Promise((resolve, reject) => {
        db.exec(query, function(this: any, err) {
          if (err) {
            console.error('SQL Error:', err);
            reject(err);
          } else {
            resolve({
              changes: this.changes,
              lastID: this.lastID
            });
          }
        });
      });

      res.status(200).json({ message: 'Entry added successfully', result });
    } catch (error) {
      console.error('Error executing SQL:', error);
      res.status(500).json({ error: 'Error adding entry', sqlError: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}