const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const buildDir = path.join(__dirname, 'build')
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true })
}
fs.chmodSync(path.join(__dirname, 'deps', 'breakpad', 'configure'), 0o755);
spawnSync(path.join(__dirname, 'deps', 'breakpad', 'configure'), [], {
  cwd: buildDir,
  env: {
    ...process.env,
    CPPFLAGS: `-I${path.relative(buildDir, path.join(__dirname, 'deps'))}`
  },
  stdio: 'inherit'
})
const targets = ['src/processor/minidump_stackwalk']
if (process.platform === 'linux') {
  targets.push('src/tools/linux/dump_syms/dump_syms')
}
spawnSync('make', ['-C', buildDir, '-j', require('os').cpus().length, ...targets], {
  stdio: 'inherit'
})

if (process.platform === 'darwin') {
  spawnSync('xcodebuild', [`SYMROOT=${buildDir}/src/tools/mac/dump_syms`], {
    cwd: `${__dirname}/deps/breakpad/src/tools/mac/dump_syms`,
    stdio: 'inherit'
  })
}
