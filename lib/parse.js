const os = require('os');

const parse = (jsonString) => {
  // yarn <= 1.0.2
  try {
    const json = JSON.parse(jsonString);
    return json;
  } catch (e) {}

  // yarn >= 1.2.1
  // try parsing multiple context json string
  let tokens = '';

  for (const token of jsonString.split(os.EOL)) {
    tokens += token;

    try {
      const json = JSON.parse(tokens);
      if (json.type === 'table') {
        return json;
      }
      tokens = '';
    } catch (e) {}
  }

  return null;
};

module.exports = parse;