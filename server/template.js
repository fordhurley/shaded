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
      const title = document.querySelector("title")
      title.textContent = "shaded: " + window.location.pathname;
    </script>

    <script>
      ${bodyScript}
    </script>
</body>
</html>
`;
};

module.exports = {
  listing: base("document.body.appendChild(shaded.initListing().domElement);"),
  shader: base("document.body.appendChild(shaded.initShader().domElement);")
};
