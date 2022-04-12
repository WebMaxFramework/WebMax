const path = require("path")
const fs = require("fs")
const _path = __dirname 
const minifier = require("string-minify")
const sass = require('node-sass')
const chalk = require("chalk")
const less = require("less")
const { JSDOM } = require("jsdom")
const { v4 } = require("uuid")
const browserify = require('browserify')
const { exec } = require("child_process")
const mysql = require("mysql-await")
const { minify } = require("html-minifier")

module.exports = function (self) {
    
    // Running server

    self.httpServer.listen(self.config.port, () => {
        self.config.allowWebMaxMessages && self.notify(`Server works at port ${self.config.port}!`)
    })

    // Connecting to database
    if(self.config.allowWebMaxMessages) self.notify(`Connecting to database...`)

    try {
        self.database = mysql.createConnection({
            host     : self.config.mysql.host,
            user     : self.config.mysql.user,
            password : self.config.mysql.password,
            database : self.config.mysql.databaseName,
            acquireTimeout: 1000000
        })
    
        self.database.connect()
    } catch(err) { self.error(`Cannot connect to database. Error: ${err}`) }
      
    // Creating Models
    fs.readdirSync(`${self.dirname}/models/`).forEach(file => {
        const model = require(path.resolve(`${self.dirname}/models/${file}`))
        const model_  = (new (model(self.config))())
        self.models[file.split(".js").join("")] = model_

        const table = model_.createTableIfNotExists()
        table.createTable(self.database)
        self.tableModels.push(table)

        model_.setDatabase(self.database)
        model_.tableName = table.name

        // model_.add(["", "test2", "am@amsd.com", "asd"])
        // model_.update(2, {
        //     id: 2,
        //     name: "test1",
        //     email: "asdf23@gmail.com",
        //     password: "asdasdasda"
        // })
    })

    // Creating router

    const dir = path.resolve(self.dirname + '/router/')
    const router = require(dir + '/router.js')
    const routes = typeof router === "function" ? router() : router
    self.routes = routes

    if(!routes) self.error(`Router is invalid!`)
    if(routes.pages.length === 0) self.error(`Router (${dir}\\router.js) has no pages! Please create at least 1`)

    // Adding runtimes
    fs.writeFileSync(
        path.resolve(self.dirname + '/public/cache/webmax.runtime.js'), 
        (fs.readFileSync(
            path.resolve(_path + '/../webmax/webmax.runtime.js'), 
        'utf-8'))
    )

    // Adding dashboard pages
    routes.pages.push({
        path: "/_dashboard",
        file: "@dashboard/Dashboard.webmax",
        name: "WebmaxDashboard",
    },)

    // Compiling pages
    routes.pages.forEach(page => self.compilePage(page.name))

    // Routing

    routes.pages.forEach((page, key) => {
        self.expressApp.get(page.path, async (req, res) => {
            if(!fs.existsSync(path.resolve(self.dirname + '/cached/' + page.name + '.html'))) {
                self.config.allowWebMaxMessages && self.notify("Incoming request: " + page.name + ". Compiling & Caching...")
                await self.compilePage(page.name)
            }

            const sessionId = v4()
            const session = {
                id: sessionId,
                websiteParts: [],
                socketId: null,
                currentRenderStage: 1,
                pagename: page.name,
                offlineTime: 0,
                isOffline: false,
                createServerSync(id, serverCallback, callback) {
                    self.syncs.push({
                        id: id,
                        sessionId: sessionId,
                        callbackPreview: serverCallback.toString()
                    })

                    return `<script wm:class="@addSyncs">
                        window.webmax.syncs.push({
                            id: "${id}",
                            sessionId: "${sessionId}",
                            callback: ${callback.toString()},
                            exec() {
                                window.webmax.socket.emit("client:requestServerSync", {
                                    callback: "${serverCallback.toString().replace(/"/g, `'`)}",
                                    id: "${id}",
                                    sessionId: "${sessionId}",
                                })
                            }
                        });
                    </script>`
                }
            }

            self.sessions.push(session)

            const _dom = (new JSDOM(fs.readFileSync(path.resolve(self.dirname + '/cached/' + page.name + '.html'), 'utf-8'))).window.document
            _dom.querySelector("head").setAttribute("webmax-session-id", sessionId)
            let preparedContent = _dom.documentElement.outerHTML

            preparedContent = await self.compileResponse(preparedContent, sessionId, self, session, req)
            preparedContent = minifier(minify(preparedContent, {
                removeAttributeQuotes: true,
                minifyJS: true
            }))

            res.send(preparedContent)
        })
    })

    // Creating api

    if(routes.api.length > 0) {
        routes.api.forEach((apiRoute, key) => {
            if(!["get", "post", "put", "delete", "patch"].includes(apiRoute.method.toLowerCase())) return self.error(`Invalid method for api route: ${apiRoute.method}`)

            self.expressApp[apiRoute.method.toLowerCase()]('/api' + apiRoute.path, async (req, res) => {
                res.send(await apiRoute.callback(req, self))
            })
        })
    } 
    else {
        self.config.allowWebMaxMessages && self.notify("Your application has no API!")
    } 

    // Compiling SCSS / SASS
    let initTime = new Date().getTime()
    const scssFolder = path.resolve(self.dirname + '\\scss')
    if(self.config.allowWebMaxMessages) self.notify("Starting compiling SCSS/SASS to CSS")

    const scssFiles = fs.readdirSync(scssFolder)

    scssFiles.forEach(async (scssFile, key) => {
        let cssContent = sass.renderSync({
            data: fs.readFileSync(scssFolder + "/" + scssFile, "utf-8")
        });

        let finalContent = minifier(cssContent.css.toString())
        fs.writeFileSync(self.dirname + "/public/css/" + scssFile.replace(".scss", ".scss.css"), finalContent)
    })

    let method = () => {}
    let time = (new Date().getTime() - initTime) / 1000

    if(time < 1) method = chalk.bgGreen
    else if(time >= 1 && time < 2.5) method = chalk.bgYellow
    else method = chalk.bgRed

    if(self.config.allowWebMaxMessages) self.notify(`SCSS/SASS compiled in ${method(chalk.black(time + 's')) }`)

    // Compiling LESS CSS

    initTime = new Date().getTime()
    const lessFolder = path.resolve(self.dirname + '\\less')
    if(self.config.allowWebMaxMessages) self.notify("Starting compiling LESS to CSS")

    const lessFiles = fs.readdirSync(lessFolder)

    lessFiles.forEach(async (lessFile, key) => {
        let cssContent = (await less.render(fs.readFileSync(path.resolve(lessFolder + "/" + lessFile), "utf-8"), {
            compress: true
        })).css;

        let finalContent = minifier(cssContent.toString())
        fs.writeFileSync(self.dirname + "/public/css/" + lessFile.replace(".less", ".less.css"), finalContent)
    })

    method = () => {}
    time = (new Date().getTime() - initTime) / 1000

    if(time < 1) method = chalk.bgGreen
    else if(time >= 1 && time < 2.5) method = chalk.bgYellow
    else method = chalk.bgRed

    if(self.config.allowWebMaxMessages) self.notify(`LESS compiled in ${method(chalk.black(time + 's')) }`)

    // Parsing all css/scss/less files

    if(self.config.joinAllCSSFiles) {

        initTime = new Date().getTime()

        self.notify("Joining all CSS/SCSS/LESS files into " + chalk.bgRgb(0x00,0x99,0xff)("/css/style.all.min.css"))
        let content = ""

        fs.readdirSync(self.dirname + "/public/css").forEach(file => {
            if(file == "style.all.min.css") return
            content += fs.readFileSync(self.dirname + "/public/css/" + file, "utf-8")
        })

        fs.writeFileSync(self.dirname + "/public/css/style.all.min.css", minifier(content))
    
        method = () => {}
        time = (new Date().getTime() - initTime) / 1000
    
        if(time < 1) method = chalk.bgGreen
        else if(time >= 1 && time < 2.5) method = chalk.bgYellow
        else method = chalk.bgRed
    
        if(self.config.allowWebMaxMessages) self.notify(`All files joined into ${chalk.bgRgb(0x00,0x99,0xff)("/css/style.all.min.css")} in ${method(chalk.black(time + 's')) }`)
    
    }

    // Running webpack mixer

    if(self.config.allowWebMaxMessages) self.notify("Starting webpack mixer")

    exec("npx mix", (error, stdout, stderr) => {
        if (error) {
            self.error(`\n\n\nAn error occured: ${error}`);
            return;
        }
        self.notify(`Webpack compiled successfully!`)
      })

    // Adding SocketIO shortcuts

    self.io.on('connection', socket => {

        socket.on('disconnect', () => {
            self.sessions.forEach(session => session.isOffline = true)
            self.io.emit('session:isOnline', 1)

            setTimeout(() => {
                self.sessions.forEach((session, key) => {
                    if(session.isOffline) self.sessions.splice(key, 1)
                })
            }, 1000)
        })

        socket.on('session:online', (sessionId) => {
            self.sessions.find(session => session.id === sessionId).isOffline = false
        })

        socket.on('serverWrite', data => {
            self?.onFrontendMessage(data, socket)
        })

        socket.on('client:giveServerSocketId', sessionId => {
            self.sessions.forEach(session => {
                if(session.id == sessionId) {
                    session.socketId = socket.id
                }
            })
        })

        socket.on('client:requestServerSync', data => {

            const sync = self.syncs.find(sync => sync.id == data.id && sync.sessionId == data.sessionId)
            const cb1 = sync.callbackPreview.replace(/"/g, `'`)
            const cb2 = data.callback
            
            if(cb1 != cb2) return self.error(`An error occured while client session ${data.sessionId} tried to execute callback ${cb2}. Callback isn't the same as primary declared at website rendering`)
            eval(`(${cb2})()`)
        })

        socket.on('request:partialRenderingNextStage', sessionId => {
            if(self.sessions.find(session => session.id === sessionId)?.nextStage) self.sessions.find(session => session.id === sessionId)?.nextStage(socket.id)
        })

        socket.on('dashboard:getStats', () => {
            socket.emit('dashboard:stats', {
                pages: routes.pages.length,
                users: self.sessions.length,
                ramUsage: self.ramUsage
            })
        })

        socket.on('dashboard:exit', () => {
            if(self.config.dashboard) {
                self.notify(chalk.red("Stopping the server. Reason: remote stop request from dashboard"))
                process.exit(0)
            }
        })
    })

    // Tick

    setInterval(() => {
        // Ram monitoring / CPU monitoring
        self.ramUsage = process.memoryUsage().heapTotal / 1024 / 1024
    }, 1000)
}