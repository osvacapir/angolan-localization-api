// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global state
let provinces = [];
let municipalities = [];
let currentPage = {
    provinces: 1,
    municipalities: 1
};
let currentFilters = {
    provinces: { search: '', region: '' },
    municipalities: { search: '', province: '' }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    showLoading(true);
    
    try {
        // Setup event listeners first
        setupEventListeners();
        
        // Load initial data
        await refreshProvinces();
        await refreshMunicipalities();
        
        // Load provinces for filters (after initial load)
        await loadProvincesForFilters();
        
    } catch (error) {
        showToast('Erro ao inicializar aplicação', 'error');
        console.error('Initialization error:', error);
    } finally {
        showLoading(false);
    }
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Search inputs
    document.getElementById('provinceSearch').addEventListener('input', debounce(() => {
        currentFilters.provinces.search = document.getElementById('provinceSearch').value;
        currentPage.provinces = 1;
        refreshProvinces();
    }, 300));

    document.getElementById('municipalitySearch').addEventListener('input', debounce(() => {
        currentFilters.municipalities.search = document.getElementById('municipalitySearch').value;
        currentPage.municipalities = 1;
        refreshMunicipalities();
    }, 300));

    // Filter selects
    document.getElementById('regionFilter').addEventListener('change', () => {
        currentFilters.provinces.region = document.getElementById('regionFilter').value;
        currentPage.provinces = 1;
        refreshProvinces();
    });

    document.getElementById('provinceFilter').addEventListener('change', () => {
        currentFilters.municipalities.province = document.getElementById('provinceFilter').value;
        currentPage.municipalities = 1;
        refreshMunicipalities();
    });
}

function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// API Helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Province Management
async function loadProvincesForFilters() {
    try {
        const response = await apiRequest('/provinces?limit=100');
        provinces = response.data || [];
        
        // Update province filter in municipality form
        updateProvinceFilter();
    } catch (error) {
        console.error('Error loading provinces for filters:', error);
        // Don't throw error, just log it
    }
}

async function refreshProvinces() {
    showLoading(true);
    try {
        const { search, region } = currentFilters.provinces;
        let url = `/provinces?page=${currentPage.provinces}&limit=10`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (region) url += `&region=${encodeURIComponent(region)}`;

        const response = await apiRequest(url);
        displayProvinces(response.data || []);
        updatePagination('provinces', response.meta);
        
    } catch (error) {
        showToast('Erro ao carregar províncias', 'error');
        console.error('Error loading provinces:', error);
    } finally {
        showLoading(false);
    }
}

function displayProvinces(provincesData) {
    const tbody = document.getElementById('provincesTableBody');
    tbody.innerHTML = '';

    if (provincesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma província encontrada</p>
                </td>
            </tr>
        `;
        return;
    }

    provincesData.forEach(province => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="province-name">
                    <strong>${province.name}</strong>
                </div>
            </td>
            <td>
                <span class="badge">${province.code}</span>
            </td>
            <td>${province.capital}</td>
            <td>
                <span class="region-badge region-${province.region.toLowerCase()}">${province.region}</span>
            </td>
            <td>${province.population || 'N/A'}</td>
            <td>${province.area || 'N/A'}</td>
            <td>
                <span class="municipality-count">${province.municipalitiesCount || 0}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Municipality Management
async function loadMunicipalitiesForFilters() {
    try {
        const response = await apiRequest('/municipalities?limit=100');
        municipalities = response.data || [];
    } catch (error) {
        console.error('Error loading municipalities for filters:', error);
        // Don't throw error, just log it
    }
}

async function refreshMunicipalities() {
    showLoading(true);
    try {
        const { search, province } = currentFilters.municipalities;
        let url = `/municipalities?page=${currentPage.municipalities}&limit=10`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (province) url += `&province=${encodeURIComponent(province)}`;

        const response = await apiRequest(url);
        displayMunicipalities(response.data || []);
        updatePagination('municipalities', response.meta);
        
    } catch (error) {
        showToast('Erro ao carregar municípios', 'error');
        console.error('Error loading municipalities:', error);
    } finally {
        showLoading(false);
    }
}

function displayMunicipalities(municipalitiesData) {
    const tbody = document.getElementById('municipalitiesTableBody');
    tbody.innerHTML = '';

    if (municipalitiesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nenhum município encontrado</p>
                </td>
            </tr>
        `;
        return;
    }

    municipalitiesData.forEach(municipality => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="municipality-name">
                    <strong>${municipality.name}</strong>
                </div>
            </td>
            <td>
                <span class="badge">${municipality.code}</span>
            </td>
            <td>${municipality.province?.name || 'N/A'}</td>
            <td>
                <span class="region-badge region-${municipality.region?.toLowerCase() || 'unknown'}">${municipality.region || 'N/A'}</span>
            </td>
            <td>${municipality.population || 'N/A'}</td>
            <td>${municipality.area || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Filter Management
function updateProvinceFilter() {
    const select = document.getElementById('provinceFilter');
    select.innerHTML = '<option value="">Todas as províncias</option>';
    
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province.code;
        option.textContent = province.name;
        select.appendChild(option);
    });
}

// Pagination
function updatePagination(type, meta) {
    const container = document.getElementById(`${type}Pagination`);
    if (!meta || meta.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const current = meta.page;
    const total = meta.totalPages;
    const totalItems = meta.total;

    let paginationHTML = `
        <div class="pagination-info">
            <span>Mostrando ${((current - 1) * meta.limit) + 1} a ${Math.min(current * meta.limit, totalItems)} de ${totalItems} registros</span>
        </div>
        <div class="pagination-controls">
    `;

    // Previous button
    if (current > 1) {
        paginationHTML += `<button class="btn btn-sm" onclick="changePage('${type}', ${current - 1})">
            <i class="fas fa-chevron-left"></i> Anterior
        </button>`;
    }

    // Page numbers
    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(total, current + 2);

    if (startPage > 1) {
        paginationHTML += `<button class="btn btn-sm" onclick="changePage('${type}', 1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="btn btn-sm ${i === current ? 'active' : ''}" 
            onclick="changePage('${type}', ${i})">${i}</button>`;
    }

    if (endPage < total) {
        if (endPage < total - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="btn btn-sm" onclick="changePage('${type}', ${total})">${total}</button>`;
    }

    // Next button
    if (current < total) {
        paginationHTML += `<button class="btn btn-sm" onclick="changePage('${type}', ${current + 1})">
            Próximo <i class="fas fa-chevron-right"></i>
        </button>`;
    }

    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
}

function changePage(type, page) {
    currentPage[type] = page;
    if (type === 'provinces') {
        refreshProvinces();
    } else {
        refreshMunicipalities();
    }
}

// Utility Functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.style.display = 'flex';
    } else {
        spinner.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}