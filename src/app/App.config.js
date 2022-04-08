module.exports = function(config, self) {
    self.config = config

    if(self.config.allowWebMaxMessages) self.notify("Successfully configurated!")
}