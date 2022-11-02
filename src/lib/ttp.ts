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

/** This is currently broken on the sdk so doing it manually */
export const deleteTTP = async (id: string, config: ServiceConfig) => {
  return fetch(`${config.host}/manifest/${id}`, {
    method: "DELETE",
    headers: {
      ...config.credentials,
    },
  });
};

export const deleteCodeFile = async (name: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.deleteCodeFile(name);
};
