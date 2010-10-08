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
		
		loadedJS : {},
		
		loadJS : function(url,callback) {
			if (!trackHTML5inGA.loadedJS[url]){
				if (url in loadingJS) {
					loadingJS[url].push(callback);
					return;
				}
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
		
		checkCookie : function(){
			if (!window.Modernizr) {
				console.log('Modernizr object not created.');
				return;
			};
			mdVersion = Modernizr._version;
			var userAgent = navigator.userAgent.toLowerCase();//grab the broswer User Agent
			uAgent = userAgent.replace(/;/g, ''); //strip out the ';' so as not to bork the cookie
			var __html5 = trackHTML5inGA.getCookie('__html5'); //trackHTML5inGA.getCookie('__html5'); //Previous UNL HTML5 test
			if (!__html5) { //We haven't run this test before, so let's do it.
				console.log('We have not run this test yet, let us track this client!');
				trackHTML5inGA.setCookie(uAgent, mdVersion);
				return;
			}
			//Let's check to see if either the browser or modernizr has changed since the last tracking
			if ((uAgent +'|+|'+mdVersion) != (__html5)){
				console.log('We don\'t have a match, let us track this client!');
				trackHTML5inGA.setCookie(uAgent, mdVersion);
			} else { //we have a match and nothing has changed, so do nothing more.
				console.log('Already have this client tracked');
				return;
			}
		},
		
		setCookie : function(uAgent, mdVersion) {
			var value = uAgent +'|+|'+mdVersion; //combine browser User Agent and Modernizr version
			var date = new Date();
			date.setTime(date.getTime()+(31556926000));
			expires = ";expires="+date.toGMTString();
			console.log("__html5"+"="+value+" "+expires+" ;path=/");
			document.cookie = "__html5"+"="+value+" "+expires+" ;path=/";
			trackHTML5inGA.testBrowser();
		},
		
		getCookie : function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1,c.length);
				}
				if (c.indexOf(nameEQ) === 0) {
					return c.substring(nameEQ.length,c.length);
				}
			}
			return null;
		},
		
		testBrowser : function(){
			for (var prop in Modernizr) {
				if (typeof Modernizr[prop] === 'function') continue;
				if (prop == 'inputtypes' || prop == 'input') {
					for (var field in Modernizr[prop]) {
						if (Modernizr[prop][field]){
							_gaq.push(['_trackEvent', 'HTML5/CSS3 Support', prop + '-('+field+')', '']);
						}
					}
				} else {
					if(Modernizr[prop]){
						if (prop != '_version' && prop != '_enableHTML5') { //Modernizr sneaks these in, so take them out of the reports
							_gaq.push(['_trackEvent', 'HTML5/CSS3 Support', prop, '']);
						}
					}
				}
			}
		}
	};
}();

(function() {
	try { //Let's check to make sure Google Analytics is initialized
		if (_gaq){
			trackHTML5inGA.loadJS('js/modernizr.min.js', function() {
				trackHTML5inGA.checkCookie();
			});
		}
	} catch(e) {}
})();