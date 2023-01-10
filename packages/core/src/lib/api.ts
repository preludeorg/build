import { Permissions, Service, ServiceConfig, Test } from "@theprelude/sdk";
import { isPWA } from "../utils/pwa";

function productHeader(): HeadersInit {
  return {
    _product: isPWA() ? "js-sdk-pwa" : "js-sdk-web",
  };
}

export interface VerifiedSecurityTest {
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

export const listTests = async (
  config: ServiceConfig,
  signal?: AbortSignal
) => {
  const service = new Service(config);
  return service.build.listTests({ signal, headers: productHeader() });
};

export const createTest = async (
  testId: string,
  rule: string,
  code: string,
  config: ServiceConfig,
  signal: AbortSignal
) => {
  const service = new Service(config);
  await service.build.createTest(testId, rule, code, {
    signal,
    headers: productHeader(),
  });
};

export const deleteTest = async (
  id: string,
  config: ServiceConfig,
  signal?: AbortSignal
) => {
  const service = new Service(config);
  return service.build.deleteTest(id, { signal, headers: productHeader() });
};

export const downloadTest = async (
  name: string,
  config: ServiceConfig,
  signal?: AbortSignal
) => {
  const service = new Service(config);
  return service.build.downloadTest(name, { signal, headers: productHeader() });
};

export const uploadTest = async (
  name: string,
  code: string,
  config: ServiceConfig,
  signal?: AbortSignal
) => {
  const service = new Service(config);
  return service.build.uploadTest(name, code, {
    signal,
    headers: productHeader(),
  });
};

export const buildTest = async (name: string, config: ServiceConfig) => {
  const service = new Service(config);
  return await service.build.computeProxy(name, {
    headers: productHeader(),
  });
};

export const createURL = async (vst: string, config: ServiceConfig) => {
  const service = new Service(config);
  return await service.build.createURL(vst, { headers: productHeader() });
};

export const getProbeList = async (config: ServiceConfig) => {
  const service = new Service(config);
  return await service.detect.listProbes();
};

export const getActivity = async (config: ServiceConfig) => {
  const service = new Service(config);
  return await service.detect.describeActivity();
};

export const purgeAccount = async (config: ServiceConfig) => {
  const service = new Service(config);
  return await service.iam.purgeAccount({
    headers: productHeader(),
    keepalive: true,
  });
};

export const changeUserHandle = async (
  toHandle: string,
  fromHandle: string,
  config: ServiceConfig
) => {
  const service = new Service(config);

  const user = await service.iam.createUser(Permissions.ADMIN, toHandle, {
    headers: productHeader(),
  });

  await service.iam.deleteUser(fromHandle, { headers: productHeader() });

  return user;
};

export const isPreludeTest = (test: Test) => test.account_id === "prelude";
