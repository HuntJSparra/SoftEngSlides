const electron = require('electron');
const electronLocalShortcut = require('electron-localshortcut');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = electron;

//objects start ----------------------------------------------
function getDeck(deckName){
	return new Deck(deckName);
}

function Deck(deckName){
	this.deckName = deckName;
	this.slides = [];
	this.currentSlide = 0;
	this.getSize = function(){
		return this.slides.length;
	};
	this.getSlide = function(index){
		return this.slides[index];
	};
	this.display = function(){
		this.slides[this.currentSlide].display();
	};
	this.addSlide = function(slide,index){
		this.slides.splice(index,0,slide);
		this.changeCurrentSlide(index);
		for(currentIndex = 0; currentIndex < this.slides.length; currentIndex++){
			this.slides[currentIndex].setIndex(currentIndex);
		}
	};
	this.removeSlide = function(index){
		tempone = this.slides.slice(0,index);
		temptwo = this.slides.slice(index);
		temptwo.shift();
		this.slides = tempone.concat(temptwo);
		for(currentIndex = 0; currentIndex < this.slides.length; currentIndex++){
			this.slides[currentIndex].setIndex(currentIndex);
		}
		console.log(this.slides);
		console.log(this.currentSlide);
		console.log(this.slides.length);
		if(this.currentSlide >= this.slides.length){
			this.currentSlide = this.slides.length-1;
		}
		if(this.currentSlide < 0){
			this.currentSlide = 0;
		}
		console.log(this.currentSlide);
	};
	this.getSlideIndex = function(){
		return this.currentSlide;
	};
	this.changeCurrentSlide = function(newIndex){
		this.currentSlide = newIndex;
		if(this.currentSlide > this.slides.length-1){
			this.currentSlide = this.slides.length-1	;
		}
		if(this.currentSlide < 0){
			this.currentSlide = 0;
		}
	};
	this.display = function(){
		return this.slides[this.currentSlide].display();
	};
}

function Slide(slideName,index){
	this.Slidetitle = slideName;
	this.Slideindex = new Number(index);
	this.textBox = new TextBox();
	this.getIndex = function(){
		return this.Slideindex;
	};
	this.setTitle = function(newSlideName){
		this.Slidetitle = newSlideName;
	};
	this.addToTextBox = function(text,index){
		this.textBox.add(text,index);
	};
	this.removeFromTextBox = function(index){
		this.textBox.remove(index);
	};
	this.setIndex = function(newIndex){
		this.Slideindex = new Number(newIndex);
	}
	this.display = function(){
		const list = [];
		list.push(this.Slidetitle);
		list.push(this.Slideindex);
		return list.join(", ");
		//display function
		//be sure to also display the text box
	};
}

function TextBox(initalX,initalY,initialWidth,initialHeight){
	this.Text = [];
	this.CursorIndex = 0;
	this.centerX = initalX;
	this.centerY = initalY;
	this.boxWidth = initialWidth;
	this.boxHeight = initialHeight;
	this.add = function(text,index){
		this.Text.splice(index,0,text);
		//adding a single character at the desired index
	};
	this.remove = function(index){
		tempone = this.text.slice(0,index);
		temptwo = this.text.slice(index);
		temptwo.shift();
		this.Text = tempone.concat(temptwo);
		//removing a single character at the desired index
	};
	this.moveCursor = function(index){
		this.CursorIndex = index;
	}
}
//objects stop -----------------------------------------------

let mainWindow; 
let addWindow;
let removeWindow;
let presentWindow;
let currentDeck;

// listen for the app to be ready
app.on('ready',function(){
	const {ScreenWidth,ScreenHeigh} = electron.screen.getPrimaryDisplay().workAreaSize;
	currentDeck = new Deck("initial_deck");
	//create new window
	mainWindow = new BrowserWindow({
		width: 1980,
		height:1120
	});
	mainWindow.maximize();
	mainWindow.once('ready-to-show',function(){
		mainWindow.show();
	})
	const exitFullScreen = globalShortcut.register('Esc',function(){
		if(BrowserWindow.getFocusedWindow() == presentWindow){
			Menu.setApplicationMenu(mainMenu);
			presentWindow.close();
		}
	});
	const nextSlide = globalShortcut.register('CmdOrCtrl+Right',function(){
		if(BrowserWindow.getFocusedWindow() == mainWindow){
			currentDeck.changeCurrentSlide(currentDeck.getSlideIndex()+1);
			update();
			console.log("shifted Slide to next");
		}
	});
	const previousSlide = globalShortcut.register('CmdOrCtrl+Left',function(){
		if(BrowserWindow.getFocusedWindow() == mainWindow){
			currentDeck.changeCurrentSlide(currentDeck.getSlideIndex()-1);
			update();
			console.log("shifted Slide to previous");
		}
	});
	const exitApp = globalShortcut.register('CmdOrCtrl+Q',function(){
		mainWindow.close();
	})
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
	//const PresentationMenu = Menu.buildFromTemplate(PresentationMenuTemplate);
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
	})
}

//catch item add
ipcMain.on('item:add',function(e,item,index){
	currentDeck.addSlide(new Slide(item,index),currentDeck.getSize());
	mainWindow.webContents.send('item:add',currentDeck.display());
	addWindow.close();
});

ipcMain.on('item:remove',function(e,index){
	currentDeck.removeSlide(index);
	mainWindow.webContents.send('item:remove',currentDeck.display());
	removeWindow.close();
});

function update(){
	mainWindow.webContents.send('update',currentDeck.display());
}

function PresentFullScreen(){
	//create new window
	presentWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'Presenting'
	});
	presentWindow.setFullScreen(true);
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
	//stuff here for presenting fullscreen
}

function createWebsiteWindow(){
	//create new window
	websiteWindow = new BrowserWindow({
		width: 300,
		height:300,
		title:'You clicked a Link!'
	});
	websiteWindow.maximize();
	Menu.setApplicationMenu(null);
	//load link into window
}

//these two functions are very similar windows to the add and remove windows(mostly likely just copy and change some stuff)
function Save(){
	console.log("save the slide deck");
	//add thing here for a new window that asks the for the deck title to save it and all that shit
}

function newSlideDeck(){
	console.log("add new Slide Deck");
	//add thing here for a new window that asks for the new deck title and all that shit
}

//create menu template
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
					currentDeck.changeCurrentSlide(currentDeck.getSlideIndex()+1);
				}
			},
			{
				label:'Go to previous Slide',
				accelerator: 'CmdOrCtrl+Left',
				click(){
					currentDeck.changeCurrentSlide(currentDeck.getSlideIndex()-1);
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
