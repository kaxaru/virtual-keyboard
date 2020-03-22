const keyboard = document.querySelector('.keyboard')
keyboard.innerHTML = "";
const LANGKEYS = [16, 20]
const BLOCKPRINTKEYS = [17, 18]
let lang

let init = () => {
    lang = localStorage.getItem('lang') || "en"
    fetch("../dev/keyboard.json").then(res => res.json()).then(data => {
        let sections = Object.keys(data["Lang"][lang])
        let template = ""
        sections.map(s => {
            let templSection = ""
            let keys = Object.keys(data["Lang"][lang][s])
            keys.map(k => {
                let key = data["Lang"][lang][s][k]
                templSection += `<div 
                    class="${key.class.split(",").join(" ")}" 
                    data-key="${key.datakey}"
                    ${key.dReg !== undefined ? "data-downReg=" + key.dReg : ""}
                    ${key.upReg !== undefined ? "data-upReg=" + key.upReg : ""}
                    ${key.direction !== undefined ? "data-direction=" + key.direction : ""}>${key.value}</div>`
            })
            template += `<section class=${s}>${templSection}</section>`
        })
        localStorage.setItem('lang', lang)
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

                key.classList.contains('system') ? systemKeyHandling(key, e.type, e.repeat) : keyHandling(key) 
            })

            window.addEventListener('mouseup', (e) => {
                e.preventDefault()
                keyUpNow.map(key => {
                    if(+key.getAttribute('data-key')  != 20) {
                        key.classList.remove('active')
                    }
                })
                key.classList.contains('system') ? systemKeyHandling(key, e.type, e.repeat) : null; 
                keyUpNow = []
            })
        })
    })   
}

let refresh = () => {
    lang = localStorage.getItem('lang') == "en" ? "ru" : "en"
    localStorage.setItem('lang', lang)
    let htmlToChar = (string) => {
        return /&#/.test(string) ? String.fromCharCode(string.replace("&#", "")) : string
    }
    fetch("../dev/keyboard.json").then(res => res.json()).then(data => {   
        let sections = Object.keys(data["Lang"][lang])
        sections.map(s => {
            let keys = Object.keys(data["Lang"][lang][s])
            keys.map(k => {
                let key = data["Lang"][lang][s][k]
                if(!/system/i.test(key.class)) {
                    let element = document.querySelector(`.key[data-key="${key.datakey}"]`)
                    element.setAttribute("data-downreg", htmlToChar(key.dReg))
                    element.setAttribute("data-upreg", htmlToChar(key.upReg))
                    element.textContent = htmlToChar(key.upReg)
                }
            })
        })
    })
}

init()

let changeRegister = (active = true) => {
    let attr = (active) ? 'data-upreg' : 'data-downreg'
    let els = Array.from(document.querySelectorAll(`.key[${attr}]`))
    els.map(key => {
        key.textContent = key.getAttribute(attr)
    })
}

const output = document.querySelector('.output')
let systemKeyHandling = (key, event, eventRepeat = false) => {
    if(event == "keyup" || event == "mouseup") {
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
        let capitalLetterEls = []
        LANGKEYS.map(k => {
            capitalLetterEls = [...capitalLetterEls, ...document.querySelectorAll(`.key[data-key="${k}"]`)]
        })

        for(let i = 0; i < capitalLetterEls.length; i++) {
            if(capitalLetterEls[i].classList.contains('active'))
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
            if(text.length != 0) {
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
            } else {
                output.value = "  "
            }
            
            break;
        case "8":
            text = [...output.value]
            let selection = document.getSelection().toString()
            if (!!selection) {
                cursorPos = getCursorPos(output)
                output.value = output.value.replace(selection, "")
                setCursorPos(output, cursorPos )
            } else {
                cursorPos = getCursorPos(output)
                output.value = [...text.slice(0, cursorPos - 1), ...text.slice(cursorPos)].join("")
                setCursorPos(output, cursorPos - 1)
            }
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
            if(!eventRepeat && event == "keydown") {
                if (key.getAttribute('data-direction') == "left") {
                    let leftAlt = document.querySelector('.LAlt')
                    if (leftAlt.classList.contains('active') && document.querySelectorAll('.system.active').length == 2) {
                        refresh()
                    }
                } 
            } 
            changeRegister(isActiveShiftOrCapsLock())
            break;
        case "20":
            changeRegister(isActiveShiftOrCapsLock())
            break;
        case "17":
            break;
        case "18":
            if(!eventRepeat && event == "keydown") {
                if (key.getAttribute('data-direction') == "left") {
                    let leftShift = document.querySelector('.LShift')
                    if (leftShift.classList.contains('active') && document.querySelectorAll('.system.active').length == 2) {
                        refresh()
                    }
                } 
            } 
            break;
    }
}

let keyHandling = (key) => {
    let cursorPos, text
    let newtext = []

    let getCursorPos = (obj) => {
        obj.focus()
        if(obj.selectionStart) 
            return obj.selectionStart
        return 0
    }

    let setCursorPos = (obj, position, direction = false) => {
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
    let key
    if (e.keyCode == 17 || e.keyCode == 18 || e.keyCode == 16) {
        key = e.location == 1 
                ? document.querySelector(`.L${e.key}`)
                : document.querySelector(`.R${e.key}`)

    } else {
        key = document.querySelector(`div[data-key="${e.keyCode}"]`)
    }
    
    if (e.keyCode != 20) {
        key.classList.add('active')
    } else {
        key.classList.contains('active') ? key.classList.remove('active') : key.classList.add('active')
    }
    
    key.classList.contains('system') ? systemKeyHandling(key, e.type, e.repeat) : keyHandling(key) 
    
})

window.addEventListener('keyup', (e) => {
    e.preventDefault()
    let key
    if (e.keyCode == 17 || e.keyCode == 18 || e.keyCode == 16) {
        key = e.location == 1 
                ? document.querySelector(`.L${e.key}`)
                : document.querySelector(`.R${e.key}`)

    } else {
        key = document.querySelector(`div[data-key="${e.keyCode}"]`)
    }
    if( e.keyCode != 20) {
        key.classList.remove('active')
    }
    key.classList.contains('system') ? systemKeyHandling(key, e.type, e.repeat) : null; 
} )


