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

  const { id, recipientType, recipientName, recipientAddress, recipientEmail } = req.body;

  const updateSnapsRes = await supabase
    .from<definitions["snaps"]>("snaps")
    .update({
      recipient_type: recipientType,
      recipient_fname: recipientName || null,
      recipient_wallet_address: recipientAddress || null,
    })
    .eq('id', id);

  if (updateSnapsRes.error || !updateSnapsRes.data || updateSnapsRes.data.length === 0) {
    res.status(500).end();
    return;
  }

  const snaps = updateSnapsRes.data[0];
  if (recipientType === AuthType.EMAIL) {
    // save recipient email to separate, non-public table
    const updateEmailRes = await supabase
      .from<definitions["recipient_emails"]>("recipient_emails")
      .update({ recipient_email: recipientEmail })
      .eq('snaps_id', id);
    if (updateEmailRes.error || !updateEmailRes.data || updateEmailRes.data.length === 0) {
      res.status(500).end();
      return;
    }
  }

  res.status(200).json(snaps);
  return;
}
