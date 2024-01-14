import { menuArray } from "./data.js";

const orderSelection = document.getElementById('order-selection-container')
let checkoutArray = []

addEventListener('click', (e) => {
    console.log(e.target)
    if (e.target.dataset.fiPlus) {
        increment(e.target.dataset.fiPlus)
    }
    else if (e.target.dataset.fiMinus) {
        decrement(e.target.dataset.fiMinus)
    }
    else if (e.target.dataset.removeOrder) {
        removeOrder(e.target.dataset.removeOrder)
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
        // render()
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
            checkoutArray.splice(index, 1)
            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutArray))
            sessionStorage.removeItem(target)

            render()
        }
    })
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
                <div>
                    <p class="od-food-item--quantity">x${item.quantity}</p>
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
    const orderTotal = document.getElementById('od-total-price--value')
    let checkoutItemPrices = checkoutArray.map((e) => { return e.totalPrice })

    if (checkoutItemPrices.length > 0) {
        orderTotal.textContent = `$${checkoutItemPrices.reduce((total, currentItem) => total + currentItem).toFixed(2)}`
    } else orderTotal.textContent = `$${0.00.toFixed(2)}`

}

function render() {
    const orderDetails = document.getElementById('od-food-items-wrapper')

    setTimeout((e) => {
        orderSelection.innerHTML = createMenuSelectionHtml(menuArray)
        orderDetails.innerHTML = createOrderSummaryHtml(checkoutArray)
        calculateOrderTotal()
    }, 100)

}

render()