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
    User = require("./models/user");
var server = require("http").createServer(app);
var io = socket(server);
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
//====================================================================

// app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// app.use(express.errorHandler());
//====================================================================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
let user;
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    user = res.locals.currentUser;
    next();
});

let c = 0;

app.get("/", middleware.isLoggedIn, (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});
app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
    }),
    function (req, res) {}
);

// app.get("/register", (req, res) => {
//     res.render("register");
// });
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
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("back");
});
const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Listening on ${port}`));
//Socket

// const io = socket(server);
// io.configure();
io.set("transports", ["xhr-polling"]);
io.set("polling duration", 10);

io.on("connection", (socket) => {
    console.log("connection made ");
    socket.on("chat", (data) => {
        socket.broadcast.emit("chat", data);
    });
    socket.on("typing", (data) => {
        socket.broadcast.emit("typing", data);
    });
    socket.on("newconnection", (data) => {
        socket.broadcast.emit("newconnection", data);
    });
});
