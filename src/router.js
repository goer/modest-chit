import VueRouter from "vue-router";

import Home from "./Home.vue";
import Call from "./Call2.vue";
import App from "./App.vue";

const children = [
  { path: "/home", name: 'home', component: Home },
  { path: "/call/:roomid/:userid", name: 'call', component: Call }
];

const routes = [
  { path: "/", component: App, redirect: "home", children: children }
];

const router = new VueRouter({
  //mode: 'history',
  routes // short for `routes: routes`
});

export default router;
