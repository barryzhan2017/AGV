import Vue from 'vue'
import Router from 'vue-router'
import InitGrid from '@/components/InitGrid'
import Job from '@/components/Job'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/InitGrid'
    },
    {
      path: '/InitGrid',
      name: 'InitGrid',
      component: InitGrid
    },
    {
      path: '/Job',
      name: 'Job',
      component:Job
    }
  ]
})

