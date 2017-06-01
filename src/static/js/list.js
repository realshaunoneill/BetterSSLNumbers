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

function numberWorked(numberID, number) {
    var voteUpXhr = new XMLHttpRequest();
    voteUpXhr.open('GET', `${hostUrl}/api/vote?number=${number}&vote=up`);
    voteUpXhr.onreadystatechange = function () {
        console.log(this.responseText);

        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);

            successfullVote(numberID);

        } else {
            closeMoreInfoBox(numberID);
            showError();
        }
    };
    voteUpXhr.send();

    console.log(`Submitting working vote for number  ${number}`);
}

function numberDidntWork(numberID, number) {
    var voteDownXhr = new XMLHttpRequest();
    voteDownXhr.open('GET', `${hostUrl}/api/vote?number=${number}&vote=down`);
    voteDownXhr.onreadystatechange = function () {

        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);

            successfullVote(numberID);

        } else {
            closeMoreInfoBox(numberID);
            showError();
        }
    };
    voteDownXhr.send();

    console.log(`Submitting not working vote for number ${number}`);
}

function removeNumber(numberID, number) {
    var removeNumberXhr = new XMLHttpRequest();
    removeNumberXhr.open('GET', `${hostUrl}/api/remove?number=${number}`);
    removeNumberXhr.onreadystatechange = function () {
        console.log(this);

        if (this.readyState === 4 && this.status === 200) {
            successfullRemove(numberID);
        } else {
            showSnackbar(`Sorry but that number was unable to be deleted.<br>Error: ${this.responseText}`);
            closeMoreInfoBox(numberID);
        }
    };
    removeNumberXhr.send();

    console.log(`Submitting removal for number  ${number}`);
}

function successfullVote(numberID) {

    closeMoreInfoBox(numberID);
    showSnackbar('Your vote has been recorded successfully!');
    refreshPage();
}

function successfullRemove(numberID) {
    closeMoreInfoBox(numberID);
    showSnackbar(`You have successfully removed the number with ID: ${numberID}`);
    refreshPage();
}

function showError() {
    showSnackbar("Sorry but your vote couldn't be recorded, maybe you have voted for this number before?")
}

function refreshPage() {
    setTimeout(function () {
        window.location.reload()
    }, 6000)
}

function showSnackbar(text) {
    var bar = document.getElementById("snackbar");
    bar.innerHTML = text;
    bar.className = "show";

    setTimeout(function () {
        bar.className = bar.className.replace("show", "");
    }, 3000);
}

$("tr").not(':first').hover(
    function () {
        $(this).addClass('is-selected');
    }, function () {
        $(this).removeClass('is-selected');
    }
);