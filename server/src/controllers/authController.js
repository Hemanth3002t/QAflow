const authService = require("../services/authService");

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);

        if (!result.success) {
            const statusCode = result.message === "Email already registered" ? 409 : 400;
            return res.status(statusCode).json(result);
        }

        return res.status(201).json(result);
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register
};