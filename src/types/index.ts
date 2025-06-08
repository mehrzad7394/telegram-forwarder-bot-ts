import { NextFunction, Request, Response } from "express";

export type RequestResponse = (req: Request, res: Response) => void;

export type RequestResponseNext = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
export type Message = { message: string };
