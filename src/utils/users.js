const users = []

const addUser = ({id, username, room}) => {
    //Clean the data

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate data
    if(!username || !room ){
        return {
            error: "Username and room are required!"
        }
    }

    //name is unique? or already taken?
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser) {
        return {
            error: "Username is in use!"
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)

    return { user }

}

const removeUser = (id) => {
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    // const index = users.findIndex((user)=> user.id === id)

    // if(index !== -1){
    //     return users[index]
    // }else{
    //     return undefined
    // }

    //OR

    return users.find( user => user.id === id)

}

/**
 * Returns [users in room] or []
 * @param {*} room 
 */
const getUsersInRoom = (room) => {
    const foundUsers = users.filter( user => user.room === room)
    return foundUsers
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


// addUser({
//     id:22,
//     username: 'Pablo',
//     room: 'Granada'
// })

// addUser({
//     id:23,
//     username: 'Pablo',
//     room: 'Madrid'
// })

// addUser({
//     id:24,
//     username: 'Paul',
//     room: 'Granada'
// })


// console.log(users)

// const user = getUser(22)
// console.log('Usuario encontrado: ',user)
// const notFoundUser = getUser(3124)
// console.log('Usuario no encontrado',notFoundUser)

// const usersInGranada = getUsersInRoom('granada')
// console.log(usersInGranada)
// const usersnotFound = getUsersInRoom('gada')
// console.log(usersnotFound)
// const removedUser = removeUser(22)

// console.log(removedUser)
// console.log(users)