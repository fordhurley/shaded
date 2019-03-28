const base = bodyScript => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>shaded</title>
    <style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        font-size: 10pt;
    }
    </style>
    <script src="/shaded.js"></script>
</head>

<body>
    <script>
        ${bodyScript}
    </script>
</body>
</html>
`;
};

module.exports = {
  listing: base(`const l = shaded.initListing({
        path: window.location.pathname
      });
      document.body.appendChild(l.domElement);`),

  shader: base(`const s = shaded.initShader({
        path: window.location.pathname
      });
      document.body.appendChild(s.domElement);`),

  custom: base
};
