const loginCard = document.getElementById("login-card");
const dashboard = document.getElementById("dashboard");
const loginError = document.getElementById("login-error");
const loginButton = document.getElementById("login-button");
const ordersState = document.getElementById("orders-state");
const ordersList = document.getElementById("orders-list");
const OWNER_USERNAME = "eskimo-owner";
const OWNER_EMAIL = "aishaahmedelhussiny@gmail.com";

let stopOrdersListener = null;
let isFirstOrdersLoad = true;
let orderAudioContext = null;


function escapeHTML(value = "") {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return String(value).replace(
    /[&<>"']/g,
    (character) => characters[character],
  );
}

function formatDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") {
    return "Just now";
  }

  return timestamp.toDate().toLocaleString("en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
async function enableOrderAlerts() {
  const AudioContext =
    window.AudioContext || window.webkitAudioContext;

  if (AudioContext && !orderAudioContext) {
    orderAudioContext = new AudioContext();
  }

  if (
    orderAudioContext &&
    orderAudioContext.state === "suspended"
  ) {
    await orderAudioContext.resume();
  }

  if (
    "Notification" in window &&
    Notification.permission === "default"
  ) {
    await Notification.requestPermission();
  }

  playNewOrderSound();

  const button = document.getElementById("sound-button");

  if (button) {
    button.textContent = "Sound enabled";
  }
}

function playNewOrderSound() {
  if (!orderAudioContext) {
    return;
  }

  [0, 0.18, 0.36].forEach((delay) => {
    const sound = orderAudioContext.createOscillator();
    const volume = orderAudioContext.createGain();

    sound.frequency.value = 900;
    volume.gain.setValueAtTime(
      0.4,
      orderAudioContext.currentTime + delay
    );

    volume.gain.exponentialRampToValueAtTime(
      0.001,
      orderAudioContext.currentTime + delay + 0.18
    );

    sound.connect(volume);
    volume.connect(orderAudioContext.destination);

    sound.start(orderAudioContext.currentTime + delay);
    sound.stop(orderAudioContext.currentTime + delay + 0.18);
  });
}

function showNewOrderAlert(order) {
  try {
    playNewOrderSound();
  } catch (error) {
    console.warn("Sound alert failed.", error);
  }

  try {
    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("New Eskimo order ☕", {
        body: `${order.customerName || "Customer"} — ${
          Number(order.total) || 0
        } EGP`,
        icon: "assets/favicon.png",
      });
    }
  } catch (error) {
    console.warn("Notification alert failed.", error);
  }
}
function renderOrder(id, order) {
  const statuses = ["New", "Preparing", "Ready", "Completed", "Cancelled"];

  const items = Array.isArray(order.items) ? order.items : [];

  const customerTotal = Number(order.total) || 0;

  const hasFinalTotal =
    order.finalTotal !== null &&
    order.finalTotal !== undefined &&
    order.finalTotal !== "" &&
    Number.isFinite(Number(order.finalTotal));

  const finalTotal = hasFinalTotal
    ? Number(order.finalTotal)
    : "";

  const hasOwnerNote = Boolean(String(order.ownerNote || "").trim());

  const ownerSummary =
    hasFinalTotal || hasOwnerNote
      ? `
       <div class="owner-summary">
  <div class="owner-summary-head">
    <p class="owner-summary-title">Owner update</p>

    <button
      class="delete-owner-update"
      type="button"
      onclick="deleteOwnerUpdate('${id}')"
    >
      Delete
    </button>
  </div>

          ${
            hasFinalTotal
              ? `<p><strong>Final total:</strong> ${finalTotal.toFixed(0)} EGP</p>`
              : ""
          }

          ${
            hasOwnerNote
              ? `<p><strong>Note:</strong> ${escapeHTML(
                  order.ownerNote
                ).replace(/\n/g, "<br>")}</p>`
              : ""
          }
        </div>
      `
      : "";

  const itemLines = items
    .map((item) => {
      const details = [
        item.customizations,
        item.note ? `Note: ${item.note}` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      const lineTotal =
        (Number(item.price) || 0) * (Number(item.quantity) || 1);

      return `
        <li>
          <span>
            <strong>${escapeHTML(item.quantity || 1)}× ${escapeHTML(item.name)}</strong>
            ${
              details
                ? `<span class="item-meta">${escapeHTML(details)}</span>`
                : ""
            }
          </span>

          <strong>${lineTotal.toFixed(0)} EGP</strong>
        </li>
      `;
    })
    .join("");

  const options = statuses
    .map(
      (status) =>
        `<option value="${status}" ${
          order.status === status ? "selected" : ""
        }>${status}</option>`
    )
    .join("");

  return `
    <article class="order-card">
      <div class="order-top">
        <div>
          <p class="order-id">ORDER #${escapeHTML(id.slice(-6).toUpperCase())}</p>
          <h2>${escapeHTML(order.customerName || "Customer")}</h2>
          <p class="order-contact">${escapeHTML(order.customerPhone || "No phone")}</p>
          <p class="order-date">${formatDate(order.createdAt)}</p>
        </div>

        <p class="order-payment">
          Payment: <strong>${escapeHTML(order.paymentMethod || "Cash")}</strong>
        </p>
      </div>

      <ul class="order-items">
        ${itemLines || "<li>No items found</li>"}
      </ul>

      ${
        order.notes
          ? `<p class="order-note"><strong>Customer note:</strong> ${escapeHTML(
              order.notes
            )}</p>`
          : ""
      }

      <div class="order-bottom">
        <p class="order-total">
          Total: ${customerTotal.toFixed(0)} EGP
        </p>

    <div class="order-actions">
  <button
    class="edit-order-button"
    id="edit-button-${id}"
    type="button"
    onclick="toggleOrderEditor('${id}')"
  >
    Edit order
  </button>

  <select
    class="status-select"
    aria-label="Order status"
    onchange="setOrderStatus('${id}', this.value)"
  >
    ${options}
  </select>

  <button
    class="delete-order-button"
    type="button"
    onclick="deleteOrder('${id}')"
  >
    Delete order
  </button>
</div>
      </div>

      ${ownerSummary}

      <div class="owner-update" id="owner-update-${id}">
        <input
          id="saved-owner-note-${id}"
          type="hidden"
          value="${escapeHTML(order.ownerNote || "")}"
        />

        <label for="owner-note-${id}">
          Add owner note <span>(private)</span>
        </label>

        <textarea
          id="owner-note-${id}"
          placeholder="Example: Added an extra shot by phone."
        ></textarea>

        <label for="final-total-${id}">
          New final total <span>(only if the price changed)</span>
        </label>

        <p class="final-total-hint">
          Leave it empty if you only want to add a note.
        </p>

        <input
          id="final-total-${id}"
          type="number"
          min="0"
          step="1"
          placeholder="${hasFinalTotal ? finalTotal : customerTotal}"
        />

        <button
          class="save-owner-change"
          type="button"
          onclick="saveOwnerChanges('${id}')"
        >
          Save changes
        </button>

        <p class="owner-feedback" id="owner-feedback-${id}"></p>
      </div>
    </article>
  `;
}

function listenToOrders() {
  if (stopOrdersListener) {
    stopOrdersListener();
  }

  isFirstOrdersLoad = true;

  ordersState.textContent = "Loading orders…";
  ordersState.hidden = false;

  stopOrdersListener = window.eskimoDb
    .collection("orders")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        const newOrders = !isFirstOrdersLoad
          ? snapshot.docChanges()
              .filter((change) => change.type === "added")
              .map((change) => change.doc.data())
          : [];

        if (snapshot.empty) {
          ordersList.innerHTML = "";
          ordersState.textContent = "No orders yet.";
          ordersState.hidden = false;
          isFirstOrdersLoad = false;
          return;
        }

        ordersList.innerHTML = snapshot.docs
          .map((doc) => renderOrder(doc.id, doc.data()))
          .join("");

        ordersState.hidden = true;
        isFirstOrdersLoad = false;

        newOrders.forEach((order) => {
          setTimeout(() => {
            showNewOrderAlert(order);
          }, 0);
        });
      },
      (error) => {
        ordersState.textContent =
          `Could not load orders: ${error.message}`;

        ordersState.hidden = false;
      }
    );
}

async function ownerLogin() {
  const username = document
    .getElementById("owner-username")
    .value.trim()
    .toLowerCase();

  const password = document.getElementById("owner-password").value;

  loginError.textContent = "";

  if (!username || !password) {
    loginError.textContent = "Enter your username and password.";
    return;
  }

  if (username !== OWNER_USERNAME) {
    loginError.textContent = "Username or password is not correct.";
    return;
  }

  enableOrderAlerts();

  loginButton.disabled = true;
  loginButton.textContent = "Signing in…";

  try {
    await window.eskimoAuth.setPersistence(
      firebase.auth.Auth.Persistence.SESSION
    );

    await window.eskimoAuth.signInWithEmailAndPassword(
      OWNER_EMAIL,
      password
    );
  } catch (error) {
    loginError.textContent = "Username or password is not correct.";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign in";
  }
}

async function ownerLogout() {
  await window.eskimoAuth.signOut();
}

async function setOrderStatus(orderId, status) {
  try {
    await window.eskimoDb
      .collection("orders")
      .doc(orderId)
      .update({
        status: status,
      });
  } catch (error) {
    alert("Could not update this order. Please try again.");
  }
}
async function saveOwnerChanges(orderId) {
  const newNote = document
    .getElementById(`owner-note-${orderId}`)
    .value.trim();

  const finalTotalInput = document
    .getElementById(`final-total-${orderId}`)
    .value.trim();

  const previousNote = document
    .getElementById(`saved-owner-note-${orderId}`)
    .value.trim();

  const feedback = document.getElementById(
    `owner-feedback-${orderId}`
  );

  if (!newNote && finalTotalInput === "") {
    feedback.textContent = "Write a note or a new final total.";
    return;
  }

  const updateData = {};

  if (newNote) {
    updateData.ownerNote = previousNote
      ? `${previousNote}\n${newNote}`
      : newNote;
  }

  if (finalTotalInput !== "") {
    const finalTotal = Number(finalTotalInput);

    if (!Number.isFinite(finalTotal) || finalTotal < 0) {
      feedback.textContent = "Write a valid final total.";
      return;
    }

    updateData.finalTotal = finalTotal;
  }

  try {
    await window.eskimoDb
      .collection("orders")
      .doc(orderId)
      .update(updateData);

    document
      .getElementById(`owner-update-${orderId}`)
      .classList.remove("open");

    document.getElementById(
      `edit-button-${orderId}`
    ).textContent = "Edit order";
  } catch (error) {
    feedback.textContent = "Could not save changes.";
  }
}
async function deleteOwnerUpdate(orderId) {
  const confirmed = confirm(
    "Delete this owner update? The original order will stay unchanged."
  );

  if (!confirmed) {
    return;
  }

  try {
    await window.eskimoDb.collection("orders").doc(orderId).update({
      ownerNote: firebase.firestore.FieldValue.delete(),
      finalTotal: firebase.firestore.FieldValue.delete(),
    });
  } catch (error) {
    alert("Could not delete this update. Please try again.");
  }
}
async function deleteOrder(orderId) {
  const confirmed = confirm(
    "Delete this order permanently? This cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  try {
    await window.eskimoDb
      .collection("orders")
      .doc(orderId)
      .delete();
  } catch (error) {
    alert("Could not delete this order. Please try again.");
  }
}
function toggleOrderEditor(orderId) {
  const editor = document.getElementById(`owner-update-${orderId}`);
  const button = document.getElementById(`edit-button-${orderId}`);

  const isOpen = editor.classList.toggle("open");

  button.textContent = isOpen ? "Close editor" : "Edit order";
}
async function sendPasswordReset() {
 const email = OWNER_EMAIL;

  if (!email) {
    loginError.textContent = "Write your email first.";
    return;
  }

  try {
    await window.eskimoAuth.sendPasswordResetEmail(email);

    loginError.style.color = "#003d32";
    loginError.textContent =
      "Reset link sent. Check your inbox and spam folder.";
  } catch (error) {
  loginError.style.color = "#bd3e2a";
  loginError.textContent =
    error.code + " — " + error.message;
}
}

window.ownerLogin = ownerLogin;
window.ownerLogout = ownerLogout;
window.setOrderStatus = setOrderStatus;
window.sendPasswordReset = sendPasswordReset;
window.saveOwnerChanges = saveOwnerChanges;
window.toggleOrderEditor = toggleOrderEditor;
window.deleteOwnerUpdate = deleteOwnerUpdate;
window.deleteOrder = deleteOrder;
window.enableOrderAlerts = enableOrderAlerts;

window.eskimoAuth.onAuthStateChanged(async (user) => {
  if (!user) {
    if (stopOrdersListener) {
      stopOrdersListener();
    }

    stopOrdersListener = null;

    dashboard.classList.add("hidden");
    loginCard.classList.remove("hidden");

    return;
  }

  if (user.uid !== window.ESKIMO_OWNER_UID) {
    loginError.textContent =
      "This account does not have owner access.";

    await window.eskimoAuth.signOut();
    return;
  }



  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");

  listenToOrders();
});