const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const cors = require('./cors');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
	.route('/')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Dishes.find({})
			.populate('comments.author')
			.then((dishes) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(dishes);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Dishes.create(req.body)
				.then((dish) => {
					console.log('Dish created ', dish);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot POST on /dishes');
		}
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot PUT on /dishes');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Dishes.remove({})
				.then((resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot DELETE on /dishes');
		}
	});

dishRouter
	.route('/:id')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Dishes.findById(req.params.id)
			.populate('comments.author')
			.then((dish) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(dish);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot POST on /dishes/:id');
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Dishes.findByIdAndUpdate(
				req.params.id,
				{
					$set: req.body,
				},
				{ new: true }
			)
				.then((dish) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot PUT on /dishes/:id');
		}
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Dishes.findByIdAndRemove(req.params.id)
				.then((resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('Cannot DELETE on /dishes/:id');
		}
	});

dishRouter
	.route('/:id/comments')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Dishes.findById(req.params.id)
			.populate('comments.author')
			.then((dish) => {
				if (dish != null) {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish.comments);
				} else {
					err = new Error('Dish not found ' + req.params.id);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Dishes.findById(req.params.id)
			.then((dish) => {
				if (dish != null) {
					req.body.author = req.user._id;
					dish.comments.push(req.body);
					dish
						.save()
						.then((dish) => {
							Dishes.findById(dish._id).then((dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(dish);
							});
						})
						.catch((err) => next(err));
				} else {
					err = new Error('Dish not found ' + req.params.id);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot PUT on /dishes');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			Dishes.findById(req.params.id)
				.then((dish) => {
					if (dish != null) {
						for (i = dish.comments.length - 1; i >= 0; i--) {
							dish.comments.id(dish.comments[i]._id).remove();
						}
						dish
							.save()
							.then((dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(dish);
							})
							.catch((err) => next(err));
					} else {
						err = new Error('Dish not found ' + req.params.id);
						err.status = 404;
						return next(err);
					}
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('You only can DELETE your own comment.');
		}
	});

dishRouter
	.route('/:id/comments/:commentId')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Dishes.findById(req.params.id)
			.populate('comments.author')
			.then((dish) => {
				if (dish != null && dish.comments.id(req.params.commentId) != null) {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish.comments.id(req.params.commentId));
				} else if (dish == null) {
					err = new Error('Dish not found ' + req.params.id);
					err.status = 404;
					return next(err);
				} else {
					err = new Error('Comment not found ' + req.params.commentId);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot POST on /dishes/:id/comments/:commentId');
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (req.params.id === req.user._id) {
			Dishes.findById(req.params.id)
				.then((dish) => {
					if (dish != null && dish.comments.id(req.params.commentId) != null) {
						if (req.body.rating) {
							dish.comments.id(req.params.commentId).rating = req.body.rating;
						}
						if (req.body.comment) {
							dish.comments.id(req.params.commentId).comment = req.body.comment;
						}
						dish
							.save()
							.then((dish) => {
								Dishes.findById(dish._id)
									.populate('comments.author')
									.then((dish) => {
										res.statusCode = 200;
										res.setHeader('Content-Type', 'application/json');
										res.json(dish);
									});
							})
							.catch((err) => next(err));
					} else if (dish == null) {
						err = new Error('Dish not found ' + req.params.id);
						err.status = 404;
						return next(err);
					} else {
						err = new Error('Comment not found ' + req.params.commentId);
						err.status = 404;
						return next(err);
					}
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('You can only PUT your own comment.');
		}
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (req.params.id === req.user._id) {
			Dishes.findById(req.params.id)
				.then((dish) => {
					if (dish != null && dish.comments.id(req.params.commentId) != null) {
						dish.comments.id(req.params.commentId).remove();
						dish
							.save()
							.then((dish) => {
								Dishes.findById(dish._id)
									.populate('comments.author')
									.then((dish) => {
										res.statusCode = 200;
										res.setHeader('Content-Type', 'application/json');
										res.json(dish);
									});
							})
							.catch((err) => next(err));
					} else if (dish == null) {
						err = new Error('Dish not found ' + req.params.id);
						err.status = 404;
						return next(err);
					} else {
						err = new Error('Comment not found ' + req.params.commentId);
						err.status = 404;
						return next(err);
					}
				})
				.catch((err) => next(err));
		} else {
			res.statusCode = 403;
			res.end('You can only DELETE your own comment.');
		}
	});

module.exports = dishRouter;
