import express from 'express';
import mongoose from 'mongoose';
import { registerValidation } from './validations.js';
import checkAuth from './utils/checkAuth.js';
import * as userController from './controllers/UserController.js';

mongoose
	.connect('mongodb+srv://Akif:Akif1995@cluster0.g6v2zjb.mongodb.net/tweeter')
	.then(() => console.log('db ok'))
	.catch((err) => console.log(err));

const app = express();
app.use(express.json());

app.post('/auth/login', userController.login);

app.post('/auth/register', registerValidation, userController.register);

app.get('/auth/me', checkAuth, userController.getMe);

app.listen(8080, (err) => {
	if (err) {
		return console.log('err', err);
	}

	console.log('server start');
});
