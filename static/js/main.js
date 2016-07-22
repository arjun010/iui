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
            uiHandler.showEmptyDetailsTable()
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

})();