/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50621
Source Host           : localhost:3306
Source Database       : riaeasy

Target Server Type    : MYSQL
Target Server Version : 50621
File Encoding         : 65001

Date: 2016-05-31 17:40:32
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xactslog
-- ----------------------------
DROP TABLE IF EXISTS `xactslog`;
CREATE TABLE `xactslog` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '登录id，account',
  `_lock` tinyint(4) NOT NULL DEFAULT '0' COMMENT '锁定（0：激活；1：锁定）',
  `serverid` int(11) NOT NULL DEFAULT '0',
  `cat` varchar(16) NOT NULL DEFAULT '' COMMENT '数据归属，appName',
  `method` varchar(8) NOT NULL DEFAULT '' COMMENT 'method',
  `url` varchar(127) NOT NULL DEFAULT '' COMMENT 'url',
  `params` varchar(255) DEFAULT NULL,
  `stat` int(4) NOT NULL DEFAULT '0' COMMENT '返回状态',
  `typ` varchar(4) NOT NULL DEFAULT '' COMMENT '类型（保留）',
  `client` varchar(127) NOT NULL DEFAULT '' COMMENT '客户端 ip',
  `dms` int(11) NOT NULL DEFAULT '0' COMMENT '耗时，ms',
  `dmsact` int(11) NOT NULL DEFAULT '0',
  `opcreate` int(11) NOT NULL DEFAULT '0' COMMENT '创建人，acttion operCode',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `dtnew` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最新修改时间',
  PRIMARY KEY (`id`),
  KEY `xactslog1` (`dtnew`) USING BTREE,
  KEY `xactslog3` (`url`) USING BTREE,
  KEY `xactslog2` (`dtcreate`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=17195 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xactslog
-- ----------------------------
