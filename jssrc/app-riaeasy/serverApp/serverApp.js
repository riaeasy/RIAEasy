//RIAStudio Server Runtime(rias).

define([
	"rias"
], function (rias) {

	return {
		config: {
			debugLevel: "debug",
			"charset": "",
			//"serialNumber": "ooooooo",
			//"log2DB": "none",
			//"startTask": true,
			"cacheEnabled": true,
			//"cacheFileMaxSize": 30720,
			//"cacheCheckModified": true,
			//"cacheGzipMinSize": 1 * 1024,///server.rsCache 启动Gzip的最小字节数
			//"cacheGzipMaxSize": 1 * 1024 * 1024,///server.rsCache 启动Gzip的最大字节数
			"respGzipMinSize": 1 * 1024, ///server.response 启动Gzip的最小字节数
			"respGzipMaxSize": 1 * 1024 * 1024, ///server.response 启动Gzip的最大字节数
			"serverId": "11",
			minThreads: 10,
			maxThreads: 50,
			maxFormContentSize: 4 * 1024 * 1024, /// form 提交的最大字节数
			//maxUploadSize: 10 * 1024 * 1024,
			port: 8088,
			acceptors: 3, //表示同时在监听read事件的线程数，缺省值为2，对于NIO来说，建议值2-（处理器核数+1）.
			webContext: "/", ///访问的url根。

			//path: {
			/*系统目录结构
			 * riasLib
			 * webLib
			 * webLib/dojo
			 * webLib/dgrid
			 * webLib/dstore
			 * webLib/gridx
			 * webLib/orion
			 * appRoot ///riasApp
			 * appRoot/serverApp
			 * appRoot/serverApp/servlet
			 * appRoot/serverApp/act
			 * appRoot/serverApp/func
			 * appRoot/serverApp/db
			 * appRoot/webApp
			 * appRoot/webApp/module
			 * appRoot/webApp/nls
			 * appRoot/webApp/themes
			 * appRoot/rsfs
			 * appRoot/rsfs/module
			 * */
			//	riasLib: riasServerConfig.riasLib,//"jssrc/rias", ///rias 包的物理路径。使用相对路径时，是相对于 jar 包的，发布时一般为: "jssrc/rias"。
			//	webLib: riasServerConfig.webLib,//"jssrc/webLib", ///web 端的 lib 物理路径，使用相对路径时，是相对于 jar 包的，一般为 "jssrc/Weblib" 。
			//	appRoot: "jssrc/app-riaeasy" ///发布的应用物理路径，比如: "jssrc/riasApp"。使用相对路径时，是相对于 jar 包的，不能包含"appRoot"、"riasLib"、"webLib"、"serverLib"、"serverApp"、"webApp"等字符串。
			//},

			defaultDbName: "db/app-riaeasy",
			//dbPlugin: [
			//	"rias/riasdb/DbMySQL"
			//],
			dbConfig: {
				"db/app-riaeasy": {
					dbType: "mysql",
					maxResultRecords: 999,
					driverClassName: "com.mysql.jdbc.Driver",
					url: "jdbc:mysql://localhost:3306/riaeasy?autoReconnect=true&amp;allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=utf-8&amp;mysqlEncoding=utf8",
					username: "riaeasy",
					password: "riaeasy",
					defaultCatalog: "riaeasy", //连接池创建的连接的默认的catalog
					validationQuery: "SELECT COUNT(*) FROM DUAL", //验证连接是否成功, SQL SELECT 指令至少要返回一行
					//defaultReadOnly: false,//对于数据库是否只能读取, 默认值为 false
					//defaultAutoCommit: true,//对于事务是否 autoCommit, 默认值为 true
					initialSize: 10, //连接池启动时创建的连接数量，默认为8
					maxActive: 30, //同一时间可以从池分配的最多连接数量。设置为0时表示无限制。
					maxIdle: 30, //池里不会被释放的最多空闲连接数量。设置为0时表示无限制。
					minIdle: 10, //在不新建连接的条件下，池中保持空闲的最少连接数。
					maxWait: 30000, //在抛出异常之前，池等待连接被回收的最长时间（当没有可用连接时）, 单位为 ms。设置为-1表示无限等待。
					//minEvictableIdleTimeMillis: 1000 * 60 * 30,//连接保持空闲而不被驱逐的最长时间。大于0 ，进行连接空闲时间判断，或为0，对空闲的连接不进行验证；默认30分钟
					//timeBetweenEvictionRunsMillis：-1,//失效检查线程运行时间间隔，如果小于等于0，不会启动检查线程，默认-1，以毫秒为单位。
					//poolPreparedStatements: false,//是否对已备语句进行池管理（布尔值）。
					//maxOpenPreparedStatements: 0,//同一时间能够从语句池里分配的已备语句的最大数量。设置为0时表示无限制。
					logAbandoned: true, //回收事件后，在log中打印出回收Connection的错误信息
					removeAbandoned: true, //是否自我中断, 默认是 false
					removeAbandonedTimeout: 180, //几秒后会自我中断, removeAbandoned 必须为 true
					testOnBorrow: true, //取得对象时是否进行验证，检查对象是否有效，默认为false
					testOnReturn: true, //返回对象时是否进行验证，检查对象是否有效，默认为false
					testWhileIdle: true//空闲时是否进行验证，检查对象是否有效，默认为false
				}
			},
			//monitorDir: [//只能监控目录，不能监控文件。///是文件系统的路径，不是 dojo 模块名，相对于 appRoot 的路径。
			//	//"riasLib/riass",
			//	"serverApp/act"
			//],

			defaultServletPath: "/",
			servlet: [{
					//	module: "servlet/rsCache", ///servlet模块路径，相对于 serverApp 的路径，是文件系统的路径，不是 dojo 模块名
					//	url: "/*"
					//}, {
					module: "servlet/action", ///servlet模块路径，相对于 serverApp 的路径，是文件系统的路径，不是 dojo 模块名
					url: "/act/*"
				}]
		},
		appVersion: {
			major: 1, minor: 0, patch: 0, flag: "",
			revision: 1.0,
			toString: function () {
				var v = rias.version;
				return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
					" (RIAStudio:" + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
			}
		},
		appBuildtime: "@buildtime@",
		appOwner: "成都世高科技有限公司",
		appUser: "成都世高科技有限公司",
		appTitle: "RIAEasy 1.0"
	};

});