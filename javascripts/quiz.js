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
  if(usrName) {
    welcomeText.appendChild(document.createTextNode(', ' + usrName));
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
  nextBtn = document.querySelector('#next'),
  prevBtn = document.querySelector('#prev'),
  quizContainer = prevBtn.parentNode,
  result = document.querySelector('#result'),
  tsText = document.querySelector('#tsText'),
  retryBtn = document.querySelector('#retry'),
  startBtn = document.querySelector('#start'),
  fragQuiz = document.querySelector('#frag-quiz'),
  fragResult = document.querySelector('#frag-result'),
  fragWelcome = document.querySelector('.welcome');
  welcomeText = document.querySelector('.wel-text');

// Init Vars
var curNum = 1,
  qCount,
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
  // Add event handlers for 'li'
  EventUtil.addHandler(answer, 'click', liHandler);
}

// Delegate Handler for 'li' click
function liHandler(event) {
  event = EventUtil.getEvent(event);
  var target = EventUtil.getTarget(event);
  if(target.tagName == 'LI'){
    target.firstChild.checked = true;
  }
}

// Choice Checker & Tally Score
function choiceChk() {
  var radios = document.querySelectorAll('input[name="answer"]');
  // Get the checked choice
  var cValue = null,
    scoreCur,i,len;
  for (i = 0, len = radios.length; i < len; i++) {
    if(radios[i].checked) {
      cValue = radios[i].value;
    }
  }
  // Check the choice
  if (cValue == cAns) {
    scoreCur = '1';
  } else if (cValue === null) {
    doWarn('Make your choice.', quizContainer, prevBtn);
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
  }
};

// Retry Button
var retryUp = function() {
  fragQuiz.className = 'wrapper';
  fragResult.className = 'wrapper hidden';
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
  }, 600);
};

// Add event handler
EventUtil.addHandler(nextBtn, 'click', function(event) {
  EventUtil.preventDefault(event);
  nextUp();
});
EventUtil.addHandler(retryBtn, 'click', function(event) {
  EventUtil.preventDefault(event);
  retryUp();
});
EventUtil.addHandler(startBtn, 'click', function(event) {
  EventUtil.preventDefault(event);
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
  // Re-Init
  quizInit();  
}

//-----------
// Utilities
//-----------

// Fade In
function fadeIn(el) {
  var opacity = 0;
  el.style.opacity = 0;
  el.style.filter = '';
  var last = +new Date();
  var tick = function() {
    opacity += (new Date() - last) / 400;
    el.style.opacity = opacity;
    el.style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')';

    last = +new Date();

    if (opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 100);
    }
  };
  tick();
}

function fadeOut(el) {
  var opacity = 1;
  el.style.opacity = 1;
  el.style.filter = '';
  var last = +new Date();
  var tick = function() {
    opacity -= (new Date() - last) / 400;
    el.style.opacity = opacity;
    el.style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')';

    last = +new Date();

    if (opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 100);
    }
  };
  tick();
  el.style.display = 'none';
}

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