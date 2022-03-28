AFRAME.registerComponent("handleMarker", {
  init: async function () {
    var dishes = await this.getDishes();
    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(dishes, markerId);
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
});
