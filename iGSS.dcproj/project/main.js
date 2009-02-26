/* 
 This file was generated by Dashcode.  
 You may edit this file to customize your widget or web page 
 according to the license.txt file included in the project.
 */

var listController = {
    // This object acts as a controller for the list UI.
    // It implements the dataSource methods for the list.
    
    numberOfRows: function() {
        // The List calls this dataSource method to find out how many rows should be in the list.
        return items.length;
    },
    
    prepareRow: function(rowElement, rowIndex, templateElements) {
        // The List calls this dataSource method for every row.  templateElements contains references to all elements inside the template that have an id. We use it to fill in the text of the rowTitle element.
        if (templateElements.rowTitle) {
            templateElements.rowTitle.innerText = items[rowIndex].name;
        }

        // We also assign an onclick handler that will cause the browser to go to the next page.
        var self = this;
        var handler = function() {
            var item = items[rowIndex];
            detailController.setPark(item);
            var browser = document.getElementById('browser').object;
            if (item.name == 'Files')
                fetchFiles();
            else if (item.name == 'Trash')
                fetchTrash();
            else if (item.name == 'Shared')
                fetchShared();
            else if (item.name == 'Others')
                fetchOthers();
            else if (item.name == 'Groups')
                fetchGroups();
            else
                browser.goForward(document.getElementById('detailLevel'), item.name);
        };
        rowElement.onclick = handler;
    }
};

var detailController = {
    // This object acts as a controller for the detail UI.
    
    setPark: function(park) {
        this._park = park;
        this._representedObject = park.name;
        
        // When the park is set, this controller also updates the DOM for the detail page appropriately.  As you customize the design for the detail page, you will want to extend this code to make sure that the correct information is populated into the detail UI.
        var detailTitle = document.getElementById('detailTitle');
        detailTitle.innerHTML = this._park.name;
        var detailLocation = document.getElementById('detailLocation');
        detailLocation.innerHTML = this._park.location;
        var detailDescription = document.getElementById('detailDescription');
        detailDescription.innerHTML = "The scenery in " + this._park.name + " is amazing this time of year!";
    }
    
};

// Called by HTML body element's onload event when the web application is ready to start.
function load()
{
    dashcode.setupParts();
    var userField = document.getElementById('username');
    userField.value = username;
    var tokenField = document.getElementById('token');
    tokenField.value = token;
    var loading = document.getElementById('activityIndicator').object;
    loading.stopAnimation();
}

var username = 'ebstest@grnet-hq.admin.grnet.gr';
var token = 'TbQupIk3xIuhNVF61DQiS2UidbCbcqAGcwNPK10tIMHkuh+XO72ovg==';
var GSS_URL = 'http://gss.grnet.gr/gss/rest';

// The container for the list items.
var items = [];

function sendRequest(handler, method, resource, modified, file, form, update) {
    var loading = document.getElementById('activityIndicator').object;
    loading.startAnimation();
	// Use strict RFC compliance
	b64pad = "=";
    
    resource = decodeURI(resource);
	var params = null;
	var now = (new Date()).toUTCString();
	var q = resource.indexOf('?');
	var res = q == -1? resource: resource.substring(0, q);
	var data = method + now + encodeURIComponent(decodeURIComponent(res));
	var sig = b64_hmac_sha1(atob(token), data);
	if (form)
		params = form;
	else if (update)
		params = update;

	var req = new XMLHttpRequest();
	req.open(method, GSS_URL + resource, true);
	req.onreadystatechange = function (event) {
		if (req.readyState == 4) {
            loading.stopAnimation();
            if(req.status == 200) {
                handler(req.responseText);
		    } else {
		    	alert("Error fetching data: HTTP status " + req.status+" ("+req.statusText+")");
		    }
		}
	}
	req.setRequestHeader("Authorization", username + " " + sig);
	req.setRequestHeader("X-GSS-Date", now);
	if (modified)
		req.setRequestHeader("If-Modified-Since", modified);

	if (file) {
		req.setRequestHeader("Content-Type", "text/plain");
		req.setRequestHeader("Content-Length", file.length);
	} else if (form) {
		req.setRequestHeader("Content-Length", params.length);
	    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
	} else if (update) {
		req.setRequestHeader("Content-Length", params.length);
	    req.setRequestHeader("Content-Type", "application/json;");
	}

	if (!file)
		req.send(params);
	else
		req.send(file);
}

// Fetches the 'user' namespace.
function fetchUser(event)
{
    sendRequest(parseUser, 'GET', '/'+username+'/');
}

// Parses the 'user' namespace response.
function parseUser(json) {
    var userobj = JSON.parse(json);
    items = [];
    items.push({name: 'Files', location: userobj['files']});
    items.push({name: 'Trash', location: userobj['trash']});
    items.push({name: 'Shared', location: userobj['shared']});
    items.push({name: 'Others', location: userobj['others']});
    items.push({name: 'Groups', location: userobj['groups']});
    var list = document.getElementById('list').object;
    list.reloadData();
    var name = document.getElementById('name');
    name.innerHTML = userobj['name'];
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('home'), 'Home');
}

// Fetches the 'files' namespace.
function fetchFiles(event)
{
    sendRequest(parseFiles, 'GET', '/'+username+'/files');
}

// Parses the 'files' namespace response.
function parseFiles(json) {
    var filesobj = JSON.parse(json);
    items = [];
    var folders = filesobj['folders'];
    while (folders.length > 0) {
        var folder = folders.pop();
        items.push({name: folder['name']+'/', location: folder['uri']});
    }
    var files = filesobj['files'];
    while (files.length > 0) {
        var file = files.pop();
        items.push({name: file['name'], location: file['uri']});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), 'Files');
}

// Fetches the 'trash' namespace.
function fetchTrash(event)
{
    sendRequest(parseFiles, 'GET', '/'+username+'/trash');
}

// Parses the 'trash' namespace response.
function parseTrash(json) {
    var filesobj = JSON.parse(json);
    items = [];
    var folders = filesobj['folders'];
    while (folders.length > 0) {
        var folder = folders.pop();
        items.push({name: folder['name'], location: folder['uri']});
    }
    var files = filesobj['files'];
    while (files.length > 0) {
        var file = files.pop();
        items.push({name: file['name'], location: file['uri']});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), 'Trash');
}

// Fetches the 'others' namespace.
function fetchOthers(event)
{
    sendRequest(parseOthers, 'GET', '/'+username+'/others');
}

// Parses the 'others' namespace response.
function parseOthers(json) {
    var users = JSON.parse(json);
    items = [];
    while (users.length > 0) {
        var user = users.pop();
        var username = user.substring(user.lastIndexOf('/')+1);
        items.push({name: username, location: user});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), 'Others');
}

// Parses the 'groups' namespace response.
function fetchGroups(event)
{
    sendRequest(parseGroups, 'GET', '/'+username+'/groups');
}

// Parses the 'groups' namespace response.
function parseGroups(json) {
    var groups = JSON.parse(json);
    items = [];
    while (groups.length > 0) {
        var group = groups.pop();
        var groupname = group.substring(group.lastIndexOf('/')+1);
        items.push({name: groupname, location: group});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), 'Groups');
}
