const jwt = require("jsonwebtoken")

const authenticateAdmin = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.username !== process.env.ADMIN_USERNAME) {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.user = decoded;
        next();

    } catch (error) {
        console.log(error.name, error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = { authenticateAdmin };