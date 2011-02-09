/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("ui", "core")){

var _tmpl = {
	"dialog": "<div html=\"true\" aui=\"{align:'top',height:18;}\" style=\"width:100%;height:18px;background-color:activecaption;border:0px;padding:0px;\">"
		+ "<label style=\"position:absolute;height:14px;background-color:gray;left:4px;top:4px;font:bold 12px 宋体;line-height:100%;color:white;text-align:left;cursor:default;padding-top:2px;\">{$caption}</label>"
		+ "<img style=\"position:absolute;width:16px;height:14px;top:4px;right:4px;vertical-align:middle;background-color:buttonface;\" src=\"{$pathAui}lib/images/AWindow_closeup.gif\" />"
		+ "</div>"
		+ "<div id=\"dlgBody\" aui=\"{align:'client'}\" style=\"position:absolute;top:21px;width:100%;height:300px;background-color:#666666;border:0px;padding:0px;\"></div>"
};

import alz.mui.ToggleGroup;
import alz.mui.ToggleManager;
import alz.mui.Component;
import alz.mui.TextHistory;
import alz.mui.TextItem;
import alz.mui.LineEdit;
import alz.mui.Console;
import alz.mui.BitButton;
import alz.mui.ToggleButton;
import alz.mui.ToolBar;
import alz.mui.ModalPanel;
import alz.mui.Container;
import alz.mui.Panel;
import alz.mui.Pane;
import alz.mui.Workspace;
import alz.mui.DropDown;
import alz.mui.Popup;
import alz.mui.ListItem;
import alz.mui.Dialog;
import alz.mui.TabPage;
import alz.mui.WindowSkinWINXP;
import alz.mui.WindowSkinWIN2K;
import alz.mui.SysBtn;
import alz.mui.Window;
import alz.core.WebRuntime_ui;

runtime.regLib("ui", function(){  //加载之后的初始化工作

});

}})(this);