//these are the items that need to be imported
const electron = require('electron'); //the electron system
const electronLocalShortcut = require('electron-localshortcut'); //specifically electron stuff for shortcuts
const url = require('url'); //an imported thing for urls that make things easier
const path = require('path'); //same as the url import but with system paths
const fs = require('fs'); // import for writting things to files

//this creates items from the electron system
const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = electron;
//objects start ----------------------------------------------
//this function just creates a new Slide Deck
function getNewDeck(deckName){
	return new Deck(deckName);
}

function recreate(json){
	tempName = json.deckName;
	console.log(tempName);
}

/*
function recreate(json){
	var tempName = json.deckName;
	var tempSlides = json.slides;
	var tempCurrentSlide = json.currentSlide;
	var tempSlideObjects = [];
	for(var i = 0; i < tempSlides.length; i++){
		tempSlideObjects.push(new Slide(tempSlides[i].Slidetitle,tempSlides[i].Slideindex));
		tempSlideObjects[i].addTextBox(tempSlides[i].textBox); //temp function will be changed later
	}
	currentDeck = new Deck(tempName);
	currentDeck.setSlides(tempSlideObjects);
	currentDeck.changeCurrentSlide(tempCurrentSlide);
	console.log(currentDeck);
}
*/

//object methods

//deck methods
function addSlidetoDeck(deck,slide,index){
	deck.slides.splice(index,0,slide); //the actual insertion of the slide
	changeCurrentSlide(deck,index); 
	for(currentIndex = 0; currentIndex < deck.slides.length; currentIndex++){ //this for loop updates all the slide indexs so that
		deck.slides[currentIndex].Slideindex = currentIndex;					  //all the slides have their correct index
	}
}

function removeSlidefromDeck(deck,index){
	tempone = deck.slides.slice(0,index); //this breaks off the front end of the list before the to be removed slide
	temptwo = deck.slides.slice(index);	  //this breaks off the list starting at the to be removed slide and everything after
	temptwo.shift();					  //this removed the slide no longer wanted and makes the second list smaller by one
	deck.slides = tempone.concat(temptwo);//this combines the two lists broken off from this.slides and sets this.slides equal to it again
			//everything above had to be done so that there wasn't empty slot inside of the this.slides list which is what delete would do
	for(currentIndex = 0; currentIndex < deck.slides.length; currentIndex++){ //this does the same thing as the for loop in addSlide
		deck.slides[currentIndex].Slideindex = currentIndex;
	}
	if(deck.currentSlide >= deck.slides.length){ //this makes sure that the current slide is not pointing to outside the slides
		deck.currentSlide = deck.slides.length-1;
	}
	if(deck.currentSlide < 0){	//same with this one just in the other direction
		deck.currentSlide = 0;
	}
}

function changeCurrentSlide(deck,index){
	deck.currentSlide = index;
	if(deck.currentSlide > deck.slides.length-1){//just like in the removeSlide function, with the same purpose
		deck.currentSlide = deck.slides.length-1	;
	}
	if(deck.currentSlide < 0){ //same here
		deck.currentSlide = 0;
	}
}

function deckDisplay(deck){
	console.log(deck.slides[deck.currentSlide]);
	return slideDisplay(deck.slides[deck.currentSlide]);
}

function jsonifytheDeck(deck){
	return JSON.stringify(deck);
}

//slide methods
function addTextBox(slide,textbox,index){
	slide.textboxes.splice(index,0,textbox);
}

function removeTextBox(slide,index){
	tempone = slide.textboxes.slice(0,index);
	temptwo = slide.textboxes.slice(index);
	temptwo.shift();
	slide.textboxes = tempone.concat(temptwo);
}

function slideDisplay(slide){
	tempList = [];
	tempList.push(slide.Slidetitle);
	tempList.push(slide.Slideindex);
	tempList.push(slide.textboxes);
	return tempList;
}

//textbox methods
function addtoTextBox(textbox,index){
	//stuff and things
}

function removefromTextBox(textbox,index){
	//stuff and things
}

//the Deck object
function Deck(deckName){
	this.deckName = deckName; //the deckName
	this.slides = []; //the slides in the slide deck
	this.currentSlide = 0; //the current slide that is being shown or edited

	//commented out for now, maybe deleted later
	/*
	this.getSize = function(){ //a getter function that grabs the total number of slides in the deck
		return this.slides.length;
	};
	this.getSlide = function(index){ //a getter function that grabs a specific slide based on the index given
		return this.slides[index];
	};
	this.setSlides = function(newSlides){
		this.slides = newSlides;
	}
	this.addSlide = function(slide,index){ //adds a slide to the slide deck at the specified index
		this.slides.splice(index,0,slide); //the actual insertion of the slide
		this.changeCurrentSlide(index); 
		for(currentIndex = 0; currentIndex < this.slides.length; currentIndex++){ //this for loop updates all the slide indexs so that
			this.slides[currentIndex].setIndex(currentIndex);					  //all the slides have their correct index
		}
	};
	this.removeSlide = function(index){ //removes a slide at the specified index
		tempone = this.slides.slice(0,index); //this breaks off the front end of the list before the to be removed slide
		temptwo = this.slides.slice(index);	  //this breaks off the list starting at the to be removed slide and everything after
		temptwo.shift();					  //this removed the slide no longer wanted and makes the second list smaller by one
		this.slides = tempone.concat(temptwo);//this combines the two lists broken off from this.slides and sets this.slides equal to it again
				//everything above had to be done so that there wasn't empty slot inside of the this.slides list which is what delete would do
		for(currentIndex = 0; currentIndex < this.slides.length; currentIndex++){ //this does the same thing as the for loop in addSlide
			this.slides[currentIndex].setIndex(currentIndex);
		}
		if(this.currentSlide >= this.slides.length){ //this makes sure that the current slide is not pointing to outside the slides
			this.currentSlide = this.slides.length-1;
		}
		if(this.currentSlide < 0){	//same with this one just in the other direction
			this.currentSlide = 0;
		}
	};
	this.getSlideIndex = function(){ //this function just returns the index of the slide currently being viewed/ edited
		return this.currentSlide;
	};
	this.changeCurrentSlide = function(newIndex){ //changes the current slide being viewed/edited
		this.currentSlide = newIndex;
		if(this.currentSlide > this.slides.length-1){//just like in the removeSlide function, with the same purpose
			this.currentSlide = this.slides.length-1	;
		}
		if(this.currentSlide < 0){ //same here
			this.currentSlide = 0;
		}
	};
	this.display = function(){  //the display function, shows only the current slide
		if(this.slides.length == 0){
			return "";
		}
		else{
			return this.slides[this.currentSlide].display();
		}
	};
	this.jsonify = function(){ //this function makes the current deck object into json format and passes that on
		return JSON.stringify(this);
	};
	*/
}

//the Slide object
function Slide(slideName,index){
	this.Slidetitle = slideName; //the title of this slide, can be just "" (empty title)
	this.Slideindex = new Number(index); //the index that this slide is, the new Number thing is just to make sure it is a number
	this.textboxes = []; // the text box in this slide, maybe in the future this will be a list of things inside the slide

	/*
	this.getIndex = function(){ //just a function to return the slide's index
		return this.Slideindex;
	};
	this.setTitle = function(newSlideName){ //a function to change the title of the slide
		this.Slidetitle = newSlideName;
	};
	this.addTextBox = function(textBox){
		this.textBox = textBox;
	};
	this.addToTextBox = function(text,index){ //a function to adds text to the text box, currently no interace to use this
		this.textBox.add(text,index);		  //just here for the future to make things easier
	};
	this.removeFromTextBox = function(index){ //a function to remove text from the text box, this is basically the same as pressing backspace
		this.textBox.remove(index);			  //or pressing delete, functionality will be added later
	};
	this.setIndex = function(newIndex){ //a function for setting the index of slide, mostly for the remove and add slide functions
		this.Slideindex = new Number(newIndex);
	};
	this.display = function(){ //the display function for the slide, for right now just returns the slide title and slide index
		return this;
		//be sure to also display the text box (later)
	};
	*/
}

//the Text Box object (this is not entirly done yet, some for functionally has to be added)
function TextBox(initalX,initalY,initialWidth,initialHeight){
	this.Text = []; //this list will contain all the text in the textbox, character by character
	this.CursorIndex = -1; //where the cursor is on the textbox if it is on the textbox, otherwise it is -1
	this.centerX = initalX; //the x value of where the textbox is when it is initially added
	this.centerY = initalY; //the y value of where the textbox is when it is initially added
	this.boxWidth = initialWidth; //the width value of the textbox when it is initially added
	this.boxHeight = initialHeight; //the height value of the textbox when it is initally added

	/*
	this.add = function(text,index){ //function for adding text to the textbox
		this.Text.splice(index,0,text);
		//adding a single character at the desired index
	};
	this.remove = function(index){ //function for removing text from the textbox
		tempone = this.text.slice(0,index);
		temptwo = this.text.slice(index);
		temptwo.shift();
		this.Text = tempone.concat(temptwo);
		//removing a single character at the desired index
	};
	this.moveCursor = function(index){ //function for moving the cursor within the textbox
		this.CursorIndex = index;
	};
	this.getText = function(){
		return this.Text.join("");
	};
	*/
}
//objects stop -----------------------------------------------

//these lets are all the global variables, allows everything after to see this variables
let mainWindow; 
let addWindow;
let removeWindow;
let presentWindow;
let loadSavedWindow;
let currentDeck;

// listen for the app to be ready
app.on('ready',function(){
	const {ScreenWidth,ScreenHeigh} = electron.screen.getPrimaryDisplay().workAreaSize;
	console.log("");
	//create the initial deck
	currentDeck = new Deck("initial_deck");
	//create new window
	mainWindow = new BrowserWindow({
		width: 1980,
		height:1120
	});
	//maximize the main window
	mainWindow.maximize();
	//this causes it not to show until the previous is done, so, once the window is maximized then it will actually show
	mainWindow.once('ready-to-show',function(){
		mainWindow.show();
	});


	//these next constants are just shortcuts that are 'global' but are mostly used for a single window
	const exitFullScreen = globalShortcut.register('Esc',function(){ //this shortcut is for leaving presentation mode
		if(BrowserWindow.getFocusedWindow() == presentWindow){
			Menu.setApplicationMenu(mainMenu);
			presentWindow.close();
		}
	});
	const nextSlide = globalShortcut.register('CmdOrCtrl+Right',function(){//this shortcut is to advance the current slide by one
		if(BrowserWindow.getFocusedWindow() == mainWindow){
			changeCurrentSlide(currentDeck,currentDeck.currentSlide-1);
			update();
			console.log("shifted Slide to next");
		}
	});
	const previousSlide = globalShortcut.register('CmdOrCtrl+Left',function(){//this shortcut is to bring the current slide back by one
		if(BrowserWindow.getFocusedWindow() == mainWindow){
			changeCurrentSlide(currentDeck,currentDeck.currentSlide-1);
			update();
			console.log("shifted Slide to previous");
		}
	});
	const exitApp = globalShortcut.register('CmdOrCtrl+Q',function(){//this shortcut is to simply quit
		mainWindow.close();
	});


	//load html file into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname,'mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//quit app when closed
	mainWindow.on('closed',function(){
		app.quit();
	});

	//build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

	//insert the menu
	Menu.setApplicationMenu(mainMenu);
});

//handle create add window
function createAddWindow(){
	//create new window
	addWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'Add Slide'
	});

	//load html file into window
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname,'addWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//garbage collection handle
	addWindow.on('close',function(){
		addWindow = null;
	});
}

function createRemoveWindow(){
	//create new window
	removeWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'Remove Slide'
	});

	//load html file into window
	removeWindow.loadURL(url.format({
		pathname: path.join(__dirname,'RemoveWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//garbage collection
	removeWindow.on('close',function(){
		removeWindow = null;
	});
}

//catch item add, this comes from the addWindow.html file, specifically the ipcrenderer.send function
ipcMain.on('item:add',function(e,item,index){
	addSlidetoDeck(currentDeck,new Slide(item,index),index); //calls on the deck function for adding a new slide
	var currentSlideDisplayed = deckDisplay(currentDeck);
	mainWindow.webContents.send('item:add',currentSlideDisplayed); //sends information to ipcRenderer with the 'item:add' tag in mainWindow.html
	addWindow.close(); //closes the addWindow
});

//catch item remove, this comes from the removeWindow.html file, specifically the ipcRenderer.send function
ipcMain.on('item:remove',function(e,index){
	removeSlidefromDeck(currentDeck,index); //calls on the deck function for removing a slide
	mainWindow.webContents.send('item:remove',deckDisplay(currentDeck)); //send information to ipcRenderer with the 'item:remove' tag in mainWindow.html
	removeWindow.close(); //closes the removeWindow
});

ipcMain.on('newSlideDeck',function(e,item){
	currentDeck = getNewDeck(item); //creates a new slide deck and makes it the current one
	mainWindow.webContents.send('update',deckDisplay(currentDeck)); //sends information to ipcRenderer with the 'update' tag in mainWindow.html
	newSlideDeckWindow.close(); //closes the new slide deck window
});

ipcMain.on('saving',function(e,item){
	createAndSaveFile(currentDeck); //calls function to create a save file and save it to the system
	//there is no update here because nothing has really changed
	savingWindow.close(); //closes the saving window
});

ipcMain.on('loading',function(e,item){
	openSavedFile(item);
	mainWindow.webContents.send('update',deckDisplay(currentDeck));
	loadSavedWindow.close();
})

//a catch function for simply updating the mainWindow whenever a change happens and isn't caught by anything else
function update(){
	mainWindow.webContents.send('update',deckDisplay(currentDeck)); //send information to ipcRenderer with the 'update' tag in mainWindow.html
}

//function to create a save the save file for the user
function createAndSaveFile(SlideDeck){
	const JSONfile = jsonifytheDeck(SlideDeck); 
	fs.writeFile(SlideDeck.deckName+".json",JSONfile,function(err){
		if(err){
			//break
		}
		else{
			//console.log("hooray you did it");
		}
	});
}

function openSavedFile(input){
	fs.readFile(input,function(err,data){
		if(err){
			return console.log(err);
		}
		var jsonData = JSON.parse(data);
		recreate(jsonData);
		currentDeck = jsonData;
	});
}


//this function start presentaion mode
function PresentFullScreen(){
	//create new window
	presentWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'Presenting'
	});

	//sets presentWindow to fullscreen
	presentWindow.setFullScreen(true);

	//temperarily hides the menu during presenting mode, will be put back once its closed
	Menu.setApplicationMenu(null);

	//load html file into window
	presentWindow.loadURL(url.format({
		pathname: path.join(__dirname,'presentWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//garbage collection handle
	presentWindow.on('close',function(){
		presentWindow = null;
	});

	//stuff here for presenting fullscreen to be added later
}

//this is a function I added during class that will help in the future for when the presenter clicks on links during the presentation
function createWebsiteWindow(){
	//create new window
	websiteWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'You clicked a Link!'
	});

	//makes the website window maximized
	websiteWindow.maximize();

	//temperarily hides the menu during viewing the website, will be put back once presentation mode is closed
	Menu.setApplicationMenu(null);

	//load link into window to be added later

	//garbage collection handle
	websiteWindow.on('close',function(){
		websiteWindow = null;
	});
}

function openSavedFileWindow(){
	//create new window
	loadSavedWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'open saved File'
	});

	loadSavedWindow.loadURL(url.format({
		pathname: path.join(__dirname,'loadSavedWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//garbage collection handle
	loadSavedWindow.on('close',function(){
		loadSavedWindow = null;
	});
}

//these two functions are very similar windows to the add and remove windows(mostly likely just copy and change some stuff)
//these two function have not been fulled added yet, but will have their own windows attached
function Save(){
	//create new window
	savingWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'Saving'
	});

	//load html file into window
	savingWindow.loadURL(url.format({
		pathname: path.join(__dirname,'savingWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//garbage collection handle
	savingWindow.on('close',function(){
		savingWindow = null;
	});
}

function newSlideDeck(){
	//create new window
	newSlideDeckWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'Create a new slide deck'
	});

	//load html file into window
	newSlideDeckWindow.loadURL(url.format({
		pathname: path.join(__dirname,'newSlideDeckWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//garbage collection handle
	newSlideDeckWindow.on('close',function(){
		newSlideDeckWindow = null;
	});
}

//create menu template
//these are all the menu items shown at the top, the accelerator attached to each is the keyboard shortcut for that item, and the click function
//is what happens when that item is click/when the hotkeys are pressed
const mainMenuTemplate = [
	{
		label:'File',
		submenu:[
			{
				label: 'New Slide Deck',
				accelerator: 'CmdOrCtrl+N',
				click(){
					newSlideDeck();
				}
			},
			{
				label:'Save',
				accelerator: 'CmdOrCtrl+S',
				click(){
					Save();
				}
			},
			{
				label:'Open',
				accelerator: 'CmdOrCtrl+O',
				click(){
					openSavedFileWindow();
				}
			},
			{
				label:'Quit',
				accelerator: 'CmdOrCtrl+Q',
				click(){
					app.quit();
				}
			}
		]
	},
	{
		label: 'Slides',
		submenu:[
			{
				label:'Add Slide',
				accelerator: 'CmdOrCtrl+Shift+=',
				click(){
					createAddWindow();
				}
			},
			{
				label:'Remove Slide',
				accelerator: 'CmdOrCtrl+Shift+-',
				click(){
					createRemoveWindow();
				}
			},
			{
				label:'Go to next Slide',
				accelerator: 'CmdOrCtrl+Right',
				click(){
					changeCurrentSlide(currentDeck.currentSlide+1);
				}
			},
			{
				label:'Go to previous Slide',
				accelerator: 'CmdOrCtrl+Left',
				click(){
					changeCurrentSlide(currentDeck.currentSlide-1);
				}
			},
			{
				label:'Clear Slides'
			},
		]
	},
	{
		label:'Presenting',
		submenu:[
		{
			label:'Present FullScreen',
			accelerator: 'CmdOrCtrl+Shift+P',
			click(){
				PresentFullScreen();
			}
		}]
	}
];

//if mac add empty object to menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}
