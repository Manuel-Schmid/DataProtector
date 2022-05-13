let activeTab = 'encrypt';
let maxFileSize = 1*(1024*1024); // 1 MB (customizable file upload limit)
let pwRegex = new RegExp(regex.regex0);

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('input_file').addEventListener('change', file_upload, false);
    document.getElementById('input_password').addEventListener('keyup', passwordInputChange, false);
    document.getElementById('algorithms').addEventListener('click', disableDownload, false);
    disableAll()
});

let inputFiles = null;

function disableDownload() {
    document.getElementById('crypt-btn').className = 'btn btn-red vertical-center to-disable'
    document.getElementById('output-btn').className = 'btn btn-green vertical-center hidden'
}

function disableAll() {
    document.getElementById('crypt-btn').className = 'btn btn-red vertical-center to-disable'
    document.getElementById('output-btn').className = 'btn btn-green vertical-center hidden'
    document.getElementById('input_password').value = ''
    for (const el of document.getElementsByClassName('to-disable')) {
        el.disabled = true;
    }
}

function file_upload(e) {
    document.getElementById('output_file').href = ''
    inputFiles = null
    disableAll()

    if (activeTab === 'encrypt') {
        if(e.target.files.length < 1){
            alert('Please select at least one file to encrypt!');
        } else {
            let files = e.target.files

            let totalSize = 0
            for (const file of files) {
                totalSize += file.size
                if(file.size > maxFileSize){
                    alert('Large file sizes might crash your browser. \n Please select smaller files.');
                    return
                }
            }
            if(totalSize > maxFileSize){
                alert('Large file sizes might crash your browser. \n Please select smaller files.');
                return
            }

            enablePasswordInputs()
            inputFiles = files;
            document.getElementById('input-file-label').innerText = 'File/s to encrypt ✅'
        }
    } else if (activeTab === 'decrypt') {
        if(e.target.files.length !== 1){
            alert('Please select a file to decrypt!');
        } else if (e.target.files[0].name.indexOf('.encrypted') === -1) {
            alert('Please select an encrypted file.');
        } else {
            let file = e.target.files[0];

            if(file.size > maxFileSize){
                alert('Large file sizes might crash your browser. \n Please select a smaller file.');
            } else {
                enablePasswordInputs()
                inputFiles = [file];
                document.getElementById('input-file-label').innerText = 'File to decrypt ✅'
            }
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
    let pwInput = document.getElementById('input_password').value;
    document.getElementById('crypt-btn').disabled = !checkValidPassword(pwInput);
}

function checkValidPassword(pw) {
    return (!isEmpty(pw) && pwRegex.test(pw))
}

function generatePassword() {
    document.getElementById('input_password').value = new RandExp(pwRegex).gen();
    passwordInputChange()
}

function crypt() {
    let password = document.getElementById('input_password').value;

    if (inputFiles == null) {
        if (activeTab === 'encrypt') alert('Please select a file to encrypt!');
        else if (activeTab === 'decrypt') alert('Please select a file to decrypt!');
    } else if (isEmpty(password)) {
        // password validation
        alert('Please enter a valid password.')
    } else {

        if (activeTab === 'encrypt') {
            if (inputFiles.length > 1) { // multiple files
                let zip = new JSZip()

                for(let file of inputFiles){
                    zip.file(file.name, file)
                }

                zip.generateAsync({type:'blob'}).then((blobData)=>{
                    // create zip blob file
                    let zipBlob = new Blob([blobData])

                    let reader = new FileReader();
                    reader.readAsDataURL(zipBlob);
                    reader.onloadend = function() {
                        let base64data = reader.result;
                        let encrypted = getEncrypted(base64data, password) // get encryption of b64 compressed folder
                        document.getElementById('output_file').setAttribute('href', 'data:application/octet-stream,' + encrypted)
                        document.getElementById('output_file').setAttribute('download', 'decrypted.zip' + '.encrypted');
                    }
                })
            } else { // just one file
                let reader = new FileReader();
                reader.onload = function (e) {
                    let encrypted = getEncrypted(e.target.result, password) // get encryption of b64 compressed file
                    document.getElementById('output_file').setAttribute('href', 'data:application/octet-stream,' + encrypted)
                    document.getElementById('output_file').setAttribute('download', inputFiles[0].name + '.encrypted');
                };
                reader.readAsDataURL(inputFiles[0]);
            }
            showDownloadButton()
        }

        else if (activeTab === 'decrypt') {
            let reader = new FileReader();
            reader.onload = function (e) {
                let decrypted = getDecrypted(e.target.result, password) // get decryption of decompressed file

                if (!decrypted) return false // quit if an error occurs during decryption

                document.getElementById('output_file').setAttribute('href', decrypted)
                document.getElementById('output_file').setAttribute('download', inputFiles[0].name.replace('.encrypted',''))
                showDownloadButton()
            }
            reader.readAsText(inputFiles[0]);
        }
    }
}

function getEncrypted(compressedB64string, password) {
    let passwordHashes = getPasswordHashes(password)

    let encFile = getEncryptedFile(compressedB64string, passwordHashes.h1)
    let fileHash = CryptoJS.SHA256(encFile + passwordHashes.h2);

    return (encFile+fileHash);
}

function getDecrypted(compressedB64string, password) {
    let passwordHashes = getPasswordHashes(password)

    let str = compressedB64string;
    let encFile = str.slice(0, str.length-64);

    let expectedFileHash = ''+CryptoJS.SHA256(encFile + passwordHashes.h2);
    let actualFileHash = str.slice(str.length-64, str.length);

    let decrypted = getDecryptedFile(encFile, passwordHashes.h1);

    if(!/^data:/.test(decrypted)){
        alert("Invalid password, algorithm or file! Please try again.");
        return false;
    }

    if (expectedFileHash !== actualFileHash) { // file has been manipulated
        alert("Warning: File has been manipulated! Aborting decryption...");
        return false;
    }

    return decrypted;
}

function getEncryptedFile(compressedB64string, h1) {
    switch (document.getElementById('algorithms').value) {
        case 'AES':
            return CryptoJS.AES.encrypt(compressedB64string, h1);
        case 'TripleDES':
            return CryptoJS.TripleDES.encrypt(compressedB64string, h1);
        case 'Rabbit':
            return CryptoJS.Rabbit.encrypt(compressedB64string, h1);
        default:
            alert('An error occurred.')
            return null;
    }
}

function getDecryptedFile(compressedB64string, h1) {
    switch (document.getElementById('algorithms').value) {
        case 'AES':
            return CryptoJS.AES.decrypt(compressedB64string, h1).toString(CryptoJS.enc.Latin1);
        case 'TripleDES':
            return CryptoJS.TripleDES.decrypt(compressedB64string, h1).toString(CryptoJS.enc.Latin1);
        case 'Rabbit':
            return CryptoJS.Rabbit.decrypt(compressedB64string, h1).toString(CryptoJS.enc.Latin1);
        default:
            alert('An error occurred.')
            return
    }
}

function getPasswordHashes(password) {
    return {
        h1: CryptoJS.SHA512(password + 1).toString(),
        h2: CryptoJS.SHA512(password + 2).toString()
    }
}

function showDownloadButton() {
    document.getElementById('crypt-btn').className = 'btn btn-red vertical-center to-disable hidden'
    document.getElementById('output-btn').className = 'btn btn-green vertical-center'
}

function switchTab(tab) {
    disableAll()
    document.getElementById('input_password').value = ''
    toggleNavItemDisabled()
    if (tab === 'encrypt') {
        document.getElementById('input-file-label').innerText = 'File/s to encrypt'
        document.getElementById('input_file').accept = '*'
        document.getElementById('input_file').multiple = true;
        document.getElementById('input_password').style.width = '70%';
        document.getElementById('generate-password').style.width = '30%';
        document.getElementById('generate-password').style.display = 'inherit';
        document.getElementById('crypt-btn').innerHTML = 'Encrypt'
    } else if (tab === 'decrypt') {
        document.getElementById('input-file-label').innerText = 'File to decrypt'
        document.getElementById('input_file').accept = '.encrypted'
        document.getElementById('input_file').multiple = false;
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

dropArea.addEventListener('drop', handleDrop, false);
function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    if (activeTab === 'encrypt') {
        if (files.length < 1) {
            alert('Please select at least one file to encrypt!');
            return
        } else { // one or more files
            let totalSize = 0
            for (const file of files) {
                totalSize += file.size
                if(file.size > maxFileSize){
                    alert('Large file sizes might crash your browser. \n Please select smaller files.');
                    return
                }
            }
            if(totalSize > maxFileSize){
                alert('Large file sizes might crash your browser. \n Please select smaller files.');
                return
            }
            document.getElementById('input-file-label').innerText = 'File/s to encrypt ✅'
        }
    } else if (activeTab === 'decrypt') {
        if (files.length !== 1) {
            alert('Please select one file to decrypt!');
            return
        } else if (files[0].size > maxFileSize) {
            alert('Large file sizes might crash your browser. \n Please select a smaller file.');
            return
        } else if (files[0].name.indexOf('.encrypted') === -1) {
            alert('Please select an encrypted file');
        } else {
            document.getElementById('input-file-label').innerText = 'File to decrypt ✅'
        }
    }

    inputFiles = [...files]
    enablePasswordInputs()
}
