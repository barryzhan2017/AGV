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
  //road of motation
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
  },
  //buffer of mutation
  numNodeChange_buffer(state,nodenum_realbuffer){
    state.Nodenum_realbuffer = nodenum_realbuffer;
  },
  NodenameChange_buffer(state,nodename_buffer){
    state.Nodename_buffer = nodename_buffer;
  },
  XChange_buffer(state,x_buffer){
    state.X_buffer = x_buffer;
  },
  YChange_buffer(state,y_buffer){
    state.Y_buffer = y_buffer;
  },
  nodeIndexChange_buffer(state,indexnode_buffer){
    state.Indexnode_buffer = indexnode_buffer;
  },
  StartChange_buffer(state,pathstart_buffer){
    state.Pathstart_buffer = pathstart_buffer;
  },
  EndChange_buffer(state,pathend_buffer){
    state.Pathend_buffer = pathend_buffer;
  },
  DisChange_buffer(state,pathdis_buffer){
    state.Pathdis_buffer = pathdis_buffer;
  },
  pathIndexChange_buffer(state,indexpath_buffer){
    state.Indexpath_buffer = indexpath_buffer;
  },
}
