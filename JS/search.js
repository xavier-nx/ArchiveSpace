// js/search.js - Lógica de búsqueda para ArchiveSpace

// Search Module for ArchiveSpace
const SearchModule = (function() {
    // Private variables
    let currentSearchResults = [];
    let currentFilters = {};
    
    // Public methods
    return {
        // Initialize search functionality
        init: function() {
            console.log('Search module initialized');
            this.bindEvents();
        },
        
        // Bind event listeners
        bindEvents: function() {
            // Global search on enter key
            $('#globalSearch').on('keypress', function(e) {
                if (e.which === 13) {
                    SearchModule.performGlobalSearch();
                }
            });
            
            // Advanced search form submission
            $('#advancedSearchForm').on('submit', function(e) {
                e.preventDefault();
                SearchModule.performAdvancedSearch();
            });
            
            // Quick search buttons (if any)
            $('.quick-search-btn').on('click', function() {
                const term = $(this).data('search-term');
                $('#globalSearch').val(term);
                SearchModule.performGlobalSearch();
            });
        },
        
        // Perform global search
        performGlobalSearch: function() {
            const searchTerm = $('#globalSearch').val().trim();
            
            if (!searchTerm) {
                this.showMessage('Por favor, introduce un término de búsqueda', 'warning');
                return;
            }
            
            this.showLoading(true);
            
            // In a real application, this would be an AJAX call
            // For now, we'll use mock data
            this.mockSearch(searchTerm);
        },
        
        // Perform advanced search
        performAdvancedSearch: function() {
            const filters = this.collectFilters();
            
            // Validate date range
            if (filters.dateFrom && filters.dateTo) {
                if (new Date(filters.dateFrom) > new Date(filters.dateTo)) {
                    this.showMessage('La fecha "desde" no puede ser posterior a la fecha "hasta"', 'error');
                    return;
                }
            }
            
            this.showLoading(true);
            this.mockAdvancedSearch(filters);
        },
        
        // Collect filter values from form
        collectFilters: function() {
            return {
                title: $('#searchTitle').val(),
                description: $('#searchDescription').val(),
                dateFrom: $('#searchDateFrom').val(),
                dateTo: $('#searchDateTo').val(),
                level: $('#searchLevel').val(),
                agents: $('#searchAgents').val() || [],
                subjects: $('#searchSubjects').val() || [],
                status: $('#searchStatus').val(),
                language: $('#searchLanguage').val(),
                identifier: $('#searchIdentifier').val(),
                parent: $('#searchParent').val(),
                exactMatch: $('#searchExactMatch').is(':checked'),
                searchOperators: $('#searchOperators').val()
            };
        },
        
        // Mock search function (to be replaced with real API call)
        mockSearch: function(searchTerm) {
            // Simulate API delay
            setTimeout(() => {
                // Mock data - in real app, this comes from API
                const mockResults = this.generateMockResults(searchTerm);
                
                this.displayResults(mockResults);
                this.showLoading(false);
                this.updateSearchSummary(searchTerm, mockResults.length);
                
                // Store current results
                currentSearchResults = mockResults;
                currentFilters = { searchTerm: searchTerm };
                
            }, 800);
        },
        
        // Mock advanced search function
        mockAdvancedSearch: function(filters) {
            // Simulate API delay
            setTimeout(() => {
                // Mock data - in real app, this comes from API
                const mockResults = this.generateMockResultsForFilters(filters);
                
                this.displayResults(mockResults);
                this.showLoading(false);
                this.updateAdvancedSearchSummary(filters, mockResults.length);
                
                // Store current results and filters
                currentSearchResults = mockResults;
                currentFilters = filters;
                
            }, 1000);
        },
        
        // Generate mock results for search term
        generateMockResults: function(searchTerm) {
            // This is sample data - replace with real API response
            const allResources = [
                {
                    id: 1,
                    title: 'Correspondencia familiar Rodríguez',
                    code: 'FAM-ROD-001',
                    dates: '1890-1910',
                    level: 'fondo',
                    status: 'activo',
                    agents: ['Familia Rodríguez'],
                    subjects: ['Historia familiar', 'Correspondencia'],
                    description: 'Cartas y documentos personales de la Familia Rodríguez durante el período 1890-1910.'
                },
                {
                    id: 2,
                    title: 'Documentación administrativa municipal',
                    code: 'AYUNT-ADM-005',
                    dates: '1925-1950',
                    level: 'serie',
                    status: 'activo',
                    agents: ['Ayuntamiento Municipal'],
                    subjects: ['Administración pública', 'Gobierno local'],
                    description: 'Registros y documentos administrativos del gobierno local municipal.'
                },
                {
                    id: 3,
                    title: 'Archivo fotográfico de la guerra civil',
                    code: 'FOTO-GC-012',
                    dates: '1936-1939',
                    level: 'subserie',
                    status: 'cerrado',
                    agents: ['Archivo Histórico Nacional'],
                    subjects: ['Guerra Civil', 'Fotografía histórica'],
                    description: 'Colección de fotografías del conflicto bélico de 1936-1939.'
                }
            ];
            
            // Simple search filter for demo
            return allResources.filter(resource => 
                resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        },
        
        // Generate mock results for advanced filters
        generateMockResultsForFilters