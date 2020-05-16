const express = require("express");
const app = express();
const socket = require("socket.io");

app.set("view engine", "ejs");
app.use(express.static("public"));

let c = 0;
app.get("/", (req, res) => {
    res.render("index.ejs", { c: c });
});
const server = app.listen(3000, () => {
    console.log("listening at 3000");
});

const io = socket(server);

io.on("connection", (socket) => {
    c++;
    console.log("connection made ", c);
    console.log(socket.id);
});
