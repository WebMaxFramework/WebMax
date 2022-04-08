/**
 * Default WebMax Application
 * Contains
 * Routing:
 *      FrontEnd + API
 * 
 * React integration
 * MySQL Models integrations
 * Own components
 * Static data binding
 * Caching
 * Modules
 * SCSS / SASS integration
 * 
 * 
 */

/**
 * Path to the root of the webmax framework
 */

const Path = __dirname + '/../src'

/**
 * Importing essential libraries
 */

const webmax = require(Path + '/index.js')

/**
 * Initializing application
 * 
 * using the default configuration
 * via webmax.createApp() method &
 * via (webmax application instance).config(<ApplicationConfig>) method
 */

const app = webmax.createApp(__dirname)
app.config(require("./App.config")(Path))

/**
 * Running server
 * via (webmax application instance).run() method
 * 
 */

app.run()

/**
 * Handling Events & Socket Data via 
 * (webmax application instance).on(<EventName>, <EventHandler>) method
 * 
 */

app.on('message', data => console.log(data))