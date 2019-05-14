"use strict";
/**
 * Global Variables
 */

 let requestFrameRefrence, currentPointer = 1;



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
            if(constArray[3] === 0 || constArray[3] === constArray[4]){
                prevTranslateX = ( - (constArray[0] * progress).toFixed(2));
                el.style.transform = "translateX("+prevTranslateX+"%)";   
            }else{
                el.style.transform = "translateX(-"+prevTranslateX+"%)";   
            }
        }else{
            starttime = timestamp || new Date().getTime();
            constArray[3] = currentPointer = (constArray[3] + 1) >= constArray[4] ? 0 : (constArray[3] + 1);
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
        constArray[3] = currentPointer = (constArray[3] + 1) >= constArray[4] ? 0 : (constArray[3] + 1);
    }else{
        constArray[3] = currentPointer = (constArray[3] - 1)  <= 0 ? constArray[4]: (constArray[3] - 1);
    }

    var prevTranslateX = ((constArray[0] * constArray[3]) - (constArray[0] * progress).toFixed(2));
    if(next){
        el.style.transform = constArray[3] === 0 ?  "translateX(+"+prevTranslateX+"%)" : "translateX(-"+(prevTranslateX)+"%)"
    }else{
        el.style.transform = (constArray[4] * constArray[0]) ===  prevTranslateX ? "translateX(0%)" : "translateX(-"+(prevTranslateX)+"%)";
    }
}

function initialHeroSlider(heroSlider){
    if(!heroSlider.classList.contains("paused")){
        var sliderInner = heroSlider.querySelector('.inner-slider');
        var sliderItems = heroSlider.querySelectorAll(".slider-item");
        var totalWidth =  sliderItems.length > 0 ? sliderItems.length * outerWidth(sliderItems[0]) : outerWidth(sliderInner);
        var numOfSlides = Math.ceil(totalWidth / outerWidth(sliderInner));
        requestAnimationFrame(function(timestamp){
            var starttime = timestamp || new Date().getTime() //if browser doesn't support requestAnimationFrame, generate our own timestamp using Date
            sliderAnimate(timestamp, starttime,  sliderInner, [100, 300, 7000, currentPointer, numOfSlides]); // 400px over 1 second
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

    if(sidebar){
        listener(sidebar, "click", function(e){
            const target = e.target;
            
            if(target.nodeName.toLowerCase() === "div" && target.classList.contains("menu-burger") ){
                const menuItem = target.closest(".menu-item");
                if(menuItem.classList.contains("active")){
                    menuItem.classList.remove("active")
                }else{
                    menuItem.classList.add("active")
                }
            }

            if(target.nodeName.toLowerCase() === "div" && target.classList.contains("sale")){
                target.classList.contains("active") ? target.classList.remove("active") : target.classList.add("active");
            }

            if(
                (target.nodeName.toLowerCase() === "div" && target.classList.contains("drawer-inner"))
                || (target.nodeName.toLowerCase() === "span" && target.classList.contains("span-drawer"))
            ){
                const sideBarWrapper =  target.closest(".sidebar");
                if(sideBarWrapper.classList.contains("active")){
                    sideBarWrapper.classList.remove("active");
                }else{
                    sideBarWrapper.classList.add("active");
                }
            }
        });

        /**
         * Sticker
         */

        const innerSideBar = sidebar.querySelector(".sidebar-inner");
        const menuList = sidebar.querySelector(".menu-list");
        const mainContent = document.querySelector(".main-content");
        const menuListHeight = menuList.getBoundingClientRect().height;

        listener(window, "resize, scroll", function(e){
            //Resize monitor
            if(
                window.innerWidth > 768
                && mainContent.getBoundingClientRect().height > menuListHeight
            ){
                // Scrolling monitor;
                if(sidebar.getBoundingClientRect().top < 0 ){
                    if(sidebar.getBoundingClientRect().height >= (menuListHeight - innerSideBar.getBoundingClientRect().top)){
                        menuList.style.position = "fixed";
                        menuList.style.width = sidebar.getBoundingClientRect().width + "px";
                        menuList.style.top = "0px";
                    }else{
                        menuList.style.position = "absolute";
                        menuList.style.width = "initial";
                        menuList.style.top = "initial";
                        menuList.style.bottom = "0px";
                    }
                }else{
                    menuList.style.position = "absolute";
                    menuList.style.width = "initial";
                    menuList.style.top = "initial";
                    menuList.style.bottom = "initial";
                }
            }
        });
    }

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
     var heroSlider = document.querySelector(".hero-slider");

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
                var sliderItems = heroSlider.querySelectorAll(".slider-item");
                var totalWidth =  sliderItems.length > 0 ? sliderItems.length * outerWidth(sliderItems[0]) : outerWidth(sliderInner);
                var numOfSlides = Math.ceil(totalWidth / outerWidth(sliderInner));
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


    /**==================================
     *  Modal Open and Close
     ==================================**/
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
        });
});