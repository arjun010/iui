/**
 * Created by arjun010 on 8/22/16.
 */
(function () {
    Insight = function () {
        this.timeStamp = new Date();
        this.notes = "";
        this.visObject = undefined;
    };

    Insight.prototype.setVisObject = function(visObject){
        this.visObject = visObject;
    };

    Insight.prototype.setNotes = function (value) {
        this.notes = value;
    };

})();