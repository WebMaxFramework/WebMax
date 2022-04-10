const mix = require("laravel-mix")

mix.js("app/vue/app.js", "app/public/js").vue()
mix.postCss('app/postcss/postcss.css', 'app/public/css', [
    require("tailwindcss")
]);
mix.disableNotifications()