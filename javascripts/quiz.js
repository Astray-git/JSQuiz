// Question array
var allQuestions = [
{
    question: "Who is Prime Minister of the United Kingdom?", 
    choices: ["David Cameron", "Gordon Brown", "Winston Churchill", "Tony Blair"], 
    correctAnswer:0
},
{
	question: "What is Javascript?", 
	choices: ["An ancient language", "A programming language", "A medieval manuscript", "An internet troll"], 
	correctAnswer:1
},
{
	question : "Where is Venice?",
	choices : ["Peru", "Greece", "US", "Italy", "Congo"],
	correctAnswer : 3
},
{
	question : "What does RGB mean?",
	choices : ["Red, Green, Blue", "Real Graphics Body",  "SWAG"],
	correctAnswer : 0
},
{
	question : "How many strings has a  guitar?",
	choices : [3,4,5,6,7,8],
	correctAnswer : 3
}
];

var // Get key elements
  body = document.body,
  qTitle = document.querySelector('.qtitle'),
  qNum = document.querySelector('#qnum'),
  qText = document.querySelector('.qtext'),
  answer = document.querySelector('#answer'),
  nextBtn = document.querySelector('#next'),
  quizContainer = nextBtn.parentNode,
  result = document.querySelector('#result'),
  tsText = document.querySelector('#tsText'),
  retryBtn = document.querySelector('#retry'),
  fragQuiz = document.querySelector('#frag-quiz'),
  fragResult = document.querySelector('#frag-result');

// Init Vars
var curNum = 1,
  qCount = allQuestions.length,
  tScore = new Array(qCount);
// Chosen Answer
var qAns = null;
// Correct Answer
var cAns = null;
// Question Nodes
var qNumCur = document.createTextNode(curNum),
  qTextCur = document.createTextNode(allQuestions[0].question);

function quizInit() {
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

    for(var cCount = 1, cLen = allQuestions[curNum - 1].choices.length; cCount <= cLen; cCount++) {
        var choice = document.createElement('li');
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
    var cValue = null;
    var scoreCur;
    for (var i = 0; i < radios.length; i++) {
        if(radios[i].checked) {
            cValue = radios[i].value;
        }
    }
    // Check the choice
    if (cValue == cAns) {
        scoreCur = '1';
    } else if (cValue === null) {
        doWarn('Make your choice.');
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
    } else {
        choiceChk();
        showResult();
        fragQuiz.className = 'wrapper hide';
        fragResult.className = 'wrapper';
    }
};

// Retry Button
var retryUp = function() {
    fragQuiz.className = 'wrapper';
    fragResult.className = 'wrapper hide';
    quizReset();
}

// Add event handler
EventUtil.addHandler(nextBtn, 'click', function(event) {
    EventUtil.preventDefault(event);
    nextUp();
});
EventUtil.addHandler(retry, 'click', function(event) {
    EventUtil.preventDefault(event);
    retryUp();
});

// Result
function showResult() {
    removeAllChild(result, tsText);
    var corCount = 0;
    for (var rCount = 1; rCount <= qCount; rCount++) {
        var qScore = document.createElement('li');
        var qsText = document.createTextNode(rCount + '. ');
        qScore.appendChild(qsText);
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
    // Chosen Answer
    qAns = null;
    // Correct Answer
    cAns = null;
    // Questions reset
    qNumCur.nodeValue = curNum;
    qTextCur.nodeValue = allQuestions[curNum - 1].question;
    // Re-Init
    quizInit();  
}

// Show warning text
function doWarn(text) {
    var choiceWarn = document.createElement('p');
    choiceWarn.setAttribute('id', 'choice-warn');
    var warnText = document.createTextNode(text);
    choiceWarn.appendChild(warnText);
    var existWarn = document.getElementById('choice-warn');
    if (existWarn) {
        quizContainer.removeChild(existWarn);
    }
    quizContainer.insertBefore(choiceWarn, nextBtn);
}

//-----------
// Utilities
//-----------

// removeAllChild
function removeAllChild(elems) {
    for (var i = 0, len = arguments.length; i < len; i++){
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

// ONLOAD
addLoadEvent(quizInit);
