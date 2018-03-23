/**
 * Created by hasee on 2018/3/22.
 */
export default{
  MapwChange(state,mapwidth){
    state.Mapwidth = mapwidth;
  },
  MaphChange(state,mapheight){
    state.Mapheight = mapheight;
  },
  MinlChange(state,minlength){
    state.Minlength = minlength;
  },
  VChange(state,v){
    state.V = v;
  },
  numNodeChange(state,nodenum_real){
    state.Nodenum_real = nodenum_real;
  },
  NodenameChange(state,nodename){
    state.Nodename = nodename;
  },
  XChange(state,x){
    state.X = x;
  },
  YChange(state,y){
    state.Y = y;
  },
  nodeIndexChange(state,indexnode){
    state.Indexnode = indexnode;
  },
  StartChange(state,pathstart){
    state.Pathstart = pathstart;
  },
  EndChange(state,pathend){
    state.Pathend = pathend;
  },
  DisChange(state,pathdis){
    state.Pathdis = pathdis;
  },
  pathIndexChange(state,indexpath){
    state.Indexpath = indexpath;
  }
}
