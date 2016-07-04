
//RIAStudio Server config.

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
//	appRoot: "jssrc/app-rq-my" ///发布的应用物理路径，比如: "jssrc/riasApp"。使用相对路径时，是相对于 jar 包的，不能包含"appRoot"、"riasLib"、"webLib"、"serverLib"、"serverApp"、"webApp"等字符串。
//},
var riasServerConfig = {
	debugLevel: "info",
	appsRoot: "jssrc",
	dojoFile: "jssrc/serverLib/dojo-1.10.4/dojo/dojo.js",
	dojoBaseUrl: "jssrc/serverLib/dojo-1.10.4/dojo",
	riasLib: "jssrc/rias-1.0.0", ///rias 包的物理路径。使用相对路径时，是相对于 jar 包的，一般为: "jssrc/rias"。可以作为 appConfig.config.raisLib 的缺省值。
	webLib: "jssrc/webLib", ///web 端的 lib 物理路径，使用相对路径时，是相对于 jar 包的，一般为 "jssrc/Weblib" 。可以作为 appConfig.config.raisLib 的缺省值。
	defaultLanguage: "zh",
	maxResultRecords: 9999,

	jettyConfig: {
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
		//"serverId": "11",
		minThreads: 4,
		maxThreads: 20,
		maxQueued: 1000,///请求队列长度
		maxFormContentSize: 4 * 1024 * 1024, /// form 提交的最大字节数
		//maxUploadSize: 10 * 1024 * 1024,
		port: 8088,
		maxIdleTime: 60000, //表示连接最大空闲时间，默认值300000.
		acceptors: 3, //表示同时在监听read事件的线程数，缺省值为2，对于NIO来说，建议值2-（处理器核数+1）.
		lowResourceMaxIdleTime: 5000, //表示线程稀少时的maxIdleTime，一般设置为 <= maxIdleTime. 
		//lowResourcesConnections: 只有NIO才有这个设置，表示连接空闲时的最大连接数，大于这个数将被shutdown，
		// 每个acceptor的连接数 =（lowResourcesConnections + acceptors - 1）/ acceptors
		lowResourcesConnections: 5000,
		//contextRoot: "jssrc",
		webContext: "/", ///访问的url根。
		"session-dbName": "app-riaeasy",///服务名，用于集群中区分服务
		"sessionid-workerName": "riass1",///服务名，用于集群中区分服务
		"sessionid-scavengeInterval": 65,///秒，扫描间隔？
		//"session-timeout": 30,///分钟
		//"session-cookie": "JSESSIONID",///cookie key-name
		//"session-httpOnly": false,
		//"session-secureCookies": false,
		"session-saveInterval": 15,///秒，持久化间隔(缓存时间)，分布式时，建议为 0.

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
	appPackage: {
		//riasApp: "../../../riasApp",///应用包的名称，及相对于 dojoBaseUrl 的路径。
		"app-riaeasy": {
			//port: 8088,
			//appPath: "../../../app-riaeasy",///应用包的名称，及相对于 dojoBaseUrl 的路径。
			dbs: {
				"app-riaeasy": "app-riaeasy"
			},
			defaultDbName: "app-riaeasy",
			"session-timeout": 15,
			"session-cookie": "JSESSIONID",
			"session-httpOnly": false,
			"session-secureCookies": false,
			"session-saveInterval": 0,//60,
			xactslog: 1
		}
	},
	dbConfigs: {
		"app-riaeasy": {
			dbType: "mysql",
			driverClassName: "com.mysql.jdbc.Driver",
			url: "jdbc:mysql://localhost:3306/riaeasy?autoReconnect=true&amp;allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=utf-8&amp;mysqlEncoding=utf8",
			username: "riaeasy",
			password: "riaeasy",
			defaultCatalog: "riaeasy", //连接池创建的连接的默认的catalog
			validationQuery: "SELECT COUNT(*) FROM DUAL", //验证连接是否成功, SQL SELECT 指令至少要返回一行
			//defaultReadOnly: false,//对于数据库是否只能读取, 默认值为 false
			//defaultAutoCommit: true,//对于事务是否 autoCommit, 默认值为 true
			initialSize: 5, //连接池启动时创建的连接数量，默认为8
			maxTotal: 30, //同一时间可以从池分配的最多连接数量。设置为0时表示无限制。
			maxIdle: 10, //池里不会被释放的最多空闲连接数量。设置为0时表示无限制。
			minIdle: 5, //在不新建连接的条件下，池中保持空闲的最少连接数。
			maxWait: 15000, //在抛出异常之前，池等待连接被回收的最长时间（当没有可用连接时）, 单位为 ms。设置为-1表示无限等待。
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
	xlsDefine: {
		showTitle: true,
		titleFontName: "",
		titleHeight: 500,
		titleFontBold: 800,
		titleFontHeight: 240,
		flexColumnWidth: 200,
		headerFontName: "",
		headerHeight: 320,
		headerFontBold: 800,
		headerFontHeight: 180,
		headerFontColor: 8,
		headerFontBgColor: "",
		rowFontName: "",
		rowFontHeight: 180,
		rowHeight: 320,
		rowFontBold: 360,
		freezeHeader: false
	}
};
var dojoConfig = {
	baseUrl: riasServerConfig.dojoBaseUrl, //host-rhino 需要显式指定，从 riasServerConfig 获取路径。
	has: {
		"dojo-publish-privates": 1,
		"dojo-undef-api": 1
	},
	bindEncoding: "UTF-8",
	"dom": 0, //Ensures the DOM code is available.保证DOM 代码可用//设为0才能支持 Rhino
	"host-browser": 0, //确定构建的代码是用于浏览器平台的//设为0才能支持 Rhino
	"host-rhino": 1,
	"host-node": 0,
	"host-webworker": 0,
	"dojo-firebug": 0,
	isDebug: true,
	parseOnLoad: false,
	async: true, //rhino中，同步模式下 dojo.js 需要修改: 第 1954 行。
	//cacheBust: new Date(),
	waitSeconds: 15,
	//locale: "zh-cn",
	extraLocale: ["en"],
	packages: [
		///需要仔细配置
		//{name: 'dijit', location: '../dijit'},
		{name: "rias", location: "../../../../" + (riasServerConfig.riasLib ? riasServerConfig.riasLib : "jssrc/rias"), main: "rias"}
	]
};




