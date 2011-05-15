<?php
require_once('_inc.php');

/*
	URL格式：
	/caf/lib/aui.lib.js
	/caf/apps/__app__.lib.js
	/apps/citylife/lib/citylife.lib.js
*/
/*
$map = array(
	//lib文件名                  lib目录                         类搜索目录(分号分隔多个目录)
	'aui.lib.js'        => array('/framework/src/'               , ''),
	'docs.lib.js'       => array('/framework/src/'               , ''),
	'demos.lib.js'      => array('/framework/src/'               , ''),
	'scrollview.lib.js' => array('/framework/src/'               , ''),
	'caf.lib.js'        => array('/framework/src/'               , ''),
	'__app__.lib.js'    => array('/framework/apps/__app__/src/'  , '/framework/apps/__app__/src/classes/'  ),
	'homeshell.lib.js'  => array('/framework/apps/homeshell/src/', '/framework/apps/homeshell/src/classes/'),
	'citylife.lib.js'   => array('/apps/citylife/src/' , '/apps/citylife/src/classes/' ),
	'qutao.lib.js'      => array('/apps/qutao/src/'    , '/apps/qutao/src/classes/'    ),
	'search.lib.js'     => array('/apps/search/src/'   , '/apps/search/src/classes/'   ),
	'yunweibo.lib.js'   => array('/apps/yunweibo/src/' , '/apps/yunweibo/src/classes/' ),
	'doubanmov.lib.js'  => array('/apps/doubanmov/src/', '/apps/doubanmov/src/classes/'),
	'sample.lib.js'     => array('/apps/sample/src/'   , '/apps/sample/src/classes/'   )
);
*/
header("Content-Type: text/javascript; charset=utf-8");
echo $libtool->create_lib($_GET['f']);