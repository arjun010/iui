/**
 * Created by a.srinivasan on 7/19/16.
 */
(function () {
    visRenderer = {};

    visRenderer.renderChart = function (data,visObject,selector) {
        switch (visObject.chartType){
            case "Histogram":
                var labels = {
                    "xAttr" : visObject.xAttr,
                    "yAttr" : ""
                };
                drawHistogram(data,visObject,labels,selector);
                break;
            case "Bar":
                if(visObject.xAttr!="" && visObject.yAttr!=""){
                    var labels = {
                        "xAttr" : visObject.xAttr,
                        "yAttr" : visObject.yAttr
                    };
                    if(visObject.yTransform!=""){
                        labels.yAttr = visObject.yTransform + "(" + labels.yAttr + ")";
                    }

                    //drawTwoAttriubteBarChart(data,visObject.xAttr,visObject.yAttr,visObject.yTransform,labels,selector);
                    generateBarChart(data,visObject,labels,selector);
                }
                break;
            case "Scatterplot":
                if(visObject.xAttr!="" && visObject.yAttr!=""){
                    var labels = {
                        "xAttr" : visObject.xAttr,
                        "yAttr" : visObject.yAttr
                    };
                    if(visObject.xTransform!=""){
                        labels.xAttr = visObject.xTransform + "(" + labels.xAttr + ")";
                    }
                    if(visObject.yTransform!=""){
                        labels.yAttr = visObject.yTransform + "(" + labels.yAttr + ")";
                    }
                    /*
                     //TODO change this default as necessary
                     drawTwoAttributeScatterplot(data,visObject.xAttr,visObject.yAttr,visObject.xTransform,visObject.yTransform,tooltipLabelAttribute,labels,selector);
                     */
                    generateScatterplot(data,visObject,visObject.tooltipLabelAttribute,labels,selector);
                }
                break;
            default:
                break;
        }
    };

    visRenderer.renderVisObject = function (visObject,selector) {
        switch (visObject.chartType){
            case "Histogram":
                var labels = {
                    "xAttr" : visObject.xAttr,
                    "yAttr" : ""
                };
                renderHistogram(visObject.data,labels,selector);
                break;
            case "Bar":
                if(visObject.xAttr!="" && visObject.yAttr!=""){
                    var labels = {
                        "xAttr" : visObject.xAttr,
                        "yAttr" : visObject.yAttr
                    };
                    if(visObject.yTransform!=""){
                        labels.yAttr = visObject.yTransform + "(" + labels.yAttr + ")";
                    }

                    renderVerticalBarChart(visObject.data,visObject,labels,selector);
                }
                break;
            case "Scatterplot":
                if(visObject.xAttr!="" && visObject.yAttr!=""){
                    var labels = {
                        "xAttr" : visObject.xAttr,
                        "yAttr" : visObject.yAttr
                    };
                    if(visObject.xTransform!=""){
                        labels.xAttr = visObject.xTransform + "(" + labels.xAttr + ")";
                    }
                    if(visObject.yTransform!=""){
                        labels.yAttr = visObject.yTransform + "(" + labels.yAttr + ")";
                    }
                    renderScatterplot(visObject.data,visObject,labels,selector);
                }
                break;
            default:
                break;
        }
    };

    var drawHistogram = function (data,visObject,labels,selector) {
        var histogramData = dataTransformer.getDataForHistogram(data,visObject);
        visObject.setData(histogramData);
        renderHistogram(histogramData,labels,selector);
    };

    var generateBarChart = function(dataList,visObject,labels,selector){
        var barChartData = dataTransformer.getDataForBarChart(dataList,visObject);
        visObject.setData(barChartData);
        renderVerticalBarChart(barChartData,visObject,labels,selector);
    };

    var generateScatterplot = function(dataList,visObject,tooltipLabelAttribute,labels,selector){
        if(tooltipLabelAttribute==undefined || tooltipLabelAttribute==''){
            tooltipLabelAttribute = 'Name';
        }
        var scatterplotData = dataTransformer.getDataForScatterplot(dataList,visObject,tooltipLabelAttribute);
        visObject.setData(scatterplotData);
        renderScatterplot(scatterplotData,visObject,labels,selector);
    };

    var histogramTooltip = d3.tip().attr('class', 'd3-tip').html(function(d) {
        return d.y;
    });

    var barTooltip = d3.tip().attr('class', 'd3-tip').html(function(d) {
        var displayStr = "";
        displayStr += "<strong>Label:</strong> <span style='color:gold'>" + d.label + "</span><br/>";
        displayStr += "<strong>Value:</strong> <span style='color:gold'>" + d.value + "</span>";
        return displayStr;
    });

    var scatterplotTooltip = d3.tip().attr('class', 'd3-tip').html(function(d) {
        var displayStr = "";
        displayStr += "<span style='color:gold'>" + d.label + "</span>";
        return displayStr;
    });

    var labelFontSizeMap = {
        "xs":"6px",
        "s":"8px",
        "m":"10px",
        "l":"12px"
    };
    var tickFontSizeMap = {
        "xs":"2px",
        "s":"4px",
        "m":"6px",
        "l":"12px"
    };
    var labelFontSize = "";
    var tickFontSize = "";

    function updateTextSizes(divWidth,divHeight){
        // if (divWidth==undefined || divHeight==undefined){
        //   ret
        // }
        var divSize = parseFloat((divWidth*divHeight)/10000);
        if(divSize<=15){
            labelFontSize = labelFontSizeMap['s'];
            tickFontSize = tickFontSizeMap['s'];
        }else if( divSize>=16 && divSize<=22){
            labelFontSize = labelFontSizeMap['m'];
            tickFontSize = tickFontSizeMap['m'];
        }else if(divSize>=23){
            labelFontSize = labelFontSizeMap['l'];
            tickFontSize = tickFontSizeMap['l'];
        }
    }

    var renderHistogram = function(values,labels,selector,divWidth,divHeight){

        divWidth = typeof divWidth !== 'undefined' ? divWidth : $(selector).width();
        divHeight = typeof divHeight !== 'undefined' ? divHeight : $(selector).height();

        updateTextSizes(divWidth,divHeight);
        var formatCount = d3.format(",.0f");

        var margin = {top: divHeight*0.1, right: divWidth*0.10, bottom: divHeight*0.15, left: divWidth*0.15},
            width = divWidth - margin.left - margin.right,
            height = divHeight - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .domain([0, d3.max(values, function(d) { return d; })])
            .range([0, width]);

        // Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram()
            .bins(x.ticks(20))
        (values);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(histogramTooltip);

        var bar = svg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function(d) { return height - y(d.y); })
            .attr("fill","steelblue")
            .on('mouseover', histogramTooltip.show)
            .on('mouseout', histogramTooltip.hide);

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", x(data[0].dx) / 2)
            .attr("text-anchor", "middle")
            .style('font-size',labelFontSize)
            .text(function(d) { return formatCount(d.y); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append('text')
            .attr("y",margin.bottom*0.75)
            .attr("x",width/2)
            .attr("dy", ".71em")
            .style('font-size',labelFontSize)
            .text(labels.xAttr);

        // console.log(tickFontSize)
        svg.selectAll('.tick')
            .selectAll('text')
            .style('font-size',tickFontSize);

        svg.selectAll('.axis')
            .style('font',''+tickFontSize+' sans-serif');
        svg.selectAll('.axis path')
            .style('fill','none')
            .style('stroke','#000')
            .style('shape-rendering','crispEdges');
        svg.selectAll('.axis line')
            .style('fill','none')
            .style('stroke','#000')
            .style('shape-rendering','crispEdges');
        svg.selectAll('.bar text')
            .style('font',''+tickFontSize+' sans-serif')
            .style('fill','white');
    };

    var renderVerticalBarChart = function(data,visObject,labels,selector,divWidth,divHeight){

        divWidth = typeof divWidth !== 'undefined' ? divWidth : $(selector).width();
        divHeight = typeof divHeight !== 'undefined' ? divHeight : $(selector).height();

        var colorAttr = visObject.colorAttr;

        updateTextSizes(divWidth,divHeight);
        var margin = {top: divHeight*0.1, right: divWidth*0.10, bottom: divHeight*0.15, left: divWidth*0.15},
            width = divWidth - margin.left - margin.right,
            height = divHeight - margin.top - margin.bottom;

        var colorScale = d3.scale.category20();

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5);

        if(visObject.colorAttr!='' && visObject.colorAttr!=undefined){
            var svgWidth = width + margin.left + margin.right + margin.right;
        }else{
            var svgWidth = width + margin.left + margin.right;
        }

        var svg = d3.select(selector).append("svg")
            .attr("width", svgWidth)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(barTooltip);

        x.domain(data.map(function(d) { return d.label; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append('text')
            .attr("y",margin.bottom*0.75)
            .attr("x",width)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style('font-size',labelFontSize)
            .text(labels.xAttr);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y",0 - (margin.left*0.75))
            .attr("x",0-((height-margin.top-margin.bottom)/2))
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style('font-size',labelFontSize)
            .text(labels.yAttr);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.label); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", function(d){
                if('colorVal' in d){
                    return colorScale(d.colorVal);
                }else{
                    return "steelblue";
                }
            })
            .on('mouseover', barTooltip.show)
            .on('mouseout', barTooltip.hide);

        if(colorScale.domain().length>1){
            var legend = svg.selectAll(".legend")
                .data(colorScale.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + (10 + i * 20) + ")"; });

            svg.append("text")
                .attr("x", divWidth - margin.right + 18)
                .attr("y", 0)
                .style('font-size',labelFontSize)
                .style('font-weight','bold')
                .style("text-anchor", "end")
                .text(colorAttr)

            legend.append("rect")
                .attr("x", divWidth - margin.right)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", colorScale);

            legend.append("text")
                .attr("x", divWidth - margin.right - 4)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; })
                .style('font-size',labelFontSize);
        }

        // console.log(tickFontSize)
        // axes styling
        svg.selectAll('.axis')
            .style('font',''+tickFontSize+' sans-serif');

        svg.selectAll('.tick')
            .selectAll('text')
            .style('font',''+tickFontSize+' sans-serif');

        svg.selectAll('.axis path')
            .style('fill','none')
            .style('stroke','#000')
            .style('shape-rendering','crispEdges');
        svg.selectAll('.axis line')
            .style('fill','none')
            .style('stroke','#000')
            .style('shape-rendering','crispEdges');

    };

    var renderScatterplot = function (data, visObject, labels,selector,divWidth,divHeight) {

        divWidth = typeof divWidth !== 'undefined' ? divWidth : $(selector).width();
        divHeight = typeof divHeight !== 'undefined' ? divHeight : $(selector).height();

        var colorScale = d3.scale.category20();
        //console.log(divWidth,divHeight,selector)

        var xAttr = visObject.xAttr;
        var yAttr = visObject.yAttr;
        var colorAttr = visObject.colorAttr;
        var sizeAttr = visObject.sizeAttr;

        updateTextSizes(divWidth,divHeight);
        var margin = {top: divHeight*0.1, right: divWidth*0.30, bottom: divHeight*0.15, left: divWidth*0.15},
            width = divWidth - margin.left - margin.right,
            height = divHeight - margin.top - margin.bottom;

        if(dataProcessor.getAttributeDetails(xAttr)["isCategorical"]=="1" && dataProcessor.getAttributeDetails(xAttr)["isNumeric"]=="0")
        {
            var XExtentValue=[];
            for(i=0;i<data.length;i++)
            {
                XExtentValue.push(data[i].xVal);
            }
            XExtentValue = XExtentValue.filter(onlyUnique);
            var x= YScaleGenerator("ordinal", width, XExtentValue);
        }
        else
        {
            // var XExtentValue ;
            // XExtentValue = d3.extent(data, function(d) { return parseFloat(d.xVal); });
            // var x = XScaleGenerator("linear", width, XExtentValue);
            var x = d3.scale.linear().range([0, width]);
            x.domain(d3.extent(data, function(d) { return parseFloat(d.xVal); })).nice();
            //var curXDomainMin = x.domain()[0];
            //var curXDomainMax = x.domain()[1];
            //x.domain([curXDomainMin-(curXDomainMax*0.1),curXDomainMax+(curXDomainMax*0.1)])
        }

        if(dataProcessor.getAttributeDetails(yAttr)["isCategorical"]=="1" && dataProcessor.getAttributeDetails(yAttr)["isNumeric"]=="0")
        {
            var YExtentValue=[];
            for(i=0;i<data.length;i++)
            {
                YExtentValue.push(data[i].yVal);
            }
            YExtentValue = YExtentValue.filter(onlyUnique);
            var y= YScaleGenerator("ordinal", height, YExtentValue);
        }
        else
        {
            // var YExtentValue ;
            // YExtentValue = d3.extent(data, function(d) { return parseFloat(d.yVal); });
            // var y = XScaleGenerator("linear", height, YExtentValue);
            var y = d3.scale.linear().range([height, 0]);
            y.domain(d3.extent(data, function(d) { return parseFloat(d.yVal); })).nice();
            //var curYDomainMin = y.domain()[0];
            //var curYDomainMax = y.domain()[1];
            //x.domain([curYDomainMin-(curYDomainMax*0.1),curYDomainMax+(curYDomainMax*0.1)])
        }

        var sizeScale = undefined, sizeDomainList = []; ;


        if(sizeAttr!=undefined && sizeAttr!=''){
            sizeScale = d3.scale.linear().domain(d3.extent(data, function(d) { if(sizeDomainList.indexOf(parseFloat(d.sizeVal))==-1){sizeDomainList.push(parseFloat(d.sizeVal))};return parseFloat(d.sizeVal); })).range([2,8]);
            sizeDomainList.sort(function(a, b){return parseFloat(a)-parseFloat(b)});
        }

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("overflow","auto")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(scatterplotTooltip);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append('text')
            .attr("y",margin.bottom*0.75)
            .attr("x",width)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style('font-size',labelFontSize)
            .text(labels.xAttr);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y",0 - (margin.left*0.75))
            .attr("x",0-((height-margin.top-margin.bottom)/2))
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style('font-size',labelFontSize)
            .text(labels.yAttr);

        svg.selectAll(".dataPoint")
            .data(data)
            .enter().append("circle")
            .attr("class", "dataPoint")
            .style("stroke",'#ffffff')
            .style("opacity",0.7)
            .attr("r", function(d){
                if(sizeScale==undefined){
                    return 3.5
                }else{
                    return sizeScale(d.sizeVal)
                }
            })
            .attr("cx", function(d) { return x(d.xVal); })
            .attr("cy", function(d) { return y(d.yVal); })
            .style("fill", function(d){
                if('colorVal' in d){
                    return colorScale(d.colorVal);
                }else{
                    return "steelblue";
                }
            })
            .on('mouseover', scatterplotTooltip.show)
            .on('mouseout', scatterplotTooltip.hide);

        if(colorScale.domain().length>1){
            var legend = svg.selectAll(".legend")
                .data(colorScale.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + (10 + i * 20) + ")"; });


            svg.append("text")
                .attr("x", divWidth - margin.right + 18 )
                .attr("y", 0)
                .style('font-size',labelFontSize)
                .style('font-weight','bold')
                .style("text-anchor", "end")
                .text(colorAttr)

            legend.append("rect")
                .attr("x", divWidth - margin.right)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", colorScale);

            legend.append("text")
                .attr("x", divWidth - margin.right - 4)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; })
                .style('font-size',labelFontSize);
        }

        if(sizeScale!=undefined){
            var legend = svg.selectAll(".legend")
                .data(sizeDomainList)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + (20 + i * 20) + ")"; });


            svg.append("text")
                .attr("x", divWidth - margin.right )
                .attr("y", 0)
                .style('font-size',labelFontSize)
                .style('font-weight','bold')
                .style("text-anchor", "end")
                .text(sizeAttr)

            legend.append("circle")
                .attr("cx", divWidth - margin.right)
                .attr("r", function(d){
                    return sizeScale(d)
                })
                .style("fill", function(d){
                    return "steelblue";
                });

            legend.append("text")
                .attr("x", divWidth - margin.right - 10)
                .attr("y", 2)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; })
                .style('font-size',labelFontSize);
        }

        // console.log(tickFontSize)
        // axes styling
        svg.selectAll('.axis')
            .style('font',''+tickFontSize+' sans-serif');

        svg.selectAll('.tick')
            .selectAll('text')
            .style('font',''+tickFontSize+' sans-serif');

        svg.selectAll('.axis path')
            .style('fill','none')
            .style('stroke','#000')
            .style('shape-rendering','crispEdges');
        svg.selectAll('.axis line')
            .style('fill','none')
            .style('stroke','#000')
            .style('shape-rendering','crispEdges');
    };

    function onlyUnique(value, index, self) { // This function returns an array with unique elements
        return self.indexOf(value) === index;
    }

    function XScaleGenerator(xAxisType, width, XExtentValue)
    {
        var xScale;
        if(xAxisType =="linear")
        {
            xScale = d3.scale.linear().domain(XExtentValue).range([0,width]);
        }
        else
        {
            xScale= d3.scale.ordinal().domain(XExtentValue).rangeRoundBands([0,width],1);
        }

        return xScale;
    }

    function YScaleGenerator(yAxisType, height, YExtentValue)
    {
        var yScale;
        if(yAxisType =="linear")
        {
            yScale = d3.scale.linear().domain(YExtentValue).range([height, 0]);
        }
        else
        {
            yScale = d3.scale.ordinal().domain(YExtentValue).rangeRoundBands([height, 0],1);
        }
        return yScale;
    }


})();