const axios = require('axios');

module.exports = function (app, mongoose, bot, express, path) {

  app.get('/notepad', async (req, res) => {
    let fileContent = '';
    const fileUrl = req.query.file;

    if (fileUrl) {
      try {
        const response = await axios.get(fileUrl);
        fileContent = response.data.toString();
      } catch (error) {
        fileContent = `Error loading file: ${error.message}`;
      }
    }

    const escapeHtml = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

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

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <style>
        .main-content {
        padding:0px;
        padding-top:10px;
        }
          .notepad {
            width: 100%;
            height: 93%;
            background: #FFFDD0;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 10px 5px;
            box-sizing: border-box;
            overflow: auto;
            position: relative;
          }
          textarea {
            width: 100%;
            height: 93%;
            border: none;
            resize: none;
            font-size: 16px;
            line-height: 24px;
            outline: none;
            background-image: repeating-linear-gradient(to bottom, transparent, transparent 23px, #ccc 24px);
            background-size: 100% 24px;
            background-attachment: local;
            background-color: #FFFDD0;
            padding: 0;
          }
          .controls {
          position:fixed;
          width:100%;
          justify-content:center;
          align-items:center;
            gap:5px;
            bottom: 0px;
            text-align: center;
            background:black;
            z-index:99;
            padding:10px;
          }
          input[type="text"] {
          color:white;
          background:#151515;
          border:2px solid #0ff;
          border-radius:5px;
            padding: 5px;
            font-size: 14px;
            margin-right: 5px;
          }
          button {
          color:#0ff;
          border:2px solid #0ff;
          border-radius:5px;
          background:black;
            padding: 5px 10px;
            font-size: 14px;
            cursor: pointer;
          }
          @media (min-width:769px) {
          .controls {
          padding-right:260px;
          }
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

  <div class="main-content">

        <div class="notepad">
          <textarea id="note" placeholder="Start writing here...">${escapeHtml(fileContent)}</textarea>
        </div>
        <div class="controls">
        <button onclick="navigateWithLoading('/notepad')">New File</button>
  <input type="text" id="filename" placeholder="Filename (without extension)">
  <button onclick="saveTxt()">Save</button> <!-- New Save Button -->
  <button onclick="downloadTxt()">Download TXT</button>
  <button onclick="downloadPdf()">Download PDF</button>
</div>
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

        <script>
  function downloadTxt() {
    const text = document.getElementById('note').value;
    const filename = document.getElementById('filename').value.trim() || 'untitled';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function saveTxt() {
    const text = document.getElementById('note').value;
    const filename = document.getElementById('filename').value.trim() || 'untitled';
    const folderId = 'mausnkso8o';

    const blob = new Blob([text], { type: 'text/plain' });
    const file = new File([blob], filename + '.txt', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('files', file); // input name="files"
    formData.append('folderId', folderId);

    try {
      const response = await fetch('/cloud/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('File saved successfully!');
      } else {
        alert('Error saving file.');
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  }

  async function downloadPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = document.getElementById('note').value;
    const lines = doc.splitTextToSize(text, 180); // width within A4 margins
    const lineHeight = 10;
    let y = 10;

    lines.forEach((line, i) => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(line, 10, y);
      y += lineHeight;
    });

    const filename = document.getElementById('filename').value.trim() || 'untitled';
    doc.save(filename + '.pdf');
  }
</script>

      </body>
      </html>
    `);
  });
}
