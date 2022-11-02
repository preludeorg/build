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

export const getCodeFile = async (file: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.getCodeFile(file);
};

export const deleteTTP = async (id: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.deleteTTP(id);
};

export const deleteCodeFile = async (name: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.deleteCodeFile(name);
};
