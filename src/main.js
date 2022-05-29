
import { convertFileSizeBytes } from './useful.js';
import { parseVTF, VTF } from './vtf.js';



const editorResolution = document.querySelector('#editor-resolution > select');
const editorGenerateMips = document.querySelector('#editor-generatemips > input');

let file = null;
async function generate() {
    if(!file) return;

    vtf.size = parseInt(editorResolution.value);

    await vtf.setImage(fileInput.files[0], editorGenerateMips.checked);

    const vtfFile = parseVTF(vtf);

    fileOutput.innerText = `Download VTF - ${convertFileSizeBytes(vtfFile.length)}`;

    // Download
    const blob = new Blob([vtfFile], {
        type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    fileOutput.setAttribute('href', url);
}



/** @type {HTMLInputElement} */
const fileInput = document.querySelector('#file-input');
/** @type {HTMLAnchorElement} */
const fileOutput = document.querySelector('#file-output');



const vtf = new VTF();

fileInput.addEventListener('input', async () => {
    file = fileInput.files[0];
    generate();
});


editorResolution.addEventListener('change', () => {
    generate();
});

editorGenerateMips.addEventListener('change', () => {
    generate();
});

