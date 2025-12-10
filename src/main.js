import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'

Amplify.configure(outputs)

createApp(App).mount('#app')
