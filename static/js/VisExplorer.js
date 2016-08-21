/**
 * Created by arjun010 on 8/15/16.
 */
(function(){
    visExplorer = {};

    this.activeAttributeCombinations = [];

    this.cardNumber = 0;

    visExplorer.init = function () {
        $("#dashboardVis").html('');
        var activeAttributes = [];
        var activeAttributeWeightVector = ial.getAttributeWeightVector();
        for(var attribute in activeAttributeWeightVector){
            var weight = activeAttributeWeightVector[attribute];
            if(weight>0.0){
                activeAttributes.push(attribute);
            }
        }
        generateActiveAttributeCombinations(activeAttributes);
        populateCards();
    };

    function generateActiveAttributeCombinations (activeAttributes){
        this.activeAttributeCombinations = [];

        for(var k =1; k<=3;k++){
            var kCombinations = utils.getCombinations(activeAttributes,k);
            for(var combinations of kCombinations){
                this.activeAttributeCombinations.push(combinations);
            }
        }
    }

    function populateCards(){
        this.cardNumber = 0;
        var singleAttributeCards = [];
        var twoAttributeCards = [];
        var threeAttributeCards = [];
        var curAttributeWeightVector = ial.getAttributeWeightVector();
        for(var attributeCombination of this.activeAttributeCombinations){
            var possibleVisObjects =  visGenie.getRecommendations(attributeCombination);
            var filteredVisObjects = [];
            for(var visObject of possibleVisObjects){
                if(drawableVis(visObject)==true){
                    var visCard = new VisCard();
                    visCard.setAttributes(attributeCombination);
                    visCard.setVisObject(visObject);

                    var visCardScore = 0.0; //parseFloat(visObject.score);
                    for(var attribute of attributeCombination){
                        visCardScore += curAttributeWeightVector[attribute];
                    }
                    visCard.setScore(visCardScore);
                    if(visObject.attributeCount==1){
                        singleAttributeCards.push(visCard);
                    }else if(visObject.attributeCount==2){
                        twoAttributeCards.push(visCard);
                    }else if(visObject.attributeCount==3){
                        threeAttributeCards.push(visCard);
                    }
                    //filteredVisObjects.push(visObject);
                    break;
                }
            }
        }
        utils.sortObj(singleAttributeCards,'cardScore','d');
        utils.sortObj(twoAttributeCards,'cardScore','d');
        utils.sortObj(threeAttributeCards,'cardScore','d');
        //console.log(threeAttributeCards)
        for(var visCard of singleAttributeCards){
            addCard(visCard);
        }
        for(var visCard of twoAttributeCards){
            addCard(visCard);
        }
        for(var visCard of threeAttributeCards){
            addCard(visCard);
        }
    }

    var curChartTypes = ["Bar","Histogram","Scatterplot"];

    function addCard(visCard){
        var attributes = visCard.attributes;
        var cardVisObject = visCard.visObject;
        var chartCardId = "visExplorerCard" + this.cardNumber;
        this.cardNumber += 1;
        chartCardId = chartCardId.replace(/ /g,"");
        var chartCardHTML = "<div class='visExplorerCard' id='"+chartCardId+"'><span class='fa fa-bookmark' style='float: right;'></span></div>";
        $("#dashboardVis").append(chartCardHTML);
        visRenderer.renderChart(globalVars.likedPoints, cardVisObject, "#" + chartCardId);
    }

    function drawableVis(visObject){
        if(curChartTypes.indexOf(visObject.chartType)!=-1){
            if(visObject.xFacetAttr=='' && visObject.yFacetAttr==''){
                if(visObject.attributeCount<=3){
                    return true;
                }
            }
        }
        return false;
    }

})();