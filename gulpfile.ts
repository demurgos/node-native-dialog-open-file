import * as gulp from "gulp";
import * as minimist from "minimist";
import { ParsedArgs } from "minimist";
import NeonCrate from "neon-cli/lib/crate";
import NeonProject from "neon-cli/lib/project";
import * as buildTools from "turbo-gulp";

interface Options {
  devDist?: string;
}

const options: Options & ParsedArgs = minimist(process.argv.slice(2), {
  string: ["devDist"],
  default: {devDist: undefined},
  alias: {devDist: "dev-dist"},
});

const project: buildTools.Project = {
  root: __dirname,
  packageJson: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src",
  tslint: {
    configuration: {
      rules: {
        "no-submodule-import": false,
      },
    },
  },
};

const lib: buildTools.LibTarget = {
  project,
  name: "lib",
  srcDir: "src/lib",
  scripts: ["**/*.ts"],
  mainModule: "index",
  dist: {
    packageJsonMap: (old: buildTools.PackageJson): buildTools.PackageJson => {
      const version: string = options.devDist !== undefined ? `${old.version}-build.${options.devDist}` : old.version;
      return <any> {...old, version, scripts: undefined, private: false};
    },
    npmPublish: {
      tag: options.devDist !== undefined ? "next" : "latest",
    },
  },
  tscOptions: {
    skipLibCheck: true,
  },
  typedoc: {
    dir: "typedoc",
    name: "Native Dialog - Open File",
    deploy: {
      repository: "git@github.com:demurgos/node-native-dialog-open-file.git",
      branch: "gh-pages",
    },
  },
  copy: [
    {
      files: ["**/*.json"],
    },
  ],
  clean: {
    dirs: ["build/lib", "dist/lib"],
  },
};

const example: buildTools.NodeTarget = {
  project,
  name: "example",
  srcDir: "src",
  scripts: ["example/**/*.ts", "lib/**/*.ts", "native/**/*.ts"],
  tsconfigJson: "src/example/tsconfig.json",
  mainModule: "example/main",
  customTypingsDir: "src/custom-typings",
  tscOptions: {
    skipLibCheck: true,
  },
  clean: {
    dirs: ["build/example", "dist/example"],
  },
  copy: [{files: ["native/index.d.ts"]}],
};

const test: buildTools.MochaTarget = {
  project,
  name: "test",
  srcDir: "src",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  customTypingsDir: "src/custom-typings",
  tscOptions: {
    skipLibCheck: true,
  },
  copy: [{files: ["test/scrapping/**/*.html"]}],
  clean: {
    dirs: ["build/test"],
  },
};

const libTasks: any = buildTools.registerLibTasks(gulp, lib);
buildTools.registerMochaTasks(gulp, test);
const exampleTasks: any = buildTools.registerNodeTasks(gulp, example);
buildTools.projectTasks.registerAll(gulp, project);

gulp.task("example:neon", function () {
  const crateRoot: string = "."; // Crate root (with Cargo.toml) relative to project root
  const neonProject: NeonProject = new NeonProject(project.root, {crate: crateRoot});
  const outNodeFile: string = "build/example/native/index.node";
  const neonCrate: NeonCrate = new NeonCrate(neonProject, {subdirectory: crateRoot, nodefile: outNodeFile});
  (neonProject as any).crate = neonCrate;
  return neonProject.build("stable", true, "undefined");
});

gulp.task("example:build-all", gulp.parallel("example:build", "example:neon"));

gulp.task("tsconfig.json", gulp.parallel("lib:tsconfig.json", "test:tsconfig.json", "example:tsconfig.json"));
gulp.task("dist", libTasks.dist);
