
const utils = require("./utils");
let { execSync } = require("child_process");
var currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
  .toString()
  .replace(/\s+/, "");

function updateCode({ commit = "update" } = {}) {
  const status = execSync("git status");
  console.log(status.toString());
  const reg = RegExp(/modified:/);
  const modified = reg.test(status.toString());
  if (modified) {
    execSync("git add .");
    execSync(`git commit -m "${commit}"`);
    execSync(`git pull origin ${currentBranch}`);
    execSync(`git push origin ${currentBranch}`);
  }
}

function checkoutBranch({ branch }) {
  updateCode();
  execSync(`git checkout ${branch}`);
  execSync(`git pull origin ${branch}`);
}

function feature({ feature }) {
  updateCode();
  const dateStr = utils.getDateStr();
  const branch = `feature/${dateStr}-${feature}`;
  execSync(`git checkout -b ${branch}`);
  execSync(`git push origin ${branch}`);
}

function release({ release }) {
  updateCode();
  const version = utils.getVersion();
  const branch = `${release}${version}`;
  execSync(`git checkout -b ${branch}`);
  execSync(`git push origin ${branch}`);
}

function tag() {
  // 当前要打tag的分支
  const tag = currentBranch.slice(
    currentBranch.length - 10,
    currentBranch.length
  );

  if (currentBranch !== "master") {
    execSync("git checkout master");
  }

  execSync(`git tag ${tag}`);
  execSync("git push origin --tags");

  // 删除分支
  execSync(`git push origin :${currentBranch}`);
  execSync(`git branch ${currentBranch} -D`);
  execSync("git tag");
}

module.exports = {
  updateCode,
  feature,
  release,
  checkoutBranch,
  tag
};
