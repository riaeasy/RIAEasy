/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50616
Source Host           : 127.0.0.1:3306
Source Database       : riaeasy

Target Server Type    : MYSQL
Target Server Version : 50616
File Encoding         : 65001

Date: 2016-07-04 14:35:04
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xrole
-- ----------------------------
DROP TABLE IF EXISTS `xrole`;
CREATE TABLE `xrole` (
  `id` char(8) NOT NULL DEFAULT '' COMMENT '编码',
  `_lock` tinyint(4) NOT NULL DEFAULT '0' COMMENT '数据域',
  `cat` char(16) NOT NULL DEFAULT '' COMMENT '分类(-1:系统保留，不可编辑，0:用户所有，可编辑)',
  `text` char(16) DEFAULT '' COMMENT '名称',
  `stat` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态(1:启用，other:停用)',
  `typ` tinyint(4) NOT NULL DEFAULT '0' COMMENT '分类(-1:系统保留，不可编辑，0:用户所有，可编辑)',
  `dtnew` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最新修改时间',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `opcreate` int(11) NOT NULL DEFAULT '0' COMMENT '创建人',
  `ord` int(11) NOT NULL DEFAULT '0' COMMENT '排序号',
  `info` varchar(80) NOT NULL DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `xrole1` (`dtnew`) USING BTREE,
  KEY `xrole2` (`ord`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
