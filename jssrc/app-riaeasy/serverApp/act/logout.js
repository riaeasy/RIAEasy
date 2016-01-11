

//RIAStudio Server Action of logout.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var server = this,
			conn = null,
			rs = null,
			sql,
			result = {
				success: false,
				value: {
					logged: false,
					oper: {
						code: "",
						name: "",
						rights: {}
					}
				}
			};

		/*sql = "select distinct l.*, r.idp, r.cat, r.code, r.text, r.stat, r.typ, r.dcmd, r.ord, '1' as lvl, if(r.children=0, 'true', 'false') as leaf,\n"
			+ "       if(length(r.id)<=3, 'true', 'false') as isroot, \n"
			+ "       case r.expanded when '1' then 'true' when '0' then 'false' else null end as expanded,\n"
			+ "       if(r.typ = '1', if(length(r.dicon)>1, r.dicon, if(r.children=0, 'applicationIcon', '')), 'acceptIcon') as dicon,\n"
			+ "       if(length(r.diconfile)>1, r.diconfile, 'application.png') as diconfile\n"
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
		rs = server.defaultDb.queryPage({
			sql: sql
		}, res);*/
		result.success = true;
		result.value.logged = false;

		return result;

	}

});
