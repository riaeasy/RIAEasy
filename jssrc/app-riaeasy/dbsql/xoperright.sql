/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50616
Source Host           : 127.0.0.1:3306
Source Database       : riaeasy

Target Server Type    : MYSQL
Target Server Version : 50616
File Encoding         : 65001

Date: 2016-07-31 23:25:15
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xoperright
-- ----------------------------
DROP TABLE IF EXISTS `xoperright`;
CREATE TABLE `xoperright` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水号',
  `cat` char(16) NOT NULL DEFAULT '' COMMENT '数据归属，保留',
  `dtnew` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最新修改时间',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `opcreate` int(11) NOT NULL DEFAULT '0' COMMENT '创建人',
  `idoper` int(11) NOT NULL DEFAULT '0' COMMENT '登录id，account',
  `idright` varchar(20) NOT NULL DEFAULT '' COMMENT '权限id',
  PRIMARY KEY (`id`),
  KEY `xoperright2` (`dtnew`),
  KEY `xoperright1` (`idoper`,`idright`) USING BTREE,
  KEY `xoperright3` (`idright`,`idoper`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xoperright
-- ----------------------------
