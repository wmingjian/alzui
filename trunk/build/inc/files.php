<?php
/**
 * 数组格式说明
 * key = 实际请求访问的文件名
 * arr['type'] = 文件的内部表示类型
 * arr['json'] = JSON配置文件（省略了.json后缀）
 * arr['file'] = 旧的文件创建骨架
 * arr['flag'] = 文件压缩处理信息
 * 
 * flag标志的具体含义：
 *   "#" 压缩并添加框架的copyright
 *   ">" 压缩并添加应用的copyright
 *   "=" 不压缩，直接复制
 *   " " 当前产品不包含该文件，直接忽略
 * 其中，
 *   第[0]位 4.2.1
 *   第[1]位 5.0
 *   第[2]位 5.1
 *   第[3]位 5.2
 *   第[4]位 uc
 *   第[5]位 vip
 *   第[6]位 08
 *   第[7]位 ent
 *   第[8]位 5.7
 */
$G_files = array(
	//库文件 - 需要合并
	//基础框架库文件
	"__init__mini.lib.js" => array('type'=>'lib' ,'json'=>"__init__mini.lib",'file'=>'__init__mini.lib.js','flag'=>"#########"),
	"core.lib.js"         => array('type'=>'lib' ,'json'=>"core.lib"        ,'file'=>'core.lib.js'        ,'flag'=>"#########"),
	"ui.lib.js"           => array('type'=>'lib' ,'json'=>"ui.lib"          ,'file'=>'ui.lib.js'          ,'flag'=>"#########"),
	"ui_action.lib.js"    => array('type'=>'lib' ,'json'=>"ui_action.lib"   ,'file'=>'ui_action.lib.js'   ,'flag'=>"         "),
	"debug.lib.js"        => array('type'=>'lib' ,'json'=>"debug.lib"       ,'file'=>'debug.lib.js'       ,'flag'=>"         "),
	//邮箱基础库文件
	"mailui.lib.js"       => array('type'=>'lib' ,'json'=>"mailui.lib"      ,'file'=>'mailui.lib.js'      ,'flag'=>">>>>>>>>>"),
	"maildlg.lib.js"      => array('type'=>'lib' ,'json'=>"maildlg.lib"     ,'file'=>'maildlg.lib.js'     ,'flag'=>" >>>>>>>>"),
	"editor.lib.js"       => array('type'=>'lib' ,'json'=>"editor.lib"      ,'file'=>'editor.lib.js'      ,'flag'=>" >>>>>>>>"),
	"mailmodel.lib.js"    => array('type'=>'lib' ,'json'=>"mailmodel.lib"   ,'file'=>'mailmodel.lib.js'   ,'flag'=>"         "),
	//邮箱应用库文件
	"index50.lib.js"      => array('type'=>'lib' ,'json'=>"index50.lib"     ,'file'=>'index50.lib.js'     ,'flag'=>" >>>>>>>>"),  //主APP对应库文件
	"mailinfo.lib.js"     => array('type'=>'lib' ,'json'=>"mailinfo.lib"    ,'file'=>'mailinfo.lib.js'    ,'flag'=>" > > > >>"),
	"mailbox.lib.js"      => array('type'=>''    ,'json'=>""                                              ,'flag'=>"         "),
	"maillist5.lib.js"    => array('type'=>'lib' ,'json'=>"maillist5.lib"   ,'file'=>'maillist5.lib.js'   ,'flag'=>" >>>>>>>>"),
	"reader.lib.js"       => array('type'=>'lib' ,'json'=>"reader.lib"      ,'file'=>'reader.lib.js'      ,'flag'=>">>>>>>>>>"),
	"writer.lib.js"       => array('type'=>'lib' ,'json'=>"writer.lib"      ,'file'=>'writer.lib.js'      ,'flag'=>">>>>>>>>>"),
	"address.lib.js"      => array('type'=>'lib' ,'json'=>"address.lib"     ,'file'=>'address.lib.js'     ,'flag'=>" >>>>>>>>"),
//"addresslist.lib.js"  => array('type'=>''    ,'json'=>""                                              ,'flag'=>" >       "),
	"product.lib.js"      => array('type'=>'lib' ,'json'=>"product.lib"     ,'file'=>'product.lib.js'     ,'flag'=>"         "),  //产品配置管理APP对应库文件
	"setting.lib.js"      => array('type'=>'lib' ,'json'=>"setting.lib"     ,'file'=>'setting.lib.js'     ,'flag'=>" >>> >>>>"),
	"reg.lib.js"          => array('type'=>'lib' ,'json'=>"reg.lib"         ,'file'=>'reg.lib.js'         ,'flag'=>" >       "),
	"space.lib.js"        => array('type'=>'lib' ,'json'=>"space.lib"       ,'file'=>'space.lib.js'       ,'flag'=>" >       "),
	"mailinvite.lib.js"   => array('type'=>'lib' ,'json'=>"mailinvite.lib"  ,'file'=>'mailinvite.lib.js'  ,'flag'=>" >>>>> >>"),
	"filetransfer.lib.js" => array('type'=>'lib' ,'json'=>"filetransfer.lib",'file'=>'filetransfer.lib.js','flag'=>" >>>>> >>"),
	"greetingcard.lib.js" => array('type'=>'lib' ,'json'=>"greetingcard.lib",'file'=>'greetingcard.lib.js','flag'=>" >>>   >>"),
	"wallpaper.lib.js"    => array('type'=>'lib' ,'json'=>"wallpaper.lib"   ,'file'=>'wallpaper.lib.js'   ,'flag'=>" >>>   >>"),
	"platform.lib.js"     => array('type'=>'lib' ,'json'=>"platform.lib"    ,'file'=>'platform.lib.js'    ,'flag'=>" >>>   >>"),
	"enlarge.lib.js"      => array('type'=>'lib' ,'json'=>"enlarge.lib"     ,'file'=>'enlarge.lib.js'     ,'flag'=>" >>>   >>"),
	//其他应用库文件
	"mailapp.lib.js"      => array('type'=>'lib' ,'json'=>"mailapp.lib"     ,'file'=>'mailapp.lib.js'     ,'flag'=>"         "),  //mailapp对应库文件
	"tpldesign.lib.js"    => array('type'=>'lib' ,'json'=>"tpldesign.lib"   ,'file'=>'tpldesign.lib.js'   ,'flag'=>"         "),
	"pagebuild.lib.js"    => array('type'=>'lib' ,'json'=>"pagebuild.lib"   ,'file'=>'pagebuild.lib.js'   ,'flag'=>"         "),
	//产品配置文件 - 需要处理
	"data_50.js"          => array('type'=>'conf','json'=>"mail_50.conf"    ,'file'=>'data_50.js'         ,'flag'=>" =       "),  //FREE配置文件
	"data_51.js"          => array('type'=>'conf','json'=>"mail_51.conf"    ,'file'=>'data_51.js'         ,'flag'=>"  =      "),  //5.1 配置文件
	"data_cn.js"          => array('type'=>'conf','json'=>"mail_cn.conf"    ,'file'=>'data_cn.js'         ,'flag'=>"   =     "),  //CN  配置文件
	"data_uc.js"          => array('type'=>'conf','json'=>"mail_uc.conf"    ,'file'=>'data_uc.js'         ,'flag'=>"    =    "),  //UC  配置文件
	"data_vip.js"         => array('type'=>'conf','json'=>"mail_vip.conf"   ,'file'=>'data_vip.js'        ,'flag'=>"     =   "),  //VIP 配置文件
	"data_2008.js"        => array('type'=>'conf','json'=>"mail_2008.conf"  ,'file'=>'data_2008.js'       ,'flag'=>"      =  "), //2008 配置文件
	"data_ent.js"         => array('type'=>'conf','json'=>"mail_ent.conf"   ,'file'=>'data_ent.js'        ,'flag'=>"       = "),  //CN  配置文件
	"data_57.js"          => array('type'=>'conf','json'=>"mail_57.conf"    ,'file'=>'data_57.js'         ,'flag'=>"        ="),  //CN  配置文件
	"data_app.js"         => array('type'=>'conf','json'=>"mail_app.conf"   ,'file'=>'data_app.js'        ,'flag'=>"         "),  //APP 配置文件
	//模版数据文件 - 需要处理
	"mail_free.tpl.js"    => array('type'=>'tpl' ,'json'=>"mail_free.tpl"                                 ,'flag'=>" =       "),  //免费邮箱核心模板
	"mail_cn.tpl.js"      => array('type'=>'tpl' ,'json'=>"mail_cn.tpl"                                   ,'flag'=>"  ==     "),  //CN邮箱核心模板
	"mail_uc.tpl.js"      => array('type'=>'tpl' ,'json'=>"mail_uc.tpl"                                   ,'flag'=>"    =    "),  //UC邮箱核心模板
	"mail_vip.tpl.js"     => array('type'=>'tpl' ,'json'=>"mail_vip.tpl"                                  ,'flag'=>"     =   "),  //VIP邮箱核心模板
	"mail_2008.tpl.js"    => array('type'=>'tpl' ,'json'=>"mail_2008.tpl"                                 ,'flag'=>"      =  "),  //2008邮箱核心模板
	"mail_app.tpl.js"     => array('type'=>'tpl' ,'json'=>"mail_app.tpl"                                  ,'flag'=>"         "),  //APP邮箱核心模板
	"mail_ent.tpl.js"     => array('type'=>'tpl' ,'json'=>"mail_ent.tpl"                                   ,'flag'=>"       = "),  //CN邮箱核心模板
	"mail_57.tpl.js"      => array('type'=>'tpl' ,'json'=>"mail_57.tpl"                                   ,'flag'=>"        ="),  //新版邮箱核心模板
	"address.tpl.js"      => array('type'=>'tpl' ,'json'=>"address.tpl"                                   ,'flag'=>" ========"),  //通讯录模板
	"address_ent.tpl.js"  => array('type'=>'tpl' ,'json'=>"address_ent.tpl"                               ,'flag'=>" ========"),  //企邮通讯录模板
	"setting.tpl.js"      => array('type'=>'tpl' ,'json'=>"setting.tpl"                                   ,'flag'=>" ========"),  //设置区模板
	"setting_ent.tpl.js"  => array('type'=>'tpl' ,'json'=>"setting_ent.tpl"                               ,'flag'=>" ========"),  //企邮设置区域模板
	"invite.tpl.js"       => array('type'=>'tpl' ,'json'=>"invite.tpl"                                    ,'flag'=>"   =     "),  //注册邀请模板
	"filetransfer.tpl.js" => array('type'=>'tpl' ,'json'=>"filetransfer.tpl"                              ,'flag'=>" = =   =="),  //文件中转站模板
	//尚未整理的文件（有待改造）
	"mailcore_mini.js"    => array('type'=>''    ,'json'=>""                                              ,'flag'=>"#########"),
//"maillist.lib.js"     => array('type'=>''    ,'json'=>"maillist.lib"                                  ,'flag'=>" >       "),
	"safeauth.js"         => array('type'=>''    ,'json'=>""                                              ,'flag'=>" >>>>>>>>"),
	"suggest.js"          => array('type'=>''    ,'json'=>""                                              ,'flag'=>" >>>>>>>>"),
	"setting.js"          => array('type'=>''    ,'json'=>""                                              ,'flag'=>" >>>>>>>>"),
	"space_tray.js"       => array('type'=>''    ,'json'=>""                                              ,'flag'=>"         "),
	"mail_tray.js"        => array('type'=>''    ,'json'=>""                                              ,'flag'=>"         "),
	"editor_img.js"       => array('type'=>''    ,'json'=>""                                              ,'flag'=>" >>>>>>>>"),
	"utils.js"            => array('type'=>''    ,'json'=>""                                              ,'flag'=>" >>>>>>>>"),
	"weather.js"          => array('type'=>''    ,'json'=>""                                              ,'flag'=>"     >   "),
	//pushmail相关脚本
	"prototype.js"        => array('type'=>''    ,'json'=>""                                              ,'flag'=>"     =   "),  //第三方框架不压缩
	"address.js"          => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"base.js"             => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_address.js"       => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_agreement.js"     => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_client.js"        => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_destroy.js"       => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_dotry.js"         => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_download.js"      => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_download2.js"     => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_filter.js"        => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_forgetpwd.js"     => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_setting.js"       => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_unactive.js"      => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"pm_unsubscribe.js"   => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"email_fax_reg.js"    => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   "),
	"email_fax_select.js" => array('type'=>''    ,'json'=>""                                              ,'flag'=>"   > >   ")
);
/*
debug.tpl
mailinfo-5.0.tpl
mail_item_bak.tpl
mail_writer1.tpl
writer_panel.tpl
module.html
suda.tpl
dlg_noscript.tpl
dlg_verify.tpl
ft_main1.tpl
contact_mod2.tpl
*/