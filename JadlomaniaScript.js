// ==UserScript==
// @name         Jadlomania
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Autologin i filtrowanie anglojezycznych dan.
// @author       MSus
// @match        http://zamowienia.jadlomania.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

var login = "WRONG_LOGIN";
var password = "WRONG_PASSWORD";
var nick = "WRONG_NICK";

this.$ = this.jQuery = jQuery.noConflict(true);

(function() {
    'use strict';
    if(document.getElementById('flogin')) {
        document.getElementById('flogin').value = login;
        document.getElementById('fpass').value = password;
        document.getElementById('unickname').value = nick;
        waitForKeyElements("#yui-gen1-button", triggerButton);
    } else {
        document.getElementsByClassName("today")[0].click();
        waitForKeyElements(".itemgroup", parseDishes);
    }
})();

function triggerButton(jNode) {
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent("click", true, true);
    jNode[0].dispatchEvent(clickEvent);
}

function parseDishes() {
    var dishesMap = [];
    var dishes = document.getElementsByClassName("row");
    for(var i = 0; i < dishes.length; i++) {
        if(dishes[i].getElementsByClassName("hrf").length > 0) {
            var dishValue = dishes[i];
            var dishKey = dishes[i].getElementsByClassName("hrf")[0].getAttribute("onclick").substring(17,21);
            dishesMap.push({key: parseInt(dishKey), value: dishValue});
        }
    }
    dishesMap.sort(function(a,b) {return a.key - b.key;});
    var menuParentNode = dishesMap[0].value.parentNode;
    var oldMenu = menuParentNode.getElementsByClassName("row");
    for(i = oldMenu.length - 1; i >= 0; i--) {
        oldMenu[i].remove();
    }
    console.log(dishesMap);
    for(i = 0; i < dishesMap.length / 2; i ++) {
        menuParentNode.appendChild(dishesMap[i].value);
    }
}
