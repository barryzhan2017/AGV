<template>
  <div>

    <div class="nav-crumb">
      <ol class="breadcrumb">
        <li>主页</li>
        <li class="active">添加任务</li>
      </ol>
    </div>


    <div class="col-md-2">
      <div style="position: relative; top: 10px; left: 20px">
        <table id="agvtable" class="table table-striped" style="white-space: nowrap;">
          <tr>
            <td><button id="button2" style="position: absolute;"  @click="addcar" class="btn btn-primary">添加 </button></td>
            <td><input id="agvpos" type="text" v-model="carposition" style="width: 150px;" placeholder="请输入AGV位置编号"></td>
          </tr>
          <tr>
            <label>AGV数量：{{agvnum}}</label>
          </tr>
        </table>



        <table style="display: none" id="cartable" class="table table-striped table-condensed table-hover compact text-center">
          <thead>
          <tr>
            <td style="font-weight: bold;">agv编号</td>
            <td style="font-weight: bold;">agv位置</td>
          </tr>
          </thead>
          <tbody>
          <tr class="table_body">
            <td class="text-left" style="text-align: center"></td>
            <td class="text-left" style="text-align: center"></td>
          </tr>
          </tbody>
        </table>
        <table class="table table-striped" style="white-space: nowrap;">
          <tr>
            <td style="font-weight: bold;">算法选择:</td>
            <td><select id="algorithm">
              <option value="1">LSW-Algorithm-1</option>
              <option value="2">LSW-Algorithm-2</option>
            </select></td>
          </tr>
        </table>
          <table  class="table table-striped" style="white-space: nowrap;">
            <tr>
              <td><button id="button" @click="addjob" class="btn btn-primary">添加</button></td>
              <td><input  type="text" v-model="jobStart" style="width: 150px;" placeholder="请输入任务起点"></td>
            </tr>
            <tr>
              <td></td>
			  <td><input type="text" v-model="jobEnd" style="width: 150px;" placeholder="请输入任务终点"></td>
            </tr>
			<tr>
              <td></td>
			  <td><input type="text" v-model="jobnumber" style="width: 150px;" placeholder="请输入任务次数"></td>
            </tr>
          </table>

        <v-table
            is-horizontal-resize
            style="width:120%"
            :columns="columns"
            :table-data="tableData"
            row-hover-color="#eee"
            row-click-color="#edf7ff"
		></v-table>
		<v-pagination @page-change="pageChange":page-size="pagesize" :total="pagetotal" :layout="['total', 'prev', 'pager', 'next', 'jumper']"></v-pagination>
        <div style="height: 200px;"></div>
        <table class="table table-striped" style="white-space: nowrap;">
          <tr>
            <td><button id="buttonrun" @click="start" class="btn btn-success">启动系统</button></td>
            <td><button class="btn btn-danger">修改地图</button></td>
          </tr>
        </table>
      </div>
      <div id="container" style="position:absolute;left:320px;top:40px;">

      </div>
      <canvas id="Canvas" width="800px" height="400px" style="position: absolute; left:320px; top:40px; z-index: 0;"></canvas>

    </div>

  </div>
</template>
<script>
  import {mapGetters, mapActions} from 'vuex'
  export default{
    name: 'JOB',
    data(){
      return{
        pathflag:0,//变为1时表示系统开始后有新任务添加并传输到后台
		newpath:[],//存储后台传过来的新的小车路径
		index:1,//表格页码
		jobnumber:null,//任务次数
		jobnumberset:[],//任务次数集合
		agvnum:0,//小车数目
        index:1,//表格页码
		    jobnumber:null,//任务次数
		    jobnumberset:[],//任务次数集合
		    agvnum:0,//小车数目
        carposition:null,//小车初始位置
        carsposition:[],//小车初始位置集合
        stage:null,
        layer:null,
        rects:[],//指代小车的矩形集合
        path:[],//小车路径集合，-1代表结束
        jobStart:null,
        jobEnd:null,
        jobStartset:[],
        jobEndset:[],
        jobnum:0,//任务数量
        T:[],//存储小车从上个点开始运行多久，若闲置，则为-1
        flag:[],//后台传新的路径过来时将对应的flag[i]由0变为1
        Isbegin:false,//系统是否已经启动
        num:[],//存储小车运行到路径数组中的第几个点，3->4则记录到3,-1代表还未到达路径的第0个点
		    rectgroup:[],//存储矩形小车和对应小车序号的组
		    pagesize:7,
		    //tableDatas:[],//二维数组存储表格单页元组
		    tableData:[],//存储表格当前页面元组
		    data: [],		//存储表格所有元组
            columns: [
                        {field: 'number', title: '序号', width: 40, titleAlign: 'center', columnAlign: 'center',isResize:true},
                         {field: 'start', title: '起点', width: 40, titleAlign: 'center', columnAlign: 'center',isResize:true},
                        {field: 'end', title: '终点', width: 40, titleAlign: 'center', columnAlign: 'center',isResize:true},
                        {field: 'remain', title: '剩余次数', width: 40, titleAlign: 'center', columnAlign: 'center',isResize:true},
					              {field: 'car', title: '小车', width: 150, titleAlign: 'left', columnAlign: 'left',isResize:true},
                      ]
      }
    },
    computed:{
      ...mapGetters([
        'Mapwidth',
        'Mapheight',
        'V',
        'Minlength',
        'Nodenum_real',
        'X',
        'Y',
        'Nodename', //存有所有点击过的点被点击时的次序（作为第几个被点击的点）
        'Indexnode',
        'Pathend',//终点被点击的序号
		    'Pathstart',//起点被点击的序号
        'Pathdis',//路径长度
        'Indexpath', //路线是否有效的标

        'Nodenum_realbuffer',
        'X_buffer',
        'Y_buffer',
        'Nodename_buffer', //存有所有点击过的点被点击时的次序（作为第几个被点击的点）
        'Indexnode_buffer',
        'Pathend_buffer',//终点被点击的序号
        'Pathstart_buffer',//起点被点击的序号
        'Pathdis_buffer',//路径长度
        'Indexpath_buffer', //路线是否有效的标
        'Total_buffer'
      ]),
	    pagetotal(){ //表格元组总个数
		  return this.data.length
	    },
	    tableDatas(){
		  let currentdata=new Array();
		  for(let j=0;j<this.pagetotal/this.pagesize;j++)
		  	currentdata[j]=new Array();
		  for(let i=0,j=0;i<this.pagetotal;i++){
			  currentdata[j].push(this.data[i]);
				  if((i!=0&&((i+1)%this.pagesize)==0)||i==this.pagetotal-1){
				  	j++;
				  }
			  }

		  return currentdata;
	    }

  },
    mounted:function(){

    var width = window.innerWidth;
    var height = window.innerHeight;
    this.stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    });
    this.layer = new Konva.Layer();

    var canvas = document.getElementById("Canvas");
    var ctx = canvas.getContext("2d");
    for (var i = 0; i < this.Indexnode.length; i++) {
      if(this.Indexnode[i]==0)
        continue;
      if(this.Indexnode[i]==2||this.Indexnode[i]==3)
        break;
      var xx = this.X[i];
      var yy = this.Y[i];
      //开始绘制节点
      ctx.beginPath();
      ctx.arc(xx, yy, 5, 0, Math.PI * 2, true);
      ctx.fillStyle = "#FF4500";
      ctx.fill();
      //设置文字参数
      ctx.font = "30px";
      var numx = this.X[i] - 10;
      var numy = this.Y[i] - 5;
      var numname = this.Nodename[i];
      ctx.fillText(numname, numx, numy);
    }
    for (var i = 0; i < this.Indexpath.length; i++) {
      if(this.Indexpath[i]==0)
        continue;
      if(this.Indexpath[i]==2)
        break;
      var startx = this.X[this.Pathstart[i]-1];
      var starty = this.Y[this.Pathstart[i]-1];
      var endx = this.X[this.Pathend[i]-1];
      var endy = this.Y[this.Pathend[i]-1];
      //设置直线参数
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 4;
      ctx.lineCap = "round"; //设置端点样式:butt(默认),round,square
      ctx.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round
      ctx.strokeStyle = '#000000'; // 设置线的颜色
      //开始绘制直线
      ctx.beginPath();
      ctx.moveTo(startx, starty);
      ctx.lineTo(endx, endy);
      ctx.stroke();
      ctx.closePath();
    }
	for (var i = 0; i < this.Indexnode_buffer.length; i++) {
      if(this.Indexnode_buffer[i]==0)
        continue;
      var xx = this.X_buffer[i];
      var yy = this.Y_buffer[i];
      //开始绘制节点
      ctx.beginPath();
      ctx.arc(xx, yy, 5, 0, Math.PI * 2, true);
      ctx.fillStyle = "#121212";
      ctx.fill();
      //设置文字参数
      ctx.font = "30px";
      var numx = this.X_buffer[i] - 10;
      var numy = this.Y_buffer[i] - 5;
      var numname = this.Nodename_buffer[i];
      ctx.fillText(numname, numx, numy);
    }
	for (var i = 0; i < this.Indexpath_buffer.length; i++) {
      if(this.Indexpath_buffer[i]==0)
        continue;
      var startx = this.X_buffer[this.Pathstart_buffer[i]-1];
      var starty = this.Y_buffer[this.Pathstart_buffer[i]-1];
      var endx = this.X_buffer[this.Pathend_buffer[i]-1];
      var endy = this.Y_buffer[this.Pathend_buffer[i]-1];
      //设置直线参数
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 4;
      ctx.lineCap = "round"; //设置端点样式:butt(默认),round,square
      ctx.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round
      ctx.strokeStyle = '8B0A50'; // 设置线的颜色
      //开始绘制直线
      ctx.beginPath();
      ctx.moveTo(startx, starty);
      ctx.lineTo(endx, endy);
      ctx.stroke();
      ctx.closePath();
    }

  },
  methods:{

    addcar:function(){

      if(this.carposition==null)
        return;
      this.agvnum++;
      this.carsposition[this.agvnum-1]=this.carposition;
	  //this.path=new Array();
	  this.path[this.agvnum-1]=new Array();
	  this.path[this.agvnum-1][0]=this.carposition;
	  var rectnumber = new Konva.Text({
      x: 0,
      y: -20,
      text: this.agvnum,
      fontSize: 30,
      fontFamily: 'Calibri',
      fill: 'brown'
	  });
      var rect = new Konva.Rect({
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        fillPriority:2,
        //fill: '2',
        stroke: 'red'
        //strokeWidth: 4
      });
      var group = new Konva.Group({x:this.X[this.carposition-1]-10,y:this.Y[this.carposition-1]-10});
	  group.add(rect);
	  group.add(rectnumber);
	  //this.layer.add(rectnumber);
	  //this.layer.add(rect);
      this.layer.add(group);
	  this.stage.add(this.layer);
	  this.rectgroup[this.agvnum-1]=group;
      this.rects[this.agvnum-1]=rect;
      this.carposition=null;
      this.T[this.agvnum-1]=-1;//初始化T数组
      this.num[this.agvnum-1]=-1;//初始化num数组
    },
    addjob:function(){
      /* let ppath=[
			[	{"paths":1},
				{"paths":2},
				{"paths":3},
				{"paths":4},
				//{"paths":8},
				{"paths":-1}

			],
			[
				{"paths":10},
				{"paths":1},
				{"paths":5},
				//{"paths":6},
				{"paths":-1}
			]
		];
		for(let i=0;i<ppath.length;i++){
			this.path[i]=new Array();
			for(let j=0;j<ppath[i].length;j++){
				this.path[i][j]=ppath[i][j].paths;
			}
		}*/

	  //if(this.jobStart==null||this.jobEnd==null)
        //return;
      this.jobnum++;
      this.jobStartset[this.jobnum-1]=this.jobStart;
      this.jobEndset[this.jobnum-1]=this.jobEnd;
	  this.data.push({"number":this.pagetotal+1,"start":this.jobStart,"end":this.jobEnd,"remain":this.jobnumber,"car":"1,3"});
      this.tableData=this.tableDatas[this.index-1];
	  this.jobnumberset[this.jobnum-1]=this.jobnumber;
	  this.jobnumber=null;
	  this.jobStart=null;
      this.jobEnd=null;
      if(this.Isbegin){
        let datapath=new Array();//传给志诚所写的后端的当前路径
        datapath=this.path;
		this.newpath=this.path;
        for(let i=0;i<this.agvnum;i++){
          if(this.T[i]==-1)
            continue;
          let time=0;
          if(this.rects[i].getAbsolutePosition().x==this.X[this.path[i][j]-1]-10)
            time=Math.abs((this.Y[this.path[i][this.num[i]]]-10-this.rects[i].getAbsolutePosition().y))/(this.V*20);
          else
            time=Math.abs((this.X[this.path[i][this.num[i]]]-10-this.rects[i].getAbsolutePosition().x))/(this.V*20);
          this.T[i]=time;
        }
        for(let i=0;i<this.agvnum;i++){
          let dpath;
          if(datapath[i].length==-1)//该小车没有指派任务
            continue;
          for(let j=this.num[i],m=0;j<datapath[i].length;j++,m++){
            dpath=new Array();
            dpath[m]=datapath[j];
          }
          datapath[i]=dpath;
        }
		//AjAx
		//if(this.pathflag==0)
		//传datapath
		//else
		//传newpath
		this.pathflag=1;
		//this.flag[i]=1;改变路径的小车的flag变为1
		//this.newpath[1][2]=3;
        for(let i=0;i<this.agvnum;i++){
          if(this.T[i]==-1)
            this.move(i,0);
        }

      }
    },
    move:function(i,j){
      if(this.pathflag==1){
		this.pathflag=0;
		this.path=this.newpath;
	  }
	  if(this.path[i][j]==-1){
        this.T[i]=-1;
        return;
      }
      let time=0;//小车从当前位置运行到下个点所需时间
      if(this.rects[i].getAbsolutePosition().x==this.X[this.path[i][j]-1]-10)
        time=Math.abs((this.Y[this.path[i][j]-1]-10-this.rects[i].getAbsolutePosition().y))/(this.V*20);
      else
        time=Math.abs((this.X[this.path[i][j]-1]-10-this.rects[i].getAbsolutePosition().x))/(this.V*20);
      console.log(i+" "+this.path[i][j]);
      this.rectgroup[i].to({
          x:this.X[this.path[i][j]-1]-10,
          y:this.Y[this.path[i][j]-1]-10,
          duration:time,
          onFinish:()=> {
          if(j<this.path[i].length-1){//this.pathflag=1;this.newpath=this.path;this.newpath[1][2]=3;
        this.num[i]=j;
        if(this.flag[i]==1){
          this.flag[i]=0;
          this.move(i,1);
        }
        else
			this.move(i,j+1);
      }
    }

    });
    },
    start:function(){
	  let sstart=new Array();
	  let eend=new Array();
	  let ddistance=new Array();
      for (var i = 0; i < this.Indexpath.length; i++) {
       if(this.Indexpath[i]==0)
		continue;
		sstart[i]=this.Pathstart[i];
		eend[i]=this.Pathend[i];
		ddistance[i]=this.Pathdis[i];
      }
	   var arrpathstart = [];
      for (var i = 0; i < sstart.length; i++) {
        var jsonobj1 = {};
        jsonobj1["startNode"] = sstart[i];
        arrpathstart[i] = jsonobj1;
      }
	  var arrpathend = [];
      for (var i = 0; i < eend.length; i++) {
        let jsonobj2 = {};
        jsonobj2["endNode"] = eend[i];
        arrpathend[i] = jsonobj2;
      }
	  var arrpathdis = [];
      for (var i = 0; i < ddistance.length; i++) {
        var jsonobj3 = {};
		jsonobj3["nodeDistance"] = ddistance[i]/20;
        arrpathdis[i] = jsonobj3;

      }
	  let sstart_buffer=[];
	  let eend_buffer=[];
	  let ddistance_buffer=[];

	  for (var i = 0; i < this.Indexpath_buffer.length; i++) {
       if(this.Indexpath_buffer[i]==0)
		continue;
		sstart_buffer[i]=this.Pathstart_buffer[i];
		eend_buffer[i]=this.Pathend_buffer[i];
		ddistance_buffer[i]=this.Pathdis_buffer[i];
      }
	  var arrpathstartbuffer=[];
	  for (var i = 0; i < sstart_buffer.length; i++) {
        var jsonobj4 = {};
        jsonobj4["Pathstartbuffer"] = sstart_buffer[i];
        arrpathstartbuffer[i] = jsonobj4;
      }
	  var arrpathendbuffer = [];
      for (var i = 0; i < eend.length; i++) {
        var jsonobj5 = {};
        jsonobj5["Pathend"] = eend[i];
        arrpathendbuffer[i] = jsonobj5;
      }
	  var arrpathdisbuffer = [];
      for (var i = 0; i < ddistance.length; i++) {
        var jsonobj6 = {};
        jsonobj6["distance"] = ddistance[i];
        arrpathdisbuffer[i] = jsonobj6;
      }
	  var arrpath=[];
	  for(let i=0;i<this.agvnum;i++){
		let jsonobj7 = {};
        arrpath[i]=new Array();
		this.path[i][0]=parseFloat(this.path[i][0]);
		jsonobj7["paths"] = this.path[i][0];
        arrpath[i][0] = jsonobj7;
	  }
	  let tasks=[];
	  for(let i=0;i<this.jobnum;i++){
		tasks[i]=new Array();
		tasks[i][0]=this.jobStartset[i];
		tasks[i][1]=this.jobEndset[i];
		tasks[i][2]=this.jobnumberset[i];
	  }
	  var arrtasks=[];
	  for(let i=0;i<tasks.length;i++){
		let jsonobj8 = {};
        jsonobj8["tasks"] = tasks[i][0].toString()+","+tasks[i][1].toString()+","+tasks[i][2].toString();
		console.log(jsonobj8.tasks);
        arrtasks[i] = jsonobj8;
	  }

	  let arrspeed=parseFloat(this.V);


	  let arrpre=parseFloat(this.Minlength);
	  var arrnodenum=[];
	  let jsonobj11={};
	  jsonobj11["numberOfGraphNode"]=this.X.length;
	  arrnodenum[0]=jsonobj11;
	  var arrbufferset=[];//假数据
	  arrbufferset[0]=new Array();
	  arrbufferset[1]=new Array();
	  let js00={};
	  js00["paths"]=5;
	  let js01={};
	  js01["paths"]=7;
	  let js02={};
	  js02["paths"]=8;
	  let js03={};
	  js03["paths"]=9;
	  let js04={};
	  js04["paths"]=10;
	  let js05={};
	  js05["paths"]=6;
	  arrbufferset[0][0]=js00;
	  arrbufferset[0][1]=js01;
	  arrbufferset[0][2]=js02;
	  arrbufferset[0][3]=js03;
	  arrbufferset[0][4]=js04;
	  arrbufferset[0][5]=js05;
	  let js10={};
	  js10["paths"]=2;
	  let js11={};
	  js11["paths"]=11;
	  let js12={};
	  js12["paths"]=12;
	  let js13={};
	  js13["paths"]=13;
	  let js14={};
	  js14["paths"]=14;
	  let js15={};
	  js15["paths"]=3;
	  arrbufferset[1][0]=js10;
	  arrbufferset[1][1]=js11;
	  arrbufferset[1][2]=js12;
	  arrbufferset[1][3]=js13;
	  arrbufferset[1][4]=js14;
	  arrbufferset[1][5]=js15;

	  var arrcarset=[];//假数据
	  let jsonobj13={};
	  jsonobj13["bufferForAGV"]=0;
	  arrcarset[0]=jsonobj13;
	  jsonobj13["bufferForAGV"]=0;
	  arrcarset[1]=jsonobj13;
	  jsonobj13["bufferForAGV"]=1;
	  arrcarset[2]=jsonobj13;
	  jsonobj13["bufferForAGV"]=1;
	  arrcarset[3]=jsonobj13;
	  var arrtime=[];
	  for(let i=0;i<this.T.length;i++){
		let jsonobj14 = {};
        jsonobj14["time"] = this.T[i];
        arrtime[i] = jsonobj14;
	  }

	  		let ppath=[
    			[	{"paths":9},
    				{"paths":8},
    				{"paths":1},
    				{"paths":2},
    				{"paths":-1}

    			],
    			[
    				{"paths":3},
    				{"paths":2},
    				{"paths":1},
    				{"paths":-1}
    			]
    		];
	  var message={
		"startNode":arrpathstart,
		"endNode":arrpathend,
		"nodeDistance":arrpathdis,
		"paths":arrpath,
		"tasks":arrtasks,
		"speed":arrspeed,
		"precision":arrpre,
		"numberOfGraphNode":arrnodenum[0].numberOfGraphNode,
		"bufferSet":arrbufferset,
		"bufferForAGV":arrcarset,
		"time":arrtime
	  };
		console.log(message);

		for(let i=0;i<ppath.length;i++){
			this.path[i]=new Array();
			for(let j=0;j<ppath[i].length;j++){
				this.path[i][j]=ppath[i][j].paths;
			}
		}

	  this.Isbegin=true;
      for(let i=0;i<this.rects.length;i++)
        this.move(i,0);


      // Send a POST request
      this.$axios.post('/api/genetic', {
                data: message,
              }).then(response => {
               alert(response.data);
              })





    },
	pageChange:function(pageIndex){console.log(pageIndex);
		this.index=pageIndex;
		this.tableData=this.tableDatas[pageIndex-1];console.log(tableData);
	}

  }



  }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  @import '../css/bootstrap.min.css'
</style>
