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
    ["Nutella With Fruit", 100, "7945-2"],
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
function add(id) {
  const p = products.find((x) => x.id === id),
    found = cart.find((x) => x.id === id);
  found ? found.qty++ : cart.push({ ...p, qty: 1 });
  save();
  showToast(p.name + " added to your cart ✦");
}
function alter(id, amount) {
  const item = cart.find((x) => x.id === id);
  item.qty += amount;
  if (item.qty < 1) cart = cart.filter((x) => x.id !== id);
  save();
}
function changeProductQuantity(id, amount) {
  const item = cart.find((x) => x.id === id);

  if (amount > 0) {
    add(id);
  } else if (item) {
    alter(id, amount);
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
  const lines = cart
    .map((x) => {
  const note =
    x.note && x.note.trim()
      ? "\n  Note: " + x.note.trim()
      : "";

  return "• " + x.name + " × " + x.qty + " = EGP " + x.qty * x.price + note;
})
    .join("\n");
  const total = cart.reduce((s, x) => s + x.qty * x.price, 0);
  window.open(
    "https://wa.me/201015078571?text=" +
      encodeURIComponent(
        "Hello Eskimo! I would like to order:\n" +
          lines +
          "\n\nTotal: EGP " +
          total +
          "\n==========================="+
          "\n \n Note => This Total Without Shipping Cost" +
          "\n Note => for instapay 01143572007 ===> 'Hassan', please send your transaction photo" +
          

          " \n * If we’re taking a little longer than usual to reply, we’re sorry for the wait,Please forward these message to our second WhatsApp number: 01033820470 "+


"\n * We’ll get back to you as soon as possible."+
"\n *Thank you for choosing Eskimo! ❄️"+
      
          "\nName : ",
      ),
    "_blank",
  );
  cart = [];
save();
closeCart();
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
window.checkout = checkout;
window.openCart = openCart;
window.closeCart = closeCart;
window.toggleMobileMenu = toggleMobileMenu;
window.clearCart = clearCart;
window.changeProductQuantity = changeProductQuantity;
window.toggleNote = toggleNote;
window.updateNote = updateNote;
window.closeNoteIfEmpty = closeNoteIfEmpty;
drawCart();
addFooterSocials();
