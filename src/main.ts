document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('contextmenu', (event) => event.preventDefault());

  const colorPicker = document.getElementById('color-picker') as HTMLInputElement;
  const eyeDropperBtn = document.getElementById('eyedropper-btn') as HTMLButtonElement;
  addColorToList();

  colorPicker.addEventListener('change', (event) => {
    if (event.target) {
      const color = (event.target as HTMLInputElement).value;
      setColor(color);
    }
  });

  eyeDropperBtn.addEventListener('click', async () => {
    try {
      eyeDropperBtn.style.setProperty('--alpha', '1');
      const eyeDropper = new (window as any).EyeDropper();
      const { sRGBHex } = await eyeDropper.open();
      eyeDropperBtn.style.setProperty('--alpha', '0.5');
      setColor(sRGBHex);
    } catch (error) {
      console.error(error);
    }
  });

  function updateColor(color: string) {
    const selectedColor = document.getElementById('selected-color');
    const light1 = document.getElementById('light1');
    const light2 = document.getElementById('light2');
    const dark1 = document.getElementById('dark1');
    const dark2 = document.getElementById('dark2');
    if (selectedColor) selectedColor.style.backgroundColor = color;
    if (light1) light1.style.backgroundColor = lightenDarkenColor(color, 40);
    if (light2) light2.style.backgroundColor = lightenDarkenColor(color, 20);
    if (dark1) dark1.style.backgroundColor = lightenDarkenColor(color, -20);
    if (dark2) dark2.style.backgroundColor = lightenDarkenColor(color, -40);

    const { r, g, b } = hexToRgb(color);
    const { h, s, l } = rgbToHsl(r, g, b);
    const hexCode = document.getElementById('hex-code');
    const rgbCode = document.getElementById('rgb-code');
    const hslCode = document.getElementById('hsl-code');
    if (hexCode) hexCode.textContent = color;
    if (rgbCode) rgbCode.textContent = `rgb(${r}, ${g}, ${b})`;
    if (hslCode) hslCode.textContent = `hsl(${h}, ${s}%, ${l}%)`;
    colorPicker.value = color;
    // document.documentElement.style.setProperty('--color',  `${r}, ${g}, ${b}`)
  }

  function lightenDarkenColor(col: string, amt: number) {
    let num = parseInt(col.slice(1), 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00ff) + amt;
    let b = (num & 0x0000ff) + amt;
    let newColor =
      '#' +
      (
        0x1000000 +
        (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
        (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
        (b < 255 ? (b < 1 ? 0 : b) : 255)
      )
        .toString(16)
        .slice(1);
    return newColor;
  }

  function hexToRgb(hex: string) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((x) => x + x)
        .join('');
    }
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  }

  function rgbToHsl(r: number, g: number, b: number) {
    (r /= 255), (g /= 255), (b /= 255);
    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // Achromatic (gray)
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h = Math.round(h * 60);
    }
    return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function addColorToList() {
    const colorList = document.getElementById('color-list');
    if (colorList) {
      colorList.innerHTML = '';
    }

    const colors = getColors();
    colors.forEach((color: string) => {
      const colorBox = document.createElement('div');
      colorBox.classList.add('color-box');
      colorBox.style.backgroundColor = color;
      if (colorList) colorList.prepend(colorBox);
      colorBox.addEventListener('click', () => updateColor(color));
    });

    if (!colors.length) {
      updateColor('#0099ff');
    } else {
      updateColor(colors[colors.length - 1]);
    }
  }

  async function copyToClipboard(colorCode: string) {
    try {
      await navigator.clipboard.writeText(colorCode);
    } catch (error) {
      console.error(error);
    }
  }

  const copyBtn = document.getElementsByClassName('copy-btn');
  [...copyBtn].forEach((btn) => {
    btn.addEventListener('click', async () => {
      const colorId = btn.getAttribute('data-color-id');
      const svgUse = btn.querySelector('svg use');

      btn.classList.add('copied');
      if (svgUse) {
        (svgUse as SVGUseElement).href.baseVal = (svgUse as SVGUseElement).href.baseVal.replace(
          '#copy',
          '#clipboard-check'
        );
      }
      if (colorId) {
        const colorCode = document.getElementById(colorId)?.textContent;
        if (colorCode) {
          await copyToClipboard(colorCode);
        }
      }

      setTimeout(() => {
        btn.classList.remove('copied');
        if (svgUse) {
          (svgUse as SVGUseElement).href.baseVal = (svgUse as SVGUseElement).href.baseVal.replace(
            '#clipboard-check',
            '#copy'
          );
        }
      }, 1500);
    });
  });

  function getColors() {
    return JSON.parse(localStorage.getItem('color-list') || '[]');
  }

  function setColor(color: string) {
    const colors = getColors();
    colors.push(color);
    if (colors.length > 12) colors.shift();

    localStorage.setItem('color-list', JSON.stringify(colors));
    addColorToList();
  }

  const trashBtn = document.getElementById('trash-btn') as HTMLButtonElement;
  trashBtn.addEventListener('click', () => {
    localStorage.removeItem('color-list');
    addColorToList();
  });
});
