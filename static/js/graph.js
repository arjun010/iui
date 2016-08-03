/**
 * Created by arjun010 on 4/29/16.
 */
(function(){
    graphRenderer = {};
    graphRenderer.dataList = [];
    graphRenderer.defaultRadius = 25;

    var visHTMLSelector;
    var timer;

    var width = undefined,
        height = undefined,
        padding = 5, // separation between nodes
        minRadius = 8,
        maxRadius = 25;

    var defaultRadius = 15;

    var xScale = d3.scale.linear()
        .domain([0,width]).range([0,width]);
    var yScale = d3.scale.linear()
        .domain([0,height]).range([0, height]);

    var viewZoom = d3.behavior.zoom()
        .scaleExtent([0.01, 10])
        .x(xScale)
        .y(yScale)
        //.size([width, height])
        // .center([width / 2, height / 2])
        .on("zoom", zoomer);


    var force,nodes, x,svg,color, radiusScale,clusterCount,viewContainer,viewScale,viewTranslate,drag;

    var sizeScale;

    graphRenderer.clearGraph = function () {
        d3.select(visHTMLSelector).selectAll("svg").remove();
    };


    graphRenderer.initialize = function (dataList,selector) {

        // console.log($("#mainContainer").outerWidth(),$("#mainContainer").outerHeight())

        visHTMLSelector = selector;

        width = $("body").outerWidth() ;
        height = $("#mainCanvasBody").outerHeight();

        clusterCount = 1;

        color = d3.scale.category10()
            .domain(d3.range(clusterCount));
        //console.log(d3.range(clusterCount))
        x = d3.scale.ordinal()
            .domain(d3.range(clusterCount))
            .rangePoints([0, width*2], 1);

        sizeScale = d3.scale.linear().clamp(true);

        radiusScale = d3.scale.linear();

        //graphRenderer.dataList = utils.cloneObj(dataList);

        graphRenderer.dataList = d3.range(dataList.length).map(function(index) {
            var i = Math.floor(Math.random() * clusterCount);
            var dataObjMap = utils.cloneObj(dataList[index]);
            dataObjMap["radius"] = defaultRadius;
            dataObjMap["color"] = color("");
            dataObjMap["cx"] = x(i);
            dataObjMap["cy"] = height / 2;
            return dataObjMap;
        });

        force = d3.layout.force()
            .nodes(graphRenderer.dataList)
            .size([width, height])
            // .gravity(0)
            .charge(-350)
            .on("tick", tick)
            .start();

        drag = force.drag()
            .origin(function(d) { return d; })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        svg = d3.select(visHTMLSelector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(viewZoom).on("dblclick.zoom", null);

        viewTranslate=[0,0];
        viewScale=0;

        viewContainer = svg.append("g");

    };

    graphRenderer.drawGraph = function () {
        nodes = viewContainer.selectAll("circle")
            .data(graphRenderer.dataList)
            .enter()
            .append("circle")
            .attr("class","node")
            .attr("r", function(d) { return d.radius; })
            .style("fill", function(d) { return d.color; })
            .on("click",function (d) {
                if(d3.event.defaultPrevented){
                    return;
                }else{
                    if (timer) clearTimeout(timer);
                    if(d3.select(this).classed("selectedNode")){
                        d3.select(this).classed("selectedNode",false);
                        utils.removeFromList(d,globalVars.selectedPoints);
                    }else{
                        d3.select(this).classed("selectedNode",true);
                        globalVars.selectedPoints.push(d);

                        if(globalVars.selectedPoints.length % globalVars.dataPointsSelectionThreshold == 0){
                            var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.selectedPoints);
                            console.log(brainOpt)
                            if(brainOpt.canSuggest){
                                var suggestion = new Suggestion('AttributeWeightVector');
                                suggestionManager.addSuggestion(suggestion);
                                $(".newSuggestionsCount").text(suggestionManager.getUnseenSuggestionsCount())
                            }
                        }
                    };
                    timer = setTimeout(function() {
                        console.log("single click");
                        mouseclickHandler(d);
                    }, 250);
                }
            })
            .on("mouseover",function (d) {
                d3.select(this).classed("highlightedNode",true);
                mouseoverHandler(d)
            })
            .on("mouseout",function (d) {
                d3.select(this).classed("highlightedNode",false);
                mouseoutHandler(d);
            })
            .on('contextmenu', d3.contextMenu(dataPointContextMenu))
            .call(drag);
            //.call(force.drag);


    };

    graphRenderer.createClusters = function (clusteringAttribute,order) {

        order = typeof order !== 'undefined' ? order : "random";

        force.stop();

        var clusterCountMap = {}, clusterList = [];

        graphRenderer.dataList.forEach(function(d){

            if(clusteringAttribute.indexOf("ial.")!=-1){
                var cluster = globalVars.ialIdToDataMap[d.ial.id].ial.KNNClusterId;
            }else {
                var cluster = globalVars.dataAttributeMap[clusteringAttribute] === undefined ? 0 : d[clusteringAttribute];
            }

            
            if(cluster in clusterCountMap){
                clusterCountMap[cluster]['count'] += 1;
                clusterCountMap[cluster]['points'].push(d);
            }else{
                clusterCountMap[cluster] = {};
                clusterCountMap[cluster]['count'] = 1;
                clusterCountMap[cluster]['points'] = [d];
            }
        });

        for(var cluster in clusterCountMap){
            clusterList.push({
                "label":cluster,
                "count":clusterCountMap[cluster]['count'],
                "points":clusterCountMap[cluster]['points']
            })
        }

        if(order=="l-r-by-label"){
            utils.sortObj(clusterList,"label");
        }else if(order=="l-r-by-count"){
            utils.sortObj(clusterList,"count");
        }else if(order=="r-l-by-label"){
            utils.sortObj(clusterList,"label","d");
        }else if(order=="r-l-by-count"){
            utils.sortObj(clusterList,"count","d");
        }
        
        globalVars.clusterList = utils.cloneObj(clusterList);

        clusterCount =  clusterList.length;//globalVars.dataAttributeMap[clusteringAttribute]===undefined ? 1 : globalVars.dataAttributeMap[clusteringAttribute]['domain'].length;

        var clusterAttrDomain = [];

        if(order=="random"){

            if(clusteringAttribute.indexOf("ial.")!=-1){
                for(var dataPoint of globalVars.dataObjectList){
                    if(clusterAttrDomain.indexOf(dataPoint.ial.KNNClusterId)==-1){
                        clusterAttrDomain.push(dataPoint.ial.KNNClusterId);
                    }
                }
            }else {
                clusterAttrDomain = globalVars.dataAttributeMap[clusteringAttribute]===undefined ? d3.range(clusterCount) : globalVars.dataAttributeMap[clusteringAttribute]['domain'];
            }

        }else{
            for(var i in clusterList){
                clusterAttrDomain.push(clusterList[i].label);
            }
        }

        var maxWidth = clusterAttrDomain.length * 200;

        x.domain(clusterAttrDomain).rangePoints([0, maxWidth], 1);
        color.domain(d3.range(clusterCount));

        //console.log(x.range())

        graphRenderer.dataList.forEach(function(d){

            if(clusteringAttribute.indexOf("ial.")!=-1){
                var cluster = globalVars.ialIdToDataMap[d.ial.id].ial.KNNClusterId;
            }else {
                var cluster = globalVars.dataAttributeMap[clusteringAttribute]===undefined ? 0 : d[clusteringAttribute];
            }

            d.cx = x(cluster);
            d.color = color(cluster);
        });
        force.start();

        // globalVars.colorScale = color;

    };

    graphRenderer.colorPoints = function (coloringAttribute) {
        var colorCountMap = {};
        graphRenderer.dataList.forEach(function(d){
            if(coloringAttribute.indexOf("ial.")!=-1){
                var clusterId = globalVars.ialIdToDataMap[d.ial.id]['ial'].KNNClusterId;
                if(clusterId in colorCountMap){
                    colorCountMap[clusterId] += 1;
                }else{
                    colorCountMap[clusterId] = 1;
                }
                d.color = color(clusterId);
            }else {
                d.color = d[coloringAttribute]===undefined ? color("") : color(d[coloringAttribute]);
                if(!(d[coloringAttribute]===undefined)){
                    if(d[coloringAttribute] in colorCountMap){
                        colorCountMap[d[coloringAttribute]] += 1;
                    }else{
                        colorCountMap[d[coloringAttribute]] = 1;
                    }
                }
            }
            /*
            if(coloringAttribute.indexOf(".ial")!=-1){
                var clusterId = globalVars.ialIdToDataMap[d.ial.id]['ial'].KNNClusterId;
                console.log(clusterId)
                if(clusterId in colorCountMap){
                    colorCountMap[clusterId] += 1;
                }else{
                    colorCountMap[clusterId] = 1;
                }
            }else {
                if(!(d[coloringAttribute]===undefined)){
                    if(d[coloringAttribute] in colorCountMap){
                        colorCountMap[d[coloringAttribute]] += 1;
                    }else{
                        colorCountMap[d[coloringAttribute]] = 1;
                    }
                }
            }
            */
        });
        
        svg.selectAll("circle").transition().duration(1000).style("fill", function(d) { return d.color; });

        console.log(colorCountMap)
        // if(Object.keys(globalVars.dataAttributeMap).indexOf(coloringAttribute)!=-1){
            var colorCountList = [];
            for(var val in colorCountMap){
                colorCountList.push({
                    "label":val,
                    "count":colorCountMap[val]
                })
            }
        // }
        
        globalVars.colorList = utils.cloneObj(colorCountList);

        globalVars.colorScale = color;

    };

    graphRenderer.resizePoints = function (sizingAttribute) {

        if(sizingAttribute.indexOf("ial.")!=-1){
            var sizeAttrDomain = [];
            var ialSubAttribute = sizingAttribute.split('.')[1];
            for(var dataPoint of globalVars.dataObjectList){
                var attrValue = dataPoint['ial'][ialSubAttribute];
                if(sizeAttrDomain.indexOf(attrValue)==-1){
                    sizeAttrDomain.push(attrValue);
                }
            }
             
        }else{
            var sizeAttrDomain = globalVars.dataAttributeMap[sizingAttribute]===undefined ? [] : globalVars.dataAttributeMap[sizingAttribute]['domain'];
        }

        if(sizeAttrDomain.length==0){
            graphRenderer.dataList.forEach(function(d){
                d.radius = defaultRadius;
            });
        }else{
            var minVal = Math.min.apply(Math, sizeAttrDomain);
            var maxVal = Math.max.apply(Math, sizeAttrDomain);
            sizeScale.domain([minVal,maxVal]).range([minRadius,maxRadius]);

            graphRenderer.dataList.forEach(function(d){
                if(sizingAttribute.indexOf("ial.")!=-1) {
                    d.radius = sizeScale(d['ial'][ialSubAttribute]);
                }else {
                    d.radius = sizeScale(d[sizingAttribute]);
                }
            });
        }

        svg.selectAll("circle").transition().duration(1000).attr("r", function(d) { return d.radius; });
    };

    function tick(e) {
        nodes.each(gravity(.2 * e.alpha))
            .each(collide(15))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    // Move nodes toward cluster focus.
    function gravity(alpha) {
        return function(d) {
            d.y += (d.cy - d.y) * alpha;
            d.x += (d.cx - d.x) * alpha;
        };
    }

    // Resolve collisions between nodes.
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function(d) {
            var r = d.radius + maxRadius + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }

    function zoomer() {
        viewScale = d3.event.scale;
        viewTranslate = d3.event.translate;
        viewContainer.attr("transform", "translate(" + viewTranslate + ")scale(" + viewScale + ")");
    }

    function dragstarted(d) {
        // force.stop();
        d3.event.sourceEvent.stopPropagation();
    }

    function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
        // force.resume();
    }

    function mouseoverHandler(d) {
        uiHandler.updateDetailsTable([d]);
    }

    function mouseoutHandler(d) {
        uiHandler.updateDetailsTable(globalVars.selectedPoints);
    }

    function mouseclickHandler(d) {
        uiHandler.updateDetailsTable(globalVars.selectedPoints);
    }

})();