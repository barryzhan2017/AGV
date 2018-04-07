/**
 * Created by hasee on 2018/3/22.
 */

export default{
  MinlChange({commit},minlength){
    commit('MinlChange',minlength);
  },
  MapwChange({commit},mapwidth){
    commit('MapwChange',mapwidth);
  },
  MaphChange({commit},mapheight){
    commit('MaphChange',mapheight);
  },
  MinlChange({commit},minlength){
    commit('MinlChange',minlength);
  },
  VChange({commit},V){
    commit('VChange',V);
  },

  //action of road
  NodenameChange({commit},nodename){
    commit('NodenameChange',nodename);
  },
  numNodeChange({commit},nodenum_real){
    commit('numNodeChange',nodenum_real);
  },
  XChange({commit},x){
    commit('XChange',x);
  },
  YChange({commit},y){
    commit('YChange',y);
  },
  nodeIndexChange({commit},indexnode){
    commit('nodeIndexChange',indexnode);
  },
  StartChange({commit},pathstart){
    commit('StartChange',pathstart);
  },
  EndChange({commit},pathend){
    commit('EndChange',pathend);
  },
  DisChange({commit},pathdis){
    commit('DisChange',pathdis);
  },
  pathIndexChange({commit},indexpath){
    commit('pathIndexChange',indexpath);
  },


  //action of buffer
  TotalChange({commit},total_buffer){
    commit('TotalChange',total_buffer);
  },
  NodenameChange_buffer({commit},nodename_buffer){
    commit('NodenameChange_buffer',nodename_buffer);
  },
  numNodeChange_buffer({commit},nodenum_realbuffer){
    commit('numNodeChange_buffer',nodenum_realbuffer);
  },
  XChange_buffer({commit},x_buffer){
    commit('XChange_buffer',x_buffer);
  },
  YChange_buffer({commit},y_buffer){
    commit('YChange_buffer',y_buffer);
  },
  nodeIndexChange_buffer({commit},indexnode_buffer){
    commit('nodeIndexChange_buffer',indexnode_buffer);
  },
  StartChange_buffer({commit},pathstart_buffer){
    commit('StartChange_buffer',pathstart_buffer);
  },
  EndChange_buffer({commit},pathend_buffer){
    commit('EndChange_buffer',pathend_buffer);
  },
  DisChange_buffer({commit},pathdis_buffer){
    commit('DisChange_buffer',pathdis_buffer);
  },
  pathIndexChange_buffer({commit},indexpath_buffer){
    commit('pathIndexChange_buffer',indexpath_buffer);
  }
}

