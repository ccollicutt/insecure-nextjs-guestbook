import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db';
import crypto from 'crypto';

interface User {
  admin: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    
    // Extremely vulnerable to SQL injection
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log(`Executing SQL query: ${query}`);

    db.all(query, (err, users: User[]) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error logging in' });
      }

      if (users.length > 0) {
        const user: User = users[0];
        const sessionId = crypto.randomBytes(16).toString('hex');
        return res.status(200).json({ 
          message: 'Login successful', 
          sessionId, 
          isAdmin: user.admin === 1, 
          redirectUrl: `/?sessionId=${sessionId}&username=${username}&isAdmin=${user.admin === 1}` 
        });
      } else {
        // Vulnerable insertion of new user
        const insertQuery = `INSERT INTO users (username, password, admin) VALUES ('${username}', '${password}', 0)`;
        console.log(`Executing SQL query: ${insertQuery}`);
        
        db.run(insertQuery, function(insertErr) {
          if (insertErr) {
            console.error('Error adding new user:', insertErr);
            return res.status(500).json({ error: 'Error creating new user' });
          }
          const sessionId = crypto.randomBytes(16).toString('hex');
          return res.status(200).json({ 
            message: 'New user created and logged in', 
            sessionId, 
            isAdmin: false, 
            redirectUrl: `/?sessionId=${sessionId}&username=${username}&isAdmin=false` 
          });
        });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}