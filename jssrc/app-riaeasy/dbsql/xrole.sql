/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50621
Source Host           : localhost:3306
Source Database       : riaeasy

Target Server Type    : MYSQL
Target Server Version : 50621
File Encoding         : 65001

Date: 2016-05-31 17:46:41
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xrole
-- ----------------------------
DROP TABLE IF EXISTS `xrole`;
CREATE TABLE `xrole` (
  `idx` varchar(20) NOT NULL DEFAULT '' COMMENT '关键字',
  `domain` varchar(8) DEFAULT '' COMMENT '数据域',
  `id` varchar(20) DEFAULT '' COMMENT '编码',
  `cat` varchar(20) DEFAULT '' COMMENT '分类(-1:系统保留，不可编辑，0:用户所有，可编辑)',
  `stat` varchar(20) DEFAULT '' COMMENT '状态(1:启用，other:停用)',
  `typ` varchar(20) DEFAULT '' COMMENT '类型，受理组，用于绑定流程',
  `dtmodi` datetime DEFAULT NULL COMMENT '最新修改时间',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `opcreate` varchar(20) DEFAULT '' COMMENT '创建人',
  `dtcheck` datetime DEFAULT NULL COMMENT '提交时间',
  `opcheck` varchar(20) DEFAULT '' COMMENT '提交人',
  `dtapprove` datetime DEFAULT NULL COMMENT '批准时间',
  `opapprove` varchar(20) DEFAULT '' COMMENT '批准人',
  `dname` varchar(20) DEFAULT '' COMMENT '名称',
  `dord` int(11) DEFAULT '0' COMMENT '排序号',
  `info` varchar(80) NOT NULL DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `idx_xrole` (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xrole
-- ----------------------------
