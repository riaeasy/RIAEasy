

//RIAStudio Server Action of login.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			oper = rias.host.ServerEnv.getSessionOper(req),
			password = app.getConditionSrv(0, req, "text"),
			result = {
				success: false,
				value: ""
			};

		//if(!app.setXdHeader(req, result)){
		//	return result;
		//}

		if (method === "PUT" || method === "POST") {
			if(oper && oper.logged && password){
				password = rias.encoding.SimpleAES.decrypt(password, "riaeasy");
				password = rias.encoding.MD5(password, rias.encoding.outputTypes.String);
				result = app.defaultDb.updateRecord({
					table: "xoper",//单表表名
					sets: {
						dpassword: password
					},
					_idDirty: [oper.id],///必须是 array
					where: []
				});
			}else{
				result.responseCode = rias.host.responseCode.SC_UNAUTHORIZED;
				result.success = false;
				result.value = "需要登录.";
			}
		}else if(method === "OPTIONS"){
			result.success = oper && oper.logged;
		}

		return result;

	}

});
