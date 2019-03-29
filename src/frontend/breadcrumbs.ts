export function breadcrumbs(path: string) {
  const el = document.createElement("div");

  const spacing = "0.5em";

  path.split("/").forEach((part, i, parts) => {
    if (i === 0) {
      // This is the empty element from the leading "/"
      return;
    }

    if (i > 1) {
      const sep = document.createElement("span");
      sep.textContent = "/";
      sep.style.marginRight = spacing;
      el.appendChild(sep);
    }

    if (i === parts.length - 1) {
      const crumb = document.createElement("span");
      crumb.textContent = part;
      el.appendChild(crumb);
      return;
    }

    const crumb = document.createElement("a");
    crumb.textContent = part;
    crumb.style.marginRight = spacing;
    crumb.href = parts.slice(0, i + 1).join("/");
    el.appendChild(crumb);
  });

  return el;
}
