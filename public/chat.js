const socket = io.connect(window.location.hostname),
    // const socket = io.connect("http://localhost:5000"),
    message = document.getElementById("message"),
    output = document.getElementById("output"),
    button = document.getElementById("button"),
    feedback = document.getElementById("feedback"),
    name = document.getElementById("dropdownMenuButton"),
    alert = document.getElementById("alert"),
    chat_window = document.getElementById("chat-window"),
    fileInput = document.getElementById("file-input");
let image = "";
$("#up").html('<i class= "fa fa-arrow-up" >').hide();

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
    // console.log("sending");
    // $("#alert")
    //     .html(
    //         "<div class='alert alert-primary' role='alert'> Sending &nbsp <div class= 'spinner-grow spinner-grow-sm text-info m-1' role = 'status' > <span class='sr-only'>Loading...</span></div></div>"
    //     )
    //     .hide();
    // $("#alert").slideDown(500);
    let style = "display:flex;justify-content:flex-end",
        bg = `bg-secondary mess p-2 mr-1 m-2 rounded col-8 `,
        color = `text-warning text-capitalize`;
    output.innerHTML += `<div style=${style} ><div class='${bg}'><h6 class= ${color}>${
        data.handle
    }</h6><h5>${data.message}</h5><img class="img-fluid rounded mb-2" src='${
        data.image
    }'/><div style="text-align:right"> 
    ${new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
    }).format(
        new Date(data.date)
    )}&nbsp &nbsp<div class= 'spinner-border spinner-border-sm' role = 'status' > <span class='sr-only'>Loading...</span></div></div></div></div>`;
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
    let style,
        bg,
        color,
        users = "";

    if (data.handle === name.textContent) {
        style = "display:flex;justify-content:flex-end";
        data.users.forEach((item) => {
            if (item.name.trim() !== data.handle.trim())
                users += `${item.name} , `;
        });
        users = users.slice(0, users.length - 3);
        if (users !== "")
            output.innerHTML += `<div style=${style}><div class='bg-success seen pl-2 pr-2 p-1 mr-2 rounded col-8 '><strong><em>Seen by ${users} </em></strong></div></div>`;
        $(".spinner-border")
            .parent()
            .append("<i class='fa fa-check text-warning'></i>");
        $(".spinner-border").remove();
    } else {
        style = "display:flex;justify-content:flex-start";
        bg = `bg-dark mess p-2 mr-1 m-2 rounded col-8 `;
        color = `text-success text-capitalize`;
        output.innerHTML += `<div style=${style} ><div class='${bg}'><h6 class= ${color}>${
            data.handle
        }</h6><h5>${
            data.message
        }</h5><img class="img-fluid rounded mb-2" src='${
            data.image
        }'/><div style="text-align:right"> 
    ${new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(data.date))}&nbsp &nbsp</div></div></div>`;
    }
    $("file-input").val("");
    image = "";
    socket.emit("typing", "stop");
    showUp();
    scroll();
    // console.log("recieved");
    // if ($("#alert").html() != "") {
    //     $("#alert").html(
    //         "<div class='alert alert-success' role='alert'> Sent </div>"
    //     );
    //     window.setTimeout(function () {
    //         console.log(true);
    //         $(".alert")
    //             .fadeTo(500, 0)
    //             .slideUp(500, function () {
    //                 $(this).remove();
    //             });
    //     }, 700);
    // }
    // message.focus();
});

//=================================================================
//show typing message
socket.on("typing", (data) => {
    if (data === "stop") $(".type").remove();
    else
        $("#feedback").html(
            `<p class='badge badge-info p-2 ml-2 type'><em>${data} is typing .... </em></p>`
        );
    scroll();
});

//=================================================================
//utility functions

const showUp = () => {
    if (chat_window.scrollHeight > chat_window.clientHeight) $("#up").show();
};
const scroll = () => {
    chat_window.scrollTo({ top: chat_window.scrollHeight, behavior: "smooth" });
};
const scrollUp = () => {
    chat_window.scrollTo({ top: 0, behavior: "smooth" });
};
