

//RIAStudio Server Action of riasd/saveAppModule.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	var js0 = 'define([\n'
		+ '	"rias"${0}\n'
		+ '], function(rias${1}){\n'
		+ '	return ${2}\n'
		+ '	\n'
		+ '});\n';

	return function (method, req, res) {
		var server = this,
			pn = server.fetchByName(req, "pathname", _typeStr),
			fn = server.extractFilenameNoExt(pn),
			mp = server.changeFileExt(pn, ""),// (server.extractFileExt(pn) === "js" ? pn.replace(/\.js$/gi, "") : pn),//转换为无文件后缀
			rp = mp.replace(/^appModule/, "rsfsModule"),
			rsf = server.fetchByName(req, "_rsf", _typeStr),
			_meta,
			rsfs,
			ss = ["", "", "{}"],
			text,
			r,
			result = {
				success: false,
				value: 0
			};
		pn = server.extractDir(mp);///取 mp 的目录
		if(!/^[\w\/]+$/.test(mp)){///要允许 / 存在，但是不允许 .\ 存在。
			result = {
				success: false,
				value: "模块名包含不合规字符..."
			};
		//}else if(pn == "" || /appModule$/gi.test(pn) || /appModule\/app$/gi.test(pn)){///不允许在 root 目录保存文件
		}else if(pn == "" || /appModule$/gi.test(pn)){///不允许在 root 目录保存文件
			result = {
				success: false,
				value: "缺少操作权限..."
			};
		}else{
			rsf = (rsf ? rias.fromJson(rsf) : {});
			_meta = rias.mixin({
				_rsfVersion: 0
			}, rsf._meta);
			rsfs = server.readJson(rp + ".rsfs", "rsfsModule", true);
			rsfs = {
				_opened: (rsfs._opened && rsfs._opened.sessionid ? rsfs._opened : {
					sessionid: ""
				}),
				_count: (rsfs._count > 0 ? rsfs._count : 49),
				position: (rsfs.position > 0 ? rsfs.position : 0),
				rsfVersion: (rsfs.rsfVersion > 0 ? rsfs.rsfVersion : _meta._rsfVersion),
				items: (rias.isArray(rsfs.items) ? rsfs.items : [])
			};
			rsfs.rsfVersion++;
			pn = server.extractDir(rp) + "/" + fn + "_rsf/" + fn + "_" + rsfs.rsfVersion + ".rsf";
			_meta._rsfVersion = rsfs.rsfVersion;
			_meta = rias.toJson(_meta, {
				prettyPrint: true,
				includeFunc: true,
				loopToString: false,
				errorToString: true,
				simpleObject: true
			});
			ss[2] = _meta;
			text = rias.substitute(js0, ss);
			r = server.writeText(mp + ".js", "appModule", text);
			if(r > 0){
				r = server.writeText(pn, "rsfsModule", _meta, true);//json 格式，不是 js
				if(r > 0){
					rsf = {
						rsfVersion: rsfs.rsfVersion,///防止客户端数据修改
						reload: (!!rsf.reload ? !!rsf.reload : true),
						pix: (rias.isString(rsf.pix) ? rsf.pix : ""),
						isMobileApp: (!!rsf.isMobileApp ? !!rsf.isMobileApp : false),
						rotate: (!!rsf.rotate ? !!rsf.rotate : false)
					};
					if(rsfs.position > rsfs.items.length - 1){
						rsfs.position = rsfs.items.length - 1;
					}
					while(rsfs.items.length > 0 && rsfs.items.length >= rsfs._count){
						rsfs.position--;
						pn = rsfs.items.shift();
						if(pn.rsfVersion){
							pn = server.extractDir(rp) + "/" + fn + "_rsf/" + fn + "_" + pn.rsfVersion + ".rsf";
							server.deleteFile(pn, "rsfsModule");
						}
					}
					///两种改变 rsfs.items 各有优缺点。
					///改变 rsfs.items 为长度小于应有长度 - 1，后面 push() 后刚好。
					///position 可能为 -1，为避免死循环，应 rsfs.items.length > 0
					//if(rsfs.items.length > rsfs.position + 1){
					//	rsfs.items = rsfs.items.slice(0, rsfs.position);
					//}
					while(rsfs.items.length > 0 && rsfs.items.length > rsfs.position + 1){
						pn = rsfs.items.pop();
						if(pn.rsfVersion){
							pn = server.extractDir(rp) + "/" + fn + "_rsf/" + fn + "_" + pn.rsfVersion + ".rsf";
							server.deleteFile(pn, "rsfsModule");
						}
					}
					rsfs.items.push(rsf);
					if(rsfs.items.length > rsfs.position + 1){
						rsfs.position++;
					}
					r = server.writeJson(rp + ".rsfs", "rsfsModule", rsfs, {}, true);
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
