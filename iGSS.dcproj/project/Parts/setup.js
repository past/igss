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
    "button1": { "creationFunction": "CreatePushButton", "initialHeight": 30, "initialWidth": 80, "leftImageWidth": 5, "onclick": "gss.fetchFiles", "rightImageWidth": 5, "text": "Files" },
    "button2": { "creationFunction": "CreatePushButton", "initialHeight": 30, "initialWidth": 80, "leftImageWidth": 5, "onclick": "gss.fetchTrash", "rightImageWidth": 5, "text": "Trash" },
    "button3": { "creationFunction": "CreatePushButton", "initialHeight": 30, "initialWidth": 80, "leftImageWidth": 5, "onclick": "gss.fetchOthers", "rightImageWidth": 5, "text": "Others" },
    "button4": { "creationFunction": "CreatePushButton", "initialHeight": 30, "initialWidth": 80, "leftImageWidth": 5, "onclick": "gss.fetchGroups", "rightImageWidth": 5, "text": "Groups" },
    "detailDescription": { "creationFunction": "CreateText", "text": "Description" },
    "detailOwner": { "creationFunction": "CreateText", "text": "Owner" },
    "detailTitle": { "creationFunction": "CreateText", "text": "Title" },
    "header": { "creationFunction": "CreateHeader", "rootTitle": "GSS" },
    "list": { "creationFunction": "CreateList", "dataSourceName": "listController", "labelElementId": "rowTitle", "listStyle": "List.EDGE_TO_EDGE", "sampleRows": 5, "useDataSource": true },
    "name": { "creationFunction": "CreateText", "text": "name" },
    "rowTitle": { "creationFunction": "CreateText", "text": "Item" },
    "stackLayout": { "creationFunction": "CreateStackLayout", "subviewsTransitions": [{ "direction": "right-left", "duration": "", "timing": "ease-in-out", "type": "push" }, { "direction": "right-left", "duration": "", "timing": "ease-in-out", "type": "push" }, { "direction": "right-left", "duration": "", "timing": "ease-in-out", "type": "push" }] }
};
