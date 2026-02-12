const jwt = require('jsonwebtoken');

module.exports.decodeToken = (req, res, next) => {
	const header = req.headers.authorization;
	if (!header || !header.startsWith('Bearer ')) {
		return res.status(401).json({
			success: false, 
			message:'token not valid format!'
		});
	}

	const token = header.split(' ')[1];
	jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
		// console.log(decoded);
		if (err) return res.status(403).json({
			success: false, 
			message: 'token not verified!'
		});
		req.user = decoded;
		next(); // neccessary while writing middlewares.
	});

};