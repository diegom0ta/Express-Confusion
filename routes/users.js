var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router
	.route('/')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		if (authenticate.verifyAdmin(req.user)) {
			User.find({})
				.then((user) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(user);
				})
				.catch((err) => next(err));
		} else {
			var err = new Error('You are not admin.');
			err.status = 403;
			next(err);
		}
	});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
	User.register(
		new User({ username: req.body.username }),
		req.body.password,
		(err, user) => {
			if (err) {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.json({ err });
			} else {
				if (req.body.firstname) user.firstname = req.body.firstname;
				if (req.body.lastname) user.lastname = req.body.lastname;
				user.save((err, user) => {
					if (err) {
						res.statusCode = 500;
						res.setHeader('Content-Type', 'application/json');
						res.json({ err });
						return;
					}
					passport.authenticate('local')(req, res, () => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json({
							success: true,
							status: 'Successfully registered',
						});
					});
				});
			}
		}
	);
});

router.post(
	'/login',
	cors.corsWithOptions,
	passport.authenticate('local'),
	(req, res) => {
		var token = authenticate.getToken({ _id: req.user._id });
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json({
			success: true,
			status: 'Successfully logged in.',
			token,
		});
	}
);

router.get('/logout', (req, res, next) => {
	if (req.session) {
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	} else {
		var err = new Error('You are not logged in.');
		err.status = 403;
		next(err);
	}
});

router.get(
	'/facebook/token',
	passport.authenticate('facebook-token'),
	(req, res) => {
		if (req.user) {
			var token = authenticate.getToken({ _id: req.user._id });
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json({
				success: true,
				status: 'Successfully logged in.',
				token,
			});
		}
	}
);

module.exports = router;
