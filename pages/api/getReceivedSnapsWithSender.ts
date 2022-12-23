import type { NextApiRequest, NextApiResponse } from 'next';
import { resolveCategory } from '../../category';
import { runMiddleware, validateJwt } from './middleware';
import { supabase } from './supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  await runMiddleware(req, res, validateJwt);
  // this call needs to be made from the backend b/c we access the users table
  const { data, error } = await supabase
    .rpc(
      'get_received_snaps_with_sender',
      { recipient_email: req.body.jwt.email, recipient_wallet_address: req.body.jwt.address },
    );
  if (error) {
    console.log(error);
    res.status(500).end();
    return;
  }

  // filter out any incomplete snaps
  const formatted = await Promise.all((data || [])
    .filter(snap => snap.note)
    .map(async s => {
      s.category = await resolveCategory(s.category!);
      return s;
    }));

  res.status(200).json(formatted);
  return;
}
