define(["rias/base/hostRhino","rias/riasdb/DbBase"],function(f,q){var p=f.declare("rias.riasdb.DbMySQL",[q],{dbType:"mysql",_closeStatement:function(a){if(a)try{a.close()}catch(c){}},_closeResultSet:function(a){if(a){var c;try{c=a.getStatement()}catch(b){}finally{try{a.close()}catch(b){}this._closeStatement(c)}}},afterGetDbDefine:function(a){},getDbDefine:function(a){a=a||this.defaultCatalog;a="select *\nfrom information_schema.COLUMNS\nwhere TABLE_SCHEMA \x3d '"+a+"' and (TABLE_NAME like 'D%' or TABLE_NAME like 'x%')\norder by TABLE_NAME, ORDINAL_POSITION\n";var c=[],b=null,d={},e={},g=this.fieldTypeType,k,h;try{this.dbTables=d;c=this.query1Array(a,{maxResultRecords:-1});c=c.data;k=0;for(h=c.length;k<h;k++)b=c[k],d[b.TABLE_NAME]||(d[b.TABLE_NAME]={}),d[b.TABLE_NAME][b.COLUMN_NAME]||(d[b.TABLE_NAME][b.COLUMN_NAME]={}),e=d[b.TABLE_NAME][b.COLUMN_NAME],e.ord=b.ORDINAL_POSITION,e.name=b.COLUMN_NAME,e.display=b.COLUMN_NAME,e.type=b.DATA_TYPE.toUpperCase(),e.typetype=g[e.type],e.length=b.CHARACTER_MAXIMUM_LENGTH||b.NUMERIC_PRECISION||b.DATETIME_PRECISION,e.scale=b.NUMERIC_SCALE,e["default"]=b.COLUMN_DEFAULT,e.nullable="YES"===b.IS_NULLABLE?1:0,e.searchable=""!==b.COLUMN_KEY,e.auto="auto_increment"===b.EXTRA?1:0,e.comment=b.COLUMN_COMMENT;this.afterGetDbDefine(d)}catch(l){this.dbTables=void 0,f.log(3,"riasdb","getDbDefine("+this.dbConnName+"."+this.dbName+") error:\n"+l)}return this.dbTables},initConnection:function(){if(!this.dbConnName)throw Error("initConnection error: no dbConnName.");if(!this.dbConnConfig)throw Error("initConnection error: no dbConnConfig.");return f.host.db.initConnection(this.dbConnName,this.dbConnConfig)},openConnection:function(){if(!this.dbConnName)throw Error("openConnection error: no dbConnName.");var a=this.initConnection(),a=a.getConnection();if(!this.dbTables)try{this.getDbDefine()}catch(c){f.log(3,"server","The Connection getDbDefine Error: '"+connName+"', "+c)}return a},closeConnection:function(a){if(a)try{if(!a.isClosed())try{a.getAutoCommit()||a.commit()}catch(c){a.rollback()}finally{a.close()}}catch(c){}},_beginTransaction:function(a,c){a.getAutoCommit()||a.commit();a.setAutoCommit(!1);c?"readUncommitted"==c?a.setTransactionIsolation(1):c.equals("readCommitted")?a.setTransactionIsolation(2):c.equals("repeatableRead")?a.setTransactionIsolation(4):c.equals("serializable")?a.setTransactionIsolation(8):a.setTransactionIsolation(2):a.setTransactionIsolation(2)},_endTransaction:function(a,c){try{c.success?a.commit():(f.log(3,"riasdb","Transaction error.\n",c.value),a.rollback())}catch(b){f.log(3,"riasdb","Transaction error.",c.value,b),a.rollback()}finally{a.setAutoCommit(!0)}},transaction:function(a,c){var b,d={success:!1,value:""};try{b=this.openConnection(),this._beginTransaction(b,c&&c.isolation),d=a(b),this._endTransaction(b,d),d.success?c&&f.isFunction(c.successCallback)&&c.successCallback(d):c&&f.isFunction(c.errorCallback)&&c.errorCallback(d)}catch(e){d={success:!1,value:"Transaction error."},this._endTransaction(b,d),f.log(3,"riasdb","Transaction error.",e),c&&f.isFunction(c.errorCallback)&&c.errorCallback(d,e)}finally{b&&this.closeConnection(b)}return d},transactionSqls:function(a,c){var b,d={success:!1,value:""};try{b=this.openConnection(),this._beginTransaction(b,c&&c.isolation),d=this._querySqls(b,a),this._endTransaction(b,d),d.success?c&&f.isFunction(c.successCallback)&&c.successCallback(d):c&&f.isFunction(c.errorCallback)&&c.errorCallback(d)}catch(e){d={success:!1,value:"Transaction error."},this._endTransaction(b,d),f.log(3,"riasdb","Transaction error.\n",e),c&&f.isFunction(c.errorCallback)&&c.errorCallback(d,e)}finally{b&&this.closeConnection(b)}return d},_resultsToArray:function(a,c,b){var d=[],e=[],g=a.getMetaData(),k=g.getColumnCount(),h=0,l=b||this.maxResultRecords;for(b=1;b<=k;b++)e.push([f.host.jsString(g.getColumnLabel(b)),g.getColumnType(b)]);for(;a.next()&&!(-1<l&&h>l);){g={};for(b=1;b<=k;b++)try{g[e[b-1][0]]=f.host.db.getField(a,b,e[b-1][1],c,!1)}catch(m){throw f.log(3,"riasdb","_getField("+e[b-1][1]+") error - fieldname:"+e[b-1][0]+m.javaException),e[b-1][0]+": "+m;}d.push(g);h++}return{count:h,data:d}},_resultsToString:function(a,c,b){a=f.host.db.toJSONArray(a,b);return{count:a.length(),data:a.toString()}},_query:function(a,c,b,d){var e=0,g=0;f.isDebug&&(e=new Date);var k,h=null,l=null;d=d?d:"query";try{k=a.prepareStatement(c),h="query"==d?k.executeQuery():"update"==d?k.executeUpdate():k.execute()?k.getResultSet():1,"query"==d?l=b&&b.resultsToString?this._resultsToString(h,b&&b.ignoreBlob,b&&b.maxResultRecords):this._resultsToArray(h,b&&b.ignoreBlob,b&&b.maxResultRecords):"queryS"==d?l=this._resultsToString(h,b&&b.ignoreBlob,b&&b.maxResultRecords):"update"==d?l=f.host.jsNumber(h):"execute"==d&&(l=f.host.jsNumber(h)),f.isDebug&&(g=new Date,f.log(0,"riasdb","Executed... \n"+c+"\n\u8017\u65f6\uff1a"+(g-e)+" \u6beb\u79d2\uff0c\u4ece"+f.datetime.format(e,"HH:mm:ss:SSS")+" \u5230 "+f.datetime.format(g,"HH:mm:ss:SSS")+"\n"))}catch(m){f.log(3,"riasdb","Execute error... \n"+c+"\n");if(f.isDebug)throw m+"\n"+c;throw m;}finally{h instanceof java.sql.ResultSet&&this._closeResultSet(h)}return l},_querySqls:function(a,c,b){var d=0,e=0;f.isDebug&&(d=new Date);var g,k=null,h={success:!1,value:""},l=0,m,n;!f.isArray(c)&&(c=[c]);try{for(m=c.length;l<m;l++)n=c[l],g=a.prepareStatement(n),k=g.execute()?g.getResultSet():1,f.isDebug&&(e=new Date,f.log(0,"riasdb","Executed... \n"+n+"\n\u8017\u65f6\uff1a"+(e-d)+" \u6beb\u79d2\uff0c\u4ece"+f.datetime.format(d,"HH:mm:ss:SSS")+" \u5230 "+f.datetime.format(e,"HH:mm:ss:SSS")+"\n"));h.success=!0;h.value=k}catch(p){k=null;h.success=!1;h.value="\u5904\u7406\u5931\u8d25...";f.log(3,"riasdb","Execute error... \n"+n+"\n");if(f.isDebug)throw p+"\n"+n;throw p;}finally{h.value=1==k?f.host.jsNumber(k):null==k?-1:b&&b.resultsToString?this._resultsToString(k,b&&b.ignoreBlob,b&&b.maxResultRecords):this._resultsToArray(k,b&&b.ignoreBlob,b&&b.maxResultRecords),k instanceof java.sql.ResultSet&&this._closeResultSet(k)}return h},getInsertSql:function(a){var c=this.dbTables[a.table],b,d,e=null,g="",k=[],h=[],l=f.trim(a.where);d="";for(b in a.values)if(c.hasOwnProperty(b)&&(d=c[b],!d.auto&&(g=d.typetype.toLowerCase(),e=a.values[b],"undefiend"!==e&&"blob"!==g))){if(null===e||"NaN"===e)e=d["default"]?"string"===g?"'"+d["default"]+"'":"date"===g?"'"+f.datetime.format(d["default"],"yyyy-MM-dd HH:mm:ss")+"'":d["default"]:"null";else if(""===e)if("string"===g)e="''";else{if("int"===g||"decimal"===g||"float"===g||"boolean"===g)e=d["default"]?d["default"]:"null"}else"string"===g?e="'"+e+"'":"date"===g&&(e="'"+f.datetime.format(e,"yyyy-MM-dd HH:mm:ss")+"'");k.push(b);h.push(e)}if(0<h.length)if(h.length===k.length)k="       ("+k.join(",")+")",h="values ("+h.join(",")+")";else throw"function insertRecord Error. The request parameter incorrect.";else h=k="";return d="insert into "+a.table+"\n"+k+"\n"+h+"\n"+(l&&0<l.length?"where "+this.getWhere(l):"")},insertRecord:function(a){var c={success:!1,value:""},b=a.sql||this.getInsertSql(a);c.success=0<this.execute1(b);c.args=a;return c},getDeleteSql:function(a){var c=f.trim(a.where),b=f.trim(a._idDirty),d="string"===this.dbTables[a.table].id.typetype,e="";1===b.length?c.push({logic:"and",condition:d?" id \x3d '"+b[0]+"'":" id \x3d "+b[0]}):1<b.length&&c.push({logic:"and",condition:d?" id in ('"+b.join("','")+"')":" id in ("+b.join(",")+")"});if(1>c.length)throw"function deleteRecord Error. No 'where'.";return e="delete from "+a.table+"\nwhere "+this.getWhere(c)},deleteRecord:function(a){var c={success:!1,value:""},b=a.sql||this.getDeleteSql(a);c.success=0<this.execute1(b);c.args=a;return c},getUpdateSql:function(a){var c=this.dbTables[a.table],b,d,e=null,g="",k=[],h=f.trim(a.where),l=f.trim(a._idDirty),m="string"===this.dbTables[a.table].id.typetype;for(b in a.sets)if(c.hasOwnProperty(b)&&"_idDirty"!==b&&!c[b].auto&&(d=c[b],g=d.typetype.toLowerCase(),e=a.sets[b],"undefiend"!==e&&"blob"!==g)){if(null===e||"NaN"===e)e=d["default"]?"string"===g?"'"+d["default"]+"'":"date"===g?"'"+f.datetime.format(d["default"],"yyyy-MM-dd HH:mm:ss")+"'":d["default"]:"null";else if(""===e)if("string"===g)e="''";else{if("int"===g||"decimal"===g||"float"===g||"boolean"===g)e=d["default"]?d["default"]:"null"}else"string"===g?e="'"+e+"'":"date"===g&&(e="'"+f.datetime.format(e,"yyyy-MM-dd HH:mm:ss")+"'");k.push(b+" \x3d "+e)}if(0<k.length)k="set "+k.join(",")+"";else throw"function updateRecord Error. No 'set'.";1===l.length?h.push({logic:"and",condition:m?" id \x3d '"+l[0]+"'":" id \x3d "+l[0]}):1<l.length&&h.push({logic:"and",condition:m?" id in ('"+l.join("','")+"')":" id in ("+l.join(",")+")"});if(1>h.length)throw"function updateRecord Error. No 'where'.";return"update "+a.table+" r\n"+k+" \nwhere "+this.getWhere(h)},updateRecord:function(a){var c={success:!1,value:""},b=a.sql||this.getUpdateSql(a);c.success=0<=this.update1(b);c.args=a;return c},getQuerySql:function(a){var c="",b="",d=[],e="",g="",k="",c="";if(a.sql)c=a.sql;else{c="select "+(a.select?a.select:"*")+"\n";b="from "+a.from+"\n";d=f.trim(a.where);e=a.groupby?a.groupby+"\n":"";g=a.orderby?a.orderby+"\n":"";k=a.limit?a.limit:"";d=d&&0<d.length?"where "+this.getWhere(d)+"\n":"";if(!a.from||""===f.trim(a.from))throw"function queryPage Error. No 'from'.";c=c+b+d+e+g+k}return c},queryRecord:function(a){var c=null,b={success:!0,value:""},c=a.sql||this.getQuerySql(a),c=a._queryOptions&&a._queryOptions.queryAsArray?this.query1Array(c,a._queryOptions):this.query1String(c,a._queryOptions);!a.limit&&c&&f.isNumber(c.count)&&(a.count=c.count,a.start=0,a.end=0<a.count?a.count-1:-1);b.value=c.data;b.args=a;return b},queryPage:function(a){var c="",b="",d=[],e="",g="",k="",c="",h=null,l={success:!0,value:""};if(a.sql)c=a.sql;else{c="select "+(a.select?a.select:"*")+"\n";b="from "+a.from+"\n";d=f.trim(a.where);e=a.groupby?a.groupby+"\n":"";g=a.orderby?a.orderby+"\n":"";k=a.limit?a.limit:"";d=d&&0<d.length?"where "+this.getWhere(d)+"\n":"";if(!a.from||""===f.trim(a.from))throw"function queryPage Error. No 'from'.";a.limit&&(h=this.query1Array("select count(*) as c_\nfrom (select 1 as c_\n"+b+d+e+") r",a._queryOptions),a.count=h&&0<h.count?h.data[0].c_:-1);c=c+b+d+e+g+k}h=a._queryOptions&&a._queryOptions.queryAsArray?this.query1Array(c,a._queryOptions):this.query1String(c,a._queryOptions);!a.limit&&h&&f.isNumber(h.count)&&(a.count=h.count,a.start=0,a.end=0<a.count?a.count-1:-1);l.value=h.data;l.args=a;return l},updateChildren:function(a){var c,b=f.trim(a.where);c="";var d={success:!1,value:""};c="set r.children \x3d (select count(*) from (select * from "+a.table+") as d where d.idp \x3d r.id)\n";b=b&&0<b.length?"where "+this.getWhere(b)+"\n":"";c="update "+a.table+" r\n"+c+b;d.success=0<=this.update1(c);d.args=a;return d}});p._riasdMeta={visual:!1,iconClass:"riaswDbMySQLIcon",iconClass16:"riaswDbMySQLIcon16",defaultParams:function(a){return f.mixinDeep({dbType:"mysql"},a)}};return p});