# Carousel
Adaptive carousel which can adapt based on passed configuration.

## Getting Started

### How to use

Just add a link to the css file in your <head>:

```
<link rel="stylesheet" type="text/css" href="carousel.css" />
```

Then, before your closing <body> tag add:

```
<script type="text/javascript" src="carousel.js"></script>
```

Then, add element in your body tag with any id. 

This id will be used as reference to create carousel inside that (refer below code).

```
<div id='some-id'></div>
```

Then, simply initialize it:

```
<script type="text/javascript">
  var element = document.getElementById('some-id')
      , config = { 
        elem:element                  // required
        , className:'custom-class'    // optional 
        , speed:500                   // optional | default:300
        , slidesToShow:5              // optional | default:1
      }
      , slider = new Carousel(config);
  slider.init();
</script>
```
