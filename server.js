const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const session = require('express-session');
const useragent = require('express-useragent');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const axios = require('axios').create({
  httpsAgent: new require('https').Agent({  
    rejectUnauthorized: false 
  })
});
const OWNER_ID = '5019818643';
const TOKEN = '8055291382:AAGJYycInowWDSs9N_nxIwCLdoVd2DjCTXQ';
  const bot = new TelegramBot(TOKEN, { polling: true});
mongoose.set('strictQuery', true);
// MongoDB connection setup
const mongoUri = "mongodb+srv://shivamnox0:MCE3LdkkkGWXONuz@cluster0.y9ud148.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));
const app = express();

// Setup
app.use(useragent.express());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true
}));

// In-memory session tracking (for demo only)
const activeSessions = {};

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    const sessionId = req.sessionID;
    req.session.user = username;

    // Save session data
    activeSessions[sessionId] = {
      user: username,
      userAgent: req.useragent.source,
      createdAt: new Date().toLocaleString()
    };

    const sessionInfo = {
      user: username,
      userAgent: req.useragent.source,
      browser: req.useragent.browser,
      os: req.useragent.os,
      platform: req.useragent.platform,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      createdAt: formatDateInKolkata(new Date())
    };

    // Save session
    activeSessions[sessionId] = sessionInfo;

    // Format message for Telegram
    const message = `<b>🔐 New Login Alert</b>\n\n` +
      `<b>User:</b> ${sessionInfo.user}\n` +
      `<b>Browser:</b> ${sessionInfo.browser}\n` +
      `<b>OS:</b> ${sessionInfo.os}\n` +
      `<b>Platform:</b> ${sessionInfo.platform}\n` +
      `<b>IP:</b> ${sessionInfo.ip}\n` +
      `<b>Session ID:</b> <code>${sessionId}</code>\n` +
      `<b>Time:</b> ${sessionInfo.createdAt}`;

    // Send to Telegram
    bot.sendMessage(OWNER_ID, message, {
      parse_mode: 'HTML'
    });

    return res.redirect('/cloud');
  } else {
    return res.send('Login failed. <a href="/login">Try again</a>');
  }
});


// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Logout error');
    res.send(`
             <html>
            <head>
                <title>Logged Out</title>
                <style>
                    body {
                        background: #000;
                        color: #0ff;
                        font-family: Arial;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        text-align: center;
                    }
                    a {
                        color: #0ff;
                        margin-top: 20px;
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h2>You are now logged out.</h2>
                <a href="/login">Login again</a>
            </body>
        </html>
    `);
  });
});
// Middleware for auth
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user === 'admin') {
    return next();
  }
  res.redirect('/login');
};

      const auth = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).send('Authentication required.');
        }

        const base64 = authHeader.split(' ')[1];
        const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');
        if (user === 'Shivamnox' && pass === 'shiv766492') {
            return next();
        }

        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).send('Access denied.');
    };

app.get('/activesession', auth, (req, res) => {
  let html = `
    <h2 style="color:#0ff;">Active Sessions</h2>
    <table border="1" cellpadding="10" style="color:#0ff; background:#000;">
      <tr><th>Session ID</th><th>User</th><th>Device</th><th>Created</th><th>Action</th></tr>
  `;

  for (let sessionId in activeSessions) {
    const session = activeSessions[sessionId];
    html += `
      <tr>
        <td>${sessionId}</td>
        <td>${session.user}</td>
        <td>${session.userAgent}</td>
        <td>${session.createdAt}</td>
        <td><a href="/deactivate?sid=${sessionId}" style="color:#f00;">Deactivate</a></td>
      </tr>
    `;
  }

  html += `</table><br/><a href="/cloud" style="color:#0ff;">Back to Cloud</a>`;
  res.send(html);
});



app.get('/deactivate', (req, res) => {
  const sid = req.query.sid;

  if (activeSessions[sid]) {
    // Delete from custom session tracker
    delete activeSessions[sid];

    // Destroy from express-session store
    req.sessionStore.destroy(sid, (err) => {
      if (err) {
        console.error('Failed to destroy session:', err);
        return res.send('Failed to deactivate session.');
      }

      // If current session, also destroy local session
      if (sid === req.sessionID) {
        req.session.destroy(() => {
          return res.redirect('/login');
        });
      } else {
        res.redirect('/activesession');
      }
    });
  } else {
    res.send('Session not found.');
  }
});


  // Function to format date in Kolkata (IST) timezone
function formatDateInKolkata(date) {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata',
    hour12: true // ✅ Use 12-hour format with AM/PM
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', options).formatToParts(date);

  let day, month, year, hour, minute, second, dayPeriod;

  formattedDate.forEach(({ type, value }) => {
    if (type === 'day') day = value;
    if (type === 'month') month = value;
    if (type === 'year') year = value;
    if (type === 'hour') hour = value;
    if (type === 'minute') minute = value;
    if (type === 'second') second = value;
    if (type === 'dayPeriod') dayPeriod = value;
  });

  return `${day}-${month}-${year} : ${hour}:${minute}:${second} ${dayPeriod}`;
}
// Serve the index.html file directly when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/p', (req, res) => {
  res.sendFile(path.join(__dirname, 'normal.html'));
});
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/hiva', (req, res) => {
    const accessTime = formatDateInKolkata(new Date());
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];


    const message = `
<b>🔐 /Hiva Page Accessed</b>
<b>🕒 Time (IST):</b> ${accessTime}
<b>🌐 IP:</b> ${ipAddress}
<b>📱 Device:</b> ${userAgent}
`;

    bot.sendMessage(OWNER_ID, message, {
      parse_mode: 'HTML',
    });
  res.sendFile(path.join(__dirname, 'hiva.html'));
});
  require('./bot')(app, mongoose, express, bot, authMiddleware);
require('./shedule')(express, app, mongoose, authMiddleware, bot);
require('./tools/tool')(app, mongoose, bot, express, path, authMiddleware);

// Express server for webhook or other purposes
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});




//Uptimer js

const URLs = [
  "https://hail-torpid-meteor.glitch.me"
  ];
const TIMEOUT = 30000;

async function wakeAndPing(URL) {
  try {
    console.log(`Waking Up ${URL}...`);
    await axios.get(URL, { timeout: TIMEOUT });
    
    console.log(`Pinged ${URL} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error(`Error waking/pinging ${URL}: ${error.message}`);
      }
  }
async function pingAll() {
  for (const URL of URLs) {
    wakeAndPing(URL);
    }
  }
setInterval(pingAll, 180000);
