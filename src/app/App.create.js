const App = require("./App.class.js");

module.exports = function createApp(dirname) {
    return new App(dirname);   
}