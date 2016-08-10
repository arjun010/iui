/**
 * Created by a.srinivasan on 8/2/16.
 */
(function () {
    brain = {};
    
    brain.canSuggestAttributeWeightVector = function (dataPointsList1,dataPointsList2,getInverse) {

        getInverse = typeof getInverse !== 'undefined' ? getInverse : false;
        
        var activeWeightVectorSum = ial.getAttributeVectorSum();
        
        if(dataPointsList2==undefined || dataPointsList2.length==0){
            var possibleWeightVector = ial.generateAttributeWeightVectorUsingSimilarity(dataPointsList1);
        }else {
            var possibleWeightVector = ial.generateAttributeWeightVectorUsingDifferences(dataPointsList1,dataPointsList2);
        }
        
        if(getInverse == true){
            possibleWeightVector = utils.getInverseMap(possibleWeightVector,1.0);
        }
        
        var possibleWeightVectorSum = utils.getSumOfMapValues(possibleWeightVector);
        
        var sumDiff = Math.abs(parseFloat(possibleWeightVectorSum - activeWeightVectorSum)/activeWeightVectorSum);
        var canSuggest =  (sumDiff > globalVars.weightVectorSumDiffChange);
        
        if(canSuggest == true){
            return {
                "canSuggest": canSuggest,
                "suggestedVector" : possibleWeightVector,
                "diff": sumDiff
            }
        }else {
            return {
                "canSuggest" : canSuggest,
                "diff": sumDiff
            }
        }
        
    };

    brain.getNewDataPointSuggestion = function (likedDataPoints,dislikedDataPoints) {
        var interestWeightVector = ial.generateAttributeWeightVectorUsingDifferences(likedDataPoints,dislikedDataPoints);
        
        var suggestedPoint = undefined, maxScore = 0.0;
        for(var d of globalVars.dataObjectList){
            var curPointScore = parseFloat(getItemScore(d,interestWeightVector));
            if(curPointScore>maxScore && utils.objectInList(d,likedDataPoints)==false && utils.objectInList(d,dislikedDataPoints)==false){
                maxScore = curPointScore;
                suggestedPoint = d;
            }
        }
        
        return suggestedPoint;
        
    };

    function getItemScore(d,attributeVector){
        var score = 0.0;
        for(var attribute in attributeVector){
            if(attributeVector[attribute]>0.0 && !isNaN(d[attribute])){
                var attributeVal = ial.getNormalizedAttributeValue(d[attribute],attribute);
                attributeVal *= attributeVector[attribute];
                score += attributeVal;
            }
        }
        score = parseFloat(Math.round(score* 10000) / 10000).toFixed(4);
        return score;
    }
    
})();