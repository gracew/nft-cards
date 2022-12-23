import { serialize } from 'cookie';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from 'next';
import { definitions } from '../../../types/supabase';
import { runMiddleware, validateJwtIfExists } from '../middleware';
import { supabase } from '../supabase';

async function insertIntoUsers(payload: TokenPayload, sub?: string) {
  if (sub) {
    const { data, error } = await supabase
      .from<definitions["users"]>("users")
      .update({ email: payload.email, fname: payload.given_name })
      .eq("id", sub);
    if (error || !data || data.length === 0) {
      return undefined;
    }
    return data[0];
  }
  const existingRes = await supabase
    .from<definitions["users"]>("users")
    .select("*")
    .eq("email", payload.email);
  if (existingRes.error) {
    return undefined;
  }

  if (existingRes.data && existingRes.data.length > 0) {
    return existingRes.data[0];
  }

  const { data, error } = await supabase
    .from<definitions["users"]>("users")
    .insert([{ email: payload.email, fname: payload.given_name }]);
  if (error || !data || data.length === 0) {
    return undefined;
  }
  return data[0];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await runMiddleware(req, res, validateJwtIfExists);

  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await googleClient.verifyIdToken({
    idToken: req.body.tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("provided idToken was invalid");
  }
  console.log(payload);

  // successful login; insert into users table
  const user = await insertIntoUsers(payload, req.body.jwt?.sub);
  if (!user) {
    res.status(500).end();
    return;
  }

  const token = jwt.sign({
    sub: user.id,
    email: payload.email,
    fname: payload.given_name,
    address: user.wallet_address,
  }, process.env.JWT_SECRET!);
  res.status(200).setHeader('Set-Cookie', serialize('snToken', token, { path: "/" }));
  res.end();
}
