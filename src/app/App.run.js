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

module.exports = function (self) {
    
    // Running server

    self.httpServer.listen(self.config.port, () => {
        self.config.allowWebMaxMessages && self.notify(`Server works at port ${self.config.port}!`)
    })

    // Connecting to database
    if(self.config.allowWebMaxMessages) self.notify(`Connecting to database...`)

    self.database = mysql.createConnection({
        host     : self.config.mysql.host,
        user     : self.config.mysql.user,
        password : self.config.mysql.password,
        database : self.config.mysql.databaseName,
    })

    self.database.connect()
      
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

        //model_.add(["", "test2", "am@amsd.com", "asd"])
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
            }

            const _dom = (new JSDOM(fs.readFileSync(path.resolve(self.dirname + '/cached/' + page.name + '.html'), 'utf-8'))).window.document
            _dom.querySelector("head").setAttribute("webmax-session-id", sessionId)
            let preparedContent = _dom.documentElement.outerHTML

            preparedContent = await self.compileResponse(preparedContent, sessionId, self, session, req)

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

        fs.writeFileSync(self.dirname + "/public/css/style.all.min.css", content)
    
        method = () => {}
        time = (new Date().getTime() - initTime) / 1000
    
        if(time < 1) method = chalk.bgGreen
        else if(time >= 1 && time < 2.5) method = chalk.bgYellow
        else method = chalk.bgRed
    
        if(self.config.allowWebMaxMessages) self.notify(`All files joined into ${chalk.bgRgb(0x00,0x99,0xff)("/css/style.all.min.css")} in ${method(chalk.black(time + 's')) }`)
    
    }

    // Running webpack mixer

    if(self.config.allowWebMaxMessages) self.notify("Starting webpack mixer")

    exec("npx mix")

    // Adding SocketIO shortcuts

    self.io.on('connection', socket => {
        socket.on('serverWrite', data => {
            self?.onFrontendMessage(data, socket)
        })
    })
}