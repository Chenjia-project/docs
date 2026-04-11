{
  lib,
  buildNpmPackage,
  importNpmLock,
  nodejs,
}:
buildNpmPackage (finalAttrs: {
  pname = "chenjia-docs";
  version = (lib.importJSON ./package.json).version;

  inherit nodejs;

  src = lib.fileset.toSource {
    root = ./.;

    fileset = lib.fileset.unions [
      ./LICENSE
      ./package-lock.json
      ./package.json
      ./docs
    ];
  };

  npmDeps = importNpmLock {
    npmRoot = ./.;
  };

  npmConfigHook = importNpmLock.npmConfigHook;

  env.CI = true;
  npmBuildScript = "docs:build";

  dontNpmInstall = true;
  installPhase = ''
    cp -r docs/.vuepress/dist $out
  '';

  meta = {
    description = "Documentation for Chenjia";
    homepage = "https://docs.chenjia.one";
    license = lib.licenses.cc-by-nc-sa-40;
    inherit (nodejs.meta) platforms;
  };
})
