(function () {
	
	utils = {};
	
	utils.sortObj = function(list, key,order) {
	    order = typeof order !== 'undefined' ? order : 'a';
	    function compare(a, b) {
	        a = a[key];
	        b = b[key];
	        var type = (typeof(a) === 'string' || typeof(b) === 'string') ? 'string' : 'number';
	        var result;
	        if (type === 'string'){
	            if(key=='startDate' || key=='endDate'){
	                a = new Date(a).getTime();
	                b = new Date(b).getTime();
	                if(order=='a'){
	                    result = a - b;
	                }else if(order=='d'){
	                    result = b - a;
	                }
	                //if(order=='a'){
	                //    result = a < b;
	                //}else if(order=='d'){
	                //    result = a > b;
	                //}
	            }else{
	                if(order=='a'){
	                    result = a.localeCompare(b);
	                }else if(order=='d'){
	                    result = b.localeCompare(a);
	                }
	            }
	        } else {
	            if(order=='a'){
	                result = a - b;
	            }else if(order=='d'){
	                result = b - a;
	            }
	        }
	        return result;
	    }
	    return list.sort(compare);
	}

	utils.cloneObj = function(obj) {
	    // Handle the 3 simple types, and null or undefined
	    if (null == obj || "object" != typeof obj) return obj;

	    // Handle Date
	    if (obj instanceof Date) {
	        var copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // Handle Array
	    if (obj instanceof Array) {
	        var copy = [];
	        for (var i = 0, len = obj.length; i < len; i++) {
	            copy[i] = utils.cloneObj(obj[i]);
	        }
	        return copy;
	    }

	    // Handle Object
	    if (obj instanceof Object) {
	        var copy = {};
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr)) copy[attr] = utils.cloneObj(obj[attr]);
	        }
	        return copy;
	    }

	    throw new Error("Unable to copy obj! Its type isn't supported.");
	};
	
    /*
    * checks if a point is in a data list using ial.id
    * */
	utils.objectInList = function (newObj, dataList) {
        for(var dataObj of dataList){
            if(dataObj.ial.id==newObj.ial.id){
                return true;
            }
        }
        return false;
    }

	/*
	* removes a point from a list using ial.id
	* */
	utils.removeFromList = function (obj, dataList) {
		var itemIndex = -1;
		for(var i in dataList){
			var dataObj = dataList[i];
			if(dataObj.ial.id==obj.ial.id){
				itemIndex = i;
				break;
			}
		}
		if(itemIndex!=-1){
			dataList.splice(itemIndex,1);
		}
	};
    
    
    utils.removeFromListUsingIalId = function (ialId, dataList) {
        var itemIndex = -1;
        for(var i in dataList){
            var dataObj = dataList[i];
            if(dataObj.ial.id==ialId){
                itemIndex = i;
                break;
            }
        }
        if(itemIndex!=-1){
            dataList.splice(itemIndex,1);
        }
    };
	
	utils.isOnlyCategoricalAttribute = function (attribute) {
		if(globalVars.dataAttributeMap[attribute]['isCategorical']=='1' && globalVars.dataAttributeMap[attribute]['isNumeric']=='0'){
			return true;
		}	
		return false;
	};

	utils.isOnlyNumericalAttribute = function (attribute) {
		if(globalVars.dataAttributeMap[attribute]['isCategorical']=='0' && globalVars.dataAttributeMap[attribute]['isNumeric']=='1'){
			return true;
		}
		return false;
	};

	utils.isCategoicalAndNumericAttribute = function (attribute) {
		if(globalVars.dataAttributeMap[attribute]['isCategorical']=='1' && globalVars.dataAttributeMap[attribute]['isNumeric']=='1'){
			return true;
		}
		return false;
	};
	
	utils.getSumOfMapValues = function (inputMap) {
		var sum = 0.0;
		for(var key in inputMap){
			sum += parseFloat(inputMap[key]);
		}	
		return sum;
	};
    
    utils.getInverseMap = function (inputMap,maxValForKey) {
        var newMap = {};
        for(var key in inputMap){
            newMap[key] = maxValForKey - inputMap[key];
        }
        return newMap;
    };

	utils.getSortedKeysForMap = function(obj, order) {
		if(order == undefined){
			order = 'd';
		}
		var keys = []; for(var key in obj) keys.push(key);
		return keys.sort(function(a,b){
			if(order == 'd'){
				return obj[b]-obj[a]
			}else {
				return obj[a]-obj[b]
			}
		});
	};

	utils.getCombinations = function(set, k) {
		var i, j, combs, head, tailcombs;

		if (k > set.length || k <= 0) {
			return [];
		}

		if (k == set.length) {
			return [set];
		}

		if (k == 1) {
			combs = [];
			for (i = 0; i < set.length; i++) {
				combs.push([set[i]]);
			}
			return combs;
		}

		// Assert {1 < k < set.length}

		combs = [];
		for (i = 0; i < set.length - k + 1; i++) {
			head = set.slice(i, i+1);
			tailcombs = utils.getCombinations(set.slice(i + 1), k - 1);
			for (j = 0; j < tailcombs.length; j++) {
				combs.push(head.concat(tailcombs[j]));
			}
		}
		return combs;
	};

	utils.removeFromInsightsList = function (timestampToRemove) {
		for(var i in globalVars.insights){
			var insight = globalVars.insights[i];
			if(timestampToRemove==insight.timeStamp){
				globalVars.insights.splice(i, 1);
				break;
			}
		}
	};

})();