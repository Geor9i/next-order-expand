let headerBarElement = document.querySelector(".main__title");
let orderSectionElement = document.querySelector(".order-page__section");
let orderFormMainContainer = document.querySelector('.order__form__main__container');
let dropdownMenuElement = document.querySelector(".dropdown__menu");
let makeAnOrderButtonElement = document.querySelector(".menu__make__order");
let inventoryAdjustmentButtonElement = document.querySelector(".menu__adjust__products");
let pullDownElement = document.querySelector(".menu__pulldown");
let orderPageMainContainer = document.querySelector('.generated__order-page__main__container');
let orderFormAreaElement = document.querySelector(".order__form__area");
let generatedFormContainerElement = document.querySelector(".generated__order-page__main__container");
let headerOutputAreaElement = document.querySelector(".order__table__page-output-order-header");
let outputAreaElement = document.querySelector(".order__table__page-output-order");
let sideScreenElement = document.querySelector(".order__table__page-side-selector__screen");
let rmfDataDumpElement = document.getElementById("rmf-data-dump");
let deliveryHarvestProducts = {};
let discoveredProducts = [];
let nextOrderParameters = {};






//STATES====================================================================

function changeState () {
  let state = 0;

  return {
    getState () {
      return state;
    },
    setState(num) {
      if (num >= 0 && num <= 4) {
        state = num;
        updateScreens(state);
      }
    }
  }
}

let appState = changeState();


//order page dump state

function orderDumpState (value) {
  
  switch (value) {
    case 0:
    rmfDataDumpElement.className = 'rmf-data-dump';
    rmfDataDumpElement.disabled = false;
    rmfDataDumpElement.value = '';
    break;
    case 1:
      rmfDataDumpElement.className = 'rmf-data-dump__disabled';
      rmfDataDumpElement.disabled = true;
    break;
  }
}
    

//====================================================================STATES

//Window change==============================================================

function updateScreens(state) {
  switch (state) {
    //Main Screen state
    case 0:
      orderSectionElement.className = "order-page__section";
      orderPageMainContainer.className = 'generated__order-page__main__container';
      orderFormAreaElement.className = "order__form__area__none";
      rmfDataDumpElement.value = "";
      deleteChildren(headerOutputAreaElement, outputAreaElement, sideScreenElement);
      orderDumpState(0);
      break;
      case 1:
        orderSectionElement.className = "order-page__section__active";
        orderPageMainContainer.className = 'generated__order-page__main__container';
        orderFormAreaElement.className = "order__form__area__appear";
        rmfDataDumpElement.value = "";
        deleteChildren(headerOutputAreaElement, outputAreaElement, sideScreenElement);
        orderDumpState(0);
      break;
    case 2:
        orderFormAreaElement.className = "order__form__area__dissapear";
        setTimeout(function() {

        productsOnOrder = nextOrder(deliveryHarvestProducts, nextOrderParameters.orderInvoiceDate, nextOrderParameters.isInvoiced, nextOrderParameters.receivedToday, nextOrderParameters.weeklySalesData, nextOrderParameters.weeklyForecastData);

        generateSideBar(productsOnOrder)
        orderPageMainContainer.className = 'generated__order-page__main__container__active';
        orderFormAreaElement.className = "order__form__area__none";
        orderPageMainContainer.className = 'generated__order-page__main__container__active';
      }, 1200);
      break;
    case 3:
      orderSectionElement.className = "order-page__section";
      orderPageMainContainer.className = 'generated__order-page__main__container';
      break;
  }

  //State REF
  /*
  0. Blank home screen
  1. Order form appear
  2. Order form disapear and order table screen appear 
  3. Inventory Adjustment screen appear
  
  */
}

//==============================================================Window change


//==============================================================================
// EVENTS

//DROPDOWN MENU

//Dropdown menu make an order button onclick
makeAnOrderButtonElement.addEventListener("click", () => {

    if (appState.getState() === 2) {
      displayOrderWarning();
    } else {
      appState.setState(1);
    }     
    dropdownMenuElement.className = "dropdown__menu__return";
  })

  inventoryAdjustmentButtonElement.addEventListener("click", () => {
    appState.setState(0)
    dropdownMenuElement.className = "dropdown__menu__return";
  })
  
  
  
  
  //DropDown Menu Animation and state changes
  headerBarElement.addEventListener("click", headerBarDropdown) 
  pullDownElement.addEventListener("click", headerBarDropdown);

  function headerBarDropdown() {
    if (dropdownMenuElement.className === "dropdown__menu__active") {
      dropdownMenuElement.className = "dropdown__menu__return"
    } else {
      dropdownMenuElement.className = "dropdown__menu__active"
    }
  }

  function deleteChildren(...elements) {
    for (let element of elements) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
    }

    function displayOrderWarning() {
      return new Promise((resolve, reject) => {
      dropdownMenuElement.className = 'dropdown__menu';
      headerBarElement.removeEventListener('click', headerBarDropdown);
      pullDownElement.removeEventListener('click', headerBarDropdown);

      let pageCover = document.createElement('div');
      pageCover.className = 'page-cover';

      let warningMessageContainer = document.createElement('div');
      warningMessageContainer.className = 'warning-message-container';
      
      let warningMesageTextContainer = document.createElement('div');
      warningMesageTextContainer.className = 'warning-message-text-container';
      let warningP1 = document.createElement('p');
      warningP1.className = 'warning-message-text';
      warningP1.textContent = 'Are you sure ?'
     
      warningMesageTextContainer.appendChild(warningP1);

      let warningMesageButtonContainer = document.createElement('div');
      warningMesageButtonContainer.className = 'warning-message__button-container';

      let warningMesageButtonYes = document.createElement('button');
      warningMesageButtonYes.textContent = 'Yes';
      warningMesageButtonYes.className = 'warning-message__button';
      let warningMesageButtonCancel = document.createElement('button');
      warningMesageButtonCancel.textContent = 'Cancel';
      warningMesageButtonCancel.className = 'warning-message__button';

      warningMesageButtonContainer.appendChild(warningMesageButtonYes);
      warningMesageButtonContainer.appendChild(warningMesageButtonCancel);

      warningMessageContainer.appendChild(warningMesageTextContainer);
      warningMessageContainer.appendChild(warningMesageButtonContainer);
      pageCover.appendChild(warningMessageContainer);

      orderSectionElement.insertBefore(pageCover, orderSectionElement.firstChild);
      
      warningMessageContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('warning-message__button') && e.target.textContent === 'Yes') {
          warningMessageContainer.remove();
          appState.setState(1);
          resolve(true);
          pageCover.remove();
          warningMessageContainer.remove();
          headerBarElement.addEventListener('click',headerBarDropdown);
          pullDownElement.addEventListener('click',headerBarDropdown);
        } else if (e.target.classList.contains('warning-message__button') && e.target.textContent === 'Cancel'){
          warningMessageContainer.remove();
          resolve(false);
          pageCover.remove();
          warningMessageContainer.remove();
          headerBarElement.addEventListener('click',headerBarDropdown);
          pullDownElement.addEventListener('click',headerBarDropdown);
        }
      })
    })
    }
