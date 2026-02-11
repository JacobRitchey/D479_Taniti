// ===================================
// MOBILE MENU TOGGLE
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});

// ===================================
// PACKAGE BUILDER FUNCTIONALITY
// ===================================
if (document.querySelector('.package-builder')) {
    // Guest Number Controls
    const minusButtons = document.querySelectorAll('.btn-minus');
    const plusButtons = document.querySelectorAll('.btn-plus');
    
    minusButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            const input = document.getElementById(target);
            const currentValue = parseInt(input.value);
            const minValue = parseInt(input.min);
            
            if (currentValue > minValue) {
                input.value = currentValue - 1;
                updatePackageSummary();
            }
        });
    });
    
    plusButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            const input = document.getElementById(target);
            const currentValue = parseInt(input.value);
            
            input.value = currentValue + 1;
            updatePackageSummary();
        });
    });
    
    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Selection Handling
    const selectedItems = {
        accommodation: null,
        activities: [],
        dining: [],
        transportation: []
    };
    
    const selectButtons = document.querySelectorAll('.btn-select');
    
    selectButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.option-card');
            const type = card.dataset.type;
            const price = parseFloat(card.dataset.price);
            const name = card.dataset.name;
            
            if (type === 'accommodation') {
                // Only one accommodation can be selected
                document.querySelectorAll('[data-type="accommodation"]').forEach(c => {
                    c.classList.remove('selected');
                    c.querySelector('.btn-select').textContent = 'Select';
                });
                
                card.classList.add('selected');
                this.textContent = 'Selected';
                selectedItems.accommodation = { name, price, type };
            } else {
                // Multiple activities/dining/transport can be selected
                // Map data-type to correct selectedItems property
                let itemKey;
                if (type === 'activity') {
                    itemKey = 'activities';
                } else if (type === 'dining') {
                    itemKey = 'dining';
                } else if (type === 'transport') {
                    itemKey = 'transportation';
                }
                
                if (card.classList.contains('selected')) {
                    card.classList.remove('selected');
                    this.textContent = 'Add';
                    
                    // Remove from selectedItems
                    const index = selectedItems[itemKey].findIndex(item => item.name === name);
                    if (index > -1) {
                        selectedItems[itemKey].splice(index, 1);
                    }
                } else {
                    card.classList.add('selected');
                    this.textContent = 'Added';
                    selectedItems[itemKey].push({ name, price, type });
                }
            }
            
            updatePackageSummary();
        });
    });
    
    // Update Package Summary
    function updatePackageSummary() {
        const summaryItems = document.getElementById('summaryItems');
        const emptyState = document.getElementById('emptyState');
        const subtotalEl = document.getElementById('subtotal');
        const taxesEl = document.getElementById('taxes');
        const totalEl = document.getElementById('total');
        
        // Get number of guests
        const adults = parseInt(document.getElementById('adults')?.value || 2);
        const children = parseInt(document.getElementById('children')?.value || 0);
        const totalGuests = adults + children;
        
        // Get number of nights
        const checkin = document.getElementById('checkin')?.value;
        const checkout = document.getElementById('checkout')?.value;
        let nights = 1;
        
        if (checkin && checkout) {
            const start = new Date(checkin);
            const end = new Date(checkout);
            nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (nights < 1) nights = 1;
        }
        
        // Calculate totals
        let subtotal = 0;
        let html = '';
        
        // Accommodation
        if (selectedItems.accommodation) {
            const item = selectedItems.accommodation;
            const itemTotal = item.price * nights;
            subtotal += itemTotal;
            
            html += `
                <div class="summary-item">
                    <div class="summary-item-header">
                        <h4>${item.name}</h4>
                        <button class="btn-remove" onclick="removeItem('accommodation', '${item.name}')">×</button>
                    </div>
                    <div class="summary-item-details">
                        ${nights} night${nights > 1 ? 's' : ''} × $${item.price} = $${itemTotal}
                    </div>
                </div>
            `;
        }
        
        // Activities
        selectedItems.activities.forEach(item => {
            const itemTotal = item.price * totalGuests;
            subtotal += itemTotal;
            
            html += `
                <div class="summary-item">
                    <div class="summary-item-header">
                        <h4>${item.name}</h4>
                        <button class="btn-remove" onclick="removeItem('activities', '${item.name}')">×</button>
                    </div>
                    <div class="summary-item-details">
                        ${totalGuests} guest${totalGuests > 1 ? 's' : ''} × $${item.price} = $${itemTotal}
                    </div>
                </div>
            `;
        });
        
        // Dining
        selectedItems.dining.forEach(item => {
            const itemTotal = item.price * totalGuests;
            subtotal += itemTotal;
            
            html += `
                <div class="summary-item">
                    <div class="summary-item-header">
                        <h4>${item.name}</h4>
                        <button class="btn-remove" onclick="removeItem('dining', '${item.name}')">×</button>
                    </div>
                    <div class="summary-item-details">
                        ${totalGuests} guest${totalGuests > 1 ? 's' : ''} × $${item.price} = $${itemTotal}
                    </div>
                </div>
            `;
        });
        
        // Transportation
        selectedItems.transportation.forEach(item => {
            let itemTotal = item.price;
            let details = `$${item.price} total`;
            
            // For car rental, multiply by nights
            if (item.name.includes('Car Rental')) {
                itemTotal = item.price * nights;
                details = `${nights} day${nights > 1 ? 's' : ''} × $${item.price} = $${itemTotal}`;
            }
            
            subtotal += itemTotal;
            
            html += `
                <div class="summary-item">
                    <div class="summary-item-header">
                        <h4>${item.name}</h4>
                        <button class="btn-remove" onclick="removeItem('transportation', '${item.name}')">×</button>
                    </div>
                    <div class="summary-item-details">
                        ${details}
                    </div>
                </div>
            `;
        });
        
        // Show/hide empty state
        if (subtotal === 0) {
            emptyState.style.display = 'block';
            summaryItems.innerHTML = '';
        } else {
            emptyState.style.display = 'none';
            summaryItems.innerHTML = html;
        }
        
        // Calculate taxes (10%)
        const taxes = Math.round(subtotal * 0.1);
        const total = subtotal + taxes;
        
        // Update display
        subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
        taxesEl.textContent = `$${taxes.toLocaleString()}`;
        totalEl.textContent = `$${total.toLocaleString()}`;
    }
    
    // Remove item function (global scope)
    window.removeItem = function(type, name) {
        if (type === 'accommodation') {
            selectedItems.accommodation = null;
            document.querySelectorAll('[data-type="accommodation"]').forEach(card => {
                if (card.dataset.name === name) {
                    card.classList.remove('selected');
                    card.querySelector('.btn-select').textContent = 'Select';
                }
            });
        } else {
            const index = selectedItems[type].findIndex(item => item.name === name);
            if (index > -1) {
                selectedItems[type].splice(index, 1);
            }
            
            document.querySelectorAll(`[data-type="${type.slice(0, -1)}"]`).forEach(card => {
                if (card.dataset.name === name) {
                    card.classList.remove('selected');
                    card.querySelector('.btn-select').textContent = 'Add';
                }
            });
        }
        
        updatePackageSummary();
    };
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const total = document.getElementById('total').textContent;
            if (total === '$0') {
                alert('Please add items to your package before checking out.');
            } else {
                alert('Checkout functionality would be implemented here. Total: ' + total);
            }
        });
    }
    
    // Date change listeners
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput) {
        checkinInput.addEventListener('change', updatePackageSummary);
    }
    
    if (checkoutInput) {
        checkoutInput.addEventListener('change', updatePackageSummary);
    }
}

// ===================================
// ACTIVITIES PAGE FUNCTIONALITY
// ===================================
if (document.querySelector('.activities-section')) {
    // Price Range Slider
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = this.value;
            filterActivities();
        });
    }
    
    // Filter Options
    const filterOptions = document.querySelectorAll('.filter-option');
    
    filterOptions.forEach(option => {
        option.addEventListener('change', filterActivities);
    });
    
    // Sort Select
    const sortSelect = document.getElementById('sortSelect');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortActivities(this.value);
        });
    }
    
    // Clear Filters
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            filterOptions.forEach(option => {
                option.checked = false;
            });
            
            if (priceRange) {
                priceRange.value = 200;
                priceValue.textContent = '200';
            }
            
            filterActivities();
        });
    }
    
    // Filter Activities Function
    function filterActivities() {
        const cards = document.querySelectorAll('.activity-card');
        const maxPrice = priceRange ? parseInt(priceRange.value) : 200;
        
        // Get selected filters
        const selectedCategories = Array.from(filterOptions)
            .filter(opt => opt.checked && opt.dataset.filter !== 'half-day' && opt.dataset.filter !== 'full-day' && opt.dataset.filter !== 'multi-day')
            .map(opt => opt.dataset.filter);
        
        const selectedDurations = Array.from(filterOptions)
            .filter(opt => opt.checked && (opt.dataset.filter === 'half-day' || opt.dataset.filter === 'full-day' || opt.dataset.filter === 'multi-day'))
            .map(opt => opt.dataset.filter);
        
        let visibleCount = 0;
        
        cards.forEach(card => {
            const price = parseInt(card.dataset.price);
            const categories = card.dataset.categories.split(',');
            const duration = card.dataset.duration;
            
            // Check price
            let matchesPrice = price <= maxPrice;
            
            // Check categories (if any selected)
            let matchesCategory = selectedCategories.length === 0 || 
                                 selectedCategories.some(cat => categories.includes(cat));
            
            // Check duration (if any selected)
            let matchesDuration = selectedDurations.length === 0 || 
                                 selectedDurations.includes(duration);
            
            // Show/hide card
            if (matchesPrice && matchesCategory && matchesDuration) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update count
        const activityCount = document.getElementById('activityCount');
        if (activityCount) {
            activityCount.textContent = visibleCount;
        }
    }
    
    // Sort Activities Function
    function sortActivities(sortType) {
        const grid = document.querySelector('.activities-grid');
        const cards = Array.from(grid.querySelectorAll('.activity-card'));
        
        cards.sort((a, b) => {
            switch(sortType) {
                case 'price-low':
                    return parseInt(a.dataset.price) - parseInt(b.dataset.price);
                case 'price-high':
                    return parseInt(b.dataset.price) - parseInt(a.dataset.price);
                case 'rating':
                    const ratingA = parseFloat(a.querySelector('.stars').textContent.replace('★ ', ''));
                    const ratingB = parseFloat(b.querySelector('.stars').textContent.replace('★ ', ''));
                    return ratingB - ratingA;
                default: // popular
                    return 0;
            }
        });
        
        // Re-append sorted cards
        cards.forEach(card => grid.appendChild(card));
    }
    
    // View Details Buttons
    const viewDetailsButtons = document.querySelectorAll('.btn-view-details');
    
    viewDetailsButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.activity-card');
            const name = card.querySelector('h3').textContent;
            //alert(`View details for: ${name}\n\nThis would open a detailed view of the activity.`);
        });
    });
}

// ===================================
// PLAN PAGE - ITINERARY TABS
// ===================================
if (document.querySelector('.planning-content')) {
    const itineraryTabs = document.querySelectorAll('.itinerary-tab');
    const itineraryContents = document.querySelectorAll('.itinerary-content');
    
    itineraryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all
            itineraryTabs.forEach(t => t.classList.remove('active'));
            itineraryContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked
            this.classList.add('active');
            const itineraryId = this.dataset.itinerary;
            document.getElementById(itineraryId).classList.add('active');
        });
    });
}

// ===================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===================================
// FAQ ACCORDION (if needed in future)
// ===================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.style.cursor = 'pointer';
        question.addEventListener('click', function() {
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                const isVisible = answer.style.display === 'block';
                answer.style.display = isVisible ? 'none' : 'block';
            }
        });
    }
});

// ===================================
// INITIALIZE ON PAGE LOAD
// ===================================
window.addEventListener('load', function() {
    console.log('Taniti Tourism Website Loaded');
    
    // Set minimum date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput) {
        checkinInput.min = today;
        checkinInput.addEventListener('change', function() {
            if (checkoutInput) {
                const nextDay = new Date(this.value);
                nextDay.setDate(nextDay.getDate() + 1);
                checkoutInput.min = nextDay.toISOString().split('T')[0];
                
                // If checkout is before new minimum, update it
                if (checkoutInput.value && new Date(checkoutInput.value) <= new Date(this.value)) {
                    checkoutInput.value = nextDay.toISOString().split('T')[0];
                }
            }
        });
    }
    
    if (checkoutInput) {
        checkoutInput.min = today;
    }
});

// -------------------------------------------------
// ASSIGN DATA-INDEX TO EACH ACTIVITY CARD & BUTTON
// -------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.activity-card');
    const viewButtons = document.querySelectorAll('.btn-view-details');

    cards.forEach((card, i) => {
        card.dataset.index = i + 1;               // 1‑based index
    });

    viewButtons.forEach((btn, i) => {
        btn.dataset.index = i + 1;                // same index as its card
    });
});

// -------------------------------------------------
// MODAL LOGIC – SHOW THE RIGHT MODAL FOR EACH BUTTON
// -------------------------------------------------
(function () {
    // Helper – turn an index (1‑8) into the modal’s CSS selector
    function getModalId(index) {
        return `#modal-${index}`;
    }

    // -----------------------------------------------------------------
    // 1️⃣ Click on any “View Details” button → open its modal
    // -----------------------------------------------------------------
    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();                     // keep the click from bubbling up
            const idx = this.dataset.index;           // 1‑8, matches the modal id
            openModal(idx);
        });
    });

    // -----------------------------------------------------------------
    // 2️⃣ Open a modal (just adds the .active class & makes it display:flex)
    // -----------------------------------------------------------------
    function openModal(index) {
        const modal = document.querySelector(getModalId(index));
        if (!modal) return;

        // Show the modal – the CSS rule `.activity-modal.active` takes care of
        // `display:flex`, the fade‑in transition and the overlay.
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');

        // Move focus to the close button for keyboard users
        modal.querySelector('.modal-close').focus();
    }

    // -----------------------------------------------------------------
    // 3️⃣ Close logic – overlay click, × button, or ESC key
    // -----------------------------------------------------------------
    document.addEventListener('click', function (e) {
        const activeModal = document.querySelector('.activity-modal.active');
        if (!activeModal) return;               // nothing open → do nothing

        // Clicking *outside* the dialog (the dark overlay) closes it
        if (e.target === activeModal) {
            closeModal(activeModal);
        }
        // Clicking the explicit close button also closes it
        else if (e.target.classList.contains('modal-close')) {
            closeModal(activeModal);
        }
    });

    // Close with the Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.activity-modal.active');
            if (activeModal) closeModal(activeModal);
        }
    });

    // -----------------------------------------------------------------
    // 4️⃣ Helper – hide a modal and clean up its state
    // -----------------------------------------------------------------
    function closeModal(modalEl) {
        modalEl.style.display = 'none';
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.classList.remove('active');
    }
})();

