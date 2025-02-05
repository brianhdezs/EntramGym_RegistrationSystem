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

    // Función para mostrar mensajes de error con Toast
    function showErrorToast(message) {
        errorToastBody.textContent = message;
        errorToast.show();
        setTimeout(() => {
            errorToast.hide();
        }, 3000);
    }

    // Función para iniciar la cámara
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            camera.srcObject = stream;
            camera.style.display = 'block';
            camera.style.position = 'relative';
            photoPreview.style.display = 'none';
            takePhotoButton.textContent = 'Tomar Foto';
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
    
            // Asegurar que el mensaje de error se muestre
            document.getElementById('errorToastBody').textContent = 'No se pudo acceder a la cámara. Verifica los permisos.';
            const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
            errorToast.show();
    
            setTimeout(() => {
                errorToast.hide();
            }, 3000);
        }
    }
    

    // Función para capturar la foto
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
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                takePhotoButton.textContent = 'Abrir Cámara';
            } catch (error) {
                console.error('Error al capturar la foto:', error);
                showErrorToast('Hubo un problema al capturar la foto. Inténtalo de nuevo.');
            }
        }
    });

    // Función para limpiar el formulario
    clientForm.addEventListener('reset', () => {
        try {
            photoPreview.src = '/images/profile_img_placeholder.jpg';
            photoPreview.style.display = 'block';
            camera.style.display = 'none';
            takePhotoButton.textContent = 'Abrir Cámara';
        } catch (error) {
            console.error('Error al limpiar el formulario:', error);
            showErrorToast('Hubo un problema al limpiar el formulario.');
        }
    });

    // Evento de envío del formulario
    clientForm.addEventListener('submit', (event) => {
        event.preventDefault();

        try {
            const clientName = document.getElementById('clientName').value;
            const registrationDate = document.getElementById('registrationDate').value;
            const expirationDate = document.getElementById('expirationDate').value;

            console.log('Datos del cliente registrados:', {
                clientName,
                registrationDate,
                expirationDate
            });

            // Mostrar el toast de éxito
            successToast.show();
            setTimeout(() => {
                successToast.hide();
            }, 3000);

            // Reiniciar el formulario
            clientForm.reset();
        } catch (error) {
            console.error('Error al registrar el cliente:', error);
            showErrorToast('Hubo un problema al registrar el cliente. Inténtalo nuevamente.');
        }
    });
});
