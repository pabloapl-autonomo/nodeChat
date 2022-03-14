const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form')
const $sendLocationButton = $messageForm.querySelector('#sendLocationBtn')
const $messageFormInput = $messageForm.querySelector('#input')
const $sendMessageButton = $messageForm.querySelector('#sendMessageBtn')
const $messages = document.querySelector('#messages')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options Received from Login
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    //Calculate height
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}


//Prints message received 
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render($messageTemplate, {
        username: message.username, 
        message: message.text,
        createdAt: moment(message.createdAt).format("HH:mm ")  
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//Prints message received on console
socket.on('locationMessage', (locationMessage) => {
    const html = Mustache.render($locationTemplate, { 
        username: locationMessage.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format("HH:mm")  
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


//Send message event
$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    $sendMessageButton.setAttribute('disabled', 'disabled')

    const message = $messageFormInput.value

    socket.emit("sendMessage", message, (error) => {
        $sendMessageButton.removeAttribute('disabled', 'disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus();

        if(error){
            return console.log(error)
        }else{
            console.log('Message delivered!')
        }
    })
})

//Listener for form
$sendLocationButton.addEventListener('click', (event) => {
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }else{
        navigator.geolocation.getCurrentPosition( (location) => {
            let position = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }
            socket.emit("sendLocation", position, (callback) => {
                $sendLocationButton.removeAttribute('disabled', 'disabled')

                console.log(callback)
                // const html = Mustache.render($locationTemplate, { 
                //     username: username,
                //     message: callback,
                //     createdAt:  moment(new Date().getTime()).format("HH:mm ")
                // })
                // $messages.insertAdjacentHTML('beforeend', html)
                
            })
        })
    }
})

socket.on('roomData', ({room, users}) => {
    console.log(room, users)
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit("join", {username, room} , (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})
