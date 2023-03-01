import express from 'express';

const app = express();

app.get('/', (req, res) => {
	res.send('hello');
});

app.listen(8080, (err) => {
	if (err) {
		return console.log('err', err);
	}

	console.log('server start');
});
