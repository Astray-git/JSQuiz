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

var // Get elements
  qNum = document.getElementById('qnum'),
  qText = document.getElementsByClassName('qtext')[0],
  answer = document.getElementById('answer'),
  qContent = answer.parentNode,
  nextBtn = document.getElementById('next'),
  prevBtn = document.getElementById('prev'),
  result = document.getElementById('result'),
  tsText = document.getElementById('tsText'),
  retryBtn = document.getElementById('retry'),
  startBtn = document.getElementById('start'),
  fragQuiz = document.getElementById('frag-quiz'),
  fragResult = document.getElementById('frag-result'),
  fragWelcome = document.getElementsByClassName('welcome')[0],
  welcomeText = document.getElementsByClassName('wel-text')[0],
  choiceWarn = document.getElementById('choice-warn');

// Init Vars
var question = null,
  nextButton = null,
  prevButton = null,
  curNum = 1,
  qCount,
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
  // choiceGen();
  nextButton = new NavButton('next');
  prevButton = new NavButton('prev');
  nextButton.preHandler = function() {
    removeWarn();
    if (curNum < qCount) {
      if (choiceChk()) {
        this.quizNav(this.direction);
      }
    } else if(choiceChk()) {
      showResult();
      fragQuiz.className = 'quiz-container hidden';
      fragResult.className = 'quiz-container';
      EventUtil.addHandler(retryBtn, 'click', retryHandler);
    }
  };
  question = new Question(curNum);
  question.showQuestion();

}

function getChoice() {
  var radios = answer.getElementsByTagName('input');
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
    allChoice = answer.getElementsByTagName('input');
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
      showWarn();
      EventUtil.addHandler(nextBtn, 'click', btnClickHandler);
      return false;
    default :
      scoreCur = '0';
  }
  // Tally score
  tScore[curNum - 1] = scoreCur;
  return true;
}

function Question(num) {
  this.qNum = num;
  this.text = allQuestions[num - 1].question;
  this.choices = allQuestions[num - 1].choices;
  this.answer = allQuestions[num - 1].correctAnswer.toString();
  this.cLen = allQuestions[num - 1].choices.length;
}

Question.prototype = {
  constructor : Question,
  showQuestion : function() {
    qNumCur.nodeValue = this.qNum;
    qTextCur.nodeValue = this.text;
    // Remove existing choices first
    removeAllChild(answer);
    // Remove event handlers for 'li'
    EventUtil.removeHandler(answer, 'click', this.choiceHandler);
    var cCount, len;
    for(cCount = 1, len = this.cLen; cCount <= len; cCount++) {
      var choiceLi = document.createElement('li');
      choiceLi.className = 'choice';
      var choiceBtn = document.createElement('input');
      choiceBtn.type = 'radio';
      choiceBtn.value = cCount - 1;
      choiceBtn.name = 'answer';
      choiceBtn.id = 'ci' + cCount;
      var choiceLabel = document.createElement('label');
      choiceLabel.setAttribute('for', 'ci' + cCount);
      var lText = this.choices[cCount - 1];
      var labelText = document.createTextNode(lText);
      choiceLabel.appendChild(labelText);
      choiceLi.appendChild(choiceBtn);
      choiceLi.appendChild(choiceLabel);
      answer.appendChild(choiceLi);
    }
    cAns = this.answer;
    // prev button
    if (curNum == 1) {
      prevBtn.className = 'btn cir-r light hidden';
    } else if(prevBtn.className != 'btn cir-r light') {
      prevBtn.className = 'btn cir-r light';
    }
    // get previous choice
    loadLocalChoice('Q' + this.qNum);
    // Add event handlers
    EventUtil.addHandler(answer, 'click', this.choiceHandler);
    EventUtil.addHandler(nextBtn, 'click', btnClickHandler);
    EventUtil.addHandler(prevBtn, 'click', btnClickHandler);
  },
  choiceHandler: function(event) {
    var e = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(e);
    Question.prototype.emChoice(target);
  },
  emChoice: function(target) {
    if(target.tagName == 'LI'){
      target.firstChild.checked = true;
    }
  }
};

function NavButton(dir){
  this.direction = dir;
}
NavButton.prototype = {
  constructor: NavButton,
  preHandler : function() {
    removeWarn();
    getChoice();
    NavButton.prototype.quizNav(this.direction);
  },
  quizNav : function(dir) {
    qContent.className = 'wcontent vhide';
    qContent.style.visibility = 'hidden';
    setTimeout(function() {
      qContent.style.visibility = 'visible';
      qContent.className = 'wcontent';
    }, 200);
    switch(dir){
      case 'next' :
        question = new Question(++curNum);
        break;
      case 'prev' :
        question = new Question(--curNum);
        break;
    }
    question.showQuestion();
  }
};

var btnClickHandler = function(event) {
  event = EventUtil.getEvent(event);
  var target = EventUtil.getTarget(event);
  EventUtil.removeHandler(target, event.type, arguments.callee);
  EventUtil.preventDefault(event);
  if(target.id == 'next' || target.parentNode.id == 'next') {
    nextButton.preHandler();
  } else if (target.id == 'prev' || target.parentNode.id == 'prev') {
    prevButton.preHandler();
  }
};

function retryHandler(e) {
  e.target.removeEventListener(e.type, arguments.callee);
  EventUtil.preventDefault(e);
  retryUp();
}

// Start Button
var startUp = function() {
  var blurBg = document.getElementsByClassName('blur-bg')[0],
  body = document.body;
  fragWelcome.className = 'welcome vhide';
  body.removeChild(blurBg);
  body.className = '';
  fragQuiz.className = 'quiz-container';
  setTimeout(function() {
    fragWelcome.className = 'welcome hidden';
  }, 100);
};

// Retry Button
var retryUp = function() {
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
  fragQuiz.className = 'quiz-container';
  fragResult.className = 'quiz-container hidden';
  prevBtn.className = 'btn cir-r light hidden';
  // Remove existing nodes
  removeAllChild(qNum, qText);
  tScore = [];
  storage.clear();
  quizInit();
}

// Warning message
function removeWarn(){
  choiceWarn.className = 'warn hidden';
}

function showWarn() {
  choiceWarn.className = 'warn';
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