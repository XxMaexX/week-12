import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import SignUp from "./views/SignUp.vue";
import SignIn from "./views/SignIn.vue";
import Dashboard from "./views/Dashboard.vue";

import store from "./store";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/signup",
      name: "signup",
      component: SignUp
    },
    {
      path: "/signin",
      name: "signin",
      component: SignIn
    },
    { path: "/signIn",
    name: "signIn",
    component: SignIn,
    beforeEnter(to, from, next) {
      if (!store.state.idToken) {
          next();
      } else {
          next("/dashboard");
      }
  }
  },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
      // 如果sign in，则可以进入dashboard页面，如果没有，则不能进入
      beforeEnter(to, from, next) {
        if (store.state.idToken) {
            next();
        } else {
            next("/signin");
        }
    }
    }
  ]
});
