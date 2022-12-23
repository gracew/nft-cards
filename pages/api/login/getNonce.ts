import type { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, validateJwtIfExists } from '../middleware';
import { supabase } from '../supabase';


type Data = {
  nonce: string
  validAddress: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const address = req.body.address?.toLowerCase();
  
  await runMiddleware(req, res, validateJwtIfExists);
  const validAddress = req.body.jwt?.address !== undefined && req.body.jwt?.address !== null;

  const { data } = await supabase
    .from("nonces")
    .select("*")
    .eq("wallet_address", address);

  if (data && data.length > 0) {
    res.status(200).json({ nonce: data[0].nonce, validAddress });
    return;
  }

  const { data: newData } = await supabase
    .from("nonces")
    .insert([{ wallet_address: address }]);
  if (newData && newData.length > 0) {
    
    res.status(200).json({ nonce: newData[0].nonce, validAddress });
    return;
  };

  res.status(500).end();
}
