const express = require("express"),
    app = express(),
    socket = require("socket.io"),
    path = require("path"),
    mongoose = require("mongoose"),
    env = require("dotenv"),
    bodyParser = require("body-parser"),
    LocalStratergy = require("passport-local"),
    passport = require("passport"),
    middleware = require("./middleware"),
    User = require("./models/user"),
    server = require("http").createServer(app),
    { addUser, getUsers, deleteUser, getRoomUsers } = require("./users/users"),
    io = socket(server);
env.config();
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    require("express-session")({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
//=============================================================
//Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
//=============================================================
//Get routes

//home route
// app.get("/chat", middleware.isLoggedIn, (req, res) => {
//     res.render("index");
// });

app.get("/", middleware.isLoggedIn, (req, res) => {
    res.render("index");
});
app.get("/chat/:id", middleware.isLoggedIn, (req, res) => {
    res.render("index", { room: req.params.id });
});
//render login page
app.get("/login", (req, res) => {
    res.render("login");
});
//handle login logic
app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
    }),
    function (req, res) {}
);
//handle sign up logic
app.post("/register", (req, res) => {
    var newUser = new User({
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.first_name,
    });

    User.register(newUser, req.body.password, (error, user) => {
        if (error) {
            console.log(error.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        });
    });
});
//handle logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("back");
});

app.get("/sitemap.xml", function (req, res) {
    res.sendFile("sitemap.xml", {
        root: path.join(__dirname, "../public"),
    });
});
//render 404 page
app.use(function (req, res) {
    res.status(404).render("404");
});

const port = process.env.PORT || 4000;

server.listen(port, () => console.log(`Listening on ${port}`));
//=============================================================
//Socket configuration

// io.set("transports", ["xhr-polling"]);
// io.set("polling duration", 10);
// let users = [];
// const addUser = (newUser) => {
//     users.push(newUser);
//     console.log("---------------");
//     console.log(users);
// };
// const getUsers = () => {
//     console.log("###############");

//     console.log(users);
//     return users;
// };
const rooms = [];
io.on("connection", (socket) => {
    socket.on("createRoom", ({ handle }) => {
        const room = `room${rooms.length + 1}`;
        rooms.push(room);
        socket.join(room);
        addUser(socket.id, handle.trim(), room);
        socket.broadcast.to(room).emit("newconnection", handle);
    });
    socket.on("joinRoom", (data) => {
        socket.join(data.room);
        addUser(socket.id, data.handle.trim(), data.room);
        socket.emit("joined", data);
        socket.broadcast.to(data.room).emit("newconnection", data);
    });
    socket.on("chat", (data) => {
        const user = data.handle.trim();
        const currentUser = getUsers().filter((obj) => obj.id === socket.id);
        data.users = getRoomUsers(currentUser[0].room);
        io.in(currentUser[0].room).emit("chat", data);
    });
    socket.on("typing", (data) => {
        const user = data.trim();
        console.log(user);
        const currentUser = getUsers().filter((obj) => obj.id == socket.id);
        console.log(currentUser);
        socket.broadcast.to(currentUser[0].room).emit("typing", data);
    });
    // socket.on("newconnection", (data) => {
    //     users.push({
    //         id: socket.id,
    //         name: data.trim(),
    //     });
    //     socket.broadcast.emit("newconnection", data);
    // });
    socket.on("disconnect", () => {
        const user = deleteUser(socket.id);
        console.log(socket.id);
        console.log(user);
        // getUsers().forEach((item) => {
        //     if (item.id === socket.id) name = item.name;
        // });
        // const user = data.trim();
        // const currentUser = getUsers().filter((obj) => obj.id === socket.id);
        // console.log(currentUser);

        // users = getUsers().filter((item) => item.id !== socket.id);
        if (user)
            socket.broadcast.to(user.room).emit("userDisconnected", user.name);
    });
});
