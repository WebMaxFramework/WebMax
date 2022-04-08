const express = require("express")
const socket = require("socket.io")
const http = require("http")
const chalk = require("chalk")
const path = require("path")

/**
 * Importing essentials functions
 */

const configurate = require("./App.config.js")
const appRun = require("./App.run.js")
const compile = require("../compiler/Page.compile.js")
const compileResponse = require("../compiler/Page.compileResponse.js")
const handleEvent = require("./App.handleEvent.js")

class App {
    constructor(dirname) {
        /* New line */
        console.log('\n')

        /* Default Variables */
        this.dirname = dirname
        this.config = {}

        /* Default HTTP Server + Sockets */
        this.expressApp = express()
        this.httpServer = http.createServer(this.expressApp)
        this.io = socket(this.httpServer)
        this.models = {}
        this.tableModels = []

        /* "Public" folder  */
        this.expressApp.use(express.static(path.resolve(dirname + "/public")))
    
        /* Prototype methods */
        this.notify = (...messages) => console.log(chalk.green("[webmax]") + chalk.gray(" >>"), ...messages)
        this.error = (...messages) => console.log(chalk.red("[webmax]") + chalk.gray(" >>"), ...messages) && process.exit(0)
        this.config = (config) => configurate(config, this)
        this.run = () => appRun(this)
        this.compilePage = async (name) => compile(name, this)
        this.createStaticData = () => {}
        this.compileResponse = async (content, id, self, session, req) => await compileResponse(content, id, self, session, req)
        this.on = (event, callback) => handleEvent(event, callback, this)
    }
}

module.exports = App