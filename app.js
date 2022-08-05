const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// require database connection
const dbConnect = require("./db/dbConnect");
// execute database connection
const User = require("./db/userModel");
const auth = require("./auth");
dbConnect();

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, PATCH, OPTIONS"
	);
	next();
});
// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.get("/", (request, response, next) => {
// 	response.json({ message: "Hey! This is your server response!" });
// 	next();
// });

app.get("/free", (request, response) => {
	response.json({ message: "This Free access" });
});
app.get("/auth", auth, (request, response) => {
	response.json({ message: "Your are authorized" });
});
// login endpoint
app.post("/login", (request, response) => {
	// check if email exists
	User.findOne({ email: request.body.email })
		// if email exists
		.then((user) => {
			// compare password entered and the hashed password	found
			bcrypt
				.compare(request.body.password, user.password)
				// if password matches
				.then((passwordCheck) => {
					// check if the password matches
					if (!passwordCheck) {
						return response.status(400).send({
							message: "Password does not match",
							error,
						});
					}
					// create jwt token
					const token = jwt.sign(
						{
							userId: user._id,
							userEmail: user.email,
						},
						"RANDOM-TOKEN",
						{ expiresIn: "24h" }
					);

					// return success response
					response.status(200).send({
						message: "Login Successful",
						email: user.email,
						token,
					});
				})
				// catch error if password does not match
				.catch((error) => {
					response.status(400).send({
						message: "Password does not match",
						error,
					});
				});
		})
		// catch error if email does not exist
		.catch((e) => {
			response.status(404).send({
				message: "Email not found",
				e,
			});
		});
});

// register endpoint
app.post("/register", (request, response) => {
	// hash the password
	bcrypt
		.hash(request.body.password, 10)
		.then((hashedPassword) => {
			// create a new user instance and collect the data
			const user = new User({
				email: request.body.email,
				password: hashedPassword,
			});
			// save the new user
			user.save()
				// return success if the new user is added to database successfully
				.then((result) => {
					response.status(201).send({
						message: "User Created Successfully",
						result,
					});
				})
				.catch((error) => {
					response.status(500).send({
						message: "Error creating user",
						error,
					});
				});
		})
		// catch error if the password hash isn't successfully
		.catch((e) => {
			response.status(500).send({
				message: "Password was not hashed successfully",
				e,
			});
		});
});

module.exports = app;
