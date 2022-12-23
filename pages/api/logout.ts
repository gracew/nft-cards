import cookie from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // clear cookies
    res.setHeader("Set-Cookie", cookie.serialize('snToken', '', {
        expires: new Date(0),
        sameSite: 'strict',
        path: '/'
    }));
    res.status(200).end();
}
