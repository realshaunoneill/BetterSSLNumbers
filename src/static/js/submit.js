function submitNumber() {

    verifyItems();
}

function verifyItems() {

    var scamType = document.getElementById('scamTypeSelect').value;
    var number = document.getElementById('submitNumber').value;
    var comment = document.getElementById('submitComment').value;

    var yesRadio = document.getElementById('yesVerifiedNumber').checked;
    var choiceThing = document.getElementById('invalidChoiceMsg');

    if (!scamType) document.getElementById('invalidScamTypeMsg').setAttribute('style', 'display: block;');
    if (!number) document.getElementById('submitNumber').setAttribute('class', 'input is-danger');
    if (!comment) document.getElementById('submitComment').setAttribute('class', 'textarea is-danger');

    if (!yesRadio) {
        choiceThing.setAttribute('style', 'display: block');
    } else {
        choiceThing.setAttribute('style', 'display: none');
    }

    if (!(!scamType || !number || !comment || !yesRadio)){

        if (!checkValidNumber()){
            console.log(`Sorry that number appears to be invalid!`);
            document.getElementById('submitNumber').setAttribute('class', 'input is-danger');
            return;
        }

        var countryInfo = fetchCountryInfo();

        submit(scamType, number, countryInfo.prefix, countryInfo.name, comment);
    }else {
        console.log(`You need to fill in all the fields!`);
    }
}

function checkValidNumber() {
    return $("#submitNumber").intlTelInput("isValidNumber");
}

function submit(scamType, number, country, countryName, comment) {
    console.log(`${scamType} = ${number} + ${country} || ${comment}`);

    var submitXhr = new XMLHttpRequest();
    submitXhr.open('GET', `${hostUrl}${buildSubmitUrl(scamType, number, country, countryName, comment)}`);
    submitXhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            submitSuccessfull();

            console.log(this.responseText)
        }
    };
    submitXhr.send();
}

function buildSubmitUrl(scamType, number, country, countryName, comment) {
    let url = '/api/submit?';

    url += `type=${scamType}`;
    url += `&number=${number}`;
    url += `&countryCode=${country}`;
    url += `&countryName=${countryName}`;
    url += `&comment=${comment}`;

    return url;
}

function fetchCountryInfo() {
    var countryData = $("#submitNumber").intlTelInput("getSelectedCountryData");
    return {name: countryData.name, prefix: countryData.dialCode};
}

function submitSuccessfull() {
    console.log(`Successfully submit number!`);
}