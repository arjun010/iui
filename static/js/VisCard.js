/**
 * Created by arjun010 on 8/19/16.
 */
(function () {
    VisCard = function () {
        this.attributes = undefined;
        this.visObject = undefined;
        this.bookmarked = false;
        this.cardScore = 0.0;
    };

    VisCard.prototype.setAttributes = function (attributes) {
          this.attributes = attributes;
    };

    VisCard.prototype.setVisObject = function (visObject) {
        this.visObject = visObject;
    };

    VisCard.prototype.bookmark = function () {
        this.bookmarked = true;
    };

    VisCard.prototype.setScore = function (score) {
        this.cardScore = score;
    };

    VisCard.prototype.addScore = function (increment) {
        this.cardScore += increment;
    };

})();