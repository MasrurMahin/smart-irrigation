// Smart Irrigation System - main server file - Member 1
const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'smart-irrigation-secret',
  resave: false,
  saveUninitialized: false
}));

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/fields'));
app.use('/api', require('./routes/irrigation'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
