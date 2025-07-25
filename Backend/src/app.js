import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import fileRouter from './routes/file.route.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))


app.get('/', (req, res) => {
  res.send('Welcome to the AirBridge Backend!');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/file', fileRouter);


export default app;