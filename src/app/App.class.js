// #3dbf2c

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
const createData = require("./App.createData.js")

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
        this.sessions = []
        this.errors = []
        this.syncs = []
        this.pagesParts = []
        this.ramUsage = 0
        this.cpuUsage = 0
        this.totalOnlineUsers = 0

        /* "Public" folder  */
        this.expressApp.use(express.static(path.resolve(dirname + "/public")))
    
        /* Prototype methods */
        this.notify = (...messages) => console.log(chalk.green("[webmax]") + chalk.gray(" >>"), ...messages)
        this.config = (config) => configurate(config, this)
        this.run = () => appRun(this)
        this.compilePage = async (name) => compile(name, this)
        this.createStaticData = () => {}
        this.compileResponse = async (content, id, self, session, req) => await compileResponse(content, id, self, session, req)
        this.on = (event, callback) => handleEvent(event, callback, this)
        this.createData = (x,y) => createData(x,y,this)

        /* Error function */

        this.error = (...messages) => {
            console.log(chalk.red("[webmax]") + chalk.gray(" >>"), ...messages.map(x => chalk.bgRed.white(x))) 
            this.errors.push(messages)
            this.sendError(messages)
        }

        /* Dashboard sending logs */
        this.sendError = (...messages) => {
            if(this.config.dashboard) {
                this.io.emit("dashboard:error", messages.join(" "))
            }
        }

        /* Running "init" function */
        this._webmax_runtime_init()
    }

    _webmax_runtime_init() {
        // sync:server

        this.io.on('connection', socket => {
            socket.on('sync:server', async (session) => {
                this.sessions.push({
                    id: session,
                })

                this.errors.forEach(error => {
                    socket.emit('wm-server:error', error)
                })
            })
        })

        this.errors.forEach(err => this.sendError(err))

    }
}

module.exports = App