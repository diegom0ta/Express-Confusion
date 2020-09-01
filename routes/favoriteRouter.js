const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
	.route('/')
	.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyUser === req.user) {
			Favorites.find({})
				.populate('user', 'favoriteDishes')
				.then((favorites) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorites);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot GET from /favorites');
		}
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyUser === req.user) {
			if (Dishes.findOne(req.body.favoriteDishes, '_id')) {
				Favorites.create(req.body)
					.then((favorite) => {
						console.log('Favorite dish added ', favorite);
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorite);
					})
					.catch((err) => next(err));
			} else {
				Dishes.create({
					name,
					desc,
					label,
					comments,
					category,
					price,
				}).then(Favorites.create(req.body));
			}
		} else {
			res.statusCode = 403;
			res.end('Cannot POST on /favorites');
		}
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot PUT on /favorites');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyUser === req.user) {
			Favorites.remove({})
				.then((resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot DELETE on /favorites');
		}
	});

favoriteRouter
	.route('/:id')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyUser === req.user) {
			Favorites.create(req.params.id)
				.then((favorite) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorite);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot POST on /favorites/:id');
		}
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyUser === req.user) {
			Leaders.findByIdAndRemove(req.params.id)
				.then((resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot DELETE on /favorites');
		}
	});

module.exports = leaderRouter;
