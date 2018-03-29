<template>
<div>
	<div class="navbar navbar-inverse" role="navigation">
		<div class="container-fluid">
			<div class="navbar-header">
				<button class="navbar-toggle collapsed" data-toggle="collapsed" data-target=".navbar-collapse">
					<span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span>
				</button>
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
							<td><input id="mapwidth" v-model="mapwidth" type="text" style="width: 100px;" placeholder="地图实际长度"></td>
							<td><p>m</p></td>
						</tr>
						<tr>
							<td><p>HIGHT:</p></td>
							<td><input id="maphight" v-model="mapheight" type="text" style="width: 100px;" placeholder="地图实际宽度"></td>
							<td><p>m</p></td>
						</tr>
						<tr>
							<td><p>精度:</p></td>
							<td><input id="minlength" v-model="minlength" type="text" style="width: 100px;" placeholder="网格每格几米"></td>
							<td><p>m</p></td>
						</tr>
						<tr>
							<td><p>速度:</p></td>
							<td><input id="v" v-model="v" type="text" style="width: 100px;" placeholder="AGV实际速度"></td>
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
//重新生成网格时画好的图没有擦去 305行和388行ENDX ENDY需要改，改成画布的范围
<script>
import {saveAs} from '../js/FileSaver.js'
import {mapGetters, mapActions} from 'vuex'
export default {
  name: 'Agv',
  data () {
    return {
      mapwidth:null,  //地图总宽度
	    mapheight:null,  //地图总高度
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

      tag:0, //变数的计数器
      tag_buffer:0,

      strimport:null,
	    tagimport:0,
	    flag:0,//用来判断画布是否已经初始化

      roadOrbuffer:0  // 1是路线建立 2 是缓冲区建立

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
      this.$store.dispatch('MapwChange', this.mapwidth);
      this.$store.dispatch('MaphChange', this.mapheight);
      this.$store.dispatch('MinlChange', this.minlength);
      this.$store.dispatch('VChange', this.v);
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

    },
    roadmake:function(){
      this.roadOrbuffer = 1;
      alert('路径设定');
    },
    buffermake:function(){
      this.roadOrbuffer = 2;
      alert('缓冲区设定');
    },
    init: function () {    //地图初始化

      var canvas2 = document.getElementById("myCanvas2");
      var ctx2 = canvas2.getContext("2d");
      var ctx=myCanvas.getContext("2d");
      this.roadOrbuffer = 0;
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

        this.tag = 0;
        this.tag_buffer = 0;
        this.strimport = null;
        this.tagimport = 0;

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
            if (numxx == this.x[i] && numyy == this.y[i] && this.indexnode[i] == 1) {
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
                && this.indexnode[i] == 1) {
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
              if (endy == this.y[i] && endx == this.x[i] && this.indexnode[i] == 1) {
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
                && this.indexnode[i] == 1) {
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
              if (endx == this.x[i] && endy == this.y[i] && this.indexnode[i] == 1) {
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


          for (var i = 0; i < this.nodename_buffer.length; i++) {
            //如果这个点已经出现在储存的点集中，再次点击就删除
            if (numxx == this.x_buffer[i] && numyy == this.y_buffer[i] && this.indexnode_buffer[i] == 1) {
              tag5 = 1;
              thisi = i;
              thisnodename = this.nodename_buffer[i];
            } else {
            }
          }

          if (tag5 == 1) { //删除节点
            var tt1 = 0; //用于记录该点是否是起点
            var tt2 = 0; // 用于记录该店是否是终点
            for (var i = 0; i < this.pathstart_buffer.length; i++) {
              if (thisnodename == this.pathstart_buffer[i] && this.indexpath_buffer[i] == 1) {
                tt1 = 1;
              }
            }
            for (var i = 0; i < this.pathend_buffer.length; i++) {
              if (thisnodename == this.pathend_buffer[i] && this.indexpath_buffer[i] == 1) {
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
              this.indexnode_buffer[thisi] = 0;
            }
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
            ctx.fillText(this.nodenum_buffer + 1, numxxx, numyyy);
            this.x_buffer[this.nodenum_buffer] = numxx;
            this.y_buffer[this.nodenum_buffer] = numyy;
            this.nodename_buffer[this.nodenum_buffer] = this.nodenum_buffer + 1;
            this.indexnode_buffer[this.nodenum_buffer] = 1;
            this.nodenum_buffer = this.nodenum_buffer + 1;
          }
        }
        else if (xtag == 1 && ytag != 1) {
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
            for (var i = 0; i < this.y_buffer.length; i++) {
              if (starty == this.y_buffer[i] && startx == this.x_buffer[i]
                && this.indexnode_buffer[i] == 1) {
                startname1 = this.nodename_buffer[i];
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
            for (var i = 0; i < this.y_buffer.length; i++) {
              if (endy == this.y_buffer[i] && endx == this.x_buffer[i] && this.indexnode_buffer[i] == 1) {
                endname1 = this.nodename_buffer[i];
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
            for (var i = 0; i < this.indexpath_buffer.length; i++) {  //点击在线上删除线
              if (startname1 == this.pathstart_buffer[i]
                && endname1 == this.pathend_buffer[i] && this.indexpath_buffer[i] == 1) {
                this.indexpath_buffer[i] = 0;
                disdel1 = this.pathdis_buffer[i] - 10;
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
              ctx.strokeStyle = '#5CACEE'; // 设置线的颜色

              ctx.beginPath();
              ctx.moveTo(startx, starty + 6);
              ctx.lineTo(endx, endy - 6);
              ctx.stroke();
              ctx.closePath();

              this.pathstart_buffer[this.tag_buffer] = startname1;
              this.pathend_buffer[this.tag_buffer] = endname1;
              this.pathdis_buffer[this.tag_buffer] = endy - starty;
              this.indexpath_buffer[this.tag_buffer] = 1;
              this.tag_buffer++;
            }/////////////////////
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
            for (var i = 0; i < this.y_buffer.length; i++) {
              if (startx == this.x_buffer[i] && starty == this.y_buffer[i]
                && this.indexnode_buffer[i] == 1) {
                startname2 = this.nodename_buffer[i];
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
            for (var i = 0; i < this.y_buffer.length; i++) {
              if (endx == this.x_buffer[i] && endy == this.y_buffer[i] && this.indexnode_buffer[i] == 1) {
                endname2 = this.nodename_buffer[i];
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
            for (var i = 0; i < this.indexpath_buffer.length; i++) {
              if (startname2 == this.pathstart_buffer[i]
                && endname2 == this.pathend_buffer[i] && this.indexpath_buffer[i] == 1) {
                this.indexpath_buffer[i] = 0;
                disdel2 = this.pathdis_buffer[i] - 10;
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
              ctx.strokeStyle = '#5CACEE'; // 设置线的颜色

              ctx.beginPath();
              ctx.moveTo(startx + 6, starty);
              ctx.lineTo(endx - 6, endy);
              ctx.stroke();
              ctx.closePath();

              this.pathstart_buffer[this.tag_buffer] = startname2;
              this.pathend_buffer[this.tag_buffer] = endname2;
              this.pathdis_buffer[this.tag_buffer] = endx - startx;
              this.indexpath_buffer[this.tag_buffer] = 1;
              this.tag_buffer++;
            }
          } else {
            alert("请勿点击无效区域！");
          }

        } else {
          alert("请勿点击空白区域！");
        }
      }
      else alert('请选择构造模式!');


    },
    exportmap: function () {//导出map文件

      var finallength = this.pathstart.length;
      //分离产生的非交点的indexnode为3 交点为2  新产生的线indexpath 为2
      //将超过1格的边分离
      for (var i = 0; i < finallength; i++) {

        if (this.indexpath[i] == 1) {
          var n = 1;
          var flag_devide = 0;
          var next; //记录当前循环中线段的终点
          var last = this.pathstart[i]; //记录上层循环中线段的终点

          while (this.pathdis[i] > n * this.length) {
            flag_devide = 1;
            var flag_insert = 1;
            var k; //若要新加入的点已经存在于删除点后的存储列表中则 获得该点序号

            if (this.x[this.pathstart[i] - 1] == this.x[this.pathend[i] - 1]) { //竖线的情况，查看该分点是否已被存（交点）
              for (k = 0; k < this.x.length; ++k) {
                if (this.indexnode[k] == 3 && (this.y[this.pathstart[i] - 1] + n * this.length) == this.y[k] && this.x[k] == this.x[this.pathstart[i] - 1]) {
                  flag_insert = 0;
                  next = this.nodename[k];
                  this.indexnode[k] = 2;
                  break;
                }

              }

              if (k == this.x.length) {

                this.x[k] = this.x[this.pathstart[i] - 1];
                this.y[k] = this.y[this.pathstart[i] - 1] + n * this.length;
                this.indexnode[k] = 3;
              }
            }
            else if (this.y[this.pathstart[i] - 1] == this.y[this.pathend[i] - 1]) {  //横线的情况
              for (k = 0; k < this.y.length; ++k) {

                if (this.indexnode[k] == 1 && (this.x[this.pathstart[i] - 1] + n * this.length) == this.x[k] && this.y[k] == this.y[this.pathstart[i] - 1]) {
                  flag_insert = 0;
                  next = this.nodename[k];
                  this.indexnode[k] = 2;
                  break;
                }


              }
              if (k == this.y.length) {
                this.x[k] = this.x[this.pathstart[i] - 1] + n * this.length;
                this.y[k] = this.y[this.pathstart[i] - 1];
                this.indexnode[k] = 3;
              }
            }

            if (flag_insert == 1) {
              this.nodename[this.nodenum] = this.nodenum + 1;
              ++this.nodenum;
              next = this.nodenum;
            }


            this.pathstart[this.pathstart.length] = last;
            this.pathend[this.pathend.length] = next;
            this.pathdis[this.pathdis.length] = this.length;
            this.indexpath[this.indexpath.length] = 2;

            n++;
            last = next;
          }

          if (flag_devide) {
            this.pathstart[this.pathstart.length] = last;
            this.pathend[this.pathend.length] = this.pathend[i];
            this.pathdis[this.pathdis.length] = this.length;
            this.indexpath[this.indexpath.length] = 2;
          }
        }


      }

      var arrpathstart = [];
      for (var i = 0; i < this.pathstart.length; i++) {
        var jsonobj1 = {};
        jsonobj1["this.pathstart"] = this.pathstart[i];
        arrpathstart[i] = jsonobj1;
      }
      var arrpathend = [];
      for (var i = 0; i < this.pathend.length; i++) {
        var jsonobj2 = {};
        jsonobj2["this.pathend"] = this.pathend[i];
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
        jsonobj7["this.indexpath"] = this.indexpath[i];
        arrindexpath[i] = jsonobj7;
      }

      var arrnodename = [];
      for (var i = 0; i < this.nodename.length; i++) {
        var jsonobj4 = {};
        jsonobj4["this.nodename"] = this.nodename[i];
        arrnodename[i] = jsonobj4;
      }

      var arrx = [];
      for (var i = 0; i < this.x.length; i++) {
        var jsonobj5 = {};
        jsonobj5["this.x"] = this.x[i];
        arrx[i] = jsonobj5;
      }

      var arry = [];
      for (var i = 0; i < this.y.length; i++) {
        var jsonobj6 = {};
        jsonobj6["this.y"] = this.y[i];
        arry[i] = jsonobj6;
      }

      var arrindexnode = [];
      for (var i = 0; i < this.indexnode.length; i++) {
        if (this.indexnode[i] == 1)
          this.nodenum_real++;
        var jsonobj8 = {};
        jsonobj8["this.indexnode"] = this.indexnode[i];
        arrindexnode[i] = jsonobj8;
      }

      var arrnodenum = [];
      var jsonobj9 = {};
      jsonobj9["this.nodenum"] = this.nodenum_real;
      arrnodenum[0] = jsonobj9;


      //buffer数据的传出
      var arrpathstart_buffer = [];
      for (var i = 0; i < this.pathstart_buffer.length; i++) {
        var jsonobj1_buffer = {};
        jsonobj1_buffer["this.pathstart_buffer"] = this.pathstart_buffer[i];
        arrpathstart_buffer[i] = jsonobj1_buffer;
      }
      var arrpathend_buffer = [];
      for (var i = 0; i < this.pathend_buffer.length; i++) {
        var jsonobj2_buffer = {};
        jsonobj2_buffer["this.pathend_buffer"] = this.pathend_buffer[i];
        arrpathend_buffer[i] = jsonobj2_buffer;
      }

      var arrpathdis_buffer = [];
      for (var i = 0; i < this.pathdis_buffer.length; i++) {
        var jsonobj3_buffer = {};
        jsonobj3_buffer["this.distance_buffer"] = this.pathdis_buffer[i];
        arrpathdis_buffer[i] = jsonobj3_buffer;
      }

      var arrindexpath_buffer = [];
      for (var i = 0; i < this.indexpath_buffer.length; i++) {
        var jsonobj7_buffer = {};
        jsonobj7_buffer["this.indexpath_buffer"] = this.indexpath_buffer[i];
        arrindexpath_buffer[i] = jsonobj7_buffer;
      }

      var arrnodename_buffer = [];
      for (var i = 0; i < this.nodename_buffer.length; i++) {
        var jsonobj4_buffer = {};
        jsonobj4_buffer["this.nodename_buffer"] = this.nodename_buffer[i];
        arrnodename_buffer[i] = jsonobj4_buffer;
      }

      var arrx_buffer = [];
      for (var i = 0; i < this.x_buffer.length; i++) {
        var jsonobj5_buffer = {};
        jsonobj5_buffer["this.x_buffer"] = this.x_buffer[i];
        arrx_buffer[i] = jsonobj5_buffer;
      }

      var arry_buffer = [];
      for (var i = 0; i < this.y_buffer.length; i++) {
        var jsonobj6_buffer = {};
        jsonobj6_buffer["this.y_buffer"] = this.y_buffer[i];
        arry_buffer[i] = jsonobj6_buffer;
      }

      var arrindexnode_buffer = [];
      for (var i = 0; i < this.indexnode_buffer.length; i++) {
        if (this.indexnode_buffer[i] == 1)
          this.nodenum_realbuffer++;
        var jsonobj8_buffer = {};
        jsonobj8_buffer["this.indexnode"] = this.indexnode_buffer[i];
        arrindexnode_buffer[i] = jsonobj8_buffer;
      }

      var arrnodenum_buffer = [];
      var jsonobj9_buffer = {};
      jsonobj9_buffer["this.nodenum_buffer"] = this.nodenum_realbuffer;
      arrnodenum_buffer[0] = jsonobj9_buffer;
      //console.dir(arrpathstart);
      //console.dir(arrpathend);
      //console.dir(arrpathdis);
      //alert(arr1);
      var arrxx = {
        "Startorder": arrpathstart,
        "Endorder": arrpathend,
        "Distance": arrpathdis,
        "Pathkind": arrindexpath,
        "Nodeorder": arrnodename,
        "Xpos": arrx,
        "Ypos": arry,
        "Nodekind": arrindexnode,
        "Nodenumclicked": arrnodenum,
        "Startorder_buffer": arrpathstart_buffer,
        "Endorder_buffer": arrpathend_buffer,
        "Distance_buffer": arrpathdis_buffer,
        "Pathkind_buffer": arrindexpath_buffer,
        "Nodeorder_buffer": arrnodename_buffer,
        "Xpos_buffer": arrx_buffer,
        "Ypos_buffer": arry_buffer,
        "Nodekind_buffer": arrindexnode_buffer,
        "Nodenumclicked_buffer": arrnodenum_buffer
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
      reader.onload = function (f) {
        console.log(this.result);
        this.strimport = this.result;
        this.tagimport = 1;
        alert("读取完毕，保存地图即可！");
      };


    },
    Save: function () {
      var finallength = this.pathstart.length;
      //分离产生的非交点的indexnode为3 交点为2  新产生的线indexpath 为2
      //将超过1格的边分离
      for (var i = 0; i < finallength; i++) {

        if (this.indexpath[i] == 1) {
          var n = 1;
          var flag_devide = 0;
          var next; //记录当前循环中线段的终点
          var last = this.pathstart[i]; //记录上层循环中线段的终点

          while (this.pathdis[i] > n * this.length) {
            flag_devide = 1;
            var flag_insert = 1;
            var k; //若要新加入的点已经存在于删除点后的存储列表中则 获得该点序号

            if (this.x[this.pathstart[i] - 1] == this.x[this.pathend[i] - 1]) { //竖线的情况，查看该分点是否已被存（交点）
              for (k = 0; k < this.x.length; ++k) {
                if (this.indexnode[k] == 3 && (this.y[this.pathstart[i] - 1] + n * this.length) == this.y[k] && this.x[k] == this.x[this.pathstart[i] - 1]) {
                  flag_insert = 0;
                  next = this.nodename[k];
                  this.indexnode[k] = 2;
                  break;
                }

              }

              if (k == this.x.length) {

                this.x[k] = this.x[this.pathstart[i] - 1];
                this.y[k] = this.y[this.pathstart[i] - 1] + n * this.length;
                this.indexnode[k] = 3;
              }
            }
            else if (this.y[this.pathstart[i] - 1] == this.y[this.pathend[i] - 1]) {  //横线的情况
              for (k = 0; k < this.y.length; ++k) {

                if (this.indexnode[k] == 1 && (this.x[this.pathstart[i] - 1] + n * this.length) == this.x[k] && this.y[k] == this.y[this.pathstart[i] - 1]) {
                  flag_insert = 0;
                  next = this.nodename[k];
                  this.indexnode[k] = 2;
                  break;
                }


              }
              if (k == this.y.length) {
                this.x[k] = this.x[this.pathstart[i] - 1] + n * this.length;
                this.y[k] = this.y[this.pathstart[i] - 1];
                this.indexnode[k] = 3;
              }
            }

            if (flag_insert == 1) {
              this.nodename[this.nodenum] = this.nodenum + 1;
              ++this.nodenum;
              next = this.nodenum;
            }


            this.pathstart[this.pathstart.length] = last;
            this.pathend[this.pathend.length] = next;
            this.pathdis[this.pathdis.length] = this.length;
            this.indexpath[this.indexpath.length] = 2;

            n++;
            last = next;
          }

          if (flag_devide) {
            this.pathstart[this.pathstart.length] = last;
            this.pathend[this.pathend.length] = this.pathend[i];
            this.pathdis[this.pathdis.length] = this.length;
            this.indexpath[this.indexpath.length] = 2;
          }
        }


      }
      for (var i = 0; i < this.indexnode.length; i++) {
        if (this.indexnode[i] == 1)
          this.nodenum_real++;
      }
      for (var i = 0; i < this.indexnode_buffer.length; i++) {
        if (this.indexnode_buffer[i] == 1)
          this.nodenum_realbuffer++;
      }
      this.MapChange();
      this.$router.push({path: '/Job'})
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import '../css/bootstrap.min.css'
</style>
