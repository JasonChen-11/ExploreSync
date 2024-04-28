import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.mjs';
import groupRoutes from './routes/groupRoutes.mjs';
import yelpRoutes from './routes/yelpRoutes.mjs';
import eventRoutes from './routes/eventRoutes.mjs';
import locationRoutes from './routes/locationRoutes.mjs'
import session from "express-session";
import { groupSocket } from './sockets/groupSocket.mjs';
import MongoStore from 'connect-mongo';

mongoose.connect(process.env.MONGOURI);

const PORT = 4000;
const app = express();
const httpServer = createServer(app);


app.use(express.json());

app.use(
  session({
    secret: "please change this secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: 'Strict'
    },
    store: MongoStore.create({ 
      client: mongoose.connection.getClient(),
      touchAfter: 24 * 3600,
      autoRemove: 'native' 
    })
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: 'Content-Type',
  })
);

app.use(function (req, res, next) {
  console.log("HTTP request", req.session.username, req.method, req.url, req.body);
  next();
});

groupSocket(httpServer);

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/yelp', yelpRoutes);
app.use('/api/events', eventRoutes);

export const server = httpServer.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log('HTTP server on http://localhost:%s', PORT);
});
