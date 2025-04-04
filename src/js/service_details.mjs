import { getLocalStorage, setLocalStorage } from "./utils.mjs";

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

  }
  
  renderServiceDetails(selector) {
    const title = document.querySelector("title");
    title.innerText = `OKCAR | ${this.service.name}`;
  
    const element = document.querySelector(selector);
    element.innerHTML = `
      <section class="service-detail">
        <h3>${this.service.name}</h3>
        <img id="serviceImage" class="divider" src="${this.service.icon}" 
             alt="${this.service.name}" loading="lazy" />
        <p class="service-description">${this.service.description}</p>
        <a href="${this.service.link}" class="service-link">Learn More</a>
      </section>`;
  }
}


