import { Service, ServiceConfig } from "@theprelude/sdk";

export interface TTP {
  id: string;
  question: string;
}

export const getManifest = async (config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.listManifest();
};

export const getTTP = async (id: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.getTTP(id);
};

export const getTest = async (file: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.getTest(file);
};

export const deleteTTP = async (id: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.deleteTTP(id);
};

export const deleteTest = async (name: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.deleteTest(name);
};
