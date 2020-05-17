const socket = io.connect("http://localhost:3000");
const message = document.getElementById("message"),
    handle = document.getElementById("handle"),
    output = document.getElementById("output"),
    button = document.getElementById("button"),
    feedback = document.getElementById("feedback"),
    name = document.getElementById("dropdownMenuButton"),
    chat_window = document.getElementById("chat-window");

button.addEventListener("click", () => {
    let data = {
        handle: name.textContent.trim(),
        message: message.value,
        date: new Date(),
    };
    socket.emit("chat", data);
    output.innerHTML +=
        "<div style='display:flex;justify-content:flex-end'><div class='bg-secondary mess p-2 m-2 rounded col-12 col-md-6'><h6 class='text-warning '>" +
        data.handle +
        " </h6><h5> " +
        data.message +
        "</h5><p>" +
        new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
        }).format(new Date(data.date)) +
        "</p></div></div>";
});
message.addEventListener("keypress", () => {
    socket.emit("typing", handle.value);
});
socket.on("chat", (data) => {
    feedback.innerHTML = "";
    output.innerHTML +=
        "<div class='row'><div class='bg-dark mess p-2 m-2 rounded col-12 col-md-6'><h6 class='text-success '>" +
        data.handle +
        " </h6><h5> " +
        data.message +
        "</h5><p>" +
        new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
        }).format(new Date(data.date)) +
        "</p></div></div>";

    chat_window.scrollTop = chat_window.scrollHeight;
});
socket.on("typing", (data) => {
    feedback.innerHTML = "<p><em>" + data + " is typing .... </em></p>";
});
