import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { userController, postController } from './controllers/index.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';

mongoose
	.connect('mongodb+srv://Akif:Akif1995@cluster0.g6v2zjb.mongodb.net/tweeter')
	.then(() => console.log('db ok'))
	.catch((err) => console.log(err));

const app = express();

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, 'uploads');
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage });
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(__dirname + '/uploads/'));

app.post('/auth/login', loginValidation, handleValidationErrors, userController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, userController.register);
app.get('/auth/me', checkAuth, userController.getMe);

app.post('/users/:userId/save-post/:postId', checkAuth, userController.savePost);
app.post('/users/:userId/like-post/:postId', checkAuth, userController.likes);
app.get('/users/:userId/save-post', userController.getPosts);
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUser);
app.put('/users/:id/avatarUrl', checkAuth, userController.UpdateAvaratUrl);
app.put('/users/:id/coverUrl', checkAuth, userController.UpdateCovertUrl);
app.put('/users/:id/bio', checkAuth, userController.UpdateBio);
app.put('/users/following/:id', checkAuth, userController.following);
app.put('/users/unfollowing/:id', checkAuth, userController.unfollowing);
app.get('/users/flw/:id', userController.myFollowers);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`,
	});
});

app.get('/posts', postController.getAll);
app.get('/posts/:id', postController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, postController.create);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, postController.update);
app.put('/posts/comments/post', checkAuth, postController.comments);

app.listen(8080, (err) => {
	if (err) {
		return console.log('err', err);
	}

	console.log('server start');
});
