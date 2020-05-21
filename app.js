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
app.get("/", middleware.isLoggedIn, (req, res) => {
    res.render("index");
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
//render 404 page
app.use(function (req, res) {
    res.status(404).render("404");
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Listening on ${port}`));
//=============================================================
//Socket configuration

// io.set("transports", ["xhr-polling"]);
// io.set("polling duration", 10);
users = [];

io.on("connection", (socket) => {
    // console.log("connection made ");
    socket.on("chat", (data) => {
        data.users = users;
        io.sockets.emit("chat", data);
    });
    socket.on("typing", (data) => {
        socket.broadcast.emit("typing", data);
    });
    socket.on("newconnection", (data) => {
        users.push({
            id: socket.id,
            name: data.trim(),
        });
        socket.broadcast.emit("newconnection", data);
    });
    socket.on("disconnect", () => {
        let name = "";
        users.forEach((item) => {
            if (item.id === socket.id) name = item.name;
        });
        users = users.filter((item) => item.id !== socket.id);
        socket.broadcast.emit("userDisconnected", name);
    });
});
