
import { awaitLoadImage, convertFileSizeBytes, loadImageData, parseHTML } from './useful.js';
import { parseVTF } from './vtf.js';

/** @type {HTMLAnchorElement} */
const fileOutput = document.querySelector('#file-output');
/** @type {HTMLInputElement} */
const editorImageSmoothing = document.querySelector('#editor-imageSmoothing > input');
/** @type {HTMLInputElement} */
const editorSamplingMethod = document.querySelector('#editor-sampling > select');
/** @type {HTMLInputElement} */
const editorCRC = document.querySelector('#editor-crc > input');
/** @type {HTMLSelectElement} */
const editorResolutionX = document.querySelector('#editor-resolution > select[data-type="width"]');
/** @type {HTMLSelectElement} */
const editorResolutionY = document.querySelector('#editor-resolution > select[data-type="height"]');
/** @type {HTMLInputElement} */
const editorGenerateThumbnail = document.querySelector('#editor-generateThumbnail > input');
/** @type {HTMLSelectElement} */
const editorFormat = document.querySelector('#editor-format > select');



async function generate() {

    let files = [];
    document.querySelectorAll('.editor-images-input').forEach(input => {
        files.push(input.files[0]);
    });

    for(let i=0; i < files.length; i++) {
        if(!files[i]) {
            for(let j=files.length-1; j >= 0; j--) {
                if(files[j]) files[i] = files[j];
            }
            if(!files[i]) {
                files[i] = './resource/favicon.png';
            }
        }
    }

    fileOutput.innerText = '';

    // Wait to load images
    let images = [];
    for(let i=0; i < files.length; i++) {
        images[i] = await awaitLoadImage(files[i]);
    }

    for(let i=0; i < images.length; i++) {
        images[i] = [images[i]];
    }

    console.time('generate')

    const width = parseInt(editorResolutionX.value);
    const height = parseInt(editorResolutionY.value);
    
    const vtfFile = parseVTF(images, {
        width,
        height,
        flags: Number(editorSamplingMethod.value),
        imageFormat: parseInt(editorFormat.value),
        autoMips: false,
        crc: editorCRC.checked,
        downscaleAlias: editorImageSmoothing.checked,
        generateThumbnail: editorGenerateThumbnail.checked,
        views: document.querySelectorAll('.editor-images-view')
    });
    
    console.timeEnd('generate');

    if(vtfFile == null) return;

    fileOutput.innerText = `Download VTF - ${convertFileSizeBytes(vtfFile.length)}`;
    if(vtfFile.length <= 524288) fileOutput.style.color = '';
    else fileOutput.style.color = 'red';

    // Download
    const blob = new Blob([vtfFile], {
        type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    fileOutput.setAttribute('href', url);
}

/** @type {HTMLDivElement} */
const editorImagesList = document.querySelector('#editor-images-list');
/** @type {HTMLButtonElement} */
const editorImageAdd = document.querySelector('#editor-images-add');

function addImage() {

    // Check if number of images hits mipmap limit
    const width = parseInt(editorResolutionX.value);
    const height = parseInt(editorResolutionY.value);
    let mipmapCount = 1;
    while((width/2**mipmapCount > 4) && (height/2**mipmapCount > 4)) mipmapCount++;
    if(editorImagesList.children.length >= mipmapCount) return false;

    // Image
    const newImage = parseHTML(/* html */`
        <div class="editor-image-container">
            <div class="editor-image-buttons">
                <input class="editor-images-input" type="file" multiple>
                <button class="editor-images-remove">-</button>
            </div>
            <canvas class="editor-images-view"></canvas>
        </div>
    `);

    newImage.querySelector('.editor-images-remove').addEventListener('click', () => {
        if(editorImagesList.children.length == 1) {
            return;
        }
        newImage.remove();
        generate();
    });

    newImage.querySelector('.editor-images-input').addEventListener('change', generate);

    editorImagesList.appendChild(newImage);

    return true;
}

editorImageAdd.addEventListener('click', () => {
    if(addImage()) generate();
});

addImage();

// Delete very small images
[editorResolutionX, editorResolutionY].forEach(elem => {
    elem.addEventListener('change', () => {
        const width = parseInt(editorResolutionX.value);
        const height = parseInt(editorResolutionY.value);
        let mipmapCount = 1;
        editorImagesList.childNodes.forEach(image => {
            if(((width/2**mipmapCount > 4) && (height/2**mipmapCount > 4))) {
                mipmapCount++;
            } else {
                image.remove();
            }
        });
    });
});


[editorImageSmoothing, editorSamplingMethod, editorCRC, editorResolutionX, editorResolutionY, editorGenerateThumbnail, editorFormat].forEach(elem => {
    elem.addEventListener('change', generate);
});

generate();



