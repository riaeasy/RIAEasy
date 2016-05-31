

//RIAStudio Server Action of appMain/getMenu.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	var rightCode = "act/appMain/getMenu";

	return function (method, req, res, oper) {
		var server = this,
			sql;
		var result = {
			success: false,
			value: ''
		};

		if(!server.setXdHeader(req, result, oper, rightCode, method)){
			return result;
		}

		sql = "select distinct l.*, r.idp, r.cat, r.code, r.text, r.stat, r.typ, r.dcmd, r.ord, '1' as lvl, if(r.children=0, 1, 0) as leaf,\n"
			+ "       if(length(r.id)<=3, 1, 0) as isroot, \n"
			+ "       case r.expanded when 1 then 1 when 0 then 0 else null end as expanded,\n"
			+ "       dicon,\n"
			+ "       diconfile\n"
			+ "from (\n"
			+ "       select r.didoper as idoper, r.didright as id\n"
			+ "       from xoperright r\n"
			+ "       where r.didoper='developer'\n"
			+ "       union \n"
			+ "       select p.account as idoper, l.idright as id\n"
			+ "       from xoperrole p\n"
			+ "       left join xroleright l\n"
			+ "       on l.id=p.idrole\n"
			+ "       where p.account='developer'\n"
			+ "       union\n"
			+ "       select 'developer' as idoper, t.id as id\n"
			+ "       from xright t\n"
			+ ") l\n"
			+ "inner join xright r\n"
			+ "on r.id=l.id\n"
			+ "order by r.idp, r.ord";

		var rs = server.defaultDb.queryPage({
			sql: sql
		});

		return {
			header: result.header,
			code: rs.code,
			success: rs.success,
			value: rs.value,
			args: rs.args
		};

	}

});
