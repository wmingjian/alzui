/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("test_win", "core,ui")){

function $(id){return window.document.getElementById(id);}

//import alz.core.DomUtil2;
//import alz.mui.Component2;
import alz.mui.Workspace2;
import alz.mui.SilverButton;
import alz.test.PaneHome;
import alz.test.PaneConsole;
import alz.test.PaneWindow;
import alz.test.PaneTable;
import alz.test.PaneForm;
import alz.test.AppTestWin;

runtime.regLib("test_win", function(){
	application = runtime.createApp("alz.test.AppTestWin");
});

}})(this);