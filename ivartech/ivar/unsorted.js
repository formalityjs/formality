Number.prototype.decorateFloat = function (decimals, decSeparator) {
	if(decSeparator == undefined)
		decSeparator = '.';
	var price = this;
	var decPattern = '';
	
	for(var i = 0; i < decimals; i++)
		decPattern += '0';
		
	price = price.roundFloat(decimals);
	var split = price.toString().split('.');
	if(split[1] == undefined)
		split[1] = '';
	var decor = decPattern.substring(split[1].length, decimals);
	split[1] = split[1]+decor;
	
	return split.join(decSeparator);
};
