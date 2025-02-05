document.addEventListener('DOMContentLoaded', () => {
    const photoPreview = document.getElementById('photoPreview');
    const takePhotoButton = document.getElementById('takePhoto');
    const camera = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const clientForm = document.getElementById('clientForm');

    let stream = null;

    // Función para iniciar la cámara
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            camera.srcObject = stream;
            camera.style.display = 'block';
            photoPreview.style.display = 'none';
            takePhotoButton.textContent = 'Tomar Foto';
        } catch (error) {
            alert('No se pudo acceder a la cámara.');
        }
    }

    // Función para capturar la foto
    takePhotoButton.addEventListener('click', () => {
        if (!stream) {
            startCamera();
        } else {
            canvas.width = camera.videoWidth;
            canvas.height = camera.videoHeight;
            canvas.getContext('2d').drawImage(camera, 0, 0, canvas.width, canvas.height);
            photoPreview.src = canvas.toDataURL('image/png');
            photoPreview.style.display = 'block';
            camera.style.display = 'none';
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            takePhotoButton.textContent = 'Abrir Cámara';
        }
    });

    // Función para limpiar el formulario
    clientForm.addEventListener('reset', () => {
        photoPreview.src = 'https://via.placeholder.com/200';
        photoPreview.style.display = 'block';
        camera.style.display = 'none';
        takePhotoButton.textContent = 'Abrir Cámara';
    });

    // Evento de envío del formulario
    clientForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const clientName = document.getElementById('clientName').value;
        const registrationDate = document.getElementById('registrationDate').value;
        const expirationDate = document.getElementById('expirationDate').value;

        console.log('Datos del cliente registrados:', {
            clientName,
            registrationDate,
            expirationDate
        });

        alert('Cliente registrado con éxito.');
        clientForm.reset();
    });
});
