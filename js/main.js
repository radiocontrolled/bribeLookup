(function() {

  "use strict";

  // GLOBAL to APPLICATION VARIABLES ------------- 
  var height, width, svg, spreadsheet, min, max, avg, xScale, userBribeAmout, bgRect, fgRect, svgExistsInDOM = false, 
  visInit = false, bgMinLabel, bgMaxLabel, fgLabel, fgLine, avgRect, avgRectLine, avgRectLabel; 

  //showRange
  var showRangeRect; 


  var rectOpts = {
    "x": 0, 
    "y" : 31,
    "height" : 5
  };

  var labelOpts = {
    "y" : 25
  };


  // REQUEST DATA (Tabletop) ------------- 

  function init() {
    Tabletop.init({ 
      key: '1xxfpA7qNZH7URp-wGO2iPAZaNzcvFvOXjmF0LK4Lji4',
      callback: function(data, tabletop) { 
        spreadsheet = data;
        createSelect();
        populateSelect(spreadsheet);
        createInput();
        createSubmit();
        attachSubmitEventListners();
        showRange();
        var select = document.getElementById("bribeSelector");
        select.addEventListener("change", showRange);
      },
      simpleSheet: true 
    });
  }

  init(); 

  // REQUEST CSV ------------- 

  // function requestData() {
  //   d3.csv("data/data.csv", function(data){
  //     spreadsheet = data;
  //     createSelect();
  //     populateSelect(spreadsheet);
  //     createInput();
  //     createSubmit();
  //     attachSubmitEventListners();
  //   });
  // }
  // requestData();

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
    label.innerHTML = "The bribe I had to pay (in LBP) was:";
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

        if(preventVis(selectedProcedure, userBribeAmout) === false) {
          return (input.value > 0) ? visualise(selectedProcedure,userBribeAmout) : alert("Please enter the bribe you had to pay.");
        }
        else {
          contactSED();
        }
    
    });
    submit.addEventListener("keydown", function (event) {
      var select = document.getElementById("bribeSelector");
      var selectedProcedure = select.options[select.selectedIndex].value;
      userBribeAmout = input.value; 
      var key = event.which || event.keyCode;
      if ((key === 13) || (key === 32)) {

        if(preventVis(selectedProcedure, userBribeAmout) === false) {
          return (input.value > 0) ? visualise(selectedProcedure,userBribeAmout) : alert("Please enter the bribe you had to pay.");
        }
        else {
          contactSED();
        }
       }
    });    
  }

  function preventVis(procedure, userAmount) {
    for(var i = 0; i < spreadsheet.length; i++) {
      if(spreadsheet[i].Procedure === procedure) {
       
        if( (parseInt(spreadsheet[i]["Max Bribes"]) < userAmount ) ) {
          return true; 
        }
        if( (parseInt(spreadsheet[i]["Min Bribes"]) > userAmount )) {
          return true; 
        }
        else return false; 
      }
    }
  }

  function contactSED() {
    var contact = document.getElementById("contactSed");
    var info = document.getElementById("info");
    var main = document.getElementById("main");
    contact.style.display = "block";
  
    // is info div visible? 
    if(info.style.display == "block") {
      info.style.display = "none";
      main.style.display = "none";
    }
  }

  // INFO FUNCTIONS to update the explanation section ------------- 

  function updateInfoDiv(userAmount, procedure, avg, min, max) {
    var contact = document.getElementById("contactSed");
    var userAmountSpan = document.getElementById("userAmount");
    var userAmountProcedure = document.getElementById("userProcedure");
    var dataAverageBribe = document.getElementById("dataAvgBribe");
    var informationAmount = document.getElementById("infoAmount");
    var lessGreaterEqual = document.getElementById("lessThanMoreThan");
    var info = document.getElementById("info");

  
    var calc = calculate(userAmount, avg);

    userAmountSpan.innerHTML = userAmount + "LBP";
    userAmountProcedure.innerHTML = procedure;
    dataAverageBribe.innerHTML = avg + "LBP";
    informationAmount.innerHTML = calc.amount; 
    lessGreaterEqual.innerHTML = calc.lge; 


    // is contactSED visible? 
    if(contact.style.display == "block") {
      contact.style.display = "none";
    }

    info.style.display = "block";

  }

  function calculate(userAmount, avg) {

    var obj = {};

    if(userAmount > avg) {
      obj.lge = "greater than "; 
      obj.amount = userAmount - avg + "LBP";
    }
    
    else if(userAmount < avg) {
      obj.lge = "less than "; 
      obj.amount = avg - userAmount + "LBP";
    }

    else {
      obj.lge = "equal to";
      obj.amount = "";
    }

    return obj; 
    
  }

  function setTitle(titleToSet) {
    var title = document.getElementById("title");
    title.innerHTML = titleToSet;
  }
  

  // VISUALISATION FUNCTIONS ------------- 

 function getViewportDimensions() { 
    width = document.getElementById("main").offsetWidth * 0.90;
    height = window.innerHeight * 0.15;
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

  

  function showRange() {
 
    
    var showRangeAvg, showRangeMin, showRangeMax;

    var select = document.getElementById("bribeSelector");

    getAverageMinAndMax(); 
    drawSvg();
    drawShowRangeRect(); 

    function getAverageMinAndMax() {
      for(var i = 0; i < spreadsheet.length; i++) {
        if(spreadsheet[i].Procedure === select.value) {
          showRangeMin = spreadsheet[i]["Min Bribes"]; 
          showRangeMax = spreadsheet[i]["Max Bribes"];
          showRangeAvg = spreadsheet[i]["Avg Bribes"];
        }
      }
    }

    function drawShowRangeRect () {
      if(visInit === false) {
        backgroundRect();
        bgMinLabel = svg.append("text");
        bgMaxLabel = svg.append("g")
          .classed("end", "true")
          .append("text");
        visInit = true;
      }
      
    }

    setTitle(select.value);

    // Background Bars Labels ------------- 

    bgMinLabel
      .text(function(){
        return showRangeMin;
      })
      .attr(labelOpts)
      .attr({
        "x" : 0
      });

    bgMaxLabel
      .text(function(){
        return showRangeMax;
      })
      .attr(labelOpts)
      .attr({
        "x" : width, 
        "text-anchor" : "end"
      });

    // if the foreground rect, myBribe, and Average bribe and #info section are visible, hide them

    // if the #info section is visible, hide it.
    var info = document.getElementById("info");
    if(info.style.display == "block") {
      info.style.display = "none";
    }

    // if the foreground rect is visible, hide it
    var foreground = d3.select("#foreground");
    foreground.attr("display","none");

    // if "My Bribe" text is visible, hide it
    var myBribe = d3.select("#my-bribe");
    myBribe.attr("display","none");

    // if "My Bribe" line is visible, hide it
    var myBribeLine = d3.select("#user");
    myBribeLine.attr("display","none");

    // if "Average" bribe text is visible, hide it
    var avgBribeLabel = d3.select("#bribeAverageLabel");
    avgBribeLabel.attr("display","none");

    // if "Average" bribe label line is visible, hide it.
    var avgBribeLine = d3.select("#avgLine");
    avgBribeLine.attr("display","none");

    // if "Average" rect is visible, hide it
    var averageRect = d3.select("#average");
    averageRect.attr("display","none");

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
    // visInit = true;
  }

  function visualise(procedure, userAmount) {

    var main = document.getElementById("main");
    if(main.style.display == "none") {
      main.style.display = "block";
    }

    var average = [];
    var arr = [];

    for(var i = 0; i < spreadsheet.length; i++) {
      if(spreadsheet[i].Procedure === procedure) {
        min = spreadsheet[i]["Min Bribes"]; 
        max = spreadsheet[i]["Max Bribes"];
        avg = spreadsheet[i]["Avg Bribes"];
      }
    }

    average.push(parseInt(avg));
    arr.push(parseInt(userAmount));

    // this can be called in showRange, 
    // because showRange will display before the visualisation can happen.
    // drawSvg();
     
   
    xScale = d3.scale.linear()
      .domain([min, max])
      .range([0, width]);


    // append the background rect if it's not in the DOM
    // if(visInit === false) {
    //   backgroundRect();

      // bgMinLabel = svg.append("text");
      // bgMaxLabel = svg.append("g")
      //   .classed("end", "true")
      //   .append("text");
    // }

       

    function update() {


      // Average (background) bribe ------------- 

      // select rectangele & bind data
      avgRect = svg.selectAll("rect#average")
        .data(average);

      avgRect.enter() 
        .append("rect");

      avgRect
        .attr(rectOpts)
        .attr({
          "id" : "average",
          "width" : 0, 
          "fill" : "#d91f2b",
          "display" : "block"
        })
        .transition()
        .duration(1000)
        .attr({
         "width": function(d) {
            return xScale(d);
          } 
        });

      // Average (background) line ------------- 
      avgRectLine = svg.selectAll("line#avgLine")
        .data(average);

      // enter the line 
      avgRectLine.enter()
        .append("line");

      // updaate the line element
      avgRectLine
        .attr({
          "x1" : 0, 
          "y1" : 13,
          "x2" : 0, 
          "y2" : 36, 
          "stroke" : "#d91f2b",
          "stroke-width" : 1, 
          "id" : "avgLine",
          "display" : "block"
        })
        .transition()
        .duration(1000)
        .attr({
          "x1" : function(d) {
            return xScale(d);
          }, 
          "x2" : function(d) {
            return xScale(d);
          } 
        });

      // Average (background) label ------------- 
      
      avgRectLabel  = svg.selectAll("text.bribeAverage")
        .data(average);

      // enter the labelling
      avgRectLabel 
        .enter()
        .append("text");

      // update the label 
      avgRectLabel 
        .text(function(){
          return "Average";
        })
        .attr({
          "y" : 10,
          "x" : 0,
          // "fill" : "#d91f2b",
          "text-anchor" : "middle",
          "class" : "bribeAverage",
          "id" : "bribeAverageLabel",
          "display" : "block"
        })
        .transition()
        .duration(1000)
        .attr({
          "x" : function(d) {
            return xScale(d);
          }
        });


      // User (foreground) bribe ------------- 

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
          "width" : 0,
          "display" : "block"
        })
        .transition()
        .duration(1000)
        .attr({
         "width": function(d) {
            return xScale(d);
          } 
        });

      // User (foreground) bars label ------------- 
      
      // select line labelling the user's bribe
      fgLine = svg.selectAll("line#user")
        .data(arr);

      // enter the line 
      fgLine.enter()
        .append("line");

      // updaate the line element
      fgLine
        .attr({
          "x1" : 0, 
          "y1" : 31,
          "x2" : 0, 
          "y2" : 54, 
          "stroke" : "black",
          "stroke-width" : 1,
          "id" : "user", 
          "display" : "block"
        })
        .transition()
        .duration(1000)
        .attr({
          "x1" : function(d) {
            return xScale(d);
          }, 
          "x2" : function(d) {
            return xScale(d);
          } 
        });

      // select the label holding the user's bribe input amount
      fgLabel = svg.selectAll("text.myBribe")
        .data(arr);

      // enter the label
      fgLabel
        .enter()
        .append("text");

      // update the label 

      fgLabel
        .text(function(){
          // return userAmount;
          return "My bribe";
        })
        .attr({
          "y" : 65,
          "x" : 0,
          "text-anchor" : "middle",
          "class" : "myBribe",
          "id" : "my-bribe",
          "display" : "block"
        })
        .transition()
        .duration(1000)
        .attr({
          "x" : function(d) {
            return xScale(d);
          }
        });



       // // Background Bars Labels ------------- 

       // bgMinLabel
       //  .text(function(){
       //    return min;
       //  })
       //  .attr(labelOpts)
       //  .attr({
       //    "x" : 0
       //  });

       // bgMaxLabel
       //  .text(function(){
       //    return max;
       //  })
       //  .attr(labelOpts)
       //  .attr({
       //    "x" : width, 
       //    "text-anchor" : "end"
       //  });

    }

    update();

   
    // Udate the text info section
    updateInfoDiv(parseInt(userAmount), procedure, avg);

   

  
  }

  // RESIZE FUNCTIONS ------------- 

  d3.select(window).on('resize', resize);

  function resize() {

    getViewportDimensions();
    setSvgSize();

    d3.select("#background")
       .attr("width", width);

  // adjust the background rect label 
    console.log(bgMaxLabel);
    bgMaxLabel 
      .attr({
        "x" : width
      });

    // adjust the rect scale
    xScale 
      .range([0, width]);

    // adjust the background rect size
    bgRect
      .attr("width", width);



    // adjust the average rect size
    avgRect
      .attr({
        "width": function(d) {
          return xScale(d);
        } 
      });

    // adjust the average line
    avgRectLine
      .attr({
        "x1" : function(d) {
          return xScale(d);
        }, 
        "x2" : function(d) {
          return xScale(d);
        } 
      });

    // adjust the average label 

    avgRectLabel 
      .attr({
        "x" : function(d) {
          return xScale(d);
        }
      });

    // adjust the foreground (user) rect size
    fgRect
      .attr({
        "width": function(d) {
          return xScale(d);
        }
      });

    // adjust the foreground (user) rect label 
    fgLine
      .attr({
        "x1" : function(d) {
          return xScale(d);
        }, 
        "x2" : function(d) {
          return xScale(d);
        } 
      });

    // adjust the foreground (user) rect label
    fgLabel
      .attr({
        "x" : function(d) {
          return xScale(d);
        }
      });
    
  }

  // FASTCLICK ------------- 

  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
    }, false);
  }

})();
