"use strict";

function fauxTerm(config) {

    const term = config.el || document.getElementById('term');
    let termBuffer = config.initialMessage || '';
    var cwd = config.cwd || "~/";
    var tags = config.tags || ['red', 'blue', 'white', 'bold'];
    var maxBufferLength = config.maxBufferLength || 8192;
    var commandHistory = [];
    var currentCommandIndex = 1;
    var maxCommandHistory = config.maxCommandHistory || 100;
    var autoFocus = config.autoFocus || false;

    var commands = {
        "clear": clear,
        "fuck": clear,
        "help": help,
        "menu": menu,
    };

    if (autoFocus) {
        term.focus();
    }

    const HelpText = "Available commands:\nmenu\nsnake\nclear\n\n";

    function getLeader() {
        return cwd + "$ ";
    }


    function renderTerm(preText) {

        removeBell();
        unactiveElements();

        const block = document.createElement('div');
        block.classList.add('block');
        if (preText) {
            block.innerHTML += `<span class='leader'>${preText}</span>`;
        }
        block.innerHTML += `<span class='leader'>${getLeader()}</span>`;
        block.innerHTML += `<span class='command text-input'></span>`
        block.innerHTML += '<span class=\'bell\'></span>';
        block.innerHTML += '<div class=\'commandOut\'></div>';
        termAppendChild(block);
        term.scrollTop = term.scrollHeight;

        const events = {
            'tab': addTub,
            'enter': executeCommand,
            'keyUp': toggleUp,
            'keyDown': toggleDown,
            'backspace': cutTextInput,
        }

        setListeners(getTextInput(), events);
    }


    function clear(argc, argv) {
        term.innerHTML = "";
        renderTerm();
    }

    function help(argc, argv) {
        setCommandOut(`<div class='leader'>${HelpText}</div>`);
        renderTerm();
    }



    /*----------------------------*/
    /*-------block----------------*/
    /*----------------------------*/

    function getBlock() {
        const block = document.getElementsByClassName('block');
        return block[block.length - 1];
    }



    /*----------------------------*/
    /*-------bell-----------------*/
    /*----------------------------*/

    function removeBell() {
        const block = getBlock();
        if (block) {
            const bell = getBlock().getElementsByClassName('bell')[0];
            if (bell) {
                bell.remove();
            }
        }
    }


    /*----------------------------*/
    /*-------active---------------*/
    /*----------------------------*/

    function unactiveElements() {
        const active = document.getElementsByClassName('active');
        for (let i = 0; i < active.length; ++i) {
            active[i].classList.remove('active');
        }
    }

    function activate(element) {
        element.classList.add('active');
    }



    /*----------------------------*/
    /*-------term-----------------*/
    /*----------------------------*/

    function getTerm() {
        const term = document.getElementsByClassName('term');
        return term[term.length - 1];
    }

    function termAppendInnerHTML(innerHTMLData) {
        getTerm().innerHTML += innerHTMLData;
    }

    function termAppendChild(child) {
        getTerm().appendChild(child);
    }



    /*----------------------------*/
    /*-------text-input-----------*/
    /*----------------------------*/

    function getTextInput() {
        return getBlock().getElementsByClassName('text-input')[0];
    }

    function cutTextInput(key) {
        getTextInput().innerHTML = getCommand().innerHTML.slice(0, -1);
    }

    function setTextInput(newCommand) {
        getTextInput().innerHTML = newCommand;
    }


    /*----------------------------*/
    /*-------command--------------*/
    /*----------------------------*/

    function getCommand() {
        return getBlock().getElementsByClassName('command')[0];
    }

    /*----------------------------*/
    /*-------command-out----------*/
    /*----------------------------*/

    function getCommandOut() {
        return getBlock().getElementsByClassName('commandOut')[0];
    }

    function setCommandOut(innerData) {
        getBlock().getElementsByClassName('commandOut')[0].innerHTML = innerData;
    }

    function addCommandOutClass(className) {
        getCommandOut().classList.add(className);
    }



    /*----------------------------*/
    /*-------login-text-inpit-----*/
    /*----------------------------*/

    function getLogin() {
        return getCommandOut().getElementsByClassName('login')[0]; 
    }


    /*----------------------------*/
    /*-------menu--functions------*/
    /*----------------------------*/

    function loginFirstStep() {
        const commandOut = getCommandOut();

        setCommandOut('<span>login: </span><div class=\'login text-input\'></div>');

        const login = getLogin();
        
        const loginEvents = {
            'enter': loginSecondStep,
        }

        addEventListener(login, loginEvents);
    }

    function loginSecondStep() {
        console.log('secondStep');
    } 

    function logout() {
        console.log('logout');
    }

    function signup() {
        console.log('signup');
    }


    function menu(argc, argv) {
        const menu = document.createElement('div');

        removeBell();
        unactiveElements();

        const menuList = {
            'login': 'loginFirstStep',
            'signup': 'signup',
            'logout': 'logout',
        }


        // в пагинацию
        let index = 1;
        for (var element in menuList) {
            menu.innerHTML += `<div datahref=${menuList[element]} tabindex=${index++}>${element}</div>`;
        }
        menu.firstChild.className = "focus";
        // в пагинацию


        const events = {
            'tab': menuNavigation,
            'enter': processLine,
            'keyUp': toggleMenuUp,
            'keyDown': toggleMenuDown,
            'backspace': menuNavigation,
        }

        setCommandOut(menu.innerHTML);
        addCommandOutClass('active');

        setListeners(getCommandOut(), events)
    }


    function processLine() {
        const focus = getBlock().querySelector('.focus');
        console.log(focus.getAttribute('datahref'))
        focus.getAttribute('datahref')();
    }

    function toggleMenuUp() {
        const commandOut = getCommandOut();
        const focus = commandOut.querySelector('.focus');
        focus.classList.remove('focus');
        const previousSibling = focus.previousElementSibling;
        focusElement(previousSibling || commandOut.lastElementChild);
    }

    function toggleMenuDown() {
        const commandOut = getCommandOut();
        const focus = commandOut.querySelector('.focus');
        focus.classList.remove('focus');
        const nextSibling = focus.nextElementSibling;
        focusElement(nextSibling || commandOut.firstElementChild);
    }

    function focusElement(element) {
        element.classList.add('focus');
    }

    function menuNavigation() {
        console.log("menu");
    }


    /*----------------------------*/
    /*-----command-functions------*/
    /*----------------------------*/

    function isCommand(line) {
        return commands.hasOwnProperty(line);
    }

    function runCommand(command, argc, argv) {
        return commands[command](argc, argv);
    }

    function commandNotFound(command, argc, argv) {
        setCommandOut(`<span class="bold">\n${command}</span>:command not found\n\n`);
        renderTerm();
    }

    function executeCommand(event) {
        const line = getCommand().innerText;

        let argv = line.split(" ");
        const command = argv[0],
            argc = argv.length;

        argv.shift();

        if (command) {
            if (isCommand(command)) {
                runCommand(command, argc, argv);
            } else {
                commandNotFound(command, argc, argv);
            }
            addLineToHistory(line);
        }
    }

    function addLineToHistory(line) {
        commandHistory.unshift(line);
        currentCommandIndex = -1;
        if (commandHistory.length > maxCommandHistory) {
            console.log('reducing command history size');
            console.log(commandHistory.length);
            var diff = commandHistory.length - maxCommandHistory;
            commandHistory.splice(commandHistory.length - 1, diff);
            console.log(commandHistory.length);
        }
    }

    function isInputKey(keyCode) {
        var inputKeyMap = [32, 190, 192, 189, 187, 220, 221, 219, 222, 186, 188, 191];
        if (inputKeyMap.indexOf(keyCode) > -1) {
            return true;
        }
        return false;
    }

    function addInput(key) {
        getTextInput().innerHTML += key;
    }

    function addTub() {
        addInput('\t');
    }

    function toggleUp() {
        toggleCommandHistory(1);
    }

    function toggleDown() {
        toggleCommandHistory(-1);
    }

    
    /*----------------------------*/
    /*-----accept-doc-input-------*/
    /*----------------------------*/
    
    function acceptInput(e) {
        if (e.keyCode >= 48 && e.keyCode <= 90 || isInputKey(e.keyCode)) {
            e.preventDefault();
            if (!e.ctrlKey) {
                addInput(e.key);
            } else {
                //Hot key input? I.e Ctrl+C
            }
        } else {
            const events = {
                8: 'backspace',
                9: 'tab',
                13: 'enter',
                38: 'keyUp',
                40: 'keyDown',
            }

            const active = document.querySelector('.active');
            const event = new Event(events[e.keyCode]);
            (active || getCommand()).dispatchEvent(event);
        }
    }


    function setListeners(element, events) {
        for (const event in events) {
            element.addEventListener(event, events[event]);
        }
    }

    renderTerm(termBuffer);

    document.addEventListener('keydown', acceptInput);
}

const myTerm = new fauxTerm({
    el: document.getElementById("term"),
    cwd: "awesome.game@mail.ru:/",
    initialMessage: "Documentation: type \"help\"\n\n",
    // initialLine: "Initial command",
    tags: ['red', 'blue', 'white', 'bold'],
    maxBufferLength: 8192,
    maxCommandHistory: 500,
    autoFocus: true,
    cmd: function (argv, argc) {
        console.log(argv);
        return false;
    }
});