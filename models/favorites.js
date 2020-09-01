const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteDishSchema = new Schema({
	dish: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Dishes',
	},
});

const favoriteSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		favoriteDishes: [favoriteDishSchema],
	},
	{
		timestamps: true,
	}
);

var Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;
