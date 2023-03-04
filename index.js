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
app.use('/upload', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, userController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, userController.register);
app.get('/auth/me', checkAuth, userController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/${req.originalname}`,
	});
});

app.get('/posts', postController.getAll);
app.get('/posts/:id', postController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, postController.create);
app.delete('/posts/:id', checkAuth, postController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, postController.update);

app.listen(8080, (err) => {
	if (err) {
		return console.log('err', err);
	}

	console.log('server start');
});
