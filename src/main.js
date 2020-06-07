import Vue from "vue";
import App from "./App.vue";
import VueRouter from "vue-router";
import router from "./router";

// eslint-disable-next-line no-unused-vars
// const io = window.io = require('socket.io-client');

Vue.use(VueRouter);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  router
}).$mount("#app");
