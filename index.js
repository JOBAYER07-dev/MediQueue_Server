const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://medi-queue-ecru.vercel.app',
      'https://medi-queue-l904wy4hv-jobayerhosen045-7207s-projects.vercel.app',
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// JWT Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ message: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Forbidden' });
    req.user = decoded;
    next();
  });
};

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('mediqueue');
    const tutorsCollection = db.collection('tutors');
    const bookingsCollection = db.collection('bookings');

    // JWT
    app.post('/jwt', (req, res) => {
      const token = jwt.sign(req.body, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      res.send({ token });
    });

    // GET ALL TUTORS (search + filter)
    app.get('/tutors', async (req, res) => {
      const { search, startDate, endDate } = req.query;
      const query = {};
      if (search) query.name = { $regex: search, $options: 'i' };
      if (startDate && endDate) {
        query.sessionStartDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      const result = await tutorsCollection.find(query).toArray();
      res.send(result);
    });

    // GET 6 TUTORS FOR HOME
    app.get('/tutors/home', async (req, res) => {
      const result = await tutorsCollection.find().limit(6).toArray();
      res.send(result);
    });

    // GET SINGLE TUTOR
    app.get('/tutors/:id', async (req, res) => {
      const result = await tutorsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // GET MY TUTORS
    app.get('/my-tutors/:email', verifyToken, async (req, res) => {
      const result = await tutorsCollection
        .find({ userEmail: req.params.email })
        .toArray();
      res.send(result);
    });

    // ADD TUTOR
    app.post('/tutors', verifyToken, async (req, res) => {
      const result = await tutorsCollection.insertOne(req.body);
      res.send(result);
    });

    // UPDATE TUTOR
    app.put('/tutors/:id', verifyToken, async (req, res) => {
      const result = await tutorsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
      );
      res.send(result);
    });

    // DELETE TUTOR
    app.delete('/tutors/:id', verifyToken, async (req, res) => {
      const result = await tutorsCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // ADD BOOKING
    app.post('/bookings', verifyToken, async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      await tutorsCollection.updateOne(
        { _id: new ObjectId(booking.tutorId) },
        { $inc: { totalSlot: -1 } },
      );
      res.send(result);
    });

    // GET MY BOOKINGS
    app.get('/bookings/:email', verifyToken, async (req, res) => {
      const result = await bookingsCollection
        .find({ studentEmail: req.params.email })
        .toArray();
      res.send(result);
    });

    // CANCEL BOOKING
    app.patch('/bookings/:id', verifyToken, async (req, res) => {
      const result = await bookingsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: 'cancelled' } },
      );
      res.send(result);
    });
  } catch (err) {
    // Log any database connection errors
    console.error("Database connection error:", err);
  }
}

run();

app.get('/', (req, res) => {
  res.send('MediQueue Server Running ✅');
});

app.listen(port, () => {
  console.log(`MediQueue Server is running on port: ${port}`);
});
