/**
 * Created by a.srinivasan on 8/2/16.
 */
(function () {
    suggestionManager = {};
    
    suggestionManager.addSuggestion = function (suggestion) {
        globalVars.suggestions.push(suggestion);
    };
    
    suggestionManager.getUnseenSuggestionsCount = function () {
        var unseenSuggestionsCount = 0;
        for(var suggestion of globalVars.suggestions){
            if(suggestion.seen == false){
                unseenSuggestionsCount += 1;
            }
        }
        return unseenSuggestionsCount;
    }
    
})();


// type: AttributeWeightVector, DataPoint
var Suggestion = function (type) {
    this.type = type;
    this.timeStamp = new Date();
    this.description = "";
    this.seen = false;
    this.suggestedValue = undefined;
    this.existingValue = undefined;
};