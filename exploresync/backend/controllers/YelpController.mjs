// Yelp API implmentation was inspired by https://github.com/tonybadguy/yelp-fusion

import yelp from 'yelp-fusion';

const client = yelp.client(process.env.YELP_KEY);

export const searchYelp = async (req, res) => {
	const {term, latitude, longitude, page, distance} = req.query;

	const searchRequest = {
		term: term,
		longitude: longitude,
    latitude: latitude,
		limit: 20,
		offset: (page - 1) * 20,
		radius: distance * 1000,
	};

	try {
		client.search(searchRequest).then(result => {
			const total = result.jsonBody.total;
			const businesses = result.jsonBody.businesses;

			return res.json({total, businesses});
		}).catch(err => {
			console.error(err);
			return res.status(500).json(err);
		});
		
	} catch (err) {
    return res.status(500).json(err);
  }
}