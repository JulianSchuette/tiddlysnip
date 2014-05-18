function populateCategoriesList()
{
	var prefString = pref.getCharPref("tiddlysnip.categories");
	if(prefString == "")
		return;

	var categories = prefString.split(".NEXT.");
	var categoriesList = document.getElementById("categoriesList");

	for (var i=0; i < categories.length; i++)
        {
		var pieces = categories[i].split(".ITEM.");

		var newItem = document.createElement("treeitem");
		var newRow = document.createElement("treerow");
		newItem.appendChild(newRow);

        var name = document.createElement("treecell");
		name.setAttribute("label", pieces[0]);
		newRow.appendChild(name);

        var tags = document.createElement("treecell");
		tags.setAttribute("label", pieces[1]);
		newRow.appendChild(tags);

		categoriesList.appendChild(newItem);
        }
}


function editCategory()
{
    editCategoryFlag = true;
    var categoriesTree = document.getElementById("categoriesTree");
    var selectedIndex = categoriesTree.currentIndex;

    if(selectedIndex == -1)
        return;

    var categoriesList = document.getElementById("categoriesList");
    var entry = categoriesList.childNodes[selectedIndex].childNodes[0].childNodes;

    document.getElementById("editCategoryName").value = entry[0].getAttribute("label");
    document.getElementById("editCategoryTags").value = entry[1].getAttribute("label");
    editCategoryIndex = selectedIndex;
}

function cancelEditCategory()
{
    document.getElementById("editCategoryName").value = '';
    document.getElementById("editCategoryTags").value = '';
    editCategoryIndex = -1;
}


function saveCategory()
{
    var name = document.getElementById("editCategoryName").value;
    var tags = document.getElementById("editCategoryTags").value;
    if (name == '')
        {
        editCategoryIndex = -1;
        return false;
        }
    var categoriesTree = document.getElementById("categoriesTree");
    var selectedIndex = categoriesTree.currentIndex;
    var categoriesList = document.getElementById("categoriesList");
    if(editCategoryIndex == -1) //new category
        {
        var newRow = document.createElement("treerow");
        var newItem = document.createElement("treeitem");
        newItem.appendChild(newRow);

        var theName = document.createElement("treecell");
        theName.setAttribute("label", name);
        newRow.appendChild(theName);

        var theTags = document.createElement("treecell");
        theTags.setAttribute("label", tags);
        newRow.appendChild(theTags);

        categoriesList.appendChild(newItem);
        }
    else
        {
        var entry = categoriesList.childNodes[editCategoryIndex].childNodes[0].childNodes;
        entry[0].setAttribute("label",name);
        entry[1].setAttribute("label",tags);
        }
    cancelEditCategory()
}


function saveCategoriesList()
{
	var categoriesList = document.getElementById("categoriesList").childNodes;
	var prefString = "";

	for (var i=0; i < categoriesList.length; i++)
        {
		var columns = categoriesList[i].childNodes[0].childNodes;
		var str = columns[0].getAttribute("label") + ".ITEM."+ columns[1].getAttribute("label") + ".ITEM.";
		if(prefString == "")
			prefString = str;
		else
			prefString += ".NEXT." + str;
        }
	/* return the new prefString to be stored by pref system */
	//return prefString;
    pref.setCharPref("tiddlysnip.categories",prefString);
}

function deleteCategory()
{
	var categoriesTree = document.getElementById("categoriesTree");
	var index = categoriesTree.currentIndex;

	if(index != -1)
        {
		var categoriesList = document.getElementById("categoriesList");
		var toRemove = categoriesList.childNodes.item(index);
		categoriesList.removeChild(toRemove);
	    }
}


function createCategoryPopups(mode)
{
    // Get the menupopup element that we will be working with
    var menu = document.getElementById("contextTiddly" + mode + "Popup");

    // Remove all of the items currently in the popup menu
    for(var i=menu.childNodes.length - 1; i >= 0; i--)
    {
        menu.removeChild(menu.childNodes.item(i));
    }

    //link to edit categories?
    if (noCategories())
        {
        var item = document.createElement("menuitem");
        item.setAttribute("label",getStr("noCategoriesLabel"));
        item.setAttribute("disabled",true);
        menu.appendChild(item);
        }
    else
        {
        var categories = getCategories();
        for(var n in categories)
            {
            // Create a new menu item to be added
            var tempItem = document.createElement("menuitem");

            // Set the new menu item's label
            tempItem.setAttribute("label",n);

            //Set the function to fire when clicked
            tempItem.setAttribute("oncommand", "tiddlySnip('"+mode+"','"+ categories[n]+"','"+n+"')");

            // Add the item to our menu
            menu.appendChild(tempItem);
            }
        }
}

function noCategories()
{
     var prefString = pref.getCharPref("tiddlysnip.categories");
     return (prefString == '');
}


function getCategories()
{
	var prefString = pref.getCharPref("tiddlysnip.categories");
	if(prefString == "")
        return;

    var categoriesArray = prefString.split(".NEXT.");
    var categories = {};
    for (var i=0; i<categoriesArray.length; i++)
        {
        var pieces = categoriesArray[i].split(".ITEM.");
        var name = pieces[0];
        var tags = pieces[1];
        categories[name] = tags;
        }
    return categories;
}