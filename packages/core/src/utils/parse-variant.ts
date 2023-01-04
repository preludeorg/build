const BUILD_VST_FORMAT =
  /([a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12})(_(\w+))(-(\w+))(\.\w+)?/i;

interface ParsedBuildVST {
  vst: string;
  id: string;
  platform: string;
  arch: string;
}

export function parseBuildVerifiedSecurityTest(
  vstName: string
): ParsedBuildVST | null {
  const results = vstName.match(BUILD_VST_FORMAT);
  if (!results) {
    return null;
  }
  const [vst, id, , platform, , arch] = results;
  return { vst, id, platform, arch };
}
