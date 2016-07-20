/**
 * Created by a.srinivasan on 7/19/16.
 */
(function () {
    dataTransformer = {};

    dataTransformer.getDataForTwoAxisBarChart = function(dataList,labelAttr,valueAttr,transform){
        transform = typeof transform !== 'undefined' ? transform : "COUNT";

        var transformedList = [];
        var labelValueMap = {};
        for(var i in dataList){
            //console.log(i, dataList[i], labelAttr, valueAttr);
            var dataItem = dataList[i];
            var labelAttrVal = dataItem[labelAttr];
            var valueAttrVal = dataItem[valueAttr];

            if(labelAttrVal in labelValueMap){ // encountering label for first time
                labelValueMap[labelAttrVal]["valueSum"]+=parseFloat(valueAttrVal);
                labelValueMap[labelAttrVal]["count"]+=1;
            }else{
                labelValueMap[labelAttrVal] = {
                    "valueSum":parseFloat(valueAttrVal),
                    "count":1
                };
            }
        }

        if(transform=="AVERAGE"){
            for(var labelVal in labelValueMap){
                transformedList.push({
                    "label":labelVal,
                    "value":parseFloat(labelValueMap[labelVal]['valueSum']/labelValueMap[labelVal]['count'])
                });
            }
        }else if(transform=="SUM"){
            for(var labelVal in labelValueMap){
                transformedList.push({
                    "label":labelVal,
                    "value":parseFloat(labelValueMap[labelVal]['valueSum'])
                });
            }
        }else if(transform=="COUNT"){
            for(var labelVal in labelValueMap){
                transformedList.push({
                    "label":labelVal,
                    "value":parseFloat(labelValueMap[labelVal]['count'])
                });
            }
        }

        return transformedList;
    };

    dataTransformer.getDataForHistogram = function (dataList, attribute) {
        
        var transformedList = [];
        for(var dataObj of dataList){
            transformedList.push(parseFloat(dataObj[attribute]));
        }
        
        return transformedList;
        
    };

})();