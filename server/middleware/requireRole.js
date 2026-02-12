module.exports.requireRole = (role) => {
	return (req, res, next) => {
		if (req.user.role !== role && req.user.role!=='admin') { // allows student access to admin bcz admin is also student
			return res.status(403).json({
				success: false,
				message: 'You do not have access to this!'
			});
		}
		next();
	};
};