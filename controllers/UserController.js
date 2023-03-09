import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import UserModel from '../models/User.js';

const transporter = nodemailer.createTransport({
	direct: true,
	host: 'smtp.mail.ru',
	port: 465,
	auth: {
		user: 'aarizona3@mail.ru',
		pass: '0bPD1xnaDfd52awVehKU',
	},
	secure: true,
});

export const register = async (req, res) => {
	try {
		const password = req.body.password;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		let confirmCode = Math.floor(Math.random() * 999999);

		const doc = new UserModel({
			email: req.body.email,
			fullName: req.body.fullName,
			avatarUrl: req.body.avatarUrl,
			coverUrl: req.body.coverUrl,
			following: req.body.following,
			followers: req.body.followers,
			passwordHash: hash,
			confirmCode,
		});

		doc.confirmCode = confirmCode;

		let mailOptions = {
			from: 'aarizona3@mail.ru',
			to: doc.email,
			subject: 'Login Confirm Code',
			text: 'Confirm Code: ' + confirmCode,
		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				return console.log(error);
			}
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
};

export const login = async (req, res) => {
	try {
		const user = await UserModel.findOne({ email: req.body.email });
		if (!user) {
			return res.status(400).json({
				message: 'User not found',
			});
		}

		const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

		if (!isValidPass) {
			return res.status(400).json({
				message: 'Wrong login or password',
			});
		}

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
			message: 'Failed to login',
		});
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await UserModel.findById(req.userId);

		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		const { passwordHash, ...userData } = user._doc;

		res.json(userData);
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'No access',
		});
	}
};

export const UpdateAvaratUrl = async (req, res) => {
	try {
		const user = await UserModel.findById(req.params.id);

		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		user.avatarUrl = req.body.avatarUrl;

		await user.save();

		const { passwordHash, ...userData } = user._doc;

		res.json(userData);
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'Failed to update image URL',
		});
	}
};

export const UpdateCovertUrl = async (req, res) => {
	try {
		const user = await UserModel.findById(req.params.id);

		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		user.coverUrl = req.body.coverUrl;

		await user.save();

		const { passwordHash, ...userData } = user._doc;

		res.json(userData);
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'Failed to update image URL',
		});
	}
};
