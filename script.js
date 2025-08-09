const video = document.getElementById('video');
const output = document.getElementById('output');
let stream = null;
let scanning = false;
let lastCode = null;

// Acceder a la cámara
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', 
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        video.srcObject = stream;
        console.log('Cámara iniciada con éxito. Resolución:', video.videoWidth, 'x', video.videoHeight);
    } catch (err) {
        output.textContent = 'Error al acceder a la cámara: ' + err;
        console.error('Error al iniciar la cámara:', err);
    }
}

// Iniciar escaneo con QuaggaJS
window.startScanning = function() {
    if (scanning) return;
    scanning = true;
    console.log('Iniciando escaneo...');
    Quagga.init({
        inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: video,
            constraints: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        },
        decoder: {
            readers: ['upc_reader', 'ean_reader'] // Optimizado para UPC-A y EAN-13
        },
        locate: true
    }, function(err) {
        if (err) {
            output.textContent = 'Error al iniciar Quagga: ' + err;
            console.error('Error al iniciar Quagga:', err);
            scanning = false;
            return;
        }
        console.log('Quagga inicializado');
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        if (code) {
            lastCode = code;
            output.textContent = `Código detectado: ${code}`;
            console.log('Código detectado:', code, 'Formato:', result.codeResult.format);
            Quagga.stop();
            scanning = false;
        }
    });
};

// Detener escaneo
window.stopScanning = function() {
    if (scanning) {
        Quagga.stop();
        scanning = false;
        output.textContent = lastCode ? `Escaneo detenido. Último código: ${lastCode}` : 'Escaneo detenido';
        console.log('Escaneo detenido');
    }
};

// Iniciar la cámara cuando se carga la página
startCamera();