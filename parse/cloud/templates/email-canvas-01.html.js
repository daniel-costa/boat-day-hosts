<html style="margin:0px;padding:0px;">
	<body style="margin:0px;padding:0px;background-color:#11abc1;color:white;font-family:'Helvetica Neue',Helvetica,sans-serif;">
		<style>@font-face {font-family: museo;src: url(https://www.boatdayapp.com/images/newsletters/Museo700-Regular.ttf);}</style>
		<table style="width:550px;margin:32px auto;">
			<tr>
				<td style="height:65px;width:90px;border-right:white solid 2px;">
					<img src="https://www.boatdayapp.com/images/newsletters/logo-01.png" />
				</td>
				<td style="padding-left:39px;">
					<p style="color:white;font-size:20px;font-family:museo;font-weight:700;margin:0px;">BoatDay</p>
					<p style="color:white;font-size:11px;font-weight:400;margin:5px 0px 0px 0px;"><%=date%></p>
				</td>
			</tr>
		</table>
		<div style="width:550px;margin:auto;background-color:white;border-radius:20px;">
			<div style="padding:50px;">
				<img src="https://www.boatdayapp.com/images/newsletters/header-01.jpg" style="max-width:100%;" />
				<h1 style="font-weight:200;color:#293a41;font-size:28px;margin:25px 0px;"><%=title%></h1>
				<p style="font-size:15px;color:#546e7a;line-height:26px;"><%=text%></p>
				<center>
					<a href="<%=more%>" style="
					display:block;width:222px;height:60px;line-height:60px;margin-top:50px;margin-left:auto;margin-right:auto;color:white;border-radius:10px;font-size:13px;text-align:center;background-color:#f5b019;text-transform:uppercase;text-decoration:none;font-weight:500px;"><%=moreText%></a>
				</center>
			</div>
		</div>
		<p style="margin:25px;text-align:center;color:white;font-weight:100;font-size:15px;">Visit <a style="font-weight:500;color:white;text-decoration:none;font-size:15px;" href="https://www.boatdayapp.com">www.boatdayapp.com</a> to get started.</p>
	</body>
</html>