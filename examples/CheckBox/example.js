var myCheckBox = new CheckBox({
    id: 'checkBoxField',
    label: 'CheckBox Label',
    value: "1",
    checked:false
});

myCheckBox.renderPromise().then(function (cmpInstance) {
    $('#root').append(cmpInstance.$el);
});