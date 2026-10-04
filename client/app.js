const API_BASE = "/api";
const socket = window.io ? window.io() : null;
if (socket) {
  socket.on("seatUpdate", (data) => {
    const el = document.querySelector(
      `[data-flight-id="${data.flightId}"] .seats`,
    );
    if (el) el.textContent = `Seats: ${data.availableSeats}`;
  });
}

function el(tag, props = {}, ...children) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  children.forEach((c) => {
    if (typeof c === "string") e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

function getToken() {
  return localStorage.getItem("token");
}
function setToken(t) {
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}

async function api(path, opts = {}) {
  opts.headers = opts.headers || {};
  if (!(opts.body instanceof FormData))
    opts.headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) opts.headers["Authorization"] = "Bearer " + token;
  if (opts.body && opts.headers["Content-Type"] === "application/json")
    opts.body = JSON.stringify(opts.body);
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) throw await res.json();
  return res.json();
}

// Views
async function viewFlights() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const search = el(
    "div",
    {},
    el("input", {
      placeholder: "Departure city",
      id: "q-depart",
      className: "input",
    }),
    el("input", {
      placeholder: "Arrival city",
      id: "q-arrive",
      className: "input",
    }),
    el("button", { className: "btn", onclick: loadFlights }, "Search"),
  );
  app.appendChild(search);
  app.appendChild(el("div", { id: "flights-list" }));
  app.appendChild(el("div", { id: "flights-pager", style: "margin-top:8px" }));
  await loadFlights();
}

async function loadFlights() {
  const dep = document.getElementById("q-depart").value || "";
  const arr = document.getElementById("q-arrive").value || "";
  const q = new URLSearchParams();
  if (dep) q.set("departureCity", dep);
  if (arr) q.set("arrivalCity", arr);
  q.set("page", 1);
  q.set("limit", 8);
  const flights = await api("/flights?" + q.toString()).catch((e) => {
    alert(e.message || JSON.stringify(e));
    return { flights: [], total: 0, page: 1, pages: 1 };
  });
  const list = document.getElementById("flights-list");
  list.innerHTML = "";
  const items = flights.flights || flights;
  items.forEach((f) => {
    const node = el(
      "div",
      { className: "flight", dataset: { flightId: f._id } },
      el("h3", {}, `${f.airline} — ${f.flightNumber}`),
      el("div", {}, `From: ${f.departureCity} To: ${f.arrivalCity}`),
      el("div", {}, `Depart: ${new Date(f.departureDate).toLocaleString()}`),
      el("div", {}, `Price: $${f.price}`),
      el("div", { className: "seats" }, `Seats: ${f.availableSeats}`),
      el(
        "button",
        {
          className: "btn",
          onclick: () => (location.hash = "#/flight/" + f._id),
        },
        "View / Book",
      ),
    );
    list.appendChild(node);
  });
  // pager
  const pager = document.getElementById("flights-pager");
  pager.innerHTML = "";
  const current = flights.page || 1;
  const pages = flights.pages || 1;
  if (pages > 1) {
    const prev = el(
      "button",
      {
        className: "btn",
        onclick: () => loadFlights(Math.max(1, current - 1)),
      },
      "Prev",
    );
    const next = el(
      "button",
      {
        className: "btn",
        onclick: () => loadFlights(Math.min(pages, current + 1)),
      },
      "Next",
    );
    pager.appendChild(prev);
    pager.appendChild(
      el("span", { style: "margin:0 8px" }, `Page ${current} / ${pages}`),
    );
    pager.appendChild(next);
  }
}

async function viewFlight(id) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const f = await api("/flights/" + id).catch((e) => {
    alert(e.message || JSON.stringify(e));
    return null;
  });
  if (!f) return;
  const node = el(
    "div",
    {},
    el("h2", {}, `${f.airline} ${f.flightNumber}`),
    el("div", {}, `From ${f.departureCity} To ${f.arrivalCity}`),
    el("div", {}, `Depart: ${new Date(f.departureDate).toLocaleString()}`),
    el("div", {}, `Price: $${f.price}`),
    el("div", {}, `Available seats: ${f.availableSeats}`),
    el("h3", {}, "Book"),
    el(
      "form",
      {
        id: "book-form",
        onsubmit: async (ev) => {
          ev.preventDefault();
          await submitBooking(id);
        },
      },
      el("textarea", {
        id: "passengers",
        placeholder: "One passenger name per line",
        className: "input",
      }),
      el("button", { className: "btn", type: "submit" }, "Book"),
    ),
  );
  app.appendChild(node);
}

async function submitBooking(flightId) {
  const txt = document.getElementById("passengers").value.trim();
  if (!txt) return alert("Add at least one passenger name");
  const passengers = txt
    .split("\n")
    .map((n) => ({ name: n.trim() }))
    .filter((p) => p.name);
  try {
    const booking = await api("/bookings", {
      method: "POST",
      body: { flightId, passengers },
    });
    alert("Booked: " + booking._id);
    location.hash = "#/bookings/" + booking._id;
  } catch (e) {
    alert(e.message || JSON.stringify(e));
  }
}

function viewLogin() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const form = el(
    "form",
    {
      className: "form",
      onsubmit: async (ev) => {
        ev.preventDefault();
        await doLogin();
      },
    },
    el("h2", {}, "Login"),
    el("input", { id: "email", placeholder: "Email", className: "input" }),
    el("input", {
      id: "password",
      placeholder: "Password",
      type: "password",
      className: "input",
    }),
    el("button", { className: "btn", type: "submit" }, "Login"),
  );
  app.appendChild(form);
}

async function doLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const res = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(res.token);
    updateNav();
    location.hash = "#/flights";
  } catch (e) {
    alert(e.message || JSON.stringify(e));
  }
}

function viewRegister() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const form = el(
    "form",
    {
      className: "form",
      enctype: "multipart/form-data",
      onsubmit: async (ev) => {
        ev.preventDefault();
        await doRegister();
      },
    },
    el("h2", {}, "Register"),
    el("input", { id: "r-name", placeholder: "Name", className: "input" }),
    el("input", { id: "r-email", placeholder: "Email", className: "input" }),
    el("input", {
      id: "r-password",
      placeholder: "Password",
      type: "password",
      className: "input",
    }),
    el("input", { id: "r-gender", placeholder: "Gender", className: "input" }),
    el("input", {
      id: "r-file",
      type: "file",
      accept: "image/*",
      className: "input",
    }),
    el("button", { className: "btn", type: "submit" }, "Register"),
  );
  app.appendChild(form);
}

async function doRegister() {
  const name = document.getElementById("r-name").value;
  const email = document.getElementById("r-email").value;
  const password = document.getElementById("r-password").value;
  const gender = document.getElementById("r-gender").value;
  const file = document.getElementById("r-file").files[0];
  const fd = new FormData();
  fd.append("name", name);
  fd.append("email", email);
  fd.append("password", password);
  fd.append("gender", gender);
  if (file) fd.append("profilePicture", file);
  try {
    const res = await fetch(API_BASE + "/auth/register", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    setToken(data.token);
    updateNav();
    location.hash = "#/flights";
  } catch (e) {
    alert(e.message || JSON.stringify(e));
  }
}

async function viewProfile() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  try {
    const user = await api("/users/profile");
    const node = el(
      "div",
      {},
      el("h2", {}, "Profile"),
      el("div", {}, `Name: ${user.name}`),
      el("div", {}, `Email: ${user.email}`),
      el("div", {}, `Role: ${user.role}`),
      el("h3", {}, "Update Profile"),
      el(
        "form",
        {
          onsubmit: async (ev) => {
            ev.preventDefault();
            await updateProfile();
          },
          className: "form",
        },
        el("input", {
          id: "u-name",
          placeholder: "Name",
          className: "input",
          value: user.name,
        }),
        el("input", {
          id: "u-email",
          placeholder: "Email",
          className: "input",
          value: user.email,
        }),
        el("input", {
          id: "u-password",
          placeholder: "New password",
          className: "input",
          type: "password",
        }),
        el("input", {
          id: "u-file",
          type: "file",
          accept: "image/*",
          className: "input",
        }),
        el("button", { className: "btn", type: "submit" }, "Update"),
      ),
    );
    app.appendChild(node);
  } catch (e) {
    alert(e.message || JSON.stringify(e));
    location.hash = "#/login";
  }
}

async function updateProfile() {
  const fd = new FormData();
  fd.append("name", document.getElementById("u-name").value);
  fd.append("email", document.getElementById("u-email").value);
  const pw = document.getElementById("u-password").value;
  if (pw) fd.append("password", pw);
  const file = document.getElementById("u-file").files[0];
  if (file) fd.append("profilePicture", file);
  try {
    const res = await fetch(API_BASE + "/users/profile", {
      method: "PUT",
      body: fd,
      headers: { Authorization: "Bearer " + getToken() },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    alert("Profile updated");
  } catch (e) {
    alert(e.message || JSON.stringify(e));
  }
}

async function viewBooking(id) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  try {
    const b = await api("/bookings/" + id);
    app.appendChild(
      el(
        "div",
        {},
        el("h2", {}, `Booking ${b._id}`),
        el("div", {}, `Status: ${b.status}`),
        el("div", {}, `Total: $${b.totalPrice}`),
      ),
    );
  } catch (e) {
    alert(e.message || JSON.stringify(e));
  }
}

function updateNav() {
  const logged = !!getToken();
  document.getElementById("nav-login").style.display = logged ? "none" : "";
  document.getElementById("nav-register").style.display = logged ? "none" : "";
  document.getElementById("nav-profile").style.display = logged ? "" : "none";
  document.getElementById("nav-logout").style.display = logged ? "" : "none";
}

document.getElementById("nav-logout").addEventListener("click", async () => {
  setToken(null);
  updateNav();
  location.hash = "#/login";
  await fetch("/api/auth/logout", { method: "POST" });
});

document.addEventListener("DOMContentLoaded", () => {
  updateNav();
  router();
  window.addEventListener("hashchange", router);
});

function router() {
  const hash = location.hash || "#/flights";
  const parts = hash.split("/");
  if (hash.startsWith("#/flights")) return viewFlights();
  if (hash.startsWith("#/flight/")) return viewFlight(parts[2]);
  if (hash.startsWith("#/bookings/")) return viewBooking(parts[2]);
  if (hash === "#/login") return viewLogin();
  if (hash === "#/register") return viewRegister();
  if (hash === "#/profile") return viewProfile();
  return viewFlights();
}
