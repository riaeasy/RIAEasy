
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xright
-- ----------------------------
DROP TABLE IF EXISTS `xright`;
CREATE TABLE `xright` (
  `id` decimal(15,0) NOT NULL DEFAULT '0' COMMENT '编码',
  `idp` decimal(15,0) NOT NULL DEFAULT '0' COMMENT '上级编码',
  `_lock` tinyint(4) NOT NULL DEFAULT '0',
  `cat` char(16) NOT NULL DEFAULT '' COMMENT '数据归属，保留',
  `code` char(20) NOT NULL DEFAULT '' COMMENT '代码，简称',
  `text` char(40) NOT NULL DEFAULT '' COMMENT '名称',
  `typ` tinyint(4) NOT NULL DEFAULT '0' COMMENT '类型（0：业务权限；1：业务菜单）',
  `stat` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态',
  `dtnew` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最新修改时间',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `opcreate` int(11) NOT NULL DEFAULT '0' COMMENT '创建人',
  `ord` int(11) NOT NULL DEFAULT '0' COMMENT '排序号',
  `children` int(11) NOT NULL DEFAULT '0' COMMENT '子项数',
  `expanded` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否展开（0：否；1：是）',
  `dtyp` char(4) NOT NULL DEFAULT '' COMMENT '命令类型（m：模块；u：链接）',
  `dcmd` char(255) NOT NULL DEFAULT '' COMMENT '命令字',
  `dicon` char(32) NOT NULL DEFAULT '' COMMENT '图标',
  `diconfile` char(32) NOT NULL DEFAULT '' COMMENT '图标文件',
  `dinfo` char(40) NOT NULL DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `xright1` (`idp`,`id`) USING BTREE,
  KEY `xright2` (`code`) USING BTREE,
  KEY `xright3` (`dtnew`),
  KEY `xright4` (`idp`,`ord`),
  KEY `xright5` (`text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xright
-- ----------------------------
INSERT INTO `xright` VALUES ('101', '1', '0', '', '', '平台管理', '1', '1', '2015-09-28 15:11:36', null, '0', '1', '3', '0', '', '', '', '', '');
INSERT INTO `xright` VALUES ('102', '1', '0', '', '', '系统管理', '1', '1', '2015-09-28 15:11:36', null, '0', '91', '4', '1', '', '', '', '', '');
INSERT INTO `xright` VALUES ('109', '1', '0', '', '', '数据分析', '1', '1', '2015-09-28 15:11:36', null, '0', '61', '4', '0', '', '', '', '', '');
INSERT INTO `xright` VALUES ('10102', '101', '0', '', '', '权限管理', '1', '1', '2015-09-28 15:11:36', null, '0', '2', '4', '1', '', '', '', '', '');
INSERT INTO `xright` VALUES ('10103', '101', '0', '', '', '基础数据维护', '1', '1', '2015-09-28 15:11:36', null, '0', '3', '2', '1', '', '', '', '', '');
INSERT INTO `xright` VALUES ('10106', '101', '0', '', '', '上传文档管理', '1', '1', '2015-09-28 15:11:36', '2012-06-17 00:00:00', '-1', '6', '1', '1', '', '', '', '', '');
INSERT INTO `xright` VALUES ('10202', '102', '0', '', '', '权限管理', '1', '1', '2015-09-28 15:11:08', null, '0', '1', '4', '1', '', '', '', '', '');
INSERT INTO `xright` VALUES ('10208', '102', '0', '', '', '基础信息', '1', '1', '2015-09-28 15:11:36', '2012-05-06 00:00:00', '-1', '3', '10', '1', '', '', '', '', '');
INSERT INTO `xright` VALUES ('10209', '102', '0', '', 'sysmonitor', '系统监控', '1', '1', '2015-09-28 15:11:36', '2012-06-22 00:00:00', '-1', '9', '1', '1', '', '', '', '', '');
INSERT INTO `xright` VALUES ('10211', '102', '0', '', '', '用户字典', '1', '1', '2015-09-28 15:11:36', '2012-07-07 00:00:00', '-1', '91', '1', '1', '', '', '', '', '');
INSERT INTO `xright` VALUES ('1010206', '10102', '0', '', 'xright_', '权限定义', '1', '1', '2015-09-28 15:11:36', null, '0', '0', '0', '0', '', 'appModule/xright/xrightQuery', '', 'expand-all.gif', '');
INSERT INTO `xright` VALUES ('1010207', '10102', '0', '', 'xdept_', '组织信息管理', '1', '1', '2015-09-28 15:11:36', null, '0', '3', '0', '1', '', '', '', 'chart_organisation.png', '');
INSERT INTO `xright` VALUES ('1010208', '10102', '0', '', 'xrole_', '角色管理', '1', '1', '2015-09-28 15:11:36', null, '0', '5', '0', '0', '', '', '', 'award_star_silver_3.png', '');
INSERT INTO `xright` VALUES ('1010209', '10102', '0', '', 'xoper_', '人员管理', '1', '1', '2015-09-28 15:11:36', '2012-05-06 00:00:00', '-1', '7', '0', '1', '', 'appModule/xright/xrightQuery', '', 'group_link.png', '');
INSERT INTO `xright` VALUES ('1010304', '10103', '0', '', 'xicon_', '系统预置图标', '1', '1', '2015-09-28 15:11:36', null, '0', '4', '0', '0', '', '', '', 'images.png', '');
INSERT INTO `xright` VALUES ('1010305', '10103', '0', '', 'xdict_', '系统字典', '1', '1', '2015-09-28 15:11:36', null, '0', '5', '0', '1', '', 'appModule/xdict/xdictQuery', '', 'docs.gif', '');
INSERT INTO `xright` VALUES ('1010501', '10105', '0', '', 'portalmain', '客户Portal首页', '1', '1', '2015-09-28 15:11:36', '2012-06-13 00:00:00', '-1', '0', '0', '0', '', '', '', 'user_comment.png', '');
INSERT INTO `xright` VALUES ('1010504', '10105', '0', '', '163', '外部页面', '1', '1', '2015-09-28 15:11:36', '2012-06-27 00:00:00', '-1', '51', '0', '0', '', '', '', '', '');
INSERT INTO `xright` VALUES ('1010505', '10105', '0', '', 'xright_43', '测试页面2', '1', '1', '2015-09-28 15:11:36', '2012-07-04 00:00:00', '-1', '0', '0', '0', '', '', '', 'expand-all.gif', '');
INSERT INTO `xright` VALUES ('1010601', '10106', '0', '', 'doc', '查询上传文档', '1', '1', '2015-09-28 15:11:08', '2012-06-17 00:00:00', '-1', '1', '1', '1', '', '', '', 'page_find.png', '');
INSERT INTO `xright` VALUES ('1020201', '10202', '0', '', 'xdept', '组织结构管理', '1', '1', '2015-09-28 15:11:36', null, '0', '3', '0', '0', '', '', '', 'chart_organisation.png', '');
INSERT INTO `xright` VALUES ('1020204', '10202', '0', '', 'xoper', '人员管理', '1', '1', '2015-09-28 15:11:36', null, '0', '7', '0', '0', '', '', '', 'user.png', '');
INSERT INTO `xright` VALUES ('1020205', '10202', '0', '', 'xrole', '角色管理', '1', '1', '2015-09-28 15:11:36', '2012-06-13 00:00:00', '-1', '5', '0', '0', '', '', '', 'award_star_silver_3.png', '');
INSERT INTO `xright` VALUES ('1020901', '10209', '0', '', 'xsession', '会话监控', '1', '1', '2015-09-28 15:11:36', '2012-06-22 00:00:00', '-1', '1', '0', '0', '', '', 'user_commentIcon', 'user_comment.png', '');
INSERT INTO `xright` VALUES ('1021101', '10211', '0', '', 'ddict', '用户字典', '1', '1', '2015-09-28 15:11:36', '2012-07-07 00:00:00', '-1', '1', '0', '0', '', '', 'docsIcon', 'docs.gif', '');
INSERT INTO `xright` VALUES ('101060101', '1010601', '0', '', 'docedit', '上传文档维护', '0', '1', '2015-09-28 15:11:36', '2012-06-17 00:00:00', '-1', '2', '0', '1', '', '', '', '', '');
