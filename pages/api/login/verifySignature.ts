import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { serialize } from 'cookie';
import { randomUUID } from 'crypto';
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from 'next';
import { signatureInput } from '../../../auth';
import { definitions } from '../../../types/supabase';
import { runMiddleware, validateJwtIfExists } from '../middleware';
import { supabase } from '../supabase';

async function insertIntoUsers(address: string, sub?: string) {
    if (sub) {
        const { data, error } = await supabase
            .from<definitions["users"]>("users")
            .update({ wallet_address: address })
            .eq("id", sub);
        if (error || !data || data.length === 0) {
            return undefined;
        }
        return data[0];
    }

    const existingRes = await supabase
        .from<definitions["users"]>("users")
        .select("*")
        .eq("wallet_address", address);
    if (existingRes.error) {
        return undefined;
    }

    if (existingRes.data && existingRes.data.length > 0) {
        return existingRes.data[0];
    }

    const { data, error } = await supabase
        .from<definitions["users"]>("users")
        .insert([{ wallet_address: address }]);
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

    const address = req.body.address?.toLowerCase();
    const { data } = await supabase
        .from("nonces")
        .select("*")
        .eq("wallet_address", address);
    if (!data || data.length === 0) {
        res.status(400).end("no nonce found");
        return;
    }
    const recoveredAddress = recoverPersonalSignature({
        data: signatureInput(data[0].nonce),
        signature: req.body.signature,
    })
    if (recoveredAddress !== address) {
        res.status(400).end("invalid signature");
        return;
    }

    // successful login; replace nonce and insert into users table
    await supabase
        .from("nonces")
        .update({ nonce: randomUUID() })
        .eq('wallet_address', address);

    const user = await insertIntoUsers(address, req.body.jwt?.sub);
    if (!user) {
        res.status(500).end();
        return;
    }

    const token = jwt.sign({
        sub: user.id,
        address,
        email: user.email,
        fname: user.fname,
    }, process.env.JWT_SECRET!);
    res.status(200).setHeader('Set-Cookie', serialize('snToken', token, { path: "/" }));
    res.end();
}
