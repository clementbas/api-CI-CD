import express from 'express';
import cors from 'cors';
import v1Routes from './routes/v1/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', v1Routes);

app.use(notFound);
app.use(errorHandler);

export default app;
