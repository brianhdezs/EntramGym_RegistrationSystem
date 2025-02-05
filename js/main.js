document.addEventListener('DOMContentLoaded', () => {
    const photoPreview = document.getElementById('photoPreview');
    const takePhotoButton = document.getElementById('takePhoto');
    const camera = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const clientForm = document.getElementById('clientForm');
    const successToast = new bootstrap.Toast(document.getElementById('successToast'), {
        delay: 3000
    });
    const errorToast = new bootstrap.Toast(document.getElementById('errorToast'), {
        delay: 3000
    });
    const errorToastBody = document.getElementById('errorToastBody');

    let stream = null;
    let photoTaken = false;

    function showErrorToast(message) {
        errorToastBody.textContent = message;
        errorToast.show();
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
            
            // Asegurémonos que los datos están siendo enviados con los nombres correctos
            formData.delete('photo'); // Limpiamos primero por si acaso
            formData.append('photo', blob, 'imagen.png');
            
            console.log("📤 Datos a enviar:", {
                clientName: formData.get('clientName'),
                registrationDate: formData.get('registrationDate'),
                expirationDate: formData.get('expirationDate'),
                hasPhoto: formData.has('photo')
            });
    
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });
    
            // Log de la respuesta completa para debugging
            const responseText = await response.text();
            console.log("📥 Respuesta completa del servidor:", responseText);
    
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error("Error al parsear la respuesta:", e);
                throw new Error("La respuesta del servidor no es JSON válido");
            }
    
            if (!response.ok) {
                throw new Error(`Error del servidor: ${result.message || response.statusText}`);
            }
    
            if (!result.file) {
                throw new Error("No se recibió confirmación del archivo guardado");
            }
    
            return true;
        } catch (error) {
            console.error('❌ Error detallado:', error);
            throw new Error(`Error al subir la imagen: ${error.message}`);
        }
    }

    clientForm.addEventListener('reset', () => {
        try {
            photoPreview.src = '/images/profile_img_placeholder.jpg';
            photoPreview.style.display = 'block';
            camera.style.display = 'none';
            takePhotoButton.textContent = 'Abrir Cámara';
            photoTaken = false;
            
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
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
            
            console.log('Cliente registrado:', {
                clientName,
                registrationDate,
                expirationDate
            });

            successToast.show();
            
            // Pequeño delay antes de resetear el formulario
            setTimeout(() => {
                clientForm.reset();
            }, 1000);
            
        } catch (error) {
            console.error('Error al registrar el cliente:', error);
            showErrorToast('Hubo un problema al registrar el cliente. Inténtalo nuevamente.');
        }
    });
});