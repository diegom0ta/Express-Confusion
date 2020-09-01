const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');
const cors = require('./cors');

const promRouter = express.Router();

promRouter.use(bodyParser.json());

promRouter
	.route('/')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Promotions.find({})
			.then((promotions) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(promotions);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Promotions.create(req.body)
				.then((promotion) => {
					console.log('Promotion created ', promotion);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(promotion);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot POST on /promotions');
		}
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot PUT on /promotions');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Promotions.remove({})
				.then((resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot DELETE on /promotions');
		}
	});

promRouter
	.route('/:id')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Promotions.findById(req.params.id)
			.then((promotion) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(promotion);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot POST on /promotions/:id');
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Promotions.findByIdAndUpdate(
				req.params.id,
				{
					$set: req.body,
				},
				{ new: true }
			)
				.then((promotion) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(promotion);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot PUT on /promotions/:id');
		}
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Promotions.findByIdAndRemove(req.params.id)
				.then((resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot DELETE on /promotions/:id');
		}
	});

module.exports = promRouter;
