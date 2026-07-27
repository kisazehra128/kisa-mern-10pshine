const welcome = (req, res) => {
    res.status(200).json({
        message: "Welcome to Notes API"
    });
};

const health = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running."
    });
};

module.exports = {
    welcome,
    health
};