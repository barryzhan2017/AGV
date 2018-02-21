<template>
<div>	
	<div class="navbar navbar-inverse" role="navigation">
		<div class="container-fluid">
			<div class="navbar-header">
				<button type="button" class="navbar-toggle collapsed" data-toggle="collapsed" data-target=".navbar-collapse">
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
			<li class="active">添加任务</li>
		</ol>
	</div>
		<div style="position: relative; top: 10px; left: 2px">
			<table id="agvtable" class="table table-striped" style="white-space: nowrap;">
							<tr>
								<td><input type="submit" name="button2" id="button2" value="添加" class="btn btn-primary"></td>
								<td><input id="agvpos" type="text" name="nodeName" style="left:30px;width: 150px;" placeholder="请输入AGV位置编号"></td>
							</tr>
							<tr>
								<td style="font-weight: bold;">AGV数量:</td>
								<td style="font-weight: bold;"></td>
							</tr>
			</table>
			<table style="display: none"id="cartable" class="table table-striped table-condensed table-hover compact text-center">
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
			<table class="table table-striped" style="white-space: nowrap;">
							<tr>
								<td><input type="submit" name="button" id="button" value="添加" class="btn btn-primary"></td>
								<td><input id="jstart" type="text" name="jobStart" style="width: 150px;" placeholder="请输入任务起点"></td>
							</tr>
							<tr>
								<td><input type="submit" style="display: none"></td>
								<td><input id="jend" type="text" name="jobEnd" style="width: 150px;" placeholder="请输入任务终点"></td>
							</tr>
			</table>
			<p>[双击删除任务]</p>
			<table id="jobtable"  class="table table-striped table-condensed table-hover compact text-center">
							<tr>
								<td style="font-weight: bold;">编号</td>
								<td style="font-weight: bold;">起点</td>
								<td style="font-weight: bold;">终点</td>
								<td style="font-weight: bold;">状态</td>
								<td style="font-weight: bold;">AGV</td>
							</tr>
							
			</table>
			<div style="height: 200px;"></div>
			<table class="table table-striped" style="white-space: nowrap;">
						<tr>
							<td><input type="submit" id="buttonrun" value="启动系统" class="btn btn-success"></td>
							<td><input type="submit" id="buttonupdate" value="修改地图" class="btn btn-danger"></td>
						</tr>
			</table>
		</div>
				
					
					
			<div class="col-xs-10" style="text-align: right;">
				<canvas id="myCanvas" width="800px" height="500px" style="position: absolute; left: 284px; top: 18px; z-index: 1; border: 2px dashed black;"></canvas>
				<canvas id="Canvas" width="800px" height="500px" style="position: absolute; left: 284px; top: 18px; z-index: 0; border: 2px dashed black;"></canvas>
  </div>
	
</div>
</template>
<script>
export default{
	name: 'Job'
	
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>