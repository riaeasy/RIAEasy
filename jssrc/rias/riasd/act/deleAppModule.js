

//RIAStudio Server Action of riasd/deleteAppModule.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var server = this,
			//fn = rias.host.jsString(req.getParameter("pathname")),///不用转换后缀。
			pn = server.fetchByName(req, "pathname", _typeStr),
			fn = (server.extractFileExt(pn) === "js" ? pn.replace(/\.js$/gi, "") : pn),//转换为无文件后缀
			r,
			result = {
				success: false,
				value: 0
			};
		pn = server.extractDir(fn, "appModule");///取 fn 的目录
		//if(!/^[\w\/]+$/.test(fn.replace(/\.js$/gi, ""))){///要允许 / 存在及以 .js 结尾，但是不允许 .\ 存在。
		if(!/^[\w\/]+$/.test(fn)){///要允许 / 存在，但是不允许 .\ 存在。
			result = {
				success: false,
				value: "模块路径(目录文件)名包含不合规字符..."
			};
		}else if(pn == "" || /appModule\/app$/gi.test(pn)){///不允许删除 root 目录中的文件
			result = {
				success: false,
				value: "缺少操作权限..."
			};
		}else{
			if(server.isDirectory(fn, "appModule")){
				r = server.deleteFile(fn, "appModule");
			}else{
				r = server.deleteFile(fn.replace(/^appModule/, "rsfsModule") + ".rsfs", "rsfsModule");
				if(r === 1){
					r = server.deleteFile(fn + ".js", "appModule");
				}
			}
			result = {
				success: (r === 1),
				value: r
			};
		}
		return result;
	}

});
