const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage}=require('./utils/messages')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server) //sever la bi-direction banavata

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket)=>{
    console.log("new websocket connection",socket.id);

   

    socket.on('join', (options, callback)=>{
        const {error, user} = addUser({id:socket.id,...options })

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`Admin, ${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(message, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Bad words not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation',(coords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    //send a message when a user is disconnected
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the chat`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
})

server.listen(port,()=>{
    console.log("Server is running on port " + port);
})
 