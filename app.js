const sourceGroups = {
  "Most Ordered": [
    ["Spanish Latte", 110, "7926-1"],
    ["Waffle Stick", 90, "7926-2"],
    ["Caramel Frappe", 110, "7926-3"],
    ["Latte", 90, "7926-4"],
  ],
  "Specialty Coffee": [
    ["Latte", 90, "7926-4"],
    ["Golden Mocha", 100, "7927-1"],
    ["Golden Caramel", 100, "7927-2"],
    ["Golden White", 100, "7927-3"],
    ["Pistachio Latte", 110, "7927-4"],
    ["Spanish Latte", 110, "7928-1"],
    ["Oreo Latte", 110, "7928-2"],
    ["Strawberry Coca", 100, "7928-3"],
    ["Coffee Frappe", 100, "7928-4"],
    ["Vanilla Frappe", 105, "7929-1"],
    ["Chocolate Frappe", 110, "7929-2"],
    ["Caramel Frappe", 110, "7929-3"],
    ["Hazelnut Latte", 100, "7929-4"],
    ["Popcorn Latte", 100, "7930-1"],
    ["Salted Caramel Latte", 110, "7930-2"],
    ["Pistachio Frappe", 120, "7930-3"],
  ],
  "Specialty Matcha": [
    ["Strawberry Matcha", 100, "7930-4"],
    ["Peach Matcha", 105, "7931-1"],
    ["Orange Matcha", 100, "7931-2"],
    ["Coconut Matcha", 100, "7931-3"],
    ["Mango Matcha", 110, "7931-4"],
    ["Caramel Matcha", 100, "7932-1"],
    ["Salted Caramel Matcha", 110, "7932-2"],
    ["Spanish Matcha", 110, "7932-3"],
    ["Frappe Matcha", 110, "7932-4"],
    ["Classic Matcha", 90, "7933-1"],
    ["Soda Matcha", 110, "7933-2"],
  ],
  "Fresh Juice": [
    ["Mango Juice", 75, "7933-3"],
    ["Strawberry Juice", 65, "7935-1"],
    ["Strawberry Milk Juice", 85, "7935-2"],
    ["Guava Juice", 65, "7935-3"],
    ["Guava Milk Juice", 85, "7935-4"],
    ["Dates Milk Juice", 85, "7936-1"],
    ["Banana Milk Juice", 70, "7936-2"],
    ["Watermelon Juice", 65, "7936-3"],
    ["Orange Juice", 60, "7936-4"],
    ["Peach Juice", 100, "7937-1"],
    ["Kiwi Juice", 110, "7937-2"],
    ["Lemon Mint", 50, "7937-3"],
    ["Green Apple Juice", 90, "7937-4"],
  ],
  Cocktail: [
    ["Frozen Wave", 100, "7938-1"],
    ["Ice Squash", 95, "7938-2"],
    ["White Eskimo", 110, "7938-3"],
    ["Summer Splash", 90, "7938-4"],
    ["Mango Kiwi", 105, "7939-1"],
    ["Eskimo Power", 150, "7939-2"],
    ["Mango Peach", 110, "7939-3"],
  ],
  Milkshake: [
    ["Mango Milkshake", 100, "7939-4"],
    ["Strawberry Milkshake", 100, "7940-1"],
    ["Pistachio Milkshake", 120, "7940-3"],
    ["Caramel Milkshake", 110, "7940-4"],
    ["Chocolate Milkshake", 100, "7941-1"],
    ["Flavour Milkshake", 100, "7941-2"],
    ["Lotus Milkshake", 110, "7941-3"],
    ["Oreo Milkshake", 110, "7941-4"],
  ],
  Smoothie: [
    ["Choose Your Flavour", 70, "7942-1"],
    ["Mango Smoothie", 85, "7942-2"],
    ["Strawberry Smoothie", 75, "7942-3"],
    ["Lemon Mint Smoothie", 60, "7942-4"],
    ["Watermelon Smoothie", 75, "7943-1"],
  ],
  Soda: [
    ["Blue Iced Soda", 80, "7943-2"],
    ["Green Apple Soda", 85, "7943-3"],
    ["Kiwi Soda", 90, "7943-4"],
    ["Roman Soda", 90, "7944-1"],
    ["Eskimo Energy", 150, "7944-2"],
    ["Orange Honey Lemon", 85, "7944-3"],
    ["Coconut Soda", 85, "7944-4"],
  ],
  Dessert: [
    ["Waffle Stick", 90, "7945-1"],
    ["Nutella Fruit Salad", 100, "7945-2"],
    ["Mochi", 70, "7945-3"],
  ],
};
const categories = Object.keys(sourceGroups);
const products = categories.flatMap((c) =>
  sourceGroups[c].map((x, i) => ({
    id: c + "-" + i,
    name: x[0],
    price: x[1],
    image: x[2],
    category: c,
  })),
);
let cart = JSON.parse(localStorage.getItem("eskimo-cart") || "[]");

const cartExpiresAfter = 6 * 60 * 60 * 1000;
const cartLastUpdate = Number(
  localStorage.getItem("eskimo-cart-last-update") || 0,
);

if (cart.length && Date.now() - cartLastUpdate > cartExpiresAfter) {
  cart = [];
  localStorage.removeItem("eskimo-cart");
  localStorage.removeItem("eskimo-cart-last-update");
}
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
function showToast(message) {
  let toast = $(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.eskimoToastTimer);
  window.eskimoToastTimer = setTimeout(
    () => toast.classList.remove("show"),
    2300,
  );
}
const milkOptions = [
  { name: "Full-Cream milk", price: 0 },
  { name: "Skimmed milk", price: 0 },
  { name: "Lactose-free milk", price: 20 },
  { name: "Oat milk", price: 25 },
];

const sugarOptions = [
  { name: "Normal sugar", price: 0 },
  { name: "Less sugar", price: 0 },
  { name: "No sugar", price: 0 },
  { name: "Diet sugar", price: 0 },
];

let customProduct = null;
let customGroups = [];
let customChoices = {};
let customQuantity = 1;
function isDessertProduct(product) {
  const name = product.name.toLowerCase();

  return (
    product.category === "Dessert" ||
    name === "waffle stick" ||
    name === "nutella with fruit" ||
    name === "mochi"
  );
}
function getCustomizationGroups(product) {
    const name = product.name.toLowerCase();
  const isDessert = isDessertProduct(product);

  const isMilkDrink =
    product.category === "Milkshake" ||
    product.category === "Specialty Coffee" ||
    (product.category === "Specialty Matcha" && !name.includes("soda")) ||
    /latte|mocha|frappe|milk juice/.test(name);

  const isCoffee =
    product.category === "Specialty Coffee" ||
    /latte|mocha|coffee|frappe/.test(name);

  const isMatcha =
    product.category === "Specialty Matcha" &&
    !name.includes("soda");

  const groups = [];
  if (name === "waffle stick") {
  groups.push({
    key: "sauce",
    title: "Choose your sauce",
    options: [
      { name: "No sauce", price: 0 },
      { name: "Chocolate sauce", price: 0 },
      { name: "Caramel sauce", price: 0 },
      { name: "White chocolate sauce", price: 0 },
      { name: "Pistachio sauce", price: 0 },

    ],
  });
}

if (name === "nutella with fruit") {
  groups.push({
    key: "nutella",
    title: "Nutella",
    options: [
      { name: "With Nutella", price: 0 },
      { name: "Without Nutella", price: 0 },
    ],
  });
}

  if (isMilkDrink) {
    groups.push({
      key: "milk",
      title: "Choose your milk",
      options: milkOptions,
    });
  }

 if (!isDessert)  {
    groups.push({
      key: "sugar",
      title: "Sugar",
      options: sugarOptions,
    });
  }

  if (isCoffee) {
    groups.push({
      key: "extras",
      title: "Extras",
      multiple: true,
      options: [
        { name: "Extra espresso shot", price: 35 },
        { name: "Vanilla ", price: 15 },
        { name: "Chocolate ", price: 15 },
        { name: "Caramel ", price: 15 },
        { name: "Pistachio ", price: 25 },

      ],
    });
  } else if (isMatcha) {
    groups.push({
      key: "extras",
      title: "Extras",
      multiple: true,
      options: [
        { name: "Extra matcha", price: 30 },
       
      ],
    });
  } else if (
    product.category === "Milkshake" ||
    product.category === "Smoothie"
  ) {
    groups.push({
      key: "extras",
      title: "Extras",
      multiple: true,
      options: [{ name: "matcha", price: 45 }], // Example extra for milkshakes and smoothies ana m3rfsh ehh momkn ykon feh, so I added matcha as an example
    });
  }

  return groups;
}

function openCustomize(id) {
  customProduct = products.find((x) => x.id === id);

  if (!customProduct) return;

  customGroups = getCustomizationGroups(customProduct);
  const dessertNoteGroup = document.querySelector("#dessert-note-group");
const dessertNote = document.querySelector("#customize-note");

dessertNoteGroup.hidden = !isDessertProduct(customProduct);
dessertNote.value = "";
  customChoices = { extras: [] };
  customQuantity = 1;

  customGroups.forEach((group) => {
    if (!group.multiple) {
      customChoices[group.key] = group.options[0];
    }
  });

  document.querySelector("#customize-title").textContent =
    customProduct.name;

  document.querySelector("#customize-layer").classList.add("open");

  drawCustomizeOptions();
}

function closeCustomize() {
  document.querySelector("#customize-layer").classList.remove("open");
}

function drawCustomizeOptions() {
  const target = document.querySelector("#customize-options");

  target.innerHTML = customGroups
    .map(
      (group) => `
        <div class="custom-group">
          <h3>${group.title}</h3>

          <div class="custom-options">
            ${group.options
              .map((option, index) => {
                const selected = group.multiple
                  ? customChoices.extras.some(
                      (x) => x.name === option.name,
                    )
                  : customChoices[group.key].name === option.name;

                return `
                  <button
                    class="custom-option ${selected ? "selected" : ""}"
                    onclick="${
                      group.multiple
                        ? `toggleCustomExtra(${index})`
                        : `selectCustomOption('${group.key}', ${index})`
                    }"
                  >
                    <span>${option.name}</span>
                    <small>${
                      option.price ? `+EGP ${option.price}` : "Free"
                    }</small>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      `,
    )
    .join("");

  const extraPrice = Object.values(customChoices)
    .flat()
    .reduce((total, option) => total + (option.price || 0), 0);

  document.querySelector("#customize-base-price").textContent =
    "Base price: EGP " + customProduct.price;

const unitPrice = customProduct.price + extraPrice;

document.querySelector("#customize-total").textContent =
  "EGP " + unitPrice * customQuantity;

document.querySelector("#customize-quantity").textContent =
  customQuantity;

document.querySelector("#customize-add-text").textContent =
  customQuantity === 1
    ? "Add to basket"
    : `Add ${customQuantity} to basket`;
}

function selectCustomOption(groupKey, optionIndex) {
  const group = customGroups.find((x) => x.key === groupKey);

  customChoices[groupKey] = group.options[optionIndex];

  drawCustomizeOptions();
}

function toggleCustomExtra(optionIndex) {
  const group = customGroups.find((x) => x.key === "extras");

  if (!group) return;

  const option = group.options[optionIndex];

  const exists = customChoices.extras.some(
    (x) => x.name === option.name,
  );

  customChoices.extras = exists
    ? customChoices.extras.filter((x) => x.name !== option.name)
    : [...customChoices.extras, option];

  drawCustomizeOptions();
}
function changeCustomizeQuantity(amount) {
  customQuantity += amount;

  if (customQuantity < 1) {
    customQuantity = 1;
  }

  drawCustomizeOptions();
}

function addCustomizedDrink() {
  const customNote = document.querySelector("#customize-note").value.trim();
  const customizations = customGroups
    .flatMap((group) =>
      group.multiple
        ? customChoices.extras
        : customChoices[group.key],
    )
    .filter(Boolean)
    .map((option) => option.name);

  const extraPrice = Object.values(customChoices)
    .flat()
    .reduce((total, option) => total + (option.price || 0), 0);

  const customizationKey = customizations.join("|") + "|" + customNote;

  const found = cart.find(
    (item) =>
      item.productId === customProduct.id &&
      item.customizationKey === customizationKey,
  );

  if (found) {
    found.qty += customQuantity;
  } else {
    cart.push({
      ...customProduct,
      id: customProduct.id + "-" + Date.now(),
      productId: customProduct.id,
      price: customProduct.price + extraPrice,
      qty: customQuantity,
      customizations,
      customizationKey,
      customNote,
    });
  }

  save();
  closeCustomize();
  showToast(customProduct.name + " added to your cart ✦");
}

function add(id) {
  openCustomize(id);
}

function alter(id, amount) {
  const item = cart.find((x) => x.id === id);

  if (!item) return;

  item.qty += amount;

  if (item.qty < 1) {
    cart = cart.filter((x) => x.id !== id);
  }

  save();
}

function changeProductQuantity(id, amount) {
  const matchingItems = cart.filter(
    (x) => x.productId === id || x.id === id,
  );

  if (amount > 0) {
    openCustomize(id);
  } else if (matchingItems.length) {
    alter(matchingItems[matchingItems.length - 1].id, -1);
  }
}
function clearCart() {
  if (!cart.length) {
    showToast("Your cart is already empty.");
    return;
  }

  cart = [];
  save();
  showToast("Your cart has been cleared.");
}
function save() {
  localStorage.setItem("eskimo-cart", JSON.stringify(cart));
  localStorage.setItem("eskimo-cart-last-update", Date.now());

  drawCart();
  document.dispatchEvent(new Event("eskimo-cart-change"));
}
function toggleNote(id) {
  const noteBox = document.querySelector(`[data-note="${id}"]`);

  if (!noteBox) return;

  noteBox.classList.toggle("show");

  if (noteBox.classList.contains("show")) {
    noteBox.focus();
  }
}

function updateNote(id, value) {
  const item = cart.find((x) => x.id === id);

  if (!item) return;

  item.note = value;
  localStorage.setItem("eskimo-cart", JSON.stringify(cart));
}
function closeNoteIfEmpty(id, value) {
  const noteBox = document.querySelector(`[data-note="${id}"]`);

  if (noteBox && !value.trim()) {
    noteBox.classList.remove("show");
  }
}
function drawCart() {
  const count = cart.reduce((s, x) => s + x.qty, 0),
    total = cart.reduce((s, x) => s + x.qty * x.price, 0);
  $$("[data-count]").forEach((x) => (x.textContent = count));
  const target = $("[data-cart-items]");
  if (!target) return;
  target.innerHTML = cart.length
    ? cart
        .map(
          (x) =>
            `<div class="cart-item">
  <span class="mini">❄</span>

  <div class="cart-info">
    <div class="cart-item-main">
      <div>
        <b>${x.name}</b>
        <small>EGP ${x.price}</small>
        ${x.customizations?.length ? `<small class="cart-customizations">${x.customizations.join(" • ")}</small>` : ""}
        ${x.customNote ? `<small class="cart-dessert-note">Note: ${x.customNote}</small>` : ""}
      </div>

      <div class="qty">
        <button onclick="alter('${x.id}',-1)">−</button>
        <b>${x.qty}</b>
        <button onclick="alter('${x.id}',1)">+</button>
      </div>
    </div>

    <button class="note-button" onclick="toggleNote('${x.id}')">
      + Add a note
    </button>

    <textarea
  class="item-note ${x.note ? "show" : ""}"
  data-note="${x.id}"
  oninput="updateNote('${x.id}', this.value)"
  onblur="closeNoteIfEmpty('${x.id}', this.value)"
  placeholder="Example: feel free to add any special requests or notes..."
>${x.note || ""}</textarea>
  </div>
</div>`,
        )
        .join("")
    : '<p class="cart-empty">Your cart is waiting for a little Eskimo magic.</p>';
  $("[data-total]").textContent = "EGP " + total;
}

function checkout() {
  if (!cart.length) {
    showToast("Your cart is still empty.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  let layer = document.querySelector(".checkout-layer");

  if (!layer) {
    layer = document.createElement("div");
    layer.className = "checkout-layer";

    layer.innerHTML = `
      <div class="checkout-back" onclick="closeCheckout()"></div>

      <section class="checkout-panel">
        <button class="checkout-close" type="button" onclick="closeCheckout()">×</button>

        <p class="eyebrow">ALMOST THERE</p>
        <h2>Complete your order.</h2>

        <p class="checkout-total">
          Order total
          <strong data-checkout-total></strong>
        </p>

        <label for="customer-name">Your name</label>
        <input id="customer-name" type="text" placeholder="Name" />

        <label for="customer-phone">Phone number</label>
        <input id="customer-phone" type="tel" placeholder="01xxxxxxxxx" />

        <p class="checkout-label">Payment method</p>

        <div class="payment-choice">
          <label>
            <input
  type="radio"
  name="payment-method"
  value="Cash"
  checked
  onchange="toggleInstaPayMessage()"
/>
            Cash
          </label>

          <label>
            <input
  type="radio"
  name="payment-method"
  value="InstaPay"
  onchange="toggleInstaPayMessage()"
/>
            InstaPay
          </label>
        </div>
        <p class="instapay-message" id="instapay-message">
  Please send a screenshot of your InstaPay transaction to our WhatsApp so we can confirm your payment.
</p>

        <label for="order-note">
          Order note <span>(optional)</span>
        </label>

        <textarea
          id="order-note"
          placeholder="Any general notes for your order?"
        ></textarea>

        <button class="submit-order" type="button" onclick="submitOrder()">
          Send order
        </button>
      </section>
    `;

    document.body.appendChild(layer);
  }

  layer.querySelector("[data-checkout-total]").textContent = `EGP ${total}`;
  layer.classList.add("open");
}

function closeCheckout() {
  const layer = document.querySelector(".checkout-layer");

  if (layer) {
    layer.classList.remove("open");
  }
}
function toggleInstaPayMessage() {
  const selectedPayment = document.querySelector(
    'input[name="payment-method"]:checked'
  ).value;

  const message = document.getElementById("instapay-message");

  if (selectedPayment === "InstaPay") {
    message.classList.add("show");
  } else {
    message.classList.remove("show");
  }
}
function resetCheckoutForm() {
  const name = document.getElementById("customer-name");
  const phone = document.getElementById("customer-phone");
  const note = document.getElementById("order-note");

  if (name) {
    name.value = "";
  }

  if (phone) {
    phone.value = "";
  }

  if (note) {
    note.value = "";
  }

  const cash = document.querySelector(
    'input[name="payment-method"][value="Cash"]'
  );

  if (cash) {
    cash.checked = true;
  }

  const instaPayMessage = document.getElementById(
    "instapay-message"
  );

  if (instaPayMessage) {
    instaPayMessage.classList.remove("show");
  }
}

async function submitOrder() {
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const notes = document.getElementById("order-note").value.trim();

  const paymentMethod = document.querySelector(
    'input[name="payment-method"]:checked'
  ).value;

  const button = document.querySelector(".submit-order");

  if (!name || !phone) {
    showToast("Please enter your name and phone number.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  button.disabled = true;
  button.textContent = "Sending order…";

  try {
    const order = await window.eskimoDb.collection("orders").add({
      customerName: name,
      customerPhone: phone,
      notes: notes,
      paymentMethod: paymentMethod,
      status: "New",
      total: total,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),

      items: cart.map((item) => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        customizations: (item.customizations || []).join(" • "),
        note: [item.customNote, item.note].filter(Boolean).join(" | "),
      })),
    });

    cart = [];
    save();
    resetCheckoutForm();
    closeCheckout();
    closeCart();

    showToast(`Order sent! #${order.id.slice(-6).toUpperCase()}`);
  } catch (error) {
    showToast("Could not send the order. Please try again.");
  } finally {
    button.disabled = false;
    button.textContent = "Send order";
  }
}
function openCart() {
  const panel = $(".cart-layer");
  if (panel) panel.classList.add("open");
}
function closeCart() {
  const panel = $(".cart-layer");
  if (panel) panel.classList.remove("open");
}
function toggleMobileMenu() {
  const links = $(".nav-links");
  const button = $(".menu-toggle");

  if (!links || !button) return;

  const isOpen = links.classList.toggle("open");

  button.classList.toggle("open", isOpen);
  button.setAttribute("aria-expanded", isOpen);
}
function toggleRoleMenu(event) {
  event.stopPropagation();

  const roleSwitch = document.querySelector(".role-switch");

  if (roleSwitch) {
    roleSwitch.classList.toggle("open");
  }
}

document.addEventListener("click", (event) => {
  const roleSwitch = document.querySelector(".role-switch");

  if (roleSwitch && !roleSwitch.contains(event.target)) {
    roleSwitch.classList.remove("open");
  }
});
document.addEventListener("click", (e) => {
  const cartLayer = $(".cart-layer");
  const cartPanel = $(".cart-panel");
  const cartButton = e.target.closest(".cart-trigger");

  if (
    cartLayer.classList.contains("open") &&
    !cartPanel.contains(e.target) &&
    !cartButton
  ) {
    closeCart();
  }

  const navLinks = $(".nav-links");
  const menuButton = $(".menu-toggle");

  if (
    navLinks.classList.contains("open") &&
    !navLinks.contains(e.target) &&
    !menuButton.contains(e.target)
  ) {
    navLinks.classList.remove("open");
    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});
function addFooterSocials() {
  const footer = $(".footer");
  if (footer && !footer.querySelector(".footer-socials"))
    footer.insertAdjacentHTML(
      "beforeend",
      '<div class="socials footer-socials"><a href="https://www.instagram.com/eskimo_egypt?stkn=MXBuZXh6NW51bWdiZQ==" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.tiktok.com/@eskimo_egypt?_r=1&_t=ZS-9A5vuHpktfg" target="_blank" rel="noreferrer">TikTok</a><a href="https://www.facebook.com/share/1JY94aouYs/?mibextid=wwXIfr" target="_blank" rel="noreferrer">Facebook</a></div>',
    );
}
window.add = add;
window.alter = alter;
window.openCustomize = openCustomize;
window.closeCustomize = closeCustomize;
window.selectCustomOption = selectCustomOption;
window.toggleCustomExtra = toggleCustomExtra;
window.addCustomizedDrink = addCustomizedDrink;
window.checkout = checkout;
window.openCart = openCart;
window.closeCart = closeCart;
window.toggleMobileMenu = toggleMobileMenu;
window.clearCart = clearCart;
window.changeProductQuantity = changeProductQuantity;
window.toggleNote = toggleNote;
window.updateNote = updateNote;
window.closeNoteIfEmpty = closeNoteIfEmpty;
window.toggleRoleMenu = toggleRoleMenu;
window.changeCustomizeQuantity = changeCustomizeQuantity;
drawCart();
addFooterSocials();
