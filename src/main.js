// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import store from './store/index'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import router from './router'
import qs from 'qs'
import $ from 'jquery'
import VueKonva from 'konva'
import 'vue-easytable/libs/themes-base/index.css'
import {VTable,VPagination} from 'vue-easytable'
//import '../node_modules/_bootstrap@4.0.0@bootstrap/dist/css/bootstrap.min.css'
//import '../node_modules/_bootstrap@4.0.0@bootstrap/dist/js/bootstrap.min.js'
//import '../node_modules/_datatables-bootstrap3-plugin@0.5.0@datatables-bootstrap3-plugin/example/css/datatables-bootstrap3.css'
//import '../node_modules/_datatables-bootstrap3-plugin@0.5.0@datatables-bootstrap3-plugin/example/js/datatables-bootstrap3.js'
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueKonva)
Vue.component(VTable.name, VTable)
Vue.component(VPagination.name, VPagination)
Vue.prototype.$axios = axios.create({
  baseURL: 'http://localhost:9090/',
  withCredentials: false
})
Vue.prototype.$qs = qs

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})

