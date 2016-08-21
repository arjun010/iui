(function(){
	
    globalVars = {};
	
	globalVars.leftPanelStatus = 1;
	globalVars.rightPanelStatus = 1;	

	globalVars.dataAttributeMap = {};
	globalVars.dataObjectList = {};
	
	globalVars.ialIdToDataMap = {};
	
	globalVars.likedPoints = [];
	globalVars.dislikedPoints = [];
	
	globalVars.selectedPoints = [];
	
	globalVars.clusterList = [];
    globalVars.colorList = [];
    
    globalVars.colorScale = undefined;
    
    globalVars.showLegendBox = false;
	
	globalVars.clusteringAttribute = undefined;
    globalVars.coloringAttribute = undefined;
    globalVars.sizingAttribute = undefined;
	
	globalVars.suggestions = [];

    globalVars.dataPointsSelectionThreshold = 5;
    globalVars.specialPointsSelectionThreshold = 5;
    
    globalVars.weightVectorSumDiffChange = 0.4;

	globalVars.currentView = "DataExplore"; //DataExplore, VisExplore
	
})();