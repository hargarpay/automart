"use strict";
/**
 * Global Variables
 */

 let requestFrameRefrence;
 let currentPointer = 1;
 let nextSliderPosition = 0;
 let numberOfSlider = 0;
 let timeOut = null;
 let manageGroupOptions = {};



/**
 * 
 * @param {Element} item 
 * @param {event} evt 
 * @param {function} fnc 
 */

function listener(item, evt, fnc){
    if(!item) return false;
    const events = evt.split(", ");
    // EventListener
    if (item.addEventListener) {
            events.forEach(function(event){
                item.addEventListener(event.trim(), fnc, false);
            });
            return true;
    }
    // AttachEvent
    else if (item.attachEvent) {
            events.forEach(function(event){
                item.attachEvent("on"+event.trim(), fnc);
            });
            return true;

    }
    // Browser don't support addEventListener and AttachEvent, go on with traditional
    else {
        events.forEach(function(event){
            if(typeof item[event] === 'function'){
                    // itemect already has a function on traditional
                    // Let's wrap it with our own function inside another function
                    fnc = (function(f1,f2){
                            return function(){
                                    f1.apply(this,arguments);
                                    f2.apply(this,arguments);
                            }
                    })(item[event], fnc);
            }
            item[event] = fnc;
        })
    }
}

function outerWidth(el) {
    var width = el.offsetWidth;
    var style = getComputedStyle(el);
  
    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
}

function outerHeight(el){
    var height = el.offsetHeight;
    var style = getComputedStyle(el);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

function prepend(parentEl, newEl){
    parentEl.insertBefore(newEl, parentEl.childNodes[0]);
}

function displayMessage(message, type){
    const alertBox = document.querySelector(".alert");
    if(alertBox){
        alertBox.querySelector(".alert-message").textContent = message;
        alertBox.classList.remove("alert-success", "alert-danger", "alert-default", "alert-info");
        alertBox.classList.add(type, "active");

        clearTimeout(timeOut);
        timeOut = setTimeout(function(){
            alertBox.classList.remove("active");
        }, 5000);
    }
}

function createElement(element, attributes){
    const el = document.createElement(element);
    attributes = attributes || null;
    if(typeof attributes === "object" && attributes !== null){
        Object.keys(attributes).forEach(function(key){
            el.setAttribute(key, attributes[key]);
        });
    }
    return el;
}

function jsonPerse(string){
    var json;
    string = string !== null && string !== undefined ? 
    string.replace(/'/g, '"')
    .replace(/(?:\r\n|\r|\n)/g, ' ')
    .replace(/\s{2,}/g, '')
    : '';
    try{
        json = JSON.parse(string);
    }catch(e){
        json = {};
    }
    return json;
}

/**==========================
 * Selectists
===========================**/

function updateObjectKeyValue(obj, key, val){
    obj[key] = obj[key] !== undefined && obj[key] !== null
                ? obj[key] + " " + val
                : val;
    return obj;
}

function addScrollbarToSelect(optGroup){
    const lastChildOption = optGroup.querySelector(".option-item:last-child");
    if(!lastChildOption) return false;
    const innerHeightOptGroup = lastChildOption.offsetTop + outerHeight(lastChildOption)
    if(innerHeightOptGroup > outerHeight(optGroup)){
        optGroup.classList.add("scrollbar");
    }else{
        optGroup.classList.remove("scrollbar");
    }
}

function generateID(){
    return "a"+Math.random().toString(36).substring(7);
}

function empty(data){
    return data === null || data === undefined || data === "";
}

function keyObjectExist(obj, key){
    return obj[key] !== undefined;
}

function renderListOptions(key, searchWord){
    searchWord = searchWord.toLowerCase();
    const menuLists = manageGroupOptions[key];
    const optGroup = document.querySelector('[data-key="'+key+'"]');
    const customSelect  = optGroup.parentNode;
    const prevOptGroup = customSelect.childNodes[1];
    const newOptGroup = prevOptGroup.cloneNode();
    customSelect.removeChild(customSelect.childNodes[1]);
    customSelect.append(newOptGroup);
    menuLists
        .filter(function(menu){
            return (
                empty(searchWord)
                || menu.label.toLowerCase().indexOf(searchWord) !== -1
                || menu.value.toLowerCase().indexOf(searchWord) !== -1
            )
        })
        .forEach(function(menu){
            const customOption = createElement("div", {
                "data-value": menu.value,
                "class": "option-item"
            });
            customOption.textContent = menu.label;
            newOptGroup.append(customOption);
        });
}

function customSelect(){
    const allCustomSelect = document.querySelectorAll(".select.custom select");

    Array.prototype.slice.call(allCustomSelect).forEach(function(select){
        let optionKey = empty(select.getAttribute("id")) ? generateID() : select.getAttribute("id");
        optionKey = keyObjectExist(manageGroupOptions, optionKey) ? generateID() : optionKey;

        select.setAttribute("id", optionKey);
        const customSelectWrapper = select.closest(".select.custom");
        const customSelect = createElement("div", updateObjectKeyValue(jsonPerse(select.getAttribute("data-select")), 'class', 'list-group'));
        const selectSearch = createElement("div", updateObjectKeyValue(jsonPerse(select.getAttribute("data-search")), 'class', 'input'));
        const selectInput = createElement(
            "input",
            Object.assign(
                {placeholder: select.getAttribute("placeholder") || "Select item"},
                jsonPerse(select.getAttribute("data-search-input")),
                {type: "text", "data-key-input": optionKey}
                )
            );

        selectSearch.append(selectInput)
        customSelect.append(selectSearch);
        const createDropDown = createElement("div", {
            "class": "select-optgroup radiusless-tr-tl",
            "data-key": optionKey
        });
        createDropDown.style.width = outerWidth(customSelectWrapper) +"px";
        const optionsList = [];
        Array.prototype.slice.call(select.querySelectorAll("option")).forEach(function(option){
            const customOption = createElement("div", {
                "data-value": option.value || option.textContent,
                "class": "option-item"
            });
            customOption.textContent = option.textContent;
            createDropDown.append(customOption);
            optionsList.push({value: option.value || option.textContent, label: option.textContent});
        });
        // Remove Current Select Element
        select.parentNode.removeChild(select.parentNode.childNodes[1]);
        // Clone Select Element
        const cloneSelect = select.cloneNode();
        // Create option element and append it to clone select element
        cloneSelect.append(createElement("option",{
            value: "",
            selected: "selected"
        }));
        // Append the clone Select Element
        customSelectWrapper.append(cloneSelect);
        // Append the Dropdown to the Custom Select Element
        customSelect.append(createDropDown);
        // Append the Custom Select to the Select Wrapper
        customSelectWrapper.append(customSelect);
        // Save all optgroup with key
        manageGroupOptions[optionKey] = optionsList;
    });

}

function ceilToHundred(number){
    number = parseInt(number);
    const absNumber = number < 0 ? -1 * number : number;
    const quotient = parseInt(absNumber / 100, 10);
    const reminder = absNumber % 100;
    const finalValue = reminder > 50 ? (quotient + 1) * 100 : quotient * 100;
    return number > 0 ? finalValue : -1 * finalValue;
}


 
function sliderAnimate(timestamp, starttime, el, constArray){
    if(el.closest(".hero-slider").classList.contains("paused")) return false;
    //if browser doesn't support requestAnimationFrame, generate our own timestamp using Date:
    timestamp = timestamp || new Date().getTime();
    var runtime = timestamp - starttime;
    if(runtime > constArray[2]){
        var duration = parseInt(constArray[1], 10) + parseInt(constArray[2], 10);
        var progress = (duration - runtime) / parseInt(constArray[1], 10);
        var prevTranslateX;
        progress = Math.max(Math.min(progress, 1), 0);
        if (runtime < duration){ // if duration not met yet
            prevTranslateX = ((constArray[0] * constArray[3]) - (constArray[0] * progress).toFixed(2));
            if(constArray[3] === 0 || constArray[3] === numberOfSlider){
                prevTranslateX = ( - (constArray[0] * progress).toFixed(2));
                el.style.left = prevTranslateX+"%";   
            }else{  
                el.style.left = "-"+prevTranslateX+"%";   
            }
        }else{
            // nextSliderPosition = el.style.left;
            starttime = timestamp || new Date().getTime();
            // constArray[3] = currentPointer = (constArray[3] + 1) >= numberOfSlider ? 0 : (constArray[3] + 1);
            // constArray[3] = currentPointer = (currentPointer + 1) >= numberOfSlider ? 0 : (currentPointer + 1);
            constArray[3] = currentPointer = (currentPointer + 1) >= numberOfSlider ? 0 : (currentPointer + 1);
        }
    }
    requestFrameRefrence = requestAnimationFrame(function(timestamp){ // call requestAnimationFrame again with parameters
        sliderAnimate(timestamp, starttime, el, constArray);
    });
}

function slidePrevNext(timestamp, starttime, el, constArray, next){
    timestamp = timestamp || new Date().getTime();
    var runtime = timestamp - starttime;
    var progress = runtime / constArray[1];
    progress = Math.min(progress, 1);
    if(next){
        constArray[3] = currentPointer = (constArray[3] + 1) >= numberOfSlider ? 0 : (constArray[3] + 1);
    }else{
        constArray[3] = currentPointer = (constArray[3] - 1)  <= 0 ? numberOfSlider: (constArray[3] - 1);
    }

    var prevTranslateX = ((constArray[0] * constArray[3]) - (constArray[0] * progress).toFixed(2));
    if(next){
        // el.style.transform = constArray[3] === 0 ?  "translateX(+"+prevTranslateX+"%)" : "translateX(-"+(prevTranslateX)+"%)"
        el.style.left = constArray[3] === 0 ?  prevTranslateX+"%" : "-"+prevTranslateX+"%";
    }else{
        // el.style.transform = (numberOfSlider * constArray[0]) ===  prevTranslateX ? "translateX(0%)" : "translateX(-"+(prevTranslateX)+"%)";
        el.style.left = (numberOfSlider * constArray[0]) ===  prevTranslateX ? "0%" : "-"+prevTranslateX+"%";
    }
}

function getNumberOfPosition(heroSlider){
    var sliderInner = heroSlider.querySelector('.inner-slider');
    var sliderItems = heroSlider.querySelectorAll(".slider-item");
    var totalWidth =  sliderItems.length > 0 ? sliderItems.length * outerWidth(sliderItems[0]) : outerWidth(sliderInner);
    return Math.ceil(totalWidth / outerWidth(sliderInner));
}

function initialHeroSlider(heroSlider){
    if(!heroSlider.classList.contains("paused")){
        var sliderInner = heroSlider.querySelector('.inner-slider');
        numberOfSlider = getNumberOfPosition(heroSlider);
        requestAnimationFrame(function(timestamp){
            var starttime = timestamp || new Date().getTime() //if browser doesn't support requestAnimationFrame, generate our own timestamp using Date
            sliderAnimate(timestamp, starttime,  sliderInner, [100, 300, 7000, currentPointer]); // 400px over 1 second
        });
    }
}

listener(document, "DOMContentLoaded", function(){
    const navbarBurger = document.querySelector(".narbar-burger");
    if(navbarBurger){
        listener(navbarBurger, "click", function(e){
            const narbar = this.closest('.navbar');
            if(narbar.classList.contains('active')){
                narbar.classList.remove('active')
            }else{
                narbar.classList.add('active')
            }
        });
    }

    const sliderBar = document.querySelector('.slider-bar');

    if(sliderBar){
        const range = parseInt(sliderBar.getAttribute("data-max"), 10) - parseInt(sliderBar.getAttribute("data-min"), 10);
        let prevMin = 0;
    
        listener(sliderBar, "mousedown, mousemove, mouseup, touchstart, touchmove, touchend, mouseout", function(e){
            const target = e.target;
            if(target.nodeName.toLowerCase() === "div" && target.classList.contains("slider-thumb") ){
                if(e.type === "mousedown" || e.type === "touchstart" ){
                    target.classList.add("dragging");
                }
                if(e.type === "mouseup" || e.type ==="mouseout" || e.type ==="touchend"){
                    target.classList.remove("dragging");
                }
                if(target.classList.contains("dragging")){
                    // Get the 
                    try{
                        let getWidth = ((e.clientX - this.getBoundingClientRect().x) / this.getBoundingClientRect().width);
    
                        const inputClass = target.parentNode.parentNode.nextElementSibling.children;
    
                        getWidth = getWidth < 0 ? 0 : getWidth;
                        getWidth = getWidth > 1 ? 1 : getWidth;
    
                        let minElement, maxElement;
                        if(target.classList.contains("last")){
                            minElement = target.parentNode.children[0];
                            maxElement = e.target;
                            target.style.zIndex = 3;
                            target.parentNode.children[0].style.zIndex = 0;
                        }else{
                            minElement = e.target;
                            maxElement = target.parentNode.children[1];
                            target.style.zIndex = 3;
                            target.parentNode.children[1].style.zIndex = 0;
                        }
    
                        if(getWidth >= 0 && getWidth <= 1 &&  +minElement.getAttribute("data-value") <= +maxElement.getAttribute("data-value")){
                            target.style.left = (getWidth * 100) + "%";
                            target.setAttribute("data-value", parseInt((getWidth * range), 10));
                            prevMin = +maxElement.getAttribute("data-value");
                            inputClass[0].children[0].value = minElement.getAttribute("data-value");
                            inputClass[1].children[0].value = maxElement.getAttribute("data-value");
                        }else{
                                const newWidth = ((prevMin - (range / 100))  / range);
                                minElement.style.left = ( newWidth * 100) + "%";
                                minElement.setAttribute("data-value", parseInt(newWidth * range, 10));
                                inputClass[0].children[0].value = minElement.getAttribute("data-value");
                        }
                    }catch(err){
                        target.classList.remove("dragging");
                    }
                }
            }
        });
    }

    const sidebar = document.querySelector(".sidebar");
    const heroSlider = document.querySelector(".hero-slider");
    let innerSideBar = null,  menuList = null, mainContent = null , menuListHeight = null;


        /**
         * Sticker
         */
        if(sidebar){
            innerSideBar = sidebar.querySelector(".sidebar-inner");
            menuList = sidebar.querySelector(".menu-list");
            mainContent = document.querySelector(".main-content");
            menuListHeight = menuList.getBoundingClientRect().height;
        }

        listener(window, "resize, scroll", function(e){
            //Resize monitor
            if(
                window.innerWidth > 768
            ){
                if(sidebar && mainContent.getBoundingClientRect().height > menuListHeight){
                    // Scrolling monitor;
                    if(sidebar.getBoundingClientRect().top < 0 ){
                        if(sidebar.getBoundingClientRect().height >= (menuListHeight - innerSideBar.getBoundingClientRect().top)){
                            menuList.style.position = "fixed";
                            menuList.style.top = "0px";
                            menuList.style.width = sidebar.getBoundingClientRect().width + "px";
                        }else{
                            menuList.style.position = "absolute";
                            menuList.style.top = "initial";
                            menuList.style.bottom = "0px";
                            menuList.style.width = menuList.classList.contains("no-width") ? "100%" : "initial";
                        }
                    }else{
                        menuList.style.position = "absolute";
                        // menuList.style.width = "initial";
                        menuList.style.top = "initial";
                        menuList.style.bottom = "initial";
                        menuList.style.width = menuList.classList.contains("no-width") ? "100%" : "initial";
                    }
                }
                
            }
            if(e.type.toLowerCase() === "resize"){
                if(heroSlider){
                    currentPointer = 1;
                    cancelAnimationFrame(requestFrameRefrence);
                    initialHeroSlider(heroSlider);
                }
            }
        });

    const cardDescription = document.querySelectorAll(".card .card-description.exact-length");

    if(cardDescription.length > 0){
        Array.prototype.slice.call(cardDescription).forEach(function(cardDesc){
            const descContext = cardDesc.innerHTML.trim();
            const descLength = +cardDesc.getAttribute("data-string-length") || 40;

            cardDesc.innerHTML = descContext.length > descLength ? descContext.substring(0, descLength)+"..." : descContext;
        });
    }

    /**========================
     * Animation for slider
     =======================**/

     if(heroSlider){
         window.requestAnimationFrame = window.requestAnimationFrame
         || window.mozRequestAnimationFrame
         || window.webkitRequestAnimationFrame
         || window.msRequestAnimationFrame
         || function(f){return setTimeout(f, 1000/60)} // simulate calling code 60 

         window.cancelAnimationFrame = window.cancelAnimationFrame
        || window.mozCancelAnimationFrame
        || function(requestID){clearTimeout(requestID)} //fall back


        initialHeroSlider(heroSlider);

        listener(heroSlider, "mouseover, mouseout", function(e){
            if(e.type.toLowerCase() === "mouseover"){
                cancelAnimationFrame(requestFrameRefrence);
                heroSlider.classList.add("paused");
            }else if(e.type.toLowerCase() === "mouseout"){
                heroSlider.classList.remove("paused");
                initialHeroSlider(heroSlider);
            }
        });

        const navigationArrow = heroSlider.querySelector(".slider-navigation");

        if(navigationArrow){
            listener(navigationArrow, "click", function(e){
                var sliderInner = heroSlider.querySelector('.inner-slider');
                var numOfSlides = getNumberOfPosition(heroSlider);
                const target = e.target;
                if((target.nodeName.toLowerCase() === "div" && target.classList.contains("arrows"))
                || (target.nodeName.toLowerCase() === "span") && target.classList.contains("arrow-icon")){

                    cancelAnimationFrame(requestFrameRefrence);
                    requestAnimationFrame(function(timestamp){
                        var starttime = timestamp || new Date().getTime() //if browser doesn't support requestAnimationFrame, generate our own timestamp using Date
                        slidePrevNext(timestamp, starttime,  sliderInner, [100, 300, 7000, currentPointer, numOfSlides], target.classList.contains("next-icon")); // 400px over 1 second
                    });
                }
            });
        }
        
            
    }


    /**=============================================
     *  Modal Open and Close, Alert, Custom Select *
     ============================================**/
    listener(document.body, "click", function(e){
        const target = e.target;
        if(target.classList.contains("modal-opener")){
            const modalPointer = target.getAttribute("data-modal-id");

            const modal = document.querySelector(modalPointer) || document.querySelector(".modal");

            modal.classList.add("active");
        }else if(target.closest(".modal") && target.classList.contains("close")){
            target.closest(".modal").classList.remove("active");
        }

        if(target.closest(".alert") && target.classList.contains("alert-close")){
            target.closest(".alert").classList.remove("active")
        }

        if(
            target.closest(".radio-options")
            && target.classList.contains("radio-option")
            && !target.classList.contains("active")
        ){
            const radioGroup = target.closest(".radio-group");
            radioGroup.querySelector(".radio-option.active")
                .classList.remove("active");
            target.classList.add("active");
            radioGroup.querySelector('input[type="hidden"]').value = target.getAttribute("data-value");
        }

        if(
            target.nodeName.toLowerCase() === "button" && target.classList.contains("add")
        ){
            const inputWrapper = target.closest(".input:not(.button)");
            const input = inputWrapper.querySelector(".input-add");
            const unorderedList = document.querySelector(".lists");
            const getCloneEl = unorderedList.childNodes[1].cloneNode(false);
            const inputValue = input.value.trim();
            if(inputValue.length < 1){
                displayMessage("Sorry, you have not input any value", "alert-danger");
                return false;
            }
            const arrayInputList = document.querySelector(".array-input");
            getCloneEl.textContent = inputValue;
            unorderedList.append(getCloneEl);
            input.value = "";
            arrayInputList.append(createElement("input", {
                type: "hidden",
                name: "array[]",
                value: inputValue
            }));
        }

        if(
            target.closest(".sidebar")
            && target.nodeName.toLowerCase() === "div"
            && target.classList.contains("menu-burger") 
        ){
            const menuItem = target.closest(".menu-item");
            if(menuItem.classList.contains("active")){
                menuItem.classList.remove("active")
            }else{
                menuItem.classList.add("active")
            }
        }

        if(target.closest(".sidebar") && target.nodeName.toLowerCase() === "div" && target.classList.contains("sale")){
            target.classList.contains("active") ? target.classList.remove("active") : target.classList.add("active");
        }

        if(target.closest(".sidebar")
            && (
                ( target.nodeName.toLowerCase() === "div" && target.classList.contains("drawer-inner"))
                || ( target.nodeName.toLowerCase() === "span" && target.classList.contains("span-drawer"))
            )){
            const sideBarWrapper =  target.closest(".sidebar");
            if(sideBarWrapper.classList.contains("active")){
                sideBarWrapper.classList.remove("active");
            }else{
                sideBarWrapper.classList.add("active");
            }
        }

        if(target.closest(".select.custom") && target.closest(".list-group:not(.active)") && target.nodeName.toLowerCase() === "input"){
            const listGroup = target.closest(".list-group");
            const optGroup = listGroup.querySelector(".select-optgroup");
            optGroup.style.width = outerWidth(listGroup) + "px";
            const prevActiveSelect =  document.querySelector(".list-group.active");
            if(prevActiveSelect){
                prevActiveSelect.classList.remove("active");
            }
            listGroup.classList.add("active");
            addScrollbarToSelect(optGroup);
            
        }

        if(target.closest(".select-optgroup") && target.classList.contains("option-item") && !target.classList.contains("active") ){
            const listGroup = target.parentNode.parentNode;
            const customSelect = listGroup.parentNode;
            const input = customSelect.querySelector(".input input");
            const selectElement = customSelect.querySelector("select"); 
            const optionSelected = createElement("option", {
                value: target.getAttribute("data-value").trim(),
                selected: "selected"
            });
            optionSelected.textContent = target.textContent.trim();
            selectElement.removeChild(selectElement.childNodes[0]);
            selectElement.append(optionSelected);
            input.value = target.textContent.trim();
            listGroup.classList.remove("active");

        }

        if(
            target.closest(".select.custom") === null
            && target.closest(".list-group") === null
        ){
            const prevActiveSelect =  document.querySelector(".list-group.active");
            if(prevActiveSelect){
                prevActiveSelect.classList.remove("active");
            }
        }
    });

    listener(document.body, "input", function(e){
        const target = e.target;
        if(target.closest(".select.custom") && target.nodeName.toLowerCase() === "input"){
            const searchWord = target.value.trim();
            const key = target.getAttribute("data-key-input");
            renderListOptions(key, searchWord);
        }
    })

    /**============================================
     * Initialize Custom Select
     ============================================**/

     customSelect();
});