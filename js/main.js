(function() {

  "use strict";

  var height, width, svg, spreadsheet, svgExistsInDOM = false; 

  function getViewportDimensions() { 
    width = document.getElementById("main").offsetWidth * 0.90;
    height = window.innerHeight * 0.4;
  };

  getViewportDimensions();

  function drawSvg() {
    if(svgExistsInDOM === false) {
      svg = d3.select("#main")
        .append("svg");
        svgExistsInDOM = true; 
        setSvgSize();
    }
    else setSvgSize();
  }

  function setSvgSize() {
    svg
      .attr({
        width: width,
        height: height
      });
  }

  function requestData() {
    d3.csv("data/data.csv", function(data){
      spreadsheet = data;
      createSelect();
      populateSelect(spreadsheet);
      createInput();
      createSubmit();
      attachSubmitEventListners();
    });
  }
  requestData();

  function createSelect() {
    var main = document.getElementById("main");
    var select = document.createElement("select");
    select.id = "bribeSelector";
    main.appendChild(select);
  }

  function populateSelect(d) {
    var select = document.getElementById("bribeSelector");
    for(var i = 0; i < d.length; i++) {
      var option = document.createElement("option");
      option.innerHTML = d[i].Procedure;
      select.appendChild(option);
    }
  }

  function createInput() {
    var main = document.getElementById("main");
    var select = document.getElementById("bribeSelector");
    var input = document.createElement("input");
    input.id = "bribeInputControl";
    input.type = "number";
    input.name = "bribeInput";
    input.min = 1000; 
    input.max = 10000000;
    main.insertBefore(input, select.nextSibling);
  }

  function createSubmit() {
    var main = document.getElementById("main");
    var input = document.getElementById("bribeInputControl");
    var submit = document.createElement("p");
    submit.id = "submit";
    submit.innerHTML = "Submit";
    submit.setAttribute("tabindex",0);
    main.insertBefore(submit, input.nextSibling);
  }

  function attachSubmitEventListners() {
    var submit = document.getElementById("submit");
    var input = document.getElementById("bribeInputControl");

    submit.addEventListener("click", function() {
      var select = document.getElementById("bribeSelector");
      var selected = select.options[select.selectedIndex].value;
      return (input.value > 0) ? visualise(selected) : alert("Please enter the bribe you had to pay.");
    });
    submit.addEventListener("keydown", function (event) {
      var select = document.getElementById("bribeSelector");
      var selected = select.options[select.selectedIndex].value;
      var key = event.which || event.keyCode;
      if ((key === 13) || (key === 32)) {
        return (input.value > 0) ? visualise(selected) : alert("Please enter the bribe you had to pay.");
      }
    });    
  }

  function visualise(procedure) {
    drawSvg();
    
    var min, max, avg, xScale; 

    for(var i = 0; i < spreadsheet.length; i++) {
      if(spreadsheet[i].Procedure === procedure) {
        min = spreadsheet[i]["Min Bribes"]; 
        max = spreadsheet[i]["Max Bribes"];
        avg = spreadsheet[i]["Avg Bribes"];
      }
    }
    console.log(dataToVisualise);

  }


  d3.select(window).on('resize', resize);

  function resize() {

    getViewportDimensions();
    setSvgSize();

  }

  // fastclick
  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
    }, false);
  }

})();
