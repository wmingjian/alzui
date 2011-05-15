<?php
require_once('_inc.php');

/*
$map = array(
	'aui.tpl.js'      => array('/framework/src/'               , '/framework/src/tpl/'),
	'docs.tpl.js'     => array('/framework/src/'               , '/framework/src/tpl/'),
	'demos.tpl.js'    => array('/framework/src/'               , '/framework/src/tpl/'),
	'__app__.tpl.js'  => array('/framework/apps/__app__/src/'  , '/framework/apps/__app__/src/tpl/'),
	'homeshell.tpl.js'=> array('/framework/apps/homeshell/src/', '/framework/apps/homeshell/src/tpl/'),
	'citylife.tpl.js' => array('/apps/citylife/src/'           , '/apps/citylife/src/tpl/'),
	'qutao.tpl.js'    => array('/apps/qutao/src/'              , '/apps/qutao/src/tpl/'),
	'search.tpl.js'   => array('/apps/search/src/'             , '/apps/search/src/tpl/'),
	'yunweibo.tpl.js' => array('/apps/yunweibo/src/'           , '/apps/yunweibo/src/tpl/'),
	'doubanmov.tpl.js'=> array('/apps/doubanmov/src/'          , '/apps/doubanmov/src/tpl/'),
	'sample.tpl.js'   => array('/apps/sample/src/'             , '/apps/sample/src/tpl/')
);
*/
header("Content-Type: text/javascript; charset=utf-8");
echo $libtool->create_tpl($_GET['f']);