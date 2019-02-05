function getDeck(deckName){
	return new Deck(deckName);
}

function Deck(deckName){
	this.deckName = deckName;
	this.currentSlide = 0;
	this.slides = [];
	this.display = function(){
		this.slides[this.currentSlide].display();
	};
	this.addSlide = function(slide,index){
		this.slides.splice(index,0,slide);
		this.changeCurrentSlide(index);
	};
	this.removeSlide = function(index){
		tempone = this.slides.slice(0,index);
		temptwo = this.slides.slice(index);
		temptwo.shift();
		this.slides = tempone.concat(temptwo);
	};
	this.changeCurrentSlide = function(newIndex){
		this.currentSlide = newIndex;
	}
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
	}
}

function TextBox(){
	this.Text = [];
	this.cursor = index;
	this.add = function(text,index){
		this.Text.splice(index,0,text);
		//adding a single character at the desired index
	}
	this.remove = function(index){
		tempone = this.text.slice(0,index);
		temptwo = this.text.slice(index);
		temptwo.shift();
		this.Text = tempone.concat(temptwo);
		//removing a single character at the desired index
	}
}
