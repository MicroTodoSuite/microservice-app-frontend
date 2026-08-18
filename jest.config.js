// Jest config (spec 006 / T014). Unit scope covers the Vuex store business
// logic (mutations). babel-jest is isolated from the webpack Babel 6 `.babelrc`
// (babelrc:false + configFile:false) so the two toolchains never collide.
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/store/mutations.js'],
  coverageReporters: ['text-summary', 'lcov'],
  coverageThreshold: {
    global: { statements: 70, branches: 70, functions: 70, lines: 70 },
  },
  transform: {
    '^.+\\.js$': ['babel-jest', {
      babelrc: false,
      configFile: false,
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    }],
  },
};
