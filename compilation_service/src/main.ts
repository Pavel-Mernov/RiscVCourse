import express from 'express';
import { compile } from './endpoints/run.ts';



const app = express();


const PORT = 3000;

// app.use(bodyParser.text({ type: '*/*' }));
app.use(express.json());

app.post('/compile', compile);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
