const video = document.getElementById('video');
const output = document.getElementById('output');
let stream = null;
let scanning = false;

// Acceder a la cámara
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Usa la cámara trasera
        });
        video.srcObject = stream;
    } catch (err) {
        output.textContent = 'Error al acceder a la cámara: ' + err;
    }
}

// Escanear código de barras continuamente
function scanBarcode() {
    if (!scanning) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
        output.textContent = `Código detectado: ${code.data}`;
        scanning = false; // Detener el escaneo tras detectar un código
    } else {
        output.textContent = 'No se detectó ningún código de barras';
        requestAnimationFrame(scanBarcode); // Continuar escaneando
    }
}

// Iniciar escaneo
window.startScanning = function() {
    if (!scanning) {
        scanning = true;
        scanBarcode();
    }
};

// Detener escaneo
window.stopScanning = function() {
    scanning = false;
    output.textContent = 'Escaneo detenido';
};

// Iniciar la cámara cuando se carga la página
startCamera();