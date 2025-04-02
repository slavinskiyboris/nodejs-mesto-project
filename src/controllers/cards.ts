import { Request, Response, NextFunction, RequestHandler } from 'express';
import Card from '../models/card';
import { Error as MongooseError } from 'mongoose';
import { HTTP_STATUS } from '../constants';

import BadRequest from '../errors/bad-request';
import Forbidden from '../errors/forbidden';
import NotFound from '../errors/not-found';

export const getCards: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const cards = await Card.find({});
    res.json(cards);
  } catch (err) {
    next(err);
  }
};

export const createCard: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { name, link } = req.body;
    const ownerId = req.user?._id;
    const card = new Card({ name, link, owner: ownerId });
    const savedCard = await card.save();
    res.status(HTTP_STATUS.CREATED).json(savedCard);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return next(new BadRequest('Переданы некорректные данные при создании карточки'));
    }
    next(err);
  }
};

export const deleteCard: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId);

    if (!card) {
      return next(new NotFound('Карточка с указанным _id не найдена'));
    }

    if (card.owner.toString() !== req.user?._id) {
      return next(new Forbidden('Недостаточно прав для удаления карточки'));
    }

    await Card.findByIdAndDelete(cardId);
    res.json({ message: 'Карточка удалена' });
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      return next(new BadRequest('Передан некорректный _id карточки'));
    }
    next(err);
  }
};

export const likeCard: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: userId } },
      { new: true, runValidators: true },
    );

    if (!updatedCard) {
      return next(new NotFound('Передан несуществующий _id карточки'));
    }

    res.json(updatedCard);
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      return next(new BadRequest('Переданы некорректные данные для постановки лайка'));
    }
    next(err);
  }
};

export const dislikeCard: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: userId } },
      { new: true, runValidators: true },
    );

    if (!updatedCard) {
      return next(new NotFound('Передан несуществующий _id карточки'));
    }

    res.json(updatedCard);
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      return next(new BadRequest('Переданы некорректные данные для снятия лайка'));
    }
    next(err);
  }
};