//route vers le fichier auths dans la variable Auth
const Auth = require('../models/auth')
//importation du package bcrypt
const bcrypt = require('bcrypt');
//importation du package jsonwebtoken
const jwt = require('jsonwebtoken');
//importation du package cryptojs
const cryptojs = require('crypto-js');


// fonction de inscription
exports.signup = (req, res, next) => {
    // chiffrer l'email avec crypto-js
    const emailCryptoJs = cryptojs.HmacSHA256(req.body.email, 'CLE_SECRET').toString();
    //console.log(emailCryptoJs);
  //hasher le mdp avec bcrypt l'algorithme est executé 10x
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const auth = new Auth({
        email: emailCryptoJs,
        password: hash
      });
      //sauvegarde des données dans la BDD
      auth.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });

};

// fonctionn de connection
exports.login = (req, res, next) => {
  const emailCryptoJs = cryptojs.HmacSHA256(req.body.email, 'CLE_SECRET').toString();
  Auth.findOne({ email: emailCryptoJs })
    .then(auth => {
      if (!auth) {
        return res.status(401).json({ message: 'utilisateur introuvable' });
      }
      //on compare le mdp avec celui de la BDD
      bcrypt.compare(req.body.password, auth.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ message: 'mot de passe incorrecte' });
          }
          // création d'un token d'authentication avec durée de session de 24h
          res.status(200).json({
            userId: auth._id,
            token: jwt.sign(
              { userId: auth._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' })
          });
        })
        .catch(error => {
          console.log(error);
          res.status(500).json({ error });
        });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
}