const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/images');
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

const imageFileFilter = (req, file, cb) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/))
		return cb(new Error('Only images are accepted.'), false);
	else return cb(null, true);
};

const upload = multer({ storage, fileFilter: imageFileFilter });

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter
	.route('/')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot GET from /imageUpload');
	})
	.post(
		cors.corsWithOptions,
		authenticate.verifyUser,
		upload.single('imageFile'),
		(req, res) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(req.file);
		}
	)
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot PUT on /imageUpload');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('Cannot DELETE on /imageUpload');
	});

module.exports = uploadRouter;
