const { json } = require('express');
const Sauce = require('../models/sauce')
const fs = require('fs');
const { log } = require('console');

//affichage de toutes les sauces
exports.allSauce = (req, res, next) => {
    Sauce.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(400).json({ error }));
}

//ajouter une sauce
exports.addSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

//page pour une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => {
            console.log(error);
            res.status(404).json({ error });
        });
}

//modifier une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
}

//supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
}

//like ou dislike les sauces
exports.likeSauce = function (req, res, next) {
    Sauce.findOne({ _id: req.params.id })
        .then(function (sauce) {
            switch (req.body.like) {
                //si likes = 1 == j'aime
                case 1:
                    if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }
                            })
                            .then(function () {
                                res.status(201).json({ message: "ajout d'un like" });
                            })
                            .catch(function (error) {
                                res.status(400).json({ error: error });
                            });
                    }
                    break;

                 //si likes = -1 == j'aime pas                  
                case -1:
                    if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }
                            })
                            .then(function () {
                                res.status(201).json({ message: "ajout d'un dislkike" });
                            })
                            .catch(function (error) {
                                res.status(400).json({ error: error });
                            });
                    }
                    break;

                //si likes = 0 == annulation du like ou dislike
                case 0:
                    if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }
                            })
                            .then(function () {
                                res.status(201).json({ message: "annulation du  dislike" });
                            })
                            .catch(function (error) {
                                res.status(400).json({ error: error });
                            });
                    }

                    if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }
                            })
                            .then(function () {
                                res.status(201).json({ message: "annulation du like" });
                            })
                            .catch(function (error) {
                                res.status(400).json({ error: error });
                            });
                    }
                    break;

            }
        })
}




