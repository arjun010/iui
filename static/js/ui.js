(function(argument) {
	
	uiHandler = {};

	$("#leftPanelToggleButton").click(function(ev){
		toggleLeftPanel();
	});

	$("#rightPanelToggleButton").click(function(ev){
		toggleRightPanel();
	});


	function toggleLeftPanel(){
		if(globalVars.leftPanelStatus==1){ // left panel open
	    	$("#leftPanel").removeClass('show');
	    	$("#leftPanel").addClass('hide');
					
			$("#leftPanelToggleButton").removeClass('glyphicon-remove-circle');
			$("#leftPanelToggleButton").addClass('glyphicon-menu-hamburger');
			globalVars.leftPanelStatus = 0;
		}else{ // left panel closed
			$("#leftPanel").removeClass('hide');
	    	$("#leftPanel").addClass('show');
			
			$("#leftPanelToggleButton").removeClass('glyphicon-menu-hamburger');
			$("#leftPanelToggleButton").addClass('glyphicon-remove-circle');
			globalVars.leftPanelStatus = 1;
		}
		resizeMainContainer();
	}

	function toggleRightPanel(){
		if(globalVars.rightPanelStatus==1){ // right panel open
	    	$("#rightPanel").removeClass('show');
	    	$("#rightPanel").addClass('hide');
			
			$("#rightPanelToggleButton").removeClass('glyphicon-remove-circle');
			$("#rightPanelToggleButton").addClass('glyphicon-menu-hamburger');
			globalVars.rightPanelStatus = 0;
		}else{ // right panel closed
			$("#rightPanel").removeClass('hide');
	    	$("#rightPanel").addClass('show');
					
			$("#rightPanelToggleButton").removeClass('glyphicon-menu-hamburger');
			$("#rightPanelToggleButton").addClass('glyphicon-remove-circle');
			globalVars.rightPanelStatus = 1;
		}	
		resizeMainContainer();
	}

	function resizeMainContainer(){
		$("#mainContainer").removeClass();

        var d = document.getElementById('exploreVisLegendDiv');
		if(globalVars.leftPanelStatus==1){
			$("#mainContainer").addClass('col-md-9');
            d.style.left = ($("body").width()*0.55)+'px';
		}else if(globalVars.leftPanelStatus==0){
			$("#mainContainer").addClass('col-md-12');
            d.style.left = ($("body").width()*0.80)+'px';
		}
	}

	uiHandler.populateDataAttributeDropdowns = function (dataAttributesMap) {
		$(".categoricalAttributesDropdown").append($("<option></option>").val("").html(""));
		$(".numericalAttributesDropdown").append($("<option></option>").val("").html(""));
		for(var attribute in dataAttributesMap){
			if(dataAttributesMap[attribute]["isCategorical"]=="1"){
				$(".categoricalAttributesDropdown").append($("<option></option>").val(attribute).html(attribute));
			}
			if(dataAttributesMap[attribute]["isNumeric"]=="1"){
				$(".numericalAttributesDropdown").append($("<option></option>").val(attribute).html(attribute));
			}
		}

        $(".categoricalAttributesDropdown").append($("<option></option>").val("userDefined").html("Custom"));
        $(".numericalAttributesDropdown").append($("<option></option>").val("userDefined").html("Custom"));
	};

	/*
	uiHandler.populateDataAttributeContainer = function(){
		$("#dataAttributeWeightsDiv").html("");
		var htmlStr = "<table>";
		htmlStr += "<tr height=21px></tr>"

        for(var attribute in globalVars.dataAttributeMap){
			var tooltipStr = "<div>";

            tooltipStr += "<strong>Name: </strong>" + attribute + "<br>";

            if(globalVars.dataAttributeMap[attribute]['isCategorical']=='1' && globalVars.dataAttributeMap[attribute]['isNumeric']=='0'){
                var value = globalVars.dataAttributeMap[attribute]['domain'].slice(0,3).concat("...").join();
                tooltipStr += "<strong>Type: </strong>" + "Categorical" + "<br>";
                tooltipStr += "<strong>Domain: </strong>" + value + "<br>";
            }else if(globalVars.dataAttributeMap[attribute]['isNumeric']=='1'){
                var minVal = Math.min.apply(Math, globalVars.dataAttributeMap[attribute]['domain']);
                var maxVal = Math.max.apply(Math, globalVars.dataAttributeMap[attribute]['domain']);
                var value = minVal + "-" + maxVal;

                tooltipStr += "<strong>Type: </strong>" + "Numeric" + "<br>";
                tooltipStr += "<strong>Domain: </strong>" + value + "<br>";
            }

            tooltipStr += "</div>";

            htmlStr += "<tr height=45px>"
			htmlStr += "<td width=20% style='vertical-align:middle;font-size:9px'><b>"+attribute+"</b><br><i data-toggle='tooltip' data-html='true' title='"+tooltipStr+"' class='fa fa-info-circle' aria-hidden='true' style='font-size:10px'></i></td>"
			htmlStr += "<td width=80% style='vertical-align:middle'><div class='slider' style='width:90%;' name='"+attribute+"'></div></td>"			
			htmlStr += "</tr>"
		}
		htmlStr += "</table>"
		$("#dataAttributeWeightsDiv").html(htmlStr);
		$('[data-toggle="tooltip"]').tooltip();
		$(".slider").slider({min:0,max:1,step:0.01,value:0}).slider("pips",{rest: false}).slider("float");
	};

	 function adjustSliderWeights(newAttributeWeightMap) {
		 console.log(newAttributeWeightMap);
		 $(".slider").each(function(e){
			 var attribute = $(this).attr("name");
			 if(attribute in newAttributeWeightMap){
			 	$(this).slider({value: newAttributeWeightMap[attribute]});
			 }
		 });
	 }

	*/

	var maxBarWidth = 115//$("#leftPanel").width()-100;
	var minBarWidth = 5

	var barWidthToAttributeWeightScale = d3.scale.linear().domain([minBarWidth,maxBarWidth]).range([0,1]).clamp(true);
	var attributeWeightToBarWidthScale = d3.scale.linear().domain([0,1]).range([minBarWidth,maxBarWidth]).clamp(true);

	uiHandler.populateDataAttributeContainer = function () {
		$("#dataAttributeWeightsDiv").html("");
		var curNormalizedAttributeVector = ial.getAttributeWeightVector();

		var data = [];
		for(var attribute in curNormalizedAttributeVector){
			data.push({'label':attribute,'value':curNormalizedAttributeVector[attribute],'width':0.0});
		}

		var row = d3.select('#dataAttributeWeightsDiv')
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.attr("class","inforow")
			.style("margin-top","3px")
			.style("width",$("#leftPanel").width()-40);

		row.append("div")
			.attr("class","infolabel")
			.attr("flex","1")
			.html(function(d) {
				var tooltipStr = "<div>";
				var attribute = d.label;

				tooltipStr += "<strong>Name: </strong>" + attribute + "<br>";

				if(globalVars.dataAttributeMap[attribute]['isCategorical']=='1' && globalVars.dataAttributeMap[attribute]['isNumeric']=='0'){
					var value = globalVars.dataAttributeMap[attribute]['domain'].slice(0,3).concat("...").join();
                    value = value.replace(/'/g,"").replace(/"/g,"")
                    tooltipStr += "<strong>Type: </strong>" + "Categorical" + "<br>";
					tooltipStr += "<strong>Domain: </strong>" + value + "<br>";
				}else if(globalVars.dataAttributeMap[attribute]['isNumeric']=='1' && globalVars.dataAttributeMap[attribute]['isCategorical']=='0'){
					var minVal = Math.min.apply(Math, globalVars.dataAttributeMap[attribute]['domain']);
					var maxVal = Math.max.apply(Math, globalVars.dataAttributeMap[attribute]['domain']);
					var value = minVal + "-" + maxVal;

					tooltipStr += "<strong>Type: </strong>" + "Numeric" + "<br>";
					tooltipStr += "<strong>Domain: </strong>" + value + "<br>";
				}else if(globalVars.dataAttributeMap[attribute]['isNumeric']=='1' && globalVars.dataAttributeMap[attribute]['isCategorical']=='1'){
                    var minVal = Math.min.apply(Math, globalVars.dataAttributeMap[attribute]['domain']);
                    var maxVal = Math.max.apply(Math, globalVars.dataAttributeMap[attribute]['domain']);
                    var value = minVal + "-" + maxVal;

                    tooltipStr += "<strong>Type: </strong>" + "Numeric, Categorical" + "<br>";
                    tooltipStr += "<strong>Domain: </strong>" + value + "<br>";
                }

				tooltipStr += "</div>";
				return "<i data-toggle='tooltip' data-html='true' title='"+tooltipStr+"' class='fa fa-info-circle' aria-hidden='true' style='font-size:10px'></i> " + d.label;
			});

		$('[data-toggle="tooltip"]').tooltip();

		//var widthMap = {};
		row.append("svg")
		//.attr("height", 200)
			.attr("width", 200)
			.append("rect")
			.attr("class","infobar")
			.attr("id",function (d) {
				return "attributeWeightBar_" + d.label;
			})
			.attr("width", function(d) {
				d.width = attributeWeightToBarWidthScale(d.value);
				return d.width + "px";
			})
			.attr("height",18)
			.call(d3.behavior.drag().on('drag', function(d) {
				var newWidth = d.width + d3.event.dx;
				if(newWidth<=maxBarWidth && newWidth>=minBarWidth && newWidth!=d.width){
					d.width = newWidth;
					d.value = parseFloat(Math.round(barWidthToAttributeWeightScale(newWidth)* 10000) / 10000).toFixed(2);
					d3.select(this).attr('width',d.width);

					// d3.select("#attributeWeightText_"+d.label).text(function () {
					// 	return d.value;
					// });
                    d3.selectAll(".infovalue").each(function (i) {
                       if(d3.select(this).attr("name")==d.label){
                           d3.select(this).text(function () {
                               return d.value;
                           })
                       }
                    });

                    if($("#groupDropdown").val()=="userDefined"){
                        $("#groupDropdown").val("").trigger("change");
                    }
                    if($("#colorDropdown").val()=="userDefined"){
                        $("#colorDropdown").val("").trigger("change");
                    }
                    if($("#sizeDropdown").val()=="userDefined"){
                        $("#sizeDropdown").val("").trigger("change");
                    }

				}
			}).on('dragend',function () {
                    var newWeightVector = {};
                    d3.selectAll('.infobar').each(function (d) {
                        newWeightVector[d.label] = parseFloat(d.value)
                    });
                    ial.setAttributeWeightVector(newWeightVector);
                    $("#interactionSuggestionText").text(brain.getInteractionSuggestion());
                    if(globalVars.currentView=="VisExplore"){
                        visExplorer.init();
                    }
                })
            );

		row.append("div")
			.attr("class","infovalue")
			.attr("id",function (d) {
				return "attributeWeightText_" + d.label;
			})
            .attr("name",function (d) {
                return d.label;
            })
			.text(function(d) {
				return parseFloat(Math.round(d.value* 10000) / 10000).toFixed(2);
			});
	};

	function adjustSliderWeights(newWeightVector){
		//console.log(newWeightVector)

        d3.selectAll('.infobar')
			.transition().duration(500)
			.attr('width', function (d) {
				d.value = newWeightVector[d.label];
				d.width = attributeWeightToBarWidthScale(d.value);
				return d.width;
			});

		d3.selectAll('.infovalue')
			.style('opacity',1)
			.text(function(d) {
				return parseFloat(Math.round(d.value * 10000) / 10000).toFixed(2);
			});

        $("#interactionSuggestionText").text(brain.getInteractionSuggestion());
	}

	$("#applyAttributeWeightsButton").click(function(){
        // main.applyUserDefinedAttributeWeightVector();
	});

    $("#groupByClusters").click(function(){
        $("#groupDropdown").val("userDefined")

        globalVars.clusteringAttribute = "userDefined";

        // main.applyUserDefinedAttributeWeightVector();
        var ialClusters = ial.createClusters();
        // globalVars.clusterList = utils.cloneObj(ialClusters);

        toggleLegendBox();

        globalVars.ialIdToDataMap = ial.getIalIdToDataMap();
        graphRenderer.createClusters("ial.KNNClusterId","l-r-by-count");
        uiHandler.updateClusterLegend(globalVars.clusterList)

        if($("#groupDropdown").val()==$("#colorDropdown").val()){
            uiHandler.updateClusterLegend(globalVars.clusterList,globalVars.colorScale)
            uiHandler.updateColorLegend([])
        }else {
            uiHandler.updateClusterLegend(globalVars.clusterList);
            if($("#groupDropdown").val()==""){
                uiHandler.updateClusterLegend([])
            }
        }
    });

    $("#colorByClusters").click(function(){
        $("#colorDropdown").val("userDefined");

        globalVars.coloringAttribute = "userDefined";

        // main.applyUserDefinedAttributeWeightVector();
        var ialClusters = ial.createClusters();
        globalVars.ialIdToDataMap = ial.getIalIdToDataMap();
        graphRenderer.colorPoints("ial.KNNClusterId");

        toggleLegendBox();

        if($("#groupDropdown").val()==$("#colorDropdown").val()){
            uiHandler.updateClusterLegend(globalVars.clusterList,globalVars.colorScale)
            uiHandler.updateColorLegend([])
        }else {
            uiHandler.updateColorLegend(globalVars.colorList,globalVars.colorScale)
            if($("#groupDropdown").val()==""){
                uiHandler.updateClusterLegend([])
            }
        }

        toggleLegendBox();
    });

    $("#sizeByItemScore").click(function(){
        $("#sizeDropdown").val("userDefined")

        globalVars.sizingAttribute = "userDefined";

        // main.applyUserDefinedAttributeWeightVector();
        globalVars.ialIdToDataMap = ial.getIalIdToDataMap();
        graphRenderer.resizePoints("ial.itemScore");

        var minVal = undefined, maxVal = undefined;
        for(var dataObj of globalVars.dataObjectList){
            if(minVal==undefined){
                minVal = dataObj.ial.itemScore;
            }else {
                if(minVal>dataObj.ial.itemScore){
                    minVal = dataObj.ial.itemScore;
                }
            }
            if(maxVal==undefined){
                maxVal = dataObj.ial.itemScore;
            }else {
                if(maxVal<dataObj.ial.itemScore){
                    maxVal = dataObj.ial.itemScore;
                }
            }
        }
        $("#numericalAttributeFilterSlider").show();
        $("#numericalAttributeFilterSlider").slider({
            min:minVal,max:maxVal,range: true, values: [minVal,maxVal],
            slide: function(event, ui) {
                filterBySizingAttributeValue(ui.values)
            }
        }).slider("pips",{rest: false}).slider("float");


    });
    

    $("#groupDropdown").change(function () {
        var attribute = $("#groupDropdown").val();

        globalVars.clusteringAttribute = attribute;

        toggleLegendBox();

        if(attribute=="userDefined"){
            $( "#groupByClusters" ).trigger( "click" );
        }else {
            graphRenderer.createClusters(attribute);
        }

        if($("#groupDropdown").val()==$("#colorDropdown").val()){
            uiHandler.updateClusterLegend(globalVars.clusterList,globalVars.colorScale)
            uiHandler.updateColorLegend([])
        }else {
            uiHandler.updateClusterLegend(globalVars.clusterList)
            if($("#colorDropdown").val()!=""){
                uiHandler.updateColorLegend(globalVars.colorList,globalVars.colorScale)
            }
        }

    });

    $("#colorDropdown").change(function () {
        var attribute = $("#colorDropdown").val();

        globalVars.coloringAttribute = attribute;

        toggleLegendBox();

        if(attribute=="userDefined"){
            $( "#colorByClusters" ).trigger( "click" );
        }else {
            graphRenderer.colorPoints(attribute);
        }

        if($("#groupDropdown").val()==$("#colorDropdown").val()){
            uiHandler.updateClusterLegend(globalVars.clusterList,globalVars.colorScale)
            uiHandler.updateColorLegend([])
        }else {
            uiHandler.updateColorLegend(globalVars.colorList,globalVars.colorScale)
        }
    });

    $("#sizeDropdown").change(function () {
        var attribute = $("#sizeDropdown").val();
        clearSizingAttributeFilter()

        globalVars.sizingAttribute = attribute;

        if(attribute=="userDefined"){
            $( "#sizeByItemScore" ).trigger( "click" );
            var minVal = undefined, maxVal = undefined;
            for(var dataObj of globalVars.dataObjectList){
                if(minVal==undefined){
                    minVal = dataObj.ial.itemScore;
                }else {
                    if(minVal>dataObj.ial.itemScore){
                        minVal = dataObj.ial.itemScore;
                    }
                }
                if(maxVal==undefined){
                    maxVal = dataObj.ial.itemScore;
                }else {
                    if(maxVal<dataObj.ial.itemScore){
                        maxVal = dataObj.ial.itemScore;
                    }
                }
            }
            $("#numericalAttributeFilterSlider").show();
            $("#numericalAttributeFilterSlider").slider({
                min:minVal,max:maxVal,range: true, values: [minVal,maxVal],
                slide: function(event, ui) {
                    filterBySizingAttributeValue(ui.values)
                }
            }).slider("pips",{rest: false}).slider("float");
        }else if(attribute!=""){
            graphRenderer.resizePoints(attribute);
            $("#numericalAttributeFilterSlider").show();
            // console.log(globalVars.dataAttributeMap, d3.min(globalVars.dataAttributeMap[attribute]['domain']))
            var minVal = d3.min(globalVars.dataAttributeMap[attribute]['domain']);
            var maxVal = d3.max(globalVars.dataAttributeMap[attribute]['domain']);
            // $("#numericalAttributeFilterSlider").slider({min:minVal,max:maxVal}).slider("pips",{rest: false}).slider("float");
            $("#numericalAttributeFilterSlider").slider({
                min:minVal,max:maxVal,range: true, values: [minVal,maxVal],
                slide: function(event, ui) {
                    filterBySizingAttributeValue(ui.values)
                }
            }).slider("pips",{rest: false}).slider("float");
        }else {
            $("#numericalAttributeFilterSlider").hide();
            // clearSizingAttributeFilter();
            graphRenderer.resizePoints(attribute);
        }
    });

    function toggleLegendBox() {

        if($("#groupDropdown").val()=="" && $("#colorDropdown").val()==""){
            globalVars.showLegendBox = false;
        }else {
            globalVars.showLegendBox = true;
        }

        console.log(globalVars.showLegendBox)

        if(globalVars.showLegendBox){
            $("#exploreVisLegendDiv").show();
        }else {
            $("#exploreVisLegendDiv").hide();
        }
    }

	uiHandler.updateDetailsTable = function (dataPoints) {

		var dataAttributes = Object.keys(globalVars.dataAttributeMap);
		// var nameAttributeIndex = dataAttributes.indexOf("Name");
		// if(nameAttributeIndex!=-1){
		// 	var tmp = dataAttributes[0];
		// 	dataAttributes[0] = dataAttributes[nameAttributeIndex];
		// 	dataAttributes[nameAttributeIndex] = tmp;
		// }
		var data = new google.visualization.DataTable();
		// console.log(dataAttributes, globalVars.dataAttributeMap)

		for(var dataAttribute of dataAttributes){
			if(globalVars.dataAttributeMap[dataAttribute]["isNumeric"]=="1"){
				data.addColumn('number', dataAttribute);
			}else if(globalVars.dataAttributeMap[dataAttribute]["isCategorical"]=="1" && globalVars.dataAttributeMap[dataAttribute]["isNumeric"]=="0"){
				data.addColumn('string', dataAttribute);
			}
		}

		for(var dataPoint of dataPoints){
			var dataRow = [];
			for(var dataAttribute of dataAttributes){
				if(globalVars.dataAttributeMap[dataAttribute]["isNumeric"]=="1"){
					dataRow.push(parseFloat(dataPoint[dataAttribute]));
				}else if(globalVars.dataAttributeMap[dataAttribute]["isCategorical"]=="1" && globalVars.dataAttributeMap[dataAttribute]["isNumeric"]=="0"){
					dataRow.push(dataPoint[dataAttribute]);
				}
				// dataRow.push(dataPoint[dataAttribute]);
			}
			data.addRow(dataRow);
		}

		/*
		for (var i = 0; i < data.getNumberOfRows(); i++) {
			for (var j = 0; j < data.getNumberOfColumns(); j++) {
				data.setProperty(i, j, 'className', 'row_' + i + ' column_' + j);
			}
		}
		*/

		table = new google.visualization.Table(document.getElementById('detailsTableDiv'));

		table.draw(data, {showRowNumber: false, width: '100%', height: '95%'});

		/*
		$('#detailsTableDiv td').mouseover(function (e) {
			var row, column;
			var classNames = this.className;
			var match = classNames.match(/row_(\d)+/i);
			if (match.length > 1) {
				row = match[1];
			}
			match = classNames.match(/column_(\d)+/i);
			if (match.length > 1) {
				column = match[1];
			}

			if (row != null) {
				// then we have moused over a data row
				console.log(row, column)
			}
		});
		*/
	};
	
	uiHandler.showEmptyDetailsTable = function () {
		var dataAttributes = Object.keys(globalVars.dataAttributeMap);
		
		var data = new google.visualization.DataTable();
		
		
		for(var dataAttribute of dataAttributes){
			if(globalVars.dataAttributeMap[dataAttribute]["isNumeric"]=="1"){
				data.addColumn('number', dataAttribute);
			}else if(globalVars.dataAttributeMap[dataAttribute]["isCategorical"]=="1" && globalVars.dataAttributeMap[dataAttribute]["isNumeric"]=="0"){
				data.addColumn('string', dataAttribute);
			}
		}

		table = new google.visualization.Table(document.getElementById('detailsTableDiv'));

		table.draw(data, {showRowNumber: false, width: '100%', height: '95%'});
	};

	$("#adjustWeightsUsingSelectedPointsButton").click(function (elm) {
		var newAttributeWeightMap = ial.generateAttributeWeightVectorUsingSimilarity(globalVars.selectedPoints);
		adjustSliderWeights(newAttributeWeightMap)
	});

	$("#adjustWeightsUsingDifferencesInLikedAndDislikedPointsButton").click(function (elm) {
        var newAttributeWeightMap = ial.generateAttributeWeightVectorUsingDifferences(globalVars.likedPoints,globalVars.dislikedPoints);
        adjustSliderWeights(newAttributeWeightMap)
	});

    $("#adjustWeightsUsingLikedPointsButton").click(function (elm) {
        var newAttributeWeightMap = ial.generateAttributeWeightVectorUsingSimilarity(globalVars.likedPoints);
        adjustSliderWeights(newAttributeWeightMap)
    });

    $("#adjustWeightsUsingDislikedPointsButton").click(function (elm) {
        var newAttributeWeightMap = ial.generateAttributeWeightVectorUsingSimilarity(globalVars.dislikedPoints);
        adjustSliderWeights(newAttributeWeightMap)
    });

	$("#nullifyAttributeWeightsButton").click(function (elm) {
		ial.nullifyAttributeWeightVector();
        adjustSliderWeights(ial.getAttributeWeightVector());
		if($("#groupDropdown").val()=="userDefined"){
            $("#groupDropdown").val("").trigger("change");
        }
        if($("#colorDropdown").val()=="userDefined"){
            $("#colorDropdown").val("").trigger("change");
        }
        if($("#sizeDropdown").val()=="userDefined"){
            $("#sizeDropdown").val("").trigger("change");
        }
	});

	$("#resetAttributeWeightsButton").click(function (ev) {
		ial.resetAttributeWeightVector();
		adjustSliderWeights(ial.getAttributeWeightVector());
		if($("#groupDropdown").val()=="userDefined"){
            $("#groupDropdown").val("").trigger("change");
        }
        if($("#colorDropdown").val()=="userDefined"){
            $("#colorDropdown").val("").trigger("change");
        }
        if($("#sizeDropdown").val()=="userDefined"){
            $("#sizeDropdown").val("").trigger("change");
        }
	});
	
	$("#dashboardViewButton").click(function (ev) {
		$("#exploreView").hide();
		$("#provenanceView").hide();
		$("#dashboardVis").show();
        $("#mainCanvasBody").css('overflow-y','auto');
        globalVars.currentView = "VisExplore";
        if(globalVars.likedPoints.length>0){
            visExplorer.init();
        }
	});

	$("#exploreViewButton").click(function (ev) {
		$("#provenanceView").hide();
        $("#mainCanvasBody").css('overflow-y','');
		$("#dashboardVis").hide();
		$("#exploreView").show();
        globalVars.currentView = "DataExplore";
	});

	$("#provenanceViewButton").click(function (ev) {
        $("#mainCanvasBody").css('overflow-y','');
        $("#exploreView").hide();
		$("#dashboardVis").hide();
		$("#provenanceView").show();
	});

	$("#clearSelectedPointsButton").click(function (ev) {
		globalVars.selectedPoints.length = 0;
		uiHandler.showEmptyDetailsTable();
		d3.selectAll(".node").classed("selectedNode",false)
	});

    uiHandler.updateClusterLegend = function (data,colorScale) {
        drawLegend("#clusterLegend",data,colorScale,'cluster');
    };

    uiHandler.updateColorLegend = function (data,colorScale) {
        // console.log(data,colorScale)
        drawLegend("#colorLegend",data,colorScale,'color');
    };
    
    function drawLegend(divId,data,colorScale, legendType) {
        
        $(divId).html('');
        var dataMaxVal;
        
        if(data.length>0){
            dataMaxVal = -1;
            for(var i in data){
                var val = data[i]['count'];
                if(dataMaxVal<val){
                    dataMaxVal = val;
                }
            }
        }
        var scale = d3.scale.linear()
            .domain([0,dataMaxVal])
            .range([5,80]);

        var row = d3.select(divId)
            .selectAll("div")
            .data(data)
            .enter()
            .append("div")
            .attr("class","legendinforow")
            .style("margin-top","3px")
            .style("width","250px");


        row.append("div")
            .attr("class","infolabelcolorbox")
            .attr("flex","1")
            .style("background-color", function (d) {
                if(colorScale==undefined){
                    return "none"
                }else {
                    return colorScale(d.label);
                }
            });


        var infolabelclass = 'legendinfolabel';
        infolabelclass += ' nocolorbox';

        row.append("div")
            .attr("class",infolabelclass)
            .attr("flex","1")
            .style("margin-left","5px")
            .text(function(d) { return d.label; })
            .on("mouseover",function(d){
                legendRowMouseoverHandler(d,legendType)
            })
            .on("mouseout",legendRowMouseoutHandler);

		row.append("svg")
            .attr("width",80)
            .append("rect")
            .attr("class","legendinfobar")
            // .style("background-color","steelblue")
            // .style("fill","steelblue")
            .style("width", function(d) { return scale(d.count) + "px"; })
            .on("mouseover",function(d){
                legendRowMouseoverHandler(d,legendType)
            })
            .on("mouseout",legendRowMouseoutHandler);

        row.append("div")
            .attr("class","legendinfovalue")
            .text(function(d) {
                return d.count;
            });

        if(legendType=='cluster'){
            row.append("div")
                .attr("class","legendinfoicon")
                .attr("id",function (d) {
                    return "clusterIcon_"+d.label;
                })
                .html(function(d) {
                    return "<span class='fa fa-info-circle'></span>";
                })
                .style("cursor","pointer")
                .on("click",legendIconClickHandler);
        }
    }

	function legendIconClickHandler(d) {

        $('#clusterDetailsModal').modal('show');
        $(".curClusterText").html(d.label);
        $(".curClusterPointCount").html(d.points.length);

        //d3.select("#clusterAttributeLevelSummaryReason").append('title').text(function(){return "Hello World";});

        drawAttributeSummaryChartsForCluster(d.points);

        var clusterPoints = d.points;

        $("#selectAllPointsInCluster").click(function () {
            for(var clusterPoint of clusterPoints){
                d3.selectAll('.node').each(function (curNode) {
                    if(clusterPoint.ial.id == curNode.ial.id){
                        if(utils.objectInList(curNode,globalVars.selectedPoints)==false){
                            if(!d3.select(this).classed('selectedNode')){
                                d3.select(this).classed('selectedNode',true);
                            }
                            globalVars.selectedPoints.push(curNode);
                        }
                    }
                })
            }
            uiHandler.updateDetailsTable(globalVars.selectedPoints);
            var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.selectedPoints);
            // console.log(brainOpt)
            if(brainOpt.canSuggest){
                var suggestion = new Suggestion('AttributeWeightVector');
                suggestionManager.addSuggestion(suggestion);
				suggestion.setExistingValue(ial.getAttributeWeightVector());
				suggestion.setSuggestedValue(brainOpt.suggestedVector);
                $(".newSuggestionsCount").text(suggestionManager.getUnseenSuggestionsCount())
            }
        });

        $("#likeAllPointsInCluster").click(function () {
            for(var clusterPoint of clusterPoints){
                d3.selectAll('.node').each(function (curNode) {
                    if(clusterPoint.ial.id == curNode.ial.id){
                        addPointToLikedList(curNode,this)
                        // if(utils.objectInList(curNode,globalVars.likedPoints)==false){
                        //     if(!d3.select(this).classed('likedNode')){
                        //         d3.select(this).classed('likedNode',true);
                        //     }
                        //     globalVars.likedPoints.push(curNode);
                        // }
                    }
                })
            }
            checkForAttributeVectorSuggestionUsingSpecialPoints();
            computeAndSuggestNewDataPoint();
        });

        $("#dislikeAllPointsInCluster").click(function () {
            for(var clusterPoint of clusterPoints){
                d3.selectAll('.node').each(function (curNode) {
                    if(clusterPoint.ial.id == curNode.ial.id){
                        addPointToDislikedList(curNode,this)
                        // if(utils.objectInList(curNode,globalVars.dislikedPoints)==false){
                        //     if(!d3.select(this).classed('dislikedNode')){
                        //         d3.select(this).classed('dislikedNode',true);
                        //     }
                        //     globalVars.dislikedPoints.push(curNode);
                        // }
                    }
                })
            }
            checkForAttributeVectorSuggestionUsingSpecialPoints();
            computeAndSuggestNewDataPoint();
        });

	}

    function drawAttributeSummaryChartsForCluster(clusterPoints) {
        $("#curClusterChartsContainer").html('');
        var curAttributeVector = ial.getAttributeWeightVector();
        for(var attribute in curAttributeVector){
            if(attribute=="Name"){
                continue;
            }
            var chartObj;
            if(curAttributeVector[attribute]>0){
                if(utils.isOnlyCategoricalAttribute(attribute)){
                    chartObj = new VisObject("Bar");
                    chartObj.setXAttr(attribute);
                    chartObj.setYAttr(attribute);
                    chartObj.setYTransform("COUNT");
                }else if(utils.isCategoicalAndNumericAttribute(attribute)){
                    chartObj = new VisObject("Bar");
                    chartObj.setXAttr(attribute);
                    chartObj.setYAttr(attribute);
                    chartObj.setYTransform("COUNT");
                }else if(utils.isOnlyNumericalAttribute(attribute)){
                    chartObj = new VisObject("Histogram");
                    chartObj.setXAttr(attribute);
                }

                var chartCardId = "clusterModalChartCard-" + attribute;
                chartCardId = chartCardId.replace(/ /g,"");
                var visCardObj = new VisCard();
                visCardObj.setAttributes(attribute);
                visCardObj.setVisObject(chartObj);
                globalVars.cardMap[chartCardId] = visCardObj;
                var chartCardHTML = "<div class='clusterModalChartCard' id='"+chartCardId+"'><span class='fa fa-bookmark cardBookmark' style='float: right;'></span></div>";
                $("#curClusterChartsContainer").append(chartCardHTML);
                // console.log(chartObj)
                visRenderer.renderChart(clusterPoints,chartObj,"#"+chartCardId);
            }
        }
        uiHandler.bindCardBookmarkEvents();
    }

    $('#clusterDetailsModal').on('hidden.bs.modal', function () {
        $("#curClusterChartsContainer").html(''); // to clear svg elements when not in use
    });

    function legendRowMouseoverHandler(hoveredObj,hoverLegendType) {
        d3.selectAll(".legendinforow").each(function (d) {
            if(d==hoveredObj){
                if(!d3.select(this).classed("hoveredLegendRow")){
                    d3.select(this).classed("hoveredLegendRow",true)
                }
            }
        });
        d3.selectAll(".node").each(function (d) {
            if(hoverLegendType=='color'){
                if(globalVars.coloringAttribute=='userDefined'){
                    var pointId = d.ial.id;
                    var clusterId = globalVars.ialIdToDataMap[pointId].ial.KNNClusterId;
                    if(clusterId == hoveredObj.label){
                        if(!d3.select(this).classed('highlightedNode')){
                            d3.select(this).classed('highlightedNode',true)
                        }
                    }else {
                        if(!d3.select(this).classed('fadedNode')){
                            d3.select(this).classed('fadedNode',true)
                        }
                    }
                }else {
                    var pointVal = d[globalVars.coloringAttribute];
                    if(pointVal==hoveredObj.label){
                        if(!d3.select(this).classed('highlightedNode')){
                            d3.select(this).classed('highlightedNode',true)
                        }
                    }else {
                        if(!d3.select(this).classed('fadedNode')){
                            d3.select(this).classed('fadedNode',true)
                        }
                    }
                }
            }else if(hoverLegendType=='cluster'){
                if(globalVars.clusteringAttribute=='userDefined'){
                    var pointId = d.ial.id;
                    var clusterId = globalVars.ialIdToDataMap[pointId].ial.KNNClusterId;
                    console.log(clusterId,hoveredObj.label)
                    if(clusterId == hoveredObj.label){
                        if(!d3.select(this).classed('highlightedNode')){
                            d3.select(this).classed('highlightedNode',true)
                        }
                    }else {
                        if(!d3.select(this).classed('fadedNode')){
                            d3.select(this).classed('fadedNode',true)
                        }
                    }
                }else {
                    var pointVal = d[globalVars.clusteringAttribute];
                    if(pointVal==hoveredObj.label){
                        if(!d3.select(this).classed('highlightedNode')){
                            d3.select(this).classed('highlightedNode',true)
                        }
                    }else {
                        if(!d3.select(this).classed('fadedNode')){
                            d3.select(this).classed('fadedNode',true)
                        }
                    }
                }
            }
        })
    }

    function legendRowMouseoutHandler() {
        d3.selectAll(".node").classed('highlightedNode',false);
        d3.selectAll(".node").classed('fadedNode',false);
        d3.selectAll(".legendinforow").classed("hoveredLegendRow",false);
    }

    function filterBySizingAttributeValue(valueRange) {
        var minVal = valueRange[0];
        var maxVal = valueRange[1];
        d3.selectAll('.node').each(function (d) {
            if(globalVars.sizingAttribute=="userDefined"){
                var dataPointVal = d.ial.itemScore;
            }else {
                var dataPointVal = d[globalVars.sizingAttribute];
            }
            if(dataPointVal<minVal || dataPointVal>maxVal){
                if(!d3.select(this).classed('filteredNode')){
                    d3.select(this).classed('filteredNode',true);
                }
            }else {
                if(d3.select(this).classed('filteredNode')){
                    d3.select(this).classed('filteredNode',false);
                }
            }
        })
    }

    function clearSizingAttributeFilter() {
        d3.selectAll('.node').classed('filteredNode',false);
    }

    $("#printWeightVectorButton").click(function (elm) {
        console.log(ial.getAttributeWeightVector())
    });

	$("#suggestsionsBadge").click(function (elm) {
		showSuggestionsModal();
	});

	function showSuggestionsModal() {
		$("#suggestionsModal").modal('show');
		$("#attributeWeightVectorComparisonDiv").hide();

		$("#suggestionListDiv").html('');
		var mainSuggestionDiv = d3.select("#suggestionListDiv");

		var suggestionDivs = mainSuggestionDiv.selectAll(".suggestion")
								.data(globalVars.suggestions)
								.enter()
								.append("div")
								.text(function (d) {
									return d.type;
								})
								.attr("class",function (d) {
									if(d.seen){
										return "suggestion seen"
									}else {
										return "suggestion"
									}
								})
								.on("click",function (d) {
									if(!d.seen){
										d.seen = true;
										d3.select(this).classed("seen",true);
										$(".newSuggestionsCount").text(suggestionManager.getUnseenSuggestionsCount());
									}
									suggestionClickHandler(d);
								});

		suggestionDivs.append("span")
			.text(function (d) {
				return d.timeStamp
			})
			.style("float","right");

		suggestionDivs.append("hr");

	}

	function drawHorizontalBarsForWeightVector(divId,data,colorMap) {
		$(divId).html('');
		var dataMaxVal;

		if(data.length>0){
			dataMaxVal = -1;
			for(var i in data){
				var val = data[i]['weight'];
				if(dataMaxVal<val){
					dataMaxVal = val;
				}
			}
		}

		var scale = d3.scale.linear()
			.domain([0,dataMaxVal])
			.range([5,80]);

		var row = d3.select(divId)
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.attr("class","legendinforow")
			.style("margin-top","3px")
			.style("width","250px");
		

		var infolabelclass = 'legendinfolabel';
		infolabelclass += ' nocolorbox';

		row.append("div")
			.attr("class",infolabelclass)
			.attr("flex","1")
			.style("margin-left","5px")
			.text(function(d) { return d.label; });

		row.append("svg")
			.attr("width",80)
			.append("rect")
			.attr("class","legendinfobar")
			.style("width", function(d) { return scale(d.weight) + "px"; })
			.style("fill",function (d) {
				return colorMap[d.label];
			});

		row.append("div")
			.attr("class","legendinfovalue")
			.text(function(d) {
				return parseFloat(Math.round(d.weight* 10000) / 10000).toFixed(2);
				// return d.weight
			});

	}

	function suggestionClickHandler(suggestion) {
		$("#suggestionListDiv").hide();
		$("#attributeWeightVectorComparisonDiv").show();
		var activeVectorDataList = [], colorMap = {};
		for(var attribute in suggestion.existingValue){
			activeVectorDataList.push({
				"label":attribute,
				"weight":suggestion.existingValue[attribute]
			});
			colorMap[attribute] = "steelblue";
		}
		drawHorizontalBarsForWeightVector("#activeAttributeWeightVectorDiv",activeVectorDataList,colorMap);
		
		activeVectorDataList = [], colorMap = {};
		for(var attribute in suggestion.suggestedValue){
			activeVectorDataList.push({
				"label":attribute,
				"weight":suggestion.suggestedValue[attribute]
			});
			var suggestedWeight = parseFloat(Math.round(suggestion.suggestedValue[attribute]* 10000) / 10000).toFixed(2);
			var currentWeight = parseFloat(Math.round(suggestion.existingValue[attribute]* 10000) / 10000).toFixed(2);
			if(suggestedWeight<currentWeight){
				colorMap[attribute] = "red";
			}else if(suggestedWeight>currentWeight){
				colorMap[attribute] = "green";
			}else {
				colorMap[attribute] = "steelblue";				
			}
		}
		drawHorizontalBarsForWeightVector("#suggestedAttributeWeightVectorDiv",activeVectorDataList,colorMap);

		$("#applySuggestedAttributeVectorButton").click(function (elm) {
			ial.setAttributeWeightVector(suggestion.suggestedValue);
			adjustSliderWeights(suggestion.suggestedValue);
		});
	}

	$("#returnToSuggestionsListButton").click(function (elm) {
		$("#attributeWeightVectorComparisonDiv").hide();
		$("#suggestionListDiv").show();
	});

    $('#suggestionsModal').on("hidden.bs.modal", function () {
        $("#attributeWeightVectorComparisonDiv").hide();
        $("#suggestionListDiv").show();
    });

    $("#whatNextIcon").click(function(elm){
        $("#whatNextModal").modal('show');
        $("#whatsNextSuggestions").html('');

        if($("#groupDropdown").val()==''){
            for(var attribute in globalVars.dataAttributeMap){
                if(globalVars.dataAttributeMap[attribute]['isCategorical']=='1'){
                    if(globalVars.dataAttributeMap[attribute]['domain'].length<=12){
                        if($("#sizeDropdown").val()!=attribute && $("#colorDropdown").val()!=attribute){
                            $("#whatsNextSuggestions").append("<p>Try <b>grouping</b> data points by the <b>" + attribute + "</b> attribute.")
                            break;
                        }
                    }
                }
            }
        }

        if($("#colorDropdown").val()==''){
            for(var attribute in globalVars.dataAttributeMap){
                if(globalVars.dataAttributeMap[attribute]['isCategorical']=='1'){
                    if(globalVars.dataAttributeMap[attribute]['domain'].length<=6){
                        if($("#sizeDropdown").val()!=attribute && $("#groupDropdown").val()!=attribute){
                            $("#whatsNextSuggestions").append("<p>Try <b>coloring</b> data points by the <b>" + attribute + "</b> attribute.")
                            break;
                        }
                    }
                }
            }
        }
        ial.getAttributeVariance('Retail Price')
        ial.getAttributeVariance('Width')
        if($("#sizeDropdown").val()==''){
            var maxVarianceAttribute = undefined, maxVariance = undefined;
            for(var attribute in globalVars.dataAttributeMap){
                if(globalVars.dataAttributeMap[attribute]['isNumeric']=='1'){
                    if($("#colorDropdown").val()!=attribute && $("#groupDropdown").val()!=attribute){
                        var curAttributeVariance = ial.getAttributeVariance(attribute);
                        if(maxVariance==undefined){
                            maxVariance = curAttributeVariance;
                            maxVarianceAttribute = attribute;
                        }else{
                            if(maxVariance<curAttributeVariance){
                                maxVariance = curAttributeVariance;
                                maxVarianceAttribute = attribute;
                            }
                        }
                    }
                }
            }
            $("#whatsNextSuggestions").append("<p>Try <b>sizing</b> data points by the <b>" + maxVarianceAttribute + "</b> attribute.")
        }

        var curAttributeVector = ial.getAttributeWeightVector();
        var maxScore = undefined, maxScoreDataPoint = undefined;
        for(var d of globalVars.dataObjectList){
            if(utils.objectInList(d,globalVars.dislikedPoints)==false && utils.objectInList(d,globalVars.likedPoints)==false && utils.objectInList(d,globalVars.selectedPoints)==false){
                if(maxScore == undefined){
                    maxScore = d.ial.itemScore;
                    maxScoreDataPoint = d;
                }else{
                    if(maxScore< d.ial.itemScore){
                        maxScore = d.ial.itemScore;
                        maxScoreDataPoint = d;
                    }
                }
            }
        }

        $("#whatsNextSuggestions").append("<p>You might be interested in the data point <b>" + maxScoreDataPoint.Name + "</b>.")

    });

    uiHandler.bindCardBookmarkEvents = function () {
        $(".cardBookmark").click(function (evt) {
            //console.log(evt.target.parentElement.id);
            var cardId = evt.target.parentElement.id;
            var visCard = globalVars.cardMap[cardId];
            if(!d3.select(this).classed("bookmarked")){
                d3.select(this).classed("bookmarked",true);
                visCard.bookmark(true);
                showAddInsightModal(visCard);
            }else{
                d3.select(this).classed("bookmarked",false);
                visCard.bookmark(false);
            }
            //console.log(globalVars.cardMap[cardId]);
        });
    };

    var showAddInsightModal = function (visCard) {
        $("#addInsightModal").modal("show");
        $("#insightNotes").val('');
        $("#addInsightVis").html('');
        visRenderer.renderVisObject(visCard.visObject,"#addInsightVis")

        $("#saveInsight").click(function(evt){
            var insight = new Insight();
            insight.setVisObject(visCard.visObject);
            insight.setNotes($("#insightNotes").val());
            InsightManager.addInsight(insight);
            $("#saveInsight").unbind().click(function() {
                //Stuff
            });
            $("#addInsightModal").modal('hide');
        });

    };

    $("#allInsightsIcon").click(function(evt){
        $("#allInsightsModal").modal('show');
        $("#allInsightsDiv").html('');
        for(var index in globalVars.insights){
            var insight = globalVars.insights[index];
            var insightRowHTML = "<div style='height: 250px;'>";
            insightRowHTML += "<div style='float: right;font-size:10px;'>"+insight.timeStamp+"</div>";
            var rowTwo = "<br><div>";
            var insightVisThumbnailId = "insight"+index+"VisThumbnail";
            rowTwo += "<span style='float: left'><b>Notes:</b><br>"+insight.notes+"</span>";
            rowTwo += "<div style='float: right;margin-right:2px;' class='insightVisThumbnail' id='"+insightVisThumbnailId+"'></div>";
            rowTwo += "</div>";
            insightRowHTML += rowTwo;
            insightRowHTML += "</div><hr>";
            $("#allInsightsDiv").append(insightRowHTML);
            visRenderer.renderVisObject(insight.visObject,"#"+insightVisThumbnailId);
        }
    });

    $("#searchAttribute").change(function(evt){
        var searchAttribute = $("#searchAttribute").val();
        var availableValuesForAttribute = [];
        if(searchAttribute!=''){
            for(var dataObject of globalVars.dataObjectList){
                var val = dataObject[searchAttribute];
                if(availableValuesForAttribute.indexOf(val)==-1){
                    availableValuesForAttribute.push(val);
                }
            }
        }

        $( "#searchBox" ).autocomplete({
            source: availableValuesForAttribute,
            focus: function(event, ui){
                d3.selectAll(".node").classed("highlightedNode",false).classed("fadedNode",false);
                var searchValue = ui.item.value;
                $('#searchBox').val(searchValue);
                triggerSearchInViz(searchValue,searchAttribute)
            }
        });

        $("#searchBox").keyup(function (e) {
            var searchValue = document.getElementById("searchBox").value;
            triggerSearchInViz(searchValue,searchAttribute);
        });
    });


    var triggerSearchInViz = function(searchValue,searchAttribute) {
        if(searchValue==""){
            d3.selectAll(".node").classed("highlightedNode",false).classed("fadedNode",false);
        }else{
            d3.selectAll('.node').each(function (d) {
                if(d[searchAttribute]==searchValue){
                    if(!d3.select(this).classed("highlightedNode")){
                        d3.select(this).classed("highlightedNode",true)
                    }
                } else{
                    if(!d3.select(this).classed("fadedNode")){
                        d3.select(this).classed("fadedNode",true)
                    }
                }
            });
        }
    };

    uiHandler.bindVisCardQuestionMarkEvents = function () {
        //visCardQuestionMark
        //$(".visCardQuestionMark")
        d3.selectAll(".visCardQuestionMark").each(function (d) {
            var cardId = d3.select(this.parentNode).attr('id');
            var visCard = globalVars.cardMap[cardId];
            d3.select(this).attr('title', function () {
                return "Shown based on your interest in attribute(s): " + visCard.attributes.join(', ');
            })
        })
    };

})();