const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;

const app = express();

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));


app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Front-end App is serving on port: ${port}, end: ${process.env.NODE_ENV}`);
});
