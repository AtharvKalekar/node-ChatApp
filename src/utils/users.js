const users = []; // Use a different name for the array

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: 'Username and room are required',
        };
    }

    // Check existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // Validate user
    if (existingUser) {
        return {
            error: 'Username is in use',
        };
    }
    // Store User
    const user = { id, username, room }; // Use a different name for the object
    users.push(user); // Use the correct array name
    return { user };
};

const removeUser =(id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !==-1){
      return  users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUserInRoom =(room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}