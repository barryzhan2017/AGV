import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'
import getters from './getters'

Vue.use(Vuex)

const state = {
  Minlength:null,
  Mapwidth:null,  //地图总宽度
  Mapheight:null,  //地图总高度
  Minlength:null, //精度即一个网格的边长
  V:null,  //AGV小车的速度

  //road of state
  Nodenum_real:0,//删去多余节点后的节点总数
  X:[],
  Y:[],

  Nodename:[], //存有所有点击过的点被点击时的次序（作为第几个被点击的点）
  Indexnode:[], //被点击过的点是否有效
  Pathstart:[], //起点被点击的序号
  Pathend:[],//终点被点击的序号
  Pathdis:[],//路径长度
  Indexpath:[], //路线是否有效的标志

  //buffer of state
  Nodenum_realbuffer:0,//删去多余节点后的节点总数
  X_buffer:[],
  Y_buffer:[],

  Nodename_buffer:[], //存有所有点击过的点被点击时的次序（作为第几个被点击的点）
  Indexnode_buffer:[], //被点击过的点是否有效
  Pathstart_buffer:[], //起点被点击的序号
  Pathend_buffer:[],//终点被点击的序号
  Pathdis_buffer:[],//路径长度
  Indexpath_buffer:[], //路线是否有效的标志
  Total_buffer:[]
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
})
