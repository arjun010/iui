/**
 * Created by a.srinivasan on 7/13/16.
 */
(function () {
    dataPointContextMenu = [
        {
            title: 'Like',
            action: function(elm, d, i) {
                addPointToLikedList(d,elm);
            }
        },
        {
            title: 'Dislike',
            action: function(elm, d, i) {
                addPointToDislikedList(d,elm);
            }
        }
    ];

    function addPointToLikedList(d,elm) {
        if(utils.objectInList(d,globalVars.likedPoints)==false && utils.objectInList(d,globalVars.dislikedPoints)==false){
            var htmlToAdd = "<div id='specialPoint_"+d.ial.id+"' class='specialPoint'>";
            htmlToAdd += d.Name;
            htmlToAdd += "</div>"
            $("#likedDataPoints").append(htmlToAdd);
            globalVars.likedPoints.push(d);
            d3.select(elm).classed("likedNode",true)
        }
        applyEventHandlersToSpecialPoints();
    }

    function addPointToDislikedList(d,elm) {
        if(utils.objectInList(d,globalVars.dislikedPoints)==false && utils.objectInList(d,globalVars.likedPoints)==false){
            var htmlToAdd = "<div id='specialPoint_"+d.ial.id+"' class='specialPoint'>";
            htmlToAdd += d.Name;
            htmlToAdd += "</div>"
            $("#dislikedDataPoints").append(htmlToAdd);
            globalVars.dislikedPoints.push(d);
            d3.select(elm).classed("dislikedNode",true)
        }
        
        applyEventHandlersToSpecialPoints();
    }

    function applyEventHandlersToSpecialPoints() {
        $(".specialPoint").hover(function (elm) {
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
})();