const chalk = require("chalk")
const { JSDOM } = require("jsdom")
const { Worker } = require('worker_threads')

const newRegexMatching = /\@(webmax)\([ !"#$%&\'()*+,-./0123456789:<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\r?\n]+(\);)/g
const oldRegexMatching = /\@(webmax)\([\w\W\d\D\s\S]+\);/g

module.exports = function(content, id, self, session, req) {
    let ctnt = content.split("&gt;").join(">").replace(newRegexMatching, (x, y) => {
        let realContent = x.replace('@webmax', '').replace("&gt;", ">")

        let res = ""

        try {
            res = eval(realContent)(self, session, req)
        } catch(err) {
            self.error("An unexpected error occurred while evaluating the following code: \n" + chalk.gray(realContent) + "\nError: " + chalk.red(err) + '\n')
        }

        return res || ""
    })

    const document = (new JSDOM(ctnt)).window.document
    const dom = {
        getElementByAttribute(attr, value) {
            const elements = document.querySelectorAll("*")
            let ret = []

            for(let el of elements) {
                const cloned = el.cloneNode(true)
                cloned.innerHTML = ""

                if(cloned.getAttributeNames().includes(attr)) {
                    const val = cloned.getAttribute(attr)
                    if(val == value) ret.push(el)
                }
            } 

            return ret
        }
    }

    // Partial rendering


    if(self.config.partialRendering) {
        //const sections = dom.getElementByAttribute("wm:section", "")
        //sections.forEach(sect => sect.setAttribute("wm:section", require("uuid").v4()))
        //
        const sessionId = document.head.getAttribute("webmax-session-id")
        const _session = self.sessions.find(session => session.id === sessionId)
    
        _session.nextStage = (socketId) => {
            const socket = self.io.sockets.sockets.get(socketId)
            const part = self.pagesParts.find(part => part.pagename === _session.pagename).parts[_session.currentRenderStage] //_session.websiteParts[_session.currentRenderStage]
            if(!part) return socket.emit("server:partial-render-completeted", "")
    
            socket.emit("server:partial-render-next-stage", part)
            _session.currentRenderStage++
        }
    
        //const clonedSections = []
        //
        //let index = 0
        //for(let section of sections) {
        //    clonedSections.push(section.cloneNode(true).outerHTML)
        //    _session.websiteParts.push(clonedSections[clonedSections.length - 1])
        //    index > 0 && section.remove()
        //    index++
        //}
    
        document.head.innerHTML += `<script wm:partial-start>window.webmax.startPartialRendering()</script>`

        return document.documentElement.outerHTML
    }

    return ctnt
}