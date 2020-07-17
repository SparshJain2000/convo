var middlewareObj = {};
middlewareObj.isLoggedIn = function (req, res, next) {
//   if (req.isAuthenticated()) {
//     // res.redirect("back");
//     return next();
//   }
//   res.redirect("/login");
   if (!req.isAuthenticated() || !req.isAuthenticated) {  
        if (req.session) {  
            req.session.redirectUrl = req.headers.referer || req.originalUrl || req.url;  
        }  
        res.redirect('/login');
    } else {
        next();  
    }  
};

module.exports = middlewareObj;
