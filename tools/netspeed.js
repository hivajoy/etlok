const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

module.exports = function (app, mongoose, bot, express, path) {
  // Serve the HTML page
  app.get('/netspeed', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Network Speed Test</title>
       <style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background: #121212;
    color: #e0e0e0;
  }

  .container {
    background: #1e1e1e;
    border-radius: 10px;
    padding: 25px;
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 255, 100, 0.05);
    transition: all 0.3s ease;
  }

  h2 {
    text-align: center;
    color: #00ff88;
    margin-bottom: 20px;
  }

  .status {
    font-size: 1.1em;
    margin-bottom: 10px;
  }

  .status p {
    margin: 5px 0;
    line-height: 1.4;
  }

  .progress-bar {
    width: 100%;
    height: 22px;
    background: #2c2c2c;
    border-radius: 11px;
    overflow: hidden;
    margin-top: 15px;
    border: 1px solid #444;
  }

  .progress {
    height: 100%;
    width: 0%;
    background: linear-gradient(to right, #00ff88, #00d9ff);
    transition: width 0.4s ease;
  }

  @media screen and (max-width: 600px) {
    .container {
      padding: 15px;
    }

    .status {
      font-size: 1em;
    }

    h2 {
      font-size: 1.5em;
    }
  }
</style>

      </head>
      <body>
        <div class="container">
          <h2>Network Speed Test</h2>
          <div class="status">
            <p>Testing in progress...</p>
            <p id="downloaded">Downloaded: 0.00 MB</p>
            <p id="duration">Duration: 0.00 sec</p>
            <p id="speed">Speed: 0.00 Mbps</p>
          </div>
          <div class="progress-bar">
            <div id="progress" class="progress"></div>
          </div>
        </div>

<script>
  const eventSource = new EventSource('/netspeed-progress');

  eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.error) {
      document.body.innerHTML += \`<p style="color: red;">\${data.error}</p>\`;
      eventSource.close();
      return;
    }

    if (data.phase === 'download') {
      document.getElementById('downloaded').innerText = \`Downloaded: \${data.downloaded} MB\`;
      document.getElementById('duration').innerText = \`Duration: \${data.duration} sec\`;
      document.getElementById('speed').innerText = \`Download Speed: \${data.speed} Mbps\`;

      const progress = Math.min((parseFloat(data.downloaded) / 100) * 100, 100);
      document.getElementById('progress').style.width = \`\${progress}%\`;
    }

    if (data.phase === 'final') {
      document.getElementById('downloaded').innerText = \`Download: \${data.downloadSpeed} Mbps\`;
      document.getElementById('duration').innerText = \`Upload: \${data.uploadSpeed} Mbps\`;
      document.getElementById('speed').innerHTML = \`
        ✅ <strong>Test Completed</strong><br>
        ⬇️ Download Speed: <strong>\${data.downloadSpeed} Mbps</strong><br>
        ⬆️ Upload Speed: <strong>\${data.uploadSpeed} Mbps</strong><br>
        🕒 Download Time: \${data.downloadDuration} sec<br>
        🕒 Upload Time: \${data.uploadDuration} sec
      \`;

      document.getElementById('progress').style.width = '100%';
      eventSource.close();
    }
  };

  eventSource.onerror = function() {
    console.error('SSE connection failed.');
    eventSource.close();
  };
</script>

      </body>
      </html>
    `);
  });

  // Download + Upload test with real-time progress
app.get('/netspeed-progress', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const downloadUrl = 'https://speed.hetzner.de/100MB.bin';
    const response = await axios.get(downloadUrl, {
      responseType: 'stream',
      httpsAgent: agent,
    });

    let downloadedBytes = 0;
    const startTime = Date.now();

    const downloadStream = response.data;

    const timer = setTimeout(() => {
      downloadStream.destroy(); // stop after 10 seconds
    }, 10 * 1000);

    downloadStream.on('data', chunk => {
      downloadedBytes += chunk.length;
      const now = Date.now();
      const seconds = (now - startTime) / 1000;
      const speedMbps = (downloadedBytes * 8) / (seconds * 1024 * 1024);

      res.write(`data: ${JSON.stringify({
        phase: 'download',
        downloaded: (downloadedBytes / (1024 * 1024)).toFixed(2),
        duration: seconds.toFixed(2),
        speed: speedMbps.toFixed(2)
      })}\n\n`);
    });

    downloadStream.on('end', async () => {
      clearTimeout(timer);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      const downloadMbps = (downloadedBytes * 8) / (duration * 1024 * 1024);

      // Upload Test
      const uploadSize = 10 * 1024 * 1024;
      const uploadData = Buffer.alloc(uploadSize, 'a');
      const startUpload = Date.now();

      await axios.post('https://httpbin.org/post', uploadData, {
        headers: { 'Content-Type': 'application/octet-stream' },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        httpsAgent: agent,
      });

      const endUpload = Date.now();
      const uploadDuration = (endUpload - startUpload) / 1000;
      const uploadMbps = (uploadSize * 8) / (uploadDuration * 1024 * 1024);

      // Final result
      res.write(`data: ${JSON.stringify({
        phase: 'final',
        downloadSpeed: downloadMbps.toFixed(2),
        uploadSpeed: uploadMbps.toFixed(2),
        downloadDuration: duration.toFixed(2),
        uploadDuration: uploadDuration.toFixed(2)
      })}\n\n`);
      res.end();
    });

    downloadStream.on('error', err => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ error: 'Download error' })}\n\n`);
      res.end();
    });

  } catch (err) {
    console.error('Speed test failed:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'Speed test failed' })}\n\n`);
    res.end();
  }
});

};
