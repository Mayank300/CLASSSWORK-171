var table_number = null;

AFRAME.registerComponent("handleMarker", {
  init: async function () {
    if (table_number === null) {
      this.askTableNumber();
    }
    var dishes = await this.getDishes();
    this.el.addEventListener("markerFound", () => {
      if (table_number !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("menu")
      .get()
      .then((data) => {
        return data.docs.map((doc) => {
          doc.data();
        });
      });
  },

  handleOrder: function (t_num, dish) {
    database
      .firestore()
      .collection("tables")
      .doc(t_num)
      .get()
      .then((doc) => {
        var details = doc.data();
        var parent = details["current_orders"][dish.id];
        if (parent) {
          parent["quantity"] += 1;
          var currentQuantity = parent["quantity"];
          details["current_orders"][dish.id]["subtotal"] =
            dish.price * currentQuantity;
        } else {
          parent = {
            item: dish.dish_name,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1,
          };
        }
        details.total_bill += dish.price;
        firebase.firestore().collection("tables").doc(doc.id).update(parent);
      });
  },

  askTableNumber: async function () {
    var iconUrl =
      "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to Crown Plaza",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Enter your table number",
          type: number,
          min: 1,
        },
      },
      closeOnClickOutside: false,
    }).then((value) => {
      table_number = value;
    });
  },

  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("menu")
      .get()
      .then((data) => {
        console.log("getting data from menu");
        return data.docs.map((doc) => {
          doc.data();
        });
      });
  },

  handleMarkerFound: function (dishes, markerId) {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";
    var ratingButton = document.getElementById("rating-button");
    var orderButton = document.getElementById("order-button");
    ratingButton.addEventListener("click", () => {
      swal({
        icon: "success",
        title: "Rate Dish",
        text: "Have a nice day",
      });
    });

    orderButton.addEventListener("click", () => {
      swal({
        icon: "success",
        title: "Order Dish",
        text: "Thank you for ordering the dish :)",
      });
    });

    var dish = dishes.filter((dish) => {
      dish.id == markerId;
    })[0];

    var model = document.querySelector(`#model-${dish.id}`);
    model.setAttribute("position", dish.model_geometry.position);
    model.setAttribute("rotation", dish.model_geometry.rotation);
    model.setAttribute("scale", dish.model_geometry.scale);
  },

  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "null";
  },
});
