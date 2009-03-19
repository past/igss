/* 
 This file was generated by Dashcode.  
 You may edit this file to customize your widget or web page 
 according to the license.txt file included in the project.
 */

// The current user's username.
var username;
// The current user's authentication token.
var token;
// The root URL of the REST API.
var GSS_URL = 'http://gss.grnet.gr/gss/rest';
// The user root namespace.
var root;
// The container for the list items.
var items = [];

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
            detailController.populate(item);
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
            else if (item.data)
                // File
                fetchFile(item.location);
            else
                // Folder
                fetchFolder(item.location);
        };
        rowElement.onclick = handler;
    }
};

var detailController = {
    // This object acts as a controller for the detail UI.
    
    populate: function(item) {
        this._item = item;
        
        // When the park is set, this controller also updates the DOM for the detail page appropriately.  As you customize the design for the detail page, you will want to extend this code to make sure that the correct information is populated into the detail UI.
        var detailTitle = document.getElementById('detailTitle');
        detailTitle.innerHTML = this._item.name;
        var detailOwner = document.getElementById('detailOwner');
        detailOwner.innerHTML = this._item.owner;
        var detailDescription = document.getElementById('detailDescription');
        
        var resource = this._item.folder + this._item.name;
        // If the resource is an absolute URI, remove the GSS_URL.
        if (resource.indexOf(GSS_URL) == 0)
            resource = resource.slice(GSS_URL.length, resource.length);
        resource = decodeURI(resource);
        var now = (new Date()).toUTCString();
        var sig = sign('GET', now, resource, token);
        var authparam = encodeURI("Authorization=" + this._item.owner + " " + sig);
        var dateparam = encodeURI("Date=" + now);
        var param = "?" + authparam + "&" + dateparam;
        detailDescription.innerHTML = "<a href='" + this._item.folder + this._item.name + param + "'>Download</a>";
    }
    
};

// Called by HTML body element's onload event when the web application is ready to start.
function load() {
    if (!username || ! token) {
        var allcookies = document.cookie;
        var pos = allcookies.indexOf("_gss_a=");
        if (pos != -1) {
            var start = pos + 7;
            var end = allcookies.indexOf(";", start);
            if (end == -1)
                end = allcookies.length;
            var gsscookie = allcookies.substring(start, end);
            gsscookie = decodeURIComponent(gsscookie);
            var values = gsscookie.split('|');
            username = values[0];
            token = values[1];
            // Delete the cookie value.
            document.cookie = "_gss_a=;max-age=-1;domain=gss.grnet.gr;path=/i/";
        } else {
            location = "https://gss.grnet.gr/gss/login?next=http://gss.grnet.gr/i/";
        }
    }
    dashcode.setupParts();
    fetchUser();
    var loading = document.getElementById('activityIndicator').object;
    loading.stopAnimation();
}

// Creates a HMAC-SHA1 signature of method+time+resource, using the token.
function sign(method, time, resource, token) {
	var q = resource.indexOf('?');
	var res = q == -1? resource: resource.substring(0, q);
	var data = method + time + encodeURIComponent(decodeURIComponent(res));
	// Use strict RFC compliance
	b64pad = "=";
	return b64_hmac_sha1(atob(token), data);
}

// A helper function for making API requests.
function sendRequest(handler, method, resource, modified, file, form, update) {
    var loading = document.getElementById('activityIndicator').object;
    loading.startAnimation();
    // If the resource is an absolute URI, remove the GSS_URL.
    if (resource.indexOf(GSS_URL) == 0)
        resource = resource.slice(GSS_URL.length, resource.length);
    resource = decodeURI(resource);
	var now = (new Date()).toUTCString();
    var sig = sign(method, now, resource, token);
	var params = null;
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
                handler(req);
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
function fetchUser()
{
    sendRequest(parseUser, 'GET', '/'+username+'/');
}

// Parses the 'user' namespace response.
function parseUser(req) {
    root = JSON.parse(req.responseText);
    items = [];
    items.push({name: 'Files', location: root['files']});
    items.push({name: 'Trash', location: root['trash']});
    items.push({name: 'Shared', location: root['shared']});
    items.push({name: 'Others', location: root['others']});
    items.push({name: 'Groups', location: root['groups']});
    var list = document.getElementById('list').object;
    list.reloadData();
    var name = document.getElementById('name');
    name.innerHTML = root['name'];
}

// Fetches the 'files' namespace.
function fetchFiles(event)
{
    sendRequest(parseFiles, 'GET', root['files']);
}

// Parses the 'files' namespace response.
function parseFiles(req) {
    var filesobj = JSON.parse(req.responseText);
    items = [];
    var folders = filesobj['folders'];
    while (folders.length > 0) {
        var folder = folders.pop();
        items.push({name: folder['name']+'/', location: folder['uri']});
    }
    var files = filesobj['files'];
    while (files.length > 0) {
        var file = files.pop();
        items.push({name: file['name'], location: file['uri'], owner: file['owner'], data: file});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), 'Files');
}

// Fetches the 'trash' namespace.
function fetchTrash(event)
{
    sendRequest(parseFiles, 'GET', root['trash']);
}

// Parses the 'trash' namespace response.
function parseTrash(req) {
    var filesobj = JSON.parse(req.responseText);
    items = [];
    var folders = filesobj['folders'];
    while (folders.length > 0) {
        var folder = folders.pop();
        items.push({name: folder['name'], location: folder['uri']});
    }
    var files = filesobj['files'];
    while (files.length > 0) {
        var file = files.pop();
        items.push({name: file['name'], location: file['uri'], data: file});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), 'Trash');
}

// Fetches the 'others' namespace.
function fetchOthers(event)
{
    sendRequest(parseOthers, 'GET', root['others']);
}

// Parses the 'others' namespace response.
function parseOthers(req) {
    var users = JSON.parse(req.responseText);
    items = [];
    while (users.length > 0) {
        var user = users.pop();
        items.push({name: user['username'], location: user['uri'], owner: user['username']});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), 'Others');
}

// Parses the 'groups' namespace response.
function fetchGroups(event)
{
    sendRequest(parseGroups, 'GET', root['groups']);
}

// Parses the 'groups' namespace response.
function parseGroups(req) {
    var groups = JSON.parse(req.responseText);
    items = [];
    while (groups.length > 0) {
        var group = groups.pop();
        items.push({name: group['name'], location: group['uri'], owner: username});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), 'Groups');
}

// Fetches the specified file.
function fetchFile(file)
{
    sendRequest(parseFile, 'HEAD', file);
}

// Parses the response for a file request.
function parseFile(req) {
    var headers = parseHeaders(req);
    var file = JSON.parse(headers['X-Gss-Metadata']);
    detailController.populate(file);
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('detailLevel'), file.name);
}

// A helper function that parses the HTTP headers from the specified XHR and returns them in a map.
function parseHeaders(req) {
    var allHeaders = req.getAllResponseHeaders();
    var headers = {};
    var ls = /^\s*/;
    var ts = /\s*$/;
    
    var lines = allHeaders.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.length == 0) continue;
        var pos = line.indexOf(':');
        var name = line.substring(0, pos).replace(ls, "").replace(ts, "");
        var value = line.substring(pos + 1).replace(ls, "").replace(ts, "");
        headers[name] = value;
    }
    return headers;
}

// A function that moves the browser to a new list view.
/*function moveToView() {
    var stack = document.getElementById('stackLayout').object;
    var div = document.getElementById('listLevel');
    stack.addView(div, stack._viewsTransition[0]);
    browser.goForward(div, name, function() {setTimeout(function() {stack.removeView(div);}, 750);});
}*/

// Fetches the specified folder.
function fetchFolder(folder)
{
    sendRequest(parseFolder, 'GET', folder);
}

// Parses the response for a folder request.
function parseFolder(req) {
    var folder = JSON.parse(req.responseText);
    items = [];
    var folders = folder['folders'];
    while (folders.length > 0) {
        var f = folders.pop();
        items.push({name: f['name']+'/', location: f['uri']});
    }
    var files = folder['files'];
    while (files.length > 0) {
        var file = files.pop();
        items.push({name: file['name'], location: file['uri'], owner: file['owner'], data: file});
    }
    var list = document.getElementById('list').object;
    list.reloadData();
    var backHandler = function() {
        fetchFolder(folder['parent']);
    };
    var browser = document.getElementById('browser').object;
    browser.goForward(document.getElementById('listLevel'), folder.name, backHandler);
}
