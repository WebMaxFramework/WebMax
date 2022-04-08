module.exports = function(eventName, callback, self) {
    switch(eventName) {
        case "message": {
            self.onFrontendMessage = callback
        } break
    }
}