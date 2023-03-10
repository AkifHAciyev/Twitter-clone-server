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
		followers: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		following: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		confirmCode: String,
		savedPosts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Post',
			},
		],
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('User', UserSchema);
