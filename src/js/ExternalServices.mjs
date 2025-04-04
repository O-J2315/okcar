import servicesData from "../public/json/services.json"; // Importing the local JSON file

export default class ExternalServices {
  async getServices() {
    return servicesData.services; // Returns all services from the JSON
  }

  async findServiceById(id) {
    return servicesData.services.find(service => service.id === id) || null; // Finds a service by ID
  }
}