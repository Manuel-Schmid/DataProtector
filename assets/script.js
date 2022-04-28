let activeTab = 'encrypt';

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('input_file').addEventListener('change', file_upload, false);
    document.getElementById('input_password').addEventListener('keyup', passwordInputChange, false);
    document.getElementById('algorithms').addEventListener('click', disableDownload, false);
    disableAll()
});

let inputFile = null;

function disableDownload() {
    document.getElementById('crypt-btn').className = 'btn btn-green vertical-center to-disable'
    document.getElementById('output-btn').className = 'btn btn-red vertical-center hidden'
}

function disableAll() {
    document.getElementById('crypt-btn').className = 'btn btn-green vertical-center to-disable'
    document.getElementById('output-btn').className = 'btn btn-red vertical-center hidden'
    document.getElementById('input_password').value = ''
    for (const el of document.getElementsByClassName('to-disable')) {
        el.disabled = true;
    }
}

function file_upload(e) {
    document.getElementById('output_file').href = ''
    inputFile = null

    disableAll()
    if(e.target.files.length !== 1){
        if (activeTab === 'encrypt') alert('Please select a file to encrypt!');
        else if (activeTab === 'decrypt') alert('Please select a file to decrypt!');
    } else {
        let file = e.target.files[0];

        if(file.size > 1024*1024){
            alert('File sizes larger than 1mb might crash your browser. \n Please select a smaller file.');
        } else {
            enablePasswordInputs()
            inputFile = file;
        }
    }
}

function enablePasswordInputs() {
    for (let el of document.getElementsByClassName('in-pw-container')) {
        el.disabled = false;
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

        if (activeTab === 'encrypt') {
            reader.onload = function (e) {
                let encrypted = getEncrypted(e.target.result, password)
                document.getElementById('output_file').setAttribute('href', 'data:application/octet-stream,' + encrypted)
                document.getElementById('output_file').setAttribute('download', inputFile.name + '.encrypted');
            };
            reader.readAsDataURL(inputFile);
            showDownloadButton()
        } else if (activeTab === 'decrypt') {
            reader.onload = function (e) {
                let decrypted = getDecrypted(e.target.result, password)
                if(!/^data:/.test(decrypted)){
                    alert("Invalid password or file! Please try again.");
                    return false;
                }
                document.getElementById('output_file').setAttribute('href', decrypted)
                document.getElementById('output_file').setAttribute('download', inputFile.name.replace('.encrypted',''))
                showDownloadButton()
            };
            reader.readAsText(inputFile);
        }
    }
}

function getDecrypted(fileReaderResult, password) {
    switch (document.getElementById('algorithms').value) {
        case 'AES':
            return CryptoJS.AES.decrypt(fileReaderResult, password).toString(CryptoJS.enc.Latin1);
        case 'TripleDES':
            return CryptoJS.TripleDES.decrypt(fileReaderResult, password).toString(CryptoJS.enc.Latin1);
        case 'Rabbit':
            return CryptoJS.Rabbit.decrypt(fileReaderResult, password).toString(CryptoJS.enc.Latin1);
        default:
            console.log('An error occurred.')
    }
}

function getEncrypted(fileReaderResult, password) {
    switch (document.getElementById('algorithms').value) {
        case 'AES':
            return CryptoJS.AES.encrypt(fileReaderResult, password);
        case 'TripleDES':
            return CryptoJS.TripleDES.encrypt(fileReaderResult, password);
        case 'Rabbit':
            return CryptoJS.Rabbit.encrypt(fileReaderResult, password);
        default:
            console.log('An error occurred.')
    }
}

function dropHandler(e) {
    e.preventDefault() // prevents opening file
    if (e.dataTransfer.length !== 1 || e.dataTransfer.items[0].kind !== 'file') {
        if (activeTab === 'encrypt') alert('Please select a valid file to encrypt!');
        else if (activeTab === 'decrypt') alert('Please select a valid file to decrypt!');
    } else {
        inputFile = e.dataTransfer.items[0].getAsFile();
    }
}

function showDownloadButton() {
    document.getElementById('crypt-btn').className = 'btn btn-green vertical-center to-disable hidden'
    document.getElementById('output-btn').className = 'btn btn-red vertical-center'
}

function switchTab(tab) {
    document.getElementById('input_password').value = ''
    toggleNavItemDisabled()
    if (tab === 'encrypt') {
        document.getElementById('input-file-label').innerText = 'File to encrypt'
        document.getElementById('input_file').accept = '*'
        document.getElementById('input_password').style.width = '70%';
        document.getElementById('generate-password').style.width = '30%';
        document.getElementById('generate-password').style.display = 'inherit';
        document.getElementById('crypt-btn').innerHTML = 'Encrypt'
    } else if (tab === 'decrypt') {
        document.getElementById('input-file-label').innerText = 'File to decrypt'
        document.getElementById('input_file').accept = '.encrypted'
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

function downloadFile() {
    document.getElementById('output_file').click()
    disableAll()
}

// drag & drop zone

let dropArea = document.getElementById('drop-area');
let input_field = document.getElementById('input-file-label');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
})
function highlight(e) {
    input_field.classList.add('highlight')
}
function unhighlight(e) {
    input_field.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false)
function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    inputFile = ([...files])[0];
    enablePasswordInputs()
}

