/**
 * Ceylon Fusion - Modern Sri Lankan & Fusion Bistro
 * Interactive Frontend Logic Script (English Only Edition)
 */

// State Variables
let currentCurrency = 'LKR'; // LKR or USD
const USD_RATE = 300.0; // 1 USD = 300 LKR for clean exchange math

// Customizer pricing configuration
const CUSTOMIZER_PRICES = {
    base: {
        plain_hopper: 200,
        egg_hopper: 300,
        string_hopper: 250
    },
    curry: {
        chicken: 600,
        fish_ambul: 700,
        dhal: 200
    },
    sambol: {
        pol_sambol: 150,
        seeni_sambol: 150,
        lunu_miris: 100
    }
};

// Default customizer state
let selectedBase = 'egg_hopper';
let selectedCurry = 'chicken';
let selectedSambol = 'pol_sambol';
let selectedSpice = '2'; // Medium

// Testimonial Slider State
let currentSlide = 0;
let slideInterval;

// ==========================================================================
// Initialization & Dom Content Loaded
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Currency Toggle Listeners
    const currLkrBtn = document.getElementById("curr-lkr");
    const currUsdBtn = document.getElementById("curr-usd");
    
    if (currLkrBtn && currUsdBtn) {
        currLkrBtn.addEventListener("click", () => setCurrency('LKR'));
        currUsdBtn.addEventListener("click", () => setCurrency('USD'));
    }
    
    // 2. Mobile Navigation Menu Toggle
    const menuToggle = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            menuToggle.classList.toggle("active");
            menuToggle.innerHTML = navMenu.classList.contains("active") ? "✕" : "☰";
        });
        
        // Close menu when link is clicked
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                menuToggle.innerHTML = "☰";
            });
        });
    }

    // 3. Header Scroll Decorator
    window.addEventListener("scroll", () => {
        const header = document.querySelector(".main-header");
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
    });

    // 4. Menu Filters Handler
    initMenuFilters();

    // 5. Customizer Interactive Elements
    initCustomizer();

    // 6. Lightbox Handler
    initLightbox();

    // 7. Testimonial Slider Handler
    initTestimonials();

    // 8. Reservation Form Submit handler
    initReservationForm();

    // 9. Scroll entrance animations observer
    initScrollAnimations();

    // Set initial active state highlights
    setCurrency(currentCurrency);
    updateCustomizerPreview();
});

// ==========================================================================
// Core Functions: Currency Manager
// ==========================================================================
function setCurrency(currency) {
    currentCurrency = currency;
    
    // Toggle active buttons
    document.getElementById("curr-lkr").classList.toggle("active", currency === 'LKR');
    document.getElementById("curr-usd").classList.toggle("active", currency === 'USD');
    
    // Update menu prices
    const prices = document.querySelectorAll("[data-lkr-price]");
    prices.forEach(priceElem => {
        const lkrVal = parseFloat(priceElem.getAttribute("data-lkr-price"));
        if (currency === 'LKR') {
            priceElem.textContent = `₨ ${lkrVal.toLocaleString()}`;
        } else {
            const usdVal = (lkrVal / USD_RATE).toFixed(2);
            priceElem.textContent = `$${usdVal}`;
        }
    });

    // Update customizer preview total price
    updateCustomizerPreview();
}

// Helper to format currency numbers
function formatPrice(lkrAmount) {
    if (currentCurrency === 'LKR') {
        return `₨ ${lkrAmount.toLocaleString()}`;
    } else {
        return `$${(lkrAmount / USD_RATE).toFixed(2)}`;
    }
}

// ==========================================================================
// Menu Filtering Logic
// ==========================================================================
function initMenuFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const menuCards = document.querySelectorAll(".menu-card");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            menuCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95) translateY(10px)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || card.getAttribute("data-category") === filterValue) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1) translateY(0)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });
}

// ==========================================================================
// Make To Your Taste (Customizer) Logic
// ==========================================================================
function initCustomizer() {
    const selectorItems = document.querySelectorAll(".selector-item");
    const spiceSlider = document.getElementById("spice-level-slider");

    // Add click listeners to items
    selectorItems.forEach(item => {
        item.addEventListener("click", () => {
            const group = item.getAttribute("data-group");
            const value = item.getAttribute("data-value");

            // Remove active from peers
            document.querySelectorAll(`.selector-item[data-group="${group}"]`).forEach(sibling => {
                sibling.classList.remove("active");
            });

            // Set active
            item.classList.add("active");

            // Update state
            if (group === 'base') selectedBase = value;
            if (group === 'curry') selectedCurry = value;
            if (group === 'sambol') selectedSambol = value;

            updateCustomizerPreview();
        });
    });

    // Slider listener
    if (spiceSlider) {
        spiceSlider.addEventListener("input", (e) => {
            selectedSpice = e.target.value;
            
            // Highlight active text label
            const labels = document.querySelectorAll(".spice-labels span");
            labels.forEach((lbl, idx) => {
                lbl.classList.toggle("active", idx === parseInt(selectedSpice) - 1);
            });
            
            updateCustomizerPreview();
        });
    }

    // Initialize customizer plate booking action
    const customBookBtn = document.getElementById("customizer-book-btn");
    if (customBookBtn) {
        customBookBtn.addEventListener("click", () => {
            const targetSection = document.getElementById("reserve");
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Prefill allergy/special requests field with custom meal selection details
                const specReqInput = document.getElementById("reserve-requests");
                if (specReqInput) {
                    const baseLabel = document.querySelector(`.selector-item[data-value="${selectedBase}"] span`).textContent;
                    const curryLabel = document.querySelector(`.selector-item[data-value="${selectedCurry}"] span`).textContent;
                    const sambolLabel = document.querySelector(`.selector-item[data-value="${selectedSambol}"] span`).textContent;
                    const spiceLabel = document.querySelector(`.spice-labels span:nth-child(${selectedSpice})`).textContent;
                    
                    specReqInput.value = `Custom Plate Request: Base: ${baseLabel}, Curry: ${curryLabel}, Accompaniment: ${sambolLabel}, Spice Heat: ${spiceLabel}.`;
                    specReqInput.style.borderColor = 'var(--gold)';
                }
            }
        });
    }
}

function updateCustomizerPreview() {
    const itemNames = {
        plain_hopper: "Plain Hopper Stack",
        egg_hopper: "Gourmet Egg Hopper",
        string_hopper: "Red String Hoppers",
        chicken: "Spicy Ceylon Chicken",
        fish_ambul: "Tangy Fish Ambulthiyal",
        dhal: "Claypot Creamy Dhal",
        pol_sambol: "Fresh Coconut Pol Sambol",
        seeni_sambol: "Sweet & Spicy Seeni Sambol",
        lunu_miris: "Fiery Lunu Miris Red Onion Paste",
        spice_1: "Mild Spice (Foreign Friendly)",
        spice_2: "Medium Spice (Fusion Style)",
        spice_3: "Sri Lankan Hot (Authentic)",
        spice_4: "Flaming Hot (Traditional Chilli Rush)"
    };

    // Populate titles/names in customizer preview card
    const pBase = document.getElementById("preview-base-val");
    const pCurry = document.getElementById("preview-curry-val");
    const pSambol = document.getElementById("preview-sambol-val");
    const pSpice = document.getElementById("preview-spice-val");
    const pTotal = document.getElementById("preview-total-val");

    if (pBase) pBase.textContent = itemNames[selectedBase];
    if (pCurry) pCurry.textContent = itemNames[selectedCurry];
    if (pSambol) pSambol.textContent = itemNames[selectedSambol];
    if (pSpice) pSpice.textContent = itemNames[`spice_${selectedSpice}`];

    // Sum prices
    const costBase = CUSTOMIZER_PRICES.base[selectedBase] || 0;
    const costCurry = CUSTOMIZER_PRICES.curry[selectedCurry] || 0;
    const costSambol = CUSTOMIZER_PRICES.sambol[selectedSambol] || 0;
    const totalLkr = costBase + costCurry + costSambol;

    if (pTotal) {
        pTotal.textContent = formatPrice(totalLkr);
    }
}

// ==========================================================================
// Gallery Lightbox Implementation
// ==========================================================================
function initLightbox() {
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = document.getElementById("lightbox-close");

    if (!lightbox || !lightboxImg || !lightboxCaption) return;

    galleryItems.forEach(item => {
        item.addEventListener("click", () => {
            const img = item.querySelector("img");
            const caption = item.querySelector(".gallery-overlay h4").textContent;
            const category = item.querySelector(".gallery-overlay span").textContent;

            lightboxImg.src = img.src;
            lightboxCaption.innerHTML = `<strong>${caption}</strong> - <span>${category}</span>`;
            lightbox.classList.add("active");
        });
    });

    // Close on click close button or overlay
    lightboxClose.addEventListener("click", () => {
        lightbox.classList.remove("active");
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove("active");
        }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            lightbox.classList.remove("active");
        }
    });
}

// ==========================================================================
// Customer Testimonials Slider
// ==========================================================================
function initTestimonials() {
    const sliderContainer = document.querySelector(".slider-container");
    const slides = document.querySelectorAll(".testimonial-slide");
    const dotsContainer = document.querySelector(".slider-dots");

    if (!sliderContainer || slides.length === 0 || !dotsContainer) return;

    // Create Navigation dots dynamically
    dotsContainer.innerHTML = "";
    slides.forEach((_, idx) => {
        const dot = document.createElement("span");
        dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener("click", () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });

    // Auto rotate every 6 seconds
    startAutoSlide();

    function goToSlide(index) {
        currentSlide = index;
        sliderContainer.style.transform = `translateX(-${index * 100}%)`;
        
        // Update dots highlight
        const dots = document.querySelectorAll(".slider-dot");
        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === index);
        });

        // Restart timer
        stopAutoSlide();
        startAutoSlide();
    }

    function startAutoSlide() {
        slideInterval = setInterval(() => {
            let nextSlide = (currentSlide + 1) % slides.length;
            goToSlide(nextSlide);
        }, 6000);
    }

    function stopAutoSlide() {
        clearInterval(slideInterval);
    }
}

// ==========================================================================
// Reservation Form Handler & Validation
// ==========================================================================
function initReservationForm() {
    const form = document.getElementById("reservation-form");
    const modal = document.getElementById("success-modal-overlay");
    
    if (!form || !modal) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // 1. Inputs retrieval
        const nameVal = document.getElementById("reserve-name").value.trim();
        const emailVal = document.getElementById("reserve-email").value.trim();
        const phoneVal = document.getElementById("reserve-phone").value.trim();
        const guestsVal = document.getElementById("reserve-guests").value;
        const dateVal = document.getElementById("reserve-date").value;
        const timeVal = document.getElementById("reserve-time").value;
        const seatingVal = document.getElementById("reserve-seating").value;

        // 2. Validation
        if (!nameVal || !emailVal || !phoneVal || !dateVal || !timeVal) {
            alert("Please fill in all required fields.");
            return;
        }

        // Phone check
        const phonePattern = /^\+?[0-9]{9,15}$/;
        if (!phonePattern.test(phoneVal.replace(/\s/g, ''))) {
            alert("Please enter a valid phone number.");
            return;
        }

        // Date check: Must not be in the past
        const selectedDateObj = new Date(dateVal);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (selectedDateObj < today) {
            alert("Reservation date cannot be in the past.");
            return;
        }

        // 3. Generate booking ID
        const bookingNum = Math.floor(1000 + Math.random() * 9000);
        const bookingId = `CF-2026-${bookingNum}`;

        // 4. Seating text lookup
        const seatingTextEn = {
            indoor: "Indoor Premium (A/C)",
            outdoor: "Outdoor Garden Lounge",
            private: "Private VIP Suite"
        };

        const seatingLabel = seatingTextEn[seatingVal];

        // 5. Populate success modal receipt rows
        document.getElementById("modal-val-id").textContent = bookingId;
        document.getElementById("modal-val-name").textContent = nameVal;
        document.getElementById("modal-val-guests").textContent = `${guestsVal} Guests`;
        document.getElementById("modal-val-datetime").textContent = `${dateVal} @ ${timeVal}`;
        document.getElementById("modal-val-seating").textContent = seatingLabel;

        // 6. Show Modal overlay
        modal.classList.add("active");

        // 7. Modal action buttons
        const btnReceipt = document.getElementById("modal-btn-download");
        const btnAnother = document.getElementById("modal-btn-another");

        // Click download receipt simulation
        btnReceipt.onclick = () => {
            const receiptText = `
--------------------------------------------
          CEYLON FUSION RECEIPT
--------------------------------------------
Booking ID: ${bookingId}
Customer:   ${nameVal}
Email:      ${emailVal}
Phone:      ${phoneVal}
Guests:     ${guestsVal}
Date/Time:  ${dateVal} at ${timeVal}
Seating:    ${seatingLabel}
--------------------------------------------
   Thank you for choosing Ceylon Fusion!
--------------------------------------------
            `;
            // Create dummy file download trigger
            const blob = new Blob([receiptText], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `CeylonFusion_Reservation_${bookingId}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // Book another table triggers reset and hides modal
        btnAnother.onclick = () => {
            form.reset();
            modal.classList.remove("active");
        };
    });

    // Close modal if user clicks outside modal body
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            form.reset();
            modal.classList.remove("active");
        }
    });
}

// ==========================================================================
// Intersection Observer for Entrance Scroll Animations
// ==========================================================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(".animate");

    // Exit early if browser doesn't support IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(el => el.classList.add("active"));
        return;
    }

    const observerOptions = {
        root: null, // Viewport
        rootMargin: "0px",
        threshold: 0.12 // Trigger when 12% of card is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}
