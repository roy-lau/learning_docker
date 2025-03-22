import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";
import { createPinia } from "pinia";
// import {
//   // create naive ui
//   create,
//   // component
//   NButton,
//   NConfigProvider,
//   NInput,
//   NDatePicker,
//   NSpace
// } from 'naive-ui'

const app = createApp(App);
const pinia = createPinia();
// const naive = create({
//   components: [
//     NButton,
//     NConfigProvider,
//     NInput,
//     NDatePicker,
//     NSpace
//   ]
// })


app.use(router);
app.use(pinia);
// app.use(naive)


app.mount("#app");
