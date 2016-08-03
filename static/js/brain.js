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
    
})();