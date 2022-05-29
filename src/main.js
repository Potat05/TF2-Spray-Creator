
import { convertFileSizeBytes } from './useful.js';
import { parseVTF, VTF } from './vtf.js';




/** @type {HTMLInputElement} */
const fileInput = document.querySelector('#file-input');
/** @type {HTMLAnchorElement} */
const fileOutput = document.querySelector('#file-output');



const vtf = new VTF();

fileInput.addEventListener('input', async e => {
    await vtf.setImage(fileInput.files[0], true);

    const vtfFile = parseVTF(vtf);

    fileOutput.innerText = `Download VTF - ${convertFileSizeBytes(vtfFile.length)}`;

    // Download
    const blob = new Blob([vtfFile], {
        type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    fileOutput.setAttribute('href', url);
});