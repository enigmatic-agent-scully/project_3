var express = require('express');
var router = express.Router();
var userController = require('./../../controllers/userControllers')

//API call for signup
router.route('/signup')
    .post(userController.signup,
        function (err, req, res, next) {
            if (err) {
                return next(err)
            }
            next()
        },
        // Success responses
        function (req, res) {
            console.log(`returned to the router.route('/login) after a successful login, 
                        req.user = ${req.session.user}`)
            res.json({
                success: true,
                redirect: "/main"
            })
        }
    );


//API call for login
router.route('/login')
    .post(
        userController.beforeLogin,
        userController.login,
        // This will handle errors
        function (err, req, res, next) {
            if (err) {
                return next(err)
            }
            next()
        },
        // Success responses
        function (req, res) {
            console.log(`returned to the router.route('/login) after a successful login, 
                        req.user = ${req.session.user}`)
            res.json({
                success: true,
                redirect: "/main"
            })
        }
    );


//API call will return session info to the front end
router.route("/session")
    .get(userController.getSession)

//API call for logout
router.route('/logout')
    .get(userController.logout);



module.exports = router;
