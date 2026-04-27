module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    testTimeout: 30000,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/database/seed.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov']
};
