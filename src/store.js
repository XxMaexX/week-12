import Vue from "vue";
import Vuex from "vuex";
import axiosAuth from "./axios-auth";
import router from "./router";
import { isContext } from "vm";
import globalAxios from "axios";


Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    error: "",
    user: null
  },


  mutations: {
    AUTH_USER(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    SET_ERROR(state, errorMessage) {
      state.error = errorMessage;
    },
    EMPTY_ERROR(state) {
      state.error = "";
    },
    CLEAR_DATA(state) {
      state.idToken = null;
      state.userId = null;
    },
    STORE_USER(state, user) {
      state.user = user;
    }
  },


  actions: {
    signUp({commit, dispatch}, authData ) {
      axiosAuth
        // Web API key
        // AIzaSyAQ7HOfFVPb-gDdIdpIg_baxqR0niwX6gg
        .post("accounts:signUp?key=AIzaSyAQ7HOfFVPb-gDdIdpIg_baxqR0niwX6gg", 
        {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res);
          // Save the auth info in the state
          commit("AUTH_USER", {
            token: res.data.idToken,
            userId: res.data.localId
          });

          // Local Storage
          const now = new Date();
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000)

          localStorage.setItem("token",res.data.idToken)
          localStorage.setItem("userId",res.data.localId)
          localStorage.setItem("userId","expirationDate", expirationDate);

          localStorage.setItem("userEmail", authData.email);

          dispatch("storeUser", authData);

          router.push({ name: "dashboard" });

        })
        .catch(error => {
          console.log(error.response.data.error.message);
          commit("SET_ERROR", error.response.data.error.message);
        });
      },

      signIn({ commit }, authData) {
        axiosAuth
          .post(
            "accounts:signInWithPassword?key=AIzaSyAQ7HOfFVPb-gDdIdpIg_baxqR0niwX6gg",
            {
              email: authData.email,
              password: authData.password,
              returnSecureToken: true
            }
          )
          .then(res => {
            console.log(res);
            commit("AUTH_USER", {
              token: res.data.idToken,
              userId: res.data.localId
            });

            // Local Storage
          const now = new Date();
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000)

          localStorage.setItem("token",res.data.idToken)
          localStorage.setItem("userId",res.data.localId)
          localStorage.setItem("userId","expirationDate", expirationDate);

          localStorage.setItem("userEmail", authData.email);

          router.push({ name: "dashboard" });


          })
          .catch(error => {
            console.log(error.response.data.error.message);
            commit("SET_ERROR", error.response.data.error.message);
          });
      },// closing sign in

      clearError({commit}) {
        commit ('EMPTY_ERROR');
      },

      logout ({commit}) {
        localStorage.removeItem('token');
        localStorage.removeItem('expirationDate');
        localStorage.removeItem('userId');

        // commit mutation to clear the state
        commit("CLEAR_DATA");
        // send user to sign in routh
        router.push({ name:"signin"});
      },
      autoLogin({ commit }) {
        const token = localStorage.getItem("token");
        const expirationDate = localStorage.getItem("expirationDate");
        const userId = localStorage.getItem("userId")

        const now = new Date();

        if (now >= expirationDate) {
          return;
        }
        commit("AUTH_USER", {
          token: token, 
          userId: userId
        });
      },
      storeUser({ state }, userData){
        if(!state.idToken) {
          return;
        }
        axiosAuth.post("https://agan0003-week12.firebaseio.com/users.json" + "?auth=" + state.idToken, userData)
        .then(res => console(res))
        .catch(error => console.log(error.message));
      },
      fetchUser({ commit, state }, userEmail){
        if(!state.idToken) {
          return;
        }
        globalAxios.get("https://agan0003-week12.firebaseio.com/users.json" + "?auth=" + state.idToken)
        .then(res => {
          const data = res.data;
          for (let key in data){
            const user = data[key];
            if(user.email == userEmail) {
              console.log(user);
              user.id = key;
              commit("STORE_USER", user)
            }
          }
        });
      },
      updateUser({ state }){
        globalAxios.patch("https://agan0003-week12.firebaseio.com/users/" + 
        state.user.id + 
        ".json" + 
        "?auth=" + 
        state.idToken, 
        { name: state.user.name }
        )
        .then(res => console.log(res))
        .catch(error => console.log(error.response));
      }

      },
      getters: {
        isauthenticated(state) {
          return state.idToken !== null;
        },
        getUser(state) {
          return state.user;
        }
  }
});
