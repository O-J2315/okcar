import { getParam, loadHeaderFooter } from "./utils.mjs";
import ServiceDetails from "./service_details.mjs";
import ExternalServices from "./ExternalServices.mjs";

const serviceId = getParam("service");
const dataSource = new ExternalServices();

const service = new ServiceDetails(serviceId, dataSource);

loadHeaderFooter();
service.init();
