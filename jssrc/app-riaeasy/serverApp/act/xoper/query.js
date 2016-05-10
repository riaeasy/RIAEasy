

//RIAStudio Server Action of xoper/query.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

//当有 id 查询条件时，不取分页信息。如果要针对 id 字段进行查询，请使用 idq 作为条件名。

define([
	"rias"
], function(rias) {

	return function (method, req, res, call) {
		var server = this,
			table = "xoper",
			args, p,
			header = {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "X-Requested-With,X-Range,Range",
				"Access-Control-Expose-Headers": "Accept-Ranges,Content-Encoding,Content-Length,Content-Range",
				"Access-Control-Allow-Methods": "GET,OPTIONS"
			},
			result = {
				success: false,
				value: ''
			};
		function add(req) {
			result = server.defaultDb.insertRecord({
				table: table,//单表表名
				values: server.getParameters(req),
				where: []
			});
		}
		function dele(req) {
			result = server.defaultDb.deleteRecord({
				table: table,//单表表名
				_idDirty: server.getConditionSrv(0, req, "_idDirty").split(","),
				where: []
			});
		}
		function modify(req) {
			result = server.defaultDb.updateRecord({
				table: table,//单表表名
				sets: server.getParameters(req),
				_idDirty: server.getConditionSrv(0, req, "_idDirty").split(","),
				where: []
			});
		}

		if(method === "GET" || method === "TOEXCEL"){
			args = {
				select: "r.*",///TODO:zensst. 判断权限，取不同字段
				from: table + " r",
				where: [],
				orderby: "",
				limit: ""
			};

			if(p = server.getConditionSrv(0, req, "id")){
				args.where.push({
					logic: "and",
					condition: server.getEqualStrSrv(0, "r.id", p)
				});
			}else if(p = server.getConditionSrv(0, req, "parentId")){
				args.where.push({
					logic: "and",
					condition: server.getEqualStrSrv(0, "r.idp", p)
				});
			}else if(p = server.getConditionSrv(0, req, "code")) {
				args.where.push({
					logic: "and",
					condition: server.getEqualStrSrv(0, "r.code", p)
				});
			}else {
				server.getLimitSrv(0, req, args);
				if(p = server.getConditionSrv(0, req, "idq")){
					args.where.push({
						logic: "and",
						condition: server.getLikeStrSrv(0, "r.id", p)
					});
				}
				if(p = server.getConditionSrv(0, req, "typ")){
					args.where.push({
						logic: "and",
						condition: server.getLikeStrSrv(0, "r.typ", p)
					});
				}
				if(p = server.getConditionSrv(0, req, "text")){
					args.where.push({
						logic: "and",
						condition: server.getLikeStrSrv(0, "r.text", p)
					});
				}
			}
			if(p = server.getConditionSrv(0, req, "_initData")){
				args.select = [
					"r.id, r.code, r.text, r.typ"
				].join("\n");
			}else if(args.where.length === 0 && args.limit === ""){
				args.where.push({
					logic: "and",
					condition: "0 = 1"
				});
			}
			args.where.push({
				logic: "and",
				condition: "id <> -1"
			});
			args.defaultSort = "id";
			server.getOrderBySrv(0, req, args);

			result = server.defaultDb.queryPage(args);
			result.header = header;
		}else if(method === "PUT"){
			modify(req);
		}else if(method === "POST"){
			if(server.getConditionSrv(0, req, "_idDirty")){
				modify(req);
			}else{
				add(req);
			}
		}else if(method === "DELETE"){
			dele(req);
		}else if(method === "OPTIONS"){
			result = {
				success: true,
				value: ''
			};
			result.header = header;
		}
		return result;

	}

});
