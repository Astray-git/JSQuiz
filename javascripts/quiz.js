// Get JSON data
var allQuestions = null;
function getJSON() {
  var request = new XMLHttpRequest();
  request.open('GET', 'quiz.json');
  request.onreadystatechange = function(){
    if(this.readyState == 4) {
      if (this.status >= 200 && this.status < 400) {
        allQuestions = JSON.parse(this.response);
        qCount = allQuestions.length;
        CookieUtil.create('lastUser', CookieUtil.read('username'), 7);
        quizInit();
      }
    }
  };
  request.send();
  request = null;
}

// Get cookie
function getCookie(){
  var usrName = CookieUtil.read('username');
  var lastName = CookieUtil.read('lastUser');
  if(usrName) {
    welcomeText.appendChild(document.createTextNode(', ' + usrName));
    if (usrName != lastName) {
      sessionStorage.clear();
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
  // Users' choices
  cValue = [], 
  // Score
  tScore = [],
// Correct Answer
  cAns = null,
// Question Nodes
  qNumCur = null,
  qTextCur = null;

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

// Quiz Update Function
function quizUp() {
  if(choiceChk()) {
    var existWarn = document.getElementById('choice-warn');
    if(existWarn) {
      quizContainer.removeChild(existWarn);
    }
    qContent.className = 'wcontent vhide';
    qContent.style.visibility = 'hidden';
    setTimeout(function() {
      qContent.style.visibility = 'visible';
      prevBtn.className = 'btn cir-r light';
      qContent.className = 'wcontent';
    }, 450);
    qNumCur.nodeValue = ++curNum;
    qTextCur.nodeValue = allQuestions[curNum - 1].question;
    choiceGen();
  }
}

// Choices
function choiceGen() {
  // Remove existing choices first
  removeAllChild(answer);
  // Remove event handlers for 'li'
  EventUtil.removeHandler(answer, 'click', liHandler);

  var cCount, cLen;
  for(cCount = 1, cLen = allQuestions[curNum - 1].choices.length; cCount <= cLen; cCount++) {
    var choice = document.createElement('li');
    choice.className = 'choice';
    var choiceItem = document.createElement('input');
    choiceItem.type = 'radio';
    choiceItem.value = cCount - 1;
    choiceItem.name = 'answer';
    choiceItem.id = 'ci' + cCount;
    var choiceLabel = document.createElement('label');
    choiceLabel.setAttribute('for', 'ci' + cCount);
    var labelText = document.createTextNode(allQuestions[curNum - 1].choices[cCount - 1]);
    choiceLabel.appendChild(labelText);
    choice.appendChild(choiceItem);
    choice.appendChild(choiceLabel);
    answer.appendChild(choice);
  }
  cAns = allQuestions[curNum - 1].correctAnswer;
  if (curNum == 1) { prevBtn.className = 'btn cir-r light hidden'; }
  var userChoice = sessionStorage.getItem('Q' + curNum),
    allChhoice = answer.querySelectorAll('input');
  if(userChoice) {
    allChhoice[userChoice].checked = true;
  }
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
    prevUp();
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

// Choice Checker & Tally Score
function choiceChk() {
  var radios = answer.querySelectorAll('input');
  // Get the checked choice
  var cValue = null,
    scoreCur, i, len;
  for (i = 0, len = radios.length; i < len; i++) {
    if(radios[i].checked) {
      cValue = radios[i].value;
      sessionStorage.setItem('Q' + curNum, cValue);
    }
  }
  // Check the choice
  if (cValue == cAns) {
    scoreCur = '1';
  } else if (cValue === null) {
    doWarn('Make your choice.', quizContainer, prevBtn);
    EventUtil.addHandler(nextBtn, 'click', nextHandler);
    return false;
  } else {
    scoreCur = '0';
  }
  // Tally score
  tScore[curNum - 1] = scoreCur;
  return true;
}

// Next Button
var nextUp = function() {
  if (curNum < qCount) {
    quizUp();
  } else if(choiceChk()) {
    showResult();
    fragQuiz.className = 'wrapper hidden';
    fragResult.className = 'wrapper';
    EventUtil.addHandler(retryBtn, 'click', retryHandler);  
  }
};

// Prev Button
var prevUp = function() {
  var existWarn = document.getElementById('choice-warn');
  var radios = answer.querySelectorAll('input');
  // Get the checked choice
  var cValue = null,
    scoreCur, i, len;
  for (i = 0, len = radios.length; i < len; i++) {
    if(radios[i].checked) {
      cValue = radios[i].value;
      sessionStorage.setItem('Q' + curNum, cValue);
    }
  }
  if(existWarn) {
    quizContainer.removeChild(existWarn);
  }
    qContent.className = 'wcontent vhide';
    qContent.style.visibility = 'hidden';
    setTimeout(function() {
      qContent.style.visibility = 'visible';
      qContent.className = 'wcontent';
    }, 450);
  qNumCur.nodeValue = --curNum;
  qTextCur.nodeValue = allQuestions[curNum - 1].question;
  choiceGen();
};

// Retry Button
var retryUp = function() {
  fragQuiz.className = 'wrapper';
  fragResult.className = 'wrapper hidden';
  prevBtn.className = 'btn cir-r light hidden';
  quizReset();
};

// Start Button
var startUp = function() {
  var blurBg = document.querySelector('.blur-bg');
  fragWelcome.className = 'welcome vhide';
  body.removeChild(blurBg);
  body.className = '';
  fragQuiz.className = 'wrapper';
  setTimeout(function() {
    fragWelcome.className = 'welcome hidden';
  }, 350);
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
  sessionStorage.clear();
  // Re-Init
  quizInit();  
}

//-----------
// Utilities
//-----------

// removeAllChild
function removeAllChild(elems) {
  var i, len;
  for (i = 0, len = arguments.length; i < len; i++){
    while (arguments[i].firstChild) {
      arguments[i].removeChild(arguments[i].firstChild);
    }
  }
}

// Show warning text
function doWarn(text, container, before) {
  var choiceWarn = document.createElement('p');
  choiceWarn.setAttribute('id', 'choice-warn');
  var warnText = document.createTextNode(text);
  choiceWarn.appendChild(warnText);
  var existWarn = document.getElementById('choice-warn');
  if (existWarn) {
    container.removeChild(existWarn);
  }
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