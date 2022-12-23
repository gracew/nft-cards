import type { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, validateJwt } from './middleware';
import { supabase } from './supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  await runMiddleware(req, res, validateJwt);
  // this call needs to be made from the backend b/c we access the recipient_emails table
  const { data, error } = await supabase
    .rpc(
      'matches_recipient_email',
      { snaps_id: req.body.id, user_email: req.body.jwt.email  },
    );
  if (error) {
    res.status(500).end();
    return;
  }

  res.status(200).json(data);
  return;
}
