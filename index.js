import express from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { registerValidation } from './validations.js';
import UserModel from './models/User.js';

const app = express();
app.use(express.json());

mongoose
	.connect('mongodb+srv://Akif:Akif1995@cluster0.g6v2zjb.mongodb.net/tweeter')
	.then(() => console.log('db ok'))
	.catch((err) => console.log(err));

app.post('/auth/register', registerValidation, async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors.array());
		}

		const password = req.body.password;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const doc = new UserModel({
			email: req.body.email,
			fullName: req.body.fullName,
			avatarUrl: req.body.avatarUrl,
			passwordHash: hash,
		});

		const user = await doc.save();

		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secret123',
			{
				expiresIn: '30d',
			}
		);

		const { passwordHash, ...userData } = user._doc;

		res.json({
			...userData,
			token,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'Failed to register',
		});
	}
});

app.listen(8080, (err) => {
	if (err) {
		return console.log('err', err);
	}

	console.log('server start');
});
