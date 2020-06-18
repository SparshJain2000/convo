const socket = io.connect(window.location.hostname),
    // const socket = io.connect("http://localhost:4000"),
    message = document.getElementById("message"),
    output = document.getElementById("output"),
    button = document.getElementById("button"),
    feedback = document.getElementById("feedback"),
    name = document.getElementById("dropdownMenuButton"),
    alert = document.getElementById("alert"),
    chat_window = document.getElementById("chat-window"),
    roomName = document.getElementById("roomName"),
    fileInput = document.getElementById("file-input"),
    options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg",
    };
let image = "";
$("#up").html('<i class= "fa fa-arrow-up" >').hide();

//=================================================================
//input image

$("#file-input").on("change", (e) => {
    button.disabled = true;
    fileInput.disabled = true;
    const file = e.originalEvent.target.files[0];
    if (file) {
        if (file.type != "image/gif") {
            options.fileType = file.type;
            imageCompression(file, options)
                .then((compressedFile) => {
                    console.log(compressedFile);
                    setImage(compressedFile);
                    message.focus();
                })
                .catch((error) => console.log(error));
        } else {
            setImage(file);
        }
    }
    button.disabled = false;
    fileInput.disabled = false;
});

//=================================================================
//Emit Create, Join and Leave room events

const createRoom = () => {
    socket.emit("createRoom", { handle: name.textContent });
};
const joinRoom = () => {
    socket.emit("joinRoom", {
        handle: name.textContent,
        room: `${roomName.value}`,
    });
};
const leaveRoom = () => {
    socket.emit("leaveRoom", name.textContent);
    document.querySelector("#roomInfo").innerHTML = "";
    document.getElementById("chat-window").style.display = "none";
    document.querySelector(".form-inline").style.display = "none";
    document.getElementById("btns").style.display = "block";
    document.querySelector("footer").style.display = "block";
};

//=================================================================
//emit chat event (send message)

button.addEventListener("click", () => {
    let data = {
        handle: name.textContent,
        message: message.value,
        date: new Date(),
        image: image,
    };
    message.value = "";
    socket.emit("chat", data);
    let style = "display:flex;justify-content:flex-end",
        bg = `bg-secondary mess p-2 mr-1 m-2 rounded col-8 `,
        color = `text-warning text-capitalize`;
    addMessage = async () => {
        output.innerHTML += `<div style=${style} ><div class='${bg}'><h6 class= ${color}>${
            data.handle
        }</h6><div>${
            data.message
        }</div><img class="img-fluid rounded mb-2" src='${
            data.image
        }'/><div style="text-align:right;font-size:2vmin"> 
    ${new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
    }).format(
        new Date(data.date)
    )}&nbsp &nbsp<div class= 'spinner-border spinner-border-sm' role = 'status' > <span class='sr-only'>Loading...</span></div></div></div></div>`;
        $("file-input").val("");
    };
    addMessage().then(() => {
        image = "";
        scroll();
    });
});

//=================================================================
//Emit typing event (trigger user typing and send message on enter)

message.addEventListener("keyup", (event) => {
    if (message.value !== "") socket.emit("typing", name.textContent);
    else socket.emit("typing", "stop");
    //13 => keycode for Enter
    if (event.keyCode === 13) button.click();
});
document.querySelector("#roomName").addEventListener("keyup", (event) => {
    if (event.keyCode === 13) joinRoom();
});
//=================================================================
//Handle user-connected event

socket.on("connect", () => {
    socket.emit("newconnection", name.textContent);
});
socket.on("newconnection", (data) => {
    $("#alert")
        .html(
            `<div class='alert alert-success' role='alert'>
                ${data.handle} joined the chat
            </div>`
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
//Handle User joined the room event

socket.on("joined", (data) => {
    document.querySelector(".close").click();
    document.querySelector("#roomInfo").innerHTML = `<div >
                                                        <button class="btn btn-secondary " onclick='copyId("${data.room.roomName}")'>
                                                            RoomId: <em class='text-warning'>${data.room.roomName}</em>&nbsp <strong>|</strong>&nbsp
                                                            Admin : <em class='text-warning'>${data.room.admin}</em>
                                                        </button>
                                                        <a href="whatsapp://send?text=${data.room.roomName}" data-action="share/whatsapp/share" class='btn btn-primary' onClick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');return false;" target="_blank" title="Share on whatsapp"><i class='fa fa-share'></i></a>
                                                        <button class='btn btn-danger ml-1' onclick='leaveRoom()' title='Leave room'>
                                                            <i class='fa fa fa-sign-out'></i>
                                                        </button>
                                                    </div>`;
    document.getElementById("btns").style.display = "none";
    document.getElementById("chat-window").style.display = "block";
    document.querySelector(".form-inline").style.display = "flex";
    document.querySelector("footer").style.display = "none";
});
//=================================================================
//Handle invalidRoom event
socket.on("invalidRoom", ({ message }) => {
    document.querySelector(".close").click();
    $("#alert")
        .html(
            "<div class='alert alert-warning' role='alert'>" +
                message +
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
//Handle chat event (Recieve message from server and show it on client side)
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
        }</h6><div>${
            data.message
        }</div><img class="img-fluid rounded mb-2" src='${
            data.image
        }'/><div style="text-align:right;font-size:2vmin"> 
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
});

//=================================================================
//Handle typing event
socket.on("typing", (data) => {
    if (data === "stop") $(".type").remove();
    else
        $("#feedback").html(
            `<p class='badge badge-info p-2 ml-2 type'><em>${data} is typing .... </em></p>`
        );
    scroll();
});

//=================================================================
//Handle user-left  event
socket.on("left", (user) => {
    document.getElementById("btns").style.display = "block";
    document.querySelector("footer").style.display = "block";
    document.getElementById("output").innerHTML = "";
    document.getElementById("up").remove();
    document.querySelector("#roomInfo").innerHTML = "";
    document.getElementById("chat-window").style.display = "none";
    document.querySelector(".form-inline").style.display = "none";
});

//=================================================================
//Handle User-Disconnected event
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
//Handle error
socket.on("error", ({ message }) => {
    $("#alert")
        .html(
            `<div class='alert alert-danger' role='alert'>
                ${message}</div>`
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
//utility functions

const showUp = () => {
    if (chat_window.scrollHeight > chat_window.clientHeight) $("#up").show();
};
const scroll = () => {
    window.setInterval(
        chat_window.scrollTo({
            top: chat_window.scrollHeight,
            behavior: "smooth",
        }),
        300
    );
};
const scrollUp = () => {
    chat_window.scrollTo({ top: 0, behavior: "smooth" });
};
const setImage = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        image = event.target.result;
    };
};
const copyId = (id) => {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(id).select();
    document.execCommand("copy");
    $temp.remove();
    console.log("Copied the text: " + id);
    $("#alert")
        .html(
            `<div class='alert alert-info' role='alert'>
                Room-id: <em>${id}</em> copied to clipboard !</div>`
        )
        .hide();
    $("#alert").slideDown(300);
    window.setTimeout(function () {
        $(".alert")
            .fadeTo(500, 0)
            .slideUp(500, function () {
                $(this).remove();
            });
    }, 1500);
};
//=================================================================
