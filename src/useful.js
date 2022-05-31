


/**
 * Await image load
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
 * Get an images data
 * @param {Image} file
 */
export function loadImageData(img, width=1024, height=1024, antialias=true) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = antialias;
    const ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, (canvas.width - img.width*ratio) / 2, (canvas.height - img.height*ratio) / 2, img.width*ratio, img.height*ratio);  
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}


export function convertFileSizeBytes(size=0) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}


export function lerp(v0=0, v1=1, t=0.5) {
    return (1 - t) * v0 + t * v1;
}
