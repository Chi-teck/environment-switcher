<script>
import store from '../store';
import uuid from '../uuid';
import Dialog from './Dialog.vue';
import EnvironmentForm from './EnvironmentForm.vue';
import { changedProjects } from '../store.js'
import NotFound from './NotFound.vue';
import {toRaw} from "vue";

const cachedProjects = {};

export default {
    components: {NotFound, Dialog, EnvironmentForm},
    props: {
        id: {type: String, required: true},
    },
    data() {
        return {
            project: null,
            changedProjects,
            o1: false,
        }
    },
    created() {
        // setInterval(() => this.o1 = !this.o1, 2300)
        this.$watch(
            () => this.$route.params,
            () => {
                if (cachedProjects[this.id]) {
                    this.project = cachedProjects[this.id];
                    return;
                }
                store
                    .get(this.id)
                    .then(project => {
                        if (project) {
                            cachedProjects[this.id] = project;
                            this.project = cachedProjects[this.id]
                        }
                        else {
                            this.project = null;
                        }
                    });
            },
            { immediate: true }
        )
    },
    watch: {
        project: {
            handler(newProject, oldProject) {
                if (newProject === oldProject) {
                    this.changedProjects.add(this.project.id);
                }
            },
            deep: true,
        }
    },
    methods: {
        getRef(id) {
            // When ref is used inside v-for, the resulting ref value will be an array.
            return Array.isArray(this.$refs[id]) ? this.$refs[id][0] : this.$refs[id];
        },
        resetEnvironmentForm(id) {
            this.getRef(id).reset();
        },
        showModal(id) {
            this.getRef(id).$el.showModal()
        },
        closeModal(id) {
            this.getRef(id).$el.close()
        },
        createEnvironment(environment) {
            environment = {...environment};
            environment.id = uuid();
            this.project.environments.push(environment);
        },
        updateEnvironment(environment) {
            const id = environment.id;
            const index = this.project.environments.findIndex(environment => environment.id === id);
            this.project.environments[index] = environment;
        },
        deleteEnvironment(id) {
            console.log(this.project.environments);
            const environments = this.project.environments.filter(environment => environment.id !== id);
            this.project.environments = toRaw(environments);
        },
        save() {
            store
                .update(this.project)
                .then(project => {
                    this.project = project;
                    changedProjects.remove(project.id);
                });
        },
        revert() {

            delete cachedProjects[this.id];
            store
                .get(this.id)
                .then(project => {
                    if (project) {
                        cachedProjects[this.id] = project;
                        this.project = cachedProjects[this.id]
                    }
                    changedProjects.remove(project.id);
                });
        },
        deleteProject() {
            store
                .delete(this.project)
                .then(() => {
                    changedProjects.remove(this.project.id);
                    delete cachedProjects[this.id];
                    this.$router.push({ name: 'home'});
                }
            )

        }
    }
}
</script>
<template>
    <div>
        <div v-if="project" class="project">
            <h1>{{ project.name }}</h1>
            <form v-on:submit.prevent="save">
                <div class="form-element">
                    <label>Project name</label>
                    <input v-model="project.name" type="text" name="name" required/>
                </div>
                <table>
                    <caption>Environments</caption>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Base URL</th>
                            <th>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="{id, name, status, baseUrl} in project.environments" :key="id">
                            <td>{{ name }}</td>
                            <td>{{ status ? 'Enabled' : 'Disabled' }}</td>
                            <td><a :href="baseUrl">{{ baseUrl }}</a></td>
                            <td class="operations">
                                <button type="button" class="small" @click="showModal(`dialog-ef-edit-${id}`)">&nbsp;Edit&nbsp;</button>
                                <button type="button" class="small danger" v-on:click="showModal(`dialog-ef-delete-${id}`)">Delete</button>
                            </td>
                        </tr>
                        <tr v-if="project.environments.length === 0">
                            <td colspan="4">The are no environments yet.</td>
                        </tr>
                    </tbody>
                </table>
                <div class="actions">
                    <button class="primary">Save</button>
                    <button class="secondary" v-on:click="revert" type="button">Revert</button>
                    <button class="danger" v-on:click="showModal('dialog-project-delete')" type="button">Delete</button>
                    <button class="create-environment" v-on:click="showModal('dialog-ef-create')">+ Create environment</button>
                </div>
            </form>
            <Dialog
                ref="dialog-ef-create"
                header="Create Environment"
                @close="resetEnvironmentForm('ef-create')"
            >
                <EnvironmentForm
                    ref="ef-create"
                    :environment="{name: '', status: true, baseUrl: ''}"
                    method="dialog"
                    @save="this.createEnvironment"
                    @cancel="closeModal('dialog-ef-create')"
                />
            </Dialog>
            <Dialog
                v-for="environment in project.environments"
                :key="environment.id"
                :ref="`dialog-ef-edit-${environment.id}`"
                header="Edit Environment"
                @close="resetEnvironmentForm(`ef-edit-${environment.id}`)"
            >
              <EnvironmentForm
                  :ref="`ef-edit-${environment.id}`"
                  :environment="{...environment}"
                  method="dialog"
                  @save="this.updateEnvironment"
                  @cancel="closeModal(`dialog-ef-edit-${environment.id}`)"
              />
            </Dialog>
            <Dialog
                v-for="environment in project.environments"
                :key="environment.id"
                :ref="`dialog-ef-delete-${environment.id}`"
                header="Delete Environment?"
            >
                <form method="dialog" v-on:submit="deleteEnvironment(environment.id)">
                    <p>This action cannot be undone.</p>
                    <div class="actions">
                        <button class="danger">Delete</button>
                        <button data-close-modal type="button">Cancel</button>
                    </div>
                </form>
            </Dialog>
            <Dialog ref="dialog-project-delete" header="Delete project?">
                <form method="dialog" v-on:submit="deleteProject">
                    <p>This action cannot be undone.</p>
                    <div class="actions">
                        <button class="danger">Delete</button>
                        <button data-close-modal type="button">Cancel</button>
                    </div>
                </form>
            </Dialog>
        </div>
        <NotFound v-else/>
    </div>
</template>
<style scoped>
    h1 {
        margin-bottom: var(--sp3);
    }

    .project > form > *:not(dialog) {
        margin-bottom: var(--sp3);
    }
    caption {
        font-size: var(--s0);
        font-weight: bold;
        text-align: left;
    }
    table th:nth-child(4),
    table td:nth-child(4) {
        width: 130px;
        text-align: center;
    }
    table button {
        margin: 0 var(--sm5);
    }

    .create-environment {
        margin-left: auto;
    }

    label {
      margin-bottom: var(--sm3);
    }


    .actions {
        display: flex;
        gap: var(--sm3);
    }

    .actions button:not(:nth-child(4)) {
        width: 80px;
    }

    form p {
      margin-top: 0;
      margin-bottom: var(--sp2);
    }

</style>
