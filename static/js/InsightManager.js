/**
 * Created by arjun010 on 8/22/16.
 */
(function(){
    InsightManager = {};

    InsightManager.addInsight = function(insight) {
        globalVars.insights.unshift(insight);
    }
})();