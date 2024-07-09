const container = document.querySelector(".container")
let items = []
let currentIndexItem = -1
let index = 0

if ("serviceWorker" in navigator){
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}

document.getElementById('addProduct').addEventListener('click', async function() {
  if(currentIndexItem == -1){
    const name = document.getElementById('expense-description').value;
    const quantity = document.getElementById('expense-quantity').value;
    const price = document.getElementById('expense-amount').value;
    const currencyFrom = document.getElementById('currency-from').value;
    const currencyTo = document.getElementById('currency-to').value;
    let conversion_rate = await fetchExchangeRates(currencyFrom,currencyTo )
    const priceTo = (price * quantity * conversion_rate).toFixed(2);
    if (name && price && quantity) {
      const productList = document.getElementById('productList');
      const productItem = document.createElement('li');
      productItem.className = 'list-group-item d-flex my-3 justify-content-between align-items-center';
      productItem.innerHTML = `
      <div mx-2>
        <strong class="itemName">${name}</strong> -
        <span class="itemCurrency">${currencyFrom}</span>
        <span class="itemPrice">${price}</span> 
        | (Qtde: <span class="itemQuantity">${quantity}</span>) => 
          <span class="currencyTo">${currencyTo}</span>
          <span class="itemTotal"> ${priceTo}</span>
      </div>
      <button class="btn btn-secondary btn-sm mx-2 editarProduct">Editar</button>
      <button class="btn btn-danger btn-sm mx-2 removeProduct">Remover</button>
    `;
      productList.appendChild(productItem);
      const item = {
        id: index++,
        name: name,
        currencyFrom: currencyFrom,
        currencyTo: currencyTo,
        priceFrom: price,
        priceTo: priceTo,
        quantity: quantity,
        element: productItem
      };
      items.push(item);
      const editarButton = productItem.querySelector('.editarProduct');
      editarButton.addEventListener('click', function() {
        document.getElementById('expense-description').value = item.name;
        document.getElementById('expense-quantity').value = item.quantity;
        document.getElementById('expense-amount').value = item.priceFrom;
        document.getElementById('currency-from').value = item.currencyFrom;
        document.getElementById('currency-to').value = item.currencyTo;
        currentIndexItem = items.indexOf(item)
      });
      const removerButton = productItem.querySelector('.removeProduct');
      removerButton.addEventListener('click', function() {
        productList.removeChild(productItem);
        items = items.filter(it => it.id !== item.id);
        refreshTotal()
      });
    }
  }
  else{
    const item = items[currentIndexItem]
    const element = item.element
    item.name =  document.getElementById('expense-description').value;
    item.quantity =  document.getElementById('expense-quantity').value;
    item.price =  document.getElementById('expense-amount').value;
    item.currency =  document.getElementById('expense-quantity').value;
    element.querySelector('.itemName').textContent = item.name;
    element.querySelector('.itemCurrency').textContent = item.name;
    element.querySelector('.itemPrice').textContent = item.name;
    element.querySelector('.itemQuantity').textContent = item.name;
    element.querySelector('.itemTotal').textContent = item.name;
    currentIndexItem = -1
  }
    refreshTotal()
    resetForm();
  }
);

function resetForm() {
  document.getElementById('expense-description').value = '';
  document.getElementById('expense-quantity').value = '';
  document.getElementById('expense-amount').value = '';
  document.getElementById('currency-from').selectedIndex = 0;
  document.getElementById('currency-to').selectedIndex = 0;
}
function refreshTotal(){
  document.getElementById('total-origin-USD').textContent = getTotalFrom('USD');
  document.getElementById('total-origin-BRL').textContent = getTotalFrom('BRL');
  document.getElementById('total-origin-EUR').textContent = getTotalFrom('EUR');
  document.getElementById('total-destino-USD').textContent = getTotalTo('USD');
  document.getElementById('total-destino-BRL').textContent = getTotalTo('BRL');
  document.getElementById('total-destino-EUR').textContent = getTotalTo('EUR');
}
function getTotalFrom(currency){
  let totalFrom = 0
  if(items.length == 0){
    return totalFrom
  } 
  items.forEach(item => {
    if (item.currencyFrom === currency) {
      totalFrom += parseFloat(item.priceFrom * item.quantity);
    }
  });
  return totalFrom.toFixed(2);
}
function getTotalTo(currency){
  let totalTo = 0
  if(items.length == 0){
    return totalTo
  } 
  items.forEach(item => {
    if (item.currencyTo === currency) {
      totalTo += parseFloat(item.priceTo);;
    }
  });
  return totalTo.toFixed(2);
}
async function fetchExchangeRates(currencyFrom, currencyTo) {
  try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/53125a6fb7eac961cbade6aa/pair/${currencyFrom}/${currencyTo}`);
      if (!response.ok) {
          throw new Error('Não foi possível obter os dados');
      }
      const data = await response.json();
      return data.conversion_rate
  } catch (error) {
      console.error('Erro ao buscar dados da API:', error.message);
  }
}