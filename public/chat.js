const socket = io.connect(window.location.hostname),
    // const socket = io.connect("http://localhost:5000"
    message = document.getElementById("message"),
    output = document.getElementById("output"),
    button = document.getElementById("button"),
    feedback = document.getElementById("feedback"),
    name = document.getElementById("dropdownMenuButton"),
    alert = document.getElementById("alert"),
    chat_window = document.getElementById("chat-window"),
    fileInput = document.getElementById("file-input");
let image = "";
$("#up").hide();
//=================================================================
//input image
$("#file-input").on("change", function (e) {
    var file = e.originalEvent.target.files[0],
        reader = new FileReader();
    reader.onload = function (evt) {
        image = evt.target.result;
    };
    reader.readAsDataURL(file);
    message.focus();
});
//=================================================================
//send message
button.addEventListener("click", () => {
    let data = {
        handle: name.textContent,
        message: message.value,
        date: new Date(),
        image: image,
    };
    message.value = "";
    socket.emit("chat", data);
});
//=================================================================
//trigger user typing and send message on enter
message.addEventListener("keyup", (event) => {
    if (message.value !== "") socket.emit("typing", name.textContent);
    else socket.emit("typing", "stop");
    //13 => keycode for Enter
    if (event.keyCode === 13) button.click();
});
//=================================================================
//New User connected
socket.on("connect", () => {
    socket.emit("newconnection", name.textContent);
});
socket.on("newconnection", (data) => {
    $("#alert")
        .html(
            "<div class='alert alert-success' role='alert'>" +
                data +
                " joined the chat" +
                "</div>"
        )
        .hide();
    $("#alert").slideDown(500);
    window.setTimeout(function () {
        $(".alert")
            .fadeTo(500, 0)
            .slideUp(500, function () {
                $(this).remove();
            });
    }, 3000);
});
//=================================================================
//User Disconnected
socket.on("userDisconnected", (data) => {
    $("#alert")
        .html(
            "<div class='alert alert-danger' role='alert'>" +
                data +
                " has left the chat" +
                "</div>"
        )
        .hide();
    $("#alert").slideDown(500);
    window.setTimeout(function () {
        $(".alert")
            .fadeTo(500, 0)
            .slideUp(500, function () {
                $(this).remove();
            });
    }, 3000);
});
//=================================================================
//Recieve message from server and show it on client side
socket.on("chat", (data) => {
    let style, bg, color;

    let users = "";
    if (data.handle === name.textContent) {
        style = "style='display:flex;justify-content:flex-end'";
        data.users.forEach((item) => {
            if (item.name.trim() !== data.handle.trim())
                users += item.name + " , ";
        });
        users = users.slice(0, users.length - 3);
        bg = "bg-secondary";
        color = "text-warning";
    } else {
        style = "style='display:flex;justify-content:flex-start'";
        bg = "bg-dark";
        color = "text-success";
    }
    output.innerHTML +=
        "<div " +
        style +
        "><div class='" +
        bg +
        " mess p-2 mr-1 m-2 rounded col-8 '><h6 class='" +
        color +
        " text-capitalize'>" +
        data.handle +
        " </h6><h5> " +
        data.message +
        "</h5>" +
        '<img class="img-fluid rounded" src="' +
        data.image +
        '"/>' +
        "<div style='text-align:right'>" +
        new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
        }).format(new Date(data.date)) +
        "</div></div></div>";
    if (users !== "")
        output.innerHTML +=
            "<div " +
            style +
            " ><div class='bg-success seen pl-2 pr-2 p-1 mr-2 rounded col-8 '><strong><em>Seen by " +
            users +
            "</em></strong></div></div>";

    $("file-input").val("");
    image = "";
    socket.emit("typing", "stop");
    showUp();
    scroll();
    // message.focus();
});
//=================================================================
//show typing message
socket.on("typing", (data) => {
    if (data === "stop") $(".type").remove();
    else
        $("#feedback").html(
            "<p class='badge badge-info p-2 ml-2 type'><em>" +
                data +
                " is typing .... </em></p>"
        );
    scroll();
});
const showUp = () => {
    if (chat_window.scrollHeight > chat_window.clientHeight) $("#up").show();
};
const scroll = () => {
    chat_window.scrollTo({ top: chat_window.scrollHeight, behavior: "smooth" });
};
const scrollUp = () => {
    chat_window.scrollTo({ top: 0, behavior: "smooth" });
};
