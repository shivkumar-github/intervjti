const jwt = require('jsonwebtoken');

module.exports.decodeTokenIfExists = (req, res, next) => {
	const header = req.headers.authorization;
	if (!header || !header.startsWith('Bearer ')) {
		req.user = null;
		return next();
	}

	const token = header.split(' ')[1];
	jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
		// console.log(decoded);
		if (err) {
			req.user = null;
		}
		else {
			req.user = decoded;
		}
		next(); // neccessary while writing middlewares.
	});

};