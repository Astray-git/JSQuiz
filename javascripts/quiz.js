// Get JSON data
var allQuestions = null;
function getJSON() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(this.readyState == 4) {
      if ((this.status >= 200 && this.status < 300) || this.status == 304) {
        allQuestions = JSON.parse(this.response);
        qCount = allQuestions.length;
        CookieUtil.create('lastUser', CookieUtil.read('username'), 7);
        quizInit();
      } else {
        console.log('Request was unsuccessful: ' + this.status);
      }
    }
  };
  xhr.open('GET', 'quiz.json', true);
  xhr.send(null);
  xhr = null;
}

// Get cookie
function getCookie(){
  var usrName = CookieUtil.read('username');
  var lastName = CookieUtil.read('lastUser');
  if(usrName) {
    welcomeText.appendChild(document.createTextNode(', ' + usrName));
    if (usrName != lastName) {
      storage.clear();
    }
  } else {
    welcomeText.appendChild(document.createTextNode(' to JS Quiz'));
  }
  getJSON();
}

var // Get key elements
  body = document.body,
  qNum = document.querySelector('#qnum'),
  qText = document.querySelector('.qtext'),
  answer = document.querySelector('#answer'),
  qContent = answer.parentNode,
  nextBtn = document.querySelector('#next'),
  prevBtn = document.querySelector('#prev'),
  quizContainer = prevBtn.parentNode,
  result = document.querySelector('#result'),
  tsText = document.querySelector('#tsText'),
  retryBtn = document.querySelector('#retry'),
  startBtn = document.querySelector('#start'),
  fragQuiz = document.querySelector('#frag-quiz'),
  fragResult = document.querySelector('#frag-result'),
  fragWelcome = document.querySelector('.welcome'),
  welcomeText = document.querySelector('.wel-text');

// Init Vars
var curNum = 1,
  qCount,
  // Score
  tScore = [],
  // Correct Answer
  cAns = null,
  // Question Nodes
  qNumCur = null,
  qTextCur = null,
  // Existing warning message
  existWarn = null;

function quizInit() {
  curNum = 1;
  //qCount = allQuestions.length;
  tScore.length = qCount;
  // Question nodes
  qNumCur = document.createTextNode(curNum);
  qTextCur = document.createTextNode(allQuestions[0].question);
  // Generate Question Title Number
  qNum.appendChild(qNumCur);
  // Generate Question Text
  qText.appendChild(qTextCur);
  choiceGen();
}

function getChoice() {
  var radios = answer.querySelectorAll('input');
  var choice = null,
    i,len;
  for (i = 0, len = radios.length; i < len; i++) {
    if(radios[i].checked) {
      choice = radios[i].value;
      storage.setItem('Q' + curNum, choice);
    }
  }
  return choice;
}

function loadLocalChoice(location){
  var localChoice = storage.getItem(location),
    allChoice = answer.querySelectorAll('input');
  if(localChoice) {
    allChoice[localChoice].checked = true;
  }
}

// Choice Checker & Tally Score
function choiceChk() {
  var scoreCur;
  // Check the choice
  switch(getChoice()) {
    case cAns :
      scoreCur = '1';
      break;
    case null :
      doWarn('Make your choice.', quizContainer, prevBtn);
      EventUtil.addHandler(nextBtn, 'click', nextHandler);
      return false;
    default :
      scoreCur = '0';
  }
  // Tally score
  tScore[curNum - 1] = scoreCur;
  return true;
}

// Quiz Update Function
function quizNext() {
  removeWarn();
  if(choiceChk()) {
    qContent.className = 'wcontent vhide';
    qContent.style.visibility = 'hidden';
    setTimeout(function() {
      qContent.style.visibility = 'visible';
      qContent.className = 'wcontent';
            prevBtn.className = 'btn cir-r light';
    }, 200);
    qNumCur.nodeValue = ++curNum;
    qTextCur.nodeValue = allQuestions[curNum - 1].question;
    choiceGen();
  }
}

function quizPrev() {
  removeWarn();
  // Get the checked choice
  getChoice();
  qContent.className = 'wcontent vhide';
  qContent.style.visibility = 'hidden';
  setTimeout(function() {
    qContent.style.visibility = 'visible';
    qContent.className = 'wcontent';
  }, 200);
  qNumCur.nodeValue = --curNum;
  qTextCur.nodeValue = allQuestions[curNum - 1].question;
  choiceGen();
}

// Choices
function choiceGen() {
  // Remove existing choices first
  removeAllChild(answer);
  // Remove event handlers for 'li'
  EventUtil.removeHandler(answer, 'click', liHandler);

  var cCount, cLen;
  for(cCount = 1, cLen = allQuestions[curNum - 1].choices.length; cCount <= cLen; cCount++) {
    var choiceLi = document.createElement('li');
    choiceLi.className = 'choice';
    var choiceBtn = document.createElement('input');
    choiceBtn.type = 'radio';
    choiceBtn.value = cCount - 1;
    choiceBtn.name = 'answer';
    choiceBtn.id = 'ci' + cCount;
    var choiceLabel = document.createElement('label');
    choiceLabel.setAttribute('for', 'ci' + cCount);
    var labelText = document.createTextNode(allQuestions[curNum - 1].choices[cCount - 1]);
    choiceLabel.appendChild(labelText);
    choiceLi.appendChild(choiceBtn);
    choiceLi.appendChild(choiceLabel);
    answer.appendChild(choiceLi);
  }
  cAns = allQuestions[curNum - 1].correctAnswer.toString();
  // prev button
  if (curNum == 1) { prevBtn.className = 'btn cir-r light hidden'; }
  // get previous choice
  loadLocalChoice('Q' + curNum);
  // Add event handlers
  EventUtil.addHandler(answer, 'click', liHandler);
  EventUtil.addHandler(nextBtn, 'click', nextHandler);
  EventUtil.addHandler(prevBtn, 'click', prevHandler);
}
// Handlers
function nextHandler(e) {
    e.target.removeEventListener(e.type, arguments.callee);
    EventUtil.preventDefault(e);
    nextUp();
}
function prevHandler(e) {
    e.target.removeEventListener(e.type, arguments.callee);
    EventUtil.preventDefault(e);
    quizPrev();
}
function retryHandler(e) {
    e.target.removeEventListener(e.type, arguments.callee);
    EventUtil.preventDefault(e);
    retryUp();
}
// Delegate Handler for 'li' click
function liHandler(e) {
  e = EventUtil.getEvent(e);
  var target = EventUtil.getTarget(e);
  if(target.tagName == 'LI'){
    target.firstChild.checked = true;
  }
}

// Start Button
var startUp = function() {
  var blurBg = document.querySelector('.blur-bg');
  fragWelcome.className = 'welcome vhide';
  body.removeChild(blurBg);
  body.className = '';
  fragQuiz.className = 'quiz-container';
  setTimeout(function() {
    fragWelcome.className = 'welcome hidden';
  }, 100);
};

// Next Button
var nextUp = function() {         // TODO: nextUp(checkedAns, callback){};
  if (curNum < qCount) {
    quizNext();
  } else if(choiceChk()) {
    showResult();
    fragQuiz.className = 'quiz-container hidden';
    fragResult.className = 'quiz-container';
    EventUtil.addHandler(retryBtn, 'click', retryHandler);
  }
};

// Retry Button
var retryUp = function() {
  fragQuiz.className = 'quiz-container';
  fragResult.className = 'quiz-container hidden';
  prevBtn.className = 'btn cir-r light hidden';
  quizReset();
};

// Add event handler
EventUtil.addHandler(startBtn, 'click', function(event) {
  EventUtil.preventDefault(event);
  EventUtil.removeHandler(startBtn, 'click', arguments.callee);
  startUp();
});

// Result
function showResult() {
  removeAllChild(result, tsText);
  var corCount = 0, rCount;
  for (rCount = 1; rCount <= qCount; rCount++) {
    var qScore = document.createElement('li');
    // var qsText = document.createTextNode(rCount + '. ');
    // qScore.appendChild(qsText);
    var sIcon = document.createElement('i');
    if (tScore[rCount - 1] == '1') {
      sIcon.className = 'fa fa-check';
      corCount++;
    } else if (tScore[rCount - 1] == '0') {
      sIcon.className = 'fa fa-times';
    }
    qScore.appendChild(sIcon);
    result.appendChild(qScore);
  }
  var tText = document.createTextNode(corCount + '/' +qCount);
  tsText.appendChild(tText);
}

// Quiz Reset
function quizReset() {
  // Remove existing nodes first
  removeAllChild(qNum, qText, answer, result, tsText);
  curNum = 1;
  qCount = allQuestions.length;
  tScore = new Array(qCount);
  // Correct Answer
  cAns = null;
  // Questions reset
  qNumCur.nodeValue = curNum;
  qTextCur.nodeValue = allQuestions[curNum - 1].question;
  storage.clear();
  // Re-Init
  quizInit();
}

//-----------
// Utilities
//-----------

// get localStorage
function getLocalStorage() {
  if (typeof localStorage == "object") {
    return localStorage;
  } else if (typeof globalStorage == "object") {
    return globalStorage[location.host];
  } else {
    throw new Error('Local storage not available');
  }
}
var storage = getLocalStorage();

// removeAllChild
function removeAllChild(elems) {
  var i, len;
  for (i = 0, len = arguments.length; i < len; i++){
    while (arguments[i].firstChild) {
      arguments[i].removeChild(arguments[i].firstChild);
    }
  }
}

// Warning message
function removeWarn(){
  existWarn = document.getElementById('choice-warn');
  if(existWarn) {
    quizContainer.removeChild(existWarn);
  }
}

function doWarn(message, container, before) {
  var choiceWarn = document.createElement('p');
  choiceWarn.setAttribute('id', 'choice-warn');
  var warnText = document.createTextNode(message);
  choiceWarn.appendChild(warnText);
  removeWarn();
  container.insertBefore(choiceWarn, before);
}

// Handy multiple onload function
function addLoadEvent(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			oldonload();
			func();
		};
	}
}

addLoadEvent(getCookie);