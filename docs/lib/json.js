window.onload = function(){
	var pres = window.document.getElementsByTagName("pre");
	for(var i = 0, len = pres.length; i < len; i++){
		pres[i].innerHTML = ("" + pres[i].innerHTML).replace(/\t/g, "&nbsp;&nbsp;").replace(/\n/g, "<br />");
	}
	pres = null;
	var h3s = window.document.getElementsByTagName("h3");
	for(var i = 0, len = h3s.length; i < len; i++){
		var h3 = h3s[i];
		var ul = h3.nextSibling;
		if(ul.nodeType != 1) ul = ul.nextSibling;
		if(ul.tagName == "UL"){
			h3.style.cursor = "pointer";
			ul.style.display = "";  //none
			h3.onclick = function(ev){
				var ul = this.nextSibling;
				if(ul.nodeType != 1) ul = ul.nextSibling;
				if(ul.tagName == "UL"){
					if(ul.style.display == "none"){
						ul.style.display = "";
					}else{
						ul.style.display = "none";
					}
				}
				ul = null;
			};
		}else{
			window.alert(ul.tagName);
		}
		ul = null;
		h3 = null;
	}
	h3s = null;
};