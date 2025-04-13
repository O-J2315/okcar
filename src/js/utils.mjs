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

  if(localStorage.getItem("last_vin")) {
    const last_vin = localStorage.getItem("last_vin");
    const date = localStorage.getItem("last-lookup-date");
    container.innerHTML = `<p class="locals">Last VIN: <strong>${last_vin}</strong> on ${date}</p>`;
  }

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
    setLocalStorage("last-lookup-date", new Date().toISOString().split("T")[0]);
    setLocalStorage("last_vin", vin);
  });

  container.appendChild(form);
  container.appendChild(resultContainer);

  return container;
}

//fucntions to load car repair shops based on zip code

function loadCarShops(zipCode) {
  const container = document.querySelector(".vin-results");

  const map = new google.maps.Map(document.createElement("div")); // hidden dummy map
  const service = new google.maps.places.PlacesService(map);

  const request = {
    query: `car repair shops in ${zipCode}`,
    fields: ["name", "formatted_address"],
  };

  service.textSearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      const shopLocations = results.map(shop =>
        `
        <div class="info">
          <h3>${shop.name}</h3>
          <p>${shop.formatted_address}</p>
        </div>
      `).join("");

      const iframe = `
        <iframe 
          width="100%" 
          height="500" 
          frameborder="0" 
          src="https://www.google.com/maps/embed/v1/search?key=AIzaSyBPe7Qc6vqdXFPEQ31ym0O-aixgX3cLT5s&q=car+repair+shops+in+${zipCode}">
        </iframe>
      `;

      container.innerHTML = `
        <h3>Repair Shops in ${zipCode}</h3>
        <div class="results">${shopLocations}</div>
        <div class="map-container">${iframe}</div>
      `;
    } else {
      container.innerHTML = `<p>No repair shops found in your area.</p>`;
    }
  });
}

export function renderCarShopFinderForm() {
  const container = document.createElement("div");

  if(localStorage.getItem("last_zip")) {
    console.log("last_zip", localStorage.getItem("last_zip"));
    const last_zip = localStorage.getItem("last_zip");
    const date = localStorage.getItem("last-carshop-date");
    container.innerHTML = `<p class="locals">Last Zip: <strong>${last_zip}</strong> on ${date}</p>`;
    document.querySelector(".service-api").appendChild(container);
  }


  const form = document.createElement("form");
  form.innerHTML = `
    <label for="zip">Enter your Zip Code:</label>
    <input type="text" id="zip" name="zip" required title="5-digit zip code">
    <button type="submit">Find Repair Shops</button>
  `;

  form.classList.add("car-shop-finder-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const zip = event.target.zip.value;
    await loadCarShops(zip);  
    setLocalStorage("last-carshop-date", new Date().toISOString().split("T")[0]);
    setLocalStorage("last_zip", zip);
  });

  const resultContainer = document.createElement("div");
  resultContainer.id = "vin-results";
  resultContainer.classList.add("vin-results");
  form.appendChild(resultContainer);

  return form;
}



//Functions to load car value calculator based on vin, mileage, zip code, and costs

export function renderCarCalculatorForm() {
  const container = document.createElement("div");

  if(localStorage.getItem("last_zip")) {
    console.log("last_zip", localStorage.getItem("last_zip"));
    const last_zip = localStorage.getItem("last_zip");
    const date = localStorage.getItem("last-carshop-date");
    container.innerHTML += `<p class="locals">Last Zip: <strong>${last_zip}</strong></p>`;
  }

  if(localStorage.getItem("last_vin")) {
    const last_vin = localStorage.getItem("last_vin");
    const date = localStorage.getItem("last-lookup-date");
    container.innerHTML += `<p class="locals">Last VIN: <strong>${last_vin}</strong></p>`;
  }

  if(localStorage.getItem("last-calculator-date")) {
    const last_calculator_date = localStorage.getItem("last-calculator-date");
    container.innerHTML += `<p class="locals">Last Calculation: <strong>${last_calculator_date}</strong></p>`;
  }


  document.querySelector(".service-api").appendChild(container);



  const form = document.createElement("form");
  form.classList.add("car-calculator-form");

  form.innerHTML = `
    <h3>Car Value & Profit Estimator</h3>

    <label for="vin">VIN:</label>
    <input type="text" id="vin" name="vin" maxlength="17" required>

    <label for="mileage">Mileage:</label>
    <input type="number" id="mileage" name="mileage" required>

    <label for="zip">Zip Code:</label>
    <input type="text" id="zip" name="zip" maxlength="5" required>

    <label for="purchase-cost">Original Purchase Cost ($):</label>
    <input type="number" id="purchase-cost" name="purchase-cost" min="0" required>

    <label for="repair-cost">Repair Costs ($):</label>
    <input type="number" id="repair-cost" name="repair-cost" min="0" required>

    <label for="extra-cost">Other Costs ($):</label>
    <input type="number" id="extra-cost" name="extra-cost" min="0" required>

    <button type="submit">Estimate & Calculate</button>

    <div id="car-calculator-result" class="car-calculator-result"></div>
  `;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const vin = form["vin"].value.trim();
    const mileage = parseInt(form["mileage"].value);
    const zip = form["zip"].value.trim();
    const purchaseCost = parseFloat(form["purchase-cost"].value);
    const repairCost = parseFloat(form["repair-cost"].value);
    const extraCost = parseFloat(form["extra-cost"].value);

    const resultContainer = document.getElementById("car-calculator-result");
    resultContainer.innerHTML = `<p>Loading vehicle data...</p>`;

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

      const userCosts = {
        mileage,
        zip,
        purchaseCost,
        repairs: repairCost,
        extraCosts: extraCost
      };

      // Call the AI function
      resultContainer.innerHTML = `<p>Generating estimate with AI...</p>`;
      await estimateCarValueWithAI(carInfo, userCosts, resultContainer);
      setLocalStorage("last-calculator-date", new Date().toISOString().split("T")[0]);

    } catch (err) {
      console.error("Error during estimation:", err);
      resultContainer.innerHTML = `<p class="error">Something went wrong. Please try again.</p>`;
    }
  });

  return form;
}

async function estimateCarValueWithAI(carInfo, userCosts, resultContainer) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const prompt = `
    Estimate the fair market value of a used car with the following details:
    - Year: ${carInfo.ModelYear}
    - Make: ${carInfo.Make}
    - Model: ${carInfo.Model}
    - Trim: ${carInfo.Series || "N/A"}
    - Engine: ${carInfo.EngineCylinders} cyl, ${carInfo.DisplacementL}L
    - Transmission: ${carInfo.TransmissionStyle}
    - Location: ZIP ${userCosts.zip}
    - Condition: Good
    - Mileage: ${userCosts.mileage || "unknown"}

    Financials:
    - Original purchase cost: $${userCosts.purchaseCost}
    - Repairs: $${userCosts.repairs}
    - Extra costs (fees, transport, etc.): $${userCosts.extraCosts}

    Total investment = purchase + repairs + extra costs.
    Please provide:
    - An estimated resale value
    - A breakdown of costs
    - Estimated profit or loss

    Keep the response concise and professional.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const json = await response.json();
  const message = json.choices?.[0]?.message?.content || "No estimate received.";

  const formatted = formatAIResponse(message);

  resultContainer.innerHTML += `
    <div class="info formatted-ai">
     ${formatted}
    </div>
  `;
}

function formatAIResponse(markdownText) {
  // Convert markdown-style headings and formatting to HTML
  return markdownText
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.*?)$/gm, '<h4>$1</h4>')
    .replace(/- \*\*(.*?):\*\* (.*)/g, '<p><strong>$1:</strong> $2</p>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '<br>'); // Convert double line breaks to <br> for spacing
}