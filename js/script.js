document.addEventListener('DOMContentLoaded', () => {
    const PRODUCTS = [
        { id: 1, name: 'Cireng Krispi', price: 1500, image: 'https://picsum.photos/seed/cireng/400/300', description: 'Aci digoreng renyah di luar, kenyal di dalam. Disajikan dengan bumbu rujak pedas manis.' },
        { id: 2, name: 'Gehu Pedas', price: 2000, image: 'https://picsum.photos/seed/gehu/400/300', description: 'Tahu isi sayuran pedas yang digoreng dengan balutan adonan renyah. Menggugah selera!' },
        { id: 3, name: 'Molen Pisang', price: 1500, image: 'https://picsum.photos/seed/molen/400/300', description: 'Pisang manis legit dibalut kulit adonan renyah yang digoreng hingga keemasan.' },
        { id: 4, name: 'Bala-Bala', price: 1500, image: 'https://picsum.photos/seed/bala-bala/400/300', description: 'Gorengan sayur klasik yang terdiri dari kol, wortel, dan tauge. Gurih dan nikmat.' },
    ];

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbClJ-vIjgf0LhR7eRn0o68RwCLgoISnOP__IOlPyBZ1O1BKpyNNV9S3eVGkP9jGYp/exec';
    const WHATSAPP_NUMBER = '62895338126508';

    let customerName = '';
    let cart = [];
    let isSubmitting = false;

    const customerNameInput = document.getElementById('customerName');
    const productListContainer = document.getElementById('product-list');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total-container');
    const cartTotalElement = document.getElementById('cart-total');
    const orderButton = document.getElementById('order-button');
    const orderButtonText = document.getElementById('order-button-text');

    customerNameInput.addEventListener('input', (e) => {
        customerName = e.target.value;
    });

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const renderProducts = () => {
        productListContainer.innerHTML = '';
        PRODUCTS.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = "bg-white/50 backdrop-blur-sm border border-amber-800/20 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300";
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover" />
                <div class="p-4">
                    <h3 class="text-xl font-serif font-bold text-amber-900">${product.name}</h3>
                    <p class="text-stone-600 mt-1 text-sm">${product.description}</p>
                    <p class="text-lg font-bold text-amber-800 mt-2">${formatRupiah(product.price)} / pcs</p>
                    <div class="mt-4 flex items-center space-x-2">
                        <input type="number" min="1" value="1" id="quantity-${product.id}" class="w-16 p-2 border border-amber-400 rounded-md text-center focus:ring-2 focus:ring-amber-700 focus:outline-none" />
                        <button data-product-id="${product.id}" class="add-to-cart-btn flex-1 bg-amber-800 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-900 transition-colors duration-300">
                            Tambah
                        </button>
                    </div>
                </div>
            `;
            productListContainer.appendChild(productCard);
        });
        
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-product-id'));
                const quantityInput = document.getElementById(`quantity-${productId}`);
                const quantity = parseInt(quantityInput.value);
                const product = PRODUCTS.find(p => p.id === productId);
                handleAddToCart(product, quantity);
            });
        });
    };

    const renderCart = () => {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-stone-500 text-center py-4">Keranjang masih kosong.</p>';
            cartTotalContainer.style.display = 'none';
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = "flex items-center justify-between text-stone-800";
                cartItemElement.innerHTML = `
                    <div>
                        <p class="font-bold">${item.product.name}</p>
                        <p class="text-sm text-stone-600">${formatRupiah(item.product.price)}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="number" value="${item.quantity}" min="1" data-product-id="${item.product.id}" class="cart-quantity-input w-14 text-center p-1 border border-amber-300 rounded" />
                        <button data-product-id="${item.product.id}" class="remove-from-cart-btn text-red-600 hover:text-red-800 font-bold">✕</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
            cartTotalContainer.style.display = 'block';
        }
        updateTotal();

        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-product-id'));
                handleRemoveFromCart(productId);
            });
        });
        
        document.querySelectorAll('.cart-quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = parseInt(e.target.getAttribute('data-product-id'));
                const newQuantity = parseInt(e.target.value);
                handleUpdateQuantity(productId, newQuantity);
            });
        });
    };

    const updateTotal = () => {
        const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        cartTotalElement.textContent = formatRupiah(total);
    };

    const handleAddToCart = (product, quantity) => {
        const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ product, quantity });
        }
        renderCart();
    };

    const handleRemoveFromCart = (productId) => {
        cart = cart.filter(item => item.product.id !== productId);
        renderCart();
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveFromCart(productId);
            return;
        }
        const itemIndex = cart.findIndex(item => item.product.id === productId);
        if (itemIndex !== -1) {
            cart[itemIndex].quantity = newQuantity;
        }
        renderCart();
    };

    const handleOrder = async () => {
        if (!customerName.trim()) {
            alert('Mohon isi nama Anda terlebih dahulu.');
            return;
        }
        if (cart.length === 0) {
            alert('Keranjang pesanan Anda masih kosong.');
            return;
        }

        isSubmitting = true;
        orderButton.disabled = true;
        orderButtonText.textContent = 'Mengirim...';

        const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        const payload = {
            name: customerName,
            items: cart.map(item => ({
                name: item.product.name,
                quantity: item.quantity
            }))
        };
        
        const whatsappMessage = `Assalamualaikum, Kak.\n\nSaya *${customerName}* mau pesan gorengan:\n\n${cart
            .map(item => `• ${item.product.name} : ${item.quantity} pcs`)
            .join('\n')}\n\nTotal: *${formatRupiah(total)}*\n\nTerima kasih.`;
            
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload),
            });
            
            window.open(whatsappUrl, '_blank');
            alert('Pesanan Anda berhasil dikirim! Anda akan diarahkan ke WhatsApp untuk konfirmasi.');
            
            customerName = '';
            customerNameInput.value = '';
            cart = [];
            renderCart();
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Maaf, terjadi kesalahan saat mengirim pesanan. Silakan coba lagi atau hubungi kami langsung via WhatsApp.');
        } finally {
            isSubmitting = false;
            orderButton.disabled = false;
            orderButtonText.textContent = 'Pesan via WhatsApp';
        }
    };
    
    orderButton.addEventListener('click', handleOrder);

    renderProducts();
});
