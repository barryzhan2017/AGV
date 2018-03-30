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
        <form id="form1" name="form1" >
          <table class="table table-striped" style="white-space: nowrap;">
            <tr>
              <td><button id="button" @click="addjob" class="btn btn-primary">添加</button></td>
              <td><input id="jstart" type="text" v-model="jobStart" style="width: 150px;" placeholder="请输入任务起点"></td>
            </tr>
            <tr>
              <td><input type="submit" style="display: none"></td>
              <td><input id="jend" type="text" v-model="jobEnd" style="width: 150px;" placeholder="请输入任务终点"></td>
            </tr>
          </table>
        </form>
        <p>[双击删除任务]</p>
        <table id="jobtable" style="white-space: nowrap;" class="table table-striped table-condensed table-hover compact text-center">
          <thead>
          <tr>
            <td style="font-weight: bold;">编号</td>
            <td style="font-weight: bold;">起点</td>
            <td style="font-weight: bold;">终点</td>
            <td style="font-weight: bold;">状态</td>
            <td style="font-weight: bold;">AGV</td>
          </tr>
          </thead>
          <tbody>

          </tbody>
        </table>
        <div style="height: 200px;"></div>
        <table class="table table-striped" style="white-space: nowrap;">
          <tr>
            <td><input type="submit" id="buttonrun" value="启动系统" @click="start" class="btn btn-success"></td>
            <td><input type="submit" id="buttonupdate" value="修改地图" class="btn btn-danger"></td>
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
        agvnum:0,//小车数目
        carposition:null,//小车初始位置
        carsposition:[],//小车初始位置集合
        stage:null,
        layer:null,
        rects:[],//指代小车的矩形集合
        path:[[8,9,10,11,-1],[3,4,5,6,7,-1],[6,5,4,3,-1]],//小车路径集合，-1代表结束
        jobStart:null,
        jobEnd:null,
        jobStartset:[],
        jobEndset:[],
        jobnum:0,//任务数量
        T:[],//存储小车从上个点开始运行多久，若闲置，则为-1，系统开始时全部置为0
        flag:[],//后台传新的路径过来时将对应的flag[i]由0变为1
        Isbegin:false,//系统是否已经启动
        num:[],//存储小车运行到路径数组中的第几个点，3->4则记录到3,-1代表还未到达路径的第0个点
		rectgroup:[]//存储矩形小车和对应小车序号的组
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
        'Indexnode', //被点击过的点是否有效
        'Pathend',//终点被点击的序号
		    'Pathstart',//起点被点击的序号
        'Pathdis',//路径长度
        'Indexpath' //路线是否有效的标
      ])

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

  },
  methods:{

    addcar:function(){

      if(this.carposition==null)
        return;
      this.agvnum++;
      this.carsposition[this.agvnum-1]=this.carposition;
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
      this.T[this.agvnum-1]=0;//初始化T数组
      this.num[this.agvnum-1]=-1;//初始化num数组
    },
    addjob:function(){
      if(thi.jobStart==null||this.jobEnd==null)
        return;
      this.jobnum++;
      this.jobStartset[this.jobnum-1]=this.jobStart;
      this.jobEndset[this.jobnum-1]=this.jobEnd;
      this.jobStart=null;
      this.jobEnd=null;
      if(this.Isbegin){
        let datapath=new Array();//传给志诚所写的后端的当前路径
        datapath=this.path;
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

        //AJAX


        for(let i=0;i<this.agvnum;i++){
          if(this.T[i]==-1)
            this.move(i,0);
        }

      }
    },
    move:function(i,j){
      if(this.path[i][j]==-1){
        this.T[i]=-1;
        return;
      }
      let time=0;//小车从当前位置运行到下个点所需时间
      if(this.rects[i].getAbsolutePosition().x==this.X[this.path[i][j]-1]-10)
        time=Math.abs((this.Y[this.path[i][j]-1]-10-this.rects[i].getAbsolutePosition().y))/(this.V*20);
      else
        time=Math.abs((this.X[this.path[i][j]-1]-10-this.rects[i].getAbsolutePosition().x))/(this.V*20);
      console.log(time);
      this.rectgroup[i].to({
          x:this.X[this.path[i][j]-1]-10,
          y:this.Y[this.path[i][j]-1]-10,
          duration:time,
          onFinish:()=> {
          if(j<this.path[i].length-1){
        this.num[i]=j;
        if(this.flag[i]==1){
          this.flag[i]=0;
          this.move(i,1);
        }
        this.move(i,j+1);
      }
    }

    });
    },
    start:function(){
      // Send a POST request
      this.$axios.post('/api/genetic', {
                test: 'test!!',
              }).then(response => {
                if (response.data.result === 'good') {
                 alert('good');
                } else {
                 alert('nogood');
                }
              })


      this.Isbegin=true;
      for(let i=0;i<this.rects.length;i++)
        this.move(i,0);


    }


  }



  }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  @import '../css/bootstrap.min.css'
</style>
