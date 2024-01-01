const express = require("express");
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const JWT_SECRET = 'danish';
var fetchuser = require('../middleware/fetchuser')


//Route 1:Create a user using: POST "/api/auth". Doesn't require Auth
router.post('/createuser',
    body('name', 'Enter a valid Name').isLength({ min: 5 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Enter a valid Password').isLength({ min: 5 }), async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ error: "Sorry a user already Exists" });
            }
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            })
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);

            res.json({ authToken });
        }
        catch {
            console.error(errors.message);
            res.status(500).send("Internal Server Error");
        }
    })
//Route 2:Authenticate User using :POST '/api/auth/login'
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Enter a valid Password').isLength({ min: 5 }).exists()], async (req, res) => {
        let success=false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Incorrect Credebtials" });
            }
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json({success, error: "Incorrect Credebtials" });
            }
            const data = {
                user: {
                    id: user.id,
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success=true;
            res.json({ success,authtoken });
        }
        catch {
            console.error(errors.message);
            res.status(500).send("Internal Server Error");
        }
    })
//Route 3: fetch user details using POST
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userid = req.user.id;
        const user = await User.findById(userid).select('-password');
        res.send(user);

    } catch (errors) {
        console.error(errors.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router