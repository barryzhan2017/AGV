<template>
  <div>
    <div class="navbar navbar-inverse" role="navigation">
      <div class="container-fluid">
        <div class="navbar-header">
          <!--<button class="navbar-toggle collapsed" data-toggle="collapsed" data-target=".navbar-collapse">-->
            <!--<span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span>-->
          <!--</button>-->
          <a href="#" class="navbar-brand">agv小车调度系统</a>
        </div>
        <div class="navbar-collapse collapse">
          <div class="navbar-user navbar-right">
            <ul class="nav navbar-nav">
              <li class="active"><a href="#" class="dropdown-toggle" data-toggle="dropdown"> <span class="glyphicon glyphicon-user"></span> 管理员<span
                class="caret"></span>
              </a>
                <ul class="dropdown-menu">
                  <li>修改密码</li>
                  <li class="divider"></li>
                  <li>退出</li>
                </ul></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="nav-crumb">
      <ol class="breadcrumb">
        <li>主页</li>
        <li class="active">初始化地图</li>
      </ol>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-2">
          <div  style="position: relative; top: 10px">
            <div  style="height: 10px;"></div>
            <p>初始化网格：</p>
            <table class="table table-striped"  style="white-space: nowrap;">
              <tr>
                <td><p>WIDTH:</p></td>
                <td><input id="mapwidth" v-model="mapwidth" @input = "UpdateWidth" type="text" style="width: 100px;" placeholder="地图实际长度"></td>
                <td><p>m</p></td>
              </tr>
              <tr>
                <td><p>HIGHT:</p></td>
                <td><input id="maphight" v-model="mapheight" @input = "UpdateHeight" type="text" style="width: 100px;" placeholder="地图实际宽度"></td>
                <td><p>m</p></td>
              </tr>
              <tr>
                <td><p>精度:</p></td>
                <td><input id="minlength" v-model="minlength" @input = "UpdateMinl" type="text" style="width: 100px;" placeholder="网格每格几米"></td>
                <td><p>m</p></td>
              </tr>
              <tr>
                <td><p>速度:</p></td>
                <td><input id="v" v-model="v" @input = "UpdateV" type="text" style="width: 100px;" placeholder="AGV实际速度"></td>
                <td><p>m/s</p></td>
              </tr>
            </table>
            <table id="inittable" class="table table-striped"  style="white-space: nowrap;">
            </table>
            <button id="initbtn" class="btn btn-primary" @click="init">生成网格</button><br>
            <div style="height: 10px;"></div>
            <button id="roadbtn" class = "btn btn-info" @click = "roadmake" >路径设立</button>
            <div style="height: 10px;"></div>
            <button id="bufferbtn" class = "btn btn-info" @click = "buffermake" >缓冲区设立</button>
            <br>
            <input id="bufferdeep" v-model="bufferdeep"  type="text" style="width: 100px;" placeholder="缓存区深度">
            <button id = "finishbtn" class = "btn btn-info" @click = "bufferfinish">完成</button>
            <div style="height: 10px;"></div>
            <button id="savebtn2" class="btn" @click="exportmap">导出map文件</button>
            <input type="file" @change="importmap" class ="btn" id ="files"/>
            <div style="height: 20px;"></div>
            <button id="savebtn" class="btn btn-success" @click="Save">保存地图</button>

          </div>
        </div>
        <div class="col-md-10" style="left:37px">
          <canvas id="myCanvas" @click="getpos(event)" :width="canvaswidth" :height="canvasheight"  style="position: absolute; left: 90; top: 0; z-index: 1; border: 2px dashed black;"></canvas>
          <canvas id="myCanvas2" :width="canvaswidth" :height="canvasheight" style="position: absolute; left: 90; top: 0; z-index: 0; border: 2px dashed black;"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {saveAs} from '../js/FileSaver.js'
  import {mapGetters, mapActions} from 'vuex'
  export default {
    name: 'Agv',
    data () {
      return {

        mapwidth:null,  //地图宽度
        mapheight:null, //地图高度
        minlength:null, //精度即一个网格的边长
        v:null,  //AGV小车的速度
        allx:[], //网格每个点的横坐标
        ally:[], //网格每个点的纵坐标
        pxv:null,

        nodenum:0, //点击过的节点数量
        nodenum_buffer:0,
        nodenum_real:0,//删去多余节点后的节点总数
        nodenum_realbuffer:0,
        x:[],
        y:[],
        x_buffer:[],
        y_buffer:[],
        bufferdeep:null,
        nodename:[], //存有所有点击过的点被点击时的次序（作为第几个被点击的点）
        nodename_buffer:[],
        indexnode:[], //被点击过的点是否有效
        indexnode_buffer:[],
        pathstart:[], //起点被点击的序号
        pathstart_buffer:[],
        pathend:[],//终点被点击的序号
        pathend_buffer:[],
        pathdis:[],//路径长度
        pathdis_buffer:[],
        indexpath:[], //路线是否有效的标志
        indexpath_buffer:[],
        total_buffer:[],

        tag:0, //变数的计数器
        tag_buffer:0,
        count_buffer:0,
        bffinish:0,

        strimport:null,
        tagimport:0,
        flag:0,//用来判断画布是否已经初始化

        roadOrbuffer:1  // 1是路线建立 2 是缓冲区建立

      }
    },
    computed:{

      canvasheight(){
        return this.mapheight*20+10;
      },//1m 20像素
      canvaswidth(){
        return this.mapwidth*20+10;
      },//1m 20像素
      length(){
        return this.minlength*20;
      }//每格多少像素

    },
    methods: {
      MapChange: function () {
        //road change

        this.$store.dispatch('numNodeChange', this.nodenum_real);
        this.$store.dispatch('NodenameChange', this.nodename);
        this.$store.dispatch('XChange', this.x);
        this.$store.dispatch('YChange', this.y);
        this.$store.dispatch('nodeIndexChange', this.indexnode);
        this.$store.dispatch('StartChange', this.pathstart);
        this.$store.dispatch('EndChange', this.pathend);
        this.$store.dispatch('DisChange', this.pathdis);
        this.$store.dispatch('pathIndexChange', this.indexpath);

        //buffer change
        this.$store.dispatch('numNodeChange_buffer', this.nodenum_realbuffer);
        this.$store.dispatch('NodenameChange_buffer', this.nodename_buffer);
        this.$store.dispatch('XChange_buffer', this.x_buffer);
        this.$store.dispatch('YChange_buffer', this.y_buffer);
        this.$store.dispatch('nodeIndexChange_buffer', this.indexnode_buffer);
        this.$store.dispatch('StartChange_buffer', this.pathstart_buffer);
        this.$store.dispatch('EndChange_buffer', this.pathend_buffer);
        this.$store.dispatch('DisChange_buffer', this.pathdis_buffer);
        this.$store.dispatch('pathIndexChange_buffer', this.indexpath_buffer);
        this.$store.dispatch('TotalChange',this.total_buffer);
      },
      bufferfinish:function(){

        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        var deep = this.bufferdeep;
        var begin_x,begin_y;
        var max_y = -1,max_x = -1,min_x = 9999999,min_y = 9999999;
        var end_x,end_y;
        var n = 0,j;

        this.bffinish = 1;

        for(var i = 0 ; i < this.x.length;++i){
          if(this.x[i] < min_x){
            min_x = this.x[i];
          }
          if(this.x[i] > max_x){
            max_x = this.x[i];
          }
          if(this.y[i] < min_y){
            min_y = this.y[i];
          }
          if(this.y[i] > max_y){
            max_y = this.y[i];
          }
        }
        if(deep > 1){


          for(var i = 0 ; i < this.indexnode_buffer.length; ++i){
            if(this.indexnode_buffer[i] == 1) {
              begin_x = this.x_buffer[i];
              begin_y = this.y_buffer[i];
            }

            if(this.indexnode_buffer[i] == 2) {
              end_x = this.x_buffer[i];
              end_y = this.y_buffer[i];
            }


          }
          if(begin_x == end_x){//竖线
            var dis;
            var temp = deep;

            while(temp > 1){
              if(begin_x == min_x){
                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                this.y_buffer[this.nodenum_buffer] = begin_y;
                this.x_buffer[this.nodenum_buffer] = begin_x - (deep - temp +1)*this.length;
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
              }
              else{
                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                this.y_buffer[this.nodenum_buffer] = begin_y;
                this.x_buffer[this.nodenum_buffer] = begin_x + (deep - temp + 1)*this.length;
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
              }

              temp--;
            }


            if(begin_y > end_y){
              dis = begin_y - end_y;
            }
            else{
              dis = end_y - begin_y;
            }
            while(n <= dis/this.length){

              this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
              if(begin_y > end_y){
                this.y_buffer[this.nodenum_buffer] = begin_y - n*this.length;
                if(begin_x == min_x){
                  this.x_buffer[this.nodenum_buffer] = begin_x - deep*this.length;
                }
                else {
                  this.x_buffer[this.nodenum_buffer] = begin_x + deep*this.length;
                }
              }
              else{
                this.y_buffer[this.nodenum_buffer] = begin_y + n*this.length;
                if(begin_x == min_x){
                  this.x_buffer[this.nodenum_buffer] = begin_x - deep*this.length;
                }
                else {
                  this.x_buffer[this.nodenum_buffer] = begin_x + deep*this.length;
                }
              }
              this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
              this.nodenum_buffer++;
              n++;
            }

            temp = deep;
            while(temp > 1){
              if(begin_x == min_x){
                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                this.y_buffer[this.nodenum_buffer] = end_y;
                this.x_buffer[this.nodenum_buffer] = end_x - (temp - 1 )*this.length;
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
              }
              else{
                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                this.y_buffer[this.nodenum_buffer] = end_y;
                this.x_buffer[this.nodenum_buffer] = end_x + (temp - 1)*this.length;
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
              }

              temp--;
            }

          }
          else if(begin_y == end_y){ //横线
            var dis;
            var temp = deep;
            while(temp > 1){
              if(begin_y == max_y){

                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                this.x_buffer[this.nodenum_buffer] = begin_x;
                this.y_buffer[this.nodenum_buffer] = begin_y + (deep - temp +1)*this.length;
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
              }
              else{
                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                this.x_buffer[this.nodenum_buffer] = begin_x;
                this.y_buffer[this.nodenum_buffer] = begin_y - (deep - temp + 1)*this.length;
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
              }

              temp--;
            }


            if(begin_x > end_x){
              dis = begin_x - end_x;
            }
            else{
              dis = end_x - begin_x;
            }
            while(n <= dis/this.length){

              this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
              if(begin_x > end_x){
                this.x_buffer[this.nodenum_buffer] = begin_x - n*this.length;
                if(begin_y == max_y){
                  this.y_buffer[this.nodenum_buffer] = begin_y + deep*this.length;
                }
                else {
                  this.y_buffer[this.nodenum_buffer] = begin_y - deep*this.length;
                }
              }
              else{
                this.x_buffer[this.nodenum_buffer] = begin_x + n*this.length;
                if(begin_y == max_y){
                  this.y_buffer[this.nodenum_buffer] = begin_y + deep*this.length;
                }
                else {
                  this.y_buffer[this.nodenum_buffer] = begin_y - deep*this.length;
                }
              }
              this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
              this.nodenum_buffer++;
              n++;
            }

            temp = deep;
            while(temp > 1){
              if(begin_y == max_y){
                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                this.x_buffer[this.nodenum_buffer] = end_x;
                this.y_buffer[this.nodenum_buffer] = end_y + (temp - 1 )*this.length;
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
              }
              else{
                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                this.x_buffer[this.nodenum_buffer] = end_x;
                this.y_buffer[this.nodenum_buffer] = end_y - (temp - 1)*this.length;
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
              }

              temp--;
            }

          }
          else {
            //左右两条线按竖线存 上下按横线存
            if(begin_x == min_x || begin_x == max_x){
              var dis;
              var temp = deep;
              while(temp > 1){
                if(begin_x == min_x){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.y_buffer[this.nodenum_buffer] = begin_y;
                  this.x_buffer[this.nodenum_buffer] = begin_x - (deep - temp +1)*this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                  this.nodenum_buffer++;
                }
                else{
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.y_buffer[this.nodenum_buffer] = begin_y;
                  this.x_buffer[this.nodenum_buffer] = begin_x + (deep - temp + 1)*this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                  this.nodenum_buffer++;
                }

                temp--;
              }


              if(begin_y > end_y){
                dis = begin_y - end_y;
              }
              else{
                dis = end_y - begin_y;
              }
              while(n <= (dis+deep*this.length)/this.length){

                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                if(begin_y > end_y){
                  this.y_buffer[this.nodenum_buffer] = begin_y - n*this.length;
                  if(begin_x == min_x){
                    this.x_buffer[this.nodenum_buffer] = begin_x - deep*this.length;
                  }
                  else {
                    this.x_buffer[this.nodenum_buffer] = begin_x + deep*this.length;
                  }
                }
                else{
                  this.y_buffer[this.nodenum_buffer] = begin_y + n*this.length;
                  if(begin_x == min_x){
                    this.x_buffer[this.nodenum_buffer] = begin_x - deep*this.length;
                  }
                  else {
                    this.x_buffer[this.nodenum_buffer] = begin_x + deep*this.length;
                  }
                }
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
                n++;
              }

              if(begin_x == min_x){
                while(this.x_buffer[this.nodenum_buffer-1] + this.length <= end_x){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] =  this.x_buffer[this.nodenum_buffer-1] + this.length;
                  this.y_buffer[this.nodenum_buffer] = this.y_buffer[this.nodenum_buffer-1] ;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;
                  this.nodenum_buffer++;
                }
              }
              else{
                while(this.x_buffer[this.nodenum_buffer-1] - this.length >= end_x){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = this.x_buffer[this.nodenum_buffer-1] - this.length;
                  this.y_buffer[this.nodenum_buffer] = this.y_buffer[this.nodenum_buffer-1] ;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;
                  this.nodenum_buffer++;
                }
              }

              temp = deep;
              while(temp > 2){
                if(begin_y == max_y){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = end_x;
                  this.y_buffer[this.nodenum_buffer] = end_y + (temp - 1 )*this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                  this.nodenum_buffer++;
                }
                else{
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = end_x;
                  this.y_buffer[this.nodenum_buffer] = end_y - (temp - 1)*this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                  this.nodenum_buffer++;
                }

                temp--;
              }

            }
            else if(begin_y == min_y || begin_y == max_y){
              var dis;
              var temp = deep;
              while(temp > 1){
                if(begin_y == max_y){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer +(this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = begin_x;
                  this.y_buffer[this.nodenum_buffer] = begin_y + (deep - temp +1)*this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                  this.nodenum_buffer++;
                }
                else{
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = begin_x;
                  this.y_buffer[this.nodenum_buffer] = begin_y - (deep - temp + 1)*this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                  this.nodenum_buffer++;
                }

                temp--;
              }


              if(begin_x > end_x){
                dis = begin_x - end_x;
              }
              else{
                dis = end_x - begin_x;
              }
              while(n <= (dis+deep*this.length)/this.length){

                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                if(begin_x > end_x){
                  this.x_buffer[this.nodenum_buffer] = begin_x - n*this.length;
                  if(begin_y == max_y){
                    this.y_buffer[this.nodenum_buffer] = begin_y + deep*this.length;
                  }
                  else {
                    this.y_buffer[this.nodenum_buffer] = begin_y - deep*this.length;
                  }
                }
                else{
                  this.x_buffer[this.nodenum_buffer] = begin_x + n*this.length;
                  if(begin_y == max_y){
                    this.y_buffer[this.nodenum_buffer] = begin_y + deep*this.length;
                  }
                  else {
                    this.y_buffer[this.nodenum_buffer] = begin_y - deep*this.length;
                  }
                }
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
                n++;
              }

              if(begin_y == min_y){
                while(this.y_buffer[this.nodenum_buffer-1] + this.length <= end_y){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = this.x_buffer[this.nodenum_buffer-1];
                  this.y_buffer[this.nodenum_buffer] = this.y_buffer[this.nodenum_buffer-1] + this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;
                  this.nodenum_buffer++;
                }
              }
              else{
                while(this.y_buffer[this.nodenum_buffer-1] - this.length >= end_y){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = this.x_buffer[this.nodenum_buffer - 1];
                  this.y_buffer[this.nodenum_buffer] = this.y_buffer[this.nodenum_buffer - 1] - this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;
                  this.nodenum_buffer++;
                }
              }
              temp = deep;
              while(temp > 1){
                if(begin_x == min_x){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.y_buffer[this.nodenum_buffer] = end_y;
                  this.x_buffer[this.nodenum_buffer] = end_x - (temp - 1 )*this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                  this.nodenum_buffer++;
                }
                else{
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.y_buffer[this.nodenum_buffer] = end_y;
                  this.x_buffer[this.nodenum_buffer] = end_x + (temp - 1)*this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                  this.nodenum_buffer++;
                }

                temp--;
              }

            }

          }
        }
        else if(deep == 1){
          for(var i = 0 ; i < this.indexnode_buffer.length; ++i){
            if(this.indexnode_buffer[i] == 1) {
              begin_x = this.x_buffer[i];
              begin_y = this.y_buffer[i];
            }

            if(this.indexnode_buffer[i] == 2) {
              end_x = this.x_buffer[i];
              end_y = this.y_buffer[i];
            }


          }
          if(begin_x == end_x){//竖线
            var dis;
            if(begin_y > end_y){
              dis = begin_y - end_y;
            }
            else{
              dis = end_y - begin_y;
            }
            while(n <= dis/this.length){

              this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
              if(begin_y > end_y){
                this.y_buffer[this.nodenum_buffer] = begin_y - n*this.length;
                if(begin_x == min_x){
                  this.x_buffer[this.nodenum_buffer] = begin_x - this.length;
                }
                else {
                  this.x_buffer[this.nodenum_buffer] = begin_x + this.length;
                }
              }
              else{
                this.y_buffer[this.nodenum_buffer] = begin_y + n*this.length;
                if(begin_x == min_x){
                  this.x_buffer[this.nodenum_buffer] = begin_x - this.length;
                }
                else {
                  this.x_buffer[this.nodenum_buffer] = begin_x + this.length;
                }
              }
              this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
              this.nodenum_buffer++;
              n++;
            }

          }
          else if(begin_y == end_y){ //横线
            var dis;
            if(begin_x > end_x){
              dis = begin_x - end_x;
            }
            else{
              dis = end_x - begin_x;
            }
            while(n <= dis/this.length){

              this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
              if(begin_x > end_x){
                this.x_buffer[this.nodenum_buffer] = begin_x - n*this.length;
                if(begin_y == max_y){
                  this.y_buffer[this.nodenum_buffer] = begin_y + this.length;
                }
                else {
                  this.y_buffer[this.nodenum_buffer] = begin_y - this.length;
                }
              }
              else{
                this.x_buffer[this.nodenum_buffer] = begin_x + n*this.length;
                if(begin_y == max_y){
                  this.y_buffer[this.nodenum_buffer] = begin_y + this.length;
                }
                else {
                  this.y_buffer[this.nodenum_buffer] = begin_y - this.length;
                }
              }
              this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
              this.nodenum_buffer++;
              n++;
            }

          }
          else {
            if(begin_x == min_x || begin_x == max_x){
              var dis;
              if(begin_y > end_y){
                dis = begin_y - end_y;
              }
              else{
                dis = end_y - begin_y;
              }
              while(n <= (dis+this.length)/this.length){

                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + this.nodenum;
                if(begin_y > end_y){
                  this.y_buffer[this.nodenum_buffer] = begin_y - n*this.length;
                  if(begin_x == min_x){
                    this.x_buffer[this.nodenum_buffer] = begin_x - this.length;
                  }
                  else {
                    this.x_buffer[this.nodenum_buffer] = begin_x + this.length;
                  }
                }
                else{
                  this.y_buffer[this.nodenum_buffer] = begin_y + n*this.length;
                  if(begin_x == min_x){
                    this.x_buffer[this.nodenum_buffer] = begin_x - this.length;
                  }
                  else {
                    this.x_buffer[this.nodenum_buffer] = begin_x + this.length;
                  }
                }
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
                n++;
              }
              if(begin_x == min_x){
                while(this.x_buffer[this.nodenum_buffer-1] + this.length <= end_x){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = this.x_buffer[this.nodenum_buffer - 1] + this.length;
                  this.y_buffer[this.nodenum_buffer] = this.y_buffer[this.nodenum_buffer-1] ;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;
                  this.nodenum_buffer++;
                }
              }
              else{
                while(this.x_buffer[this.nodenum_buffer-1] - this.length >= end_x){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = this.x_buffer[this.nodenum_buffer - 1] - this.length;
                  this.y_buffer[this.nodenum_buffer] = this.y_buffer[this.nodenum_buffer - 1] ;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;
                  this.nodenum_buffer++;
                }
              }
            }
            else if(begin_y == end_y){
              var dis;
              if(begin_x > end_x){
                dis = begin_x - end_x;
              }
              else{
                dis = end_x - begin_x;
              }
              while(n <= dis/this.length){

                this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer +(this.count_buffer+1)*100;
                if(begin_x > end_x){
                  this.x_buffer[this.nodenum_buffer] = begin_x - n*this.length;
                  if(begin_y == max_y){
                    this.y_buffer[this.nodenum_buffer] = begin_y + this.length;
                  }
                  else {
                    this.y_buffer[this.nodenum_buffer] = begin_y - this.length;
                  }
                }
                else{
                  this.x_buffer[this.nodenum_buffer] = begin_x + n*this.length;
                  if(begin_y == max_y){
                    this.y_buffer[this.nodenum_buffer] = begin_y + this.length;
                  }
                  else {
                    this.y_buffer[this.nodenum_buffer] = begin_y - this.length;
                  }
                }
                this.indexnode_buffer[this.nodenum_buffer] = 3;//非起点非终点
                this.nodenum_buffer++;
                n++;
              }
              if(begin_y == min_y){
                while(this.y_buffer[this.nodenum_buffer-1] + this.length <= end_y){
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = this.x_buffer[this.nodenum_buffer-1];
                  this.y_buffer[this.nodenum_buffer] = this.y_buffer[this.nodenum_buffer] + this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;
                  this.nodenum_buffer++;
                }
              }
              else {
                while (this.y_buffer[this.nodenum_buffer - 1] - this.length >= end_y) {
                  this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + (this.count_buffer+1)*100;
                  this.x_buffer[this.nodenum_buffer] = this.x_buffer[this.nodenum_buffer - 1];
                  this.y_buffer[this.nodenum_buffer] = this.y_buffer[this.nodenum_buffer - 1] - this.length;
                  this.indexnode_buffer[this.nodenum_buffer] = 3;
                  this.nodenum_buffer++;
                }
              }
            }
          }
        }
        else {
          alert('深度须大于等于1')
        }

        for(var i = 0 ; i < this.indexnode_buffer.length; ++i){

          if(this.indexnode_buffer[i] == 1){

            for(j = i; j < this.indexnode_buffer.length; ++j ){

              if(this.indexnode_buffer[j] == 3){

                ctx.lineWidth = 4;
                ctx.lineCap = "round"; //设置端点样式:butt(默认),round,square
                ctx.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round
                ctx.strokeStyle = '#0000FF'; // 设置线的颜色

                ctx.beginPath();
                ctx.moveTo(this.x_buffer[i], this.y_buffer[i] );
                ctx.lineTo(this.x_buffer[j], this.y_buffer[j] );
                ctx.stroke();
                ctx.closePath();
                break;
              }
            }
            break;
          }
        }
        for(var i = j+1 ; i <this.indexnode_buffer.length; ++i){
          if(this.indexnode_buffer[i] == 3){
            ctx.lineWidth = 4;
            ctx.lineCap = "round"; //设置端点样式:butt(默认),round,square
            ctx.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round
            ctx.strokeStyle = '#0000FF'; // 设置线的颜色

            ctx.beginPath();
            ctx.moveTo(this.x_buffer[j], this.y_buffer[j] );
            ctx.lineTo(this.x_buffer[i], this.y_buffer[i] );
            ctx.stroke();
            ctx.closePath();
            j = i;
          }
        }
        for(var i = 0 ; i < this.indexnode_buffer.length; ++i){
          if(this.indexnode_buffer[i] == 2){
            ctx.lineWidth = 4;
            ctx.lineCap = "round"; //设置端点样式:butt(默认),round,square
            ctx.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round
            ctx.strokeStyle = '#0000FF'; // 设置线的颜色

            ctx.beginPath();
            ctx.moveTo(this.x_buffer[j], this.y_buffer[j] );
            ctx.lineTo(this.x_buffer[i], this.y_buffer[i] );
            ctx.stroke();
            ctx.closePath();
            break;
          }
        }



        this.total_buffer[this.count_buffer] = [this.x_buffer,this.y_buffer,this.indexnode_buffer,this.nodename_buffer];
        console.log(this.total_buffer);
        this.count_buffer++;
        this.nodenum_buffer = 0;
        this.x_buffer = [];
        this.y_buffer = [];
        this.nodename_buffer = [];
        this.indexnode_buffer = [];
        this.bufferdeep = null;
      },
      roadmake:function(){
        this.roadOrbuffer = 1;
        alert('路径设定');

      },
      buffermake:function(){
        this.roadOrbuffer = 2;
        alert('缓冲区设定--请依次选定起点终点并输入深度');
      },
      init: function () {    //地图初始化

        var canvas2 = document.getElementById("myCanvas2");
        var ctx2 = canvas2.getContext("2d");
        var ctx=myCanvas.getContext("2d");
        this.roadOrbuffer = 1;
        this.bffinish = 0;
        this.pxv = 20 * this.v;
        if (this.flag == 1) {       //如果网格已经构建过一次，那么重新建立网格时应该初始化所有的存储变量
          ctx2.clearRect(0, 0, this.canvaswidth, this.canvasheight);
          ctx.clearRect(0,0,this.canvaswidth,this.canvasheight);
          this.allx = [];
          this.ally = [];
          this.pxv = null;
          this.nodenum = 0;
          this.nodenum_buffer = 0;
          this.nodenum_real = 0;
          this.nodenum_realbuffer = 0
          this.x = [];
          this.x_buffer = [];
          this.y = [];
          this.y_buffer = [];

          this.nodename = [];
          this.nodename_buffer = [];
          this.indexnode = [];
          this.indexnode_buffer = [];
          this.pathstart = [];
          this.pathstart_buffer = [];
          this.pathend = [];
          this.pathend_buffer = [];
          this.pathdis = [];
          this.pathdis_buffer = [];
          this.indexpath = [];
          this.indexpath_buffer = [];
          this.total_buffer = [];


          this.tag = 0;
          this.tag_buffer = 0;
          this.strimport = null;
          this.tagimport = 0;
          this.count_buffer = 0;

          this.MapChange();

        }

        //设置直线参数
        ctx2.globalAlpha = 0.3;
        ctx2.lineWidth = 3;
        ctx2.lineCap = "round"; //设置端点样式:butt(默认),round,square
        ctx2.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round

        //开始绘制网格
        for (var i = 0; i < this.mapheight / this.minlength; i++) {
          ctx2.beginPath();
          ctx2.moveTo(1, this.length * (i + 1));
          ctx2.lineTo(this.canvaswidth - 1, this.length * (i + 1));
          ctx2.stroke();
          ctx2.closePath();
          this.ally[i] = this.length * (i + 1);
        }
        for (var j = 0; j < this.mapwidth / this.minlength; j++) {
          ctx2.beginPath();
          ctx2.moveTo(this.length * (j + 1), 1);
          ctx2.lineTo(this.length * (j + 1), this.canvasheight - 1);
          ctx2.stroke();
          ctx2.closePath();
          this.allx[j] = this.length * (j + 1);
        }

        //设置文字（网格边上长度）参数
        ctx2.globalAlpha = 1;
        ctx2.font = "bold 20px";
        ctx2.fillStyle = "#FF0000";

        //开始绘制文字
        for (i = 0; i < this.mapheight / this.minlength; i++) {
          ctx2.fillText(i + 1, 0, this.length * (i + 1));
        }
        for (j = 0; j < this.mapwidth / this.minlength; j++) {
          ctx2.fillText(j + 1, this.length * (j + 1) - 12, 10);
        }
        this.flag = 1;
      },
      getpos: function (e) {       //选取AGV小车活动范围的函数
        e = e || event;
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        var factx = e.clientX - canvas.getBoundingClientRect().left;  //鼠标点击位置相对于画布边框的横坐标
        var facty = e.clientY - canvas.getBoundingClientRect().top;   //鼠标点击位置相对于画布边框的纵坐标
        if(this.roadOrbuffer == 1){

          //记录点击位置是否与网格节点匹配
          var xtag = 0;
          var ytag = 0;

          for (var i = 0; i < this.allx.length; i++) {
            if (factx >= this.allx[i] - 5 && factx <= this.allx[i] + 5) {
              xtag = 1;
            }
          }
          for (var i = 0; i < this.ally.length; i++) {
            if (facty >= this.ally[i] - 5 && facty <= this.ally[i] + 5) {
              ytag = 1;
            }
          }
          if (xtag == 1 && ytag == 1) {
            //将点击位置转化到网格节点
            var px = parseInt((factx + 6) / this.length) * this.length;
            var py = parseInt((facty + 6) / this.length) * this.length;

            var numxx = px;
            var numyy = py;
            var thisnodename = -1;
            var thisi = -1;
            var tag5 = 0;


            for (var i = 0; i < this.nodename.length; i++) {
              //如果这个点已经出现在储存的点集中，再次点击就删除
              if (numxx == this.x[i] && numyy == this.y[i] && this.indexnode[i] != 0) {
                tag5 = 1;
                thisi = i;
                thisnodename = this.nodename[i];
              } else {
              }
            }

            if (tag5 == 1) { //删除节点
              var tt1 = 0; //用于记录该点是否是起点
              var tt2 = 0; // 用于记录该店是否是终点
              for (var i = 0; i < this.pathstart.length; i++) {
                if (thisnodename == this.pathstart[i] && this.indexpath[i] == 1) {
                  tt1 = 1;
                }
              }
              for (var i = 0; i < this.pathend.length; i++) {
                if (thisnodename == this.pathend[i] && this.indexpath[i] == 1) {
                  tt2 = 1;
                }
              }
              if (tt1 == 1 || tt2 == 1) {
                alert("该点为起点或终点，无法删除！");
              } else {
                numxx = numxx - 5;
                numyy = numyy - 5;
                ctx.clearRect(numxx, numyy, 10, 10);
                numxx = numxx - 5;
                numyy = numyy - 8;
                ctx.clearRect(numxx, numyy, 20, 20);
                this.indexnode[thisi] = 0;
              }
            }
            else { //绘制节点

              ctx.beginPath();
              ctx.arc(numxx, numyy, 5, 0, Math.PI * 2, true);
              ctx.fillStyle = "#6495ED";
              ctx.fill();
              //设置文字参数
              ctx.font = "bold 20px";

              var numxxx = numxx - 10;
              var numyyy = numyy - 5;
              ctx.fillText(this.nodenum + 1, numxxx, numyyy);
              this.x[this.nodenum] = numxx;
              this.y[this.nodenum] = numyy;
              this.nodename[this.nodenum] = this.nodenum + 1;
              this.indexnode[this.nodenum] = 1;
              this.nodenum = this.nodenum + 1;

              //如果某个点在生成的线中被点击 则相当于插入该点并重新最小划分线
              if(this.Lineinclude(numxx,numyy)){
                this.indexnode[this.nodenum-1] = 2;
                var temp = this.pathstart.length;
                for(var i = 0 ; i < temp; ++i){
                  if(this.indexpath[i] != 0 &&
                    numxx == this.x[this.pathstart[i]-1] &&
                    ((numyy <= this.y[(this.pathstart[i]-1)] && numyy >= this.y[(this.pathend[i]-1)])
                    || (numyy >= this.y[(this.pathstart[i]-1)] && numyy <= this.y[(this.pathend[i]-1)]))){
                    this.pathstart[this.pathstart.length] = this.pathstart[i];
                    this.pathend[this.pathend.length] = this.nodenum;
                    this.pathdis[this.pathdis.length] = this.abs(this.y[this.pathstart[i]-1] - numyy);
                    this.indexpath[this.indexpath.length] = 1;
                    this.pathstart[this.pathstart.length] = this.nodenum;
                    this.pathend[this.pathend.length] = this.pathend[i];
                    this.pathdis[this.pathdis.length] = this.abs(this.y[this.pathstart[i]-1] - numyy);
                    this.indexpath[this.indexpath.length] = 1;
                    this.Deduplication();
                  }

                  else if(this.indexpath[i] != 0 &&
                    numyy == this.y[(this.pathstart[i]-1)] &&
                    ((numxx <= this.x[(this.pathstart[i]-1)] && numxx >= this.x[(this.pathend[i]-1)])
                    || (numxx >= this.x[(this.pathstart[i]-1)] && numxx <= this.x[(this.pathend[i]-1)]))){
                    this.pathstart[this.pathstart.length] = this.pathstart[i];
                    this.pathend[this.pathend.length] = this.nodenum;
                    this.pathdis[this.pathdis.length] = this.abs(this.x[this.pathstart[i]-1] - numxx);
                    this.indexpath[this.indexpath.length] = 1;
                    this.pathstart[this.pathstart.length] = this.nodenum;
                    this.pathend[this.pathend.length] = this.pathend[i];
                    this.pathdis[this.pathdis.length] = this.abs(this.x[this.pathstart[i]-1] - numxx);
                    this.indexpath[this.indexpath.length] = 1;
                    this.Deduplication();
                  }


                }
              }
            }
          } else if (xtag == 1 && ytag != 1) {
            var tag1 = 0;
            var tag2 = 0;
            var startx, starty = 1, endx, endy = 1;
            var factytemp1;
            var factytemp2;
            var startname1;
            var endname1;
            var disdel1;
            factytemp1 = facty;
            factytemp2 = facty;
            startx = parseInt((factx + 6) / this.length) * this.length;
            endx = parseInt((factx + 6) / this.length) * this.length;
            while (starty > 0) {
              starty = parseInt(factytemp1 / this.length) * this.length; //起点的纵坐标等于当前点击位置上面的节点纵坐标
              factytemp1 = factytemp1 - this.length;
              //alert(starty);
              for (var i = 0; i < this.y.length; i++) {
                if (starty == this.y[i] && startx == this.x[i]
                  && this.indexnode[i] != 0) {
                  startname1 = this.nodename[i];
                  tag1 = 1;
                  break;
                }
              }
              if (tag1 == 1) {
                break;
              }
            }
            while (endy < 800) {
              factytemp2 = factytemp2 + parseInt(this.length);
              endy = parseInt(factytemp2 / this.length) * this.length;
              //alert(endy);
              for (var i = 0; i < this.y.length; i++) {
                if (endy == this.y[i] && endx == this.x[i] && this.indexnode[i] != 0) {
                  endname1 = this.nodename[i];
                  tag2 = 1;
                  break;
                }
              }
              if (tag2 == 1) {
                break;
              }
            }
            //alert(startx+" "+starty+" "+endx+" "+endy+" "+tag1+" "+tag2);
            if (tag1 == 1 && tag2 == 1) {
              //地图上竖线上已经有两个点
              var tag12 = 0;
              for (var i = 0; i < this.indexpath.length; i++) {  //点击在线上删除线
                if (startname1 == this.pathstart[i]
                  && endname1 == this.pathend[i] && this.indexpath[i] == 1) {
                  this.indexpath[i] = 0;
                  disdel1 = this.pathdis[i] - 10;
                  tag12 = 1;
                }
              }
              if (tag12 == 1) {
                ctx.clearRect(startx - 2, starty + 5, 4, disdel1);
              }
              else {
                //设置直线参数
                ctx.lineWidth = 4;
                ctx.lineCap = "round"; //设置端点样式:butt(默认),round,square
                ctx.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round
                ctx.strokeStyle = '#FA8072'; // 设置线的颜色

                ctx.beginPath();
                ctx.moveTo(startx, starty + 6);
                ctx.lineTo(endx, endy - 6);
                ctx.stroke();
                ctx.closePath();

                this.pathstart[this.tag] = startname1;
                this.pathend[this.tag] = endname1;
                this.pathdis[this.tag] = endy - starty;
                this.indexpath[this.tag] = 1;
                this.tag++;
              }
            }
            else {
              alert("请勿点击无效区域！");
            }
          }
          else if (xtag != 1 && ytag == 1) {
            var tag3 = 0;
            var tag4 = 0;
            var startx = 1, starty, endx = 1, endy;
            var factxtemp1;
            var factxtemp2;
            var startname2;
            var endname2;
            var disdel2;
            factxtemp1 = factx;
            factxtemp2 = factx;
            starty = parseInt((facty + 6) / this.length) * this.length;
            endy = parseInt((facty + 6) / this.length) * this.length;
            while (startx > 0) {
              startx = parseInt(factxtemp1 / this.length) * this.length;
              factxtemp1 = factxtemp1 - this.length;
              //alert(startx);
              for (var i = 0; i < this.y.length; i++) {
                if (startx == this.x[i] && starty == this.y[i]
                  && this.indexnode[i] != 0) {
                  startname2 = this.nodename[i];
                  tag3 = 1;
                  break;
                }
              }
              if (tag3 == 1) {
                break;
              }
            }
            while (endx < 1500) {
              factxtemp2 = factxtemp2 + parseInt(this.length);
              endx = parseInt(factxtemp2 / this.length) * this.length;
              //alert(endx);
              for (var i = 0; i < this.y.length; i++) {
                if (endx == this.x[i] && endy == this.y[i] && this.indexnode[i] != 0) {
                  endname2 = this.nodename[i];
                  tag4 = 1;
                  break;
                }
              }
              if (tag4 == 1) {
                break;
              }
            }
            //alert(startx+" "+starty+" "+endx+" "+endy+" "+tag3+" "+tag4);
            if (tag3 == 1 && tag4 == 1) {
              var tag34 = 0;
              for (var i = 0; i < this.indexpath.length; i++) {
                if (startname2 == this.pathstart[i]
                  && endname2 == this.pathend[i] && this.indexpath[i] == 1) {
                  this.indexpath[i] = 0;
                  disdel2 = this.pathdis[i] - 10;
                  tag34 = 1;
                }
              }
              if (tag34 == 1) {
                ctx.clearRect(startx + 5, starty - 2, disdel2, 4);
              } else {
                //设置直线参数
                ctx.lineWidth = 4;
                ctx.lineCap = "round"; //设置端点样式:butt(默认),round,square
                ctx.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round
                ctx.strokeStyle = '#FA8072'; // 设置线的颜色

                ctx.beginPath();
                ctx.moveTo(startx + 6, starty);
                ctx.lineTo(endx - 6, endy);
                ctx.stroke();
                ctx.closePath();

                this.pathstart[this.tag] = startname2;
                this.pathend[this.tag] = endname2;
                this.pathdis[this.tag] = endx - startx;
                this.indexpath[this.tag] = 1;
                this.tag++;
              }
            } else {
              alert("请勿点击无效区域！");
            }

          } else {
            alert("请勿点击空白区域！");
          }
        }
        else if(this.roadOrbuffer == 2){

          //记录点击位置是否与网格节点匹配
          var xtag = 0;
          var ytag = 0;

          for (var i = 0; i < this.allx.length; i++) {
            if (factx >= this.allx[i] - 5 && factx <= this.allx[i] + 5) {
              xtag = 1;
            }
          }
          for (var i = 0; i < this.ally.length; i++) {
            if (facty >= this.ally[i] - 5 && facty <= this.ally[i] + 5) {
              ytag = 1;
            }
          }
          if (xtag == 1 && ytag == 1) {
            //将点击位置转化到网格节点
            var px = parseInt((factx + 6) / this.length) * this.length;
            var py = parseInt((facty + 6) / this.length) * this.length;

            var numxx = px;
            var numyy = py;
            var thisnodename = -1;
            var thisi = -1;
            var tag5 = 0;
            var goa ;

            goa = this.Lineinclude(numxx,numyy);

            if(goa) {
              for (var i = 0; i < this.nodename_buffer.length; i++) {
                //如果这个点已经出现在储存的点集中，再次点击就删除
                if (numxx == this.x_buffer[i] && numyy == this.y_buffer[i] && this.indexnode_buffer[i] != 0) {
                  tag5 = 1;
                  thisi = i;
                  thisnodename = this.nodename_buffer[i];

                } else {
                }
              }

              if (tag5 == 1) { //删除节点
                numxx = numxx - 5;
                numyy = numyy - 5;
                ctx.clearRect(numxx, numyy, 10, 10);
                numxx = numxx - 5;
                numyy = numyy - 8;
                ctx.clearRect(numxx, numyy, 20, 20);
                this.indexnode_buffer[thisi] = 0;
              }
              else { //绘制节点
                ctx.beginPath();
                ctx.arc(numxx, numyy, 5, 0, Math.PI * 2, true);
                ctx.fillStyle = "#BA55D3";
                ctx.fill();
                //设置文字参数
                ctx.font = "bold 20px";
                var numxxx = numxx - 10;
                var numyyy = numyy - 5;
                var firstornot = 1;
                ctx.fillText(this.nodenum_buffer + 1, numxxx, numyyy); //是显示点击的顺序还是显示名字
                this.x_buffer[this.nodenum_buffer] = numxx;
                this.y_buffer[this.nodenum_buffer] = numyy;
                for(var k = 0 ; k < this.x.length; ++k){
                  if(numxx == this.x[k] && numyy == this.y[k]){
                    this.nodename_buffer[this.nodenum_buffer] = this.nodename[k];
                  }
                }

                for(var k = 0; k < this.indexnode_buffer.length; ++k){
                  if(this.indexnode_buffer[k] == 1) {
                    firstornot = 0;
                    break;
                  }
                  else firstornot = 1;
                }

                if(firstornot == 1){
                  this.indexnode_buffer[this.nodenum_buffer] = 1; //起点
                }
                else {
                  this.indexnode_buffer[this.nodenum_buffer] = 2; //终点
                }

                this.nodenum_buffer = this.nodenum_buffer + 1;
              }
            }
            else alert("缓冲区需要建立自路径之上!");
          }
          else {
            alert("请勿点击空白区域！");
          }
        }
        else alert('请选择构造模式!');


      },
      exportmap: function () {//导出map文件

        var temp_length = this.pathstart.length;
        var nodename_real = [];
        var x_real = [];
        var y_real = [];
        var index_real = [];
        // 将现阶段的线段最小划分处理
        for(var i = 0 ; i < temp_length; ++i){
          if(this.y[this.pathstart[i]-1] == this.y[this.pathend[i]-1] && this.indexpath[i] == 1){
            //横线则找竖线在其范围内且被该竖线穿过

            for(var j = 0; j < temp_length; ++j){

              if(this.x[this.pathstart[j]-1] == this.x[this.pathend[j]-1] && this.indexpath[j] == 1
                && ((this.x[this.pathstart[j]-1] > this.x[this.pathstart[i]-1] && this.x[this.pathstart[j]-1] < this.x[this.pathend[i]-1])
                || (this.x[this.pathstart[j]-1] < this.x[this.pathstart[i]-1] && this.x[this.pathstart[j]-1] > this.x[this.pathend[i]-1]))
                && ((this.y[this.pathstart[i]-1] > this.y[this.pathstart[j]-1] && this.y[this.pathstart[i]-1] < this.y[this.pathend[j]-1])
                || (this.y[this.pathstart[i]-1] < this.y[this.pathstart[j]-1] && this.y[this.pathstart[i]-1] > this.y[this.pathend[j]-1]))){

                this.x[this.nodenum] = this.x[this.pathstart[j]-1];
                this.y[this.nodenum] = this.y[this.pathstart[i]-1];

                this.indexnode[this.nodenum] = 2;
                this.nodename[this.nodenum] = this.nodenum+1;
                ++this.nodenum;

                this.pathstart[this.pathstart.length] = this.pathstart[i];
                this.pathend[this.pathend.length] = this.nodenum;
                if(this.x[this.pathstart[i]-1] > this.x[this.pathstart[j]-1]){
                  this.pathdis[this.pathdis.length] = this.x[this.pathstart[i]-1] - this.x[this.pathstart[j]-1];
                }
                else{
                  this.pathdis[this.pathdis.length] = this.x[this.pathstart[j]-1] - this.x[this.pathstart[i]-1];
                }
                this.indexpath[this.indexpath.length] = 2;
                this.pathstart[this.pathstart.length] = this.nodenum;
                this.pathend[this.pathend.length] = this.pathend[i];
                if(this.x[this.pathstart[j]-1] > this.x[this.pathend[i]-1]){
                  this.pathdis[this.pathdis.length] = this.x[this.pathstart[j]-1] - this.x[this.pathend[i]-1];
                }
                else{
                  this.pathdis[this.pathdis.length] = this.x[this.pathend[i]-1] - this.x[this.pathstart[j]-1];
                }
                this.indexpath[this.indexpath.length] = 2;
                this.pathstart[this.pathstart.length] = this.pathstart[j];
                this.pathend[this.pathend.length] = this.nodenum;
                if(this.y[this.pathstart[j]-1] > this.y[this.pathstart[i]-1]){
                  this.pathdis[this.pathdis.length] = this.y[this.pathstart[j]-1] - this.y[this.pathstart[i]-1];
                }
                else {
                  this.pathdis[this.pathdis.length] = this.y[this.pathstart[i]-1] -  this.y[this.pathstart[j]-1];
                }
                this.indexpath[this.indexpath.length] = 2;
                this.pathstart[this.pathstart.length] = this.nodenum;
                this.pathend[this.pathend.length] = this.pathend[j];
                if(this.y[this.pathend[j]-1] > this.y[this.pathstart[i]-1]){
                  this.pathdis[this.pathdis.length] = this.y[this.pathend[j]-1] - this.y[this.pathstart[i]-1];
                }
                else {
                  this.pathdis[this.pathdis.length] = this.y[this.pathstart[i]-1] -  this.y[this.pathend[j]-1];
                }
                this.indexpath[this.indexpath.length] = 2;

                for(var k = 0; k < this.x.length-1 ; ++k){

                  if(this.indexnode[k] == 2 ){
                    if(this.x[k] == this.x[this.pathstart[j]-1]
                      && ((this.y[k] > this.y[this.pathstart[j]-1] && this.y[k] < this.y[this.pathend[j]-1])
                      || this.y[k] < this.y[this.pathstart[j]-1] && this.y[k] > this.y[this.pathend[j]-1])){

                      this.pathstart[this.pathstart.length] = this.nodenum;
                      this.pathend[this.pathend.length] = this.nodename[k];
                      if(this.y[k] > this.y[this.pathstart[i]-1]){
                        this.pathdis[this.pathdis.length] = this.y[k] - this.y[this.pathstart[i]-1];
                      }
                      else {
                        this.pathdis[this.pathdis.length] = this.y[this.pathstart[i]-1] -  this.y[k];
                      }
                      this.indexpath[this.indexpath.length] = 3;
                    }
                    if(this.y[k] == this.y[this.pathstart[i]-1]
                      && ((this.x[k] > this.x[this.pathstart[i]-1] && this.x[k] < this.x[this.pathend[i]-1])
                      || this.x[k] < this.x[this.pathstart[i]-1] && this.x[k] > this.x[this.pathend[i]-1])){

                      this.pathstart[this.pathstart.length] = this.nodenum;
                      this.pathend[this.pathend.length] = this.nodename[k];
                      if(this.x[k] > this.x[this.pathstart[j]-1]){
                        this.pathdis[this.pathdis.length] = this.x[k] - this.x[this.pathstart[j]-1];
                      }
                      else{
                        this.pathdis[this.pathdis.length] = this.x[this.pathstart[j]-1] -  this.x[k];
                      }
                      this.indexpath[this.indexpath.length] = 3;
                    }
                  }
                }



              }
            }
          }
        }
        //线段与端点去重
        this.Deduplication();
        for (var i = 0; i < this.indexnode.length; i++) {
          if (this.indexnode[i] != 0)
            this.nodenum_real++;
        }
        for(var i = 0,j = 0 ; i < this.nodenum_real;){
          if(this.indexnode[j] == 0){
            j++;
          }
          else{
            if(i == j){
              i++;
              j++;
            }
            else{
              for(var k = 0 ; k < this.pathstart.length; ++k){

                if(this.pathstart[k] == this.nodename[j]){
                  this.pathstart[k] = i+1;
                }

                if(this.pathend[k] == this.nodename[j]){
                  this.pathend[k] = i+1;
                }

              }

              this.nodename[j] = i+1;
              i++;
              j++;
            }
          }
        }
        for(var i = 0,j = 0 ; j < this.nodename.length ; ){
            if (this.indexnode[j] == 0){
              ++j;
              continue;
            }
            else{
              nodename_real[i] = this.nodename[j];
              index_real[i] = this.indexnode[j];
              x_real[i] = this.x[j];
              y_real[i] = this.y[j];
              ++i;
              ++j;
            }

        }
        this.nodename = nodename_real;
        this.x = x_real;
        this.y = y_real;
        this.indexnode = index_real;
        var arrpathstart = [];
        for (var i = 0; i < this.pathstart.length; i++) {
          var jsonobj1 = {};
          jsonobj1["pathstart"] = this.pathstart[i];
          arrpathstart[i] = jsonobj1;
        }
        var arrpathend = [];
        for (var i = 0; i < this.pathend.length; i++) {
          var jsonobj2 = {};
          jsonobj2["pathend"] = this.pathend[i];
          arrpathend[i] = jsonobj2;
        }

        var arrpathdis = [];
        for (var i = 0; i < this.pathdis.length; i++) {
          var jsonobj3 = {};
          jsonobj3["distance"] = this.pathdis[i];
          arrpathdis[i] = jsonobj3;
        }

        var arrindexpath = [];
        for (var i = 0; i < this.indexpath.length; i++) {
          var jsonobj7 = {};
          jsonobj7["indexpath"] = this.indexpath[i];
          arrindexpath[i] = jsonobj7;
        }

        var arrnodename = [];
        for (var i = 0; i < this.nodename.length; i++) {
          var jsonobj4 = {};
          jsonobj4["nodename"] = this.nodename[i];
          arrnodename[i] = jsonobj4;
        }

        var arrx = [];
        for (var i = 0; i < this.x.length; i++) {
          var jsonobj5 = {};
          jsonobj5["x"] = this.x[i];
          arrx[i] = jsonobj5;
        }

        var arry = [];
        for (var i = 0; i < this.y.length; i++) {
          var jsonobj6 = {};
          jsonobj6["y"] = this.y[i];
          arry[i] = jsonobj6;
        }

        var arrindexnode = [];
        for (var i = 0; i < this.indexnode.length; i++) {
          var jsonobj8 = {};
          jsonobj8["indexnode"] = this.indexnode[i];
          arrindexnode[i] = jsonobj8;
        }

        var arrnodenum = [];
        var jsonobj9 = {};
        jsonobj9["nodenum"] = this.nodenum_real;
        arrnodenum[0] = jsonobj9;

        var arrv = [];
        var jsonobj10 = {};
        jsonobj10["v"] = this.v;
        arrv[0] = jsonobj10;

        var arrminlength = [];
        var jsonobj0 = {};
        jsonobj0["minlength"] = this.minlength;
        arrminlength[0] = jsonobj0;


        //buffer数据的传出
        var arrtotalbuffer={};
        arrtotalbuffer["total_buffer"]=this.total_buffer;

        var arrxx = {
          "Minlength" : arrminlength,
          "Startorder": arrpathstart,
          "Endorder": arrpathend,
          "Distance": arrpathdis,
          "Pathkind": arrindexpath,
          "Nodeorder": arrnodename,
          "Xpos": arrx,
          "Ypos": arry,
          "Nodekind": arrindexnode,
          "Nodenumclicked": arrnodenum,
          "Velocity": arrv,
          "total_buffer": arrtotalbuffer

        };
        //对VUEX的state操作

        this.MapChange();

        var arr = JSON.stringify(arrxx);

        var file = new File([arr], "FileName.txt", {type: "text/plain;charset=utf-8"});
        saveAs(file);
      },
      importmap: function () {//读取地图文件
        var selectedFile = document.getElementById("files").files[0];//获取读取的File对象
        var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
        reader.readAsText(selectedFile);//读取文件的内容
        reader.onload = (f)=> {
          this.strimport = reader.result;
          this.tagimport = 1;
          this.roadOrbuffer = 1;
          let m=JSON.parse(this.strimport);
          this.total_buffer=m.total_buffer.total_buffer;
          this.pathdis=new Array();
          for(let i=0;i<m.Distance.length;i++){
            this.pathdis[i]=m.Distance[i].distance;
          }
          this.pathstart=new Array();
          for(let i=0;i<m.Startorder.length;i++){
            this.pathstart[i]=m.Startorder[i].pathstart;
          }
          this.pathend=new Array();
          for(let i=0;i<m.Endorder.length;i++){
            this.pathend[i]=m.Endorder[i].pathend;
          }
          this.indexpath=new Array();
          for(let i=0;i<m.Pathkind.length;i++){
            this.indexpath[i]=m.Pathkind[i].indexpath;
          }
          this.nodename=new Array();
          for(let i=0;i<m.Nodeorder.length;i++){
            this.nodename[i]=m.Nodeorder[i].nodename;
          }
          let aaa=new Array();
          for(let i=0;i<m.Xpos.length;i++){
            aaa[i]=m.Xpos[i].x;
          }this.x=aaa;
          this.y=new Array();
          for(let i=0;i<m.Ypos.length;i++){
            this.y[i]=m.Ypos[i].y;
          }
          this.indexnode=new Array();
          for(let i=0;i<m.Nodekind.length;i++){
            this.indexnode[i]=m.Nodekind[i].indexnode;
          }

          for(let i=0;i<m.Nodenumclicked.length;i++){
            this.nodenum=m.Nodenumclicked[i].nodenum;
          }
          for(let i=0;i<m.Velocity.length;i++){
            this.v=m.Velocity[i].v;
          }
          for(let i = 0; i < m.Minlength.length; ++i){
            this.minlength = m.Minlength[i].minlength;
          }
          alert("读取完毕，保存地图即可！");
        };
        this.bffinish = 1;


      },
      Save: function () {
        if(this.bffinish == 0)
          alert("必须构建一个缓冲区");
        else{
          this.nodenum_real = 0;
          var temp_length = this.pathstart.length;
          var nodename_real = [];
          var x_real = [];
          var y_real = [];
          var index_real = [];
          for(var i = 0 ; i < temp_length; ++i){
            if(this.y[this.pathstart[i]-1] == this.y[this.pathend[i]-1] && this.indexpath[i] == 1){
              //横线则找竖线在其范围内且被该竖线穿过

              for(var j = 0; j < temp_length; ++j){

                if(this.x[this.pathstart[j]-1] == this.x[this.pathend[j]-1] && this.indexpath[j] == 1
                  && ((this.x[this.pathstart[j]-1] > this.x[this.pathstart[i]-1] && this.x[this.pathstart[j]-1] < this.x[this.pathend[i]-1])
                  || (this.x[this.pathstart[j]-1] < this.x[this.pathstart[i]-1] && this.x[this.pathstart[j]-1] > this.x[this.pathend[i]-1]))
                  && ((this.y[this.pathstart[i]-1] > this.y[this.pathstart[j]-1] && this.y[this.pathstart[i]-1] < this.y[this.pathend[j]-1])
                  || (this.y[this.pathstart[i]-1] < this.y[this.pathstart[j]-1] && this.y[this.pathstart[i]-1] > this.y[this.pathend[j]-1]))){

                  this.x[this.nodenum] = this.x[this.pathstart[j]-1];
                  this.y[this.nodenum] = this.y[this.pathstart[i]-1];

                  this.indexnode[this.nodenum] = 2;
                  this.nodename[this.nodenum] = this.nodenum+1;
                  ++this.nodenum;

                  this.pathstart[this.pathstart.length] = this.pathstart[i];
                  this.pathend[this.pathend.length] = this.nodenum;
                  if(this.x[this.pathstart[i]-1] > this.x[this.pathstart[j]-1]){
                    this.pathdis[this.pathdis.length] = this.x[this.pathstart[i]-1] - this.x[this.pathstart[j]-1];
                  }
                  else{
                    this.pathdis[this.pathdis.length] = this.x[this.pathstart[j]-1] - this.x[this.pathstart[i]-1];
                  }
                  this.indexpath[this.indexpath.length] = 2;
                  this.pathstart[this.pathstart.length] = this.nodenum;
                  this.pathend[this.pathend.length] = this.pathend[i];
                  if(this.x[this.pathstart[j]-1] > this.x[this.pathend[i]-1]){
                    this.pathdis[this.pathdis.length] = this.x[this.pathstart[j]-1] - this.x[this.pathend[i]-1];
                  }
                  else{
                    this.pathdis[this.pathdis.length] = this.x[this.pathend[i]-1] - this.x[this.pathstart[j]-1];
                  }
                  this.indexpath[this.indexpath.length] = 2;
                  this.pathstart[this.pathstart.length] = this.pathstart[j];
                  this.pathend[this.pathend.length] = this.nodenum;
                  if(this.y[this.pathstart[j]-1] > this.y[this.pathstart[i]-1]){
                    this.pathdis[this.pathdis.length] = this.y[this.pathstart[j]-1] - this.y[this.pathstart[i]-1];
                  }
                  else {
                    this.pathdis[this.pathdis.length] = this.y[this.pathstart[i]-1] -  this.y[this.pathstart[j]-1];
                  }
                  this.indexpath[this.indexpath.length] = 2;
                  this.pathstart[this.pathstart.length] = this.nodenum;
                  this.pathend[this.pathend.length] = this.pathend[j];
                  if(this.y[this.pathend[j]-1] > this.y[this.pathstart[i]-1]){
                    this.pathdis[this.pathdis.length] = this.y[this.pathend[j]-1] - this.y[this.pathstart[i]-1];
                  }
                  else {
                    this.pathdis[this.pathdis.length] = this.y[this.pathstart[i]-1] -  this.y[this.pathend[j]-1];
                  }
                  this.indexpath[this.indexpath.length] = 2;

                  for(var k = 0; k < this.x.length-1 ; ++k){

                    if(this.indexnode[k] == 2 ){
                      if(this.x[k] == this.x[this.pathstart[j]-1]
                        && ((this.y[k] > this.y[this.pathstart[j]-1] && this.y[k] < this.y[this.pathend[j]-1])
                        || this.y[k] < this.y[this.pathstart[j]-1] && this.y[k] > this.y[this.pathend[j]-1])){

                        this.pathstart[this.pathstart.length] = this.nodenum;
                        this.pathend[this.pathend.length] = this.nodename[k];
                        if(this.y[k] > this.y[this.pathstart[i]-1]){
                          this.pathdis[this.pathdis.length] = this.y[k] - this.y[this.pathstart[i]-1];
                        }
                        else {
                          this.pathdis[this.pathdis.length] = this.y[this.pathstart[i]-1] -  this.y[k];
                        }
                        this.indexpath[this.indexpath.length] = 3;
                      }
                      if(this.y[k] == this.y[this.pathstart[i]-1]
                        && ((this.x[k] > this.x[this.pathstart[i]-1] && this.x[k] < this.x[this.pathend[i]-1])
                        || this.x[k] < this.x[this.pathstart[i]-1] && this.x[k] > this.x[this.pathend[i]-1])){

                        this.pathstart[this.pathstart.length] = this.nodenum;
                        this.pathend[this.pathend.length] = this.nodename[k];
                        if(this.x[k] > this.x[this.pathstart[j]-1]){
                          this.pathdis[this.pathdis.length] = this.x[k] - this.x[this.pathstart[j]-1];
                        }
                        else{
                          this.pathdis[this.pathdis.length] = this.x[this.pathstart[j]-1] -  this.x[k];
                        }
                        this.indexpath[this.indexpath.length] = 3;
                      }
                    }
                  }



                }
              }
            }
          }
          this.Deduplication();
          for (var i = 0; i < this.indexnode.length; i++) {
            if (this.indexnode[i] != 0)
              this.nodenum_real++;

          }

          for(var i = 0,j = 0 ; i < this.nodenum_real;){
            if(this.indexnode[j] == 0){
              j++;
            }
            else{
              if(i == j){
                i++;
                j++;
              }
              else{
                for(var k = 0 ; k < this.pathstart.length; ++k){
                  if(this.pathstart[k] == this.nodename[j]){
                    this.pathstart[k] = i+1;
                  }

                  if(this.pathend[k] == this.nodename[j]){
                    this.pathend[k] = i+1;
                  }

                }

                this.nodename[j] = i+1;
                i++;
                j++;
              }
            }
          }
          for(var i = 0,j = 0 ; j < this.nodename.length ; ){
            if (this.indexnode[j] == 0){
              ++j;
              continue;
            }
            else{
              nodename_real[i] = this.nodename[j];
              index_real[i] = this.indexnode[j];
              x_real[i] = this.x[j];
              y_real[i] = this.y[j];
              ++i;
              ++j;
            }

          }
          this.nodename = nodename_real;
          this.x = x_real;
          this.y = y_real;
          this.indexnode = index_real;
          this.MapChange();
          alert(this.mapwidth);
          this.$store.dispatch('MapwChange',this.mapwidth);
          this.$store.dispatch('MaphChange',this.mapheight);
          this.$store.dispatch('MinlChange',this.minlength);
          this.$store.dispatch('VChange',this.v);
          this.$router.push({path: '/Job'})
        }

      },
      HorizonOrvertical:function(start,end){//判断是横线还是竖线，如果是横线则返回0，是竖线则返回1
        if(this.x[start-1] == this.x[end-1])
          return 1;
        else return 0;
      },
      PosBig:function(start,end,kind){//判断起点终点的坐标大小，如果起点大于终点则返回1，否则返回0；
        if(kind == 1){
          if(this.y[start-1] < this.y[end-1]){
            return 0;
          }
          return 1;
        }
        else{
          if(this.x[start-1] < this.x[end-1]){
            return 0;
          }
          return 1;

        }
      },
      Deduplication:function(){
        var vertical = -1;
        var big = -1;
        for(var i = 0 ; i < this.pathstart.length ; ++i){
          if(this.indexpath[i] != 0){
            if(this.indexnode[this.pathstart[i]-1] == 2){ // 如果该条直线的起点是交点

              vertical = this.HorizonOrvertical(this.pathstart[i],this.pathend[i]);
              big = this.PosBig(this.pathstart[i],this.pathend[i],vertical);
              for(var j = 0 ; j < this.pathstart.length ; ++j){
                if(j == i || this.indexpath[j] == 0){//跳过本身
                  continue;
                }
                else {//寻找是否有同侧且同端点的边
                  if(this.pathend[i] == this.pathstart[j] ){ //如果该点是起点

                    if(big == 1){//如果起点比终点坐标大

                      if(this.PosBig(this.pathend[j],this.pathstart[i],vertical)){
                        this.indexpath[j] = 0;
                      }
                    }
                    else{//如果起点比终点坐标小

                      if(this.PosBig(this.pathstart[i],this.pathend[j],vertical)){
                        this.indexpath[j] = 0;
                      }
                    }
                  }
                  else if(this.pathend[i] == this.pathend[j]){//如果该点是终点

                    if(big == 1){//如果起点比终点坐标大

                      if(this.PosBig(this.pathstart[j],this.pathstart[i],vertical)){
                        this.indexpath[j] = 0;
                      }
                    }
                    else{//如果起点比终点坐标小

                      if(this.PosBig(this.pathstart[i],this.pathstart[j],vertical)){
                        this.indexpath[j] = 0;
                      }
                    }
                  }
                }
              }
            }
            if(this.indexnode[this.pathend[i]-1] == 2){//如果该条直线的终点是交点
              vertical = this.HorizonOrvertical(this.pathstart[i],this.pathend[i]);
              big = this.PosBig(this.pathend[i],this.pathstart[i],vertical);
              for(var j = 0 ; j < this.pathstart.length ; ++j){
                if(j == i || this.indexpath[j] == 0){//跳过本身
                  continue;
                }
                else {//寻找是否有同侧且同端点的边
                  if(this.pathstart[i] == this.pathstart[j] ){ //如果该点是起点
                    if(big == 1){//如果起点比交点坐标大
                      if(this.PosBig(this.pathend[j],this.pathend[i],vertical)){
                        this.indexpath[j] = 0;
                      }
                    }
                    else{//如果起点比交点坐标小
                      if(this.PosBig(this.pathend[i],this.pathend[j],vertical)){
                        this.indexpath[j] = 0;
                      }
                    }
                  }
                  else if(this.pathstart[i] == this.pathend[j]){//如果该点是终点
                    if(big == 1){//如果起点比终点坐标大
                      if(this.PosBig(this.pathstart[j],this.pathend[i],vertical)){
                        this.indexpath[j] = 0;
                      }
                    }
                    else{//如果起点比终点坐标小
                      if(this.PosBig(this.pathend[i],this.pathstart[j],vertical)){
                        this.indexpath[j] = 0;
                      }
                    }
                  }
                }
              }
            }
          }

        }
      },
      Lineinclude:function(posx,posy){
        //用于点击一个点后的重新最小划分
        for(var i = 0 ; i < this.pathstart.length; ++i){
          if(this.indexpath[i] != 0 &&
            posx == this.x[this.pathstart[i]-1] &&
            ((posy <= this.y[(this.pathstart[i]-1)] && posy >= this.y[(this.pathend[i]-1)])
            || (posy >= this.y[(this.pathstart[i]-1)] && posy <= this.y[(this.pathend[i]-1)]))){
            return 1;
          }

          else if(this.indexpath[i] != 0 &&
            posy == this.y[(this.pathstart[i]-1)] &&
            ((posx <= this.x[(this.pathstart[i]-1)] && posx >= this.x[(this.pathend[i]-1)])
            || (posx >= this.x[(this.pathstart[i]-1)] && posy <= this.x[(this.pathend[i]-1)]))){
            return 1;
          }


        }

        return 0;
      },
      abs:function(a) {
        return a>0? a:-a;
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  @import '../css/bootstrap.min.css';
</style>
