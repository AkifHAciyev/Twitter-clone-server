import mongoose, { Schema } from 'mongoose';

const UserSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		passwordHash: {
			type: String,
			required: true,
		},
		avatarUrl: String,
		coverUrl: String,
		bio: String,
		confirmCode: String,
		savedPosts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Post',
			},
		],
		likes: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Post',
			},
		],
		Followers: {
			type: Array,
		},
		Following: {
			type: Array,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('User', UserSchema);
