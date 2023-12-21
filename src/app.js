import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.disable('x-powered-by');

app.use(router);
app.use(express.static(path.join(__dirname, '../public')));

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
