<template>
    <div id="app-root" class="webmax-app">

        <img class="webmax-logo" src="images/logo.png" alt="">

        <h1>WebMax App</h1>
    </div>
</template>

<script>
export default {
    name: "App"
}
</script>

<style>
    #app-root {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        flex-direction: column;
    }

    #app-root .webmax-logo {
        width: 200px;
    }


    #app-root h1 {
        font-size: 55px;
    }
</style>