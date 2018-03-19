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
								<td><button id="button2" style="position: absolute;"  @click="addcar">添加 </button></td>
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
                  <td><button id="button" @click="addjob">添加</button></td>
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
                <td><input type="submit" id="buttonrun" value="启动系统" @click="star" ></td>
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
  export default{
    name: 'Job',
	data(){
		return{
			agvnum:0,//小车数目
			carposition:null,//小车初始位置
			carsposition:[],//小车初始位置集合
			stage:null,
			layer:null,
			rects:[],//指代小车的矩形集合
			path:[[2,3,4,7],[5,6],[3,4,7,8]],
			nodename:[1,2,3,4,5,6,7,8],
			x:[280,560,560,360,280,440,360,280],
			y:[120,120,280,280,200,200,240,240],
			startset:[1,2,4,1,5,7,8],
			endset:[2,3,3,5,6,4,7],
			indexpathset:[1,1,1,1,1,1,1],
			indexnodeset:[1,1,1,1,1,1,1,1],
			jobStart:null,
			jobEnd:null,
			jobStartset:[],
			jobEndset:[],
			jobnum:0//任务数量

		}
	},
	computed:{

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
		for (var i = 0; i < this.indexnodeset.length; i++) {
			if(this.indexnodeset[i]==0)
				continue;
			var xx = this.x[i];
			var yy = this.y[i];
			//开始绘制节点
			ctx.beginPath();
			ctx.arc(xx, yy, 5, 0, Math.PI * 2, true);
			ctx.fillStyle = "#FF4500";
			ctx.fill();
			//设置文字参数
			ctx.font = "30px";
			var numx = this.x[i] - 10;
			var numy = this.y[i] - 5;
			var numname = this.nodename[i];
			ctx.fillText(numname, numx, numy);
		}
		for (var i = 0; i < this.indexpathset.length; i++) {
			if(this.indexpathset[i]==0)
				continue;
			var startx = this.x[this.startset[i]-1];
			var starty = this.y[this.startset[i]-1];
			var endx = this.x[this.endset[i]-1];
			var endy = this.y[this.endset[i]-1];
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

			var rect = new Konva.Rect({
			x: this.x[this.carposition-1]-10,
			y: this.y[this.carposition-1]-10,
			width: 20,
			height: 20,
			fillPriority:2,
			//fill: '2',
			stroke: 'red'
			//strokeWidth: 4
			});
			this.layer.add(rect);
			this.stage.add(this.layer);
			this.rects[this.agvnum-1]=rect;
			this.carposition=null;
		},
		addjob:function(){
			if(thi.jobStart==null||this.jobEnd==null)
				return;
			this.jobnum++;
			this.jobStartset[this.jobnum-1]=this.jobStart;
			this.jobEndset[this.jobnum-1]=this.jobEnd;
			this.jobStart=null;
			this.jobEnd=null;
		},
		move:function(i,j){
		  if (path[i] == -1) {
		  t[i] = -1
		  return
		  }
			this.rects[i].to({
				x:this.x[this.path[i][j]-1]-10,
				y:this.y[this.path[i][j]-1]-10,
				duration:1.5,
				onFinish:()=> {
						if(j<this.path[i].length-1)
							this.move(i,j+1);
						if (flag) {
						this.move(i,1)
						}
				}

			});
		},
		star:function(){
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
