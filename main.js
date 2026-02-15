// Shopping Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedPaymentMethod = null;
let currentProductOrder = null; // لحفظ معلومات المنتج عند الطلب المباشر

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Toggle cart sidebar
function toggleCart() {
    document.querySelector('.cart-sidebar').classList.toggle('active');
    document.querySelector('.cart-overlay').classList.toggle('active');
    renderCart();
}

// Add to cart
function addToCart(productId) {
    const product = getProductById(productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Animation للعداد فقط بدون فتح السلة
    const badge = document.getElementById('cartCount');
    badge.style.animation = 'pulse 0.5s';
    setTimeout(() => badge.style.animation = '', 500);
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    }
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>سلة المشتريات فارغة</p>
            </div>
        `;
        cartFooter.style.display = 'none';
        return;
    }
    
    cartFooter.style.display = 'block';
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.img}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} جنيه</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span style="margin: 0 1rem; font-weight: 700;">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <i class="fas fa-trash cart-item-remove" onclick="removeFromCart(${item.id})"></i>
            </div>
        `;
    }).join('');
    
    document.getElementById('cartTotal').textContent = `${total.toLocaleString()} جنيه`;
}

// Checkout - Go to payment page
function checkout() {
    if (cart.length === 0) {
        alert('سلة المشتريات فارغة!');
        return;
    }
    
    // Close cart
    document.querySelector('.cart-sidebar').classList.remove('active');
    document.querySelector('.cart-overlay').classList.remove('active');
    
    // Show payment page
    showPaymentPage();
}

// Show Payment Page
function showPaymentPage() {
    // Hide all pages
    document.getElementById('homePage').classList.remove('active');
    document.getElementById('productPage').classList.remove('active');
    
    // Show payment page
    document.getElementById('paymentPage').classList.add('active');
    
    // Render order summary
    renderOrderSummary();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Order Summary
function renderOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    let total = 0;
    const shippingCost = 80;
    
    let itemsHTML = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHTML += `
            <div class="order-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>${itemTotal.toLocaleString()} جنيه</span>
            </div>
        `;
    });
    
    itemsHTML += `
        <div class="order-item">
            <span>الإجمالي الفرعي</span>
            <span>${total.toLocaleString()} جنيه</span>
        </div>
        <div class="order-item">
            <span>قيمة الشحن</span>
            <span>${shippingCost} جنيه</span>
        </div>
        <div class="order-item" style="border-top: 2px solid var(--primary); padding-top: 1rem; margin-top: 0.5rem; font-size: 1.2rem; font-weight: 700; color: var(--primary);">
            <span>الإجمالي النهائي</span>
            <span>${(total + shippingCost).toLocaleString()} جنيه</span>
        </div>
    `;
    
    orderItems.innerHTML = itemsHTML;
}

// Select Payment Method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Remove selected class from all
    document.querySelectorAll('.payment-option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked
    event.target.closest('.payment-option-card').classList.add('selected');
    
    // Enable submit button if form is valid
    const submitBtn = document.getElementById('submitPayment');
    submitBtn.disabled = !validateForm();
}

// Validate Form
function validateForm() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerCity = document.getElementById('customerCity').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    
    // Check basic info - المحافظة أصبحت إجبارية
    if (!customerName || !customerPhone || !customerCity || !customerAddress || !selectedPaymentMethod) {
        return false;
    }
    
    // التحقق من أن رقم الهاتف الأساسي يحتوي على 11 رقم بالضبط
    if (customerPhone.length !== 11) {
        return false;
    }
    
    // التحقق من أن رقم الهاتف يبدأ بـ 01
    if (!customerPhone.startsWith('01')) {
        return false;
    }
    
    return true;
}

// Enable/disable submit button when form changes
function updateSubmitButton() {
    const submitBtn = document.getElementById('submitPayment');
    submitBtn.disabled = !validateForm();
}

// Submit Payment
let isSubmitting = false; // متغير لمنع الضغط المتكرر

function submitPayment() {
    // منع الضغط المتكرر
    if (isSubmitting) {
        return;
    }
    
    // التحقق من رقم الهاتف أولاً
    const customerPhone = document.getElementById('customerPhone').value.trim();
    
    if (customerPhone.length !== 11) {
        alert('❌ رقم الهاتف الأساسي يجب أن يتكون من 11 رقم بالضبط');
        document.getElementById('customerPhone').focus();
        return;
    }
    
    if (!customerPhone.startsWith('01')) {
        alert('❌ رقم الهاتف يجب أن يبدأ بـ 01');
        document.getElementById('customerPhone').focus();
        return;
    }
    
    if (!validateForm()) {
        alert('يرجى إدخال جميع البيانات المطلوبة');
        return;
    }
    
    // تعطيل الزر ووضع علامة أنه يتم الإرسال
    isSubmitting = true;
    const submitBtn = document.getElementById('submitPayment');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    
    // Get customer info
    const customerName = document.getElementById('customerName').value.trim();
    const customerCity = document.getElementById('customerCity').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const customerNotes = document.getElementById('customerNotes').value.trim();
    
    // Get payment method name
    const paymentMethodName = selectedPaymentMethod === 'cash' ? 'الدفع عند الاستلام' : "InstaPay";
    
    // Build order details
    let orderDetails = `*🛒 طلب جديد من موازين الأصدقاء*\n\n`;
    orderDetails += `*👤 بيانات العميل:*\n`;
    orderDetails += `الاسم: ${customerName}\n`;
    orderDetails += `الهاتف: ${customerPhone}\n`;
    orderDetails += `المحافظة: ${customerCity}\n`;
    orderDetails += `العنوان: ${customerAddress}\n`;
    if (customerNotes) {
        orderDetails += `ملاحظات: ${customerNotes}\n`;
    }
    orderDetails += `\n`;
    
    orderDetails += `*📦 تفاصيل الطلب:*\n`;
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderDetails += `▫️ ${item.name}\n`;
        orderDetails += `   الكمية: ${item.quantity}\n`;
        orderDetails += `   السعر: ${item.price.toLocaleString()} جنيه\n`;
        orderDetails += `   الإجمالي: ${itemTotal.toLocaleString()} جنيه\n\n`;
    });
    
    const shippingCost = 80;
    const finalTotal = total + shippingCost;
    
    orderDetails += `*الإجمالي الفرعي: ${total.toLocaleString()} جنيه*\n`;
    orderDetails += `*قيمة الشحن: ${shippingCost} جنيه*\n`;
    orderDetails += `*💰 الإجمالي النهائي: ${finalTotal.toLocaleString()} جنيه*\n\n`;
    orderDetails += `*💳 طريقة الدفع: ${paymentMethodName}*`;
    
    // إرسال الطلب على الإيميل باستخدام EmailJS
    emailjs.send(
        "service_n9oqz15",
        "template_wdgt3xo",
        {
            message: orderDetails
        }
    ).then(function(response) {
        console.log('✅ تم إرسال الطلب على الإيميل بنجاح', response);
        
        // Show success modal
        showSuccessModal();
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // إعادة تفعيل الزر بعد النجاح
        isSubmitting = false;
        const submitBtn = document.getElementById('submitPayment');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> تأكيد الطلب';
        
    }, function(error) {
        console.error('❌ خطأ في إرسال الإيميل:', error);
        alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
        
        // إعادة تفعيل الزر في حالة الخطأ
        isSubmitting = false;
        const submitBtn = document.getElementById('submitPayment');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> تأكيد الطلب';
    });
}

// Show Success Modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
}

// Close Success Modal
let isClosingModal = false; // متغير لمنع الضغط المتكرر على زر العودة

function closeSuccessModal() {
    // منع الضغط المتكرر
    if (isClosingModal) {
        return;
    }
    
    isClosingModal = true;
    
    const modal = document.getElementById('successModal');
    modal.classList.remove('active');
    
    // Reset form
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerCity').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerNotes').value = '';
    
    if (selectedPaymentMethod === 'card') {
        document.getElementById('cardName').value = '';
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCVV').value = '';
    }
    
    selectedPaymentMethod = null;
    document.querySelectorAll('.payment-option-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('cardForm').classList.remove('active');
    
    // Go back to home
    showHome();
    
    // إعادة تفعيل الزر بعد ثانية واحدة
    setTimeout(() => {
        isClosingModal = false;
    }, 1000);
}

// فتح نموذج بيانات العميل للطلب المباشر من صفحة المنتج
function openCustomerInfoModal(productId) {
    const product = getProductById(productId);
    
    // إضافة المنتج للسلة بالكمية المحددة
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += productQuantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: productQuantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // إعادة تعيين الكمية
    productQuantity = 1;
    
    // إغلاق صفحة المنتج
    document.getElementById('productPage').classList.remove('active');
    
    // فتح صفحة الدفع مباشرة
    showPaymentPage();
}

// إغلاق نموذج بيانات العميل
function closeCustomerInfoModal() {
    document.getElementById('customerInfoModal').classList.remove('active');
    
    // Reset form
    document.getElementById('productCustomerName').value = '';
    document.getElementById('productCustomerPhone').value = '';
    document.getElementById('productCustomerPhone2').value = '';
    document.getElementById('productCustomerCity').value = '';
    document.getElementById('productCustomerAddress').value = '';
    document.getElementById('productCustomerNotes').value = '';
    document.getElementById('productPaymentMethod').value = '';
    
    currentProductOrder = null;
}

// إرسال طلب المنتج المباشر عبر WhatsApp
function submitProductOrder() {
    // التحقق من البيانات الأساسية
    const customerName = document.getElementById('productCustomerName').value.trim();
    const customerPhone = document.getElementById('productCustomerPhone').value.trim();
    const customerCity = document.getElementById('productCustomerCity').value.trim();
    const customerAddress = document.getElementById('productCustomerAddress').value.trim();
    const customerNotes = document.getElementById('productCustomerNotes').value.trim();
    const paymentMethod = document.getElementById('productPaymentMethod').value;
    
    // التحقق من الحقول الإجبارية (بما فيها المحافظة)
    if (!customerName || !customerPhone || !customerCity || !customerAddress || !paymentMethod) {
        alert('يرجى إدخال جميع البيانات المطلوبة (الاسم، الهاتف، المحافظة، العنوان، وطريقة الدفع)');
        return;
    }
    
    // التحقق من رقم الهاتف (11 رقم)
    if (customerPhone.length !== 11) {
        alert('❌ رقم الهاتف الأساسي يجب أن يتكون من 11 رقم بالضبط');
        document.getElementById('productCustomerPhone').focus();
        return;
    }
    
    // التحقق من أن رقم الهاتف يبدأ بـ 01
    if (!customerPhone.startsWith('01')) {
        alert('❌ رقم الهاتف يجب أن يبدأ بـ 01');
        document.getElementById('productCustomerPhone').focus();
        return;
    }
    
    if (!currentProductOrder) {
        alert('حدث خطأ، يرجى المحاولة مرة أخرى');
        return;
    }
    
    // تحديد اسم طريقة الدفع بالعربي
    const paymentMethodNames = {
        'cash': 'الدفع عند الاستلام',
        'vodafone': 'فودافون كاش',
        'instapay': 'InstaPay'
    };
    
    // بناء رسالة الطلب
    const subtotal = currentProductOrder.price * currentProductOrder.quantity;
    const shippingCost = 80;
    const total = subtotal + shippingCost;
    
    let orderDetails = `*🛒 طلب جديد من موازين الأصدقاء*\n\n`;
    orderDetails += `*👤 بيانات العميل:*\n`;
    orderDetails += `الاسم: ${customerName}\n`;
    orderDetails += `الهاتف: ${customerPhone}\n`;
    orderDetails += `المحافظة: ${customerCity}\n`;
    orderDetails += `العنوان: ${customerAddress}\n`;
    if (customerNotes) {
        orderDetails += `ملاحظات: ${customerNotes}\n`;
    }
    orderDetails += `\n`;
    
    orderDetails += `*📦 تفاصيل الطلب:*\n`;
    orderDetails += `▫️ ${currentProductOrder.productName}\n`;
    orderDetails += `   الكمية: ${currentProductOrder.quantity}\n`;
    orderDetails += `   السعر: ${currentProductOrder.price.toLocaleString()} جنيه\n`;
    orderDetails += `   الإجمالي الفرعي: ${subtotal.toLocaleString()} جنيه\n`;
    orderDetails += `   قيمة الشحن: ${shippingCost} جنيه\n\n`;
    
    orderDetails += `*💰 الإجمالي النهائي: ${total.toLocaleString()} جنيه*\n\n`;
    orderDetails += `*💳 طريقة الدفع:* ${paymentMethodNames[paymentMethod]}`;
    
    // إرسال الطلب على الإيميل باستخدام EmailJS
    emailjs.send(
        "service_n9oqz15",
        "template_wdgt3xo",
        {
            message: orderDetails
        }
    ).then(function(response) {
        console.log('✅ تم إرسال الطلب على الإيميل بنجاح', response);
        
        // إغلاق نموذج بيانات العميل
        closeCustomerInfoModal();
        
        // عرض رسالة النجاح
        showSuccessModal();
        
        // إعادة تعيين كمية المنتج
        productQuantity = 1;
        if (document.getElementById('productQuantity')) {
            document.getElementById('productQuantity').textContent = '1';
        }
        
    }, function(error) {
        console.error('❌ خطأ في إرسال الإيميل:', error);
        alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
    });
}

// Card input formatting
document.addEventListener('DOMContentLoaded', () => {
    // Card number formatting
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
            updateSubmitButton();
        });
    }
    
    // Expiry formatting
    const cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
            updateSubmitButton();
        });
    }
    
    // CVV formatting
    const cardCVV = document.getElementById('cardCVV');
    if (cardCVV) {
        cardCVV.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
            updateSubmitButton();
        });
    }
    
    // Card name
    const cardName = document.getElementById('cardName');
    if (cardName) {
        cardName.addEventListener('input', updateSubmitButton);
    }
    
    // Customer info fields
    const customerName = document.getElementById('customerName');
    const customerPhone = document.getElementById('customerPhone');
    const customerCity = document.getElementById('customerCity');
    const customerAddress = document.getElementById('customerAddress');
    
    if (customerName) customerName.addEventListener('input', updateSubmitButton);
    if (customerPhone) customerPhone.addEventListener('input', updateSubmitButton);
    if (customerCity) customerCity.addEventListener('input', updateSubmitButton);
    if (customerAddress) customerAddress.addEventListener('input', updateSubmitButton);
});

// Search functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        filterProducts(query);
    });
}

function filterProducts(query) {
    if (!query) {
        generateProductsGrid();
        return;
    }
    
    const filtered = productsData.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.desc.toLowerCase().includes(query) ||
        product.cat.toLowerCase().includes(query)
    );
    
    const grid = document.getElementById('productsGrid');
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #999;">
                <i class="fas fa-search" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p style="font-size: 1.3rem;">لا توجد منتجات مطابقة للبحث</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(product => `
        <div class="product-card fade-in" onclick="showProductDetail(${product.id})">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-desc">${product.desc}</div>
                <div class="product-price">
                    <span class="current-price">${product.price.toLocaleString()} جنيه</span>
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} جنيه</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                        أضف للسلة
                    </button>
                    <button class="btn-details" onclick="event.stopPropagation(); showProductDetail(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-observe for animations
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }, 100);
}

// Generate products grid
function generateProductsGrid() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = productsData.map(product => `
        <div class="product-card fade-in" onclick="showProductDetail(${product.id})">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-desc">${product.desc}</div>
                <div class="product-price">
                    <span class="current-price">${product.price.toLocaleString()} جنيه</span>
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} جنيه</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                        أضف للسلة
                    </button>
                    <button class="btn-details" onclick="event.stopPropagation(); showProductDetail(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Show Product Detail Page
function showProductDetail(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    const productPage = document.getElementById('productPage');
    const homePage = document.getElementById('homePage');
    
    productPage.innerHTML = `
        <div class="product-detail-container">
            <a href="#" class="back-to-shop" onclick="showHome(); return false;">
                <i class="fas fa-arrow-right"></i>
                العودة للمنتجات
            </a>
            
            <div class="product-detail-grid">
                <div class="product-images">
                    <div class="main-image" id="mainImage">
                        <img src="${product.images[0]}" alt="${product.name}">
                    </div>
                    <div class="thumbnail-images">
                        ${product.images.map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                                <img src="${img}" alt="${product.name}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="product-detail-info">
                    <h1>${product.name}</h1>
                    
                    <div class="product-price-detail">
                        <span class="current-price-detail">${product.price.toLocaleString()} جنيه</span>
                        ${product.oldPrice ? `
                            <span class="old-price-detail">${product.oldPrice.toLocaleString()} جنيه</span>
                            <div class="discount-badge">
                                وفر ${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                            </div>
                        ` : ''}
                    </div>
                    
                    <p class="product-description-detail">${product.desc}</p>
                    
                    <div class="product-specs">
                        <h3 class="specs-title">المواصفات التقنية</h3>
                        ${Object.entries(product.details).map(([key, value]) => {
                            const labels = {
                                capacity: 'السعة القصوى',
                                accuracy: 'دقة القياس',
                                display: 'نوع الشاشة',
                                power: 'مصدر الطاقة',
                                material: 'المادة',
                                warranty: 'الضمان'
                            };
                            return `
                                <div class="spec-item">
                                    <span class="spec-label">${labels[key]}</span>
                                    <span class="spec-value">${value}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="product-features">
                        <h3 class="features-title">المميزات الرئيسية</h3>
                        <div class="feature-list">
                            ${product.features.map(feature => `
                                <div class="feature-item-detail">
                                    <div class="feature-icon-detail">
                                        <i class="fas fa-check"></i>
                                    </div>
                                    <div class="feature-text-detail">${feature}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="add-to-cart-section">
                        <div class="quantity-selector">
                            <span class="quantity-label">الكمية:</span>
                            <div class="quantity-controls">
                                <button class="qty-control-btn" onclick="updateProductQuantity(-1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity-value" id="productQuantity">1</span>
                                <button class="qty-control-btn" onclick="updateProductQuantity(1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <button class="add-cart-btn" onclick="addProductToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                            أضف إلى السلة
                        </button>
                        
                        <button class="whatsapp-order-btn" onclick="orderViaWhatsApp(${product.id})">
                            <i class="fab fa-whatsapp"></i>
                            اطلب عبر WhatsApp
                        </button>
                        
                        <button class="complete-order-btn" onclick="openCustomerInfoModal(${product.id})">
                            <i class="fas fa-check-circle"></i>
                            إتمام الطلب
                        </button>
                    </div>
                    
                    <div class="payment-methods">
                        <h3 class="payment-title">طرق الدفع المتاحة</h3>
                        <div class="payment-options">
                            <div class="payment-option">
                                <i class="fas fa-money-bill-wave payment-icon" style="color: #10b981;"></i>
                                <span class="payment-text">كاش عند الاستلام</span>
                            </div>
                            <div class="payment-option">
                                <i class="fas fa-mobile-alt payment-icon" style="color: #ef4444;"></i>
                                <span class="payment-text">فودافون كاش</span>
                            </div>
                            <div class="payment-option">
                                <i class="fas fa-credit-card payment-icon" style="color: #8b5cf6;"></i>
                                <span class="payment-text">InstaPay</span>
                            </div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 15px; padding: 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                            <i class="fas fa-shipping-fast" style="font-size: 2.5rem; color: white;"></i>
                            <div>
                                <h4 style="color: white; margin: 0 0 0.5rem 0; font-size: 1.1rem;">معلومات الشحن</h4>
                                <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 0.95rem;"><strong>قيمة الشحن 80 جنيهاً</strong> لجميع المحافظات</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Switch pages
    homePage.classList.remove('active');
    productPage.classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Product detail page quantity
let productQuantity = 1;

function updateProductQuantity(change) {
    productQuantity = Math.max(1, productQuantity + change);
    document.getElementById('productQuantity').textContent = productQuantity;
}

function addProductToCart(productId) {
    const product = getProductById(productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += productQuantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: productQuantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    productQuantity = 1;
    
    // فتح السلة مباشرة بدون رسالة
    document.querySelector('.cart-sidebar').classList.add('active');
    document.querySelector('.cart-overlay').classList.add('active');
    renderCart();
    
    // Animation للعداد
    const badge = document.getElementById('cartCount');
    badge.style.animation = 'pulse 0.5s';
    setTimeout(() => badge.style.animation = '', 500);
}

function orderViaWhatsApp(productId) {
    const product = getProductById(productId);
    const message = `مرحباً! أريد طلب:\n\n${product.name}\nالسعر: ${product.price.toLocaleString()} جنيه\nالكمية: ${productQuantity}\n\nالإجمالي: ${(product.price * productQuantity).toLocaleString()} جنيه`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=201017990134&text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
}

function changeMainImage(img, thumbnail) {
    document.querySelector('#mainImage img').src = `${img}`;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Close Mobile Menu Function
function closeMobileMenu() {
    const nav = document.querySelector('nav');
    const navOverlay = document.querySelector('.nav-overlay');
    const menuIcon = document.querySelector('.menu-toggle i');
    
    if (nav) nav.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset icon
    if (menuIcon) {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
}

// Navigation functions
function showHome() {
    closeMobileMenu();
    document.getElementById('homePage').classList.add('active');
    document.getElementById('productPage').classList.remove('active');
    document.getElementById('paymentPage').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToProducts() {
    closeMobileMenu();
    showHome();
    setTimeout(() => {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function filterByCategory(category) {
    showHome();
    setTimeout(() => {
        filterProductsByCategory(category);
        // الذهاب لقسم المنتجات
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function filterProductsByCategory(category) {
    // تحديث حالة الأزرار - إزالة active من جميع الأزرار
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // تفعيل الزر الذي تم الضغط عليه
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // تصفية المنتجات
    const filteredProducts = category === 'all' ? productsData : productsData.filter(p => p.cat === category);
    
    // عرض المنتجات المفلترة مع تأثير انتقالي
    const grid = document.getElementById('productsGrid');
    
    // إخفاء المنتجات الحالية بتأثير
    grid.style.transition = 'opacity 0.3s ease';
    grid.style.opacity = '0';
    
    setTimeout(() => {
        if (filteredProducts.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><h3>لا توجد منتجات في هذا القسم حالياً</h3></div>';
        } else {
            grid.innerHTML = filteredProducts.map(product => `
                <div class="product-card fade-in" onclick="showProductDetail(${product.id})">
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                    <div class="product-image">
                        <img src="${product.img}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-desc">${product.desc}</div>
                        <div class="product-price">
                            <span class="current-price">${product.price.toLocaleString()} جنيه</span>
                            ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} جنيه</span>` : ''}
                        </div>
                        <div class="product-actions">
                            <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                                <i class="fas fa-shopping-cart"></i>
                                أضف للسلة
                            </button>
                            <button class="btn-details" onclick="event.stopPropagation(); showProductDetail(${product.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // إظهار المنتجات الجديدة
        grid.style.opacity = '1';
        
        // Re-observe for animations
        setTimeout(() => {
            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        }, 100);
    }, 300);
}

function scrollToAbout() {
    closeMobileMenu();
    showHome();
    setTimeout(() => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function scrollToContact() {
    closeMobileMenu();
    showHome();
    setTimeout(() => {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Initialize
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.loader').classList.add('hidden');
    }, 1500);
    
    generateProductsGrid();
    updateCartCount();
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.pageYOffset > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
function toggleMobileMenu() {
    const nav = document.querySelector('nav');
    const navOverlay = document.querySelector('.nav-overlay');
    const menuIcon = document.querySelector('.menu-toggle i');
    
    nav.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    
    // Change icon
    if (nav.classList.contains('active')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
    } else {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // إغلاق القائمة عند الضغط على الـ overlay
    if (navOverlay) {
        navOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // إغلاق القائمة عند الضغط على أي لينك
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
});

// Scroll to top button
const scrollTopBtn = document.querySelector('.scroll-top');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Intersection observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

setTimeout(() => {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}, 100);

// إضافة event listeners لحقول صفحة الدفع لتفعيل الزر تلقائياً
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من وجود العناصر قبل إضافة المستمعات
    setTimeout(() => {
        const customerNameField = document.getElementById('customerName');
        const customerPhoneField = document.getElementById('customerPhone');
        const customerCityField = document.getElementById('customerCity');
        const customerAddressField = document.getElementById('customerAddress');
        
        if (customerNameField && customerPhoneField && customerCityField && customerAddressField) {
            customerNameField.addEventListener('input', updateSubmitButton);
            customerPhoneField.addEventListener('input', updateSubmitButton);
            customerCityField.addEventListener('change', updateSubmitButton);
            customerAddressField.addEventListener('input', updateSubmitButton);
        }
    }, 500);
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Close nav when clicking overlay
// (تم دمج هذا الكود في الأعلى)

// Search Functionality
function toggleSearch() {
    const searchBox = document.getElementById('searchBox');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchBox.classList.toggle('active');
    
    if (searchBox.classList.contains('active')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        searchResults.classList.remove('active');
    }
}

function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        searchResults.classList.remove('active');
        return;
    }
    
    // البحث في المنتجات
    const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>لا توجد نتائج للبحث</p>
            </div>
        `;
    } else {
        searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="goToProduct(${product.id})">
                <img src="${product.img}" alt="${product.name}" class="search-result-img">
                <div class="search-result-info">
                    <div class="search-result-name">${product.name}</div>
                    <div class="search-result-category">${product.category}</div>
                    <div class="search-result-price">${product.price} جنيه</div>
                </div>
            </div>
        `).join('');
    }
    
    searchResults.classList.add('active');
}

function goToProduct(productId) {
    // إغلاق البحث
    const searchBox = document.getElementById('searchBox');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchBox.classList.remove('active');
    searchInput.value = '';
    searchResults.classList.remove('active');
    
    // الذهاب لصفحة المنتج
    showProductDetails(productId);
}

// إغلاق نتائج البحث عند النقر خارجها
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.getElementById('searchResults');
    
    if (searchContainer && !searchContainer.contains(event.target)) {
        searchResults.classList.remove('active');
    }
});

// ========================================
// Auto-convert Arabic numbers to English
// ========================================
function convertArabicToEnglish(input) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let result = input;
    for (let i = 0; i < arabicNumbers.length; i++) {
        result = result.split(arabicNumbers[i]).join(englishNumbers[i]);
    }
    return result;
}

// Apply auto-conversion to all phone input fields
function initPhoneNumberConversion() {
    const phoneInputs = [
        'customerPhone',
        'customerPhone2',
        'productCustomerPhone',
        'productCustomerPhone2'
    ];
    
    phoneInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function(e) {
                // Convert Arabic numbers to English
                const converted = convertArabicToEnglish(e.target.value);
                
                // Remove any non-numeric characters
                const cleaned = converted.replace(/[^0-9]/g, '');
                
                // Update the input value
                e.target.value = cleaned;
            });
            
            // Also handle paste events
            input.addEventListener('paste', function(e) {
                setTimeout(() => {
                    const converted = convertArabicToEnglish(e.target.value);
                    const cleaned = converted.replace(/[^0-9]/g, '');
                    e.target.value = cleaned;
                }, 10);
            });
        }
    });
}

// Initialize phone conversion when DOM is ready
document.addEventListener('DOMContentLoaded', initPhoneNumberConversion);

// Also initialize after a delay to ensure all elements are loaded
setTimeout(initPhoneNumberConversion, 1000);

// ========================================
// Policy Pages Functions
// ========================================

const policyContent = {
    privacy: {
        title: 'سياسة الخصوصية',
        icon: 'fa-shield-alt',
        content: `
            <h2><i class="fas fa-info-circle"></i> مقدمة</h2>
            <p>نحن في <strong>موازين الأصدقاء</strong> نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك.</p>
            
            <h2><i class="fas fa-database"></i> المعلومات التي نجمعها</h2>
            <p>عند استخدام موقعنا أو شراء منتجاتنا، قد نجمع المعلومات التالية:</p>
            <ul>
                <li><strong>معلومات شخصية:</strong> الاسم، رقم الهاتف، العنوان، البريد الإلكتروني</li>
                <li><strong>معلومات الطلب:</strong> المنتجات المطلوبة، تفضيلات الدفع، تاريخ الطلبات</li>
            </ul>
            
            <h2><i class="fas fa-cogs"></i> كيف نستخدم معلوماتك</h2>
            <div class="policy-highlight">
                <p><i class="fas fa-check-circle"></i> <strong>معالجة الطلبات:</strong> لتنفيذ وتوصيل طلباتك بنجاح</p>
                <p><i class="fas fa-check-circle"></i> <strong>التواصل:</strong> للتواصل معك بخصوص الطلبات والعروض الخاصة</p>
                <p><i class="fas fa-check-circle"></i> <strong>تحسين الخدمة:</strong> لتطوير وتحسين منتجاتنا وخدماتنا</p>
                <p><i class="fas fa-check-circle"></i> <strong>الأمان:</strong> لحماية موقعنا ومنع الاحتيال</p>
            </div>
            
            <h2><i class="fas fa-lock"></i> حماية بياناتك</h2>
            <p>نتخذ جميع الإجراءات الأمنية اللازمة لحماية معلوماتك الشخصية من الوصول غير المصرح به، بما في ذلك:</p>
            <ul>
                <li>تخزين البيانات على خوادم آمنة</li>
                <li>تقييد الوصول إلى المعلومات الشخصية</li>
                <li>المراجعة المنتظمة لإجراءات الأمان</li>
            </ul>
            
            <h2><i class="fas fa-share-alt"></i> مشاركة المعلومات</h2>
            <p>نحن <strong>لا نبيع أو نؤجر</strong> معلوماتك الشخصية لأطراف ثالثة. قد نشارك بياناتك فقط مع:</p>
            <ul>
                <li>شركات الشحن لتوصيل طلباتك</li>
                <li>معالجي الدفع لإتمام المعاملات المالية</li>
            </ul>
            
            <h2><i class="fas fa-user-check"></i> حقوقك</h2>
            <p>لديك الحق في:</p>
            <div class="policy-highlight">
                <p><i class="fas fa-arrow-left"></i> الوصول إلى بياناتك الشخصية ومراجعتها</p>
                <p><i class="fas fa-arrow-left"></i> طلب تصحيح أو تحديث معلوماتك</p>
                <p><i class="fas fa-arrow-left"></i> طلب حذف بياناتك الشخصية</p>
            </div>
            
            <h2><i class="fas fa-cookie-bite"></i> ملفات تعريف الارتباط (Cookies)</h2>
            <p>نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا.</p>
            
            <h2><i class="fas fa-phone-alt"></i> اتصل بنا</h2>
            <p>إذا كان لديك أي استفسارات حول سياسة الخصوصية، يمكنك التواصل معنا عبر:</p>
            <p><strong>WhatsApp:</strong> <a href="https://api.whatsapp.com/send?phone=201017990134" target="_blank" style="color: var(--primary);">01017990134</a></p>
        `
    },
    
    shipping: {
        title: 'سياسة الشحن والتوصيل',
        icon: 'fa-shipping-fast',
        content: `
            <h2><i class="fas fa-truck"></i> معلومات عامة</h2>
            <p>نحن في <strong>موازين الأصدقاء</strong> نسعى لتوصيل منتجاتك بأسرع وقت ممكن وبأعلى معايير الجودة.</p>
            
            <div class="policy-highlight">
                <h3><i class="fas fa-money-bill-wave"></i> تكلفة الشحن</h3>
                <p><strong>80 جنيهاً مصرياً</strong> لجميع المحافظات في مصر</p>
            </div>
            
            <h2><i class="fas fa-clock"></i> مدة التوصيل</h2>
            <p>يتم توصيل الطلبات خلال:</p>
            <ul>
                <li><strong>القاهرة والجيزة:</strong> من 2 إلى 3 أيام عمل</li>
                <li><strong>الإسكندرية والدلتا:</strong> من 3 إلى 4 أيام عمل</li>
                <li><strong>باقي المحافظات:</strong> من 3 إلى 5 أيام عمل</li>
            </ul>
            
            <div class="policy-highlight">
                <p><i class="fas fa-info-circle"></i> <strong>ملحوظة:</strong> قد تختلف مدة التوصيل حسب الموقع الجغرافي والظروف الخاصة بشركة الشحن.</p>
            </div>
            
            <h2><i class="fas fa-map-marked-alt"></i> مناطق الشحن</h2>
            <p>نقوم بالشحن إلى <strong>جميع محافظات جمهورية مصر العربية</strong> دون استثناء.</p>
            
            <h2><i class="fas fa-box-open"></i> تتبع الطلب</h2>
            <p>بعد شحن طلبك، سنرسل لك:</p>
            <ul>
                <li>رسالة تأكيد عبر WhatsApp تحتوي على تفاصيل الشحن</li>
                <li>رقم تتبع الشحنة (إن وجد)</li>
                <li>الوقت المتوقع للتوصيل</li>
            </ul>
            
            <h2><i class="fas fa-exclamation-triangle"></i> مشاكل التوصيل</h2>
            <p>في حالة حدوث أي مشكلة في التوصيل مثل:</p>
            <div class="policy-highlight">
                <p><i class="fas fa-arrow-left"></i> تأخير في التوصيل لأكثر من المدة المحددة</p>
                <p><i class="fas fa-arrow-left"></i> عدم القدرة على التواصل مع شركة الشحن</p>
                <p><i class="fas fa-arrow-left"></i> استلام منتج تالف أو غير مطابق</p>
            </div>
            <p>يرجى <strong>التواصل معنا فوراً</strong> على WhatsApp: <a href="https://api.whatsapp.com/send?phone=201017990134" target="_blank" style="color: var(--primary);">01017990134</a></p>
            
            <h2><i class="fas fa-hand-holding-usd"></i> الدفع عند الاستلام</h2>
            <p>نوفر خدمة <strong>الدفع عند الاستلام</strong> لراحتك:</p>
            <ul>
                <li>يمكنك دفع قيمة الطلب + قيمة الشحن عند استلام الطلب</li>
                <li>تأكد من فحص المنتج جيداً قبل الدفع</li>
                <li>في حالة وجود أي مشكلة، يمكنك رفض استلام الطلب</li>
            </ul>
            
            <h2><i class="fas fa-phone-alt"></i> خدمة العملاء</h2>
            <p>فريق خدمة العملاء متاح للرد على استفساراتك:</p>
            <p><strong>WhatsApp:</strong> <a href="https://api.whatsapp.com/send?phone=201017990134" target="_blank" style="color: var(--primary);">01017990134</a></p>
        `
    },
    
    return: {
        title: 'سياسة الإرجاع والاستبدال',
        icon: 'fa-undo-alt',
        content: `
            <h2><i class="fas fa-calendar-check"></i> مدة الإرجاع والاستبدال</h2>
            <div class="policy-highlight">
                <p><i class="fas fa-clock"></i> يمكنك إرجاع أو استبدال المنتج خلال <strong>7 أيام</strong> من تاريخ الاستلام</p>
            </div>
            
            <h2><i class="fas fa-check-circle"></i> شروط الإرجاع والاستبدال</h2>
            <p>لقبول طلب الإرجاع أو الاستبدال، يجب أن تتوفر الشروط التالية:</p>
            <ul>
                <li><strong>حالة المنتج:</strong> يجب أن يكون المنتج في حالته الأصلية دون استخدام</li>
                <li><strong>العبوة:</strong> يجب أن تكون العبوة الأصلية سليمة وغير تالفة</li>
                <li><strong>الملحقات:</strong> يجب إرجاع جميع الملحقات والمستندات المرفقة</li>
                <li><strong>الفاتورة:</strong> يجب تقديم فاتورة الشراء أو إثبات الشراء</li>
            </ul>
            
            <h2><i class="fas fa-times-circle"></i> حالات لا يمكن فيها الإرجاع</h2>
            <div class="policy-highlight">
                <p><i class="fas fa-ban"></i> المنتجات المستخدمة أو التي تحمل علامات استعمال</p>
                <p><i class="fas fa-ban"></i> المنتجات التي تم تخصيصها حسب طلب العميل</p>
                <p><i class="fas fa-ban"></i> المنتجات التالفة بسبب سوء الاستخدام من قبل العميل</p>
                <p><i class="fas fa-ban"></i> المنتجات التي مر عليها أكثر من 7 أيام من تاريخ الاستلام</p>
            </div>
            
            <h2><i class="fas fa-exchange-alt"></i> كيفية طلب الإرجاع أو الاستبدال</h2>
            <p>لطلب إرجاع أو استبدال منتج، اتبع الخطوات التالية:</p>
            <ol>
                <li>تواصل معنا عبر WhatsApp على: <a href="https://api.whatsapp.com/send?phone=201017990134" target="_blank" style="color: var(--primary);">01017990134</a></li>
                <li>أرسل صورة للمنتج والفاتورة</li>
                <li>اذكر سبب الإرجاع أو الاستبدال بوضوح</li>
                <li>انتظر موافقة فريق خدمة العملاء</li>
                <li>سيتم إرسال عنوان إرجاع المنتج أو تنسيق استلامه</li>
            </ol>
            
            <h2><i class="fas fa-shipping-fast"></i> تكلفة الإرجاع</h2>
            <p>تختلف تكلفة الإرجاع حسب سبب الإرجاع:</p>
            <ul>
                <li><strong>عيب في المنتج:</strong> نتحمل نحن كامل تكلفة الشحن</li>
                <li><strong>خطأ في الطلب من جانبنا:</strong> نتحمل نحن كامل تكلفة الشحن</li>
                <li><strong>رغبة العميل في الإرجاع:</strong> يتحمل العميل تكلفة الشحن</li>
            </ul>
            
            <h2><i class="fas fa-money-bill-wave"></i> استرداد الأموال</h2>
            <p>في حالة الموافقة على طلب الإرجاع:</p>
            <div class="policy-highlight">
                <p><i class="fas fa-arrow-left"></i> سيتم استرداد المبلغ المدفوع خلال <strong>7-14 يوم عمل</strong></p>
                <p><i class="fas fa-arrow-left"></i> يتم الاسترداد بنفس طريقة الدفع المستخدمة في الشراء</p>
                <p><i class="fas fa-arrow-left"></i> في حالة الدفع نقداً، سيتم التنسيق معك لطريقة الاسترداد</p>
            </div>
            
            <h2><i class="fas fa-exclamation-circle"></i> استبدال المنتج</h2>
            <p>إذا كنت ترغب في استبدال المنتج بمنتج آخر:</p>
            <ul>
                <li>يمكنك اختيار منتج بديل من نفس القيمة</li>
                <li>إذا كان المنتج البديل أعلى قيمة، يتم دفع الفرق</li>
                <li>إذا كان المنتج البديل أقل قيمة، يتم استرداد الفرق</li>
                <li>تطبق نفس شروط الإرجاع على عملية الاستبدال</li>
            </ul>
            
            <h2><i class="fas fa-phone-alt"></i> اتصل بنا</h2>
            <p>لأي استفسارات حول سياسة الإرجاع والاستبدال:</p>
            <p><strong>WhatsApp:</strong> <a href="https://api.whatsapp.com/send?phone=201017990134" target="_blank" style="color: var(--primary);">01017990134</a></p>
        `
    },
    
    terms: {
        title: 'الشروط والأحكام',
        icon: 'fa-file-contract',
        content: `
            <h2><i class="fas fa-handshake"></i> الموافقة على الشروط</h2>
            <p>باستخدام موقع <strong>موازين الأصدقاء</strong> وشراء منتجاتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
            
            <h2><i class="fas fa-shopping-bag"></i> الطلبات والمشتريات</h2>
            <div class="policy-highlight">
                <h3>تقديم الطلب</h3>
                <p><i class="fas fa-check"></i> جميع الطلبات تخضع للتوفر والتأكيد</p>
                <p><i class="fas fa-check"></i> نحتفظ بالحق في رفض أي طلب لأسباب معقولة</p>
                <p><i class="fas fa-check"></i> تأكيد الطلب يتم عبر WhatsApp أو الهاتف</p>
            </div>
            
            <h3><i class="fas fa-coins"></i> الأسعار</h3>
            <ul>
                <li>جميع الأسعار مدرجة بالجنيه المصري</li>
                <li>الأسعار لا تشمل تكاليف الشحن ما لم يُذكر خلاف ذلك</li>
                <li>نحتفظ بالحق في تغيير الأسعار في أي وقت</li>
                <li>الأسعار المطبقة هي الأسعار الموجودة وقت تقديم الطلب</li>
            </ul>
            
            <h2><i class="fas fa-credit-card"></i> طرق الدفع</h2>
            <p>نقبل طرق الدفع التالية:</p>
            <ul>
                <li><strong>الدفع عند الاستلام (COD):</strong> نقداً عند استلام الطلب</li>
                <li><strong>فودافون كاش:</strong> الدفع الإلكتروني عبر فودافون كاش</li>
                <li><strong>InstaPay:</strong> التحويل الفوري عبر InstaPay</li>
            </ul>
            
            <h2><i class="fas fa-box"></i> المنتجات</h2>
            <div class="policy-highlight">
                <p><i class="fas fa-info-circle"></i> نسعى لعرض صور دقيقة للمنتجات، لكن الألوان قد تختلف قليلاً</p>
                <p><i class="fas fa-info-circle"></i> المواصفات والأوزان المذكورة هي تقريبية</p>
                <p><i class="fas fa-info-circle"></i> نحتفظ بالحق في إجراء تعديلات على المنتجات دون إشعار مسبق</p>
            </div>
            
            <h2><i class="fas fa-shield-alt"></i> الضمان</h2>
            <p>جميع منتجاتنا مضمونة ضد عيوب الصناعة:</p>
            <ul>
                <li>مدة الضمان تختلف حسب نوع المنتج (يتم ذكرها في صفحة المنتج)</li>
                <li>الضمان لا يغطي التلف الناتج عن سوء الاستخدام</li>
                <li>لتفعيل الضمان، يجب الاحتفاظ بالفاتورة</li>
            </ul>
            
            <h2><i class="fas fa-user-shield"></i> مسؤولية العميل</h2>
            <p>يتعهد العميل بـ:</p>
            <ol>
                <li>تقديم معلومات صحيحة ودقيقة عند الطلب</li>
                <li>استخدام المنتجات وفقاً للتعليمات المرفقة</li>
                <li>عدم استخدام الموقع بطرق غير قانونية أو ضارة</li>
                <li>الحفاظ على سرية معلومات الحساب (إن وجد)</li>
            </ol>
            
            <h2><i class="fas fa-gavel"></i> حدود المسؤولية</h2>
            <div class="policy-highlight">
                <p><i class="fas fa-exclamation-triangle"></i> لا نتحمل مسؤولية الأضرار غير المباشرة الناتجة عن استخدام منتجاتنا</p>
                <p><i class="fas fa-exclamation-triangle"></i> مسؤوليتنا محدودة بقيمة المنتج المشترى</p>
                <p><i class="fas fa-exclamation-triangle"></i> لا نضمن عدم انقطاع أو خلو الموقع من الأخطاء</p>
            </div>
            
            <h2><i class="fas fa-copyright"></i> الملكية الفكرية</h2>
            <p>جميع المحتويات الموجودة على الموقع (نصوص، صور، شعارات) هي ملك لـ <strong>موازين الأصدقاء</strong> ومحمية بحقوق الملكية الفكرية.</p>
            
            <h2><i class="fas fa-edit"></i> تعديل الشروط</h2>
            <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. التعديلات تصبح سارية فور نشرها على الموقع.</p>
            
            <h2><i class="fas fa-balance-scale"></i> القانون الحاكم</h2>
            <p>تخضع هذه الشروط لقوانين جمهورية مصر العربية، ويتم حل أي نزاعات وفقاً للقوانين المصرية.</p>
            
            <h2><i class="fas fa-phone-alt"></i> اتصل بنا</h2>
            <p>لأي استفسارات حول الشروط والأحكام:</p>
            <p><strong>WhatsApp:</strong> <a href="https://api.whatsapp.com/send?phone=201017990134" target="_blank" style="color: var(--primary);">01017990134</a></p>
        `
    }
};

function showPolicyPage(policyType) {
    const policyPage = document.getElementById('policyPage');
    const policyContentDiv = document.getElementById('policyContent');
    
    if (policyContent[policyType]) {
        const policy = policyContent[policyType];
        policyContentDiv.innerHTML = `
            <h1><i class="fas ${policy.icon}"></i> ${policy.title}</h1>
            ${policy.content}
        `;
        
        policyPage.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Scroll to top of policy content
        policyPage.scrollTop = 0;
    }
}

function closePolicyPage() {
    const policyPage = document.getElementById('policyPage');
    policyPage.classList.remove('active');
    document.body.style.overflow = '';
}

// Close policy page when clicking outside
document.addEventListener('click', function(e) {
    const policyPage = document.getElementById('policyPage');
    const policyContainer = document.querySelector('.policy-container');
    
    if (policyPage && e.target === policyPage) {
        closePolicyPage();
    }
});

// Close policy page with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePolicyPage();
    }
});