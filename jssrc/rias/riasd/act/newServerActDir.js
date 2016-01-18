

//RIAStudio Server Action of riasd/newServerActDir.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var server = this,
			fn = server.fetchByName(req, "pathname", _typeStr),///不用转换后缀。
			//dir = rias.host.jsString(req.getParameter("dir")),//未使用
			r,
			result = {
				success: false,
				value: 0
			};
		if(!/^[\w\/]+$/.test(fn)){///要允许 / 存在，但是不允许 .\ 存在。
			result = {
				success: false,
				value: "action路径(目录)名包含不合规字符..."
			};
		}else if(fn == ""){///允许在 root 目录创建子目录
			result = {
				success: false,
				value: "缺少操作权限..."
			};
		}else{
			r = server.createNewDir(fn, "serverAct");
			if(r === 2){
				result = {
					success: 0,
					value: "目录已经存在..."
				};
			}else{
				result = {
					success: (r === 1),
					value: r
				};
			}
		}
		return result;
	};

});
