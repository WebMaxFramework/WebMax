/**
 * Utils
 */

function useReact() {

}

function getWebMaxSessionId() {
    return document.head.getAttribute("webmax-session-id")
}

/**
 * Class
 */

class WebMaxRuntime {
    constructor() {
        this.version = '0.0.1';
        this.root = document.body//document.querySelector("#app")       
    
        this.useReact = () => useReact()
        this.getWebMaxSessionId = () => getWebMaxSessionId()
        this.socket = io()
        this.data = {}
        this.mode = 'dev'
        this.syncs = []
    }

    init() {
        if(this.mode === 'dev') {
            this.log("Running WebMax in development mode.")
            this.log("Synchronising with server...")

            this.socket.emit("sync:server", this.getWebMaxSessionId())
            this.bindErrors()
        }

        this.syncs.forEach(sync => {
            sync.callback(sync.id)
        })
    }

    sync(id) {
        return this.syncs.find(sync => sync.id === id)
    }

    bindErrors() {
        this.socket.on('wm-server:error', error => {
            if(!document.querySelector("#wm----error-container")) this.createErrorContainer()

            document.querySelector("#error-container").innerHTML += `<div class="wm:error" style="margin-top: 15px; color: rgb(247, 80, 80)">
                ${error}
            </div>`

            // setTimeout(() => document.querySelector("#error-styles").remove(), 1000)
        })
    }

    createErrorContainer() {
        document.body.style.background = "#121"
        document.body.innerHTML = `<div wm:class="wm:error" id="wm:error" wm:serversync="true" wm----error-container" style="box-shadow: inset 0 0 160px 16px #000; background: #000a; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; color: #fff; padding: 15px; font-family: monospace;">
            <style id="error-styles" wm:style>@keyframes _wm_loader { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } } </style>
        
            <h1 style="text-shadow: 2px 2px #000;">WebMax</h1>    
            <h2 style="text-shadow: 2px 2px #000">An error occurred </h2>
            <div id="error-container" style="margin-top: 25px;">

            </div>

            <div id="wm-loader" style="box-shadow: 0 0 8px 4px #000, inset 0 0 8px 4px #000; height: 25px; width: 25px; border: 5px solid #555; border-radius: 50%; border-top: 5px solid #09f; position: fixed; bottom: 20px; right: 20px; animation: _wm_loader 1s infinite linear;"></div>
        </div>`

        // console.log(this.getElementsByClassNameExtended("wm:error"))
        // console.log(this.getElementByAttribute("wm:serversync", "true"))
    }

    getElementByClassNameExtended(className) {
        const elements = document.querySelectorAll("*")

        for(let el of elements) {
            const cloned = el.cloneNode(true)
            cloned.innerHTML = ""
            
            if(cloned.getAttributeNames().includes("wm:class")) {
                const classess = cloned.getAttribute("wm:class").split(" ")
                if(classess.includes(className)) return el
            }
        }
    }

    getElementByAttribute(attr, value) {
        const elements = document.querySelectorAll("*")

        for(let el of elements) {
            const cloned = el.cloneNode(true)
            cloned.innerHTML = ""

            if(cloned.getAttributeNames().includes(attr)) {
                const val = cloned.getAttribute(attr)
                if(val == value) return el
            }
        } 
    }

    log(text) {
        console.log("%c[webmax]" + "%c " +text, 'color: #00bcd4', 'color: #fff;')
    }

    error(text) {
        console.log("%c[webmax]" + "%c " +text, 'color: rgb(247, 80, 80)', 'color: #fff;')
    }

    serverWrite(name, data) {
        this.socket.emit(name, data)
    }
}

const webmaxRuntime = new WebMaxRuntime()
window.webmax = webmaxRuntime 

// Listening for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    window.webmax.init()
})