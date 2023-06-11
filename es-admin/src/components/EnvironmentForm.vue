<script>

export default {
    props: {
        environment: {type: Object, required: true},
    },
    data() {
        return {
            errors: {baseUrl: null},
            environment: structuredClone(this.$props.environment)
        }
    },
    methods: {
        reset() {
            this.$data.errors =  {baseUrl: null};
            this.$data.environment = structuredClone(this.$props.environment);
        },
        _onSubmit: function (event) {

            this.errors = {name: null, baseUrl: null};

            const elements = event.target.elements;

            if (!elements['name'].validity.valid) {
                this.errors.name = elements['name'].validationMessage;
            }

            if (!elements['base_url'].validity.valid) {
                this.errors.baseUrl = elements['base_url'].validationMessage;
            }
             else if (new URL(this.environment.baseUrl).pathname !== '/') {
                this.errors.baseUrl = 'The URL should not include path.';
            }
            else if (this.environment.baseUrl.endsWith('/')) {
                this.errors.baseUrl = 'The URL should not have ending slash.';
            }

            if (this.errors.name || this.errors.baseUrl) {
                event.preventDefault()
                return;
            }

            this.$emit('save', this.environment);
            this.reset();
        },
        _onCancel: function () {
            this.$emit('cancel');
            this.reset();
        }
    },
}
</script>
<template>
    <form v-on:submit="_onSubmit" novalidate>
        <div class="form-item checkbox-item">
            <label>Enabled</label>
            <input type="checkbox" name="status" v-model="environment.status"/>
        </div>
        <div class="form-item text-item" :class="{'has-errors': errors.name}">
            <label>Name</label>
            <input type="text" name="name" required :value="environment.name"/>
            <div class="error">{{ errors.name }}</div>
        </div>
        <div class="form-item text-item" :class="{'has-errors': errors.baseUrl}">
            <label>Base URL</label>
            <input type="url" name="base_url" required v-model="environment.baseUrl"/>
            <div class="error">{{ errors.baseUrl }}</div>
        </div>
        <div class="form-item actions">
            <button class="primary">Save</button>
            <button type="button" v-on:click="_onCancel">Cancel</button>
        </div>
    </form>
</template>
<style scoped>

    .text-item label {
      margin-bottom: 0.35em;
    }

    .checkbox-item {
        display: flex;
        gap: 0.25rem;
        align-items: center;
    }

    input[type=checkbox] {
      transform: scale(1.25);
    }

    .form-item:not(:last-child) {
        margin-bottom: var(--sp1);
    }

    .actions {
        display: flex;
        gap: var(--sm3);
    }

    .actions button {
      width: 80px;
      text-align: center;
    }

    .has-errors {
        color: var(--c-carmine);
    }
    .has-errors input {
        border-color: var(--c-carmine);
    }
    .has-errors input:focus {
        --c-input-shadow: var(--c-carmine);
    }
    .error {
        color: var(--c-carmine);
        font-size: small;
    }

</style>
