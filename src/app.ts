import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/users';
import cardRoutes from './routes/cards';
import { Error as MongooseError } from 'mongoose';
import { HTTP_STATUS } from './constants';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = { _id: '67ebea489ed53a7d9593066e' };
  next();
});

app.use(userRoutes);
app.use(cardRoutes);

app.get('/', (req, res) => {
  res.send('Hello, world');
});

app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Ресурс не найден' });
});

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof MongooseError.ValidationError) {
    if (req.path === '/users/me') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Переданы некорректные данные при обновлении профиля' });
      return;
    }
    if (req.path === '/users/me/avatar') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Переданы некорректные данные при обновлении аватара' });
      return;
    }
    if (req.path === '/users') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Переданы некорректные данные при создании пользователя' });
      return;
    }
    if (req.path === '/cards') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Переданы некорректные данные при создании карточки' });
      return;
    }
  }

  if (err instanceof MongooseError.CastError) {
    if (req.path.includes('/cards/')) {
      if (req.method === 'DELETE') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Передан некорректный _id карточки' });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Переданы некорректные данные для постановки/снятия лайка' });
      }
      return;
    }
    if (req.path.includes('/users/')) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Передан некорректный _id пользователя' });
      return;
    }
  }

  console.error(err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});