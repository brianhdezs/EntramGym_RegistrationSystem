document.addEventListener('DOMContentLoaded', () => {
    const photoPreview = document.getElementById('photoPreview');
    const takePhotoButton = document.getElementById('takePhoto');
    const camera = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const clientForm = document.getElementById('clientForm');
    const successToast = new bootstrap.Toast(document.getElementById('successToast'));
    const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
    const errorToastBody = document.getElementById('errorToastBody');

    let stream = null;
    let photoTaken = false;

    function showErrorToast(message) {
        errorToastBody.textContent = message;
        errorToast.show();
        setTimeout(() => {
            errorToast.hide();
        }, 3000);
    }

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            camera.srcObject = stream;
            camera.style.display = 'block';
            photoPreview.style.display = 'none';
            takePhotoButton.textContent = 'Tomar Foto';
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            showErrorToast('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    }

    takePhotoButton.addEventListener('click', () => {
        if (!stream) {
            startCamera();
        } else {
            try {
                canvas.width = camera.videoWidth;
                canvas.height = camera.videoHeight;
                canvas.getContext('2d').drawImage(camera, 0, 0, canvas.width, canvas.height);
                photoPreview.src = canvas.toDataURL('image/png');
                photoPreview.style.display = 'block';
                camera.style.display = 'none';
                
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    stream = null;
                }
                takePhotoButton.textContent = 'Abrir Cámara';
                photoTaken = true;
            } catch (error) {
                console.error('Error al capturar la foto:', error);
                showErrorToast('Hubo un problema al capturar la foto. Inténtalo de nuevo.');
                photoTaken = false;
            }
        }
    });

    async function uploadImage(imageDataUrl, formData) {
        try {
            const blob = await fetch(imageDataUrl).then(res => res.blob());
            formData.append('photo', blob, "imagen.png");

            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log("✅ Respuesta del servidor:", result);

            if (result.file) {
                return true;
            } else {
                throw new Error("Error al guardar la imagen");
            }
        } catch (error) {
            console.error('❌ Error al subir la imagen:', error);
            throw error;
        }
    }

    clientForm.addEventListener('reset', () => {
        try {
            photoPreview.src = '/images/profile_img_placeholder.jpg';
            photoPreview.style.display = 'block';
            camera.style.display = 'none';
            takePhotoButton.textContent = 'Abrir Cámara';
            photoTaken = false;
        } catch (error) {
            console.error('Error al limpiar el formulario:', error);
            showErrorToast('Hubo un problema al limpiar el formulario.');
        }
    });

    clientForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const clientName = document.getElementById('clientName').value.trim();
            const registrationDate = document.getElementById('registrationDate').value;
            const expirationDate = document.getElementById('expirationDate').value;

            if (!clientName || !registrationDate) {
                showErrorToast("Nombre y fecha de ingreso son requeridos.");
                return;
            }

            if (!photoTaken) {
                showErrorToast("Por favor, tome una foto del cliente.");
                return;
            }

            const formData = new FormData();
            formData.append('clientName', clientName);
            formData.append('registrationDate', registrationDate);
            formData.append('expirationDate', expirationDate);

            await uploadImage(photoPreview.src, formData);
            
            console.log('Datos del cliente registrados:', {
                clientName,
                registrationDate,
                expirationDate
            });

            successToast.show();
            setTimeout(() => successToast.hide(), 3000);
            clientForm.reset();
        } catch (error) {
            console.error('Error al registrar el cliente:', error);
            showErrorToast('Hubo un problema al registrar el cliente. Inténtalo nuevamente.');
        }
    });
});