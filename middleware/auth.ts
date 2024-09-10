import { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'

export function requireAuth(handler: (req: NextApiRequest, res: NextApiResponse) => void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = parse(req.headers.cookie || '')
    if (cookies.token !== 'authenticated') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return handler(req, res)
  }
}