const path = require('path')
const http = require('http')

const express = require('express')
const socketio = require('socket.io')

const badWordsFilter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { redirect } = require('express/lib/response')


const app = express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

//Connect the public directory to the server app instance
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log(`New WebSocket connection`)

    

    socket.on("join", ({username, room}, callback) => {
        console.log(username,room)

        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        //Emit Welcome message
        socket.emit('message', generateMessage('Admin',`Welcome to room ${room}!`))

        //Emit to everybody except this particular connection
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (receivedMessage, callback) => {
        
        const user = getUser(socket.id)

        if(!user){
            console.error("Session Lost")
            socket.emit('message',generateMessage("Session Lost, go to Login page './"))
            callback('Session Lost')
            return
        }

        const filter = new badWordsFilter()

        if(filter.isProfane(receivedMessage)){
            return callback('Profanity is not allowed!')
        }
        
        io.to(user.room).emit('message',generateMessage(user.username,receivedMessage))

        callback('delivered!')
    })

    socket.on('sendLocation', (clientLocation, callback) => {
        const user = getUser(socket.id)
        if(!user){
            console.error("Session Lost")
            socket.emit('message',generateMessage("Session Lost, go to Login page './"))
            callback('Session Lost')
            return
        }
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${clientLocation.latitude},${clientLocation.longitude}`))
        callback(`https://google.com/maps?q=${clientLocation.latitude},${clientLocation.longitude}`)
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left` ))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})