//these are the items that need to be imported
const electron = require('electron'); //the electron system
const electronLocalShortcut = require('electron-localshortcut'); //specifically electron stuff for shortcuts
const url = require('url'); //an imported thing for urls that make things easier
const path = require('path'); //same as the url import but with system paths
const fs = require('fs'); // import for writting things to files
//const mathJax = require('mathjax');
//const Prism = require('prism-electron');

//this creates items from the electron system
const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = electron;

//objects start ----------------------------------------------
//this function just creates a new Slide Deck
function getNewDeck(deckName){
	//currentDeck = initialization();
	return new Deck(deckName);
}

function recreate(json){
	tempName = json.deckName;
}

//object methods

//deck methods
function addSlidetoDeck(deck,slide,index){
	deck.slides.splice(index,0,slide); //the actual insertion of the slide
	changeCurrentSlide(deck,index); 
	for(currentIndex = 0; currentIndex < deck.slides.length; currentIndex++){ //this for loop updates all the slide indexs so that
		deck.slides[currentIndex].Slideindex = currentIndex;				  //all the slides have their correct index
	}
}
/*
function getLanguageCode(language){
	if(language == "C"){
		return "language-c";
	}
	else if(language == "C#"){
		return "language-csharp";
	}
	else if(language == "C++"){
		return "language-cpp";
	}
	else if(language == "CSS"){
		return "language-css";
	}
	else if(language == "Fortran"){
		return "language-fortran";
	}
	else if(language == "HTML"){
		return "language-html";
	}
	else if(language == "Java"){
		return "language-java";
	}
	else if(language == "Javascript"){
		return "language-js";
	}
	else if(language == "Python"){
		return "language-python";
	}
	else {
		return "no language";
	}
}
*/
function removeSlidefromDeck(deck,index){
	if(deck.slides.length == 1){
		return;
		//maybe alert the user of the fact that there is only one slide left
	}
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
	return slideDisplay(deck.slides[deck.currentSlide]);
}

function deckDisplayMain(deck){
	var tempList = [];
	for(var index = 0; index < deck.slides.length; index++){
		tempList.push(slideDisplay(deck.slides[index]));
	}
	return tempList;
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
/*
function codeSlideDisplay(slide){
	tempList = [];
	tempList.push(slide.Slidetitle);
	tempList.push(slide.Slideindex);
	tempList.push(slide.textboxes);
	return tempList;
}
*/
//the Deck object
function Deck(deckName){
	this.deckName = deckName; //the deckName
	this.slides = []; //the slides in the slide deck
	this.currentSlide = 0; //the current slide that is being shown or edited
}

//the Slide object
function Slide(slideName,index){
	this.Slidetitle = slideName; //the title of this slide, can be just "" (empty title)
	this.Slideindex = new Number(index); //the index that this slide is, the new Number thing is just to make sure it is a number
	this.textboxes = ""; // the text box in this slide, maybe in the future this will be a list of things inside the slide
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
	initialization();

	//create new window
	mainWindow = new BrowserWindow({
		width: 1980,
		height:1120,
		icon: path.join(__dirname, 'assets/icons/png/slideSnekPNG.png')
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
	const nextSlide = globalShortcut.register('Right',function(){//this shortcut is to advance the current slide by one
		if(presentWindow!= null){
			if(BrowserWindow.getFocusedWindow() == presentWindow){
				changeCurrentSlide(currentDeck,currentDeck.currentSlide+1);
				updatePresenting();
			}
		}
	});
	const previousSlide = globalShortcut.register('Left',function(){//this shortcut is to bring the current slide back by one
		if(presentWindow!= null){
			if(BrowserWindow.getFocusedWindow() == presentWindow){
				changeCurrentSlide(currentDeck,currentDeck.currentSlide-1);
				updatePresenting();
			}
		}
	});
	const exitApp = globalShortcut.register('CmdOrCtrl+Q',function(){//this shortcut is to simply quit
		createAndSaveFile(currentDeck, "autosave");
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
		createAndSaveFile(currentDeck, "autosave");
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
		width: 400,
		height:300,
		title:'Add Slide',
		icon: path.join(__dirname, 'assets/icons/png/slideSnekPNG.png')
	});

	//hide the menu bar
	addWindow.setMenuBarVisibility(false);

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
		width: 400,
		height:275,
		title:'Remove Slide',
		icon: path.join(__dirname, 'assets/icons/png/slideSnekPNG.png')
	});

	//hide the menu bar
	removeWindow.setMenuBarVisibility(false);

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
	addSlidetoDeck(currentDeck,new Slide(item,currentDeck.index),index); //calls on the deck function for adding a new slide
	currentDeck.slides[index].textboxes = "insert text here";
	mainWindow.webContents.send('load',createListForDisplayingOnMain()); //sends information to ipcRenderer with the 'item:add' tag in mainWindow.html
	addWindow.close(); //closes the addWindow
});

//catch item remove, this comes from the removeWindow.html file, specifically the ipcRenderer.send function
ipcMain.on('item:remove',function(e,index){
	removeSlidefromDeck(currentDeck,index); //calls on the deck function for removing a slide
	mainWindow.webContents.send('load',createListForDisplayingOnMain()); //send information to ipcRenderer with the 'item:remove' tag in mainWindow.html
	removeWindow.close(); //closes the removeWindow
});

ipcMain.on('newSlideDeck',function(e,item){
	createAndSaveFile(currentDeck, "autosave");
	initialization(); //creates a new slide deck and makes it the current one
	currentDeck.deckName = item;
	mainWindow.webContents.send('load',deckDisplayMain(currentDeck)); //sends information to ipcRenderer with the 'update' tag in mainWindow.html
	newSlideDeckWindow.close(); //closes the new slide deck window
});

ipcMain.on('saving',function(e,item){
	createAndSaveFile(currentDeck,item); //calls function to create a save file and save it to the system
	//there is no update here because nothing has really changed
	savingWindow.close(); //closes the saving window
});

ipcMain.on('loading',function(e,item){	
	openSavedFile(item);
	loadSavedWindow.close();
});

ipcMain.on('PresentReady',function(e,item){
	mainWindow.webContents.send('pleaseSend',null);
	updatePresenting();
});

ipcMain.on('MainReady',function(e,item){
	update();
});

ipcMain.on('AddReady',function(e,item){
	addWindow.webContents.send('totalSize',currentDeck.slides.length);
});

ipcMain.on('singleSlideUpdate',function(e,item){
	currentDeck.slides[item[0]] = new Slide(item[1],item[0],false,null);
	currentDeck.slides[item[0]].textboxes = item[2];
	console.log(currentDeck.slides);
});

//a catch function for simply updating the mainWindow whenever a change happens and isn't caught by anything else
function update(){
	mainWindow.webContents.send('load',createListForDisplayingOnMain()); //send information to ipcRenderer with the 'update' tag in mainWindow.html
}

function updatePresenting(){
	presentWindow.webContents.send('present',deckDisplay(currentDeck));
}

function createListForDisplayingOnMain(){
	tempList = currentDeck.slides;
	finalList = [];
	for(var index in tempList){
		tempList1 = [];
		list = tempList[index];
		tempList1.push(list.Slidetitle);
		tempList1.push(list.Slideindex);
		tempList1.push(list.textboxes);
		finalList.push(tempList1);
	}
	return finalList;
}

//function to create a save the save file for the user
function createAndSaveFile(SlideDeck,name){
	currentDeck.deckName = name;
	const JSONfile = jsonifytheDeck(SlideDeck);
	fs.writeFile(name+".json",JSONfile,function(err){
		if(err){
			console.log("Saving error:");
			return console.log(err);
		}
		else{
			console.log("Saved @ "+name+".json");
		}
	});
}

function openSavedFile(input){
	fs.readFile(input,function(err,data){
		if(err){
			return console.log(err);
		}
		var jsonData = JSON.parse(data);
		currentDeck = jsonData;
		update();
	});
}

function insertLaTexInitial(){
	mainWindow.webContents.send('createLaTexArea',null);
}

function insertLaTexFinal(inLineOrNot){
	//add stuff here
}

//this function start presentaion mode
function PresentFullScreen(){
	//create new window
	presentWindow = new BrowserWindow({
		width: 400,
		height:400,
		title:'Presenting',
		icon: path.join(__dirname, 'assets/icons/png/slideSnekPNG.png')
	});

	//sets presentWindow to fullscreen
	currentDeck.currentSlide = 0;
	presentWindow.setFullScreen(true);

	//temperarily hides the menu during presenting mode, will be put back once its closed
	Menu.setApplicationMenu(null);

	//load html file into window
	presentWindow.loadURL(url.format({
		pathname: path.join(__dirname,'presentWindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	presentWindow.focus();

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
		width: 400,
		height:400,
		title:'You clicked a Link!',
		icon: path.join(__dirname, 'assets/icons/png/slideSnekPNG.png')
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
		width: 400,
		height:250,
		title:'open saved File',
		icon: path.join(__dirname, 'assets/icons/png/slideSnekPNG.png')
	});

	//hide the menu
	loadSavedWindow.setMenuBarVisibility(false);

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
	//grab info from main window
	mainWindow.webContents.send('pleaseSend',null);

	//create new window
	savingWindow = new BrowserWindow({
		width: 400,
		height:250,
		title:'Saving',
		icon: path.join(__dirname, 'assets/icons/png/slideSnekPNG.png')
	});

	//hide the menu
	savingWindow.setMenuBarVisibility(false);

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
		width: 400,
		height:300,
		title:'Create a new slide deck',
		icon: path.join(__dirname, 'assets/icons/png/slideSnekPNG.png')
	});

	//hide the menu
	newSlideDeckWindow.setMenuBarVisibility(false);

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
					createAndSaveFile(currentDeck, "autosave");
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
			}
			/*
			{
				label:'Add laTex',
				accelerator: 'CmdOrCtrl+Shift+L',
				click(){
					insertLaTexInitial();
				}
			}
			*/
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
	mainMenuTemplate.unshift({
		label:''
	});
}

//not currently used
function initialization(){
	currentDeck = new Deck("initial_deck");
	addSlidetoDeck(currentDeck,new Slide("insert Title",0),0);
	currentDeck.slides[0].textboxes = "insert text here";
	return currentDeck;
}
