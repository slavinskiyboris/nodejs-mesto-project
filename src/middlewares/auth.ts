import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Unauthorized from '../errors/unauthorized';
import config from '../config';

interface JwtPayload {
  _id: string;
}

const checkAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new Unauthorized('Требуется авторизация'));
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    req.user = { _id: payload._id };
    return next();
  } catch (err) {
    return next(new Unauthorized('Некорректный токен авторизации'));
  }
};

export default checkAuth; 