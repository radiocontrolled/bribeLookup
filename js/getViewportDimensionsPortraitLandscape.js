  function getViewportDimensions() { 

    height = window.innerHeight / 2;
    
    // if portrait
    if(window.innerHeight > window.innerWidth){
      width = document.getElementsByTagName("main")[0].offsetWidth / 1.2;
    }

    // if landscape
    else {
      width = document.getElementsByTagName("main")[0].offsetWidth / 2;
    }

  }
