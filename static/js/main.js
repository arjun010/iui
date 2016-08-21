(function(){
	main = {};

    $body = $("body");
    $(document).on({
        ajaxStart: function() { $body.addClass("loading");},
        ajaxStop: function() { $body.removeClass("loading"); }
    });

    main.init = function(){

        $("#exploreVisLegendDiv").hide();
        $("#dashboardVis").hide();
        $("#provenanceView").hide();

        $('#clusterDetailsModal').modal({ show: false});
        
        $("#numericalAttributeFilterSlider").hide();


        var dataFile = "../static/data/"+$("#dataFileSelector").val()+".csv";
        initDataAndUpdateContainer(dataFile);
    };

    main.initializeData = function(dataFilePath){
        dataProcessor.processFile(dataFilePath);
        d3.csv(dataFilePath,function (data) {
            ial.init(data,0);
            globalVars.dataObjectList = data;
        });
        setTimeout(function () {
            globalVars.dataAttributeMap = dataProcessor.getAttributeMap();
            uiHandler.populateDataAttributeDropdowns(globalVars.dataAttributeMap);
            visGenie.generateRecommendationMap(globalVars.dataAttributeMap);

            uiHandler.showEmptyDetailsTable();
            graphRenderer.initialize(globalVars.dataObjectList,"#exploreVis")
            graphRenderer.drawGraph();
        },1000)


    };

    main.clearGraphAndUI = function () {
        $('.categoricalAttributesDropdown').html("");
        $('.numericalAttributesDropdown').html("");
        graphRenderer.clearGraph();
    };


    $("#dataFileSelector").change(function () {
        var dataFile = "../static/data/"+$("#dataFileSelector").val()+".csv";
        main.clearGraphAndUI();
        initDataAndUpdateContainer(dataFile);
    });

    function initDataAndUpdateContainer(dataFile){
        main.initializeData(dataFile);
        setTimeout(function () {
            uiHandler.populateDataAttributeContainer();
        },1001);
    }
    

    /*
    main.applyUserDefinedAttributeWeightVector = function () {
        // console.log("here")
        var userDefinedAttributeWeightVector = {};
        $(".slider").each(function(e){
            var attribute = $(this).attr("name");
            var weightAssigned = $(this).slider("value");
            if(attribute!="Name"){
                userDefinedAttributeWeightVector[attribute] = parseFloat(weightAssigned);
            }
        });

        ial.setAttributeWeightVector(userDefinedAttributeWeightVector);
    };
    */
    main.applyUserDefinedAttributeWeightVector = function () {

        var userDefinedAttributeWeightVector = {};

        d3.selectAll('.inforow').each(function (d) {
            var attribute = d.label;
            var weightAssigned = d.value;
            // if(attribute!="Name"){
                userDefinedAttributeWeightVector[attribute] = parseFloat(weightAssigned);
            // }
        });

        console.log(userDefinedAttributeWeightVector)

        ial.setAttributeWeightVector(userDefinedAttributeWeightVector);
    };

    checkForAttributeVectorSuggestionUsingSpecialPoints = function () {
        if(globalVars.likedPoints.length>0 && globalVars.dislikedPoints.length>0){
            var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.likedPoints,globalVars.dislikedPoints);
        }else if(globalVars.likedPoints.length>0 && globalVars.dislikedPoints.length==0){
            var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.likedPoints);
        }else if(globalVars.likedPoints.length==0 && globalVars.dislikedPoints.length>0){
            var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.dislikedPoints,[],true);
        }else{
            return;
        }
        
        console.log(brainOpt);
        if(brainOpt.canSuggest){
            var suggestion = new Suggestion('AttributeWeightVector');
            suggestionManager.addSuggestion(suggestion);
            suggestion.setExistingValue(ial.getAttributeWeightVector());
            suggestion.setSuggestedValue(brainOpt.suggestedVector);
            $(".newSuggestionsCount").text(suggestionManager.getUnseenSuggestionsCount())
        }
    };
    
    computeAndSuggestNewDataPoint = function () {
        $("#suggestedPointOfInterest").html('');
        if(globalVars.likedPoints.length==0){
            return;
        }

        var suggestedDataPoint = brain.getNewDataPointSuggestion(globalVars.likedPoints,globalVars.dislikedPoints);

        $("#suggestedPointOfInterest").append("<div class='suggestedDataPoint'>Possible point of interest: " + suggestedDataPoint.Name + "</div>");

        $(".suggestedDataPoint").mouseover(function (elm) {

            d3.selectAll('.node').each(function (d) {
                if(d.ial.id == suggestedDataPoint.ial.id){
                    if(!d3.select(this).classed('highlightedNode')){
                        d3.select(this).classed('highlightedNode',true)
                    }
                }else{
                    if(!d3.select(this).classed('fadedNode')){
                        d3.select(this).classed('fadedNode',true)
                    }
                }
            })

        });

        $(".suggestedDataPoint").mouseout(function (elm) {
            d3.selectAll('.node').classed("highlightedNode",false).classed("fadedNode",false)
        });
    }

})();