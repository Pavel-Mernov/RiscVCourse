
const fs = require("fs");
const { defaultResolver } = require("jest-resolve");

module.exports = (request, options) => {
  if (request.endsWith(".js")) {
    const tsReq = request.replace(/\.js$/, ".ts");
    try {
      const resolvedTs = defaultResolver(tsReq, options);
      if (fs.existsSync(resolvedTs)) return resolvedTs;
    } catch {}
  }

  return defaultResolver(request, options);
};
