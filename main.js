// Quote Generation System - Main JavaScript
class QuoteSystem {
    constructor() {
        this.currentStep = 1;
        this.selectedSolution = null;
        this.selectedProducts = [];
        this.selectedCustomer = null;
        this.quoteData = {
            id: 'QT-2024-001',
            date: new Date().toISOString().split('T')[0],
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total: 0,
            subtotal: 0,
            discounts: {
                customer: 0,
                volume: 0,
                additional: 0
            }
        };
        
        this.init();
    }

    init() {
        this.loadMockData();
        this.bindEvents();
        this.initAnimations();
        this.updateQuoteId();
    }

    loadMockData() {
        // Mock DAS Solutions
        this.solutions = {
            SMARTair: {
                name: 'SMARTair',
                products: [
                    { id: 'SM001', name: 'SMARTair i-max Electronic Escutcheon', category: 'Electronic Locks', price: 450, description: 'Wireless RFID/BLE enabled lock' },
                    { id: 'SM002', name: 'SMARTair Wall Reader', category: 'Card Readers', price: 280, description: '13.56MHz MIFARE/iCLASS reader' },
                    { id: 'SM003', name: 'SMARTair i-gate Padlock', category: 'Electronic Locks', price: 320, description: 'IP68 rated electronic padlock' },
                    { id: 'SM004', name: 'SMARTair Knob Cylinder', category: 'Electronic Locks', price: 380, description: 'Electronic cylinder for retrofit' },
                    { id: 'SM005', name: 'SMARTair Software License', category: 'Software', price: 1200, description: 'Access management software' },
                    { id: 'SM006', name: 'SMARTair RF Module', category: 'Controllers', price: 180, description: 'Wireless communication module' }
                ]
            },
            Aperio: {
                name: 'Aperio',
                products: [
                    { id: 'AP001', name: 'Aperio Wireless Lock', category: 'Electronic Locks', price: 520, description: 'Real-time monitoring lock' },
                    { id: 'AP002', name: 'Aperio Hub', category: 'Controllers', price: 650, description: 'Central communication hub' },
                    { id: 'AP003', name: 'Aperio Card Reader', category: 'Card Readers', price: 310, description: 'Multi-technology reader' },
                    { id: 'AP004', name: 'Aperio Management Software', category: 'Software', price: 1500, description: 'Enterprise access management' },
                    { id: 'AP005', name: 'Aperio Battery Pack', category: 'Accessories', price: 45, description: 'Replacement battery pack' }
                ]
            },
            Access: {
                name: 'Access',
                products: [
                    { id: 'AC001', name: 'HID ProxPoint Plus', category: 'Card Readers', price: 180, description: '125kHz proximity reader' },
                    { id: 'AC002', name: 'HID iCLASS Reader', category: 'Card Readers', price: 240, description: '13.56MHz smart card reader' },
                    { id: 'AC003', name: 'HID VertX Controller', category: 'Controllers', price: 890, description: 'Network access controller' },
                    { id: 'AC004', name: 'HID EdgeReader', category: 'Controllers', price: 420, description: 'IP-enabled door controller' },
                    { id: 'AC005', name: 'HID Proximity Cards', category: 'Credentials', price: 8, description: '125kHz proximity cards (pack of 10)' },
                    { id: 'AC006', name: 'HID iCLASS Cards', category: 'Credentials', price: 12, description: '13.56MHz smart cards (pack of 10)' }
                ]
            },
            eCLIQ: {
                name: 'eCLIQ',
                products: [
                    { id: 'EC001', name: 'eCLIQ Electronic Cylinder', category: 'Electronic Locks', price: 290, description: 'Programmable electronic cylinder' },
                    { id: 'EC002', name: 'eCLIQ Programming Key', category: 'Credentials', price: 150, description: 'Master programming key' },
                    { id: 'EC003', name: 'eCLIQ User Key', category: 'Credentials', price: 85, description: 'Individual user key' },
                    { id: 'EC004', name: 'eCLIQ Padlock N315', category: 'Electronic Locks', price: 210, description: 'Electronic padlock with cylinder' },
                    { id: 'EC005', name: 'eCLIQ Software', category: 'Software', price: 800, description: 'Key management software' },
                    { id: 'EC006', name: 'eCLIQ Programming Device', category: 'Accessories', price: 320, description: 'Hardware programming unit' }
                ]
            }
        };

        // Mock Customers
        this.customers = [
            { 
                id: 'C001', 
                company: 'TechCorp Industries', 
                contact: 'John Smith', 
                email: 'john@techcorp.com', 
                type: 'end-user', 
                tier: 'Gold Partner',
                discount: 25 
            },
            { 
                id: 'C002', 
                company: 'SecureSolutions LLC', 
                contact: 'Sarah Johnson', 
                email: 'sarah@securesol.com', 
                type: 'reseller', 
                tier: 'Platinum Partner',
                discount: 35 
            },
            { 
                id: 'C003', 
                company: 'City Government', 
                contact: 'Michael Davis', 
                email: 'mdavis@city.gov', 
                type: 'government', 
                tier: 'Government',
                discount: 30 
            },
            { 
                id: 'C004', 
                company: 'University Campus', 
                contact: 'Lisa Chen', 
                email: 'lchen@university.edu', 
                type: 'education', 
                tier: 'Education',
                discount: 20 
            },
            { 
                id: 'C005', 
                company: 'Global Enterprises', 
                contact: 'Robert Wilson', 
                email: 'rwilson@global.com', 
                type: 'end-user', 
                tier: 'Silver Partner',
                discount: 15 
            },
            { 
                id: 'C006', 
                company: 'Local Business Hub', 
                contact: 'Emma Brown', 
                email: 'emma@hub.local', 
                type: 'end-user', 
                tier: 'Bronze Partner',
                discount: 10 
            }
        ];
    }

    bindEvents() {
        // Step 1: Solution Selection
        document.querySelectorAll('[data-solution]').forEach(card => {
            card.addEventListener('click', (e) => this.selectSolution(e.target.closest('[data-solution]').dataset.solution));
        });

        // Step 2: Product Selection
        document.getElementById('priceRange').addEventListener('input', (e) => this.updatePriceFilter(e.target.value));
        document.getElementById('productSearch').addEventListener('input', (e) => this.filterProducts(e.target.value));
        document.getElementById('clearSelection').addEventListener('click', () => this.clearProductSelection());

        // Step 3: Quantity Management
        document.getElementById('bulkImport').addEventListener('click', () => this.showBulkImport());

        // Step 4: Customer Selection
        document.getElementById('customerSearch').addEventListener('input', (e) => this.filterCustomers(e.target.value));
        document.getElementById('customerTypeFilter').addEventListener('change', (e) => this.filterCustomersByType(e.target.value));
        document.getElementById('addCustomer').addEventListener('click', () => this.showAddCustomerModal());

        // Step 5: Discount Application
        document.getElementById('additionalDiscount').addEventListener('input', (e) => this.updateAdditionalDiscount(e.target.value));

        // Navigation
        document.getElementById('nextStep1').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep2').addEventListener('click', () => this.prevStep());
        document.getElementById('nextStep2').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep3').addEventListener('click', () => this.prevStep());
        document.getElementById('nextStep3').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep4').addEventListener('click', () => this.prevStep());
        document.getElementById('nextStep4').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep5').addEventListener('click', () => this.prevStep());
        document.getElementById('nextStep5').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep6').addEventListener('click', () => this.prevStep());

        // Export Functions
        document.getElementById('exportPDF').addEventListener('click', () => this.exportToPDF());
        document.getElementById('exportCSV').addEventListener('click', () => this.exportToCSV());
        document.getElementById('emailQuote').addEventListener('click', () => this.emailQuote());
        document.getElementById('completeQuote').addEventListener('click', () => this.completeQuote());

        // Utility Functions
        document.getElementById('saveDraft').addEventListener('click', () => this.saveDraft());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
    }

    initAnimations() {
        // Animate fade-in elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        });

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    updateQuoteId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.quoteData.id = `QT-${year}${month}${day}-${randomNum}`;
        document.getElementById('quoteId').textContent = `#${this.quoteData.id}`;
    }

    selectSolution(solution) {
        this.selectedSolution = solution;
        
        // Update UI
        document.querySelectorAll('[data-solution]').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-solution="${solution}"]`).classList.add('selected');
        
        // Enable next button
        document.getElementById('nextStep1').disabled = false;
        
        // Load products for selected solution
        this.loadProducts();
    }

    loadProducts() {
        const products = this.solutions[this.selectedSolution].products;
        const grid = document.getElementById('productGrid');
        grid.innerHTML = '';

        products.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-sm border border-slate-200 p-4 card-hover cursor-pointer';
        card.dataset.productId = product.id;
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">${product.category}</span>
                </div>
            </div>
            <h4 class="font-semibold text-slate-800 mb-2">${product.name}</h4>
            <p class="text-sm text-slate-600 mb-3">${product.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-lg font-bold text-blue-800 mono">$${product.price}</span>
                <button class="select-product px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    Select
                </button>
            </div>
        `;

        // Add click event for product selection
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-product')) {
                this.toggleProductSelection(product, card);
            }
        });

        return card;
    }

    toggleProductSelection(product, cardElement) {
        const isSelected = this.selectedProducts.find(p => p.id === product.id);
        
        if (isSelected) {
            // Remove from selection
            this.selectedProducts = this.selectedProducts.filter(p => p.id !== product.id);
            cardElement.classList.remove('ring-2', 'ring-blue-500');
            cardElement.querySelector('.select-product').textContent = 'Select';
        } else {
            // Add to selection
            this.selectedProducts.push({...product, quantity: 1});
            cardElement.classList.add('ring-2', 'ring-blue-500');
            cardElement.querySelector('.select-product').textContent = 'Selected';
        }
        
        this.updateSelectedCount();
        this.updateNextButton();
    }

    updateSelectedCount() {
        document.getElementById('selectedCount').textContent = this.selectedProducts.length;
    }

    updateNextButton() {
        const nextBtn = document.getElementById('nextStep2');
        nextBtn.disabled = this.selectedProducts.length === 0;
    }

    clearProductSelection() {
        this.selectedProducts = [];
        document.querySelectorAll('#productGrid .card-hover').forEach(card => {
            card.classList.remove('ring-2', 'ring-blue-500');
            card.querySelector('.select-product').textContent = 'Select';
        });
        this.updateSelectedCount();
        this.updateNextButton();
    }

    updatePriceFilter(value) {
        document.getElementById('priceValue').textContent = `$${value}`;
        this.filterProducts();
    }

    filterProducts(searchTerm = '') {
        const priceLimit = parseInt(document.getElementById('priceRange').value);
        const products = this.solutions[this.selectedSolution].products;
        const grid = document.getElementById('productGrid');
        
        grid.innerHTML = '';
        
        const filteredProducts = products.filter(product => {
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPrice = product.price <= priceLimit;
            return matchesSearch && matchesPrice;
        });

        filteredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            
            // Restore selection state
            if (this.selectedProducts.find(p => p.id === product.id)) {
                productCard.classList.add('ring-2', 'ring-blue-500');
                productCard.querySelector('.select-product').textContent = 'Selected';
            }
            
            grid.appendChild(productCard);
        });
    }

    loadQuantityTable() {
        const tbody = document.getElementById('quantityTable');
        tbody.innerHTML = '';
        
        this.selectedProducts.forEach((product, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-slate-100 hover:bg-slate-50';
            
            row.innerHTML = `
                <td class="py-3 px-4">
                    <div>
                        <div class="font-medium text-slate-800">${product.name}</div>
                        <div class="text-sm text-slate-500">${product.description}</div>
                    </div>
                </td>
                <td class="py-3 px-4 mono">$${product.price}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-2">
                        <button class="quantity-btn w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center" data-action="decrease" data-index="${index}">-</button>
                        <input type="number" value="${product.quantity}" min="1" class="quantity-input px-2 py-1 border border-slate-300 rounded text-center" data-index="${index}">
                        <button class="quantity-btn w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center" data-action="increase" data-index="${index}">+</button>
                    </div>
                </td>
                <td class="py-3 px-4 mono font-medium">$${(product.price * product.quantity).toFixed(2)}</td>
                <td class="py-3 px-4">
                    <button class="text-red-600 hover:text-red-800" data-action="remove" data-index="${index}">Remove</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        // Bind quantity change events
        tbody.addEventListener('click', (e) => this.handleQuantityChange(e));
        tbody.addEventListener('input', (e) => this.handleQuantityInput(e));
        
        this.updateStep3Total();
    }

    handleQuantityChange(e) {
        if (!e.target.dataset.action) return;
        
        const index = parseInt(e.target.dataset.index);
        const action = e.target.dataset.action;
        
        if (action === 'increase') {
            this.selectedProducts[index].quantity++;
        } else if (action === 'decrease' && this.selectedProducts[index].quantity > 1) {
            this.selectedProducts[index].quantity--;
        } else if (action === 'remove') {
            this.selectedProducts.splice(index, 1);
            this.loadQuantityTable();
            return;
        }
        
        this.loadQuantityTable();
    }

    handleQuantityInput(e) {
        if (!e.target.dataset.index) return;
        
        const index = parseInt(e.target.dataset.index);
        const value = parseInt(e.target.value);
        
        if (value > 0) {
            this.selectedProducts[index].quantity = value;
            this.loadQuantityTable();
        }
    }

    updateStep3Total() {
        const total = this.selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        document.getElementById('step3Total').textContent = `$${total.toFixed(2)}`;
    }

    loadCustomers() {
        const grid = document.getElementById('customerGrid');
        grid.innerHTML = '';

        this.customers.forEach(customer => {
            const card = this.createCustomerCard(customer);
            grid.appendChild(card);
        });

        document.getElementById('customerCount').textContent = this.customers.length;
    }

    createCustomerCard(customer) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-sm border border-slate-200 p-4 card-hover cursor-pointer';
        card.dataset.customerId = customer.id;
        
        const tierColors = {
            'Platinum Partner': 'bg-purple-100 text-purple-800',
            'Gold Partner': 'bg-yellow-100 text-yellow-800',
            'Silver Partner': 'bg-gray-100 text-gray-800',
            'Bronze Partner': 'bg-orange-100 text-orange-800',
            'Government': 'bg-blue-100 text-blue-800',
            'Education': 'bg-green-100 text-green-800'
        };
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
                <span class="text-xs px-2 py-1 ${tierColors[customer.tier] || 'bg-slate-100 text-slate-600'} rounded-full">${customer.tier}</span>
            </div>
            <h4 class="font-semibold text-slate-800 mb-1">${customer.company}</h4>
            <p class="text-sm text-slate-600 mb-2">${customer.contact}</p>
            <p class="text-sm text-slate-500 mb-3">${customer.email}</p>
            <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600">Type: ${customer.type}</span>
                <span class="text-sm font-medium text-green-600">${customer.discount}% discount</span>
            </div>
        `;

        card.addEventListener('click', () => this.selectCustomer(customer));
        return card;
    }

    selectCustomer(customer) {
        this.selectedCustomer = customer;
        
        // Update UI
        document.querySelectorAll('#customerGrid .card-hover').forEach(card => {
            card.classList.remove('ring-2', 'ring-blue-500');
        });
        document.querySelector(`[data-customer-id="${customer.id}"]`).classList.add('ring-2', 'ring-blue-500');
        
        // Enable next button
        document.getElementById('nextStep4').disabled = false;
        
        // Update discount display
        this.updateDiscountDisplay();
    }

    updateDiscountDisplay() {
        if (!this.selectedCustomer) return;
        
        document.getElementById('customerTier').textContent = this.selectedCustomer.tier;
        document.getElementById('standardDiscount').textContent = `${this.selectedCustomer.discount}%`;
        
        this.calculatePricing();
    }

    calculatePricing() {
        if (!this.selectedCustomer) return;
        
        // Calculate subtotal
        this.quoteData.subtotal = this.selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        
        // Calculate volume discount (based on total value)
        let volumeDiscount = 0;
        if (this.quoteData.subtotal > 10000) volumeDiscount = 5;
        if (this.quoteData.subtotal > 25000) volumeDiscount = 8;
        if (this.quoteData.subtotal > 50000) volumeDiscount = 12;
        
        this.quoteData.discounts.volume = volumeDiscount;
        this.quoteData.discounts.customer = this.selectedCustomer.discount;
        
        // Calculate total discount
        const totalDiscount = this.quoteData.discounts.customer + this.quoteData.discounts.volume + this.quoteData.discounts.additional;
        
        // Update displays
        document.getElementById('projectValue').textContent = `$${this.quoteData.subtotal.toFixed(2)}`;
        document.getElementById('volumeDiscount').textContent = `${volumeDiscount}%`;
        document.getElementById('totalDiscount').textContent = `${totalDiscount}%`;
        
        // Update pricing summary
        const customerDiscountAmount = this.quoteData.subtotal * (this.quoteData.discounts.customer / 100);
        const volumeDiscountAmount = this.quoteData.subtotal * (this.quoteData.discounts.volume / 100);
        this.quoteData.total = this.quoteData.subtotal - customerDiscountAmount - volumeDiscountAmount;
        
        document.getElementById('pricingSubtotal').textContent = `$${this.quoteData.subtotal.toFixed(2)}`;
        document.getElementById('pricingCustomerDiscount').textContent = `-$${customerDiscountAmount.toFixed(2)}`;
        document.getElementById('pricingVolumeDiscount').textContent = `-$${volumeDiscountAmount.toFixed(2)}`;
        document.getElementById('pricingTotal').textContent = `$${this.quoteData.total.toFixed(2)}`;
    }

    updateAdditionalDiscount(value) {
        this.quoteData.discounts.additional = parseInt(value);
        document.getElementById('additionalDiscountValue').textContent = `${value}%`;
        this.calculatePricing();
    }

    generateQuotePreview() {
        const preview = document.getElementById('quotePreview');
        
        preview.innerHTML = `
            <div class="border border-slate-200 rounded-lg p-6 bg-white">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">QUOTE</h2>
                        <p class="text-slate-600">Quote #: ${this.quoteData.id}</p>
                        <p class="text-slate-600">Date: ${new Date(this.quoteData.date).toLocaleDateString()}</p>
                    </div>
                    <div class="text-right">
                        <div class="w-16 h-16 bg-blue-800 rounded-lg flex items-center justify-center mb-2">
                            <span class="text-white font-bold text-sm">DAS</span>
                        </div>
                        <p class="text-sm text-slate-600">Digital Access Solutions</p>
                    </div>
                </div>
                
                ${this.selectedCustomer ? `
                <div class="mb-6 p-4 bg-slate-50 rounded-lg">
                    <h4 class="font-semibold text-slate-800 mb-2">Bill To:</h4>
                    <p class="text-slate-700">${this.selectedCustomer.company}</p>
                    <p class="text-slate-600">${this.selectedCustomer.contact}</p>
                    <p class="text-slate-600">${this.selectedCustomer.email}</p>
                </div>
                ` : ''}
                
                <div class="mb-6">
                    <h4 class="font-semibold text-slate-800 mb-3">Selected Solution: ${this.selectedSolution}</h4>
                    
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-slate-200">
                                <th class="text-left py-2 font-medium text-slate-600">Product</th>
                                <th class="text-right py-2 font-medium text-slate-600">Qty</th>
                                <th class="text-right py-2 font-medium text-slate-600">Price</th>
                                <th class="text-right py-2 font-medium text-slate-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.selectedProducts.map(product => `
                                <tr class="border-b border-slate-100">
                                    <td class="py-2 text-slate-700">${product.name}</td>
                                    <td class="py-2 text-right text-slate-700">${product.quantity}</td>
                                    <td class="py-2 text-right text-slate-700 mono">$${product.price.toFixed(2)}</td>
                                    <td class="py-2 text-right text-slate-700 mono">$${(product.price * product.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="flex justify-end">
                    <div class="w-64">
                        <div class="flex justify-between mb-2">
                            <span class="text-slate-600">Subtotal:</span>
                            <span class="mono">$${this.quoteData.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-slate-600">Discounts:</span>
                            <span class="text-green-600 mono">-$${(this.quoteData.subtotal - this.quoteData.total).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between pt-2 border-t border-slate-200">
                            <span class="font-semibold text-slate-800">Total:</span>
                            <span class="font-bold text-blue-800 mono text-lg">$${this.quoteData.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 pt-4 border-t border-slate-200 text-sm text-slate-500">
                    <p>Quote valid until ${new Date(this.quoteData.expiry).toLocaleDateString()}</p>
                    <p>Thank you for choosing Digital Access Solutions</p>
                </div>
            </div>
        `;
    }

    nextStep() {
        if (this.currentStep < 6) {
            // Hide current step
            document.getElementById(`step${this.currentStep}Content`).classList.add('hidden');
            
            // Update progress
            document.getElementById(`step${this.currentStep + 1}`).classList.remove('bg-slate-300', 'text-slate-600');
            document.getElementById(`step${this.currentStep + 1}`).classList.add('step-completed');
            
            // Show next step
            this.currentStep++;
            document.getElementById(`step${this.currentStep}Content`).classList.remove('hidden');
            
            // Load step-specific content
            this.loadStepContent();
            
            // Animate transition
            anime({
                targets: `#step${this.currentStep}Content`,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                easing: 'easeOutCubic'
            });
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            // Hide current step
            document.getElementById(`step${this.currentStep}Content`).classList.add('hidden');
            
            // Update progress
            document.getElementById(`step${this.currentStep}`).classList.remove('step-completed');
            document.getElementById(`step${this.currentStep}`).classList.add('bg-slate-300', 'text-slate-600');
            
            // Show previous step
            this.currentStep--;
            document.getElementById(`step${this.currentStep}Content`).classList.remove('hidden');
            
            // Animate transition
            anime({
                targets: `#step${this.currentStep}Content`,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                easing: 'easeOutCubic'
            });
        }
    }

    loadStepContent() {
        switch (this.currentStep) {
            case 2:
                this.loadProducts();
                break;
            case 3:
                this.loadQuantityTable();
                break;
            case 4:
                this.loadCustomers();
                break;
            case 5:
                this.updateDiscountDisplay();
                break;
            case 6:
                this.generateQuotePreview();
                break;
        }
    }

    filterCustomers(searchTerm = '') {
        const typeFilter = document.getElementById('customerTypeFilter').value;
        const grid = document.getElementById('customerGrid');
        grid.innerHTML = '';

        const filteredCustomers = this.customers.filter(customer => {
            const matchesSearch = !searchTerm || 
                customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.contact.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = !typeFilter || customer.type === typeFilter;
            return matchesSearch && matchesType;
        });

        filteredCustomers.forEach(customer => {
            const card = this.createCustomerCard(customer);
            grid.appendChild(card);
        });

        document.getElementById('customerCount').textContent = filteredCustomers.length;
    }

    filterCustomersByType(type) {
        this.filterCustomers(document.getElementById('customerSearch').value);
    }

    exportToPDF() {
        // Simulate PDF export
        this.showNotification('PDF export started...', 'info');
        
        setTimeout(() => {
            this.showNotification('PDF generated successfully!', 'success');
        }, 2000);
    }

    exportToCSV() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quote-${this.quoteData.id}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('CSV exported successfully!', 'success');
    }

    generateCSV() {
        let csv = 'Product,Quantity,Unit Price,Total Price\n';
        this.selectedProducts.forEach(product => {
            csv += `${product.name},${product.quantity},${product.price},${(product.price * product.quantity).toFixed(2)}\n`;
        });
        csv += `\nSubtotal,${this.quoteData.subtotal.toFixed(2)}\n`;
        csv += `Total,${this.quoteData.total.toFixed(2)}\n`;
        return csv;
    }

    emailQuote() {
        this.showNotification('Opening email client...', 'info');
        
        setTimeout(() => {
            const subject = `Quote ${this.quoteData.id} - Digital Access Solutions`;
            const body = `Please find attached your quote for ${this.selectedSolution} products.`;
            window.location.href = `mailto:${this.selectedCustomer?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }, 1000);
    }

    completeQuote() {
        this.showNotification('Quote completed and saved to dashboard!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    saveDraft() {
        const draftData = {
            currentStep: this.currentStep,
            selectedSolution: this.selectedSolution,
            selectedProducts: this.selectedProducts,
            selectedCustomer: this.selectedCustomer,
            quoteData: this.quoteData
        };
        
        localStorage.setItem('quoteDraft', JSON.stringify(draftData));
        this.showNotification('Draft saved successfully!', 'success');
    }

    showHelp() {
        this.showNotification('Help documentation will open in a new window.', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600 text-white' :
            type === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutCubic'
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInCubic',
                complete: () => notification.remove()
            });
        }, 3000);
    }

    showBulkImport() {
        this.showNotification('Bulk import feature coming soon!', 'info');
    }

    showAddCustomerModal() {
        this.showNotification('Add customer feature coming soon!', 'info');
    }
}

// Initialize the quote system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quoteSystem = new QuoteSystem();
});