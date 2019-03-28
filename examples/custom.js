const s = shaded.initShader({path: "./custom.glsl"})
document.body.appendChild(s.domElement);

const slider = document.createElement("input");
slider.type = "range";
slider.min = 0;
slider.max = 1;
slider.step = 0.01;
slider.value = 0;
s.controls.domElement.insertBefore(slider, s.controls.domElement.firstChild);

slider.oninput = (e) => {
    s.shader.canvas.setUniform("u_slider", parseFloat(e.target.value));
    s.shader.render();
}
