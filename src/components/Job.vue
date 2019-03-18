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
            <td><input id="agvpos" type="text" v-model="carposition" style="width: 150px;" placeholder="请输入AGV缓冲区编号"></td>
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
      <canvas id="Canvas" :width="Mapwidth" :height="Mapheight" style="position: absolute; left:320px; top:40px; z-index: 0;"></canvas>

    </div>
<pre><code id="json"></code></pre>

  </div>
</template>
<script>
  import {mapGetters, mapActions} from 'vuex'
  export default{
    name: 'JOB',
    data(){
      return{
		back:[],//0代表小车继续执行任务，1代表小车返回缓冲区，-1代表小车回到缓冲区，初始化时都为0
		tasksflag:[],//记录每辆小车是否开始执行某个任务，0代表开始执行，1代表完成,-1表示前往执行下一任务的途中
		taskindex:[],//小车执行到第几个任务
        tasksassign:[],//小车的任务分配
		arrpathstart:[],//传给后端的起点格式
		arrpathend:[],//传给后端的终点格式
		arrpathdis:[],//传给后端的距离格式
		arrspeed:0,//传给后端的速度格式
		arrpre:0,//传给后端的精度格式
		arrnodenum:0,//传给后端的普通地图的结点数目
		arrbufferset:[],//传给后端的缓存区结点格式
		arrcarset:[],//传给后端的缓存区小车格式
		carbuff:[],//存储各个缓冲区车的最大index
		pathflag:0,//变为1时表示系统开始后有新任务添加并传输到后台
		newpath:[],//存储后台传过来的新的小车路径
		index:1,//表格页码
		jobnumber:null,//任务次数
		jobnumberset:[],//任务次数集合
		agvnum:0,//小车数目
        index:1,//表格页码
        carposition:null,//小车初始位置
        carsposition:[],//小车初始位置集合
        stage:null,
        layer:null,
        rects:[],//指代小车的矩形集合
        path:[],//小车路径集合，-1代表结束  [[{"startNode":1,"endNode":2,"time":2,"isLoop":0},{}],[{},{}]]
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

	this.carbuff=new Array();
	for(let i=0;i<this.Total_buffer.length;i++){
		this.carbuff[i]=1;
	}
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

	for (var i = 0; i < this.Total_buffer.length; i++) {
	  let j=0;
      let k=2;

	  while(true){
	  if(j==this.Total_buffer[i][0].length-1){
		k=1;
	  }
	  var startx = this.Total_buffer[i][0][j];
      var starty = this.Total_buffer[i][1][j];
      var endx = this.Total_buffer[i][0][k];
      var endy = this.Total_buffer[i][1][k];
      //设置直线参数
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 4;
      ctx.lineCap = "round"; //设置端点样式:butt(默认),round,square
      ctx.lineJoin = "miter"; //设置连接样式:miter(默认),bevel,round
      ctx.strokeStyle = 'green'; // 设置线的颜色
      //开始绘制直线
      ctx.beginPath();
      ctx.moveTo(startx, starty);
      ctx.lineTo(endx, endy);
      ctx.stroke();
      ctx.closePath();
	  if(j==this.Total_buffer[i][0].length-1)
		break;
	  j=k;
	  k++;

     }
	}
  },
  methods:{

    addcar:function(){
	  if(this.carposition==null)
			return;
      let i=0;
	  for(;i<this.Total_buffer.length;i++){
		if(this.carposition-1==i)
			break;
		if(i==this.Total_buffer.length-1)
			{alert('请输入正确的缓冲区序号');this.carposition=null;return;}
	  }
	  this.carbuff[i]++;
	  if(this.carbuff[i]>=this.Total_buffer[i][3].length)
		{
			alert('此缓存区已满，无法添加小车');
			return;
		}
	  i++;
	  let jsonobj13={};
	  jsonobj13["bufferForAGV"]=i;
	  this.arrcarset[this.arrcarset.length]=jsonobj13;
      this.agvnum++;
      this.carsposition[this.agvnum-1]=this.carposition;

	  //this.path=new Array();
	  this.path[this.agvnum-1]=new Array();
	  //this.path[this.agvnum-1][0]=this.Total_buffer[i-1][3][this.Total_buffer[i-1][2].length+1-this.carbuff[i-1]];
      this.path[this.agvnum-1][0]={};
      this.path[this.agvnum-1][0].startNode=this.Total_buffer[i-1][3][this.Total_buffer[i-1][2].length+1-this.carbuff[i-1]];
      this.path[this.agvnum-1][0].endNode=this.Total_buffer[i-1][3][this.Total_buffer[i-1][2].length+1-this.carbuff[i-1]];
      this.path[this.agvnum-1][0].time=0.0;
      this.path[this.agvnum-1][0].isLoop=0;
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
      var group = new Konva.Group({x:this.Total_buffer[i-1][0][this.Total_buffer[i-1][2].length+1-this.carbuff[i-1]]-10,y:this.Total_buffer[i-1][1][this.Total_buffer[i-1][2].length+1-this.carbuff[i-1]]-10});
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

	  if(this.jobStart==null||this.jobEnd==null||this.jobnumber==null)
       { alert('请输入完整'); return;}
      this.jobnum++;
      this.jobStartset[this.jobnum-1]=this.jobStart;
      this.jobEndset[this.jobnum-1]=this.jobEnd;
	  this.data.push({"number":this.jobnum,"start":this.jobStart,"end":this.jobEnd,"remain":this.jobnumber,"car":""});
      this.tableData=this.tableDatas[this.index-1];
	  this.jobnumberset[this.jobnum-1]=this.jobnumber;
      if(this.Isbegin){
        let datapath=new Array();//传给志诚所写的后端的当前路径
        for(let i=0;i<this.path.length;i++){
			datapath[i]=new Array();
			for(let j=0;j<this.path[i].length;j++){
				datapath[i][j]={};
				datapath[i][j].startNode=this.path[i][j].startNode;
				datapath[i][j].endNode=this.path[i][j].endNode;
				datapath[i][j].time=this.path[i][j].time;
				datapath[i][j].isLoop=this.path[i][j].isLoop;
			}
		}

        for(let i=0;i<this.agvnum;i++){
          if(this.T[i]==-1)
            continue;
          let time=0.0;
          if(this.rects[i].getAbsolutePosition().x==this.X[this.path[i][this.num[i]]-1]-10)
            time=Math.abs((this.Y[this.path[i][this.num[i]].startNode]-10-this.rects[i].getAbsolutePosition().y)/(this.Y[this.path[i][this.num[i]].endNode]-this.Y[this.path[i][this.num[i]].startNode]))*this.path[i][this.num[i]].time;
            //time=Math.abs((this.Y[this.path[i][this.num[i]]-1]-10-this.rects[i].getAbsolutePosition().y))/(this.V*20);
          else
            time=Math.abs((this.X[this.path[i][this.num[i]].startNode]-10-this.rects[i].getAbsolutePosition().x)/(this.X[this.path[i][this.num[i]].endNode]-this.X[this.path[i][this.num[i]].startNode]))*this.path[i][this.num[i]].time;
            //time=Math.abs((this.X[this.path[i][this.num[i]]-1]-10-this.rects[i].getAbsolutePosition().x))/(this.V*20);

		  //console.log(Math.abs((this.X[this.path[i][this.num[i]]-1]-10-this.rects[i].getAbsolutePosition().x))+"ddd");
		  this.T[i]=time;//console.log(this.T[i]+"time");
        }
        for(let q=0;q<this.agvnum;q++){
          let dpath=new Array();
          if(datapath[q].length==0)//该小车没有指派任务
            continue;
          if(this.T[q]==-1){
            dpath[0]={};
            dpath[0].startNode=datapath[q][datapath[q].length-2].startNode;
            dpath[0].endNode=dpath[m].startNode;
            dpath[0].time=0.0;
            dpath[0].isLoop=0;
          }
          else {
            for (let j = this.num[q], m = 0; j < datapath[q].length; j++, m++) {
              dpath[m] = {};
              dpath[m].startNode = datapath[q][j].startNode;
              dpath[m].endNode = datapath[q][j].endNode;
              dpath[m].time = datapath[q][j].time;
              dpath[m].isLoop = datapath[q][j].isLoop;
              //dpath[m]=datapath[q][j];//console.log(dpath[m]+"bbb");
            }
          }
          datapath[q]=new Array();
		  for(let n=0;n<dpath.length;n++)
			  datapath[q][n]=dpath[n];

        }//console.log(datapath[0][0]+"aaaaa");
		let arrtasks=[];
		let jsontask = {};
        jsontask["tasks"] = this.jobStart.toString()+","+this.jobEnd.toString()+","+this.jobnumber.toString();
		arrtasks[0]=jsontask;
		let arrtime=[];
		for(let i=0;i<this.T.length;i++){
		let jsonT = {};
        jsonT["time"] = this.T[i];
        arrtime[i] = jsonT;
	  }
		let arrpath=[];
		if(this.pathflag==0){
		    //传datapath

			for(let i=0;i<this.agvnum;i++){
			 arrpath[i]=new Array();
				for(let j=0;j<datapath[i].length;j++){
					arrpath[i][j] = datapath[i][j];
				}
	  }
		}
		else{
		//传newpath
			for(let i=0;i<this.agvnum;i++){
			 arrpath[i]=new Array();
				for(let j=0;j<this.newpath[i].length;j++){
					arrpath[i][j] = newpath[i][j];
				}

			}
		}
		this.Send(this.arrpathstart,this.arrpathend,this.arrpathdis,arrpath,arrtasks,this.arrspeed,this.arrpre,this.arrnodenum,this.arrbufferset,this.arrcarset,arrtime);
    console.log("qqqqqqqqqqqqqqqqqqqqqqq");
       /* for(let i=0;i<this.agvnum;i++){
          if(this.T[i]==-1)
            this.move(i,0);
        }*/
      }
	  this.jobnumber=null;
	  this.jobStart=null;
      this.jobEnd=null;
    },
    move:function(i,j){
      if(this.pathflag==1){
		this.pathflag=0;
		this.path=this.newpath;
	  }
	  if(this.path[i][0].time!=0)
		this.T[i]=0;//表示小车不为闲置，只要不是-1就行，这里取0
	  if(this.path[i][j].startNode==-1){
        this.T[i]=-1;
        return;
      }
      let ypos=0;
	  let xpos=0;
	  if(this.path[i][j].endNode<100)
		{
			ypos=this.Y[this.path[i][j].endNode-1]-10;
			xpos=this.X[this.path[i][j].endNode-1]-10;
			if(this.back[i]==-1)
				this.back[i]=0;//此次终点为普通区的点，说明开始触发，置为0
		}
	  else
		{
			let k=parseInt(this.path[i][j].endNode/100);
			ypos=this.Total_buffer[k-1][1][this.path[i][j].endNode-100*k]-10;
			xpos=this.Total_buffer[k-1][0][this.path[i][j].endNode-100*k]-10;
			this.back[i]=-1;//此次终点为缓冲区的点，说明已经回到缓冲区置为-1
		}
    if(this.path[i][j].isLoop==1) {
      let startx=this.X[this.path[i][j].startNode - 1] - 10;
      let starty=this.Y[this.path[i][j].startNode - 1] - 10;
      let endx=xpos;
      let endy=ypos;
      if(startx==endx)
        endy=endy > starty ? starty+this.Minlength*20 : starty-this.Minlength*20;
      else
        endx=endx > startx ? startx+this.Minlength*20 : startx-this.Minlength*20;
	    this.moveLittle(i,j,this.path[i][j].time,startx,starty,endx,endy);
    }
    else {
      //console.log("")
	    this.rectgroup[i].to({
        x: xpos,
        y: ypos,
        duration: this.path[i][j].time,
        onFinish: () => {
          //alert("aaa");
          if (this.path[i][j].startNode != this.path[i][j].endNode) {
            this.checkwork(i,xpos,ypos);
            this.stop(i, j, xpos, ypos);
          }
          else
            this.movenext(i,j);
        }

      });
    }
    },
    checkwork:function(i,xpos,ypos){  //小车到达一个点判断任务进展情况,更新任务表格
      if (this.back[i] == 0) {
        if (this.tasksflag[i] == 0) {//判断是否到达任务终点
          console.log(xpos + "  " + ypos);
          console.log(this.X[this.jobEndset[this.tasksassign[i][this.taskindex[i]].tasksNum] - 1] + "   " + this.Y[this.jobEndset[this.tasksassign[i][this.taskindex[i]].tasksNum] - 1]);
          if (xpos + 10 == this.X[this.jobEndset[this.tasksassign[i][this.taskindex[i]].tasksNum] - 1] && ypos + 10 == this.Y[this.jobEndset[this.tasksassign[i][this.taskindex[i]].tasksNum] - 1]) {
            this.tasksassign[i][this.taskindex[i]].times--;
            let item = this.data[this.tasksassign[i][this.taskindex[i]].tasksNum];
            item.remain--;
            this.data.splice(this.tasksassign[i][this.taskindex[i]].tasksNum, 1, item);//更新列表，剩余任务次数减一
            if (this.tasksassign[i][this.taskindex[i]].times == 0) {//此类型任务全部执行完毕，开始执行下一类型任务
              this.taskindex[i]++;
              if (this.tasksassign[i].length > this.taskindex[i]) {
                item = this.data[this.tasksassign[i][this.taskindex[i]].tasksNum];
                item.car += " " + i;
                this.data.splice(this.tasksassign[i][this.taskindex[i]].tasksNum, 1, item);//更新列表
              }
              else
                this.back[i] = 1;
            }
            if (this.back[i] == 0) {
              if (xpos + 10 == this.X[this.jobStartset[this.tasksassign[i][this.taskindex[i]].tasksNum] - 1] && ypos + 10 == this.Y[this.jobStartset[this.tasksassign[i][this.taskindex[i]].tasksNum] - 1])
                this.tasksflag[i] = 0;//执行下一个任务
              else
                this.tasksflag[i] = -1;//前往执行下一个任务
            }
          }
        }
        else {//开始执行下一个任务
          //console.log(xpos+"  "+ypos);
          //console.log(this.X[this.jobStartset[this.tasksassign[i][this.taskindex[i]].tasksNum]-1]);
          if (xpos + 10 == this.X[this.jobStartset[this.tasksassign[i][this.taskindex[i]].tasksNum] - 1] && ypos + 10 == this.Y[this.jobStartset[this.tasksassign[i][this.taskindex[i]].tasksNum] - 1]) {
            this.tasksflag[i] = 0;
          }
        }
      }
    },
    movenext:function(i,j){ //小车运行到下一个点

      if (j < this.path[i].length - 1) {//this.pathflag=1;this.newpath=this.path;this.newpath[1][2]=3;
        this.num[i] = j;
        if (this.flag[i] == 1) {
         // console.log("asdsadaasddas");
          this.flag[i] = 0;
          this.move(i, 0);
        }
        else
          this.move(i, j + 1);
      }
    },
    moveLittle:function (i,j,time,startx,starty,endx,endy) {
      this.rectgroup[i].to({
        x:endx,
        y:endy,
        duration:time,
        onFinish:()=> {
          this.rectgroup[i].to({
            x:startx,
            y:starty,
            duration:time,
            onFinish:()=> {
              this.stop(i,j,startx,starty);
            }
          });
        }
      });
    },
    stop:function(i,j,x,y){ //小车在点停顿
      this.rectgroup[i].to({
        x:x,
        y:y,
        duration:4/this.V,
        onFinish:()=> {
          this.movenext(i,j);
        }
      });
    },
    start:function(){
	  for(let i=0;i<this.agvnum;i++){
		this.back[i]=0;
		this.tasksassign[i]=new Array();
		this.taskindex[i]=0;
		this.tasksflag[i]=-1;
		}
	  let sstart=new Array();
	  let eend=new Array();
	  let ddistance=new Array();
	  for (var i = 0; i < this.Indexpath.length; i++) {
       if(this.Indexpath[i]==0){
		      sstart[i]=0;
		      eend[i]=0;
		      ddistance[i]=0;
		      continue;
		}
		    sstart[i]=this.Pathstart[i];
		    eend[i]=this.Pathend[i];
		    ddistance[i]=this.Pathdis[i];
      }
      for (var i = 0,j=0; i < sstart.length; i++,j++) {
        var jsonobj1 = {};
		    if(sstart[i]==0){
			    j--;
			    continue;
		    }
        jsonobj1["startNode"] = sstart[i];
        this.arrpathstart[j] = jsonobj1;
      }

      for (var i = 0,j=0; i < eend.length; i++,j++) {
        let jsonobj2 = {};
		    if(eend[i]==0){
			    j--;
			    continue;
		  }
        jsonobj2["endNode"] = eend[i];
        this.arrpathend[j] = jsonobj2;
      }

      for (var i = 0,j=0; i < ddistance.length; i++,j++) {
        var jsonobj3 = {};
		    if(ddistance[i]==0){
			    j--;
			    continue;
		}
		jsonobj3["nodeDistance"] = ddistance[i]/20;
        this.arrpathdis[j] = jsonobj3;

      }
      let arrpath=[];
	  for(let i=0;i<this.agvnum;i++){
        arrpath[i]=new Array();
		    arrpath[i][0]={};
		    arrpath[i][0].startNode=this.path[i][0].startNode;
		    arrpath[i][0].endNode=this.path[i][0].endNode;
		    arrpath[i][0].time=this.path[i][0].time;
		    arrpath[i][0].isLoop=this.path[i][0].isLoop;
	  }
	  let tasks=[];
	  for(let i=0;i<this.jobnum;i++){
		  tasks[i]=new Array();
		  tasks[i][0]=this.jobStartset[i];
		  tasks[i][1]=this.jobEndset[i];
		  tasks[i][2]=this.jobnumberset[i];
	  }
	  let arrtasks=[];
	  for(let i=0;i<tasks.length;i++){
		    let jsonobj8 = {};
        jsonobj8["tasks"] = tasks[i][0].toString()+","+tasks[i][1].toString()+","+tasks[i][2].toString();
        arrtasks[i] = jsonobj8;
	  }

	  this.arrspeed=parseFloat(this.V);
	  this.arrpre=parseFloat(this.Minlength);

	  for (var i = 0; i < this.Indexnode.length; i++) {
      if(this.Indexnode[i]==0)
        continue;
      this.arrnodenum++;
	}

	  for(let i=0;i<this.Total_buffer.length;i++){
		  this.arrbufferset[i]=new Array();
		  for(let j=0,k=0;j<this.Total_buffer[i][3].length;j++,k++){
			  if(j==1){
				  k--;
				  continue;
			  }
			  let jsonobj={};
			  jsonobj["paths"]=this.Total_buffer[i][3][j];
			  this.arrbufferset[i][k]=jsonobj;
			  if(j==this.Total_buffer[i][3].length-1){
				  let jsonobjj={};
				  jsonobjj["paths"]=this.Total_buffer[i][3][1];
				  this.arrbufferset[i][k+1]=jsonobjj;
			  }
		  }
	  }

	  let arrtime=[];
	  for(let i=0;i<this.T.length;i++){
		    let jsonobj14 = {};
        jsonobj14["time"] = this.T[i];
        arrtime[i] = jsonobj14;
	  }

	  this.Send(this.arrpathstart,this.arrpathend,this.arrpathdis,arrpath,arrtasks,this.arrspeed,this.arrpre,this.arrnodenum,this.arrbufferset,this.arrcarset,arrtime);


    },
	Send:function(start,end,dis,pat,tas,spee,pre,nodenum,buff,carbuff,arrT){
		var message={
		"startNode":start,
		"endNode":end,
		"nodeDistance":dis,
		"paths":pat,
		"tasks":tas,
		"speed":spee,
		"precision":pre,
		"numberOfGraphNode":nodenum,
		"bufferSet":buff,
		"bufferForAGV":carbuff,
		"time":arrT
	  };
		let btn = document.querySelector('#json');
    let data = message;
    btn.textContent = JSON.stringify(data, null, '  ');
//		for(let i=0;i<message.paths.length;i++){
//			this.newpath[i]=new Array();
//			for(let j=0;j<message.paths[i].length;j++){
//				this.newpath[i][j]=message.paths[i][j].paths;
//			}
//		}
		//console.log(this.newpath);
		 this.$axios.post('/api/genetic', {
                data: message,
              }).then(response => {
             		btn.textContent = JSON.stringify(response.data, null, '  ');

             		for(let i=0;i<response.data.paths.length;i++){
             			this.newpath[i]=new Array();
             			for(let j=0;j<response.data.paths[i].length;j++){
             				this.newpath[i][j]={};
                    this.newpath[i][j].startNode=response.data.paths[i][j].startNode;
                    this.newpath[i][j].endNode=response.data.paths[i][j].endNode;
                    this.newpath[i][j].time=response.data.paths[i][j].time;
                    this.newpath[i][j].isLoop=response.data.paths[i][j].isLoop;
             			}
             		}
					for(let i=0;i<response.data.record.length;i++){
						for(let j=0;j<response.data.record[i].length;j++){
							let obj={
								"tasksNum":response.data.record[i][j].record.taskNum,
								"times":response.data.record[i][j].record.times
							};
								this.tasksassign[i][this.tasksassign[i].length]=obj;

						}
					}
             		this.pathflag=1;
					if(this.Isbegin==true){
					for(let i=0;i<response.data.record.length;i++){
						if(response.data.record[i].length!=0){//表示这辆小车有新增路径
							this.T[i]=0;

							this.flag[i]=1;//改变路径的小车的flag变为1
						}
					}
				}
					else{

						for(let i=0;i<this.tasksassign.length;i++){
							if(this.tasksassign[i].length!=0){
								let item=this.data[this.tasksassign[i][0].tasksNum];
								item.car+=" "+i;
								this.data.splice(this.tasksassign[i][0].tasksNum,1,item);
						}
					}
					}

					this.Isbegin=true;

             		for(let i=0;i<this.rects.length;i++){
                    if(this.T[i]!=-1)
             		      this.move(i,1);
                    else
                      this.move(i,0)
                }
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
