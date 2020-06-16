// const socket = io.connect(window.location.hostname),
const socket = io.connect("http://localhost:4000"),
    name = document.getElementById("dropdownMenuButton"),
    roomName = document.getElementById("roomName");
const createRoom = () => {
    socket.emit("createRoom", { handle: name.textContent });
};
const joinRoom = () => {
    socket.emit("joinRoom", {
        handle: name.textContent,
        room: roomName.value,
    });
    socket.on("joined", (data) => {
        document.querySelector(".close").click();
        // location.href = `/chat/${roomName.value}`;
        document.getElementById("btns").style.display = none;
    });
};
