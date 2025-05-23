const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');
const https = require('https');
const url = require('url');
const fileUpload = require('express-fileupload');
const axios = require('axios');

const OWNER_ID = '5019818643';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

module.exports = function (app, mongoose, File, bot, express, Folder, FolderFile, authMiddleware) {
  app.use(fileUpload());
  app.use(express.urlencoded({ extended: true }));



  mongoose.connection.once('open', async () => {
    try {
      await mongoose.connection.db.collection('folders').dropIndex('name_1');
    } catch (e) {
      console.log('No existing name_1 index to drop.');
    }
  });
// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views folder where your .ejs files will be located
app.set('views', path.join(__dirname, 'views'));


      const auth = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).send('Authentication required.');
        }

        const base64 = authHeader.split(' ')[1];
        const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');
        if (user === 'admin' && pass === '1234') {
            return next();
        }

        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).send('Access denied.');
    };

  app.get('/cloud', authMiddleware, async (req, res) => {
    const folders = await Folder.find();

    const folderOptions = folders.map(f => `<option value="${f.folderId}">${f.name}</option>`).join('');
const folderListHtml = folders
  .filter(f => !f.parentId)
  .map(f => `
    <li class="folder-item">
      <div class="folder-actions" onclick="toggleDropdown('${f.name}')">
        <i class="fas fa-ellipsis-v"></i>
        <div class="dropdown-menu" id="dropdown-${f.name}">
          <form action="/cloud/folder/${encodeURIComponent(f.name)}/delete" method="POST" onsubmit="return confirm('Are you sure you want to delete folder ${f.name}?');">
            <button type="submit">Delete</button>
          </form>
        </div>
      </div>
      <span class="folder-name">
        <a class="folder-name" onclick="navigateWithLoading('/cloud/folder/${encodeURIComponent(f.name)}')">📂 ${f.name}</a>
      </span>
    </li>
  `)
  .join('');



    
  // Render the cloud.ejs template and pass the data to it
  res.send(`
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StarTech</title>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link href='https://images.scalebranding.com/infinity-star-logo-67e6d544-d612-4e0b-ae07-c73725afe41d.jpg' rel='shortcut icon'/>

<link href='/style.css' rel='stylesheet'/> 
<script >
   

// Menu Togagle Script 
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu.classList.contains('show')) {
        menu.classList.remove('show'); // Close the menu
        setTimeout(() => {
            menu.style.visibility = 'hidden';
        }, 300);
    } else {
        menu.style.visibility = 'visible'; 
        menu.classList.add('show'); // Open the menu
    }
}

function closeMenu() {
    const menu = document.getElementById('menu');
    menu.classList.remove('show'); // Close the menu
    setTimeout(() => {
        menu.style.visibility = 'hidden';
    }, 300);
}


// onclick openlLink 
function openLink(url) {
    window.location.href = url;
}


// Notification Message /ocon 

function showNotification() {
    var notificationMessage = document.getElementById('notificationMessage');
    notificationMessage.style.display = 'block';

    // Hide red dot after clicking the icon
    var redDot = document.getElementById('redDot');
    redDot.style.display = 'none';
  }

  function closeNotification() {
    document.getElementById('notificationMessage').style.display = 'none';
  }



// Toggle the display of the share options
function toggleShareOptions() {
  const shareOptions = document.getElementById('shareOptions');
  shareOptions.style.display = (shareOptions.style.display === "none") ? "block" : "none";
}

// Copy the current page URL to clipboard
function copyLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert("Link copied to clipboard!");
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}




</script>

  <div id="div13"></div>
<br/><br/>
</head>
<style>

  h2 {
    color: #ffffff;
    border-bottom: 1px solid #444; /* thinner line */
    padding-bottom: 0.4rem;
    margin-bottom: 0.5rem;
    font-size: 1.2rem; /* smaller font */
  }

  form {
    background-color: #1e1e1e;
    padding: 0.75rem;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* reduced gap */
  }

  input, select, button {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem; /* smaller font */
  }

  input[type="file"] {
    background-color: #2a2a2a;
    color: #ddd;
  }

  input, select {
    background-color: #2a2a2a;
    color: #fff;
  }

  button, input[type="submit"] {
    background-color: #03dac6;
    color: #000;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover, input[type="submit"]:hover {
    background-color: #00c4b4;
  }

  ul {
    list-style-type: none;
    padding-left: 0;
  }

  ul li {
    padding: 0.4rem;
    background-color: #1e1e1e;
    border: 1px solid #333;
    margin-top: 0.4rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  hr {
    border-color: #444;
    margin: 1rem 0;
  }

  @media (max-width: 600px) {
    .main-content {
      padding: 0.5rem;
    }

    input, select, button {
      font-size: 0.85rem;
      padding: 0.45rem;
    }

    h2 {
      font-size: 1rem;
    }
  }
</style>
<style>
.row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.row input,
.row select {
  flex: 1;
  min-width: 100px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #1e1e1e;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #333;
  position: relative;
  margin-bottom: 5px;
  width:100%;
  max-width:500px;
}

.folder-actions {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.folder-actions i {
  color: #aaa;
  font-size: 1rem;
}


.dropdown-menu {
  display: none;
  position: absolute;
  top: 20px;
  left: 0px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  padding: 0.5rem;
  border-radius: 4px;
  z-index: 10;
}

.dropdown-menu button {
  background: #ff4d4d;
  color: #fff;
  border: none;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 3px;
}

.dropdown-menu button:hover {
  background: #e60000;
}
.folder-name {
color:white;
text-decoration:none;
font-weight:bold;
cursor: pointer;
}

</style>

<body>

<div style="position:fixed;background:black;position: fixed;display: flex;float: none !important;margin: 0 auto !important;top: 0 !important;left: 0 !important;right: 0 !important;width: 100vw !important;height:50px !important;padding:0px 10px;box-sizing: border-box;z-index:9999;">
    <div style="display: flex; align-items: center; width: 100%; height: 50px; position: absolute; background-color: rgba(0, 255, 255, 0.05); z-index: 999;">
      <!--Header Menu Content Start-->

<!-- Menu -->

        <div class="menu" id="menu">
            <span class="close-icon" onclick="closeMenu()">
        <i style="color:#0ff;" class="fa-solid fa-xmark"></i>
    </span>            <!-- Menu Header -->
            <div style="display: flex; align-items: center; top: 0; position: relative; width: 100%; height: 50px; background-color: black;text-align:center;">
                <p style='font-size: 24px; color: #0ff; margin: 0; margin-left: 40px;text-align:center;'><b>STARTECH</b></p>
            </div>

          
            <a onclick="navigateWithLoading('/')">
                <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                    <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-home"></i>
                    <p style='font-size: 16px;margin: 0; cursor: pointer;'>Galactic Console</p>
                </div>
            </a>
        
            <div class="radio">
                <a onclick="navigateWithLoading('/cloud')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Hyperspace Files</p>
                    </div>
                </a>
            </div>
                      <a onclick="openLink('/')">
                <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                    <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-home"></i>
                    <p style='font-size: 16px;margin: 0; cursor: pointer;'>AI Drone Logs</p>
                </div>
            </a>
        
            <div class="radio">
                <a onclick="openLink('/p/radio')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Ship Configuration</p>
                    </div>
                </a>
            </div>
          
                      <div class="radio">
                <a onclick="openLink('/p/radio')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Quantum Storage</p>
                    </div>
                </a>
            </div>
          
                      <div class="radio">
                <a onclick="navigateWithLoading('/logout')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Logout</p>
                    </div>
                </a>
            </div>
            

            <div id="div11" style="justify-content: center; padding: 5px; text-align: center;"></div>
        
        



                <div id="div12" style="justify-content: center; padding: 5px; text-align: center;"></div>
 
        </div>

        
        <!--Header Menu Content End-->
        <div class='menu-icon' onclick='toggleMenu()'>
            <span style='color: #0ff; font-size:24px;margin-right:10px;font- weight:bold;'><b><i class="fa-solid fa-bars"></i></b></span>
        </div>

       
        <div style="display: flex; align-items: center; top: 0; position: relative;">
        <p style='font-size: 24px; color: #0ff; margin: 0; margin-left: 5px;'><b>STARTECH</b></p>
        </div>

        <span class="page-title" id="page-title"></span>

<div onclick="navigateWithLoading('/')" style='width: 32px;height: 32px;background-color:#252525;border-radius: 50%;display: flex;justify-content: center;align-items: center;cursor: pointer;right: 65px;top: auto;position: absolute;' >
            <span style='color: #0ff;font-size:20px;'><i class="fa fa-home"></i></span>
         </div> 

       
<div class='notification-icon' onclick='showNotification()'>
            <span style='color: #0ff;font-size:20px;'><i class="fa-solid fa-bell"></i></span>
            <div class='red-dot' id='redDot'></div>
        </div>
        <div class='notification-message' id='notificationMessage'>
            <div id="div1">Hello</div>
            <span onclick='closeNotification()' style='position: absolute; top: 10px; right: 10px; color: white; cursor: pointer; font-weight: bold;'>&#10006;</span>
        </div>






</div>
</div>


  <div class="main-content">

  <h2>Create New Folder</h2>
  <form action="/cloud/folder" method="POST">
    <div class="row">
      <input name="name" placeholder="Folder Name" required />
      <select name="parentId">
        <option value="">-- Root Folder --</option>
        ${folderOptions}
      </select>
      <button type="submit">Create Folder</button>
    </div>
    
  </form>

  <h2>Upload Multiple Files</h2>
  <form action="/cloud/upload" method="POST" enctype="multipart/form-data" style="display:none;">
    <div class="row">
      <input type="file" name="files" multiple required />
      <select name="folderId" required>
        <option value="">Select Folder</option>
        ${folderOptions}
      </select>
      <input type="submit" value="Upload" />
    </div>
    
  </form>

  

  <h2>Folders</h2>
  <ul>${folderListHtml}</ul>
</div>



  <!-- Preloader -->
  <div id="preloader">
    <div class="loader"></div>
    <p style="margin-left:10px;">
      Loading...
    </p>
  </div>
<script>
  function toggleDropdown(folderName) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });

    const menu = document.getElementById('dropdown-' + folderName); // ✅ correct
    if (menu) {
      menu.style.display = 'block';
      setTimeout(() => {
        window.addEventListener('click', closeAllDropdowns, { once: true });
      }, 0);
    }
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  }
</script>

  <script>
    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const burger = document.getElementById('burger');

      sidebar.classList.toggle('open');
      burger.innerText = sidebar.classList.contains('open') ? '×' : '☰';
    }

    function navigateWithLoading(url) {
      const preloader = document.getElementById('preloader');
      preloader.style.display = 'flex';
      setTimeout(() => {
        window.location.href = url;
      }, 100);
    }

    window.addEventListener('load', function () {
      document.getElementById('preloader').style.display = 'none';
    });
  </script>
</body>
</html>


    
  `);
    
  });

  // ✅ Create Folder
  app.post('/cloud/folder', async (req, res) => {
    const { name, parentId } = req.body;
    if (!name) return res.send('❌ Folder name is required.');

    const folderId = (Date.now().toString(36) + Math.random().toString(36).substring(2, 4)).toLowerCase();

    try {
      await Folder.create({ name, folderId, parentId: parentId || null });

      if (parentId) {
  const parent = await Folder.findOne({ folderId: parentId });

  if (parent) {
    // 🔁 Build full path including new folder
    let pathSegments = [parent.name];
    let current = parent;
    while (current.parentId) {
      current = await Folder.findOne({ folderId: current.parentId });
      if (!current) break;
      pathSegments.unshift(current.name);
    }
    pathSegments.push(name); // Add the new subfolder name
    const fullPath = pathSegments.map(encodeURIComponent).join('/');
    return res.redirect(`/cloud/folder/${fullPath}`);
  }
}


      res.redirect('/cloud');
    } catch (err) {
      res.send('❌ Error creating folder: ' + err.message);
    }
  });

// ✅ Upload Multiple Files
app.post('/cloud/upload', async (req, res) => {
  const { folderId } = req.body;
  const files = req.files?.files; // Handle multiple files (array)

  if (!folderId || !files) return res.send('❌ Folder or files missing.');

  // If it's a single file, wrap it in an array to handle uniformly
  const filesArray = Array.isArray(files) ? files : [files];

  // Check if any file exceeds the size limit (50MB)
  if (filesArray.some(file => file.size > 50 * 1024 * 1024)) {
    return res.send('❌ One of the files exceeds the 50MB limit.');
  }

  try {
    // Make sure the uploads directory exists
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

    const uploadedFileDetails = []; // Store details of all successfully uploaded files

    for (const file of filesArray) {
      const filePath = path.join(UPLOAD_DIR, file.name);

      // Move the file to the uploads directory
      await file.mv(filePath);

      // Detect file type based on extension
      const ext = path.extname(file.name).toLowerCase();
      const ChannelId = '-1002567891050';

      let tgMsg;
      let fileId;
      let size;

      try {
        if (['.mp4', '.mkv', '.mov', '.avi', '.webm'].includes(ext)) {
          tgMsg = await bot.sendVideo(ChannelId, fs.createReadStream(filePath), { caption: file.name });
          fileId = tgMsg.video?.file_id;
          size = tgMsg.video?.file_size;
          
        } else if (['.mp3'].includes(ext)) { 
          
          tgMsg = await bot.sendAudio(ChannelId, fs.createReadStream(filePath), { caption: file.name });
          fileId = tgMsg.audio?.file_id;
          size = tgMsg.audio?.file_size;
          
          } else {
          tgMsg = await bot.sendDocument(ChannelId, fs.createReadStream(filePath), { caption: file.name });
          fileId = tgMsg.document?.file_id;
          size = tgMsg.document?.file_size;
        }
      } catch (e) {
        fs.unlinkSync(filePath);
        return res.send(`❌ Telegram upload failed for ${file.name}: ${e.message}`);
      }

      // Delete the file after uploading to Telegram
      fs.unlinkSync(filePath);

      if (!fileId) {
        return res.send(`❌ Upload succeeded, but no file_id returned for ${file.name}.`);
      }

      // Store the file details in the database
      await FolderFile.create({ folderId, filename: file.name, fileId, size });
      uploadedFileDetails.push({ filename: file.name, fileId, size });
    }

    // Get the folder object to build full path
    const folder = await Folder.findOne({ folderId });

    // Build full folder path
    let pathSegments = [folder.name];
    let current = folder;
    while (current.parentId) {
      current = await Folder.findOne({ folderId: current.parentId });
      if (!current) break;
      pathSegments.unshift(current.name);
    }

    const fullPath = pathSegments.map(encodeURIComponent).join('/');
    res.redirect(`/cloud/folder/${fullPath}`);

  } catch (err) {
    console.error('Upload error:', err);
    res.send('❌ Upload failed: ' + err.message);
  }
});




  // ✅ View folder via full path
app.get('/cloud/folder/*', authMiddleware, async (req, res) => {
  const TOKEN = '8055291382:AAGJYycInowWDSs9N_nxIwCLdoVd2DjCTXQ';
  const pathSegments = req.params[0].split('/').filter(Boolean);
  let currentFolder = null;

  for (const segment of pathSegments) {
    currentFolder = await Folder.findOne({
      name: segment,
      parentId: currentFolder ? currentFolder.folderId : null
    });
    if (!currentFolder) return res.send(`❌ Folder not found: ${segment}`);
  }

  const files = await FolderFile.find({ folderId: currentFolder.folderId });
  const subfolders = await Folder.find({ parentId: currentFolder.folderId });

  const fullPath = pathSegments.join('/');

  // ✅ Prepare audio files with Telegram file URLs
  const audioFiles = [];
      for (const f of files) {
    if (f.filename.toLowerCase().endsWith('.m4a') || f.filename.toLowerCase().endsWith('.mp3')) {
      const telegramFile = await bot.getFile(f.fileId);
      audioFiles.push({
        fileId: f.fileId,
        filename: f.filename,
        fileUrl: `https://api.telegram.org/file/bot${TOKEN}/${telegramFile.file_path}`
      });
    }
  }
  
const videoFiles = [];
const streamFiles = [];

for (const f of files) {
  if (f.filename.toLowerCase().endsWith('.mp4')) {
    if (f.size < 20971520) { // Less than 20MB
      const telegramFile = await bot.getFile(f.fileId);
      videoFiles.push({
        fileId: f.fileId,
        filename: f.filename,
        fileUrl: `https://api.telegram.org/file/bot${TOKEN}/${telegramFile.file_path}`
      });
    } else {
      streamFiles.push(f.fileId); // Just mark as streamable
    }
  }
}

files.sort((a, b) => a.filename.toLowerCase().localeCompare(b.filename.toLowerCase()));
const fileListHtmlArray = await Promise.all(files.map(async (f) => {
  const fileExtension = f.filename.toLowerCase().split('.').pop();
  const isAudio = ['m4a', 'mp3'].includes(fileExtension) && f.size < 20971520;
  const isVideo = fileExtension === 'mp4' && f.size < 20971520;
  const isStream = f.size >= 20971520; // Stream any file ≥ 20MB
  const isPdf = ['pdf'].includes(fileExtension);
  const isTxt = ['txt'].includes(fileExtension);
  const isImage = ['jpg', 'jpeg', 'png'].includes(fileExtension);
  const audioIndex = audioFiles.findIndex(a => a.fileId === f.fileId);
  const fileUrl = `/download/${encodeURIComponent(f.filename)}?fileId=${f.fileId}`;
  const videoIndex = videoFiles.findIndex(a => a.fileId === f.fileId);
  
  const hasStream = f.streamLink && f.streamLink.startsWith("http");

  let fileurl = ''

  let fileDisplay = '';

  if (isAudio) {
    fileDisplay = `
      <a href="#" class="play-audio" data-index="${audioIndex}" style="color: white;font-weight: bold;text-decoration:none;display: inline-block;max-width: 100%;word-wrap: break-word;white-space: normal;overflow-wrap: break-word;">
        🎵 ${f.filename}
      </a>`;
  } else if (isVideo) {
    fileDisplay = `
      <a href="#" class="play-video" data-index="${videoIndex}" style="color: white;font-weight: bold;text-decoration:none;display: inline-block;max-width: 100%;word-wrap: break-word;white-space: normal;overflow-wrap: break-word;">
        🎥 ${f.filename}
      </a>`;
  } else if (isStream) {
    fileDisplay = hasStream
      ? `<div class="link-area" style="text-align:left;margin:0px;"><a href="${f.streamLink}" target="_blank">▶️ ${f.filename}</a></div>`
      : `<button class="gen-link" id="btn-${f._id}" onclick="generateLink('${f._id}', '${f.uniqueId}')" style="text-align:left;margin:0px;">▶️ ${f.filename}</button>
         <div class="link-area" style="text-align:left;margin:0px;" id="link-${f._id}"></div>`;
  } else if (isPdf) {
      if (f.size < 20971520) {
    const file = await bot.getFile(f.fileId);
  fileurl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    }
    fileDisplay = `
      <a href="/pdfreader?url=${fileurl}" 
      style="color: white;font-weight: bold;text-decoration:none;display: inline-block;max-width: 100%;word-wrap: break-word;white-space: normal;overflow-wrap: break-word;">
        📄 ${f.filename}
      </a>`;
  } else if (isTxt) {
      if (f.size < 20971520) {
    const file = await bot.getFile(f.fileId);
  fileurl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    }
    fileDisplay = `
      <a href="/notepad?file=${fileurl}" 
      style="color: white;font-weight: bold;text-decoration:none;display: inline-block;max-width: 100%;word-wrap: break-word;white-space: normal;overflow-wrap: break-word;">
        📄 ${f.filename}
      </a>`;
  } else if (isImage) {
    fileDisplay = `
      <a href="#" class="view-image" data-file="${f.filename}" data-url="${fileUrl}" style="color: white;font-weight: bold;text-decoration:none;display: inline-block;max-width: 100%;word-wrap: break-word;white-space: normal;overflow-wrap: break-word;">
        <img src="${fileUrl}" style="width:30px;height:30px;"/> ${f.filename}
      </a>`;
  } else {
    fileDisplay = `
      <a href="${fileUrl}" style="color: white;font-weight: bold;text-decoration:none;display: inline-block;max-width: 100%;word-wrap: break-word;white-space: normal;overflow-wrap: break-word;">
        📄 ${f.filename}
      </a>`;
  }

  return `
    <li class="folder-item">
      <div class="folder-actions" onclick="toggleDropdown('${f.filename}')">
        <i class="fas fa-ellipsis-v"></i>
        <div class="dropdown-menu" id="dropdown-${f.filename}">
          <form action="/cloud/file/delete" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete the file ${f.filename}?');">
            <input type="hidden" name="fileId" value="${f.fileId}" />
            <input type="hidden" name="folderId" value="${currentFolder.folderId}" />
            <input type="hidden" name="filename" value="${f.filename}" />
            <input type="hidden" name="folderPath" value="${fullPath}" />
            <button type="submit">🗑️ Delete</button>
          </form>
        </div>
      </div>
      <span class="folder-name">${fileDisplay}</span>
    </li>`;
}));

const fileListHtml = fileListHtmlArray.join('');



  const subfolderHtml = subfolders.map(f => {
    const subfolderPath = [...pathSegments, f.name].join('/');
    return `
      <li class="folder-item">
      <div class="folder-actions" onclick="toggleDropdown('${f.name}')">
      <i class="fas fa-ellipsis-v"></i>
      <div class="dropdown-menu" id="dropdown-${f.name}">
      
        <form action="/cloud/folder/delete" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete this Folder ${f.name}?');">
          <input type="hidden" name="folderId" value="${f.folderId}" />
          <input type="hidden" name="folderPath" value="${pathSegments.join('/')}" />
          <button type="submit">🗑️</button>
        </form>
        
        <form action="/cloud/folder/rename" method="POST" style="display:inline;">
          <input type="hidden" name="folderId" value="${f.folderId}" />
          <input type="hidden" name="folderPath" value="${pathSegments.join('/')}" />
          <input type="text" name="newName" placeholder="Rename" required />
          <button type="submit">✏️</button>
        </form>
        </div>
      </div>
        <span class="folder-name">
        <a class="folder-name" onclick="navigateWithLoading('/cloud/folder/${subfolderPath}')">📂 ${f.name}</a>
        </span>
      </li>
         
    `;
  }).join('');

  // ✅ Final HTML response
  res.send(`
  <html>
  <head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StarTech</title>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link href='https://images.scalebranding.com/infinity-star-logo-67e6d544-d612-4e0b-ae07-c73725afe41d.jpg' rel='shortcut icon'/>

<link href='/style.css' rel='stylesheet'/> 
<script >
   

// Menu Togagle Script 
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu.classList.contains('show')) {
        menu.classList.remove('show'); // Close the menu
        setTimeout(() => {
            menu.style.visibility = 'hidden';
        }, 300);
    } else {
        menu.style.visibility = 'visible'; 
        menu.classList.add('show'); // Open the menu
    }
}

function closeMenu() {
    const menu = document.getElementById('menu');
    menu.classList.remove('show'); // Close the menu
    setTimeout(() => {
        menu.style.visibility = 'hidden';
    }, 300);
}


// onclick openlLink 
function openLink(url) {
    window.location.href = url;
}


// Notification Message /ocon 

function showNotification() {
    var notificationMessage = document.getElementById('notificationMessage');
    notificationMessage.style.display = 'block';

    // Hide red dot after clicking the icon
    var redDot = document.getElementById('redDot');
    redDot.style.display = 'none';
  }

  function closeNotification() {
    document.getElementById('notificationMessage').style.display = 'none';
  }



// Toggle the display of the share options
function toggleShareOptions() {
  const shareOptions = document.getElementById('shareOptions');
  shareOptions.style.display = (shareOptions.style.display === "none") ? "block" : "none";
}

// Copy the current page URL to clipboard
function copyLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert("Link copied to clipboard!");
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}






</script>


<style>

  h2 {
    color: #ffffff;
    border-bottom: 1px solid #444; /* thinner line */
    padding-bottom: 0.4rem;
    margin-bottom: 0.5rem;
    font-size: 1.2rem; /* smaller font */
  }

  form {
    background-color: #1e1e1e;
    padding: 0.75rem;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* reduced gap */
  }

   input, select, button {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem; /* smaller font */
  }

  input[type="file"] {
    background-color: #2a2a2a;
    color: #ddd;
  }

   input, select {
    background-color: #2a2a2a;
    color: #fff;
  }

  button, input[type="submit"] {
    background-color: #03dac6;
    color: #000;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover, input[type="submit"]:hover {
    background-color: #00c4b4;
  }

  ul {
    list-style-type: none;
    padding-left: 0;
  }

  ul li {
    padding: 0.4rem;
    background-color: #1e1e1e;
    border: 1px solid #333;
    margin-top: 0.4rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  hr {
    border-color: #444;
    margin: 1rem 0;
  }

  @media (max-width: 600px) {
    .main-content {
      padding: 0.5rem;
    }

    input, select, button {
      font-size: 0.85rem;
      padding: 0.45rem;
    }

    h2 {
      font-size: 1rem;
    }
  }
</style>
<style>
.row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.row input,
.row select {
  flex: 1;
  min-width: 100px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #1e1e1e;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #333;
  position: relative;
  margin-bottom: 5px;
  width:100%;
  max-width:500px;
}

.folder-actions {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.folder-actions i {
  color: #aaa;
  font-size: 1rem;
}


.dropdown-menu {
  display: none;
  position: absolute;
  top: 20px;
  left: 0px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  padding: 0.5rem;
  border-radius: 4px;
  z-index: 10;
}

.dropdown-menu button {
  background: #ff4d4d;
  color: #fff;
  border: none;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 3px;
}

.dropdown-menu button:hover {
  background: #e60000;
}
.folder-name {
  color: white;
  font-weight: bold;
  text-decoration:none;
  display: inline-block;       /* Enables width restrictions */
  max-width: 100%;             /* Prevents overflow */
  word-wrap: break-word;       /* Breaks long words to wrap */
  white-space: normal;         /* Allows line breaks */
  overflow-wrap: break-word;   /* Ensures wrapping in modern browsers */
  cursor: pointer;

}
    .gen-link {
      display: block;
      width: 100%;
      background: var(--accent-gradient);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 1em;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
    }

    .gen-link:hover {
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

</style>
  <div id="div13"></div>
  <br/><br/>
</head>


<body>

<div style="position:fixed;background:black;position: fixed;display: flex;float: none !important;margin: 0 auto !important;top: 0 !important;left: 0 !important;right: 0 !important;width: 100vw !important;height:50px !important;padding:0px 10px;box-sizing: border-box;z-index:9999;">
    <div style="display: flex; align-items: center; width: 100%; height: 50px; position: absolute; background-color: rgba(0, 255, 255, 0.05); z-index: 999;">
      <!--Header Menu Content Start-->

<!-- Menu -->

        <div class="menu" id="menu">
            <span class="close-icon" onclick="closeMenu()">
        <i style="color:#0ff;" class="fa-solid fa-xmark"></i>
    </span>            <!-- Menu Header -->
            <div style="display: flex; align-items: center; top: 0; position: relative; width: 100%; height: 50px; background-color: black;text-align:center;">
                <p style='font-size: 24px; color: #0ff; margin: 0; margin-left: 40px;text-align:center;'><b>STARTECH</b></p>
            </div>

          
            <a onclick="navigateWithLoading('/')">
                <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                    <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-home"></i>
                    <p style='font-size: 16px;margin: 0; cursor: pointer;'>Galactic Console</p>
                </div>
            </a>
        
            <div class="radio">
                <a onclick="navigateWithLoading('/cloud')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Hyperspace Files</p>
                    </div>
                </a>
            </div>
                      <a onclick="openLink('/')">
                <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                    <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-home"></i>
                    <p style='font-size: 16px;margin: 0; cursor: pointer;'>AI Drone Logs</p>
                </div>
            </a>
        
            <div class="radio">
                <a onclick="openLink('/p/radio')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Ship Configuration</p>
                    </div>
                </a>
            </div>
          
                      <div class="radio">
                <a onclick="openLink('/p/radio')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Quantum Storage</p>
                    </div>
                </a>
            </div>
          
                      <div class="radio">
                <a onclick="navigateWithLoading('/logout')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Logout</p>
                    </div>
                </a>
            </div>
            

            <div id="div11" style="justify-content: center; padding: 5px; text-align: center;"></div>
        
        



                <div id="div12" style="justify-content: center; padding: 5px; text-align: center;"></div>
 
        </div>

        
        <!--Header Menu Content End-->
        <div class='menu-icon' onclick='toggleMenu()'>
            <span style='color: #0ff; font-size:24px;margin-right:10px;font- weight:bold;'><b><i class="fa-solid fa-bars"></i></b></span>
        </div>

       
        <div style="display: flex; align-items: center; top: 0; position: relative;">
        <p style='font-size: 24px; color: #0ff; margin: 0; margin-left: 5px;'><b>STARTECH</b></p>
        </div>

        <span class="page-title" id="page-title"></span>

<div onclick="navigateWithLoading('/')" style='width: 32px;height: 32px;background-color:#252525;border-radius: 50%;display: flex;justify-content: center;align-items: center;cursor: pointer;right: 65px;top: auto;position: absolute;' >
            <span style='color: #0ff;font-size:20px;'><i class="fa fa-home"></i></span>
         </div> 


       
<div class='notification-icon' onclick='showNotification()'>
            <span style='color: #0ff;font-size:20px;'><i class="fa-solid fa-bell"></i></span>
            <div class='red-dot' id='redDot'></div>
        </div>
        <div class='notification-message' id='notificationMessage'>
            <div id="div1">Hello</div>
            <span onclick='closeNotification()' style='position: absolute; top: 10px; right: 10px; color: white; cursor: pointer; font-weight: bold;'>&#10006;</span>
        </div>






</div>
</div>

  <div class="main-content black-theme">
  <h2>Folder: ${fullPath}</h2>
  <!-- Include Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<!-- Icon Buttons -->
<div class="icon-bar">
  <i class="fa fa-folder-plus icon-button" onclick="togglePopup('subfolderPopup')" title="Create Subfolder"></i>
  <i class="fa fa-upload icon-button" onclick="togglePopup('uploadPopup')" title="Upload Files"></i>
</div>

<!-- Subfolder Popup -->
<div id="subfolderPopup" class="popup-form">
  <div class="popup-content">
    <span class="close" onclick="togglePopup('subfolderPopup')">&times;</span>
    <h3>Create Subfolder</h3>
    <form action="/cloud/folder" method="POST" class="subfolder-form">
      <input type="text" name="name" placeholder="Subfolder Name" required />
      <input type="hidden" name="parentId" value="${currentFolder.folderId}" />
      <button type="submit">Create Subfolder</button>
    </form>
  </div>
</div>

<!-- Upload Popup -->
<div id="uploadPopup" class="popup-form">
  <div class="popup-content">
    <span class="close" onclick="togglePopup('uploadPopup')">&times;</span>
    <h3>Upload Multiple Files</h3>
    <form action="/cloud/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="files" multiple required />
      <input type="hidden" name="folderId" value="${currentFolder.folderId}" />
      <input type="submit" value="Upload" />
    </form>
  </div>
</div>

<!-- CSS -->
<style>
  .icon-bar {
    margin: 10px 0;
  }
  .icon-button {
    font-size: 24px;
    margin-right: 15px;
    cursor: pointer;
    color: #0ff;
  }
  .icon-button:hover {
    color: #007bff;
  }

  .popup-form {
    display: none;
    position: fixed;
    z-index: 100;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  .popup-content {
    background: #151515;
    margin: 10% auto;
    padding: 20px;
    width: 90%;
    max-width: 400px;
    border-radius: 5px;
    position: relative;
  }

  .close {
    position: absolute;
    right: 10px; top: 10px;
    font-size: 20px;
    cursor: pointer;
  }

  form input, form button {
    display: block;
    width: 100%;
    margin: 10px 0;
    padding: 8px;
  }
  video {
  width:100%;
  max-width:500px;
  max-height:300px;
  }


</style>

<!-- JavaScript -->
<script>
  function togglePopup(id) {
    const popup = document.getElementById(id);
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  }

  // Optional: Close popup on outside click
  window.onclick = function(event) {
    const popups = ['subfolderPopup', 'uploadPopup'];
    popups.forEach(id => {
      const popup = document.getElementById(id);
      if (event.target == popup) {
        popup.style.display = 'none';
      }
    });
  }
</script>

    <hr>
  <ul>${subfolderHtml || '<li>No subfolders.</li>'}</ul>
  <ul>${fileListHtml || '<li>No files.</li>'}</ul>


 
  

  <br><a href="/cloud" class="back-link">⬅️ Back to Dashboard</a>

    <!-- Audio Player Modal -->
    <div id="audioModal"  class="popup-form">
    <div class="popup-content">
      <button onclick="closeAudioPlayer()">❌ Close</button>
      <h3 id="audioTitle"></h3>

  <audio id="audioPlayer" controls></audio> <!-- Audio element with ID -->


      <br/><br/>
      <button onclick="playPrevious()">⏮ Prev</button>
      <button onclick="playNext()">⏭ Next</button>
      <a id="audioDownload"><button>⬇️ Download</button></a>
    </div>
    </div>

    <!-- Video Player Modal -->
    <!-- Video Player Modal -->
<div id="videoModal" class="popup-form">
  <div class="popup-content">
  <button onclick="closeVideoPlayer()">❌ Close</button>
  <video id="videoPlayer" controls autoplay ></video>
  <br /><br/>
  <h3 id="videoTitle"></h3>
  <button onclick="playPrev()">⏮ Prev</button>
      <button onclick="playNex()">⏭ Next</button>
  <a id="videoDownload" href="#" target="_blank"><button>⬇️ Download</button></a>
</div>
</div>

    <!-- Image Viewer Modal -->
    <div id="imageModal" class="popup-form">
  <div class="popup-content">
  <button onclick="closeImageViewer()">❌ Close</button>
      <img id="imageViewer" style="max-width: 100%;height:300px;" />
    </div>
    </div>


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
      const response = await fetch('https://hail-torpid-meteor.glitch.me/generate-link', {
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
<script>
  function toggleDropdown(folderName) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });

    const menu = document.getElementById('dropdown-' + folderName); // ✅ correct
    if (menu) {
      menu.style.display = 'block';
      setTimeout(() => {
        window.addEventListener('click', closeAllDropdowns, { once: true });
      }, 0);
    }
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  }
</script>
    <script>
      const audioFiles = ${JSON.stringify(audioFiles)};
      const videoFiles = ${JSON.stringify(videoFiles)};
      let currentIndex = -1;

      document.querySelectorAll('.play-audio').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          currentIndex = parseInt(link.dataset.index);
          playAudio(currentIndex);
        });
      });

document.querySelectorAll('.play-video').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          currentIndex = parseInt(link.dataset.index);
          playVideo(currentIndex);
        });
      });

function playVideo(index) {
        const file = videoFiles[index];
        if (!file) return;
        const videoPlayer = document.getElementById('videoPlayer');
        const videoDownload = document.getElementById('videoDownload');
        const videoTitle = document.getElementById('videoTitle');
        const videoModal = document.getElementById('videoModal');

        videoTitle.textContent = file.filename;
        videoPlayer.src = file.fileUrl;
        videoDownload.href = '/download/' + encodeURIComponent(file.filename) + '?fileId=' + file.fileId;
        videoModal.style.display = 'block';
        videoPlayer.play();
      }

function closeVideoPlayer() {
  const videoPlayer = document.getElementById('videoPlayer');
  videoPlayer.pause();
  videoPlayer.src = '';
  document.getElementById('videoModal').style.display = 'none';
}


      document.querySelectorAll('.view-image').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const imageUrl = link.dataset.url;
          viewImage(imageUrl);
        });
      });

      function playAudio(index) {
        const file = audioFiles[index];
        if (!file) return;
        const audioPlayer = document.getElementById('audioPlayer');
        const audioDownload = document.getElementById('audioDownload');
        const audioTitle = document.getElementById('audioTitle');
        const modal = document.getElementById('audioModal');

        audioTitle.textContent = file.filename;
        audioPlayer.src = file.fileUrl;
        audioDownload.href = '/download/' + encodeURIComponent(file.filename) + '?fileId=' + file.fileId;
        modal.style.display = 'block';
        audioPlayer.play();
      }

      function closeAudioPlayer() {
        document.getElementById('audioModal').style.display = 'none';
        document.getElementById('audioPlayer').pause();
      }

      function viewImage(imageUrl) {
        const imageViewer = document.getElementById('imageViewer');
        const modal = document.getElementById('imageModal');

        imageViewer.src = imageUrl;
        modal.style.display = 'block';
      }

      function closeImageViewer() {
        document.getElementById('imageModal').style.display = 'none';
      }

      function playNext() {
        if (currentIndex + 1 < audioFiles.length) {
          currentIndex++;
          playAudio(currentIndex);
        }
      }

      function playPrevious() {
        if (currentIndex > 0) {
          currentIndex--;
          playAudio(currentIndex);
        }
      }
      function playNex() {
        if (currentIndex + 1 < videoFiles.length) {
          currentIndex++;
          playVideo(currentIndex);
        }
      }

      function playPrev() {
        if (currentIndex > 0) {
          currentIndex--;
          playVideo(currentIndex);
        }
      }

      document.getElementById('audioPlayer').addEventListener('ended', playNext);
      document.getElementById('videoPlayer').addEventListener('ended', playNext);
    </script>
           </div>


  <!-- Preloader -->
  <div id="preloader">
    <div class="loader"></div>
    <p style="margin-left:10px;">
      Loading...
    </p>
  </div>

  <script>
    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const burger = document.getElementById('burger');

      sidebar.classList.toggle('open');
      burger.innerText = sidebar.classList.contains('open') ? '×' : '☰';
    }

    function navigateWithLoading(url) {
      const preloader = document.getElementById('preloader');
      preloader.style.display = 'flex';
      setTimeout(() => {
        window.location.href = url;
      }, 100);
    }

    window.addEventListener('load', function () {
      document.getElementById('preloader').style.display = 'none';
    });
  </script>
</body>
</html>

  `);
});

  app.post('/generate-link', async (req, res) => {
    const { id, uniqueId } = req.body;
    const channelId = '-1002563798217';
    if (!id) {  bot.sendMessage(channelId, 'Missing file ID'); 
              return res.json({ ok: false, error: "Missing file ID" });
             }
    try {
        const file = await FolderFile.findById(id);
        if (!file) return res.json({ ok: false, error: "File not found" });
        // ✅ Step 1: Send the file to the channel only ONCE
        const sentMsg = await bot.sendDocument(channelId, file.fileId, {
            caption: `${file.filename}\n\n⚡ Watch: @YourChannel`,
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


  // ❌ Delete Folder Recursively
  app.post('/cloud/folder/:folderName/delete', async (req, res) => {
    const { folderName } = req.params;
    const folder = await Folder.findOne({ name: folderName, parentId: null });
    if (!folder) return res.send('❌ Folder not found.');

    const deleteFolderRecursive = async (folderId) => {
      const subfolders = await Folder.find({ parentId: folderId });
      for (const sub of subfolders) {
        await deleteFolderRecursive(sub.folderId);
      }

      const files = await FolderFile.find({ folderId });
      for (const file of files) {
        const filePath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await FolderFile.deleteOne({ _id: file._id });
      }

      await Folder.deleteOne({ folderId });
    };

    await deleteFolderRecursive(folder.folderId);
    res.redirect('/cloud');
  });

  // 🗑️ Delete a file
app.post('/cloud/file/delete', async (req, res) => {
  const { fileId, folderId, filename, folderPath } = req.body;

  if (!fileId || !folderId || !filename || !folderPath) {
    return res.send('❌ Missing file info.');
  }

  try {
    // Remove from DB
    await FolderFile.deleteOne({ fileId, folderId });

    // Try to delete local file if it exists
    const localPath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

    // ✅ Redirect back to correct folder path
    const encodedPath = folderPath.split('/').map(encodeURIComponent).join('/');
    return res.redirect(`/cloud/folder/${encodedPath}`);
  } catch (err) {
    console.error('File delete error:', err);
    return res.status(500).send('❌ Failed to delete file.');
  }
});
app.post('/cloud/folder/delete', async (req, res) => {
  const { folderId, folderPath } = req.body;
  if (!folderId || !folderPath) return res.send('❌ Missing folder data.');

  try {
    const folder = await Folder.findOne({ folderId });
    if (!folder) return res.send('❌ Folder not found.');

    const deleteFolderRecursive = async (folderId) => {
      const subfolders = await Folder.find({ parentId: folderId });
      for (const sub of subfolders) {
        await deleteFolderRecursive(sub.folderId);
      }

      const files = await FolderFile.find({ folderId });
      for (const file of files) {
        const localPath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        await FolderFile.deleteOne({ _id: file._id });
      }

      await Folder.deleteOne({ folderId });
    };

    await deleteFolderRecursive(folder.folderId);

    // ✅ Redirect to same parent folder after deletion
    const encodedPath = folderPath.split('/').map(encodeURIComponent).join('/');
    res.redirect(`/cloud/folder/${encodedPath}`);
  } catch (err) {
    console.error('Subfolder delete error:', err);
    res.status(500).send('❌ Failed to delete subfolder.');
  }
});

app.post('/cloud/folder/rename', async (req, res) => {
  const { folderId, newName, folderPath } = req.body;
  if (!folderId || !newName || !folderPath) return res.send('❌ Missing data.');

  try {
    const folder = await Folder.findOne({ folderId });
    if (!folder) return res.send('❌ Folder not found.');

    folder.name = newName;
    await folder.save();

    const redirectPath = folderPath.split('/').map(encodeURIComponent).join('/');
    res.redirect(`/cloud/folder/${redirectPath}`);
  } catch (err) {
    console.error('Folder rename error:', err);
    res.status(500).send('❌ Failed to rename folder.');
  }
});

  // ⬇️ Download File
app.get('/download/:fileName', async (req, res) => {
  const { fileName } = req.params;
  const { fileId } = req.query;
  if (!fileId) return res.status(400).send('❌ Missing fileId');

  try {
    const file = await bot.getFile(fileId);
    if (!file?.file_path) return res.status(500).send('❌ Failed to get file from Telegram.');

    const TOKEN = '8055291382:AAGJYycInowWDSs9N_nxIwCLdoVd2DjCTXQ';
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

    // Fetch the file stream
    const response = await axios.get(fileUrl, { responseType: 'stream' });

    // Set headers to force original filename
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', response.headers['content-type']);

    // Pipe the file stream to the client
    response.data.pipe(res);
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).send('❌ Failed to proxy and download file.');
  }
});
};
