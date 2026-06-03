// Initialize turn percentages
function init() {
  document.getElementById('rightReverse').textContent = leftTurnReverseObj.value;
  document.getElementById('leftReverse').textContent = rightTurnReverseObj.value;
}

window.onload = init;

// Modal code
function displayModal() {
  const displayModalBtn = document.getElementById('displayModalBtn');
  displayModalBtn.style.display = 'none';

  const modal = document.getElementById('modal');
  modal.classList.add('modal-visible');
  modal.classList.remove('modal-hidden');
}

function closeModal() {
  const displayModalBtn = document.getElementById('displayModalBtn');
  displayModalBtn.style.display = 'inline-block';

  const modal = document.getElementById('modal');
  modal.classList.add('modal-hidden');
  modal.classList.remove('modal-visible');
}

function handleEnter(event) {
  if (event.key === 'Enter') {
    closeModal();
  }
}

document.addEventListener('pointerdown', (event) => {
  const modal = document.getElementById('modal');

  if (event.target === modal) {
    closeModal();
  }
})

function handleActive(element, action) {
  element.classList.add('active');

  console.log(action);
  websocketSend(action);
}

function handleDeactivate(element) {
  element.classList.remove('active');

  websocketSend('stopCar');
}

const actions = {
  forwardLeft: 'forwardLeft',
  forward: 'forward',
  forwardRight: 'forwardRight',
  left: 'left',
  right: 'right',
  backwardLeft: 'backwardLeft',
  backward: 'backward',
  backwardRight: 'backwardRight'
};

const controls = [
  { element: document.getElementById('forwardLeft'), action: actions.forwardLeft },
  { element: document.getElementById('forward'), action: actions.forward },
  { element: document.getElementById('forwardRight'), action: actions.forwardRight },
  { element: document.getElementById('left'), action: actions.left },
  { element: document.getElementById('right'), action: actions.right },
  { element: document.getElementById('backwardLeft'), action: actions.backwardLeft },
  { element: document.getElementById('backward'), action: actions.backward },
  { element: document.getElementById('backwardRight'), action: actions.backwardRight },
];

for (const control of controls) {
  control.element.addEventListener('pointerdown', () => handleActive(control.element, control.action));
  control.element.addEventListener('pointerup', () => handleDeactivate(control.element, control.action));

  control.element.addEventListener('pointerleave', () => handleDeactivate(control.element));
}

const keysPressed = {}

function callAction(action) {
  const element = controls.find(control => control.action === action).element;
  element.classList.add('active');
  console.log(action);
  websocketSend(action);
}

let activeMovementKeys = {
  'w': false,
  'a': false,
  's': false,
  'd': false
};

function handleMovementKeypress() {
  const forwardCancel = keysPressed['w'] && keysPressed['s'];
  const leftCancel = keysPressed['a'] && keysPressed['d'];

  if (forwardCancel && leftCancel) {
    for (const control of controls) {
      control.element.classList.add('active');
    }
    websocketSend('stopCar');
    return;
  } else if (forwardCancel) {
    activeMovementKeys['w'] = true;
    activeMovementKeys['s'] = true;

    document.getElementById('forward').classList.add('active');
    document.getElementById('backward').classList.add('active');

    if (keysPressed['a']) {
      activeMovementKeys['a'] = true;
      document.getElementById('forwardLeft').classList.add('active');
      document.getElementById('backwardLeft').classList.add('active');
      callAction(actions.left);
    } else if (keysPressed['d']) {
      activeMovementKeys['d'] = true;
      document.getElementById('forwardRight').classList.add('active');
      document.getElementById('backwardRight').classList.add('active');
      callAction(actions.right);
    } else {
      websocketSend('stoCar');
    }
  } else if (leftCancel) {
    activeMovementKeys['a'] = true;
    activeMovementKeys['d'] = true;

    document.getElementById('left').classList.add('active');
    document.getElementById('right').classList.add('active');

    if (keysPressed['w']) {
      activeMovementKeys['w'] = true;

      document.getElementById('forwardLeft').classList.add('active');
      document.getElementById('forwardRight').classList.add('active');
      callAction(actions.forward);
    } else if (keysPressed['s']) {
      activeMovementKeys['s'] = true;

      document.getElementById('backwardLeft').classList.add('active');
      document.getElementById('backwardRight').classList.add('active');
      callAction(actions.backward);
    } else {
      websocketSend('stopCar');
    }
  } else {
    if (keysPressed['w'] && keysPressed['d']) {
      activeMovementKeys['w'] = true;
      activeMovementKeys['d'] = true;

      document.getElementById('forward').classList.remove('active');
      document.getElementById('right').classList.remove('active');
      callAction(actions.forwardRight);
    } else if (keysPressed['w'] && keysPressed['a']) {
      activeMovementKeys['w'] = true;
      activeMovementKeys['a'] = true;

      document.getElementById('forward').classList.remove('active');
      document.getElementById('left').classList.remove('active');
      callAction(actions.forwardLeft);
    } else if (keysPressed['w']) {
      callAction(actions.forward);
    } else if (keysPressed['s'] && keysPressed['d']) {
      activeMovementKeys['s'] = true;
      activeMovementKeys['d'] = true;

      document.getElementById('backward').classList.remove('active');
      document.getElementById('right').classList.remove('active');
      callAction(actions.backwardRight);
    } else if (keysPressed['s'] && keysPressed['a']) {
      activeMovementKeys['s'] = true;
      activeMovementKeys['a'] = true;

      document.getElementById('backward').classList.remove('active');
      document.getElementById('left').classList.remove('active');
      callAction(actions.backwardLeft);
    } else if (keysPressed['s']) {
      activeMovementKeys['s'] = true;
      callAction(actions.backward);
    } else if (keysPressed['a']) {
      activeMovementKeys['a'] = true;
      callAction(actions.left);
    } else if (keysPressed['d']) {
      activeMovementKeys['d'] = true;
      callAction(actions.right);
    }
  }
}

const leftTurnReverseObj = {
  interval: null,
  value: 30,
  span: document.getElementById('leftReverse'),
  incrementKey: 'left',
};

const rightTurnReverseObj = {
  interval: null,
  value: 25,
  span: document.getElementById('rightReverse'),
  incrementKey: 'right',
};

let incrementReverseHeldDown = {
  'leftIncrease': false,
  'rightIncrease': false,
  'leftDecrease': false,
  'rightDecrease': false,
};

function handleTurnReverseKeypress() {
  let leftReverseIncrementCancel = false;
  let rightReverseIncrementCancel = false;

  if ((keysPressed['1'] || incrementReverseHeldDown['leftIncrease'])
    && (incrementReverseHeldDown['leftDecrease'] || keysPressed['2'])) {
    leftReverseIncrementCancel = true;
  }
  if ((keysPressed['3'] || incrementReverseHeldDown['rightIncrease'])
    && (keysPressed['4'] || incrementReverseHeldDown['rightDecrease'])) {
    rightReverseIncrementCancel = true;
  }

  if (!leftReverseIncrementCancel) {
    if (keysPressed['1']) {
      handleUpdateTurnReversePercent(leftTurnReverseObj, true);
    } else if (keysPressed['2']) {
      handleUpdateTurnReversePercent(leftTurnReverseObj, false);
    }
  }
  if (!rightReverseIncrementCancel) {
    if (keysPressed['3']) {
      handleUpdateTurnReversePercent(rightTurnReverseObj, true);
    } else if (keysPressed['4']) {
      handleUpdateTurnReversePercent(rightTurnReverseObj, false);
    }
  }
}

function handleUpdateTurnReversePercent(reverseObj, isIncrease) {
  let incrementKey;
  if (isIncrease) {
    incrementKey = reverseObj.incrementKey + 'Increase';
  } else {
    incrementKey = reverseObj.incrementKey + 'Decrease';
  }

  function changeValue(reverseObj, isIncrease) {
    if (isIncrease && reverseObj.value + 1 <= 100) {
      reverseObj.value += 1;
    } else if (!isIncrease && reverseObj.value - 1 >= 0) {
      reverseObj.value -= 1;
    }

    reverseObj.span.textContent = reverseObj.value;
  }

  clearInterval(reverseObj.interval);
  reverseObj.interval = setInterval(() => changeValue(reverseObj, isIncrease), 100);
  incrementReverseHeldDown[incrementKey] = true;
}

function handleStopIncrement(reverseObj, isIncrease) {
  clearInterval(reverseObj.interval);
  const incrementKey = reverseObj.incrementKey + ((isIncrease) ? 'Increase' : 'Decrease');
  if (incrementReverseHeldDown[incrementKey]) {
    incrementReverseHeldDown[incrementKey] = false;
    websocketSend(((reverseObj.incrementKey === 'left') ? 'L' : 'R') + reverseObj.value);
  }
}

const leftReverseIncreaseBtn = document.getElementById('leftReverseIncrease');

leftReverseIncreaseBtn.addEventListener('pointerdown', () => handleUpdateTurnReversePercent(leftTurnReverseObj, true));
leftReverseIncreaseBtn.addEventListener('pointerup', () => handleStopIncrement(leftTurnReverseObj, true));
leftReverseIncreaseBtn.addEventListener('pointerleave', () => handleStopIncrement(leftTurnReverseObj, true));

const leftReverseDecreaseBtn = document.getElementById('leftReverseDecrease');

leftReverseDecreaseBtn.addEventListener('pointerdown', () => handleUpdateTurnReversePercent(leftTurnReverseObj, false));
leftReverseDecreaseBtn.addEventListener('pointerup', () => handleStopIncrement(leftTurnReverseObj, false));
leftReverseDecreaseBtn.addEventListener('pointerleave', () => handleStopIncrement(leftTurnReverseObj, false));

const rightReverseIncreaseBtn = document.getElementById('rightReverseIncrease');

rightReverseIncreaseBtn.addEventListener('pointerdown', () => handleUpdateTurnReversePercent(rightTurnReverseObj, true));
rightReverseIncreaseBtn.addEventListener('pointerup', () => handleStopIncrement(rightTurnReverseObj, true));
rightReverseIncreaseBtn.addEventListener('pointerleave', () => handleStopIncrement(rightTurnReverseObj, true));

const rightReverseDecreaseBtn = document.getElementById('rightReverseDecrease');

rightReverseDecreaseBtn.addEventListener('pointerdown', () => handleUpdateTurnReversePercent(rightTurnReverseObj, false));
rightReverseDecreaseBtn.addEventListener('pointerup', () => handleStopIncrement(rightTurnReverseObj, false));
rightReverseDecreaseBtn.addEventListener('pointerleave', () => handleStopIncrement(rightTurnReverseObj, false));

const movementKeys = new Set(['w', 'a', 's', 'd',]);
const lightKeys = new Set(['e', 'q']);
const thirdMotorKeys = new Set([' ', 'Shift']);
const servoKeys = new Set(['r', 'f']);
const turnReverseKeys = new Set(['1', '2', '3', '4']);

// Prevent space key from scrolling down
window.addEventListener('keydown', (event) => {
  if (event.keyCode === 32 && event.target === document.body) {
    event.preventDefault();
  }
});

document.addEventListener('keydown', (event) => {
  // Ignore keypress if input box is selected
  const activeTag = document.activeElement.tagName;
  const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];

  if (inputTags.includes(activeTag)) {
    return;
  }

  const modal = document.getElementById('modal');

  if (event.key === 'Escape' && modal.classList.contains('modal-visible')) {
    closeModal();
    return;
  } else if (servoKeys.has(event.key)) {
    changeServoRotation((event.key === 'r') ? 30 : -30);
  }


  if (!keysPressed[event.key]) {
    keysPressed[event.key] = true;

    if (movementKeys.has(event.key)) {
      handleMovementKeypress();
    } else if (lightKeys.has(event.key)) {
      (event.key === 'e') ? toggleHeadlights() : toggleRearLights();
    } else if (turnReverseKeys.has(event.key) && !inputTags.includes(activeTag)) {
      handleTurnReverseKeypress();
    } else if (thirdMotorKeys.has(event.key)) {
      handleSpinThirdMotor();
    }
  }
});

document.addEventListener('keyup', (event) => {
  delete keysPressed[event.key];

  if (movementKeys.has(event.key)) {
    activeMovementKeys[event.key] = false;

    let noActiveMovementKeys = true;
    for (const key in activeMovementKeys) {
      if (Object.hasOwn(activeMovementKeys, key)) {
        if (activeMovementKeys[key]) {
          noActiveMovementKeys = false;
          break;
        }
      }
    }
    let keysCancel = true;
    if ((activeMovementKeys['w'] && activeMovementKeys['s'] && activeMovementKeys['a'] !== activeMovementKeys['d'])
      || (activeMovementKeys['a'] && activeMovementKeys['d'] && activeMovementKeys['w'] !== activeMovementKeys['s'])) {
      keysCancel = false;
    }
    controls.forEach(control => {
      const keyMapping = {
        'w': [actions.forward, actions.forwardLeft, actions.forwardRight],
        'a': [actions.left, actions.forwardLeft, actions.backwardLeft],
        's': [actions.backward, actions.backwardLeft, actions.backwardRight],
        'd': [actions.right, actions.forwardRight, actions.backwardRight]
      };

      if (keyMapping[event.key]?.includes(control.action)) {
        control.element.classList.remove('active');
      }
    });

    if (noActiveMovementKeys || keysCancel) {
      websocketSend('stopCar');
    }

    handleMovementKeypress();
  } else if (turnReverseKeys.has(event.key)) {
    switch (event.key) {
      case '1':
        handleStopIncrement(leftTurnReverseObj, true);
        if (keysPressed['2']) {
          handleUpdateTurnReversePercent(leftTurnReverseObj, false);
        }
        break;
      case '2':
        handleStopIncrement(leftTurnReverseObj, false);
        if (keysPressed['1']) {
          handleUpdateTurnReversePercent(leftTurnReverseObj, true);
        }
        break;
      case '3':
        handleStopIncrement(rightTurnReverseObj, true);
        if (keysPressed['4']) {
          handleUpdateTurnReversePercent(leftTurnReverseObj, false);
        }
        break;
      case '4':
        handleStopIncrement(rightTurnReverseObj, false);
        if (keysPressed['3']) {
          handleUpdateTurnReversePercent(leftTurnReverseObj, true);
        }
        break;
    }
  } else if (thirdMotorKeys.has(event.key)) {
    switch (event.key) {
      case 'Shift':
        stopMotorDirection1();
      case ' ':
        stopMotorDirection2();
    }
  }
});

function toggleHeadlights() {
  websocketSend('headlights');
}

function toggleRearLights() {
  websocketSend('rearLights');
}

function spinMotorDirection2() {
  motorDirection2Btn.classList.add('active');
  websocketSend('direction2');
}

function spinMotorDirection1() {
  motorDirection1Btn.classList.add('active');
  websocketSend('direction1');
}

function stopMotorDirection2() {
  motorDirection2Btn.classList.remove('active');
  websocketSend('stopThirdMotor');
}

function stopMotorDirection1() {
  motorDirection1Btn.classList.remove('active');
  websocketSend('stopThirdMotor');
}

function handleSpinThirdMotor() {
  motorDirection1Btn.classList.remove('active');
  motorDirection2Btn.classList.remove('active');

  if (keysPressed[' '] && keysPressed['Shift']) {
    motorDirection1Btn.classList.add('active');
    motorDirection2Btn.classList.add('active');
    websocketSend('stopThirdMotor');
  } else if (keysPressed[' ']) {
    spinMotorDirection2();
  } else if (keysPressed['Shift']) {
    spinMotorDirection1();
  }
}

const motorDirection1Btn = document.getElementById('directionOne');

motorDirection1Btn.addEventListener('pointerdown', spinMotorDirection1);
motorDirection1Btn.addEventListener('pointerup', stopMotorDirection1);
motorDirection1Btn.addEventListener('pointerleave', stopMotorDirection1);

const motorDirection2Btn = document.getElementById('directionTwo');

motorDirection2Btn.addEventListener('pointerdown', spinMotorDirection2);
motorDirection2Btn.addEventListener('pointerup', stopMotorDirection2);
motorDirection2Btn.addEventListener('pointerleave', stopMotorDirection2);

function rotateServo() {
  const inputElement = document.getElementById('servo');
  let numberVal = Math.round(parseFloat(inputElement.value));

  if (Number.isNaN(numberVal)) {
    return;
  }

  if (numberVal > 180) {
    numberVal = 180;
  } else if (numberVal < 0) {
    numberVal = 0;
  }

  inputElement.value = numberVal;
  websocketSend(`S${numberVal}`);
}

function changeServoRotation(val) {
  const inputElement = document.getElementById('servo');
  let numberVal = Math.round(parseFloat(inputElement.value));

  numberVal += val;

  if (Number.isNaN(numberVal)) {
    return;
  }

  if (numberVal > 180) {
    numberVal = 180;
  } else if (numberVal < 0) {
    numberVal = 0;
  }

  inputElement.value = numberVal;
  websocketSend(`S${numberVal}`);
}

const maxRetries = 5;
let retryCount = 0;
let websocket;

// Document is loaded, start WebSocket connection
document.addEventListener('DOMContentLoaded', () => {
  wsConnect();
});

function wsConnect() {
  console.log('DOM fully loaded and parsed.  Starting WebSocket connection...');
  // Connect to WebSocket server
  websocket = new WebSocket('ws://192.168.4.1/ws');
  // Assign callbacks
  websocket.onopen = (evt) => {
    retryCount = 0;
    onOpen(evt)
  };
  websocket.onclose = (evt) => {
    if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(wsConnect, 2000);
    } else {
      console.error('Max retries reached');
    }
    onClose(evt)
  };
  websocket.onmessage = (evt) => { onMessage(evt) };
  websocket.onerror = (evt) => { onError(evt) };
}

function sendPing() {
  if (websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ type: 'ping' }));
  }
}

setInterval(sendPing, 300000);

// Called when a WebSocket connection is established with the server
function onOpen(event) {
  // Log connection state
  console.log("WebSocket connected successfully.");
  // Add any code for the UI if needed..
  // e.g. show a websocket connection successful message on the screen
  document.body.classList.add('ws-connected');
}

// Called when the WebSocket connection is closed
function onClose(event) {
  // Log disconnection state
  console.log("WebSocket disconnected.");
  // Add any code for the UI if needed..
  // e.g. show a websocket disconnnected message on the screen
  document.body.classList.remove('ws-connected');
}

// Called when a message is received from the server
function onMessage(event) {
  // Print out our received message
  console.log('Received: ' + event.data);
  // Add any code to update the UI if needed..
  // e.g. when ESP32 sends a message about something, then update the UI page to show it
}

// Called when a WebSocket error occurs
function onError(event) {
  console.log('WebSocket ERROR: ' + event.data);
}

// Sends a message to the server (and prints it to the console)
function websocketSend(message) {
  console.log('Sending to ESP32 message: ' + message);
  websocket.send(message);
}
