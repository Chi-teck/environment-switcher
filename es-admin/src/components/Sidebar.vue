<script>

import store, {changedProjects} from "../store";

export default {
    data() {
        return {
            projects: [],
            changedProjects,
        }
    },
    mounted() {
        store.onSave = this.onSave;
        store
            .getAll()
            .then(projects => {this.projects = projects})
    },
    methods: {
        onSave(projects) {
            this.projects = structuredClone(projects);
        },
        createProject() {
            store.create().then(
                project => this.$router.push({ name: 'project', params: {id: project.id} }),
            );
        }
    }
}

</script>
<template>
    <div class="sidebar">
        <button type="button" class="primary" v-on:click="createProject">Create Project</button>
        <hr/>
        <ul v-if="projects.length > 0">
            <li v-for="{id, name} in projects" :key="id">
                <router-link :to="{name: 'project', params: {id}}" class="sidebar__project">
                    <div class="link-text">{{ name }} <sup v-if="this.changedProjects.has(id)" aria-label="Changed">*</sup></div>
                </router-link>
            </li>
        </ul>
    </div>
</template>
<style scoped>

.sidebar {
    padding: var(--s0);
    width: calc(18 * var(--s0));
    background: var(--c-snow);
    border-right: solid 1px var(--c-border);
}

.sidebar > * {
    margin-bottom: var(--s0);
}

hr {
    border-top: 1px solid var(--c-border);
}

button {
    width: 100%;
    text-transform: uppercase;
    height: var(--sp5);
}

button:active {
    background-color: var(--c-venice);
    transition: background-color 0.25s;
}
ul {
    list-style: none;
    padding-left: 0;
}
li {
    margin-top: var(--s0);
}
li a {
    background-color: white;
    padding: 0 var(--s0);
    border: solid 1px var(--c-silver);
    height: var(--sp5);
    color: var(--c-whale);
    text-decoration: none;
    display: flex;
    align-items: center;
}
.link-text {
}

.sidebar__project.active {
    box-shadow: inset 5px 0 var(--c-orange);
    border-left-color: var(--c-orange);
}


sup {
    color: var(--c-orange);
}

.sidebar__project:active {
    box-shadow: inset 5px 0 var(--c-banana);
    transform: translatex(2px);
    transition: 0.15s;
}

</style>
