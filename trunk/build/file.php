<?php
require_once('_inc.php');
require_once('inc/FileUtil.php');

/**
 * 生成HTTP请求的文件
 */
$util = new FileUtil();
$util->do_get($_GET['f']);  //"/rny/ria/sinamail50/081124/__init__mini.lib.js"
