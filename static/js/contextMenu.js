/**
 * Created by a.srinivasan on 7/13/16.
 */
(function () {
    dataPointContextMenu = [
        {
            title: 'Like',
            action: function(elm, d, i) {

                addPointToLikedList(d,elm);
                
                /*
                * suggesting attribute weight changes
                * */
                var specialPointsCount = globalVars.likedPoints.length + globalVars.dislikedPoints.length;
                if(specialPointsCount % globalVars.specialPointsSelectionThreshold == 0){
                    // if(globalVars.dislikedPoints.length>0){
                    //     var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.likedPoints,globalVars.dislikedPoints);
                    // }else {
                    //     var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.likedPoints);
                    // }
                    // console.log(brainOpt)
                    // if(brainOpt.canSuggest){
                    //     var suggestion = new Suggestion('AttributeWeightVector');
                    //     suggestionManager.addSuggestion(suggestion);
                    //     $(".newSuggestionsCount").text(suggestionManager.getUnseenSuggestionsCount())
                    // }
                    checkForAttributeVectorSuggestionUsingSpecialPoints();
                }
                
                /*
                * suggesting new point of interest
                * */

                computeAndSuggestNewDataPoint();

                /*
                var suggestedDataPoint = brain.getNewDataPointSuggestion(globalVars.likedPoints);

                
                // $("#suggestedPointOfInterest").text("Possible point of interest: " + suggestedDataPoint.Name);

                $("#suggestedPointOfInterest").html('')
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
                */
                
            }
        },
        {
            title: 'Dislike',
            action: function(elm, d, i) {

                addPointToDislikedList(d,elm);
                

                var specialPointsCount = globalVars.likedPoints.length + globalVars.dislikedPoints.length;
                if(specialPointsCount % globalVars.specialPointsSelectionThreshold == 0){
                    // if(globalVars.likedPoints.length>0){
                    //     var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.likedPoints,globalVars.dislikedPoints);
                    // }else {
                    //     var brainOpt = brain.canSuggestAttributeWeightVector(globalVars.dislikedPoints,[],true);
                    // }
                    // console.log(brainOpt)
                    // if(brainOpt.canSuggest){
                    //     var suggestion = new Suggestion('AttributeWeightVector');
                    //     suggestionManager.addSuggestion(suggestion);
                    //     suggestion.existingValue =
                    //     $(".newSuggestionsCount").text(suggestionManager.getUnseenSuggestionsCount())
                    // }

                    checkForAttributeVectorSuggestionUsingSpecialPoints();
                }


                computeAndSuggestNewDataPoint();

            }
        }
    ];

    addPointToLikedList = function(d,elm) {
        if(utils.objectInList(d,globalVars.likedPoints)==false && utils.objectInList(d,globalVars.dislikedPoints)==false){
            var htmlToAdd = "<div id='specialPoint_"+d.ial.id+"' class='specialPoint'>";
            htmlToAdd += d.Name;
            htmlToAdd += "<span class='fa fa-times-circle removeSpecialPoint' style='margin-left: 8px;'></span>"
            htmlToAdd += "</div>"
            $("#likedDataPoints").append(htmlToAdd);
            globalVars.likedPoints.push(d);
            d3.select(elm).classed("likedNode",true)
        }
        applyEventHandlersToSpecialPoints();
        applyEventHandlerToCancelSpecialPoint();

    }

    addPointToDislikedList = function (d,elm) {
        if(utils.objectInList(d,globalVars.dislikedPoints)==false && utils.objectInList(d,globalVars.likedPoints)==false){
            var htmlToAdd = "<div id='specialPoint_"+d.ial.id+"' class='specialPoint'>";
            htmlToAdd += d.Name;
            htmlToAdd += "<span class='fa fa-times-circle removeSpecialPoint' style='margin-left: 8px;'></span>"
            htmlToAdd += "</div>"
            $("#dislikedDataPoints").append(htmlToAdd);
            globalVars.dislikedPoints.push(d);
            d3.select(elm).classed("dislikedNode",true)
        }
        
        applyEventHandlersToSpecialPoints();
        applyEventHandlerToCancelSpecialPoint();
    }

    function applyEventHandlersToSpecialPoints() {
        $(".specialPoint").mouseover(function (elm) {
            var divId = $(this).attr('id');
            var ialId = divId.split('_')[1];

            d3.selectAll('.node').each(function (d) {
                if(d.ial.id == ialId){
                    d3.select(this).classed('highlightedNode',true)
                }else{
                    d3.select(this).classed('fadedNode',true)
                }
            })

        });

        $(".specialPoint").mouseout(function (elm) {
            d3.selectAll('.node').classed("highlightedNode",false).classed("fadedNode",false)
        });
    }

    function applyEventHandlerToCancelSpecialPoint() {
        $(".removeSpecialPoint").click(function (elm) {
            var divId = $(this).parent().attr('id');
            var ialId = divId.split('_')[1];

            d3.selectAll('.node').each(function (curNode) {
                if(curNode.ial.id == ialId){
                    if(d3.select(this).classed("likedNode")){
                        d3.select(this).classed("likedNode",false);
                    }else if(d3.select(this).classed("dislikedNode")){
                        d3.select(this).classed("dislikedNode",false);
                    }
                }
            });


            utils.removeFromListUsingIalId(ialId,globalVars.likedPoints);

            var specialPointsCount = globalVars.likedPoints.length + globalVars.dislikedPoints.length;
            if(specialPointsCount >= globalVars.specialPointsSelectionThreshold){
                checkForAttributeVectorSuggestionUsingSpecialPoints();
            }

            computeAndSuggestNewDataPoint();

            $(this).parent().trigger('mouseout').remove();
        })
    }

})();