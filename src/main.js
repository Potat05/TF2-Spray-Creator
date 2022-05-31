
import { awaitLoadImage, convertFileSizeBytes } from './useful.js';
import { parseVTF } from './vtf.js';



/** @type {HTMLInputElement} */
const fileInput = document.querySelector('#file-input');
/** @type {HTMLAnchorElement} */
const fileOutput = document.querySelector('#file-output');
/** @type {HTMLInputElement} */
const editorCRC = document.querySelector('#editor-crc > input');
/** @type {HTMLSelectElement} */
const editorResolution = document.querySelector('#editor-resolution > select');
/** @type {HTMLInputElement} */
const editorGenerateMips = document.querySelector('#editor-generatemips > input');
/** @type {HTMLSelectElement} */
const editorFormat = document.querySelector('#editor-format > select');



async function generate() {
    let files = fileInput.files;

    if(files.length == 0) {
        files = ['./resource/test.png'];
    }

    // Wait to load images
    let images = [];
    for(let i=0; i < files.length; i++) {
        images[i] = await awaitLoadImage(files[i]);
    }

    console.time('generate')
    
    const vtfFile = parseVTF([[images[0]]], {
        width: parseInt(editorResolution.value),
        height: parseInt(editorResolution.value),
        imageFormat: parseInt(editorFormat.value),
        autoMips: editorGenerateMips.checked,
        crc: editorCRC.checked,
        downscaleAlias: false
    });
    
    console.timeEnd('generate');

    if(vtfFile == null) return;

    fileOutput.innerText = `Download VTF - ${convertFileSizeBytes(vtfFile.length)}`;

    // Download
    const blob = new Blob([vtfFile], {
        type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    fileOutput.setAttribute('href', url);
}


[fileInput, editorCRC, editorResolution, editorGenerateMips, editorFormat].forEach(elem => {
    elem.addEventListener('change', generate);
});

generate();