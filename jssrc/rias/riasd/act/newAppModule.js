

//RIAStudio Server Action of riasd/getAppModule.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	var js = 'define([\n'
			+ '	"rias"\n'
			+ '], function(rias){\n'
			+ '	return {\n'
			+ '		requires: [],\n'
			+ '		moduleCss: [],\n'
			+ '		_riaswVersion: "0.8",\n'
			+ '		region: "center",\n'
			+ '		caption: "新的页面模块",\n'
			+ '		title: "新的页面模块",\n'
			+ '		style: {\n'
			+ '		}\n'
			+ '	};\n'
			+ '});\n',
		rsfs = '{\n'
			+ '	"_opened": {\n'
			+ '		"sessionid": ""\n'
			+ '	},\n'
			+ '	"_count": 49,\n'
			+ '	"version": 1,\n'
			+ '	"position": 0,\n'
			+ '	"items": []\n'
			+ '}\n';

	///TODO:zensst. 控制文件数量。
	return function (method, req, res) {
		var server = this,
			pn = server.fetchByName(req, "pathname", _typeStr),
			fn = (server.extractFileExt(pn) === "js" ? pn.replace(/\.js$/gi, "") : pn),//转换为无文件后缀
			r,
			result = {
				success: false,
				value: 0
			};
		pn = server.extractDir(fn, "appModule");///取 fn 的目录
		if(!/^[\w\/]+$/.test(fn)){///要允许 / 存在，但是不允许 .\ 存在。
			result = {
				success: false,
				value: "模块名包含不合规字符..."
			};
		}else if(pn == "" || /appModule$/gi.test(pn)){///不允许在 root 目录创建文件
			result = {
				success: false,
				value: "缺少操作权限..."
			};
		}else{
			r = server.createNewFile(fn.replace(/^appModule/, "rsfsModule") + ".rsfs", "rsfsModule", rsfs);
			if(r === 1){
				r = server.createNewFile(fn + ".js", "appModule", js);
			}
			if(r === 2){
				result = {
					success: 0,
					value: "模块已经存在..."
				};
			}else{
				result = {
					success: (r === 1),
					value: r
				};
			}
		}
		return result;
	}

});
