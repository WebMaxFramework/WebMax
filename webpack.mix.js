const mix = require("laravel-mix")

mix.js("app/vue/app.js", "app/public/js").vue()
mix.disableNotifications()