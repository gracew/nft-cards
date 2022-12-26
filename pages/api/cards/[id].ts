import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../supabase';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq('id', id);
  if (error) {
    console.error(error);
  }

  if (!data || data.length === 0) {
    console.log("No data found for id: " + id);
    res.status(500).end();
    return;
  }

  const { recipient_email, ...other } = data[0];
  res.status(200).json(other);
}
