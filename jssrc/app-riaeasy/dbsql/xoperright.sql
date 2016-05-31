/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50621
Source Host           : localhost:3306
Source Database       : riaeasy

Target Server Type    : MYSQL
Target Server Version : 50621
File Encoding         : 65001

Date: 2016-05-31 17:40:57
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xoperright
-- ----------------------------
DROP TABLE IF EXISTS `xoperright`;
CREATE TABLE `xoperright` (
  `id` varchar(20) NOT NULL DEFAULT '' COMMENT '流水号',
  `cat` varchar(20) DEFAULT '' COMMENT '数据归属，保留',
  `stat` varchar(20) DEFAULT '' COMMENT '状态',
  `typ` varchar(20) DEFAULT '' COMMENT '类型，保留',
  `dtnew` datetime DEFAULT NULL COMMENT '最新修改时间',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `opcreate` varchar(20) DEFAULT '' COMMENT '创建人',
  `didoper` varchar(20) DEFAULT '' COMMENT '登录id，account',
  `didright` varchar(20) DEFAULT '' COMMENT '权限id',
  `dinfo` varchar(20) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `xoperright1` (`didoper`,`didright`) USING BTREE,
  KEY `xoperright2` (`dtnew`),
  KEY `xoperright3` (`didright`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xoperright
-- ----------------------------
