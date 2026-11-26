/* ==========================================================
   CSE326 Project | Section K3P26VA | Team 18: Code Crew
   Project: Coworking Space Management
   PART 3 of 3: JavaScript  (script.js, linked at the end of index.html)

   WHAT THIS FILE DOES
   1.  Data            : spaces, users and bookings stored as objects in arrays
   2.  Helper functions: dates, money, messages, toast
   3.  Role-based view : guest / member / staff / admin see different parts
   4.  Spaces          : cards, search and filter, admin add / edit / delete
   5.  Booking         : availability check, validation, cost estimate
   6.  Bookings table  : edit (prompt) and cancel (confirm)
   7.  Dashboard and report numbers
   8.  Login, register, contact, notifications, mobile menu
   9.  Start-up

   DEMO LOGINS (the data lives in memory, so a page refresh resets it)
     Member : riya@cospace.example   / Riya@1234   (owns booking CS-0001)
     Staff  : staff@cospace.example  / Staff@123
     Admin  : admin@cospace.example  / Admin@123
   Registering as staff or admin asks for an access code (prompt box):
     CODECREW18

   Concepts from the lectures that are used here:
   let / const, template literals, if / else, switch, for, while,
   break, continue, for...in, arrays (push, filter, map, forEach, splice,
   indexOf), object constructors with this, arrow functions,
   try / catch / finally, alert / confirm / prompt, getElementById.
   ========================================================== */


/* ---------- 1. DATA ---------- */

const STAFF_CODE = "CODECREW18";   // needed to register as staff or admin
const SHOW_DEMO_HINT = true;       // set to false to hide demo logins on the login card

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Sample add-on fees (Rs.), keys match the checkbox values in the booking form
const ADDON_PRICES = { Projector: 150, Whiteboard: 50, Refreshments: 100, Parking: 80 };

// Information that depends on the space type
const TYPE_INFO = {
  "hot-desk": {
    group: "Desk", unit: "per day", people: "seats", css: "type-desk",
    image: "images/hot-desk.jpeg", alt: "Row of hot desks with monitors in a shared area"
  },
  "dedicated-desk": {
    group: "Desk", unit: "per month", people: "desks", css: "type-desk",
    image: "images/dedicated-desk.jpeg", alt: "Two dedicated desks, each with a monitor and a plant"
  },
  "meeting-room": {
    group: "Room", unit: "per hour", people: "people", css: "type-room",
    image: "images/meeting-room.jpeg", alt: "Meeting room with a long table, chairs and a whiteboard"
  },
  "private-office": {
    group: "Room", unit: "per month", people: "people", css: "type-room",
    image: "images/private-office.jpeg", alt: "Private office with a desk, a large window and a plant"
  }
};

// Object constructor for a space (key doubles as the id used in the HTML)
function Space(key, name, type, capacity, price, status, inUse, description) {
  this.key = key;
  this.name = name;
  this.type = type;
  this.capacity = capacity;
  this.price = price;
  this.oldPrice = null;            // shown struck through when set
  this.status = status;            // "available" or "maintenance"
  this.inUse = inUse;              // members already using it right now
  this.description = description;  // trusted HTML text
  this.monthBookings = 0;          // numbers for the monthly report
  this.monthRevenue = 0;

  this.isBookable = function () {
    return this.status === "available";
  };
  this.isDesk = function () {
    return this.type === "hot-desk" || this.type === "dedicated-desk";
  };
}

// Object constructor for a booking
function Booking(id, name, email, spaceKey, date, start, end, status, amount, people, isNew) {
  this.id = id;
  this.name = name;
  this.email = email;        // owner of the booking
  this.spaceKey = spaceKey;
  this.date = date;          // "YYYY-MM-DD"
  this.start = start;        // "HH:MM"
  this.end = end;
  this.status = status;      // "Pending", "Confirmed" or "Cancelled"
  this.amount = amount;
  this.people = people;
  this.isNew = isNew;        // true when made during this session

  this.isActive = function () {
    return this.status !== "Cancelled";
  };
}

const spaces = [];
const hotDesk = new Space("hot-desk", "Hot Desk", "hot-desk", 30, 400, "available", 23,
  "Pick any free desk in the shared area. Wi-Fi and tea included.");
hotDesk.monthBookings = 48;
hotDesk.monthRevenue = 19200;

const dedicatedDesk = new Space("dedicated-desk", "Dedicated Desk", "dedicated-desk", 20, 6500, "available", 17,
  "Your own desk and lockable storage, available any time the centre is open.");
dedicatedDesk.monthBookings = 20;
dedicatedDesk.monthRevenue = 130000;

const meetingRoom = new Space("meeting-room", "Meeting Room", "meeting-room", 10, 600, "available", 3,
  "A 250 ft<sup>2</sup> room with a whiteboard and projector for up to 10 people.");
meetingRoom.monthBookings = 36;
meetingRoom.monthRevenue = 21600;

const privateOffice = new Space("private-office", "Private Office", "private-office", 4, 18000, "maintenance", 0,
  "A lockable 120 ft<sup>2</sup> office for a small team of up to 4 people.");
privateOffice.oldPrice = 20000;
privateOffice.monthBookings = 3;
privateOffice.monthRevenue = 54000;

spaces.push(hotDesk, dedicatedDesk, meetingRoom, privateOffice);

const users = [
  { name: "Riya Sharma", email: "riya@cospace.example", phone: "9876543210", password: "Riya@1234", role: "member" },
  { name: "Staff Desk", email: "staff@cospace.example", phone: "9876500001", password: "Staff@123", role: "staff" },
  { name: "Admin", email: "admin@cospace.example", phone: "9876500002", password: "Admin@123", role: "admin" }
];

const bookings = [
  new Booking("CS-0001", "Riya Sharma", "riya@cospace.example", "hot-desk", "2026-11-24", "09:00", "18:00", "Confirmed", 400, 1, false),
  new Booking("CS-0002", "Karan Mehta", "karan@example.com", "meeting-room", "2026-11-24", "14:00", "16:00", "Pending", 1200, 4, false),
  new Booking("CS-0003", "Simran Kaur", "simran@example.com", "dedicated-desk", "2026-11-25", "09:00", "18:00", "Confirmed", 6500, 1, false),
  new Booking("CS-0004", "Arjun Verma", "arjun@example.com", "private-office", "2026-11-26", "10:00", "17:00", "Pending", 18000, 3, false),
  new Booking("CS-0005", "Neha Gupta", "neha@example.com", "hot-desk", "2026-11-26", "09:00", "13:00", "Cancelled", 400, 1, false),
  new Booking("CS-0006", "Harpreet Singh", "harpreet@example.com", "meeting-room", "2026-11-27", "11:00", "12:00", "Confirmed", 600, 2, false)
];

let currentUser = null;   // null means guest
let toastTimer = null;


/* ---------- 2. HELPER FUNCTIONS ---------- */

// Short name for document.getElementById
const byId = (id) => document.getElementById(id);

// Escape text before it is put into HTML, so typed text can never become HTML
function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function two(n) {
  return n < 10 ? "0" + n : "" + n;
}

function todayString() {
  const d = new Date();
  return d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate());
}

function nowTimeString() {
  const d = new Date();
  return two(d.getHours()) + ":" + two(d.getMinutes());
}

// "2026-11-24" becomes "24 Nov 2026"
function formatDate(text) {
  const parts = text.split("-");
  return Number(parts[2]) + " " + MONTHS[Number(parts[1]) - 1] + " " + parts[0];
}

function money(n) {
  return Number(n).toLocaleString("en-IN");
}

function toMinutes(time) {
  const parts = time.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Show a message under a form. Red box when isError is true.
function showMessage(id, text, isError) {
  const box = byId(id);
  box.textContent = text;
  box.className = isError ? "message error" : "message";
}

// Short pop-up message in the corner of the screen
function showToast(text, isError) {
  const toast = byId("toast");
  toast.textContent = text;
  toast.className = isError ? "message error" : "message";
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.hidden = true;
  }, 3500);
}

// Add a line at the top of the notifications list
function addNotification(text) {
  const list = byId("notification-list");
  list.innerHTML =
    `<li>${esc(text)} <button type="button" aria-label="Dismiss notification">&#10006;</button></li>` +
    list.innerHTML;
}

// Return the value of the checked radio button from a list of ids
function radioValue(ids) {
  for (let i = 0; i < ids.length; i++) {
    if (byId(ids[i]).checked) {
      return byId(ids[i]).value;
    }
  }
  return "";
}

// Return the values of all ticked checkboxes from a list of ids
function checkedValues(ids) {
  return ids.filter((id) => byId(id).checked).map((id) => byId(id).value);
}

function getSpace(key) {
  for (let i = 0; i < spaces.length; i++) {
    if (spaces[i].key === key) {
      return spaces[i];
    }
  }
  return null;
}

function spaceName(key) {
  const space = getSpace(key);
  return space ? space.name : key;
}

function findBooking(id) {
  return bookings.filter((b) => b.id === id)[0];
}

function findUser(email) {
  return users.filter((u) => u.email === email)[0];
}

// Next free booking id such as CS-0007
function nextBookingId() {
  let highest = 0;
  bookings.forEach(function (b) {
    const number = Number(b.id.substring(3));
    if (number > highest) {
      highest = number;
    }
  });
  let digits = String(highest + 1);
  while (digits.length < 4) {
    digits = "0" + digits;
  }
  return "CS-" + digits;
}

// Bookings the current person is allowed to see
function visibleBookings() {
  if (currentUser && currentUser.role === "member") {
    return bookings.filter((b) => b.email === currentUser.email);
  }
  return bookings;
}

// Turn a space name into an id like "quiet-pod" that is not used yet
function makeKey(name) {
  let key = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (key === "") {
    key = "space";
  }
  let candidate = key;
  let counter = 2;
  while (getSpace(candidate) !== null || byId("space-" + candidate) !== null) {
    candidate = key + "-" + counter;
    counter++;
  }
  return candidate;
}


/* ---------- 3. ROLE-BASED VIEW ---------- */

// Show or hide every element that has the given class
function setVisible(className, show) {
  const items = document.getElementsByClassName(className);
  for (let i = 0; i < items.length; i++) {
    items[i].hidden = !show;
    // Sections are followed by an <hr>; hide that line too
    const next = items[i].nextElementSibling;
    if (items[i].tagName === "SECTION" && next && next.tagName === "HR") {
      next.hidden = !show;
    }
  }
}

function applyRole() {
  const role = currentUser ? currentUser.role : "guest";
  const loggedIn = currentUser !== null;

  setVisible("role-guest", !loggedIn);
  setVisible("role-member", loggedIn);          // booking form and bookings table
  setVisible("role-admin", role === "admin");   // manage spaces and reports

  // Menu links and the login / logout button
  const links = byId("menu-list").getElementsByTagName("a");
  for (let i = 0; i < links.length; i++) {
    const href = links[i].getAttribute("href");
    if (href === "#book" || href === "#bookings") {
      links[i].parentNode.hidden = !loggedIn;
    } else if (href === "#reports") {
      links[i].parentNode.hidden = role !== "admin";
    } else if (href === "#account") {
      links[i].textContent = loggedIn ? "Logout" : "Login / Register";
    }
  }

  byId("current-role").textContent = loggedIn
    ? capitalise(role) + " (" + currentUser.name + ")"
    : "Guest";

  if (!loggedIn && SHOW_DEMO_HINT) {
    showMessage("login-message",
      "Demo logins: member riya@cospace.example / Riya@1234, " +
      "staff staff@cospace.example / Staff@123, " +
      "admin admin@cospace.example / Admin@123", false);
  }
}

function loginUser(user) {
  currentUser = user;
  applyRole();
  fillBookingForm();
  refreshBookings();
}

function logoutUser() {
  currentUser = null;
  applyRole();
  refreshBookings();
  window.location.hash = "home";
  showToast("You have been logged out.");
}


/* ---------- 4. SPACES: CARDS, SEARCH, ADMIN ---------- */

function priceHtml(space) {
  let text = "Rs. " + money(space.price);
  if (space.oldPrice !== null) {
    text = "<del>Rs. " + money(space.oldPrice) + "</del> <ins>Rs. " + money(space.price) + "</ins>";
  }
  return text + " " + TYPE_INFO[space.type].unit;
}

function statusLabel(status) {
  switch (status) {
    case "available":
      return "Available";
    case "maintenance":
      return "Under maintenance";
    default:
      return status;
  }
}

// Build all the space cards from the spaces array
function renderSpaceCards() {
  let html = "";
  spaces.forEach(function (s, index) {
    const info = TYPE_INFO[s.type];
    const available = s.isBookable();
    html += `
      <article class="card space-card ${info.css}" id="space-${s.key}">
        <figure>
          <img src="${info.image}" alt="${info.alt}" width="600" height="400">
          <figcaption>Fig ${index + 2}. ${esc(s.name)}</figcaption>
        </figure>
        <h3>${esc(s.name)}</h3>
        <p>${s.description}</p>
        <table>
          <caption>${esc(s.name)} details</caption>
          <thead>
            <tr><th scope="col">Price</th><th scope="col">Capacity</th><th scope="col">Status</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${priceHtml(s)}</td>
              <td>${s.capacity} ${info.people}</td>
              <td class="status-${s.status}">${statusLabel(s.status)}</td>
            </tr>
          </tbody>
        </table>
        <p><a href="#book" class="btn ${available ? "btn-primary" : "btn-secondary"}" id="book-link-${s.key}" title="Book ${esc(s.name)}">${available ? "Book this space" : "Join the waitlist"}</a></p>
      </article>`;
  });
  if (spaces.length === 0) {
    html = "<p>No spaces are available right now.</p>";
  }
  byId("space-list").innerHTML = html;
}

// Rebuild the admin table
function renderSpacesTable() {
  let rows = "";
  spaces.forEach(function (s) {
    rows += `
      <tr>
        <th scope="row">${esc(s.name)}</th>
        <td>${TYPE_INFO[s.type].group}</td>
        <td>${s.capacity}</td>
        <td>${money(s.price)}</td>
        <td class="status-${s.status}">${statusLabel(s.status)}</td>
        <td>
          <button type="button" class="btn-edit" id="sp-edit-${s.key}" aria-label="Edit ${esc(s.name)}">Edit</button>
          <button type="button" class="btn-delete" id="sp-del-${s.key}" aria-label="Delete ${esc(s.name)}">Delete</button>
        </td>
      </tr>`;
  });
  byId("spaces-table").getElementsByTagName("tbody")[0].innerHTML = rows;
}

// Rebuild the booking-form select and the search suggestions
function renderSpaceOptions() {
  let desks = "";
  let rooms = "";
  spaces.forEach(function (s) {
    const note = s.isBookable() ? "" : ", under maintenance";
    const option = `<option value="${s.key}"${s.isBookable() ? "" : " disabled"}>` +
      `${esc(s.name)} (Rs. ${money(s.price)} ${TYPE_INFO[s.type].unit}${note})</option>`;
    if (s.isDesk()) {
      desks += option;
    } else {
      rooms += option;
    }
  });
  const select = byId("book-space");
  const previous = select.value;
  select.innerHTML = `<option value="">Choose a space</option>` +
    `<optgroup label="Desks">${desks}</optgroup>` +
    `<optgroup label="Rooms">${rooms}</optgroup>`;
  select.value = previous;

  byId("space-names").innerHTML = spaces
    .map((s) => `<option value="${esc(s.name)}">`)
    .join("");
}

// Search and filter: hide the cards that do not match
function applySpaceFilters() {
  const query = byId("search-text").value.trim().toLowerCase();
  const type = byId("filter-type").value;
  const maxPrice = byId("filter-price").value;
  const onlyAvailable = byId("filter-available").checked;

  let shown = 0;
  spaces.forEach(function (s) {
    let matches = true;
    if (query !== "" && s.name.toLowerCase().indexOf(query) === -1) {
      matches = false;
    }
    if (type !== "all" && s.type !== type) {
      matches = false;
    }
    if (maxPrice !== "" && s.price > Number(maxPrice)) {
      matches = false;
    }
    if (onlyAvailable && !s.isBookable()) {
      matches = false;
    }
    byId("space-" + s.key).hidden = !matches;
    if (matches) {
      shown++;
    }
  });

  byId("search-result-count").textContent = shown === 0
    ? "No spaces match your search."
    : `Showing ${shown} of ${spaces.length} spaces`;
}

// Everything that depends on the spaces array
function refreshSpaces() {
  renderSpaceCards();
  renderSpacesTable();
  renderSpaceOptions();
  applySpaceFilters();
  renderDashboard();
  renderReport();
}

// Admin: put a space into the form so it can be edited
function startEditSpace(key) {
  const s = getSpace(key);
  if (!s) {
    return;
  }
  byId("space-id").value = s.key;
  byId("space-name").value = s.name;
  byId("space-type").value = s.type;
  byId("space-capacity").value = s.capacity;
  byId("space-price").value = s.price;
  byId("space-status-available").checked = s.status === "available";
  byId("space-status-maintenance").checked = s.status === "maintenance";
  showMessage("space-message", `Editing ${s.name}. Change the fields and press Save space.`, false);
  window.location.hash = "manage-spaces";
}

// Admin: delete a space (not allowed while it has active bookings)
function deleteSpace(key) {
  const s = getSpace(key);
  if (!s) {
    return;
  }
  const active = bookings.filter((b) => b.spaceKey === key && b.isActive()).length;
  if (active > 0) {
    showMessage("space-message", `Cannot delete ${s.name}: ${active} active booking(s) use it.`, true);
    return;
  }
  if (confirm("Delete " + s.name + "? This cannot be undone.")) {
    let index = -1;
    for (let i = 0; i < spaces.length; i++) {
      if (spaces[i].key === key) {
        index = i;
        break;
      }
    }
    spaces.splice(index, 1);
    refreshSpaces();
    showMessage("space-message", `${s.name} was deleted.`, false);
    showToast(`${s.name} deleted.`);
  }
}

// Admin form: add a new space or update the one being edited
function saveSpace(event) {
  event.preventDefault();
  const name = byId("space-name").value.trim();
  const type = byId("space-type").value;
  const capacity = Number(byId("space-capacity").value);
  const price = Number(byId("space-price").value);
  const status = radioValue(["space-status-available", "space-status-maintenance"]);
  const editingKey = byId("space-id").value;

  if (name.length < 3) {
    showMessage("space-message", "Space name must have at least 3 characters.", true);
    return;
  }
  if (type === "") {
    showMessage("space-message", "Please choose a space type.", true);
    return;
  }
  if (isNaN(capacity) || capacity < 1 || isNaN(price) || price < 0) {
    showMessage("space-message", "Capacity must be 1 or more and price cannot be negative.", true);
    return;
  }
  // The same name cannot be used twice
  const duplicate = spaces.filter((s) => s.name.toLowerCase() === name.toLowerCase() && s.key !== editingKey);
  if (duplicate.length > 0) {
    showMessage("space-message", `A space called ${name} already exists.`, true);
    return;
  }

  if (editingKey !== "") {
    const s = getSpace(editingKey);
    s.name = name;
    s.type = type;
    s.capacity = capacity;
    if (price !== s.price) {
      s.oldPrice = null;   // a changed price no longer shows the old one
    }
    s.price = price;
    s.status = status;
    showMessage("space-message", `${name} was updated.`, false);
    showToast(`${name} updated.`);
  } else {
    const key = makeKey(name);
    spaces.push(new Space(key, name, type, capacity, price, status, 0,
      `${esc(name)} is a ${TYPE_INFO[type].group.toLowerCase()} space for up to ${capacity} ${TYPE_INFO[type].people}.`));
    showMessage("space-message", `${name} was added.`, false);
    showToast(`${name} added.`);
  }

  byId("space-form").reset();
  byId("space-id").value = "";
  refreshSpaces();
}


/* ---------- 5. BOOKING FORM ---------- */

// Check one time slot. Returns { ok, text }.
// excludeId lets an existing booking be ignored when it is being moved.
function checkSlot(spaceKey, date, start, end, people, excludeId) {
  const space = getSpace(spaceKey);
  if (!space) {
    return { ok: false, text: "Please choose a space." };
  }
  if (!space.isBookable()) {
    return { ok: false, text: `${space.name} is under maintenance and cannot be booked right now.` };
  }
  if (date === "") {
    return { ok: false, text: "Please choose a date." };
  }
  if (date < todayString()) {
    return { ok: false, text: "Please choose today or a future date." };
  }
  if (start === "" || end === "") {
    return { ok: false, text: "Please choose a start time and an end time." };
  }
  if (end <= start) {
    return { ok: false, text: "The end time must be after the start time." };
  }
  if (date === todayString() && start < nowTimeString()) {
    return { ok: false, text: "That start time has already passed." };
  }
  if (isNaN(people) || people < 1) {
    return { ok: false, text: "Number of people must be at least 1." };
  }
  if (!space.isDesk() && people > space.capacity) {
    return { ok: false, text: `${space.name} holds up to ${space.capacity} people.` };
  }

  // Look at the other bookings of the same space and date
  let usedUnits = 0;
  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    if (!b.isActive() || b.id === excludeId || b.spaceKey !== spaceKey || b.date !== date) {
      continue;
    }
    const overlaps = start < b.end && b.start < end;
    if (overlaps) {
      if (space.isDesk()) {
        usedUnits += b.people;
      } else {
        return {
          ok: false,
          text: `${space.name} is already booked from ${b.start} to ${b.end} on ${formatDate(date)}.`
        };
      }
    }
  }

  if (space.isDesk()) {
    const left = space.capacity - usedUnits;
    if (people > left) {
      return { ok: false, text: `Only ${left} ${TYPE_INFO[space.type].people} are left for that time.` };
    }
    return { ok: true, text: `Available: ${left} ${TYPE_INFO[space.type].people} free for that time.` };
  }
  return { ok: true, text: `Available: ${space.name} is free on ${formatDate(date)} from ${start} to ${end}.` };
}

// Read the booking form and check its slot
function checkSlotFromForm() {
  return checkSlot(
    byId("book-space").value,
    byId("book-date").value,
    byId("book-start").value,
    byId("book-end").value,
    Number(byId("book-people").value),
    null
  );
}

// Sample price: rooms are charged per hour, desks per person
function estimateCost(space, start, end, people, addons) {
  let total = space.price;
  if (space.type === "meeting-room") {
    const hours = Math.ceil((toMinutes(end) - toMinutes(start)) / 60);
    total = space.price * hours;
  } else if (space.isDesk()) {
    total = space.price * people;
  }
  for (let name in ADDON_PRICES) {
    if (addons.indexOf(name) !== -1) {
      total += ADDON_PRICES[name];
    }
  }
  return total;
}

// Fill the personal fields and the booking id
function fillBookingForm() {
  if (currentUser) {
    byId("book-name").value = currentUser.name;
    byId("book-email").value = currentUser.email;
    byId("book-phone").value = currentUser.phone;
  }
  byId("booking-id").value = nextBookingId();
}

function submitBooking(event) {
  event.preventDefault();
  if (!currentUser) {
    showMessage("booking-message", "Please log in before booking a space.", true);
    return;
  }

  const result = checkSlotFromForm();
  if (!result.ok) {
    showMessage("booking-message", result.text, true);
    return;
  }

  const space = getSpace(byId("book-space").value);
  const start = byId("book-start").value;
  const end = byId("book-end").value;
  const people = Number(byId("book-people").value);
  const addons = checkedValues(["addon-projector", "addon-whiteboard", "addon-refreshments", "addon-parking"]);
  const plan = radioValue(["plan-hourly", "plan-daily", "plan-monthly"]);
  const amount = estimateCost(space, start, end, people, addons);
  const id = byId("booking-id").value;

  const booking = new Booking(id, byId("book-name").value.trim(), currentUser.email, space.key,
    byId("book-date").value, start, end, "Pending", amount, people, true);
  bookings.push(booking);

  const note = addons.length > 0 ? " Add-ons: " + addons.join(", ") + "." : "";
  addNotification(`Booking ${id} for ${space.name} on ${formatDate(booking.date)} was submitted and is waiting for staff approval.`);
  byId("booking-form").reset();
  fillBookingForm();
  refreshBookings();
  showMessage("booking-message",
    `Booking ${id} submitted (${plan} plan). Estimated amount: Rs. ${money(amount)}.${note} Status: Pending.`, false);
  showToast(`Booking ${id} submitted.`);
  window.location.hash = "bookings";
}


/* ---------- 6. BOOKINGS TABLE ---------- */

function renderBookings() {
  const list = visibleBookings();
  let rows = "";
  list.forEach(function (b) {
    const disabled = b.isActive() ? "" : " disabled";
    rows += `
      <tr>
        <th scope="row">${b.id}</th>
        <td>${esc(b.name)}</td>
        <td>${esc(spaceName(b.spaceKey))}</td>
        <td><time datetime="${b.date}">${formatDate(b.date)}</time></td>
        <td>${b.start} to ${b.end}</td>
        <td class="status-${b.status.toLowerCase()}">${b.status}</td>
        <td>
          <button type="button" class="btn-edit" id="edit-${b.id}" aria-label="Edit booking ${b.id}"${disabled}>Edit</button>
          <button type="button" class="btn-cancel" id="cancel-${b.id}" aria-label="Cancel booking ${b.id}"${disabled}>Cancel</button>
        </td>
      </tr>`;
  });
  if (list.length === 0) {
    rows = `<tr><td colspan="7">You have no bookings yet. Use the booking form above.</td></tr>`;
  }
  byId("bookings-table").getElementsByTagName("tbody")[0].innerHTML = rows;
  byId("bookings-total").textContent = list.length;
}

// Members move their booking to a new date. Staff and admin change the status.
function editBooking(id) {
  const b = findBooking(id);
  if (!b) {
    return;
  }

  if (currentUser.role === "member") {
    const answer = prompt("Enter a new date for " + id + " (YYYY-MM-DD):", b.date);
    if (answer === null) {
      return;   // the person pressed Cancel
    }
    const newDate = answer.trim();
    if (newDate.length !== 10 || isNaN(new Date(newDate).getTime())) {
      alert("That is not a valid date. Please use the format YYYY-MM-DD.");
      return;
    }
    const result = checkSlot(b.spaceKey, newDate, b.start, b.end, b.people, b.id);
    if (!result.ok) {
      alert(result.text);
      return;
    }
    b.date = newDate;
    addNotification(`Booking ${id} was moved to ${formatDate(newDate)}.`);
    showToast(`Booking ${id} moved to ${formatDate(newDate)}.`);
  } else {
    const answer = prompt("Type the new status for " + id + " (Confirmed, Pending or Cancelled):", b.status);
    if (answer === null) {
      return;
    }
    let newStatus = "";
    switch (answer.trim().toLowerCase()) {
      case "confirmed":
        newStatus = "Confirmed";
        break;
      case "pending":
        newStatus = "Pending";
        break;
      case "cancelled":
        newStatus = "Cancelled";
        break;
      default:
        newStatus = "";
    }
    if (newStatus === "") {
      alert("Please type Confirmed, Pending or Cancelled.");
      return;
    }
    b.status = newStatus;
    addNotification(`Booking ${id} was marked ${newStatus} by ${currentUser.name}.`);
    showToast(`Booking ${id} is now ${newStatus}.`);
  }
  refreshBookings();
}

function cancelBooking(id) {
  const b = findBooking(id);
  if (!b) {
    return;
  }
  if (confirm("Cancel booking " + id + "?")) {
    b.status = "Cancelled";
    addNotification(`Booking ${id} was cancelled by ${currentUser.name}.`);
    showToast(`Booking ${id} cancelled.`);
    refreshBookings();
  }
}

// Everything that depends on the bookings array
function refreshBookings() {
  renderBookings();
  renderDashboard();
  renderReport();
}


/* ---------- 7. DASHBOARD AND REPORT ---------- */

function usedCount(space) {
  const active = bookings.filter((b) => b.spaceKey === space.key && b.isActive()).length;
  return space.inUse + active;
}

function utilisation(space) {
  if (!space.isBookable()) {
    return 0;
  }
  return Math.min(100, Math.round((usedCount(space) / space.capacity) * 100));
}

function renderDashboard() {
  const list = visibleBookings();
  let confirmed = 0;
  let pending = 0;
  let cancelled = 0;
  list.forEach(function (b) {
    switch (b.status) {
      case "Confirmed":
        confirmed++;
        break;
      case "Pending":
        pending++;
        break;
      case "Cancelled":
        cancelled++;
        break;
    }
  });

  byId("stat-total").textContent = list.length;
  byId("stat-confirmed").textContent = confirmed;
  byId("stat-pending").textContent = pending;
  byId("stat-cancelled").textContent = cancelled;

  const progress = byId("approvals-progress");
  progress.max = list.length > 0 ? list.length : 1;
  progress.value = confirmed;
  progress.nextElementSibling.textContent = confirmed + " of " + list.length;

  // Utilisation of every space and the overall occupancy
  let usedTotal = 0;
  let capacityTotal = 0;
  let items = "";
  spaces.forEach(function (s) {
    const percent = utilisation(s);
    if (s.isBookable()) {
      usedTotal += usedCount(s);
      capacityTotal += s.capacity;
    }
    items += `
      <li>
        <label for="meter-${s.key}">${esc(s.name)}</label>
        <meter id="meter-${s.key}" value="${percent}" min="0" max="100">${percent}%</meter>
      </li>`;
  });
  byId("utilisation-card").getElementsByTagName("ul")[0].innerHTML = items;

  const occupancy = capacityTotal > 0
    ? Math.round((Math.min(usedTotal, capacityTotal) / capacityTotal) * 100)
    : 0;
  const meter = byId("occupancy-meter");
  meter.value = occupancy;
  meter.nextElementSibling.textContent = occupancy + "%";
}

// Monthly report: saved monthly numbers plus bookings made in this session
function renderReport() {
  let rows = "";
  let totalCount = 0;
  let totalRevenue = 0;
  spaces.forEach(function (s) {
    const fresh = bookings.filter((b) => b.isNew && b.spaceKey === s.key && b.isActive());
    let revenue = s.monthRevenue;
    fresh.forEach(function (b) {
      revenue += b.amount;
    });
    const count = s.monthBookings + fresh.length;
    totalCount += count;
    totalRevenue += revenue;
    rows += `<tr><th scope="row">${esc(s.name)}</th><td>${count}</td><td>${money(revenue)}</td></tr>`;
  });
  const table = byId("report-table");
  table.getElementsByTagName("tbody")[0].innerHTML = rows;
  table.getElementsByTagName("tfoot")[0].innerHTML =
    `<tr><th scope="row">Total</th><td>${totalCount}</td><td>${money(totalRevenue)}</td></tr>`;
}


/* ---------- 8. LOGIN, REGISTER, CONTACT, MENU ---------- */

function handleLogin(event) {
  event.preventDefault();
  const email = byId("login-email").value.trim().toLowerCase();
  const password = byId("login-password").value;
  const role = byId("login-role").value;
  const user = findUser(email);

  if (!user || user.password !== password) {
    showMessage("login-message", "Wrong email or password. Please try again.", true);
  } else if (user.role !== role) {
    showMessage("login-message", `This account is a ${user.role} account. Choose "${capitalise(user.role)}" in "Log in as".`, true);
  } else {
    byId("login-form").reset();
    loginUser(user);
    showToast(`Welcome, ${user.name}! You are logged in as ${user.role}.`);
    window.location.hash = "dashboard";
  }
}

function handleRegister(event) {
  event.preventDefault();
  const name = byId("reg-name").value.trim();
  const email = byId("reg-email").value.trim().toLowerCase();
  const phone = byId("reg-phone").value.trim();
  const password = byId("reg-password").value;
  const confirmPassword = byId("reg-confirm").value;
  const role = radioValue(["role-member", "role-staff", "role-admin"]);

  if (password !== confirmPassword) {
    showMessage("register-message", "The two passwords do not match.", true);
    return;
  }
  if (findUser(email)) {
    showMessage("register-message", "This email is already registered. Please log in instead.", true);
    return;
  }
  if (role !== "member") {
    const code = prompt("Enter the access code for " + role + " accounts:", "");
    if (code !== STAFF_CODE) {
      alert("Wrong access code. The " + role + " account was not created.");
      showMessage("register-message", "Access code was wrong, so no account was created.", true);
      return;
    }
  }

  users.push({ name: name, email: email, phone: phone, password: password, role: role });
  byId("register-form").reset();
  byId("login-email").value = email;
  byId("login-role").value = role;
  showMessage("register-message", `Account created for ${name}. You can now log in as ${role}.`, false);
  showToast("Registration successful.");
}

function handleContact(event) {
  event.preventDefault();
  const name = byId("contact-name").value.trim();
  const email = byId("contact-email").value.trim();
  const topic = byId("contact-topic").value.trim();
  const about = topic === "" ? "your message" : `"${topic}"`;
  byId("contact-form").reset();
  showMessage("contact-message", `Thank you, ${name}! We received ${about} and will reply to ${email}.`, false);
}

// Mobile menu: open or close
function setMenuOpen(open) {
  byId("menu-toggle").setAttribute("aria-expanded", open ? "true" : "false");
}

function bindEvents() {
  // Forms
  byId("login-form").onsubmit = handleLogin;
  byId("register-form").onsubmit = handleRegister;
  byId("booking-form").onsubmit = submitBooking;
  byId("space-form").onsubmit = saveSpace;
  byId("contact-form").onsubmit = handleContact;

  byId("check-availability").onclick = function () {
    const result = checkSlotFromForm();
    showMessage("booking-message", result.text, !result.ok);
  };

  // Search and filter
  byId("search-form").onsubmit = function (event) {
    event.preventDefault();
    applySpaceFilters();
  };
  byId("search-form").onreset = function () {
    setTimeout(applySpaceFilters, 0);   // wait until the fields are cleared
  };
  byId("search-text").oninput = applySpaceFilters;
  byId("filter-type").onchange = applySpaceFilters;
  byId("filter-price").oninput = applySpaceFilters;
  byId("filter-available").onchange = applySpaceFilters;

  // Space cards: pre-select the space in the booking form
  byId("space-list").onclick = function (event) {
    const id = event.target.id;
    if (id.indexOf("book-link-") === 0) {
      const space = getSpace(id.substring(10));
      if (space && space.isBookable()) {
        byId("book-space").value = space.key;
      } else if (space) {
        event.preventDefault();
        showToast(`Thanks! We will tell you when ${space.name} is available again.`);
      }
    }
  };

  // Bookings table: edit and cancel buttons
  byId("bookings-table").onclick = function (event) {
    const id = event.target.id;
    if (id.indexOf("edit-") === 0) {
      editBooking(id.substring(5));
    } else if (id.indexOf("cancel-") === 0) {
      cancelBooking(id.substring(7));
    }
  };

  // Admin spaces table: edit and delete buttons
  byId("spaces-table").onclick = function (event) {
    const id = event.target.id;
    if (id.indexOf("sp-edit-") === 0) {
      startEditSpace(id.substring(8));
    } else if (id.indexOf("sp-del-") === 0) {
      deleteSpace(id.substring(7));
    }
  };

  // Notifications: dismiss button
  byId("notification-list").onclick = function (event) {
    if (event.target.tagName === "BUTTON") {
      const item = event.target.parentNode;
      item.parentNode.removeChild(item);
    }
  };

  // Menu
  byId("menu-toggle").onclick = function () {
    setMenuOpen(this.getAttribute("aria-expanded") !== "true");
  };
  byId("menu-list").onclick = function () {
    if (window.innerWidth <= 700) {
      setMenuOpen(false);   // close the menu after choosing a link on a phone
    }
  };
  window.onresize = function () {
    if (window.innerWidth > 700) {
      setMenuOpen(true);
    }
  };

  // Header button: Login / Register for guests, Logout when logged in
  const links = byId("menu-list").getElementsByTagName("a");
  for (let i = 0; i < links.length; i++) {
    if (links[i].getAttribute("href") === "#account") {
      links[i].onclick = function () {
        if (currentUser) {
          if (confirm("Log out of CoSpace?")) {
            logoutUser();
          }
          return false;   // stay on the page
        }
        return true;
      };
    }
  }

  // Guests who click a booking link are sent to the account section
  document.onclick = function (event) {
    const target = event.target;
    if (target.tagName === "A" && !currentUser) {
      const href = target.getAttribute("href");
      if (href === "#book" || href === "#bookings") {
        event.preventDefault();
        showToast("Please log in or register to book a space.", true);
        window.location.hash = "account";
      }
    }
  };
}


/* ---------- 9. START-UP ---------- */

try {
  // Dates in the booking form: from today to 120 days ahead
  const limit = new Date();
  limit.setDate(limit.getDate() + 120);
  byId("book-date").min = todayString();
  byId("book-date").max = limit.getFullYear() + "-" + two(limit.getMonth() + 1) + "-" + two(limit.getDate());

  refreshSpaces();
  refreshBookings();
  applyRole();
  fillBookingForm();
  bindEvents();

  // Start with the mobile menu closed on small screens
  if (window.innerWidth <= 700) {
    setMenuOpen(false);
  }
} catch (error) {
  console.error("CoSpace start-up problem:", error.message);
} finally {
  console.log("CoSpace script loaded.");
}