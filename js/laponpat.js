const recaptcha_sitekey = '6LeT1kgcAAAAAHrjQnkfB5L75Q49lcohtTOgcuwa';
const max = 100000;
const dragon = {
    0: './images/dragon/0.png',
    25: './images/dragon/25.png',
    50: './images/dragon/50.png',
    75: './images/dragon/75.png',
    100: './images/dragon/100.png',
}
function request(action, data, callback) {
    let formData = new FormData();
    formData.append('action', action);
    if (typeof data == "object") {
        for (let k in data) {
            formData.append(data[k].name, data[k].value);
        }
    }
    $.ajax({
	url: 'https://badstudent.co/api/v1.php',
        data: formData,
        method: 'POST',
        processData: false,
        contentType: false
    }).done((res) => {
        callback(200, res);
    }).fail(($xhr) => {
        callback($xhr.status, $xhr.responseJSON);
    });
}
