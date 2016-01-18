

//RIAStudio Server Action of riasd/rsfsRedo.
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
			mp = server.changeFileExt(pn, ""),
			rp = mp.replace(/^appModule/, "rsfsModule"),
			ri,
			_meta,
			rsfs,
			ss = ["", "", "{}"],
			text,
			r,
			result = {
				success: false,
				value: 0
			};
		if(!/^[\w\/]+$/.test(mp)){///要允许 / 存在，但是不允许 .\ 存在。
			result = {
				success: false,
				value: "模块名包含不合规字符..."
			};
		}else{
			rsfs = server.readJson(rp + ".rsfs", "rsfsModule", true);
			rsfs = {
				_opened: (rsfs._opened && rsfs._opened.sessionid ? rsfs._opened : {
					sessionid: ""
				}),
				_count: (rsfs._count > 0 ? rsfs._count : 49),
				position: (rsfs.position > 0 ? rsfs.position : 0),
				//rsfVersion: (rsfs.rsfVersion > 0 ? rsfs.rsfVersion : 0),
				items: (rias.isArray(rsfs.items) ? rsfs.items : [])
			};
			///必须满足 rsfs.items.length > 0
			if(rsfs.items.length > 0){
				if(rsfs.position < rsfs.items.length - 1){
					if(rsfs.position < -1){
						rsfs.position = -1;
					}
					rsfs.position++;
					ri = rsfs.items[rsfs.position];
					if(ri && ri.rsfVersion){
						pn = server.extractDir(rp) + "/" + fn + "_rsf/" + fn + "_" + ri.rsfVersion + ".rsf";
						_meta = server.readJson(pn, "rsfsModule", true);
						rsfs.rsfVersion = _meta._rsfVersion = (_meta._rsfVersion > 0 ? _meta._rsfVersion : 1);
						_meta = rias.toJson(_meta, {
							prettyPrint: true,
							includeFunc: true,
							loopToString: false,
							errorToString: true,
							simpleObject: true
						});
						ss[2] = _meta;
						text = rias.substitute(js0, ss);
						r = server.writeText(mp + ".js", "appModule", text, true);
					}
				}
			}
			//if(r > 0){
				r = server.writeJson(rp + ".rsfs", "rsfsModule", rsfs, {}, true);
			//}

			result = {
				success: (r === 1),
				value: r
			};
		}
		return result;
	}

});
