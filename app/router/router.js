module.exports = function createRouter() {
    return {
        pages: [
            {
                path: "/:page?",
                file: "/pages/Home.webmax",
                name: "Home"
            }
        ],
        api: [
            {
                path: "/users/all",
                method: "GET",
                name: "GetAllUsers",
                callback: require("../controllers/UserController").index
            }
        ]
    }
}