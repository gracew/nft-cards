import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthType } from '../../auth';
import { definitions } from '../../types/supabase';
import { runMiddleware, validateJwt } from './middleware';
import { supabase } from './supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  await runMiddleware(req, res, validateJwt);
  const { data, error } = await supabase
    .from<definitions["snaps"]>("snaps")
    .select("*")
    .eq("id", req.body.id);
  if (error) {
    res.status(500).end();
    return;
  } 
  if (!data || data.length === 0) {
    res.status(404).end();
    return;
  }

  const snaps = data[0];
  if (snaps.sender_id !== req.body.jwt.sub) {
    res.status(403).end();
    return;
  }

  if (snaps.recipient_type !== AuthType.EMAIL) {
    res.status(200).json(snaps);
    return;
  }

  const emailRes = await supabase
    .from<definitions["recipient_emails"]>("recipient_emails")
    .select("*")
    .eq("snaps_id", req.body.id);

  if (emailRes.error || !emailRes.data || emailRes.data.length === 0) {
    res.status(500).end();
    return;
  }

  res.status(200).json({ ...snaps, recipient_email: emailRes.data[0].recipient_email });
  return;
}
