const keyboard = document.querySelector('.keyboard')
keyboard.innerHTML = "";
const LANG = "en"
const LANGKEYS = [16, 20]
const BLOCKPRINTKEYS = [17, 18]

init = () => {
    fetch("../dev/keyboard.json").then(res => res.json()).then(data => {
        let sections = Object.keys(data[LANG])
        let template = ""
        sections.map(s => {
            let templSection = ""
            let keys = Object.keys(data[LANG][s])
            keys.map(k => {
                let key = data[LANG][s][k]
                templSection += `<div 
                    class="${key.class.split(",").join(" ")}" 
                    data-key="${key.datakey}"
                    ${key.dReg !== undefined ? "data-downReg=" + key.dReg : ""}
                    ${key.upReg !== undefined ? "data-upReg=" + key.upReg : ""}
                    ${key.direction !== undefined ? "data-direction=" + key.direction : ""}>${key.value}</div>`
            })
            template += `<section class=${s}>${templSection}</section>`
        })
        keyboard.innerHTML = template

        const keys =  Array.from(keyboard.querySelectorAll('.key'))
        let keyUpNow = []
        keys.map(key => {

            key.addEventListener('mousedown', (e) => {
                e.preventDefault()
                let key = e.target
                keyUpNow.push(e.target)
                if(+key.getAttribute('data-key') != 20) {
                    key.classList.add('active') 
                } else {
                    key.classList.contains('active') ? key.classList.remove('active') : key.classList.add('active')
                }

                if (!key.classList.contains('system')) {
                    output.value += key.textContent
                }
            })

            window.addEventListener('mouseup', (e) => {
                e.preventDefault()
                keyUpNow.map(key => {
                    if(+key.getAttribute('data-key')  != 20) {
                        key.classList.remove('active')
                    }
                })
                keyUpNow = []
            })
        })
    })   
}

/*refresh = (btn) => {
    fetch("../dev/keyboard.json").then(res => res.json()).then(data => {   
        let sections = Object.keys(data[LANG])
        sections.map(s => {
            let keys = Object.keys(data[LANG][s])
        })
    })
}*/

init()

changeRegister = (active = true) => {
    if (active) {
        let upReg = Array.from(document.querySelectorAll('.key[data-upreg]'))
        upReg.map(key => {
           key.textContent = key.getAttribute('data-upreg')
        })
    } else {
        let downReg = Array.from(document.querySelectorAll('.key[data-downreg]'))
        downReg.map(key => {
            key.textContent = key.getAttribute('data-downreg')
        })
    }
}

const output = document.querySelector('.output')
systemKeyHandling = (key, event) => {
    if(event == "keyup") {
        let checkBtn = false
        LANGKEYS.map(langkey => {
            if(langkey == +key.getAttribute('data-key'))
                checkBtn = true
        })

        if(!checkBtn) 
            return
    }

    getCursorPos = (obj) => {
        obj.focus()
        if(obj.selectionStart) 
            return obj.selectionStart
        return 0
    }

    setCursorPos = (obj, position, direction = false) => {
        if (direction) {
            obj.selectionStart = position
        } else {
            obj.selectionEnd  = (position < 0) ? 0 : position
        }
    }
    searchNewLine = (text, position, direction = false) => {
        if (!direction) {
            for (let i = position; i < text.length; i++) {
                if (text[i] == "\n")
                    return i              
            }
            return text.length
        } else {
            for (let i = position; i > 0; i--) {
                if (text[i] == "\n")
                    return i
            }
            return 0
        }
    }

    isActiveShiftOrCapsLock = () => {
        let CapsLock = document.querySelectorAll('.key[data-key="20"]')
        let Shift = document.querySelectorAll('.key[data-key="16"]')
        let btns = [...CapsLock, ...Shift]
        for(let i = 0; i < btns.length; i++) {
            if(btns[i].classList.contains('active'))
                return true
        }

        return false
    }

    let cursorPos, text
    let newtext = []
    switch (key.getAttribute('data-key')) {
        case "9":
            text = [...output.value]
            cursorPos = getCursorPos(output)
            text.map((c, ind) => {
                newtext.push(c)
                if (ind + 1 == cursorPos) {
                    newtext.push("  ")
                }
            })
            text = newtext.join("")
            newtext = []
            output.value = text
            setCursorPos(output, cursorPos + 2)
            break;
        case "8":
            text = [...output.value]
            cursorPos = getCursorPos(output)
            output.value = [...text.slice(0, cursorPos - 1), ...text.slice(cursorPos)].join("")
            setCursorPos(output, cursorPos - 1)
            break;
        case "37":
            cursorPos = getCursorPos(output)
            setCursorPos(output, cursorPos - 1)
            break;
        case "39":
            cursorPos = getCursorPos(output)
            setCursorPos(output, cursorPos + 1, true)
            break;
        case "32": 
        text = [...output.value]
        cursorPos = getCursorPos(output)
        text.map((c, ind) => {
            newtext.push(c)
            if (ind + 1 == cursorPos) {
                newtext.push(" ")
            }
        })
        text = newtext.join("")
        newtext = []
        output.value = text
        setCursorPos(output, cursorPos + 1)
        break;
        case "46":
            text = [...output.value]
            cursorPos = getCursorPos(output)
            output.value = [...text.slice(0, cursorPos), ...text.slice(cursorPos + 1)].join("")
            setCursorPos(output, cursorPos)
        break;
        case "13":
            text = [...output.value]
            cursorPos = getCursorPos(output) 
            text.map((c, ind) => {
                newtext.push(c)
                if (ind + 1 == cursorPos) {
                    newtext.push("\n")
                }
            })
            text = newtext.join("")
            newtext = []
            output.value = text
            setCursorPos(output, cursorPos + 1)
            break;
        case "40":
            text = [...output.value]
            cursorPos = getCursorPos(output)
            setCursorPos(output, searchNewLine(text, cursorPos) + 1, true)    
            break;
        case "38":
            text = [...output.value]
            cursorPos = getCursorPos(output)
            setCursorPos(output, searchNewLine(text, cursorPos - 1, true)) 
            break;
        case "16":
            changeRegister(isActiveShiftOrCapsLock())
            break;
        case "20":
            changeRegister(isActiveShiftOrCapsLock())
            break;
        case "17":
            break;
        case "18":
            break;
    }
}

keyHandling = (key) => {
    let cursorPos, text
    let newtext = []

    getCursorPos = (obj) => {
        obj.focus()
        if(obj.selectionStart) 
            return obj.selectionStart
        return 0
    }

    setCursorPos = (obj, position, direction = false) => {
        if (direction) {
            obj.selectionStart = position
        } else {
            obj.selectionEnd  = (position < 0) ? 0 : position
        }
    }


    let blockPrintKeysEls = []
    BLOCKPRINTKEYS.map(k => {
        blockPrintKeysEls = [...blockPrintKeysEls, ...document.querySelectorAll(`.key[data-key="${k}"]`)]
    })
    
    let isButtonPush = false
    blockPrintKeysEls.map(key => {
        if(key.classList.contains('active'))
            isButtonPush = true
    })
    
    if(!isButtonPush) {
        text = [...output.value]
        if (text.length == 0) {
            output.value += key.textContent
            return 
        }

        cursorPos = getCursorPos(output)
        text.map((c, ind) => {
            newtext.push(c)
            if (ind + 1 == cursorPos) {
                newtext.push(key.textContent)
            }
        })
        text = newtext.join("")
        newtext = []
        output.value = text
        setCursorPos(output, cursorPos + 1)
    }
}

window.addEventListener('keydown', (e) => {
    e.preventDefault()
    const key = document.querySelector(`div[data-key="${e.keyCode}"]`)
    
    if (e.keyCode != 20) {
        key.classList.add('active')
    } else {
        key.classList.contains('active') ? key.classList.remove('active') : key.classList.add('active')
    }
    
    key.classList.contains('system') ? systemKeyHandling(key, e.type) : keyHandling(key) 
    
})

window.addEventListener('keyup', (e) => {
    e.preventDefault()
    const key = document.querySelector(`div[data-key="${e.keyCode}"]`)
    if( e.keyCode != 20) {
        key.classList.remove('active')
    }
    key.classList.contains('system') ? systemKeyHandling(key, e.type) : null; 
} )


