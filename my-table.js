define(["jquery", "qlik", "./initialProperties", "./definition", "./paint", "./support", "./resize", "text!./my-table.css"], function($, qlik, myProps, myDefinition, myPaint, mySupport, myResize, cssText) {

    'use strict';
    $("<style>").html(cssText).appendTo("head");

    return {
        initialProperties: myProps,
        definition: myDefinition,
        paint: myPaint,
        support: mySupport,
        resize: myResize
    };
});