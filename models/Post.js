import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
	{
		text: {
			type: String,
			required: true,
		},
		imageUrl: String,
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		comments: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				username: {
					type: String,
					required: true,
				},
				avatar: {
					type: String,
				},
				comment: {
					type: String,
					required: true,
				},
				default: [],
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Post', PostSchema);
