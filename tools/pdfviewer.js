module.exports = function (app, mongoose, bot, express, path) {
  
const request = require('request');
// ✅ Proxy route to fetch remote PDF
app.get('/viewpdf', (req, res) => {
  let pdfUrl = req.query.url;
  if (!pdfUrl) return res.status(400).send('❌ PDF URL is missing.');

  try {
    pdfUrl = decodeURIComponent(pdfUrl);
  } catch {
    return res.status(400).send('❌ Invalid PDF URL.');
  }

  // Prevent infinite loop
  if (pdfUrl.includes('/viewpdf')) return res.status(400).send('❌ Recursive URL not allowed.');

  // Make HTTP request and stream PDF
  request
    .get({ url: pdfUrl, encoding: null, followAllRedirects: true })
    .on('error', err => {
      console.error(err);
      res.status(500).send('❌ Failed to load PDF.');
    })
    .on('response', response => {
      if (!response.headers['content-type']?.includes('pdf')) {
        console.warn('⚠️ Warning: Content-Type is not PDF');
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="proxy.pdf"');
    })
    .pipe(res);
});

// ✅ HTML PDF Viewer using PDF.js
app.get('/pdfreader', (req, res) => {
  const pdfUrl = req.query.url;
  if (!pdfUrl) return res.status(400).send('Missing PDF URL');

  const encodedUrl = encodeURIComponent(pdfUrl);

  const html = `
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

  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
  <style>
    #controls {
      position: relative; width: 100%;
      background: none; padding: 0px;
      text-align: center; z-index: 99; box-shadow: 0 1px 5px rgba(0,0,0,0.1);
    }
    canvas { display: block; margin: 70px auto 20px auto; border: 1px solid #ccc; height:100%;max-height:700px;}
  </style>
</head>
    
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



  <canvas id="pdf-canvas"></canvas>
    <div id="controls"><a href="${pdfUrl}">Download</a>
    <button onclick="prevPage()">⬅️ Prev</button>
    <span>Page: <span id="page-num">1</span> / <span id="page-count">--</span></span>
    <button onclick="nextPage()">Next ➡️</button>
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
    const url = '/viewpdf?url=${encodedUrl}';
    let pdfDoc = null, pageNum = 1;
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    function renderPage(num) {
      pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({ canvasContext: ctx, viewport });
        document.getElementById('page-num').textContent = num;
      });
    }

    function prevPage() {
      if (pageNum <= 1) return;
      pageNum--; renderPage(pageNum);
    }

    function nextPage() {
      if (pageNum >= pdfDoc.numPages) return;
      pageNum++; renderPage(pageNum);
    }

    pdfjsLib.getDocument(url).promise.then(pdf => {
      pdfDoc = pdf;
      document.getElementById('page-count').textContent = pdf.numPages;
      renderPage(pageNum);
    }).catch(err => {
      alert("❌ Failed to load PDF");
      console.error(err);
    });
  </script>
</body>
</html>
  `;

  res.send(html);
});
  
}
