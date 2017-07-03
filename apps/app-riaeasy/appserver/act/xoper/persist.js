

//RIAStudio Server Action of xoper/persist.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

//当有 id 查询条件时，不取分页信息。如果要针对 id 字段进行查询，请使用 idq 作为条件名。

define([
	"riass/riassBase"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			oper = app.getSessionOper(req),
			table = "xoper",
			args,
			result = {
				success: false,
				value: ''
			};

		function modify(req) {
			var text = app.fetchParam(req, "text");
			if(oper && oper.logged && text){
				result = app.defaultDb.transactionUpdate({
					table: table,//单表表名
					sets: {
						desktoppersist: text
					},
					_idDirty: [oper.id]///必须是 array
				});
			}else{
				//result.responseCode = rias.responseCode.SC_UNAUTHORIZED;
				//result.success = false;
				//result.value = "需要登录.";
				result.responseCode = rias.responseCode.SC_OK;
				result.success = true;
				result.value = "尚未登录，放弃";
			}
		}

		if(method === "GET"){
			args = {
				select: "r.id, r.code, r.desktoppersist",
				from: table + " r",
				where: [],
				orderby: ""
			};

			if(oper && oper.logged){
				args.where.push({
					logic: "and",
					condition: app.defaultDb.getEqualStr("r.id", oper.id)
				});
				result = app.defaultDb.queryAsString(args);
			}else{
				result.responseCode = rias.responseCode.SC_UNAUTHORIZED;
				result.success = false;
				result.value = "需要登录.";
			}
		}else if(method === "PUT"){
			modify(req);
		}else if(method === "POST"){
			//if(app.fetchParam(req, "_idDirty")){
				modify(req);
			//}else{
			//	add(req);
			//}
		//}else if(method === "DELETE"){
			//dele(req);
		}
		return result;

	};

});
