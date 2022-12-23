import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthType } from '../../auth';
import { definitions } from "../../types/supabase";
import { runMiddleware, validateJwt } from './middleware';
import { supabase } from './supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  await runMiddleware(req, res, validateJwt);

  const recipientInfo: Partial<definitions["snaps"]> = req.body.recipientType === AuthType.EMAIL
    ? { recipient_fname: req.body.recipientName }
    : { recipient_wallet_address: req.body.recipientAddress };
  const insertSnapsRes = await supabase
    .from<definitions["snaps"]>("snaps")
    .insert([{
      sender_id: req.body.jwt.sub,
      recipient_type: req.body.recipientType,
      ...recipientInfo,
    }]);

  if (insertSnapsRes.error || !insertSnapsRes.data || insertSnapsRes.data.length === 0) {
    res.status(500).end();
    return;
  }

  const snaps = insertSnapsRes.data[0];
  if (req.body.recipientType === AuthType.EMAIL) {
    // save recipient email to separate, non-public table
    const insertEmailRes = await supabase
      .from<definitions["recipient_emails"]>("recipient_emails")
      .insert([{
        snaps_id: snaps.id,
        recipient_email: req.body.recipientEmail,
      }]);
    if (insertEmailRes.error || !insertEmailRes.data || insertEmailRes.data.length === 0) {
      res.status(500).end();
      return;
    }
  }

  res.status(200).json(snaps);
  return;
}
