/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50616
Source Host           : 127.0.0.1:3306
Source Database       : riaeasy

Target Server Type    : MYSQL
Target Server Version : 50616
File Encoding         : 65001

Date: 2016-07-31 23:25:03
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for xoper
-- ----------------------------
DROP TABLE IF EXISTS `xoper`;
CREATE TABLE `xoper` (
  `id` int(11) NOT NULL DEFAULT '0' COMMENT '登录id，account',
  `_lock` tinyint(4) NOT NULL DEFAULT '0' COMMENT '锁定（0：激活；1：锁定）',
  `cat` char(16) NOT NULL DEFAULT '' COMMENT '数据归属，保留',
  `code` char(16) NOT NULL DEFAULT '' COMMENT '工号，用于关联，不允许重复',
  `text` char(16) NOT NULL DEFAULT '' COMMENT '名称，暂定不允许重复',
  `stat` char(4) NOT NULL DEFAULT '' COMMENT '状态',
  `typ` char(4) NOT NULL DEFAULT '' COMMENT '类型（0：临时访客；1：内部操作员；2：外部操作员）',
  `dtnew` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最新修改时间',
  `dtcreate` datetime DEFAULT NULL COMMENT '创建时间',
  `opcreate` int(11) NOT NULL DEFAULT '0' COMMENT '创建人',
  `dtext` char(16) NOT NULL DEFAULT '' COMMENT '昵称、petname',
  `dpassword` char(16) NOT NULL DEFAULT '' COMMENT '登录密码，非明文',
  `dtyp` char(4) NOT NULL DEFAULT '' COMMENT '证件类型',
  `dcode` char(18) NOT NULL DEFAULT '' COMMENT '证件编号',
  `dmobile` char(12) NOT NULL DEFAULT '' COMMENT '手机',
  `dtele` char(24) NOT NULL DEFAULT '' COMMENT '联系电话',
  `demail` char(24) NOT NULL DEFAULT '' COMMENT 'email',
  `dstat` char(4) NOT NULL DEFAULT '' COMMENT '工作状态，明文',
  `dtheme` char(16) NOT NULL DEFAULT '' COMMENT '主题名',
  PRIMARY KEY (`id`),
  UNIQUE KEY `xoper2` (`code`) USING BTREE,
  KEY `xoper1` (`dtnew`),
  KEY `xoper3` (`text`),
  KEY `xoper5` (`dmobile`),
  KEY `xoper6` (`demail`),
  KEY `xoper7` (`dcode`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of xoper
-- ----------------------------
INSERT INTO `xoper` VALUES ('-1', '0', '', 'developer', '开发人员', '1', '0', '2016-07-04 14:33:37', '2012-07-03 00:00:00', '-1', '', '', '', '', '', '028', '', '0', '');
INSERT INTO `xoper` VALUES ('0', '0', '', '1', '2', '1', '无', '2016-04-20 02:57:56', null, '0', '', '', '', '', '139', '', '', '无', '');
