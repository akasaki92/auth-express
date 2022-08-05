const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
	try {
		// get the token from authorization header
		const token = await request.headers.authorization.split(" ")[1];
		// check if the token matches thes supposed origin
		const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");
		// retrieve the user details of the logged in user
		const user = await decodedToken;
		// pass the user down to the endpoint here
		request.user = user;
		// pass down functionally to the endpoint	
		next();
	} catch (error) {
		response.status(401).json({
			error: new Error("Invalid request!"),
		});
	}
};
