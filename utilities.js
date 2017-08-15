// This is strictly for demo purposes -- there's a lot of hard coded values and happy-path-only logic in here.

'use strict';

var pizzapi = require('pizzapi');
//var orderconfig = require('./order.json');

var orderPizza = function(callback) {
  pizzapi.Util.findNearbyStores(
    '98121',
    'Delivery',
    function(storeData) {
      var myStore = new pizzapi.Store(
        {
          ID: storeData.result.Stores[0].StoreID
        }
      );

      getStoreInfo(myStore, "", callback);
    }
  );
};

function getStoreInfo(store, previousOutput, finalCallback) {
  store.getInfo(
    function(storeData) {
      console.log("Store code: " + storeData.result.StoreID);
      var output = previousOutput + `Ordered pizza from Dominos store #${storeData.result.StoreID} (${storeData.result.AddressDescription.replace(/\n/g, ", ")}).`;
      getStoreMenu(store, output, finalCallback);
    }
  );
}

function getStoreMenu(store, previousOutput, finalCallback) {
  store.getFriendlyNames(
    function(menuData) {
      const pepperoniPizzaItemName = "Large (14\") Hand Tossed Ultimate Pepperoni";
      const cheesePizzaItemName = "Large (14\") Hand Tossed Wisconsin 6 Cheese Pizza";

      var pepperoniPizzaCode = "";
      var cheesePizzaCode = "";

      for (var item of menuData.result) {
        for (var itemCode in item) {
          var itemName = item[itemCode].Name;
          if (itemName === pepperoniPizzaItemName) {
            pepperoniPizzaCode = itemCode;
          } else if (itemName === cheesePizzaItemName) {
            cheesePizzaCode = itemCode;
          }
        }
      }
      console.log(`Pepperoni: ${pepperoniPizzaCode}, Cheese: ${cheesePizzaCode}`);
      var output = previousOutput + `\nItems: ${pepperoniPizzaItemName} and ${cheesePizzaItemName}`;
      placeOrder(store, [pepperoniPizzaCode, cheesePizzaCode], output, finalCallback);
    }
  );
}

function placeOrder(store, itemCodes, previousOutput, finalCallback) {

  var customer = new pizzapi.Customer(
    {
      firstName: 'Clare',
      lastName: 'Liguori',
      address: new pizzapi.Address('2021 7th Ave, Seattle, WA, 98121'),
      phone: '206-555-5555',
      email: 'clare.liguori@gmail.com'
    }
  );

  var order = new pizzapi.Order(
    {
      customer: customer,
      storeID: store.ID,
      deliveryMethod: 'Delivery'
    }
  );

  for (var itemCode of itemCodes) {
    order.addItem(
      new pizzapi.Item(
        {
          code: itemCode,
          options: [],
          quantity: 1
        }
      )
    );
  }

  order.validate(
	  function(result) {
      console.log("Order validated");
	    orderValidated(order, previousOutput, finalCallback);
	  }
	);
}

function orderValidated(order, previousOutput, finalCallback) {
	order.price(
	  function(result) {
      console.log("Order priced");
      var output = previousOutput + "\nTotal: $" + result.result.Order.Amounts.Payment;
      output = output + "\nEstimated wait time: " + result.result.Order.EstimatedWaitMinutes + " minutes";

      orderPriced(order, output, finalCallback);
	  }
	);
}

function orderPriced(order, previousOutput, finalCallback) {
  // Only price the order, don't actually place it
  finalCallback(previousOutput);
}

module.exports = {
    orderPizza: orderPizza
};
