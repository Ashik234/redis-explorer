import express from 'express';
import cors from 'cors';
import userRoutes from './controllers/userController.js';

const app = express();
app.use(cors());
app.use(express.json());

// Mount user routes at /users
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Redis Explorer Backend Running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});