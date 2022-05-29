
import { convertFileSizeBytes } from './useful.js';
import { parseVTF, VTF } from './vtf.js';




/** @type {HTMLInputElement} */
const fileInput = document.querySelector('#file-input');



const vtf = new VTF();

fileInput.addEventListener('input', async e => {
    await vtf.setImage(fileInput.files[0], true);

    const vtfFile = parseVTF(vtf);

    console.log('VTF File Size', convertFileSizeBytes(vtfFile.length));

    // Download
    const blob = new Blob([vtfFile], {
        type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    document.querySelector('#file-output').setAttribute('href', url);
});