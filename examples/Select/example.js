var mySelect = new Select({
    id: 'select',
    dataProvider: [{ "value": "1", "text": "Shqiperi" }, { "value": "2", "text": "Greqi" }, { "value": "3", "text": "SHBA" }],
    textField: "text",
    valueField: "value",
    value: "2",
});

$('#root').append(mySelect.render());