jQuery(document).ready(bulma);

function bulma() {
    var $toggle = $("#nav-toggle");
    var $menu = $("#nav-menu");

    $toggle.click(function() {
        $(this).toggleClass("is-active");
        $menu.slideToggle(86);
    });
}
