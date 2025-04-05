import { getLocalStorage, setLocalStorage, renderCarLookupForm, renderCarShopFinderForm} from "./utils.mjs";

export default class ServiceDetails {
  constructor(ServiceId, dataSource) {
    this.serviceId = ServiceId;
    this.service = {};
    this.dataSource = dataSource;
  }
  async init() {
    console.log("Service Details initialized");
    console.log(this.serviceId);
    console.log(this.dataSource);
    this.service = await this.dataSource.findServiceById(this.serviceId);

    this.renderServiceDetails("main");

    this.loadServiceAPI();

  }
  
  renderServiceDetails(selector) {
    const title = document.querySelector("title");
    title.innerText = `OKCAR | ${this.service.name}`;
  
    const element = document.querySelector(selector);
    element.innerHTML = `
      <section class="service-detail">
        <img id="serviceImage" class="service-img" src="${this.service.icon}" 
             alt="${this.service.name}" loading="lazy" />
        <h3>${this.service.name}</h3>
        
        <p class="service-description">${this.service.description}</p>
      </section>
      
      <div class="service-api">
        
        
      </div>`;
  }

  loadServiceAPI() {
    const apiContainer = document.querySelector(".service-api");

    if (this.serviceId === "lookup") {
      apiContainer.appendChild(renderCarLookupForm());
    }else if (this.serviceId === "carshop") {
      apiContainer.appendChild(renderCarShopFinderForm());
    } else if (this.serviceId === "services") {
      apiContainer.innerHTML = `<p class="error">This service is not available yet.</p>`;
    } else {
      apiContainer.innerHTML = `<p class="error">Invalid service ID.</p>`;
    }
  }
}


