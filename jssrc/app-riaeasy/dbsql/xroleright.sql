/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50621
Source Host           : localhost:3306
Source Database       : riaeasy

Target Server Type    : MYSQL
Target Server Version : 50621
File Encoding         : 65001

Date: 2016-05-31 17:46:48
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xroleright
-- ----------------------------
DROP TABLE IF EXISTS `xroleright`;
CREATE TABLE `xroleright` (
  `idx` varchar(20) NOT NULL DEFAULT '' COMMENT '关键字',
  `domain` varchar(8) DEFAULT '' COMMENT '数据域',
  `id` varchar(20) DEFAULT '' COMMENT '角色id',
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
  `idright` varchar(20) DEFAULT '' COMMENT '权限id',
  `info` varchar(20) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`idx`),
  KEY `idx_xroleright` (`id`,`idright`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xroleright
-- ----------------------------
