// Node.js WebSocket server script
const http = require('http');
const WebSocketServer = require('websocket').server;
const filter = require('leo-profanity');
let fs = require('fs');
let express = require('express');
let app = express();
let cors = require('cors')

app.use(cors());

// Let's create the regular HTTP request and response
app.get('/', function(req, res) {

  console.log('/')
  res.send('up? lol')
});

app.get('/newUser', function(req, res) {

  console.log('/newUser')
  let usn = req.query.username
  let password = req.query.password

  User.findOne({ Username: usn }, (err, obj) => {
    // console.log(obj)
    if (obj) {
      res.send({
        authenticated: false,
        reason: "User already exists"
      })
    } else {
      newUser(usn, password)
      // console.log(tokks)
      User.findOne({Username: usn}, (err,obj)=>{
        if(obj)
        {
          res.send({
        authenticated: true,
        token: obj.Token
        })
        }else {
          console.log(err)
          res.send({
        authenticated: false,
        reason: "Click the login button now"
      })
        }
      })
    }
  })
});

app.get('/login', function(req, res) {

  console.log('/login')
  let usn = req.query.username
  let password = req.query.password

  User.findOne({ Username: usn }, (err, obj) => {
    if (obj) {
      // res.send('User exists')
      if (obj.Password == password) {
        console.log('r')
        res.send({
          authenticated: true,
          token: obj.Token
        })
      } else {
        console.log('w')
        res.send({
          authenticated: false,
          reason: "Wrong password"
        })
      }
    } else {
      res.send({
        authenticated: false,
        reason: "User doesnt exist"
      })
    }
  })
});

const mongoose = require('mongoose');
const User = require('./schemas/user');
const Channel = require('./schemas/channel')

const token_chars = ['a', 'b', 'c', 'd', 'e', '-', '@', '#']

mongoose.connect('mongodb+srv://amukh1:Fofofofo11@cluster0.hdjfgux.mongodb.net/Arch')
  .then((result) => { console.log('Connected to Mongo!') })
  .catch((error) => { console.log('Error connecting to Mongo:', error) });

function generate_token(length, uuid) {
  let string = ''
  for (let i = 0; i <= length; i++) {
    // console.log(i)
    string = string + token_chars[Math.floor(Math.random() * token_chars.length)]
    // console.log(token_chars)
  }
  return string + '-' + uuid
}

console.log(generate_token(16, 6))

let admins = ['amukh1', 'admin', 'walter white']


// app.listen(69)

let rooms = {}

function newUser(name, pass) {
  User.find({}, (err, arr) => {
    // console.log(arr.length + 1)
let tokks = generate_token(16, arr.length + 1)
    let user = new User({
      Username: name,
      Password: pass,
      Token: tokks,
      uuid: arr.length + 1
    })

    user.save()
      .then((result) => {
        console.log(result)
      }).catch((error) => {
        console.log(error)
      });
// return tokks
  })
}

// newUser('mr.crabbs', 'password')



const server = http.createServer()

/*
  function(req, res) {
  // res.writeHead(200, {'Content-Type': 'text/html'});
  // res.send('hi')
  res.write('hi', 'utf-8')
  // writeHtml(res)
}*/

server.on('request', app)

server.listen(3000, () => console.log('Listening for ws on port 3000'));
const wsServer = new WebSocketServer({
  httpServer: server
});


wsServer.on('request', function(request) {
  console.log("ws received")
  const connection = request.accept(null, request.origin);
  connection.on('message', function(message) {
    let msg = JSON.parse(message.utf8Data)
if(msg.msg === "") {
  console.log('DONT SEND DUMB EMPTY MESSAGES I HATE YOU I WILL BEAT CRAP OUT OF YOU')
  return
}
    if (msg.type == 'join') {
      console.log(`USER JOINING AS ${msg.user} in ${msg.room}`)
      if (rooms[msg.room]) {
        // console.log(rooms[msg.room].users.indexOf({ user: msg.user, status: "online" }))
        if(!rooms[msg.room].users.includes({ user: msg.user, status: "online" })){
        
        rooms[msg.room].users.push({ user: msg.user, status: "online" })
        }
      } else {
        rooms[msg.room] = {
          users: [{ user: msg.user, status: "online" }],
          msgs: []
        }
      }
      // connection.sendUTF({});
      wsServer.broadcast(JSON.stringify({
        type: 'ready',
        room: msg.room,
        user: msg.user,
        users: rooms[msg.room].users,
        msgs: rooms[msg.room].msgs,
      }))
      // wsServer.broadcast(JSON.stringify(rooms[msg.room]))
    } else if (msg.type == 'msg') {
      console.log(`New msg from ${msg.user} in room ${msg.room} as ${msg.msg.msg}`)

      let cmd_cmd = msg.msg.msg
      console.log(cmd_cmd)
      if (cmd_cmd.startsWith("!") && admins.includes(msg.user)) {
        console.log('command from admin')
        if (cmd_cmd.startsWith("!clear msgs")) {
          rooms[msg.room].msgs = []
          wsServer.broadcast(JSON.stringify({
            room: msg.room,
            msg: msg.msg,
            type: 'msg',
            user: 'system',
            msgs: []
          }))


        } else if (cmd_cmd.startsWith("!clear users")) {
          rooms[msg.room].users = []
          wsServer.broadcast(JSON.stringify({
            room: msg.room,
            msg: msg.msg,
            type: 'ready',
            user: msg.user,
            users: rooms[msg.room].users
          }))

        } else if (cmd_cmd.startsWith('!shoot')) {
          let target = cmd_cmd.split(" ")[1]
          console.log('shooting ' + target)
          wsServer.broadcast(JSON.stringify({
            room: msg.room,
            type: 'shoot',
            user: target,
          }))
        }
      }
      // wsServer.broadcast(JSON.stringify(msg))
      // wsServer.broadcast(JSON.stringify(rooms[msg.room]))
      msg.msg.msg = filter.clean(msg.msg.msg)
      fs.appendFileSync('./logs.txt', `${msg.user} sent ${msg.msg.msg} in ${msg.room}`,()=> {
        return
      })
      User.findOne({ Username: msg.user }, (err, obj) => {
if(!obj){
  console.log('bros doesnt exist lol')
}else if (obj.Token == msg.token) {

if(rooms[msg.room]){
            rooms[msg.room].msgs.push(msg.msg)
}else {
            rooms[msg.room].msgs = [msg.msg]
}

          wsServer.broadcast(JSON.stringify({
            room: msg.room,
            msg: msg.msg,
            type: 'msg',
            user: msg.user,
            msgs: rooms[msg.room].msgs
          }))
        } else {
          console.log('faker lol')
  console.log(obj.Token)
  console.log(msg.token)
        }
      })
    } else {
      console.log('Received Message:' + msg);
    }
    // connection.sendUTF('Hi this is WebSocket server!');
  });
  connection.on('close', function(rc, d) {
    console.log('Client has disconnected.', rc, d);
  });
});


console.log('on')
