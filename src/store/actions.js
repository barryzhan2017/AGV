/**
 * Created by hasee on 2018/3/22.
 */

export default{
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
  }
}

