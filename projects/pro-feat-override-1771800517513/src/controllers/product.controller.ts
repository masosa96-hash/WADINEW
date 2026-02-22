import { Request, Response } from 'express';

export const listProduct = async (req: Request, res: Response) => {
  res.json({ message: 'List Product works' });
};

export const createProduct = async (req: Request, res: Response) => {
  res.json({ message: 'Create Product works' });
};