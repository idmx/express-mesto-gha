const Card = require( '../models/card' );
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

module.exports.getCards = ( req, res ) => {
  Card.find({})
    .then( cards => res.send({ data: cards }))
    .catch( err => res.status( 500 ).send({ message: err.message }));
};

module.exports.deleteCard = ( req, res ) => {
  Card.findByIdAndRemove( req.params.cardId )
    .then( card => res.send({ data: card }))
    .catch( err => {
      if ( err.name === 'CastError' ) {
        res.status( BAD_REQUEST ).send({ message: err.message })
      }
    });
};

module.exports.addCardLike = ( req, res ) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then( card => res.send({ data: card }))
    .catch( err => res.status( 500 ).send({ message: err.message }));
};

module.exports.deleteCardLike = ( req, res ) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then( card => res.send({ data: card }))
    .catch( err => res.status( 500 ).send({ message: err.message }));
};

module.exports.createCard = ( req, res ) => {
  console.log('body', req.user._id)
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then( card => res.send({ data: card }))
    .catch( err => res.status( 500 ).send({ message: err.message }));
};
