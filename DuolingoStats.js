// ==UserScript==
// @name         DuolingoStats
// @namespace    http://duolingo.com/
// @version      1
// @updateURL    https://raw.githubusercontent.com/susmateusz/Userscripts/master/DuolingoStats.js
// @description  Some statistics about Duolingo.
// @author       Mateusz Sus
// @match        https://www.duolingo.com/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var duolingoApi = {
    mainPageUrl : "duolingo.com/",
    treeHeaderClass : "_2Wt53",
    skillsRowClass : "._2GJb6",
    skillLinkClass : "W1dac",
    partiallyFinishedSpanClass : "_2TMjc",
    linkColorAttributeName : "data-test",
    skillColorGold : "gold"
};

var placeholders = {
    toggleFinishedVisibility : "Toggle finished visiblity",
    unfinishedSkills : "Unfinished skills: ",
    revisionRequired : "Revisions required: ",
    lessonsLeft : "Lessons left: ",
    masteredWords : "Opanowano s³ów: ",
    avgWordStrength : "Œrednia si³a s³owa: "
};



(function() {
    'use strict';

    if(window.location.href.endsWith(duolingoApi.mainPageUrl)) {
        waitForKeyElements(duolingoApi.skillsRowClass, mainPageFunction);
    }

    function mainPageFunction(jNode) {
        var skillsHeader = document.getElementsByClassName(duolingoApi.treeHeaderClass)[0];
        if(skillsHeader.childElementCount == 2) {
            // Unfinished skills
            var leftSkillsCounter = document.createElement('div');
            leftSkillsCounter.textContent = leftSkillsText();
            skillsHeader.appendChild(leftSkillsCounter);
            // Partialy finished skills
            var partialyFinishedSkillsCounter = document.createElement('div');
            partialyFinishedSkillsCounter.textContent = partiallySkillsText();
            skillsHeader.appendChild(partialyFinishedSkillsCounter);
            // Lessons left
            var leftLessonsCounter = document.createElement('div');
            leftLessonsCounter.textContent = leftLessonsText();
            skillsHeader.appendChild(leftLessonsCounter);
            // Toggle finished visiblity
            var hideFinishedButton = document.createElement("input");
            hideFinishedButton.type = "button";
            hideFinishedButton.onclick = toggleFinishedVisibility;
            hideFinishedButton.value = placeholders.toggleFinishedVisibility;
            skillsHeader.appendChild(hideFinishedButton);
            waitForKeyElements(duolingoApi.skillLinkClass, toggleFinishedVisibility);
        }
    }
    function toggleFinishedVisibility() {
        var skills = document.getElementsByClassName(duolingoApi.skillLinkClass);
        for(var i = 0; i < skills.length; i++) {
            if(skills[i].getAttribute(duolingoApi.linkColorAttributeName) && skills[i].getAttribute(duolingoApi.linkColorAttributeName).startsWith(duolingoApi.skillColorGold)) {
                if(skills[i].style.display === 'none') {
                    skills[i].style.display = 'inline-block';
                } else {
                    skills[i].style.display = 'none';
                }
            }
        }
    }
    function leftSkillsText() {
        return placeholders.unfinishedSkills + document.getElementsByClassName(duolingoApi.partiallyFinishedSpanClass).length;
    }
    function partiallySkillsText() {
        return placeholders.revisionRequired + partiallyFinished();
    }
    function leftLessonsText() {
        return placeholders.lessonsLeft + leftLessonsCount();
    }
    function partiallyFinished() {
        var skills = document.getElementsByClassName(duolingoApi.skillLinkClass);
        var finishedLessons = 0;
        for(var i = 0; i < skills.length; i++) {
            if(skills[i].getAttribute(duolingoApi.linkColorAttributeName) && skills[i].getAttribute(duolingoApi.linkColorAttributeName).startsWith(duolingoApi.skillColorGold)) {
                finishedLessons += 1;
            }
        }
        return skills.length - finishedLessons;
    }
    function leftLessonsCount() {
        var result = 0;
        var unfinishedLessons = document.getElementsByClassName(duolingoApi.partiallyFinishedSpanClass);
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
        var result = placeholders.masteredWords + len;
        result += "\r\n" + placeholders.avgWordStrength + average_health;
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