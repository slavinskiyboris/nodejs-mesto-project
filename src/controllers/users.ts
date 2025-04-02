import { Request, Response, NextFunction, RequestHandler } from 'express';
import User from '../models/user';
import { Error as MongooseError } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../constants';
import config from '../config';

import BadRequest from '../errors/bad-request';
import Unauthorized from '../errors/unauthorized';
import NotFound from '../errors/not-found';
import Conflict from '../errors/conflict';

export const getUsers: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return next(new NotFound('Пользователь не найден'));
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const getUserById: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return next(new NotFound('Пользователь по указанному _id не найден.'));
    }

    res.json(user);
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      return next(new BadRequest('Передан некорректный _id пользователя'));
    }
    next(err);
  }
};

export const registerNewUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const {
      email,
      password,
      name,
      about,
      avatar,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new Conflict('Пользователь с таким email уже существует'));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: passwordHash,
      name,
      about,
      avatar,
    });

    const createdUser = await newUser.save();

    const userResponse = {
      _id: createdUser._id,
      name: createdUser.name,
      about: createdUser.about,
      avatar: createdUser.avatar,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    };

    res.status(HTTP_STATUS.CREATED).json(userResponse);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      const errorMessage = Object.values(err.errors)
        .map((error) => error.message)
        .join(', ');
      return next(new BadRequest(`Ошибка валидации: ${errorMessage}`));
    }
    next(err);
  }
};

export const authenticateUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new BadRequest('Email и пароль обязательны для заполнения'));
    }

    const userFound = await User.findOne({ email }).select('+password');
    if (!userFound) {
      return next(new Unauthorized('Неправильные почта или пароль'));
    }

    const passwordValid = await bcrypt.compare(password, userFound.password);
    if (!passwordValid) {
      return next(new Unauthorized('Неправильные почта или пароль'));
    }

    const accessToken = jwt.sign(
      { _id: userFound._id },
      config.JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.cookie('jwt', accessToken, {
      maxAge: 3600000 * 24 * 7,
      httpOnly: true,
      sameSite: 'strict',
      secure: config.NODE_ENV === 'production',
      path: '/',
    });

    res.json({
      _id: userFound._id,
      email: userFound.email,
      name: userFound.name,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { name, about } = req.body;
    const userId = req.user?._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return next(new NotFound('Пользователь с указанным _id не найден'));
    }

    res.json(updatedUser);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return next(new BadRequest('Переданы некорректные данные при обновлении профиля'));
    }
    next(err);
  }
};

export const updateAvatar: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { avatar } = req.body;
    const userId = req.user?._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return next(new NotFound('Пользователь с указанным _id не найден'));
    }

    res.json(updatedUser);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return next(new BadRequest('Переданы некорректные данные при обновлении аватара'));
    }
    next(err);
  }
};