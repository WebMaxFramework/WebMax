module.exports = function createRouter() {
    return {
        pages: [
            {
                path: "/",
                file: "/pages/Home.webmax",
                name: "Home"
            },
            {
                path: "/serverSync",
                file: "/pages/Sync.webmax",
                name: "ServerSync"
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