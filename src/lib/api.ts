import { Service, ServiceConfig } from "@theprelude/sdk";

export interface Variant {
  name: string;
  code: string;
}

export const getTestList = async (
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  return service.build.listTests({ signal });
};

export const getTest = async (
  id: string,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  return service.build.getTest(id, { signal });
};

export const getVariant = async (
  file: string,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  return service.build.getVariant(file, { signal });
};

export const deleteTest = async (
  id: string,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  return service.build.deleteTest(id, { signal });
};

export const deleteVariant = async (
  name: string,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  return service.build.deleteVariant(name, { signal });
};

export const createVariant = async (
  variant: Variant,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  await service.build.createVariant(variant.name, variant.code, { signal });
};
