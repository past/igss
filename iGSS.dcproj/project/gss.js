/* -*- mode: JavaScript; c-basic-offset: 4; tab-width: 4; indent-tabs-mode: nil -*- */
/* ex: set tabstop=4 expandtab: */
/*
 * Copyright (c) 2009 Panagiotis Astithas
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var gss = {
    // The current user's username.
    username: '',
    // The current user's authentication token.
    token: '',
    // The root URL of the REST API.
    GSS_URL: 'http://pithos.grnet.gr/pithos/rest',
    // The user root namespace.
    root: {},
    // The files and folders in the current directory.
    items: [],

    // Creates a HMAC-SHA1 signature of method+time+resource, using the authentication token.
    sign: function (method, time, resource, auth_token) {
        var q = resource.indexOf('?');
        var res = q == -1? resource: resource.substring(0, q);
        var data = method + time + res;
        // Use strict RFC compliance
        b64pad = "=";
        return b64_hmac_sha1(atob(auth_token), data);
    },

    // A helper function for making API requests.
    sendRequest: function (handler, method, resource, modified, file, form, update) {
        var loading = document.getElementById('activityIndicator').object;
        loading.startAnimation();
        // If the resource is an absolute URI, remove the GSS_URL.
        if (resource.indexOf(gss.GSS_URL) == 0)
            resource = resource.slice(gss.GSS_URL.length, resource.length);
        var now = (new Date()).toUTCString();
        var sig = gss.sign(method, now, resource, gss.token);
        var params = null;
        if (form)
            params = form;
        else if (update)
            params = update;

        var req = new XMLHttpRequest();
        req.open(method, gss.GSS_URL + resource, true);
        req.onreadystatechange = function (event) {
            if (req.readyState == 4) {
                loading.stopAnimation();
                if(req.status == 200) {
                    handler(req);
                } else {
                    alert("Error fetching data: HTTP status " + req.status+" ("+req.statusText+")");
                }
            }
        };
        req.setRequestHeader("Authorization", gss.username + " " + sig);
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
    },

    // Fetches the 'user' namespace.
    fetchUser: function () {
        gss.sendRequest(gss.parseUser, 'GET', '/' + gss.username + '/');
    },

    // Parses the 'user' namespace response.
    parseUser: function (req) {
        gss.root = JSON.parse(req.responseText);
        gss.items = [];
        gss.items.push({name: 'Files', location: gss.root.fileroot});
        gss.items.push({name: 'Trash', location: gss.root.trash});
        gss.items.push({name: 'Shared', location: gss.root.shared});
        gss.items.push({name: 'Others', location: gss.root.others});
        gss.items.push({name: 'Groups', location: gss.root.groups});
        var list = document.getElementById('list').object;
        list.reloadData();
        var name = document.getElementById('name');
        name.innerHTML = gss.root.name;
    },

    // Fetches the 'files' namespace.
    fetchFiles: function (event) {
        gss.sendRequest(gss.parseFiles, 'GET', gss.root.fileroot);
    },

    // Parses the 'files' namespace response.
    parseFiles: function (req) {
        var filesobj = JSON.parse(req.responseText);
        gss.items = [];
        var folders = filesobj.folders;
        while (folders.length > 0) {
            var folder = folders.pop();
            gss.items.push({name: folder.name+'/', location: folder.uri});
        }
        var files = filesobj.files;
        while (files.length > 0) {
            var file = files.pop();
            gss.items.push({name: file.name, location: file.uri, owner: file.owner, data: file});
        }
        var list = document.getElementById('list').object;
        list.reloadData();
        var browser = document.getElementById('browser').object;
        browser.goForward(document.getElementById('listLevel'), 'Files');
    },

    // Fetches the 'trash' namespace.
    fetchTrash: function (event) {
        gss.sendRequest(gss.parseTrash, 'GET', gss.root.trash);
    },

    // Parses the 'trash' namespace response.
    parseTrash: function (req) {
        var filesobj = JSON.parse(req.responseText);
        gss.items = [];
        var folders = filesobj.folders;
        while (folders.length > 0) {
            var folder = folders.pop();
            gss.items.push({name: folder.name, location: folder.uri});
        }
        var files = filesobj.files;
        while (files.length > 0) {
            var file = files.pop();
            gss.items.push({name: file.name, location: file.uri, data: file});
        }
        var list = document.getElementById('list').object;
        list.reloadData();
        var browser = document.getElementById('browser').object;
        browser.goForward(document.getElementById('listLevel'), 'Trash');
    },

    // Fetches the 'others' namespace.
    fetchOthers: function (event) {
        gss.sendRequest(gss.parseOthers, 'GET', gss.root.others);
    },

    // Parses the 'others' namespace response.
    parseOthers: function (req) {
        var users = JSON.parse(req.responseText);
        gss.items = [];
        while (users.length > 0) {
            var user = users.pop();
            gss.items.push({name: user.username, location: user.uri, owner: user.username});
        }
        var list = document.getElementById('list').object;
        list.reloadData();
        var browser = document.getElementById('browser').object;
        browser.goForward(document.getElementById('listLevel'), 'Others');
    },

    // Parses the 'groups' namespace response.
    fetchGroups: function (event) {
        gss.sendRequest(gss.parseGroups, 'GET', gss.root.groups);
    },

    // Parses the 'groups' namespace response.
    parseGroups: function (req) {
        var groups = JSON.parse(req.responseText);
        gss.items = [];
        while (groups.length > 0) {
            var group = groups.pop();
            gss.items.push({name: group.name, location: group.uri, owner: username});
        }
        var list = document.getElementById('list').object;
        list.reloadData();
        var browser = document.getElementById('browser').object;
        browser.goForward(document.getElementById('listLevel'), 'Groups');
    },

    // Fetches the specified file.
    fetchFile: function (file) {
        gss.sendRequest(gss.parseFile, 'HEAD', file);
    },

    // Parses the response for a file request.
    parseFile: function (req) {
        var headers = gss.parseHeaders(req);
        var file = JSON.parse(headers['X-Gss-Metadata']);
        detailController.populate(file);
        var browser = document.getElementById('browser').object;
        browser.goForward(document.getElementById('detailLevel'), file.name);
    },

    // A helper function that parses the HTTP headers from the specified XHR and returns them in a map.
    parseHeaders: function (req) {
        var allHeaders = req.getAllResponseHeaders();
        var headers = {};
        var ls = /^\s*/;
        var ts = /\s*$/;
        alert('Headers: '+allHeaders);
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
    },

    // Fetches the specified folder.
    fetchFolder: function (folder) {
        gss.sendRequest(gss.parseFolder, 'GET', folder);
    },

    // Parses the response for a folder request.
    parseFolder: function (req) {
        var folder = JSON.parse(req.responseText);
        gss.items = [];
        var folders = folder.folders;
        while (folders.length > 0) {
            var f = folders.pop();
            gss.items.push({name: f.name+'/', location: f.uri});
        }
        var files = folder.files;
        while (files.length > 0) {
            var file = files.pop();
            gss.items.push({name: file.name, location: file.uri, owner: file.owner, data: file});
        }
        var list = document.getElementById('list').object;
        list.reloadData();
        var backHandler = function() {
            gss.fetchFolder(folder.parent);
        };
        var browser = document.getElementById('browser').object;
        browser.goForward(document.getElementById('listLevel'), folder.name, backHandler);
    }
    
};

