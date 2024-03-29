import PostModel from '../models/Post.js';

export const getAll = async (req, res) => {
	try {
		const posts = await PostModel.find().populate('user').exec();
		res.json(posts);
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'Failed to find posts',
		});
	}
};

export const getOne = async (req, res) => {
	try {
		const postId = req.params.id;
		console.log(postId);

		PostModel.findByIdAndUpdate(
			{
				_id: postId,
			},
			{
				returnDocument: 'after',
			},
			(err, doc) => {
				if (err) {
					console.log(err);

					return res.status(500).json({
						message: 'Failed to find posts',
					});
				}

				if (!doc) {
					return res.status(404).json({
						message: 'Failed to find posts',
					});
				}
				res.json(doc);
			}
		);
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'Failed to find posts',
		});
	}
};

export const create = async (req, res) => {
	try {
		const doc = new PostModel({
			text: req.body.text,
			imageUrl: req.body.imageUrl,
			user: req.userId,
		});

		const post = await doc.save();
		res.json(post);
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'Failed to create post',
		});
	}
};

export const update = async (req, res) => {
	try {
		const postId = req.params.id;

		await PostModel.updateOne(
			{
				_id: postId,
			},
			{
				text: req.body.text,
				imageUrl: req.body.imageUrl,
				user: req.userId,
			}
		);
		res.json({
			success: true,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			message: 'Failed to create post',
		});
	}
};

export const comments = async (req, res) => {
	try {
		const { comment, postId, avatar } = req.body;
		const comments = {
			user: req.body.userId,
			username: req.body.username,
			comment,
			avatar,
		};
		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).json({ message: 'Post not found' });
		}
		post.comments.push(comments);
		await post.save();
		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({
			message: 'Failed to create post',
		});
	}
};
