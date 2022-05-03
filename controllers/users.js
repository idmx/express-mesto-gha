const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;
const DEFAULT_MESSAGE = 'На сервере произошла ошибка';
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(INTERNAL_SERVER_ERROR).send({ message: DEFAULT_MESSAGE }));
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => (user ? res.send(user) : res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' })))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для получения пользователя.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: DEFAULT_MESSAGE });
      }
    });
};

module.exports.getUserInfo = (req, res) => {
  console.log(JWT_SECRET)
  User.findById(req.user._id)
    .then((user) => (user ? res.send(user) : res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' })))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для получения пользователя.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: DEFAULT_MESSAGE });
      }
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      } else if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: DEFAULT_MESSAGE });
      }
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      } else if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: DEFAULT_MESSAGE });
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar, email, password } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then(hash => User.create({ name, about, avatar, email, password: hash })
      .then((user) => res.send( user ))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании профиля.' });
        } else {
          res.status(INTERNAL_SERVER_ERROR).send({ message: DEFAULT_MESSAGE });
        }
      })
    )
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
  .then((user) => {
    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' })
    res.cookie('jwt', token, {
      maxAge: 3600000 * 24 * 7,
      httpOnly: true
    });
    res.send({ _id: user._id });
  })
  .catch((err) => {
    res.status(401).send({ message: err.message });
  });
};
