class insertButton {
  constructor(data) {
    this.data = data;
  } 

  createDefaultBtn() {
    const btn = document.createElement('button');

    btn.id = 'insertBtn';
    btn.innerText = STRINGS.insertButton;
    
    const response = insertButton("Temp test") //Data go here

    btn.onclick = () => {
      console.log(insertButton.data);
    };
  }

}

