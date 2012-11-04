/**
 * alzui-mini JavaScript Framework, v__VERSION__
 * Copyright (c) 2009-2011 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
/**
 * 框架核心库
 */
runtime.regLib("core", "", function(){with(arguments[0]){

/*<file name="alz/core/XPathQuery.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * 只是包装了一下Sizzle选择器
 */
_class("XPathQuery", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(name, app){
		_super.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.query = function(selector, context){
		return Sizzle(selector, context);
	};
//------------------------------------------------------------------------------
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, extra, prune = true, contextXML = Sizzle.isXML(context),
		soFar = selector, ret, cur, pop, i;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec("");
		m = chunker.exec(soFar);

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var filter = Expr.filter[ type ], found, item, left = match[1];
				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			var isPartStr = typeof part === "string",
				elem, i = 0, l = checkSet.length;

			if ( isPartStr && !/\W/.test(part) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}
			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},
		NAME: function(match, context){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			return match[1].toLowerCase();
		},
		CHILD: function(match){
			if ( match[1] === "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return (/h\d/i).test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},
		input: function(elem){
			return (/input|select|textarea|button/i).test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 === i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;
			} else {
				Sizzle.error( "Syntax error, unrecognized expression: " + name );
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					if ( type === "first" ) { 
						return true; 
					}
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first === 0 ) {
						return diff === 0;
					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [], i = 0;

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};
} else {
	sortOrder = function( a, b ) {
		var ap = [], bp = [], aup = a.parentNode, bup = b.parentNode,
			cur = aup, al, bl;

		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// If the nodes are siblings (or identical) we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle, div = document.createElement("div");
		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function(query, context, extra, seed){
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && context.nodeType === 9 && !Sizzle.isXML(context) ) {
				try {
					return makeArray( context.querySelectorAll(query), extra );
				} catch(e){}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		div = null; // release memory in IE
	})();
}

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

Sizzle.contains = document.compareDocumentPosition ? function(a, b){
	return !!(a.compareDocumentPosition(b) & 16);
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

Sizzle.isXML = function(elem){
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.Sizzle = Sizzle;

})();
//------------------------------------------------------------------------------
});
/*</file>*/
/*<file name="alz/core/DOMUtil.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * @class DOMUtil
 * @extends alz.lang.AObject
 * @desc 关于DOM操作的一些工具方法的集合
 * @example
var _dom = new DOMUtil();
 */
_class("DOMUtil", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
		this._nodes = [];
		this._domTemp = null;
		this._css = null;
	};
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
	this.dispose = function(){
		if(this._disposed) return;
		this._css = null;
		this._domTemp = null;
		//解除所有DOM元素和脚本对象的绑定关系
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes.length = 0;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createDomElement = function(html, parent){
		if(!this._domTemp){
			this._domTemp = document.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var el = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(parent){
			parent.appendChild(el);
			/*
			//滞后加载图片
			var imgs = el.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			*/
		}
		return el;
	};
	/**
	 * @method getPos
	 * @param {Element} el DOM元素
	 * @param {Element} refElement el的容器元素
	 * @desc 计算 el 相对于 refElement 的位置，一定要保证 refElement 包含 el
	 * [TODO]如何计算绝对定位的元素？相对于外部的位置
	 */
	/*
	this.getPos = function(el, refElement){
		try{
		var pos = {"x": 0, "y": 0};
		//var sb = [];
		for(var o = el; o; o = o.offsetParent){
			var s = "tagName=" + o.tagName + ",className=" + o.className;
			var x = 0, y = 0, a, b;
			var style = this.getStyle(o);
			if(o != el && o != refElement){
				//a = this.parseNum(o.tagName, style.borderLeftWidth);
				//b = this.parseNum(o.tagName, style.borderTopWidth);
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				x += isNaN(a) ? 0 : a;
				y += isNaN(b) ? 0 : b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
			}
			/ *
			if(o != el && runtime.getBoxModel() == 0){
				x += this.parseNum(o.tagName, style.paddingLeft);
				y += this.parseNum(o.tagName, style.paddingTop);
			}
			* /
			if(o != refElement){
				pos.x += o.offsetLeft + (o != el ? x : 0);
				pos.y += o.offsetTop + (o != el ? y : 0);
				//s += ",offsetLeft=" + o.offsetLeft + ",offsetTop=" + o.offsetTop;
			}else{
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				//pos.x += this.parseNum(o.tagName, style.borderLeftWidth);
				//pos.y += this.parseNum(o.tagName, style.borderTopWidth);
				pos.x += a;
				pos.y += b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
				//sb.push(s);
				break;
			}
			//sb.push(s);
			if(o.tagName == "BODY" || o.tagName == "HTML") break;
		}
		//$("log_off").value += "\n" + sb.join("\n");
		}catch(ex){
			window.alert(ex.message);
		}
		return pos;
	};
	*/
	this.getPos = function(el, refElement){
		try{
		var pos = {"x": 0, "y": 0};
		for(var o = el; o; o = o.offsetParent){
			var s = "tagName=" + o.tagName + ",className=" + o.className;
			var x = 0, y = 0, a, b;
			if(o != el && o != refElement){
				var border = this.getBorder(o);
				a = border.left;
				b = border.top;
				x += a;
				y += b;
			}
			if(o != refElement){
				pos.x += o.offsetLeft + (o != el ? x : 0);
				pos.y += o.offsetTop + (o != el ? y : 0);
			}else{
				var border = this.getBorder(o);
				a = border.left;
				b = border.top;
				pos.x += a;
				pos.y += b;
				break;
			}
			if(o.tagName == "BODY" || o.tagName == "HTML") break;
		}
		}catch(ex){
			window.alert(ex.message);
		}
		return pos;
	};
	/**
	 * @method getPos1
	 * @param {Event} ev 事件对象
	 * @param {Number} type 事件类型
	 * @param {Element} refElement 事件target的父容器
	 * @return {Object}
	 * @desc 相对于refElement容器，计算事件发生的坐标位置
	 */
	this.getPos1 = function(ev, type, refElement){
		var pos = type == 1 ? (
			runtime.ie ? {"x": ev.offsetX, "y": ev.offsetY} : {"x": ev.layerX, "y": ev.layerY}
		) : {"x": 0, "y": 0};
		refElement = refElement || runtime.getDocument().body;
		var el = ev.srcElement || ev.target;
		while(el && el != refElement){
			pos.x += el.offsetLeft;
			pos.y += el.offsetTop;
			el = el.offsetParent;
		}
		return pos;
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 * @method parseNum
	 * @param {String} v
	 * @return {Number}
	 * @desc 把 v 转换成十进制表示的数字
	 */
	this.parseNum = function(/*tag, */v){
		/*
		switch(v){
		case "medium":
			return tag == "DIV" ? 0 : 2;
		case "thin":
			return tag == "DIV" ? 0 : 1;
		case "thick":
			return tag == "DIV" ? 0 : 1;
		default:
			var a = parseInt(v);
			return isNaN(a) ? 0 : a;
		}
		*/
		var a = parseInt(v, 10);
		return isNaN(a) ? 0 : a;
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.getPropertyValue = function(style, name){
		//return runtime.ie ? style[name] : style.getPropertyValue(name);
		//return runtime.ie ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
	/**
	 * @method getStyle
	 * @param {Element} el
	 * @return {Object}
	 * @desc 获取 el 元素的所有样式
	 */
	this.getStyle = function(el){
		var style, view = runtime.getDocument().defaultView;
		if(view && view.getComputedStyle){
			style = view.getComputedStyle(el, null);
		}else if(el.currentStyle){
			style = el.currentStyle;
		}else{
			throw "无法动态获取DOM的实际样式属性";
		}
		return style;
	};
	/**
	 * @method getWH
	 * @param {Element} el DOM元素
	 * @return {Object}
	 * @desc 获取 el 的宽高
	 */
	this.getWH = function(el){
		var style = this.getStyle(el),
			width = this.parseNum(style["width"]),
			height = this.parseNum(style["height"]);
		return {
			w: width,
			h: height
		};
	};
	/**
	 * @method getPadding
	 * @param {Element} el DOM元素
	 * @desc 获取 el 的四个padding值
	 */
	this.getPadding = function(el){
		var style = this.getStyle(el),
			top = this.parseNum(style["paddingTop"]),
			right = this.parseNum(style["paddingRight"]),
			bottom = this.parseNum(style["paddingBottom"]),
			left = this.parseNum(style["paddingLeft"]);
		return {
			top: top,
			right: right,
			bottom: bottom,
			left: left
		};
	};
	/**
	 * @method getBorder
	 * @param {Element} el DOM元素
	 * @desc 获取 el 的四个border值
	 */
	this.getBorder = function(el){
		var style = this.getStyle(el),
			top = this.parseNum(style["borderTopWidth"]),
			right = this.parseNum(style["borderRightWidth"]),
			bottom = this.parseNum(style["borderBottomWidth"]),
			left = this.parseNum(style["borderLeftWidth"]);
		return {
			top: top,
			right: right,
			bottom: bottom,
			left: left
		};
	};
	/**
	 * @method getStyleProperty
	 * @param {Element} el DOM元素
	 * @param {String} name 样式名称
	 * @return {Number}
	 * @desc  获取 el 元素的 name 样式值
	 */
	this.getStyleProperty = function(el, name){
		var style = this.getStyle(el);
		return this.parseNum(/*el.tagName, */this.getPropertyValue(style, name) || el.style[name]);
	};
	/**
	 * @method setStyleProperty
	 * @param {Element} el DOM元素
	 * @param {Strinng} name 样式名称
	 * @param {Object} value 样式值
	 * @desc  设置 el 元素的 name 样式值为 value
	 */
	this.setStyleProperty = function(el, name, value){
		el.style[name] = value;
	};
	this._setStyleProperty = function(el, name, value){
		try{
		switch(name){
		case "width":
			if(runtime.getBoxModel() == 1){
				value -= this.getStyleProperty(el, "borderLeftWidth")
							 + this.getStyleProperty(el, "paddingLeft")
							 + this.getStyleProperty(el, "paddingRight")
							 + this.getStyleProperty(el, "borderRightWidth");
			}
			el.style[name] = Math.max(0, value) + "px";
			break;
		case "height":
			if(runtime.getBoxModel() == 1){
				value -= this.getStyleProperty(el, "paddingTop") + this.getStyleProperty(el, "paddingBottom");
			}
			el.style[name] = Math.max(0, value) + "px";
			break;
		}
		}catch(ex){
			window.alert(ex.message);
		}
	};
	/**
	 * @method getObj
	 * @param {Element} el DOM元素
	 * @return {alz.mui.Component}
	 * @desc 获取绑定了 el 的Component实例
	 */
	this.getObj = function(el){
		var clazz = __context__.__classes__["alz.mui.Component"];
		var component = new clazz();
		component._domCreate = true;
		this._components.push(component);  //注册 component
		component.bind(el);  //绑定 DOM 元素
		return component;
	};
	this.getObj = function(el){
		var obj;
		if(!("__ptr__" in el)){
			obj = new BoxElement();
			obj._dom = this;
			obj.init(el);
			this._nodes.push(obj);
		}else{
			obj = el.__ptr__;
		}
		return obj;
	};
	/**
	 * @method getObj1
	 * @param {Element} el DOM元素
	 * @return {BoxElement}
	 * @desc 获取绑定了 el 的BoxElement实例
	 */
	this.getObj1 = function(el){
		var obj;
		if("__ptr__" in el && el.__ptr__){
			obj = el.__ptr__;
		}else{
			obj = new BoxElement(el, this);
			/*
			obj = {
				"_self": el,
				"dispose": function(){
					this._self.__ptr__ = null;
					this._self = null;
				}
			};
			el.__ptr__ = obj;
			*/
			this._nodes.push(obj);
		}
		return obj;
	};
	this._create = function(tag){
		return document.createElement(tag);
	};
	this._setWidth = function(el, v){
		//if(runtime._host.compatMode != "BackCompat"){
		//	//window.alert("+" + forIn(this.getStyle(el)).join("\n"));
		//	v -= this.getStyleProperty(el, "borderLeftWidth") + this.getStyleProperty(el, "borderRightWidth");
		//}
		v = Math.max(0, v);
		this.setStyleProperty(el, "width", v + "px");
	};
	this._setHeight = function(el, v){
		//if(runtime._host.compatMode != "BackCompat"){
		//	v -= this.getStyleProperty(el, "borderTopWidth") + this.getStyleProperty(el, "borderBottomWidth");
		//}
		v = Math.max(0, v);
		this.setStyleProperty(el, "height", v + "px");
	};
	/**
	 * @method getWidth
	 * @param {Element} el DOM元素
	 * @return {Number}
	 * @desc   获得 el 的可见宽度
	 */
	this.getWidth = function(el){
		var obj = this.getObj1(el);
		//if(!("_width" in obj)){
			if(runtime._host.compatMode != "BackCompat"){
				obj._width = el.offsetWidth;  // - (runtime._host.env == "ie" ? 0 : this.getStyleProperty(el, "borderLeftWidth") + this.getStyleProperty(el, "borderRightWidth"))
			}else{
				obj._width = this.getStyleProperty(el, "borderLeftWidth")
					+ el.offsetWidth  //this.getStyleProperty(el, "width")
					+ this.getStyleProperty(el, "borderRightWidth");
			}
		//}
		return obj._width;
	};
	/**
	 * @method getHeight
	 * @param  {Element} el DOM元素
	 * @return {Number}
	 * @desc   获得 el 的可见高度
	 */
	this.getHeight = function(el){
		var obj = this.getObj1(el);
		//if(!("_height" in obj)){
			if(runtime._host.compatMode != "BackCompat"){
				obj._height = el.offsetHeight;
			}else{
				obj._height = this.getStyleProperty(el, "borderTopWidth")
					+ el.offsetHeight  //this.getStyleProperty(el, "height")
					+ this.getStyleProperty(el, "borderBottomWidth");
			}
		//}
		return obj._height;
	};
	/**
	 * @method setWidth
	 * @param {Element} el DOM元素
	 * @param {Number} v 宽度值[可选]
	 * @desc 设置 el 的 width 样式值
	 */
	this.setWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!("_width" in obj)) obj._width = 0;
		v = Math.max(v/* - obj._marginLeft - obj._marginRight*/, 0);
		//if(el.className == "pane-top") window.alert(obj._width + "!=" + v);
		//if(obj._width != v){
			obj._width = v;
			var w = this.getInnerWidth(el, v);
			this._setWidth(el, w);
		//}
	};
	/**
	 * @method setHeight
	 * @param {Element} el DOM元素
	 * @param {Number} v 高度值[可选]
	 * @desc 设置 el 的 height 样式值
	 */
	this.setHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!("_height" in obj)) obj._height = 0;
		v = Math.max(v/* - obj._marginTop - obj._marginBottom*/, 0);
		if(obj._height != v){
			obj._height = v;
			var w = this.getInnerHeight(el, v);
			this._setHeight(el, w);
		}
	};
	/**
	 * @method getInnerWidth
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的 width 样式值
	 */
	this.getInnerWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = obj._width;
		var innerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderLeftWidth - obj._borderRightWidth - obj._paddingLeft - obj._paddingRight);
		//var innerWidth = Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		if(isNaN(innerWidth)) runtime.log("DomUtil::getInnerWidth isNaN(innerWidth)");
		return innerWidth;
	};
	/**
	 * @method getInnerHeight
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 高度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的 height 样式值
	 */
	this.getInnerHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = obj._height || el.offsetHeight;
		var innerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderTopWidth - obj._borderBottomWidth - obj._paddingTop - obj._paddingBottom);
		if(isNaN(innerHeight)) runtime.log("DomUtil::getInnerHeight isNaN(innerHeight)");
		return innerHeight;
	};
	/**
	 * @method getOuterWidth
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的占位宽度，包括 margin
	 */
	this.getOuterWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = this.getWidth(el);
		var outerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginLeft + obj._marginRight);
		if(isNaN(outerWidth)) window.alert("DomUtil::getOuterWidth isNaN(outerWidth)");
		return outerWidth;
	};
	/**
	 * @method getOuterHeight
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的占位高度，包括 margin
	 */
	this.getOuterHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = this.getHeight(el);
		var outerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginTop + obj._marginBottom);
		if(isNaN(outerHeight)) window.alert("DomUtil::getOuterHeight isNaN(outerHeight)");
		return outerHeight;
	};
	/*
	this.getWidth = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getWidth();
	};
	this.setWidth = function(el, w){
		if(!el._ptr) this.getObj(el);
		el._ptr.setWidth(w);
		//this._setStyleProperty(el, "width", w);
	};
	this.getHeight = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getHeight();
	};
	this.setHeight = function(el, h){
		if(!el._ptr) this.getObj(el);
		el._ptr.setHeight(h);
		//this._setStyleProperty(el, "height", h);
	};
	this.getInnerWidth = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getInnerWidth();
		/ *
		//if(runtime.getBoxModel() == 1){
			return Math.max(0, el.offsetWidth - this.getStyleProperty(el, "borderLeftWidth") - this.getStyleProperty(el, "paddingLeft") - this.getStyleProperty(el, "paddingRight") - this.getStyleProperty(el, "borderRightWidth"));
		//}
		* /
	};
	this.getInnerHeight = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getInnerHeight();
	};
	*/
	/**
	 * @method resize
	 * @param  {Element} el DOM元素
	 * @param  {Number} w 宽度值
	 * @param  {Number} h 高度值
	 * @param  {Boolean} reDoSelf 是否调整自身大小
	 * @desc   调整大小
	 */
	this.resize = function(el, w, h, reDoSelf){
		if(!el._ptr) this.getObj(el);
		if(reDoSelf) el._ptr.resize(w, h);  //是否调整自身的大小
		//if(el.getAttribute("id") != "") window.alert(el.id);
		var nodes = el.childNodes;
		//if(el.getAttribute("html") == "true") window.alert("123");
		if(el.getAttribute("aui") != "" &&
			!(el.getAttribute("noresize") == "true" ||
				el.getAttribute("html") == "true") &&
			nodes.length > 0){  //忽略 head 内元素
			var ww = this.getInnerWidth(el);
			var hh = this.getInnerHeight(el);
			for(var i = 0, len = nodes.length; i < len; i++){
				if(nodes[i].nodeType != 1){  //NODE_ELEMENT
					continue;
				}
				var w0 = this.getWidth(nodes[i]);
				var h0 = this.getHeight(nodes[i]);
				//if(nodes[i].id == "dlgBody") window.alert(w0);
				this.setWidth(nodes[i], w0);
				//this.setHeight(nodes[i], h0);
				this.resize(nodes[i], ww, h0, true);
			}
		}
	};
	/**
	 * @method resizeElement
	 * @param  {Element} el DOM元素
	 * @param  {Number} w 宽度值
	 * @param  {Number} h 高度值
	 * @desc   重置 el 宽高
	 */
	this.resizeElement = function(el, w, h){
		el.style.width = Math.max(0, w) + "px";
		el.style.height = Math.max(0, h) + "px";
	};
	/**
	 * @method moveElement
	 * @param  {Element} el DOM元素
	 * @param  {Number} x x坐标
	 * @param  {Number} y y坐标
	 * @desc   把 el 移动到(x, y)位置
	 */
	this.moveElement = function(el, x, y){
		el.style.left = Math.max(0, x) + "px";
		el.style.top = Math.max(0, y) + "px";
	};
	/**
	 * @method moveTo
	 * @param  {Element} el DOM元素
	 * @param  {Number} x x坐标
	 * @param  {Number} y y坐标
	 * @desc   把 el 移动到x, y)位置
	 */
	this.moveTo = function(el, x, y){
		var obj = this.getObj1(el);
		if(!("_left" in obj)) obj._left = 0;
		if(!("_top" in obj)) obj._top = 0;
		obj._left = x;
		this.setStyleProperty(el, "left", x + "px");
		obj._top = y;
		this.setStyleProperty(el, "top", y + "px");
	};
	/**
	 * @method setOpacity
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 不透明度
	 * @desc   设置 el 的不透明度
	 */
	this.setOpacity = function(el, v){
		var obj = this.getObj1(el);
		if(!("_opacity" in obj)) obj._opacity = 0;
		if(obj._opacity != v || v === 0){
			v = Math.max(0, Math.min(1, v));
			obj._opacity = v;
			switch(runtime._host.env){
			case "ie":
				v = Math.round(v * 100);
				this.setStyleProperty(el, "filter", v == 100 ? "" : "Alpha(Opacity=" + v + ")");
				break;
			case "ff":
			case "ns":
				this.setStyleProperty(el, "MozOpacity", v == 1 ? "" : v);
				break;
			case "opera":
			case "safari":
			case "chrome":
				this.setStyleProperty(el, "opacity", v == 1 ? "" : v);
				break;
			}
		}
	};
	/**
	 * @method selectNodes
	 * @param  {Element} el DOM元素
	 * @param  {String} xpath xpath
	 * @desc   用xpath选取 el 的子节点
	 */
	this.selectNodes = function(el, xpath){
		return runtime.ie ? el.childNodes : el.selectNodes(xpath);
	};
	/**
	 * @method getViewPort
	 * @param  {Element} el DOM元素
	 * @return {Object}
	 * @desc   获取 el 的矩形信息，包括x，y，宽度和高度等。
	 */
	this.getViewPort = function(el){
		/*return {
			"x": 0,
			"y": 0,
			"w": el.clientWidth,
			"h": el.clientHeight,
			//"w1": el.scrollWidth,
			//"h1": el.scrollHeight
		};*/
		var rect = {
			"x": el.scrollLeft,
			"y": el.scrollTop,
			"w": el.clientWidth,  //Math.max(el.clientWidth || el.scrollWidth)
			"h": Math.max(el.clientHeight, el.parentNode.clientHeight)  //Math.max(el.clientHeight || el.scrollHeight)
		};
		rect.w = Math.max(el.clientWidth, el.parentNode.clientWidth);
		rect.h = Math.max(el.clientHeight, el.parentNode.clientHeight);
		return rect;
	};
	/**
	 * @method addEventListener
	 * @param {Element} el 要绑定事件侦听的DOM元素
	 * @param {String} type 事件类型，如果参数func为事件监听对象，则该参数将被忽略
	 * @param {Function|Object} func 事件响应函数或事件侦听对象
	 * @param obj 回调函数中的this指代对象，如果没有该参数，默认为el
	 * @desc 添加事件侦听器
	 */
	//[memleak]DOMUtil.__hash__ = {};
	//[memleak]DOMUtil.__id__ = 0;
	this.addEventListener = function(el, type, func, obj){
		//[memleak]el.__hashid__ = "_" + (DOMUtil.__id__++);
		//[memleak]DOMUtil.__hash__[el.__hashid__] = {el:el,type:type,func:func,obj:obj};
		switch(typeof func){
		case "function":
			el.__callback = (function(cb, obj){
				return function(ev){
					return cb.call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(func, obj || el);
			if(el.attachEvent){
				el.attachEvent("on" + type, el.__callback);
			}else{
				el.addEventListener(type, el.__callback, false);
			}
			break;
		case "object":
			el.__callback = (function(listener, obj){
				return function(ev){
					return listener[ev.type].call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(func, obj || el);
			for(var k in func){
				if(el.attachEvent){
					el.attachEvent("on" + k, el.__callback);
				}else{
					el.addEventListener(k, el.__callback, false);
				}
			}
			break;
		}
	};
	/**
	 * @method removeEventListener
	 * @param {Element} el 要取消事件侦听的DOM元素
	 * @param {String} type 事件类型，如果参数func为事件监听对象，则该参数将被忽略
	 * @param {Function|Object} func 事件响应函数或事件侦听对象
	 * @desc 取消事件侦听
	 */
	this.removeEventListener = function(el, type, func){
		if(!el.__callback) return;
		//[memleak]delete DOMUtil.__hash__[el.__hashid__];
		switch(typeof func){
		case "function":
			if(el.detachEvent){
				el.detachEvent("on" + type, el.__callback);
			}else{
				el.removeEventListener(type, el.__callback, false);
			}
			break;
		case "object":
			for(var k in func){
				if(el.detachEvent){
					el.detachEvent("on" + k, el.__callback);
				}else{
					el.removeEventListener(k, el.__callback, false);
				}
			}
			break;
		}
		el.__callback = null;
	};
	/**
	 * @method trigger
	 * @param {Element} el 要触发事件的目标元素
	 * @param {String} type 事件类型
	 * @desc 触发 type 事件
	 */
	this.trigger = function(el, type){
		try{
			if(el.dispatchEvent){
				var evt = document.createEvent('Event');
				evt.initEvent(type, true, true);
				el.dispatchEvent(evt);
			}else if(el.fireEvent){
				el.fireEvent("on" + type);
			}else{
				el[ type ]();
			}
		}catch(ex){
			window.alert(ex);
		}
	};
	/**
	 * @method contains
	 * @param {Element} el DOM元素
	 * @param {Element} obj DOM元素
	 * @return {Boolean}
	 * @desc el 元素是否包含 obj 元素
	 */
	this.contains = function(el, obj){
		if(el.contains){
			return el.contains(obj);
		}else{
			for(var o = obj; o; o = o.parentNode){
				if(o == el) return true;
				if(!o.parentNode) return false;
			}
			return false;
		}
	};
	/**
	 * @method parseRule
	 */
	this.parseRule = function(hash, arr, style){
		var key = arr[0];
		if(key in hash){
			//window.alert("merge css");
		}else{
			if(key.indexOf("_") != -1){
				var arr1 = key.split("_");
				this.parseRule(hash[arr1[0]]["__state"], arr1.slice(1), style);
			}else{
				//精简css样式
				var map = {"cssText":1,"length":1,"parentRule":1,"background-image":1};
				var style0 = {};
				if(arr.length == 1){
					for(var k in style){
						if(k in map || style[k] == "") continue;
						style0[k] = style[k];
					}
				}
				var obj = {};
				obj["__nodes"] = [];  //使用这个样式的元素
				//obj["__selectorText"] = arr.slice(1).join(" ");
				obj["__style"] = style0;
				obj["__state"] = {};
				hash[key] = obj;
			}
		}
		if(arr.length > 1){
			this.parseRule(hash[key], arr.slice(1), style);
		}
	};
	/**
	 * @method parseCss
	 */
	this.parseCss = function(rules){
		var hash = {};
		for(var i = 0, len = rules.length; i < len; i++){
			var rule = rules[i];
			if(rule.type == 2) continue;
			//rule.selectorText + "{" + rule.style.cssText + "}"
			this.parseRule(hash, rule.selectorText.split(" "), rule.style);
		}
		return hash;
	};
	/**
	 * @method cssKeyToJsKey
	 * @param {String} str CSS样式名称
	 * @desc 把CSS样式名称转换为JS表示法
	 */
	this.cssKeyToJsKey = function(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	};
	/**
	 * @method applyCssStyle
	 * @param {Element} el 要控制的DOM元素
	 * @param {JsonCssData} css json格式的CSS数据
	 * @param {String} className 样式名称(class属性值)
	 * @desc 应用json格式的css样式控制DOM元素的外观
	 */
	this.applyCssStyle = function(el, css, className){
		var style = css[(el.className == "error" ? "error-" : "") + className];
		if(el.__ptr__){
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el.getElementsByTagName(k.substr(1))[0];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el.style[name] != v){
						el.style[name] = v;
					}
				}
			}
		}else{
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el._ee[k];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el._self.style[name] != v){
						el._self.style[name] = v;
					}
				}
			}
		}
	};
	this.applyCssStyle1 = function(el, xpath, className){
		if(!this._css){
			this._css = this.parseCss(runtime._doc.styleSheets[1][runtime.ie ? "rules" : "cssRules"]);
		}
		var css;
		var arr = xpath.split(" ");
		if(arr.length == 1){
			css = this._css[xpath].__state;
		}else{
			for(var i = 0, len = arr.length, css = this._css; i < len; i++){
				css = css[arr[i]];
			}
			css = css.__state;
		}
		var style = css[(el.className == "error" ? "error-" : "") + className];
		if(el.__ptr__){
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el.getElementsByTagName(k.substr(1))[0];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el.style[name] != v){
						el.style[name] = v;
					}
				}
			}
		}else{
			for(var k in style){
				if(k == "__nodes" || k == "__state") continue;
				if(k == "__style"){
					var o = style[k];
					for(var m in o){
						if(el._self.style[m] != o[m]){
							el._self.style[m] = o[m];
						}
					}
				}else{
					var v = style[k]["__style"];
					var obj = el._ee["_" + k];
					for(var key in v){
						var name = key;
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
				}
			}
		}
	};
	this.addClass = function(el, cls){
		el.className = el.className ? el.className + " " + cls : cls;
	};
	this.removeClass = function(el, cls){
		var arr = el.className.replace(/ +/g, " ").split(" ");
		var sb = [];
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			if(a != ""){
				if(a != cls){
					sb.push(a);
				}
			}
		}
		el.className = sb.join(" ");
	};
	this.replaceClass = function(el, oldCls, newCls){
		var arr = el.className.replace(/ +/g, " ").split(" ");
		var sb = [];
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			if(a != ""){
				sb.push(a != oldCls ? a : newCls);
			}
		}
		el.className = sb.join(" ");
	};
});
/*</file>*/
/*<file name="alz/core/BoxElement.js">*/
_package("alz.core");

_class("BoxElement", "", function(_super, _event){
	this._init = function(el, dom){
		_super._init.call(this);
		this._dom = dom;
		this._self = null;
		this.init(el);
	};
	this.init = function(obj){
		obj.__ptr__ = this;
		this._self = obj;
		//chrome,safari下marginRight等属性会自动变化，所以使用缓存，不再重新获取
		var sc = runtime.chrome || runtime.safari;
		if(sc && obj.__properties__){
			for(var k in obj.__properties__){
				this[k] = obj.__properties__[k];
			}
		}else{
			//初始化应用到的属性，从DOM对象中解析出实际的值，只读方式使用
			var properties = [
				"width","height",
				"marginBottom","marginLeft","marginRight","marginTop",
				"borderBottomWidth","borderLeftWidth","borderRightWidth","borderTopWidth",
				"paddingBottom","paddingLeft","paddingRight","paddingTop"
			];
			/*
			var hash = {};
			for(var i = 0, len = properties.length; i < len; i++){
				var key = properties[i];
				if(!("_" + key in this)){
					this["_" + key] = this._dom.getStyleProperty(obj, key);
					if(sc){
						hash["_" + key] = this["_" + key];
					}
				}
			}
			*/
			var hash = {},
				_this = this,
				dom = this._dom,
				style = dom.getStyle(obj);
			for(var i = 0, key; key = properties[i++];){
				if(!("_" + key in _this)){
					_this["_" + key] = dom.parseNum(style[key]);
					if(sc){
						hash["_" + key] = _this["_" + key];
					}
				}
			}
			if(sc){
				obj.__properties__ = hash;
			}
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		/*if(this._self.__layout){
			this._self.__layout.dispose();
			this._self.__layout = null;
		}*/
		try{
			this._self.__ptr__ = null;
		}catch(ex){
		}
		this._self = null;
		this._dom = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setLeft = function(x){
		this._self.style.left = x + "px";
	};
	this.setTop = function(y){
		this._self.style.top = y + "px";
	};
	this.getWidth = function(){
		return this._dom.getWidth(this._self);
	};
	this.setWidth = function(w){
		this._dom.setWidth(this._self, w);
	};
	this.getHeight = function(){
		/*
		var h = this._height;
		if(h != this._dom.getHeight(this._self)){
			runtime.log(this._self.className + ":" + h + "!=" + this._dom.getHeight(this._self));
		}
		return this._height;
		*/
		return this._dom.getHeight(this._self);
	};
	this.setHeight = function(h){
		this._dom.setHeight(this._self, h);
	};
	this.getInnerWidth = function(){
		return this._width;
	};
	this.setInnerWidth = function(w, skip){
		//绝对定位，marginRight没有作用
		//this.setWidth(w/*- this._marginLeft - this._marginRight*/);
		this._self.style.width = Math.max(0, w
			- (skip ? 0 : (this._marginLeft + this._marginRight))
			- this._borderLeftWidth - this._borderRightWidth
			- this._paddingLeft - this._paddingRight
		) + "px";
		if(this._self.__onWidthChange){
			this._self.__onWidthChange.call(this);
		}
	};
	this.getInnerHeight = function(){
		return this._height;
	};
	this.setInnerHeight = function(h){
		//this.setHeight(h - this._marginTop - this._marginBottom);
		this._self.style.height = Math.max(0, h
			- this._marginTop - this._marginBottom
			- this._borderTopWidth - this._borderBottomWidth
			- this._paddingTop - this._paddingBottom
		) + "px";
	};
	this.hasLayout = function(){
		if(!this._layout){
			this._layout = this._self.getAttribute("_layout");
		}
		return this._layout;
	};
	/*
	this.layout = function(){
		//this._self.style.overflow = "hidden";
		if(!this._self.__layout){
			var clazz = __context__[this._layout];  //"alz.layout." + this._layout  //BorderLayout
			this._self.__layout = new clazz();
			this._self.__layout.init(this._self);
		}
		this._self.__layout.layoutElement(
			this._self.clientWidth - this._paddingLeft - this._paddingRight,
			this._self.clientHeight - this._paddingTop - this._paddingBottom
		);
	};
	*/
	this.layout = function(){
		//this._self.style.overflow = "hidden";
		var clazz = __context__.__classes__["alz.layout." + this._layout];  //BorderLayout
		var self = this._self;
		var layout = new clazz();
		layout.init(self);
		layout.layoutElement(
			self.clientWidth - this._paddingLeft - this._paddingRight,
			self.clientHeight - this._paddingTop - this._paddingBottom
		);
		layout.dispose();
	};
});
/*</file>*/
/*<file name="alz/layout/AbstractLayout.js">*/
_package("alz.layout");

_class("AbstractLayout", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._component = null;  //启用该布局的组件
		this._self = null;       //启用该布局的DOM元素
	};
	this.init = function(obj){
		this._self = obj;
		this._component = obj.__ptr__;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self = null;
		this._component = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 使用当前布局，布置一个元素的内部子元素
	 */
	this.layoutElement = function(){
	};
});
/*</file>*/
/*<file name="alz/layout/BorderLayout.js">*/
_package("alz.layout");

_import("alz.core.BoxElement");
_import("alz.layout.AbstractLayout");

_class("BorderLayout", AbstractLayout, function(_super, _event){
	var TAGS = {"NOSCRIPT": 1, "INPUT": 1};
	var CLASSES = {"ui-modalpanel": 1, "ui-dialog": 1};
	this._init = function(){
		_super._init.call(this);
		this._component = null;
		this._self = null;
		this._direction = "";  //vertical|horizontal
		this._nodes = [];
		this._clientNode = null;
		this._width = 0;
		this._height = 0;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._component = obj.__ptr__;
		if(this._self.tagName != "TD"){
			//this._self.style.position = "absolute";
			this._self.style.overflow = "hidden";
		}
		//this._self.style.backgroundColor = runtime.getColor();
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(node.nodeType != 1) continue;  //NODE_ELEMENT
			if(node.tagName in TAGS) continue;
			if(node.className in CLASSES) continue;
			if(node.style.display == "none") continue;
			var align = node.__ptr__ && node.__ptr__._align || node.getAttribute("_align");
			if(!align){
				runtime.log("[WARNING]使用布局的结点(tagName=" + node.tagName + ",class=" + node.className + ")缺少_align属性，默认为_align=top");
				align = "top";
			}
			if(align == "none") continue;
			if(align == "client"){
				if(this._clientNode){
					runtime.log("[WARNING]使用布局的结点只能有一个_align=client的子结点");
				}
				this._clientNode = node;
				this._clientNode.style.position = "relative";  //[TODO]
				//this._clientNode.style.overflowX = "hidden";
				//this._clientNode.style.overflowY = "auto";
			}else{
				if(this._direction == ""){
					if(align == "top" || align == "bottom"){
						this._direction = "vertical";
					}else if(align == "left" || align == "right"){
						this._direction = "horizontal";
					}else{
						runtime.log("[WARNING]布局中使用了未知的_align属性值(" + align + ")");
					}
				}else if(this._direction == "vertical" && (align == "left" || align == "right")){
					runtime.log("[WARNING]布局已经为(vertical)，不能使用left或right作为_align属性值");
				}else if(this._direction == "horizontal" && (align == "top" || align == "bottom")){
					runtime.log("[WARNING]布局已经为(horizontal)，不能使用top或bottom作为_align属性值");
				}
			}
			this._nodes.push(node);
		}
		if(this._direction == ""){
			//if(this._self.tagName != "BODY"){
			//	runtime.log("[WARNING]未能正确识别布局方向，请检查使用布局的元素的子元素个数是不是只有一个且_align=client");
			//}
			this._direction = "vertical";
		}
		if(this._direction == "horizontal"){
			//this._self.style.overflow = "hidden";
			for(var i = 0, len = this._nodes.length; i < len; i++){
				//水平的BorderLayout布局需要替换掉原来的float布局，改由绝对定位机制实现
				var node = this._nodes[i];
				node.style.position = "absolute";
				node.style.styleFloat = "";
				//node.style.overflow = "auto";
			}
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._clientNode = null;
		var nodes = this._nodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			//if(nodes[i]._self){
			//	nodes[i].dispose();  //[TODO]应该在DomUtil::dispose中处理
			//}
			nodes[i] = null;
		}
		this._nodes.length = 0;
		this._self = null;
		this._component = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/*
	this.layoutElement = function(w, h){
		if(this._width == w && this._height == h) return;
		this._width = w;
		this._height = h;
		//if(this._self.className == "wui-PaneContactTable"){
		//	window.alert(w + "," + h);
		//}
		if(this._self.tagName == "TABLE"){
			var tbl = this._self;
			tbl.style.border = "1px solid red";
			tbl.style.width = w + "px";
			tbl.style.height = h + "px";
			var cell = tbl.childNodes[0].rows[1].cells[1];
			cell.style.width = (w - 12) + "px";
			cell.style.height = (h - 22) + "px";
			var layout = new BorderLayout();
			layout.init(cell);
			layout.layoutElement(Math.max(0, w - 12), Math.max(0, h - 22));
			layout.dispose();
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			if(w) runtime.dom.setWidth(this._self, w);
			if(h) runtime.dom.setHeight(this._self, h);
		}
		if(this._direction == "vertical"){
			var hh = 0, h_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				//node.style.top = hh + "px";
				if(node != this._clientNode){
					hh += runtime.dom.getHeight(node);
				}
			}
			var h_client = h - hh;
			hh = 0;
			if(w) runtime.dom.setWidth(this._clientNode, w);
			runtime.dom.setHeight(this._clientNode, h_client);
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.layoutElement(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
				}
			}
		}else{  //this._direction == "horizontal"
			//横向布局使用绝对定位，marginRight在其中并不起什么实际的作用，只是在计算两个结点之间margin时有用
			//定位元素left属性时，需要减去自身marginLeft属性的值
			var ww = 0, w_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				node.style.left = ww + "px";
				if(node != this._clientNode){
					ww += runtime.dom.getWidth(node);
				}
			}
			var w_client = w - ww;
			ww = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				node.style.left = ww + "px";
				if(node == this._clientNode){
					runtime.dom.setWidth(this._clientNode, w_client);
					ww += w_client;
				}else{
					ww += runtime.dom.getWidth(node);
				}
				var h_fix = 0;
				if(this._self.className == "ff_contact_client"){
					h_fix = -2;  //(临时解决办法)RQFM-4934 通讯录页面有一个相素的缺
				}
				if(h) runtime.dom.setHeight(node, h - h_fix);
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.layoutElement(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
				}
			}
		}
	};
	this.setClientNode = function(node){
		this._clientNode = node;
	};
	this.appendNode = function(node){
		this._nodes.push(node);
	};
	*/
	/*
	this._getNodes = function(){
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i] = null;
		}
		this._nodes.splice(0, len);
		var nodes0 = this._self.childNodes;
		for(var i = 0, len = nodes0.length; i < len; i++){
			var node = nodes0[i];
			if(node.nodeType != 1) continue;  //NODE_ELEMENT
			if(node.tagName in TAGS) continue;
			if(node.className in CLASSES) continue;
			if(node.style.display == "none") continue;
			this._nodes.push(node);
		}
		return this._nodes;
	};
	*/
	/**
	 * 获取参与布局的结点
	 */
	/*
	this._getAlignNodes = function(){
		//this._getNodes();
		var nodes = [];
		for(var i = 0, len = this._nodes.length; i < len; i++){
			var node = this._nodes[i];
			if(node.style.display == "none") continue;
			if(!node.__ptr__){
				node.__ptr__ = new BoxElement(node, runtime.dom);
			}
			nodes.push(node.__ptr__);
		}
		return nodes;
	};
	*/
	this._getAlignNodes = function(){
		var dom = runtime.dom;
		var nodes = [];
		for(var i = 0, len = this._nodes.length; i < len; i++){
			var node = this._nodes[i];
			if(node.style.display == "none") continue;
			nodes.push(new BoxElement(node, dom));
		}
		return nodes;
	};
	this.getClientNodeWidth = function(w, nodes){
		//var nn = runtime.dom.getStyleProperty(this._self, "paddingLeft");  //考虑paddingLeft
		var nn = this._component.getProperty("paddingLeft");  //考虑paddingLeft
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(i == 0){  //考虑第一个元素的marginLeft
				nn += node._marginLeft;
			}
			//node.setLeft(nn);
			nn += (node._self == this._clientNode ? 0 : node.getWidth());  //node._self.offsetWidth
			if(i < len - 1){
				nn += Math.max(node._marginRight, nodes[i + 1]._marginLeft);  //取两个元素的margin最大值
			}else{  //i == len - 1 考虑最后一个元素的marginRight
				nn += node._marginRight;
			}
		}
		return w - nn;
	};
	this.getClientNodeHeight = function(h, nodes){
		//var nn = runtime.dom.getStyleProperty(this._self, "paddingTop");  //考虑paddingTop
		var nn = this._component.getProperty("paddingTop");  //考虑paddingTop
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(i == 0){  //考虑第一个元素的marginTop
				nn += node._marginTop;
			}
			//node.setTop(nn);
			nn += (node._self == this._clientNode ? 0 : node.getHeight());  //node._self.offsetHeight
			if(i < len - 1){
				nn += Math.max(node._marginBottom, nodes[i + 1]._marginTop);  //取两个元素的margin最大值
			}else{  //i == len - 1 考虑最后一个元素的marginBottom
				nn += node._marginBottom;
			}
//			var top = runtime.dom.getStyleProperty(node._self, "top");
//			console.log(top);
//			if(top == -23){
//				nn += top;
//				console.log(nn)
//			}
//			nn += top;
		}
		return h - nn;
	};
	this.updateDock =
	this.layoutElement = function(w, h){
		//if(this._width == w && this._height == h) return;
		//this._width = w;
		//this._height = h;
		this._component.resizeTo(w, h);
		if(this._self && this._self.__ptr__){
			this._self.__ptr__._height = h;
		}
		//if(this._self.className == "ff_cntas_list"){
		//	window.alert(w + "," + h);
		//}
		if(this._self.tagName == "TABLE"){
			var tbl = this._self;
			var cell = tbl.childNodes[0].rows[1].cells[1];
			//cell.style.border = "1px solid gray";
			cell.style.width = Math.max(0, w - 12) + "px";
			cell.style.height = Math.max(0, h - 22) + "px";
			/*
			var layout = new BorderLayout();
			layout.init(cell);
			layout.layoutElement(Math.max(0, w - 12), Math.max(0, h - 22));
			layout.dispose();
			*/
			return;
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			//window.alert(this._self.tagName + "," + w + "," + h);
			//高度和宽度已经被父元素调整过了
			//if(w) runtime.dom.setWidth(this._self, w);
			//if(h) runtime.dom.setHeight(this._self, h);
			//if(w) w = runtime.dom.getInnerWidth(this._self);  //this._self.clientWidth - this._paddingLeft - this._paddingRight;
			//h = runtime.dom.getInnerHeight(this._self);  //this._self.clientHeight - this._paddingTop - this._paddingBottom;
			h = this._component.getInnerHeight();  //this._self.clientHeight - this._paddingTop - this._paddingBottom;
		}
		var nodes = this._getAlignNodes();
		if(this._direction == "vertical"){
			var n_client = this.getClientNodeHeight(h, nodes);
			var nn = 0;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				if(i == 0){  //考虑第一个元素的marginTop
					nn += node._marginTop;
				}
				//node.setTop(nn);
				if(node._self == this._clientNode){
					//var b = this._self.className == "wui-PaneContactTable" ? 2 : 0;
					node.setHeight(n_client/* - b*/);
				}
				nn += node._self == this._clientNode ? n_client : node.getHeight();
				if(w){
					node.setInnerWidth(w);
				}
				if(node.hasLayout()){
					node.layout();
				}
				if(i < len - 1){
					nn += Math.max(node._marginBottom, nodes[i + 1]._marginTop);  //取两个元素的margin最大值
				}else{  //i == len - 1 考虑最后一个元素的marginBottom
					nn += node._marginBottom;
				}
			}
		}else{  //this._direction == "horizontal"
			//横向布局使用绝对定位，marginRight在其中并不起什么实际的作用，只是在计算两个结点之间margin时有用
			//定位元素left属性时，需要减去自身marginLeft属性的值
			var n_client = this.getClientNodeWidth(w, nodes);  //w - nn + runtime.dom.getStyleProperty(this._self, "paddingLeft");  //补上考虑paddingRight值
			var nn = 0;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				node.setLeft(nn);
				if(i == 0){  //考虑第一个元素的marginLeft
					nn += node._marginLeft;
				}
				if(node._self == this._clientNode){
					node.setInnerWidth(n_client, true);
				}
				nn += node._self == this._clientNode ? n_client : node.getWidth();
				if(h){
					node.setInnerHeight(h);
				}
				if(node.hasLayout()){
					node.layout();
				}
				if(i < len - 1){
					nn += Math.max(node._marginRight, nodes[i + 1]._marginLeft);  //取两个元素的margin最大值
				}else{  //i == len - 1 考虑最后一个元素的marginRight
					nn += node._marginRight;
				}
			}
		}
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].dispose();
			nodes[i] = null;
		}
	};
});
/*</file>*/
//import alz.core.DomUtil2;
/*<file name="alz/core/AjaxEngine.js">*/
_package("alz.core");

//_import("alz.core.Exception");
_import("alz.core.Plugin");
_import("alz.core.ScriptLoader");
//_import("alz.core.IframeLoader");

//依赖于 runtime, runtime.getBrowser()
//[TODO]
//  1)添加防错误处理机制，保证请求队列的持续工作
//  2)短路所有的异步请求，保证单机环境下能够正常工作

/**
 * 异步数据调用引擎
 * [TODO]跨页面工作
 */
_class("AjaxEngine", Plugin, function(_super, _event){
	AjaxEngine._version = "1.01.0001";  //Ajax引擎的当前版本
	AjaxEngine._PROGIDS = [
		"Microsoft.XMLHTTP",
		"Msxml2.XMLHTTP",
		"Msxml2.XMLHTTP.4.0",
		"MSXML3.XMLHTTP",
		"MSXML.XMLHTTP",
		"MSXML2.ServerXMLHTTP"
	];
	//VBS版本的 UTF-8 解码函数，大数据量情况下效率低下，甚用！
	AjaxEngine._vbsCode = "Function VBS_bytes2BStr(vIn)"
		+ "\n  Dim sReturn, i, nThisChar, nNextChar"
		+ "\n  sReturn = \"\""
		+ "\n  For i = 1 To LenB(vIn)"
		+ "\n    nThisChar = AscB(MidB(vIn, i, 1))"
		+ "\n    If nThisChar < &H80 Then"
		+ "\n      sReturn = sReturn & Chr(nThisChar)"
		+ "\n    Else"
		+ "\n      nNextChar = AscB(MidB(vIn, i + 1, 1))"
		+ "\n      sReturn = sReturn & Chr(CLng(nThisChar) * &H100 + CInt(nNextChar))"
		+ "\n      i = i + 1"
		+ "\n    End If"
		+ "\n  Next"
		+ "\n  VBS_bytes2BStr = sReturn"
		+ "\nEnd Function";
	AjaxEngine.getXmlHttpObject = function(){
		var http, err;
		if(typeof XMLHttpRequest != "undefined"){
			try{
				http = new XMLHttpRequest();
				//http.overrideMimeType("text/xml");
				return http;
			}catch(ex){}
		}
		if(!http){
			for(var i = 0, len = this._PROGIDS.length; i < len; i++){
				var progid = this._PROGIDS[i];
				try{
					http = runtime.createComObject(progid);
				}catch(ex){
					err = ex;
				}
				if(http){
					this._PROGIDS = [progid];
					break;  //return http;
				}
			}
		}
		if(!http){
			//throw err;
			runtime.showException(err, "XMLHTTP not available");
		}
		return http;
	};
	this._init = function(){
		_super._init.call(this);
		this._timer = 0;
		this._msec = 10;
		this._retryMsec = 2000;  //请求失败重试的时间间隔
		this._http = null;  //[TODO]这个对象应该仅供异步请求队列使用
		this._queue = [];  //异步请求队列
		this._uniqueId = 0;  //每个请求的全局唯一编号的种子
		this._userinfo = false;
		this._testCase = null;  //测试用例
		this._retryCount = 0;
		this._scriptLoader = null;
		this._data = null;  //script-src方法获取的数据临时存储地
		this._ignoreMessages = [
			"不能执行已释放 Script 的代码"
			//"完成该操作所需的数据还不可使用。"
		];
	};
	this.init = function(){
		this._http = AjaxEngine.getXmlHttpObject();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._data = null;
		if(this._scriptLoader){
			this._scriptLoader.dispose();
			this._scriptLoader = null;
		}
		this._testCase = null;
		this._timer = 0;
		this._http = null;
		for(var i = 0, len = this._queue.length; i < len; i++){
			this._queue[i] = null;
		}
		this._queue.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getTestCase = function(){
		return this._testCase;
	};
	this.setTestCase = function(v){
		this._testCase = v;
	};
	this._getScriptLoader = function(){
		if(runtime.moz || !this._scriptLoader){
			this._scriptLoader = new ScriptLoader();
			this._scriptLoader.create();
		}
		return this._scriptLoader;
	};
	this._openHttp = function(method, url, async){
		if(!this._http) this._http = AjaxEngine.getXmlHttpObject();
		var http = this._http;
		//url = url.replace(/\?/, "?rnd=" + Math.random() + "&");
		runtime.log("http.open(\"" + method + "\",\"" + url + "\"," + async + ");");
		http.open(method, url, async);
		if(method == "POST"){
			http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			http.setRequestHeader("HTTP-X-Requested-With", "XMLHttpRequest");
			if(this._userinfo){
				http.setRequestHeader("SESSIONID", "10000");
				http.setRequestHeader("USERNAME", runtime.getUser().getName());
			}
		}
		//if(runtime.getWindow().Event){  //FF 和 NS 支持 Event 对象
		if(runtime.moz){  //FF
			var ext = url.substr(url.lastIndexOf("."));
			if(ext == ".xml" || ext == ".aul"){
				http.overrideMimeType("text/xml; charset=gb2312");  //用于将 UTF-8 转换为 gb2312
			}else{
				http.overrideMimeType("text/xml");
				//http.setRequestHeader("Content-Type", "text/xml");
				//http.setRequestHeader("Content-Type", "gb2312");
			}
		}
		return http;
	};
	/**
	 * @param {String} method 提交方法(GET|POST)
	 * @param {String} url 网络调用的url
	 * @param {String|Object} postData 请求数据
	 * @param {String} type 返回只类型(text|xml)
	 * @param {Function} func 回调函数
	 * @param {Array} cbAgrs 传给回调方法的参数
	 * @return {String|XmlDocument}
	 */
	this.netInvoke1 = function(method, url, postData, type, func){
		try{
			var async = (typeof func != "undefined" && func != null) ? true : false;
			if(async){  //如果是异步请求，使用请求队列工作模式
				return this.netInvoke(method, url, postData, type, func);
			}else{
				var http = this._openHttp(method, url, async);
				/*
				var el = document.createElement("div");
				el.style.backgroundColor = "#EEEEEE";
				el.innerHTML = url + "&" + postData;
				im_history.appendChild(el);
				*/
				http.send(postData);  //FF下面参数null不能省略
				return this._onSyncCallback(type);
			}
		}catch(ex){
			runtime.showException(ex, "[AjaxEngine::netInvoke1]");
			return;
		}
	};
	//内嵌函数
	this._encodeData = function(http, charset){
		if(runtime.getWindow() && charset == "utf-8"){
			return "" + http.responseText;
		}else if(runtime.getWindow() && runtime.getWindow().execScript){  //FF 不支持 execScript
			if(typeof VBS_bytes2BStr == "undefined"){
				runtime.getWindow().execScript(AjaxEngine._vbsCode, "VBScript");
			}
			return VBS_bytes2BStr(http.responseBody);
		}else{
			//[TODO]直接返回 responseText 会有因 UTF-8 编码而引起的乱码问题
			return http.responseText;
		}
	};
	//供加载类库代码使用的方法
	this.netInvoke2 = function(method, url, postData, charset, agent, func, args){
		var async = (typeof agent != "undefined" && agent != null) ? true : false;
		if(async){  //如果是异步请求，使用请求队列工作模式
			return this.netInvoke(method, url, postData, type, agent, func, args);
		}else{
			var http = this._openHttp(method, url, async);
			if(runtime.getHostenv() == "safari" || runtime.getHostenv() == "chrome"){  //Safari下面需要这一句
				http.onreadystatechange = null;
			}
			/*if(async){
				http.onreadystatechange = function(){
					if(http.readyState != 4) return;
					if(typeof agent[func] == "function"){
						agent[func](http.responseText);
					}else{
						agent(http.responseText);
					}
				};
			}*/
			http.send("");  //没有 "" 的话 FF 下面会报错
			//if(!async){
			var data;
			if(http.status && (200 > http.status || 300 <= http.status)){
				throw new alz.core.Exception(runtime._lang.unable_to_load_file, url, http.status);
			}else if(http.readyState && http.readyState != 4){
				throw new alz.core.Exception(runtime._lang.resource_load_failure, uri);
			}else{
				data = this._encodeData(http, charset);  //args
			}
			return data;
			//}
		}
	};
	/**
	 * 可以复用HTTP组件的网络调用
	 * @param {String} method 提交方法(GET|POST)
	 * @param {String} url 网络调用的url
	 * @param {String|Object} postData 请求数据
	 * @param {String} type 返回只类型(text|json|xml)
	 * @param {Object|Function} agent 回调代理对象或者函数对象
	 * @param {Function|String} func 回调代理对象的回调方法名称
	 * @param {Array} cbAgrs 传给回调方法的参数
	 * @return {String|XmlDocument}
	 * [TODO]
	 *   1)检查 agent 和 agent[func] 必须有一个是 Function 对象
	 */
	this.netInvoke = function(method, url, postData, type, agent, func, cbArgs){
		//inner function
		function json2str(json){
			var sb = [];
			for(var k in json){
				//下面的改进，支持跨window的json对象传递，改进逻辑参考clone方法实现
				switch(typeof json[k]){
				//case "undefined": break;  //目前不支持undefined值
				case "boolean":
				case "number":
				case "string":
					sb.push(k + "=" + encodeURIComponent(json[k]));
					break;
				case "object":
					if(json[k] === null){  //null
						//目前不支持null值
					}else{
						//因为跨 window 操作，所以不能使用 instanceof 运算符
						//if(json[k] instanceof Array){
						if("length" in json[k]){  //array
							//把js数组转换成PHP能够接收的PHP数组
							for(var i = 0, len = json[k].length; i < len; i++){
								sb.push(k + "=" + encodeURIComponent(json[k][i]));
							}
						}else{  //object
							//目前不支持object类型的参数
						}
					}
					break;
				}
			}
			return sb.join("&");
		}
		//if(runtime._debug){
		//	check typeof agent || agent[func] == "function"
		//}
		var req = {
			"uniqueid": ++this._uniqueId,  //先加后用
			"action"  : runtime._actionCollection.getActiveAction(),  //关联当前的action对象
			"method"  : method,
			"url"     : url,
			"data"    : (typeof postData == "string" ? postData : json2str(postData)),
			"type"    : type,
			"agent"   : agent,
			"func"    : func,
			"args"    : cbArgs
		};
		if(method == "GET" && req.data != ""){
			req.url = req.url + (req.url.indexOf("?") == -1 ? "?" : "&") + req.data;
			req.data = "";
		}
		this._queue.push(req);
		if(this._timer == 0){
			this._startAjaxThread();
		}
		return this._uniqueId;
	};
	/**
	 * 暂停异步请求的工作线程
	 * @param {Boolean} abort 是否中断当前的请求
	 */
	this.pauseAjaxThread = function(abort){
		if(abort){
			this._http.abort();  //中止当前请求
		}
		runtime.getWindow().clearTimeout(this._timer);  //结束定时器
		this._timer = 0;
	};
	/**
	 * 开始异步请求的工作线程
	 */
	this._startAjaxThread = function(msec){
		this._timer = runtime.startTimer(msec || this._msec, this, "_ajaxThread");
	};
	this._checkAjaxThread = function(retry){
		if(this._queue.length != 0){
			this._startAjaxThread(retry ? this._retryMsec : this._msec);
		}else{
			this.pauseAjaxThread();
		}
	};
	this._ajaxThread = function(){
		var req  = this._queue[0];
		if(runtime._testCaseWin){
			runtime._testCaseWin.log(req.url + "?" + req.data);
		}
		if(this._testCase && this._testCase.doFilter(req.url)){
			var o = this._testCase.doService(req.url, this._testCase.getRequest(req.data));
			if(o){
				runtime.startTimer(0, this, function(){
					this._onTestCaseCallback(o);
				});
			}
		}else{
			var _this = this;
			if(req.type == "script_json"){
				var loader = this._getScriptLoader();
				loader.setCallback(function(){
					_this._onScriptCallback();
				});
				loader.load(req.url, req.data);
			}else{
				var http = this._openHttp(req.method, req.url, true);
				http.onreadystatechange = function(){
					//try{
						_this._onAsyncCallback();
					//}catch(ex){  //屏蔽异步请求错误
					//	alert(ex.message);
					//}
				};
				http.send(req.data);
			}
		}
		return;
	};
	this._onTestCaseCallback = function(o){
		var req = this._queue[0];
		//调用真实的回调函数
		if(typeof req.agent == "function"){
			req.agent(o, req.args);
		}else if(typeof req.func == "function"){
			req.func.call(req.agent, o, req.args);
		}else{
			req.agent[req.func](o, req.args);
		}
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	/**
	 * 同步回调函数
	 */
	this._onSyncCallback = function(type){
		if(this._http.readyState != 4){
			throw "资源文件加载失败";
		}
		//检查状态 this._http.readyState 和 this._http.status
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			return this._getResponseData(type, this._http);
		}else{
			try{
				switch(status){
				case 12002: // Server timeout
				case 12007:
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030: // See above comments for variable status.
				case 12031: // Internet connection reset error.
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
				default:
					runtime.showException("同步请求错误"
						+ "\nstatus=" + status
						+ "\nstatusText=" + this._http.statusText
					);
					break;
				}
			}catch(ex){
			}
		}
	};
	/**
	 * 异步回调函数
	 * [TODO]
	 *   1)把当前出错的请求移动到队列的末尾去，应该更好，但是如果相邻的请求有先后
	 * 依赖关系则不建议这么做。
	 *   2)增加简单的是否重试的确认机制。
	 */
	this._onAsyncCallback = function(){
		if(this._http.readyState != 4) return;
		var retry = false;
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			this._retryCount = 0;  //只要成功一次，就置零
			var req  = this._queue[0];
			var o = this._getResponseData(req.type, this._http);
			//调用真实的回调函数
			if(typeof req.agent == "function"){
				//try{
					req.agent(o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else if(typeof req.func == "function"){
				//try{
					req.func.call(req.agent, o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else{
				//try{
					req.agent[req.func](o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}
			this._queue[0] = null;
			this._queue.shift();  //清除队列第一个元素
		}else{
			/*
			try{
				switch(status){
				case 12002: // Server timeout
				case 12007:
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030: // See above comments for variable status.
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
					runtime.showException("异步请求错误"
						+ "\nstatus=" + status
						+ "\nstatusText=" + this._http.statusText
					);
					break;
				default:
					break;
				}
			}catch(ex){
			}
			*/
			this._retryCount++;
			if(this._retryCount <= 3){  //重试三次
				retry = true;
			}else{
				retry = runtime.getWindow().confirm("异步请求错误："  //runtime.showException
					+ "\nstatus=" + status
					+ "\nstatusText=" + this._http.statusText
					+ "\n是否重试本次请求？"
				);
			}
			this._http.abort();  //中止当前出错的请求
			if(!retry){  //如果不需要重试的话
				this._queue[0] = null;
				this._queue.shift();  //清除队列第一个元素
			}
		}
		this._checkAjaxThread(retry);
	};
	/**
	 * SCRIPT-src 异步回调函数
	 */
	this._onScriptCallback = function(){
		this._retryCount = 0;  //只要成功一次，就置零
		var req  = this._queue[0];
		var o = this._data;
		this._data = null;  //保证不对其他的请求产生影响
		//调用真实的回调函数
		if(typeof req.agent == "function"){
			//try{
				req.agent(o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else if(typeof req.func == "function"){
			//try{
				req.func.call(req.agent, o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else{
			//try{
				req.agent[req.func](o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	this._getResponseData = function(type, http){
		var o;  //o = Bytes2BStr(this._http.responseBody);
		switch(type){
		case "text": o = "" + http.responseText;break;
		case "json": o = runtime.parseJson(http.responseText);break;
		case "xml":
		default:
			if(runtime.ie){
				var xmlDoc = runtime.createComObject("Msxml.DOMDocument");
				xmlDoc.async = false;
				xmlDoc.loadXML(http.responseText);
				o = xmlDoc;  //.documentElement
			}else{
				o = http.responseXML;
			}
			break;
		}
		return o;
	};
	/*
	this.netInvoke = function(method, url, postData, type, func){
		try{
			var async = func ? true : false;
			this._http.open(method, url, async);
			if(async){
				var _this = this;
				this._http.onreadystatechange = function(){
					if(_this._http.readyState == 4){
						_this.onreadystatechange(type, func);
					}
				};
			}
			/ *
			var el = runtime.getDocument().createElement("div");
			el.style.backgroundColor = "#EEEEEE";
			el.innerHTML = url + "&" + postData;
			im_history.appendChild(el);
			* /
			if(method == "POST"){
				this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				this._http.setRequestHeader("HTTP-X-Requested-With", "XMLHttpRequest");
			}
			this._http.send(postData);  //FF下面参数null不能省略
			if(async){
				return;
			}else{
				//检查状态 this._http.readyState 和 this._http.status
				if(this._http.readyState != 4){
					runtime.getWindow().alert("资源文件加载失败");
					return;
				}else{
					return this.onreadystatechange(type);
				}
			}
		}catch(ex){
			var a = [];
			for(var k in ex){
				a.push(k + "=" + ex[k]);
			}
			runtime.getWindow().alert(a.join("\n"));
			return;
		}
	};
	this.onreadystatechange = function(type, func){
		//code = Bytes2BStr(this._http.responseBody);
		var o;
		switch(type){
		case "text":
			o = "" + this._http.responseText;
			break;
		case "xml":
		default:
			o = this._http.responseXML;
			break;
		}
		if(func){
			func(o);
		}else{
			return o;
		}
	};
	*/
	/**
	 * 调用一个请求队列
	 * @param {Array} queue 请求队列数组
	 * @param {Object} agent 回调代理对象
	 * @param {Function} func 回调函数
	 */
	this.netInvokeQueue = function(queue, agent, func){
		var i = 0;
		function cb(){
			if(i < queue.length){
				var req = queue[i];
				//netInvoke(method, url, postData, type, agent, func)
				this.netInvoke(req[0], req[1], req[2], req[3], this, function(data){
					var agent = req[4];
					var func  = req[5];
					//调用真实的回调函数
					if(typeof agent == "function"){
						agent(data, req[6]);
					}else if(typeof func == "function"){
						func.call(agent, data, req[6]);
					}else{
						agent[func](data, req[6]);
					}
					i++;
					runtime.startTimer(0, this, cb);  //调用下一个
				});
			}else{  //队列完成
				func.apply(agent);
			}
		}
		cb.call(this);
	};
	this.getReqIndex = function(uniqueid){
		for(var i = 0, len = this._queue.length; i < len; i++){
			if(this._queue[i].uniqueid == uniqueid){
				return i;
			}
		}
		return -1;
	};
	/**
	 * 终止指定的 uniqueid 的某个请求，队列正常运转
	 * @param {Number} uniqueid 每个请求的全局唯一编号
	 */
	this.abort = function(uniqueid){
		var n = this.getReqIndex(uniqueid);
		if(n == -1) return;
		if(n == 0){  //如果是当前请求
			this._http.abort();  //中止当前请求
			this._queue[n] = null;
			this._queue.shift();  //清除队列第一个元素
			this._checkAjaxThread();
		}else{
			this._queue[n] = null;
			this._queue.removeAt(n);
		}
	};
});
/*</file>*/
/*<file name="alz/core/Ajax.js">*/
_package("alz.core");

_import("alz.core.AjaxEngine");

/**
 * 异步数据调用引擎的封装版，主要目的是屏蔽并减少runtime对象的使用
 */
_class("Ajax", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._ajax = runtime.getAjax();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._ajax = null;
		//[memleak]this.__caller__ = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	//具体参数含义参考AjaxEngine对应的方法
	this.netInvoke = function(method, url, postData, type, agent, func, cbArgs){
		//[memleak]this.__caller__ = method + "," + url + "," + postData + "," + type + "," + agent + "," + func + "," + cbArgs;
		var ret = this._ajax.netInvoke.apply(this._ajax, arguments);
		this.dispose();
		return ret;
	};
	this.netInvokeQueue = function(queue, agent, callback){
		this._ajax.netInvokeQueue.apply(this._ajax, arguments);
		this.dispose();
	};
	this.abort = function(uniqueid){
		this._ajax.abort(uniqueid);
	};
	this.pauseAjaxThread = function(abort){
		this._ajax.pauseAjaxThread(abort);
	};
	this.getTestCase = function(){
		return this._ajax.getTestCase();
	};
	this.setTestCase = function(v){
		this._ajax.setTestCase(v);
	};
});
/*</file>*/
/*<file name="alz/core/AbstractModel.js">*/
_package("alz.core");

/**
 * ftype含义
 * 1=系统邮件夹
 * 0=自建邮件夹
 * 2=代收邮件夹
 * [TOOD]是否应该让子类实现如下接口？
 *   dataFormat
 *   appendItem
 *   updateItem
 *   removeItem
 *   appendItems
 *   removeItems
 */
_class("AbstractModel", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._parent = null;
		this._parentModel = null;  //父数据模型
		this._primaryKey = "";  //主键
		this._hash = {};  //(哈希表)数据列表
		this._list = [];  //数据数组(当含有排序信息后，可以当作主索引使用)
		this._hashIndexs = {};  //索引哈希(每个元素是一个数组)
		this._listeners = [];  //数据监听组件列表
	};
	this.create = function(parent){
		this._parent = parent;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._listeners.length; i < len; i++){
			this._listeners[i] = null;
		}
		this._listeners.length = 0;
		for(var k in this._hashIndexs){
			for(var i = 0, len = this._hashIndexs.length; i < len; i++){
				this._hashIndexs[k][i] = null;
			}
			delete this._hashIndexs[k];
		}
		this.dataReset();  //重置数据对象
		this._parentModel = null;
		this._parent = null;
		_super.dispose.apply(this);
	};
	this.getPrimaryKey = function(){
		return this._primaryKey;
	};
	this.getListByFilter = function(filter){
		var arr = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			if(filter(item)){
				arr.push(item);
			}
		}
		return arr;
	};
	/**
	 * 添加一个数据监听对象
	 * @param listener {FolderListView} 实现了onDateChange接口的视图组件
	 */
	this.addDataListener = function(listener){
		this._listeners.push(listener);
	};
	this.removeDataListener = function(listener){
		this._listeners.removeAt(this._listeners.indexOf(listener));
	};
	/**
	 * 分派数据变化（事件）
	 * @param act {String}
	 * @param data {JsonObject}
	 * @param olddata {JsonObject}
	 */
	this.dispatchDataChange = function(act, data, olddata){
		for(var i = 0, len = this._listeners.length; i < len; i++){
			//[TODO]未释放的脚本对象
			try{
				var listener = this._listeners[i];
				var action = act.split("_")[1];
				switch(action){
				case "add":
					if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，需要先通过过滤器，才添加
						listener.onDataChange.apply(listener, arguments);
					}
					break;
				case "mod":
					//if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，情况比较复杂，先交给“视图组件”来自行处理
					listener.onDataChange.apply(listener, arguments);
					//}
					break;
				case "del":
					if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，需要先通过过滤器，才删除
						listener.onDataChange.apply(listener, arguments);
					}
					break;
				/*
				case "remove":
				case "update":
				case "delete":
				case "clear":
				case "up":
				case "adds":
				case "clean":
				*/
				default:
					listener.onDataChange.apply(listener, arguments);
					break;
				}
			}catch(ex){
			}
		}
	};
	//子类必须实现的接口方法
	_abstract(this, "onDataChange");
	_abstract(this, "dataFormat", function(listData){});
	_abstract(this, "appendItem", function(data){});
	_abstract(this, "updateItem", function(data){});
	_abstract(this, "removeItem", function(id){});
	_abstract(this, "appendItems", function(data){});
	_abstract(this, "updateItems", function(data){});
	_abstract(this, "removeItems", function(ids){});
	/*
	this.dataFormat = function(dataList){};
	this.appendItem = function(data){};  //添加一条数据
	this.updateItem = function(data){};  //更新一条数据
	this.removeItem = function(id){};    //删除一条数据
	this.appendItems = function(data){};  //添加N条数据
	this.updateItems = function(data){};  //更新N条数据
	this.removeItems = function(ids){};  //删除N条数据
	*/
	this.dataReset = function(){
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i] = null;
		}
		this._list.length = 0;
		for(var k in this._hash){
			delete this._hash[k];
		}
	};
	this.checkJsonData = function(json, silent){
		return this._parent._app.checkJsonData(json, silent);
	};
	this.callback = function(agent, func, json){
		if(typeof func == "function"){
			func.call(agent, json);
		}else{
			agent[func](json);
		}
	};
});
/*</file>*/
/*<file name="alz/core/ActionStack.js">*/
_package("alz.core");

/**
 * 动作栈，管理APP内部的前进、后退功能
 */
_class("ActionStack", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._stack = [];  //动作栈
		this._oldAction = null;  //前一个动作
		this._activeAction = null;  //当前活动的动作
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeAction = null;
		this._oldAction = null;
		for(var i = 0, len = this._stack.length; i < len; i++){
			this._stack[i] = null;
		}
		this._stack.length = 0;
		_super.dispose.apply(this);
	};
	/**
	 * @param action {type:"",data:null}
	 */
	this.push = function(action){
		this._stack.push(action);
	};
	this.pop = function(){
		var action;
		if(this._stack.length > 1){
			action = this._stack.pop();  //最后一个动作出栈
			this._activeAction = this.top();
			this._oldAction = this._stack.length < 2 ? "" : this._stack[this._stack.length - 2];
		}else{
			runtime.log("动作栈已经被清空，您没有后路可退啦！");
		}
		return action;
	};
	this.top = function(){
		return this._stack[this._stack.length - 1];
	};
	this.__item__ = function(index){
		return this._stack[index];
	};
	this.getLength = function(){
		return this._stack.length;
	};
	this.getOldAction = function(){
		return this._oldAction;
	};
	this.setOldAction = function(v){
		this._oldAction = v;
	};
	this.getActiveAction = function(){
		return this._activeAction;
	};
	this.setActiveAction = function(v){
		this.setOldAction(this.top());
		this._activeAction = v;
	};
});
/*</file>*/
/*<file name="alz/core/ActionManager.js">*/
_package("alz.core");

/**
 * Action管理者类(Pane专用元素管理类)
 */
_class("ActionManager", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._actionEngine = null;  //动作执行引擎，实现了doAction接口的类的实例
		this._nodes = {};  //所管理的全部action组件
		this._components = [];
		this._focusbutton = null
	};
	this.init = function(actionEngine){
		this._actionEngine = actionEngine;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components.length = 0;
		for(var k in this._nodes){
			for(var i = 0, len = this._nodes[k].length; i < len; i++){
				this._nodes[k][i] = null;  //再此无需调用 dispose 方法
			}
			delete this._nodes[k];
		}
		this._actionEngine = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 获取action响应类
	 */
	this.getActionEngine = function(){
		return this._actionEngine;
	};
	this.setFocusButton = function(btn){
		this._focusbutton = btn;
	};
	this.add = function(component){
		//var act = component._self.getAttribute("_action");
		var act = component.getAction();
		if(!this._nodes[act]){
			this._nodes[act] = [];
		}
		this._nodes[act].push(component);
		this._components.push(component);  //注册组件
	};
	/*this.enable = function(name){
		var nodes = this._nodes[name];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].setDisabled(false);
		}
	};*/
	/**
	 * 启用名字为name对的action(可能是一组)
	 */
	this.enable = function(name){
		this.updateState(name, {"disabled": false});
	};
	/**
	 * 禁用名字为name对的action(可能是一组)
	 */
	this.disable = function(name){
		this.updateState(name, {"disabled": true});
	};
	/**
	 * 更新名字为name的action的状态
	 */
	this.updateState = function(name, state){
		if(name){
			this.update(name, state);
		}else{
			for(var k in this._nodes){
				this.update(k, state);
			}
		}
	};
	this.multipleUpdateState = function(actions){
		for(var k in actions){
			this.update(k, actions[k]);
		}
	};
	this.update = function(name, state){
		var nodes = this._nodes[name];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			for(var k in state){  //visible,disabled
				var name = "set" + k.charAt(0).toUpperCase() + k.substr(1);
				if(name in node){
					node[name](state[k]);
				}
			}
		}
	};
	/**
	 * 分派一个action
	 * @param {String} name action的名字
	 * @param {Element} sender action发送者
	 * @param {Event} ev 原始的事件
	 */
	this.dispatchAction = function(name, sender, ev){
		if(this._actionEngine.doAction){
			return this._actionEngine.doAction(name, sender, ev);
		}
	};
});
/*</file>*/
/*<file name="alz/core/ActionCollection.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * action收集器
 */
_class("ActionCollection", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._list = [];
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	this.append = function(action){
		this._list.push(action);
	};
	this.onDispatchAction = function(action, sender, ev){
		this.append({
			"ts"     : new Date().getTime(),
			"name"   : action,
			"sender" : sender,
			"result" : true,
			"usetime": 0,
			"feature": {
				"net_num": 0,
				"dat_num": 0,
				"flow"   : false
			}
		});
		this.showList();
	};
	this.showList = function(){
		var sb = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			sb.push(
				item.ts + ","
				+ item.name + ","
				+ (item.sender ? item.sender.tagName : "") + ","
				+ item.result + ","
				+ item.usetime
			);
		}
		//window.alert(sb.join("\n"));
	};
	/**
	 * 获取当前的action对象，该方法不能在action被触发之后的某个异步过程之中使用
	 */
	this.getActiveAction = function(){
		return this._list[this._list.length - 1];
	};
});
/*</file>*/
/*<file name="alz/core/ProductManager.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * 产品配置信息管理者类
 */
_class("ProductManager", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		/**
		 * 产品配置数据
		 * {
		 *   name: "sinamail-5.0",  //产品名称
		 *   tpl: [],   //模板
		 *   skin: [],  //皮肤
		 *   paper: []  //信纸
		 * }
		 */
		this._products = {};  //产品配置数据，格式[{name:"",tpl:[],skin:[],paper:[]},...]
		this._activeProduct = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeProduct = null;
		for(var k in this._products){
			delete this._products[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 注册一个产品配置数据
	 * @param {JsonObject} data 产品配置对象
	 */
	this.regProduct = function(data){
		if(data.name in this._products){
			window.alert("[ERROR]产品" + data.name + "已经注册过了");
		}else{
			this._products[data.name] = data;
			this._activeProduct = data;
		}
	};
	this.getActiveProduct = function(){
		if(this._activeProduct){
			return this._activeProduct;
		}
		for(var k in this._products){
			return this._products[k];
		}
		runtime.log("[WebRuntime::getProduct]data_xxx.js未能正确加载，系统无法正常运行，请检查！");
		return {
			"name" : "",  //产品名称
			"tpl"  : [],  //模板
			"skin" : [],  //皮肤
			"paper": [],  //信纸
			"app"  : []   //APP配置
		};
		//return null;
	};
});
/*</file>*/
/*<file name="alz/core/ToggleGroup.js">*/
_package("alz.core");

/**
 * 状态按钮分组
 */
_class("ToggleGroup", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._buttons = [];
		this._activeButton = null;
	};
	this.append = function(btn){
		this._buttons.push(btn);
	};
	this.toggle = function(v){
		if(this._activeButton == v){
			if(this._activeButton){
				this._activeButton.setToggled(false);
				this._activeButton = null;
			}
			return;
		}
		if(this._activeButton){
			this._activeButton.setToggled(false);
		}
		v.setToggled(true);
		this._activeButton = v;
	};
});
/*</file>*/
/*<file name="alz/core/ToggleManager.js">*/
_package("alz.core");

_import("alz.core.ToggleGroup");

/**
 * 双态按钮管理者
 */
_class("ToggleManager", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._groups = {};
	};
	this.add = function(btn){
		var groupid = btn.getGroupId();
		if(!this._groups[groupid]){
			this._groups[groupid] = new ToggleGroup();
		}
		this._groups[groupid].append(btn);
	};
	this.toggle = function(btn){
		this._groups[btn.getGroupId()].toggle(btn);
	};
});
/*</file>*/
/*<file name="alz/core/Animate.js">*/
_package("alz.core");

/**
 * 一个元素的一个动画效果代理
 */
_class("Animate", "", function(_super, _event){
	this.props = ("backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth "
		+ "borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize "
		+ "fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight "
		+ "maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft "
		+ "paddingRight paddingTop right textIndent top width wordSpacing zIndex "
		+ "borderBottomLeftRadius borderTopRightRadius borderTopLeftRadius borderTopRightRadius").split(" ");
	var div = document.createElement("div");
	/*
	var divStyle = div.style;
	var transTag = divStyle.MozTransform === "" ? "Moz" :
			(divStyle.WebkitTransform === "" ? "Webki" :
			(divStyle.OTransform === "" ? "O" :
			false)),
	var matrixFilter = !transTag && divStyle.filter === "",
	*/
	this._init = function(engine, data){
		_super._init.call(this);
		this._engine = engine;  //动画引擎
		this._data = data;    //动画数据
		this._func = null;    //动画函数
		this._target = null;  //目标值
		this._current = {};   //当前值
		this._dur = 0;        //时长
		this._startTime = 0;
		this._start = 0;      //开始时间
		this._stop = 0;       //结束时间

		this._started = false;
		this._stopped = false;

		this._msec = 10;      //定时器步长
		this._timer = 0;      //定时器
	};
	this.init = function(){
		var comp = runtime._element.style(this._data.element);  //实际值
		this._target = this.normalize(this._data.style);
		this._func = this._engine.getEffectFunc(this._data.func);
		for(var k in this._target){
			this._current[k] = this.parse(comp[k]);
		}
		this._dur = this._data.speed || 200;
		this._startTime = new Date().getTime();
		this._start = this._data.start || 0;
		this._stop  = this._data.start + this._dur;
		//this.start();
	};
	this.dispose = function(){
		for(var k in this._current){
			delete this._current[k];
		}
		this._target = null;
		this._func = null;
		this._data = null;
		this._engine = null;
		_super.dispose.apply(this);
	};
	/*
	 * from:http://github.com/madrobby/emile/
	 */
	this.interpolate = function(source, target, pos){
		if(isNaN(source)){
			source = 0;
		}
		return (source + (target - source) * pos).toFixed(3);
	};
	/*
	 * 转换为rgb(255,255,255)格式
	 */
	this.color = function(source, target, pos){
		function s(str, p, c){
			if(typeof str != "string"){
				str = "" + str;
			}
			return str.substr(p, c || 1);
		}
		var i = 2, j, c, tmp, v = [], r = [];
		while(j = 3, c = arguments[i - 1], i--){
			if(s(c, 0) == "r"){
				c = c.match(/\d+/g);
				while(j--){
					v.push(~ ~c[j]);
				}
			}else{
				if(c.length == 4){
					c = "#" + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
				}
				while(j--){
					v.push(parseInt(s(c, 1 + j * 2, 2), 16));
				}
			}
		}
		while(j--){
			tmp = ~ ~(v[j + 3] + (v[j] - v[j + 3]) * pos);
			r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
		}
		return "rgb(" + r.join(",") + ")";
	};
	this.parse = function(prop){
		if(!prop){
			prop = "0";  //IE下取不到没有设定的样式
		}
		var p = parseFloat(prop);
		var q = prop.replace(/^[\-\d\.]+/, "");
		return isNaN(p)
			? {"a": this, "f": "color"      , "v": q, "u": ""}
			: {"a": this, "f": "interpolate", "v": p, "u": q };
	};
	/**
	 * 把json描述的样式应用到实际元素el上计算出实际的字符串表示的样式
	 * [TODO]这种属性值还不能正确解析(border-top-right-radius:0px 0px;)
	 * @param {HTMLElement} el
	 * @param {Object} style
	 */
	this._formatStyle = function(el, style){
		var comp = runtime._element.style(this._data.element);
		var sb = [];
		for(var k in style){
			var v = style[k];
			if(v.charAt(1) == "="){  //相对数值计算
				var a = parseInt(comp[k]);
				var b = parseInt(v.substr(2));
				v = (v.charAt(0) == "-" ? a - b : a + b) + "px";
			}
			sb.push(k + ":" + v);
		}
		return sb.join(";");
	};
	/**
	 * 样式名标准化
	 */
	this.normalize = function(style){
		if(typeof style == "object"){
			style = this._formatStyle(this._data.element, style);
		}
		var rules = {};
		div.innerHTML = '<div style="' + style + '"></div>';
		var style = div.childNodes[0].style;
		for(var i = 0, len = this.props.length; i < len; i++){
			var k = this.props[i];
			var v = style[k];
			if(v){
				rules[k] = this.parse(v);
			}
		}
		return rules;
	};
	/**
	 * 开始播放动画
	 */
	this.start = function(){
		var _this = this;
		this._timer = window.setInterval(function(){
			_this.step();
		}, this._msec);
	};
	/**
	 * 停止播放动画
	 */
	this.stop = function(){
		this.onStop();
		this._engine.deQueue(this._data.element, "fx");
	};
	/**
	 * 播放一帧动画
	 */
	this.step = function(){
		var t = new Date().getTime() - this._startTime;  //当前时间距开始时间的差
		this.onStep(t);
		if(t > this._stop){  //判断是否结束
			this.stop();
		}
	};
	this.onStart = function(){
		this._started = true;
		if(this._data["onstart"]){
			this._data["onstart"].apply(this._data.element);
		}
		//在onstart事件执行完毕之后才能正确获取元素的实际样式
		var comp = runtime._element.style(this._data.element);  //实际值
		this._target = this.normalize(this._data.style);
		this._func = this._engine.getEffectFunc(this._data.func);
		for(var k in this._target){
			this._current[k] = this.parse(comp[k]);
		}
	};
	this.onStop = function(){
		if(this._stopped) return;
		this._stopped = true;
		if(this._timer != 0){
			window.clearInterval(this._timer);
			this._timer = 0;
		}
		if(this._data["onstop"]){
			this._data["onstop"].apply(this._data.element);
		}
	};
	/**
	 * [TODO]通过对onStep的同步来达到复杂动画的内部协同
	 * @param {Date} t 当前时间
	 */
	this.onStep = function(t){
		if(this._data["onstep"]){
			this._data["onstep"].apply(this._data.element);
		}
		var x = t <= this._stop ? (t - this._start) / this._dur : 1;  //x坐标[0-1]
		//console.log("x=" + x);
		for(var k in this._target){
			var o = this._target[k];
			var n = o.a[o.f].call(o.a, this._current[k].v, o.v, this._func(x));
			/*
			this.arr.push({"t": t, "s": this._func(x)});
			if(k == "opacity"){
				console.log(
					"t=" + t
					+ ",x=" + x
					+ ",c.v=" + this._current[k].v
					+ ",o.v=" + o.v
					+ ",this._func(x)=" + this._func(x)
					+ ",n=" + n
				);
				console.log(k + "=" + (n + o.u));
			}
			*/
			runtime._element.css(this._data.element, k, n + o.u);  //调整一个style属性
		}
		return x;
	};
});
/*</file>*/
/*<file name="alz/core/AnimateData.js">*/
_package("alz.core");

_import("alz.core.Animate");

/**
 * 一组动画
 */
_class("AnimateData", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._engine = null;
		this._cbid = -1;
		this._msec = 10;  //定时器步长
		this._timer = 0;  //定时器
		this._startTime = 0;  //总开始时间
		this._stopTime = 0;   //总结束时间
		this._list = [];  //一组动画列表
		//this._startList = [];  //按开始时间排序的动画列表
		//this._stopList = [];   //按结束时间排序的动画列表
		this._stopped = false;
	};
	this.create = function(engine, data, cbid){
		this._engine = engine;
		this._cbid = cbid || -1;
		this._startTime = new Date().getTime();
		for(var i = 0, len = data.length; i < len; i++){
			this.add(data[i]);
			//var a = data[i];
			//this.animate(a[0], a[1], a[3], a[4], a[5]);
		}
	};
	this.dispose = function(){
		if(this._timer != 0){
			this.stop();
		}
		/*
		for(var i = 0, len = this._stopList.length; i < len; i++){
			this._stopList[i] = null;
		}
		this._stopList.length = 0;
		for(var i = 0, len = this._startList.length; i < len; i++){
			this._startList[i] = null;
		}
		this._startList.length = 0;
		*/
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].dispose();
			this._list[i] = null;
		}
		this._list.length = 0;
		this._startTime = 0;
		this._stopTime = 0;
		this._engine = null;
		_super.dispose.apply(this);
	};
	this.add = function(data){
		if(typeof data[4] != "string") data[4] = "easeNone";
		var nodes = data[0] instanceof Array ? data[0] : [data[0]];  //jQuery
		for(var i = 0, len = nodes.length; i < len; i++){
			var adata = {
				"element" : nodes[i]._self || nodes[i],  //目标元素
				"style"   : data[1],  //目标值
				"start"   : data[2],  //开始时间
				"speed"   : data[3],  //时长
				"func"    : data[4],  //动画效果
				"onstart" : data[5],  //onstart回调函数
				"onstop"  : data[6],  //onstop回调函数  [TODO]回调函数被重复执行了多次
				"onstep"  : data[7]   //onstep回调函数
			};
			var obj = new Animate(this._engine, adata);
			obj.init();
			//obj.start();
			//this.enQueue(nodes[i], "fx", {"agent": obj, "func": "init"});
			this._stopTime  = Math.max(obj._stop, this._stopTime);
			this._list.push(obj);
			//this._startList.push(obj);
			//this._stopList.push(obj);
		}
	};
	this._start = function(){
		this._d1 = new Date().getTime();
		if(this.step()){
			if(this._timer == 0){
				this._timer = runtime.startTimer(this._msec, this, "_start");
			}
			return true;
		}else{
			this.stop();
			this.dispose();
		}
	};
	/**
	 * 开始播放动画
	 */
	this.start = function(){
		//console.log("start");
		this._start();
	};
	/**
	 * 停止播放动画
	 */
	this.stop = function(){
		if(this._stopped) return;
		this._stopped = true;
		runtime.stopTimer(this._timer);
		for(var i = 0, len = this._list.length; i < len; i++){
			var a = this._list[i];
			if(!a._stopped){
				a.onStop();
			}
		}
		if(this._cbid != -1){
			runtime._task.execute(this._cbid);
		}
	};
	/**
	 * 播放一帧动画
	 */
	this.step = function(){
		this._d2 = new Date().getTime();
		this._startTime += this._d2 - this._d1;  //为了step方法能够设置断点
		var t = new Date().getTime() - this._startTime;  //当前时间距开始时间的差
		for(var i = 0, len = this._list.length; i < len; i++){
			var a = this._list[i];
			//console.log("----a._start=" + a._start + ",t=" + t + ",a._stop=" + a._stop);
			if(t < a._start){
			}else if(a._start <= t && t <= a._stop){
				if(!a._started){
					//a.arr = [];
					a.onStart();
				}
				var x = a.onStep(t, this._msec);
				if(x === 1){
					a.onStop();
					//this._stopped = true;
				}
			}else if(t > a._stop){  //结束后，只需执行一次onStep
				if(!this._stopped){
					var x = a.onStep(t, this._msec);  //[TO-DO]可能会重复一次x=1的情况
					runtime.assert(x === 1, "error");
					a.onStop();
					//this._stopped = true;
				}
				a.onStop();
				//runtime._debugPane.showTable(a.arr);
			}
		}
		//console.log(t + "<" + this._stopTime + "=" + (t < this._stopTime));
		return t < this._stopTime;  //判断是否结束
	};
});
/*</file>*/
/*<file name="alz/core/AnimationEngine.js">*/
_package("alz.core");

_import("alz.core.Plugin");
_import("alz.core.AnimateData");

/**
 * 由陈超群同学提供，参考部分jQuery，madrobby/emile源码，整合Easing效果库
 *
 * 动画引擎 animate 动画效果模块(插件)
 * 动画组件，使元素可以产生动画效果
 *
 * TO:CSS3支持,rotate旋转支持,目前还没有实现如jquery的队列机制,同时执行好几个动画会有问题
 */
_class("AnimationEngine", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._ad = null;  //{AnimateData}
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._ad){
			this._ad.dispose();
			this._ad = null;
		}
		_super.dispose.apply(this);
	};
	this._easing = (function(){
		var PI = Math.PI;
		var abs = Math.abs;
		var pow = Math.pow;
		var sin = Math.sin;
		var cos = Math.cos;
		var sqrt = Math.sqrt;
		var asin = Math.asin;
		var BACK_CONST = 1.70158;
		var Easing = {
			/**
			 * Uniform speed between points.
			 */
			easeNone: function(t){
				//return t;
				return (-cos(t * PI) / 2) + 0.5;
			},
			/**
			 * Begins slowly and accelerates towards end. (quadratic)
			 */
			easeIn: function(t){
				return t * t;
			},
			/**
			 * Begins quickly and decelerates towards end.  (quadratic)
			 */
			easeOut: function(t){
				return (2 - t) * t;
			},
			/**
			 * Begins slowly and decelerates towards end. (quadratic)
			 */
			easeBoth: function(t){
				return (t *= 2) < 1 ?
					.5 * t * t :
					.5 * (1 - (--t) * (t - 2));
			},
			/**
			 * Begins slowly and accelerates towards end. (quartic)
			 */
			easeInStrong: function(t){
				return t * t * t * t;
			},
			/**
			 * Begins quickly and decelerates towards end.  (quartic)
			 */
			easeOutStrong: function(t){
				return 1 - (--t) * t * t * t;
			},
			/**
			 * Begins slowly and decelerates towards end. (quartic)
			 */
			easeBothStrong: function(t){
				return (t *= 2) < 1 ?
					.5 * t * t * t * t :
					.5 * (2 - (t -= 2) * t * t * t);
			},
			/**
			 * Snap in elastic effect.
			 */
			elasticIn: function(t){
				var p = .3, s = p / 4;
				if(t === 0 || t === 1) return t;
				return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
			},
			/**
			 * Snap out elastic effect.
			 */
			elasticOut: function(t){
				var p = .3, s = p / 4;
				if(t === 0 || t === 1) return t;
				return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
			},
			/**
			 * Snap both elastic effect.
			 */
			elasticBoth: function(t){
				var p = .45, s = p / 4;
				if(t === 0 || (t *= 2) === 2) return t;
				if(t < 1){
					return -.5 * (pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
				}
				return pow(2, -10 * (t -= 1)) * sin((t - s) * (2 * PI) / p) * .5 + 1;
			},
			/**
			 * Backtracks slightly, then reverses direction and moves to end.
			 */
			backIn: function(t){
				if(t === 1) t -= .001;
				return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
			},
			/**
			 * Overshoots end, then reverses and comes back to end.
			 */
			backOut: function(t){
				return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
			},
			/**
			* Backtracks slightly, then reverses direction, overshoots end,
			* then reverses and comes back to end.
			*/
			backBoth: function(t){
				if((t *= 2) < 1){
					return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
				}
				return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
			},
			/**
			 * Bounce off of start.
			 */
			bounceIn: function(t){
				return 1 - Easing.bounceOut(1 - t);
			},
			/**
			* Bounces off end.
			*/
			bounceOut: function(t){
				var s = 7.5625, r;
				if(t < (1 / 2.75)){
					r = s * t * t;
				}else if(t < (2 / 2.75)){
					r = s * (t -= (1.5 / 2.75)) * t + .75;
				}else if(t < (2.5 / 2.75)){
					r = s * (t -= (2.25 / 2.75)) * t + .9375;
				}else{
					r = s * (t -= (2.625 / 2.75)) * t + .984375;
				}
				return r;
			},
			/**
			 * Bounces off start and end.
			 */
			bounceBoth: function(t){
				if(t < .5){
					return Easing.bounceIn(t * 2) * .5;
				}
				return Easing.bounceOut(t * 2 - 1) * .5 + .5;
			}
			/*
			// simple linear tweening - no easing
			// t: current time, b: beginning value, c: change in value, d: duration
			linearTween, function(t, b, c, d){
				return c*t/d + b;
			},
			///////////// QUADRATIC EASING: t^2 ///////////////////
			// quadratic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be in frames or seconds/milliseconds
			easeInQuad: function(t, b, c, d){
				return c*(t/=d)*t + b;
			},
			// quadratic easing out - decelerating to zero velocity
			easeOutQuad: function(t, b, c, d){
				return -c *(t/=d)*(t-2) + b;
			},
			// quadratic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuad: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t + b;
				return -c/2 * ((--t)*(t-2) - 1) + b;
			},
			///////////// CUBIC EASING: t^3 ///////////////////////
			// cubic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInCubic: function(t, b, c, d){
				return c*(t/=d)*t*t + b;
			},
			// cubic easing out - decelerating to zero velocity
			easeOutCubic: function(t, b, c, d){
				return c*((t=t/d-1)*t*t + 1) + b;
			},
			// cubic easing in/out - acceleration until halfway, then deceleration
			easeInOutCubic: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t + b;
				return c/2*((t-=2)*t*t + 2) + b;
			},
			///////////// QUARTIC EASING: t^4 /////////////////////
			// quartic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInQuart: function(t, b, c, d){
				return c*(t/=d)*t*t*t + b;
			},
			// quartic easing out - decelerating to zero velocity
			easeOutQuart: function(t, b, c, d){
				return -c * ((t=t/d-1)*t*t*t - 1) + b;
			},
			// quartic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuart: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t*t + b;
				return -c/2 * ((t-=2)*t*t*t - 2) + b;
			},
			///////////// QUINTIC EASING: t^5  ////////////////////
			// quintic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInQuint: function(t, b, c, d){
				return c*(t/=d)*t*t*t*t + b;
			},
			// quintic easing out - decelerating to zero velocity
			easeOutQuint: function(t, b, c, d){
				return c*((t=t/d-1)*t*t*t*t + 1) + b;
			},
			// quintic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuint: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
				return c/2*((t-=2)*t*t*t*t + 2) + b;
			},
			///////////// SINUSOIDAL EASING: sin(t) ///////////////
			// sinusoidal easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInSine: function(t, b, c, d){
				return -c * cos(t/d * (PI/2)) + c + b;
			},
			// sinusoidal easing out - decelerating to zero velocity
			easeOutSine: function(t, b, c, d){
				return c * sin(t/d * (PI/2)) + b;
			},
			// sinusoidal easing in/out - accelerating until halfway, then decelerating
			easeInOutSine: function(t, b, c, d){
				return -c/2 * (cos(PI*t/d) - 1) + b;
			},
			///////////// EXPONENTIAL EASING: 2^t /////////////////
			// exponential easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInExpo: function(t, b, c, d){
				return (t==0) ? b : c * pow(2, 10 * (t/d - 1)) + b;
			},
			// exponential easing out - decelerating to zero velocity
			easeOutExpo: function(t, b, c, d){
				return (t==d) ? b+c : c * (-pow(2, -10 * t/d) + 1) + b;
			},
			// exponential easing in/out - accelerating until halfway, then decelerating
			easeInOutExpo: function(t, b, c, d){
				if(t==0) return b;
				if(t==d) return b+c;
				if((t/=d/2) < 1) return c/2 * pow(2, 10 * (t - 1)) + b;
				return c/2 * (-pow(2, -10 * --t) + 2) + b;
			},
			/////////// CIRCULAR EASING: sqrt(1-t^2) //////////////
			// circular easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInCirc: function(t, b, c, d){
				return -c * (sqrt(1 - (t/=d)*t) - 1) + b;
			},
			// circular easing out - decelerating to zero velocity
			easeOutCirc: function(t, b, c, d){
				return c * sqrt(1 - (t=t/d-1)*t) + b;
			},
			// circular easing in/out - acceleration until halfway, then deceleration
			easeInOutCirc: function(t, b, c, d){
				if((t/=d/2) < 1) return -c/2 * (sqrt(1 - t*t) - 1) + b;
				return c/2 * (sqrt(1 - (t-=2)*t) + 1) + b;
			},
			/////////// ELASTIC EASING: exponentially decaying sine wave  //////////////
			// t: current time, b: beginning value, c: change in value, d: duration, a: amplitude (optional), p: period (optional)
			// t and d can be in frames or seconds/milliseconds
			easeInElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				return -(a*pow(2,10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )) + b;
			},
			easeOutElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				return a*pow(2,-10*t) * sin( (t*d-s)*(2*PI)/p ) + c + b;
			},
			easeInOutElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				if(t < 1) return -.5*(a*pow(2,10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )) + b;
				return a*pow(2,-10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )*.5 + c + b;
			},
			/////////// BACK EASING: overshooting cubic easing: (s+1)*t^3 - s*t^2  //////////////
			// back easing in - backtracking slightly, then reversing direction and moving to target
			// t: current time, b: beginning value, c: change in value, d: duration, s: overshoot amount (optional)
			// t and d can be in frames or seconds/milliseconds
			// s controls the amount of overshoot: higher s means greater overshoot
			// s has a default value of 1.70158, which produces an overshoot of 10 percent
			// s==0 produces cubic easing with no overshoot
			easeInBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				return c*(t/=d)*t*((s+1)*t - s) + b;
			},
			// back easing out - moving towards target, overshooting it slightly, then reversing and coming back to target
			easeOutBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			},
			// back easing in/out - backtracking slightly, then reversing direction and moving to target,
			// then overshooting target, reversing, and finally coming back to target
			easeInOutBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
				return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
			},
			/////////// BOUNCE EASING: exponentially decaying parabolic bounce  //////////////
			// bounce easing in
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInBounce: function(t, b, c, d){
				return c - Easing.easeOutBounce (d-t, 0, c, d) + b;
			},
			// bounce easing out
			easeOutBounce: function(t, b, c, d){
				if((t/=d) < (1/2.75)){
					return c*(7.5625*t*t) + b;
				}else if(t < (2/2.75)){
					return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
				}else if(t < (2.5/2.75)){
					return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
				}else{
					return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
				}
			},
			// bounce easing in/out
			easeInOutBounce: function(t, b, c, d){
				if(t < d/2) return Easing.easeInBounce (t*2, 0, c, d) * .5 + b;
				return Easing.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
			}
			*/
		};
		return Easing;
	})();
	this.getEffectFunc = function(name){
		return this._easing[name in this._easing ? name : "easeNone"];
	};
	//针对单个元素动画的队列
	this.getQueue = function(el, type){
		var q = runtime._element.data(el, type);
		//Speed up dequeue by getting out quickly if this is just a lookup
		return q || [];
	};
	/**
	 * 入队
	 * @param {HTMLElement} el
	 * @param {String} type "fx"
	 * @param {Function} data
	 */
	this.enQueue = function(el, type, data){
		var q = runtime._element.data(el, type) || runtime._element.data(el, type, data instanceof Array ? data : [data]);
		q.push(data);
		if(this.getQueue(el, "fx")[0] !== "inprogress"){
			this.deQueue(el, type);
		}
		return q;
	};
	//出队
	this.deQueue = function(el, type){
		var queue = this.getQueue(el, type);
		var obj = queue.shift();
		//如果fx队列正在dequeued，删除队首的哨兵
		if(obj === "inprogress"){
			obj = queue.shift();
		}
		if(obj){
			//添加一个哨兵，用来防止自动出队
			if(type === "fx"){
				queue.unshift("inprogress");
			}
			obj.agent[obj.func].call(obj.agent, el/*, this, function(){this.deQueue(el, type);}*/);
		}
	};
	/**
	 * 运行批量动画
	 * @param {Array} data [el, style, start, speed, easingfun, onstart, onstop, onstep]
	 */
	this.run = function(data, agent, func){
		var cbid = runtime._task.add(agent, func);
		if(this._ad){
			this._ad.dispose();
		}
		this._ad = new AnimateData();
		this._ad.create(this, data, cbid);
		this._ad.start();
	};
	/**
	 * 动画主函数
	 * animate(el, "width:100px", 5, "bounceOut", function(){});
	 */
	this.animate = function(el, style, speed, easingfun, agent, func){
		var data = [[el, style, 0, speed, easingfun, null, null, null]];
		this.run(data, agent, func);
	};
	/*
	 * 旋转
	 */
	this.rotate = function(){
		//暂时未实现
	};
	//Node animate
	var speeds = {
		"slow"    : 600,
		"fast"    : 200,
		"_default": 400  //Default speed
	};
	var FX = {
		"show" : ["overflow", "opacity", "height", "width"],
		"fade" : ["opacity"],
		"slide": ["overflow", "height"]
	};
	var effects = {
		"show"     : ["show"  , 1],
		"hide"     : ["show"  , 0],
		"toggle"   : ["toggle"],
		"fadeIn"   : ["fade"  , 1],
		"fadeOut"  : ["fade"  , 0],
		"slideDown": ["slide" , 1],
		"slideUp"  : ["slide" , 0]
	};
	function createFunc(k){
		return function(el, speed, agent, func){
			if(typeof el != "object"){
				runtime.error("[AnimationEngine::createFunc*]error");
				return;
			}
			/*
			if(k == "fadeIn"){  //[TODO]fixed
				el.style.opacity = "1";
				el.style.display = "";
			}else if(k == "fadeOut"){
				el.style.opacity = "0";
				el.style.display = "none";
			}
			*/
			var element = runtime._element;
			//if(!element.data(el, "height")){
				element.data(el, "height" , element.height(el));
				element.data(el, "width"  , element.width(el));
				element.data(el, "opacity", element.css(el, "opacity"));
			//}
			if(!speed){
				speed = speeds._default;
			}else if(typeof speed == "string"){
				speed = speeds[speed];
			}else if(typeof speed == "function" || typeof speed == "object"){
				func = agent;
				agent = speed;
			}
			this._runFx(el, effects[k][0], speed, effects[k][1], agent, func/*, [el]*/);
		};
	}
	for(var k in effects){
		this[k] = createFunc(k);
	}
	this._runFx = function(el, action, speed, display, agent, func){
		/*
		if(display || action === "toggle"){
			el.style.display = "";
		}
		*/
		if(action === "toggle"){
			display = runtime._element.css(el, "height") === "0px" ? 1 : 0;
			action = "show";
		}
		var style = [];
		var oldW = runtime._element.data(el, "width");
		var oldH = runtime._element.data(el, "height");
		var oldOp = runtime._element.data(el, "opacity");
		//var _this = this;
		//FX[action].forEach(function(p){});
		var arr = FX[action];
		for(var i = 0, len = arr.length; i < len; i++){
			switch(arr[i]){
			case "overflow":
				runtime._element.css(el, "overflow", "hidden");
				break;
			case "opacity":
				var s = display ? oldOp + ";" : "0;";
				style.push("opacity:" + s);
				if(display) runtime._element.css(el, "opacity", "0");
				break;
			case "height":
				var s = display ? oldH + "px;" : "0px;";
				style.push("height:" + s);
				if(display) runtime._element.css(el, "height", "0px");
				break;
			case "width":
				var s = display ? oldW + "px;" : "0px";
				style.push("width:" + s);
				if(display) runtime._element.css(el, "width", "0px");
				break;
			}
		}
		//分析最终样式后进行动画
		this.animate(el, style.join(""), speed, "easeIn", agent, func);
		//this, function(){if(!display){el.style.display = "none";}}
	};
	/*
	/ *
	 * 链式
	 * /
	["hide","show","slideDown","slideUp","fadeIn","fadeOut","animate"].forEach(function(p){
		B.extend(p, function(){
			for(var i = 0, len = this.nodes.length; i < len; i++){
				var el = this.nodes[i];
				B[p].apply(el, [el].concat(arguments));
			}
			return this;
		});
	});
	*/
});
/*</file>*/
/*<file name="alz/core/WebRuntime_core.js">*/
_package("alz.core");

_import("alz.core.DOMUtil");
//_import("alz.core.DOMUtil2");
_import("alz.core.AjaxEngine");
_import("alz.core.XPathQuery");
_import("alz.template.TemplateManager");
_import("alz.core.ActionCollection");
_import("alz.core.ProductManager");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	var properties = ["_ajax", "_template", "_actionCollection", "_productManager"];
	this.__conf__({
		"plugin": [  //插件配置列表
			{"id": "ajax"            , "clazz": "AjaxEngine"      },  //异步请求引擎
			{"id": "dom"             , "clazz": "DOMUtil"         },  //DOM操作工具
		//{"id": "element"         , "clazz": "Element"         },  //DOM元素操作
		//{"id": "animation"       , "clazz": "AnimationEngine" },  //动画引擎
		//{"id": "eventManager"    , "clazz": "EventManager"    },  //事件管理
		//{"id": "gestureManager"  , "clazz": "GestureManager"  },  //手势管理
			{"id": "xpq"             , "clazz": "XPathQuery"      },  //xpath选择器
			{"id": "template"        , "clazz": "TemplateManager" },  //模版引擎
			{"id": "actionCollection", "clazz": "ActionCollection"},  //用户行为动作收集器
			{"id": "productManager"  , "clazz": "ProductManager"  }   //产品管理者
		]
	});
	this._init = function(){  //加载之后的初始化工作
		//创建插件
		//this._pluginManager.create(this, this.findConf("plugin"));
		this._xpq = new XPathQuery();
		//this.regPlugin("dom", DOMUtil);
		this.dom = new DOMUtil();
		//this.domutil = new DomUtil2();
		if(!this.getParentRuntime()){
			this._ajax = new AjaxEngine();  //异步交互引擎
			this._template = new TemplateManager();  //模版引擎
			this._actionCollection = new ActionCollection();
			//[TODO]一个运行时环境需要管理多个产品配置信息么？
			this._productManager = new ProductManager();
		}else{
			for(var i = 0, len = properties.length; i < len; i++){
				var k = properties[i];
				this[k] = this._parentRuntime["get" + k.charAt(1).toUpperCase() + k.substr(2)]();
			}
			/*
			this._ajax = this._parentRuntime.getAjax();
			this._template = this._parentRuntime.getTemplate();
			this._actionCollection = this._parentRuntime.getActionCollection();
			*/
		}
		//this._ajax._userinfo = true;
		//设置测试用例
		/*
		var win = this.getMainWindow();
		if(win && typeof win.runtime != "unknown" && typeof win.runtime != "undefined"){  //winxp下需要检测 win.runtime
			this._ajax.setTestCase(win.runtime._ajax.getTestCase());
		}
		*/
		if(this._debug){
			document.onmousedown = function(ev){
				ev = ev || window.event;
				if(ev.ctrlKey){
					var target = ev.target || ev.srcElement;
					for(var el = target; el; el = el.parentNode){
						if(el.__ptr__){
							var arr = runtime.forIn(el.__ptr__);
							arr.push("class=" + el.className);
							arr.push("tagName=" + el.tagName);
							window.alert(arr.join("\n"));
							break;
						}
					}
				}
			};
		}
		//if(typeof sinamail_data != "undefined"){
		//	this.regProduct(sinamail_data);
		//}
	};
	this.dispose = function(){
		this._productManager.dispose();
		this._productManager = null;
		if(this._debug){
			document.onmousedown = null;
		}
		for(var i = 0, len = properties.length; i < len; i++){
			var k = properties[i];
			if(this[k]){
				if(!this._parentRuntime){
					this[k].dispose();
				}
				this[k] = null;
			}
		}
		//this.domutil.dispose();
		//this.domutil = null;
		/*
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
		*/
		this._xpq.dispose();
		this._xpq = null;
	};
	/**
	 * 返回用于操作DOM元素的工具类对象
	 */
	this.getDom = function(){
		return this.dom;
	};
	/**
	 * 返回用于异步交互的异步交互引擎
	 */
	this.getAjax = function(){
		return this._ajax;
	};
	this.getTemplate = function(){
		return this._template;
	};
	this.getActionCollection = function(){
		return this._actionCollection;
	};
	this.getProductManager = function(){
		return this._productManager;
	};
	/**
	 * 去除字符串前后的空白字符
	 * @param {String} str 要处理的字符串
	 */
	this.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	};
	this.closure = function(o, func, p1, p2){
		return function(){
			if(typeof o == "object" && typeof func == "string" && typeof o[func] == "function"){
				return o[func](p1, p2);
			}else if(typeof o == "function"){
				return o(func, p1, p2);
			}else{
				runtime.log("[ERROR]闭包使用错误！");
			}
		};
	};
	/**
	 * HTML 代码编码方法
	 * @param {String} html 要编码的 HTML 代码字符串
	 */
	this.encodeHTML = function(html){
		if(!html){
			return "";
		}else{
			return html
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/\"/g, "&quot;")
				//.replace(/\'/g, "&apos;")
				.replace(/ /g, "&nbsp;")
				.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
				.replace(/\r?\n/g, "<br />");
		}
	};
	/**
	 * HTML 代码解码方法
	 * @param {String} html 要解码的 HTML 代码字符串
	 */
	this.decodeHTML = function(html){
		if(!html){
			return "";
		}else{
			return html
				//.replace(/&#37;/ig, '%')
				.replace(/&nbsp;/ig, " ")
				.replace(/&quot;/ig, "\"")
				//.replace(/&apos;/ig, "\'")
				.replace(/&gt;/ig, ">")
				.replace(/&lt;/ig, "<")
				.replace(/&#(\d{2}|\d{4});/ig, function(_0, _1){
					return String.fromCharCode(_1);
				})
				.replace(/&amp;/ig, "&");
		}
	};
	/**
	 * 根据参数 progid 创建一个 ActiveXObject，成功返回对象，失败返回 null
	 * @param {String} progid ActiveXObject 控件的 PROGID
	 */
	this.createComObject = function(progid){
		try{
			if(this._hostenv == "ie" && this._win.host){
				return this._win.host.createComObject(progid);
			}else{
				return new ActiveXObject(progid);
			}
		}catch(ex){
			this.showException(ex, "创建 {0} 组件失败".replace(/\{0\}/, progid));
			return null;
		}
	};
	/*this.getMainWindow = function(){
		var win;
		if(!this.inGadget){
			if(this._win.opener){
				win = this._win.opener;
			}/ *else{
				;
			}* /
		}else{
			win = System.Gadget.document.parentWindow;
		}
		return win;
	};*/
	this.getParentWindow = function(){
		return this.getMainWindow();
	};
	this.openDialog = function(url, width, height){
		var screen = {
			"w": this._win.screen.availWidth,
			"h": this._win.screen.availHeight
		};
		var features = "fullscreen=0,channelmode=0,toolbar=0,location=0,"
			+ "directories=0,status=0,menubar=0,scrollbars=0,resizable=1"
			+ ",left=" + Math.round((screen.w - width) / 2)
			+ ",top=" + Math.round((screen.h - height) / 2)
			+ ",width=" + width
			+ ",height=" + height;
		//return this._win.showModelessDialog(url, "123", "dialogTop:100px;dialogLeft:100px;dialogWidth:400px;dialogHeight:580px;resizable:1;status:0;help:0;edge:raised;");
		return this._win.open(url, "_blank", features);
	};
	this.createEvent = function(ev){
		var o = {};
		//o.sender = ev.sender || null;  //事件发送者
		o.type = ev.type;
		o.target = ev.srcElement || ev.target;  //IE和FF的差别
		o.reason = ev.reason;
		o.cancelBubble = ev.cancelBubble;
		o.returnValue = ev.returnValue;
		o.srcFilter = ev.srcFilter;
		o.fromElement = ev.fromElement;
		o.toElement = ev.toElement;
		//mouse event
		o.button = ev.button;
		o.screenX = ev.screenX;
		o.screenY = ev.screenY;
		o.clientX = ev.clientX;
		o.clientY = ev.clientY;
		o.offsetX = ev.offsetX || 0;
		o.offsetY = ev.offsetY || 0;
		o.x = ev.x || ev.clientX;
		o.y = ev.y || ev.clientY;
		//key event
		o.altKey = ev.altKey;
		o.ctrlKey = ev.ctrlKey;
		o.shiftKey = ev.shiftKey;
		o.keyCode = ev.keyCode;
		return o;
	};
	/**
	 * 注册产品
	 */
	this.regProduct = function(v){
		this._productManager.regProduct(v);
		this._appManager.setConfList(v.app);
		this._template.init("tpl/");  //模板
		this._template.appendItems(v.tpl);
	};
	/**
	 * 注册一组模板列表数据
	 */
	/*
	this.regTpl = function(data){
		this._template.appendItems(data);
	};
	*/
	/**
	 * 注册一个动态创建的模板
	 */
	this.__tpl__ = function(name, type, data){
		this._template.appendItem(name, type, data);
	};
	/*
	//检查组件上的DOM属性及其事件是否清理干净
	this.checkDomClean = function(component){
		//this.checkEvents(component._self);
		/ *
		var hash = component;
		for(var k in hash){
			if(typeof hash[k] == "obj"){
			}
		}
		* /
	};
	this._alert = window.alert;
	this.checkEvents = function(el){
		if(el.__checked__) return;
		var a = [];
		for(var k in el){
			a.push(k);
			if(k == "__checked__") continue;
			if(k == "_ptr") break;
			if(k.substr(0, 2) == "on" && typeof el[k] == "function"){
				if(this._alert){
					this._alert(el);
				}
			}
			try{
			if(el.hasChildNodes && el.hasChildNodes()){
				var nodes = el.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					this.checkEvents(nodes[i]);
				}
			}
			}catch(ex){
				window.alert(ex);
			}
		}
		el.__checked__ = true;
	};
	this.getProduct = function(){
		if(!this._product){
			runtime.log("[WebRuntime::getProduct]data_xxx.js未能正确加载，系统无法正常运行，请检查！");
			this._product = {
				"name" : "",  //产品名称
				"tpl"  : [],  //模板
				"skin" : [],  //皮肤
				"paper": [],  //信纸
				"app"  : []   //APP配置
			};
		}
		return this._product;
	};
	*/
	/**
	 * 根据 className 获取相应的 DOM 元素
	 * @return {Array} 符合条件的元素组成的数组
	 * [TODO]效率极低，有待优化
	 */
	/*
	this.getElementsByClassName = function(className){
		var a = [];
		var nodes = this._doc.getElementsByTagName("*");
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(node.className.indexOf(className) != -1){
				a.push(node);
			}
		}
		return a;
	};
	*/
});
/*</file>*/

}});