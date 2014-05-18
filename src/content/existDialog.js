/*
 * existDialog
 *    triggered when a user in non-expert mode attempts to store a tiddler with a title
 * which is already in use. Allows user to rename (go back and change), append (add text
 * to existing tiddler) or overwrite (replace existing tiddler).
 */

const TITLE_RENAME    = null;
const TITLE_OVERWRITE = "overwrite";
const TITLE_APPEND    = "append";

var params;

//var mts = isMts();


// Grab parameters from the window.
function initExistDialog()
{
    params = window.arguments[0];
    document.getElementById('tiddlerTitle').value = params.title;
    //alert("1");
    //alert(params.mts);
    if (params.mts)
        document.getElementById("appendButton").disabled = true;
}

function choose(action)
{
    params.writeMode = action;
    window.close();
}
