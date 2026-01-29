module.exports = {
  '*': (files) => {
    // bỏ qua file test khi check lint
    const testFiles = files.filter(f => f.includes('tests/') || f.includes('.spec.') || f.includes('.test.'));
    const nonTestFiles = files.filter(f => !f.includes('tests/') && !f.includes('.spec.') && !f.includes('.test.'));
    return nonTestFiles.length > 0 ? ['eslint --fix --no-warn-ignored'] : [];
  },
  '**/*.ts?(x)': (files) => {
    const shouldTypeCheck = files.some(f => f.startsWith('src/') && !f.includes('solana-sdk/'));
    return shouldTypeCheck ? ['npm run check-types'] : [];
  },
};
