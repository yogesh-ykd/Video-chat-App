const express=require('express');
const app=express();
const ejs=require('ejs');
const bodyParser=require('body-parser');
const server=require('http').createServer(app);
const io=require('socket.io')(server);
// console.log(server);

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

const { v4: uuidV4 } = require('uuid')

app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');
app.use(express.static('public'));

app.get('/',function(req,res){
    res.render('room');
})

app.post('/make_new_room',function(req,res){
    res.redirect('/'+uuidV4());
})

app.post('/',function(req,res){
    res.redirect('/'+req.body.room_id);
})

app.get('/:room_id',function(req,res){
    res.render('home',{room_id:req.params.room_id});
})

io.on('connection',function(socket){
    socket.on('join-room',function(room_id,peer_id){
        console.log(room_id);
        socket.join(room_id);
        socket.broadcast.to(room_id).emit('user-connected', peer_id)
        
        socket.on('disconnect', () => {
            socket.broadcast.to(room_id).emit('user-disconnected', peer_id)
          })

        socket.on('message',function(message){
            console.log(message);
            io.to(room_id).emit('message-to-all',message);
        })
    })
})

server.listen(process.env.PORT||3000);
