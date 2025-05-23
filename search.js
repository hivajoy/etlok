const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
module.exports = function(app, mongoose, File, bot, express) {
  
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


const TOKEN = '8055291382:AAGJYycInowWDSs9N_nxIwCLdoVd2DjCTXQ';
const OWNER_ID = '5019818643';
const ownerId  = '5019818643';
const ALLOWED_GROUP_ID = '-1001821054615';
const GroupLink = 'https://t.me/hivajoymovies';
const UpdateChannelId = '-1002598760582';
const UpdateChannelLink = 'https://t.me/Hivabyte';// Update channel
const dbChannelId = '-1001503630818';
const logChannelId = '-1002274317757';
 
  // Listen for messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
              handleKeywordSearch(chatId, msg.text.toLowerCase(), msg.message_id, userId);
            
});
  
  
  bot.sendMessage(OWNER_ID, 'Hyperspace File Started', {
  parse_mode: 'HTML',
});
  
  
  const { save } = require('./topfile');
const { getTopHashes } = require('./topfile');
    // ✅ Allow CORS for any domain
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or a specific domain instead of '*'
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json());

app.get('/stream', async (req, res) => {
  const query = req.query.q;
  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;
 const top = getTopHashes();

    // Fetch file names for each hash asynchronously
    const fileResults = await Promise.all(top.map(item => File.findOne({ uniqueId: item.hash })));

const FALLBACK_THUMB_URL = 'https://wallpaperaccess.com/full/4644839.jpg';

const messageArray = await Promise.all(fileResults.map(async (file, i) => {
  const item = top[i];
  const name = file?.name || 'Unknown File';
  let thumbUrl = FALLBACK_THUMB_URL;
  let link = file?.streamLink || '#';

  if (file?.thumbId) {
    try {
      const fetchedThumb = await bot.getFile(file.thumbId);
      thumbUrl = `https://api.telegram.org/file/bot${TOKEN}/${fetchedThumb.file_path}`;
    } catch (e) {
      console.warn(`⚠️ Failed to get file ${file.thumbId}:`, e.message);
    }
  }

  return `
    <li class="movie-card" onclick="window.open('${link}', '_blank')">
      <img src="${thumbUrl}" alt="${name}" />
      <div class="info">
        <div class="title">#${i + 1}. ${name}</div>
        <div class="usage">👁️ Viewed ${item.count} times</div>
      </div>
    </li>
  `;
}));



const message = messageArray.join('');



  
if (!query) return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🎬 Movie Finder</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    #bg-video {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -2;
      background:black;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(6px);
      z-index: -1;
    }

    .container {
      max-width: 520px;
      margin: 60px auto;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 0 30px rgba(0, 188, 212, 0.25);
      color: #f0f0f0;
      text-align: center;
      animation: fadeIn 1s ease-in-out;
    }

    h1 {
      font-size: 1.8em;
      color: #00e5ff;
      text-shadow: 0 0 8px #00e5ff;
      margin-bottom: 25px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    input[type="text"],
    button {
      padding: 14px;
      font-size: 1em;
      border-radius: 10px;
      border: none;
      box-sizing: border-box;
      transition: all 0.3s ease;
    }

    input[type="text"] {
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      box-shadow: inset 0 0 6px rgba(0, 188, 212, 0.5);
    }

    input[type="text"]:focus {
      outline: none;
      box-shadow: 0 0 12px rgba(0, 188, 212, 0.8);
    }

    button {
      background: linear-gradient(45deg, #00bcd4, #0097a7);
      color: #fff;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0, 188, 212, 0.4);
    }

    button:hover {
      transform: scale(1.03);
      background: linear-gradient(45deg, #00e5ff, #00acc1);
      box-shadow: 0 0 16px #00e5ff;
    }

ul.results {
  margin-top: 25px;
  padding: 0;
  list-style: none;
}

    ul.results li.movie-card {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 12px;
      box-shadow: 0 0 10px rgba(0, 188, 212, 0.15);
      transition: transform 0.3s ease, background 0.3s ease;
    }

    ul.results li.movie-card:hover {
      transform: translateY(-4px);
      background: rgba(0, 188, 212, 0.15);
    }

    ul.results li.movie-card img {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 8px;
      margin-right: 15px;
      flex-shrink: 0;
      border: 2px solid #00e5ff;
    }

    .info {
      display: flex;
      flex-direction: column;
    }

    .title {
      font-size: 1.05em;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .usage {
      font-size: 0.9em;
      color: #b2ebf2;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background: #00bcd4;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

@media screen and (max-width: 768px) {
  .container {
    margin: 30px 16px;
    padding: 20px;
    width: auto;
  }

  h1 {
    font-size: 1.5em;
  }

  form input[type="text"],
  form button {
    font-size: 0.95em;
    padding: 12px;
  }

  ul.results li.movie-card {
    flex-direction: row;
    padding: 10px;
  }

  ul.results li.movie-card img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }

  .title {
    font-size: 0.95em;
  }

  .usage {
    font-size: 0.85em;
  }
}

@media screen and (max-width: 480px) {
  .container {
    margin: 20px 12px;
    padding: 16px;
  }

  ul.results li.movie-card {
    flex-direction: column;
    align-items: flex-start;
  }

  ul.results li.movie-card img {
    margin: 0 0 8px 0;
    width: 100%;
    height: auto;
    max-height: 160px;
    object-fit: cover;
  }

  .info {
    width: 100%;
  }

  .title, .usage {
    text-align: left;
    word-break: break-word;
  }
}

  </style>
</head>
<body>

  <video id="bg-video" autoplay muted loop playsinline>
    <source src="https://1a-1791.com/video/fww1/6e/s8/2/V/J/i/H/VJiHy.haa.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  <div class="container">
    <h1>🎬 Search Your Favorite Movies</h1>
    <form action="/stream" method="GET">
      <input type="text" name="q" placeholder="Enter movie title..." value="${query || ''}" />
      <button type="submit">🔍 Search</button>
    </form>
    ${message ? `<ul class="results">${message}</ul>` : ''}
  </div>

</body>
</html>

`);


  // Get total count
  const totalCount = await File.countDocuments({ name: { $regex: query, $options: 'i' } });
  const totalPages = Math.ceil(totalCount / limit);

  // Get paginated results
  const files = await File.find({ name: { $regex: query, $options: 'i' } })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);

const cardsHtml = await Promise.all(
  files.map(async (vid) => {
    try {
      let thumbUrl;

      if (vid.thumbId) {
        try {
          const file = await bot.getFile(vid.thumbId);
          thumbUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
        } catch (e) {
          console.warn(`⚠️ Failed to get file ${vid.thumbId}:`, e.message);
          thumbUrl = 'https://wallpaperaccess.com/full/4644839.jpg';
        }
      } else {
        thumbUrl = 'https://wallpaperaccess.com/full/4644839.jpg';
      }

      const hasStream = vid.streamLink && vid.streamLink.startsWith("http");
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Unknown size';

  const mb = bytes / (1024 * 1024);
  if (mb > 1024) {
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  } else {
    return `${mb.toFixed(2)} MB`;
  }
}

      return `
        <div class="card" id="card-${vid._id}">
          <img src="${thumbUrl}" />
          <div class="card-title">${vid.name}</div>
          <div class="card-title">File Size: ${formatFileSize(vid.size)}</div>
          ${
            hasStream
              ? `<div class="link-area"><a href="${vid.streamLink}">▶️ Watch Now</a></div>`
              : `<button id="btn-${vid._id}" onclick="generateLink('${vid._id}', '${vid.uniqueId}')">▶️ Watch</button>
                 <div class="link-area" id="link-${vid._id}"></div>`
          }
        </div>`;
    } catch (err) {
      console.error(`❌ Failed to render card for file ${vid._id}:`, err.message);
      return ''; // still return empty string to avoid Promise.all failure
    }
  })
);
  

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${query || 'Movie Search'}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    /* Keep your existing styles */
    .pagination {
      text-align: center;
      margin-top: 30px;
    }
    .pagination a {
      margin: 0 10px;
      color: #00c6ff;
      text-decoration: none;
      font-weight: bold;
    }
    .pagination span {
      color: gray;
    }
     :root {
      --bg-color: #0e0e0e;
      --card-bg: rgba(255, 255, 255, 0.05);
      --text-color: #f0f0f0;
      --accent-gradient: linear-gradient(135deg, #00c6ff, #0072ff);
      --accent-hover: linear-gradient(135deg, #00bcd4, #0097a7);
      --fail-color: #f44336;
      --success-color: #4caf50;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      padding: 20px;
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 1.5em;
    }

    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
    }

    .card {
      background: var(--card-bg);
      backdrop-filter: blur(8px);
      padding: 12px;
      width: 300px;
      border-radius: 15px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
    }

    .card img {
      width: 100%;
      border-radius: 10px;
    }

    .card-title {
      margin-top: 8px;
      font-weight: 600;
      font-size: 15px;
      text-align: left;
    }

    button {
      display: block;
      width: 100%;
      margin-top: 15px;
      padding: 10px;
      background: var(--accent-gradient);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 1em;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
    }

    button:hover {
      background: var(--accent-hover);
      transform: scale(1.02);
    }

    .link-area {
      margin-top: 12px;
      text-align: center;
      font-size: 1em;
    }

    .link-area a {
      color: var(--success-color);
      text-decoration: none;
      font-weight: bold;
    }

    .link-area a:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .card {
        width: 100%;
        padding: 12px;
      }
          }
@keyframes smoothSpin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.smooth-spinner {
  display: inline-block;
  animation: smoothSpin 1s linear infinite;
  font-size: 1em;
  color: #e50914; /* Netflix red */
}
  </style>
</head>
<body>
<form action="/stream" method="GET" style="text-align: center; margin-bottom: 30px;">
  <input
    type="text"
    name="q"
    value="${query || ''}"
    placeholder="Search movies..."
    style="width: 90%; max-width: 400px; padding: 12px 16px; border-radius: 8px; border: none; font-size: 1em; background: #1e1e1e; color: #f0f0f0; box-shadow: 0 0 10px rgba(0,0,0,0.3);"
  />
</form>

<h2>Search Results for "${query}"</h2>

<div class="grid">
  ${cardsHtml.join('') || `<div class="no-results">❌ No results found for "${query}"</div>`}
</div>

${totalCount > limit ? `
<div class="pagination">
  ${prevPage ? `<a href="/stream?q=${encodeURIComponent(query)}&page=${prevPage}">⬅️ Previous</a>` : '<span>⬅️ Previous</span>'}
  ${nextPage ? `<a href="/stream?q=${encodeURIComponent(query)}&page=${nextPage}">Next ➡️</a>` : '<span>Next ➡️</span>'}
  <p style="text-align:center; color:gray;">Page ${page} of ${totalPages}</p>
</div>` : ''}
<script>
  async function generateLink(id, uniqueId) {
    const button = document.getElementById("btn-" + id);
    const linkDiv = document.getElementById("link-" + id);

    if (button) {
      button.disabled = true;
      button.style.display = 'none';
    }

    linkDiv.innerHTML = "<i class='fas fa-circle-notch smooth-spinner'></i> Generating...";

    try {
      // Send both ID and uniqueId to the backend
      const response = await fetch('https://hail-torpid-meteor.glitch.me/generate-lin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, uniqueId }) // Passing both values
      });

      const result = await response.json();
      if (result.ok && result.streamLink) {
        linkDiv.innerHTML = '<a href="' + result.streamLink + '">▶️ Watch Now</a>';
      } else {
        linkDiv.innerText = "❌ Failed to get link";
        linkDiv.style.color = "var(--fail-color)";
      }
    } catch (err) {
      linkDiv.innerText = "❌ Error occurred";
      linkDiv.style.color = "var(--fail-color)";
    }
  }
</script>

</body>
</html>`);
});
  
  
  app.post('/generate-lin', async (req, res) => {
    const { id, uniqueId } = req.body;
    const channelId = '-1002563798217';
    if (!id) return res.json({ ok: false, error: "Missing file ID" });

    try {
        const file = await File.findById(id);
        if (!file) return res.json({ ok: false, error: "File not found" });
save(uniqueId);
        // ✅ Step 1: Send the file to the channel only ONCE
        const sentMsg = await bot.sendDocument(channelId, file.fileId, {
            caption: `${file.name}\n\n⚡ Watch: @YourChannel`,
            parse_mode: 'HTML'
        });

        const messageId = sentMsg.message_id;

        // ✅ Step 2: Poll that same message (not sending again) for up to 20 seconds
        const maxAttempts = 10;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        let streamLink = null;

        for (let i = 0; i < maxAttempts; i++) {
            await delay(5000); // 2 second delay

            try {
                const msg = await bot.forwardMessage(channelId, channelId, messageId);

                const keyboard = msg?.reply_markup?.inline_keyboard;
                const btn = keyboard?.flat().find(b => /stream/i.test(b.text) && b.url);

                if (btn?.url) {
                    streamLink = btn.url;
                    break;
                }
            } catch (err) {
                console.warn(`Attempt ${i + 1}: Buttons not added yet.`);
            }
        }

        // ✅ Step 3: Save stream link and respond
        if (streamLink) {
            file.streamLink = streamLink;
            await file.save();
            return res.json({ ok: true, streamLink });
        } else {
            return res.json({ ok: false, error: "Stream button not found" });
        }

    } catch (e) {
        console.error("Error in generate-link:", e);
        return res.json({ ok: false, error: "Internal Error" });
    }
});
  
  
// List of irrelevant words to remove from the keyword
const irrelevantWords = ['movie', 'movies', 'film', 'films', 'series', 'Dubbed', 'Full Movie'];

// Function to preprocess the keyword and remove irrelevant words
function preprocessKeyword(keyword) {
  // Split the keyword into individual words
  let words = keyword.split(/\s+/).filter(Boolean);
  
  // Remove any irrelevant words (case-insensitive)
  words = words.filter(word => !irrelevantWords.includes(word.toLowerCase()));
  
  // Join the remaining words back into a single string
  return words.join(' ');
}

// Function to check if the keyword contains a URL, has more than 10 words, or starts with @username
function isInvalidKeyword(keyword) {
  // Regex to check for URLs (http:// or https://)
  const urlRegex = /https?:\/\/[^\s]+/i;

  // Regex to check for a word starting with @ followed by letters, digits, or underscores
  const usernameRegex = /\s?@[a-zA-Z0-9_]+/i;

  // Split the keyword by spaces and check the word count
  const wordCount = keyword.split(/\s+/).filter(Boolean).length;

  // If the keyword contains a URL, has more than 10 words, or starts with @username, it's invalid
  return urlRegex.test(keyword) || wordCount > 10 || usernameRegex.test(keyword);
}
  
  async function handleKeywordSearch(chatId, keyword, messageId, userId) {
  if (keyword.startsWith('click') || keyword.startsWith('/') || keyword.startsWith('http') || keyword === 'hi') {

    return;
  }

  const searchingMessage = await bot.sendMessage(chatId, `Sᴇᴀʀᴄʜɪɴɢ... ғᴏʀ "${keyword}" 🔍`, { reply_to_message_id: messageId });

  const preprocessedKeyword = preprocessKeyword(keyword);

  if (isInvalidKeyword(preprocessedKeyword)) {
    const message = `Sᴏʀʀʏ, ᴛʜᴇ sᴇᴀʀᴄʜ kᴇʏᴡᴏʀᴅ yᴏᴜ ᴜsᴇᴅ ɪs ɪɴᴠᴀʟɪᴅ.`;
    await bot.sendMessage(chatId, message, { reply_to_message_id: messageId });
    return bot.deleteMessage(chatId, searchingMessage.message_id);
  }

  await handleQuery(chatId, preprocessedKeyword, 1, messageId, null, null, userId);

  return bot.deleteMessage(chatId, searchingMessage.message_id);
}



// Temporary store for the last search results
const lastSearchResultsUserMap = {}; 
const lastSearchResults = {}; // Per userId
let filteredResults = [];
  // Store filtered results for language selection
let allFiles = [];

async function preloadFiles() {
  allFiles = await File.find({}).sort({ _id: -1 }).lean();
  console.log(`✅ Preloaded ${allFiles.length} files into memory`);
}
preloadFiles();
async function handleQuery(chatId, keyword, page = 1, replyToMessageId = null, messageId = null, selectedLanguage = null, userId) {
  const keywords = keyword.split(/\s+/).filter(Boolean); // Split and remove empty strings
  const regex = new RegExp(
    keywords.map(k => `(?=.*\\b${k}\\b)`).join(''), // Enforce whole word matching with word boundaries
    'i'
  ); // Create a positive lookahead for each word

  const matchingFiles = allFiles
  .filter(file => regex.test(file.name))
  .sort((a, b) => new Date(b._id) - new Date(a._id));
  
  if (matchingFiles.length === 0) {
    const message = `Sᴏʀʀʏ, I cᴏᴜʟᴅ'ɴᴛ fɪɴᴅ ᴀɴʏ mᴏᴠɪᴇ/ sᴇʀɪᴇs ʀᴇʟᴀᴛᴇᴅ ᴛᴏ "<b>${keyword}</b>" 😕\n\n<b>mᴏᴠɪᴇ ʀᴇqᴜᴇsᴛ fᴏʀᴍᴀᴛ:</b>\n👉 Bʜᴏᴏʟ Bʜᴜʟᴀɪʏᴀ 3 2024 \n<b>sᴇʀɪᴇs ʀᴇqᴜᴇsᴛ fᴏʀᴍᴀᴛ:</b>\n👉 Aѕᴜʀ S02\n\n🚯 Dᴏɴ'ᴛ ᴜsᴇ ➠ ':(!,./)\n\nOᴛʜᴇʀwɪsᴇ Iᴛ'ѕ nᴏᴛ ɪɴ ᴛʜᴇ dᴀᴛᴀʙᴀsᴇ.\nRᴇᴘᴏʀᴛ/ Rᴇqᴜᴇsᴛ - @hivajoy_contact_bot`;

    const spellingButton = {
      text: "Cʜᴇᴄᴋ Sᴘᴇʟʟɪɴɢ",
      url: `https://bing.com/search?q=${encodeURIComponent(keyword)}`
    };

    const sentMessage = await bot.sendMessage(chatId, message, {
      reply_to_message_id: replyToMessageId,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[spellingButton]]
      }
    });

    setTimeout(() => {
      bot.deleteMessage(chatId, sentMessage.message_id).catch(console.error);
    }, 43200000); // 10 seconds in milliseconds
    return;
  }

  // Store the results for later use
  lastSearchResults[userId] = matchingFiles;

  // Paginate results
  const itemsPerPage = 10;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pagedFiles = matchingFiles.slice(start, end);

  const updatedFileButtons = pagedFiles.map(file => {
    const sizeInBytes = Number(file.size);
    let sizeDisplay;

    if (isNaN(sizeInBytes) || sizeInBytes <= 0) {
      sizeDisplay = "//";
    } else if (sizeInBytes < 1024 * 1024) { // Less than 1 MB
      sizeDisplay = `${(sizeInBytes / 1024).toFixed(2).padStart(4, '0')} KB`; // Format as 000.0 KB
    } else if (sizeInBytes < 1024 * 1024 * 1024) { // Less than 1 GB
      sizeDisplay = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`; // Format as 0.0 MB
    } else { // 1 GB or more
      sizeDisplay = `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`; // Format as 0.0 GB
    }

    const displayText = `[${sizeDisplay}] ${file.name}`;
    const updatedLink = `https://t.me/shivamnoxbot?start=${file.uniqueId}`;
    return [{ text: displayText, url: updatedLink }];
  });

  const totalPages = Math.ceil(matchingFiles.length / itemsPerPage);
  if (totalPages > 1) {
    const navButtons = [];
    if (page > 1) {
      navButtons.push({ text: "⬅️ Pʀᴇᴠ", callback_data: `prev_${keyword}_${page}` });
    }

    navButtons.push({ text: `🗓️ ${page} ᴏғ ${totalPages}`, callback_data: 'page_info' });

    if (page < totalPages) {
      navButtons.push({ text: "Nᴇxᴛ ➡️", callback_data: `next_${keyword}_${page}` });
    }

    updatedFileButtons.push(navButtons);
  }

  const searchOnWebButton = {
    text: "📺 Wᴀᴛᴄʜ ᴏɴ Wᴇʙsɪᴛᴇ 💫",
    url: `https://hivajoy.free.nf/search.php?q=${encodeURIComponent(keyword)}`
  };

  const languageButton = {
    text: "🌍 Languages",
    callback_data: "select_language"
  };
const sendAllButton = {
  text: "📤 Send All",
  url: `https://t.me/shivamnoxbot?start=sendall_${page}_${userId}`
};
  const watchButton = {
  text: "📺 Watch Online",
  url: `https://hivajoy.fwh.is/stream?q=${keyword}`
};

const sendOrUpdateMessage = (text, options) => {
  if (messageId) {
    bot.editMessageText(text, { ...options, chat_id: chatId, message_id: messageId })
      .then(() => {
        // ✅ Update user-message map on edit as well
        lastSearchResultsUserMap[messageId] = userId;
      })
      .catch(console.error);
  } else {
    bot.sendMessage(chatId, text, { ...options, reply_to_message_id: replyToMessageId })
      .then((sentMessage) => {
        messageId = sentMessage.message_id;
        // ✅ Save the mapping when message is first sent
        lastSearchResultsUserMap[messageId] = userId;

        setTimeout(() => {
          bot.deleteMessage(chatId, sentMessage.message_id).catch(console.error);
        }, 43200000); // 12 hours
      });
  }
};


  const { detail, posterUrl, imdbUrl } = await fetchImdbDetails(keyword);

  sendOrUpdateMessage(`Rᴇsᴜʟᴛs ғᴏʀ "${keyword}" 🔍\n${detail}`, {
    reply_markup: {
      inline_keyboard: [...updatedFileButtons, [languageButton, sendAllButton], [watchButton]]
    }
  });
}

// Handle language selection and pagination for filtered results
bot.on("callback_query", async query => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userId = query.from.id;
  const messageId = query.message.message_id;
  const languageButton = {
    text: "🌍 Languages",
    callback_data: "select_language"
  };
// Handle language selection
if (data.startsWith("language_")) {
  const selectedLanguage = data.split("_")[1]; // Get selected language (e.g., 'hindi', 'english')

  
if (!lastSearchResults[userId] || lastSearchResults[userId].length === 0)  {
      bot.answerCallbackQuery(query.id, {
    text: "🚫 This is not Your Movie Request. Request Your's.",
    show_alert: true
  });
    return;
  }

  // Filter results based on language (e.g., only show results containing 'hindi' in the name)
  filteredResults = lastSearchResults[userId].filter(file => file.name.toLowerCase().includes(selectedLanguage.toLowerCase()));

  if (filteredResults.length === 0) {
    bot.editMessageText(`No results found for the selected language`, {
      chat_id: chatId,
    message_id: messageId,
        reply_markup: {
      inline_keyboard:[
        [{ text: `Back`, callback_data: "back_lang" }]
      ]}
    });
    return;
  }

  // Paginate filtered results
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const pagedFiles = filteredResults.slice(0, itemsPerPage);

  const updatedFileButtons = pagedFiles.map(file => {
    const sizeInBytes = Number(file.size);
    let sizeDisplay;

    if (isNaN(sizeInBytes) || sizeInBytes <= 0) {
      sizeDisplay = "//";
    } else if (sizeInBytes < 1024 * 1024) {
      sizeDisplay = `${(sizeInBytes / 1024).toFixed(2).padStart(4, '0')} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      sizeDisplay = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      sizeDisplay = `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }

    const displayText = `[${sizeDisplay}] ${file.name}`;
    const updatedLink = `https://t.me/shivamnoxbot?start=${file.uniqueId}`;
    return [{ text: displayText, url: updatedLink }];
  });

  const navButtons = [];
  if (totalPages > 1) {
    navButtons.push({ text: "⬅️ Pʀᴇᴠ", callback_data: `lprev_${selectedLanguage}_1` });
    navButtons.push({ text: `🗓️ 1 ᴏғ ${totalPages}`, callback_data: "lpage_info" });
    navButtons.push({ text: "Nᴇxᴛ ➡️", callback_data: `lnext_${selectedLanguage}_1` });
  }

  updatedFileButtons.push(navButtons);

  // Language button for language selection
  const languageButton = {
    text: "🌍 Language",
    callback_data: "select_language"
  };

    const backlanguageButton = {
    text: "🌍 Languages",
    callback_data: "back_lang"
  };
  const sendAllButton = {
    text: "📤 Send All",
    url: `https://t.me/shivamnoxbot?start=sendall_1_${userId}`
  };
  // Add the language button in a new row (nested array)
  bot.editMessageText(`Results filtered for language`, {
  chat_id: chatId,
  message_id: messageId,
  reply_markup: {
    inline_keyboard: [
      ...updatedFileButtons,
      [backlanguageButton, sendAllButton] // this ensures it's on a new row
    ]
  }
});

}  
// Language selection
if (data === "select_language") { 
const messageOwnerId = lastSearchResultsUserMap[messageId];

if (!messageOwnerId || messageOwnerId !== userId) {
  bot.answerCallbackQuery(query.id, {
    text: "🚫 This is not Your Movie Request. Request Your's.",
    show_alert: true
  });
  return;
}



  const languageButtons = [
    { text: "Hindi", callback_data: "language_hin" },
    { text: "English", callback_data: "language_eng" },
    { text: "Bengali", callback_data: "language_ben" },
    { text: "Bhojpuri", callback_data: "language_bho" },
    { text: "Gujarati", callback_data: "language_gujarati" },
    { text: "Kannada", callback_data: "language_kan" },
    { text: "Malayalam", callback_data: "language_mal" },
    { text: "Marathi", callback_data: "language_marathi" },
    { text: "Odia", callback_data: "language_odia" },
    { text: "Punjabi", callback_data: "language_pun" },
    { text: "Tamil", callback_data: "language_tam" },
    { text: "Telugu", callback_data: "language_tel" }
  ];

  const languageButtonRows = [];
  for (let i = 0; i < languageButtons.length; i += 2) {
    languageButtonRows.push(languageButtons.slice(i, i + 2));
  }

  bot.editMessageText("Please select a language for current movie/series:", {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: {
      inline_keyboard: languageButtonRows
    }
  });
} if (data === "back_lang") { 
const messageOwnerId = lastSearchResultsUserMap[messageId];

if (!messageOwnerId || messageOwnerId !== userId) {
  bot.answerCallbackQuery(query.id, {
    text: "🚫 This is not Your Movie Request. Request Your's.",
    show_alert: true
  });
  return;
}



  const languageButtons = [
    { text: "Hindi", callback_data: "language_hin" },
    { text: "English", callback_data: "language_eng" },
    { text: "Bengali", callback_data: "language_ben" },
    { text: "Bhojpuri", callback_data: "language_bho" },
    { text: "Gujarati", callback_data: "language_gujarati" },
    { text: "Kannada", callback_data: "language_kan" },
    { text: "Malayalam", callback_data: "language_mal" },
    { text: "Marathi", callback_data: "language_marathi" },
    { text: "Odia", callback_data: "language_odia" },
    { text: "Punjabi", callback_data: "language_pun" },
    { text: "Tamil", callback_data: "language_tam" },
    { text: "Telugu", callback_data: "language_tel" }
  ];

  const languageButtonRows = [];
  for (let i = 0; i < languageButtons.length; i += 2) {
    languageButtonRows.push(languageButtons.slice(i, i + 2));
  }

  bot.editMessageText("Please select a language for current movie/series:", {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: {
      inline_keyboard: languageButtonRows
    }
  });
}



  if (data.startsWith("getfile_")) {
    const uniqueId = data.split("_")[1];
    const file = await File.findOne({ uniqueId });
    if (file) {
      bot.sendDocument(chatId, file.fileId, { caption: file.name }).then((sentMessage) => {
        setTimeout(() => {
          bot.deleteMessage(chatId, sentMessage.message_id).catch(console.error);
        }, 43200000);
      });
    } else {
      bot.sendMessage(chatId, "Nᴏ fɪʟᴇ fᴏᴜɴᴅ wɪᴛʜ tʜɪs lɪɴᴋ.");
    }
  } else if (data.startsWith("next_") || data.startsWith("prev_")) {
    const [direction, keyword, currentPage] = data.split("_");
    const newPage = direction === "next" ? parseInt(currentPage) + 1 : parseInt(currentPage) - 1;

    // Simulate the loading state during page change
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [[{ text: `✨Mᴏvɪɴɢ tᴏ pᴀɢᴇ... : ${newPage} ⏳`, callback_data: "loading" }]] }, 
      { chat_id: chatId, message_id: messageId }
    );

    // Call the function to handle query after loading
    handleQuery(chatId, keyword, newPage, null, messageId, null, userId);
  } // Handle pagination for filtered language results
else if (data.startsWith("lnext_") || data.startsWith("lprev_")) {
  const callbackQuery = query; // <- yeh 'query' hai bot.on('callback_query', async (query) => {}) se
  const messageId = callbackQuery.message.message_id;
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id.toString();

  const [direction, selectedLanguage, currentPageStr] = data.split("_");
  const currentPage = parseInt(currentPageStr);
  const newPage = direction === "lnext" ? currentPage + 1 : currentPage - 1;

  const filteredResults = lastSearchResults[userId];
  if (!filteredResults || filteredResults.length === 0) {
    return bot.editMessageText("⚠️ Your session expired. Please search again.", {
      chat_id: chatId,
      message_id: messageId
    });
  }

  const itemsPerPage = 10;
  const start = (newPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pagedFiles = filteredResults.slice(start, end);

  const updatedFileButtons = pagedFiles.map(file => {
    const sizeInBytes = Number(file.size);
    let sizeDisplay;

    if (isNaN(sizeInBytes) || sizeInBytes <= 0) {
      sizeDisplay = "//";
    } else if (sizeInBytes < 1024 * 1024) {
      sizeDisplay = `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      sizeDisplay = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      sizeDisplay = `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }

    const displayText = `[${sizeDisplay}] ${file.name}`;
    const updatedLink = `https://t.me/shivamnoxbot?start=${file.uniqueId}`;
    return [{ text: displayText, url: updatedLink }];
  });

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const navButtons = [];
  if (newPage > 1) {
    navButtons.push({ text: "⬅️ Pʀᴇᴠ", callback_data: `lprev_${selectedLanguage}_${newPage}` });
  }
  navButtons.push({ text: `🗓️ ${newPage} ᴏғ ${totalPages}`, callback_data: "lpage_info" });
  if (newPage < totalPages) {
    navButtons.push({ text: "Nᴇxᴛ ➡️", callback_data: `lnext_${selectedLanguage}_${newPage}` });
  }

  updatedFileButtons.push(navButtons);

  const languageButton = { text: "🌍 Languages", callback_data: "select_language" };
  const sendAllButton = {
    text: "📤 Send All",
    url: `https://t.me/shivamnoxbot?start=sendall_${newPage}_${userId}`
  };

  await bot.editMessageText(`Results filtered for language: ${selectedLanguage}`, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: {
      inline_keyboard: [
        ...updatedFileButtons,
        [languageButton, sendAllButton]
      ]
    },
    parse_mode: 'HTML'
  });

  await bot.answerCallbackQuery(callbackQuery.id);
}


 if (data.startsWith("sendall_")) {
  const requestedPage = parseInt(data.split("_")[1]);
  const messageOwnerId = lastSearchResultsUserMap[messageId];

  // Only message owner can send all
  if (!messageOwnerId || messageOwnerId !== userId) {
    bot.answerCallbackQuery(query.id, {
      text: "🚫 This is not Your Movie Request. Request Your's.",
      show_alert: true
    });
    return;
  }

  const results = lastSearchResults[userId];
  if (!results || results.length === 0) {
    bot.answerCallbackQuery(query.id, {
      text: "⚠️ No results found. Please search again.",
      show_alert: true
    });
    return;
  }

  const itemsPerPage = 10;
  const start = (requestedPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageFiles = results.slice(start, end);

  // 🔁 Try sending DM
  try {
    await bot.sendMessage(userId, `📤 Sending ${pageFiles.length} files from page ${requestedPage}...`);
    bot.editMessageReplyMarkup(
      {
        inline_keyboard: [[
          { text: "📩 Open Bot to Receive Files", url: `https://t.me/hivajoycloud1bot` }
        ]]
      },
      {
        chat_id: chatId,
        message_id: messageId
      }
    );
  } catch (err) {
    console.error("❌ Could not send DM to user", err);

    // 👇 Edit message to suggest redirect
    await bot.editMessageReplyMarkup(
      {
        inline_keyboard: [[
          { text: "📩 Open Bot to Receive Files", url: `https://t.me/hivajoycloud1bot` }
        ]]
      },
      {
        chat_id: chatId,
        message_id: messageId
      }
    );

    return bot.answerCallbackQuery(query.id, {
      text: "🔁 Please open the bot in DM to receive your files.",
      show_alert: true
    });
  }

  // ✅ Send files
  for (const file of pageFiles) {
    try {
      await bot.sendDocument(userId, file.fileId, {
        caption: `${file.name}\n\n⚡ 𝓑𝓪𝓬𝓾𝓹 𝒞𝒽𝒶𝓃𝓃𝑒𝓁: @Hivabyte`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '👀 Wᴀᴛᴄʜ Oɴʟɪɴᴇ | Fᴀsᴛ Dᴏᴡɴʟᴏᴀᴅ ⬇️', callback_data: `generateLink:${file.uniqueId}` }]
          ]
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1200)); // Delay
    } catch (err) {
      console.error(`❌ Failed to send file: ${file.name}`, err);
    }
  }

  // ✅ After sending, show redirect button to bot DM
  await bot.editMessageReplyMarkup(
    {
      inline_keyboard: [[
        { text: "✅ Open Your Files in Bot", url: `https://t.me/YourBotUsername` }
      ]]
    },
    {
      chat_id: chatId,
      message_id: messageId
    }
  );

  // ✅ Silent callback response
  return bot.answerCallbackQuery(query.id);
}




setTimeout(() => {
  delete lastSearchResultsUserMap[messageId];
  delete lastSearchResults[userId];
}, 600000); // 1 mints



  bot.answerCallbackQuery(query.id);
});
  
  // Replace with your OMDb API key
const OMDB_API_KEY = 'b7d4f357';
  
  // Function to fetch IMDb movie details
async function fetchImdbDetails(title) {
  try {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        t: title,  // Title of the movie
        type: 'movie',  // Only movies
        apikey: OMDB_API_KEY,
      },
    });

    const movie = response.data;
    if (movie.Response === 'True') {
      const details = `
🎬 *Tɪᴛʟᴇ*: ${movie.Title}  
📅 *Yᴇᴀʀ*: ${movie.Year}  
🔢 *Rᴀᴛᴇᴅ*: ${movie.Rated}  
🎭 *Gᴇɴʀᴇ*: ${movie.Genre}  
🎥 *Dɪʀᴇᴄᴛᴏʀ*: ${movie.Director}  
👥 *Aᴄᴛᴏʀs*: ${movie.Actors}   
⭐ *Iᴍᴅʙ Rᴀᴛɪɴɢ*: ${movie.imdbRating}  
🌐 *Lᴀɴɢᴜᴀɢᴇ*: ${movie.Language}  
🌎 *Cᴏᴜɴᴛʀʏ*: ${movie.Country}
📜 *Sᴛᴏʀʏ*: ${movie.Plot} 
`;
      const detail = `
🎬 Tɪᴛʟᴇ: ${movie.Title}  
📅 Yᴇᴀʀ: ${movie.Year}  
🔢 Rᴀᴛᴇᴅ: ${movie.Rated}
🎭 Gᴇɴʀᴇ: ${movie.Genre}  
🎥 Dɪʀᴇᴄᴛᴏʀ: ${movie.Director} 
`;
      
      return { details, detail, posterUrl: movie.Poster, imdbUrl: `https://www.imdb.com/title/${movie.imdbID}/` };
    } else {
      return { details: `Mᴏᴠɪᴇ nᴏᴛ fᴏᴜɴᴅ. Pʟᴇᴀsᴇ ᴄʜᴇᴄᴋ ᴛʜᴇ tɪᴛʟᴇ ᴀɴᴅ tʀʏ ᴀɢᴀɪɴ.`, posterUrl: null, imdbUrl: null };
    }
  } catch (error) {
    console.error(error);
    return { details: `Tʜᴇʀᴇ ᴡᴀs ᴀɴ ᴇʀʀᴏʀ fᴇᴛᴄʜɪɴɢ mᴏᴠɪᴇ dᴇᴛᴀɪʟs. Pʟᴇᴀsᴇ tʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.`, posterUrl: null, imdbUrl: null };
  }
}
  
}
