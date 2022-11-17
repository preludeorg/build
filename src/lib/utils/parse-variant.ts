const VARIANT_FORMAT =
  /([a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12})(_(\w+))?(-(\w+))?\.(\w+)/i;

const BUILD_VARIANT_FORMAT =
  /([a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12})(_(\w+))(-(\w+))/i;

interface ParsedVariant {
  variant: string;
  id: string;
  platform?: string;
  arch?: string;
  language: string;
}

interface ParsedBuildVariant {
  variant: string;
  id: string;
  platform: string;
  arch: string;
}

export function parseVariant(variantName: string): ParsedVariant | null {
  const results = variantName.match(VARIANT_FORMAT);
  if (!results) {
    return null;
  }
  let [variant, id, , platform, , arch, language] = results;
  return { variant, id, platform, arch, language };
}

export function parseBuildVariant(
  variantName: string
): ParsedBuildVariant | null {
  const results = variantName.match(BUILD_VARIANT_FORMAT);
  if (!results) {
    return null;
  }
  let [variant, id, , platform, , arch] = results;
  return { variant, id, platform, arch };
}
