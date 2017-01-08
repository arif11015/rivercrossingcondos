// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

/*
 * jQuery Nivo Slider v3.2
 * http://nivo.dev7studios.com
 *
 * Copyright 2012, Dev7studios
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    var NivoSlider = function(element, options){
        // Defaults are below
        var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        // Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: false,
            controlNavEl: false
        };

        // Get this slider
        var slider = $(element);
        slider.data('nivo:vars', vars).addClass('nivoSlider');

        // Find our slider children
        var kids = slider.children();
        kids.each(function() {
            var child = $(this);
            var link = '';
            if(!child.is('img')){
                if(child.is('a')){
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }
            // Get img width & height
            var childWidth = (childWidth === 0) ? child.attr('width') : child.width(),
                childHeight = (childHeight === 0) ? child.attr('height') : child.height();

            if(link !== ''){
                link.css('display','none');
            }
            child.css('display','none');
            vars.totalSlides++;
        });
         
        // If randomStart
        if(settings.randomStart){
            settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }
        
        // Set startSlide
        if(settings.startSlide > 0){
            if(settings.startSlide >= vars.totalSlides) { settings.startSlide = vars.totalSlides - 1; }
            vars.currentSlide = settings.startSlide;
        }
        
        // Get initial image
        if($(kids[vars.currentSlide]).is('img')){
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }
        
        // Show initial link
        if($(kids[vars.currentSlide]).is('a')){
            $(kids[vars.currentSlide]).css('display','block');
        }
        
        // Set first background
        var sliderImg = $('<img/>').addClass('nivo-main-image');
        sliderImg.attr('src', vars.currentImage.attr('src')).show();
        slider.append(sliderImg);

        // Detect Window Resize
        $(window).resize(function() {
            slider.children('img').width(slider.width());
            sliderImg.attr('src', vars.currentImage.attr('src'));
            sliderImg.stop().height('auto');
            $('.nivo-slice').remove();
            $('.nivo-box').remove();
        });

        //Create caption
        slider.append($('<div class="nivo-caption"></div>'));
        
        // Process caption function
        var processCaption = function(settings){
            var nivoCaption = $('.nivo-caption', slider);
            if(vars.currentImage.attr('title') != '' && vars.currentImage.attr('title') != undefined){
                var title = vars.currentImage.attr('title');
                if(title.substr(0,1) == '#') title = $(title).html();   

                if(nivoCaption.css('display') == 'block'){
                    setTimeout(function(){
                        nivoCaption.html(title);
                    }, settings.animSpeed);
                } else {
                    nivoCaption.html(title);
                    nivoCaption.stop().fadeIn(settings.animSpeed);
                }
            } else {
                nivoCaption.stop().fadeOut(settings.animSpeed);
            }
        }
        
        //Process initial  caption
        processCaption(settings);
        
        // In the words of Super Mario "let's a go!"
        var timer = 0;
        if(!settings.manualAdvance && kids.length > 1){
            timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
        }
        
        // Add Direction nav
        if(settings.directionNav){
            slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+ settings.prevText +'</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>');
            
            $(slider).on('click', 'a.nivo-prevNav', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                nivoRun(slider, kids, settings, 'prev');
            });
            
            $(slider).on('click', 'a.nivo-nextNav', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next');
            });
        }
        
        // Add Control nav
        if(settings.controlNav){
            vars.controlNavEl = $('<div class="nivo-controlNav"></div>');
            slider.after(vars.controlNavEl);
            for(var i = 0; i < kids.length; i++){
                if(settings.controlNavThumbs){
                    vars.controlNavEl.addClass('nivo-thumbs-enabled');
                    var child = kids.eq(i);
                    if(!child.is('img')){
                        child = child.find('img:first');
                    }
                    if(child.attr('data-thumb')) vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'"><img src="'+ child.attr('data-thumb') +'" alt="" /></a>');
                } else {
                    vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'">'+ (i + 1) +'</a>');
                }
            }

            //Set initial active link
            $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            
            $('a', vars.controlNavEl).bind('click', function(){
                if(vars.running) return false;
                if($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
                sliderImg.attr('src', vars.currentImage.attr('src'));
                vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun(slider, kids, settings, 'control');
            });
        }
        
        //For pauseOnHover setting
        if(settings.pauseOnHover){
            slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function(){
                vars.paused = false;
                // Restart the timer
                if(timer === '' && !settings.manualAdvance){
                    timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }
        
        // Event when Animation finishes
        slider.bind('nivo:animFinished', function(){
            sliderImg.attr('src', vars.currentImage.attr('src'));
            vars.running = false; 
            // Hide child links
            $(kids).each(function(){
                if($(this).is('a')){
                   $(this).css('display','none');
                }
            });
            // Show current link
            if($(kids[vars.currentSlide]).is('a')){
                $(kids[vars.currentSlide]).css('display','block');
            }
            // Restart the timer
            if(timer === '' && !vars.paused && !settings.manualAdvance){
                timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            // Trigger the afterChange callback
            settings.afterChange.call(this);
        }); 
        
        // Add slices for slice animations
        var createSlices = function(slider, settings, vars) {
        	if($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display','block');
            $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var sliceHeight = ($('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').parent().is('a')) ? $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').parent().height() : $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').height();

            for(var i = 0; i < settings.slices; i++){
                var sliceWidth = Math.round(slider.width()/settings.slices);
                
                if(i === settings.slices-1){
                    slider.append(
                        $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({ 
                            left:(sliceWidth*i)+'px', 
                            width:(slider.width()-(sliceWidth*i))+'px',
                            height:sliceHeight+'px', 
                            opacity:'0',
                            overflow:'hidden'
                        })
                    );
                } else {
                    slider.append(
                        $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({ 
                            left:(sliceWidth*i)+'px', 
                            width:sliceWidth+'px',
                            height:sliceHeight+'px',
                            opacity:'0',
                            overflow:'hidden'
                        })
                    );
                }
            }
            
            $('.nivo-slice', slider).height(sliceHeight);
            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };
        
        // Add boxes for box animations
        var createBoxes = function(slider, settings, vars){
        	if($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display','block');
            $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var boxWidth = Math.round(slider.width()/settings.boxCols),
                boxHeight = Math.round($('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').height() / settings.boxRows);
            
                        
            for(var rows = 0; rows < settings.boxRows; rows++){
                for(var cols = 0; cols < settings.boxCols; cols++){
                    if(cols === settings.boxCols-1){
                        slider.append(
                            $('<div class="nivo-box" name="'+ cols +'" rel="'+ rows +'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block; top:-'+ (boxHeight*rows) +'px; left:-'+ (boxWidth*cols) +'px;" /></div>').css({ 
                                opacity:0,
                                left:(boxWidth*cols)+'px', 
                                top:(boxHeight*rows)+'px',
                                width:(slider.width()-(boxWidth*cols))+'px'
                                
                            })
                        );
                        $('.nivo-box[name="'+ cols +'"]', slider).height($('.nivo-box[name="'+ cols +'"] img', slider).height()+'px');
                    } else {
                        slider.append(
                            $('<div class="nivo-box" name="'+ cols +'" rel="'+ rows +'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block; top:-'+ (boxHeight*rows) +'px; left:-'+ (boxWidth*cols) +'px;" /></div>').css({ 
                                opacity:0,
                                left:(boxWidth*cols)+'px', 
                                top:(boxHeight*rows)+'px',
                                width:boxWidth+'px'
                            })
                        );
                        $('.nivo-box[name="'+ cols +'"]', slider).height($('.nivo-box[name="'+ cols +'"] img', slider).height()+'px');
                    }
                }
            }
            
            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };

        // Private run method
        var nivoRun = function(slider, kids, settings, nudge){          
            // Get our vars
            var vars = slider.data('nivo:vars');
            
            // Trigger the lastSlide callback
            if(vars && (vars.currentSlide === vars.totalSlides - 1)){ 
                settings.lastSlide.call(this);
            }
            
            // Stop
            if((!vars || vars.stop) && !nudge) { return false; }
            
            // Trigger the beforeChange callback
            settings.beforeChange.call(this);

            // Set current background before change
            if(!nudge){
                sliderImg.attr('src', vars.currentImage.attr('src'));
            } else {
                if(nudge === 'prev'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
                if(nudge === 'next'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
            }
            
            vars.currentSlide++;
            // Trigger the slideshowEnd callback
            if(vars.currentSlide === vars.totalSlides){ 
                vars.currentSlide = 0;
                settings.slideshowEnd.call(this);
            }
            if(vars.currentSlide < 0) { vars.currentSlide = (vars.totalSlides - 1); }
            // Set vars.currentImage
            if($(kids[vars.currentSlide]).is('img')){
                vars.currentImage = $(kids[vars.currentSlide]);
            } else {
                vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
            }
            
            // Set active links
            if(settings.controlNav){
                $('a', vars.controlNavEl).removeClass('active');
                $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            }
            
            // Process caption
            processCaption(settings);            
            
            // Remove any slices from last transition
            $('.nivo-slice', slider).remove();
            
            // Remove any boxes from last transition
            $('.nivo-box', slider).remove();
            
            var currentEffect = settings.effect,
                anims = '';
                
            // Generate random effect
            if(settings.effect === 'random'){
                anims = new Array('sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
                'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse');
                currentEffect = anims[Math.floor(Math.random()*(anims.length + 1))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Run random effect from specified set (eg: effect:'fold,fade')
            if(settings.effect.indexOf(',') !== -1){
                anims = settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random()*(anims.length))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Custom transition as defined by "data-transition" attribute
            if(vars.currentImage.attr('data-transition')){
                currentEffect = vars.currentImage.attr('data-transition');
            }
        
            // Run effects
            vars.running = true;
            var timeBuff = 0,
                i = 0,
                slices = '',
                firstSlice = '',
                totalBoxes = '',
                boxes = '';
            
            if(currentEffect === 'sliceDown' || currentEffect === 'sliceDownRight' || currentEffect === 'sliceDownLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    slice.css({ 'top': '0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUp' || currentEffect === 'sliceUpRight' || currentEffect === 'sliceUpLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceUpLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    slice.css({ 'bottom': '0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUpDown' || currentEffect === 'sliceUpDownRight' || currentEffect === 'sliceUpDownLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                var v = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceUpDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    if(i === 0){
                        slice.css('top','0px');
                        i++;
                    } else {
                        slice.css('bottom','0px');
                        i = 0;
                    }
                    
                    if(v === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    v++;
                });
            } else if(currentEffect === 'fold'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                
                $('.nivo-slice', slider).each(function(){
                    var slice = $(this);
                    var origWidth = slice.width();
                    slice.css({ top:'0px', width:'0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'fade'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': slider.width() + 'px'
                });
    
                firstSlice.animate({ opacity:'1.0' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
            } else if(currentEffect === 'slideInRight'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
            } else if(currentEffect === 'slideInLeft'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1',
                    'left': '',
                    'right': '0px'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed*2), '', function(){ 
                    // Reset positioning
                    firstSlice.css({
                        'left': '0px',
                        'right': ''
                    });
                    slider.trigger('nivo:animFinished'); 
                });
            } else if(currentEffect === 'boxRandom'){
                createBoxes(slider, settings, vars);
                
                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;

                boxes = shuffle($('.nivo-box', slider));
                boxes.each(function(){
                    var box = $(this);
                    if(i === totalBoxes-1){
                        setTimeout(function(){
                            box.animate({ opacity:'1' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            box.animate({ opacity:'1' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 20;
                    i++;
                });
            } else if(currentEffect === 'boxRain' || currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                createBoxes(slider, settings, vars);
                
                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;
                
                // Split boxes into 2D array
                var rowIndex = 0;
                var colIndex = 0;
                var box2Darr = [];
                box2Darr[rowIndex] = [];
                boxes = $('.nivo-box', slider);
                if(currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrowReverse'){
                    boxes = $('.nivo-box', slider)._reverse();
                }
                boxes.each(function(){
                    box2Darr[rowIndex][colIndex] = $(this);
                    colIndex++;
                    if(colIndex === settings.boxCols){
                        rowIndex++;
                        colIndex = 0;
                        box2Darr[rowIndex] = [];
                    }
                });
                
                // Run animation
                for(var cols = 0; cols < (settings.boxCols * 2); cols++){
                    var prevCol = cols;
                    for(var rows = 0; rows < settings.boxRows; rows++){
                        if(prevCol >= 0 && prevCol < settings.boxCols){
                            /* Due to some weird JS bug with loop vars 
                            being used in setTimeout, this is wrapped
                            with an anonymous function call */
                            (function(row, col, time, i, totalBoxes) {
                                var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if(currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                                    box.width(0).height(0);
                                }
                                if(i === totalBoxes-1){
                                    setTimeout(function(){
                                        box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3, '', function(){ slider.trigger('nivo:animFinished'); });
                                    }, (100 + time));
                                } else {
                                    setTimeout(function(){
                                        box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3);
                                    }, (100 + time));
                                }
                            })(rows, prevCol, timeBuff, i, totalBoxes);
                            i++;
                        }
                        prevCol--;
                    }
                    timeBuff += 100;
                }
            }           
        };
        
        // Shuffle an array
        var shuffle = function(arr){
            for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        };
        
        // For debugging
        var trace = function(msg){
            if(this.console && typeof console.log !== 'undefined') { console.log(msg); }
        };
        
        // Start / Stop
        this.stop = function(){
            if(!$(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        };
        
        this.start = function(){
            if($(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        };
        
        // Trigger the afterLoad callback
        settings.afterLoad.call(this);
        
        return this;
    };
        
    $.fn.nivoSlider = function(options) {
        return this.each(function(key, value){
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('nivoslider')) { return element.data('nivoslider'); }
            // Pass options to plugin constructor
            var nivoslider = new NivoSlider(this, options);
            // Store plugin object in this element's data
            element.data('nivoslider', nivoslider);
        });
    };
    
    //Default settings
    $.fn.nivoSlider.defaults = {
        effect: 'random',
        slices: 15,
        boxCols: 8,
        boxRows: 4,
        animSpeed: 500,
        pauseTime: 3000,
        startSlide: 0,
        directionNav: true,
        controlNav: true,
        controlNavThumbs: false,
        pauseOnHover: true,
        manualAdvance: false,
        prevText: 'Prev',
        nextText: 'Next',
        randomStart: false,
        beforeChange: function(){},
        afterChange: function(){},
        slideshowEnd: function(){},
        lastSlide: function(){},
        afterLoad: function(){}
    };

    $.fn._reverse = [].reverse;
    
})(jQuery);

/**
 * BxSlider v4.1.2 - Fully loaded, responsive content slider
 * http://bxslider.com
 *
 * Copyright 2014, Steven Wanderski - http://stevenwanderski.com - http://bxcreative.com
 * Written while drinking Belgian ales and listening to jazz
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */
!function(t){var e={},s={mode:"horizontal",slideSelector:"",infiniteLoop:!0,hideControlOnEnd:!1,speed:500,easing:null,slideMargin:0,startSlide:0,randomStart:!1,captions:!1,ticker:!1,tickerHover:!1,adaptiveHeight:!1,adaptiveHeightSpeed:500,video:!1,useCSS:!0,preloadImages:"visible",responsive:!0,slideZIndex:50,touchEnabled:!0,swipeThreshold:50,oneToOneTouch:!0,preventDefaultSwipeX:!0,preventDefaultSwipeY:!1,pager:!0,pagerType:"full",pagerShortSeparator:" / ",pagerSelector:null,buildPager:null,pagerCustom:null,controls:!0,nextText:"Next",prevText:"Prev",nextSelector:null,prevSelector:null,autoControls:!1,startText:"Start",stopText:"Stop",autoControlsCombine:!1,autoControlsSelector:null,auto:!1,pause:4e3,autoStart:!0,autoDirection:"next",autoHover:!1,autoDelay:0,minSlides:1,maxSlides:1,moveSlides:0,slideWidth:0,onSliderLoad:function(){},onSlideBefore:function(){},onSlideAfter:function(){},onSlideNext:function(){},onSlidePrev:function(){},onSliderResize:function(){}};t.fn.bxSlider=function(n){if(0==this.length)return this;if(this.length>1)return this.each(function(){t(this).bxSlider(n)}),this;var o={},r=this;e.el=this;var a=t(window).width(),l=t(window).height(),d=function(){o.settings=t.extend({},s,n),o.settings.slideWidth=parseInt(o.settings.slideWidth),o.children=r.children(o.settings.slideSelector),o.children.length<o.settings.minSlides&&(o.settings.minSlides=o.children.length),o.children.length<o.settings.maxSlides&&(o.settings.maxSlides=o.children.length),o.settings.randomStart&&(o.settings.startSlide=Math.floor(Math.random()*o.children.length)),o.active={index:o.settings.startSlide},o.carousel=o.settings.minSlides>1||o.settings.maxSlides>1,o.carousel&&(o.settings.preloadImages="all"),o.minThreshold=o.settings.minSlides*o.settings.slideWidth+(o.settings.minSlides-1)*o.settings.slideMargin,o.maxThreshold=o.settings.maxSlides*o.settings.slideWidth+(o.settings.maxSlides-1)*o.settings.slideMargin,o.working=!1,o.controls={},o.interval=null,o.animProp="vertical"==o.settings.mode?"top":"left",o.usingCSS=o.settings.useCSS&&"fade"!=o.settings.mode&&function(){var t=document.createElement("div"),e=["WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var i in e)if(void 0!==t.style[e[i]])return o.cssPrefix=e[i].replace("Perspective","").toLowerCase(),o.animProp="-"+o.cssPrefix+"-transform",!0;return!1}(),"vertical"==o.settings.mode&&(o.settings.maxSlides=o.settings.minSlides),r.data("origStyle",r.attr("style")),r.children(o.settings.slideSelector).each(function(){t(this).data("origStyle",t(this).attr("style"))}),c()},c=function(){r.wrap('<div class="bx-wrapper"><div class="bx-viewport"></div></div>'),o.viewport=r.parent(),o.loader=t('<div class="bx-loading" />'),o.viewport.prepend(o.loader),r.css({width:"horizontal"==o.settings.mode?100*o.children.length+215+"%":"auto",position:"relative"}),o.usingCSS&&o.settings.easing?r.css("-"+o.cssPrefix+"-transition-timing-function",o.settings.easing):o.settings.easing||(o.settings.easing="swing"),f(),o.viewport.css({width:"100%",overflow:"hidden",position:"relative"}),o.viewport.parent().css({maxWidth:p()}),o.settings.pager||o.viewport.parent().css({margin:"0 auto 0px"}),o.children.css({"float":"horizontal"==o.settings.mode?"left":"none",listStyle:"none",position:"relative"}),o.children.css("width",u()),"horizontal"==o.settings.mode&&o.settings.slideMargin>0&&o.children.css("marginRight",o.settings.slideMargin),"vertical"==o.settings.mode&&o.settings.slideMargin>0&&o.children.css("marginBottom",o.settings.slideMargin),"fade"==o.settings.mode&&(o.children.css({position:"absolute",zIndex:0,display:"none"}),o.children.eq(o.settings.startSlide).css({zIndex:o.settings.slideZIndex,display:"block"})),o.controls.el=t('<div class="bx-controls" />'),o.settings.captions&&P(),o.active.last=o.settings.startSlide==x()-1,o.settings.video&&r.fitVids();var e=o.children.eq(o.settings.startSlide);"all"==o.settings.preloadImages&&(e=o.children),o.settings.ticker?o.settings.pager=!1:(o.settings.pager&&T(),o.settings.controls&&C(),o.settings.auto&&o.settings.autoControls&&E(),(o.settings.controls||o.settings.autoControls||o.settings.pager)&&o.viewport.after(o.controls.el)),g(e,h)},g=function(e,i){var s=e.find("img, iframe").length;if(0==s)return i(),void 0;var n=0;e.find("img, iframe").each(function(){t(this).one("load",function(){++n==s&&i()}).each(function(){this.complete&&t(this).load()})})},h=function(){if(o.settings.infiniteLoop&&"fade"!=o.settings.mode&&!o.settings.ticker){var e="vertical"==o.settings.mode?o.settings.minSlides:o.settings.maxSlides,i=o.children.slice(0,e).clone().addClass("bx-clone"),s=o.children.slice(-e).clone().addClass("bx-clone");r.append(i).prepend(s)}o.loader.remove(),S(),"vertical"==o.settings.mode&&(o.settings.adaptiveHeight=!0),o.viewport.height(v()),r.redrawSlider(),o.settings.onSliderLoad(o.active.index),o.initialized=!0,o.settings.responsive&&t(window).bind("resize",Z),o.settings.auto&&o.settings.autoStart&&H(),o.settings.ticker&&L(),o.settings.pager&&q(o.settings.startSlide),o.settings.controls&&W(),o.settings.touchEnabled&&!o.settings.ticker&&O()},v=function(){var e=0,s=t();if("vertical"==o.settings.mode||o.settings.adaptiveHeight)if(o.carousel){var n=1==o.settings.moveSlides?o.active.index:o.active.index*m();for(s=o.children.eq(n),i=1;i<=o.settings.maxSlides-1;i++)s=n+i>=o.children.length?s.add(o.children.eq(i-1)):s.add(o.children.eq(n+i))}else s=o.children.eq(o.active.index);else s=o.children;return"vertical"==o.settings.mode?(s.each(function(){e+=t(this).outerHeight()}),o.settings.slideMargin>0&&(e+=o.settings.slideMargin*(o.settings.minSlides-1))):e=Math.max.apply(Math,s.map(function(){return t(this).outerHeight(!1)}).get()),e},p=function(){var t="100%";return o.settings.slideWidth>0&&(t="horizontal"==o.settings.mode?o.settings.maxSlides*o.settings.slideWidth+(o.settings.maxSlides-1)*o.settings.slideMargin:o.settings.slideWidth),t},u=function(){var t=o.settings.slideWidth,e=o.viewport.width();return 0==o.settings.slideWidth||o.settings.slideWidth>e&&!o.carousel||"vertical"==o.settings.mode?t=e:o.settings.maxSlides>1&&"horizontal"==o.settings.mode&&(e>o.maxThreshold||e<o.minThreshold&&(t=(e-o.settings.slideMargin*(o.settings.minSlides-1))/o.settings.minSlides)),t},f=function(){var t=1;if("horizontal"==o.settings.mode&&o.settings.slideWidth>0)if(o.viewport.width()<o.minThreshold)t=o.settings.minSlides;else if(o.viewport.width()>o.maxThreshold)t=o.settings.maxSlides;else{var e=o.children.first().width();t=Math.floor(o.viewport.width()/e)}else"vertical"==o.settings.mode&&(t=o.settings.minSlides);return t},x=function(){var t=0;if(o.settings.moveSlides>0)if(o.settings.infiniteLoop)t=o.children.length/m();else for(var e=0,i=0;e<o.children.length;)++t,e=i+f(),i+=o.settings.moveSlides<=f()?o.settings.moveSlides:f();else t=Math.ceil(o.children.length/f());return t},m=function(){return o.settings.moveSlides>0&&o.settings.moveSlides<=f()?o.settings.moveSlides:f()},S=function(){if(o.children.length>o.settings.maxSlides&&o.active.last&&!o.settings.infiniteLoop){if("horizontal"==o.settings.mode){var t=o.children.last(),e=t.position();b(-(e.left-(o.viewport.width()-t.width())),"reset",0)}else if("vertical"==o.settings.mode){var i=o.children.length-o.settings.minSlides,e=o.children.eq(i).position();b(-e.top,"reset",0)}}else{var e=o.children.eq(o.active.index*m()).position();o.active.index==x()-1&&(o.active.last=!0),void 0!=e&&("horizontal"==o.settings.mode?b(-e.left,"reset",0):"vertical"==o.settings.mode&&b(-e.top,"reset",0))}},b=function(t,e,i,s){if(o.usingCSS){var n="vertical"==o.settings.mode?"translate3d(0, "+t+"px, 0)":"translate3d("+t+"px, 0, 0)";r.css("-"+o.cssPrefix+"-transition-duration",i/1e3+"s"),"slide"==e?(r.css(o.animProp,n),r.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){r.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),D()})):"reset"==e?r.css(o.animProp,n):"ticker"==e&&(r.css("-"+o.cssPrefix+"-transition-timing-function","linear"),r.css(o.animProp,n),r.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){r.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),b(s.resetValue,"reset",0),N()}))}else{var a={};a[o.animProp]=t,"slide"==e?r.animate(a,i,o.settings.easing,function(){D()}):"reset"==e?r.css(o.animProp,t):"ticker"==e&&r.animate(a,speed,"linear",function(){b(s.resetValue,"reset",0),N()})}},w=function(){for(var e="",i=x(),s=0;i>s;s++){var n="";o.settings.buildPager&&t.isFunction(o.settings.buildPager)?(n=o.settings.buildPager(s),o.pagerEl.addClass("bx-custom-pager")):(n=s+1,o.pagerEl.addClass("bx-default-pager")),e+='<div class="bx-pager-item"><a href="" data-slide-index="'+s+'" class="bx-pager-link">'+n+"</a></div>"}o.pagerEl.html(e)},T=function(){o.settings.pagerCustom?o.pagerEl=t(o.settings.pagerCustom):(o.pagerEl=t('<div class="bx-pager" />'),o.settings.pagerSelector?t(o.settings.pagerSelector).html(o.pagerEl):o.controls.el.addClass("bx-has-pager").append(o.pagerEl),w()),o.pagerEl.on("click","a",I)},C=function(){o.controls.next=t('<a class="bx-next" href="">'+o.settings.nextText+"</a>"),o.controls.prev=t('<a class="bx-prev" href="">'+o.settings.prevText+"</a>"),o.controls.next.bind("click",y),o.controls.prev.bind("click",z),o.settings.nextSelector&&t(o.settings.nextSelector).append(o.controls.next),o.settings.prevSelector&&t(o.settings.prevSelector).append(o.controls.prev),o.settings.nextSelector||o.settings.prevSelector||(o.controls.directionEl=t('<div class="bx-controls-direction" />'),o.controls.directionEl.append(o.controls.prev).append(o.controls.next),o.controls.el.addClass("bx-has-controls-direction").append(o.controls.directionEl))},E=function(){o.controls.start=t('<div class="bx-controls-auto-item"><a class="bx-start" href="">'+o.settings.startText+"</a></div>"),o.controls.stop=t('<div class="bx-controls-auto-item"><a class="bx-stop" href="">'+o.settings.stopText+"</a></div>"),o.controls.autoEl=t('<div class="bx-controls-auto" />'),o.controls.autoEl.on("click",".bx-start",k),o.controls.autoEl.on("click",".bx-stop",M),o.settings.autoControlsCombine?o.controls.autoEl.append(o.controls.start):o.controls.autoEl.append(o.controls.start).append(o.controls.stop),o.settings.autoControlsSelector?t(o.settings.autoControlsSelector).html(o.controls.autoEl):o.controls.el.addClass("bx-has-controls-auto").append(o.controls.autoEl),A(o.settings.autoStart?"stop":"start")},P=function(){o.children.each(function(){var e=t(this).find("img:first").attr("title");void 0!=e&&(""+e).length&&t(this).append('<div class="bx-caption"><span>'+e+"</span></div>")})},y=function(t){o.settings.auto&&r.stopAuto(),r.goToNextSlide(),t.preventDefault()},z=function(t){o.settings.auto&&r.stopAuto(),r.goToPrevSlide(),t.preventDefault()},k=function(t){r.startAuto(),t.preventDefault()},M=function(t){r.stopAuto(),t.preventDefault()},I=function(e){o.settings.auto&&r.stopAuto();var i=t(e.currentTarget),s=parseInt(i.attr("data-slide-index"));s!=o.active.index&&r.goToSlide(s),e.preventDefault()},q=function(e){var i=o.children.length;return"short"==o.settings.pagerType?(o.settings.maxSlides>1&&(i=Math.ceil(o.children.length/o.settings.maxSlides)),o.pagerEl.html(e+1+o.settings.pagerShortSeparator+i),void 0):(o.pagerEl.find("a").removeClass("active"),o.pagerEl.each(function(i,s){t(s).find("a").eq(e).addClass("active")}),void 0)},D=function(){if(o.settings.infiniteLoop){var t="";0==o.active.index?t=o.children.eq(0).position():o.active.index==x()-1&&o.carousel?t=o.children.eq((x()-1)*m()).position():o.active.index==o.children.length-1&&(t=o.children.eq(o.children.length-1).position()),t&&("horizontal"==o.settings.mode?b(-t.left,"reset",0):"vertical"==o.settings.mode&&b(-t.top,"reset",0))}o.working=!1,o.settings.onSlideAfter(o.children.eq(o.active.index),o.oldIndex,o.active.index)},A=function(t){o.settings.autoControlsCombine?o.controls.autoEl.html(o.controls[t]):(o.controls.autoEl.find("a").removeClass("active"),o.controls.autoEl.find("a:not(.bx-"+t+")").addClass("active"))},W=function(){1==x()?(o.controls.prev.addClass("disabled"),o.controls.next.addClass("disabled")):!o.settings.infiniteLoop&&o.settings.hideControlOnEnd&&(0==o.active.index?(o.controls.prev.addClass("disabled"),o.controls.next.removeClass("disabled")):o.active.index==x()-1?(o.controls.next.addClass("disabled"),o.controls.prev.removeClass("disabled")):(o.controls.prev.removeClass("disabled"),o.controls.next.removeClass("disabled")))},H=function(){o.settings.autoDelay>0?setTimeout(r.startAuto,o.settings.autoDelay):r.startAuto(),o.settings.autoHover&&r.hover(function(){o.interval&&(r.stopAuto(!0),o.autoPaused=!0)},function(){o.autoPaused&&(r.startAuto(!0),o.autoPaused=null)})},L=function(){var e=0;if("next"==o.settings.autoDirection)r.append(o.children.clone().addClass("bx-clone"));else{r.prepend(o.children.clone().addClass("bx-clone"));var i=o.children.first().position();e="horizontal"==o.settings.mode?-i.left:-i.top}b(e,"reset",0),o.settings.pager=!1,o.settings.controls=!1,o.settings.autoControls=!1,o.settings.tickerHover&&!o.usingCSS&&o.viewport.hover(function(){r.stop()},function(){var e=0;o.children.each(function(){e+="horizontal"==o.settings.mode?t(this).outerWidth(!0):t(this).outerHeight(!0)});var i=o.settings.speed/e,s="horizontal"==o.settings.mode?"left":"top",n=i*(e-Math.abs(parseInt(r.css(s))));N(n)}),N()},N=function(t){speed=t?t:o.settings.speed;var e={left:0,top:0},i={left:0,top:0};"next"==o.settings.autoDirection?e=r.find(".bx-clone").first().position():i=o.children.first().position();var s="horizontal"==o.settings.mode?-e.left:-e.top,n="horizontal"==o.settings.mode?-i.left:-i.top,a={resetValue:n};b(s,"ticker",speed,a)},O=function(){o.touch={start:{x:0,y:0},end:{x:0,y:0}},o.viewport.bind("touchstart",X)},X=function(t){if(o.working)t.preventDefault();else{o.touch.originalPos=r.position();var e=t.originalEvent;o.touch.start.x=e.changedTouches[0].pageX,o.touch.start.y=e.changedTouches[0].pageY,o.viewport.bind("touchmove",Y),o.viewport.bind("touchend",V)}},Y=function(t){var e=t.originalEvent,i=Math.abs(e.changedTouches[0].pageX-o.touch.start.x),s=Math.abs(e.changedTouches[0].pageY-o.touch.start.y);if(3*i>s&&o.settings.preventDefaultSwipeX?t.preventDefault():3*s>i&&o.settings.preventDefaultSwipeY&&t.preventDefault(),"fade"!=o.settings.mode&&o.settings.oneToOneTouch){var n=0;if("horizontal"==o.settings.mode){var r=e.changedTouches[0].pageX-o.touch.start.x;n=o.touch.originalPos.left+r}else{var r=e.changedTouches[0].pageY-o.touch.start.y;n=o.touch.originalPos.top+r}b(n,"reset",0)}},V=function(t){o.viewport.unbind("touchmove",Y);var e=t.originalEvent,i=0;if(o.touch.end.x=e.changedTouches[0].pageX,o.touch.end.y=e.changedTouches[0].pageY,"fade"==o.settings.mode){var s=Math.abs(o.touch.start.x-o.touch.end.x);s>=o.settings.swipeThreshold&&(o.touch.start.x>o.touch.end.x?r.goToNextSlide():r.goToPrevSlide(),r.stopAuto())}else{var s=0;"horizontal"==o.settings.mode?(s=o.touch.end.x-o.touch.start.x,i=o.touch.originalPos.left):(s=o.touch.end.y-o.touch.start.y,i=o.touch.originalPos.top),!o.settings.infiniteLoop&&(0==o.active.index&&s>0||o.active.last&&0>s)?b(i,"reset",200):Math.abs(s)>=o.settings.swipeThreshold?(0>s?r.goToNextSlide():r.goToPrevSlide(),r.stopAuto()):b(i,"reset",200)}o.viewport.unbind("touchend",V)},Z=function(){var e=t(window).width(),i=t(window).height();(a!=e||l!=i)&&(a=e,l=i,r.redrawSlider(),o.settings.onSliderResize.call(r,o.active.index))};return r.goToSlide=function(e,i){if(!o.working&&o.active.index!=e)if(o.working=!0,o.oldIndex=o.active.index,o.active.index=0>e?x()-1:e>=x()?0:e,o.settings.onSlideBefore(o.children.eq(o.active.index),o.oldIndex,o.active.index),"next"==i?o.settings.onSlideNext(o.children.eq(o.active.index),o.oldIndex,o.active.index):"prev"==i&&o.settings.onSlidePrev(o.children.eq(o.active.index),o.oldIndex,o.active.index),o.active.last=o.active.index>=x()-1,o.settings.pager&&q(o.active.index),o.settings.controls&&W(),"fade"==o.settings.mode)o.settings.adaptiveHeight&&o.viewport.height()!=v()&&o.viewport.animate({height:v()},o.settings.adaptiveHeightSpeed),o.children.filter(":visible").fadeOut(o.settings.speed).css({zIndex:0}),o.children.eq(o.active.index).css("zIndex",o.settings.slideZIndex+1).fadeIn(o.settings.speed,function(){t(this).css("zIndex",o.settings.slideZIndex),D()});else{o.settings.adaptiveHeight&&o.viewport.height()!=v()&&o.viewport.animate({height:v()},o.settings.adaptiveHeightSpeed);var s=0,n={left:0,top:0};if(!o.settings.infiniteLoop&&o.carousel&&o.active.last)if("horizontal"==o.settings.mode){var a=o.children.eq(o.children.length-1);n=a.position(),s=o.viewport.width()-a.outerWidth()}else{var l=o.children.length-o.settings.minSlides;n=o.children.eq(l).position()}else if(o.carousel&&o.active.last&&"prev"==i){var d=1==o.settings.moveSlides?o.settings.maxSlides-m():(x()-1)*m()-(o.children.length-o.settings.maxSlides),a=r.children(".bx-clone").eq(d);n=a.position()}else if("next"==i&&0==o.active.index)n=r.find("> .bx-clone").eq(o.settings.maxSlides).position(),o.active.last=!1;else if(e>=0){var c=e*m();n=o.children.eq(c).position()}if("undefined"!=typeof n){var g="horizontal"==o.settings.mode?-(n.left-s):-n.top;b(g,"slide",o.settings.speed)}}},r.goToNextSlide=function(){if(o.settings.infiniteLoop||!o.active.last){var t=parseInt(o.active.index)+1;r.goToSlide(t,"next")}},r.goToPrevSlide=function(){if(o.settings.infiniteLoop||0!=o.active.index){var t=parseInt(o.active.index)-1;r.goToSlide(t,"prev")}},r.startAuto=function(t){o.interval||(o.interval=setInterval(function(){"next"==o.settings.autoDirection?r.goToNextSlide():r.goToPrevSlide()},o.settings.pause),o.settings.autoControls&&1!=t&&A("stop"))},r.stopAuto=function(t){o.interval&&(clearInterval(o.interval),o.interval=null,o.settings.autoControls&&1!=t&&A("start"))},r.getCurrentSlide=function(){return o.active.index},r.getCurrentSlideElement=function(){return o.children.eq(o.active.index)},r.getSlideCount=function(){return o.children.length},r.redrawSlider=function(){o.children.add(r.find(".bx-clone")).outerWidth(u()),o.viewport.css("height",v()),o.settings.ticker||S(),o.active.last&&(o.active.index=x()-1),o.active.index>=x()&&(o.active.last=!0),o.settings.pager&&!o.settings.pagerCustom&&(w(),q(o.active.index))},r.destroySlider=function(){o.initialized&&(o.initialized=!1,t(".bx-clone",this).remove(),o.children.each(function(){void 0!=t(this).data("origStyle")?t(this).attr("style",t(this).data("origStyle")):t(this).removeAttr("style")}),void 0!=t(this).data("origStyle")?this.attr("style",t(this).data("origStyle")):t(this).removeAttr("style"),t(this).unwrap().unwrap(),o.controls.el&&o.controls.el.remove(),o.controls.next&&o.controls.next.remove(),o.controls.prev&&o.controls.prev.remove(),o.pagerEl&&o.settings.controls&&o.pagerEl.remove(),t(".bx-caption",this).remove(),o.controls.autoEl&&o.controls.autoEl.remove(),clearInterval(o.interval),o.settings.responsive&&t(window).unbind("resize",Z))},r.reloadSlider=function(t){void 0!=t&&(n=t),r.destroySlider(),d()},d(),this}}(jQuery);

/*!
 *  GMAP3 Plugin for jQuery
 *  Version   : 6.0.0
 *  Date      : 2014-04-25
 *  Author    : DEMONTE Jean-Baptiste
 *  Contact   : jbdemonte@gmail.com
 *  Web site  : http://gmap3.net
 *  Licence   : GPL v3 : http://www.gnu.org/licenses/gpl.html
 *  
 *  Copyright (c) 2010-2014 Jean-Baptiste DEMONTE
 *  All rights reserved.
 */
;(function ($, undef) {

var defaults, gm,
  gId = 0,
  isFunction = $.isFunction,
  isArray = $.isArray;

function isObject(m) {
  return typeof m === "object";
}

function isString(m) {
  return typeof m === "string";
}

function isNumber(m) {
  return typeof m === "number";
}

function isUndefined(m) {
  return m === undef;
}

/**
 * Initialize default values
 * defaults are defined at first gmap3 call to pass the rails asset pipeline and jasmine while google library is not yet loaded
 */
function initDefaults() {
  gm = google.maps;
  if (!defaults) {
    defaults = {
      verbose: false,
      queryLimit: {
        attempt: 5,
        delay: 250, // setTimeout(..., delay + random);
        random: 250
      },
      classes: (function () {
        var r = {};
        $.each("Map Marker InfoWindow Circle Rectangle OverlayView StreetViewPanorama KmlLayer TrafficLayer BicyclingLayer GroundOverlay StyledMapType ImageMapType".split(" "), function (_, k) {
          r[k] = gm[k];
        });
        return r;
      }()),
      map: {
        mapTypeId : gm.MapTypeId.ROADMAP,
        center: [46.578498, 2.457275],
        zoom: 2
      },
      overlay: {
        pane: "floatPane",
        content: "",
        offset: {
          x: 0,
          y: 0
        }
      },
      geoloc: {
        getCurrentPosition: {
          maximumAge: 60000,
          timeout: 5000
        }
      }
    }
  }
}


/**
 * Generate a new ID if not defined
 * @param id {string} (optional)
 * @param simulate {boolean} (optional)
 * @returns {*}
 */
function globalId(id, simulate) {
  return isUndefined(id) ? "gmap3_" + (simulate ? gId + 1 : ++gId) : id;
}


/**
 * Return true if current version of Google Maps is equal or above to these in parameter
 * @param version {string} Minimal version required
 * @return {Boolean}
 */
function googleVersionMin(version) {
  var i,
    gmVersion = gm.version.split(".");
  version = version.split(".");
  for (i = 0; i < gmVersion.length; i++) {
    gmVersion[i] = parseInt(gmVersion[i], 10);
  }
  for (i = 0; i < version.length; i++) {
    version[i] = parseInt(version[i], 10);
    if (gmVersion.hasOwnProperty(i)) {
      if (gmVersion[i] < version[i]) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}


/**
 * attach events from a container to a sender
 * td[
 *  events => { eventName => function, }
 *  onces  => { eventName => function, }
 *  data   => mixed data
 * ]
 **/
function attachEvents($container, args, sender, id, senders) {
  var td = args.td || {},
    context = {
      id: id,
      data: td.data,
      tag: td.tag
    };
  function bind(items, handler) {
    if (items) {
      $.each(items, function (name, f) {
        var self = $container, fn = f;
        if (isArray(f)) {
          self = f[0];
          fn = f[1];
        }
        handler(sender, name, function (event) {
          fn.apply(self, [senders || sender, event, context]);
        });
      });
    }
  }
  bind(td.events, gm.event.addListener);
  bind(td.onces, gm.event.addListenerOnce);
}

/**
 * Extract keys from object
 * @param obj {object}
 * @returns {Array}
 */
function getKeys(obj) {
  var k, keys = [];
  for (k in obj) {
    if (obj.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  return keys;
}

/**
 * copy a key content
 **/
function copyKey(target, key) {
  var i,
    args = arguments;
  for (i = 2; i < args.length; i++) {
    if (key in args[i]) {
      if (args[i].hasOwnProperty(key)) {
        target[key] = args[i][key];
        return;
      }
    }
  }
}

/**
 * Build a tuple
 * @param args {object}
 * @param value {object}
 * @returns {object}
 */
function tuple(args, value) {
  var k, i,
    keys = ["data", "tag", "id", "events",  "onces"],
    td = {};

  // "copy" the common data
  if (args.td) {
    for (k in args.td) {
      if (args.td.hasOwnProperty(k)) {
        if ((k !== "options") && (k !== "values")) {
          td[k] = args.td[k];
        }
      }
    }
  }
  // "copy" some specific keys from value first else args.td
  for (i = 0; i < keys.length; i++) {
    copyKey(td, keys[i], value, args.td);
  }

  // create an extended options
  td.options = $.extend({}, args.opts || {}, value.options || {});

  return td;
}

/**
 * Log error
 */
function error() {
  if (defaults.verbose) {
    var i, err = [];
    if (window.console && (isFunction(console.error))) {
      for (i = 0; i < arguments.length; i++) {
        err.push(arguments[i]);
      }
      console.error.apply(console, err);
    } else {
      err = "";
      for (i = 0; i < arguments.length; i++) {
        err += arguments[i].toString() + " ";
      }
      alert(err);
    }
  }
}

/**
 * return true if mixed is usable as number
 **/
function numeric(mixed) {
  return (isNumber(mixed) || isString(mixed)) && mixed !== "" && !isNaN(mixed);
}

/**
 * convert data to array
 **/
function array(mixed) {
  var k, a = [];
  if (!isUndefined(mixed)) {
    if (isObject(mixed)) {
      if (isNumber(mixed.length)) {
        a = mixed;
      } else {
        for (k in mixed) {
          a.push(mixed[k]);
        }
      }
    } else {
      a.push(mixed);
    }
  }
  return a;
}

/**
 * create a function to check a tag
 */
function ftag(tag) {
  if (tag) {
    if (isFunction(tag)) {
      return tag;
    }
    tag = array(tag);
    return function (val) {
      var i;
      if (isUndefined(val)) {
        return false;
      }
      if (isObject(val)) {
        for (i = 0; i < val.length; i++) {
          if ($.inArray(val[i], tag) >= 0) {
            return true;
          }
        }
        return false;
      }
      return $.inArray(val, tag) >= 0;
    };
  }
}


/**
 * convert mixed [ lat, lng ] objet to gm.LatLng
 **/
function toLatLng(mixed, emptyReturnMixed, noFlat) {
  var empty = emptyReturnMixed ? mixed : null;
  if (!mixed || (isString(mixed))) {
    return empty;
  }
  // defined latLng
  if (mixed.latLng) {
    return toLatLng(mixed.latLng);
  }
  // gm.LatLng object
  if (mixed instanceof gm.LatLng) {
    return mixed;
  }
  // {lat:X, lng:Y} object
  if (numeric(mixed.lat)) {
    return new gm.LatLng(mixed.lat, mixed.lng);
  }
  // [X, Y] object
  if (!noFlat && isArray(mixed)) {
    if (!numeric(mixed[0]) || !numeric(mixed[1])) {
      return empty;
    }
    return new gm.LatLng(mixed[0], mixed[1]);
  }
  return empty;
}

/**
 * convert mixed [ sw, ne ] object by gm.LatLngBounds
 **/
function toLatLngBounds(mixed) {
  var ne, sw;
  if (!mixed || mixed instanceof gm.LatLngBounds) {
    return mixed || null;
  }
  if (isArray(mixed)) {
    if (mixed.length === 2) {
      ne = toLatLng(mixed[0]);
      sw = toLatLng(mixed[1]);
    } else if (mixed.length === 4) {
      ne = toLatLng([mixed[0], mixed[1]]);
      sw = toLatLng([mixed[2], mixed[3]]);
    }
  } else {
    if (("ne" in mixed) && ("sw" in mixed)) {
      ne = toLatLng(mixed.ne);
      sw = toLatLng(mixed.sw);
    } else if (("n" in mixed) && ("e" in mixed) && ("s" in mixed) && ("w" in mixed)) {
      ne = toLatLng([mixed.n, mixed.e]);
      sw = toLatLng([mixed.s, mixed.w]);
    }
  }
  if (ne && sw) {
    return new gm.LatLngBounds(sw, ne);
  }
  return null;
}

/**
 * resolveLatLng
 **/
function resolveLatLng(ctx, method, runLatLng, args, attempt) {
  var latLng = runLatLng ? toLatLng(args.td, false, true) : false,
    conf = latLng ?  {latLng: latLng} : (args.td.address ? (isString(args.td.address) ? {address: args.td.address} : args.td.address) : false),
    cache = conf ? geocoderCache.get(conf) : false,
    self = this;
  if (conf) {
    attempt = attempt || 0; // convert undefined to int
    if (cache) {
      args.latLng = cache.results[0].geometry.location;
      args.results = cache.results;
      args.status = cache.status;
      method.apply(ctx, [args]);
    } else {
      if (conf.location) {
        conf.location = toLatLng(conf.location);
      }
      if (conf.bounds) {
        conf.bounds = toLatLngBounds(conf.bounds);
      }
      geocoder().geocode(
        conf,
        function (results, status) {
          if (status === gm.GeocoderStatus.OK) {
            geocoderCache.store(conf, {results: results, status: status});
            args.latLng = results[0].geometry.location;
            args.results = results;
            args.status = status;
            method.apply(ctx, [args]);
          } else if ((status === gm.GeocoderStatus.OVER_QUERY_LIMIT) && (attempt < defaults.queryLimit.attempt)) {
            setTimeout(
              function () {
                resolveLatLng.apply(self, [ctx, method, runLatLng, args, attempt + 1]);
              },
              defaults.queryLimit.delay + Math.floor(Math.random() * defaults.queryLimit.random)
            );
          } else {
            error("geocode failed", status, conf);
            args.latLng = args.results = false;
            args.status = status;
            method.apply(ctx, [args]);
          }
        }
      );
    }
  } else {
    args.latLng = toLatLng(args.td, false, true);
    method.apply(ctx, [args]);
  }
}

function resolveAllLatLng(list, ctx, method, args) {
  var self = this, i = -1;

  function resolve() {
    // look for next address to resolve
    do {
      i++;
    } while ((i < list.length) && !("address" in list[i]));

    // no address found, so run method
    if (i >= list.length) {
      method.apply(ctx, [args]);
      return;
    }

    resolveLatLng(
      self,
      function (args) {
        delete args.td;
        $.extend(list[i], args);
        resolve.apply(self, []); // resolve next (using apply avoid too much recursion)
      },
      true,
      {td: list[i]}
    );
  }
  resolve();
}



/**
 * geolocalise the user and return a LatLng
 **/
function geoloc(ctx, method, args) {
  var is_echo = false; // sometime, a kind of echo appear, this trick will notice once the first call is run to ignore the next one
  if (navigator && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        if (!is_echo) {
          is_echo = true;
          args.latLng = new gm.LatLng(pos.coords.latitude, pos.coords.longitude);
          method.apply(ctx, [args]);
        }
      },
      function () {
        if (!is_echo) {
          is_echo = true;
          args.latLng = false;
          method.apply(ctx, [args]);
        }
      },
      args.opts.getCurrentPosition
    );
  } else {
    args.latLng = false;
    method.apply(ctx, [args]);
  }
}

/**
 * Return true if get is a direct call
 * it means :
 *   - get is the only key
 *   - get has no callback
 * @param obj {Object} The request to check
 * @return {Boolean}
 */
function isDirectGet(obj) {
  var k,
    result = false;
  if (isObject(obj) && obj.hasOwnProperty("get")) {
    for (k in obj) {
      if (k !== "get") {
        return false;
      }
    }
    result = !obj.get.hasOwnProperty("callback");
  }
  return result;
}
var services = {},
  geocoderCache = new GeocoderCache();


function geocoder(){
  if (!services.geocoder) {
    services.geocoder = new gm.Geocoder();
  }
  return services.geocoder;
}
/**
 * Class GeocoderCache
 * @constructor
 */
function GeocoderCache() {
  var cache = [];

  this.get = function (request) {
    if (cache.length) {
      var i, j, k, item, eq,
        keys = getKeys(request);
      for (i = 0; i < cache.length; i++) {
        item = cache[i];
        eq = keys.length === item.keys.length;
        for (j = 0; (j < keys.length) && eq; j++) {
          k = keys[j];
          eq = k in item.request;
          if (eq) {
            if (isObject(request[k]) && ("equals" in request[k]) && isFunction(request[k])) {
              eq = request[k].equals(item.request[k]);
            } else {
              eq = request[k] === item.request[k];
            }
          }
        }
        if (eq) {
          return item.results;
        }
      }
    }
  };

  this.store = function (request, results) {
    cache.push({request: request, keys: getKeys(request), results: results});
  };
}
/**
 * Class Stack
 * @constructor
 */
function Stack() {
  var st = [],
    self = this;

  self.empty = function () {
    return !st.length;
  };

  self.add = function (v) {
    st.push(v);
  };

  self.get = function () {
    return st.length ? st[0] : false;
  };

  self.ack = function () {
    st.shift();
  };
}
/**
 * Class Store
 * @constructor
 */
function Store() {
  var store = {}, // name => [id, ...]
    objects = {}, // id => object
    self = this;

  function normalize(res) {
    return {
      id: res.id,
      name: res.name,
      object: res.obj,
      tag: res.tag,
      data: res.data
    };
  }

  /**
   * add a mixed to the store
   **/
  self.add = function (args, name, obj, sub) {
    var td = args.td || {},
      id = globalId(td.id);
    if (!store[name]) {
      store[name] = [];
    }
    if (id in objects) { // object already exists: remove it
      self.clearById(id);
    }
    objects[id] = {obj: obj, sub: sub, name: name, id: id, tag: td.tag, data: td.data};
    store[name].push(id);
    return id;
  };

  /**
   * return a stored object by its id
   **/
  self.getById = function (id, sub, full) {
    var result = false;
    if (id in objects) {
      if (sub) {
        result = objects[id].sub;
      } else if (full) {
        result = normalize(objects[id]);
      } else {
        result = objects[id].obj;
      }
    }
    return result;
  };

  /**
   * return a stored value
   **/
  self.get = function (name, last, tag, full) {
    var n, id, check = ftag(tag);
    if (!store[name] || !store[name].length) {
      return null;
    }
    n = store[name].length;
    while (n) {
      n--;
      id = store[name][last ? n : store[name].length - n - 1];
      if (id && objects[id]) {
        if (check && !check(objects[id].tag)) {
          continue;
        }
        return full ? normalize(objects[id]) : objects[id].obj;
      }
    }
    return null;
  };

  /**
   * return all stored values
   **/
  self.all = function (name, tag, full) {
    var result = [],
      check = ftag(tag),
      find = function (n) {
        var i, id;
        for (i = 0; i < store[n].length; i++) {
          id = store[n][i];
          if (id && objects[id]) {
            if (check && !check(objects[id].tag)) {
              continue;
            }
            result.push(full ? normalize(objects[id]) : objects[id].obj);
          }
        }
      };
    if (name in store) {
      find(name);
    } else if (isUndefined(name)) { // internal use only
      for (name in store) {
        find(name);
      }
    }
    return result;
  };

  /**
   * hide and remove an object
   **/
  function rm(obj) {
    // Google maps element
    if (isFunction(obj.setMap)) {
      obj.setMap(null);
    }
    // jQuery
    if (isFunction(obj.remove)) {
      obj.remove();
    }
    // internal (cluster)
    if (isFunction(obj.free)) {
      obj.free();
    }
    obj = null;
  }

  /**
   * remove one object from the store
   **/
  self.rm = function (name, check, pop) {
    var idx, id;
    if (!store[name]) {
      return false;
    }
    if (check) {
      if (pop) {
        for (idx = store[name].length - 1; idx >= 0; idx--) {
          id = store[name][idx];
          if (check(objects[id].tag)) {
            break;
          }
        }
      } else {
        for (idx = 0; idx < store[name].length; idx++) {
          id = store[name][idx];
          if (check(objects[id].tag)) {
            break;
          }
        }
      }
    } else {
      idx = pop ? store[name].length - 1 : 0;
    }
    if (!(idx in store[name])) {
      return false;
    }
    return self.clearById(store[name][idx], idx);
  };

  /**
   * remove object from the store by its id
   **/
  self.clearById = function (id, idx) {
    if (id in objects) {
      var i, name = objects[id].name;
      for (i = 0; isUndefined(idx) && i < store[name].length; i++) {
        if (id === store[name][i]) {
          idx = i;
        }
      }
      rm(objects[id].obj);
      if (objects[id].sub) {
        rm(objects[id].sub);
      }
      delete objects[id];
      store[name].splice(idx, 1);
      return true;
    }
    return false;
  };

  /**
   * return an object from a container object in the store by its id
   * ! for now, only cluster manage this feature
   **/
  self.objGetById = function (id) {
    var result, idx;
    if (store.clusterer) {
      for (idx in store.clusterer) {
        if ((result = objects[store.clusterer[idx]].obj.getById(id)) !== false) {
          return result;
        }
      }
    }
    return false;
  };

  /**
   * remove object from a container object in the store by its id
   * ! for now, only cluster manage this feature
   **/
  self.objClearById = function (id) {
    var idx;
    if (store.clusterer) {
      for (idx in store.clusterer) {
        if (objects[store.clusterer[idx]].obj.clearById(id)) {
          return true;
        }
      }
    }
    return null;
  };

  /**
   * remove objects from the store
   **/
  self.clear = function (list, last, first, tag) {
    var k, i, name,
      check = ftag(tag);
    if (!list || !list.length) {
      list = [];
      for (k in store) {
        list.push(k);
      }
    } else {
      list = array(list);
    }
    for (i = 0; i < list.length; i++) {
      name = list[i];
      if (last) {
        self.rm(name, check, true);
      } else if (first) {
        self.rm(name, check, false);
      } else { // all
        while (self.rm(name, check, false)) {
        }
      }
    }
  };

  /**
   * remove object from a container object in the store by its tags
   * ! for now, only cluster manage this feature
   **/
  self.objClear = function (list, last, first, tag) {
    var idx;
    if (store.clusterer && ($.inArray("marker", list) >= 0 || !list.length)) {
      for (idx in store.clusterer) {
        objects[store.clusterer[idx]].obj.clear(last, first, tag);
      }
    }
  };
}
/**
 * Class Task
 * @param ctx
 * @param onEnd
 * @param td
 * @constructor
 */
function Task(ctx, onEnd, td) {
  var session = {},
    self = this,
    current,
    resolve = {
      latLng: { // function => bool (=> address = latLng)
        map: false,
        marker: false,
        infowindow: false,
        circle: false,
        overlay: false,
        getlatlng: false,
        getmaxzoom: false,
        getelevation: false,
        streetviewpanorama: false,
        getaddress: true
      },
      geoloc: {
        getgeoloc: true
      }
    };

  function unify(td) {
    var result = {};
    result[td] = {};
    return result;
  }

  if (isString(td)) {
    td =  unify(td);
  }

  function next() {
    var k;
    for (k in td) {
      if (td.hasOwnProperty(k) && !session.hasOwnProperty(k)) {
        return k;
      }
    }
  }

  self.run = function () {
    var k, opts;
    while (k = next()) {
      if (isFunction(ctx[k])) {
        current = k;
        opts = $.extend(true, {}, defaults[k] || {}, td[k].options || {});
        if (k in resolve.latLng) {
          if (td[k].values) {
            resolveAllLatLng(td[k].values, ctx, ctx[k], {td: td[k], opts: opts, session: session});
          } else {
            resolveLatLng(ctx, ctx[k], resolve.latLng[k], {td: td[k], opts: opts, session: session});
          }
        } else if (k in resolve.geoloc) {
          geoloc(ctx, ctx[k], {td: td[k], opts: opts, session: session});
        } else {
          ctx[k].apply(ctx, [{td: td[k], opts: opts, session: session}]);
        }
        return; // wait until ack
      } else {
        session[k] = null;
      }
    }
    onEnd.apply(ctx, [td, session]);
  };

  self.ack = function(result){
    session[current] = result;
    self.run.apply(self, []);
  };
}

function directionsService(){
  if (!services.ds) {
    services.ds = new gm.DirectionsService();
  }
  return services.ds;
}

function distanceMatrixService() {
  if (!services.dms) {
    services.dms = new gm.DistanceMatrixService();
  }
  return services.dms;
}

function maxZoomService() {
  if (!services.mzs) {
    services.mzs = new gm.MaxZoomService();
  }
  return services.mzs;
}

function elevationService() {
  if (!services.es) {
    services.es = new gm.ElevationService();
  }
  return services.es;
}

  /**
   * Usefull to get a projection
   * => done in a function, to let dead-code analyser works without google library loaded
   **/
  function newEmptyOverlay(map, radius) {
    function Overlay() {
      var self = this;
      self.onAdd = function () {};
      self.onRemove = function () {};
      self.draw = function () {};
      return defaults.classes.OverlayView.apply(self, []);
    }
    Overlay.prototype = defaults.classes.OverlayView.prototype;
    var obj = new Overlay();
    obj.setMap(map);
    return obj;
  }

/**
 * Class InternalClusterer
 * This class manage clusters thanks to "td" objects
 *
 * Note:
 * Individuals marker are created on the fly thanks to the td objects, they are
 * first set to null to keep the indexes synchronised with the td list
 * This is the "display" function, set by the gmap3 object, which uses theses data
 * to create markers when clusters are not required
 * To remove a marker, the objects are deleted and set not null in arrays
 *    markers[key]
 *      = null : marker exist but has not been displayed yet
 *      = false : marker has been removed
 **/
function InternalClusterer($container, map, raw) {
  var timer, projection,
    ffilter, fdisplay, ferror, // callback function
    updating = false,
    updated = false,
    redrawing = false,
    ready = false,
    enabled = true,
    self = this,
    events =  [],
    store = {},   // combin of index (id1-id2-...) => object
    ids = {},     // unique id => index
    idxs = {},    // index => unique id
    markers = [], // index => marker
    tds = [],   // index => td or null if removed
    values = [],  // index => value
    overlay = newEmptyOverlay(map, raw.radius);

  main();

  function prepareMarker(index) {
    if (!markers[index]) {
      delete tds[index].options.map;
      markers[index] = new defaults.classes.Marker(tds[index].options);
      attachEvents($container, {td: tds[index]}, markers[index], tds[index].id);
    }
  }

  /**
   * return a marker by its id, null if not yet displayed and false if no exist or removed
   **/
  self.getById = function (id) {
    if (id in ids) {
      prepareMarker(ids[id]);
      return  markers[ids[id]];
    }
    return false;
  };

  /**
   * remove one object from the store
   **/
  self.rm = function (id) {
    var index = ids[id];
    if (markers[index]) { // can be null
      markers[index].setMap(null);
    }
    delete markers[index];
    markers[index] = false;

    delete tds[index];
    tds[index] = false;

    delete values[index];
    values[index] = false;

    delete ids[id];
    delete idxs[index];
    updated = true;
  };

  /**
   * remove a marker by its id
   **/
  self.clearById = function (id) {
    if (id in ids){
      self.rm(id);
      return true;
    }
  };

  /**
   * remove objects from the store
   **/
  self.clear = function (last, first, tag) {
    var start, stop, step, index, i,
      list = [],
      check = ftag(tag);
    if (last) {
      start = tds.length - 1;
      stop = -1;
      step = -1;
    } else {
      start = 0;
      stop =  tds.length;
      step = 1;
    }
    for (index = start; index !== stop; index += step) {
      if (tds[index]) {
        if (!check || check(tds[index].tag)) {
          list.push(idxs[index]);
          if (first || last) {
            break;
          }
        }
      }
    }
    for (i = 0; i < list.length; i++) {
      self.rm(list[i]);
    }
  };

  // add a "marker td" to the cluster
  self.add = function (td, value) {
    td.id = globalId(td.id);
    self.clearById(td.id);
    ids[td.id] = markers.length;
    idxs[markers.length] = td.id;
    markers.push(null); // null = marker not yet created / displayed
    tds.push(td);
    values.push(value);
    updated = true;
  };

  // add a real marker to the cluster
  self.addMarker = function (marker, td) {
    td = td || {};
    td.id = globalId(td.id);
    self.clearById(td.id);
    if (!td.options) {
      td.options = {};
    }
    td.options.position = marker.getPosition();
    attachEvents($container, {td: td}, marker, td.id);
    ids[td.id] = markers.length;
    idxs[markers.length] = td.id;
    markers.push(marker);
    tds.push(td);
    values.push(td.data || {});
    updated = true;
  };

  // return a "marker td" by its index
  self.td = function (index) {
    return tds[index];
  };

  // return a "marker value" by its index
  self.value = function (index) {
    return values[index];
  };

  // return a marker by its index
  self.marker = function (index) {
    if (index in markers) {
      prepareMarker(index);
      return  markers[index];
    }
    return false;
  };

  // return a marker by its index
  self.markerIsSet = function (index) {
    return Boolean(markers[index]);
  };

  // store a new marker instead if the default "false"
  self.setMarker = function (index, marker) {
    markers[index] = marker;
  };

  // link the visible overlay to the logical data (to hide overlays later)
  self.store = function (cluster, obj, shadow) {
    store[cluster.ref] = {obj: obj, shadow: shadow};
  };

  // free all objects
  self.free = function () {
    var i;
    for(i = 0; i < events.length; i++) {
      gm.event.removeListener(events[i]);
    }
    events = [];

    $.each(store, function (key) {
      flush(key);
    });
    store = {};

    $.each(tds, function (i) {
      tds[i] = null;
    });
    tds = [];

    $.each(markers, function (i) {
      if (markers[i]) { // false = removed
        markers[i].setMap(null);
        delete markers[i];
      }
    });
    markers = [];

    $.each(values, function (i) {
      delete values[i];
    });
    values = [];

    ids = {};
    idxs = {};
  };

  // link the display function
  self.filter = function (f) {
    ffilter = f;
    redraw();
  };

  // enable/disable the clustering feature
  self.enable = function (value) {
    if (enabled !== value) {
      enabled = value;
      redraw();
    }
  };

  // link the display function
  self.display = function (f) {
    fdisplay = f;
  };

  // link the errorfunction
  self.error = function (f) {
    ferror = f;
  };

  // lock the redraw
  self.beginUpdate = function () {
    updating = true;
  };

  // unlock the redraw
  self.endUpdate = function () {
    updating = false;
    if (updated) {
      redraw();
    }
  };

  // extends current bounds with internal markers
  self.autofit = function (bounds) {
    var i;
    for (i = 0; i < tds.length; i++) {
      if (tds[i]) {
        bounds.extend(tds[i].options.position);
      }
    }
  };

  // bind events
  function main() {
    projection = overlay.getProjection();
    if (!projection) {
      setTimeout(function () { main.apply(self, []); }, 25);
      return;
    }
    ready = true;
    events.push(gm.event.addListener(map, "zoom_changed", delayRedraw));
    events.push(gm.event.addListener(map, "bounds_changed", delayRedraw));
    redraw();
  }

  // flush overlays
  function flush(key) {
    if (isObject(store[key])) { // is overlay
      if (isFunction(store[key].obj.setMap)) {
        store[key].obj.setMap(null);
      }
      if (isFunction(store[key].obj.remove)) {
        store[key].obj.remove();
      }
      if (isFunction(store[key].shadow.remove)) {
        store[key].obj.remove();
      }
      if (isFunction(store[key].shadow.setMap)) {
        store[key].shadow.setMap(null);
      }
      delete store[key].obj;
      delete store[key].shadow;
    } else if (markers[key]) { // marker not removed
      markers[key].setMap(null);
      // don't remove the marker object, it may be displayed later
    }
    delete store[key];
  }

  /**
   * return the distance between 2 latLng couple into meters
   * Params :
   *  Lat1, Lng1, Lat2, Lng2
   *  LatLng1, Lat2, Lng2
   *  Lat1, Lng1, LatLng2
   *  LatLng1, LatLng2
   **/
  function distanceInMeter() {
    var lat1, lat2, lng1, lng2, e, f, g, h,
      cos = Math.cos,
      sin = Math.sin,
      args = arguments;
    if (args[0] instanceof gm.LatLng) {
      lat1 = args[0].lat();
      lng1 = args[0].lng();
      if (args[1] instanceof gm.LatLng) {
        lat2 = args[1].lat();
        lng2 = args[1].lng();
      } else {
        lat2 = args[1];
        lng2 = args[2];
      }
    } else {
      lat1 = args[0];
      lng1 = args[1];
      if (args[2] instanceof gm.LatLng) {
        lat2 = args[2].lat();
        lng2 = args[2].lng();
      } else {
        lat2 = args[2];
        lng2 = args[3];
      }
    }
    e = Math.PI * lat1 / 180;
    f = Math.PI * lng1 / 180;
    g = Math.PI * lat2 / 180;
    h = Math.PI * lng2 / 180;
    return 1000 * 6371 * Math.acos(Math.min(cos(e) * cos(g) * cos(f) * cos(h) + cos(e) * sin(f) * cos(g) * sin(h) + sin(e) * sin(g), 1));
  }

  // extend the visible bounds
  function extendsMapBounds() {
    var radius = distanceInMeter(map.getCenter(), map.getBounds().getNorthEast()),
      circle = new gm.Circle({
        center: map.getCenter(),
        radius: 1.25 * radius // + 25%
      });
    return circle.getBounds();
  }

  // return an object where keys are store keys
  function getStoreKeys() {
    var k,
      keys = {};
    for (k in store) {
      keys[k] = true;
    }
    return keys;
  }

  // async the delay function
  function delayRedraw() {
    clearTimeout(timer);
    timer = setTimeout(redraw, 25);
  }

  // generate bounds extended by radius
  function extendsBounds(latLng) {
    var p = projection.fromLatLngToDivPixel(latLng),
      ne = projection.fromDivPixelToLatLng(new gm.Point(p.x + raw.radius, p.y - raw.radius)),
      sw = projection.fromDivPixelToLatLng(new gm.Point(p.x - raw.radius, p.y + raw.radius));
    return new gm.LatLngBounds(sw, ne);
  }

  // run the clustering process and call the display function
  function redraw() {
    if (updating || redrawing || !ready) {
      return;
    }

    var i, j, k, indexes, check = false, bounds, cluster, position, previous, lat, lng, loop,
      keys = [],
      used = {},
      zoom = map.getZoom(),
      forceDisabled = ("maxZoom" in raw) && (zoom > raw.maxZoom),
      previousKeys = getStoreKeys();

    // reset flag
    updated = false;

    if (zoom > 3) {
      // extend the bounds of the visible map to manage clusters near the boundaries
      bounds = extendsMapBounds();

      // check contain only if boundaries are valid
      check = bounds.getSouthWest().lng() < bounds.getNorthEast().lng();
    }

    // calculate positions of "visibles" markers (in extended bounds)
    for (i = 0; i < tds.length; i++) {
      if (tds[i] && (!check || bounds.contains(tds[i].options.position)) && (!ffilter || ffilter(values[i]))) {
        keys.push(i);
      }
    }

    // for each "visible" marker, search its neighbors to create a cluster
    // we can't do a classical "for" loop, because, analysis can bypass a marker while focusing on cluster
    while (1) {
      i = 0;
      while (used[i] && (i < keys.length)) { // look for the next marker not used
        i++;
      }
      if (i === keys.length) {
        break;
      }

      indexes = [];

      if (enabled && !forceDisabled) {
        loop = 10;
        do {
          previous = indexes;
          indexes = [];
          loop--;

          if (previous.length) {
            position = bounds.getCenter();
          } else {
            position = tds[keys[i]].options.position;
          }
          bounds = extendsBounds(position);

          for (j = i; j < keys.length; j++) {
            if (used[j]) {
              continue;
            }
            if (bounds.contains(tds[keys[j]].options.position)) {
              indexes.push(j);
            }
          }
        } while ((previous.length < indexes.length) && (indexes.length > 1) && loop);
      } else {
        for (j = i; j < keys.length; j++) {
          if (!used[j]) {
            indexes.push(j);
            break;
          }
        }
      }

      cluster = {indexes: [], ref: []};
      lat = lng = 0;
      for (k = 0; k < indexes.length; k++) {
        used[indexes[k]] = true;
        cluster.indexes.push(keys[indexes[k]]);
        cluster.ref.push(keys[indexes[k]]);
        lat += tds[keys[indexes[k]]].options.position.lat();
        lng += tds[keys[indexes[k]]].options.position.lng();
      }
      lat /= indexes.length;
      lng /= indexes.length;
      cluster.latLng = new gm.LatLng(lat, lng);

      cluster.ref = cluster.ref.join("-");

      if (cluster.ref in previousKeys) { // cluster doesn't change
        delete previousKeys[cluster.ref]; // remove this entry, these still in this array will be removed
      } else { // cluster is new
        if (indexes.length === 1) { // alone markers are not stored, so need to keep the key (else, will be displayed every time and marker will blink)
          store[cluster.ref] = true;
        }
        fdisplay(cluster);
      }
    }

    // flush the previous overlays which are not still used
    $.each(previousKeys, function (key) {
      flush(key);
    });
    redrawing = false;
  }
}
/**
 * Class Clusterer
 * a facade with limited method for external use
 **/
function Clusterer(id, internalClusterer) {
  var self = this;
  self.id = function () {
    return id;
  };
  self.filter = function (f) {
    internalClusterer.filter(f);
  };
  self.enable = function () {
    internalClusterer.enable(true);
  };
  self.disable = function () {
    internalClusterer.enable(false);
  };
  self.add = function (marker, td, lock) {
    if (!lock) {
      internalClusterer.beginUpdate();
    }
    internalClusterer.addMarker(marker, td);
    if (!lock) {
      internalClusterer.endUpdate();
    }
  };
  self.getById = function (id) {
    return internalClusterer.getById(id);
  };
  self.clearById = function (id, lock) {
    var result;
    if (!lock) {
      internalClusterer.beginUpdate();
    }
    result = internalClusterer.clearById(id);
    if (!lock) {
      internalClusterer.endUpdate();
    }
    return result;
  };
  self.clear = function (last, first, tag, lock) {
    if (!lock) {
      internalClusterer.beginUpdate();
    }
    internalClusterer.clear(last, first, tag);
    if (!lock) {
      internalClusterer.endUpdate();
    }
  };
}

/**
 * Class OverlayView
 * @constructor
 */
function OverlayView(map, opts, latLng, $div) {
  var self = this,
    listeners = [];

  defaults.classes.OverlayView.call(self);
  self.setMap(map);

  self.onAdd = function () {
    var panes = self.getPanes();
    if (opts.pane in panes) {
      $(panes[opts.pane]).append($div);
    }
    $.each("dblclick click mouseover mousemove mouseout mouseup mousedown".split(" "), function (i, name) {
      listeners.push(
        gm.event.addDomListener($div[0], name, function (e) {
          $.Event(e).stopPropagation();
          gm.event.trigger(self, name, [e]);
          self.draw();
        })
      );
    });
    listeners.push(
      gm.event.addDomListener($div[0], "contextmenu", function (e) {
        $.Event(e).stopPropagation();
        gm.event.trigger(self, "rightclick", [e]);
        self.draw();
      })
    );
  };

  self.getPosition = function () {
    return latLng;
  };

  self.setPosition = function (newLatLng) {
    latLng = newLatLng;
    self.draw();
  };

  self.draw = function () {
    var ps = self.getProjection().fromLatLngToDivPixel(latLng);
    $div
      .css("left", (ps.x + opts.offset.x) + "px")
      .css("top", (ps.y + opts.offset.y) + "px");
  };

  self.onRemove = function () {
    var i;
    for (i = 0; i < listeners.length; i++) {
      gm.event.removeListener(listeners[i]);
    }
    $div.remove();
  };

  self.hide = function () {
    $div.hide();
  };

  self.show = function () {
    $div.show();
  };

  self.toggle = function () {
    if ($div) {
      if ($div.is(":visible")) {
        self.show();
      } else {
        self.hide();
      }
    }
  };

  self.toggleDOM = function () {
    self.setMap(self.getMap() ? null : map);
  };

  self.getDOMElement = function () {
    return $div[0];
  };
}

function Gmap3($this) {
  var self = this,
    stack = new Stack(),
    store = new Store(),
    map = null,
    task;

  /**
   * if not running, start next action in stack
   **/
  function run() {
    if (!task && (task = stack.get())) {
      task.run();
    }
  }

  /**
   * called when action in finished, to acknoledge the current in stack and start next one
   **/
  function end() {
    task = null;
    stack.ack();
    run.call(self); // restart to high level scope
  }

//-----------------------------------------------------------------------//
// Tools
//-----------------------------------------------------------------------//

  /**
   * execute callback functions
   **/
  function callback(args) {
    var params,
      cb = args.td.callback;
    if (cb) {
      params = Array.prototype.slice.call(arguments, 1);
      if (isFunction(cb)) {
        cb.apply($this, params);
      } else if (isArray(cb)) {
        if (isFunction(cb[1])) {
          cb[1].apply(cb[0], params);
        }
      }
    }
  }

  /**
   * execute ending functions
   **/
  function manageEnd(args, obj, id) {
    if (id) {
      attachEvents($this, args, obj, id);
    }
    callback(args, obj);
    task.ack(obj);
  }

  /**
   * initialize the map if not yet initialized
   **/
  function newMap(latLng, args) {
    args = args || {};
    var opts = args.td && args.td.options ? args.td.options : 0;
    if (map) {
      if (opts) {
        if (opts.center) {
          opts.center = toLatLng(opts.center);
        }
        map.setOptions(opts);
      }
    } else {
      opts = args.opts || $.extend(true, {}, defaults.map, opts || {});
      opts.center = latLng || toLatLng(opts.center);
      map = new defaults.classes.Map($this.get(0), opts);
    }
  }

  /**
   * store actions to execute in a stack manager
   **/
  self._plan = function (list) {
    var k;
    for (k = 0; k < list.length; k++) {
      stack.add(new Task(self, end, list[k]));
    }
    run();
  };

  /**
   * Initialize gm.Map object
   **/
  self.map = function (args) {
    newMap(args.latLng, args);
    attachEvents($this, args, map);
    manageEnd(args, map);
  };

  /**
   * destroy an existing instance
   **/
  self.destroy = function (args) {
    store.clear();
    $this.empty();
    if (map) {
      map = null;
    }
    manageEnd(args, true);
  };

  /**
   * add an overlay
   **/
  self.overlay = function (args, internal) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.td.values = [{latLng: args.latLng, options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    if (!OverlayView.__initialised) {
      OverlayView.prototype = new defaults.classes.OverlayView();
      OverlayView.__initialised = true;
    }
    $.each(args.td.values, function (i, value) {
      var id, obj, td = tuple(args, value),
        $div = $(document.createElement("div")).css({
          border: "none",
          borderWidth: 0,
          position: "absolute"
        });
      $div.append(td.options.content);
      obj = new OverlayView(map, td.options, toLatLng(td) || toLatLng(value), $div);
      objs.push(obj);
      $div = null; // memory leak
      if (!internal) {
        id = store.add(args, "overlay", obj);
        attachEvents($this, {td: td}, obj, id);
      }
    });
    if (internal) {
      return objs[0];
    }
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * Create an InternalClusterer object
   **/
  function createClusterer(raw) {
    var internalClusterer = new InternalClusterer($this, map, raw),
      td = {},
      styles = {},
      thresholds = [],
      isInt = /^[0-9]+$/,
      calculator,
      k;

    for (k in raw) {
      if (isInt.test(k)) {
        thresholds.push(1 * k); // cast to int
        styles[k] = raw[k];
        styles[k].width = styles[k].width || 0;
        styles[k].height = styles[k].height || 0;
      } else {
        td[k] = raw[k];
      }
    }
    thresholds.sort(function (a, b) { return a > b; });

    // external calculator
    if (td.calculator) {
      calculator = function (indexes) {
        var data = [];
        $.each(indexes, function (i, index) {
          data.push(internalClusterer.value(index));
        });
        return td.calculator.apply($this, [data]);
      };
    } else {
      calculator = function (indexes) {
        return indexes.length;
      };
    }

    // set error function
    internalClusterer.error(function () {
      error.apply(self, arguments);
    });

    // set display function
    internalClusterer.display(function (cluster) {
      var i, style, atd, obj, offset, shadow,
        cnt = calculator(cluster.indexes);

      // look for the style to use
      if (raw.force || cnt > 1) {
        for (i = 0; i < thresholds.length; i++) {
          if (thresholds[i] <= cnt) {
            style = styles[thresholds[i]];
          }
        }
      }

      if (style) {
        offset = style.offset || [-style.width/2, -style.height/2];
        // create a custom overlay command
        // nb: 2 extends are faster self a deeper extend
        atd = $.extend({}, td);
        atd.options = $.extend({
            pane: "overlayLayer",
            content: style.content ? style.content.replace("CLUSTER_COUNT", cnt) : "",
            offset: {
              x: ("x" in offset ? offset.x : offset[0]) || 0,
              y: ("y" in offset ? offset.y : offset[1]) || 0
            }
          },
          td.options || {});

        obj = self.overlay({td: atd, opts: atd.options, latLng: toLatLng(cluster)}, true);

        atd.options.pane = "floatShadow";
        atd.options.content = $(document.createElement("div")).width(style.width + "px").height(style.height + "px").css({cursor: "pointer"});
        shadow = self.overlay({td: atd, opts: atd.options, latLng: toLatLng(cluster)}, true);

        // store data to the clusterer
        td.data = {
          latLng: toLatLng(cluster),
          markers:[]
        };
        $.each(cluster.indexes, function(i, index){
          td.data.markers.push(internalClusterer.value(index));
          if (internalClusterer.markerIsSet(index)){
            internalClusterer.marker(index).setMap(null);
          }
        });
        attachEvents($this, {td: td}, shadow, undef, {main: obj, shadow: shadow});
        internalClusterer.store(cluster, obj, shadow);
      } else {
        $.each(cluster.indexes, function (i, index) {
          internalClusterer.marker(index).setMap(map);
        });
      }
    });

    return internalClusterer;
  }

  /**
   *  add a marker
   **/
  self.marker = function (args) {
    var objs,
      clusterer, internalClusterer,
      multiple = "values" in args.td,
      init = !map;
    if (!multiple) {
      args.opts.position = args.latLng || toLatLng(args.opts.position);
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    if (init) {
      newMap();
    }
    if (args.td.cluster && !map.getBounds()) { // map not initialised => bounds not available : wait for map if clustering feature is required
      gm.event.addListenerOnce(map, "bounds_changed", function () { self.marker.apply(self, [args]); });
      return;
    }
    if (args.td.cluster) {
      if (args.td.cluster instanceof Clusterer) {
        clusterer = args.td.cluster;
        internalClusterer = store.getById(clusterer.id(), true);
      } else {
        internalClusterer = createClusterer(args.td.cluster);
        clusterer = new Clusterer(globalId(args.td.id, true), internalClusterer);
        store.add(args, "clusterer", clusterer, internalClusterer);
      }
      internalClusterer.beginUpdate();

      $.each(args.td.values, function (i, value) {
        var td = tuple(args, value);
        td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value);
        if (td.options.position) {
          td.options.map = map;
          if (init) {
            map.setCenter(td.options.position);
            init = false;
          }
          internalClusterer.add(td, value);
        }
      });

      internalClusterer.endUpdate();
      manageEnd(args, clusterer);

    } else {
      objs = [];
      $.each(args.td.values, function (i, value) {
        var id, obj,
          td = tuple(args, value);
        td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value);
        if (td.options.position) {
          td.options.map = map;
          if (init) {
            map.setCenter(td.options.position);
            init = false;
          }
          obj = new defaults.classes.Marker(td.options);
          objs.push(obj);
          id = store.add({td: td}, "marker", obj);
          attachEvents($this, {td: td}, obj, id);
        }
      });
      manageEnd(args, multiple ? objs : objs[0]);
    }
  };

  /**
   * return a route
   **/
  self.getroute = function (args) {
    args.opts.origin = toLatLng(args.opts.origin, true);
    args.opts.destination = toLatLng(args.opts.destination, true);
    directionsService().route(
      args.opts,
      function (results, status) {
        callback(args, status === gm.DirectionsStatus.OK ? results : false, status);
        task.ack();
      }
    );
  };

  /**
   * return the distance between an origin and a destination
   *
   **/
  self.getdistance = function (args) {
    var i;
    args.opts.origins = array(args.opts.origins);
    for (i = 0; i < args.opts.origins.length; i++) {
      args.opts.origins[i] = toLatLng(args.opts.origins[i], true);
    }
    args.opts.destinations = array(args.opts.destinations);
    for (i = 0; i < args.opts.destinations.length; i++) {
      args.opts.destinations[i] = toLatLng(args.opts.destinations[i], true);
    }
    distanceMatrixService().getDistanceMatrix(
      args.opts,
      function (results, status) {
        callback(args, status === gm.DistanceMatrixStatus.OK ? results : false, status);
        task.ack();
      }
    );
  };

  /**
   * add an infowindow
   **/
  self.infowindow = function (args) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      if (args.latLng) {
        args.opts.position = args.latLng;
      }
      args.td.values = [{options: args.opts}];
    }
    $.each(args.td.values, function (i, value) {
      var id, obj,
        td = tuple(args, value);
      td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value.latLng);
      if (!map) {
        newMap(td.options.position);
      }
      obj = new defaults.classes.InfoWindow(td.options);
      if (obj && (isUndefined(td.open) || td.open)) {
        if (multiple) {
          obj.open(map, td.anchor || undef);
        } else {
          obj.open(map, td.anchor || (args.latLng ? undef : (args.session.marker ? args.session.marker : undef)));
        }
      }
      objs.push(obj);
      id = store.add({td: td}, "infowindow", obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * add a circle
   **/
  self.circle = function (args) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.opts.center = args.latLng || toLatLng(args.opts.center);
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    $.each(args.td.values, function (i, value) {
      var id, obj,
        td = tuple(args, value);
      td.options.center = td.options.center ? toLatLng(td.options.center) : toLatLng(value);
      if (!map) {
        newMap(td.options.center);
      }
      td.options.map = map;
      obj = new defaults.classes.Circle(td.options);
      objs.push(obj);
      id = store.add({td: td}, "circle", obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * returns address structure from latlng
   **/
  self.getaddress = function (args) {
    callback(args, args.results, args.status);
    task.ack();
  };

  /**
   * returns latlng from an address
   **/
  self.getlatlng = function (args) {
    callback(args, args.results, args.status);
    task.ack();
  };

  /**
   * return the max zoom of a location
   **/
  self.getmaxzoom = function (args) {
    maxZoomService().getMaxZoomAtLatLng(
      args.latLng,
      function (result) {
        callback(args, result.status === gm.MaxZoomStatus.OK ? result.zoom : false, status);
        task.ack();
      }
    );
  };

  /**
   * return the elevation of a location
   **/
  self.getelevation = function (args) {
    var i,
      locations = [],
      f = function (results, status) {
        callback(args, status === gm.ElevationStatus.OK ? results : false, status);
        task.ack();
      };

    if (args.latLng) {
      locations.push(args.latLng);
    } else {
      locations = array(args.td.locations || []);
      for (i = 0; i < locations.length; i++) {
        locations[i] = toLatLng(locations[i]);
      }
    }
    if (locations.length) {
      elevationService().getElevationForLocations({locations: locations}, f);
    } else {
      if (args.td.path && args.td.path.length) {
        for (i = 0; i < args.td.path.length; i++) {
          locations.push(toLatLng(args.td.path[i]));
        }
      }
      if (locations.length) {
        elevationService().getElevationAlongPath({path: locations, samples:args.td.samples}, f);
      } else {
        task.ack();
      }
    }
  };

  /**
   * define defaults values
   **/
  self.defaults = function (args) {
    $.each(args.td, function(name, value) {
      if (isObject(defaults[name])) {
        defaults[name] = $.extend({}, defaults[name], value);
      } else {
        defaults[name] = value;
      }
    });
    task.ack(true);
  };

  /**
   * add a rectangle
   **/
  self.rectangle = function (args) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    $.each(args.td.values, function (i, value) {
      var id, obj,
        td = tuple(args, value);
      td.options.bounds = td.options.bounds ? toLatLngBounds(td.options.bounds) : toLatLngBounds(value);
      if (!map) {
        newMap(td.options.bounds.getCenter());
      }
      td.options.map = map;

      obj = new defaults.classes.Rectangle(td.options);
      objs.push(obj);
      id = store.add({td: td}, "rectangle", obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * add a polygone / polyline
   **/
  function poly(args, poly, path) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    newMap();
    $.each(args.td.values, function (_, value) {
      var id, i, j, obj,
        td = tuple(args, value);
      if (td.options[path]) {
        if (td.options[path][0][0] && isArray(td.options[path][0][0])) {
          for (i = 0; i < td.options[path].length; i++) {
            for (j = 0; j < td.options[path][i].length; j++) {
              td.options[path][i][j] = toLatLng(td.options[path][i][j]);
            }
          }
        } else {
          for (i = 0; i < td.options[path].length; i++) {
            td.options[path][i] = toLatLng(td.options[path][i]);
          }
        }
      }
      td.options.map = map;
      obj = new gm[poly](td.options);
      objs.push(obj);
      id = store.add({td: td}, poly.toLowerCase(), obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  }

  self.polyline = function (args) {
    poly(args, "Polyline", "path");
  };

  self.polygon = function (args) {
    poly(args, "Polygon", "paths");
  };

  /**
   * add a traffic layer
   **/
  self.trafficlayer = function (args) {
    newMap();
    var obj = store.get("trafficlayer");
    if (!obj) {
      obj = new defaults.classes.TrafficLayer();
      obj.setMap(map);
      store.add(args, "trafficlayer", obj);
    }
    manageEnd(args, obj);
  };

  /**
   * add a bicycling layer
   **/
  self.bicyclinglayer = function (args) {
    newMap();
    var obj = store.get("bicyclinglayer");
    if (!obj) {
      obj = new defaults.classes.BicyclingLayer();
      obj.setMap(map);
      store.add(args, "bicyclinglayer", obj);
    }
    manageEnd(args, obj);
  };

  /**
   * add a ground overlay
   **/
  self.groundoverlay = function (args) {
    args.opts.bounds = toLatLngBounds(args.opts.bounds);
    if (args.opts.bounds){
      newMap(args.opts.bounds.getCenter());
    }
    var id,
      obj = new defaults.classes.GroundOverlay(args.opts.url, args.opts.bounds, args.opts.opts);
    obj.setMap(map);
    id = store.add(args, "groundoverlay", obj);
    manageEnd(args, obj, id);
  };

  /**
   * set a streetview
   **/
  self.streetviewpanorama = function (args) {
    if (!args.opts.opts) {
      args.opts.opts = {};
    }
    if (args.latLng) {
      args.opts.opts.position = args.latLng;
    } else if (args.opts.opts.position) {
      args.opts.opts.position = toLatLng(args.opts.opts.position);
    }
    if (args.td.divId) {
      args.opts.container = document.getElementById(args.td.divId);
    } else if (args.opts.container) {
      args.opts.container = $(args.opts.container).get(0);
    }
    var id, obj = new defaults.classes.StreetViewPanorama(args.opts.container, args.opts.opts);
    if (obj) {
      map.setStreetView(obj);
    }
    id = store.add(args, "streetviewpanorama", obj);
    manageEnd(args, obj, id);
  };

  self.kmllayer = function (args) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    $.each(args.td.values, function (i, value) {
      var id, obj, options,
        td = tuple(args, value);
      if (!map) {
        newMap();
      }
      options = td.options;
      // compatibility 5.0-
      if (td.options.opts) {
        options = td.options.opts;
        if (td.options.url) {
          options.url = td.options.url;
        }
      }
      // -- end --
      options.map = map;
      if (googleVersionMin("3.10")) {
        obj = new defaults.classes.KmlLayer(options);
      } else {
        obj = new defaults.classes.KmlLayer(options.url, options);
      }
      objs.push(obj);
      id = store.add({td: td}, "kmllayer", obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * add a fix panel
   **/
  self.panel = function (args) {
    newMap();
    var id, $content,
      x = 0,
      y = 0,
      $div = $(document.createElement("div"));

    $div.css({
      position: "absolute",
      zIndex: 1000,
      visibility: "hidden"
    });

    if (args.opts.content) {
      $content = $(args.opts.content);
      $div.append($content);
      $this.first().prepend($div);

      if (!isUndefined(args.opts.left)) {
        x = args.opts.left;
      } else if (!isUndefined(args.opts.right)) {
        x = $this.width() - $content.width() - args.opts.right;
      } else if (args.opts.center) {
        x = ($this.width() - $content.width()) / 2;
      }

      if (!isUndefined(args.opts.top)) {
        y = args.opts.top;
      } else if (!isUndefined(args.opts.bottom)) {
        y = $this.height() - $content.height() - args.opts.bottom;
      } else if (args.opts.middle) {
        y = ($this.height() - $content.height()) / 2
      }

      $div.css({
        top: y,
        left: x,
        visibility: "visible"
      });
    }

    id = store.add(args, "panel", $div);
    manageEnd(args, $div, id);
    $div = null; // memory leak
  };

  /**
   * add a direction renderer
   **/
  self.directionsrenderer = function (args) {
    args.opts.map = map;
    var id,
      obj = new gm.DirectionsRenderer(args.opts);
    if (args.td.divId) {
      obj.setPanel(document.getElementById(args.td.divId));
    } else if (args.td.container) {
      obj.setPanel($(args.td.container).get(0));
    }
    id = store.add(args, "directionsrenderer", obj);
    manageEnd(args, obj, id);
  };

  /**
   * returns latLng of the user
   **/
  self.getgeoloc = function (args) {
    manageEnd(args, args.latLng);
  };

  /**
   * add a style
   **/
  self.styledmaptype = function (args) {
    newMap();
    var obj = new defaults.classes.StyledMapType(args.td.styles, args.opts);
    map.mapTypes.set(args.td.id, obj);
    manageEnd(args, obj);
  };

  /**
   * add an imageMapType
   **/
  self.imagemaptype = function (args) {
    newMap();
    var obj = new defaults.classes.ImageMapType(args.opts);
    map.mapTypes.set(args.td.id, obj);
    manageEnd(args, obj);
  };

  /**
   * autofit a map using its overlays (markers, rectangles ...)
   **/
  self.autofit = function (args) {
    var bounds = new gm.LatLngBounds();
    $.each(store.all(), function (i, obj) {
      if (obj.getPosition) {
        bounds.extend(obj.getPosition());
      } else if (obj.getBounds) {
        bounds.extend(obj.getBounds().getNorthEast());
        bounds.extend(obj.getBounds().getSouthWest());
      } else if (obj.getPaths) {
        obj.getPaths().forEach(function (path) {
          path.forEach(function (latLng) {
            bounds.extend(latLng);
          });
        });
      } else if (obj.getPath) {
        obj.getPath().forEach(function (latLng) {
          bounds.extend(latLng);
        });
      } else if (obj.getCenter) {
        bounds.extend(obj.getCenter());
      } else if (typeof Clusterer === "function" && obj instanceof Clusterer) {
        obj = store.getById(obj.id(), true);
        if (obj) {
          obj.autofit(bounds);
        }
      }
    });

    if (!bounds.isEmpty() && (!map.getBounds() || !map.getBounds().equals(bounds))) {
      if ("maxZoom" in args.td) {
        // fitBouds Callback event => detect zoom level and check maxZoom
        gm.event.addListenerOnce(
          map,
          "bounds_changed",
          function () {
            if (this.getZoom() > args.td.maxZoom) {
              this.setZoom(args.td.maxZoom);
            }
          }
        );
      }
      map.fitBounds(bounds);
    }
    manageEnd(args, true);
  };

  /**
   * remove objects from a map
   **/
  self.clear = function (args) {
    if (isString(args.td)) {
      if (store.clearById(args.td) || store.objClearById(args.td)) {
        manageEnd(args, true);
        return;
      }
      args.td = {name: args.td};
    }
    if (args.td.id) {
      $.each(array(args.td.id), function (i, id) {
        store.clearById(id) || store.objClearById(id);
      });
    } else {
      store.clear(array(args.td.name), args.td.last, args.td.first, args.td.tag);
      store.objClear(array(args.td.name), args.td.last, args.td.first, args.td.tag);
    }
    manageEnd(args, true);
  };

  /**
   * return objects previously created
   **/
  self.get = function (args, direct, full) {
    var name, res,
      td = direct ? args : args.td;
    if (!direct) {
      full = td.full;
    }
    if (isString(td)) {
      res = store.getById(td, false, full) || store.objGetById(td);
      if (res === false) {
        name = td;
        td = {};
      }
    } else {
      name = td.name;
    }
    if (name === "map") {
      res = map;
    }
    if (!res) {
      res = [];
      if (td.id) {
        $.each(array(td.id), function (i, id) {
          res.push(store.getById(id, false, full) || store.objGetById(id));
        });
        if (!isArray(td.id)) {
          res = res[0];
        }
      } else {
        $.each(name ? array(name) : [undef], function (i, aName) {
          var result;
          if (td.first) {
            result = store.get(aName, false, td.tag, full);
            if (result) {
              res.push(result);
            }
          } else if (td.all) {
            $.each(store.all(aName, td.tag, full), function (i, result) {
              res.push(result);
            });
          } else {
            result = store.get(aName, true, td.tag, full);
            if (result) {
              res.push(result);
            }
          }
        });
        if (!td.all && !isArray(name)) {
          res = res[0];
        }
      }
    }
    res = isArray(res) || !td.all ? res : [res];
    if (direct) {
      return res;
    } else {
      manageEnd(args, res);
    }
  };

  /**
   * run a function on each items selected
   **/
  self.exec = function (args) {
    $.each(array(args.td.func), function (i, func) {
      $.each(self.get(args.td, true, args.td.hasOwnProperty("full") ? args.td.full : true), function (j, res) {
        func.call($this, res);
      });
    });
    manageEnd(args, true);
  };

  /**
   * trigger events on the map
   **/
  self.trigger = function (args) {
    if (isString(args.td)) {
      gm.event.trigger(map, args.td);
    } else {
      var options = [map, args.td.eventName];
      if (args.td.var_args) {
        $.each(args.td.var_args, function (i, v) {
          options.push(v);
        });
      }
      gm.event.trigger.apply(gm.event, options);
    }
    callback(args);
    task.ack();
  };
}

$.fn.gmap3 = function () {
  var i,
    list = [],
    empty = true,
    results = [];

  // init library
  initDefaults();

  // store all arguments in a td list
  for (i = 0; i < arguments.length; i++) {
    if (arguments[i]) {
      list.push(arguments[i]);
    }
  }

  // resolve empty call - run init
  if (!list.length) {
    list.push("map");
  }

  // loop on each jQuery object
  $.each(this, function () {
    var $this = $(this),
      gmap3 = $this.data("gmap3");
    empty = false;
    if (!gmap3) {
      gmap3 = new Gmap3($this);
      $this.data("gmap3", gmap3);
    }
    if (list.length === 1 && (list[0] === "get" || isDirectGet(list[0]))) {
      if (list[0] === "get") {
        results.push(gmap3.get("map", true));
      } else {
        results.push(gmap3.get(list[0].get, true, list[0].get.full));
      }
    } else {
      gmap3._plan(list);
    }
  });

  // return for direct call only
  if (results.length) {
    if (results.length === 1) { // 1 css selector
      return results[0];
    }
    return results;
  }

  return this;
};
})(jQuery);