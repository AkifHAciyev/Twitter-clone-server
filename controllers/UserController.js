import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import UserModel from '../models/User.js';
import PostModel from '../models/Post.js';

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

export const getAllUsers = async (req, res) => {
	try {
		const users = await UserModel.find().exec();
		res.json(users);
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'Failed to find users',
		});
	}
};

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

export const UpdateBio = async (req, res) => {
	console.log(req.params.id);
	try {
		const user = await UserModel.findById(req.params.id);
		console.log(user);
		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		user.bio = req.body.bio;

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

export const savePost = async (req, res) => {
	const { userId, postId } = req.params;
	try {
		const user = await UserModel.findById(userId);
		const post = await PostModel.findById(postId);
		if (!user || !post) {
			return res.status(404).json({ message: 'User or post not found' });
		}

		const postIndex = user.savedPosts.indexOf(postId);
		if (postIndex === -1) {
			user.savedPosts.push(postId);
		} else {
			user.savedPosts.splice(postIndex, 1);
		}

		await user.save();

		res.json({ message: 'Post saved successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const likes = async (req, res) => {
	const { userId, postId } = req.params;
	try {
		const user = await UserModel.findById(userId);
		const post = await PostModel.findById(postId);
		if (!user || !post) {
			return res.status(404).json({ message: 'User or post not found' });
		}

		const postIndex = user.likes.indexOf(postId);
		if (postIndex === -1) {
			user.likes.push(postId);
		} else {
			user.likes.splice(postIndex, 1);
		}

		await user.save();

		res.json({ message: 'Post saved successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const getPosts = async (req, res) => {
	try {
		const user = await UserModel.findById(req.params.userId).populate('savedPosts');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json(user.savedPosts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error' });
	}
};
export const following = async (req, res) => {
	if (req.params.id !== req.body.userDataId) {
		const user = await UserModel.findById(req.params.id);
		const otheruser = await UserModel.findById(req.body.userDataId);
		if (!user.Followers.includes(req.body.userDataId)) {
			await user.updateOne({ $push: { Followers: req.body.userDataId } });
			await otheruser.updateOne({ $push: { Following: req.params.id } });
			return res.status(200).json({ message: 'User has followed' });
		} else {
			return res.status(400).json({ message: 'You already follow this user' });
		}
	} else {
		res.status(400).json({ message: 'You can not follow yourself' });
	}
};

export const unfollowing = async (req, res) => {
	if (req.params.id !== req.body.userDataId) {
		const user = await UserModel.findById(req.params.id);
		const otheruser = await UserModel.findById(req.body.userDataId);
		if (user.Followers.includes(req.body.userDataId)) {
			await user.updateOne({ $pull: { Followers: req.body.userDataId } });
			await otheruser.updateOne({ $pull: { Following: req.params.id } });
			return res.status(200).json({ message: 'User has been unfollowed' });
		} else {
			return res.status(400).json({ message: 'You are not following this user' });
		}
	} else {
		res.status(400).json({ message: 'You cannot unfollow yourself' });
	}
};

export const myFollowers = async (req, res) => {
	try {
		const user = await UserModel.findById(req.params.id);
		const followersPost = await Promise.all(
			user.Following.map((item) => {
				return PostModel.find({ user: item });
			})
		);
		res.status(200).json(followersPost);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error' });
	}
};

export const getUser = async (req, res) => {
	console.log(req.params);
	try {
		const user = await UserModel.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error' });
	}
};
