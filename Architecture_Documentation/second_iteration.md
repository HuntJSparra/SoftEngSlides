LaTeX
--------------------
User should be able to type LaTeX into a TextBox and have it display. Alternatively, the user can click a button or press a hotkey to open up a window to insert the LaTeX equation.

This functionality should be done using the MathJax library. It appears that as long as you have the script loaded at the start of the top of the HTML file, any properly delimited LaTeX text should display properly.

http://docs.mathjax.org/en/latest/

Implement to your best discretion. Let us know if you need anything.


Syntax Highlighting
----------------------
User should be able to create a box that is like a TextBox, except the code is highlighted. As of now, we will only support the highlighting of C code.

This should be done using either Prism (https://prismjs.com/#basic-usage) or highlight.js. We recommend trying Prism first because it more well documented.

For Prism:
    Under the head of the HTML file put: <link href="themes/prism.css" rel="stylesheet" />
    Under the body put: <script src="prism.js"></script>
    For code: ```<pre><code class="language-LANGUAGE">MY_CODE</code></pre>```, where LANGUAGE is the language chosen (c) and MY_CODE is code (ex. ```printf("Hello world!");```)


TextBox
-------------------
User should be able to insert a box they can type text into. The user should be able to resize the bounds for this, controlling how the text wraps. The user should also be able to drag the TextBox around (or move it somehow).


Deleting Elements (FEEL FREE TO WAIT ON THIS)
------------------------------------
A user should be able to delete elements (TextBox, Code, etc.) in a slide.
