document.addEventListener('DOMContentLoaded', () => {
    const productsList = document.getElementById('products-list');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const subtotalSpan = document.getElementById('subtotal');
    const totalSpan = document.getElementById('total');
    const addressInput = document.getElementById('address');
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const trocoSection = document.getElementById('troco-section');
    const changeValueInput = document.getElementById('change-value');
    const noChangeCheckbox = document.getElementById('no-change');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const errorMessage = document.getElementById('error-message');

    const DELIVERY_FEE = 4.00;
    const WHATSAPP_NUMBER = '5512988209329'; // Formato: 55 + DDD + Número

    const products = [
        { id: 'queijo', name: 'Pastel de Queijo', price: 10.00, category: 'pastel' },
        { id: 'carne', name: 'Pastel de Carne', price: 10.00, category: 'pastel' },
        { id: 'pizza', name: 'Pastel de Pizza', price: 10.00, category: 'pastel' },
        { id: 'frango-catupiry', name: 'Pastel de Frango com Catupiry', price: 15.00, category: 'pastel' },
        { id: 'queijo-bacon', name: 'Pastel de Queijo com Bacon', price: 15.00, category: 'pastel' },
        { id: 'carne-queijo', name: 'Pastel de Carne com Queijo', price: 15.00, category: 'pastel' },
        { id: 'frango-queijo', name: 'Pastel de Frango com Queijo', price: 15.00, category: 'pastel' },
        { id: 'coca-2l', name: 'Coca Cola 2 Litros', price: 15.00, category: 'bebida' },
        { id: 'refri-lata', name: 'Refrigerante Lata 310ml', price: 6.00, category: 'bebida' },
        { id: 'garrafinha', name: 'Garrafinha 210ml', price: 3.00, category: 'bebida' }
    ];

    const additions = [
        { id: 'bacon-adicional', name: 'Bacon', price: 5.00 },
        { id: 'queijo-adicional', name: 'Queijo', price: 5.00 },
        { id: 'catupiry-adicional', name: 'Catupiry', price: 5.00 }
    ];

    let cart = []; // Array para armazenar os itens do carrinho { product: {}, quantity: 0, additions: [] }

    // --- Funções de Renderização ---

    function renderProducts() {
        productsList.innerHTML = '';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            if (product.category === 'pastel') {
                productDiv.classList.add('has-additions');
            }
            productDiv.dataset.productId = product.id;

            productDiv.innerHTML = `
                <h3>${product.name}</h3>
                <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                <div class="quantity-control">
                    <button data-action="decrease">-</button>
                    <span data-quantity="0">0</span>
                    <button data-action="increase">+</button>
                </div>
                ${product.category === 'pastel' ? `<button class="additions-toggle-btn">Adicionais</button>` : ''}
                <div class="additions-options">
                    <p>Adicionais (opcional):</p>
                    ${additions.map(addition => `
                        <label>
                            <input type="checkbox" data-addition-id="${addition.id}" data-addition-name="${addition.name}" data-addition-price="${addition.price.toFixed(2)}">
                            ${addition.name} (R$ ${addition.price.toFixed(2).replace('.', ',')})
                        </label>
                    `).join('')}
                </div>
            `;
            productsList.appendChild(productDiv);
        });
        updateProductQuantitiesDisplay();
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');
            cart.forEach((item, index) => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.dataset.cartIndex = index; // Para identificar o item no array do carrinho

                const additionsHtml = item.additions.length > 0
                    ? `<div class="cart-additions">Adicionais: ${item.additions.map(a => a.name).join(', ')}</div>`
                    : '';

                cartItemDiv.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.product.name} (x${item.quantity})</h4>
                        ${additionsHtml}
                    </div>
                    <div class="cart-item-controls">
                        <span class="price">R$ ${(item.quantity * (item.product.price + item.additions.reduce((sum, a) => sum + a.price, 0))).toFixed(2).replace('.', ',')}</span>
                        <button data-action="decrease-cart" data-product-id="${item.product.id}" ${item.additions.length > 0 ? `data-cart-index="${index}"` : ''}>-</button>
                        <span>${item.quantity}</span>
                        <button data-action="increase-cart" data-product-id="${item.product.id}" ${item.additions.length > 0 ? `data-cart-index="${index}"` : ''}>+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }
        updateTotals();
    }

    function updateProductQuantitiesDisplay() {
        products.forEach(product => {
            const productDiv = document.querySelector(`.product-item[data-product-id="${product.id}"]`);
            if (productDiv) {
                const quantitySpan = productDiv.querySelector('[data-quantity]');
                // Soma a quantidade total do produto no carrinho (considerando variações com e sem adicionais)
                const totalQuantityInCart = cart.filter(item => item.product.id === product.id)
                                                .reduce((sum, item) => sum + item.quantity, 0);
                quantitySpan.textContent = totalQuantityInCart;

                // Resetar checkboxes de adicionais quando a quantidade do produto é 0 no carrinho
                if (totalQuantityInCart === 0) {
                    const additionsOptions = productDiv.querySelector('.additions-options');
                    if (additionsOptions) {
                        additionsOptions.classList.remove('active');
                        additionsOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                            checkbox.checked = false;
                        });
                    }
                }
            }
        });
    }

    function updateTotals() {
        let subtotal = 0;
        cart.forEach(item => {
            const itemPrice = item.product.price + item.additions.reduce((sum, add) => sum + add.price, 0);
            subtotal += item.quantity * itemPrice;
        });

        subtotalSpan.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        totalSpan.textContent = `R$ ${(subtotal + DELIVERY_FEE).toFixed(2).replace('.', ',')}`;
    }

    // --- Funções de Lógica do Carrinho ---

    function addItemToCart(productId, selectedAdditions = []) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let cartItem = null;
        // Tenta encontrar um item no carrinho que corresponda ao produto E aos mesmos adicionais
        if (selectedAdditions.length > 0) {
            cartItem = cart.find(item =>
                item.product.id === productId &&
                item.additions.length === selectedAdditions.length &&
                item.additions.every(a => selectedAdditions.some(sa => sa.id === a.id)) &&
                selectedAdditions.every(sa => item.additions.some(a => a.id === sa.id))
            );
        } else {
            // Se não há adicionais, apenas verifica se o produto já está no carrinho sem adicionais
            cartItem = cart.find(item => item.product.id === productId && item.additions.length === 0);
        }

        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ product: product, quantity: 1, additions: selectedAdditions });
        }
        renderCart();
        updateProductQuantitiesDisplay();
    }

    function removeItemFromCart(productId, cartIndex = null) {
        if (cartIndex !== null) { // Remove um item específico do carrinho (com adicionais)
            if (cart[cartIndex] && cart[cartIndex].quantity > 1) {
                cart[cartIndex].quantity--;
            } else {
                cart.splice(cartIndex, 1);
            }
        } else { // Remove um item sem adicionais ou o primeiro encontrado
            const cartItemIndex = cart.findIndex(item => item.product.id === productId && item.additions.length === 0);
            if (cartItemIndex !== -1) {
                if (cart[cartItemIndex].quantity > 1) {
                    cart[cartItemIndex].quantity--;
                } else {
                    cart.splice(cartItemIndex, 1);
                }
            }
        }
        renderCart();
        updateProductQuantitiesDisplay();
    }

    // --- Event Listeners ---

    productsList.addEventListener('click', (event) => {
        const productItem = event.target.closest('.product-item');
        if (!productItem) return;

        const productId = productItem.dataset.productId;
        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (event.target.dataset.action === 'increase') {
            if (product.category === 'pastel') {
                const additionsOptionsDiv = productItem.querySelector('.additions-options');
                if (additionsOptionsDiv.classList.contains('active')) {
                    const selectedAdditions = Array.from(additionsOptionsDiv.querySelectorAll('input[type="checkbox"]:checked'))
                                                .map(checkbox => ({
                                                    id: checkbox.dataset.additionId,
                                                    name: checkbox.dataset.additionName,
                                                    price: parseFloat(checkbox.dataset.additionPrice)
                                                }));
                    addItemToCart(productId, selectedAdditions);
                } else {
                    // Se não tem adicionais selecionados e o modal não está aberto, adiciona sem adicionais
                    addItemToCart(productId);
                }
            } else {
                // Para bebidas, sempre adiciona sem adicionais
                addItemToCart(productId);
            }
        } else if (event.target.dataset.action === 'decrease') {
            removeItemFromCart(productId);
        } else if (event.target.classList.contains('additions-toggle-btn')) {
            const additionsOptionsDiv = productItem.querySelector('.additions-options');
            additionsOptionsDiv.classList.toggle('active');
        }
    });

    cartItemsContainer.addEventListener('click', (event) => {
        const cartItemDiv = event.target.closest('.cart-item');
        if (!cartItemDiv) return;

        const productId = event.target.dataset.productId;
        const cartIndex = event.target.dataset.cartIndex ? parseInt(event.target.dataset.cartIndex) : null;

        if (event.target.dataset.action === 'increase-cart') {
            if (cartIndex !== null) {
                cart[cartIndex].quantity++;
            } else {
                const item = cart.find(item => item.product.id === productId && item.additions.length === 0);
                if (item) item.quantity++;
            }
        } else if (event.target.dataset.action === 'decrease-cart') {
            if (cartIndex !== null) {
                if (cart[cartIndex].quantity > 1) {
                    cart[cartIndex].quantity--;
                } else {
                    cart.splice(cartIndex, 1);
                }
            } else {
                const itemIndex = cart.findIndex(item => item.product.id === productId && item.additions.length === 0);
                if (itemIndex !== -1) {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity--;
                    } else {
                        cart.splice(itemIndex, 1);
                    }
                }
            }
        }
        renderCart();
        updateProductQuantitiesDisplay();
    });

    // Lógica para Troco
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'Dinheiro') {
                trocoSection.classList.remove('hidden');
                changeValueInput.setAttribute('required', 'required');
            } else {
                trocoSection.classList.add('hidden');
                changeValueInput.removeAttribute('required');
                changeValueInput.value = '';
                noChangeCheckbox.checked = false;
            }
            // Limpa mensagem de erro ao mudar forma de pagamento
            errorMessage.classList.add('hidden');
            errorMessage.textContent = '';
        });
    });

    noChangeCheckbox.addEventListener('change', () => {
        if (noChangeCheckbox.checked) {
            changeValueInput.value = '';
            changeValueInput.setAttribute('disabled', 'disabled');
            changeValueInput.removeAttribute('required'); // Não é mais obrigatório
        } else {
            changeValueInput.removeAttribute('disabled');
            changeValueInput.setAttribute('required', 'required'); // Volta a ser obrigatório
        }
        // Limpa mensagem de erro ao mudar checkbox
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    });

    // Validar e Gerar Mensagem WhatsApp
    placeOrderBtn.addEventListener('click', () => {
        errorMessage.classList.add('hidden'); // Esconde mensagens de erro anteriores
        errorMessage.textContent = '';

        if (cart.length === 0) {
            errorMessage.textContent = 'Seu carrinho está vazio. Adicione itens para fazer o pedido.';
            errorMessage.classList.remove('hidden');
            return;
        }

        const address = addressInput.value.trim();
        if (!address) {
            errorMessage.textContent = 'Por favor, insira o endereço de entrega.';
            errorMessage.classList.remove('hidden');
            addressInput.focus();
            return;
        }

        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedPaymentMethod) {
            errorMessage.textContent = 'Por favor, selecione a forma de pagamento.';
            errorMessage.classList.remove('hidden');
            return;
        }

        let paymentInfo = `Forma de Pagamento: ${selectedPaymentMethod.value}`;
        if (selectedPaymentMethod.value === 'Dinheiro') {
            if (noChangeCheckbox.checked) {
                paymentInfo += '\nNão preciso de troco.';
            } else {
                const changeValue = parseFloat(changeValueInput.value);
                if (isNaN(changeValue) || changeValue <= 0) {
                    errorMessage.textContent = 'Por favor, informe o valor do troco ou marque "Não preciso de troco".';
                    errorMessage.classList.remove('hidden');
                    changeValueInput.focus();
                    return;
                }
                const totalValue = parseFloat(totalSpan.textContent.replace('R$ ', '').replace(',', '.'));
                if (changeValue < totalValue) {
                    errorMessage.textContent = `O valor do troco (R$ ${changeValue.toFixed(2).replace('.', ',')}) deve ser maior ou igual ao total do pedido (R$ ${totalValue.toFixed(2).replace('.', ',')}).`;
                    errorMessage.classList.remove('hidden');
                    changeValueInput.focus();
                    return;
                }
                paymentInfo += `\nPreciso de troco para: R$ ${changeValue.toFixed(2).replace('.', ',')}`;
            }
        }

        // Montar a mensagem do WhatsApp
        let message = 'Olá, Casa do Pastel! Meu pedido é:\n\n';

        let subtotalOrder = 0;
        cart.forEach(item => {
            const itemBasePrice = item.product.price;
            let itemPriceWithAdditions = itemBasePrice;
            let additionsText = '';

            if (item.additions.length > 0) {
                additionsText = `\n    Adicionais: ${item.additions.map(a => a.name).join(', ')}`;
                itemPriceWithAdditions += item.additions.reduce((sum, a) => sum + a.price, 0);
            }
            message += `- ${item.product.name} (x${item.quantity})${additionsText}\n`;
            subtotalOrder += item.quantity * itemPriceWithAdditions;
        });

        const totalOrder = subtotalOrder + DELIVERY_FEE;

        message += `\nSubtotal: R$ ${subtotalOrder.toFixed(2).replace('.', ',')}`;
        message += `\nTaxa de Entrega: R$ ${DELIVERY_FEE.toFixed(2).replace('.', ',')}`;
        message += `\nTotal do Pedido: R$ ${totalOrder.toFixed(2).replace('.', ',')}`;
        message += `\n\nEndereço de Entrega: ${address}`;
        message += `\n${paymentInfo}`;
        message += `\n\nObrigado!`;

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    // Inicialização
    renderProducts();
    renderCart(); // Para garantir que os totais iniciais estejam corretos, mesmo com carrinho vazio.
});
