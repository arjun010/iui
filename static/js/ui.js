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
				}else if(globalVars.dataAttributeMap[attribute]['isNumeric']=='1'){
					var minVal = Math.min.apply(Math, globalVars.dataAttributeMap[attribute]['domain']);
					var maxVal = Math.max.apply(Math, globalVars.dataAttributeMap[attribute]['domain']);
					var value = minVal + "-" + maxVal;

					tooltipStr += "<strong>Type: </strong>" + "Numeric" + "<br>";
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
                    ial.setAttributeWeightVector(newWeightVector)
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
		console.log(newWeightVector)
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
	});

	$("#exploreViewButton").click(function (ev) {
		$("#provenanceView").hide();
		$("#dashboardVis").hide();
		$("#exploreView").show();
	});

	$("#provenanceViewButton").click(function (ev) {
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
                chartCardId = chartCardId.replace(/ /g,"")
                var chartCardHTML = "<div class='clusterModalChartCard' id='"+chartCardId+"'></div>";
                $("#curClusterChartsContainer").append(chartCardHTML);
                // console.log(chartObj)
                visRenderer.renderChart(clusterPoints,chartObj,"#"+chartCardId);
            }
        }
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

})();