import sendgrid from '@sendgrid/mail';
import formidable from "formidable";
import fs from "fs";
import { create as ipfsHttpClient } from "ipfs-http-client";
import type { NextApiRequest, NextApiResponse } from 'next';
import { definitions } from "../../types/supabase";
import { supabase } from './supabase';

// @ts-ignore
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(snapsId: string) {
  const host = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";
  const emailRes = await supabase
    .from<definitions["recipient_emails"]>("recipient_emails")
    .select("*")
    .eq('snaps_id', snapsId);
  if (emailRes.error || !emailRes.data || emailRes.data.length === 0) {
    console.error("could not notify recipient");
    return;
  }
  const msg = {
    templateId: "d-5aff4fd54154455c8afddef351c648d9",
    from: {
      name: "GiveSnaps",
      email: "hello@givesnaps.xyz",
    },
    personalizations: [
      {
        to: emailRes.data[0].recipient_email,
      }
    ],
    dynamicTemplateData: {
      snaps_url: `${host}/snaps/${snapsId}`,
    }
  }
  // TODO(gracew): make this idempotent
  await sendgrid.send(msg);
}


// don't process the body - formidable will handle that
export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));
      return;
    }
    const { recipientName, recipientEmail, note, label } = fields;

    const imageResult = await client.add(fs.createReadStream((files["image"] as any).filepath));
    const data: Record<string, any> = {
      label,
      image_url: `https://ipfs.infura.io/ipfs/${imageResult.path}`,
    }

    const insertSnapsRes = await supabase
      .from<definitions["snaps"]>("snaps")
      .insert([{
        recipient_fname: recipientName as string,
        note: note as string,
        // TODO email
      }]);
    if (insertSnapsRes.error || !insertSnapsRes.data || insertSnapsRes.data.length === 0) {
      res.status(500).end();
      return;
    }

    const snaps = insertSnapsRes.data[0];
    // save recipient email to separate, non-public table
    const insertEmailRes = await supabase
      .from<definitions["recipient_emails"]>("recipient_emails")
      .insert([{
        snaps_id: snaps.id,
        recipient_email: recipientEmail as string,
      }]);
    if (insertEmailRes.error || !insertEmailRes.data || insertEmailRes.data.length === 0) {
      res.status(500).end();
      return;
    }

    await sendEmail(snaps.id);

    res.status(200).json(snaps);
    return;
  });

}
