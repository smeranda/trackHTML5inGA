/*
 * trackHTML5inGA 
 * v0.1
 *
 * Track HTML Features in Google Analytics
 * http://go.unl.edu/trackHTML5inGA
 *
 * Copyright (c) 2010 Seth Meranda - http://seth.meranda.org/
 * Dual-licensed under the BSD and MIT licenses.
 *
 * * * ----------------------------------------------------
 * * * This script uses the Modernizr JavaScript library
 * * *
 * * * Copyright (c) 2009-2010 Faruk Ates - http://farukat.es/
 * * * Dual-licensed under the BSD and MIT licenses.
 * * * http://www.modernizr.com/license/
 * * *
 * * * This has been slightly modified for trackHTML5inGA: 
 * * *    removing the lines which add classes to <html>
 * * *----------------------------------------------------
 */

var loadingJS = {};
trackHTML5inGA = function() {
	return {
		version : '0.1',
		
		index : 5,
		
		loadedJS : {},
		
		featuresToTrack : featuresToTrack || false,
		
		initialize : function() {
			if (trackHTML5inGA.featuresToTrack) {
				console.log('tested true for array');
				trackHTML5inGA.checkCookie();
			} else {
				console.log('we don\'t have an array');
				return;
			}
		},
		
		loadJS : function(url,callback) {
			if (!trackHTML5inGA.loadedJS[url]){
				if (url in loadingJS) {
					loadingJS[url].push(callback);
					return;
				};
				loadingJS[url] = [];
				var e = document.createElement("script");
				e.setAttribute('src', url);
				e.setAttribute('type','text/javascript');
				document.getElementsByTagName('head').item(0).appendChild(e);
				
				loadingJS[url].push(callback);
				
				var executeCallback = function() {
					trackHTML5inGA.loadedJS[url] = 1;
					if (loadingJS[url]) {
						for (var i = 0; i < loadingJS[url].length; i++) {
							loadingJS[url][i]();
						}
						delete loadingJS[url];
					}
				};
				
				e.onreadystatechange = function() {
					if (e.readyState == "loaded" || e.readyState == "complete"){
						executeCallback();
					}
				};
				e.onload = executeCallback;
				
			}
		},
		
		getCookie : function(Name){
			var search = Name + "=";
			var returnvalue = "";
			if (document.cookie.length > 0) {
				offset = document.cookie.indexOf(search);
				// if cookie exists
				if (offset != -1) { 
					offset += search.length;
					// set index of beginning of value
					end = document.cookie.indexOf(";", offset);
					// set index of end of cookie value
					if (end == -1) end = document.cookie.length;
					returnvalue=unescape(document.cookie.substring(offset, end));
				}
			}
			return returnvalue;
		},
		
		setCookie : function(uAgent, mdVersion) {
			document.cookie="trackHTML5inGA=yes";
			console.log('we\'ve set the cookie, now load modernizr and begin tests');
			trackHTML5inGA.loadJS('js/modernizr.min.js', function() {
				trackHTML5inGA.testBrowser();
			});
			
		},
		
		checkCookie : function() {
			if(trackHTML5inGA.getCookie('trackHTML5inGA') != 'yes'){
				console.log('we dont\'t have a cookie, so let\'s set it');
				trackHTML5inGA.setCookie();
			} else {
				console.log('we already have the cookie, do nothing');
				return;
			}
		},
		testIfInArray : function(theString) {
			ourArray = trackHTML5inGA.featuresToTrack;
			if (ourArray.join("").indexOf(theString) >= 0){
				return true;
			} else {
				return false;
			}
		},
		testBrowser : function(){
			console.log('let\'s start our tests');
			if (!window.Modernizr) {
				console.log('Modernizr object not created.');
				return;
			};
			var supportedElements = [];
			for (var prop in Modernizr) {
				if (trackHTML5inGA.testIfInArray(prop)){
					if (typeof Modernizr[prop] === 'function') continue;
					if (prop == 'inputtypes' || prop == 'input') {
						for (var field in Modernizr[prop]) {
							if (Modernizr[prop][field]){
								supportedElements.push(prop + '-('+field+')');
							}
						}
					} else {
						if(Modernizr[prop]){
							if (prop != '_version' && prop != '_enableHTML5') { //Modernizr sneaks these in, so take them out of the reports
								supportedElements.push(prop);
							}
						}
					}
				}
			}
			_gaq.push(['_setCustomVar',5, 'HTML5', supportedElements.join("|"), 1]);
		}
	};
}();

(function() {
	try { //Let's check to make sure Google Analytics is initialized
		if (_gaq){
			console.log('we have GA, let\'s run our tests');
			console.log(featuresToTrack);
			//trackHTML5inGA.featuresToTrack = ['video','audio'];
			trackHTML5inGA.initialize();
		}
	} catch(e) {}
})();