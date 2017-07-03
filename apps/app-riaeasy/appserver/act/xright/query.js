

//RIAStudio Server Action of xright/query.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

//当有 id 查询条件时，不取分页信息。如果要针对 id 字段进行查询，请使用 idq 作为条件名。

define([
	"riass/riassBase"
], function (rias) {

	return function (method, req, res) {
		var app = this,
			table = "xright",
			args, p,
			result = {
				success: false,
				value: ''
			};

		function modify(req) {
			result = app.defaultDb.transactionDo([
				app.defaultDb.getUpdateSql({
					table: table,//单表表名
					sets: app.getParameters(req),
					_idDirty: app.fetchParam(req, "_idDirty").split(","),
					where: []
				}),
				"update " + table + " set children = (select count(*) from (select * from " + table + ") d where d.idp = " + table + ".id)"
			]);
		}

		if(method === "GET" || method === "TOEXCEL"){
			if((p = app.fetchParam(req, "_loadRights"))){
				var sql = "select distinct r.id, r.idp as parentId, r.code, r.text, r.stat, r.typ, r.ord, r.children,\n"
					//+ "       if(length(r.id) <= 3, 1, 0) as isroot, \n"
					//+ "       case r.expanded when 1 then 1 when 0 then 0 else null end as expanded,\n"
					+ "       r.dicon,\n"
					+ "       r.idp as parentId, ifnull(d.code, '') as parentCode\n"
					+ "from " + table + " r\n"
					+ "left join " + table + " d\n"
					+ "on d.id = r.idp\n"
					+ "order by r.id";
				result = app.defaultDb.queryAsString(sql);
			}else {
				args = {
					select: "r.*",
					from: table + " r",
					where: [],
					orderby: ""
				};

				if((p = app.fetchParam(req, "id"))){
					args.where.push({
						logic: "and",
						condition: app.defaultDb.getEqualStr("r.id", p, true)
					});
				}else if((p = app.fetchParam(req, "parentId"))){
					args.where.push({
						logic: "and",
						condition: app.defaultDb.getEqualStr("r.idp", p, true)
					});
				}else if((p = app.fetchParam(req, "code"))) {
					args.where.push({
						logic: "and",
						condition: app.defaultDb.getEqualStr("r.code", p, true)
					});
				}else{
					app.fetchLimit(req, args);
					if((p = app.fetchParam(req, "idq"))){
						args.where.push({
							logic: "and",
							condition: app.defaultDb.getLikeStr("r.id", p)
						});
					}
					if((p = app.fetchParam(req, "text"))){
						args.where.push({
							logic: "and",
							condition: app.defaultDb.getLikeStr("r.text", p)
						});
					}
				}
				if(args.where.length === 0 && !args.count){
					args.where.push({
						logic: "and",
						condition: "0 = 1"
					});
				}
				args.orderby = app.defaultDb.getOrderBy(req, "r.id");

				result = app.defaultDb.queryAsString(args);
			}
		}else if(method === "PUT"){
			modify(req);
		}else if(method === "POST"){
			if(app.fetchParam(req, "_idDirty")){
				modify(req);
			}else{
				app.defaultDb.transactionDo(function(conn){
					result = app.defaultDb.executeInsert(conn, {
						table: table,//单表表名
						values: app.getParameters(req)
					});
					if(result.success){
						result = app.defaultDb.executeSql(conn, "update " + table + " set children = (select count(*) from (select * from " + table + ") d where d.idp = " + table + ".id)");
					}
				});
			}
		}else if(method === "DELETE"){
			app.defaultDb.transactionDo(function(conn){
				result = app.defaultDb.executeDelete(conn, {
					table: table,//单表表名
					_idDirty: app.fetchParam(req, "_idDirty").split(",")
				});
				if(result.success){
					result = app.defaultDb.executeSql(conn, "update " + table + " set children = (select count(*) from (select * from " + table + ") d where d.idp = " + table + ".id)");
				}
			});
		}
		return result;

	};

});
