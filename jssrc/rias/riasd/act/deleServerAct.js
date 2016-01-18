

//RIAStudio Server Action of riasd/deleteServerAct.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var server = this,
			fn = server.fetchByName(req, "pathname", _typeStr),///不用转换后缀。
			pn = server.extractDir(fn, "serverAct"),///取 fn 的目录
			r,
			result = {
				success: false,
				value: 0
			};
		if(!/^[\w\/]+$/.test(fn.replace(/\.js$/gi, ""))){///要允许 / 存在及以 .js 结尾，但是不允许 .\ 存在。
			result = {
				success: false,
				value: "action路径(目录文件)名包含不合规字符..."
			};
		}else if(pn == "" || /act$/gi.test(pn) || /riasd$/gi.test(pn)){///不允许删除 root 和 riasd 目录中的文件
			result = {
				success: false,
				value: "缺少操作权限..."
			};
		}else{
			r = server.deleteFile(fn, "serverAct");
			result = {
				success: (r === 1),
				value: r
			};
		}
		return result;
	}

});
