/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50616
Source Host           : 127.0.0.1:3306
Source Database       : riaeasy

Target Server Type    : MYSQL
Target Server Version : 50616
File Encoding         : 65001

Date: 2016-07-31 23:25:24
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xoperrole
-- ----------------------------
DROP TABLE IF EXISTS `xoperrole`;
CREATE TABLE `xoperrole` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '关键字',
  `cat` char(16) NOT NULL DEFAULT '' COMMENT '数据归属，保留',
  `dtnew` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最新修改时间',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `opcreate` int(11) NOT NULL DEFAULT '0' COMMENT '创建人',
  `idoper` int(11) NOT NULL DEFAULT '0' COMMENT '编号',
  `idrole` char(8) NOT NULL DEFAULT '' COMMENT '权限id',
  PRIMARY KEY (`id`),
  KEY `xoperrole1` (`idoper`,`idrole`) USING BTREE,
  KEY `xroleoper2` (`idrole`,`idoper`) USING BTREE,
  KEY `xoperrole3` (`dtnew`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xoperrole
-- ----------------------------
