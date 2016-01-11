

//RIAStudio Server Action of xdict/query.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

//当有 id 查询条件时，不取分页信息。如果要针对 id 字段进行查询，请使用 idq 作为条件名。

define([
	"rias"
], function (rias) {

	return function (method, req, res) {
		var server = this,
			table = "xdict",
			args, p,
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
			if(result.success){
				result = server.defaultDb.updateRecord({
					sql: "update xdict set children = (select count(*) from (select * from xdict) d where d.idp = xdict.id)"
				});
			}
		}
		function dele(req) {
			result = server.defaultDb.deleteRecord({
				table: table,//单表表名
				_idDirty: server.getConditionSrv(0, req, "_idDirty").split(","),
				where: []
			});
			if(result.success){
				result = server.defaultDb.updateRecord({
					sql: "update xdict set children = (select count(*) from (select * from xdict) d where d.idp = xdict.id)"
				});
			}
		}
		function modi(req) {
			result = server.defaultDb.updateRecord({
				table: table,//单表表名
				sets: server.getParameters(req),
				_idDirty: server.getConditionSrv(0, req, "_idDirty").split(","),
				where: []
			});
			if(result.success){
				result = server.defaultDb.updateRecord({
					sql: "update xdict set children = (select count(*) from (select * from xdict) d where d.idp = xdict.id)"
				});
			}
		}

		if(method === "GET"){
			args = {
				select: "r.*, d.code as parentCode",
				from: table + " r\n"
					+ "left join xdict d\n"
					+ "on d.id = r.idp",
				where: [],
				orderby: "",
				limit: ""
			};

			if(p = server.getConditionSrv(0, req, "id")){
				args.where.push({
					logic: "and",
					condition: p.indexOf("%") < 0 ? server.getEqualStrSrv(0, "r.id", p) : server.getLikeStrSrv(0, "r.id", p)
				});
			}else if(p = server.getConditionSrv(0, req, "parentId")){
				args.where.push({
					logic: "and",
					condition: p.indexOf("%") < 0 ? server.getEqualStrSrv(0, "r.idp", p) : server.getLikeStrSrv(0, "r.idp", p)
				});
			}else if(p = server.getConditionSrv(0, req, "parentCode")){
				args.where.push({
					logic: "and",
					condition: "r.idp = (select id from xdict where code = '" + p + "')"
				});
			}else if(p = server.getConditionSrv(0, req, "code")) {
				args.where.push({
					logic: "and",
					condition: p.indexOf("%") < 0 ? server.getEqualStrSrv(0, "r.code", p) : server.getLikeStrSrv(0, "r.code", p)
				});
			}else{
				server.getLimitSrv(0, req, args);
				if(p = server.getConditionSrv(0, req, "idq")){
					args.where.push({
						logic: "and",
						condition: server.getLikeStrSrv(0, "r.id", p)
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
					"r.id, r.code, r.text, d.code as parentCode"
				].join("\n");
			}else if(args.where.length === 0 && args.limit === ""){
				args.where.push({
					logic: "and",
					condition: "0 = 1"
				});
			}
			args.defaultSort = "id";
			args.ignoreBlob = false;
			args._queryOptions = rias.mixin(args._queryOptions, {maxResultRecords: -1});
			server.getOrderBySrv(0, req, args);

			result = server.defaultDb.queryPage(args);
		}else if(method === "PUT"){
			modi(req);
		}else if(method === "POST"){
			if(server.getConditionSrv(0, req, "_idDirty")){
				modi(req);
			}else{
				add(req);
			}
		}else if(method === "DELETE"){
			dele(req);
		}
		return result;

	}

});