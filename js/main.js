(function() {

  "use strict";

  // GLOBAL to APPLICATION VARIABLES ------------- 
  var height, width, svg, spreadsheet, min, max, avg, xScale, userBribeAmout, bgRect, fgRect, svgExistsInDOM = false, 
  visInit = false, bgMinLabel, bgMaxLabel, fgLabel;

  var rectOpts = {
    "x": 0, 
    "y" : "25%",
    "height" : 5
  };

  var labelOpts = {
    "y" : "22%"
  };

  // REQUEST CSV ------------- 

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

  // UI BUILDER FUNCTIONS ------------- 

  function createSelect() {
    var main = document.getElementById("uicontrol");
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

  function createInputLabel() {
    var main = document.getElementById("uicontrol");
    var label = document.createElement("label");
    label.for = "bribeInputControl";
    label.id = "bribeInputLabel";
    label.innerHTML = "The bribe I had to pay (in Lebanese pounds) was:";
    main.appendChild(label);
  }

  
  function createInput() {
    
    createInputLabel();

    var main = document.getElementById("uicontrol");
    var select = document.getElementById("bribeSelector");
    var input = document.createElement("input");
    var bribeInputLabel = document.getElementById("bribeInputLabel");
    input.id = "bribeInputControl";
    input.type = "number";
    input.name = "bribeInput";
    input.min = 1000; 
    input.max = 10000000;

    main.insertBefore(input, bribeInputLabel.nextSibling);
    
  }

  function createSubmit() {
    var main = document.getElementById("uicontrol");
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
      var selectedProcedure = select.options[select.selectedIndex].value;
      var input = document.getElementById("bribeInputControl");
      userBribeAmout = input.value; 
      return (input.value > 0) ? visualise(selectedProcedure,userBribeAmout) : alert("Please enter the bribe you had to pay.");
    });
    submit.addEventListener("keydown", function (event) {
      var select = document.getElementById("bribeSelector");
      var selectedProcedure = select.options[select.selectedIndex].value;
      userBribeAmout = input.value; 
      var key = event.which || event.keyCode;
      if ((key === 13) || (key === 32)) {
        return (input.value > 0) ? visualise(selectedProcedure,userBribeAmout) : alert("Please enter the bribe you had to pay.");
      }
    });    
  }

  // VISUALISATION FUNCTIONS ------------- 

 function getViewportDimensions() { 
    width = document.getElementById("main").offsetWidth * 0.90;
    height = window.innerHeight * 0.4;
  }

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

  // draw the bgRect
  function backgroundRect() {
    bgRect = svg.append("rect")
      .attr({
        "id": "background",
        "width": width, 
        "fill" : "#989798",
      })
      .attr(rectOpts);
    visInit = true;
  }

  function visualise(procedure, userAmount) {

    var arr = [];
    arr.push(parseInt(userAmount));


    drawSvg();
    
    for(var i = 0; i < spreadsheet.length; i++) {
      if(spreadsheet[i].Procedure === procedure) {
        min = spreadsheet[i]["Min Bribes"]; 
        max = spreadsheet[i]["Max Bribes"];
        avg = spreadsheet[i]["Avg Bribes"];
      }
    }
   
    xScale = d3.scale.linear()
      .domain([min, max])
      .range([0, width]);


    // append the background rect if it's not in the DOM
    if(visInit === false) {
      backgroundRect();

      bgMinLabel = svg.append("text");
      bgMaxLabel = svg.append("g")
        .classed("end", "true")
        .append("text");
    }

       

    function update() {

      // Bars ------------- 

      // select rectangle & bind data
      fgRect = svg.selectAll("rect#foreground")
        .data(arr);
        
      // enter rect element 
      fgRect.enter()
        .append("rect");

      // update rect element
      fgRect
        .attr(rectOpts)
        .attr({
          "fill" : "fff",
          "id" : "foreground",
          "width" : 0
        })
        .transition()
        .duration(1000)
        .attr({
         "width": function(d) {
            return xScale(d);
          } 
        });


       // Labels ------------- 

       bgMinLabel
        .text(function(){
          return min;
        })
        .attr(labelOpts)
        .attr({
          "x" : 0
        });

       bgMaxLabel
        .text(function(){
          return max;
        })
        .attr(labelOpts)
        .attr({
          "x" : width, 
          "text-anchor" : "end"
        });

      
    }

    update();

   

   

  
  }

  // RESIZE FUNCTIONS ------------- 

  d3.select(window).on('resize', resize);

  function resize() {

    getViewportDimensions();
    setSvgSize();

    // adjust the rect scale
    xScale 
      .range([0, width]);

    // adjust the background rect size
    bgRect
      .attr("width", width);

    // adjust the foreground rect size
    fgRect
      .attr({
        "width": function(d) {
          return xScale(d);
        }
      });

    // adjust the background rect label 
    bgMaxLabel 
      .attr({
        "x" : width, 
        "text-anchor" : "end"
      })
    
  }

  // FASTCLICK ------------- 

  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
    }, false);
  }

})();
