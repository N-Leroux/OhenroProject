enchant(); //call the enchant framework (modified version for better display of multiline text).

var GAME_WIDTH = 720; //GAME_WIDTH global variable, alias of "Core.instance.width".
var GAME_HEIGHT = 405//GAME_HEIGHT global variable, alias of "Core.instance.height".
var xhr = null; //XMLHttpRequest object to retrieve data from XML file.
var DATA = null;

/**
 * anonymous function - window.onload
 * PARAM : void
 * RETURN : void
 * PURPOSE : wait for the whole page to load before creating the game object and the XMLHttpRequest object (for data exchange with the server). Start the game by pushing the title screen.
 */
window.onload = function(){
	xmlRequest(readData); //retrieve xml file data in DATA variable 
	var game = new Core(GAME_WIDTH,GAME_HEIGHT); //game object.
	game.fps=15; //frame per seconds set to a low amount as there are close to no animation.
	game.scale=1; //the scale is preserved between platforms.
	
	game.onload = function(){
		game.pushScene(new TitleScreen()); //push the title screen scene when the game finished loading.
	};
	
	game.start(); //start the game
};

var TitleScreen = Class.create(Scene, {
	initialize: function(){
		var p1, p2, p3;
		var game = Core.instance;
		
		Scene.apply(this);
		
		p1 = new Label("Part I : Culture & Tradition");
		p1.color = 'blue';
		p1.x = 0; p1.y = 0;
		p2 = new Label("Part II : Equipment & Accessories");
		p2.color = 'green';
		p2.x = 0; p2.y = 100;
		p3 = new Label("Part III : Visiting a temple");
		p3.color = 'red';
		p3.x = 0; p3.y = 200;
		
		p1.addEventListener('touchstart', function(){
			p1.color = 'black';
			p1.text = '*' + p1.text + '*';
		});
		
		p1.addEventListener('touchend', function(){
			this.color = 'blue';
			this.text = this.text.slice(1, this.text.length-1);
			game.pushScene(new PIExplanationScreenRedo(1));
		});
		
		p2.addEventListener('touchstart', function(){
			p2.color = 'black';
			p2.text = '*' + p2.text + '*';
		});
		
		p2.addEventListener('touchend', function(){
			p2.color = 'green';
			p2.text = p2.text.slice(1, p2.text.length-1);
			game.pushScene(new PIIShopScreen(1));
		});
		
		p3.addEventListener('touchstart', function(){
			p3.color = 'black';
			p3.text = '*' + p3.text + '*';
		});
		
		p3.addEventListener('touchend', function(){
			p3.color = 'red';
			p3.text = p3.text.slice(1, p3.text.length-1);
		});
		
		this.addChild(p1);
		this.addChild(p2);
		this.addChild(p3);
	}
});

var PIExplanationScreenRedo = Class.create(Scene, {
	initialize: function(screenNumber){
		var game = Core.instance; //game singleton
		var bgc; //background color
		var img, imgWidth, imgHeight, imgFilename; //illustration
		var title; //title
		var txt; //text
		
		Scene.apply(this);
		
		var screenInfo = getIdNode(getNodes(getIdNode(getNodes(DATA, "part"), 1), "screen"), screenNumber); //reads "get part 1 screen nodes from DATA"
		//var screenInfo = readScreenData(readPartData(DATA,1),screenNumber); //info on bcg, txt and title
				
		var imgInfo = getUniqueNode(screenInfo, "image"); //reads "get image from screenInfo"
		//var imgInfo = readImageData(screenInfo); //info on image size and filename
		
		
		/*Background color*/
		bgc = getNodeValue(screenInfo, "backgroundColor");
		this.backgroundColor = bgc;
		/*----------------*/
		
		/*Image*/
		imgWidth = getNodeValue(imgInfo, "width");
		imgHeight = getNodeValue(imgInfo, "height");
		imgFilename = "res/" + getNodeValue(imgInfo, "filename");
		
		img = new Sprite(parseInt(imgWidth), parseInt(imgHeight));
		game.load(imgFilename, function(){
			img.image = game.assets[imgFilename];
		});
		img.x = 0;
		img.y = game.height - img.height;
		this.addChild(img);
		/*-----*/
		
		/*Title*/
		title = new Label(getNodeValue(screenInfo, "title"));
		title.x = 0;
		title.y = 0;
		title.width = parseInt(imgWidth);
		title.height = GAME_HEIGHT - parseInt(imgHeight);
		title.textAlign = 'center';
		title.font = "20pt Verdana";
		this.addChild(title);
		/*-----*/
		
		/*Content text*/
		txt = new Label(getNodeValue(screenInfo, "text"));
		txt.x = parseInt(imgWidth);
		txt.y = 5;
		txt.width = game.width - txt.x -5;
		txt.height = game.height - txt.y -5;
		txt.font = "12pt Verdana";
		txt.textAlign = "left";
		this.addChild(txt);
		/*------------*/
		
		/*Navigation*/
		this.addEventListener("touchstart", function(){
			var game = Core.instance;
			if(screenNumber<5){
				game.replaceScene(new PIExplanationScreenRedo(screenNumber+1));
			}else{
				game.replaceScene(new PIQuizScreenRedo(screenNumber+1));
			}
		});
		/*----------*/
	}
	
});

var PIExplanationScreen = Class.create(Scene, {
	initialize: function(screenNumber){
		var game = Core.instance; //game singleton
		var xhttp = new XMLHttpRequest(); //object to collect XML data
		
		var backgroundColor; //background color in HEX format as a String
		var imgWidth, imgHeight, imgFilename; //information on the image
		var img; //image
		var title = new Label(""); //title of the screen as a Label
		var txt = new Label(""); //text of the screen as a Label
		
		Scene.apply(this); //call the Scene superclass constructor
		
		xhttp.open("GET", "./res/contents.xml", false);
		xhttp.onreadystatechange = function() {
			if(xhttp.readyState == 4 && xhttp.status == 200){
				//if the reading of the XML file is complete...
				var xmlDoc; //content, as a XML tree
				var partInfo; //information on the First Part
				var screenInfo; //information on the screenNumber-th screen 
				
				xmlDoc = xhttp.responseXML;
				
				/*test = xmlDoc.getElementsByTagName("part")[0].childNodes;
				display = '';
				alert(test.length);
				for(i = 0; i < test.length ; i++){
					display += " " + test[i].nodeName + "(" + test[i].nodeValue + ")";
				}
				alert(display);*/
				
				parts = xmlDoc.getElementsByTagName("part"); //get the correct part between all the parts.
				for(i=0;i<parts.length;i++){
					id = parts[i].getAttribute("id");
					if(id!=null && parseInt(id) == 1){
						partInfo = parts[i];
						break;
					}
				}
				
				screens = partInfo.getElementsByTagName("screen"); //get the correct screen between all the screens.
				for(i=0;i<screens.length;i++){
					id = screens[i].getAttribute("id");
					if(id!=null && parseInt(id) == screenNumber){
						screenInfo = screens[i];
						break;
					}
				}
				
				//screenInfo = xmlDoc.getElementsByTagName("part")[0].childNodes[parseInt(screenNumber)]; //search for the 1st part's screenNumber-th screen's information
				backgroundColor = screenInfo.getElementsByTagName("backgroundColor")[0].childNodes[0].nodeValue; //backgroundColor
				imgFilename = screenInfo.getElementsByTagName("image")[0].getElementsByTagName("filename")[0].childNodes[0].nodeValue; //imgFilename
				imgFilename = "res/" + imgFilename;
				imgWidth = screenInfo.getElementsByTagName("image")[0].getElementsByTagName("width")[0].childNodes[0].nodeValue; //imgWidth
				imgHeight = screenInfo.getElementsByTagName("image")[0].getElementsByTagName("height")[0].childNodes[0].nodeValue; //imgHeight
				title.text = screenInfo.getElementsByTagName("title")[0].childNodes[0].nodeValue; //title 
				txt.text = screenInfo.getElementsByTagName("text")[0].childNodes[0].nodeValue; //text
			}
		};
		xhttp.send();
		//alert(backgroundColor);
		this.backgroundColor = backgroundColor; //set background color
		
		//alert(imgFilename);
		img = new Sprite(parseInt(imgWidth), parseInt(imgHeight));
		game.load(imgFilename, function(){
			//alert("loaded");
			img.image = game.assets[imgFilename];
		}); //img
		img.x = 0;
		img.y = game.height - img.height;
		this.addChild(img); //set image in the bottom left corner
		
		//alert(title.text);
		title.x = 0;
		title.y = 0;
		title.width = parseInt(imgWidth);
		title.height = game.height - parseInt(imgHeight);
		title.textAlign = 'center';
		title.font = "20pt Verdana";
		this.addChild(title); //set title in the upper left corner;
		
		//alert(txt.text);
		txt.x = parseInt(imgWidth);
		txt.y = 5;
		txt.width = game.width - txt.x -5;
		txt.height = game.height - txt.y -5;
		txt.font = "12pt Verdana";
		txt.textAlign = "left";
		this.addChild(txt);
		
		this.addEventListener("touchstart", function(){
			var game = Core.instance;
			if(screenNumber<5){
				game.replaceScene(new PIExplanationScreen(screenNumber+1));
			}else{
				game.replaceScene(new PIQuizScreen(1));
			}
		});
		
		/*var game = Core.instance;
		var backgroundImage; //image displayed on the explanation screen, including text.
		var backgroundImageUrl; //url of the image to use.
		
		Scene.apply(this);
		
		backgroundImageUrl = "res/p1s"+screenNumber+".png";
			
		backgroundImage = new Sprite(game.width,game.height);
		game.load(backgroundImageUrl, function(){
			backgroundImage.image = game.assets[backgroundImageUrl];
		});
		
		this.addChild(backgroundImage);
		backgroundImage.addEventListener("touchstart", function(){
			var game = Core.instance;
			if(screenNumber<5){
				game.replaceScene(new PIExplanationScreen(screenNumber+1));
			}else{
				alert("Quiz");
				game.replaceScene(new PIQuizScreen(1));
			}
		});*/
	}
});

var PIQuizScreenRedo = Class.create(Scene, {
	initialize: function(questionNumber){
		var game = Core.instance; //game singleton
		var question;
		var answersGroup = new Group();
		var explanationsGroup = new Group();
		var MARGIN = 5;
		
		Scene.apply(this);
		
		var screenInfo = getIdNode(getNodes(getIdNode(getNodes(DATA, "part"),1),"screen"),questionNumber);
		//var screenInfo = readScreenData(readPartData(DATA,1),questionNumber);
		
		/*Background color*/
		this.backgroundColor = "white";
		/*----------------*/
		
		/*Question*/
		question = new Label(getNodeValue(screenInfo, "question"));
		question.x = 0;
		question.y = 0;
		question.width = game.width;
		question.height = 50;
		question.textAlign = "center";
		question.font = "16px Verdana";
		this.addChild(question);
		/*--------*/
		
		/*Answers and explanations*/
		var answers = getNodes(screenInfo, "answer");
		var explanations = getNodes(screenInfo, "explanation");
		
		for(i=0, c=answers.length; i<c; i++){
			if(answers[i])
				var answer = new Label(answers[i].childNodes[0].nodeValue);
			else
				var answer = new Label("");
			answer.x = MARGIN;
			answer.y = i*(game.height)/3 + question.height;
			answer.width = game.width/2-MARGIN;
			answer.font = "14px Verdana";
			answersGroup.addChild(answer);
			if(explanations[i])
				var explanation = new Label(explanations[i].childNodes[0].nodeValue);
			else
				var explanation = new Label("");
			explanation.x = answer.width+MARGIN;
			explanation.y = answer.y;
			explanation.width = game.width/2-MARGIN;
			explanation.font = "14px Verdana";
			explanationsGroup.addChild(explanation);
		}
		this.addChild(answersGroup);
		/*------------------------*/
		
		answersGroup.addEventListener("touchend", function(){
			var game = Core.instance;
			this.parentNode.addChild(explanationsGroup);
			//explanationsGroup.visibility = true;
			this.parentNode.addEventListener("touchstart", function(){
			if(questionNumber<8)
				game.replaceScene(new PIQuizScreenRedo(questionNumber+1));
			else
				game.popScene();
			});
		});
	}
});

var PIQuizScreen = Class.create(Scene, {
	initialize: function(questionNumber){
		var game = Core.instance;
		var question = new Label("");
		var xhttp = new XMLHttpRequest(); //object to collect XML data
		var answersGroup = new Group();
		var explanationsGroup = new Group();
		
		Scene.apply(this);
		
		xhttp.open("GET", "./res/contents.xml", false);
		xhttp.onreadystatechange = function() {
			if(xhttp.readyState == 4 && xhttp.status == 200){
				//if the reading of the XML file is complete...
				var xmlDoc; //content, as a XML tree
				var partInfo; //information on the First Part
				var quizInfo; //information on the quizInfo-th question
				var MARGIN = 5;
				
				xmlDoc = xhttp.responseXML;
				
				parts = xmlDoc.getElementsByTagName("part"); //get the correct part between all the parts.
				for(i=0;i<parts.length;i++){
					id = parts[i].getAttribute("id");
					if(id!=null && parseInt(id) == 1){
						partInfo = parts[i];
						break;
					}
				}
				
				quiz = partInfo.getElementsByTagName("quiz"); //get the correct question between all the questions.
				for(i=0;i<quiz.length;i++){
					id = quiz[i].getAttribute("id");
					if(id!=null && parseInt(id) == questionNumber){
						quizInfo = quiz[i];
						break;
					}
				}
				
				question.text = quizInfo.getElementsByTagName("question")[0].childNodes[0].nodeValue;
				question.x = 0;
				question.y = 0;
				question.width = Core.instance.width;
				question.height = 50;
				question.textAlign = "center";
				question.font = "16px Verdana";
				
				answers = quizInfo.getElementsByTagName("answer");
				explanations = quizInfo.getElementsByTagName("explanation");
				
				for(i=0;i<Math.max(answers.length, explanations.length);i++){
					if(answers[i]!=null)
						answer = new Label(answers[i].childNodes[0].nodeValue);
					else
						answer = new Label("");
					answer.x = MARGIN;
					answer.y = i*(Core.instance.height)/3 + question.height;
					answer.width = Core.instance.width/2-MARGIN;
					answer.font = "14px Verdana";
					answersGroup.addChild(answer);
					if(explanations[i]!=null)
						explanation = new Label(explanations[i].childNodes[0].nodeValue);
					else
						explanation = new Label("");
					explanation.x = answer.width+MARGIN;
					explanation.y = answer.y;
					explanation.width = Core.instance.width/2-MARGIN;
					explanation.font = "14px Verdana";
					explanationsGroup.addChild(explanation);
				}
			}
		};
		xhttp.send();
		this.backgroundColor = "white";
		this.addChild(question);
		this.addChild(answersGroup);
		
		answersGroup.addEventListener("touchend", function(){
			this.parentNode.addChild(explanationsGroup);
			this.parentNode.addEventListener("touchstart", function(){
			if(questionNumber<3)
				Core.instance.replaceScene(new PIQuizScreen(questionNumber+1));
			else
				Core.instance.popScene();
			});
		});
		
		
		
	}
});

var PIIShopScreen = Class.create(Scene, {
	initialize: function(screenNumber){
		var game = Core.instance;
		var backgroundImage;
		var imageUrl;
		var itemsGroup = new Group();
		
		Scene.apply(this);
		
		var screenInfo = getIdNode(getNodes(getIdNode(getNodes(DATA, "part"),2),"screen"),screenNumber);
		//alert(screenInfo);
		var imageInfo = getUniqueNode(screenInfo, "image");
		//alert(imageInfo);
		var itemsInfo = getNodes(screenInfo, "item");
		//alert(itemsInfo);
		
		/*Background image*/
		imageUrl = "res/" + getNodeValue(imageInfo, "filename");
		backgroundImage = new Sprite(game.width, game.height);
		game.load(imageUrl, function(){
			backgroundImage.image = game.assets[imageUrl];
		});
		this.addChild(backgroundImage);
		/*----------------*/
		
		/*Items*/
		for(i=0, c=itemsInfo.length; i<c; i++){
			var item = new Sprite(30,30);
			item.backgroundColor = "#BE90D4";
			item.opacity = 0.8;
			item.x = parseInt(getNodeValue(itemsInfo[i], "x"));
			item.y = parseInt(getNodeValue(itemsInfo[i], "y"));
			item.id = itemsInfo[i].getAttribute("id");
			alert("x="+item.x+",y="+item.y);
			item.addEventListener("touchstart", function(){
				alert("touchevent");
				this.opacity=0;
				this.parentNode.parentNode.addChild(new PIIExplanationScreen(this.id));
			});
			item.addEventListener("enterframe", function(){
				switch(this.age%20){
					case 0:
						this.backgroundColor = "#A37BB5";
						break;
					case 10:
						this.backgroundColor = "#BE90D4";
						break;
					default:
						break;
				}
			});
			itemsGroup.addChild(item);
		}
		this.addChild(itemsGroup);
		/*-----*/
	}
});

var PIIExplanationScreen = Class.create(Group, {
	initialize: function(explanationNumber){
		var game = Core.instance;
		var expFrame;
		var expImage;
		var imgFilename, imgWidth, imgHeight;
		var expText;
		var MARGIN = 5;
		
		Group.apply(this);
		
		var explanationInfo = getIdNode(getNodes(getIdNode(getNodes(DATA, "part"),2),"explanation"),explanationNumber);
		
		var imageInfo = getUniqueNode(explanationInfo, "image");
		
		/*Frame*/
		expFrame = new Sprite(game.width-2*MARGIN, game.height-2*MARGIN);
		expFrame.backgroundColor = "white";
		expFrame.opacity = 0.8;
		expFrame.x = MARGIN;
		expFrame.y = MARGIN;
		this.addChild(expFrame);
		/*-----*/
		
		/*Image*/
		if(imageInfo){
			imgWidth = getNodeValue(imageInfo, "width");
			imgHeight = getNodeValue(imageInfo, "height");
			imgFilename = "res/" + getNodeValue(imageInfo, "filename");
			
			expImage = new Sprite(imgWidth, imgHeight);
			game.load(imgFilename, function(){
				expImage.image = game.assets[imgFilename];
			});
			expImage.opacity=0.5;
			expImage.x = game.width/2 - imgWidth/2;
			expImage.y = game.height/2 - imgHeight/2;
			this.addChild(expImage);
		}
		/*-----*/
		
		/*Text*/
		expText = new Label(getNodeValue(explanationInfo, "text"));
		expText.x = MARGIN;
		expText.y = MARGIN;
		expText.width = game.width-2*MARGIN;
		this.addChild(expText);
		/*----*/
		
		/*Nav*/
		this.addEventListener("touchend", function(){
			this.parentNode.removeChild(this);
		});
		/*---*/
	}
	
	
});
