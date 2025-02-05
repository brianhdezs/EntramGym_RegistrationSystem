document.addEventListener('DOMContentLoaded', async () => {
    const clientTableBody = document.getElementById('clientTableBody');
    const searchInput = document.getElementById('searchInput');

    // Función para cargar clientes
    async function loadClients() {
        try {
            const response = await fetch('http://localhost:3000/clients');
            const clients = await response.json();

            clientTableBody.innerHTML = ''; // Limpiar tabla antes de actualizar

            clients.forEach(client => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td><img src="uploads/${client.photo}" class="rounded-circle" width="50" height="50"></td>
                    <td>${client.name}</td>
                    <td>${client.registrationDate}</td>
                    <td>${client.expirationDate}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${client.id}">Eliminar</button>
                    </td>
                `;

                clientTableBody.appendChild(row);
            });

            addDeleteEventListeners();
        } catch (error) {
            console.error('Error al cargar los clientes:', error);
        }
    }

    // Función para eliminar cliente
    async function deleteClient(clientId) {
        try {
            const response = await fetch(`http://localhost:3000/clients/${clientId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                loadClients(); // Recargar lista
            } else {
                console.error('Error al eliminar:', result.error);
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
        }
    }

    // Agregar eventos de eliminación
    function addDeleteEventListeners() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const clientId = this.getAttribute('data-id');
                if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
                    deleteClient(clientId);
                }
            });
        });
    }

    // Filtro de búsqueda
    searchInput.addEventListener('input', function () {
        const searchText = searchInput.value.toLowerCase();
        document.querySelectorAll('#clientTableBody tr').forEach(row => {
            const name = row.cells[1].textContent.toLowerCase();
            row.style.display = name.includes(searchText) ? '' : 'none';
        });
    });

    // Cargar clientes al cargar la página
    loadClients();
});
