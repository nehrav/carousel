// immediately invoked functional expression to wrap my carousel
(function() {
	this.Carousel = function() { 
		var _ = this; 

    // Determine proper prefix
    // _.transitionEnd = transitionSelect();

    // Define option defaults 
    var defaults = {
      className: ''
			, slidesToShow: 1
			, slidesToScroll: 1
      , speed: 300
      , initialSlide: 0
      , slideMargin: 10
    }
    
    // Create options by extending defaults with the passed in arugments
    if(arguments[0] && typeof arguments[0] === 'object') 
      _.options = extendDefaults(defaults, arguments[0]);  

    _.slider = _.options.elem; 
    _.windowWidth = 0;
    _.currentSlide = _.options.initialSlide;
  }

  Carousel.prototype.init = function () {
  	var _ = this; 
    
    if(!(_.slider.classList.contains('carouselLoaded'))) {
      _.buildCarousel();
      _.setProps();
      _.setupLoop();
      _.buildArrows();
      _.startLoad();
      _.loadCarousel();
      _.initializeEvents();

      _.slider.className = 'carouselLoaded'; 
    }
  }

  Carousel.prototype.buildCarousel = function () {
    var _ = this
      , docFrag = document.createDocumentFragment() 
      , slideClone = _.slider.cloneNode(!0)
      , nodeList = []
      , nodeListStr = '';
    
    for (var i=0; i < slideClone.childNodes.length; i++) {
      var node = slideClone.childNodes[i];
      node.className = 'slide'; 
      node.setAttribute('role', 'option');
      // node.setAttribute('aria-hidden', 'true');
      node.setAttribute('tabindex', '-1');
      nodeListStr += node.outerHTML;
      nodeList.push(node); 
    }  
    _.slides = nodeList;

    _.carousel = document.createElement('div')
    _.carousel.className = 'slider ' + _.options.className; 

    _.carouselHolder = document.createElement('div');
    _.carouselHolder.className = 'sliderContainer'; 
    _.carouselHolder.setAttribute('aria-live', 'polite');

    _.carouselRow = document.createElement('div');
    _.carouselRow.className = 'sliderRow'; 
    _.carouselRow.innerHTML = nodeListStr; 
    _.carouselRow.style.opacity = '0';

    _.carouselHolder.appendChild(_.carouselRow);
  	_.carousel.appendChild(_.carouselHolder);
    docFrag.appendChild(_.carousel);
    
    _.slider.innerHTML = '';
    _.slider.appendChild(docFrag);
    
    _.slideCount = _.slides.length;
    _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);
  }

  Carousel.prototype.setProps = function () {
    var _ = this
      , bodyStyle = document.body.style
      , perspectiveKey = 'webkitPerspective'
    
    _.transformType = 'transform';
    _.transitionType = 'transition';
    if(bodyStyle.OTransform !== undefined) 
      _.animType = 'OTransform';  
    if(bodyStyle.MozTransform !== undefined) {
      _.animType = 'MozTransform';
      perspectiveKey = 'MozPerspective';
    }
    if(bodyStyle.webkitTransform !== undefined) 
      _.animType = 'webkitTransform';  
    if(bodyStyle.perspectiveProperty === undefined && bodyStyle[perspectiveKey] === undefined) 
      _.animType = !1;
    if(bodyStyle.msTransform !== undefined) 
      _.animType = 'msTransform';
  }

  Carousel.prototype.setupLoop = function () {
    var _ = this 
      , infiniteCount
      , slideIndex = null
      , i
    
    if(_.slideCount > _.options.slidesToShow) {
      infiniteCount = _.options.slidesToShow + 1;
      for (i=_.slideCount; i > (_.slideCount - infiniteCount); i -= 1) {
        slideIndex = i - 1
        var clonedItem = _.slides[slideIndex].cloneNode(!0)

        clonedItem.classList.add('cloned');
        clonedItem.setAttribute('data-index', slideIndex - _.slideCount);
        _.carouselRow.insertBefore(clonedItem, _.carouselRow.childNodes[0]);
      } 
      for (i=0; i<infiniteCount; i+=1) {
        slideIndex = i
        var clonedItem = _.slides[slideIndex].cloneNode(!0)
        
        clonedItem.classList.add('cloned');
        clonedItem.setAttribute('data-index', slideIndex + _.slideCount);
        _.carouselRow.appendChild(clonedItem); 
      } 
    }
  }

  Carousel.prototype.buildArrows = function () {
    var _ = this
      , prevText = document.createTextNode('Prev')
      , nextText = document.createTextNode('Next')
      , btnContainer = document.createElement('div')
    
    btnContainer.className = 'btnContainer';
    _.prevArrow = document.createElement('button'); 
    _.prevArrow.setAttribute('aria-label', 'Previous');
    _.prevArrow.setAttribute('role', 'button');
    _.prevArrow.setAttribute('type', 'button'); 
    _.prevArrow.className = 'prevButton';
    _.prevArrow.appendChild(prevText);

    _.nextArrow = document.createElement('button');
    _.nextArrow.setAttribute('aria-label', 'Next');
    _.nextArrow.setAttribute('role', 'button');
    _.nextArrow.setAttribute('type', 'button'); 
    _.nextArrow.className = 'nextButton';
    _.nextArrow.appendChild(nextText);

    btnContainer.appendChild(_.prevArrow);
    btnContainer.appendChild(_.nextArrow);

    if(_.slideCount > _.options.slidesToShow)   
      _.carousel.appendChild(btnContainer); 
  }

  Carousel.prototype.startLoad = function () {
    var _ = this;
    _.prevArrow.style.display = 'none';
    _.nextArrow.style.display = 'none'; 
  }

  Carousel.prototype.loadCarousel = function () {
    var _ = this;
    _.setPosition();
    _.carouselRow.style.opacity = '1';
    if(_.slideCount > _.options.slidesToShow) {
      _.prevArrow.style.display = 'inline-block';
      _.nextArrow.style.display = 'inline-block'; 
    }
  }

  Carousel.prototype.setPosition = function () {
    var _ = this;
    _.setDimensions(); 
    if(_.slideCount > _.options.slidesToShow)
      _.setCSS(_.getLeft(_.currentSlide));
  }

  Carousel.prototype.setDimensions = function () {
    var _ = this; 
    _.listWidth = _.carousel.clientWidth;
    _.listHeight = _.carousel.clientHeight;

    _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
    _.slideWidth = _.slideWidth + _.options.slideMargin;
    _.carouselRow.style.width = Math.ceil((_.slideWidth * _.carouselRow.childElementCount)) + 'px'; 
    var actualWidth = _.slideWidth - _.options.slideMargin; 
    _.carouselRow.childNodes.forEach(function(node) { node.style.width = actualWidth + 'px'; });
  }

  Carousel.prototype.getLeft = function (slideIndex) {
    var _ = this 
      , targetLeft;

    _.slideOffset = 0;
    if(_.slideCount > _.options.slidesToShow) 
      _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;  
    if(_.slideCount % _.options.slidesToScroll !== 0) {
      if(slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
        if(slideIndex > _.slideCount) 
          _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
        else 
          _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1; 
      }
    } 

    if(_.slideCount <= _.options.slidesToShow) 
      _.slideOffset = 0;  

    _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;  
    targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
    console.log(targetLeft);
    return targetLeft;
  }

  Carousel.prototype.setCSS = function (position) {
    var _ = this
      , x = Math.ceil(position) + 'px'
     
    _.carouselRow.style[_.animType] = 'translate3d(' + x + ', 0px, 0px)';
  }

  Carousel.prototype.initializeEvents = function () {
    var _ = this;

    _.initArrowEvents();
    window.addEventListener('resize', this.resize.bind(this));
  }

  Carousel.prototype.initArrowEvents = function () {
    var _ = this;
    if(_.slideCount > _.options.slidesToShow) {
      _.prevArrow.addEventListener('click', this.changeSlide.bind(this, 'previous'));
      _.nextArrow.addEventListener('click', this.changeSlide.bind(this, 'next'));
    }
  }

  Carousel.prototype.setSlideClasses = function (index) {
    var _ = this
      , centerOffset = Math.floor(_.options.slidesToShow / 2)
      , allSlides = _.carousel.querySelectorAll('.slide')
    
    allSlides.forEach(function (node) {
      node.classList.remove('active', 'slider-center', 'slider-current');
      node.setAttribute('aria-hidden', 'true');
    });
    _.slides[index].classList.add('slider-current');  

    if(index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
      _.slides.slice(index - centerOffset, index + centerOffset + 1).forEach(function (node) {
        node.classList.add('active');
        node.setAttribute('aria-hidden', 'false');
      }); 
    } else {
      indexOffset = _.options.slidesToShow + index; 
      Array.prototype.slice.call(allSlides).slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).forEach(function (node) {
        node.classList.add('active');
        node.setAttribute('aria-hidden', 'false');
      });
    }
    if(index === 0 && (_.slideCount > _.options.slidesToShow)) 
      allSlides[allSlides.length - 1 - _.options.slidesToShow].classList.add('slider-center');
    else if(index === _.slideCount - 1)  
      allSlides[_.options.slidesToShow].classList.add('slider-center');  
    
    _.slides[index].classList.add('slider-center');  
  }

  Carousel.prototype.changeSlide = function (message, dontAnimate) {
    var _ = this
      , slideOffset
      , indexOffset
      , unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);

    indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;
    if(message == 'previous') { 
      slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
      if(_.slideCount > _.options.slidesToShow) 
        _.slideHandler(_.currentSlide - slideOffset, dontAnimate); 
    } else { 
      slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
      if(_.slideCount > _.options.slidesToShow)  
        _.slideHandler(_.currentSlide + slideOffset, dontAnimate);  
    }
  }

  Carousel.prototype.slideHandler = function (index, dontAnimate) {
    var _ = this
      , targetSlide = index
      , targetLeft = _.getLeft(index)
      , slideLeft = _.getLeft(_.currentSlide)
      , animSlide

    if(_.animating === true) 
      return;  
    if(_.slideCount <= _.options.slidesToShow) 
      return;
    _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft; 

    if (targetSlide < 0) {
      if (_.slideCount % _.options.slidesToScroll !== 0) 
        animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
      else 
        animSlide = _.slideCount + targetSlide; 
    } else if (targetSlide >= _.slideCount) {
      if (_.slideCount % _.options.slidesToScroll !== 0) 
        animSlide = 0;
      else 
        animSlide = targetSlide - _.slideCount; 
    } else 
      animSlide = targetSlide; 
    
    _.animating = true;
    oldSlide = _.currentSlide;
    _.currentSlide = animSlide;
    _.setSlideClasses(_.currentSlide);

    _.animateSlide(targetLeft, function() {
      _.postSlide(animSlide);
    });
  }

  Carousel.prototype.animateSlide = function (targetLeft, callback) {
    var _ = this;
    targetLeft = Math.ceil(targetLeft);

    _.carouselRow.style[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ease';
    _.carouselRow.style[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
    if(callback) {
      setTimeout(function() { 
        _.carouselRow.style[_.transitionType] = ''; 
        callback.call();
      }, _.options.speed);
    }
  }

  Carousel.prototype.postSlide = function () {
    var _ = this;

    _.animating = false;
    _.setPosition();
    _.swipeLeft = null;
  }

  Carousel.prototype.resize = function () {
    var _ = this;
    if(window.innerWidth !== _.windowWidth) {
      clearTimeout(_.windowDelay);
      _.windowDelay = window.setTimeout(function() {
        _.windowWidth = window.innerWidth;
        _.checkResponsive();
          // if( !_.unslicked ) { _.setPosition(); }
      }, 50);
    }
  }

  Carousel.prototype.checkResponsive = function () {
    var _ = this;
  }

  function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
      if(properties.hasOwnProperty(property)) 
        source[property] = properties[property]; 
    }
    return source;
  }
}());