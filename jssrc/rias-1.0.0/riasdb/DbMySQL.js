define(["rias/riass/hostRhino","rias/riasdb/DbBase"],function(g,r){var q=g.declare("rias.riasdb.DbMySQL",[r],{dbType:"mysql",postCreate:function(){this.dbType="mysql";this.inherited(arguments)},_closeStatement:function(a){if(a)try{a.close()}catch(c){}},_closeResultSet:function(a){if(a){var c;try{c=a.getStatement()}catch(b){}finally{try{a.close()}catch(b){}this._closeStatement(c)}}},afterGetDbDefine:function(a){},getDbDefine:function(a){a=a||this.defaultCatalog;var c="select *\nfrom information_schema.COLUMNS\nwhere TABLE_SCHEMA \x3d '"+a+"' and (TABLE_NAME like 'D%' or TABLE_NAME like 'x%')\norder by TABLE_NAME, ORDINAL_POSITION\n",b=[],d=null,e={},f={},k=this.fieldTypeType,h,l;try{this.dbTables=e;b=this.query1Array(c,{maxResultRecords:-1});b=b.data;h=0;for(l=b.length;h<l;h++)d=b[h],e[d.TABLE_NAME]||(e[d.TABLE_NAME]={}),e[d.TABLE_NAME][d.COLUMN_NAME]||(e[d.TABLE_NAME][d.COLUMN_NAME]={}),f=e[d.TABLE_NAME][d.COLUMN_NAME],f.ord=d.ORDINAL_POSITION,f.name=d.COLUMN_NAME,f.display=d.COLUMN_NAME,f.type=d.DATA_TYPE.toUpperCase(),f.typetype=k[f.type],f.length=d.CHARACTER_MAXIMUM_LENGTH||d.NUMERIC_PRECISION||d.DATETIME_PRECISION,f.scale=d.NUMERIC_SCALE,f["default"]=d.COLUMN_DEFAULT,f.nullable="YES"===d.IS_NULLABLE?1:0,f.searchable=""!==d.COLUMN_KEY,f.auto="auto_increment"===d.EXTRA?1:0,f.comment=d.COLUMN_COMMENT;this.afterGetDbDefine(e)}catch(m){this.dbTables=void 0,g.log(3,this.logName,"getDbDefine("+this.dbName+"."+a+") error:\n"+m,m)}return this.dbTables},initConnection:function(){if(!this.dbName)throw Error("initConnection error: no dbName.");if(!this.dbConfig)throw Error("initConnection error: no dbConfig.");return g.host.db.initConnection(this.dbName,this.dbConfig)},openConnection:function(){if(!this.dbName)throw Error("openConnection error: no dbName.");var a=this.initConnection(),a=a.getConnection();if(!this.dbTables)try{this.getDbDefine()}catch(c){g.log(3,this.logName,"The Connection getDbDefine Error: '"+this.dbName+"', "+c,c)}return a},closeConnection:function(a){if(a)try{if(!a.isClosed())try{a.getAutoCommit()||a.commit()}catch(c){a.rollback()}finally{a.close()}}catch(c){}},_beginTransaction:function(a,c){a.getAutoCommit()||a.commit();a.setAutoCommit(!1);c?"readUncommitted"==c?a.setTransactionIsolation(1):c.equals("readCommitted")?a.setTransactionIsolation(2):c.equals("repeatableRead")?a.setTransactionIsolation(4):c.equals("serializable")?a.setTransactionIsolation(8):a.setTransactionIsolation(2):a.setTransactionIsolation(2)},_endTransaction:function(a,c){try{c.success?a.commit():(g.log(3,this.logName,"Transaction error.",c.value),a.rollback())}catch(b){g.log(3,this.logName,"Transaction error.",b),a.rollback()}finally{a.setAutoCommit(!0)}},transaction:function(a,c){var b,d={success:!1,value:""};try{b=this.openConnection(),this._beginTransaction(b,c&&c.isolation),d=a(b),this._endTransaction(b,d),d.success?c&&g.isFunction(c.successCallback)&&c.successCallback(d):c&&g.isFunction(c.errorCallback)&&c.errorCallback(d)}catch(e){d={success:!1,value:"Transaction error."},this._endTransaction(b,d),g.log(3,this.logName,"Transaction error.",e),c&&g.isFunction(c.errorCallback)&&c.errorCallback(d,e)}finally{b&&this.closeConnection(b)}return d},transactionSqls:function(a,c){var b,d={success:!1,value:""};try{b=this.openConnection(),this._beginTransaction(b,c&&c.isolation),d=this._querySqls(b,a),this._endTransaction(b,d),d.success?c&&g.isFunction(c.successCallback)&&c.successCallback(d):c&&g.isFunction(c.errorCallback)&&c.errorCallback(d)}catch(e){d={success:!1,value:"Transaction error."},this._endTransaction(b,d),g.log(3,this.logName,"Transaction error.",e),c&&g.isFunction(c.errorCallback)&&c.errorCallback(d,e)}finally{b&&this.closeConnection(b)}return d},_resultsToArray:function(a,c,b){var d=[],e=[],f=a.getMetaData(),k=f.getColumnCount(),h=0,l=b||this.maxResultRecords;for(b=1;b<=k;b++)e.push([g.host.jsString(f.getColumnLabel(b)),f.getColumnType(b)]);for(;a.next()&&!(-1<l&&h>l);){f={};for(b=1;b<=k;b++)try{f[e[b-1][0]]=g.host.db.getField(a,b,e[b-1][1],c,!1)}catch(m){throw g.log(3,this.logName,"_getField("+e[b-1][1]+") error - fieldname:"+e[b-1][0]+m.javaException,m),e[b-1][0]+": "+m;}d.push(f);h++}return{count:h,data:d}},_resultsToString:function(a,c,b){a=g.host.db.toJSONArray(a,g.toInt(b,this.maxResultRecords));return{count:a.length(),data:a.toString()}},_query:function(a,c,b,d){var e=0,f=0;g.isDebug&&(e=new Date);var k,h=null,l=null;d=d?d:"query";try{k=a.prepareStatement(c),h="query"==d?k.executeQuery():"update"==d?k.executeUpdate():k.execute()?k.getResultSet():1,"query"==d?l=b&&b.resultsToString?this._resultsToString(h,b&&b.ignoreBlob,b&&b.maxResultRecords):this._resultsToArray(h,b&&b.ignoreBlob,b&&b.maxResultRecords):"queryS"==d?l=this._resultsToString(h,b&&b.ignoreBlob,b&&b.maxResultRecords):"update"==d?l=g.host.jsNumber(h):"execute"==d&&(l=g.host.jsNumber(h)),g.isDebug&&(f=new Date,g.log(0,this.logName,"Executed... \n"+c+"\n\u8017\u65f6\uff1a"+(f-e)+" \u6beb\u79d2\uff0c\u4ece"+g.formatDatetime(e,"HH:mm:ss:SSS")+" \u5230 "+g.formatDatetime(f,"HH:mm:ss:SSS")+"\n"))}catch(m){g.log(3,this.logName,"Execute error... \n"+c,m);if(g.isDebug)throw m+"\n"+c;throw m;}finally{h instanceof java.sql.ResultSet&&this._closeResultSet(h)}return l},_querySqls:function(a,c,b){var d=0,e=0;g.isDebug&&(d=new Date);var f,k=null,h={success:!1,value:""},l=0,m,p;!g.isArray(c)&&(c=[c]);try{for(m=c.length;l<m;l++){p=c[l];try{f=a.prepareStatement(p),k=f.execute()?f.getResultSet():1,g.isDebug&&(e=new Date,g.log(0,this.logName,"Executed... \n"+p+"\n\u8017\u65f6\uff1a"+(e-d)+" \u6beb\u79d2\uff0c\u4ece"+g.formatDatetime(d,"HH:mm:ss:SSS")+" \u5230 "+g.formatDatetime(e,"HH:mm:ss:SSS")+"\n"))}catch(n){g.log(3,this.logName,"Execute error... \n"+n,n);if(g.isDebug)throw n+"\n"+p;throw n;}}h.success=!0;h.value=k}catch(n){k=null;h.success=!1;h.value="\u5904\u7406\u5931\u8d25...";g.log(3,this.logName,"Execute error... \n"+n,n);if(g.isDebug)throw n+"\n"+c;throw n;}finally{h.value=1==k?g.host.jsNumber(k):null==k?-1:b&&b.resultsToString?this._resultsToString(k,b&&b.ignoreBlob,b&&b.maxResultRecords):this._resultsToArray(k,b&&b.ignoreBlob,b&&b.maxResultRecords),k instanceof java.sql.ResultSet&&this._closeResultSet(k)}return h},getInsertSql:function(a){var c=this.dbTables[a.table],b,d,e=null,f="",k=[],h=[],l=g.trim(a.where);d="";for(b in a.values)if(c.hasOwnProperty(b)&&(d=c[b],!d.auto&&(f=d.typetype.toLowerCase(),e=a.values[b],"undefiend"!==e&&"blob"!==f))){if(null===e||"NaN"===e)e=d["default"]?"string"===f?"'"+d["default"]+"'":"date"===f?"'"+g.formatDatetime(d["default"],"yyyy-MM-dd HH:mm:ss")+"'":d["default"]:"null";else if(""===e)if("string"===f)e="''";else{if("int"===f||"decimal"===f||"float"===f||"boolean"===f)e=d["default"]?d["default"]:"null"}else"string"===f?e="'"+e+"'":"date"===f&&(e="'"+g.formatDatetime(e,"yyyy-MM-dd HH:mm:ss")+"'");k.push(b);h.push(e)}if(0<h.length)if(h.length===k.length)k="       ("+k.join(",")+")",h="values ("+h.join(",")+")";else throw"function insertRecord Error. The request parameter incorrect.";else h=k="";return d="insert into "+a.table+"\n"+k+"\n"+h+"\n"+(l&&0<l.length?"where "+this.getWhere(l):"")},insertRecord:function(a){var c={success:!1,value:""},b=a.sql||this.getInsertSql(a);c.success=0<this.execute1(b);c.args=a;return c},getDeleteSql:function(a){var c=g.trim(a.where),b=g.trim(a._idDirty),d="string"===this.dbTables[a.table].id.typetype,e="";1===b.length?c.push({logic:"and",condition:d?" id \x3d '"+b[0]+"'":" id \x3d "+b[0]}):1<b.length&&c.push({logic:"and",condition:d?" id in ('"+b.join("','")+"')":" id in ("+b.join(",")+")"});if(1>c.length)throw"function deleteRecord Error. No 'where'.";return e="delete from "+a.table+"\nwhere "+this.getWhere(c)},deleteRecord:function(a){var c={success:!1,value:""},b=a.sql||this.getDeleteSql(a);c.success=0<this.execute1(b);c.args=a;return c},getUpdateSql:function(a){var c=this.dbTables[a.table],b,d,e=null,f="",k=[],h=g.trim(a.where),l=g.trim(a._idDirty),m="string"===this.dbTables[a.table].id.typetype;for(b in a.sets)if(c.hasOwnProperty(b)&&"_idDirty"!==b&&!c[b].auto&&(d=c[b],f=d.typetype.toLowerCase(),e=a.sets[b],"undefiend"!==e&&"blob"!==f)){if(null===e||"NaN"===e)e=d["default"]?"string"===f?"'"+d["default"]+"'":"date"===f?"'"+g.formatDatetime(d["default"],"yyyy-MM-dd HH:mm:ss")+"'":d["default"]:"null";else if(""===e)if("string"===f)e="''";else{if("int"===f||"decimal"===f||"float"===f||"boolean"===f)e=d["default"]?d["default"]:"null"}else"string"===f?e="'"+e+"'":"date"===f&&(e="'"+g.formatDatetime(e,"yyyy-MM-dd HH:mm:ss")+"'");k.push(b+" \x3d "+e)}if(0<k.length)k="set "+k.join(",")+"";else throw"function updateRecord Error. No 'set'.";1===l.length?h.push({logic:"and",condition:m?" id \x3d '"+l[0]+"'":" id \x3d "+l[0]}):1<l.length&&h.push({logic:"and",condition:m?" id in ('"+l.join("','")+"')":" id in ("+l.join(",")+")"});if(1>h.length)throw"function updateRecord Error. No 'where'.";return"update "+a.table+" r\n"+k+" \nwhere "+this.getWhere(h)},updateRecord:function(a){var c={success:!1,value:""},b=a.sql||this.getUpdateSql(a);c.success=0<=this.update1(b);c.args=a;return c},getQuerySql:function(a){var c="",b="",d=[],e="",f="",k="",c="";if(a.sql)c=a.sql;else{c="select "+(a.select?a.select:"*")+"\n";b="from "+a.from+"\n";d=g.trim(a.where);e=a.groupby?a.groupby+"\n":"";f=a.orderby?a.orderby+"\n":"";k=a.limit?a.limit:"";d=d&&0<d.length?"where "+this.getWhere(d)+"\n":"";if(!a.from||""===g.trim(a.from))throw"function queryPage Error. No 'from'.";c=c+b+d+e+f+k}return c},queryRecord:function(a){var c=null,b={success:!0,value:""},c=a.sql||this.getQuerySql(a),c=a._queryOptions&&a._queryOptions.queryAsArray?this.query1Array(c,a._queryOptions):this.query1String(c,a._queryOptions);!a.limit&&c&&g.isNumber(c.count)&&(a.count=c.count,a.start=0,a.end=0<a.count?a.count-1:-1);b.value=c.data;b.args=a;return b},queryPage:function(a){var c="",b="",d=[],e="",f="",k="",c="",h=null,l={success:!0,value:""};if(a.sql)c=a.sql;else{c="select "+(a.select?a.select:"*")+"\n";b="from "+a.from+"\n";d=g.trim(a.where);e=a.groupby?a.groupby+"\n":"";f=a.orderby?a.orderby+"\n":"";k=a.limit?a.limit:"";d=d&&0<d.length?"where "+this.getWhere(d)+"\n":"";if(!a.from||""===g.trim(a.from))throw"function queryPage Error. No 'from'.";a.limit&&(h=this.query1Array("select count(*) as c_\nfrom (select 1 as c_\n"+b+d+e+") r",a._queryOptions),a.count=h&&0<h.count?h.data[0].c_:-1);c=c+b+d+e+f+k}h=a._queryOptions&&a._queryOptions.queryAsArray?this.query1Array(c,a._queryOptions):this.query1String(c,a._queryOptions);!a.limit&&h&&g.isNumber(h.count)&&(a.count=h.count,a.start=0,a.end=0<a.count?a.count-1:-1);l.value=h.data;l.args=a;return l},updateChildren:function(a){var c,b=g.trim(a.where);c="";var d={success:!1,value:""};c="set r.children \x3d (select count(*) from (select * from "+a.table+") as d where d.idp \x3d r.id)\n";b=b&&0<b.length?"where "+this.getWhere(b)+"\n":"";c="update "+a.table+" r\n"+c+b;d.success=0<=this.update1(c);d.args=a;return d}});q._riasdMeta={visual:!1,iconClass:"riaswDbMySQLIcon",iconClass16:"riaswDbMySQLIcon16",defaultParams:function(a){return g.mixinDeep({dbType:"mysql"},a)}};return q});