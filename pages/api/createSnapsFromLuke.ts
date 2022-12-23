import formidable from "formidable";
import fs from "fs";
import { create as ipfsHttpClient } from "ipfs-http-client";
import type { NextApiRequest, NextApiResponse } from 'next';
import { definitions } from "../../types/supabase";
import { sendEmail } from "./completeSnaps";
import { supabase } from './supabase';

// @ts-ignore
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");


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
    if ("video" in files) {
      const videoResult = await client.add(fs.createReadStream((files["video"] as any).filepath));
      data["video_url"] = `https://ipfs.infura.io/ipfs/${videoResult.path}`;
    }

    const insertCategoryRes = await supabase
      .from("categories")
      .insert([data]);

    if (insertCategoryRes.error || !insertCategoryRes.data || insertCategoryRes.data.length === 0) {
      res.status(500).end();
      return;
    }
    const categoryId = insertCategoryRes.data[0].id;

    const insertSnapsRes = await supabase
      .from<definitions["snaps"]>("snaps")
      .insert([{
        // sender_id: "36f30956-96db-40b5-a040-9ace042b44be", // test sender on staging
        sender_id: "8581e3bd-9a1f-4ef1-a384-1306df1f89af",
        recipient_type: "email",
        recipient_fname: recipientName as string,
        note: note as string,
        category: categoryId,
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
