import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './styles.css'

import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue)

// Register components globally used in templates
app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('Message', Message)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Tag', Tag)

app.mount('#app')
