// Socket setup to send and receive calculations with server

var socket = io.connect();

var calculations = [];
    
socket.on("message", function(msg) {
    calculations.push(msg);
    var len = calculations.length - 1;
    var log = "";

    for(var i = 0; i < 10; i++) {
        if(len-i < 0) {
            i = 10;
        }
        else{
            log += "<p>" + calculations[len - i] + "</p>";
        }
    }
    
    $("#chatlog").html(log);
});

// Calculator logic

var displayStr = "",        // string to be displayed on main screen
    numStr = "",            // string that builds current number
    numVal = 0,             // float version of current number
    result = 0,             // stores calculated, accumulating result
    oldVal = 0,             // stores left half of multiplication and division calculations
    oldResult = 0,          // stores result of previous calculation
    digLimit = 50,          // character limit for screen display
    mult = false,           // multiplication indicator
    div = false,            // division indicator
    digitPressed = false,   // indicator to prevent two operators in a row
    done = false;           // equals has been pressed.
    
// Number button clicked

$(".digit").click(function() {
    numStr += this.getAttribute("digitVal");
    displayStr += this.getAttribute("digitVal");
    digitPressed = true;
    $("#screen").text(display(displayStr));
});

// Operator button clicked

$(".op").click(function() {
    numVal = parseFloat(numStr);
    numStr = "";
    
    // Operating on previous result.
    if(!digitPressed && displayStr === "") {
        numVal = oldResult;
        displayStr = oldResult.toString(); 
        digitPressed = true;
    }
    // Two operators in a row
    else if(!digitPressed && this.getAttribute("opVal") != 'subtract') {
        return;
    }

    // Multiplication calculate with right half
    if(mult && digitPressed) {
        numVal = oldVal * numVal;
        mult = false;
    }
    
    // Division calculate with right half
    if(div && digitPressed) {
        // Divide by zero
        if (numVal === 0) {
            displayStr += " = UNDEFINED";
            $("#screen").text(display(displayStr));
            
            displayStr = "";
            numStr = "";
            numVal = 0;
            result = 0;
            oldVal = 0;
            oldResult = 0;
            mult = false;
            div = false;
            digitPressed = false;
            done = false;
            return;
        }
        else {
            numVal = oldVal / numVal;
            div = false;
        }
    }
    
    
    switch (this.getAttribute("opVal")) {
    
        case 'subtract':
            if(digitPressed) {
                result += numVal;
            }
            numStr = "-";
            displayStr += " - ";
            break;
            
        case 'add':
            result += numVal;
            displayStr += " + ";
            break;
        
        case 'multiply':
            displayStr += " x ";
            oldVal = numVal;
            mult = true;
            break;
        
        case 'divide':
            displayStr += " / ";
            oldVal = numVal;
            div = true;
            break;
            
        case 'equals':
            result += numVal;
            oldResult = result;
            displayStr += " = ";
            displayStr += result.toString();
            socket.emit("message", displayStr);
            done = true;
            digitPressed = false;
            break;
        
        default:
            // code
    }
    
    if(!done) {
        $("#screen").text(display(displayStr));
    }
    else {
        $("#pastCalc").text(displayStr);
        $("#screen").text(display(displayStr));
        displayStr = "";
        result = 0;
        done = false;
    }
    
    digitPressed = false;
});

// Clear button clicked, reset.

$("#clear").click(function() {
        displayStr = "";
        numStr = "";
        numVal = 0;
        result = 0;
        oldVal = 0;
        oldResult = 0;
        mult = false;
        div = false;
        digitPressed = false;
        done = false;
    
    $("#pastCalc").text("Cleared!")
    $("#screen").text("0");  
});

// Screen display helper function

function display(displayStr) {
    if (displayStr.length > digLimit) {
        var viewStr = displayStr.slice(-digLimit, displayStr.length); 
        viewStr = "..." + viewStr;
        return viewStr;
    }
    else {
        return displayStr;
    }
}
