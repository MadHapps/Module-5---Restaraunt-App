import { menuArray } from "./data.js";

let checkoutArray = []

addEventListener('click', (e) => {
    if (e.target.dataset.fiPlus) {
        increment(e.target.dataset.fiPlus)
    }
    else if (e.target.dataset.fiMinus) {
        decrement(e.target.dataset.fiMinus)
    }
    else if (e.target.dataset.removeOrder) {
        removeOrder(e.target.dataset.removeOrder)
    }
    else if (e.target.id === 'order-btn') {
        const checkoutModal = document.getElementById('checkout-modal')
        checkoutModal.classList.toggle('show')
        console.log('I WAS CLICKED!')
    }
    else if (e.target.id === 'checkout-form-pay-btn') {
        const paymentForm = document.getElementById('payment-form')
        const paymentFormData = new FormData(paymentForm)

        console.log(`Name: ${paymentFormData.get('name')}`)
        console.log(`Credit Card Number: ${paymentFormData.get('cardNumber')}`)
        console.log(`CVV: ${paymentFormData.get('CVV')}`)
        
        clearOrder()
    }
    else if (e.target.id === 'close-modal') {
        const checkoutModal = document.getElementById('checkout-modal')
        checkoutModal.classList.toggle('show')
    }
})

function increment(target) {
    if (sessionStorage.getItem(target)) {
        let quantity = parseInt(sessionStorage.getItem(target))
        sessionStorage.setItem(target, ++quantity)
        checkoutArray.forEach((item) => {
            if (parseInt(target) === item.id) {
                item.quantity = quantity
                item.totalPrice += item.price
            }
        })
        render()
    }
    else {
        sessionStorage.setItem(target, 1)

        menuArray.forEach((item) => {
            if (parseInt(target) === item.id && item.quantity === 0) {
                item.quantity = 1
                item.totalPrice += item.price
                checkoutArray.push(item)
            }
        })

        render()
    }

    storeCheckoutArrayForSession(checkoutArray)
}

function decrement(target) {
    let quantity = parseInt(sessionStorage.getItem(target))

    if (quantity > 0) {
        sessionStorage.setItem(target, --quantity)

        checkoutArray.forEach((item) => {
            if (parseInt(target) === item.id) {
                --item.quantity
                item.totalPrice -= item.price
                render()
            }
        })
        if (parseInt(sessionStorage.getItem(target)) <= 0) {
            checkoutArray.forEach((item, index) => {
                if (parseInt(target) === item.id) {
                    item.quantity = 0
                    item.totalPrice = 0
                    checkoutArray.splice(index, 1)
                    render()
                }
            })

            sessionStorage.removeItem(target)
        }

        storeCheckoutArrayForSession(checkoutArray)
    }
}

function removeOrder(target) {
    checkoutArray.forEach((item, index) => {
        if (item.id === parseInt(target)) {
            item.quantity = 0
            item.totalPrice = 0
            checkoutArray.splice(index, 1)
            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutArray))
            sessionStorage.removeItem(target)

            render()
        }
    })
}

function clearOrder() {
    checkoutArray = []
    sessionStorage.clear()
    render()
}

function storeCheckoutArrayForSession(arr) {
    const stringifiedArr = JSON.stringify(arr)

    sessionStorage.setItem('checkoutData', stringifiedArr)

}

function createMenuSelectionHtml(foodItems) {

    let html = ``

    foodItems.forEach(foodItem => {
        html += `
        <div class="os__food-item">
            <img src=${foodItem.icon} alt="cartoon sushi icon for food selection item">
            <div class="fi__text-wrapper">
                <div class="fi__text">
                    <p class="fi__text-name">${foodItem.name}</p>
                    <p class="fi__text-ingredients">${foodItem.ingredients}</p>
                    <p class="fi__text-price">$${foodItem.price.toFixed(2)}</p>
                </div>
                <div class="fi-add-to-cart-wrapper">
                    <i class="fa-solid fa-plus add-to-cart" data-fi-plus = ${foodItem.id}></i>
                    <p class="fi-quantity" data-fi-quantity = ${foodItem.id}>
                    ${parseInt(sessionStorage.getItem(foodItem.id)) || 0}
                    </p>
                    <i class="fa-solid fa-minus add-to-cart" data-fi-minus = ${foodItem.id}></i>
                </div>    
            </div>
        </div>`

    });

    return html
}

function createOrderSummaryHtml() {

    if (checkoutArray.length === 0 && sessionStorage.getItem('checkoutData') && sessionStorage.getItem('checkoutData').length > 0) {
        checkoutArray = JSON.parse(sessionStorage.getItem('checkoutData'))
    }
    else if (checkoutArray.length === 0 && !sessionStorage.getItem('checkoutData')) {
        sessionStorage.setItem('checkoutData', [])
    }

    let html = ``
    if (checkoutArray.length > 0 || sessionStorage.getItem('checkoutData').length > 0) {
        checkoutArray.forEach((item) => {
            html += `
            <div class="od-food-item">
                <p class="od-food-item--quantity">${item.quantity}x-</p>
                <div>
                    <p class="od-food-item-name">${item.name}</p>
                    <button class="od-food-item--remove-btn" data-remove-order=${item.id}>remove</button>
                </div>
                <p class="od-food-item--price">$${item.totalPrice.toFixed(2)}</p>
            </div>
            `
        })
    }

    return html
}

function calculateOrderTotal() {

    const checkoutItemPrices = checkoutArray.map((e) => { return e.totalPrice })
    const sushiRolls = checkoutArray.filter((e) => { return e.type.includes('sushi roll') })
    const sushiRollPrices = sushiRolls.map((e) => { return e.totalPrice })

    let originalPrice = 0
    let discount = 0
    let subtotal = 0
    let tax = 0
    let orderTotal = 0

    if (checkoutItemPrices.length > 0) {
        originalPrice = checkoutItemPrices.reduce((total, currentItem) => total + currentItem)
        if (sushiRollPrices.length > 0) {
            discount = sushiRollPrices.reduce((a, b) => a + b) * .5
        }
        subtotal = originalPrice - discount
        tax = subtotal * .0725
        orderTotal = subtotal + tax
    }

    return `
            <div>
                <p class="od-total-price--title">Original Price:</p>
                <p class="od-total-price--originalValue">$${originalPrice.toFixed(2)}</p>
            </div>
            <div>
                <p class="od-total-price--title">Discount<span>(Sushi Rolls 50% Off)</span>:</p>
                <p class="od-total-price--discount">-$(${discount.toFixed(2)})</p>
            </div>
            <div>
                <p class="od-total-price--title">Subtotal:</p>
                <p class="od-total-price--subtotal">$${subtotal.toFixed(2)}</p>
            </div>
            <div>
                <p class="od-total-price--title">Tax<span>(7.25%)</span></p>
                <p class="od-total-price--tax">$${tax.toFixed(2)}</p>
            </div>
            <div>
                <p class="od-total-price--title">Total Price:</p>
                <p class="od-total-price--orderTotal">$${orderTotal.toFixed(2)}</p>
            </div>
            `

}

function render() {
    const orderSelection = document.getElementById('order-selection-container')
    const orderDetails = document.getElementById('od-food-items-wrapper')
    const orderPrice = document.getElementById('od-total-price')

    setTimeout((e) => {
        orderSelection.innerHTML = createMenuSelectionHtml(menuArray)
        orderDetails.innerHTML = createOrderSummaryHtml(checkoutArray)
        orderPrice.innerHTML = calculateOrderTotal()
    }, 50)

}

render()