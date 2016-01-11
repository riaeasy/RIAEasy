
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xoperrole
-- ----------------------------
DROP TABLE IF EXISTS `xoperrole`;
CREATE TABLE `xoperrole` (
  `idx` varchar(20) NOT NULL DEFAULT '' COMMENT '关键字',
  `domain` varchar(8) DEFAULT '' COMMENT '数据域',
  `account` varchar(20) DEFAULT '' COMMENT '编号',
  `cat` varchar(20) DEFAULT '' COMMENT '数据归属，保留',
  `stat` varchar(20) DEFAULT '' COMMENT '状态',
  `typ` varchar(20) DEFAULT '' COMMENT '类型，保留',
  `dtmodi` datetime DEFAULT NULL COMMENT '最新修改时间',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `opcreate` varchar(20) DEFAULT '' COMMENT '创建人',
  `dtcheck` datetime DEFAULT NULL COMMENT '提交时间',
  `opcheck` varchar(20) DEFAULT '' COMMENT '提交人',
  `dtapprove` datetime DEFAULT NULL COMMENT '批准时间',
  `opapprove` varchar(20) DEFAULT '' COMMENT '批准人',
  `idrole` varchar(20) DEFAULT '' COMMENT '权限id',
  `info` varchar(20) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`idx`),
  KEY `idx_xoperrole` (`account`,`idrole`) USING BTREE,
  KEY `idx_xroleoper` (`idrole`,`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xoperrole
-- ----------------------------
INSERT INTO `xoperrole` VALUES ('100000427', '', 'developer', '0', '1', null, '2012-07-04 17:15:18', '2012-07-04 17:15:18', 'developer', null, null, null, null, '1000149', null);
