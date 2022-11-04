import { Service, ServiceConfig } from "@theprelude/sdk";

export const getTestList = async (config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.listTests();
};

export const getTest = async (id: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.getTest(id);
};

export const getVariant = async (file: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.getVariant(file);
};

export const deleteTest = async (id: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.deleteTest(id);
};

export const deleteVariant = async (name: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.deleteVariant(name);
};
