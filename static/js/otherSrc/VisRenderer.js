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
                drawHistogram(data,visObject.xAttr,labels,selector);
                break;
            case "Bar":
                if(visObject.attributeCount<=2 && visObject.xAttr!="" && visObject.yAttr!=""){
                    var labels = {
                        "xAttr" : visObject.xAttr,
                        "yAttr" : visObject.yAttr
                    };
                    if(visObject.yTransform!=""){
                        labels.yAttr = visObject.yTransform + "(" + labels.yAttr + ")";
                    }
                    drawTwoAxisBarChart(data,visObject.xAttr,visObject.yAttr,visObject.yTransform,labels,selector);
                }
                break;
            default:
                break;
        }
    };
    
    var drawHistogram = function (data,attribute,labels,selector) {
        var histogramData = dataTransformer.getDataForHistogram(data,attribute);
        renderHistogram(histogramData,labels,selector);
    };

    var drawTwoAxisBarChart = function (data,xAttribute,yAttribute,transform,labels,selector) {
        var barChartData = dataTransformer.getDataForTwoAxisBarChart(data,xAttribute,yAttribute,transform);
        renderVerticalBarChart(barChartData,labels,selector);
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

    var renderVerticalBarChart = function(data,labels,selector,divWidth,divHeight){

        divWidth = typeof divWidth !== 'undefined' ? divWidth : $(selector).width();
        divHeight = typeof divHeight !== 'undefined' ? divHeight : $(selector).height();

        updateTextSizes(divWidth,divHeight);
        var margin = {top: divHeight*0.1, right: divWidth*0.10, bottom: divHeight*0.15, left: divWidth*0.15},
            width = divWidth - margin.left - margin.right,
            height = divHeight - margin.top - margin.bottom;

        var color = d3.scale.category20();

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

        var svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
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
            .attr("fill","steelblue")
            .on('mouseover', barTooltip.show)
            .on('mouseout', barTooltip.hide);

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


})();