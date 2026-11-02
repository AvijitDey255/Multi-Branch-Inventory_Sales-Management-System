module.exports = function(api) {
  api.cache(true);

  // Robust resolution of babel-preset-expo whether hoisted or nested in expo package
  let expoPreset = 'babel-preset-expo';
  try {
    expoPreset = require.resolve('babel-preset-expo');
  } catch {
    try {
      expoPreset = require.resolve('babel-preset-expo', {
        paths: [require.resolve('expo/package.json')],
      });
    } catch {
      expoPreset = 'babel-preset-expo';
    }
  }

  return {
    presets: [expoPreset],
    plugins: [],
  };
};
