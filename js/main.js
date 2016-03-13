(function() {
  "use strict";

  var height, width, svg; 

  function getViewportDimensions() { 
    width = document.getElementsByTagName("main")[0].offsetWidth;
    height = window.innerHeight * 0.9;
  };

  getViewportDimensions();

  function drawSvg() {
    svg = d3.select("main")
      .append("svg");

      setSvgSize();
  }

  function setSvgSize() {
    svg
      .attr({
        width: width,
        height: height
      });
  }

  drawSvg();


  d3.select(window).on('resize', resize);

  function resize() {

    getViewportDimensions();
    setSvgSize();

  }

})();
