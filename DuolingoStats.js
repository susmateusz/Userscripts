// ==UserScript==
// @name         DuolingoStats
// @namespace    http://duolingo.com/
// @version      0.1
// @description  Some statistics about Duolingo.
// @author       Mateusz Sus
// @match        https://www.duolingo.com/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

(function() {
    'use strict';

    if(window.location.href.endsWith("duolingo.com/")) {
        waitForKeyElements("._2GJb6", mainPageFunction);
    }
    function mainPageFunction(jNode) {
        var skillsHeader = document.getElementsByClassName("_2Wt53")[0];
        if(skillsHeader.childElementCount == 2) {
            var leftSkillsCounter = document.createElement('div');
            leftSkillsCounter.textContent = leftSkillsText();
            skillsHeader.appendChild(leftSkillsCounter);
            var leftLessonsCounter = document.createElement('div');
            leftLessonsCounter.textContent = leftLessonsText();
            skillsHeader.appendChild(leftLessonsCounter);
        }
    }
    function leftSkillsText() {
        return "Unfinished skills: " + document.getElementsByClassName("_2TMjc").length;
    }
    function leftLessonsText() {
        return "Lessons left: " + leftLessonsCount();
    }
    function leftLessonsCount() {
        var result = 0;
        var unfinishedLessons = document.getElementsByClassName("_2TMjc");
        for(var i = 0; i < unfinishedLessons.length; i++) {
            var parts = unfinishedLessons[i].textContent.split("/");
            var done = parseInt(parts[0]);
            var all = parseInt(parts[1]);
            result += all - done;
        }
        return result;
    }
    //words
    if(window.location.href.indexOf("words") > 0) {
        waitForKeyElements(".word-cell", wordsFunction);
    }
    function wordsFunction(jNode) {
        waitForKeyElements(".page-sidebar", createStatisticPane);
    }

    function createStatisticPane(jNode) {
        var sidebarLeft = document.getElementsByClassName("page-sidebar")[0];
        var innerDiv = sidebarLeft.getElementsByClassName("inner")[0];
        if(innerDiv.childElementCount == 1) {
            var boxDiv = document.createElement('div');
            boxDiv.setAttribute("class", "box-colored bg-white spaced-rep");
            boxDiv.setAttribute("style", "white-space: pre;");
            boxDiv.textContent  = getStatisticsText();
            innerDiv.appendChild(boxDiv);
        }
    }
    function getStatisticsText() {
        var len = document.getElementsByClassName("word-cell").length;
        var average_health = avgHealth();
        var stars4 = countStars(4);
        var stars3 = countStars(3);
        var stars2 = countStars(2);
        var stars1 = countStars(1);
        var result = "Opanowano s≥Ûw: " +len;
        result += "\r\nårednia si≥a s≥owa: "+ average_health;
        result += "\r\n****\t: "+ stars4 + "%";
        result += "\r\n***\t\t: "+ stars3 + "%";
        result += "\r\n**\t\t: "+ stars2 + "%";
        result += "\r\n*\t\t: "+ stars1 + "%";
        return result;
    }
    function avgHealth() {
        var words = document.getElementsByClassName("word-cell");
        var total = 0.0;
        var count = 0;
        for(var i = 0; i < words.length; i++) {
            var tds = words[i].getElementsByTagName("td");
            var val = parseFloat(tds[tds.length-1].getElementsByClassName("hidden")[0].textContent);
            if(!isNaN(val)) {
                total += val;
                count += 1;
            }
        }
        return Math.round(1000 * total/count) / 1000;
    }
    function countStars(level) {
        var total = document.getElementsByClassName("word-strength-icon").length;
        var indicators = document.getElementsByClassName("strength-" + level);
        return Math.round(100 * indicators.length * 100 / total) / 100;
    }
})();