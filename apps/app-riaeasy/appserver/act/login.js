

//RIAStudio Server Action of login.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"riass/riassBase"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			rs = null,
			code = app.fetchParam(req, "code"),
			password = app.fetchParam(req, "password"),
			rights = {},
			i, l, item,
			sql,
			result = {
				success: false,
				value: {
					oper: {
						logged: false,
						appName: app.appName,
						ip: "0",
						id: undefined,
						code: "",
						name: "",
						petname: "",
						dept: "",
						rights: rights
					}
				}
			};

		//if(!app.setXdHeader(req, result)){
		//	return result;
		//}

		if (method === "GET" || method === "POST") {
			if(!code){
				result.success = true;
				result.value.oper = app.getSessionOper(req);
			}else{
				code = rias.encoding.SimpleAES.decrypt(code, "riaeasy");
				sql = "select r.*\n"
					+ "from xoper r\n"
					+ "where r.code = ?\n";
				rs = app.defaultDb.queryAsArray(sql, [{
					type: "STRING",
					value: code
				}]);
				if(rs.success && rs.value.length > 0){
					rs = rs.value[0];
					if(password){
						password = rias.encoding.SimpleAES.decrypt(password, "riaeasy");
						password = rias.encoding.MD5(password, rias.encoding.outputTypes.String);
					}
					if(!rs.dpassword || rs.dpassword === password){
						result.value.oper = {
							logged: true,
							appName: app.appName,
							ip: app.getRemoteIp(req),
							id: rs.id,
							code: rs.code,
							name: rs.text || rs.code,
							petname: rs.dtext,
							dept: rs.dept,
							rights: rights
						};

						sql = "select distinct l.*, r.idp, r.cat, r.code, r.text, r.stat, r.typ\n"
							+ "from (\n"
							+ (rs.id !== -1
							? "       select r.idoper as idoper, r.idright as id\n"
							+ "       from xoperright r\n"
							+ "       where r.idoper = ?\n"
							+ "       union \n"
							+ "       select p.idoper as idoper, l.idright as id\n"
							+ "       from xoperrole p\n"
							+ "       left join xroleright l\n"
							+ "       on l.idrole = p.idrole\n"
							+ "       where p.idoper = ?\n"
							: "       select ? as idoper, t.id as id\n"
							+ "       from xright t\n")
							+ ") l\n"
							+ "inner join xright r\n"
							+ "on r.id = l.id\n"
							+ "order by r.idp, r.ord";
						rs = app.defaultDb.queryAsArray(sql, (rs.id !== -1 ? [{
							type: "INT",
							value: rs.id
						}, {
							type: "INT",
							value: rs.id
						}] : [{
							type: "INT",
							value: rs.id
						}]));
						if(rs.success){
							for(i = 0, l = rs.value.length; i < l; i++){
								item = rs.value[i];
								if(item.code){
									rights[rias.trim(item.code).toLowerCase()] = 1;
								}
							}
							result.value.oper.rights = rights;
							result.success = true;
							app.setSessionOper(req, result.value.oper);
						}else{
							result.success = false;
						}
					}else{
						result.success = true;
					}
				}else{
					result.success = true;
				}
			}
		}else if(method === "OPTIONS"){
			result.success = true;
		}

		return result;

	};

});
