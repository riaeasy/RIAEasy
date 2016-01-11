
//RIAStudio Server config.

var riasServerConfig = {

	dojoFile: "jssrc/serverLib/dojo/dojo.js",
	dojoBaseUrl: "jssrc/serverLib/dojo",
	riasLib: "jssrc/rias", ///rias 包的物理路径。使用相对路径时，是相对于 jar 包的，一般为: "jssrc/rias"。可以作为 appConfig.config.raisLib 的缺省值。
	webLib: "jssrc/webLib", ///web 端的 lib 物理路径，使用相对路径时，是相对于 jar 包的，一般为 "jssrc/Weblib" 。可以作为 appConfig.config.raisLib 的缺省值。

	appPackage: {
		"app-rq-my": "../../app-riaeasy"///应用包的名称，及相对于 dojoBaseUrl 的路径。
	}
};

var dojoConfig = {
	baseUrl: riasServerConfig.dojoBaseUrl, //从 riasServerConfig 获取路径。
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
	waitSeconds: 30,
	//locale: "zh-cn",
	extraLocale: ["en"],
	packages: [
		///需要仔细配置
		{name: "rias", location: "../../.." + (riasServerConfig.riasLib ? "/" + riasServerConfig.riasLib : "jssrc/rias"), main: "rias"}
	]
};

