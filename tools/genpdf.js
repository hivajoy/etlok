module.exports = function (app, mongoose, bot, express, path) {
  const fs = require('fs');
  const fetch = require('node-fetch');

  // Required by PDFShift for global btoa
  global.btoa = (b) => Buffer.from(b).toString('base64');

  const PDFSHIFT_API_KEY = 'sk_3f1696e3c979b6af17008d9757b9c0837fc36f54'; // ⚠️ Regenerate if shared publicly

  // Endpoint to generate PDF
  app.get('/generate-pdf', async (req, res) => {
    const { url, outputFile } = req.query;

    if (!url || !outputFile) {
      return res.status(400).send('URL and outputFile are required');
    }

    try {
      const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
          'X-API-Key': PDFSHIFT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: url,
          landscape: false,
          use_print: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDFShift API Error:', errorText);
        return res.status(500).send('PDFShift API failed');
      }

      const filePath = `/tmp/${outputFile}`;
      const fileStream = fs.createWriteStream(filePath);
      response.body.pipe(fileStream);

      fileStream.on('finish', () => {
        res.download(filePath, outputFile);
      });

      fileStream.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).send('Failed to save PDF');
      });

    } catch (error) {
      console.error('Fetch error:', error.message);
      res.status(500).send('PDF generation failed');
    }
  });

  // Simple HTML form for testing
  app.get('/test-pdf-generation', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>PDF Generator</title>
          <style>
            body {
              font-family: Arial;
              max-width: 600px;
              margin: auto;
              padding: 40px;
              background: #f9f9f9;
            }
            input, button {
              padding: 10px;
              margin: 8px 0;
              width: 100%;
              font-size: 16px;
            }
            button {
              background-color: #4CAF50;
              color: white;
              border: none;
              cursor: pointer;
            }
            button:hover {
              background-color: #45a049;
            }
          </style>
        </head>
        <body>
          <h2>📝 Webpage to PDF Generator</h2>
          <form action="/generate-pdf" method="get">
            <label for="url">🔗 Page URL:</label><br>
            <input type="text" id="url" name="url" placeholder="https://example.com" required><br>

            <label for="outputFile">📄 Output PDF Filename:</label><br>
            <input type="text" id="outputFile" name="outputFile" placeholder="example.pdf" required><br>

            <button type="submit">Generate PDF</button>
          </form>
        </body>
      </html>
    `);
  });
};
