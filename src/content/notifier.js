function playSound(soundURL)
{   
    if (pref.getBoolPref("tiddlysnip.enablenotifsounds"))
        {
        gSound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
        var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var url = ioService.newURI(soundURL, null, null);
        gSound.play(url);
        }
}

function successSound()
{
    playSound("chrome://tiddlysnip/content/audio/success.wav");
}

function errorSound()
{
    playSound("chrome://tiddlysnip/content/audio/error.wav");
}

function hideTiddlyPopup()
{
    var tooltip = document.getElementById("tiddlysnip-popup");
    tooltip.hidePopup();
}

function notifier (title,text,audio)
{
    if (!pref.getBoolPref("tiddlysnip.enablenotifications"))
        return false;
    if ("nsIAlertsService" in Components.interfaces)
        {
        var alertService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
        alertService.showAlertNotification(null, title, text, false, "cookie", null);
        }
    else
        {
        var tooltip = document.getElementById("tiddlysnip-popup");
       	while(tooltip.hasChildNodes())
		    tooltip.removeChild(tooltip.firstChild);
  		var theGrid = document.createElement("grid");
  		theGrid.setAttribute("flex", "1");
  		tooltip.appendChild(theGrid);

  		var columns = document.createElement("columns");
  		columns.appendChild(document.createElement("column"));
  		theGrid.appendChild(columns);

  		var rows = document.createElement("rows");
  		theGrid.appendChild(rows);

  		var label = document.createElement("label");
		label.setAttribute("value", title);
        label.setAttribute("style", "font-weight: bold; text-decoration: underline; color: blue;");
        rows.appendChild(label);

        var blankRow = document.createElement("row");
		var blankLabel = document.createElement("label");
		blankLabel.setAttribute("value", "");
		blankRow.appendChild(label);
		rows.appendChild(blankRow);

        var textRow = document.createElement("row");
		var textLabel = document.createElement("label");
		textLabel.setAttribute("value",text);
		textRow.appendChild(textLabel);
		rows.appendChild(textRow);

        tooltip.showPopup(document.getElementById("status-bar"), -1, -1, "tooltip", "topright","bottomright");
        window.setTimeout("hideTiddlyPopup()", 8000);
        }
    if (audio)
        successSound();
}