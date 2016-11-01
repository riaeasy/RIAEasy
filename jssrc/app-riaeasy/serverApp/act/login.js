

//RIAStudio Server Action of login.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			rs = null,
			code = app.getConditionSrv(0, req, "code"),
			password = app.getConditionSrv(0, req, "password"),
			idoper,
			rights = {},
			i, l, item,
			sql,
			result = {
				success: false,
				value: {
					logged: false,
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
				result.value.oper = rias.host.ServerEnv.getSessionOper(req);
			}else{
				sql = "select r.*\n"
					+ "from xoper r\n"
					+ "where r.code='" + code + "'\n";
				rs = app.defaultDb.query1Array(sql);
				if(rs && rs.count > 0){
					rs = rs.data[0];
					if(password){
						password = rias.encoding.SimpleAES.decrypt(password, "riaeasy");
						password = rias.encoding.MD5(password, rias.encoding.outputTypes.String);
					}
					if(!rs.dpassword || rs.dpassword === password){
						result.value.oper = {
							logged: true,
							appName: app.appName,
							ip: rias.host.getRemoteIp(req),
							id: rs.id,
							code: rs.code,
							name: rs.text || rs.code,
							petname: rs.dtext,
							dept: rs.dept,
							rights: rights
						};

						idoper = rs.id;
						sql = "select distinct l.*, r.idp, r.cat, r.code, r.text, r.stat, r.typ\n"
							+ "from (\n"
							+ (idoper !== -1 ?
							"       select r.idoper as idoper, r.idright as id\n"
							+ "       from xoperright r\n"
							+ "       where r.idoper = " + idoper + "\n"
							+ "       union \n"
							+ "       select p.idoper as idoper, l.idright as id\n"
							+ "       from xoperrole p\n"
							+ "       left join xroleright l\n"
							+ "       on l.idrole = p.idrole\n"
							+ "       where p.idoper = " + idoper + "\n" :
							"       select " + idoper + " as idoper, t.id as id\n"
							+ "       from xright t\n")
							+ ") l\n"
							+ "inner join xright r\n"
							+ "on r.id = l.id\n"
							+ "order by r.idp, r.ord";
						rs = app.defaultDb.query1Array(sql);
						if(rs && rs.count > 0){
							for(i = 0, l = rs.count; i < l; i++){
								item = rs.data[i];
								if(item.code){
									rights[rias.trim(item.code).toLowerCase()] = 1;
								}
							}
							result.value.oper.rights = rights;
						}

						result.success = true;
						rias.host.ServerEnv.setSessionOper(req, result.value.oper, true);
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

		result.value.logged = result.value.oper.logged;
		return result;

	}

});
