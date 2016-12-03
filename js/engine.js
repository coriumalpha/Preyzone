var rotationSpeed = 10; //RPM with acceleration set to false
var refreshSpeed = 35//RfrPS
var accelerationPr = 100; //% per Revolution
var debug = false; //may cause animation go slow
var angleRaw = 0;
var pointCounter = 0;
var tryCounter = 0;

rotationSpeed = ((rotationSpeed / 60) * 360); //degs per sec
acceleration = accelerationPr / 100; //coeficiente
refreshSpeed = 1000 / refreshSpeed;


$(function()
	{
		spawnSquares();
		fontSize();
		draw();
		rotationEngine();
		//For performance improvement on slower devices
		switch(getParameterByName("speed"))
		{
			case "conservative":
				refreshSpeed = 60;
				alert("conservative speed set");
				break;
			case "slow":
				refreshSpeed = 100;
				alert("slow speed set");
				break;
			case "turtle":
				refreshSpeed = 160;
				alert("Andalusian speed set");
				break;
		}
	});
$(window).resize(function()
	{
		spawnSquares();
		fontSize();
	});

var newFireAllowed = true;
$('body').keydown(function(e)
{
	if(e.keyCode == 32)
	{
		e.preventDefault(); //stops browser from scrolling
		if(newFireAllowed)
		{
			validateFire();
			newFireAllowed = false;
		}
	}
});
$('body').keyup(function(e)
{
	if(e.keyCode == 32)
	{
		newFireAllowed = true;
	}
});

$("#scoreBoard").click(function(){
	if(rotationEngineStatus == "running")
	{
		rotationEngineControl("stop");
	}
	else if(rotationEngineStatus == "stop")
	{
		rotationEngineControl("ruuuuuuuun!!!");
	}
});

function draw(bgcolor) {
	bgcolor = (bgcolor === undefined || bgcolor == null) ? "#73D11B" : bgcolor;
  	var canvas = document.getElementById('canvasCone');
  	$("#canvasCone").css("width", "10%");
	if (canvas.getContext){
    var ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.moveTo(0,15);
	ctx.lineTo(30,60);
	ctx.lineTo(60,15)
	ctx.arcTo(30,0,0,15,60);
	ctx.fillStyle = bgcolor;
	ctx.fill();
  }
}


function fontSize()
{
    var fontSize = $("#scoreBoardLeft").height() * 0.85; // 10% of container width
    $("#scoreBoardLeft").css('font-size', fontSize);
    $("#scoreBoardRight").css('font-size', fontSize);
    $("#initialTip").css('font-size', (fontSize * 0.35));
}

function spawnSquares()
{
	setTarget();
	
	var vh = $(window).height();
	var vw = $(window).width();
	
	var dynamicPercent = 20;
	
	var resultW = parseInt(vh - (vh * (dynamicPercent / 100)));
	var resultL = parseInt(vw - (vw / 2) - (resultW / 2));
	var resultMT = parseInt(vh * 0.01);
	
	var resultW_vertical = parseInt(vw - (vw * (dynamicPercent / 100)));
	var resultL_vertical = parseInt(vw - (vw / 2) - (resultW_vertical / 2));
	var resultMT_vertical = parseInt(vw * 0.02);
	
	//Vertical orientation support for Cordova/Phonegap porting
	if(vw > vh)
	{
		$("#mainContainer").css("width", resultW + "px");
		$("#mainContainer").css("left", resultL + "px");
		$("#mainContainer").css("margin-top", resultMT + "px");
	}
	else
	{
		$("#mainContainer").css("width", resultW_vertical + "px");
		$("#mainContainer").css("left", resultL_vertical + "px");
		$("#mainContainer").css("margin-top", resultMT_vertical + "px");
	}

	for(i = 0; i < 4; i++)
	{
		setAux(i + 1);
	}
}

var last = true;
function validateFire()
{
	if(((angleRaw % 90) < 15) || ((angleRaw % 90) > 75))
	{
		pointCounter++;
		last = true;
		updateColor("#aux_1", last);
		axis = ((pointCounter % 2) == 0) ? "x" : "y";
		axis = ((pointCounter % 3) == 0) ? "both" : axis;
		axis = ((pointCounter % 5) == 0) ? "fw" : axis;
		axis = (((pointCounter - 1) % 5) == 0) ? "fw" : axis;
		axis = (pointCounter == 1) ? "both" : axis;

		if(((pointCounter + 1) % 5) == 0)
		{
			$("#canvasCone").css("transform", "rotate(315deg)");
		}
		toggleAux(axis);
	}
	else
	{
		last = false;
		updateColor("#aux_1", last);
		$("#scoreBoard").effect("shake", "", 100);
	}
	tryCounter++;
	if(tryCounter == 1)
	{
		$("#initialTip").effect("fold", "", 350).hide("swing");
	}
	$("#scoreBoardLeft").html(pointCounter);
	$("#scoreBoardRight").html(tryCounter - pointCounter);
}

var rotationEngineTimeout;
var rotationEngineStatus;
function rotationEngine()
{
	rotationEngineTimeout = setTimeout(rotationEngine, refreshSpeed);
	rotationEngineStatus = "running";
	var initialAngle = angleRaw;
	if(debug == true) { console.log("inAn " + initialAngle); }
	phaseFactor = ((((initialAngle * 100) / 360) / 100)); //need +1 to realy be a factor
	triangularPhaseFactor  = (angleRaw < 180) ? (phaseFactor * 2) : (1 - phaseFactor ); //same as phaseFactor
	if(debug == true) { console.log("tpf " + triangularPhaseFactor); }
	if(debug == true) { console.log("pf " + phaseFactor); }
	//if(acceleration != 0) { phaseFactor = phaseFactor * (acceleration + 1); }
	triangularIncreaseRatio = ((rotationSpeed * (1 + triangularPhaseFactor)) );
	//angleRaw = (angleRaw * (1 + phaseFactor));
	angleRaw = ((initialAngle + (triangularIncreaseRatio / (1000 / (refreshSpeed - 1)))) % 360);
	if(debug == true) { console.log("fAraw " + angleRaw); }
	var angle = parseInt(angleRaw);
	if(debug == true) { console.log("angle " + angle); }
    setRotationPosition(angle);
}

function rotationEngineControl(control)
{
	if(control == "stop")
	{
		clearTimeout(rotationEngineTimeout);
	}
	else
	{
		rotationEngineTimeout = setTimeout(rotationEngine, refreshSpeed);
	}
	rotationEngineStatus = control;
}

function setRotationPosition(angle)
{
	$("#auxContainer")
	    .css('-webkit-transform', 'rotate('+angle+'deg)')
        .css('-moz-transform', 'rotate('+angle+'deg)')
        .css('-ms-transform', 'rotate('+angle+'deg)');
}

function setTarget()
{
	var target = $("#scoreBoard");
	target.css("top", "42.5%");
	target.css("left", "30%");
}

function setAux(aux)
{
	var target = $("#aux_" + aux);
	target.css("transform-origin", "center center");
	target.css("transition-property", "top, left, background");
	target.css("transition-duration", "0.25s, 0.25s, 0.25s");
	switch(aux)
	{
		case 1:
			target.css("top", "0%");
			target.css("left", "45%");
			break;
		case 2:
			target.css("top", "47.5%");
			target.css("left", "95%");
			break;
    	case 3:
			target.css("top", "95%");
			target.css("left", "47.5%");
			break;
    	case 4:
			target.css("top", "47.5%");
			target.css("left", "0%");
			break;

	}
}

function updateColor(el, last)
{
	//Dissapointed with this method
    if(last)
	{
		draw("#73D11B");
	}
	else
	{
		draw("#8F1D1D");
	}
}

var yToggleStatus = false;
var xToggleStatus = false;
var fwToggleStatus = false;
function toggleAux(axis)
{
	if(axis == "y" || axis == "both")
	{
		if(yToggleStatus)
		{
			$("#aux_1").css("top", "0%");
			$("#canvasCone").css("transform", "rotate(0deg)");
			$("#canvasCone").css("-ms-transform", "rotate(0deg)");
			$("#canvasCone").css("-webkit-transform", "rotate(0deg)");
			$("#aux_3").css("top", "95%");
			yToggleStatus = false;
		}
		else
		{
			$("#aux_1").css("top", "85%");
			$("#canvasCone").css("transform", "rotate(180deg)");
			$("#canvasCone").css("-ms-transform", "rotate(180deg)");
			$("#canvasCone").css("-webkit-transform", "rotate(180deg)");
			$("#aux_3").css("top", "0%");
			yToggleStatus = true;
		}
	}

	if(axis == "x" || axis == "both")
	{
		if(xToggleStatus)
		{
			$("#aux_2").css("left", "95%");
			$("#aux_4").css("left", "0%");
			xToggleStatus = false;
		}
		else
		{
			$("#aux_2").css("left", "0%");
			$("#aux_4").css("left", "95%");
			xToggleStatus = true;
		}
	}

	if(axis == "fw")
	{
		if(fwToggleStatus)
		{
			$("#aux_1").css("top", "0%");
			$("#aux_1").css("left", "45%");
			$("#aux_2").css("top", "47.5%");
			$("#aux_2").css("left", "95%");
			$("#canvasCone").css("transform", "rotate(0deg)");
			fwToggleStatus = false;
		}
		else
		{
			$("#aux_1").css("left", "90%");
			$("#aux_1").css("top", "42.5%");
			$("#aux_2").css("left", "47.5%");
			$("#aux_2").css("top", "0%");
			$("#canvasCone").css("transform", "rotate(135deg)");
			fwToggleStatus = true;
		}
	}
}

function getParameterByName(name, url)
{
    if (!url)
    {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}