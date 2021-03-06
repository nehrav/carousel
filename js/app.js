var myApp = {
  carouselID: 'imageSlider'
  , imageLimit: 15
  , ajaxURL:'https://pixabay.com/api/?key=9656065-a4094594c34f9ac14c7fc4c39&q=beautiful+landscape&image_type=photo'
  , ajaxSuccess: function (resJSON) {
    var element = document.getElementById(this.carouselID)
      , itemsList = resJSON.hits
      , carouselConfig = { 
        elem:element                  // required
        , className:'homeCarousel'    // optional 
        , speed:500                   // optional 
        , slidesToShow:5              // optional 
        , responsive: [ 
          { breakpoint: 570, settings: { slidesToShow: 2, speed:150 } }
          , { breakpoint: 780, settings: { slidesToShow: 3 } }
          , { breakpoint: 420, settings: { slidesToShow: 1, speed:200 } }
          , { breakpoint: 1024, settings: { slidesToShow: 4, speed:400 } }
        ]
      }
      , imageCarousel
      , docFrag

    if(itemsList && itemsList.length) {
      docFrag = document.createDocumentFragment();
      for(var i=0; i<itemsList.length; i++) { 
        var listElem = document.createElement('div')
          , imgElem = document.createElement('div')
          , infoElem = document.createElement('div') 
          , item = itemsList[i];

        imgElem.style.backgroundImage = 'url(' + item.webformatURL + ')';
        imgElem.className = 'imageBox';
        infoElem.innerHTML = item.user;
        listElem.appendChild(imgElem);
        listElem.appendChild(infoElem);
        docFrag.appendChild(listElem); 
        if(i >= this.imageLimit)
          break;
      }
      element.appendChild(docFrag); 
      imageCarousel = new Carousel(carouselConfig)
      imageCarousel.init();
    }   
  }
  , fetchData: function () {
    fetch(this.ajaxURL)
      .then(function(response) {
        return response.json();
      })
      .then(this.ajaxSuccess.bind(this))
      .catch(function(error) {
        console.log(error);
      })
  }
  , init: function () {
    this.fetchData();
  }
}