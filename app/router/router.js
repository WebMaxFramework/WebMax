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
            },
            {
                path: "/partial",
                file: "/pages/Partial.webmax",
                name: "PartialRendering"
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