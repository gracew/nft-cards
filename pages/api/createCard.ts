import sendgrid from '@sendgrid/mail';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from './supabase';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(card: any) {
  const host = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";
  const msg = {
    templateId: "d-5aff4fd54154455c8afddef351c648d9",
    from: {
      name: "Pearl",
      email: "gm@trypearl.xyz",
    },
    personalizations: [
      {
        to: card.recipient_email,
      }
    ],
    dynamicTemplateData: {
      snaps_url: `${host}/snaps/${card.id}`,
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
    const { recipientEmail, note } = req.body;
    const insertCardRes = await supabase
      .from("snaps")
      .insert([{
        recipient_email: recipientEmail,
        note,
      }]);
    if (insertCardRes.error || !insertCardRes.data || insertCardRes.data.length === 0) {
      res.status(500).end();
      return;
    }

    const card = insertCardRes.data[0];

    await sendEmail(card);

    res.status(200).json(card);
}
