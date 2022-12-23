import express from 'express';
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from 'next';

// https://nextjs.org/docs/api-routes/api-middlewares#connectexpress-middleware-support
export function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }

            return resolve(result);
        })
    })
}

export function validateJwtIfExists(req: NextApiRequest, res: NextApiResponse, next: express.NextFunction) {
    const token = req.cookies.snToken;
    if (!token) {
        next();
    } else {
        jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
            if (err) {
                res.status(401).json({});
                return;
            }
            req.body.jwt = decoded;
            next();
        });
    }
}

export function validateJwt(req: NextApiRequest, res: NextApiResponse, next: express.NextFunction) {
    const token = req.cookies.snToken;
    if (!token) {
        res.status(401).json({});
        return;
    }
    jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
        if (err) {
            res.status(401).json({});
            return;
        }
        req.body.jwt = decoded;
        next();
    });
}