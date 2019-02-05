const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//objects start ----------------------------------------------
function getDeck(deckName){
	return new Deck(deckName);
}

const zero = new Number(0);

function Deck(deckName){
	this.deckName = deckName;
	this.currentSlide = 0;
	this.slides = [];
	this.size = zero.valueOf();
	this.display = function(){
		this.slides[this.currentSlide].display();
	};
	this.addSlide = function(slide,index){
		this.slides.splice(index,0,slide);
		this.changeCurrentSlide(index);
		this.size++;
	};
	this.removeSlide = function(index){
		tempone = this.slides.slice(0,index);
		temptwo = this.slides.slice(index);
		temptwo.shift();
		this.slides = tempone.concat(temptwo);
		this.size--;
		if(this.size < 0){
			this.size = 0;
		}
	};
	this.changeCurrentSlide = function(newIndex){
		this.currentSlide = newIndex;
	};
}

function Slide(slideName){
	this.title = slideName;
	this.textBox = new TextBox();
	this.setTitle = function(newTitle){
		this.title - newTitle;
	};
	this.addToTextBox = function(text,index){
		this.textBox.add(text,index);
	};
	this.removeFromTextBox = function(index){
		this.textBox.remove(index);
	};
	this.display = function(){
		//display function
		//be sure to also display the text box
	};
}

function TextBox(){
	this.Text = [];
	this.cursor = index;
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
}
//objects stop -----------------------------------------------

let mainWindow; 
let addWindow;
let removeWindow;
let currentDeck = new Deck("initial_deck");

// listen for the app to be ready
app.on('ready',function(){ 					//(1)open up a new deck
						   					//(1)mainWindow display the deck
	//create new window
	mainWindow = new BrowserWindow({});
	//currentDeck = objects.getDeck("inital_deck");
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
function createAddWindow(){ 				//(1)modifiy to add slide to current deck
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
	currentDeck.addSlide(item,index,currentDeck.size);
	mainWindow.webContents.send('item:add',item);
	addWindow.close();
});

ipcMain.on('item:remove',function(e,item){
	currentDeck.removeSlide(item,currentDeck.size);
	mainWindow.webContents.send('item:remove',item);
	removeWindow.close();
});

//create menu template
const mainMenuTemplate = [
	{
		label:'File',
		submenu:[
			{
				label:'Add Slide',
				accelerator: process.platform == 'darwin' ? 'Command++' : 'Ctrl++',
				click(){
					createAddWindow();
				}
			},
			{
				label:'Remove Slide',
				accelerator: process.platform == 'darwin' ? 'Command+-' : 'Ctrl+-',
				click(){
					createRemoveWindow();
				}
			},
			{
				label:'Clear Slides'
			},
			{
				label:'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click(){
					app.quit();
				}
			}
		]
	}
];

//if mac add empty object to menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}
