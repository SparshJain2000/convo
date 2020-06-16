const users = [];
const addUser = (id, handle, room) => {
    users.push({
        id: id,
        name: handle,
        room: room,
    });
};
const getUsers = () => {
    return users;
};
const deleteUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        const user = users[index];
        users.splice(index, 1);
        return user;
    }
    return null;
};
const getRoomUsers = (room) => {
    return users.filter((user) => user.room === room);
};
module.exports = { addUser, getUsers, deleteUser, getRoomUsers };
