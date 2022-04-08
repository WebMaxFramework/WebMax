const path = require("path")
const fs = require("fs")
const JSDOM = require("jsdom").JSDOM
const minifier = require("string-minify")
const { v4 } = require("uuid")
const getAllImports = require("./Page.getAllImports.js")
const removeIncludeTags = require("./Page.removeIncludeTags.js")
const htmlMinify = require('html-minifier').minify

module.exports = function(name, self) {
    if(!self.routes) self.error("Routes are undefined!")
    if(!self.routes.pages) self.error("Routes.pages are undefined!")

    const page = self.routes.pages.find(page => page.name === name)
    if(!page) self.error(`Page ${name} is undefined!`)

    let primaryContent = fs.readFileSync(self.dirname + page.file, "utf-8")
    const dom = (new JSDOM(primaryContent)).window.document

    // Adding essentials attributes
    dom.querySelector("html").setAttribute("lang", self.config.lang)
    dom.querySelector("html").setAttribute("dir", self.config.textDir)
    dom.querySelector("body").setAttribute("data-webmax-app", v4())
    dom.querySelector("body").setAttribute("id", "#app")
    
    // Adding essential tags
    dom.querySelector("head").innerHTML = `<base /> ${dom.querySelector("head").innerHTML}`
    dom.querySelector("head").innerHTML += `<script base-set>document.querySelector("base").href=window.location.origin+'/'</script>`
    dom.querySelector("head").innerHTML = `<script src="/cache/webmax.runtime.js"></script> ${dom.querySelector("head").innerHTML}`

    // Adding essential styles
    if(fs.existsSync(self.dirname + "/public/css/style.all.min.css")) dom.querySelector("head").innerHTML += `<link href="css/style.all.min.css" rel="stylesheet" id="webmax-all-styles">`

    // Imports

    const imports = getAllImports(dom.documentElement.outerHTML)

    // Importing components
    
    const importedComponents = imports.filter(mod => mod.type.toLowerCase() === "component")
    const sourceOfImportedComponents = importedComponents.map(mod => require(self.dirname + "/" + mod.name))

    sourceOfImportedComponents.forEach(component => {
        dom.querySelectorAll(component.name).forEach(element => {
            if(!element) return

            const _element = (new JSDOM(component.render(element))).window.document.body.querySelector("[component-root]")
            if(!_element) return self.error("Component root element is undefined! Please define some element with [component-root] attribute " + component.name)
            _element.removeAttribute("component-root")
            element.parentNode.replaceChild(_element, element)
        })
    })

    // Adding socketio
    dom.querySelector("head").innerHTML = `<script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script> ${dom.querySelector("head").innerHTML}`

    // Saving
    let results = htmlMinify(dom.documentElement.outerHTML, {
        removeAttributeQuotes: true,
        minifyJS: true
    })
    results = minifier(results)
    results = removeIncludeTags(results)

    fs.writeFileSync(self.dirname + "/cached/" + name + ".html", results, "utf-8")
}