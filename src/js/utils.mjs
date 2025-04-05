// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function handleCartChange(cartQuantityElement = document.getElementById("cart-quantity-items")) {
  const cartItems = getLocalStorage("so-cart");
  if (cartItems) {
    const cartQuantity = cartItems.reduce((acc, item) => acc + item.Quantity, 0);
    cartQuantityElement.innerText = cartQuantity;

    if (cartQuantity > 0) {
      cartQuantityElement.classList.add("active");
    } else {
      cartQuantityElement.classList.remove("active");
      cartQuantityElement.innerText = "";
    }

    // Trigger the anitmation
    animateCartIcon();
  }
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  console.log(`Loaded template from ${path}`);
  return template;
}

export async function loadHeaderFooter() {
  const headerElement = document.getElementById("main-header");
  const headerPartial = await loadTemplate("/partials/header.html");
  renderWithTemplate(headerPartial, headerElement, undefined);

  const footerElement = document.getElementById("main-footer");
  const footerPartial = await loadTemplate("/partials/footer.html");
  renderWithTemplate(footerPartial, footerElement);
}

// Function to send alerts to the user
export function alertMessage(message, scroll=true) {
  const alertBox = document.createElement("div");
  alertBox.className = "alert-box";
  alertBox.innerHTML = `<p>${message}</p><span>X</span>`;

  alertBox.addEventListener('click', function(e) {
    if(e.target.tagName == 'SPAN') {
      main.removeChild(this);
    }
  })

  const main = document.querySelector("main");
  main.insertBefore(alertBox, main.firstChild);

  if(scroll) {
    window.scrollTo(0, 0);
  }

}

export function removeAllAlerts() {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => document.querySelector("main").removeChild(alert));
}


async function lookupCarByVin(vin, resultContainer) {
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
    const data = await response.json();
    const carInfo = data.Results[0];

    if (
      carInfo.ErrorText &&
      carInfo.ErrorText !== "0 - VIN decoded clean. Check Digit (9th position) is correct"
    ) {
      resultContainer.innerHTML = `<p class="error">Error: ${carInfo.ErrorText}</p>`;
      return;
    }

    const safe = (val) => val && val !== "Not Applicable" ? val : "N/A";

    resultContainer.innerHTML = `
      <div class="info">
      <h3>Vehicle Information</h3>
      <p><strong>Make:</strong> ${safe(carInfo.Make)}</p>
      <p><strong>Model:</strong> ${safe(carInfo.Model)}</p>
      <p><strong>Year:</strong> ${safe(carInfo.ModelYear)}</p>
      <p><strong>Body Style:</strong> ${safe(carInfo.BodyClass)}</p>
      <p><strong>Drive Type:</strong> ${safe(carInfo.DriveType)}</p>
      <p><strong>Engine:</strong> ${safe(carInfo.EngineConfiguration)} | ${safe(carInfo.EngineCylinders)} Cylinders | ${safe(carInfo.DisplacementL)}L | ${safe(carInfo.EngineHP)} HP</p>
      <p><strong>Transmission:</strong> ${safe(carInfo.TransmissionStyle)} (${safe(carInfo.TransmissionSpeeds)} speeds)</p>
      <p><strong>Fuel Type:</strong> ${safe(carInfo.FuelTypePrimary)}</p>
      </div>

      <div class="info">
      <h3>Safety & Features</h3>
      <p><strong>ABS:</strong> ${safe(carInfo.ABS)}</p>
      <p><strong>ESC:</strong> ${safe(carInfo.ESC)}</p>
      <p><strong>Traction Control:</strong> ${safe(carInfo.TractionControl)}</p>
      <p><strong>Blind Spot Monitoring:</strong> ${safe(carInfo.BlindSpotMon)}</p>
      <p><strong>Rear Visibility System:</strong> ${safe(carInfo.RearVisibilitySystem)}</p>
      </div>

      <div class="info">
      <h3>Capacity & Build</h3>
      <p><strong>GVWR:</strong> ${safe(carInfo.GVWR)}</p>
      <p><strong>Seats:</strong> ${safe(carInfo.Seats)} (${safe(carInfo.SeatRows)} rows)</p>
      <p><strong>Doors:</strong> ${safe(carInfo.Doors)}</p>
      <p><strong>Wheelbase:</strong> Short: ${safe(carInfo.WheelBaseShort)} in | Long: ${safe(carInfo.WheelBaseLong)} in</p>
      <p><strong>Plant:</strong> ${safe(carInfo.PlantCity)}, ${safe(carInfo.PlantState)}, ${safe(carInfo.PlantCountry)}</p>
      </div>

      <div class="info">
      <h3>Extra Info</h3>
      <p><strong>Entertainment System:</strong> ${safe(carInfo.EntertainmentSystem)}</p>
      <p><strong>TPMS:</strong> ${safe(carInfo.TPMS)}</p>
      <p><strong>Steering:</strong> ${safe(carInfo.SteeringLocation)}</p>
      <p><strong>VIN:</strong> ${safe(carInfo.VIN).toUpperCase()}</p>
      </div>
    `;
  } catch (err) {
    resultContainer.innerHTML = `<p class="error">Something went wrong. Please try again later.</p>`;
    console.error("VIN Lookup Error:", err);
  }
}

export function renderCarLookupForm() {
  const container = document.createElement("div");

  const form = document.createElement("form");
  form.classList.add("vin-lookup-form");
  form.innerHTML = `
    <label for="vin">Enter VIN:</label>
    <input type="text" id="vin" name="vin" required placeholder="1HGCM82633A123456" title="17 characters, no I, O, Q" maxlength="17" minlength="17">
    <button type="submit">Lookup</button>
  `;

  const resultContainer = document.createElement("div");
  resultContainer.id = "vin-results";
  resultContainer.classList.add("vin-results");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const vin = event.target.vin.value;
    resultContainer.innerHTML = "<p>Loading...</p>";
    await lookupCarByVin(vin, resultContainer);
  });

  container.appendChild(form);
  container.appendChild(resultContainer);
  return container;
}


//fucntions to load car repair shops based on zip code

async function loadCarShops(zipCode) {
  const apiKey = 'AIzaSyBPe7Qc6vqdXFPEQ31ym0O';  // Use your actual Google API Key
  const container = document.querySelector(".vin-results");

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=car+repair+shops+in+${zipCode}&key=${apiKey}`);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const shopLocations = data.results.map(shop => {
      return `
        <div class="info">
          <h3>${shop.name}</h3>
          <p>${shop.formatted_address}</p>
        </div>
      `;
    }).join("");

    // Generate an iframe with the first shop location (you can enhance this logic to show all shops)
    const iframe = `
      <iframe 
        width="100%" 
        height="500" 
        frameborder="0" 
        src="https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=car+repair+shops+in+${zipCode}">
      </iframe>
    `;

    container.innerHTML = `
      <h3>Repair Shops in ${zipCode}</h3>
      <div class="vin-results">${shopLocations}</div>
      <div class="map-container">${iframe}</div>
    `;
  } else {
    container.innerHTML = `<p>No repair shops found in your area.</p>`;
  }
}

export function renderCarShopFinderForm() {
  const form = document.createElement("form");
  form.innerHTML = `
    <label for="zip">Enter your Zip Code:</label>
    <input type="text" id="zip" name="zip" required title="5-digit zip code">
    <button type="submit">Find Repair Shops</button>
  `;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const zip = event.target.zip.value;
    await loadCarShops(zip);  
  });

  return form;
}

