//importer express, mongoose, bodyParser, cors et path
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors');
const path = require('path');
require('dotenv').config()


// l'application contient seulement express
const app = express();

// requiert le dossier des routes
const authRoute = require('./routes/auth')
const sauceRoute = require('./routes/sauce')

//connection a mongoDB
mongoose.connect(process.env.MONGODB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//intercepte  les requetes au content-type Json
app.use(express.json());
//module npm utilisé pour traiter les données envoyées dans un corps de requete HTTP sous format Json.
app.use(bodyParser.json());
//permet d'empecher système de sécurité cors et permet nos deux origines de communiquer (localhost:3000 et 2400)
app.use(cors());

//enregistrement router
app.use('/api/auth', authRoute);
app.use('/api/sauces', sauceRoute);
//indique à Express qu'il faut gérer images de manière statique à chaque fois qu'elle reçoit une requête vers la route /images (sous-répertoire, __dirname)
app.use('/images', express.static(path.join(__dirname, 'images')))

//exporter l'application
module.exports = app

