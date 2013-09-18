(function ($) {
    $(".js-multipleselector").multipleSelector({
        choicesSelector: ".form__multipleselector-choices",
        choicesItemSelector: "form__multipleselector-item",
        dataSelector: ".form__multipleselector-data",
        dialogClosebtnSelector: ".multipleselect__btn-close",
        containerSpace: 20,
        cssAnimation: true
    });
}(jQuery));
