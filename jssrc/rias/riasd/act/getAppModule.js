

//RIAStudio Server Action of riasd/getAppModule.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	///TODO:zensst.控制文件数量。
	return function (method, req, res) {
		var server = this,
			p = server.fetchByName(req, "parentId", _typeStr),//不用转换后缀。
			isDir, onlyDir = server.fetchByName(req, "onlyDir", _typeBool),
			r,
			result = {
				success: false,
				value: 0
			};
		if(p && !/^[\w\/]+$/.test(p)){///要允许 / 存在及 ""，但是不允许 .\ 存在。
			result = {
				success: false,
				value: "模块路径(目录)名包含不合规字符..."
			};
		}else{
			r = server.getDirAndFile(p, "appModule", onlyDir, function(f){
				isDir = server.isDirectory(f);
				f = server.convertFilePathName(f);
				return (isDir || (!onlyDir && server.extractDir(f) !== server.packagePath.appModule && "js" === server.extractFileExt(f)));
			});
			result = {
				success: 1,
				value: r
			};
		}
		return result;
	}

});
