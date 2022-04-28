let activeTab = 'encrypt';

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('input_file').addEventListener('change', file_upload, false);
    document.getElementById('output-btn').addEventListener('click', disableAll, false);
    document.getElementById('input_password').addEventListener('keyup', passwordInputChange, false);
    disableAll()
});

let inputFile = null;

function disableAll() {
    document.getElementById('crypt-btn').className = 'btn btn-green vertical-center to-disable'
    document.getElementById('output-btn').className = 'btn btn-red vertical-center hidden'
    document.getElementById('input_password').value = ''
    for (const el of document.getElementsByClassName('to-disable')) {
        el.disabled = true;
    }
}

function file_upload(e) {
    disableAll()
    if(e.target.files.length !== 1){
        alert('Please select a file to encrypt!');
    } else {
        let file = e.target.files[0];

        if(file.size > 1024*1024){
            alert('File sizes larger than 1mb might crash your browser. \n Please select a smaller file.');
        } else {
            for (let el of document.getElementsByClassName('in-pw-container')) {
                el.disabled = false;
            }
            inputFile = file;
        }
    }
}

function isEmpty(str) {
    return !str.trim().length;
}

function passwordInputChange() {
    document.getElementById('crypt-btn').disabled = !!isEmpty(document.getElementById('input_password').value);
}

function crypt() {
    let password = document.getElementById('input_password').value;
    if (inputFile == null) {
        if (activeTab === 'encrypt') alert('Please select a file to encrypt!');
        else if (activeTab === 'decrypt') alert('Please select a file to decrypt!');
    } else if (isEmpty(password)) {
        // password validation
        alert('Please enter a valid password.')
    } else {
        let reader = new FileReader();
        reader.onload = function (e) {

            let encrypted = CryptoJS.AES.encrypt(e.target.result, password);

            document.getElementById('output_file').setAttribute('href', 'data:application/octet-stream,' + encrypted)
            document.getElementById('output_file').setAttribute('download', inputFile.name + '.encrypted');
        }
        reader.readAsDataURL(inputFile);

        document.getElementById('crypt-btn').className = 'btn btn-green vertical-center to-disable hidden'
        document.getElementById('output-btn').className = 'btn btn-red vertical-center'
    }
}

function switchTab(tab) {
    toggleNavItemDisabled()
    if (tab === 'encrypt') {
        document.getElementById('input-file-label').innerText = 'File to encrypt'
        document.getElementById('input_password').style.width = '70%';
        document.getElementById('generate-password').style.width = '30%';
        document.getElementById('crypt-btn').innerHTML = 'Encrypt'
        // document.getElementById('generate-password').style.display = 'none';
    } else if (tab === 'decrypt') {
        document.getElementById('input-file-label').innerText = 'File to decrypt'
        document.getElementById('input_password').style.width = '100%';
        document.getElementById('generate-password').style.display = 'none';
        document.getElementById('crypt-btn').innerHTML = 'Decrypt'
    }
    activeTab = tab
}

function toggleNavItemDisabled() {
    for (let el of document.getElementsByClassName('nav-item')) {
        el.disabled = !el.disabled;
        el.classList.toggle('active-tab')
    }
}

// function decrypt() {
//     let input_file = document.getElementById('input_file').files[0];
//     let pwd = document.getElementById('input_password').value;
// }