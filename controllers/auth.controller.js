const jwt = require('jsonwebtoken');


const LoginController = (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure: false });
            res.status(200).json({ message: 'Login successful' });

        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.log("error " + err);
        res.status(500).json({ message: 'Server error' });
    }
}

const IsAdminController = (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ isAdmin: false });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ isAdmin: false });
            }
            return res.status(200).json({ isAdmin: true });
        });
    } catch (err) {
        console.log("error " + err);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { LoginController, IsAdminController };