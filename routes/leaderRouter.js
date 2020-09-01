const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Leaders = require('../models/leaders');
const authenticate = require('../authenticate');
const cors = require('./cors');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter
	.route('/')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Leaders.find({})
			.then((leaders) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(leaders);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Leaders.create(req.body)
				.then((leader) => {
					console.log('Leader created ', leader);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(leader);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot POST on /leader');
		}
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot PUT on /leader');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Leaders.remove({})
				.then((resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot DELETE on /leader');
		}
	});

leaderRouter
	.route('/:id')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Leaders.findById(req.params.id)
			.then((leader) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(leader);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot POST on /leader/:id');
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Leaders.findByIdAndUpdate(
				req.params.id,
				{
					$set: req.body,
				},
				{ new: true }
			)
				.then((leader) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(leader);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot PUT on /leader/:id');
		}
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Leaders.findByIdAndRemove(req.params.id)
				.then((resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot DELETE on /leader');
		}
	});

module.exports = leaderRouter;
