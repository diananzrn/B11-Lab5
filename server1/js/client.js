class UIComponent {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
    }
    
    setText(text) {
        if(this.element) this.element.textContent = text;
    }
    
    getValue() {
        return this.element ? this.element.value : '';
    }
}

class ClientApp {
    constructor() {
        this.responseArea = new UIComponent('response-area');

        document.getElementById('insert-btn').innerText = STRINGS.insertBtn;
        document.getElementById('query-btn').innerText = STRINGS.submitBtn;
        document.getElementById('sql-query').placeholder = STRINGS.placeholder;        
        
        document.getElementById('insert-btn').onclick = () => this.handleInsert();
        document.getElementById('query-btn').onclick = () => this.handleQuery();
    }

    handleInsert() {
        this.responseArea.setText(STRINGS.inserting);
        
        fetch(STRINGS.insertUrl, { method: 'POST' })
            .then(res => res.json())
            .then(data => this.responseArea.setText(JSON.stringify(data, null, 2)))
            .catch(err => this.responseArea.setText(STRINGS.errorPrefix + err));
    }

    handleQuery() {
        const queryInput = new UIComponent('sql-query').getValue();
        if(!queryInput) return;

        this.responseArea.setText(STRINGS.runningQuery);

        const encodedQuery = encodeURIComponent(queryInput);

        fetch(`${STRINGS.queryUrl}?q=${encodedQuery}`, { method: 'GET' })
            .then(res => res.json())
            .then(data => this.responseArea.setText(JSON.stringify(data, null, 2)))
            .catch(err => this.responseArea.setText(STRINGS.errorPrefix + err));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ClientApp();
});