import { ThirdwebAuth } from '@thirdweb-dev/auth/express';
import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm';
import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const https = require('https');
const fs = require('fs');

config();

const app = express();
const PORT = 8000;

const corsOption = {
  origin: [
    'http://localhost:3000',
    'https://localhost:3001',
    'http://localhost:5173',
    'http://localhost:3001',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};

app.use(cors(corsOption));

// app.use(cookieParser('_'));

const options = {
  key: fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem'),
};

// NOTE: This users map is for demo purposes. Its used to show the power of
// what you can accomplish with the Auth callbacks. In a production app,
// you would want to store this data somewhere externally, like a database or
// on-chain.
const users: Record<string, any> = {};

const { authRouter, authMiddleware, getUser } = ThirdwebAuth({
  domain: 'localhost:3000',
  wallet: new PrivateKeyWallet(
    'b414a3e625d1faa35b56737185fb14de1628ec3b4937613f3c55234e7c48f1fa'
  ),
  // NOTE: All these callbacks are optional! You can delete this section and
  // the Auth flow will still work.
  // cookieOptions: {
  //   // sameSite: 'none',

  // },
  callbacks: {
    onLogin: async (address) => {
      // Here we can run side-effects like creating and updating user data
      // whenever a user logs in.
      if (!users[address]) {
        users[address] = {
          created_at: Date.now(),
          last_login_at: Date.now(),
          num_log_outs: 0,
        };
      } else {
        users[address].last_login_at = Date.now();
      }

      // We can also provide any session data to store in the user's session.
      return { role: ['admin'] };
    },
    onUser: async (user) => {
      // Here we can run side-effects whenever a user is fetched from the client side
      if (users[user.address]) {
        users[user.address].user_last_accessed = Date.now();
      }

      // And we can provide any extra user data to be sent to the client
      // along with the default user object.
      return users[user.address];
    },
    onLogout: async (user) => {
      // Finally, we can run any side-effects whenever a user logs out.
      if (users[user.address]) {
        users[user.address].num_log_outs++;
      }
    },
  },
});

// We add the auth middleware to our app to let us access the user across our API
app.use(authMiddleware);

// Now we add the auth router to our app to set up the necessary auth routes
app.use('/auth', authRouter);

app.get('/secret', authMiddleware, async (req, res) => {
  const user = await getUser(req);

  console.log(user);

  if (!user) {
    return res.status(401).json({
      message: 'Not authorized.',
    });
  }

  return res.status(200).json({
    message: "This is a secret... don't tell anyone.",
  });
});

// const server = https.createServer(options, app);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
