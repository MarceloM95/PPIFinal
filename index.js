const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'sua_chave_secreta', resave: true, saveUninitialized: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const messages = [];
const users = {};

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/cadastro', (req, res) => {
  const { username, birthdate, nickname } = req.body;

  if (username && birthdate && nickname) {
    const newUser = { username, birthdate, nickname };
    req.session.user = newUser;
    users[username] = newUser;

    res.render('lista-usuarios', { users: Object.values(users) });
  } else {
    res.redirect('/');
  }
});

app.get('/lista-usuarios', (req, res) => {
  res.render('lista-usuarios', { users: Object.values(users) });
});

app.get('/chat/:username', (req, res) => {
  const targetUsername = req.params.username;
  const username = req.session.user && req.session.user.username;

  if (!username || !users[targetUsername]) {
    return res.redirect('/');
  }

  res.render('chat', { user: req.session.user, targetUser: users[targetUsername], messages });
});

app.post('/enviar-mensagem', (req, res) => {
    const username = req.session.user && req.session.user.username;
    const message = req.body.mensagem;
  
    if (username && message) {
      const timestamp = new Date().toLocaleTimeString();
      const formattedMessage = `${timestamp} - ${username}: ${message}`;
      messages.push(formattedMessage);
  
      res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso' });
    } else {
      res.status(400).json({ success: false, message: 'Erro ao enviar mensagem' });
    }
});

app.get('/obter-mensagens', (req, res) => {
    res.json(messages);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});