

define([
	"rias"
], function (rias) {

	var data = [
		{
			"id":101,
			"parentId":1,
			"code":"xroot",
			"text":"系统字典",
			"typ":"-1",
			"stat":"1",
			"ord":0,
			"children":1,
			"expanded":1,
			"dtyp":"cat",
			"dval":"",
			"dinfo":"",
			"parentCode":null
		},{
			"id":101001,
			"parentId":101,
			"code":"sys",
			"text":"系统公用类",
			"typ":"String",
			"stat":"1",
			"ord":0,
			"children":3,
			"expanded":1,
			"dtyp":"",
			"dval":"sys",
			"dinfo":"",
			"parentCode":"xroot"
		},{
			"id":101001001,
			"parentId":101001,
			"code":"_lock",
			"text":"锁定类型",
			"typ":"系统项目",
			"stat":"启用",
			"ord":0,
			"children":0,
			"expanded":1,
			"dtyp":"cat",
			"dval":"_lock",
			"dinfo":"",
			"parentCode":"sys"
		},{
			"id":101001003,
			"parentId":101001,
			"code":"booltyp",
			"text":"是//否",
			"typ":"String",
			"stat":"1",
			"ord":0,
			"children":0,
			"expanded":1,
			"dtyp":"",
			"dval":"boolean",
			"dinfo":"",
			"parentCode":"sys"
		},{
			"id":101001011,
			"parentId":101001,
			"code":"xdicttyp",
			"text":"字典分类",
			"typ":"String",
			"stat":"1",
			"dtnew":"2015-09-27T00:08:16Z",
			"dtcreate":"2012-05-03T21:17:33Z",
			"opcreate":-1,
			"ord":0,
			"children":0,
			"expanded":1,
			"dtyp":"cat",
			"dval":"xdicttyp",
			"dinfo":"",
			"parentCode":"sys"
		},{
			"id":102,
			"parentId":1,
			"code":"droot",
			"text":"用户字典",
			"typ":"-1",
			"stat":"1",
			"ord":2,
			"children":0,
			"expanded":1,
			"dtyp":"cat",
			"dval":"102",
			"dinfo":"",
			"parentCode":null
		}
	];

	var rightCode = "act/xdict/query";

	return function (method, req, res, oper) {
		var server = this,
			table = "xdict",
			args, p,
			header = {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "X-Requested-With,X-Range,Range",
				"Access-Control-Expose-Headers": "Accept-Ranges,Content-Encoding,Content-Length,Content-Range",
				"Access-Control-Allow-Methods": "GET,OPTIONS"
			},
			rs,
			result = {
				success: false,
				value: ""
			};

		if(!server.setXdHeader(req, result, oper, rightCode, method)){
			return result;
		}

		function add(req) {
			rs = server.defaultDb.insertRecord({
				table: table,//单表表名
				values: server.getParameters(req),
				where: []
			});
			if(rs.success){
				rs = server.defaultDb.updateRecord({
					sql: "update " + table + " set children = (select count(*) from (select * from " + table + ") d where d.idp = " + table + ".id)"
				});
			}
		}
		function dele(req) {
			rs = server.defaultDb.deleteRecord({
				table: table,//单表表名
				_idDirty: server.getConditionSrv(0, req, "_idDirty").split(","),
				where: []
			});
			if(rs.success){
				rs = server.defaultDb.updateRecord({
					sql: "update " + table + " set children = (select count(*) from (select * from " + table + ") d where d.idp = " + table + ".id)"
				});
			}
		}
		function modify(req) {
			rs = server.defaultDb.updateRecord({
				table: table,//单表表名
				sets: server.getParameters(req),
				_idDirty: server.getConditionSrv(0, req, "_idDirty").split(","),
				where: []
			});
			if(rs.success){
				rs = server.defaultDb.updateRecord({
					sql: "update " + table + " set children = (select count(*) from (select * from " + table + ") d where d.idp = " + table + ".id)"
				});
			}
		}

		if(method === "GET" || method === "TOEXCEL"){
			args = {
				select: "r.*, r.idp as parentId, ifnull(d.code, '') as parentCode",
				from: table + " r\n"
							+ "left join " + table + " d\n"
					+ "on d.id = r.idp",
				where: [],
				orderby: "",
				limit: ""
			};

			if(p = server.getConditionSrv(0, req, "id")){
				args.where.push({
					logic: "and",
					condition: p.indexOf("%") < 0 && p.indexOf("*") < 0 ? server.getEqualStrSrv(0, "r.id", p) : server.getLikeStrSrv(0, "r.id", p)
				});
			}else if(p = server.getConditionSrv(0, req, "parentId")){
				args.where.push({
					logic: "and",
					condition: p.indexOf("%") < 0 && p.indexOf("*") < 0 ? server.getEqualStrSrv(0, "r.idp", p) : server.getLikeStrSrv(0, "r.idp", p)
				});
			}else if(p = server.getConditionSrv(0, req, "parentCode")){
				args.where.push({
					logic: "and",
					condition: "r.idp = (select id from " + table + " where code = '" + p + "')"
				});
			}else if(p = server.getConditionSrv(0, req, "code")) {
				args.where.push({
					logic: "and",
					condition: p.indexOf("%") < 0 && p.indexOf("*") < 0 ? server.getEqualStrSrv(0, "r.code", p) : server.getLikeStrSrv(0, "r.code", p)
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
					"r.id, r.idp as parentId, r.code, r.text, r.typ, r.stat, r.ord, r.children, r.expanded, r.dtyp, r.dval, r.dinfo, ifnull(d.code, '') as parentCode"
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

			rs = server.defaultDb.queryPage(args);
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
			rs = {
				success: true,
				value: ''
			};
		}

		return {
			header: result.header,
			code: rs.code,
			success: rs.success,
			value: rs.value,
			args: rs.args
		};

	}

});
