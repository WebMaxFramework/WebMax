module.exports = function(type, content, self) {                     
    if(type != "data/json") return self.error(`The type "${type}" is not supported.`)                    

    const uuid = require("uuid").v4()

    return `<script wm:type=${type}" id="ssr-wm-${uuid}">                    
        window.webmax.data = {...window.webmax.data, ...${JSON.stringify(content)}};
        document.querySelector("#ssr-wm-${uuid}").remove();                 
    </script>`                   
}                    