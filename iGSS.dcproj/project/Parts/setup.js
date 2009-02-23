/* 
 This file was generated by Dashcode and is covered by the 
 license.txt included in the project.  You may edit this file, 
 however it is recommended to first turn off the Dashcode 
 code generator otherwise the changes will be lost.
 */
var dashcodePartSpecs = {
    "activityIndicator": { "creationFunction": "CreateActivityIndicator" },
    "back_button": { "creationFunction": "CreatePushButton", "initialHeight": 30, "initialWidth": 50, "leftImageWidth": 16, "rightImageWidth": 5, "text": "Back" },
    "browser": { "creationFunction": "CreateBrowser" },
    "button": { "creationFunction": "CreatePushButton", "initialHeight": 30, "initialWidth": 80, "leftImageWidth": 5, "onclick": "fetchUser", "rightImageWidth": 5, "text": "Login" },
    "detailDescription": { "creationFunction": "CreateText", "text": "Description" },
    "detailLocation": { "creationFunction": "CreateText", "text": "Location" },
    "detailTitle": { "creationFunction": "CreateText", "text": "Title" },
    "header": { "creationFunction": "CreateHeader", "rootTitle": "Browser" },
    "list": { "creationFunction": "CreateList", "dataSourceName": "listController", "labelElementId": "rowTitle", "listStyle": "List.EDGE_TO_EDGE", "sampleRows": 5, "useDataSource": true },
    "rowTitle": { "creationFunction": "CreateText", "text": "Item" },
    "stackLayout": { "creationFunction": "CreateStackLayout", "subviewsTransitions": [{ "direction": "right-left", "duration": "", "timing": "ease-in-out", "type": "push" }, { "direction": "right-left", "duration": "", "timing": "ease-in-out", "type": "push" }, { "direction": "right-left", "duration": "", "timing": "ease-in-out", "type": "push" }] },
    "tokenLabel": { "creationFunction": "CreateText", "text": "Token" },
    "usernameLabel": { "creationFunction": "CreateText", "text": "Username" }
};
