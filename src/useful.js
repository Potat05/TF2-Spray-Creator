


/**
 * 
 * @param {String} src 
 * @returns 
 */
export function awaitLoadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = (src instanceof File ? URL.createObjectURL(src) : src);
        img.onload = () => resolve(img);
        img.onerror = () => reject('Image failed to load!');
    });
}


/**
 * Await an image loading.
 * @param {Image} file
 */
export function loadImageData(img, size=1024) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, (canvas.width - img.width*ratio) / 2, (canvas.height - img.height*ratio) / 2, img.width*ratio, img.height*ratio);  
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}


export function convertFileSizeBytes(size=0) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}


