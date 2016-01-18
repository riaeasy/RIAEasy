

//RIAStudio Server Action of riasd/saveServerAct.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var server = this,
			pn = server.fetchByName(req, "pathname", _typeStr),
			fn = (server.extractFileExt(pn) === "js" ? pn.replace(/\.js$/gi, "") : pn),//转换为无文件后缀
			text = server.fetchByName(req, "text", _typeStr),
			r,
			result = {
				success: false,
				value: 0
			};
		pn = server.extractDir(fn, "serverAct");///取 fn 的目录
		if(!/^[\w\/]+$/.test(fn)){///要允许 / 存在，但是不允许 .\ 存在。
			result = {
				success: false,
				value: "action名包含不合规字符..."
			};
		}else if(pn == "" || /act$/gi.test(pn) || /riasd$/gi.test(pn)){///不允许在 root 和 riasd 目录保存
			result = {
				success: false,
				value: "缺少操作权限..."
			};
		}else{
			r = server.writeText(fn + ".js", "serverAct", text);
			result = {
				success: (r === 1),
				value: r
			};
		}
		return result;
	}

});
