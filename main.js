// Version changes:
// 1.5.4 - The DOM was being queried too early for the iframes on occasion, so added a delay.
// 1.5.5 - added greying out for source segments; removed 'notranslate' class for now.


(function() {
    window.onload = function() {
        
        "use strict";

        let classObj = {
            // The below keys will be the Id's for any created buttons
            "ice100Button": "goog-gtc-from-tm-score-100-ice",
            "tm100Button": "goog-gtc-from-tm-score-100",
            "fuzzyButton": "goog-gtc-from-tm-score-90",
            "fuzzyButton2": "goog-gtc-from-tm-score-99",
            "fuzzyButton3": "goog-gtc-from-tm-score-100-fuzzy",
            "mtButton": "goog-gtc-from-mt",
            "transButton": "goog-gtc-from-human",
            "missingPHButton": "goog-gtc-ph-missing",
            "sourceButton": "goog-gtc-from-source",
            //"notranslateButton": "notranslate"
        };

        setTimeout(function() {
            main();
        }, 2000);

        function main() { // Build button row
            let query = document.querySelector.bind(document);
            let targetDoc = query("#transarea").getElementsByTagName("iframe")[1].contentDocument;
            let sourceDoc = query("#transarea").getElementsByTagName("iframe")[0].contentDocument;
            let color = {};

            for (let key of Object.keys(classObj)) {
                let className = targetDoc.getElementsByClassName(classObj[key])[0];
                color[key] = className ? className.style.color : null;
            }

            // Note: Segments with classname "goog-gtc-from-source" do not have a color attribute,
            // and the color cannot be changed, so setting a color manually:
            if (targetDoc.getElementsByClassName('goog-gtc-from-source').length > 0) {
                color['sourceButton'] = targetDoc.getElementsByClassName(classObj['sourceButton']) ? "#000000" : null;
            }

            let addButtons = (function() {
                let buttons = {};
                let button = document.createElement("div");
                button.role = "button";
                button.className = "goog-inline-block jfk-button jfk-button-standard jfk-button-narrow jfk-button-collapse-left jfk-button-collapse-right jfk-button-clear-outline";
                let existingToolbar = query("#wbmenu").firstChild;

                return function(classObj, color) {
                    for (let key of Object.keys(classObj)) {
                        if (color[key] !== null) {
                            buttons[key] = button.cloneNode(true);
                            buttons[key].title = classObj[key];
                            buttons[key].id = key;
                            buttons[key].style.verticalAlign = 'middle';
                            buttons[key].style.background = color[key];
                            buttons[key].style.borderWidth = "medium";
                             buttons[key].style.marginBottom = "5px";
                            existingToolbar.insertBefore(buttons[key], existingToolbar.lastChild);
                            query(`#${key}`).addEventListener('click', toggle(key, classObj[key]))
                        }
                    }
                }
            })();

            addButtons(classObj, color);

            function toggle(key, className) {
                let toggle = {};
                let button = query(`#${key}`);
                toggle[className] = false;
                return function() {
                    if (!toggle[className]) {
                        _toggleClass(className, "none");
                        toggle[className] = true;
                        button.style.borderColor = "red";
                    } else {
                        _toggleClass(className, "");
                        toggle[className] = false;
                        button.style.borderColor = "";
                    }
                };

                function _toggleClass(className, displayValue) {
                    let arr = targetDoc.getElementsByClassName(className);
                    for (let i = 0, len = arr.length; i < len; i++) {
                        arr[i].classList.add("hidden-" + className + "-element");
                        _changeDisplayValue(arr[i], displayValue, className);
                        var tmpId = arr[i].parentNode.id;
                        if(!sourceDoc.getElementById(tmpId).firstChild.style.color){
                        	sourceDoc.getElementById(tmpId).firstChild.style.color = "grey"
                        } else { sourceDoc.getElementById(tmpId).firstChild.style.color = "" }
                        _toggleTrailingBRs(arr[i], displayValue, className);
                    }

                    function _changeDisplayValue(node, displayValue, className) {
                        let pp = node.parentNode.parentNode;
                        let flag = false;
                        // The following logic checks to see if any existing parent-parent 'LI' node can be hidden safely
                        // without accidentally hiding any different-colored tags that are children of the same 'LI'.
						if (!(pp.tagName === 'LI')) {
                            node.parentNode.style.display = displayValue;
                        } else {
                            if (pp.childNodes.length > 1) {
                                for (let i = 0, len = pp.childNodes.length; i < len; i++) {
                                    if (pp.childNodes[i].tagName === 'SPAN' && pp.childNodes[i].classList.contains('goog-gtc-unit')) {
                                        if (!pp.childNodes[i].firstChild.classList.contains(className)) {
                                            flag = true;
                                            node.parentNode.style.display = displayValue;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (flag === true) {
                                //  console.log("The parent LI of " + node.parentNode.id + " contains a mixture of segments,
                                //  so hiding its parent-parent LI tag would hide other classes as well.");
                            } else if (flag === false) {
                                pp.style.display = displayValue;
                                console.log(pp);
                            } else {
                                console.log("the flag variable's value is invalid: " + flag);
                            }
                        }
                    }

                    function _toggleTrailingBRs(node, displayValue) {
                        let p = node.parentNode;
                        // Was getting a TypeError for some documents due to non-existing nodes/attribute,
                        // but by checking truthiness first the problem is avoided.
                        if (p && p.nextSibling && p.nextSibling.tagName === 'BR') {
                            p.nextSibling.style.display = displayValue;
                        } else {
                            return;
                        }
                        let pos = p.nextSibling;
                        try {
                            while (pos.nextSibling.tagName === 'BR') {
                                pos.nextSibling.style.display = displayValue;
                                pos = pos.nextSibling;
                            }
                        } catch (err) {
                            console.log(err.message);
                        }
                    }
                }
            }
        }
    }
})();