async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (data.success) {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('inventoryContainer').style.display = 'block';
            loadTabContent('entradas');
        } else {
            alert(data.message || 'Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
    return false;
}

function handleLogout() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('inventoryContainer').style.display = 'none';
    document.getElementById('loginForm').reset();
}

const data = {
    entradas: [
        { id: 1, producto: 'Material A', cantidad: 100, fecha: '2024-02-04', estado: 'Recibido' },
        { id: 2, producto: 'Material B', cantidad: 50, fecha: '2024-02-04', estado: 'Pendiente' }
    ],
    asignaciones: [
        { id: 1, trabajador: 'Juan Pérez', producto: 'Material A', cantidad: 20, fecha: '2024-02-04' },
        { id: 2, trabajador: 'María García', producto: 'Material B', cantidad: 15, fecha: '2024-02-04' }
    ],
    mermas: [
        { id: 1, producto: 'Material A', cantidad: 5, causa: 'Daño en transporte', fecha: '2024-02-03' },
        { id: 2, producto: 'Material C', cantidad: 3, causa: 'Caducidad', fecha: '2024-02-02' }
    ]
};

function loadTabContent(tabName) {
    const tabContent = document.getElementById('tabContent');
    let columns;
    
    switch(tabName) {
        case 'entradas':
            columns = [
                { key: 'id', header: 'ID' },
                { key: 'producto', header: 'Producto' },
                { key: 'cantidad', header: 'Cantidad' },
                { key: 'fecha', header: 'Fecha' },
                { key: 'estado', header: 'Estado' }
            ];
            break;
        case 'asignaciones':
            columns = [
                { key: 'id', header: 'ID' },
                { key: 'trabajador', header: 'Trabajador' },
                { key: 'producto', header: 'Producto' },
                { key: 'cantidad', header: 'Cantidad' },
                { key: 'fecha', header: 'Fecha' }
            ];
            break;
        case 'mermas':
            columns = [
                { key: 'id', header: 'ID' },
                { key: 'producto', header: 'Producto' },
                { key: 'cantidad', header: 'Cantidad' },
                { key: 'causa', header: 'Causa' },
                { key: 'fecha', header: 'Fecha' }
            ];
            break;
    }

    const table = createTable(data[tabName], columns);
    tabContent.innerHTML = '';
    tabContent.appendChild(table);
}

function createTable(data, columns) {
    const table = document.createElement('div');
    table.className = 'table-container';
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    ${columns.map(col => `<th>${col.header}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(item => {
        tableHTML += '<tr>';
        columns.forEach(col => {
            if (col.key === 'estado') {
                const badgeClass = item[col.key] === 'Recibido' ? 'badge-blue' : 'badge-gray';
                tableHTML += `<td><span class="badge ${badgeClass}">${item[col.key]}</span></td>`;
            } else {
                tableHTML += `<td>${item[col.key]}</td>`;
            }
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    table.innerHTML = tableHTML;
    return table;
}

document.getElementById('tabs').addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        loadTabContent(e.target.dataset.tab);
    }
});











// Coloca esto dentro de las etiquetas <script> existentes, justo después de la definición de data

// Variables globales
let currentTab = 'entradas';

// Funciones existentes (mantén estas que ya tienes)
document.getElementById('loginForm').addEventListener('submit', function(e) { ... });
document.getElementById('logoutBtn').addEventListener('click', function() { ... });

// Funciones de tabla y pestañas (mantén estas que ya tienes)
function loadTabContent(tabName) { ... }
function createTable(data, columns) { ... }

// Nuevas funciones para editar y eliminar
function getCurrentTab() {
    return currentTab;
}

function editItem(id, tabName) {
    const item = data[tabName].find(item => item.id === id);
    if (!item) return;

    const fields = document.getElementById('editFields');
    fields.innerHTML = '';
    
    const columns = getColumns(tabName);
    columns.forEach(col => {
        if (col.key !== 'id' && col.key !== 'fecha') {
            const div = document.createElement('div');
            div.className = 'form-group';
            
            if (col.key === 'estado') {
                div.innerHTML = `
                    <label for="edit_${col.key}">${col.header}</label>
                    <select id="edit_${col.key}" class="form-control">
                        <option value="Recibido" ${item[col.key] === 'Recibido' ? 'selected' : ''}>Recibido</option>
                        <option value="Pendiente" ${item[col.key] === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    </select>
                `;
            } else {
                div.innerHTML = `
                    <label for="edit_${col.key}">${col.header}</label>
                    <input type="${col.key === 'cantidad' ? 'number' : 'text'}" 
                           id="edit_${col.key}" 
                           value="${item[col.key]}" 
                           class="form-control">
                `;
            }
            fields.appendChild(div);
        }
    });

    document.getElementById('editId').value = id;
    document.getElementById('editModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = `Editar ${tabName.slice(0, -1)}`;
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function getColumns(tabName) {
    switch(tabName) {
        case 'entradas':
            return [
                { key: 'id', header: 'ID' },
                { key: 'producto', header: 'Producto' },
                { key: 'cantidad', header: 'Cantidad' },
                { key: 'fecha', header: 'Fecha' },
                { key: 'estado', header: 'Estado' }
            ];
        case 'asignaciones':
            return [
                { key: 'id', header: 'ID' },
                { key: 'trabajador', header: 'Trabajador' },
                { key: 'producto', header: 'Producto' },
                { key: 'cantidad', header: 'Cantidad' },
                { key: 'fecha', header: 'Fecha' }
            ];
        case 'mermas':
            return [
                { key: 'id', header: 'ID' },
                { key: 'producto', header: 'Producto' },
                { key: 'cantidad', header: 'Cantidad' },
                { key: 'causa', header: 'Causa' },
                { key: 'fecha', header: 'Fecha' }
            ];
    }
}

function deleteItem(id, tabName) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        data[tabName] = data[tabName].filter(item => item.id !== id);
        loadTabContent(tabName);
    }
}

// Event Listeners
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editId').value);
    const tabName = getCurrentTab();
    const item = data[tabName].find(item => item.id === id);
    
    if (item) {
        const columns = getColumns(tabName);
        columns.forEach(col => {
            if (col.key !== 'id' && col.key !== 'fecha') {
                const input = document.getElementById(`edit_${col.key}`);
                if (input) {
                    item[col.key] = input.value;
                }
            }
        });
        
        closeModal();
        loadTabContent(tabName);
    }
});

document.getElementById('tabs').addEventListener('click', function(e) {
    if (e.target.classList.contains('tab')) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        currentTab = e.target.dataset.tab;
        loadTabContent(currentTab);
    }
});