function openMoreInfoBox(numberID) {

    var modalInfo = document.getElementById(`info_${numberID}`);
    if (!modalInfo) return;

    modalInfo.setAttribute('class', 'modal is-active');
}

function closeMoreInfoBox(numberID) {
    var modalInfo = document.getElementById(`info_${numberID}`);
    if (!modalInfo) return;

    modalInfo.setAttribute('class', 'modal');
}

function numberWorked(numberID) {
    console.log(`Submitting working vote for number with id ${numberID}`);

}

function numberDidntWork(numberID) {
    console.log(`Submitting not working vote for number with id ${numberID}`);

}

function removeNumber(numberID) {
    console.log(`Submitting removal for number with id ${numberID}`);
}

$("tr").not(':first').hover(
    function () {
        $(this).addClass('is-selected');
    }, function () {
        $(this).removeClass('is-selected');
    }
);