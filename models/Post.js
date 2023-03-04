import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
	{
		text: {
			type: String,
			required: true,
		},
		imageUrl: String,
		comentCount: {
			type: Number,
			default: 0,
		},
		retweetsCount: {
			type: Number,
			default: 0,
		},
		savedCount: {
			type: Number,
			default: 0,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Post', PostSchema);
