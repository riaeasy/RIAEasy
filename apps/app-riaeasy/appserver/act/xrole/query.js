

//RIAStudio Server Action of xoper/query.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

//当有 id 查询条件时，不取分页信息。如果要针对 id 字段进行查询，请使用 idq 作为条件名。

define([
	"riass/riassBase"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			table = "xrole",
			args, p,
			result = {
				success: false,
				value: ''
			};

		function modify(req) {
			result = app.defaultDb.transactionUpdate({
				table: table,//单表表名
				sets: app.getParameters(req),
				_idDirty: app.fetchParam(req, "_idDirty").split(",")
			});
		}

		if(method === "GET" || method === "TOEXCEL"){
			args = {
				select: "r.*",///TODO:zensst. 判断权限，取不同字段
				from: table + " r",
				where: [],
				orderby: ""
			};

			if((p = app.fetchParam(req, "id"))){
				args.where.push({
					logic: "and",
					condition: app.defaultDb.getEqualStr("r.id", p)
				});
			}else if((p = app.fetchParam(req, "parentId"))){
				args.where.push({
					logic: "and",
					condition: app.defaultDb.getEqualStr("r.idp", p)
				});
			}else if((p = app.fetchParam(req, "code"))) {
				args.where.push({
					logic: "and",
					condition: app.defaultDb.getEqualStr("r.code", p)
				});
			}else {
				app.fetchLimit(req, args);
				if((p = app.fetchParam(req, "idq"))){
					args.where.push({
						logic: "and",
						condition: app.defaultDb.getLikeStr("r.id", p)
					});
				}
				if((p = app.fetchParam(req, "typ"))){
					args.where.push({
						logic: "and",
						condition: app.defaultDb.getLikeStr("r.typ", p)
					});
				}
				if((p = app.fetchParam(req, "text"))){
					args.where.push({
						logic: "and",
						condition: app.defaultDb.getLikeStr("r.text", p)
					});
				}
			}
			if((p = app.fetchParam(req, "_initData"))){
				args.select = [
					"r.id, r.code, r.text, r.typ"
				].join("\n");
			}else if(args.where.length === 0 && !args.count){
				args.where.push({
					logic: "and",
					condition: "0 = 1"
				});
			}
			args.where.push({
				logic: "and",
				condition: "id <> -1"
			});
			args.orderby = app.defaultDb.getOrderBy(req, "r.id");

			result = app.defaultDb.queryAsString(args);
		}else if(method === "PUT"){
			modify(req);
		}else if(method === "POST"){
			if(app.fetchParam(req, "_idDirty")){
				modify(req);
			}else{
				result = app.defaultDb.transactionInsert({
					table: table,//单表表名
					values: app.getParameters(req)
				});
			}
		}else if(method === "DELETE"){
			result = app.defaultDb.transactionDelete({
				table: table,//单表表名
				_idDirty: app.fetchParam(req, "_idDirty").split(",")
			});
		}
		return result;

	};

});
