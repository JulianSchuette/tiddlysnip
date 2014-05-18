var tsWM = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
var tsWIN = tsWM.getMostRecentWindow('navigator:browser');


function ts_addTab(url) {
	var browser = tsWIN.getBrowser();
	browser.selectedTab = browser.addTab(url);
	return browser.selectedTab;
}