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
    }

    init() {

    }

    serverWrite(name, data) {
        this.socket.emit(name, data)
    }
}

const webmaxRuntime = new WebMaxRuntime()
window.webmax = webmaxRuntime 