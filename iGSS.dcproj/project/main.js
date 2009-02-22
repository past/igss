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
        return parks.length;
    },
    
    prepareRow: function(rowElement, rowIndex, templateElements) {
        // The List calls this dataSource method for every row.  templateElements contains references to all elements inside the template that have an id. We use it to fill in the text of the rowTitle element.
        if (templateElements.rowTitle) {
            templateElements.rowTitle.innerText = parks[rowIndex].name;
        }

        // We also assign an onclick handler that will cause the browser to go to the detail page.
        var self = this;
        var handler = function() {
            var park = parks[rowIndex];
            detailController.setPark(park);
            var browser = document.getElementById('browser').object;
            // The Browser's goForward method is used to make the browser push down to a new level.  Going back to previous levels is handled automatically.
            browser.goForward(document.getElementById('detailLevel'), park.name);
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

//
// Function: load()
// Called by HTML body element's onload event when the web application is ready to start
//
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

var username = 'ebstest@grnet-hq.gss.grnet.gr';
var token = 'VH5goDiAoRgfs2gStFSbYYde3by9cfstSDXTL5tpOyQfs8dp3fPZEw';
var GSS_URL = 'http://gss.grnet.gr/gss/rest/';

// Sample data.  Some applications may have static data like this, but most will want to use information fetched remotely via XMLHttpRequest.
var parks = [
    { name: "Acadia", location: "Maine, USA" }, 
    { name: "Bryce Canyon", location: "Utah, USA" }, 
    { name: "Carlsbad Caverns ", location: "New Mexico, USA" }, 
    { name: "Cuyahoga Valley", location: "Ohio, USA" }, 
    { name: "Death Valley", location: "California, USA" }, 
    { name: "Denali Preserve", location: "Alaska, USA" }, 
    { name: "Grand Canyon", location: "Arizona, USA" }, 
    { name: "Haleakala", location: "Hawaii, USA" }, 
    { name: "Joshua Tree", location: "California, USA" }, 
    { name: "Kings Canyon", location: "California, USA" }, 
    { name: "Mesa Verde", location: "Colorado, USA" },
    { name: "Shenandoah", location: "Virginia, USA" },
    { name: "Yellowstone", location: "Wyoming, USA" },
    { name: "Yosemite", location: "California, USA" }
];

function sendRequest(method, resource, modified, file, form, update) {
    var loading = document.getElementById('activityIndicator').object;
    loading.startAnimation();
	// Use strict RFC compliance
	b64pad = "=";

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
	req.open(method, GSS_URL+resource, true);
	req.onreadystatechange = function (event) {
		if (req.readyState == 4) {
            loading.stopAnimation();
			if(req.status == 200) {
				var result = document.getElementById("result");
				result.innerHTML = "<pre>"+req.getAllResponseHeaders()+"\n"+req.responseText+"</pre>";
		    } else {
		    	var result = document.getElementById("result");
				result.innerHTML = "<span style='color: red'>"+req.status+": "+req.statusText+"</span>"+"<pre>"+req.getAllResponseHeaders()+"</pre>";
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

function fetchUser(event)
{
    var browser = document.getElementById('browser').object;
    sendRequest('GET', username);
    //browser.goForward(document.getElementById('listLevel'), 'List');
}
