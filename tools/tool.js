module.exports = function (app, mongoose, bot, express, path, authMiddleware) {
  
const request = require('request');
require('./notepad')(app, mongoose, bot, express, path);
  require('./netspeed')(app, mongoose, bot, express, path);
  app.get('/tools', (req, res) => {
  res.sendFile(path.join(__dirname, 'tools.html'));
});
  require('./pdfviewer')(app, mongoose, bot, express, path);
  require('./genpdf')(app, mongoose, bot, express, path);

}
