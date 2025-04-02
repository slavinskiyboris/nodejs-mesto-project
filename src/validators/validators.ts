import { Joi, celebrate } from 'celebrate';

export const URL_REGEX = /^(https?:\/\/)(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?(#)?$/;
export const NAME_REGEX = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;

// Валидатор :userId
export const validateUserId = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Невалидный ID пользователя',
        'string.length': 'ID должен содержать 24 символа',
      }),
  }),
});

// Валидатор :cardId
export const validateCardId = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Невалидный идентификатор карточки',
        'string.length': 'Идентификатор карточки должен содержать 24 символа',
        'any.required': 'Идентификатор карточки обязателен',
      }),
  }),
});

export const validateCardBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required()
      .pattern(NAME_REGEX)
      .messages({
        'string.min': 'Минимальная длина - 2 символа',
        'string.max': 'Максимальная длина - 30 символов',
        'string.pattern.base': 'Допустимы только буквы, пробелы и дефисы',
        'string.empty': 'Поле обязательно для заполнения',
      }),
    link: Joi.string().required().pattern(URL_REGEX)
      .messages({
        'string.empty': 'Поле обязательно для заполнения',
      }),
  }),
});

export const validateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required()
      .pattern(NAME_REGEX)
      .messages({
        'string.min': 'Минимальная длина - 2 символа',
        'string.max': 'Максимальная длина - 30 символов',
        'string.pattern.base': 'Допустимы только буквы, пробелы и дефисы',
      }),
    about: Joi.string().min(2).max(200).required()
      .pattern(NAME_REGEX)
      .messages({
        'string.min': 'Минимальная длина - 2 символа',
        'string.max': 'Максимальная длина - 200 символов',
        'string.pattern.base': 'Допустимы только буквы, пробелы и дефисы',
      }),
  }),
});

export const validateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(URL_REGEX)
      .messages({
        'string.empty': 'Поле обязательно для заполнения',
      }),
  }),
});

export const validateLoginCredentials = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Укажите корректный email',
        'string.empty': 'Email необходим',
        'any.required': 'Поле email должно быть заполнено',
      }),
    password: Joi.string().min(8).required()
      .pattern(PASSWORD_REGEX)
      .messages({
        'string.min': 'Пароль должен быть не менее 8 символов',
        'string.pattern.base': 'Пароль должен включать цифры, строчные и заглавные буквы',
        'string.empty': 'Пароль необходим',
      }),
  }),
});

export const validateUserRegistration = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30)
      .pattern(NAME_REGEX)
      .messages({
        'string.min': 'Минимальная длина имени - 2 символа',
        'string.max': 'Максимальная длина имени - 30 символов',
        'string.pattern.base': 'Имя может содержать только буквы, пробелы и дефисы',
      }),
    about: Joi.string().min(2).max(200)
      .pattern(NAME_REGEX)
      .messages({
        'string.min': 'Минимальная длина поля "about" - 2 символа',
        'string.max': 'Максимальная длина поля "about" - 200 символов',
        'string.pattern.base': 'Поле "about" может содержать только буквы, пробелы и дефисы',
      }),
    avatar: Joi.string().pattern(URL_REGEX)
      .messages({
        'string.pattern.base': 'Некорректный URL аватара',
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Введите корректный email',
        'string.empty': 'Email обязателен для заполнения',
        'any.required': 'Поле email обязательно для заполнения',
      }),
    password: Joi.string().min(8).required()
      .pattern(PASSWORD_REGEX)
      .messages({
        'string.min': 'Пароль должен содержать минимум 8 символов',
        'string.pattern.base': 'Пароль должен содержать цифры, строчные и заглавные буквы',
        'string.empty': 'Пароль обязателен для заполнения',
      }),
  }),
}); 