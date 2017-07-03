

//RIAStudio Server Action of xdict/query.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

//当有 id 查询条件时，不取分页信息。如果要针对 id 字段进行查询，请使用 idq 作为条件名。

define([
	"riass/riassBase"
], function (rias) {

	return function (method, req, res) {
		var app = this,
			table = "xdict",
			args, p,
			result = {
				success: false,
				value: ''
			};

		if(method === "GET"){
			args = {
				//select: "r.*, r.idp as parentId, ifnull(d.code, '') as parentCode",
				from: table + " r\n"
					+ "left join " + table + " d\n"
					+ "on d.id = r.idp",
				where: [],
				orderby: ""
			};

			if((p = app.fetchParam(req, "_initData"))){
				if(app.defaultDb.dbType === "MSSQL"){
					args.select = [
						"r.id, r.idp as parentId, r.code, r.text, r.typ, r.stat, r.ord, r.children, r.expanded, r.dtyp, r.dval, r.dinfo, isnull(d.code, '') as parentCode"
					].join("\n");
				}else{
					args.select = [
						"r.id, r.idp as parentId, r.code, r.text, r.typ, r.stat, r.ord, r.children, r.expanded, r.dtyp, r.dval, r.dinfo, ifnull(d.code, '') as parentCode"
					].join("\n");
				}
			}else{
				if(app.defaultDb.dbType === "MSSQL"){
					args.select = "r.*, r.idp as parentId, isnull(d.code, '') as parentCode";
				}else{
					args.select = "r.*, r.idp as parentId, ifnull(d.code, '') as parentCode";
				}
				if(args.where.length === 0 && !args.count){
					args.where.push({
						logic: "and",
						condition: "0 = 1"
					});
				}
			}
			args.orderby = app.defaultDb.getOrderBy(req, "r.id");

			result = app.defaultDb.queryAsString(args, undefined, {
				maxResultRecords: -1
			});
		}
		return result;

	};

});
