<script>

import store from '../store';

export default {
    methods: {
        async exportConfig() {
            const projects = await store.getAll()
            const a = document.createElement('a');
            const file = new Blob([JSON.stringify(projects, null, 4)], {type: 'application/json'});
            a.href = URL.createObjectURL(file);
            a.download = 'es-projects.json';
            a.click();
        },
        importConfig() {
            const uploadHandler = event => {
                const file = event.target.files[0];
                const reader = new FileReader();

                const readHandler = event => {
                    const projects = JSON.parse(event.target.result);
                    store.setAll(projects);
                }

                reader.addEventListener('load', readHandler)
                reader.readAsText(file);
            };

            const input = document.createElement('input');
            input.type = 'file';
            input.addEventListener('change', uploadHandler);
            input.click();
        }
    }
}
</script>
<template>
    <ul>
        <li>
            <button class="action import" title="Import configuration" v-on:click="importConfig"></button>
        </li>
        <li>
            <button class="action export" title="Export configuration configuration" v-on:click="exportConfig"></button>
        </li>
        <li>
            <a class="action source" href="https://github.com/Chi-teck/environment-switcher" title="Source code"></a>
        </li>
    </ul>
</template>
<style scoped>
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
    }
    .action {
        border-style: none;
        background-color: transparent;
        background-repeat: no-repeat;
        background-position: center;
        width: 32px;
        height: 32px;
        opacity: 0.75;
        display: block;
        outline-offset: 0;
    }
    .action:hover {
        opacity: 1;
    }
    .action:active {
        transform: scale(0.9);
        transition: 0.25s;
    }
    .import {
        background-image: url('./Tools/import.png');
    }
    .export {
        background-image: url('./Tools/export.png');
    }
    .source {
        background-image: url('./Tools/octocat.png');
        margin-left: 7px;
    }

</style>

