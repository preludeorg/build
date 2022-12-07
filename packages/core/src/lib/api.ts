import { Service, ServiceConfig, Test } from "@theprelude/sdk";
import { isPWA } from "../utils/pwa";

function productHeader(): HeadersInit {
  return {
    _product: isPWA() ? "js-sdk-pwa" : "js-sdk-web",
  };
}

export interface Variant {
  name: string;
  code: string;
  readonly?: boolean;
}

export const newAccount = async (
  handle: string,
  host: string,
  signal?: AbortSignal
) => {
  const service = new Service({ host });
  return await service.iam.newAccount(handle, {
    signal,
    headers: productHeader(),
  });
};

export const getUsers = async (config: ServiceConfig, signal?: AbortSignal) => {
  const service = new Service(config);
  return await service.iam.getUsers({
    signal,
    headers: productHeader(),
  });
};

export const getTestList = async (
  config: ServiceConfig,
  signal?: AbortSignal
) => {
  const service = new Service(config);
  return service.build.listTests({ signal, headers: productHeader() });
};

export const getTest = async (
  id: string,
  config: ServiceConfig,
  signal?: AbortSignal
) => {
  const service = new Service(config);
  return service.build.getTest(id, { signal, headers: productHeader() });
};

export const getVariant = async (
  file: string,
  config: ServiceConfig,
  signal?: AbortSignal
) => {
  const service = new Service(config);
  return service.build.getVariant(file, { signal, headers: productHeader() });
};

export const variantExists = async (
  id: string,
  file: string,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const variants = await getTest(id, config, signal);
  return variants.includes(file);
};

export const deleteTest = async (
  id: string,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  return service.build.deleteTest(id, { signal, headers: productHeader() });
};

export const deleteVariant = async (
  name: string,
  config: ServiceConfig,
  signal?: AbortSignal
) => {
  const service = new Service(config);
  return service.build.deleteVariant(name, {
    signal,
    headers: productHeader(),
  });
};

export const createVariant = async (
  variant: Variant,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  await service.build.createVariant(variant.name, variant.code, {
    signal,
    headers: productHeader(),
  });
};

export const createTest = async (
  testId: string,
  question: string,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  await service.build.createTest(testId, question, {
    signal,
    headers: productHeader(),
  });
};

export const build = async (variantName: string, config: ServiceConfig) => {
  const service = new Service(config);
  return await service.build.computeProxy(variantName, {
    headers: productHeader(),
  });
};

export const verifiedTests = async (config: ServiceConfig) => {
  const service = new Service(config);
  return await service.build.verifiedTests({ headers: productHeader() });
};

export const deleteVerified = async (name: string, config: ServiceConfig) => {
  const service = new Service(config);
  return await service.build.deleteVerified(name, { headers: productHeader() });
};

export const createURL = async (name: string, config: ServiceConfig) => {
  const service = new Service(config);
  return await service.build.createURL(name, { headers: productHeader() });
};

export const isPreludeTest = (test: Test) => test.account_id === "prelude";
