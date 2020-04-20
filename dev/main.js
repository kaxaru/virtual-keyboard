const { body } = document;
body.innerHTML = `<div class='wrapper'>
                    <span class="article">Windows virtual keyboard</span>
                    <span class="legends">Switch language: left shift + left alt</span>
                    <textarea class="output" name="" id="" cols="30" rows="10" autofocus></textarea>
                    <div class="keyboard"></div>
                 </div>`;
const keyboard = document.querySelector('.keyboard');
keyboard.innerHTML = '';
const SHIFT = 16;
const CAPSLOCK = 20;
const CTRL = 17;
const ALT = 18;

const LANGKEYS = [SHIFT, CAPSLOCK];
const BLOCKPRINTKEYS = [CTRL, ALT];
let lang;

const refresh = () => {
  lang = localStorage.getItem('lang') === 'en' ? 'ru' : 'en';
  localStorage.setItem('lang', lang);
  const htmlToChar = (string) => (/&#/.test(string) ? String.fromCharCode(string.replace('&#', '')) : string);
  fetch('dev/keyboard.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((res) => res.json()).then((data) => {
    const sections = Object.keys(data.Lang[lang]);
    sections.forEach((s) => {
      const keys = Object.keys(data.Lang[lang][s]);
      keys.forEach((k) => {
        const key = data.Lang[lang][s][k];
        if (!/system/i.test(key.class)) {
          const element = document.querySelector(`.key[data-key="${key.datakey}"]`);
          element.setAttribute('data-downreg', htmlToChar(key.dReg));
          element.setAttribute('data-upreg', htmlToChar(key.upReg));
          element.textContent = htmlToChar(key.upReg);
        }
      });
    });
  });
};

const changeRegister = (active = true) => {
  const attr = (active) ? 'data-upreg' : 'data-downreg';
  const els = Array.from(document.querySelectorAll(`.key[${attr}]`));
  els.forEach((el) => {
    const key = el;
    if (el.classList.contains('number')) {
      key.textContent = key.getAttribute((document.querySelector('.CapsLock').classList.contains('active'))
        ? (attr === 'data-upreg') ? 'data-downreg' : 'data-upreg'
        : (attr !== 'data-upreg') ? 'data-downreg' : 'data-upreg');
    } else {
      key.textContent = key.getAttribute(attr);
    }
  });
};

const output = document.querySelector('.output');
const systemKeyHandling = (key, event, eventRepeat = false) => {
  if (event === 'keyup' || event === 'mouseup') {
    let checkBtn = false;
    LANGKEYS.map((langkey) => {
      if (langkey === +key.getAttribute('data-key')) { checkBtn = true; }
      return false;
    });

    if (!checkBtn) { return; }
  }

  const getCursorPos = (obj) => {
    obj.focus();
    if (obj.selectionStart) { return obj.selectionStart; }
    return 0;
  };

  const setCursorPos = (obj, position, direction = false) => {
    const object = obj;
    if (direction) {
      object.selectionStart = position;
    } else {
      object.selectionEnd = (position < 0) ? 0 : position;
    }
  };
  const searchNewLine = (text, position, direction = false) => {
    if (!direction) {
      for (let i = position; i < text.length; i += 1) {
        if (text[i] === '\n') { return i; }
      }
      return text.length;
    }
    for (let i = position; i > 0; i -= 1) {
      if (text[i] === '\n') { return i; }
    }
    return 0;
  };

  const isActiveShiftOrCapsLock = () => {
    let capitalLetterEls = [];
    let isCapitalLetters = false;
    LANGKEYS.forEach((k) => {
      capitalLetterEls = [...capitalLetterEls, ...document.querySelectorAll(`.key[data-key="${k}"]`)];
    });

    for (let i = 0; i < capitalLetterEls.length; i += 1) {
      if (capitalLetterEls[i].classList.contains('active')) {
        if (+capitalLetterEls[i].getAttribute('data-key') === SHIFT) {
          isCapitalLetters = true;
        }
        if (+capitalLetterEls[i].getAttribute('data-key') === CAPSLOCK) {
          isCapitalLetters = !isCapitalLetters;
        }
      }
    }
    return isCapitalLetters;
  };

  const checkActiveSystemKeys = () => {
    const systemKeys = document.querySelectorAll('.system.active');
    let isSystemKeysChangeLang = false;
    if (systemKeys > 3) {
      return isSystemKeysChangeLang;
    }
    for (let i = 0; i < systemKeys.length; i += 1) {
      if (systemKeys[i].classList.contains('LAlt') || systemKeys[i].classList.contains('LShift') || systemKeys[i].classList.contains('CapsLock')) {
        isSystemKeysChangeLang = true;
      } else {
        isSystemKeysChangeLang = false;
        break;
      }
    }
    return isSystemKeysChangeLang;
  };

  let cursorPos; let
    text;
  let newtext = [];
  switch (key.getAttribute('data-key')) {
    case '9':
      text = [...output.value];
      cursorPos = getCursorPos(output);
      if (text.length !== 0) {
        text.forEach((c, ind) => {
          newtext.push(c);
          if (ind + 1 === cursorPos) {
            newtext.push('  ');
          }
        });
        text = newtext.join('');
        newtext = [];
        output.value = text;
        setCursorPos(output, cursorPos + 2);
      } else {
        output.value = '  ';
      }

      break;
    case '8': {
      const selection = document.getSelection().toString();
      text = [...output.value];
      if (selection) {
        cursorPos = getCursorPos(output);
        output.value = output.value.replace(selection, '');
        setCursorPos(output, cursorPos);
      } else {
        cursorPos = getCursorPos(output);
        if (cursorPos !== 0) {
          output.value = [...text.slice(0, cursorPos - 1), ...text.slice(cursorPos)].join('');
          setCursorPos(output, cursorPos - 1);
        }
      }
      break;
    }
    case '37':
      cursorPos = getCursorPos(output);
      setCursorPos(output, cursorPos - 1);
      break;
    case '39':
      cursorPos = getCursorPos(output);
      setCursorPos(output, cursorPos + 1, true);
      break;
    case '32':
      text = [...output.value];
      if (text.length === 0) {
        output.value = ' ';
        break;
      }
      cursorPos = getCursorPos(output);
      text.map((c, ind) => {
        newtext.push(c);
        if (ind + 1 === cursorPos) {
          newtext.push(' ');
        }
        return false;
      });
      text = newtext.join('');
      newtext = [];
      output.value = text;
      setCursorPos(output, cursorPos + 1);
      break;
    case '46':
      text = [...output.value];
      cursorPos = getCursorPos(output);
      output.value = [...text.slice(0, cursorPos), ...text.slice(cursorPos + 1)].join('');
      setCursorPos(output, cursorPos);
      break;
    case '13':
      text = [...output.value];
      cursorPos = getCursorPos(output);
      text.map((c, ind) => {
        newtext.push(c);
        if (ind + 1 === cursorPos) {
          newtext.push('\n');
        }
        return false;
      });
      text = newtext.join('');
      newtext = [];
      output.value = text;
      setCursorPos(output, cursorPos + 1);
      break;
    case '40':
      text = [...output.value];
      cursorPos = getCursorPos(output);
      setCursorPos(output, searchNewLine(text, cursorPos) + 1, true);
      break;
    case '38':
      text = [...output.value];
      cursorPos = getCursorPos(output);
      setCursorPos(output, searchNewLine(text, cursorPos - 1, true));
      break;
    case '16':
      if (!eventRepeat && event === 'keydown') {
        if (key.getAttribute('data-direction') === 'left') {
          const leftAlt = document.querySelector('.LAlt');
          if (leftAlt.classList.contains('active') && checkActiveSystemKeys()) {
            refresh();
          }
        }
      }
      changeRegister(isActiveShiftOrCapsLock());
      break;
    case '20':
      changeRegister(isActiveShiftOrCapsLock());
      break;
    case '17':
      break;
    case '18':
      if (!eventRepeat && event === 'keydown') {
        if (key.getAttribute('data-direction') === 'left') {
          const leftShift = document.querySelector('.LShift');
          if (leftShift.classList.contains('active') && checkActiveSystemKeys()) {
            refresh();
          }
        }
      }
      break;
    default:
      break;
  }
};

const keyHandling = (key) => {
  let cursorPos; let
    text;
  let newtext = [];

  const getCursorPos = (obj) => {
    obj.focus();
    if (obj.selectionStart) { return obj.selectionStart; }
    return 0;
  };

  const setCursorPos = (obj, position, direction = false) => {
    const object = obj;
    if (direction) {
      object.selectionStart = position;
    } else {
      object.selectionEnd = (position < 0) ? 0 : position;
    }
  };


  let blockPrintKeysEls = [];
  BLOCKPRINTKEYS.forEach((k) => {
    blockPrintKeysEls = [...blockPrintKeysEls, ...document.querySelectorAll(`.key[data-key="${k}"]`)];
  });

  let isButtonPush = false;
  blockPrintKeysEls.forEach((k) => {
    if (k.classList.contains('active')) { isButtonPush = true; }
  });

  if (!isButtonPush) {
    text = [...output.value];
    if (text.length === 0) {
      output.value += key.textContent;
      return;
    }

    cursorPos = getCursorPos(output);
    text.map((c, ind) => {
      newtext.push(c);
      if (ind + 1 === cursorPos) {
        newtext.push(key.textContent);
      }
      return false;
    });
    text = newtext.join('');
    newtext = [];
    output.value = text;
    setCursorPos(output, cursorPos + 1);
  }
};

window.addEventListener('keydown', (e) => {
  e.preventDefault();
  let key;

  if (e.keyCode === CTRL || e.keyCode === ALT || e.keyCode === SHIFT) {
    key = e.location === 1
      ? document.querySelector(`.L${e.key}`)
      : e.key !== 'AltGraph' ? document.querySelector(`.R${e.key}`)
        : document.querySelector('.RAlt');
  } else {
    key = document.querySelector(`div[data-key="${e.keyCode}"]`);
  }

  if (e.keyCode !== CAPSLOCK) {
    if (key.classList !== null) {
      key.classList.add('active');
    }
  } else {
    key.classList.toggle('active');
  }
  if (key.classList.contains('system')) {
    systemKeyHandling(key, e.type, e.repeat);
  } else {
    keyHandling(key);
  }
});

window.addEventListener('keyup', (e) => {
  let key;
  if (e.keyCode === CTRL || e.keyCode === ALT || e.keyCode === SHIFT) {
    key = e.location === 1
      ? document.querySelector(`.L${e.key}`)
      : e.key !== 'AltGraph' ? document.querySelector(`.R${e.key}`)
        : document.querySelector('.RAlt');
  } else {
    key = document.querySelector(`div[data-key="${e.keyCode}"]`);
  }
  if (e.keyCode !== CAPSLOCK) {
    if (key.classList !== null) {
      key.classList.remove('active');
    }
  }
  if (key.classList.contains('system')) {
    systemKeyHandling(key, e.type, e.repeat);
  }
});

const init = () => {
  lang = localStorage.getItem('lang') || 'en';
  fetch('dev/keyboard.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((res) => res.json()).then((data) => {
    const sections = Object.keys(data.Lang[lang]);
    let template = '';
    sections.map((s) => {
      let templSection = '';
      const keys = Object.keys(data.Lang[lang][s]);
      keys.map((k) => {
        const key = data.Lang[lang][s][k];
        templSection += `<div 
                      class="${key.class.split(',').join(' ')}" 
                      data-key="${key.datakey}"
                      ${key.dReg !== undefined ? `data-downReg=${key.dReg}` : ''}
                      ${key.upReg !== undefined ? `data-upReg=${key.upReg}` : ''}
                      ${key.direction !== undefined ? `data-direction=${key.direction}` : ''}>${key.value}</div>`;
        return false;
      });
      template += `<section class=${s}>${templSection}</section>`;
      return false;
    });
    localStorage.setItem('lang', lang);
    keyboard.innerHTML = template;

    const keys = Array.from(keyboard.querySelectorAll('.key'));
    let keyUpNow = [];
    keys.map((key) => {
      key.addEventListener('mousedown', (e) => {
        if (e.target.nodeName === 'TEXTAREA') {
          return false;
        }
        keyUpNow.push(key);
        if (+key.getAttribute('data-key') !== CAPSLOCK) {
          key.classList.add('active');
        } else {
          key.classList.toggle('active');
        }

        if (key.classList.contains('system')) {
          systemKeyHandling(key, e.type, e.repeat);
        } else {
          keyHandling(key);
        }
        return false;
      });

      window.addEventListener('mouseup', (e) => {
        keyUpNow.map((k) => {
          if (+k.getAttribute('data-key') !== CAPSLOCK) {
            k.classList.remove('active');
          }
          return false;
        });
        if (e.target.nodeName === 'TEXTAREA') {
          return false;
        }
        if (key.classList.contains('system')) {
          systemKeyHandling(key, e.type, e.repeat);
        }
        keyUpNow = [];
        return false;
      });
      return false;
    });
  });
};

init();
